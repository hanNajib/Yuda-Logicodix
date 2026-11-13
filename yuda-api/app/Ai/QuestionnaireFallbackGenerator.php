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
        $q8 = (array) ($answers['q8'] ?? []);
        $q9 = (string) ($answers['q9'] ?? 'A');
        $q10 = (array) ($answers['q10'] ?? []);

        // 1. Layar 1: Insight Waktu (Full 24 Jam)
        $hasExtraTime = count($q2) > 0;
        $headline = match ($q1) {
            'E' => $hasExtraTime ? 'Kamu Menghabiskan 6–8 Jam Dalam Sehari?' : 'Kamu Menghabiskan 4–5 Jam di Tengah Malam?',
            'D' => $hasExtraTime ? 'Kamu Menghabiskan 5–7 Jam Dalam Sehari?' : 'Kamu Menghabiskan 3–4 Jam di Malam Hari?',
            'C' => $hasExtraTime ? 'Kamu Menghabiskan 4–6 Jam Dalam Sehari?' : 'Kamu Menghabiskan 2–3 Jam di Perjalanan Sore?',
            'B' => $hasExtraTime ? 'Kamu Menghabiskan 5–6 Jam Dalam Sehari?' : 'Kamu Menghabiskan 3–4 Jam di Jam Produktif?',
            default => $hasExtraTime ? 'Kamu Menghabiskan 4–6 Jam Dalam Sehari?' : 'Kamu Menghabiskan 2–3 Jam di Pagi Hari?',
        };

        $subteks = in_array('A', $q3, true) || in_array('B', $q3, true)
            ? 'Waw, itu waktu yang cukup banyak untuk dihabiskan dengan scrolling di kasur.'
            : 'Waw, itu waktu yang cukup banyak untuk dihabiskan dengan scrolling tanpa disadari.';

        // 2. Layar 2: Tepat 3 Kartu Aktivitas Positif (5 Kategori Baku: membaca, sosial, olahraga, produktif, mindfulness)
        $kartu1 = [
            'kategori' => 'membaca',
            'judul' => 'Membaca Buku',
            'deskripsi' => 'Dengan kecepatan baca 50–100 halaman per jam, kamu bisa menyelesaikan 2–3 buku berkualitas dalam sebulan.',
        ];

        // Kartu 2 menyesuaikan Nilai Inti (Q8 baru: 5 opsi)
        $kartu2 = match (true) {
            in_array('A', $q8, true) => [
                'kategori' => 'sosial',
                'judul' => 'Quality Time Keluarga & Sahabat',
                'deskripsi' => 'Waktu ini bisa dipakai untuk mengobrol hangat atau berkumpul bersama orang terdekat tanpa distraksi layar.',
            ],
            in_array('B', $q8, true) => [
                'kategori' => 'produktif',
                'judul' => 'Upgrade Karier & Finansial',
                'deskripsi' => 'Dalam sebulan, kamu bisa mempelajari skill baru, merapikan portofolio, atau menata arus kas masa depan.',
            ],
            in_array('C', $q8, true) => [
                'kategori' => 'olahraga',
                'judul' => 'Pemulihan Fisik & Mental',
                'deskripsi' => 'Tidur cukup dan relaksasi pikiran terbukti memulihkan fokus mental serta ketahanan tubuhmu secara optimal.',
            ],
            in_array('D', $q8, true) => [
                'kategori' => 'mindfulness',
                'judul' => 'Ibadah & Refleksi Tenang',
                'deskripsi' => 'Menghadirkan ketenangan batin lewat doa, tadarus, atau perenungan tanpa kebisingan notifikasi.',
            ],
            in_array('E', $q8, true) => [
                'kategori' => 'produktif',
                'judul' => 'Menyalurkan Hobi Kreatif',
                'deskripsi' => 'Kamu bisa membuat karya tulisan, sketsa, memainkan instrumen musik, atau hobi yang selama ini tertunda.',
            ],
            default => [
                'kategori' => 'produktif',
                'judul' => 'Waktu Bermakna Tanpa Layar',
                'deskripsi' => 'Melakukan aktivitas nyata yang mendekatkanmu pada hal-hal terpenting dalam hidup.',
            ],
        };

        // Kartu 3 menyesuaikan Respons Pengganti (Q10)
        $kartu3 = match (true) {
            in_array('A', $q10, true) => [
                'kategori' => 'olahraga',
                'judul' => 'Jalan Santai & Peregangan',
                'deskripsi' => 'Jalan kaki ringan 30 menit membakar kalori, merilekskan otot kaku, dan menyegarkan sirkulasi darah.',
            ],
            in_array('B', $q10, true) => [
                'kategori' => 'sosial',
                'judul' => 'Ngobrol Santai',
                'deskripsi' => 'Menelepon atau mengobrol sejenak dengan seseorang untuk mengalihkan pikiran dari dorongan scrolling.',
            ],
            in_array('C', $q10, true) => [
                'kategori' => 'mindfulness',
                'judul' => 'Latihan Pernapasan',
                'deskripsi' => 'Latihan pernapasan 4-7-8 selama 5 menit langsung menurunkan hormon stres dan menenangkan denyut nadi.',
            ],
            in_array('D', $q10, true) => [
                'kategori' => 'produktif',
                'judul' => 'Merapikan Meja atau Kamar',
                'deskripsi' => 'Melakukan pekerjaan fisik kecil memberikan kepuasan instan dan membuat lingkungan sekitarmu nyaman.',
            ],
            in_array('F', $q10, true) => [
                'kategori' => 'mindfulness',
                'judul' => 'Mendengarkan Musik Relaksasi',
                'deskripsi' => 'Mendengarkan musik akustik atau podcast inspiratif membantu transisi santai menuju waktu istirahat.',
            ],
            default => [
                'kategori' => 'mindfulness',
                'judul' => 'Simpan HP di Meja',
                'deskripsi' => 'Menaruh HP di luar jangkauan tangan memberi jeda alami bagi otak untuk kembali rileks.',
            ],
        };

        // 3. Layar 3: Tipe Utama 1:1 dari Q1 (§3.2a)
        $namaTipe = match ($q1) {
            'A' => 'Early Bird Scroller',
            'B' => 'Office-Hour Scroller',
            'C' => 'Afternoon Scroller',
            'D' => 'Prime-Time Scroller',
            'E' => 'Midnight Scroller',
            default => 'Prime-Time Scroller',
        };

        // Penentuan Label Sekunder (§3.2b)
        $secondaryLabels = [];
        if ($q1 === 'E' && in_array($q4, ['D', 'E'], true)) {
            $secondaryLabels[] = 'Night Owl Scroller';
        } elseif ($q1 === 'E' && in_array($q4, ['A', 'B'], true)) {
            $secondaryLabels[] = 'Nighttime Mismatch';
        }

        if (in_array($q1, ['D', 'E'], true) && in_array('A', $q3, true)) {
            $secondaryLabels[] = 'Bedtime Scroller';
        }
        if ($q1 === 'A' && in_array('B', $q3, true)) {
            $secondaryLabels[] = 'Morning Habit';
        }
        if ($q1 === 'B' && in_array('D', $q3, true)) {
            $secondaryLabels[] = 'Procrastination Scroller';
        }
        if (in_array($q1, ['B', 'C'], true) && in_array('C', $q3, true)) {
            $secondaryLabels[] = 'Break-Time Scroller';
        }
        if ($q1 === 'D' && in_array('E', $q3, true)) {
            $secondaryLabels[] = 'Solitary Scroller';
        }

        $isBedtimeProcrastinating = in_array($q5, ['D', 'E'], true);
        if ($isBedtimeProcrastinating) {
            $secondaryLabels[] = 'Sering menunda waktu tidur (bedtime procrastination)';
        }

        $subtipeNote = count($secondaryLabels) > 0
            ? implode(' · ', $secondaryLabels)
            : 'Kecenderungan scrolling saat jeda rutinitas harian.';

        $namaEmosi = in_array('B', $q6, true) ? 'lelah' : (in_array('A', $q6, true) ? 'bosan' : 'penat');
        $namaMotif = in_array('B', $q7, true) ? 'takut tertinggal tren (FOMO)' : (in_array('A', $q7, true) ? 'dorongan mencari info terkini' : 'rekomendasi beranda medsos');
        $namaNilai = in_array('A', $q8, true) ? 'orang-orang terdekatmu' : (in_array('C', $q8, true) ? 'kesehatan fisik dan mentalmu' : 'masa depanmu');

        $deskripsiKecenderungan = "Saat merasa {$namaEmosi}, {$namaMotif} sering membuat tangan terus menggulir layar. Mengingat kembali pentingnya {$namaNilai} akan membantumu kembali memegang kendali waktu.";

        $afirmasiJeda = match ($q1) {
            'E' => 'Saat tengah malam dorongan scrolling muncul di tempat tidur, simpan HP di meja dan tarik napas dalam tiga kali.',
            'D' => 'Saat malam hari tangan mulai meraih HP menjelang istirahat, letakkan HP di meja dan regangkan otot bahu sejenak.',
            'C' => 'Saat perjalanan pulang atau sore hari, simpan HP di tas dan nikmati suasana sekitarmu.',
            'B' => 'Saat jeda kuliah atau kerja dorongan scrolling muncul, minum segelas air dan selesaikan 1 hal kecil terlebih dahulu.',
            default => 'Saat bangun pagi dan ingin membuka HP, duduk tegak di kasur dan hirup udara segar sebelum menyentuh layar.',
        };

        $waktuTayang = match ($q1) {
            'E' => '23.00',
            'D' => '20.45',
            'C' => '15.30',
            'B' => '09.30',
            default => '05.30',
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
