import { QuizOptionItem, QuizQuestionConfig } from '../types/quiz';

export const RAW_Q1_OPTIONS: QuizOptionItem[] = [
    { id: 'A', badge: 'A', text: '05.00–08.59, pagi: baru bangun atau bersiap berangkat' },
    { id: 'B', badge: 'B', text: '09.00–11.59, pagi-siang: jam kuliah atau kerja' },
    { id: 'C', badge: 'C', text: '15.00–17.59, sore: pulang atau di perjalanan' },
    { id: 'D', badge: 'D', text: '21.00–23.59, malam: menjelang tidur' },
    { id: 'E', badge: 'E', text: '00.00–04.59, Tengah malam / dinihari: sudah lewat tengah malam' },
];

export const NO_OTHER_TIME_KEY = 'tidak_ada';

export const STATIC_QUIZ_QUESTIONS: Omit<QuizQuestionConfig, 'options'>[] = [
    {
        id: 'q1',
        title: 'Pada jam berapa kamu paling sering melakukan scrolling?',
        instruction: 'Pilih satu.',
        type: 'single',
    },
    {
        id: 'q2',
        title: 'Selain jam itu, kapan lagi kamu sering melakukan scrolling konten?',
        instruction: 'Centang maksimal 2. (Boleh dikosongkan)',
        type: 'multi',
        maxSelect: 2,
        optional: true,
    },
    {
        id: 'q3',
        title: 'Di situasi apa kamu paling sering mulai scrolling?',
        instruction: 'Centang maksimal 3.',
        type: 'multi',
        maxSelect: 3,
    },
    {
        id: 'q4',
        title: 'Jika kamu bebas mengatur jam tidur dan bangun, kamu merasa dirimu tipe…',
        instruction: 'Pilih satu.',
        type: 'single',
    },
    {
        id: 'q5',
        title: 'Dalam sebulan terakhir, seberapa sering scrolling membuatmu tidur lebih larut dari yang kamu niatkan?',
        instruction: 'Pilih satu.',
        type: 'single',
    },
    {
        id: 'q6',
        title: 'Perasaan apa yang paling sering ada sebelum atau saat kamu mulai scrolling?',
        instruction: 'Centang maksimal 2.',
        type: 'multi',
        maxSelect: 2,
    },
    {
        id: 'q7',
        title: 'Apa alasan utamamu terus mengikuti konten negatif?',
        instruction: 'Centang maksimal 2.',
        type: 'multi',
        maxSelect: 2,
    },
    {
        id: 'q8',
        title: 'Hal apa yang paling penting dalam hidupmu saat ini?',
        instruction: 'Centang maksimal 2.',
        type: 'multi',
        maxSelect: 2,
    },
    {
        id: 'q9',
        title: 'Pesan seperti apa yang paling membuatmu mau berhenti scrolling?',
        instruction: 'Pilih satu.',
        type: 'single',
    },
    {
        id: 'q10',
        title: 'Saat dorongan scrolling itu muncul, apa hal yang mungkin kamu lakukan sebagai gantinya?',
        instruction: 'Centang maksimal 2.',
        type: 'multi',
        maxSelect: 2,
    },
];

export const Q3_OPTIONS: QuizOptionItem[] = [
    { id: 'A', badge: 'A', text: 'Di tempat tidur: sebelum tidur atau saat belum bisa tidur' },
    { id: 'B', badge: 'B', text: 'Baru bangun: sebelum beranjak dari kasur' },
    { id: 'C', badge: 'C', text: 'Jeda aktivitas: istirahat kuliah/kerja atau sedang menunggu' },
    { id: 'D', badge: 'D', text: 'Saat menunda tugas: ada pekerjaan yang seharusnya dikerjakan' },
    { id: 'E', badge: 'E', text: 'Saat sendirian di rumah atau kamar' },
];

export const Q4_OPTIONS: QuizOptionItem[] = [
    { id: 'A', badge: 'A', text: 'Jelas tipe pagi: paling segar dan produktif di pagi hari' },
    { id: 'B', badge: 'B', text: 'Lebih ke pagi' },
    { id: 'C', badge: 'C', text: 'Tidak condong ke mana pun' },
    { id: 'D', badge: 'D', text: 'Lebih ke malam' },
    { id: 'E', badge: 'E', text: 'Jelas tipe malam: paling segar dan produktif di malam hari' },
];

export const Q5_OPTIONS: QuizOptionItem[] = [
    { id: 'A', badge: 'A', text: 'Tidak pernah' },
    { id: 'B', badge: 'B', text: 'Jarang: 1–3 malam per bulan' },
    { id: 'C', badge: 'C', text: 'Kadang: 1–2 malam per minggu' },
    { id: 'D', badge: 'D', text: 'Sering: 3–5 malam per minggu' },
    { id: 'E', badge: 'E', text: 'Hampir setiap malam' },
];

export const Q6_OPTIONS: QuizOptionItem[] = [
    { id: 'A', badge: 'A', text: 'Bosan: tidak ada yang dikerjakan' },
    { id: 'B', badge: 'B', text: 'Lelah: capek fisik atau mental' },
    { id: 'C', badge: 'C', text: 'Kesepian: ingin merasa terhubung' },
    { id: 'D', badge: 'D', text: 'Stres atau tertekan: tugas atau masalah menumpuk' },
    { id: 'E', badge: 'E', text: 'Tidak merasakan apa-apa: terjadi otomatis' },
];

export const Q7_OPTIONS: QuizOptionItem[] = [
    { id: 'A', badge: 'A', text: 'Ingin selalu mengikuti informasi atau berita terbaru' },
    { id: 'B', badge: 'B', text: 'Takut tertinggal tren atau info yang sedang ramai dibicarakan' },
    { id: 'C', badge: 'C', text: 'Tertarik pada konten mengejutkan, kontroversial, atau bikin penasaran' },
    { id: 'D', badge: 'D', text: 'Terus menemukan konten menarik lewat FYP atau rekomendasi' },
    { id: 'E', badge: 'E', text: 'Tertarik baca komentar atau ikut berinteraksi dalam diskusi' },
];

export const Q8_OPTIONS: QuizOptionItem[] = [
    { id: 'A', badge: 'A', text: 'Keluarga dan pertemanan' },
    { id: 'B', badge: 'B', text: 'Karier dan kebebasan finansial' },
    { id: 'C', badge: 'C', text: 'Kesehatan fisik dan mental' },
    { id: 'D', badge: 'D', text: 'Iman dan spiritualitas' },
    { id: 'E', badge: 'E', text: 'Kreativitas dan hobi' },
];

export const Q9_OPTIONS: QuizOptionItem[] = [
    { id: 'A', badge: 'A', text: 'Lembut dan menenangkan: menerima keadaanmu tanpa menghakimi' },
    { id: 'B', badge: 'B', text: 'Tegas dan memotivasi: mengajak bertindak sekarang' },
    { id: 'C', badge: 'C', text: 'Ringan dan humoris: mengingatkan dengan santai' },
    { id: 'D', badge: 'D', text: 'Faktual dan rasional: alasan atau fakta singkat' },
    { id: 'E', badge: 'E', text: 'Reflektif: pertanyaan yang mengajak berpikir' },
];

export const Q10_OPTIONS: QuizOptionItem[] = [
    { id: 'A', badge: 'A', text: 'Bergerak: jalan sebentar, peregangan, atau minum' },
    { id: 'B', badge: 'B', text: 'Mengobrol dengan seseorang: pesan, telepon, atau bertemu' },
    { id: 'C', badge: 'C', text: 'Menenangkan diri: napas dalam, doa atau ibadah, meditasi' },
    { id: 'D', badge: 'D', text: 'Mengerjakan hal kecil: tugas, beres-beres, membaca buku' },
    { id: 'E', badge: 'E', text: 'Menjauhkan HP: taruh di ruangan lain atau matikan notifikasi' },
    { id: 'F', badge: 'F', text: 'Mendengarkan musik atau podcast ringan' },
    { id: 'G', badge: 'G', text: 'Belum tahu: ingin disarankan' },
];

export function buildQuestions(selectedQ1: string): QuizQuestionConfig[] {
    const q2Filtered = RAW_Q1_OPTIONS.filter((opt) => opt.id !== selectedQ1).map((opt, idx) => ({
        ...opt,
        badge: String.fromCharCode(65 + idx),
    }));

    const q2Options: QuizOptionItem[] = [
        ...q2Filtered,
        {
            id: NO_OTHER_TIME_KEY,
            badge: String.fromCharCode(65 + q2Filtered.length),
            text: 'Tidak ada waktu lain (menghapus centang lain)',
        },
    ];

    return [
        { ...STATIC_QUIZ_QUESTIONS[0], options: RAW_Q1_OPTIONS },
        { ...STATIC_QUIZ_QUESTIONS[1], options: q2Options },
        { ...STATIC_QUIZ_QUESTIONS[2], options: Q3_OPTIONS },
        { ...STATIC_QUIZ_QUESTIONS[3], options: Q4_OPTIONS },
        { ...STATIC_QUIZ_QUESTIONS[4], options: Q5_OPTIONS },
        { ...STATIC_QUIZ_QUESTIONS[5], options: Q6_OPTIONS },
        { ...STATIC_QUIZ_QUESTIONS[6], options: Q7_OPTIONS },
        { ...STATIC_QUIZ_QUESTIONS[7], options: Q8_OPTIONS },
        { ...STATIC_QUIZ_QUESTIONS[8], options: Q9_OPTIONS },
        { ...STATIC_QUIZ_QUESTIONS[9], options: Q10_OPTIONS },
    ];
}

