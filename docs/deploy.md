# deploy.md — Deployment Cloudflare Pages

## Ringkasan

| Item | Nilai |
|---|---|
| Platform | Cloudflare Pages (direct-upload via API, `cf_pages.py`) |
| Nama proyek | `report-fraud` |
| URL produksi | https://report-fraud.pages.dev/ |
| Folder deploy | Root repo (tanpa build step) |
| Branch produksi | `main` |

## Cara deploy

Tidak ada build. Folder yang di-deploy adalah root repo apa adanya:

```bash
# 1. Buat proyek (sekali saja; bila nama sudah dipakai akun lain -> 409)
python3 ~/workspace/github-actions/cf_pages.py create-project report-fraud

# 2. Deploy (produksi)
python3 ~/workspace/github-actions/cf_pages.py deploy report-fraud ~/workspace/report-fraud
```

Catatan dari program P1 (jangan ulangi kesalahan lama):

- Ketersediaan nama TIDAK bisa dicek via GET project (404 hanya berarti
  bukan milik akun kita) — nama adalah namespace global; baru ketahuan
  saat create (subdomain bersufiks = diambil orang lain; HTTP 409 =
  dipakai akun Cloudflare lain). `report-fraud` didapat bersih.
- `deploy` bisa 404 sesaat setelah `create-project` — retry setelah
  ~20 detik, bukan error nama.
- Setelah live: pasang URL live di About repo via PATCH homepage
  (`https://report-fraud.pages.dev/`), lalu verifikasi homepage terpasang.

## Verifikasi live (checklist sebelum merge)

1. `curl -s https://report-fraud.pages.dev/` → HTTP 200 + headline
   "Jejak defacement" + tautan GitHub.
2. Checklist link preview (`og-preview.md`):
   - `curl` URL live → grep ketemu SEMUA tag `og:` / `twitter:` (9 tag).
   - `curl -I https://report-fraud.pages.dev/og-image.png` → 200 +
     `content-type: image/*`.
   - Gambar 1200x630 (cek dimensi).
3. `curl -I .../Security_Disclosure_USK_2026.pdf` → 200 +
   `application/pdf`.
4. `curl -s .../full_hosts_scan_usk.txt` → 200 + memuat `PART 3`.
5. Play-test di browser: penjelajah memuat "893 host di lampiran",
   cari `dev` → 6 host, chip Webmail → 8 host, tombol salin bekerja,
   unduh PDF + TXT bekerja.
6. Cek mobile 390px: tanpa scroll horizontal.

## Rollback

Deploy ulang commit `main` sebelumnya dengan perintah yang sama
(`deploy` membuat deployment baru; Pages menyimpan riwayat deployment
yang bisa di-rollback dari dashboard).
