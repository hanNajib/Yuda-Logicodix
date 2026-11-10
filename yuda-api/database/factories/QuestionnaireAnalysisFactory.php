<?php

namespace Database\Factories;

use App\Models\QuestionnaireAnalysis;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuestionnaireAnalysis>
 */
class QuestionnaireAnalysisFactory extends Factory
{
    protected $model = QuestionnaireAnalysis::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pattern_hash' => fake()->sha256(),
            'answers' => [
                'q1' => 'D',
                'q2' => ['E'],
                'q3' => ['A'],
                'q4' => 'E',
                'q5' => 'D',
                'q6' => ['A'],
                'q7' => ['A'],
                'q8' => ['A'],
                'q9' => 'A',
                'q10' => ['A'],
            ],
            'analysis' => [
                'layar_1_insight_waktu' => [
                    'headline' => 'Kamu Menghabiskan 4-6 Jam Dalam Sehari?',
                    'subteks' => 'Waw, itu waktu yang cukup banyak untuk dihabiskan dengan scrolling.',
                ],
                'layar_2_alternatif_aktivitas' => [
                    [
                        'judul' => 'Membaca Buku',
                        'deskripsi' => 'Dengan kecepatan baca 50-100 halaman/jam kamu bisa menyelesaikan 2 buku.',
                    ],
                ],
                'layar_3_tipe_doomscrolling' => [
                    'nama_tipe' => 'Night Owl',
                    'subtipe_note' => 'Bedtime procrastination',
                    'deskripsi_kecenderungan' => 'Sering scrolling saat lelah.',
                    'afirmasi_jeda' => 'Ketika jam 21.00 tiba, tarik napas dalam tiga kali.',
                    'waktu_tayang' => '20.45',
                ],
                'jawaban' => 'Analisis kuesioner onboarding YUDA selesai.',
            ],
            'source' => 'gemini',
            'hit_count' => 1,
        ];
    }
}
