<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserDailyScreenTimeMatrix;
use App\Models\UserInterventionSetting;
use App\Models\UserSocialScreenTime;
use App\Models\UserTask;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionUserDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = 'lavimieayam@gmail.com';
        $plainPassword = 'lavi-mieayamLOREM_456';

        // 1. Buat / Update User Utama
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Lavi Mie Ayam',
                'full_name' => 'Lavi Mie Ayam Pratama',
                'password' => Hash::make($plainPassword),
                'email_verified_at' => now(),
            ]
        );

        // Buat token autentikasi Sanctum siap pakai
        $user->tokens()->where('name', 'production-app-token')->delete();
        $token = $user->createToken('production-app-token')->plainTextToken;

        // 2. Setting Intervensi User (Kartu Cukup Tau & Jeda)
        UserInterventionSetting::updateOrCreate(
            ['user_id' => $user->id],
            [
                'guest_uuid' => null,
                'tone_style' => 'lembut',
                'scroll_interval_minutes' => 45,
                'current_pause_duration' => 30,
                'last_pause_duration' => 30,
                'last_evaluated_at' => now(),
            ]
        );

        // 3. Akumulasi Total Social Media Screen Time (Keseluruhan)
        UserSocialScreenTime::updateOrCreate(
            ['user_id' => $user->id],
            [
                'guest_uuid' => null,
                'instagram' => 1240, // menit
                'tiktok' => 1890,
                'facebook' => 310,
                'threads' => 240,
                'youtube' => 1450,
                'x' => 520,
            ]
        );

        // 4. Matriks Harian (Daily Screen Time Matrix & Chart 14 Hari Terakhir)
        // Data realistis: ada jam rawan malam (slot 20-22 dan 22-00)
        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();

            // Variasi realistis per hari (menit)
            $isWeekend = Carbon::parse($date)->isWeekend();
            $slot20_22 = $isWeekend ? rand(50, 80) : rand(30, 60);
            $slot22_00 = $isWeekend ? rand(60, 110) : rand(40, 75);
            $slot12_14 = rand(20, 45); // istirahat siang
            $slot18_20 = rand(15, 40);

            $ig = rand(30, 80);
            $tt = rand(45, 120);
            $yt = rand(30, 90);
            $fb = rand(5, 25);
            $th = rand(5, 20);
            $x  = rand(10, 35);

            $totalMinutes = $slot12_14 + $slot18_20 + $slot20_22 + $slot22_00;
            $interventions = $totalMinutes > 150 ? rand(2, 4) : rand(1, 2);

            UserDailyScreenTimeMatrix::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'log_date' => $date,
                ],
                [
                    'guest_uuid' => null,
                    'slot_00_02' => rand(0, 20),
                    'slot_02_04' => 0,
                    'slot_04_06' => 0,
                    'slot_06_08' => rand(5, 25),
                    'slot_08_10' => rand(0, 15),
                    'slot_10_12' => rand(5, 20),
                    'slot_12_14' => $slot12_14,
                    'slot_14_16' => rand(10, 30),
                    'slot_16_18' => rand(10, 35),
                    'slot_18_20' => $slot18_20,
                    'slot_20_22' => $slot20_22,
                    'slot_22_00' => $slot22_00,
                    'instagram' => $ig,
                    'tiktok' => $tt,
                    'facebook' => $fb,
                    'threads' => $th,
                    'youtube' => $yt,
                    'x' => $x,
                    'total_screen_time_minutes' => $totalMinutes,
                    'interventions_triggered' => $interventions,
                ]
            );
        }

        // 5. Data Task List (Aktivitas Positif Hari Ini & Lampau)
        // Bersihkan task lama user ini jika ada
        UserTask::where('user_id', $user->id)->delete();

        $today = Carbon::today()->toDateString();
        $tasksData = [
            // Hari Ini
            [
                'title' => 'Makanin kucing & ganti air minum',
                'scheduled_date' => $today,
                'scheduled_time' => '07:30',
                'is_completed' => true,
                'completed_at' => Carbon::today()->setTime(7, 35),
            ],
            [
                'title' => 'Latihan pernapasan 5-5-5 saat jeda YUDA',
                'scheduled_date' => $today,
                'scheduled_time' => '13:00',
                'is_completed' => true,
                'completed_at' => Carbon::today()->setTime(13, 5),
            ],
            [
                'title' => 'Membaca buku Atomic Habits 20 halaman',
                'scheduled_date' => $today,
                'scheduled_time' => '16:30',
                'is_completed' => false,
                'completed_at' => null,
            ],
            [
                'title' => 'Jalan santai sore keliling komplek tanpa bawa HP',
                'scheduled_date' => $today,
                'scheduled_time' => '17:15',
                'is_completed' => false,
                'completed_at' => null,
            ],
            [
                'title' => 'Letakkan HP di meja luar kamar sebelum tidur',
                'scheduled_date' => $today,
                'scheduled_time' => '21:30',
                'is_completed' => false,
                'completed_at' => null,
            ],
            // Kemarin (Sudah Selesai Semua)
            [
                'title' => 'Rapikan meja kerja & bersihkan laptop',
                'scheduled_date' => Carbon::yesterday()->toDateString(),
                'scheduled_time' => '09:00',
                'is_completed' => true,
                'completed_at' => Carbon::yesterday()->setTime(9, 20),
            ],
            [
                'title' => 'Ngobrol santai tanpa layar HP bareng keluarga',
                'scheduled_date' => Carbon::yesterday()->toDateString(),
                'scheduled_time' => '19:30',
                'is_completed' => true,
                'completed_at' => Carbon::yesterday()->setTime(20, 15),
            ],
        ];

        foreach ($tasksData as $t) {
            UserTask::create([
                'user_id' => $user->id,
                'guest_uuid' => null,
                'title' => $t['title'],
                'scheduled_date' => $t['scheduled_date'],
                'scheduled_time' => $t['scheduled_time'],
                'is_completed' => $t['is_completed'],
                'completed_at' => $t['completed_at'],
            ]);
        }

        $this->command->info('====================================================');
        $this->command->info('SEEDER PRODUCTION BERHASIL DIJALANKAN!');
        $this->command->info("Email User : {$email}");
        $this->command->info("Password   : {$plainPassword}");
        $this->command->info("Auth Token : {$token}");
        $this->command->info('Data Matriks: 14 hari terakhir terisi penuh untuk Chart');
        $this->command->info('Data Task   : 7 aktivitas (hari ini & kemarin) siap tampil');
        $this->command->info('Data Social : Akumulasi IG, TikTok, YT, FB, Threads, X terisi');
        $this->command->info('====================================================');
    }
}
