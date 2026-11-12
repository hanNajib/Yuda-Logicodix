<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSocialScreenTime;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SocialScreenTimeController extends Controller
{
    /**
     * Platform columns yang didukung
     */
    private const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'threads', 'youtube', 'x'];

    /**
     * Resolve identitas pengguna: user_id (Sanctum) atau guest_uuid
     */
    private function resolveIdentity(Request $request): array
    {
        $user = $request->user('sanctum');

        if ($user) {
            return ['user_id' => $user->id, 'guest_uuid' => null];
        }

        $guestUuid = $request->input('guest_uuid') ?? $request->header('X-Guest-UUID');

        return ['user_id' => null, 'guest_uuid' => $guestUuid];
    }

    /**
     * POST /api/screen-time/social
     * Tambah (akumulasi) screen time per platform
     */
    public function update(Request $request): JsonResponse
    {
        $identity = $this->resolveIdentity($request);

        // Validasi: harus ada identitas
        if (! $identity['user_id'] && ! $identity['guest_uuid']) {
            return response()->json([
                'success' => false,
                'message' => 'Identitas pengguna tidak ditemukan. Sertakan token Sanctum atau guest_uuid.',
            ], 401);
        }

        // Validasi input platform (semua opsional, tapi minimal 1 harus ada)
        $validated = $request->validate([
            'instagram' => 'sometimes|integer|min:0',
            'tiktok'    => 'sometimes|integer|min:0',
            'facebook'  => 'sometimes|integer|min:0',
            'threads'   => 'sometimes|integer|min:0',
            'youtube'   => 'sometimes|integer|min:0',
            'x'         => 'sometimes|integer|min:0',
            'guest_uuid'=> 'sometimes|string|max:64',
        ]);

        // Cek apakah ada platform yang dikirim
        $platformsProvided = array_intersect(self::PLATFORMS, array_keys($validated));
        if (empty($platformsProvided)) {
            return response()->json([
                'success' => false,
                'message' => 'Minimal satu platform harus disertakan (instagram, tiktok, facebook, threads, youtube, x).',
            ], 422);
        }

        // firstOrCreate: 1 baris per user/guest
        $record = UserSocialScreenTime::firstOrCreate([
            'user_id'    => $identity['user_id'],
            'guest_uuid' => $identity['guest_uuid'],
        ]);

        // Akumulasi setiap platform yang dikirim
        foreach ($platformsProvided as $platform) {
            $record->increment($platform, $validated[$platform]);
        }

        // Reload data terbaru
        $record->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Screen time berhasil diperbarui.',
            'data'    => $this->formatResponse($record),
        ]);
    }

    /**
     * GET /api/screen-time/social
     * Ambil total screen time pengguna saat ini
     */
    public function show(Request $request): JsonResponse
    {
        $identity = $this->resolveIdentity($request);

        if (! $identity['user_id'] && ! $identity['guest_uuid']) {
            return response()->json([
                'success' => false,
                'message' => 'Identitas pengguna tidak ditemukan. Sertakan token Sanctum atau guest_uuid.',
            ], 401);
        }

        $record = UserSocialScreenTime::where('user_id', $identity['user_id'])
            ->where('guest_uuid', $identity['guest_uuid'])
            ->first();

        if (! $record) {
            return response()->json([
                'success' => true,
                'message' => 'Belum ada data screen time.',
                'data'    => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatResponse($record),
        ]);
    }

    /**
     * Format output response
     */
    private function formatResponse(UserSocialScreenTime $record): array
    {
        return [
            'id'         => $record->id,
            'user_id'    => $record->user_id,
            'guest_uuid' => $record->guest_uuid,
            'platforms'  => [
                'instagram' => $record->instagram,
                'tiktok'    => $record->tiktok,
                'facebook'  => $record->facebook,
                'threads'   => $record->threads,
                'youtube'   => $record->youtube,
                'x'         => $record->x,
            ],
            'updated_at' => $record->updated_at?->toIso8601String(),
        ];
    }
}

