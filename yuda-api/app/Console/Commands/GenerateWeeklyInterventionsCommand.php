<?php

namespace App\Console\Commands;

use App\Services\InterventionGenerationService;
use Illuminate\Console\Command;
use Throwable;

class GenerateWeeklyInterventionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'yuda:generate-weekly-interventions 
                            {--period= : Period key kustom, contoh: 2026-W46} 
                            {--force : Paksa generate ulang periode meskipun sudah ada}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Memulai proses generasi otomatis mingguan 180 pesan intervensi (12 batch via Queue)';

    /**
     * Execute the console command.
     */
    public function handle(InterventionGenerationService $generationService): int
    {
        $period = $this->option('period');
        $force = (bool) $this->option('force');

        $this->info("Memulai proses generasi pesan intervensi mingguan YUDA...");

        try {
            $run = $generationService->startWeeklyGeneration(
                periodKey: is_string($period) ? $period : null,
                force: $force
            );

            $this->info("✓ Run berhasil didaftarkan: ID #{$run->id} (Periode: {$run->period_key})");
            $this->info("✓ Total 60 kombinasi telah dibagi menjadi {$run->total_batches} batch.");
            $this->info("✓ Seluruh batch telah dimasukkan ke Laravel Queue (Background).");
            $this->comment("Jalankan 'php artisan queue:work' untuk memproses batch secara asynchronous.");

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error("Gagal memulai proses generasi: " . $e->getMessage());
            return self::FAILURE;
        }
    }
}

