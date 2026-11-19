# ARCHITECTURE.md — Report Fraud

## Ringkasan

Situs statis murni tanpa build step dan tanpa dependensi produksi. Folder
repo adalah folder deploy: Cloudflare Pages mengunggah root repo apa
adanya. Satu-satunya data dinamis adalah `full_hosts_scan_usk.txt`, yang
diambil (fetch) oleh `app.js` saat runtime dan diparse di browser.

```
Pengunjung ──▶ Cloudflare Pages (report-fraud.pages.dev)
                   ├── index.html          (halaman arsip, OG tags)
                   ├── styles.css          (Desain: docs/DESIGN.md)
                   ├── app.js              (penjelajah + tombol salin)
                   ├── favicon.svg
                   ├── og-image.png        (screenshot asli, 1200x630)
                   ├── Security_Disclosure_USK_2026.pdf   (berkas asli)
                   └── full_hosts_scan_usk.txt            (data mentah)
                          ▲
                          │ fetch (runtime, same-origin)
                          │
                     app.js: parse Bagian 3 → 893 host → cari/filter
```

## Struktur repo

| Path | Isi |
|---|---|
| `index.html` | Satu halaman: masthead, hero/ringkasan, temuan A/B/C/D, penjelajah, mitigasi, metodologi, berkas, footer. Tag OG/Twitter di `<head>`. |
| `styles.css` | Seluruh gaya. Token warna di `:root`. Radius 0, tanpa bayangan, tanpa gradient. |
| `app.js` | Penjelajah (fetch + parse + cari/filter/paginasi) + tombol salin URL bukti. Vanilla JS, tanpa framework. |
| `favicon.svg` | Marka "RF" + garis segel merah. |
| `og-image.png` | Kartu preview 1200x630 (digambar PIL mengikuti palet situs — bukan screenshot, karena Chrome VM tidak bisa start). |
| `Security_Disclosure_USK_2026.pdf` | Laporan asli (byte-identik dari `unsyiah/`, blob SHA `0b8df26a…`). |
| `full_hosts_scan_usk.txt` | Data mentah (byte-identik dari `unsyiah/`, blob SHA `5fde7c23…`). |
| `findings/F-006-h2h-sqldump.md` | Temuan D (F-006, KRITIS, 28 Sep 2026) — versi redaksi. |
| `evidence/h2h-payments-counts.txt` | Hitungan agregat ekspor laporan pembayaran (24 jenis, total 3.629). Dirender statis di tabel temuan D; berkasnya bisa diunduh. |
| `docs/templates/finding-template.md` | Template temuan kosong + checklist redaksi. |
| `package.json` | Hanya devDependencies: Playwright, puppeteer-core, html-validate. `engines.node >= 22`. |
| `scripts/` | `check-static.mjs` (gate P0 + restructure + OG + privasi), `check-data.mjs` (integritas data), `advisory-sweep.py` (OSV batch), `smoke.mjs`, `screenshot.mjs`, `make-video.mjs`. |
| `e2e/` | Playwright spec (desktop + mobile). |
| `docs/` | PRD, DESIGN, ARCHITECTURE, API, diagrams.html, deploy, testing, screenshots, demo. |
| `.github/workflows/ci.yml` | 4 job: static-checks, advisory-sweep, playwright-e2e, smoke. |
| `.htmlvalidate.json` | Konfigurasi html-validate (recommended). |

## Alur data penjelajah

1. `app.js` fetch `full_hosts_scan_usk.txt` (same-origin, 21 KB).
2. Cari penanda `PART 3`; tiap baris non-kosong setelahnya = 1 host.
3. Per baris: `host = raw.split(':')[0]`; akhiran setelah `:` diklasifikasikan
   jadi catatan (`IP x.x.x.x` / `MX Google` / `rujukan silang` / `catatan: …`).
4. `classify(host)` (aturan di `docs/API.md`) → kategori.
5. Render 50 baris/halaman; cari memfilter substring (host + baris mentah);
   chip memfilter kategori; hitungan per kategori dihitung dari data.
6. Bila fetch gagal: tampilkan pesan error + tautan unduh langsung.

## Keputusan arsitektur

- **Tanpa framework/build.** Situs ini dokumen + satu widget cari. Vite/
  React hanya menambah rantai build untuk nol manfaat — dan menambah
  permukaan advisory. (Bandingkan repo #38 yang butuh React karena gamenya
  stateful; di sini tidak.)
- **Tanpa dependensi produksi.** Satu-satunya runtime pihak ketiga adalah
  Google Fonts (Newsreader + Archivo). Bila font gagal dimuat, fallback
  serif/sans sistem tetap menjaga hierarki.
- **Data mentah sebagai sumber kebenaran.** Penjelajah TIDAK menyalin 893
  host ke dalam JS — ia membaca TXT yang sama dengan yang diunduh
  pengunjung. Satu file berubah → situs dan unduhan berubah bersama.
- **Deploy = root repo.** Tidak ada tahap staging/packing; yang diuji smoke
  adalah persis folder yang di-deploy. Konsekuensinya `docs/` dan
  `scripts/` ikut ter-deploy (publik, tanpa secret) — diterima dengan
  sadar: semua itu memang sudah publik di GitHub.
- **PDF/TXT di root, bukan `public/`.** URL unduhan bersih
  (`/Security_Disclosure_USK_2026.pdf`) dan sama dengan path di repo.

## Restructure (PR #1)

| Asal | Tujuan | Cara |
|---|---|---|
| `unsyiah/Security_Disclosure_USK_2026.pdf` | `Security_Disclosure_USK_2026.pdf` | Pindah byte-identik (blob SHA `0b8df26a…` dipakai ulang) |
| `unsyiah/full_hosts_scan_usk.txt` | `full_hosts_scan_usk.txt` | Pindah byte-identik (blob SHA `5fde7c23…` dipakai ulang; diverifikasi `sha1("blob 21169\0"+isi)`) |
| `unsyiah/` | — (dihapus) | Entri `sha:null` di tree push, difilter terhadap base tree |

## Penambahan (PR #2)

| Asal | Tujuan | Cara |
|---|---|---|
| Zip `Universitas_Syiah_Kuala.zip` → `usk-payment/` | `findings/F-006-h2h-sqldump.md` (versi redaksi) + `evidence/h2h-payments-counts.txt` (agregat) | Ditulis ulang sebagai temuan redaksi — tanpa NIP/nama/hash/NIK/PIN/host internal; dump mentah tidak ikut |
| — | `docs/templates/finding-template.md` | Template kosong mengikuti struktur F-006 + checklist redaksi |
| `usk-disclosure/` di zip yang sama | — (tidak ditambah) | Isinya byte-identik dengan PDF + TXT yang sudah live sejak PR #1 |

Tidak ada konflik path di root: tidak ada file root yang bernama sama
dengan isi subfolder. README/PRD/LICENSE/.gitignore/CHANGELOG/
CODE_OF_CONDUCT.md lama tetap di root (ditulis ulang isinya bila perlu,
bukan dipindah).
