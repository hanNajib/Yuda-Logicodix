<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class ApiTokenController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        /** @var array{email: string, password: string, device_name: string} $validated */
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
            'device_name' => ['required', 'string', 'max:100'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if ($user === null || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'code' => 'invalid_credentials',
                'message' => 'Email atau password salah.',
            ], 401);
        }

        if (! $user->hasVerifiedEmail() || $user->two_factor_confirmed_at !== null) {
            return response()->json([
                'code' => 'api_token_not_allowed',
                'message' => 'Akun ini belum memenuhi persyaratan untuk membuat token API.',
            ], 403);
        }

        $expiresAt = now()->addMinutes((int) config('sanctum.expiration', 10080));
        $token = $user->createToken($validated['device_name'], ['ai:chat'], $expiresAt);

        return response()->json([
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toISOString(),
        ], 201);
    }

    public function destroy(Request $request): Response
    {
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->noContent();
    }
}
