// smoke.mjs — verifikasi folder repo persis yang di-deploy ke Cloudflare
// Pages (situs statis: repo root = folder deploy, tanpa build):
// `python3 -m http.server` di port acak, lalu cek / (200 + headline +
// tag og: + link GitHub), /og-image.png (200 + image/*), /favicon.svg
// (200), /styles.css + /app.js (200), /full_hosts_scan_usk.txt (200 +
// memuat "PART 3"), /Security_Disclosure_USK_2026.pdf (200 + PDF).
// Hanya GET lokal. Pakai fetch Node (tanpa file temp — tulis file ke
// /tmp tidak bisa diandalkan di VM ini saat EPERM).
// Berkas yang belum ada di disk lokal (mis. PDF saat unduhan EPERM)
// dilewati dengan peringatan — keberadaannya di tree ditegakkan oleh
// scripts/check-static.mjs; di CI berkas itu ada sehingga dicek penuh.
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const warnings = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); };
const warn = (msg) => warnings.push(msg);

const PORT = 8394;
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
  cwd: ROOT,
  stdio: 'ignore',
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path) {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`, { redirect: 'manual' });
  return { status: res.status, type: res.headers.get('content-type') || '', body: await res.text() };
}

try {
  await wait(2500);
  const home = await get('/');
  check(home.status === 200, `/ -> HTTP ${home.status}`);
  for (const tag of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    check(home.body.includes(tag), `/ tidak mengandung tag ${tag} (og-preview.md)`);
  }
  check(home.body.includes('https://report-fraud.pages.dev/og-image.png'), '/ og:image bukan URL absolut report-fraud.pages.dev/og-image.png');
  check(home.body.includes('Jejak defacement'), '/ tidak mengandung headline laporan');
  check(home.body.includes('github.com/dezzorigin/report-fraud'), '/ tidak mengandung tautan GitHub repo');
  check(home.body.includes('full_hosts_scan_usk.txt'), '/ tidak mereferensikan data mentah');
  check(home.body.includes('Security_Disclosure_USK_2026.pdf'), '/ tidak mereferensikan PDF laporan');

  const og = await get('/og-image.png');
  if (!existsSync(join(ROOT, 'og-image.png'))) {
    warn('/og-image.png belum ada di disk lokal — dilewati (check-static menegakkan keberadaannya)');
  } else {
    check(og.status === 200, `/og-image.png -> HTTP ${og.status}`);
    check(/^image\//.test(og.type), `/og-image.png -> content-type bukan image/*: ${og.type}`);
  }

  const fav = await get('/favicon.svg');
  check(fav.status === 200, `/favicon.svg -> HTTP ${fav.status}`);

  const css = await get('/styles.css');
  check(css.status === 200, `/styles.css -> HTTP ${css.status}`);
  const js = await get('/app.js');
  check(js.status === 200, `/app.js -> HTTP ${js.status}`);
  check(js.body.includes('full_hosts_scan_usk.txt'), 'app.js tidak memuat data mentah');

  const txt = await get('/full_hosts_scan_usk.txt');
  if (!existsSync(join(ROOT, 'full_hosts_scan_usk.txt'))) {
    warn('/full_hosts_scan_usk.txt belum ada di disk lokal — dilewati');
  } else {
    check(txt.status === 200, `/full_hosts_scan_usk.txt -> HTTP ${txt.status}`);
    check(txt.body.includes('PART 3'), 'data mentah tidak memuat Bagian 3 (host)');
  }

  const pdf = await get('/Security_Disclosure_USK_2026.pdf');
  if (!existsSync(join(ROOT, 'Security_Disclosure_USK_2026.pdf'))) {
    warn('/Security_Disclosure_USK_2026.pdf belum ada di disk lokal — dilewati (check-static menegakkan keberadaannya; CI mengecek penuh)');
  } else {
    check(pdf.status === 200, `/Security_Disclosure_USK_2026.pdf -> HTTP ${pdf.status}`);
    check(/^application\/pdf/.test(pdf.type), `/Security_Disclosure_USK_2026.pdf -> content-type bukan application/pdf: ${pdf.type}`);
  }
} finally {
  // Matikan server via PID, BUKAN pkill -f (pelajaran #36: pola pkill
  // bisa membunuh shell exec sendiri).
  srv.kill('SIGTERM');
}

for (const w of warnings) console.warn(`peringatan: ${w}`);
if (failures.length > 0) {
  console.error('smoke GAGAL:');
  for (const m of failures) console.error(` - ${m}`);
  process.exit(1);
}
console.log('smoke OK');
