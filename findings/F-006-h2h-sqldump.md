# F-006 — H2H Payment System SQL Dump Exposure (h2h.usk.ac.id)

> **VERSI REDAKSI.** Temuan ini dipublikasikan setelah penyensoran:
> identitas personal (NIP, nama admin, nama pembayar), kredensial
> (hash password), data pembayaran per orang (NIK, PIN, nilai transaksi
> contoh, ID transaksi contoh), dan host/IP internal **tidak
> ditampilkan**. Yang tampil hanya agregat, struktur skema, dampak, dan
> langkah perbaikan. Dump SQL mentah **tidak dilampirkan** di repo ini.
> Lihat `docs/templates/finding-template.md` untuk checklist redaksi
> yang dipakai sebelum publikasi.

**Severity:** CRITICAL (mass financial data exposure + credential leak)
**Host:** https://h2h.usk.ac.id (Apache 2.4.58, CodeIgniter)
**Discovered:** 2026-09-28

## Summary

Directory `/db/` exposed via Apache autoindex, containing full SQL dumps:
- `h2h.sql` (18KB) — schema + config + user credentials
- `exubp.sql` (24MB) — **171,235 payment transactions + 15,000 PIN library records**

## Evidence

### 1. Directory Listing
```
GET /db/ → 200, autoindex enabled
Files: exubp.sql (23M), h2h.sql (18K)
```

### 2. User Credentials Leaked (tb_user)

Tabel `tb_user` memuat 3 akun admin. Semua memakai hash password MD5
tanpa salt — mudah di-crack (rainbow table / GPU). Dua dari tiga hash
berhasil di-crack karena password mengikuti pola yang mudah ditebak
dari identitas pemilik akun.

> Identitas ketiga admin (NIP, nama) dan nilai hash MD5 **disensor**
> dari publikasi ini — lihat pita redaksi di halaman temuan D.

### 3. Payment Transaction Data (trx_data)

```sql
CREATE TABLE trx_data (
  trx_data_id, trx_time_stamp, bill_data_id, Channel_ID,
  Response_Code, Response_Message, Transaction_ID,
  Payment_Amount, event
)
```

**171,235 rows** = full payment history: identitas pendaftar →
transaksi → jumlah → timestamp. Nilai contoh per transaksi **tidak**
ditampilkan (data per orang).

### 4. PIN Library (pin_lib)

```sql
CREATE TABLE pin_lib (
  autoid, pin_id, pin_pin, pin_paid_flag, reversed_flag,
  Transaction_ID, paid_type
)
```

**15,000 PINs** — kode numerik 6 digit untuk pembayaran pendaftaran.
Status lunas/belum lunas terekspos. Nilai PIN individual **tidak**
ditampilkan.

### 5. Internal API Endpoints (tb_web_service)

Endpoint API internal H2H berada di host internal (alamat disensor —
ditulis `<host-internal>` di bawah), dengan pola route:

```
http://<host-internal>/h2hapi/unsyiah/pendaftaranD3/cama/id/[KTP]/channel_id/[channel]/key/[key]
http://<host-internal>/h2hapi/unsyiah/pendaftaranD3/bayar/id/[KTP]/transaction_id/[tx]/channel_id/[channel]/key/[key]
```

Host internal tidak bisa dijangkau dari internet publik, tetapi
pola ini memetakan layout infrastruktur internal.

### 6. Active Bank Partner

- **BSI** (Bank Syariah Indonesia) — status aktif (value=1)
- Kunci transaksi mengikuti pola umum tanggal + kode bank + kode
  jenis pendaftaran (nilai kunci mentah disensor).

## Impact

1. **Mass PII + financial data exposure**: 171k payment transactions + 15k PINs
2. **Credential compromise**: 3 admin accounts with MD5 hashes (crackable)
3. **Internal infra mapping**: endpoint API H2H internal memetakan jaringan internal
4. **Payment fraud potential**: PIN library + transaction IDs can be replayed/forged
5. **Regulatory violation**: UU PDP — financial data + personal data exposed publicly
6. **ADMIN TAKEOVER CONFIRMED**: satu akun admin berhasil dipakai login
   via `/login/dologin` + `/move/domove` → full admin dashboard access
   (identitas akun disensor).

## Admin Dashboard Access (Post-Login)

Session cookie + `POST /move/domove` (id=1) → Admin role → `/beranda` shows full menu:
- `/public/mitra` — CRUD bank partners (BNIS, BRIS, BSI, BSM, btns)
- `/public/kategori` — CRUD categories
- `/public/ws` — CRUD web services
- `/public/tarif` — CRUD payment tariffs
- `/public/manajemenws` — Web service management
- `/public/listws` — Web service list
- `/public/pengecekanws` — Web service check
- `/public/manajemenpembayaran` — Payment management
- `/public/laporanpembayaran` — **Exportable payment reports** (24 jenis pendaftaran: D3, S1, S2, S3, Profesi, etc.)
- `/public/bataspembayaran` — Payment limits
- `/public/infopembayaran` — Payment info

**Payment report export** (`/public/laporanpembayaran` → POST `form_daftar` jenis=N):
Returns HTML table with: No | ID (NIK/KTP) | PIN | Nama | Timestamp | Response Message | Payment Amount | Channel ID | Transaction ID | Paid Type

Hitungan agregat per jenis pendaftaran (24 jenis, total 3.629 baris)
ada di `evidence/h2h-payments-counts.txt`. Nilai per baris (identitas,
PIN, jumlah) **tidak** ditampilkan.

**Password cracking**: dua dari tiga hash MD5 berhasil di-crack karena
password mengikuti pola identitas pemilik akun. Pola ini yang harus
dihentikan — jangan memakai identitas (mis. NIP) sebagai password.

## Reproduction

Langkah generik — tanpa kredensial atau nilai asli:

1. Minta daftar direktori `/db/` — autoindex mengembalikan 200 dan
   menampilkan dua dump SQL.
2. Unduh dump `h2h.sql` dan `exubp.sql` dari `/db/`.
3. Baca tabel `tb_user` dari `h2h.sql` — tiga akun admin dengan hash
   MD5 tanpa salt.
4. Crack hash MD5 (pola password lemah) sampai mendapat kredensial
   login yang valid.
5. Login lewat `/login/dologin`, lalu `POST /move/domove` (id=1) —
   sesi berubah ke peran Admin.
6. Akses dashboard admin: `/public/laporanpembayaran` dan menu lain
   di atas; ekspor laporan per jenis pendaftaran (`form_daftar`,
   jenis=N) mengembalikan tabel data pembayaran lengkap.

Tidak ada perintah berisi kredensial asli di dokumen ini — reproduksi
di atas hanya membuktikan jalurnya, bukan membocorkan kuncinya.

## Remediation

1. Remove `/db/` from web root immediately
2. Rotate all credentials in tb_user (force password reset — do NOT use NIP as password)
3. Rotate H2H API keys with BSI
4. Audit access logs for /db/ downloads
5. Implement access controls on all database backups
6. Upgrade password hashing (MD5 → bcrypt/argon2)
7. Implement rate limiting on login endpoint
8. Enforce HTTPS (currently HTTP accessible)
9. Add CSRF tokens to all forms
10. Implement proper session management (rotate on login, timeout, IP binding)

## Berkas terkait (yang dipublikasikan)

- `findings/F-006-h2h-sqldump.md` — temuan ini (versi redaksi)
- `evidence/h2h-payments-counts.txt` — hitungan agregat ekspor laporan
  pembayaran per jenis pendaftaran (24 jenis, total 3.629 baris)

Dump SQL mentah (`h2h.sql`, `exubp.sql`) dan sampel tanpa sensor
**tidak dilampirkan** — disimpan di luar repo ini dan tidak
dipublikasikan.
