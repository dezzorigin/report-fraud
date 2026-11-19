# PRD — Report Fraud

## 1. Informasi Proyek

| Field | Nilai |
|---|---|
| Nama Proyek | Report Fraud |
| Produk | Situs arsip laporan disclosure keamanan USK (situs statis) |
| Status | Proper (P1 #39) — live di Cloudflare Pages |
| Penanggung Jawab | Nabil Aulia Dika |
| Versi Dokumen | 2.0 (rewrite total dari template v1.0) |
| Tanggal | 19 November 2026 |
| Laporan yang diarsipkan | Security_Disclosure_USK_2026.pdf, 29 April 2026 |
| Live | https://report-fraud.pages.dev/ |
| Repo | https://github.com/dezzorigin/report-fraud |

## 2. Latar Belakang

Pada 29 April 2026, Nabil Aulia Dika (Informatika USK, NPM 250810701100090)
menyusun laporan *responsible disclosure* untuk UPT TIK Universitas Syiah
Kuala: pemindaian OSINT pasif atas `usk.ac.id` menemukan jejak riwayat
defacement judi online, 35 surel institusi terekspos, dan 893
subdomain/host. Laporan (PDF 2 halaman) + data mentah (TXT 3 bagian)
disimpan di repo ini — semula di subfolder `unsyiah/`, tanpa situs yang
menyajikannya.

Repo ini mengubah arsip itu menjadi situs yang bisa dibaca orang: laporan
lengkap sebagai halaman web, penjelajah 893 host yang bisa dicari/difilter,
dan unduh berkas asli. Situs ini **bukan** alat pemindai dan **bukan**
penilaian kondisi USK saat ini — ia mengarsipkan laporan 29 April 2026 apa
adanya.

## 3. Masalah yang Diselesaikan

1. Laporan hanya ada sebagai PDF di dalam repo — tidak bisa dibaca tanpa
   mengunduh, tidak bisa ditautkan per temuan, tidak bisa dicari.
2. Daftar 893 host hanya ada sebagai TXT mentah — UPT TIK tidak bisa
   memfilter (mis. "mana saja host development?") tanpa mengolah sendiri.
3. README/PRD lama adalah template generik ("Static Web", `npm install` /
   `npm run dev` untuk repo tanpa satu baris kode) — menyesatkan.

## 4. Tujuan & Sasaran

- Menyajikan laporan lengkap sebagai halaman web yang bisa dibaca,
  ditautkan per bagian, dan diverifikasi terhadap berkas asli.
- Membuat 893 host bisa dicari/difilter di browser, dari data mentah yang
  sama (satu sumber kebenaran).
- Menjaga privasi: alamat surel individual tidak dirender di UI — hanya
  agregat + tautan ke lampiran untuk UPT TIK.
- Semua angka di situs bisa dilacak ke laporan/lampiran; selisih data
  sumber dicatat, bukan dikoreksi diam-diam.

## 5. Ruang Lingkup

### In Scope
- Halaman arsip: ringkasan eksekutif, 3 temuan + bukti, 3 rekomendasi,
  metodologi & ruang lingkup, berkas & data mentah.
- Penjelajah subdomain: cari + 7 filter kategori + paginasi, dimuat dari
  `full_hosts_scan_usk.txt` saat runtime.
- Unduh berkas asli (PDF + TXT) dari root repo.
- Link preview (OG + Twitter Card) + favicon.
- CI: html-validate, gate P0 anti-slop, integritas data, OSV sweep,
  Playwright e2e, smoke folder deploy.

### Out of Scope
- Pemindaian baru / temuan baru — situs ini arsip, bukan scanner.
- Pelacakan status perbaikan di USK — tidak ada data tindak lanjutnya.
- Backend, akun, atau database apa pun.
- Perubahan isi laporan/lampiran (dipindah byte-identik ke root).

## 6. Fitur & Persyaratan Fungsional

| # | Fitur | Detail |
|---|---|---|
| F1 | Ringkasan eksekutif | Teks §2 laporan + tabel meta pelapor (nama, NPM, prodi, tanggal, metode, target) + 4 angka utama. |
| F2 | Temuan A (TINGGI) | Deskripsi + 4 URL bukti sebagai teks (bukan tautan aktif) + tombol salin per URL. |
| F3 | Temuan B (SEDANG) | Deskripsi + agregat surel (35; 30 langsung + 5 subdomain) + motif pita redaksi; alamat individual tidak dirender. |
| F4 | Temuan C (SEDANG) | Deskripsi + 2 aset berisiko tinggi + tautan ke penjelajah. |
| F5 | Penjelajah subdomain | Cari (substring, host + baris mentah) + filter 7 kategori + paginasi 50/halaman + hitungan per kategori. Data dari `full_hosts_scan_usk.txt` Bagian 3. |
| F6 | Rekomendasi mitigasi | 3 item dari §4 laporan + status jujur "Diajukan dalam laporan". |
| F7 | Metodologi | Metode, tanggal, target, batas laporan, catatan selisih IP. |
| F8 | Berkas | Kartu unduh PDF (94.459 byte) + TXT (21.169 byte, 979 baris) + kartu repo GitHub. |
| F9 | Navigasi | Masthead (Ringkasan/Temuan/Penjelajah/Mitigasi/Berkas + logo GitHub) + rel daftar isi + footer satu kolom. |
| F10 | Link preview | 9 tag OG/Twitter di `index.html` + `og-image.png` 1200x630 (screenshot asli). |

## 7. Persyaratan Non-Fungsional

- **Performa:** situs statis, tanpa dependensi produksi; satu-satunya
  fetch runtime adalah TXT lampiran (21 KB). Target: First Contentful
  Paint < 1 detik di Pages.
- **Keamanan:** tidak ada secret ke-commit (dicek `check-static.mjs`);
  tidak ada backend; tidak ada pelacakan.
- **Privasi:** alamat surel individual tidak dirender (dicek otomatis);
  daftar lengkap hanya di lampiran TXT untuk UPT TIK.
- **Aksesibilitas:** skip link, label pada semua kontrol, `aria-pressed`
  pada chip filter, `aria-live` pada meta hasil, kontras teks lolos AA,
  `prefers-reduced-motion` dihormati, target sentuh min 44px, tanpa
  scroll horizontal di 390px.
- **Kejujuran data:** semua angka terverifikasi terhadap lampiran oleh
  `scripts/check-data.mjs` (surel 35, host 893, kategori 594/256/25/8/6/4).
  Selisih IP (header klaim 19, terhitung 17) dicatat sebagai peringatan,
  bukan disembunyikan.
- **Portabilitas:** HTML+CSS+JS vanilla; jalan di server statis mana pun.

## 8. Arsitektur & Tech Stack

Situs statis murni: `index.html` + `styles.css` + `app.js` + berkas asli
(PDF/TXT) + `og-image.png` + `favicon.svg`. Tanpa framework, tanpa build
step, tanpa dependensi produksi. DevDependencies hanya untuk tooling:
Playwright (e2e), puppeteer-core (screenshot), html-validate. Detail:
`docs/ARCHITECTURE.md`. Deploy: Cloudflare Pages direct-upload (folder
repo = folder deploy). Detail: `docs/deploy.md`.

## 9. Milestone / Roadmap

| Fase | Status |
|---|---|
| Laporan disclosure (29 Apr 2026) | ✅ Selesai (PDF + TXT di repo) |
| Restructure `unsyiah/` → root | ✅ PR #1 (19 Nov 2026) |
| Situs arsip + penjelajah | ✅ PR #1 |
| CI + docs lengkap | ✅ PR #1 |
| Deploy Pages `report-fraud` | ✅ PR #1 |
| Pemindaian ulang / tindak lanjut USK | ⏳ Di luar repo ini |

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Angka di situs tidak cocok dengan lampiran | `check-data.mjs` di CI mengikat surel 35, host 893, kategori per aturan |
| Alamat surel pribadi tersebar lewat UI | Tidak dirender (agregat saja) + dicek otomatis di `check-static.mjs` |
| Temuan April 2026 dibaca sebagai kondisi saat ini | Penanda di rel + metodologi: "mencerminkan 29 April 2026" |
| URL bukti diklik sebagai tautan hidup | Ditampilkan sebagai teks + tombol salin, bukan `<a>` |
| Selisih IP header vs isi (19 vs 17) | Dicatat sebagai peringatan + di docs/API.md, bukan dikoreksi diam-diam |
| Link preview polos saat ditempel | 9 tag OG/Twitter + og-image screenshot asli, dicek CI + smoke |

## 11. Kriteria Keberhasilan

- Situs live 200 di `report-fraud.pages.dev`, semua fitur F1–F10
  berfungsi di play-test (desktop + mobile).
- CI hijau (4 job) + gate 7 sumbu ≥4/5 tiap sumbu + checklist link
  preview lolos.
- `check-data.mjs` hijau: surel 35, host 893, kategori sesuai aturan.
- Tidak ada secret ke-commit; LICENSE MIT; README + video demo ada.

## 12. Lampiran

- Laporan asli: `Security_Disclosure_USK_2026.pdf`
- Data mentah: `full_hosts_scan_usk.txt`
- Desain: `docs/DESIGN.md` (referensi: Framler Security)
- Arsitektur: `docs/ARCHITECTURE.md`
- Kontrak data: `docs/API.md`
- Diagram: `docs/diagrams.html`
