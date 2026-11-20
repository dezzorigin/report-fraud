# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Media README diregenerasi dari situs lokal (`npm run screenshots` +
  `npm run make-video`): 4 screenshot yang direferensikan README
  (`docs/screenshots/landing-desktop.png`, `temuan-desktop.png`,
  `explorer-desktop.png`, `berkas-desktop.png`) + video demo
  (`docs/demo/demo.mp4`, 20 detik, 1280×720) tidak pernah ter-commit
  sehingga gambarnya rusak di GitHub — kini ada di repo dan
  terverifikasi visual (screenshot asli aplikasi, bukan placeholder).
- Referensi video demo di README diubah dari embed gambar langsung
  (`![](...mp4)`, tidak dirender GitHub) menjadi thumbnail klik
  (screenshot landing) + tautan mp4.
- `og-image.png` diregenerasi dari hero (1200×630).

## [1.1.0] — 2026-11-19

### Added
- Temuan D (F-006, KRITIS, 28 September 2026): eksposur dump SQL
  sistem pembayaran H2H (`h2h.usk.ac.id`) — 171.235 transaksi +
  15.000 PIN, 3 akun admin MD5, pengambilalihan admin terkonfirmasi.
  Dipublikasikan dalam **versi redaksi** (tanpa NIP, nama admin, hash,
  NIK, PIN, nama pembayar, host internal); dump SQL mentah tidak
  dilampirkan.
- `findings/F-006-h2h-sqldump.md` (temuan redaksi) +
  `evidence/h2h-payments-counts.txt` (hitungan agregat: 24 jenis
  pendaftaran, total 3.629 baris) + tabel agregat di halaman temuan D.
- `docs/templates/finding-template.md` — template temuan kosong
  mengikuti struktur F-006 + checklist redaksi wajib sebelum publikasi.
- Gate privasi diperluas (`scripts/check-static.mjs`): tolak pola NIP
  (16–18 digit), hash MD5 (32 heksadesimal), dan IPv4 literal di berkas
  temuan; tolak merek tim/perusahaan di repo mana pun (repo tampil
  sebagai kerja pentester independen). `scripts/check-data.mjs`
  memvalidasi agregat payment (24 jenis, total 3.629).
- E2E: `.finding` 4; asersi temuan D + redaksi (tanpa pola NIP/hash di
  render) + berkas F-006/counts 200. Smoke: cek temuan D + berkas baru.
- Rekomendasi mitigasi ke-4 (penutupan eksposur dump SQL H2H).

### Changed
- Hitungan temuan: 3 → 4 (1 KRITIS, 1 TINGGI, 2 SEDANG); statistik hero
  +1 KRITIS; bagian Metodologi mencatat temuan D berasal dari disclosure
  lanjutan 28 September 2026, bukan laporan 29 April 2026.

## [1.0.0] — 2026-11-19

### Added
- Situs arsip laporan disclosure keamanan USK (29 April 2026) sebagai
  situs statis: ringkasan eksekutif, 3 temuan + bukti, penjelajah 893
  subdomain (cari + 7 filter kategori + paginasi), 3 rekomendasi
  mitigasi, metodologi, berkas & data mentah.
- Link preview (9 tag OG/Twitter) + `og-image.png` 1200x630 dari
  screenshot asli.
- CI (4 job): html-validate + gate P0 + integritas data, OSV
  advisory-sweep, Playwright e2e (desktop + mobile), smoke folder repo.
- Docs lengkap: PRD, DESIGN (referensi Framler Security), ARCHITECTURE,
  API, diagrams.html, deploy, testing + screenshot & video demo.
- Deploy live Cloudflare Pages: https://report-fraud.pages.dev/

### Changed
- Restructure: `unsyiah/Security_Disclosure_USK_2026.pdf` dan
  `unsyiah/full_hosts_scan_usk.txt` dipindah byte-identik ke root repo;
  subfolder `unsyiah/` dihapus.
- README/PRD template generik diganti dokumen asli (produk ini arsip
  laporan disclosure, bukan "Static Web").
- `.gitignore` diperkuat (node_modules, dist, .env, artefak Playwright).

### Fixed
- Tidak ada lagi klaim `npm install` / `npm run dev` untuk repo yang
  semula tanpa satu baris kode.
- Selisih data sumber didokumentasikan: header lampiran mengklaim 19
  alamat IP, Bagian 2 hanya memuat 17 baris (lihat `docs/API.md`).
