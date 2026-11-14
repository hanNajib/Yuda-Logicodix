# POP_UP_JEDA_KESADARAN

Dokumentasi visual fitur **POP_UP_JEDA_KESADARAN** pada aplikasi YUDA (Yuk Udahin Doomscrolling Akut).

## Overview

Jeda Kesadaran merupakan mekanisme intervensi preventif pada aplikasi YUDA yang dirancang untuk membantu pengguna mengenali kondisi emosionalnya ketika melakukan aktivitas scrolling pada jam rawan. Melalui pertanyaan mengenai perasaan yang sedang dialami, pengguna diajak untuk mengidentifikasi kondisi dirinya, seperti tenang, cemas, bosan, atau lelah.

Setelah pengguna mengenali kondisi emosionalnya, YUDA menampilkan kartu afirmasi yang berisi kalimat positif dan tips sederhana sebagai bentuk dukungan emosional. Selanjutnya, pengguna diarahkan untuk melakukan aktivitas jeda melalui rangkaian Jeda Pengingat, seperti latihan pernapasan, minum air putih, atau peregangan ringan, serta diberikan kesempatan untuk menentukan apakah ingin beristirahat atau melanjutkan scrolling.

## Screenshots

Berikut merupakan dokumentasi tampilan antarmuka dari fitur POP_UP_JEDA_KESADARAN.

| No | Nama Tampilan | Deskripsi | Tangkapan Layar |
|----|-------|-----------|-----------------|
| 1 | Pop Up Sapaan Pengingat | Menampilkan maskot YUDA yang menyapa pengguna dengan menyertakan nama pengguna dan informasi durasi scrolling yang telah dilakukan. | ![Pop Up Sapaan Pengingat](../screenshots/JEDA_KESADARAN/POP_UP_SAPAAN_PENGINGAT.png) |
| 2 | Pop Up Pengenalan Emosi | Menampilkan card yang mengajak pengguna mengenali kondisi emosionalnya saat ini melalui empat pilihan, yaitu tenang, cemas, bosan, dan lelah. | ![Pop Up Pengenalan Emosi](../screenshots/JEDA_KESADARAN/POP_UP_PENGENALAN_EMOSI.png) |
| 3 | Pop Up Kartu Afirmasi | Menampilkan card berisi kalimat afirmasi dan tips sederhana yang disesuaikan sebagai bentuk dukungan emosional serta membantu pengguna menyadari kondisi dirinya. | ![Pop Up Pengenalan Emosi](../screenshots/JEDA_KESADARAN/POP_UP_AFIRMASI.png) |
| 4 | Pop Up Pilihan Aktivitas | Menampilkan card berisi tiga pilihan aktivitas sederhana, yaitu latihan pernapasan selama 30 detik, minum air putih, dan peregangan ringan. Apabila pengguna memasuki rentang waktu tidur (22.00–04.00), sistem juga menyediakan aktivitas tidur. | ![Pop Up Pop Up Pilihan Aktivitas](../screenshots/JEDA_KESADARAN/POP_UP_PILIHAN_AKTIVITAS.png) |
| 5 | Pop Up Misi | Menampilkan card misi berdasarkan aktivitas yang telah dipilih pengguna sebagai panduan untuk melakukan jeda sejenak dari aktivitas scrolling. | ![Pop Up Misi](../screenshots/JEDA_KESADARAN/POP_UP_MISI.png) |
| 6 | Pop Up Konfirmasi Keberhasilan | Menampilkan pesan keberhasilan setelah pengguna menyelesaikan aktivitas yang dipilih sebagai bentuk apresiasi atas partisipasi pengguna dalam mengambil jeda. | ![Pop Up Konfirmasi Keberhasilan](../screenshots/JEDA_KESADARAN/POP_UP_KONFIRMASI_KEBERHASILAN.png) |
| 7 | Pop Up Pengingat Tugas | Menampilkan card pengingat daftar tugas (task list) yang telah dibuat pengguna melalui halaman Daily Planner sebagai dorongan untuk kembali memperhatikan aktivitas yang telah direncanakan. | ![Pop Up Pengingat Tugas](../screenshots/JEDA_KESADARAN/POP_UP_PENGINGAT_TUGAS.png) |
| 8 | Pop Up Konfirmasi Jeda | Menampilkan dua pilihan kepada pengguna, yaitu Istirahat Scroll untuk mengakhiri aktivitas scrolling sementara atau Lanjut Scroll untuk melanjutkan aktivitas tersebut. | ![Pop Up Konfirmasi Jeda](../screenshots/JEDA_KESADARAN/POP_UP_KONFIRMASI_JEDA.png) |
| 9 | Pop Up Pengingat Lanjutan | Menampilkan pesan ketika pengguna memilih untuk melanjutkan scrolling. Sistem kemudian menjadwalkan pengingat jeda berikutnya setelah 15 menit. | ![Pop Up Pengingat Lanjutan](../screenshots/JEDA_KESADARAN/POP_UP_PENGINGAT_LANJUTAN.png) |

## User Flow

```mermaid
flowchart TD
    A([Mulai]) --> B["Trigger: Pengguna scrolling pada jam rawan"]
    B --> C["Sapaan Pengingat<br/>Maskot menyapa dan menampilkan durasi scrolling"]
    C --> D["Pengenalan Emosi<br/>Tenang / Cemas / Bosan / Lelah"]
    D --> E[Pengguna memilih kondisi emosional]
    E --> F["Kartu Afirmasi<br/>Menampilkan afirmasi dan tips sederhana"]
    F --> G["Pilihan Aktivitas<br/>Napas 30 detik / Minum / Peregangan"]
    G --> H{"Memasuki jam tidur<br/>22.00–04.00?"}
    H -->|Ya| I[Tambahkan pilihan Tidur]
    H -->|Tidak| J[Pengguna memulai aktivitas]
    I --> J
    J --> K["Menampilkan card misi sesuai pilihan"]
    K --> L[Pengguna melakukan aktivitas]
    L --> M["Konfirmasi Keberhasilan<br/>Misi berhasil diselesaikan"]
    M --> N["Pengingat Aktivitas<br/>Menampilkan task list Daily Planner"]
    N --> O["Konfirmasi Jeda<br/>Istirahat Scroll / Lanjut Scroll"]
    O --> P{"Pilihan pengguna?"}
    P -->|Istirahat Scroll| Q([Mengakhiri aktivitas scrolling])
    P -->|Lanjut Scroll| R["Pengingat Lanjutan<br/>Pesan pengguna ingin melanjutkan"]
    R --> S[Menjadwalkan jeda berikutnya setelah 15 menit]
    S --> T([Kembali ke aktivitas scrolling])
```

## Related Documentation

- [Main README](../../README.md)