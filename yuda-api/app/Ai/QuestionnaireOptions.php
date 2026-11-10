<?php

namespace App\Ai;

final class QuestionnaireOptions
{
    public const NO_OTHER_TIME_KEY = QuestionnaireDefinition::EXCLUSIVE_NO_OTHER_TIME;

    /**
     * Q1: Jam paling sering scrolling (single)
     */
    public const Q1_OPTIONS = [
        'A' => '05.00–08.59 (pagi, baru bangun/bersiap)',
        'B' => '09.00–11.59 (jam kuliah/kerja)',
        'C' => '15.00–17.59 (pulang/perjalanan)',
        'D' => '21.00–23.59 (menjelang tidur)',
        'E' => '00.00–04.59 (dinihari)',
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
        'A' => 'Jelas tipe pagi',
        'B' => 'Lebih ke pagi',
        'C' => 'Netral',
        'D' => 'Lebih ke malam',
        'E' => 'Jelas tipe malam',
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
     * Q7: Hal terpenting dalam hidup saat ini / Nilai Inti (multi, maks 2)
     */
    public const Q7_OPTIONS = [
        'A' => 'Keluarga/orang terdekat',
        'B' => 'Belajar/karier',
        'C' => 'Kesehatan fisik-mental',
        'D' => 'Iman/spiritualitas',
        'E' => 'Kreativitas/hobi',
        'F' => 'Kebebasan finansial',
        'G' => 'Pertemanan/komunitas',
    ];

    /**
     * Q8: Gaya pesan yang paling ampuh berhenti scrolling (single)
     */
    public const Q8_OPTIONS = [
        'A' => 'Lembut & menenangkan',
        'B' => 'Tegas & memotivasi',
        'C' => 'Ringan & humoris',
        'D' => 'Faktual & rasional',
        'E' => 'Reflektif (mengajak berpikir)',
    ];

    /**
     * Q9: Pengganti saat dorongan scrolling muncul (multi, maks 2)
     */
    public const Q9_OPTIONS = [
        'A' => 'Bergerak (jalan/peregangan/minum)',
        'B' => 'Mengobrol dgn seseorang',
        'C' => 'Menangkan diri (napas/doa/meditasi)',
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

    public const Q10_OPTIONS = self::Q9_OPTIONS;
}
