# Changelog

All notable changes to this project will be documented in this file.

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
