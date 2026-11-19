# Dokumentasi — Report Fraud

Dokumentasi lengkap situs arsip laporan disclosure keamanan USK
(P1 #39). Mulai dari `PRD.md`, lalu ikuti urutan di bawah.

| Dokumen | Isi |
|---|---|
| `PRD.md` | PRD lengkap (latar belakang, ruang lingkup, fitur F1–F12, risiko, kriteria keberhasilan). |
| `DESIGN.md` | Kontrak arah desain (referensi Framler Security, palet, tipografi, beda 5/5 sumbu dari #38). |
| `ARCHITECTURE.md` | Arsitektur situs statis, struktur repo, alur data penjelajah, keputusan restructure. |
| `API.md` | Kontrak data: format lampiran, aturan klasifikasi, endpoint statis, selisih IP 19 vs 17, format hitungan payment F-006. |
| `templates/finding-template.md` | Template temuan kosong + checklist redaksi wajib sebelum publikasi. |
| `diagrams.html` | 3 diagram editorial (HTML+SVG): arsitektur, alur laporan, model data. |
| `deploy.md` | Deploy Cloudflare Pages + checklist verifikasi live. |
| `testing.md` | Piramida pengujian, cara jalan lokal, screenshot & video demo, gate 7 sumbu. |
| `screenshots/` | Screenshot desktop + mobile (asli, dari sistem live lokal). |
| `demo/` | Video demo `demo.mp4` (adegan dari screenshot). |

Ringkasan produk (satu paragraf): situs statis pengarsip laporan
disclosure keamanan USK 29 April 2026 — ringkasan, 4 temuan + bukti
(termasuk F-006 H2H, 28 Sep 2026, versi redaksi), penjelajah 893
subdomain, 4 rekomendasi, berkas asli (PDF + TXT).
Live: https://report-fraud.pages.dev/
