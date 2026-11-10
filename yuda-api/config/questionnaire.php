<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Teks Pengantar Kuesioner (Verbatim dari Spesifikasi §1)
    |--------------------------------------------------------------------------
    */
    'intro' => "Jawablah sesuai kebiasaanmu dalam 1 bulan terakhir. Tidak ada jawaban benar atau salah; jawabanmu hanya dipakai untuk mengatur waktu pengingat dan isi pesan di YUDA. \"Konten negatif\" berarti berita atau video tentang bencana, kriminal, konflik, krisis, atau hal menyedihkan lainnya.",

    /*
    |--------------------------------------------------------------------------
    | Definisi Pertanyaan Onboarding (Q1 s/d Q10 Aktif - Update 2)
    |--------------------------------------------------------------------------
    | Setiap butir pertanyaan memiliki semantic role agar perubahan teks/redaksi
    | tidak mempengaruhi logika AI engine dan Fallback generator.
    */
    'questions' => [
        'q1' => [
            'role' => 'jam_rawan_utama',
            'title' => 'Jam paling sering scrolling',
            'type' => 'single',
            'required' => true,
            'min_choices' => 1,
            'max_choices' => 1,
            'options' => [
                'A' => [
                    'label' => '05.00–08.59 (pagi: baru bangun/bersiap berangkat)',
                    'time_range' => '05.00–08.59',
                ],
                'B' => [
                    'label' => '09.00–13.59 (pagi-siang: jam kuliah/kerja)',
                    'time_range' => '09.00–13.59',
                ],
                'C' => [
                    'label' => '14.00–17.59 (sore: pulang/di perjalanan)',
                    'time_range' => '14.00–17.59',
                ],
                'D' => [
                    'label' => '18.00–22.59 (malam: hingga menjelang tidur)',
                    'time_range' => '18.00–22.59',
                ],
                'E' => [
                    'label' => '23.00–04.59 (tengah malam/dinihari: sudah lewat tengah malam)',
                    'time_range' => '23.00–04.59',
                ],
            ],
        ],

        'q2' => [
            'role' => 'jam_rawan_tambahan',
            'title' => 'Jam rawan lain',
            'type' => 'multi',
            'required' => false,
            'min_choices' => 0,
            'max_choices' => 2,
            'exclusive_option' => 'tidak_ada',
            'options' => [
                'A' => [
                    'label' => '05.00–08.59 (pagi: baru bangun/bersiap berangkat)',
                    'time_range' => '05.00–08.59',
                ],
                'B' => [
                    'label' => '09.00–13.59 (pagi-siang: jam kuliah/kerja)',
                    'time_range' => '09.00–13.59',
                ],
                'C' => [
                    'label' => '14.00–17.59 (sore: pulang/di perjalanan)',
                    'time_range' => '14.00–17.59',
                ],
                'D' => [
                    'label' => '18.00–22.59 (malam: hingga menjelang tidur)',
                    'time_range' => '18.00–22.59',
                ],
                'E' => [
                    'label' => '23.00–04.59 (tengah malam/dinihari: sudah lewat tengah malam)',
                    'time_range' => '23.00–04.59',
                ],
                'tidak_ada' => [
                    'label' => 'Tidak ada waktu lain',
                    'time_range' => null,
                ],
            ],
        ],

        'q3' => [
            'role' => 'konteks_pemicu',
            'title' => 'Situasi pemicu',
            'type' => 'multi',
            'required' => true,
            'min_choices' => 1,
            'max_choices' => 3,
            'options' => [
                'A' => ['label' => 'Di tempat tidur (sebelum/saat sulit tidur)'],
                'B' => ['label' => 'Baru bangun (sebelum beranjak kasur)'],
                'C' => ['label' => 'Jeda aktivitas (istirahat kerja/kuliah, menunggu)'],
                'D' => ['label' => 'Menunda tugas'],
                'E' => ['label' => 'Sendirian di rumah/kamar'],
            ],
        ],

        'q4' => [
            'role' => 'kronotipe',
            'title' => 'Jika kamu bebas menentukan jam tidur dan bangun tanpa dibatasi aktivitas/kewajiban, kapan kamu merasa paling berenergi dan produktif?',
            'type' => 'single',
            'required' => true,
            'min_choices' => 1,
            'max_choices' => 1,
            'options' => [
                'A' => ['label' => 'Sangat pagi (≈05.00–08.59)'],
                'B' => ['label' => 'Pagi hingga menjelang siang (≈09.00–13.59)'],
                'C' => ['label' => 'Sore hingga awal malam (≈14.00–19.00)'],
                'D' => ['label' => 'Malam hingga larut malam (≈19.00–00.00)'],
                'E' => ['label' => 'Tidak ada waktu tertentu — energi relatif merata sepanjang hari'],
            ],
        ],

        'q5' => [
            'role' => 'frekuensi_tunda_tidur',
            'title' => 'Frekuensi tidur lebih larut karena scrolling',
            'type' => 'single',
            'required' => true,
            'min_choices' => 1,
            'max_choices' => 1,
            'options' => [
                'A' => ['label' => 'Tidak pernah'],
                'B' => ['label' => 'Jarang (1–3 malam/bulan)'],
                'C' => ['label' => 'Kadang (1–2 malam/minggu)'],
                'D' => ['label' => 'Sering (3–5 malam/minggu)'],
                'E' => ['label' => 'Hampir tiap malam'],
            ],
        ],

        'q6' => [
            'role' => 'emosi_pemicu',
            'title' => 'Perasaan sebelum/saat scrolling',
            'type' => 'multi',
            'required' => true,
            'min_choices' => 1,
            'max_choices' => 2,
            'options' => [
                'A' => ['label' => 'Bosan'],
                'B' => ['label' => 'Lelah'],
                'C' => ['label' => 'Kesepian'],
                'D' => ['label' => 'Stres/tertekan'],
                'E' => ['label' => 'Tidak merasakan apa-apa (otomatis)'],
            ],
        ],

        'q7' => [
            'role' => 'motif_scrolling',
            'title' => 'Alasan utama terus menggulir konten di medsos',
            'type' => 'multi',
            'required' => true,
            'min_choices' => 1,
            'max_choices' => 2,
            'options' => [
                'A' => ['label' => 'Ingin selalu mengikuti informasi/berita terbaru'],
                'B' => ['label' => 'Takut tertinggal tren atau info yang sedang ramai dibicarakan'],
                'C' => ['label' => 'Tertarik pada konten mengejutkan, kontroversial, atau mengundang penasaran'],
                'D' => ['label' => 'Terus menemukan konten menarik lewat FYP/rekomendasi medsos'],
                'E' => ['label' => 'Tertarik baca komentar atau ikut berinteraksi dalam diskusi'],
            ],
        ],

        'q8' => [
            'role' => 'nilai_inti',
            'title' => 'Hal terpenting dalam hidup saat ini',
            'type' => 'multi',
            'required' => true,
            'min_choices' => 1,
            'max_choices' => 2,
            'options' => [
                'A' => ['label' => 'Keluarga dan pertemanan'],
                'B' => ['label' => 'Karier dan kebebasan finansial'],
                'C' => ['label' => 'Kesehatan fisik dan mental'],
                'D' => ['label' => 'Iman dan spiritualitas'],
                'E' => ['label' => 'Kreativitas dan hobi'],
            ],
        ],

        'q9' => [
            'role' => 'gaya_pesan',
            'title' => 'Gaya pesan yang paling ampuh berhenti scrolling',
            'type' => 'single',
            'required' => true,
            'min_choices' => 1,
            'max_choices' => 1,
            'options' => [
                'A' => ['label' => 'Lembut & menenangkan'],
                'B' => ['label' => 'Tegas & memotivasi'],
                'C' => ['label' => 'Ringan & humoris'],
                'D' => ['label' => 'Faktual & rasional'],
                'E' => ['label' => 'Reflektif (mengajak berpikir)'],
            ],
        ],

        'q10' => [
            'role' => 'respons_pengganti',
            'title' => 'Pengganti saat dorongan scrolling muncul',
            'type' => 'multi',
            'required' => true,
            'min_choices' => 1,
            'max_choices' => 2,
            'options' => [
                'A' => ['label' => 'Bergerak (jalan/peregangan/minum)'],
                'B' => ['label' => 'Mengobrol dgn seseorang'],
                'C' => ['label' => 'Menenangkan diri (napas/doa/meditasi)'],
                'D' => ['label' => 'Kerjakan hal kecil'],
                'E' => ['label' => 'Jauhkan HP'],
                'F' => ['label' => 'Dengarkan musik/podcast'],
                'G' => ['label' => 'Belum tahu (minta saran)'],
            ],
        ],
    ],
];
