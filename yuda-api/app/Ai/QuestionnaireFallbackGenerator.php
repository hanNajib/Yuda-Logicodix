<?php

namespace App\Ai;

final class QuestionnaireFallbackGenerator
{
    /**
     * Hasilkan analisis 3 layar secara deterministik saat API AI sedang mengalami rate limit atau timeout.
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
     * @return array{
     *     layar_1_insight_waktu: array{headline: string, subteks: string},
     *     layar_2_alternatif_aktivitas: list<array{judul: string, deskripsi: string}>,
     *     layar_3_tipe_doomscrolling: array{nama_tipe: string, subtipe_note: string, deskripsi_kecenderungan: string, afirmasi_jeda: string, waktu_tayang: string},
     *     jawaban: string
     * }
     */
    public static function generate(array $answers): array
    {
        $q1 = $answers['q1'];
        $q2 = array_filter(
            $answers['q2'] ?? [],
            static fn (string $k): bool => $k !== QuestionnaireOptions::NO_OTHER_TIME_KEY && isset(QuestionnaireOptions::Q1_OPTIONS[$k]),
        );
        $q3 = $answers['q3'];
        $q4 = $answers['q4'];
        $q5 = $answers['q5'];
        $q6 = $answers['q6'];
        $q7 = $answers['q7'];
        $q8 = $answers['q8'];
        $q10 = $answers['q10'];

        // 1. Layar 1: Insight Waktu
        $hasExtraTime = count($q2) > 0;
        $headline = match ($q1) {
            'E' => $hasExtraTime ? 'Kamu Menghabiskan 6–8 Jam Dalam Sehari?' : 'Kamu Menghabiskan 4–5 Jam di Tengah Malam?',
            'D' => $hasExtraTime ? 'Kamu Menghabiskan 5–7 Jam Dalam Sehari?' : 'Kamu Menghabiskan 3–4 Jam Menjelang Tidur?',
            'B' => $hasExtraTime ? 'Kamu Menghabiskan 5–6 Jam Dalam Sehari?' : 'Kamu Menghabiskan 3–4 Jam di Jam Kerja?',
            default => $hasExtraTime ? 'Kamu Menghabiskan 4–6 Jam Dalam Sehari?' : 'Kamu Menghabiskan 2–4 Jam Dalam Sehari?',
        };

        $subteks = in_array('A', $q3, true) || in_array('B', $q3, true)
            ? 'Waw, itu waktu yang cukup banyak untuk dihabiskan dengan scrolling di kasur.'
            : 'Waw, itu waktu yang cukup banyak untuk dihabiskan dengan scrolling tanpa disadari.';

        // 2. Layar 2: Tepat 3 Kartu Aktivitas Positif
        $kartu1 = [
            'judul' => 'Membaca Buku',
            'deskripsi' => 'Dengan kecepatan baca sekitar 50–100 halaman per jam, kamu bisa menyelesaikan 2–3 buku berkualitas dalam sebulan.',
        ];

        $kartu2 = match (true) {
            in_array('B', $q8, true) => [
                'judul' => 'Eksplorasi Skill & Karier',
                'deskripsi' => 'Waktu tersebut cukup untuk mempelajari keahlian profesional baru, belajar bahasa asing, atau membaca materi industri.',
            ],
            in_array('C', $q8, true) => [
                'judul' => 'Waktu Berkualitas Bersama Orang Terdekat',
                'deskripsi' => 'Kamu bisa bercengkerama santai bersama orang-orang tercinta tanpa terganggu oleh distraksi layar ponsel.',
            ],
            in_array('D', $q8, true) => [
                'judul' => 'Eksplorasi Hobi Kreatif',
                'deskripsi' => 'Cukup waktu untuk mencoba memainkan alat musik, fotografi, menulis cerita, atau mencoba resep memasak baru.',
            ],
            default => [
                'judul' => 'Pemulihan Energi & Relaksasi',
                'deskripsi' => 'Waktu ekstra ini sangat ideal untuk memulihkan kebugaran tubuh dan meredakan kepenatan pikiranmu secara utuh.',
            ],
        };

        $kartu3 = match (true) {
            in_array('C', $q10, true) => [
                'judul' => 'Aktivitas Fisik & Jalan Santai',
                'deskripsi' => 'Dengan kecepatan berjalan santai 3–5 km/jam, secara matematis kamu bisa menempuh 15–20 Km dan menyegarkan peredaran darah.',
            ],
            in_array('A', $q10, true) => [
                'judul' => 'Latihan Napas & Mindful Pause',
                'deskripsi' => 'Latihan pernapasan ritmis selama beberapa menit terbukti menurunkan detak jantung serta meredakan hormon stres secara instan.',
            ],
            in_array('D', $q10, true) => [
                'judul' => 'Jurnal Refleksi Pikiran',
                'deskripsi' => 'Menuliskan pikiran di secarik kertas membantu menjernihkan fokus dan melepaskan beban emosi tanpa stimulasi cahaya layar.',
            ],
            default => [
                'judul' => 'Peregangan Tubuh Ringan',
                'deskripsi' => 'Gerakan peregangan otot leher dan pundak melepaskan ketegangan setelah berjam-jam menatap layar gawai.',
            ],
        };

        // 3. Layar 3: Tipe Doomscrolling
        $isNightOwlValid = in_array($q4, ['D', 'E'], true);
        $namaTipe = match ($q1) {
            'D' => $isNightOwlValid ? 'Night Owl' : 'Night Scroller',
            'E' => 'Midnight Wanderer',
            'A' => 'Early Bird Scroller',
            'B' => 'Office-Hour Scroller',
            'C' => 'Commuter Scroller',
            default => 'Mindful Scroller',
        };

        $subtipeNote = match (true) {
            in_array($q5, ['D', 'E'], true) => 'Sering menunda waktu tidur (bedtime procrastination)',
            in_array('A', $q3, true) => 'Scrolling setelah berbaring di tempat tidur',
            in_array('B', $q3, true) => 'Scrolling sebelum beranjak dari tempat tidur',
            in_array('D', $q3, true) => 'Scrolling sebagai pelarian saat menunda pekerjaan',
            default => 'Kecenderungan scrolling saat waktu senggang',
        };

        $emosi = in_array('A', $q6, true) ? 'lelah' : (in_array('B', $q6, true) ? 'bosan' : 'cemas');
        $deskripsiKecenderungan = "Kamu cenderung membuka media sosial saat merasa {$emosi} untuk mencari stimulus instan dan hiburan cepat.";

        $jamWaktu = match ($q1) {
            'A' => '06.00',
            'B' => '09.30',
            'C' => '16.00',
            'D' => '21.00',
            'E' => '00.30',
            default => '20.00',
        };

        $waktuTayang = match ($q1) {
            'A' => '05.30',
            'B' => '09.00',
            'C' => '15.30',
            'D' => '20.45',
            'E' => '23.45',
            default => '19.45',
        };

        $aksiPengganti = match (true) {
            in_array('A', $q10, true) => 'tarik napas dalam tiga kali dan rasakan ketenangan',
            in_array('B', $q10, true) => 'minum segelas air putih hangat dan letakkan ponsel di meja',
            in_array('C', $q10, true) => 'beranjak sejenak untuk jalan santai atau peregangan tubuh',
            in_array('D', $q10, true) => 'tulis satu hal yang kamu syukuri hari ini di buku catatan',
            default => 'letakkan ponsel menghadap ke bawah dan istirahatkan matamu sejenak',
        };

        $afirmasiJeda = "Ketika jam {$jamWaktu} tangan mulai meraih ponsel, {$aksiPengganti}.";

        return [
            'layar_1_insight_waktu' => [
                'headline' => $headline,
                'subteks' => $subteks,
            ],
            'layar_2_alternatif_aktivitas' => [
                $kartu1,
                $kartu2,
                $kartu3,
            ],
            'layar_3_tipe_doomscrolling' => [
                'nama_tipe' => $namaTipe,
                'subtipe_note' => $subtipeNote,
                'deskripsi_kecenderungan' => $deskripsiKecenderungan,
                'afirmasi_jeda' => $afirmasiJeda,
                'waktu_tayang' => $waktuTayang,
            ],
            'jawaban' => 'Halo! YUDA sudah menganalisis pola kuesionermu dan menyusun rekomendasi jeda terbaik untukmu.',
        ];
    }
}
