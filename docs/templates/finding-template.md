# Template Temuan — Report Fraud

Template kosong untuk temuan baru. Salin file ini ke
`findings/F-XXX-<slug>.md`, isi semua bagian, lalu jalankan checklist
redaksi di bawah **sebelum** commit — `scripts/check-static.mjs`
menegakkan sebagian checklist ini otomatis di CI, tetapi penilaian
akhir tetap tanggung jawab penulis.

Struktur ini mengikuti F-006 (temuan pertama yang memakai template
ini): ringkasan → bukti → dampak → reproduksi generik → remediasi →
berkas terkait.

---

# F-XXX — <Judul temuan> (<host>)

**Severity:** <CRITICAL / TINGGI / SEDANG / RENDAH — alasan singkat>
**Host:** <URL host, tanpa kredensial di URL>
**Discovered:** <YYYY-MM-DD>

## Summary

<2–4 kalimat: apa yang terekspos / rentan, di mana, seberapa besar.
Tulis angka agregat (jumlah baris, jumlah akun, ukuran dump), bukan
nilai per orang.>

## Evidence

### 1. <Judul bukti pertama>
<Perintah / respons / daftar berkas yang membuktikan temuan. Nilai
contoh hanya boleh berupa pola umum — lihat checklist redaksi.>

### 2. <Judul bukti kedua>
<Skema tabel (nama tabel + nama kolom saja), endpoint (host internal
ditulis `<host-internal>`), atau tangkapan agregat.>

### 3. <Bukti lanjutan bila ada>
<Tambah nomor bila perlu; hapus bagian ini bila tidak ada.>

## Impact

1. <Dampak 1 — generik, tanpa nilai per orang>
2. <Dampak 2>
3. <Dampak 3 — tambah bila perlu>

## Reproduction

Langkah generik — tanpa kredensial atau nilai asli:

1. <Langkah 1 — mis. minta daftar direktori, amati respons>
2. <Langkah 2 — mis. baca skema dari dump yang terekspos>
3. <Langkah 3 — mis. login dengan kredensial hasil crack, tanpa
   menuliskan kredensialnya>
4. <Langkah lanjutan — akses dashboard / ekspor data>

## Remediation

1. <Langkah perbaikan 1 — yang paling mendesak dulu>
2. <Langkah perbaikan 2>
3. <Tambah bila perlu>

## Berkas terkait (yang dipublikasikan)

- `findings/F-XXX-<slug>.md` — temuan ini (versi redaksi)
- `evidence/<nama-berkas-agregat>` — hitungan / data agregat, bila ada

Dump mentah, sampel tanpa sensor, dan kredensial **tidak dilampirkan**
— disimpan di luar repo ini dan tidak dipublikasikan.

---

## Checklist redaksi (wajib sebelum publikasi)

Coret yang sudah diperiksa. Bila satu butir TIDAK lolos, temuan
**tidak boleh** di-merge.

- [ ] Tidak ada NIP (angka 16–18 digit berurutan) di mana pun —
      dicek otomatis `check-static.mjs`, tetapi baca ulang manual.
- [ ] Tidak ada hash password (32 karakter heksadesimal) — dicek
      otomatis. Hash boleh disebut sebagai "hash MD5" tanpa nilainya.
- [ ] Tidak ada NIK, nomor PIN, nama pembayar, atau nilai transaksi
      contoh yang terikat ke orang tertentu. Nilai contoh diganti
      pola umum (`[KTP]`, `[PIN]`, `[jumlah disensor]`).
- [ ] Tidak ada nama admin / staf / korban — tulis peran saja
      ("satu akun admin", "3 akun admin").
- [ ] Tidak ada host/IP internal asli — tulis `<host-internal>`.
- [ ] Tidak ada kunci API / token / password mentah, dan tidak ada
      perintah (mis. curl) yang berisi kredensial asli. Reproduksi
      ditulis generik.
- [ ] Tidak ada alamat surel individual — hanya agregat (aturan yang
      sama dengan temuan B; dicek otomatis).
- [ ] Dump mentah / sampel tanpa sensor TIDAK masuk repo — hanya
      temuan (redaksi) + berkas agregat. Periksa `git status` sebelum
      push: tidak ada `.sql`, `.dump`, atau sampel mentah.
- [ ] Tidak ada merek tim/perusahaan (nama tim apa pun) — repo tampil
      sebagai kerja pentester independen, bukan kerja tim. Dicek
      otomatis `check-static.mjs`.
- [ ] Angka agregat (jumlah baris, jumlah akun, ukuran dump) cocok
      dengan berkas agregat yang dilampirkan — ikat di
      `scripts/check-data.mjs` bila formatnya stabil.
- [ ] Tanggal ditemukan tertera, dan bagian Metodologi di `index.html`
      menyebut temuan ini berasal dari disclosure lanjutan (bukan
      laporan 29 April 2026) bila tanggalnya berbeda.
- [ ] `npm run validate` hijau lokal (atau CI hijau penuh) sebelum
      minta merge.
