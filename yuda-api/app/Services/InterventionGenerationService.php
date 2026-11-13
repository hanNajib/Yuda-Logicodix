<?php

namespace App\Services;

use App\Jobs\ProcessInterventionBatchJob;
use App\Models\InterventionGenerationBatch;
use App\Models\InterventionGenerationRun;
use App\Models\InterventionMessage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class InterventionGenerationService
{
    public const EMOTIONS = ['tenang', 'cemas', 'bosan', 'lelah'];
    public const TRIGGERS = ['jam_rawan', 'scroll_terlalu_lama', 'checkin_dashboard'];
    public const TONES = ['lembut', 'tegas', 'humoris', 'faktual', 'reflektif'];
    public const HABITS = ['nafas', 'minum', 'peregangan', 'tidur'];

    public const TOTAL_COMBINATIONS = 60;
    public const VARIATIONS_PER_COMBINATION = 3;
    public const TOTAL_EXPECTED_MESSAGES = 180;
    public const TOTAL_BATCHES = 12;
    public const COMBINATIONS_PER_BATCH = 5;

    /**
     * Memulai proses generasi mingguan baru.
     */
    public function startWeeklyGeneration(?string $periodKey = null, bool $force = false): InterventionGenerationRun
    {
        $periodKey = $periodKey ?: Carbon::now('Asia/Jakarta')->format('o-\WW'); // Contoh: 2026-W46

        // 1. Cek apakah ada proses yang sedang berjalan (cegah overlapping)
        $runningJob = InterventionGenerationRun::where('status', 'processing')->first();
        if ($runningJob && ! $force) {
            throw new \RuntimeException("Proses generasi untuk periode {$runningJob->period_key} sedang berjalan.");
        }

        // 2. Cek apakah periode ini sudah pernah digenerate dan aktif
        $existing = InterventionGenerationRun::where('period_key', $periodKey)->first();
        if ($existing && ! $force) {
            if ($existing->status === 'active' || $existing->status === 'completed') {
                return $existing;
            }
        }

        // 3. Buat atau perbarui record run
        $run = InterventionGenerationRun::updateOrCreate(
            ['period_key' => $periodKey],
            [
                'status' => 'processing',
                'total_combinations' => self::TOTAL_COMBINATIONS,
                'total_batches' => self::TOTAL_BATCHES,
                'completed_batches' => 0,
                'failed_batches' => 0,
                'total_generated' => 0,
                'started_at' => now(),
                'completed_at' => null,
            ]
        );

        // Hapus batch lama jika ada (kasus retry/force)
        $run->batches()->delete();

        // 4. Bangun seluruh 60 kombinasi
        $combinations = $this->buildAllCombinations();

        // 5. Bagi menjadi 12 batch (masing-masing 5 kombinasi)
        $chunked = array_chunk($combinations, self::COMBINATIONS_PER_BATCH);

        foreach ($chunked as $index => $batchCombinations) {
            $batchNumber = $index + 1;
            $batch = InterventionGenerationBatch::create([
                'generation_id' => $run->id,
                'batch_number' => $batchNumber,
                'status' => 'pending',
                'combinations' => $batchCombinations,
                'result' => null,
                'attempts' => 0,
            ]);

            // Dispatch ke Laravel Queue
            ProcessInterventionBatchJob::dispatch($batch->id);
        }

        Log::info('InterventionGenerationService.started', [
            'period_key' => $periodKey,
            'run_id' => $run->id,
            'total_batches' => count($chunked),
        ]);

        return $run;
    }

    /**
     * Cek apakah seluruh 12 batch sudah selesai dan validasi untuk aktivasi atomik.
     */
    public function checkAndFinalizeRun(int $generationId): bool
    {
        $run = InterventionGenerationRun::with('batches')->find($generationId);
        if (! $run || $run->status === 'active' || $run->status === 'archived') {
            return false;
        }

        $batches = $run->batches;
        $completedCount = $batches->where('status', 'completed')->count();
        $failedCount = $batches->where('status', 'failed')->count();

        $run->update([
            'completed_batches' => $completedCount,
            'failed_batches' => $failedCount,
        ]);

        // Jika belum semua batch selesai, tunggu worker queue menyelesaikan sisanya
        if ($completedCount + $failedCount < self::TOTAL_BATCHES) {
            return false;
        }

        // Jika ada batch yang gagal, tandai run sebagai failed
        if ($failedCount > 0) {
            $run->update([
                'status' => 'failed',
            ]);
            Log::warning('InterventionGenerationService.run_failed_batches', [
                'run_id' => $run->id,
                'failed_batches' => $failedCount,
            ]);
            return false;
        }

        // ==============================================================
        // VALIDASI KETAT SEBELUM AKTIVASI
        // ==============================================================
        $allMessages = [];
        $combinationTracker = [];

        foreach ($batches as $batch) {
            $result = $batch->result;
            if (! is_array($result) || count($result) === 0) {
                $run->update(['status' => 'failed']);
                Log::warning('InterventionGenerationService.batch_empty', ['run_id' => $run->id, 'batch' => $batch->batch_number]);
                return false;
            }

            foreach ($result as $msg) {
                // Validasi field wajib
                if (empty($msg['header']) || empty($msg['message']) || empty($msg['emotion']) || empty($msg['trigger_condition']) || empty($msg['tone_style'])) {
                    $run->update(['status' => 'failed']);
                    Log::warning('InterventionGenerationService.message_incomplete', ['run_id' => $run->id, 'batch' => $batch->batch_number]);
                    return false;
                }

                // Validasi ENUM
                if (! in_array($msg['emotion'], self::EMOTIONS, true) ||
                    ! in_array($msg['trigger_condition'], self::TRIGGERS, true) ||
                    ! in_array($msg['tone_style'], self::TONES, true) ||
                    ! in_array($msg['micro_habit_type'], self::HABITS, true)) {
                    $run->update(['status' => 'failed']);
                    Log::warning('InterventionGenerationService.enum_invalid', ['run_id' => $run->id, 'batch' => $batch->batch_number]);
                    return false;
                }

                $key = "{$msg['emotion']}|{$msg['trigger_condition']}|{$msg['tone_style']}";
                $combinationTracker[$key] = ($combinationTracker[$key] ?? 0) + 1;

                $allMessages[] = [
                    'generation_id' => $run->id,
                    'emotion' => $msg['emotion'],
                    'trigger_condition' => $msg['trigger_condition'],
                    'tone_style' => $msg['tone_style'],
                    'header' => $msg['header'],
                    'message' => $msg['message'],
                    'tips' => $msg['tips'] ?? null,
                    'micro_habit_type' => $msg['micro_habit_type'],
                    'micro_habit_instruction' => $msg['micro_habit_instruction'] ?? null,
                    'source' => 'ai',
                    'usage_count' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // 1. Validasi total pesan harus tepat 180
        if (count($allMessages) !== self::TOTAL_EXPECTED_MESSAGES) {
            $run->update([
                'status' => 'failed',
            ]);
            Log::warning('InterventionGenerationService.total_messages_mismatch', [
                'run_id' => $run->id,
                'actual' => count($allMessages),
                'expected' => self::TOTAL_EXPECTED_MESSAGES,
            ]);
            return false;
        }

        // 2. Validasi jumlah kombinasi harus tepat 60
        if (count($combinationTracker) !== self::TOTAL_COMBINATIONS) {
            $run->update([
                'status' => 'failed',
            ]);
            Log::warning('InterventionGenerationService.combination_count_mismatch', [
                'run_id' => $run->id,
                'actual' => count($combinationTracker),
                'expected' => self::TOTAL_COMBINATIONS,
            ]);
            return false;
        }

        // ==============================================================
        // AKTIVASI GENERASI BARU SECARA ATOMIK (DB TRANSACTION)
        // ==============================================================
        try {
            DB::transaction(function () use ($run, $allMessages) {
                // 1. Bulk insert 180 pesan ke tabel utama intervention_messages
                InterventionMessage::insert($allMessages);

                // 2. Arsipkan generasi yang sebelumnya aktif (jangan hapus datanya!)
                InterventionGenerationRun::where('status', 'active')
                    ->where('id', '!=', $run->id)
                    ->update(['status' => 'archived']);

                // 3. Aktifkan generasi baru
                $run->update([
                    'status' => 'active',
                    'total_generated' => count($allMessages),
                    'completed_at' => now(),
                ]);
            });

            Log::info('InterventionGenerationService.activated_successfully', [
                'run_id' => $run->id,
                'period_key' => $run->period_key,
                'total_messages' => count($allMessages),
            ]);

            return true;
        } catch (Throwable $e) {
            Log::error('InterventionGenerationService.activation_transaction_failed', [
                'run_id' => $run->id,
                'error' => $e->getMessage(),
            ]);

            $run->update([
                'status' => 'failed',
            ]);

            return false;
        }
    }

    /**
     * Membentuk array 60 kombinasi (4 emosi * 3 trigger * 5 tone).
     *
     * @return array<int, array{emotion: string, trigger_condition: string, tone_style: string}>
     */
    public function buildAllCombinations(): array
    {
        $combinations = [];
        foreach (self::EMOTIONS as $emotion) {
            foreach (self::TRIGGERS as $trigger) {
                foreach (self::TONES as $tone) {
                    $combinations[] = [
                        'emotion' => $emotion,
                        'trigger_condition' => $trigger,
                        'tone_style' => $tone,
                    ];
                }
            }
        }

        return $combinations;
    }

    /**
     * Dapatkan ID generasi yang sedang aktif saat ini.
     */
    public static function getActiveGenerationId(): ?int
    {
        return InterventionGenerationRun::where('status', 'active')->value('id');
    }
}

