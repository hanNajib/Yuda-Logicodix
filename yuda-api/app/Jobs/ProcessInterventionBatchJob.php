<?php

namespace App\Jobs;

use App\Ai\Agents\InterventionBatchGeneratorAgent;
use App\Models\InterventionGenerationBatch;
use App\Services\InterventionGenerationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessInterventionBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Maksimal percobaan per batch jika gagal / rate-limit.
     */
    public int $tries = 3;

    /**
     * Timeout per job dalam detik (2 menit).
     */
    public int $timeout = 120;

    public function __construct(public int $batchId) {}

    public function handle(InterventionGenerationService $generationService): void
    {
        $batch = InterventionGenerationBatch::find($this->batchId);
        if (! $batch || $batch->status === 'completed') {
            return;
        }

        $batch->increment('attempts');
        $batch->update(['status' => 'processing']);

        $combinations = $batch->combinations;
        if (empty($combinations)) {
            $batch->update(['status' => 'failed']);
            Log::warning('ProcessInterventionBatchJob: Combinations empty', ['batch_id' => $this->batchId]);
            return;
        }

        try {
            $combinationsJson = json_encode($combinations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            $prompt = <<<PROMPT
Kamu adalah AI generator pesan intervensi untuk aplikasi "YUDA", dengan maskot Capybara yang hangat dan suportif untuk membantu pengguna mengatasi doomscrolling.

TUGAS UTAMA:
Hasilkan TEPAT 3 variasi pesan untuk SETIAP kombinasi parameter berikut ini.
Daftar kombinasi yang harus kamu buat ({count_combinations} kombinasi):
{$combinationsJson}

ATURAN STRUKTUR & VALIDASI KETAT:
1. Total pesan yang dihasilkan HARUS TEPAT {total_expected} pesan (masing-masing kombinasi tepat 3 variasi).
2. "emotion" HARUS persis salah satu dari: tenang, cemas, bosan, lelah.
3. "trigger_condition" HARUS persis salah satu dari: jam_rawan, scroll_terlalu_lama, checkin_dashboard.
4. "tone_style" HARUS persis salah satu dari: lembut, tegas, humoris, faktual, reflektif.
5. "micro_habit_type" HANYA BOLEH salah satu dari 4 kata ini:
   - "nafas" (Instruksi WAJIB mencakup ritme 5-5-5: tarik 5 detik, tahan 5 detik, hembuskan 5 detik perlahan bolak-balik)
   - "minum" (Instruksi minum air putih)
   - "peregangan" (Instruksi stretching fisik singkat)
   - "tidur" (Instruksi letakkan HP, redupkan lampu, pejamkan mata)
6. JANGAN membuat kolom id, usage_count, created_at, atau updated_at.

FORMAT OUTPUT:
Keluarkan HANYA JSON array of objects murni tanpa pengantar atau markdown tambahan.
[
  {
    "emotion": "tenang|cemas|bosan|lelah",
    "trigger_condition": "jam_rawan|scroll_terlalu_lama|checkin_dashboard",
    "tone_style": "lembut|tegas|humoris|faktual|reflektif",
    "header": "Judul singkat sapaan empati (maks 8 kata)",
    "message": "Pesan reflektif mengapa jeda itu berharga (1-2 kalimat)",
    "tips": "Tips aksi kecil refleksi (1 kalimat ringkas)",
    "micro_habit_type": "nafas|minum|peregangan|tidur",
    "micro_habit_instruction": "Instruksi tindakan singkat 30 detik"
  }
]
PROMPT;

            $totalExpected = count($combinations) * 3;
            $prompt = str_replace(
                ['{count_combinations}', '{total_expected}'],
                [(string) count($combinations), (string) $totalExpected],
                $prompt
            );

            $model = (string) config('ai.providers.gemini-compatible.models.text.default', 'gemini-3.8-flash');
            $response = InterventionBatchGeneratorAgent::make()->prompt(
                $prompt,
                provider: 'gemini-compatible',
                model: $model,
                timeout: (int) config('ai.timeout', 45)
            );

            $content = (string) $response;
            $items = null;
            if (preg_match('/\[.*\]/s', $content, $matches)) {
                $items = json_decode($matches[0], true);
            }

            if (! is_array($items) || count($items) === 0) {
                throw new \RuntimeException('Gemini tidak mengembalikan array JSON yang valid.');
            }

            // Normalisasi dan validasi ENUM dasar
            $validatedMessages = [];
            $validEmotions = ['tenang', 'cemas', 'bosan', 'lelah'];
            $validTriggers = ['jam_rawan', 'scroll_terlalu_lama', 'checkin_dashboard'];
            $validTones = ['lembut', 'tegas', 'humoris', 'faktual', 'reflektif'];
            $validHabits = ['nafas', 'minum', 'peregangan', 'tidur'];

            foreach ($items as $item) {
                if (empty($item['header']) || empty($item['message'])) {
                    continue;
                }

                $emotion = in_array($item['emotion'] ?? '', $validEmotions, true) ? $item['emotion'] : 'tenang';
                $trigger = in_array($item['trigger_condition'] ?? '', $validTriggers, true) ? $item['trigger_condition'] : 'jam_rawan';
                $tone = in_array($item['tone_style'] ?? '', $validTones, true) ? $item['tone_style'] : 'lembut';
                $habit = in_array($item['micro_habit_type'] ?? '', $validHabits, true) ? $item['micro_habit_type'] : 'nafas';

                $instruction = $item['micro_habit_instruction'] ?? 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan.';
                if ($habit === 'nafas' && ! str_contains($instruction, '5')) {
                    $instruction = 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.';
                }

                $validatedMessages[] = [
                    'emotion' => $emotion,
                    'trigger_condition' => $trigger,
                    'tone_style' => $tone,
                    'header' => (string) $item['header'],
                    'message' => (string) $item['message'],
                    'tips' => isset($item['tips']) ? (string) $item['tips'] : null,
                    'micro_habit_type' => $habit,
                    'micro_habit_instruction' => $instruction,
                    'source' => 'ai',
                ];
            }

            // Simpan hasil sementara
            $batch->update([
                'result' => $validatedMessages,
                'status' => 'completed',
            ]);

            // Cek apakah seluruh batch pada run ini sudah selesai
            $generationService->checkAndFinalizeRun($batch->generation_id);
        } catch (Throwable $e) {
            Log::error('ProcessInterventionBatchJob.failed', [
                'batch_id' => $this->batchId,
                'attempt' => $batch->attempts,
                'error' => $e->getMessage(),
            ]);

            $batch->update([
                'status' => 'failed',
            ]);

            // Re-throw exception agar sistem Queue mencatat retry jika attempts < $tries
            throw $e;
        }
    }
}
