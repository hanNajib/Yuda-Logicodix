<?php

namespace App\Console\Commands;

use App\Services\InterventionService;
use Illuminate\Console\Command;

class RotateInterventionMessagesCommand extends Command
{
    protected $signature = 'yuda:rotate-intervention-messages {--count=10 : Jumlah pesan baru yang digenerate} {--prune=10 : Jumlah pesan lama yang dihapus}';

    protected $description = 'Generate pesan intervensi baru via AI dan rotasi pool pesan (menjaga pool 30 pesan aktif)';

    public function handle(InterventionService $service): int
    {
        $count = (int) $this->option('count');
        $prune = (int) $this->option('prune');

        $this->info("Memulai rotasi pool pesan intervensi (+{$count} baru, -{$prune} lama)...");

        $generated = $service->rotatePoolWithAi($count, $prune);

        $this->info("Rotasi berhasil! Ditambahkan {$generated} pesan baru ke pool.");

        return self::SUCCESS;
    }
}

