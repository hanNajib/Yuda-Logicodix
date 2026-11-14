# POP_UP_JEDA_PENGINGAT

Dokumentasi visual fitur **POP_UP_JEDA_PENGINGAT** pada aplikasi YUDA (Yuk Udahin Doomscrolling Akut).

## Overview

Jeda Pengingat merupakan mekanisme intervensi preventif awal pada aplikasi YUDA yang bertujuan membantu pengguna menyadari durasi aktivitas scrolling yang telah dilakukan. Melalui sapaan maskot YUDA yang menampilkan informasi durasi scrolling, pengguna diajak untuk mengambil jeda sejenak dari aktivitas digitalnya.

Fitur ini menyediakan pilihan aktivitas sederhana, seperti latihan pernapasan selama 30 detik, minum air putih, peregangan ringan, hingga tidur pada rentang waktu 22.00–04.00. Selain itu, pengguna juga diberikan pengingat aktivitas melalui Daily Planner serta pilihan untuk beristirahat atau melanjutkan scrolling. Apabila pengguna memilih untuk melanjutkan, YUDA akan memberikan pengingat jeda kembali setelah 15 menit.

## Screenshots

Berikut merupakan dokumentasi tampilan antarmuka dari fitur POP_UP_JEDA_PENGINGAT.

| No | Nama Tampilan | Deskripsi | Tangkapan Layar |
|----|-------|-----------|-----------------|
| 1 | Pop Up Sapaan Pengingat | Menampilkan maskot YUDA yang menyapa pengguna dengan menyertakan nama pengguna dan informasi durasi scrolling yang telah dilakukan. | ![Pop Up Sapaan Pengingat](../screenshots/JEDA_PENGINGAT/POP_UP_SAPAAN_PENGINGAT.png) |
| 2 | Pop Up Pilihan Aktivitas | Menampilkan card berisi tiga pilihan aktivitas sederhana, yaitu latihan pernapasan selama 30 detik, minum air putih, dan peregangan ringan. Apabila pengguna memasuki rentang waktu tidur (22.00–04.00), sistem juga menyediakan aktivitas tidur. | ![Pop Up Pop Up Pilihan Aktivitas](../screenshots/JEDA_PENGINGAT/POP_UP_PILIHAN_AKTIVITAS.png) |
| 3 | Pop Up Misi | Menampilkan card misi berdasarkan aktivitas yang telah dipilih pengguna sebagai panduan untuk melakukan jeda sejenak dari aktivitas scrolling. | ![Pop Up Misi](../screenshots/JEDA_PENGINGAT/POP_UP_MISI.png) |
| 4 | Pop Up Konfirmasi Keberhasilan | Menampilkan pesan keberhasilan setelah pengguna menyelesaikan aktivitas yang dipilih sebagai bentuk apresiasi atas partisipasi pengguna dalam mengambil jeda. | ![Pop Up Konfirmasi Keberhasilan](../screenshots/JEDA_PENGINGAT/POP_UP_KONFIRMASI_KEBERHASILAN.png) |
| 5 | Pop Up Pengingat Tugas | Menampilkan card pengingat daftar tugas (task list) yang telah dibuat pengguna melalui halaman Daily Planner sebagai dorongan untuk kembali memperhatikan aktivitas yang telah direncanakan. | ![Pop Up Pengingat Tugas](../screenshots/JEDA_PENGINGAT/POP_UP_PENGINGAT_TUGAS.png) |
| 6 | Pop Up Konfirmasi Jeda | Menampilkan dua pilihan kepada pengguna, yaitu Istirahat Scroll untuk mengakhiri aktivitas scrolling sementara atau Lanjut Scroll untuk melanjutkan aktivitas tersebut. | ![Pop Up Konfirmasi Jeda](../screenshots/JEDA_PENGINGAT/POP_UP_KONFIRMASI_JEDA.png) |
| 7 | Pop Up Pengingat Lanjutan | Menampilkan pesan ketika pengguna memilih untuk melanjutkan scrolling. Sistem kemudian menjadwalkan pengingat jeda berikutnya setelah 15 menit. | ![Pop Up Pengingat Lanjutan](../screenshots/JEDA_PENGINGAT/POP_UP_PENGINGAT_LANJUTAN.png) |

## User Flow

```mermaid
flowchart TD
    A([Mulai]) --> B[Trigger durasi scrolling tercapai]
    B --> C["Sapaan Pengingat<br/>Maskot menyapa dan menampilkan durasi scrolling"]
    C --> D["Pilihan Aktivitas<br/>Napas 30 detik / Minum / Peregangan"]
    D --> E{"Memasuki jam tidur<br/>22.00–04.00?"}
    E -->|Ya| F[Tambahkan pilihan Tidur]
    E -->|Tidak| G[Pengguna memulai aktivitas]
    F --> G
    G --> H["Menampilkan card misi sesuai pilihan"]
    H --> I[Pengguna melakukan aktivitas]
    I --> J["Konfirmasi Keberhasilan<br/>Misi berhasil diselesaikan"]
    J --> K["Pengingat Aktivitas<br/>Menampilkan task list Daily Planner"]
    K --> L["Konfirmasi Jeda<br/>Istirahat Scroll / Lanjut Scroll"]
    L --> M{"Pilihan pengguna?"}
    M -->|Istirahat Scroll| N([Mengakhiri aktivitas scrolling])
    M -->|Lanjut Scroll| O["Pengingat Lanjutan<br/>Pesan pengguna ingin melanjutkan"]
    O --> P[Menjadwalkan jeda berikutnya setelah 15 menit]
    P --> Q([Kembali ke aktivitas scrolling])
```

## Related Documentation

- [Main README](../../README.md)