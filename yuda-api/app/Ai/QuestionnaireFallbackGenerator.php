<?php

namespace App\Ai;

final class QuestionnaireFallbackGenerator
{
    /**
     * Hasilkan analisis 3 layar secara deterministik saat API AI sedang mengalami rate limit atau timeout.
     *
     * @param  array<string, mixed>  $answers
     * @return array{
     *     layar_1_insight_waktu: array{headline: string, subteks: string},
     *     layar_2_alternatif_aktivitas: list<array{judul: string, deskripsi: string}>,
     *     layar_3_tipe_doomscrolling: array{nama_tipe: string, subtipe_note: string, deskripsi_kecenderungan: string, afirmasi_jeda: string, waktu_tayang: string},
     *     jawaban: string
     * }
     */
    public static function generate(array $answers): array
    {
        $q1 = (string) ($answers['q1'] ?? 'D');
        $q2 = array_filter(
            (array) ($answers['q2'] ?? []),
            static fn (mixed $k): bool => is_string($k) && $k !== QuestionnaireDefinition::EXCLUSIVE_NO_OTHER_TIME,
        );
        $q3 = (array) ($answers['q3'] ?? []);
        $q4 = (string) ($answers['q4'] ?? 'C');
        $q5 = (string) ($answers['q5'] ?? 'C');
        $q6 = (array) ($answers['q6'] ?? []);
        $q7 = (array) ($answers['q7'] ?? []);
        $q8 = (string) ($answers['q8'] ?? 'A');
        $q9 = (array) ($answers['q9'] ?? []);

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

        // Kartu 2 menyesuaikan Nilai Inti (Q7)
        $kartu2 = match (true) {
            in_array('A', $q7, true) => [
                'judul' => 'Quality Time Keluarga',
                'deskripsi' => 'Waktu ini bisa dipakai untuk mengobrol hangat atau makan bersama orang terdekat tanpa distraksi layar.',
            ],
            in_array('B', $q7, true) => [
                'judul' => 'Upgrade Keterampilan Baru',
                'deskripsi' => 'Dalam sebulan, kamu bisa menguasai 1 modul kursus online atau skill baru yang relevan dengan masa depanmu.',
            ],
            in_array('C', $q7, true) => [
                'judul' => 'Istirahat & Pemulihan Diri',
                'deskripsi' => 'Menambah jam tidur berkualitas terbukti memulihkan fokus mental dan imunitas fisik tubuhmu secara optimal.',
            ],
            in_array('D', $q7, true) => [
                'judul' => 'Refleksi & Ibadah Tenang',
                'deskripsi' => 'Menghadirkan ketenangan batin lewat doa, tadarus, atau perenungan tanpa kebisingan notifikasi.',
            ],
            in_array('E', $q7, true) => [
                'judul' => 'Menyalurkan Kreativitas',
                'deskripsi' => 'Kamu bisa membuat karya tulisan, sketsa, memainkan instrumen musik, atau hobi yang selama ini tertunda.',
            ],
            in_array('F', $q7, true) => [
                'judul' => 'Perencanaan Finansial',
                'deskripsi' => 'Waktu luang bisa dipakai mencatat arus kas bulanan atau mempelajari strategi investasi yang bijak.',
            ],
            default => [
                'judul' => 'Bercengkerama dengan Sahabat',
                'deskripsi' => 'Terhubung langsung dengan sahabat atau komunitas untuk saling bertukar cerita positif.',
            ],
        };

        // Kartu 3 menyesuaikan Respons Pengganti (Q9)
        $kartu3 = match (true) {
            in_array('A', $q9, true) => [
                'judul' => 'Jalan Santai & Peregangan',
                'deskripsi' => 'Jalan kaki ringan 30 menit membakar kalori, merilekskan otot kaku, dan menyegarkan sirkulasi darah.',
            ],
            in_array('B', $q9, true) => [
                'judul' => 'Ngobrol Santai',
                'deskripsi' => 'Menelepon atau mengobrol sejenak dengan teman untuk mengalihkan pikiran dari dorongan scrolling.',
            ],
            in_array('C', $q9, true) => [
                'judul' => 'Latihan Pernapasan',
                'deskripsi' => 'Latihan pernapasan 4-7-8 selama 5 menit langsung menurunkan hormon stres dan menenangkan denyut nadi.',
            ],
            in_array('D', $q9, true) => [
                'judul' => 'Merapikan Meja atau Kamar',
                'deskripsi' => 'Melakukan pekerjaan fisik kecil memberikan kepuasan instan dan membuat lingkungan sekitarmu nyaman.',
            ],
            in_array('F', $q9, true) => [
                'judul' => 'Mendengarkan Musik Relaksasi',
                'deskripsi' => 'Mendengarkan lagu akustik atau podcast inspiratif membantu transisi santai menuju waktu istirahat.',
            ],
            default => [
                'judul' => 'Simpan HP di Meja',
                'deskripsi' => 'Menaruh HP di luar jangkauan tangan memberi jeda alami bagi otak untuk kembali rileks.',
            ],
        };

        // 3. Layar 3: Tipe Doomscrolling & Afirmasi
        $isNightOwlValid = in_array($q4, ['D', 'E'], true);

        $namaTipe = match ($q1) {
            'D' => $isNightOwlValid ? 'Night Owl' : 'Night Scroller',
            'E' => 'Midnight Wanderer',
            'A' => 'Early Bird Scroller',
            'B' => 'Office-Hour Scroller',
            'C' => 'Commuter Scroller',
            default => 'Night Scroller',
        };

        $isBedtimeProcrastinating = in_array($q5, ['D', 'E'], true);
        $subtipeNote = match (true) {
            $isBedtimeProcrastinating => 'Sering menunda waktu tidur (bedtime procrastination).',
            in_array('B', $q3, true) => 'Kecenderungan scrolling sebelum beranjak dari tempat tidur.',
            in_array('A', $q3, true) => 'Kecenderungan scrolling saat berbaring sebelum tidur.',
            in_array('D', $q3, true) => 'Kecenderungan scrolling sebagai pelarian dari tugas.',
            default => 'Kecenderungan scrolling sebagai pengisi waktu jeda aktivitas.',
        };

        $namaEmosi = in_array('B', $q6, true) ? 'lelah' : (in_array('A', $q6, true) ? 'bosan' : 'penat');
        $namaNilai = in_array('A', $q7, true) ? 'keluarga' : (in_array('C', $q7, true) ? 'kesehatanmu' : 'masa depanmu');

        $deskripsiKecenderungan = "Saat merasa {$namaEmosi}, scrolling sering jadi pelarian instan. Mengingat kembali pentingnya {$namaNilai} akan membantumu kembali memegang kendali waktu.";

        $afirmasiJeda = match ($q1) {
            'D' => 'Saat jam 21.00 tangan mulai meraih HP di tempat tidur, letakkan HP di meja dan tarik napas panjang tiga kali.',
            'E' => 'Saat tengah malam dorongan scrolling muncul, minum segelas air putih dan pejamkan mata untuk istirahat.',
            'A' => 'Ketika baru bangun pagi dan ingin scrolling, langsung duduk tegak dan regangkan tubuh sebelum menyentuh HP.',
            'B' => 'Saat jam kerja ingin scrolling tanpa tujuan, selesaikan 1 tugas kecil selama 5 menit terlebih dahulu.',
            default => 'Saat jeda perjalanan atau pulang, letakkan HP di dalam tas dan nikmati pemandangan sejenak.',
        };

        $waktuTayang = match ($q1) {
            'D' => '20.45',
            'E' => '23.30',
            'A' => '05.30',
            'B' => '09.15',
            default => '15.30',
        };

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
            'jawaban' => 'Halo! Analisis kebiasaan scrolling kamu sudah siap. Mari pelajari polanya bersama YUDA.',
        ];
    }
}
