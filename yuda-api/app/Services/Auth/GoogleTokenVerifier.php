<?php

namespace App\Services\Auth;

use App\Exceptions\GoogleTokenVerificationException;
use Firebase\JWT\BeforeValidException;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use UnexpectedValueException;

class GoogleTokenVerifier
{
    protected const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
    protected const CACHE_KEY = 'google_oauth2_jwks';
    protected const CACHE_TTL_HOURS = 6;

    /**
     * Verify the Google ID token and return validated claims.
     *
     * @param string $idToken
     * @return array{sub: string, email: string, email_verified: bool, name: ?string, avatar: ?string}
     *
     * @throws GoogleTokenVerificationException
     */
    public function verify(string $idToken): array
    {
        if (trim($idToken) === '') {
            throw new GoogleTokenVerificationException('Google ID token cannot be empty.');
        }

        $keys = $this->getPublicKeys();

        try {
            $payload = JWT::decode($idToken, $keys);
        } catch (UnexpectedValueException $e) {
            // Key ID might not be in the cached keys. Force refresh once.
            $keys = $this->getPublicKeys(forceRefresh: true);

            try {
                $payload = JWT::decode($idToken, $keys);
            } catch (\Throwable $retryException) {
                $this->handleJwtException($retryException);
            }
        } catch (\Throwable $e) {
            $this->handleJwtException($e);
        }

        return $this->validateClaims($payload);
    }

    /**
     * Get Google's public keys as JWK Key objects.
     *
     * @param bool $forceRefresh
     * @return array<string, \Firebase\JWT\Key>
     * @throws GoogleTokenVerificationException
     */
    public function getPublicKeys(bool $forceRefresh = false): array
    {
        if ($forceRefresh) {
            Cache::forget(self::CACHE_KEY);
        }

        $jwks = Cache::remember(self::CACHE_KEY, now()->addHours(self::CACHE_TTL_HOURS), function () {
            return $this->fetchJwks();
        });

        try {
            return JWK::parseKeySet($jwks, 'RS256');
        } catch (\Throwable $e) {
            Cache::forget(self::CACHE_KEY);
            throw new GoogleTokenVerificationException('Failed to parse Google public keys: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Fetch JWKS from Google's certs endpoint.
     *
     * @return array<string, mixed>
     * @throws GoogleTokenVerificationException
     */
    protected function fetchJwks(): array
    {
        try {
            $response = Http::timeout(10)->get(self::CERTS_URL);

            if (!$response->successful()) {
                throw new GoogleTokenVerificationException('Unable to retrieve Google public certificates: HTTP ' . $response->status());
            }

            $data = $response->json();

            if (!is_array($data) || !isset($data['keys'])) {
                throw new GoogleTokenVerificationException('Invalid Google public certificate response format.');
            }

            return $data;
        } catch (GoogleTokenVerificationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            throw new GoogleTokenVerificationException('Network error connecting to Google certificate service: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Validate payload claims according to Google OpenID specifications.
     *
     * @param object $payload
     * @return array{sub: string, email: string, email_verified: bool, name: ?string, avatar: ?string}
     * @throws GoogleTokenVerificationException
     */
    protected function validateClaims(object $payload): array
    {
        // 1. Issuer check
        $issuer = $payload->iss ?? '';
        if (!in_array($issuer, ['https://accounts.google.com', 'accounts.google.com'], true)) {
            throw new GoogleTokenVerificationException('Invalid token issuer.');
        }

        // 2. Audience check (must match configured Web Client ID)
        $expectedAudience = config('services.google.web_client_id') ?: config('services.google.client_id');
        if (empty($expectedAudience)) {
            throw new GoogleTokenVerificationException('Google Web Client ID is not configured on the server.');
        }

        $aud = $payload->aud ?? null;
        $audValid = false;

        if (is_string($aud)) {
            $audValid = hash_equals($expectedAudience, $aud);
        } elseif (is_array($aud)) {
            $audValid = in_array($expectedAudience, $aud, true);
        }

        if (!$audValid) {
            throw new GoogleTokenVerificationException('Token audience does not match configured client ID.');
        }

        // 3. Expiration check (JWT::decode already verifies, but explicitly ensure)
        if (isset($payload->exp) && $payload->exp < time()) {
            throw new GoogleTokenVerificationException('Token has expired.');
        }

        // 4. Subject (Google User ID) check
        $sub = $payload->sub ?? null;
        if (empty($sub) || !is_string($sub)) {
            throw new GoogleTokenVerificationException('Token does not contain a valid user identity.');
        }

        // 5. Email check
        $email = $payload->email ?? null;
        if (empty($email) || !is_string($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new GoogleTokenVerificationException('Token does not contain a valid email address.');
        }

        // 6. Email verified check
        $emailVerified = filter_var($payload->email_verified ?? false, FILTER_VALIDATE_BOOLEAN);
        if (!$emailVerified) {
            throw new GoogleTokenVerificationException('Google account email is not verified.');
        }

        return [
            'sub' => (string) $sub,
            'email' => (string) $email,
            'email_verified' => true,
            'name' => isset($payload->name) && is_string($payload->name) ? $payload->name : null,
            'avatar' => isset($payload->picture) && is_string($payload->picture) ? $payload->picture : null,
        ];
    }

    /**
     * Map JWT library exceptions to GoogleTokenVerificationException.
     *
     * @param \Throwable $e
     * @return never
     * @throws GoogleTokenVerificationException
     */
    protected function handleJwtException(\Throwable $e): never
    {
        if ($e instanceof ExpiredException) {
            throw new GoogleTokenVerificationException('Token has expired.', 0, $e);
        }

        if ($e instanceof SignatureInvalidException) {
            throw new GoogleTokenVerificationException('Token signature is invalid.', 0, $e);
        }

        if ($e instanceof BeforeValidException) {
            throw new GoogleTokenVerificationException('Token is not yet active.', 0, $e);
        }

        throw new GoogleTokenVerificationException('The provided Google ID token is invalid.', 0, $e);
    }
}

