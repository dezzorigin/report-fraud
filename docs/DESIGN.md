# DESIGN.md — Kontrak Arah Desain Report Fraud

> Ditulis SEBELUM coding (standar anti-slop P1). Referensi dulu, baru bangun.
> Produk: situs arsip laporan disclosure keamanan USK (29 April 2026) —
> bukan app transaksional. Fungsinya: menyajikan laporan resmi (ringkasan,
> 4 temuan + bukti, 4 rekomendasi), penjelajah 893 subdomain dari lampiran,
> dan unduh berkas asli (PDF + data mentah). Semua angka dari laporan.

## Referensi

**Pemenang: Framler Security — halaman security/disclosure Framler**
https://www.framler.com/security

Kenapa menang: strukturnya adalah daftar pernyataan keamanan yang bisa
diverifikasi, bukan landing generik — dibuka kicker "● Security ·
posture" + judul "What Is in Place. What Is Next. How to Report.", lalu
"In place today": tiap kontrol punya status ("live") + detail teknis yang
bisa dicek sendiri, lalu "On the roadmap", lalu "Reporting a
vulnerability". Ketiganya memetakan langsung ke Report Fraud: daftar
temuan berstatus (TINGGI/SEDANG) + bukti per temuan → rekomendasi
mitigasi → berkas & data mentah. Strukturnya yang di-clone: daftar item
berstatus + detail bukti di bawah tiap item, dan urutan narasi (apa yang
ditemukan → apa risikonya → apa yang harus diperbaiki → berkasnya).
Yang diubah: bahasa Indonesia, konteks laporan USK (bukan kontrol
produk), penjelajah subdomain sebagai "produk" interaktif, dan
palet/tipografi sendiri.

Kandidat yang kalah:

- **Vigil — SOC Dashboard (Dribbble, Kretya)**
  https://dribbble.com/shots/27432797-Vigil-SOC-Dashboard
  Kalah: dashboard SOC gelap high-density, bukan struktur halaman
  laporan; yang dipinjam hanya gagasan skor urgensi + feed insiden
  untuk kartu temuan dan penjelajah subdomain.
- **ThreatLens — Enterprise Cybersecurity SaaS Dashboard (Dribbble)**
  https://dribbble.com/shots/27543906-ThreatLens-Enterprise-Cybersecurity-SaaS-Dashboard
  Kalah: estetika neon-green dark-mode generik (default orde-kedua),
  bukan arsip laporan resmi.

## Palet (5 warna bernama, tiap warna punya tugas)

| Nama | Hex | Peran |
|---|---|---|
| Putih Dinas | `#FAFAF7` | Latar utama semua halaman (kertas dingin, bukan krem hangat) |
| Tinta Dinas | `#14232E` | Teks utama, border, headline (biru-hitam petrol, bukan hitam hangat) |
| Merah Segel | `#9E1B1B` | Temuan TINGGI, segel bundar, peringatan (oxblood, bukan merah terang) |
| Kuning Arsip | `#B98A1F` | Temuan SEDANG, sorotan, label berkas (oker, bukan amber terang) |
| Abu Tembok | `#5B6B74` | Teks sekunder, label, metadata |

Bukan satu hue: netral dingin + dua aksen (merah segel, oker). Tanpa
hijau sama sekali. Tanpa gradient apa pun; tanpa ungu/biru gradient.
Mode terang saja — ini arsip dokumen resmi, bukan aplikasi malam.

## Tipografi (maks 2 keluarga)

- **Newsreader** — display/headline serif (opsz), rasa laporan resmi/arsip.
- **Archivo** — body, UI, label, angka (tabular-nums via `font-feature-settings`).

## Layout (satu kalimat)

Pembaca dossier: rel kiri berisi daftar isi + nomor berkas berjalan,
kolom dokumen utama di kanan; hero asimetris (blok judul + tabel meta
pelapor di kiri, kartu sampul laporan berisi segel + tombol unduh di
kanan), lalu temuan sebagai daftar berkas berstatus, bukan kartu
simetris.

## Detail khas

- **Pita redaksi (redaction bar)**: alamat surel TIDAK ditampilkan
  utuh — hanya agregat (jumlah + sebaran domain) dengan bilah hitam
  `████@usk.ac.id` sebagai motif visual; daftar lengkap tetap ada di
  lampiran mentah untuk UPT TIK USK.
- **Kepala berkas berjalan**: tiap section membawa running header
  `RF-USK-2026-0429 · LAPORAN KEAMANAN USK · 29 APRIL 2026`.
- **Segel bundar**: cap melingkar "DISCLOSURE • USK • 2026" di kartu
  sampul (bukan stempel miring persegi).
- **Aturan rambut**: pemisah section berupa hairline 1px + satu rule
  tebal 3px di bawah masthead; tanpa bayangan sama sekali.

## Radius & spacing

Radius 0 di semua permukaan (sudut tajam dokumen resmi). Border 1px
Tinta Dinas pada kartu utama, hairline 1px pada permukaan sekunder.
Tanpa shadow. Grid 8pt; padding kartu ≥16px.

## Beda dari repo sebelumnya (#38 lidm-copet)

| Sumbu | #38 lidm-copet | #39 report-fraud |
|---|---|---|
| Palet | Kertas hangat / hitam hangat / Hijau Laci / Merah Cap terang / amber | Putih dingin / petrol / Merah Segel oxblood / oker, tanpa hijau |
| Tipografi | Fraunces serif + IBM Plex Mono | Newsreader serif + Archivo sans |
| Layout | Masthead koran + hero 2 kolom + antrean berkas | Pembaca dossier: rel kiri + kolom dokumen, hero sampul berkas |
| Radius/spacing | 4px, border 2px, bayangan offset 4px | 0px, border 1px, tanpa bayangan, hairline |
| Detail khas | Stempel miring PENIPUAN + nomor perkara + garis ganda koran | Pita redaksi + kepala berkas berjalan + segel bundar |

Beda 5/5 sumbu (minimal yang disyaratkan: 3/5).

## Larangan P0 yang dibersihkan dari repo lama

- README/PRD template generik ("Static Web", "npm install / npm run
  dev" untuk repo tanpa satu baris kode) diganti dokumen asli: produk
  ini laporan disclosure + situs arsip, bukan "Static Web".
- Diagram Mermaid di README diganti diagram HTML+SVG di
  `docs/diagrams.html`.
- Tidak ada gradient, tidak ada font Inter/Roboto/system, tidak ada
  hero tengah + 3 kartu identik, tidak ada emoji sebagai ikon fungsi
  (ikon SVG satu bobot), tidak ada statistik vanity — semua angka
  (1 KRITIS, 1 TINGGI, 2 SEDANG, 35 surel, 893 subdomain, 171.235
  transaksi) dikutip dari laporan dan dilabeli sumbernya.
- Data contoh dilabeli jujur: klasifikasi penjelajah subdomain adalah
  pengelompokan otomatis berdasarkan nama host (aturan tertulis di
  `docs/API.md`), bukan label dari laporan.
- Alamat surel individual tidak dirender di UI (lihat "Pita redaksi"
  di atas) — keputusan privasi, dicatat di PRD + PR.
- Temuan D (F-006, PR #2) memakai ulang pola temuan TINGGI yang sama
  (border kiri Merah Segel + chip keparahan; kelas sendiri
  `.finding-crit` / `.sev-crit` supaya teks chip "KRITIS" tidak
  tercampur asersi e2e "TINGGI") dan memperluas motif pita redaksi ke
  kredensial (NIP + hash disensor) + tabel agregat 24 jenis di dalam
  wadah scroll (halaman tetap tanpa scroll horizontal di 390px).
