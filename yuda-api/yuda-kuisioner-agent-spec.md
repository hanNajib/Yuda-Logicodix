# YUDA — Spec Kuisioner Onboarding (untuk AI Agent)

> Sumber: *Kuisioner Onboarding: 10 Pertanyaan untuk Jam Rawan, Tipe, dan Afirmasi* — Revisi 2, draf telaah ahli, 7 Nov 2026.
> Direstrukturisasi jadi format operasional supaya langsung bisa dieksekusi sebagai logika agent (bukan prosa akademik).
>
> **Update:** Q7 (motif mengikuti konten negatif) **dihapus dari alur** → total jadi **9 pertanyaan aktif**. Stem Q1, Q2, Q3, Q6, Q10 juga disesuaikan jadi lebih generik ("scrolling" tanpa embel-embel "konten negatif" di tiap kalimat tanya) — definisi "konten negatif" tetap dipertahankan di teks pengantar (§1).

## 0. TL;DR

1. Tampilkan **teks pengantar** (§1) → ajukan **9 pertanyaan aktif: Q1–Q6, Q8–Q10** (§2, Q7 dihapus) → simpan jawaban.
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
| Q8 | Multi, maks 2 | Nilai inti → jangkar afirmasi |
| Q9 | Single | Gaya pesan → nada afirmasi |
| Q10 | Multi, maks 2 | Respons pengganti → bagian "maka" |

### Detail opsi tiap pertanyaan

**Q1 — Jam paling sering scrolling** (single)
- A. 05.00–08.59 (pagi, baru bangun/bersiap)
- B. 09.00–11.59 (jam kuliah/kerja)
- C. 15.00–17.59 (pulang/perjalanan)
- D. 21.00–23.59 (menjelang tidur)
- E. 00.00–04.59 (dinihari)

**Q2 — Jam rawan lain** (multi maks 2; boleh kosong)
- Opsi A–E sama seperti Q1, minus yang sudah dipilih di Q1
- Tambahan: "Tidak ada waktu lain" → jika dipilih, hapus centang lain

**Q3 — Situasi pemicu** (multi maks 3)
- A. Di tempat tidur (sebelum/saat sulit tidur)
- B. Baru bangun (sebelum beranjak kasur)
- C. Jeda aktivitas (istirahat kerja/kuliah, menunggu)
- D. Menunda tugas
- E. Sendirian di rumah/kamar

**Q4 — Kronotipe swalaporan** (single)
- A. Jelas tipe pagi · B. Lebih ke pagi · C. Netral · D. Lebih ke malam · E. Jelas tipe malam

**Q5 — Frekuensi tidur lebih larut karena scrolling** (single)
- A. Tidak pernah · B. Jarang (1–3 malam/bulan) · C. Kadang (1–2 malam/minggu) · D. Sering (3–5 malam/minggu) · E. Hampir tiap malam

**Q6 — Perasaan sebelum/saat scrolling** (multi maks 2)
- A. Bosan · B. Lelah · C. Kesepian · D. Stres/tertekan · E. Tidak merasakan apa-apa (otomatis)

**Q8 — Hal terpenting dalam hidup saat ini** (multi maks 2)
- A. Keluarga/orang terdekat · B. Belajar/karier · C. Kesehatan fisik-mental · D. Iman/spiritualitas · E. Kreativitas/hobi · F. Kebebasan finansial · G. Pertemanan/komunitas

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

### 3.2 Tipe & Subtipe Pengguna

Tipe dasar ditentukan dari **Q1 (waktu)**, subtipe dari Q3/Q4/Q5.

| Rentang waktu (Q1) | Tipe Dasar | Aturan Subtipe |
|---|---|---|
| 05.00–08.59 | Early Bird Scroller | Q3=B ("baru bangun") → tandai scrolling sebelum beranjak kasur |
| 09.00–11.59 | Office-Hour Scroller | Q3=D ("menunda tugas") → pelarian kerja; Q3=C ("jeda aktivitas") → pengisi jeda |
| 15.00–17.59 | Commuter Scroller | Q3 terkait perjalanan → scrolling saat bergerak/menunggu |
| 21.00–23.59 | **Night Owl** jika Q4 ∈ {D,E}; **Night Scroller** jika Q4 ∈ {A,B,C} | Q5 ∈ {D,E} → tandai "sering menunda tidur" |
| 00.00–04.59 | Midnight Wanderer | Q5 ∈ {D,E} → tandai "sering menunda tidur"; Q3=A ("di tempat tidur") → scrolling setelah berbaring |

⚠️ Label **"Night Owl"** secara ilmiah = kronotipe malam, bukan sekadar jam scrolling malam. Jangan tempel label ini hanya dari Q1 — wajib cek Q4 dulu.

### 3.3 Afirmasi — 4 Bagian Wajib

```
1. Pengakuan perasaan = f(Q6), disampaikan dgn nada f(Q9)
2. Jangkar nilai       = f(Q8)
3. Jika–maka           = situasi/jam f(Q1, Q3) → respons f(Q10), ditulis sbg AKSI, bukan larangan
4. Waktu tayang        = sebelum/saat jam rawan f(Q1, Q2)
```

Nada (Q9) menentukan gaya tulis bagian 1 & 3 — lembut (A), tegas (B), humor (C), faktual (D), reflektif (E).
*(Dokumen sumber baru menyediakan contoh lengkap untuk nada "lembut"; varian B–E perlu di-draft terpisah sebelum go-live.)*

**Contoh (profil: Night Owl, lelah+cemas, nilai keluarga, nada lembut, respons napas dalam):**
> "Kamu sudah berusaha seharian, wajar kalau lelah dan khawatir. Malam ini, tidur yang cukup lebih membantu menjaga keluargamu daripada satu kabar buruk lagi. Jam 21.00, saat tanganmu mulai membuka beranda, tarik napas dalam tiga kali dulu."

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
  "q8": ["A","B"],                  // maks 2
  "q9": "A|B|C|D|E",
  "q10": ["A","B"]                  // maks 2
}

// OUTPUT
{
  "jam_rawan": { "utama": "...", "tambahan": [...], "konteks": [...] },
  "tipe": { "dasar": "...", "subtipe_note": "...", "is_night_owl_valid": true },
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

## 7. ⚠️ Isu di Dokumen Sumber yang Perlu Diperbaiki

1. **Lettering Q1 vs tabel tipe (§4 dok asli) tidak sinkron.** Tabel tipe asli memakai 8 kategori (A–H) termasuk "E. 18.00–20.59 → Prime-Time Scroller" dan "H. Tidak menentu → All-Day Scroller", tapi Q1 final cuma punya 5 opsi (A–E) dan tidak punya rentang 18.00–20.59 atau opsi "tidak menentu". Akibatnya **Prime-Time Scroller** dan **All-Day Scroller** tidak pernah bisa muncul dari jawaban Q1 saat ini.
   → Resolusi yang dipakai di §3.2: mapping berdasarkan **rentang waktu**, bukan huruf, supaya 5 opsi Q1 yang ada tetap konsisten. Rekomendasi: tambah opsi Q1 "18.00–20.59" & "tidak menentu", atau hapus 2 tipe itu dari spec.
2. **Q2 merujuk "opsi A–G"** padahal Q1 (sumber opsinya) cuma A–E. Perlu diperbaiki jadi "A–E".
3. Beberapa referensi akademik (†) belum diverifikasi — jangan jadi dasar klaim ke pengguna/investor tanpa cek ulang.