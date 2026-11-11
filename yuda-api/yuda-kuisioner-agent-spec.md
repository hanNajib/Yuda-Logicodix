# YUDA — Spec Kuisioner Onboarding (untuk AI Agent)

> Sumber: *Kuisioner Onboarding: 10 Pertanyaan untuk Jam Rawan, Tipe, dan Afirmasi* — Revisi 2, draf telaah ahli, 7 Nov 2026.
> Direstrukturisasi jadi format operasional supaya langsung bisa dieksekusi sebagai logika agent (bukan prosa akademik).
>
> **Update 1:** Q7 (motif mengikuti konten negatif) sempat dihapus dari alur. Stem Q1, Q2, Q3, Q6, Q10 juga disesuaikan jadi lebih generik ("scrolling" tanpa embel-embel "konten negatif" di tiap kalimat tanya) — definisi "konten negatif" tetap dipertahankan di teks pengantar (§1).
>
> **Update 2 (revisi terbaru):** **Q7 dipakai kembali** dengan opsi baru (5 opsi, bukan 6) → total **kembali jadi 10 pertanyaan aktif**. Opsi **Q1** (rentang jam), **Q4** (pertanyaan + opsi kronotipe), dan **Q8** (nilai inti, 5 opsi bukan 7) diperbarui. **Tabel tipe jam rawan** dirombak total jadi 5 tipe yang pas 1:1 dengan 5 opsi Q1, ditambah tabel interpretasi tambahan (kombinasi Q1+Q3/Q4) buat label sekunder. Detail di tiap bagian terkait.

## 0. TL;DR

1. Tampilkan **teks pengantar** (§1) → ajukan **10 pertanyaan: Q1–Q10** (§2, Q7 sudah aktif lagi dgn opsi baru) → simpan jawaban.
2. Jalankan 3 proses turunan: **Jam Rawan**, **Tipe Pengguna**, **Afirmasi** (§3).
3. Tampilkan hasil + tombol **"Cocok" / "Tidak cocok"** pada afirmasi — wajib, bukan opsional.
4. Ini **bukan alat diagnosis**. Semua label tipe = usulan, bisa diralat pengguna.

## 1. Teks Pengantar (tampilkan verbatim sebelum Q1)

```
Jawablah sesuai kebiasaanmu dalam 1 bulan terakhir. Tidak ada jawaban benar atau salah;
jawabanmu hanya dipakai untuk mengatur waktu pengingat dan isi pesan di YUDA.
"Konten negatif" berarti berita atau video tentang bencana, kriminal, konflik, krisis,
atau hal menyedihkan lainnya.
```

## 2. Pertanyaan & Aturan Input

| # | Tipe pilihan | Dipakai untuk |
|---|---|---|
| Q1 | Single | Jam rawan utama + penentu tipe dasar |
| Q2 | Multi, maks 2 (atau "tidak ada" → clear semua) | Jam rawan tambahan |
| Q3 | Multi, maks 3 | Konteks pemicu → subtipe + bahan afirmasi |
| Q4 | Single | Kronotipe swalaporan → validasi label "Night Owl" |
| Q5 | Single | Frekuensi bedtime procrastination → subtipe malam |
| Q6 | Multi, maks 2 | Emosi pemicu → pembuka afirmasi |
| Q7 | Multi, maks 2 | Motif scrolling → sudut pandang afirmasi |
| Q8 | Multi, maks 2 | Nilai inti → jangkar afirmasi |
| Q9 | Single | Gaya pesan → nada afirmasi |
| Q10 | Multi, maks 2 | Respons pengganti → bagian "maka" |

### Detail opsi tiap pertanyaan

**Q1 — Jam paling sering scrolling** (single) · *rentang diperbarui, sekarang full 24 jam tanpa celah*
- A. 05.00–08.59 (pagi: baru bangun/bersiap berangkat)
- B. 09.00–13.59 (pagi-siang: jam kuliah/kerja)
- C. 14.00–17.59 (sore: pulang/di perjalanan)
- D. 18.00–22.59 (malam: hingga menjelang tidur)
- E. 23.00–04.59 (tengah malam/dinihari: sudah lewat tengah malam)

**Q2 — Jam rawan lain** (multi maks 2; boleh kosong)
- Opsi A–E sama seperti Q1, minus yang sudah dipilih di Q1
- Tambahan: "Tidak ada waktu lain" → jika dipilih, hapus centang lain

**Q3 — Situasi pemicu** (multi maks 3)
- A. Di tempat tidur (sebelum/saat sulit tidur)
- B. Baru bangun (sebelum beranjak kasur)
- C. Jeda aktivitas (istirahat kerja/kuliah, menunggu)
- D. Menunda tugas
- E. Sendirian di rumah/kamar

**Q4 — Kronotipe swalaporan** (single) · *stem & opsi diperbarui*
> Stem: "Jika kamu bebas menentukan jam tidur dan bangun tanpa dibatasi aktivitas/kewajiban, kapan kamu merasa paling berenergi dan produktif?"
- A. Sangat pagi (≈05.00–08.59)
- B. Pagi hingga menjelang siang (≈09.00–13.59)
- C. Sore hingga awal malam (≈14.00–19.00)
- D. Malam hingga larut malam (≈19.00–00.00)
- E. Tidak ada waktu tertentu — energi relatif merata sepanjang hari

⚠️ **Perhatian implementasi:** di tabel kombinasi (§3.2), opsi **D dan E** sama-sama diperlakukan sebagai "kecenderungan malam" untuk validasi label Night Owl — padahal deskripsi opsi E justru "tidak ada kecenderungan waktu tertentu" (harusnya netral, bukan malam). Ini kontradiksi di dokumen sumber; agent ikuti aturan literal (D atau E = kecenderungan malam) tapi tim sebaiknya klarifikasi ulang makna E.

**Q5 — Frekuensi tidur lebih larut karena scrolling** (single)
- A. Tidak pernah · B. Jarang (1–3 malam/bulan) · C. Kadang (1–2 malam/minggu) · D. Sering (3–5 malam/minggu) · E. Hampir tiap malam

**Q6 — Perasaan sebelum/saat scrolling** (multi maks 2)
- A. Bosan · B. Lelah · C. Kesepian · D. Stres/tertekan · E. Tidak merasakan apa-apa (otomatis)

**Q7 — Alasan utama terus menggulir konten di medsos** (multi maks 2) · *aktif lagi, opsi baru (5, bukan 6)*
- A. Ingin selalu mengikuti informasi/berita terbaru
- B. Takut tertinggal tren atau info yang sedang ramai dibicarakan
- C. Tertarik pada konten mengejutkan, kontroversial, atau mengundang penasaran
- D. Terus menemukan konten menarik lewat FYP/rekomendasi medsos
- E. Tertarik baca komentar atau ikut berinteraksi dalam diskusi

**Q8 — Hal terpenting dalam hidup saat ini** (multi maks 2) · *opsi dipangkas jadi 5 (gabungan beberapa kategori lama)*
- A. Keluarga dan pertemanan
- B. Karier dan kebebasan finansial
- C. Kesehatan fisik dan mental
- D. Iman dan spiritualitas
- E. Kreativitas dan hobi

**Q9 — Gaya pesan yang paling ampuh berhenti scrolling** (single)
- A. Lembut & menenangkan · B. Tegas & memotivasi · C. Ringan & humoris · D. Faktual & rasional · E. Reflektif (mengajak berpikir)

**Q10 — Pengganti saat dorongan scrolling muncul** (multi maks 2)
- A. Bergerak (jalan/peregangan/minum) · B. Mengobrol dgn seseorang · C. Menenangkan diri (napas/doa/meditasi) · D. Kerjakan hal kecil · E. Jauhkan HP · F. Dengarkan musik/podcast · G. Belum tahu (minta saran)

## 3. Logika Pemrosesan

### 3.1 Jam Rawan

```
jam_rawan_utama    = Q1
jam_rawan_tambahan = Q2 (maks 2, kosong jika "tidak ada waktu lain")
konteks_pemicu     = Q3
flag_tunda_tidur   = true jika Q5 ∈ {D, E}
```

Template output: `"Jam rawanmu pukul {Q1}, biasanya saat {Q3_dominan}."`

### 3.2 Tipe & Subtipe Pengguna *(dirombak total — sekarang 1:1 dengan opsi Q1, tidak ada lagi mismatch)*

**Aturan dasar:** Tipe utama **selalu** ditentukan langsung dari Q1 (1 dari 5, tidak pernah berubah). Q3/Q4 **hanya menambah label/karakteristik sekunder** di atasnya — bukan mengganti tipe utama.

#### a) Tipe Utama (dari Q1 — wajib, selalu ada persis 1)

| Q1 | Tipe Utama | Penajam dari Q3/Q4 |
|---|---|---|
| A. 05.00–08.59 | Early Bird Scroller | Q3=B ("baru bangun") → scrolling jadi aktivitas pertama sebelum beranjak kasur |
| B. 09.00–13.59 | Office-Hour Scroller | Q3=C/D ("jeda aktivitas"/"menunda tugas"); Q4=A/B memperkuat kecenderungan aktif pagi |
| C. 14.00–17.59 | Afternoon Scroller | Q3=C/E ("jeda aktivitas"/"sendirian") → mengisi waktu luang sore |
| D. 18.00–22.59 | Prime-Time Scroller | Q3=E/A ("sendirian"/"di tempat tidur") atau bersama orang lain; Q4=D/E memperkuat kecenderungan aktif malam |
| E. 23.00–04.59 | Midnight Scroller | Q3=A ("di tempat tidur"/belum bisa tidur); Q4=D/E menunjukkan kecenderungan aktif malam |

#### b) Label Sekunder (opsional, dari kombinasi Q1+Q3 atau Q1+Q4 — bisa lebih dari satu, bisa nol)

| Kombinasi | Label Tambahan |
|---|---|
| Q1=A + Q3="baru bangun" | Morning Habit — scrolling jadi kebiasaan setelah bangun |
| Q1=B + Q3="menunda tugas" | Procrastination Scroller — scrolling sbg bentuk penundaan kerja |
| Q1=B/C + Q3="jeda aktivitas" | Break-Time Scroller — mengisi waktu istirahat |
| Q1=C + Q3="jeda aktivitas" | Afternoon Break Scroller — dominan di waktu luang sore *(tumpang tindih dgn baris di atas, lihat §7)* |
| Q1=D + Q3="sendirian" | Solitary Scroller — lebih sering scrolling sendirian |
| Q1=D + Q3="bersama orang lain" | Social Scroller — scrolling dalam situasi sosial |
| Q1=D/E + Q3="di tempat tidur" | Bedtime Scroller — berkaitan dgn waktu istirahat/tidur |
| Q1=E + Q4=A/B | Nighttime Mismatch — scrolling larut malam meski energi puncak di pagi hari |
| Q1=E + Q4=D/E | Night Owl Scroller — scrolling larut malam selaras kecenderungan malam |

⚠️ Label **"Night Owl"** secara ilmiah = kronotipe malam, bukan sekadar jam scrolling malam — di tabel ini sudah ditangani lewat pemisahan **Nighttime Mismatch** (tidak selaras) vs **Night Owl Scroller** (selaras). Tetap jangan pernah tempel "Night Owl" hanya dari Q1 tanpa cek Q4.

### 3.3 Afirmasi — 4 Bagian Wajib

```
1. Pengakuan perasaan = f(Q6) — disampaikan dgn sudut pandang f(Q7), nada f(Q9)
2. Jangkar nilai       = f(Q8)
3. Jika–maka           = situasi/jam f(Q1, Q3) → respons f(Q10), ditulis sbg AKSI, bukan larangan
4. Waktu tayang        = sebelum/saat jam rawan f(Q1, Q2)
```

Nada (Q9) menentukan gaya tulis bagian 1 & 3 — lembut (A), tegas (B), humor (C), faktual (D), reflektif (E).
*(Dokumen sumber baru menyediakan contoh lengkap untuk nada "lembut"; varian B–E perlu di-draft terpisah sebelum go-live.)*

**Contoh (profil: Night Owl, lelah+cemas, nilai keluarga, nada lembut, respons napas dalam):**
> "Kamu sudah berusaha seharian, wajar kalau lelah dan khawatir. Malam ini, tidur yang cukup lebih membantu menjaga keluargamu daripada satu kabar buruk lagi. Jam 21.00, saat tanganmu mulai membuka beranda, tarik napas dalam tiga kali dulu."

⚠️ Contoh ini belum diupdate dari revisi lama: jam 21.00 sekarang masuk rentang Q1=D (18.00–22.59 → **Prime-Time Scroller**), bukan Q1=E (23.00–04.59 → tipe utama di mana label **Night Owl Scroller** berlaku). Pakai contoh ini hanya utk struktur kalimat, bukan acuan pemetaan jam↔tipe.

## 4. Aturan Wajib (Hard Constraints)

- ❌ Jangan pakai pernyataan serba-positif generik ("Kamu pasti bisa berhenti!") — berisiko bikin pengguna dgn self-esteem rendah merasa lebih buruk.
- ✅ Bagian "jika–maka" ditulis sebagai **tindakan yang dilakukan**, bukan larangan ("jangan scroll").
- ✅ Selalu sediakan tombol feedback **"cocok / tidak cocok"** pada tiap afirmasi — efek personalisasi pesan secara umum kecil, jadi butuh koreksi berkelanjutan.
- ✅ Semua nama tipe = usulan, tampilkan sebagai "kecenderungan", bukan identitas tetap/vonis.
- ❌ Jangan perlakukan hasil kuisioner sebagai diagnosis klinis.
- ⚠️ Data jawaban (emosi, kebiasaan tidur) = data sensitif → wajib consent eksplisit + kebijakan privasi (cek UU PDP).
- ℹ️ Jam rawan bisa beda di akhir pekan — tidak ditanyakan di kuisioner ini; pertimbangkan penyesuaian otomatis setelah 1–2 minggu pemakaian.

## 5. Skema Data (acuan implementasi)

```json
// INPUT
{
  "q1": "A|B|C|D|E",
  "q2": ["A|B|C|D|E", "..."] | ["tidak_ada"],
  "q3": ["A","B","C"],              // maks 3
  "q4": "A|B|C|D|E",
  "q5": "A|B|C|D|E",
  "q6": ["A","B"],                  // maks 2
  "q7": ["A","B"],                  // maks 2
  "q8": ["A","B"],                  // maks 2
  "q9": "A|B|C|D|E",
  "q10": ["A","B"]                  // maks 2
}

// OUTPUT
{
  "jam_rawan": { "utama": "...", "tambahan": [...], "konteks": [...] },
  "tipe": { "utama": "...", "label_sekunder": ["..."], "is_night_owl_valid": true },
  "afirmasi": {
    "pengakuan_perasaan": "...",
    "jangkar_nilai": "...",
    "jika_maka": "...",
    "waktu_tayang": "...",
    "teks_gabungan": "..."
  }
}
```

## 6. Keterbatasan (ringkas)

- Belum ada skala baku utk "jam rawan doomscrolling" — Q1–Q3 rancangan sendiri.
- Q4 cuma 1 butir, bukan pengganti skala kronotipe penuh (rMEQ/MCTQ).
- Kaitan kronotipe malam ↔ problematic phone use = korelasional, bukan sebab-akibat.
- Dokumen masih **draf untuk telaah ahli**, belum divalidasi — butuh content validity, uji keterbacaan, pilot 50–100 responden (lihat dok asli §6).
- Beberapa referensi (ditandai †) belum dicocokkan ke sumber asli — jangan dikutip sbg fakta final.

## 7. ⚠️ Isu di Dokumen Sumber

### Sudah resolved di revisi terbaru ✅
1. ~~Lettering Q1 vs tabel tipe tidak sinkron (8 kategori vs 5 opsi)~~ → **Fixed.** Q1 sekarang 5 opsi full 24 jam, tabel tipe juga persis 5 baris — 1:1 match.
2. ~~Q2 merujuk "opsi A–G" padahal Q1 cuma A–E~~ → **Fixed.** Q2 sekarang benar merujuk "A–E".

### Masih perlu diperhatikan ⚠️
3. **Q4 opsi E ambigu.** Dideskripsikan sbg "tidak ada waktu tertentu / energi merata" (netral), tapi di tabel label sekunder (§3.2b) E dikelompokkan bareng D sbg "kecenderungan malam" utk validasi Night Owl. Perlu diklarifikasi tim: apakah E harusnya netral (tidak dihitung ke arah manapun) atau memang sengaja mendukung kecenderungan malam.
4. **Baris tumpang-tindih di tabel label sekunder:** "Q1=B/C + Q3 jeda aktivitas → Break-Time Scroller" overlap dgn "Q1=C + Q3 jeda aktivitas → Afternoon Break Scroller" tepat di bawahnya — kombinasi Q1=C bisa kena 2 label sekaligus. Perlu aturan prioritas (misal: label paling spesifik menang) atau salah satu baris dihapus.
5. **Contoh kalimat afirmasi di §3.3 belum disesuaikan** dgn rentang jam Q1 yang baru (jam 21.00 di contoh = Prime-Time Scroller, bukan Midnight Scroller/Night Owl seperti label di contoh). Jangan jadikan acuan pemetaan jam, hanya acuan struktur kalimat.
6. Beberapa referensi akademik (†) belum diverifikasi — jangan jadi dasar klaim ke pengguna/investor tanpa cek ulang.