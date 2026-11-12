<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\InterventionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterventionController extends Controller
{
    public function __construct(private InterventionService $interventionService) {}

    /**
     * 1. Ambil 1 pesan acak terpersonalisasi berdasarkan emotion, trigger_condition, dan tone_style.
     */
    public function getRandomMessage(Request $request): JsonResponse
    {
        // Ambil input baik dari Query Params (GET standar) maupun dari JSON Body
        $emotion = $request->input('emotion') ?: $request->query('emotion');
        $triggerCondition = $request->input('trigger_condition') ?: $request->query('trigger_condition');
        $toneStyle = $request->input('tone_style') ?: $request->query('tone_style');

        // Jika emotion tidak dikirim atau null, otomatis set ke 'belum_teridentifikasi'
        $finalEmotion = ($emotion && trim((string) $emotion) !== '')
            ? trim((string) $emotion)
            : 'belum_teridentifikasi';

        $card = $this->interventionService->getRandomMessage(
            emotion: $finalEmotion,
            triggerCondition: is_string($triggerCondition) ? $triggerCondition : null,
            toneStyle: is_string($toneStyle) ? $toneStyle : null,
        );

        return response()->json([
            'status' => 'success',
            'data' => $card,
        ]);
    }

    /**
     * 2. Simpan / Upsert data matriks screen time harian (12 slot 2 jam).
     */
    public function upsertMatrix(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'log_date' => ['required', 'date_format:Y-m-d'],
            'guest_uuid' => ['nullable', 'string', 'max:64'],
            'slots' => ['nullable', 'array'],
            'slots.*' => ['integer', 'min:0', 'max:120'],
            'interventions_triggered' => ['nullable', 'integer', 'min:0'],
        ]);

        $user = $request->user();
        $guestUuid = $validated['guest_uuid'] ?? $request->header('X-Guest-UUID');

        $matrix = $this->interventionService->upsertDailyMatrix(
            user: $user,
            guestUuid: $guestUuid,
            logDate: $validated['log_date'],
            slots: $validated['slots'] ?? [],
            interventionsTriggered: (int) ($validated['interventions_triggered'] ?? 0),
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Matriks screen time harian berhasil disimpan.',
            'data' => $matrix,
        ]);
    }

    /**
     * 3. Ambil data riwayat matriks harian 1 bulan penuh.
     */
    public function getMonthlyMatrices(Request $request): JsonResponse
    {
        $user = $request->user();
        $guestUuid = $request->header('X-Guest-UUID') ?: $request->query('guest_uuid');
        $month = $request->query('month'); // Format: YYYY-MM

        $matrices = $this->interventionService->getMonthlyMatrices($user, $guestUuid, $month);

        return response()->json([
            'status' => 'success',
            'data' => $matrices,
        ]);
    }

    /**
     * 4. Tambah pesan intervensi baru (Mendukung Single Object atau Bulk Array of Objects).
     */
    public function storeMessages(Request $request): JsonResponse
    {
        // Cek apakah request berupa bulk (array "messages") atau single object
        if ($request->has('messages') && is_array($request->input('messages'))) {
            $validated = $request->validate([
                'messages' => ['required', 'array', 'min:1'],
                'messages.*.emotion' => ['required', 'string', 'in:tenang,cemas,bosan,lelah,belum_teridentifikasi,stres,kesepian'],
                'messages.*.trigger_condition' => ['required', 'string', 'in:jam_rawan,scroll_terlalu_lama,checkin_dashboard'],
                'messages.*.tone_style' => ['nullable', 'string', 'in:lembut,tegas,humoris,faktual,reflektif'],
                'messages.*.header' => ['required', 'string', 'max:255'],
                'messages.*.message' => ['required', 'string'],
                'messages.*.tips' => ['nullable', 'string'],
                'messages.*.micro_habit_type' => ['nullable', 'string', 'in:minum,tidur,nafas,peregangan'],
                'messages.*.micro_habit_instruction' => ['nullable', 'string', 'max:255'],
            ]);

            $created = $this->interventionService->createMessagesBulk($validated['messages']);

            return response()->json([
                'status' => 'success',
                'message' => count($created) . ' pesan intervensi berhasil ditambahkan sekaligus.',
                'data' => $created,
            ], 201);
        }

        // Single object
        $validated = $request->validate([
            'emotion' => ['required', 'string', 'in:tenang,cemas,bosan,lelah,belum_teridentifikasi,stres,kesepian'],
            'trigger_condition' => ['required', 'string', 'in:jam_rawan,scroll_terlalu_lama,checkin_dashboard'],
            'tone_style' => ['nullable', 'string', 'in:lembut,tegas,humoris,faktual,reflektif'],
            'header' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'tips' => ['nullable', 'string'],
            'micro_habit_type' => ['nullable', 'string', 'in:minum,tidur,nafas,peregangan'],
            'micro_habit_instruction' => ['nullable', 'string', 'max:255'],
        ]);

        $created = $this->interventionService->createMessage($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan intervensi berhasil ditambahkan.',
            'data' => $created,
        ], 201);
    }

    /**
     * 5. Hapus pesan intervensi dari database berdasarkan ID.
     */
    public function deleteMessage(int $id): JsonResponse
    {
        $deleted = $this->interventionService->deleteMessage($id);

        if (! $deleted) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesan tidak ditemukan atau gagal dihapus.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan intervensi berhasil dihapus.',
        ]);
    }

    /**
     * 6. Dapatkan pengaturan setting intervensi aktif (1 record per user).
     */
    public function getSettings(Request $request): JsonResponse
    {
        $user = $request->user();
        $guestUuid = $request->header('X-Guest-UUID') ?: $request->query('guest_uuid');

        $setting = $this->interventionService->getOrCreateSetting($user, $guestUuid);

        return response()->json([
            'status' => 'success',
            'data' => [
                'tone_style' => $setting->tone_style,
                'scroll_interval_minutes' => $setting->scroll_interval_minutes,
                'current_pause_duration' => $setting->current_pause_duration,
                'last_pause_duration' => $setting->last_pause_duration,
                'last_evaluated_at' => $setting->last_evaluated_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * 7. Update preferensi setting intervensi user.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'guest_uuid' => ['nullable', 'string', 'max:64'],
            'scroll_interval_minutes' => ['nullable', 'integer', 'min:5', 'max:60'],
            'tone_style' => ['nullable', 'string', 'in:lembut,tegas,humoris,faktual,reflektif'],
        ]);

        $user = $request->user();
        $guestUuid = $validated['guest_uuid'] ?? $request->header('X-Guest-UUID');

        $updated = $this->interventionService->updateSetting($user, $guestUuid, $validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengaturan intervensi berhasil diperbarui.',
            'data' => [
                'tone_style' => $updated->tone_style,
                'scroll_interval_minutes' => $updated->scroll_interval_minutes,
                'current_pause_duration' => $updated->current_pause_duration,
                'last_pause_duration' => $updated->last_pause_duration,
            ],
        ]);
    }
}
