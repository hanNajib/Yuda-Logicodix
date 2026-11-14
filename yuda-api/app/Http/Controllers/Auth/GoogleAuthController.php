<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\GoogleTokenVerificationException;
use App\Http\Controllers\Controller;
use App\Models\OauthLoginCode;
use App\Models\User;
use App\Services\Auth\GoogleTokenVerifier;
use App\Services\GuestSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpKernel\Exception\HttpException;

class GoogleAuthController extends Controller
{
    public function exchange(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'min:32', 'max:128'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $loginCode = OauthLoginCode::query()
                ->where('code_hash', hash('sha256', $validated['code']))
                ->lockForUpdate()
                ->first();

            if (
                !$loginCode ||
                $loginCode->used_at ||
                $loginCode->expires_at->isPast()
            ) {
                throw ValidationException::withMessages([
                    'code' => ['Login code is invalid or expired.'],
                ]);
            }

            $loginCode->update([
                'used_at' => now(),
            ]);

            $user = $loginCode->user;

            $token = $user->createToken(
                'mobile',
                ['*'],
                now()->addDays(30)
            )->plainTextToken;

            // Sinkronkan data lokal / guest sebelumnya ke akun user yang baru login
            $guestUuid = $request->header('X-Guest-UUID') ?: $request->input('guest_uuid');
            if ($guestUuid) {
                GuestSyncService::syncGuestDataToUser($user, $guestUuid);
            }

            return [
                'token' => $token,
                'needs_profile_setup' => empty($user->name),
                'user' => $user->only([
                    'id',
                    'full_name',
                    'name',
                    'email',
                    'avatar',
                ]),
            ];
        });

        return response()->json([
            'message' => 'Authentication successful.',
            'data' => $result,
        ]);
    }
}
