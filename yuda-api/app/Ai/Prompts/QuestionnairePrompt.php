<?php

namespace App\Ai\Prompts;

use App\Ai\QuestionnaireOptions;

final class QuestionnairePrompt
{
    /**
     * Susun prompt analisis kuesioner onboarding YUDA (Q1–Q10) sesuai flow UI mobile 3 layar.
     *
     * @param  array{
     *     q1: string,
     *     q2?: array<int, string>|null,
     *     q3: array<int, string>,
     *     q4: string,
     *     q5: string,
     *     q6: array<int, string>,
     *     q7: array<int, string>,
     *     q8: array<int, string>,
     *     q9: string,
     *     q10: array<int, string>
     * }  $answers
     */
    public static function build(array $answers): string
    {
        $q2Answers = array_filter(
            $answers['q2'] ?? [],
            static fn (string $key): bool => $key !== QuestionnaireOptions::NO_OTHER_TIME_KEY && isset(QuestionnaireOptions::Q1_OPTIONS[$key]),
        );

        $mappedData = [
            'q1_jam_rawan_utama' => QuestionnaireOptions::Q1_OPTIONS[$answers['q1']] ?? $answers['q1'],
            'q2_jam_rawan_tambahan' => array_values(array_map(
                static fn (string $key): string => QuestionnaireOptions::Q1_OPTIONS[$key] ?? $key,
                $q2Answers,
            )),
            'q3_situasi_pemicu' => array_values(array_map(
                static fn (string $key): string => QuestionnaireOptions::Q3_OPTIONS[$key] ?? $key,
                $answers['q3'],
            )),
            'q4_kronotipe' => QuestionnaireOptions::Q4_OPTIONS[$answers['q4']] ?? $answers['q4'],
            'q5_frekuensi_tunda_tidur' => QuestionnaireOptions::Q5_OPTIONS[$answers['q5']] ?? $answers['q5'],
            'q6_emosi_pemicu' => array_values(array_map(
                static fn (string $key): string => QuestionnaireOptions::Q6_OPTIONS[$key] ?? $key,
                $answers['q6'],
            )),
            'q7_motif_doomscrolling' => array_values(array_map(
                static fn (string $key): string => QuestionnaireOptions::Q7_OPTIONS[$key] ?? $key,
                $answers['q7'],
            )),
            'q8_nilai_inti' => array_values(array_map(
                static fn (string $key): string => QuestionnaireOptions::Q8_OPTIONS[$key] ?? $key,
                $answers['q8'],
            )),
            'q9_gaya_pesan_nada' => QuestionnaireOptions::Q9_OPTIONS[$answers['q9']] ?? $answers['q9'],
            'q10_respons_pengganti' => array_values(array_map(
                static fn (string $key): string => QuestionnaireOptions::Q10_OPTIONS[$key] ?? $key,
                $answers['q10'],
            )),
        ];

        return implode("\n", [
            'Kamu adalah asisten analisis kuesioner YUDA. Analisis jawaban kuesioner pengguna (Q1–Q10) berikut untuk mengisi data JSON bagi 3 Layar Tampilan Onboarding Mobile:',
            '',
            '=== ATURAN LAYAR 1 (Insight & Kesadaran Waktu) ===',
            '- headline: Kalimat tanya menarik tentang estimasi waktu yang dihabiskan pengguna (misal: "Kamu Menghabiskan 4-6 Jam Dalam Sehari?" atau sesuai rentang jam rawan Q1 & Q2).',
            '- subteks: 1 kalimat empatik yang menyadarkan tanpa menghakimi (misal: "Waw, itu waktu yang cukup banyak untuk dihabiskan dengan scrolling sebelum tidur.").',
            '',
            '=== ATURAN LAYAR 2 (Alternatif Aktivitas Positif: "Bayangin yang Bisa Kamu Lakukan Dengan Waktu Sebanyak Itu") ===',
            '- Hasilkan tepat 3 kartu aktivitas dalam array "layar_2_alternatif_aktivitas".',
            '- Kartu 1 (Literasi/Wawasan): Contoh judul "Membaca Buku" dengan kalkulasi realistis (misal kecepatan 50-100 halaman/jam, bisa tamatkan berapa buku).',
            '- Kartu 2 (Hobi/Kreativitas): Selaras dengan nilai hidup Q8 dan minat pengguna (misal musik, memasak, atau belajar skill baru).',
            '- Kartu 3 (Fisik/Relaksasi): Selaras dengan respons pengganti Q10 (misal jalan kaki santai 3-5 km/jam, peregangan tubuh, atau latihan pernapasan).',
            '- Setiap kartu memuat field "judul" (singkat) dan "deskripsi" (1-2 kalimat dengan angka/kalkulasi realistis).',
            '',
            '=== ATURAN LAYAR 3 (Kenali Tipe Doomscrolling Kamu) ===',
            '- nama_tipe: Tentukan berdasarkan Q1 & Q4:',
            '  * Q1 = D (21.00–23.59): Jika Q4 ∈ {D, E} beri nama "Night Owl". Jika Q4 ∈ {A, B, C} beri nama "Night Scroller". JANGAN beri label Night Owl jika Q4 bukan tipe malam!',
            '  * Q1 = E (00.00–04.59) -> "Midnight Wanderer".',
            '  * Q1 = A (05.00–08.59) -> "Early Bird Scroller".',
            '  * Q1 = B (09.00–11.59) -> "Office-Hour Scroller".',
            '  * Q1 = C (15.00–17.59) -> "Commuter Scroller".',
            '- subtipe_note: Jika Q5 ∈ {D, E}, tambahkan "Sering menunda waktu tidur (bedtime procrastination)". Atau berdasarkan pemicu Q3 (misal: "Scrolling sebelum beranjak dari kasur").',
            '- deskripsi_kecenderungan: 1-2 kalimat padat menjelaskan kebiasaan mereka berdasarkan emosi Q6 dan motif Q7 dalam gaya bahasa Q9.',
            '- afirmasi_jeda: Format jika-maka aksi positif nyata (bukan larangan), contoh: "Ketika jam 21.00 tangan mulai meraih HP di tempat tidur, letakkan HP di meja dan tarik napas dalam tiga kali."',
            '- waktu_tayang: Jam pengingat optimal sebelum jam rawan (misal "20.45" atau "21.00").',
            '',
            '=== FIELD JAWABAN ===',
            '- jawaban: 1 kalimat sambutan ramah YUDA dalam bahasa Indonesia.',
            '',
            'Data Kuesioner Pengguna:',
            json_encode($mappedData, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
        ]);
    }
}
