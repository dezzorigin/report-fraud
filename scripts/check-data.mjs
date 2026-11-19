// check-data.mjs — integritas data lampiran vs klaim laporan.
// Dipakai `npm run validate` dan job `static-checks` di CI.
//   - Bagian 1 (surel) harus 35 baris; sebaran domain harus 30 langsung
//     @usk.ac.id + 5 di subdomain (angka yang tampil di index.html).
//   - Bagian 3 (host) harus 893 baris; klasifikasi penjelajah harus
//     berjumlah sama (594 Layanan / 256 Fakultas / 25 Mail / 8 Webmail /
//     6 Dev & staging / 4 Lainnya — aturan di docs/API.md).
//   - Bagian 2 (IP): header lampiran mengklaim 19, TAPI hanya 17 baris
//     yang terhitung. Ini selisih DATA SUMBER, bukan bug situs — dicatat
//     sebagai peringatan (exit tetap 0) dan didokumentasikan di
//     docs/API.md + index.html (bagian Metodologi). Jangan "memperbaiki"
//     angka sumber diam-diam.
// Keluar 1 bila ada satu saja ketidaksesuaian yang mengikat.
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const warnings = [];
const fail = (m) => failures.push(m);
const warn = (m) => warnings.push(m);

const FACULTY = ['fk', 'fkip', 'feb', 'fh', 'ft', 'fmipa', 'fkp', 'fkh', 'fkg', 'fisip', 'fp', 'tp', 'sps'];
function classify(host) {
  if (host.includes('*')) return 'lainnya';
  const labels = host.toLowerCase().split('.');
  for (const lab of labels) {
    if (lab === 'dev' || lab.startsWith('dev') || lab.endsWith('dev')) return 'dev';
  }
  if (labels[0] === 'webmail') return 'webmail';
  if (labels[0] === 'mail') return 'mail';
  for (const lab of labels) if (FACULTY.includes(lab)) return 'fakultas';
  return 'layanan';
}

const text = readFileSync(join(ROOT, 'full_hosts_scan_usk.txt'), 'utf-8');
const lines = text.split(/\r?\n/);
const partIdx = (marker) => lines.findIndex((l) => l.includes(marker));
const p1 = partIdx('PART 1');
const p2 = partIdx('PART 2');
const p3 = partIdx('PART 3');
if (p1 === -1 || p2 === -1 || p3 === -1) fail('salah satu Bagian 1/2/3 tidak ditemukan di lampiran');

const nonEmpty = (a, b) => lines.slice(a + 1, b).filter((l) => l.trim() !== '');
const emails = nonEmpty(p1, p2);
const ips = nonEmpty(p2, p3);
const hosts = nonEmpty(p3, lines.length);

// 1. Surel: klaim laporan = 35.
if (emails.length !== 35) fail(`Bagian 1 surel: terhitung ${emails.length}, klaim laporan 35`);
const direct = emails.filter((e) => e.split('@')[1] === 'usk.ac.id').length;
if (direct !== 30 || emails.length - direct !== 5) {
  fail(`Sebaran domain surel: langsung ${direct} + subdomain ${emails.length - direct}, HTML mengklaim 30 + 5`);
}

// 2. Host: klaim laporan = 893.
if (hosts.length !== 893) fail(`Bagian 3 host: terhitung ${hosts.length}, klaim laporan 893`);
const cats = { layanan: 0, fakultas: 0, mail: 0, webmail: 0, dev: 0, lainnya: 0 };
for (const h of hosts) cats[classify(h.split(':')[0])] += 1;
const EXPECTED = { layanan: 594, fakultas: 256, mail: 25, webmail: 8, dev: 6, lainnya: 4 };
for (const [k, v] of Object.entries(EXPECTED)) {
  if (cats[k] !== v) fail(`Kategori ${k}: terhitung ${cats[k]}, ekspektasi ${v} (aturan docs/API.md)`);
}

// 3. IP: header klaim 19, terhitung 17 — selisih data sumber (peringatan).
const headerClaim = (text.match(/Total Found\s*:\s*35 Emails & 893 Subdomains\/Hosts/) || [])[0];
if (!headerClaim) warn('header Total Found tidak cocok dengan pola yang dikenal');
if (ips.length !== 19) {
  warn(`Bagian 2 IP: header mengklaim 19, terhitung ${ips.length} baris — selisih data sumber, dicatat di docs/API.md (bukan kegagalan build)`);
}

for (const w of warnings) console.warn(`peringatan: ${w}`);
if (failures.length > 0) {
  console.error('check-data GAGAL:');
  for (const m of failures) console.error(` - ${m}`);
  process.exit(1);
}
console.log(`check-data OK (surel 35, host 893, kategori ${JSON.stringify(cats)}, IP terhitung ${ips.length} — klaim header 19)`);
