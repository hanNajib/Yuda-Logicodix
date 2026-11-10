<?php

namespace App\Ai\Prompts;

use App\Ai\QuestionnaireDefinition;

final class QuestionnairePrompt
{
    /**
     * Susun prompt analisis kuesioner onboarding YUDA (Q1–Q9) sesuai flow UI mobile 3 layar dan spesifikasi agent.
     *
     * @param  array<string, mixed>  $answers
     */
    public static function build(array $answers): string
    {
        $q1 = (string) ($answers['q1'] ?? 'D');
        $q2 = array_filter(
            (array) ($answers['q2'] ?? []),
            static fn (mixed $key): bool => is_string($key) && $key !== QuestionnaireDefinition::EXCLUSIVE_NO_OTHER_TIME,
        );
        $q3 = (array) ($answers['q3'] ?? []);
        $q4 = (string) ($answers['q4'] ?? 'C');
        $q5 = (string) ($answers['q5'] ?? 'C');
        $q6 = (array) ($answers['q6'] ?? []);
        $q7 = (array) ($answers['q7'] ?? []);
        $q8 = (string) ($answers['q8'] ?? 'A');
        $q9 = (array) ($answers['q9'] ?? []);

        $mappedData = [
            'q1_jam_rawan_utama' => QuestionnaireDefinition::getOptionLabel('q1', $q1),
            'q2_jam_rawan_tambahan' => array_values(array_map(
                static fn (string $key): string => QuestionnaireDefinition::getOptionLabel('q2', $key),
                $q2,
            )),
            'q3_situasi_pemicu' => array_values(array_map(
                static fn (string $key): string => QuestionnaireDefinition::getOptionLabel('q3', $key),
                $q3,
            )),
            'q4_kronotipe' => QuestionnaireDefinition::getOptionLabel('q4', $q4),
            'q5_frekuensi_tunda_tidur' => QuestionnaireDefinition::getOptionLabel('q5', $q5),
            'q6_emosi_pemicu' => array_values(array_map(
                static fn (string $key): string => QuestionnaireDefinition::getOptionLabel('q6', $key),
                $q6,
            )),
            'q7_nilai_inti' => array_values(array_map(
                static fn (string $key): string => QuestionnaireDefinition::getOptionLabel('q7', $key),
                $q7,
            )),
            'q8_gaya_pesan_nada' => QuestionnaireDefinition::getOptionLabel('q8', $q8),
            'q9_respons_pengganti' => array_values(array_map(
                static fn (string $key): string => QuestionnaireDefinition::getOptionLabel('q9', $key),
                $q9,
            )),
        ];

        return implode("\n", [
            'Kamu adalah asisten analisis kuesioner YUDA. Analisis jawaban kuesioner onboarding pengguna (Q1–Q9) berikut untuk mengisi data JSON bagi 3 Layar Tampilan Onboarding Mobile:',
            '',
            '=== ATURAN LAYAR 1 (Insight & Kesadaran Waktu) ===',
            '- headline: Kalimat tanya menarik tentang estimasi waktu yang dihabiskan pengguna (misal: "Kamu Menghabiskan 4-6 Jam Dalam Sehari?" atau sesuai rentang jam rawan Q1 & Q2).',
            '- subteks: 1 kalimat empatik yang menyadarkan tanpa menghakimi (misal: "Waw, itu waktu yang cukup banyak untuk dihabiskan dengan scrolling sebelum tidur.").',
            '',
            '=== ATURAN LAYAR 2 (Alternatif Aktivitas Positif) ===',
            '- Hasilkan tepat 3 kartu aktivitas dalam array "layar_2_alternatif_aktivitas".',
            '- Kartu 1 (Literasi/Wawasan): Judul singkat (misal "Membaca Buku") dengan kalkulasi realistis (kecepatan 50-100 halaman/jam, bisa tamatkan berapa buku).',
            '- Kartu 2 (Hobi/Kreativitas): Selaras dengan nilai inti Q7 dan minat pengguna (misal berkarya, olahraga, waktu keluarga).',
            '- Kartu 3 (Fisik/Relaksasi): Selaras dengan respons pengganti Q9 (misal jalan kaki santai, peregangan tubuh, atau latihan pernapasan).',
            '- Setiap kartu memuat field "judul" (singkat) dan "deskripsi" (1-2 kalimat dengan angka/kalkulasi realistis).',
            '',
            '=== ATURAN LAYAR 3 (Kenali Tipe Scrolling & Afirmasi) ===',
            '- nama_tipe: Tentukan berdasarkan Q1 & Q4:',
            '  * Q1 = D (21.00–23.59): Jika Q4 ∈ {D, E} beri nama "Night Owl". Jika Q4 ∈ {A, B, C} beri nama "Night Scroller". JANGAN beri label Night Owl jika Q4 bukan tipe malam!',
            '  * Q1 = E (00.00–04.59) -> "Midnight Wanderer".',
            '  * Q1 = A (05.00–08.59) -> "Early Bird Scroller".',
            '  * Q1 = B (09.00–11.59) -> "Office-Hour Scroller".',
            '  * Q1 = C (15.00–17.59) -> "Commuter Scroller".',
            '- subtipe_note: Jika Q5 ∈ {D, E}, tambahkan penanda "Sering menunda waktu tidur (bedtime procrastination)". Atau berdasarkan pemicu Q3 (misal: "Scrolling sebelum beranjak dari kasur").',
            '- deskripsi_kecenderungan: 1-2 kalimat padat menjelaskan kecenderungan mereka berdasarkan emosi Q6 dan nilai hidup Q7 dengan gaya bahasa Q8.',
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
