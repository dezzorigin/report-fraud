// check-static.mjs — gate anti-slop P0 + penjaga restructure + link preview,
// dipakai `npm run validate` dan job `static-checks` di CI:
//   1. Tanpa gradient ungu/biru, tanpa headline gradient, tanpa font Inter /
//      Roboto, tanpa rounded-2xl/3xl + shadow-lg/2xl di UI, tanpa emoji mentah
//      sebagai ikon fungsi, tanpa statistik vanity palsu.
//   2. Tanpa sisa restructure: folder unsyiah/ di tree; tanpa file .env
//      yang ter-commit; tanpa secret kasar; tanpa alamat surel individual
//      dari lampiran yang dirender di HTML/JS (keputusan privasi — hanya
//      agregat yang boleh tampil; daftar lengkap tetap di lampiran TXT).
//   3. Link preview (og-preview.md): index.html wajib memuat SEMUA tag
//      og:/twitter: dan og-image.png wajib ada (1200x630, dari screenshot).
// Keluar 1 bila ada satu saja temuan.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (msg) => failures.push(msg);

const SRC_FILES = [];
const walk = (dir) => {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', 'docs'].includes(e.name)) walk(p);
    } else if (/\.(mjs|js|json|html|css)$/.test(e.name) && !e.name.endsWith('.lock')) {
      SRC_FILES.push(p);
    }
  }
};
walk(ROOT);
SRC_FILES.push(join(ROOT, 'package.json'));
SRC_FILES.push(join(ROOT, 'index.html'));
// Checker dikecualikan dari scan sendiri: pola-pola P0 di file ini adalah
// data aturan, bukan UI.
const CHECKER = join(ROOT, 'scripts', 'check-static.mjs');
const CHECK_DATA = join(ROOT, 'scripts', 'check-data.mjs');
const SCANNED = SRC_FILES.filter((f) => f !== CHECKER && f !== CHECK_DATA);

const P0_CHECKS = [
  [/linear-gradient\([^)]*(violet|purple|indigo|blue|#6366f1|#818cf8|#7d2ae8|#00c4cc)/i, 'gradient ungu/biru'],
  [/bg-clip-text/, 'headline gradient (bg-clip-text)'],
  [/\bfont-family:[^;]*\bInter\b/, 'font Inter'],
  [/\bfont-family:[^;]*\bRoboto\b/, 'font Roboto'],
  [/rounded-2xl|rounded-3xl|rounded-4xl/, 'rounded-2xl/3xl/4xl (radius template)'],
  [/shadow-lg|shadow-2xl/, 'shadow-lg/2xl di permukaan'],
  [/from-(violet|purple|indigo|blue|fuchsia|rose|sky|emerald|teal)-\d+/, 'gradient Tailwind (from-…-…)'],
  [/bg-linear-to-(br|tr|tl|r|b)/, 'gradient linear Tailwind (bg-linear-to-…)'],
  [/maximumScale:\s*1/, 'viewport maximumScale: 1 (melarang zoom)'],
];

for (const f of SCANNED) {
  const raw = readFileSync(f, 'utf-8');
  // Strip komentar (blok + baris penuh) sebelum cek: komentar boleh
  // MENYEBUT pola sebagai dokumentasi, bukan menampilkannya.
  const src = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');
  for (const [re, label] of P0_CHECKS) {
    if (re.test(src)) fail(`${f.replace(ROOT + '/', '')}: ${label}`);
  }
  // Emoji mentah sebagai ikon fungsi (bukan di komentar/dok).
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(src)) {
    fail(`${f.replace(ROOT + '/', '')}: emoji mentah di kode UI`);
  }
}

// Sisa restructure: subfolder lama tidak boleh ada di tree.
if (existsSync(join(ROOT, 'unsyiah'))) fail('unsyiah/ masih ada — restructure belum bersih');
// Secret kasar di file yang ter-commit.
for (const f of SCANNED) {
  const src = readFileSync(f, 'utf-8');
  if (/(api[_-]?key|secret|password)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i.test(src)) {
    fail(`${f.replace(ROOT + '/', '')}: kemungkinan secret ter-commit`);
  }
}
if (existsSync(join(ROOT, '.env'))) fail('.env ter-commit');

// Privasi: alamat surel individual dari lampiran TIDAK BOLEH dirender di
// HTML/JS — hanya agregat (angka + sebaran domain). Daftar lengkap tetap
// di full_hosts_scan_usk.txt untuk UPT TIK USK.
const EMAIL_RE = /[A-Za-z0-9._%+-]+@(?:[a-z0-9-]+\.)*usk\.ac\.id/g;
for (const f of [join(ROOT, 'index.html'), join(ROOT, 'app.js'), join(ROOT, 'styles.css')]) {
  const src = readFileSync(f, 'utf-8');
  const hits = src.match(EMAIL_RE) || [];
  // Satu-satunya pengecualian: pola redaksi "@usk.ac.id" tanpa local-part
  // (bukan alamat lengkap) — itu motif visual, bukan data.
  const real = hits.filter((h) => !h.startsWith('@'));
  if (real.length > 0) fail(`${f.replace(ROOT + '/', '')}: alamat surel individual dari lampiran dirender di UI: ${real.slice(0, 3).join(', ')}`);
}

// Berkas asli wajib ada di root (hasil restructure dari unsyiah/).
for (const f of ['Security_Disclosure_USK_2026.pdf', 'full_hosts_scan_usk.txt']) {
  if (!existsSync(join(ROOT, f))) fail(`${f} tidak ada di root — restructure belum lengkap`);
}

// Link preview (og-preview.md): semua tag wajib ada di index.html.
const html = readFileSync(join(ROOT, 'index.html'), 'utf-8');
const OG_TAGS = [
  'og:title', 'og:description', 'og:type', 'og:url', 'og:image',
  'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image',
];
for (const tag of OG_TAGS) {
  if (!html.includes(tag)) fail(`index.html: tag ${tag} tidak ada (og-preview.md)`);
}
if (!html.includes('https://report-fraud.pages.dev/og-image.png')) {
  fail('index.html: og:image bukan URL absolut report-fraud.pages.dev/og-image.png');
}
const ogImage = join(ROOT, 'og-image.png');
if (!existsSync(ogImage)) fail('og-image.png tidak ada (og-preview.md)');
else if (statSync(ogImage).size < 10_000) fail('og-image.png terlalu kecil — curiga bukan screenshot 1200x630');

if (failures.length > 0) {
  console.error('check-static GAGAL:');
  for (const m of failures) console.error(` - ${m}`);
  process.exit(1);
}
console.log('check-static OK');
