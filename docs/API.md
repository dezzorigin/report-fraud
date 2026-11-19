# API.md — Kontrak Data & Endpoint Statis

Repo ini tidak punya API server. Dokumen ini mendefinisikan kontrak data
yang dipakai situs: format lampiran mentah, aturan klasifikasi penjelajah,
dan endpoint statis yang disajikan Cloudflare Pages.

## 1. Endpoint statis (same-origin)

| Path | Isi | Content-Type |
|---|---|---|
| `/` | `index.html` — halaman arsip | `text/html` |
| `/styles.css` | Gaya situs | `text/css` |
| `/app.js` | Logika penjelajah + tombol salin | `text/javascript` |
| `/favicon.svg` | Marka RF | `image/svg+xml` |
| `/og-image.png` | Screenshot hero 1200x630 | `image/png` |
| `/Security_Disclosure_USK_2026.pdf` | Laporan asli (94.459 byte) | `application/pdf` |
| `/full_hosts_scan_usk.txt` | Data mentah (21.169 byte) | `text/plain` |

Tidak ada endpoint lain. Tidak ada query parameter yang diproses server.

## 2. Format `full_hosts_scan_usk.txt`

Satu file teks, 979 baris, 3 bagian:

```
Bagian 1 — EXPOSED EMAILS (35)
  35 baris alamat surel, satu per baris.
  Sebaran: 30 di @usk.ac.id langsung, 5 di subdomain
  (feb 1, fkip 2, fmipa 1, mhs 1).

Bagian 2 — EXPOSED SERVER IP ADDRESSES (19 — klaim header)
  17 baris alamat IPv4 yang terhitung (lihat §5 selisih).

Bagian 3 — EXPOSED SUBDOMAINS & HOSTS (893)
  893 baris, satu host per baris. Bentuk baris:
    <host>                     — host polos (820 baris)
    <host>:<IPv4>              — pasangan host→IP (37 baris)
    <host>:<nama-host>         — rujukan silang (32 baris)
    <host>:aspmx.l.google.com  — catatan MX Google (4 baris)
  Termasuk 4 entri wildcard bermasker (`*.usk.ac.id` dkk).
```

Parser (`app.js:parseHosts` dan `scripts/check-data.mjs`) memakai aturan
yang sama: cari baris yang mengandung `PART 3`, ambil semua baris
non-kosong setelahnya, `host = raw.split(':')[0]`.

## 3. Aturan klasifikasi penjelajah

Diterapkan per host (setelah memisahkan akhiran `:`), urutan pertama yang
cocok menang:

| # | Aturan | Kategori | Jumlah |
|---|---|---|---|
| 1 | Host mengandung `*` | Lainnya | 4 |
| 2 | Ada label yang == `dev`, berawalan `dev`, atau berakhiran `dev` | Dev & staging | 6 |
| 3 | Label pertama == `webmail` | Webmail | 8 |
| 4 | Label pertama == `mail` | Mail | 25 |
| 5 | Ada label kode fakultas: fk, fkip, feb, fh, ft, fmipa, fkp, fkh, fkg, fisip, fp, tp, sps | Fakultas | 256 |
| 6 | Selain itu | Layanan | 594 |

Total: 4 + 6 + 8 + 25 + 256 + 594 = **893**. Hitungan ini diikat oleh
`scripts/check-data.mjs` — bila lampiran berubah, CI gagal sampai angka
diperbarui dengan sadar.

**Kejujuran:** klasifikasi ini adalah pengelompokan otomatis berdasarkan
nama host, dibuat untuk situs ini — **bukan** label dari laporan. Situs
menyatakannya di bawah penjelajah dan di sini. Contoh yang perlu dibaca
dengan hati-hati: `labcomdev.fp.usk.ac.id` masuk Dev & staging karena
labelnya berakhiran `dev` (lab komputer development), bukan karena
laporan menyebutnya lingkungan development.

## 4. Kontrak tampilan penjelajah

- Pencarian: substring case-insensitive pada host DAN baris mentah.
- Paginasi: 50 baris/halaman; tombol Sebelumnya/Berikutnya + info
  "Halaman X dari Y".
- Meta hasil (`aria-live="polite"`): "Menampilkan A–B dari N host
  (difilter dari 893 host di lampiran) · data: full_hosts_scan_usk.txt,
  29 April 2026."
- Bila fetch TXT gagal: tampilkan pesan error + tautan unduh langsung.
- Alamat surel individual TIDAK PERNAH dirender — hanya agregat
  (dicek `scripts/check-static.mjs`).

## 5. Selisih data sumber (dicatat, bukan disembunyikan)

| Klaim | Terhitung | Status |
|---|---|---|
| Header: 35 surel | Bagian 1: 35 baris | Cocok |
| Header: 893 subdomain/host | Bagian 3: 893 baris | Cocok |
| Header Bagian 2: 19 alamat IP | Bagian 2: **17 baris** | **Selisih 2** |

Bagian 2 memuat 17 alamat IPv4 (baris 63–79 file; baris 80 kosong).
Header file mengklaim 19. Situs menampilkan angka **terhitung (17)**
di kartu berkas dan mencatat selisihnya di sini + di bagian Metodologi
halaman. `scripts/check-data.mjs` mengeluarkan peringatan untuk selisih
ini (bukan kegagalan build — datanya milik sumber, bukan milik situs).
