# testing.md — Pengujian

## Piramida pengujian

| Lapisan | Alat | Perintah |
|---|---|---|
| Validasi HTML | html-validate 11 (Node ≥ 22) | `npx html-validate index.html` |
| Gate P0 + restructure + OG + privasi | `scripts/check-static.mjs` | `npm run validate` |
| Integritas data lampiran | `scripts/check-data.mjs` | `npm run validate` |
| Advisory (produksi) | OSV batch `scripts/advisory-sweep.py` | `python3 scripts/advisory-sweep.py` |
| E2E desktop + mobile | Playwright | `npx playwright test` |
| Smoke folder deploy | `scripts/smoke.mjs` | `npm run smoke` |

Semua lapisan di atas berjalan di CI (`.github/workflows/ci.yml`, 4 job)
pada tiap push dan PR ke `main`.

## Menjalankan lokal

```bash
# Instalasi lokal TIDAK BISA jalan di VM dev saat ini (lihat "Batas VM
# dev" di bawah) — pakai CI untuk install + e2e. Untuk html-validate
# lokal, symlink node_modules dari repo P1 lain sudah cukup (lihat bawah).
npx html-validate index.html
npm run validate          # check-static + check-data
python3 scripts/advisory-sweep.py
npm run serve             # http://127.0.0.1:8393 (terminal lain)
npx playwright test       # butuh PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
npm run smoke
```

## Batas VM dev (temuan 19 Nov 2026, BUKAN intermiten)

VM dev hasil penggantian ~04:30 WIB 19 Nov 2026 memberlakukan aturan
sandbox yang deterministik — jangan buang waktu mengulang perintah yang
sudah terbukti gagal di pola yang sama:

1. **Tulis file sesudah I/O jaringan = EPERM.** Dalam satu sesi `exec`,
   begitu ada proses yang melakukan I/O jaringan, SEMUA tulis file
   berikutnya di sesi itu gagal `EPERM: operation not permitted, write`
   — terbukti: tulis lokal OK sebelum `curl`, gagal sesudahnya (proses
   node berbeda, sesi sama). Akibatnya `npm install`/`npm ci` gagal
   deterministik di fetch packument (npm fetch lalu tulis cache dalam
   satu proses), begitu pula `curl -o`, `cp`, `rsync`, dan pipe
   `curl | node-writer`. Tulis file HANYA bisa lewat proses yang sama
   sekali tidak menyentuh jaringan, atau lewat `muse.write`.
   Konsekuensi: repo ini **belum punya package-lock.json**; CI memakai
   `npm install` (bukan `npm ci`) + tanpa `cache: npm`, dan mengunggah
   lockfile hasil instalasi sebagai artifact supaya bisa di-commit
   belakangan. `scripts/advisory-sweep.py` mentolerir lockfile yang
   belum ada (0 paket produksi).
2. **Chrome/Chromium tidak bisa start.** `mmap` dengan `MAP_SHARED`
   pada memfd ditolak EPERM secara deterministik (terbukti via python
   `mmap` + strace Chrome: gagal tepat setelah `memfd_create`, lalu
   Chrome `SIGTRAP`). Semua build di cache (`chromium-1234`,
   `chromium-1255`, `headless_shell`) mati sama. Akibatnya
   **screenshot, video demo, dan e2e TIDAK BISA jalan lokal** —
   ketiganya mengandalkan CI (Playwright install + run di runner) dan
   tangkapan layar dari browser live untuk `og-image.png` +
   `docs/screenshots/` (lihat bawah). Jangan `npx playwright install
   chromium` di VM ini (menghapus cache browser tooling video-demo).
3. **Firefox tidak bisa diunduh ke disk** (aturan 1: fetch 90 MB lalu
   tulis = EPERM; 8/8 percobaan gagal, termasuk via pipe antar-proses
   dalam sesi yang sama). Jangan ulangi.
4. `muse.write`/`muse.edit` tidak terpengaruh aturan 1–3 (jalur lain).

Untuk html-validate lokal tanpa `npm install`: symlink paket dari repo
P1 lain sudah cukup (resolusi Node mengikuti symlink ke tree asal):
`node_modules/@playwright`, `playwright`, `playwright-core`,
`puppeteer-core`, `html-validate` — lihat `docs/deploy.md` bila perlu
dibuat ulang. `node_modules/` di-`.gitignore` dan tidak ikut push.

Khusus repo ini:

- **PDF laporan** (`Security_Disclosure_USK_2026.pdf`) tidak selalu bisa
  diunduh ke disk VM dev saat EPERM aktif. `scripts/smoke.mjs` dan
  `e2e/site.spec.ts` (env `ALLOW_MISSING_PDF=1`) melonggarkan asersi
  status HTTP PDF **hanya lokal** — keberadaan PDF di tree ditegakkan
  oleh `check-static.mjs`, dan CI (yang punya berkasnya) mengecek penuh.
- **Chromium lokal**: pakai cache `~/.cache/ms-playwright/chromium-1234`.
  JANGAN `npx playwright install chromium` di VM ini (menghapus cache
  browser tooling video-demo). Di CI, browser di-install workflow.
- **Font Google** di headless Chrome butuh forwarder `127.0.0.1:18081`
  (lihat `scripts/screenshot.mjs`); tanpanya font jatuh ke fallback.

## Screenshot & video demo

```bash
npm run serve            # terminal 1
npm run screenshots      # terminal 2 — docs/screenshots/*.png + og-image.png
npm run make-video       # docs/demo/demo.mp4 (ffmpeg zoompan)
```

**STATUS 19 Nov 2026: langkah ini TERBLOKIR di VM dev** (Chrome mati —
`MAP_SHARED` EPERM, lihat "Batas VM dev" di atas). `og-image.png`
1200x630 sudah ada — digambar PIL mengikuti palet situs (bukan
screenshot) saat follow-up PR #1, dan lolos gate check-static + e2e.
Screenshot `docs/screenshots/` + video demo tetap dibuat dari
**browser live terhadap situs Pages yang sudah deploy** (bukan dari
VM), lalu di-commit sebagai follow-up. Adegan video: hero desktop,
temuan desktop, penjelajah desktop (cari "dev"), penjelajah mobile,
berkas desktop — masing-masing 5 detik, 1280x720.

## Yang dicek e2e

- Hero + 9 tag OG/Twitter + tautan GitHub + tautan unduh PDF.
- 4 kartu temuan, badge KRITIS/TINGGI/SEDANG, tombol salin → "Disalin",
  surel individual tidak dirender; temuan D menampilkan agregat H2H
  dan lolos asersi redaksi (tanpa pola NIP/hash di render).
- Penjelajah: muat 893 host; cari `dev` → 6; filter Webmail → 8;
  filter Fakultas + cari `simkuliah` → 1 (`simkuliah.fkip.usk.ac.id`).
- Berkas: TXT 200 + memuat `PART 3`; PDF 200 + `application/pdf`;
  og-image 200 + `image/*`; temuan F-006 200 + lolos redaksi;
  hitungan agregat 200 + memuat `TOTAL rows=3629`.
- Mobile: tanpa scroll horizontal (`scrollWidth - clientWidth == 0`).

## Gate redaksi (PR #2)

`scripts/check-static.mjs` menegakkan redaksi F-006: pola NIP
(16–18 digit), hash MD5 (32 heksadesimal), dan IPv4 literal di berkas
temuan dilarang; merek tim/perusahaan dilarang tampil di file mana pun.
`scripts/check-data.mjs` mengikat agregat payment (24 jenis, total
3.629). Aturan lengkap + checklist manual:
`docs/templates/finding-template.md`.

## Gate 7 sumbu (sebelum merge)

Lihat laporan PR — tiap sumbu minimal 4/5. Tes siluet: kecilkan
screenshot landing ke thumbnail hitam-putih — masih ketahuan ini arsip
laporan keamanan (sampul berkas + segel + daftar temuan), bukan landing
produk generik.
