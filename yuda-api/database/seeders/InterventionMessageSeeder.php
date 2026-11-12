<?php

namespace Database\Seeders;

use App\Models\InterventionMessage;
use Illuminate\Database\Seeder;

class InterventionMessageSeeder extends Seeder
{
    public function run(): void
    {
        $messages = array (
  0 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'lembut',
    'header' => 'Malam Sudah Larut, Yuk Rehat Bersama Yuda',
    'message' => 'Nggak apa-apa kalau hari ini terasa panjang. Mari beri jeda untuk matamu beristirahat.',
    'tips' => 'Beri jeda lembut untuk tubuhmu sebelum tidur.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  1 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'tegas',
    'header' => 'Sudah Larut Malam, Matikan Layarmu',
    'message' => 'Layar menyala di tengah malam merusak ritme tidurmu. Letakkan HP-mu sekarang juga.',
    'tips' => 'Tutup aplikasi medsos dan letakkan HP jauh dari kasur.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  2 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'humoris',
    'header' => 'Mata Udah 5 Watt Masih Scroll Aja?',
    'message' => 'Medsos gak bakal kabur kok kalau ditinggal tidur. Yuk merem dulu, besok lanjut lagi!',
    'tips' => 'Kunci HP sebelum HP-nya jatuh nimpa hidung.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  3 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Blue Light Menekan Hormon Melatonin',
    'message' => 'Paparan layar di malam hari menunda fase tidur nyenyak hingga 1,5 jam lebih lambat.',
    'tips' => 'Tutup layar untuk membiarkan tubuh memproduksi melatonin alami.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  4 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'reflektif',
    'header' => 'Apa yang Sebenarnya Kamu Cari Malam Ini?',
    'message' => 'Apakah scrolling larut malam ini benar-benar memberimu ketenangan, atau sekadar menunda tidur?',
    'tips' => 'Jeda sejenak dan dengarkan apa yang tubuhmu butuhkan saat ini.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  5 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'lembut',
    'header' => 'Yuk Ambil Jeda Sejenak Bersama Yuda',
    'message' => 'Nggak apa-apa kalau kamu lagi ingin scrolling. Tapi yuk tarik nafas sejenak dan dengarkan tubuhmu.',
    'tips' => 'Beri jeda sejenak untuk memeriksa apa yang sedang kamu rasakan.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  6 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'tegas',
    'header' => 'Waktu Jeda Sudah Tiba',
    'message' => 'Kamu sudah scrolling cukup lama. Letakkan HP-mu sekarang dan beri tubuhmu kesempatan bernafas bebas.',
    'tips' => 'Tutup layar HP sekarang juga dan berdiri sejenak.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  7 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'humoris',
    'header' => 'Jarimu Gak Pegel tuh Scroll Terus?',
    'message' => 'Jempol udah maraton keliling dunia maya nih. Istirahatin dulu yuk biar gak kram!',
    'tips' => 'Minum air putih dulu biar gak jadi manusia dehidrasi.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  8 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Otak Kehilangan Fokus Tiap 20 Menit',
    'message' => 'Melihat layar terus-menerus menurunkan rentang perhatian dan memicu ketegangan mata secara signifikan.',
    'tips' => 'Terapkan aturan 20-20: alihkan pandangan dari layar ke objek jauh.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  9 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'reflektif',
    'header' => 'Sudah Berapa Lama Kamu Menatap Layar Ini?',
    'message' => 'Seringkali waktu berlalu tanpa kita sadari. Luangkan 30 detik ini untuk kembali ke dunia nyata.',
    'tips' => 'Tarik nafas dan rasakan kehadiranmu di ruangan saat ini.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  10 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'lembut',
    'header' => 'Selamat Datang Kembali di Ruang Tenangmu',
    'message' => 'Bagaimanapun harimu berjalan, kamu selalu punya ruang aman di sini bersama Yuda.',
    'tips' => 'Luangkan waktu sejenak untuk mengenali bagaimana perasaanmu hari ini.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  11 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'tegas',
    'header' => 'Mulai Harimu dengan Kendali Penuh',
    'message' => 'Jangan biarkan algoritma mendikte harimu. Tentukan batas waktu screen time-mu hari ini.',
    'tips' => 'Minum air putih untuk menyegarkan konsentrasi pagimu.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  12 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'humoris',
    'header' => 'Halo Sahabat Yuda! Udah Siap Melek?',
    'message' => 'Hari baru, scrolling baru? Eits, jangan lupa hidup di dunia nyata juga ya!',
    'tips' => 'Regangkan badan dulu biar gak kayak kerupuk melempem.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  13 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Niat Sadar Menurunkan Doomscrolling 40%',
    'message' => 'Menetapkan intensi sebelum berinteraksi dengan HP terbukti meningkatkan kendali impulsif harian.',
    'tips' => 'Lakukan satu tarikan nafas sadar sebelum membuka aplikasi lain.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  14 => 
  array (
    'emotion' => 'belum_teridentifikasi',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'reflektif',
    'header' => 'Apa yang Sedang Kamu Rasakan Saat Ini?',
    'message' => 'Seringkali kita membuka HP secara otomatis. Luangkan 30 detik untuk bertanya: apa yang kubutuhkan sekarang?',
    'tips' => 'Keheningan singkat seringkali membawa jawaban yang jernih.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  15 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'lembut',
    'header' => 'Pertahankan Ketenangan Hatimu Malam Ini',
    'message' => 'Rasa damai ini sangat berharga. Yuk tutup layar HP agar tidurmu semakin lelap dan berkualitas.',
    'tips' => 'Tarik nafas santai dan nikmati ketenangan ruanganmu.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  16 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'tegas',
    'header' => 'Jangan Rusak Ketenanganmu dengan Doomscrolling',
    'message' => 'Membuka linimasa saat sudah tenang hanya akan memicu distraksi baru. Kunci HP sekarang dan tidurlah.',
    'tips' => 'Letakkan HP jauh dari kasur.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  17 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'humoris',
    'header' => 'Udah Santuy Banget, Jangan Dirusak sama Komen Netizen!',
    'message' => 'Hati udah adem ayem kayak Capybara berendam air hangat. Yuk merem, jangan cari perkara di sosmed!',
    'tips' => 'Tutup layar HP, tarik selimut.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  18 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Gelombang Alfa Menuntun Tidur Restoratif',
    'message' => 'Kondisi tenang memicu gelombang otak alfa. Paparan layar dapat mendisrupsi fase tidur restoratif ini.',
    'tips' => 'Pertahankan ritme nafas tenang 5-5-5.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  19 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'reflektif',
    'header' => 'Bagaimana Caramu Menjaga Kedamaian Ini Sampai Besok?',
    'message' => 'Ketenangan adalah hadiah terindah di malam hari. Syukuri momen ini sebelum memejamkan mata.',
    'tips' => 'Tutup mata dan rasakan ketenangan nafasmu.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  20 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'lembut',
    'header' => 'Tetap Sadar di Tengah Scrolling yang Tenang',
    'message' => 'Bahkan saat santai, tubuhmu tetap butuh jeda dari layar. Mari regangkan jemari sejenak.',
    'tips' => 'Ambil nafas lembut dan lemaskan bahu.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  21 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'tegas',
    'header' => 'Jeda Tetap Wajib Meski Sedang Santai',
    'message' => 'Scrolling terlalu lama tetap memberi beban pada mata dan posturmu. Berdiri dan bergeraklah sejenak.',
    'tips' => 'Regangkan tubuh selama 30 detik.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  22 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'humoris',
    'header' => 'Santai Sih Santai, Tapi Jempol Udah Pegel tuh!',
    'message' => 'Niatnya me-time santai, eh kebablasan scroll sampai lupa waktu. Yuk minum air dulu!',
    'tips' => 'Teguk air putih segar biar badan makin adem.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  23 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Kedipan Mata Berkurang 60% Saat Menatap Layar',
    'message' => 'Meskipun rileks, otot mata tetap tegang jika menatap layar terus tanpa jeda berkedip.',
    'tips' => 'Alihkan pandangan dan minum segelas air.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  24 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'reflektif',
    'header' => 'Apakah Kamu Masih Menikmati Konten Ini Secara Sadar?',
    'message' => 'Sadarilah apakah jempolmu bergerak karena penasaran, atau sekadar terbawa arus kenyamanan sesaat.',
    'tips' => 'Tarik nafas 5-5-5 untuk menyelaraskan kesadaranmu.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  25 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'lembut',
    'header' => 'Senang Melihatmu Merasa Tenang Hari Ini',
    'message' => 'Kedamaian batinmu adalah fondasi terbaik untuk menjalani hari dengan bahagia.',
    'tips' => 'Pertahankan energi positif ini dengan nafas yang teratur.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  26 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'tegas',
    'header' => 'Jaga Fokus dan Ketenanganmu Sepanjang Hari',
    'message' => 'Awali hari dengan ketenangan ini dan tetapkan batas screen time agar harimu tetap produktif.',
    'tips' => 'Minum air putih untuk menjaga kesegaran tubuh.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  27 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'humoris',
    'header' => 'Capybara Vibes: Santai, Kalem, Tetap Terkendali!',
    'message' => 'Lagi adem banget nih! Jangan biarkan notifikasi grup yang heboh merusak ketenanganmu ya.',
    'tips' => 'Regangkan badan biar makin santuy.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  28 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Kondisi Tenang Meningkatkan Pengambilan Keputusan',
    'message' => 'Saat emosi stabil, korteks prefrontal bekerja optimal tanpa distorsi impuls emosional.',
    'tips' => 'Minum air putih membantu mempertahankan kejernihan berpikir.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  29 => 
  array (
    'emotion' => 'tenang',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'reflektif',
    'header' => 'Apa Hal Baik yang Ingin Kamu Syukuri Hari Ini?',
    'message' => 'Saat pikiran tenang, kebaikan-kebaikan kecil di sekitarmu akan terlihat lebih jelas.',
    'tips' => 'Ambil nafas dan tersenyumlah untuk dirimu sendiri.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  30 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'lembut',
    'header' => 'Tarik Nafas, Kamu Aman di Sini',
    'message' => 'Kecemasan di malam hari sering terasa lebih besar dari kenyataannya. Mari lepaskan HP dan biarkan dirimu beristirahat.',
    'tips' => 'Tutup mata dan rasakan kehangatan hembusan nafasmu.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  31 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'tegas',
    'header' => 'Hentikan Pencarian Jawaban di Sosmed Larut Malam',
    'message' => 'Medsos tidak akan meredakan rasa cemasmu, justru memicu overthinking baru. Letakkan HP-mu sekarang juga.',
    'tips' => 'Kunci layar HP dan alihkan perhatian ke nafasmu.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  32 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'humoris',
    'header' => 'Otak Lagi Bikin Skenario Fiksi Tengah Malam Ya?',
    'message' => 'Daripada overthinking mikirin hal yang belum tentu terjadi, mending bobo yuk! Yuda Capybara temenin.',
    'tips' => 'Taruh HP jauh-jauh biar gak tergoda scrolling.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  33 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Pernapasan 5-5-5 Menenangkan Sistem Saraf Simpatis',
    'message' => 'Memperlambat laju nafas secara sadar mengirimkan sinyal biologis ke otak bahwa tidak ada bahaya nyata.',
    'tips' => 'Lakukan pernapasan teratur untuk menstabilkan detak jantung.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  34 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'reflektif',
    'header' => 'Apa yang Bisa Kamu Serahkan Malam Ini?',
    'message' => 'Kamu tidak harus menyelesaikan semua kekhawatiran malam ini. Izinkan dirimu beristirahat.',
    'tips' => 'Tutup matamu dan lepaskan beban pikiran secara perlahan.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  35 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'lembut',
    'header' => 'Pelan-pelan Yuk, Tarik Nafas Panjang',
    'message' => 'Scrolling cepat adalah reaksi alami saat cemas. Mari kita perlambat detak jantungmu dengan nafas bersama Yuda.',
    'tips' => 'Hembuskan nafas perlahan lewat mulut.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  36 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'tegas',
    'header' => 'Doomscrolling Ini Memperburuk Kecemasanmu',
    'message' => 'Makin lama menatap layar, kegelisahanmu makin menumpuk. Lepaskan HP dan minum segelas air dingin sekarang.',
    'tips' => 'Minum air putih untuk meredakan ketegangan syaraf.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  37 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'humoris',
    'header' => 'Lagi Scroll Sambil Nahan Nafas ya?',
    'message' => 'Santai dulu bos, tarik nafas jangan spaneng! Medsos gak bakal meledak kok kalau ditinggal sebentar.',
    'tips' => 'Turunkan bahumu dan hembuskan nafas lega.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  38 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Air Dingin Menstimulasi Refleks Vagal',
    'message' => 'Meminum air secara perlahan merangsang saraf vagus yang secara cepat menurunkan denyut nadi saat cemas.',
    'tips' => 'Minum segelas air putih perlahan.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  39 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'reflektif',
    'header' => 'Apakah Konten Ini Membantumu Tenang atau Makin Gelisah?',
    'message' => 'Sadarilah apakah yang kamu baca saat ini meredakan kekhawatiranmu atau justru menambah beban baru.',
    'tips' => 'Regangkan badan untuk melepaskan ketegangan fisik.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  40 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'lembut',
    'header' => 'Wajar Jika Kamu Merasa Khawatir Hari Ini',
    'message' => 'Kamu tidak sendirian. Kita bisa melewati rasa cemas ini satu tarikan nafas demi satu tarikan nafas.',
    'tips' => 'Beri dirimu ruang tenang tanpa tekanan.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  41 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'tegas',
    'header' => 'Kendalikan Hal yang Bisa Kamu Kontrol Hari Ini',
    'message' => 'Kecemasan muncul dari hal yang belum terjadi. Fokuslah pada 1 langkah nyata kecil di hadapanmu sekarang.',
    'tips' => 'Lakukan peregangan fisik untuk mengalirkan energi.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  42 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'humoris',
    'header' => 'Tarik Nafas... Jangan Lupa Dihembusin!',
    'message' => 'Cemas boleh, lupa nafas jangan! Minum air segelas dulu yuk biar otak gak konslet.',
    'tips' => 'Teguk air putih segar biar adem.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  43 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Peregangan Bahu Mengurangi Ketegangan Otot Cemas',
    'message' => 'Rasa cemas secara otomatis mengunci otot leher dan bahu. Peregangan 15 detik membantu membebaskannya.',
    'tips' => 'Putar bahu ke belakang perlahan 5 kali.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  44 => 
  array (
    'emotion' => 'cemas',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'reflektif',
    'header' => 'Apa yang Sebenarnya Sedang Kamu Takutkan Saat Ini?',
    'message' => 'Saat kecemasan diurai satu per satu, seringkali kita menyadari bahwa kita jauh lebih kuat daripada ketakutan kita.',
    'tips' => 'Tarik nafas 5-5-5 untuk mengembalikan kejernihanmu.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  45 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'lembut',
    'header' => 'Bosan Memang Terasa Menjebak Ya?',
    'message' => 'Wajar banget kalau kamu scrolling saat bosan di malam hari. Tapi yuk rehat, matamu butuh istirahat.',
    'tips' => 'Tarik nafas dan biarkan tubuhmu tenang menyambut malam.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  46 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'tegas',
    'header' => 'Bosan Bukan Alasan Begadang',
    'message' => 'Scrolling tanpa tujuan di malam hari hanya membuatmu bangun dengan kepala berat besok. Tidurlah sekarang!',
    'tips' => 'Kunci layar HP dan pejamkan matamu.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  47 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'humoris',
    'header' => 'Bosan Tengah Malam? Medsos Bukan Solusi!',
    'message' => 'Nonton video orang masak jam 1 pagi malah bikin laper. Mending tidur daripada kepikiran mie instan!',
    'tips' => 'Minum seteguk air lalu kunci layarmu.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  48 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Dopamin Semu Memicu Kebosanan Baru',
    'message' => 'Short videos memberikan lonjakan dopamin singkat yang cepat hilang, membuat otak meminta stimulasi lebih tinggi.',
    'tips' => 'Bosan adalah fase alami otak untuk memantik kreativitas baru.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  49 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'reflektif',
    'header' => 'Apakah Scrolling Ini Benar-Benar Mengisi Kekosonganmu?',
    'message' => 'Di heningnya malam, rasa bosan seringkali hanyalah sinyal bahwa pikiranmu butuh keheningan tanpa distraksi.',
    'tips' => 'Ambil nafas dalam dan rasakan kedamaian malam.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  50 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'lembut',
    'header' => 'Yuk Alihkan Perhatian Sejenak',
    'message' => 'Scrolling terasa membosankan tapi jarimu terus bergerak ya? Nggak apa-apa, yuk rehat sejenak bersama Yuda.',
    'tips' => 'Regangkan kedua tangan ke atas agar tubuhmu segar kembali.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  51 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'tegas',
    'header' => 'Scrolling Nggak Bakal Nyembuhin Bosan',
    'message' => 'Makin lama discroll, rasanya justru makin hampa kan? Hentikan autopilot ini dan pindah ke aksi nyata sekarang!',
    'tips' => 'Berdiri dan gerakkan badanmu sekarang.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  52 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'humoris',
    'header' => 'Selamat! Kamu Udah Tamatin Timeline Medsos!',
    'message' => 'Semua konten udah kamu tonton sampai bingung mau liat apa lagi. Udahan yuk, cari camilan atau air putih sana!',
    'tips' => 'Cari minum segar di dapur.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  53 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Perubahan Aktivitas Fisik Mengatur Ulang Otak',
    'message' => 'Gerakan fisik singkat selama 30 detik memicu pelepasan endorfin yang langsung memutus lingkaran autopilot.',
    'tips' => 'Berdiri dan lakukan peregangan bahu.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  54 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'reflektif',
    'header' => 'Apa Hal Nyata yang Sedang Ingin Kamu Lakukan?',
    'message' => 'Rasa bosan adalah ruang kosong yang sedang menunggu ide barumu. Apa yang ingin kamu ciptakan di dunia nyata?',
    'tips' => 'Tarik nafas 5-5-5 untuk menyegarkan fokusmu.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  55 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'lembut',
    'header' => 'Bosan Hari Ini? Mari Temukan Ritme Barumu',
    'message' => 'Bosan itu wajar dan tidak perlu dihindari. Mari kita temani waktu luangmu dengan hal-hal yang menenangkan.',
    'tips' => 'Minum air putih segar untuk mengembalikan fokus.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  56 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'tegas',
    'header' => 'Tolak Autopilot Scrolling Sejak Awal',
    'message' => 'Jangan jadikan sosmed pelarian otomatis saat tidak tahu harus berbuat apa. Tetapkan tujuanmu hari ini.',
    'tips' => 'Rencanakan satu aktivitas bermakna di luar HP.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  57 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'humoris',
    'header' => 'Lagi Gak Ada Kerjaan Nih Ya?',
    'message' => 'Dari pada bengong scroll feeds, mending push-up atau minum air segelas biar makin glowing!',
    'tips' => 'Teguk air putih segar biar harimu gak garing.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  58 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Hidrasi Tubuh Meningkatkan Mood dan Energi',
    'message' => 'Dehidrasi ringan sering disalahartikan sebagai rasa lesu dan bosan oleh otak kita.',
    'tips' => 'Minum air putih untuk merevitalisasi sistem sarafmu.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  59 => 
  array (
    'emotion' => 'bosan',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'reflektif',
    'header' => 'Bosan Adalah Undangan Berkreasi',
    'message' => 'Di balik rasa bosan, ada rasa penasaran yang menunggu. Apa hal sederhana di dunia nyata yang ingin kamu coba hari ini?',
    'tips' => 'Minum air putih membantu mengembalikan kesegaran berpikir.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  60 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'lembut',
    'header' => 'Kamu Merasa Lelah Hari Ini Ya?',
    'message' => 'Yuk, berhenti sejenak. Kamu juga perlu waktu untuk dirimu sendiri. Nggak perlu memaksakan diri.',
    'tips' => 'Rebahkan bahumu dan biarkan pikiranmu istirahat sejenak dari layar.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  61 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'tegas',
    'header' => 'Tubuhmu Sudah Menuntut Tidur',
    'message' => 'Lelah tapi terus scrolling hanya memperpanjang siklus stres. Tutup layarmu dan tidurlah sekarang.',
    'tips' => 'Letakkan HP di luar jangkauan tempat tidur.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  62 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'humoris',
    'header' => 'Baterai Jiwamu Udah 1%, Segera Colok Kasur!',
    'message' => 'Scrolling video lucu gak bakal ngecas fisikmu yang capek. Rebahan merem jauh lebih manjur lho!',
    'tips' => 'Taruh HP, rebahkan badan, dan pejamkan mata.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  63 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Tidur Adalah Satu-satunya Detoks Otak Alami',
    'message' => 'Sistem glimfatik membersihkan racun otak hanya saat tidur nyenyak tanpa gangguan layar biru.',
    'tips' => 'Kunci layar agar proses pemulihan sel otak dapat dimulai.',
    'micro_habit_type' => 'tidur',
    'micro_habit_instruction' => 'Kunci layar HP, redupkan lampu, dan pejamkan matamu dengan rileks.',
  ),
  64 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'jam_rawan',
    'tone_style' => 'reflektif',
    'header' => 'Apakah Kamu Memberi Izin Dirimu Beristirahat?',
    'message' => 'Tidur bukanlah hadiah setelah semua tugas selesai, melainkan hak tubuhmu yang telah berjuang seharian.',
    'tips' => 'Pejamkan mata dan rasakan kelegaan saat melepaskan HP.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  65 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'lembut',
    'header' => 'Tubuhmu Sedang Berbisik Lelah',
    'message' => 'Punggung dan matamu sudah bekerja keras. Beri mereka pelukan hangat berupa istirahat 30 detik.',
    'tips' => 'Tarik nafas perlahan dan lepaskan ketegangan pundak.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  66 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'tegas',
    'header' => 'Tubuhmu Sudah Kasih Sinyal Lelah',
    'message' => 'Scroll terus-menerus saat lelah justru bikin energi makin terkuras. Istirahat nyata ada di luar layar HP!',
    'tips' => 'Tutup layar HP sekarang dan minum segelas air hangat.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  67 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'humoris',
    'header' => 'Mata Kamu Udah Kayak Panda Nih',
    'message' => 'Scrolling gak bakal nyembuhin mata sepet. Yuk istirahatin dulu sebelum layarnya burem beneran!',
    'tips' => 'Regangkan badan biar otot gak kaku kayak patung.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  68 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Layar Biru Menghambat Pemulihan Otak',
    'message' => 'Cahaya layar saat lelah memicu produksi kortisol dan menipu otak agar tetap terjaga secara tidak alami.',
    'tips' => 'Minum air putih membantu hidrasi sel otak yang sedang kelelahan.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  69 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'scroll_terlalu_lama',
    'tone_style' => 'reflektif',
    'header' => 'Apa yang Kamu Harapkan dari Layar Ini?',
    'message' => 'Ketika energi habis, mencari energi dari konten hanya memberi kelelahan baru. Sadari batas energimu.',
    'tips' => 'Tutup mata sejenak dan dengarkan ritme nafasmu.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  70 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'lembut',
    'header' => 'Terima Kasih Sudah Bertahan Sejauh Ini',
    'message' => 'Merasa lelah itu manusiawi. Hari ini kamu tidak harus produktif berlebihan, cukup bernapas dengan tenang.',
    'tips' => 'Ambil nafas dalam dan biarkan tubuhmu rileks.',
    'micro_habit_type' => 'nafas',
    'micro_habit_instruction' => 'Tarik nafas 5 detik, tahan 5 detik, hembuskan 5 detik perlahan. Lakukan bolak-balik 2 kali.',
  ),
  71 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'tegas',
    'header' => 'Prioritaskan Pemulihan Energimu Hari Ini',
    'message' => 'Lelah adalah alarm bahwa tubuhmu butuh recovery nyata, bukan stimulasi layar HP.',
    'tips' => 'Minum air putih hangat untuk merelaksasi otot tubuh.',
    'micro_habit_type' => 'minum',
    'micro_habit_instruction' => 'Ambil segelas air putih dan minum perlahan dalam 5 tegukan segar.',
  ),
  72 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'humoris',
    'header' => 'Mode Hemat Energi Diaktifkan!',
    'message' => 'Lagi loyo ya? Jangan maksain jadi superhero, jadi sloth kayak Yuda si Capybara dulu hari ini.',
    'tips' => 'Peregangan santai yuk biar urat-urat gak protes.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  73 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'faktual',
    'header' => 'Fakta: Kelelahan Menurunkan Daya Kendali Diri',
    'message' => 'Saat lelah, prefrontal cortex melemah sehingga lebih mudah terjebak doomscrolling tanpa henti.',
    'tips' => 'Peregangan sederhana melancarkan sirkulasi oksigen ke otak.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
  74 => 
  array (
    'emotion' => 'lelah',
    'trigger_condition' => 'checkin_dashboard',
    'tone_style' => 'reflektif',
    'header' => 'Apakah Tubuhmu Sedang Menuntut Istirahat?',
    'message' => 'Merasa lelah itu tanda kamu sudah berusaha keras. Beri dirimu apresiasi dan izin untuk melambat.',
    'tips' => 'Peregangan santai akan melepaskan ketegangan leher.',
    'micro_habit_type' => 'peregangan',
    'micro_habit_instruction' => 'Berdiri tegak, dorong kedua tangan ke atas, dan putar bahu ke belakang perlahan.',
  ),
);

        InterventionMessage::query()->truncate();

        foreach ($messages as $msg) {
            InterventionMessage::create([
                ...$msg,
                'source' => 'seed',
                'usage_count' => 0,
            ]);
        }
    }
}
