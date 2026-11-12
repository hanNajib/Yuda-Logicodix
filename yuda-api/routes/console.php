<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Jadwal Generasi Pesan Intervensi Mingguan (Gemini AI)
|--------------------------------------------------------------------------
| Dijalankan otomatis setiap hari Senin pukul 02:00 WIB (Asia/Jakarta).
| Menghasilkan 180 pesan baru (12 batch x 15 pesan via Queue).
*/
Schedule::command('yuda:generate-weekly-interventions')
    ->weeklyOn(1, '02:00')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping();
