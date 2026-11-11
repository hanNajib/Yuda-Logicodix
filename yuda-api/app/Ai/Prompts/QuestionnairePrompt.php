<?php

namespace App\Ai\Prompts;

use App\Ai\QuestionnaireDefinition;

final class QuestionnairePrompt
{
    /**
     * Susun prompt analisis kuesioner onboarding YUDA (Q1–Q10) sesuai flow UI mobile 3 layar dan spesifikasi agent.
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
        $q8 = (array) ($answers['q8'] ?? []);
        $q9 = (string) ($answers['q9'] ?? 'A');
        $q10 = (array) ($answers['q10'] ?? []);

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
            'q7_motif_scrolling' => array_values(array_map(
                static fn (string $key): string => QuestionnaireDefinition::getOptionLabel('q7', $key),
                $q7,
            )),
            'q8_nilai_inti' => array_values(array_map(
                static fn (string $key): string => QuestionnaireDefinition::getOptionLabel('q8', $key),
                $q8,
            )),
            'q9_gaya_pesan_nada' => QuestionnaireDefinition::getOptionLabel('q9', $q9),
            'q10_respons_pengganti' => array_values(array_map(
                static fn (string $key): string => QuestionnaireDefinition::getOptionLabel('q10', $key),
                $q10,
            )),
        ];

        return implode("\n", [
            'Kamu adalah asisten analisis kuesioner YUDA. Analisis jawaban kuesioner onboarding pengguna (Q1–Q10) berikut untuk mengisi data JSON bagi 3 Layar Tampilan Onboarding Mobile:',
            '',
            '=== ATURAN LAYAR 1 (Insight & Kesadaran Waktu) ===',
            '- headline: Kalimat tanya menarik tentang estimasi waktu yang dihabiskan pengguna (misal: "Kamu Menghabiskan 4-6 Jam Dalam Sehari?" atau sesuai rentang jam rawan Q1 & Q2).',
            '- subteks: 1 kalimat empatik yang menyadarkan tanpa menghakimi (misal: "Waw, itu waktu yang cukup banyak untuk dihabiskan dengan scrolling sebelum tidur.").',
            '',
            '=== ATURAN LAYAR 2 (Alternatif Aktivitas Positif) ===',
            '- Hasilkan tepat 3 kartu aktivitas dalam array "layar_2_alternatif_aktivitas".',
            '- Kartu 1 (Literasi/Wawasan): Judul singkat (misal "Membaca Buku") dengan kalkulasi realistis (kecepatan 50-100 halaman/jam, bisa tamatkan berapa buku).',
            '- Kartu 2 (Nilai Hidup & Hobi): Selaras dengan nilai inti Q8 dan minat pengguna (misal keluarga/pertemanan, karier, kesehatan fisik-mental, iman, atau hobi).',
            '- Kartu 3 (Fisik/Relaksasi): Selaras dengan respons pengganti Q10 (misal jalan kaki santai, peregangan tubuh, atau latihan pernapasan).',
            '- Setiap kartu memuat field "judul" (singkat) dan "deskripsi" (1-2 kalimat dengan angka/kalkulasi realistis).',
            '',
            '=== ATURAN LAYAR 3 (Kenali Tipe Scrolling & Afirmasi) ===',
            '- nama_tipe: Tentukan Tipe Utama secara 1:1 persis dari Q1:',
            '  * Q1 = A (05.00–08.59) -> "Early Bird Scroller"',
            '  * Q1 = B (09.00–13.59) -> "Office-Hour Scroller"',
            '  * Q1 = C (14.00–17.59) -> "Afternoon Scroller"',
            '  * Q1 = D (18.00–22.59) -> "Prime-Time Scroller"',
            '  * Q1 = E (23.00–04.59) -> "Midnight Scroller"',
            '- subtipe_note: Sebutkan label sekunder / catatan spesifik berdasarkan kombinasi Q1+Q3 atau Q1+Q4:',
            '  * Q1=E + Q4 ∈ {D, E} -> "Night Owl Scroller (scrolling larut malam selaras kecenderungan malam)"',
            '  * Q1=E + Q4 ∈ {A, B} -> "Nighttime Mismatch (scrolling larut malam meski energi puncak pagi)"',
            '  * Q1 ∈ {D, E} + Q3=A -> "Bedtime Scroller (kebiasaan scrolling di tempat tidur)"',
            '  * Q1=A + Q3=B -> "Morning Habit (kebiasaan scrolling pertama setelah bangun)"',
            '  * Q1=B + Q3=D -> "Procrastination Scroller (scrolling sebagai bentuk penundaan tugas)"',
            '  * Q1 ∈ {B, C} + Q3=C -> "Break-Time Scroller (pengisi waktu jeda/istirahat)"',
            '  * Q1=D + Q3=E -> "Solitary Scroller (scrolling saat sendirian)"',
            '  * Jika Q5 ∈ {D, E}, sertakan juga "Sering menunda waktu tidur (bedtime procrastination)".',
            '- deskripsi_kecenderungan: 1-2 kalimat padat menjelaskan kecenderungan mereka berdasarkan emosi Q6 dan motif Q7 dengan gaya bahasa/nada Q9.',
            '- afirmasi_jeda: Format 4 bagian wajib (Pengakuan perasaan f(Q6, Q7) + Jangkar nilai f(Q8) + Jika–Maka f(Q1, Q3, Q10)). Ditulis sebagai AKSI POSITIF NYATA (bukan larangan negatif "jangan buka HP").',
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
