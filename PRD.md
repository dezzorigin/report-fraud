# PRD — Report Fraud (ringkas)

PRD lengkap: [`docs/PRD.md`](docs/PRD.md).

## Ringkas

| Field | Nilai |
|---|---|
| Produk | Situs arsip laporan disclosure keamanan USK (situs statis) |
| Laporan yang diarsipkan | Security_Disclosure_USK_2026.pdf, 29 April 2026 |
| Live | https://report-fraud.pages.dev/ |
| Status | Proper (P1 #39) |

Situs ini menyajikan laporan responsible disclosure Nabil Aulia Dika
untuk UPT TIK Universitas Syiah Kuala: ringkasan eksekutif, 4 temuan
(1 KRITIS, 1 TINGGI, 2 SEDANG), 4 rekomendasi mitigasi, penjelajah 893 subdomain
yang bisa dicari/difilter, dan unduh berkas asli (PDF + data mentah).

Bukan alat pemindai, bukan penilaian kondisi USK saat ini — arsip
laporan 29 April 2026 (temuan A–C) plus disclosure lanjutan 28 September
2026 (temuan D, F-006) apa adanya. Alamat surel individual tidak
ditampilkan di UI (hanya agregat); daftar lengkap ada di lampiran
mentah untuk UPT TIK USK. Temuan D dipublikasikan dalam versi redaksi
(tanpa data per orang); dump SQL mentah tidak dilampirkan.
