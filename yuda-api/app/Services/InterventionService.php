<?php

namespace App\Services;

use App\Models\InterventionMessage;
use App\Models\User;
use App\Models\UserDailyScreenTimeMatrix;
use App\Models\UserInterventionSetting;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Facades\Ai;
use Throwable;

class InterventionService
{
    public const VALID_TONE_STYLES = ['lembut', 'tegas', 'humoris', 'faktual', 'reflektif'];
    public const VALID_MICRO_HABITS = ['minum', 'tidur', 'nafas', 'peregangan'];

    private const MIN_PAUSE_DURATION = 30; 
    private const MAX_PAUSE_DURATION = 60; 
    private const DURATION_STEP = 5;       

    /**
     * Ambil 1 pesan acak terpersonalisasi berdasarkan emotion, trigger_condition, dan tone_style.
     * Jika emotion belum teridentifikasi (null/kosong), otomatis diarahkan ke 'netral'.
     */
    public function getRandomMessage(?string $emotion = null, ?string $triggerCondition = null, ?string $toneStyle = null): array
    {
        // Normalisasi tone_style (jika masih pakai istilah lama atau huruf kuis A-E)
        $normalizedTone = match (strtolower((string) $toneStyle)) {
            'a', 'lembut', 'empati' => 'lembut',
            'b', 'tegas', 'to_the_point' => 'tegas',
            'c', 'humoris' => 'humoris',
            'd', 'faktual' => 'faktual',
            'e', 'reflektif' => 'reflektif',
            default => 'lembut',
        };

        // Jika emosi belum teridentifikasi atau null, arahkan ke 'belum_teridentifikasi'
        $targetEmotion = ($emotion && trim($emotion) !== '') ? strtolower(trim($emotion)) : 'belum_teridentifikasi';
        if (in_array($targetEmotion, ['otomatis', 'netral', 'tidak_teridentifikasi'], true)) {
            $targetEmotion = 'belum_teridentifikasi';
        }

        // Dapatkan ID generasi aktif jika ada (agar hanya mengambil pesan dari generasi aktif)
        $activeGenId = InterventionGenerationService::getActiveGenerationId();

        // 1. Coba cari yang cocok persis ketiga-tiganya: emotion + trigger + tone
        $query = InterventionMessage::query()->where('emotion', $targetEmotion);
        if ($activeGenId) {
            $query->where('generation_id', $activeGenId);
        }
        if ($triggerCondition) {
            $query->where('trigger_condition', $triggerCondition);
        }
        $query->where('tone_style', $normalizedTone);
        $message = $query->inRandomOrder()->first();

        // 2. Jika tidak ada exact 3 kriteria dan trigger dikirim, utamakan emotion + trigger
        if (! $message instanceof InterventionMessage && $triggerCondition) {
            $fallback2 = InterventionMessage::query()
                ->where('emotion', $targetEmotion)
                ->where('trigger_condition', $triggerCondition);
            if ($activeGenId) {
                $fallback2->where('generation_id', $activeGenId);
            }
            $message = $fallback2->inRandomOrder()->first();
        }

        // 3. Jika masih tidak ada, cari yang cocok emotion + tone_style
        if (! $message instanceof InterventionMessage) {
            $fallback3 = InterventionMessage::query()
                ->where('emotion', $targetEmotion)
                ->where('tone_style', $normalizedTone);
            if ($activeGenId) {
                $fallback3->where('generation_id', $activeGenId);
            }
            $message = $fallback3->inRandomOrder()->first();
        }

        // 4. Jika masih tidak ada, cari yang cocok trigger_condition + tone_style
        if (! $message instanceof InterventionMessage && $triggerCondition) {
            $fallback4 = InterventionMessage::query()
                ->where('trigger_condition', $triggerCondition)
                ->where('tone_style', $normalizedTone);
            if ($activeGenId) {
                $fallback4->where('generation_id', $activeGenId);
            }
            $message = $fallback4->inRandomOrder()->first();
        }

        // 5. Fallback ke pesan emosi belum_teridentifikasi
        if (! $message instanceof InterventionMessage) {
            $fallback5 = InterventionMessage::query()->where('emotion', 'belum_teridentifikasi');
            if ($activeGenId) {
                $fallback5->where('generation_id', $activeGenId);
            }
            $message = $fallback5->inRandomOrder()->first();
        }

        // 6. Fallback terakhir jika DB kosong atau belum ada di generasi aktif
        if (! $message instanceof InterventionMessage) {
            $message = InterventionMessage::query()->inRandomOrder()->first();
        }

        if ($message instanceof InterventionMessage) {
            $message->increment('usage_count');

            return [
                'id' => $message->id,
                'emotion' => $message->emotion,
                'trigger_condition' => $message->trigger_condition,
                'tone_style' => $message->tone_style,
                'header' => $message->header,
                'message' => $message->message,
                'tips' => $message->tips,
                'micro_habit' => [
                    'type' => $message->micro_habit_type,
                    'instruction' => $message->micro_habit_instruction,
                ],
            ];
        }

        return [
            'id' => 0,
            'emotion' => $emotion ?: 'lelah',
            'trigger_condition' => $triggerCondition ?: 'jam_rawan',
            'tone_style' => $toneStyle ?: 'lembut',
            'header' => 'Yuk Ambil Jeda Sejenak',
            'message' => 'Tarik nafas dalam-dalam. Beri ruang untuk dirimu beristirahat sejenak dari layar HP.',
            'tips' => 'Lepaskan HP dan tatap pandangan ke luar jendela.',
            'micro_habit' => [
                'type' => 'nafas',
                'instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan (2 kali).',
            ],
        ];
    }

    /**
     * Tambah pesan baru (Single).
     */
    public function createMessage(array $data): InterventionMessage
    {
        $tone = in_array($data['tone_style'] ?? '', self::VALID_TONE_STYLES, true)
            ? $data['tone_style']
            : 'lembut';

        return InterventionMessage::create([
            'emotion' => $data['emotion'],
            'trigger_condition' => $data['trigger_condition'],
            'tone_style' => $tone,
            'header' => $data['header'],
            'message' => $data['message'],
            'tips' => $data['tips'] ?? null,
            'micro_habit_type' => in_array($data['micro_habit_type'] ?? '', self::VALID_MICRO_HABITS, true)
                ? $data['micro_habit_type']
                : 'nafas',
            'micro_habit_instruction' => $data['micro_habit_instruction'] ?? null,
            'source' => $data['source'] ?? 'custom',
            'usage_count' => 0,
        ]);
    }

    /**
     * Tambah banyak pesan baru sekaligus (Bulk Insert).
     *
     * @return array<int, InterventionMessage>
     */
    public function createMessagesBulk(array $messages): array
    {
        $created = [];
        DB::transaction(function () use ($messages, &$created) {
            foreach ($messages as $data) {
                $created[] = $this->createMessage($data);
            }
        });

        return $created;
    }

    /**
     * Hapus pesan berdasarkan ID.
     */
    public function deleteMessage(int $id): bool
    {
        $message = InterventionMessage::find($id);
        if ($message instanceof InterventionMessage) {
            return (bool) $message->delete();
        }

        return false;
    }

    /**
     * Simpan / Upsert log matriks screen time harian (12 slot 2 jam).
     */
    public function upsertDailyMatrix(
        ?User $user,
        ?string $guestUuid,
        string $logDate,
        array $slots = [],
        int $interventionsTriggered = 0
    ): UserDailyScreenTimeMatrix {
        $allowedSlots = [
            'slot_00_02', 'slot_02_04', 'slot_04_06', 'slot_06_08',
            'slot_08_10', 'slot_10_12', 'slot_12_14', 'slot_14_16',
            'slot_16_18', 'slot_18_20', 'slot_20_22', 'slot_22_00',
        ];

        $criteria = [
            'user_id' => $user?->id,
            'guest_uuid' => $user ? null : ($guestUuid ?: 'guest-default'),
            'log_date' => $logDate,
        ];

        $matrix = UserDailyScreenTimeMatrix::firstOrNew($criteria);

        // Update slots
        foreach ($allowedSlots as $slotName) {
            if (array_key_exists($slotName, $slots)) {
                $matrix->{$slotName} = (int) $slots[$slotName];
            }
        }

        // Hitung total screen time harian otomatis dari 12 slot
        $totalMinutes = 0;
        foreach ($allowedSlots as $slotName) {
            $totalMinutes += (int) $matrix->{$slotName};
        }
        $matrix->total_screen_time_minutes = $totalMinutes;

        if ($interventionsTriggered > 0) {
            $matrix->interventions_triggered = $interventionsTriggered;
        }

        $matrix->save();

        return $matrix;
    }

    /**
     * Ambil riwayat matriks harian 1 bulan penuh.
     *
     * @return Collection<int, UserDailyScreenTimeMatrix>
     */
    public function getMonthlyMatrices(?User $user, ?string $guestUuid, ?string $yearMonth = null): Collection
    {
        $targetDate = $yearMonth ? Carbon::parse($yearMonth . '-01') : now();
        $startOfMonth = $targetDate->copy()->startOfMonth()->toDateString();
        $endOfMonth = $targetDate->copy()->endOfMonth()->toDateString();

        $query = UserDailyScreenTimeMatrix::query()
            ->whereBetween('log_date', [$startOfMonth, $endOfMonth])
            ->orderBy('log_date', 'asc');

        if ($user instanceof User) {
            $query->where('user_id', $user->id);
        } else {
            $query->where('guest_uuid', $guestUuid ?: 'guest-default');
        }

        return $query->get();
    }

    /**
     * Dapatkan setting intervensi aktif (1 record per user/guest).
     */
    public function getOrCreateSetting(?User $user, ?string $guestUuid = null): UserInterventionSetting
    {
        $criteria = [
            'user_id' => $user?->id,
            'guest_uuid' => $user ? null : ($guestUuid ?: 'guest-default'),
        ];

        return UserInterventionSetting::firstOrCreate(
            $criteria,
            [
                'tone_style' => 'lembut',
                'scroll_interval_minutes' => 15,
                'current_pause_duration' => self::MIN_PAUSE_DURATION,
                'last_pause_duration' => self::MIN_PAUSE_DURATION,
            ]
        );
    }

    /**
     * Update preferensi setting user (scroll_interval_minutes atau tone_style).
     */
    public function updateSetting(?User $user, ?string $guestUuid, array $data): UserInterventionSetting
    {
        $setting = $this->getOrCreateSetting($user, $guestUuid);

        $payload = [];
        if (isset($data['scroll_interval_minutes'])) {
            $payload['scroll_interval_minutes'] = max(5, min(60, (int) $data['scroll_interval_minutes']));
        }
        if (isset($data['tone_style'])) {
            $payload['tone_style'] = $data['tone_style'];
        }

        if (! empty($payload)) {
            $setting->update($payload);
        }

        return $setting;
    }

    /**
     * Evaluasi mingguan screen time dari tabel matriks 7 hari terakhir vs 7 hari sebelumnya.
     */
    public function evaluateWeeklyProgress(UserInterventionSetting $setting): UserInterventionSetting
    {
        $now = now();
        $startThisWeek = $now->copy()->subDays(7)->toDateString();
        $startLastWeek = $now->copy()->subDays(14)->toDateString();

        $baseQuery = UserDailyScreenTimeMatrix::query();
        if ($setting->user_id) {
            $baseQuery->where('user_id', $setting->user_id);
        } else {
            $baseQuery->where('guest_uuid', $setting->guest_uuid);
        }

        $thisWeekScreenTime = (int) (clone $baseQuery)
            ->whereBetween('log_date', [$startThisWeek, $now->toDateString()])
            ->sum('total_screen_time_minutes');

        $lastWeekScreenTime = (int) (clone $baseQuery)
            ->whereBetween('log_date', [$startLastWeek, $startThisWeek])
            ->sum('total_screen_time_minutes');

        $currentDuration = $setting->current_pause_duration ?: self::MIN_PAUSE_DURATION;
        $newDuration = $currentDuration;

        // Bandingkan screen time minggu ini vs minggu lalu
        if ($lastWeekScreenTime > 0) {
            if ($thisWeekScreenTime > $lastWeekScreenTime) {
                // Screen time naik -> jeda diperpanjang +5s (max 60s)
                $newDuration = min(self::MAX_PAUSE_DURATION, $currentDuration + self::DURATION_STEP);
            } elseif ($thisWeekScreenTime < $lastWeekScreenTime) {
                // Screen time turun -> reward jeda diperpendek -5s (min 30s)
                $newDuration = max(self::MIN_PAUSE_DURATION, $currentDuration - self::DURATION_STEP);
            }
        }

        $setting->update([
            'last_pause_duration' => $currentDuration,
            'current_pause_duration' => $newDuration,
            'last_evaluated_at' => $now,
        ]);

        return $setting;
    }

    /**
     * Rotasi Pool Pesan AI (Weekly Rotation) - Terkunci ketat pada 4 Enum Micro-Habit.
     */
    public function rotatePoolWithAi(int $countToGenerate = 10, int $countToPrune = 10): int
    {
        $emotions = ['tenang', 'cemas', 'bosan', 'lelah', 'belum_teridentifikasi'];
        $triggers = ['jam_rawan', 'scroll_terlalu_lama', 'checkin_dashboard'];
        $tones = ['lembut', 'tegas', 'humoris', 'faktual', 'reflektif'];
        $microHabits = [
            'nafas' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Ulangi bolak-balik 2 kali.',
            'minum' => 'Berdiri dan ambil segelas air putih hangat. Minum perlahan.',
            'peregangan' => 'Regangkan leher dan bahumu perlahan selama 15 detik.',
            'tidur' => 'Kunci layar HP, redupkan lampu kamarmu, dan pejamkan mata.',
        ];

        $generatedCount = 0;

        try {
            $prompt = <<<PROMPT
Buatkan {$countToGenerate} variasi pesan kartu intervensi jeda doomscrolling untuk aplikasi YUDA (karakter maskot Capybara yang hangat).

Aturan Sangat Penting:
1. 'micro_habit_type' HANYA BOLEH salah satu dari 4 kata ini: "minum", "tidur", "nafas", "peregangan". Tidak boleh kata lain!
2. Jika 'micro_habit_type' = "nafas", teks instruksi WAJIB mencantumkan ritme: tarik 5 detik, tahan 5 detik, hembus 5 detik perlahan bolak-balik.
3. Jika 'micro_habit_type' = "tidur", instruksi mengarahkan untuk meletakkan HP dan memejamkan mata.

Format output HARUS JSON murni berupa array of objects:
[
  {
    "emotion": "tenang|cemas|bosan|lelah|belum_teridentifikasi",
    "trigger_condition": "jam_rawan|scroll_terlalu_lama|checkin_dashboard",
    "tone_style": "lembut|tegas|humoris|faktual|reflektif",
    "header": "Judul sapaan empati (max 8 kata)",
    "message": "Pesan reflektif mengapa jeda itu berharga (1-2 kalimat)",
    "tips": "Tips aksi kecil refleksi (1 kalimat ringkas)",
    "micro_habit_type": "minum|tidur|nafas|peregangan",
    "micro_habit_instruction": "Instruksi tindakan singkat 30 detik"
  }
]
PROMPT;

            $model = (string) config('ai.providers.gemini-compatible.models.text.default', 'gemini-1.5-flash');
            $response = Ai::agent()->prompt($prompt, provider: 'gemini-compatible', model: $model);

            $content = (string) $response;
            if (preg_match('/\[.*\]/s', $content, $matches)) {
                $items = json_decode($matches[0], true);
                if (is_array($items)) {
                    foreach ($items as $item) {
                        $habit = in_array($item['micro_habit_type'] ?? '', self::VALID_MICRO_HABITS, true)
                            ? $item['micro_habit_type']
                            : 'nafas';

                        InterventionMessage::create([
                            'emotion' => $item['emotion'] ?? $emotions[array_rand($emotions)],
                            'trigger_condition' => $item['trigger_condition'] ?? $triggers[array_rand($triggers)],
                            'tone_style' => $item['tone_style'] ?? $tones[array_rand($tones)],
                            'header' => $item['header'] ?? 'Yuk Ambil Jeda Sejenak',
                            'message' => $item['message'] ?? 'Beri ruang untuk dirimu bernapas sejenak.',
                            'tips' => $item['tips'] ?? 'Tutup layar HP-mu dan ambil nafas panjang.',
                            'micro_habit_type' => $habit,
                            'micro_habit_instruction' => $item['micro_habit_instruction'] ?? $microHabits[$habit],
                            'source' => 'ai',
                            'usage_count' => 0,
                        ]);
                        $generatedCount++;
                    }
                }
            }
        } catch (Throwable $e) {
            Log::warning('intervention.rotate_ai_failed', ['error' => $e->getMessage()]);
            // Fallback programmatic generator jika AI offline
            for ($i = 0; $i < $countToGenerate; $i++) {
                $emo = $emotions[array_rand($emotions)];
                $trig = $triggers[array_rand($triggers)];
                $tone = $tones[array_rand($tones)];
                $habitKey = self::VALID_MICRO_HABITS[array_rand(self::VALID_MICRO_HABITS)];

                InterventionMessage::create([
                    'emotion' => $emo,
                    'trigger_condition' => $trig,
                    'tone_style' => $tone,
                    'header' => "Halo Sobat YUDA, Lagi Merasa {$emo}?",
                    'message' => 'Scrolling tidak akan menggantikan waktu istirahat yang berkualitas. Yuk rehat sejenak.',
                    'tips' => 'Beri jeda agar tubuhmu rileks kembali.',
                    'micro_habit_type' => $habitKey,
                    'micro_habit_instruction' => $microHabits[$habitKey],
                    'source' => 'seed_fallback',
                    'usage_count' => 0,
                ]);
                $generatedCount++;
            }
        }

        // Pruning pesan terlama yang usage-nya paling banyak
        $totalPool = InterventionMessage::count();
        if ($totalPool > 25) {
            $toDeleteIds = InterventionMessage::query()
                ->where('source', '!=', 'seed')
                ->orderByDesc('usage_count')
                ->orderBy('created_at')
                ->limit($countToPrune)
                ->pluck('id');

            if ($toDeleteIds->isNotEmpty()) {
                InterventionMessage::whereIn('id', $toDeleteIds)->delete();
            }
        }

        return $generatedCount;
    }
}
