# YUDA — Yuk Udahin Doomscrolling Akut

> Aplikasi pendamping untuk membantu pengguna mengenali, mengatur, dan mengurangi kebiasaan doomscrolling.

---

## 1. Nama Tim

**Mie Ayam 4 Porsi**

## 2. Anggota Tim

| No | Nama | Peran |
|----|------|-------|
| 1 | [ISI: nama] | [ISI: peran, mis. Project Manager / Frontend Developer / Backend Developer / UI/UX Designer] |
| 2 | [ISI: nama] | [ISI: peran] |
| 3 | [ISI: nama] | [ISI: peran] |

## 3. Kategori Lomba

**LOGICODIX Mobile APP — Inclusive Health & Well-being**

## 4. Nama Aplikasi

**YUDA — Yuk Udahin Doomscrolling Akut**

## 5. Deskripsi Solusi

YUDA adalah aplikasi yang membantu pengguna keluar dari kebiasaan doomscrolling, yaitu menggulir layar tanpa henti pada konten negatif atau tidak produktif. Solusi kami bekerja dalam tiga langkah:

1. **Mengenali kebiasaan pengguna.** Saat pertama kali memakai aplikasi, pengguna mengisi kuisioner 10 pertanyaan berbasis jurnal untuk memetakan jam rawan doomscrolling dan tipe doomscrolling mereka (misalnya *night owl* untuk pengguna yang rawan menjelang tidur).
2. **Mengintervensi pada waktu yang tepat.** Pengguna mengatur aplikasi yang dipantau, interval istirahat, dan rencana harian, sehingga pengingat muncul sesuai pola mereka, bukan secara acak.
3. **Memberi umpan balik dan motivasi.** Dasbor harian menampilkan analitik dan ringkasan perilaku, sementara teks afirmasi dipersonalisasi berdasarkan hasil kuisioner.

## 6. Masalah yang Diangkat

Doomscrolling adalah kebiasaan menggulir konten media sosial secara kompulsif, terutama konten negatif yang bersifat tidak produktif, sehingga memakan waktu, mengganggu tidur, dan menurunkan produktivitas serta kondisi emosional. Banyak pengguna menyadari kebiasaan ini tetapi tidak tahu **kapan** mereka paling rawan, **seberapa sering** terjadi, dan **bagaimana** cara menghentikannya secara konsisten.

[ISI: tambahkan data/statistik atau referensi jurnal pendukung jika ada, lengkap dengan sumbernya]

## 7. Target Pengguna

- Pelajar dan mahasiswa yang sering terdistraksi media sosial
- Pekerja muda yang ingin mengurangi screen time
- Siapa pun yang merasa sulit berhenti menggulir layar

---

## 8. Dokumentasi

### a. Daftar Fitur yang Berhasil Diimplementasikan

| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | **Login Page** | Masuk menggunakan akun Google, atau akun lokal dengan hanya memasukkan nama. |
| 2 | **Personalization Page** | Pengguna menyesuaikan pengalaman aplikasi. [ISI: sebutkan apa saja yang bisa dipersonalisasi] |
| 3 | **App Permission Page** | Meminta dan menjelaskan izin yang dibutuhkan aplikasi. [ISI: sebutkan izin, mis. akses data penggunaan aplikasi, notifikasi, overlay] |
| 4 | **App Preferences Page** | Pengguna memilih aplikasi yang ingin dipantau/dibatasi. [ISI: sesuaikan] |
| 5 | **Break Interval Configuration Page** | Pengguna mengatur durasi dan interval istirahat dari layar. [ISI: sesuaikan] |
| 6 | **Kuisioner Page** | Kuisioner onboarding 10 pertanyaan untuk menentukan jam rawan doomscrolling, tipe doomscrolling berdasarkan jam rawan, dan personalisasi teks afirmasi. |
| 7 | **Profile Page** | Menampilkan dan mengelola data profil serta hasil kuisioner pengguna. [ISI: sesuaikan] |
| 8 | **Daily Planner Page** | Perencanaan aktivitas harian sebagai alternatif dari scrolling. [ISI: sesuaikan] |
| 9 | **Daily Analytics Dashboard Page** | Visualisasi data penggunaan harian. [ISI: sebutkan metrik, mis. durasi, frekuensi, jam puncak] |
| 10 | **Daily Overview Dashboard Page** | Ringkasan kondisi dan progres pengguna hari itu. [ISI: sesuaikan] |

> Tambahkan tangkapan layar tiap halaman di folder `docs/screenshots/` lalu tautkan di sini, contoh: `![Login](docs/screenshots/login.png)`.

### b. Teknologi yang Digunakan

| Kategori | Teknologi |
|----------|-----------|
| Framework | Mobile APP: React Native, Backend API: Laravel, Style: Nativewind |
| Bahasa | Typescript, Kotlin, PHP |
| Library utama | Expo Router, Expo Secure Store, Zustand, Google Sign-in|
| Database | MySQL |
| Autentikasi | Google Sign-In ( @react-native-google-signin/google-signin: ^17.0.0 ) |
| API | [ISI: API internal / eksternal yang dipakai] |
| Layanan pihak ketiga | [ISI: hosting, notifikasi, analitik, dll. Tulis "tidak ada" jika memang tidak ada] |

### c. Diagram Arsitektur Sistem dan Alur Data

> Diagram di bawah adalah kerangka awal. Sesuaikan komponen dengan arsitektur sebenarnya.

```mermaid
flowchart LR
    U[Pengguna] --> A[Aplikasi YUDA<br/>Frontend]
    A -->|Login Google| G[Google OAuth]
    A -->|Login lokal: input nama| A
    A <-->|Request / Response| B[Backend / API<br/>[ISI]]
    B <--> D[(Database<br/>[ISI])]
    A -->|Data penggunaan aplikasi| P[Modul Pemantauan<br/>& Break Interval]
    P --> N[Pengingat / Notifikasi]
    B --> AN[Analitik Harian]
    AN --> DB1[Daily Analytics<br/>& Overview Dashboard]
```

**Alur data singkat**

1. Pengguna login (Google atau akun lokal dengan nama).
2. Pengguna menyelesaikan personalisasi, izin aplikasi, preferensi aplikasi, interval istirahat, dan kuisioner onboarding.
3. Hasil kuisioner (jam rawan, tipe, afirmasi) disimpan dan menjadi dasar pengingat serta teks afirmasi.
4. Data penggunaan harian dikumpulkan, diolah, lalu ditampilkan pada dasbor analitik dan ringkasan harian.

[ISI: perbarui alur ini sesuai implementasi sebenarnya]

### d. Panduan Instalasi, Konfigurasi, dan Menjalankan Aplikasi

**Prasyarat**

- [ISI: mis. Node.js versi X / PHP versi X / Flutter SDK versi X]
- [ISI: database yang harus tersedia]
- Akun Google Cloud Console untuk membuat OAuth Client ID

**Langkah instalasi**

```bash
# 1. Clone repository
git clone [ISI: URL repository]
cd [ISI: nama folder]

# 2. Instal dependensi
[ISI: mis. npm install / composer install / flutter pub get]

# 3. Salin file environment lalu isi nilainya
cp .env.example .env

# 4. Siapkan database
[ISI: mis. npx prisma migrate dev / php artisan migrate --seed]

# 5. Jalankan aplikasi
[ISI: mis. npm run dev / php artisan serve / flutter run]
```

**Konfigurasi tambahan untuk fitur tertentu**

| Fitur | Konfigurasi yang diperlukan |
|-------|-----------------------------|
| Login Google | Buat OAuth Client ID di Google Cloud Console, daftarkan *redirect URI* / *authorized origin*, lalu isi `GOOGLE_CLIENT_ID` (dan secret jika diperlukan). |
| App Permission | [ISI: izin yang harus diaktifkan manual di perangkat, mis. akses data penggunaan, notifikasi] |
| Notifikasi / Break Interval | [ISI: konfigurasi tambahan jika ada] |

### e. Daftar Variabel `.env` Movile APP

> Jangan pernah mengisi nilai asli rahasia di README. Cantumkan hanya nama dan fungsinya.

| Variabel | Deskripsi | Contoh nilai |
|----------|-----------|--------------|
| `EXPO_PUBLIC_API_URL` | Client ID OAuth Google untuk autentikasi | `xxxxxxxx.apps.googleusercontent.com` |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client secret OAuth Google (jika dipakai) | `xxxxxxxx` |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | [ISI: koneksi database] | `[ISI]` |

### f. Daftar Variabel `.env` Backend API

> Jangan pernah mengisi nilai asli rahasia di README. Cantumkan hanya nama dan fungsinya.

| Variabel | Deskripsi | Contoh nilai |
|----------|-----------|--------------|
| `APP_NAME` | Nama aplikasi backend. | `YUDA` |
| `APP_ENV` | Lingkungan tempat aplikasi dijalankan. | `local` |
| `APP_KEY` | Kunci enkripsi aplikasi Laravel. | `[ISI]` |
| `APP_DEBUG` | Mengaktifkan atau menonaktifkan mode debugging. | `true` |
| `APP_URL` | URL utama backend Laravel. | `http://localhost:8000` |
| `DB_CONNECTION` | Driver database yang digunakan. | `mysql` |
| `DB_HOST` | Host server database. | `	127.0.0.1` |
| `DB_PORT` | Port koneksi database. | `3306` |
| `DB_DATABASE` | Nama database aplikasi. | `yudabackend` |
| `DB_USERNAME` | Username untuk autentikasi database. | `root` |
| `DB_PASSWORD` | Password untuk autentikasi database. | `[ISI]` |
| `GOOGLE_CLIENT_ID` | Client ID untuk integrasi Google Sign-In. | `[ISI]` |
| `GOOGLE_CLIENT_SECRET` | Client Secret untuk autentikasi Google pada backend. | `[ISI]` |
| `GOOGLE_REDIRECT_URI` | URL callback setelah proses autentikasi Google. | `http://localhost:8000/auth/google/callback` |
| `MOBILE_APP_SCHEME` | Skema URL untuk mengarahkan kembali pengguna ke aplikasi mobile. | `yuda` |
| `EXPO_PUBLIC_API_URL` | URL API backend yang diakses oleh aplikasi mobile Expo. | `http://10.0.2.2:8000` |

### g. Akun Demonstrasi

| Jenis akun | Cara masuk |
|------------|-----------|
| **Autentikasi Google** | Login dengan akun Google. [ISI: cantumkan email akun demo yang disediakan untuk juri, jika ada. Jangan cantumkan password di README publik; kirim lewat kanal yang diminta panitia] |
| **Akun lokal** | Tidak memerlukan kredensial. Pengguna hanya diminta memasukkan **nama**. |

### h. Dokumentasi Penggunaan AI

| Tool AI | Digunakan untuk | Bagian proyek | Bagaimana hasilnya diverifikasi/diadaptasi |
|---------|-----------------|---------------|---------------------------------------------|
| Claude (Anthropic) | Merancang 10 pertanyaan kuisioner onboarding berbasis jurnal beserta kerangka output (jam rawan, tipe, afirmasi) | Kuisioner Page | [ISI: mis. pertanyaan dicocokkan dengan jurnal rujukan dan disederhanakan agar mudah dipahami] |
| Claude (Anthropic) | Menyusun README ini | Dokumentasi | Dilengkapi dan diperiksa ulang oleh tim |
| [ISI: tool lain] | [ISI] | [ISI] | [ISI] |

[ISI: tambahkan seluruh penggunaan AI lain secara jujur (kode, desain, aset, teks), termasuk tool dan versinya jika diketahui]

### i. Atribusi Template, Aset, Dataset, dan Kode Pihak Ketiga

| Jenis | Nama | Sumber / URL | Lisensi |
|-------|------|--------------|---------|
| Template | [ISI atau "tidak ada"] | [ISI] | [ISI] |
| Ikon / ilustrasi | [ISI] | [ISI] | [ISI] |
| Font | [ISI] | [ISI] | [ISI] |
| Dataset | [ISI atau "tidak ada"] | [ISI] | [ISI] |
| Kode / library pihak ketiga | [ISI: daftar dari file dependensi proyek] | [ISI] | [ISI] |
| Jurnal rujukan kuisioner | [ISI: daftar jurnal yang menjadi dasar pertanyaan] | [ISI] | — |

---

## Lisensi

[ISI: lisensi proyek, jika ada]