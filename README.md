# Report Fraud — Laporan Keamanan USK 2026

Arsip publik laporan *responsible disclosure* keamanan Universitas Syiah
Kuala (29 April 2026): jejak defacement judi online, 35 surel terekspos,
dan 893 subdomain yang dipetakan secara pasif — disajikan sebagai situs
yang bisa dibaca, dicari, dan diverifikasi terhadap berkas aslinya.
Plus temuan kritis lanjutan F-006 (28 September 2026): dump SQL sistem
pembayaran H2H terekspos — dipublikasikan dalam versi redaksi.

**Live:** https://report-fraud.pages.dev/
**Repo:** https://github.com/dezzorigin/report-fraud

![Hero situs Report Fraud](docs/screenshots/landing-desktop.png)

## Apa isinya

Pada 29 April 2026, Nabil Aulia Dika (Informatika USK) menyusun laporan
keamanan untuk UPT TIK Universitas Syiah Kuala dari pemindaian OSINT
pasif atas `usk.ac.id`. Situs ini mengarsipkan laporan itu apa adanya:

| Temuan | Keparahan | Isi |
|---|---|---|
| A — Riwayat Web Defacement & SEO Poisoning | **TINGGI** | Jejak injeksi judi online (`BABEJUDI/`) di `fkep.usk.ac.id` dan `siakadup3ai.usk.ac.id`, plus backlink togel di `sibela` dan `sippan` |
| B — Eksposur Data Publik | SEDANG | 35 alamat surel institusi fungsional terekspos (30 di @usk.ac.id, 5 di subdomain) |
| C — Pemetaan Subdomain / Attack Surface | SEDANG | 893 subdomain/host; aset berisiko tinggi `dev.fk.usk.ac.id` dan `perwaliandev.usk.ac.id` |
| D — Eksposur Dump SQL Sistem Pembayaran H2H (F-006, 28 Sep 2026) | **KRITIS** | Direktori `/db/` di `h2h.usk.ac.id` terekspos: 171.235 transaksi + 15.000 PIN; 3 akun admin MD5; pengambilalihan admin terkonfirmasi — versi redaksi, tanpa data per orang |

Plus 4 rekomendasi mitigasi (file auditing, pembatasan lingkungan
development, audit DNS, penutupan eksposur dump H2H) dan penjelajah 893 host yang bisa dicari dan
difilter.

![Temuan A — bukti defacement](docs/screenshots/temuan-desktop.png)

## Penjelajah subdomain

Seluruh 893 host dari lampiran laporan, bisa dicari (`dev` → 6 host) dan
difilter per kategori (Dev & staging 6, Webmail 8, Mail 25, Fakultas 256,
Layanan 594, Lainnya 4). Data dimuat langsung dari
`full_hosts_scan_usk.txt` — satu sumber kebenaran, bukan salinan.

![Penjelajah — cari "dev"](docs/screenshots/explorer-desktop.png)

## Berkas asli

| Berkas | Isi |
|---|---|
| `Security_Disclosure_USK_2026.pdf` | Laporan utama (2 halaman, A4, 94.459 byte) |
| `full_hosts_scan_usk.txt` | Data mentah (979 baris: 35 surel, 17 alamat IP terhitung, 893 host) |
| `findings/F-006-h2h-sqldump.md` | Temuan F-006 (28 Sep 2026, KRITIS) — versi redaksi (6.614 byte) |
| `evidence/h2h-payments-counts.txt` | Hitungan agregat ekspor laporan pembayaran (24 jenis, total 3.629 baris) |

Kedua berkas dipindahkan byte-identik dari subfolder `unsyiah/` ke root
repo saat restructure (PR #1) — isinya tidak diubah.

![Berkas & data mentah](docs/screenshots/berkas-desktop.png)

## Video demo

![Video demo Report Fraud](docs/demo/demo.mp4)

Video walkthrough (hero → temuan → penjelajah → berkas), direkam dari
sistem live lokal. Lihat `docs/demo/demo.mp4`.

## Cara menjalankan lokal

Situs statis — tanpa build, tanpa dependensi produksi:

```bash
npm run serve        # http://127.0.0.1:8393
```

Pengujian (instalasi dependensi jalan di CI — `npm install` di VM dev
saat ini gagal deterministik, lihat `docs/testing.md` § "Batas VM dev"):

```bash
npx html-validate index.html
npm run validate     # gate P0 anti-slop + integritas data lampiran
python3 scripts/advisory-sweep.py   # OSV batch, 0 paket produksi
npx playwright test  # e2e desktop + mobile (CI)
npm run smoke        # smoke folder repo (persis yang di-deploy)
```

## Privasi & kejujuran data

- Alamat surel individual **tidak ditampilkan** di halaman ini — hanya
  agregat (35; 30 langsung + 5 subdomain). Daftar lengkap tetap ada di
  lampiran mentah untuk tim UPT TIK USK.
- Tidak ada branding tim/perusahaan di repo ini — situs tampil sebagai
  kerja pentester independen (dicek otomatis di CI).
- Temuan mencerminkan kondisi **29 April 2026** (temuan A–C) dan
  **28 September 2026** (temuan D, F-006) — bukan status USK saat
  ini. Situs ini arsip, bukan alat pemindai, dan tidak menambahkan
  temuan dari pemindaian sendiri; temuan D berasal dari disclosure
  lanjutan yang diserahkan penulis, dipublikasikan dalam versi redaksi.
- Temuan D (F-006) **disensor**: NIP, nama admin, hash password, NIK,
  PIN, nama pembayar, dan host internal tidak ditampilkan — hanya
  agregat, struktur skema, dampak, dan remediasi. Dump SQL mentah
  tidak dilampirkan. Aturan redaksi: `docs/templates/finding-template.md`;
  dicek otomatis di CI (`scripts/check-static.mjs`).
- Header lampiran mengklaim 19 alamat IP server, tetapi Bagian 2 hanya
  memuat 17 baris. Selisih ini dicatat di `docs/API.md` dan bagian
  Metodologi — bukan dikoreksi diam-diam.

## Dokumentasi

- PRD: [`docs/PRD.md`](docs/PRD.md)
- Desain (referensi: Framler Security): [`docs/DESIGN.md`](docs/DESIGN.md)
- Arsitektur: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Kontrak data: [`docs/API.md`](docs/API.md)
- Diagram: [`docs/diagrams.html`](docs/diagrams.html)
- Deploy: [`docs/deploy.md`](docs/deploy.md)
- Pengujian: [`docs/testing.md`](docs/testing.md)

## Lisensi

MIT — lihat [LICENSE](./LICENSE).
