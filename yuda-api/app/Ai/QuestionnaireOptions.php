<?php

namespace App\Ai;

final class QuestionnaireOptions
{
    public const NO_OTHER_TIME_KEY = QuestionnaireDefinition::EXCLUSIVE_NO_OTHER_TIME;

    /**
     * Q1: Jam paling sering scrolling (single) - Full 24 Jam
     */
    public const Q1_OPTIONS = [
        'A' => '05.00–08.59 (pagi: baru bangun/bersiap berangkat)',
        'B' => '09.00–13.59 (pagi-siang: jam kuliah/kerja)',
        'C' => '14.00–17.59 (sore: pulang/di perjalanan)',
        'D' => '18.00–22.59 (malam: hingga menjelang tidur)',
        'E' => '23.00–04.59 (tengah malam/dinihari: sudah lewat tengah malam)',
    ];

    /**
     * Q2: Jam rawan lain (multi, maks 2; boleh kosong atau "tidak_ada")
     */
    public const Q2_OPTIONS = [
        ...self::Q1_OPTIONS,
        self::NO_OTHER_TIME_KEY => 'Tidak ada waktu lain',
    ];

    /**
     * Q3: Situasi pemicu (multi, maks 3)
     */
    public const Q3_OPTIONS = [
        'A' => 'Di tempat tidur (sebelum/saat sulit tidur)',
        'B' => 'Baru bangun (sebelum beranjak kasur)',
        'C' => 'Jeda aktivitas (istirahat kerja/kuliah, menunggu)',
        'D' => 'Menunda tugas',
        'E' => 'Sendirian di rumah/kamar',
    ];

    /**
     * Q4: Kronotipe swalaporan (single)
     */
    public const Q4_OPTIONS = [
        'A' => 'Sangat pagi (≈05.00–08.59)',
        'B' => 'Pagi hingga menjelang siang (≈09.00–13.59)',
        'C' => 'Sore hingga awal malam (≈14.00–19.00)',
        'D' => 'Malam hingga larut malam (≈19.00–00.00)',
        'E' => 'Tidak ada waktu tertentu — energi relatif merata sepanjang hari',
    ];

    /**
     * Q5: Frekuensi tidur lebih larut karena scrolling (single)
     */
    public const Q5_OPTIONS = [
        'A' => 'Tidak pernah',
        'B' => 'Jarang (1–3 malam/bulan)',
        'C' => 'Kadang (1–2 malam/minggu)',
        'D' => 'Sering (3–5 malam/minggu)',
        'E' => 'Hampir tiap malam',
    ];

    /**
     * Q6: Perasaan sebelum/saat scrolling (multi, maks 2)
     */
    public const Q6_OPTIONS = [
        'A' => 'Bosan',
        'B' => 'Lelah',
        'C' => 'Kesepian',
        'D' => 'Stres/tertekan',
        'E' => 'Tidak merasakan apa-apa (otomatis)',
    ];

    /**
     * Q7: Alasan utama terus menggulir konten di medsos (multi, maks 2)
     */
    public const Q7_OPTIONS = [
        'A' => 'Ingin selalu mengikuti informasi/berita terbaru',
        'B' => 'Takut tertinggal tren atau info yang sedang ramai dibicarakan',
        'C' => 'Tertarik pada konten mengejutkan, kontroversial, atau mengundang penasaran',
        'D' => 'Terus menemukan konten menarik lewat FYP/rekomendasi medsos',
        'E' => 'Tertarik baca komentar atau ikut berinteraksi dalam diskusi',
    ];

    /**
     * Q8: Hal terpenting dalam hidup saat ini / Nilai Inti (multi, maks 2)
     */
    public const Q8_OPTIONS = [
        'A' => 'Keluarga dan pertemanan',
        'B' => 'Karier dan kebebasan finansial',
        'C' => 'Kesehatan fisik dan mental',
        'D' => 'Iman dan spiritualitas',
        'E' => 'Kreativitas dan hobi',
    ];

    /**
     * Q9: Gaya pesan yang paling ampuh berhenti scrolling (single)
     */
    public const Q9_OPTIONS = [
        'A' => 'Lembut & menenangkan',
        'B' => 'Tegas & memotivasi',
        'C' => 'Ringan & humoris',
        'D' => 'Faktual & rasional',
        'E' => 'Reflektif (mengajak berpikir)',
    ];

    /**
     * Q10: Pengganti saat dorongan scrolling muncul (multi, maks 2)
     */
    public const Q10_OPTIONS = [
        'A' => 'Bergerak (jalan/peregangan/minum)',
        'B' => 'Mengobrol dgn seseorang',
        'C' => 'Menenangkan diri (napas/doa/meditasi)',
        'D' => 'Kerjakan hal kecil',
        'E' => 'Jauhkan HP',
        'F' => 'Dengarkan musik/podcast',
        'G' => 'Belum tahu (minta saran)',
    ];

    /**
     * Alias konstan untuk backwards compatibility
     */
    public const RISK_TIMES = self::Q1_OPTIONS;

    public const TRIGGER_CONTEXTS = self::Q3_OPTIONS;

    public const CHRONOTYPES = self::Q4_OPTIONS;
}
