<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\GoogleTokenVerificationException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\GoogleTokenVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthController extends Controller
{
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:50',
            'full_name' => 'nullable|string|max:100',
            'birth_date' => 'nullable|string|max:50',
        ]);

        $user = $request->user('sanctum') ?: $request->user();

        if (array_key_exists('name', $validated) && $validated['name'] !== null) {
            $user->name = trim($validated['name']);
        }
        if (array_key_exists('full_name', $validated) && $validated['full_name'] !== null) {
            $user->full_name = trim($validated['full_name']);
        }
        if (array_key_exists('birth_date', $validated)) {
            $user->birth_date = $validated['birth_date'];
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'birth_date' => $user->birth_date,
                ],
            ],
        ]);
    }

    public function googleNative(Request $request, ?GoogleTokenVerifier $verifier = null)
    {
        $request->validate([
            'id_token' => 'required|string',
        ]);

        $idToken = $request->input('id_token');
        $clientId = config('services.google.web_client_id')
            ?: config('services.google.client_id')
            ?: env('GOOGLE_CLIENT_ID');

        try {
            $payload = null;

            if (class_exists(\Google_Client::class)) {
                $client = new \Google_Client(['client_id' => $clientId]);
                $verified = $client->verifyIdToken($idToken);
                if ($verified && is_array($verified)) {
                    $payload = [
                        'sub' => $verified['sub'],
                        'email' => $verified['email'],
                        'name' => $verified['name'] ?? null,
                        'avatar' => $verified['picture'] ?? null,
                        'email_verified' => filter_var($verified['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    ];
                }
            }

            if (!$payload) {
                $verifier = $verifier ?? app(GoogleTokenVerifier::class);
                $payload = $verifier->verify($idToken);
            }

            if (!$payload || empty($payload['email'])) {
                return response()->json([
                    'message' => 'Token Google tidak valid.',
                ], 401);
            }

            if (isset($payload['email_verified']) && !$payload['email_verified']) {
                return response()->json([
                    'message' => 'Google account email is not verified.',
                ], 401);
            }

            $googleId = (string) $payload['sub'];
            $email = (string) $payload['email'];
            $fullName = $payload['name'] ?? null;
            $avatar = $payload['avatar'] ?? null;
            $needsProfileSetup = false;

            $user = DB::transaction(function () use ($googleId, $email, $fullName, $avatar, &$needsProfileSetup) {
                $user = User::query()
                    ->where('google_id', $googleId)
                    ->lockForUpdate()
                    ->first();

                if (!$user) {
                    $user = User::query()
                        ->where('email', $email)
                        ->lockForUpdate()
                        ->first();

                    if ($user && $user->google_id && $user->google_id !== $googleId) {
                        abort(409, 'This email is already associated with a different Google account.');
                    }

                    if (!$user) {
                        $needsProfileSetup = true;
                        $user = new User([
                            'full_name' => $fullName,
                            'email' => $email,
                            'password' => Hash::make(Str::random(64)),
                        ]);
                    }

                    $user->google_id = $googleId;
                }

                $needsProfileSetup = $needsProfileSetup || empty($user->name);
                if (!$user->full_name && $fullName) {
                    $user->full_name = $fullName;
                }
                $user->email = $email;
                if ($avatar) {
                    $user->avatar = $avatar;
                }
                if (!$user->email_verified_at) {
                    $user->email_verified_at = now();
                }
                $user->save();

                return $user;
            });

            $sanctumToken = $user->createToken(
                'mobile-auth-token',
                ['*'],
                now()->addDays(30)
            )->plainTextToken;

            return response()->json([
                'message' => 'Authentication successful.',
                'data' => [
                    'token' => $sanctumToken,
                    'needs_profile_setup' => $needsProfileSetup,
                    'user' => [
                        'id' => $user->id,
                        'full_name' => $user->full_name,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                    ],
                ],
            ], 200);

        } catch (GoogleTokenVerificationException $e) {
            Log::warning('Google Native Auth Token Verification: ' . $e->getMessage());

            return response()->json([
                'message' => $e->getMessage(),
            ], 401);
        } catch (HttpException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            Log::error('Google Native Auth Error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat memverifikasi akun Google: ' . $e->getMessage(),
            ], 500);
        }
    }
}
