// Screenshot dokumentasi: hero, temuan, penjelajah (cari "dev"),
// mitigasi/berkas — desktop + mobile ke docs/screenshots/*.png.
// Dipakai README + video demo + og-image.png (1200x630, dari hero).
// Prasyarat: puppeteer-core, Chromium di cache
// (~/.cache/ms-playwright/chromium-1234), dan server di PORT
// (default 8393, `npm run serve`).
// JANGAN `npx playwright install chromium` di VM ini (menghapus cache
// browser tooling video-demo).
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import net from 'node:net';

// Forwarder egress (127.0.0.1:18081) WAJIB untuk font Google dari
// headless Chrome di VM ini: koneksi langsung browser -> egress proxy
// ditolak 403, dan tanpa proxy font display tidak termuat. Probe TCP
// dulu; kalau forwarder mati, lanjut tanpa proxy (font fallback).
const FORWARDER = 'http://127.0.0.1:18081';
const forwarderAlive = await new Promise((resolve) => {
  const s = net.connect(18081, '127.0.0.1');
  s.once('connect', () => { s.destroy(); resolve(true); });
  s.once('error', () => resolve(false));
  setTimeout(() => { s.destroy(); resolve(false); }, 2000);
});
if (!forwarderAlive) console.warn('PERINGATAN: forwarder 127.0.0.1:18081 mati — font Google mungkin fallback.');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'screenshots');
const PORT = process.env.PORT || '8393';
const BASE = `http://127.0.0.1:${PORT}`;

const require = createRequire(import.meta.url);
let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch {
  try {
    puppeteer = require('/home/hatch/workspace/absensirapat-audit/diag/node_modules/puppeteer-core');
  } catch {
    console.error('puppeteer-core tidak ditemukan. Pasang dulu: npm i -D puppeteer-core.');
    process.exit(1);
  }
}

mkdirSync(OUT, { recursive: true });

const exe =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  join(process.env.HOME, '.cache/ms-playwright/chromium-1234/chrome-linux/chrome');
const browser = await puppeteer.launch({
  executablePath: exe,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage',
    ...(forwarderAlive ? [`--proxy-server=${FORWARDER}`] : [])],
});

async function shot(page, name, width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: join(OUT, name) });
  console.log(`shot ${name}`);
}

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 90000 });
await page.waitForFunction(
  () => document.body.innerText.includes('Jejak defacement'),
  { timeout: 60000 },
);
await new Promise((r) => setTimeout(r, 1500));

// 1. Hero desktop + mobile + og-image (1200x630 dari hero).
await shot(page, 'landing-desktop.png', 1440, 900);
await shot(page, 'landing-mobile.png', 390, 844);
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await new Promise((r) => setTimeout(r, 1000));
await page.screenshot({ path: join(ROOT, 'og-image.png') });
console.log('shot og-image.png (1200x630)');

// 2. Temuan.
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.evaluate(() => document.querySelector('#temuan').scrollIntoView());
await new Promise((r) => setTimeout(r, 1200));
await shot(page, 'temuan-desktop.png', 1440, 900);

// 3. Penjelajah: tunggu data termuat, cari "dev", screenshot.
await page.evaluate(() => document.querySelector('#penjelajah').scrollIntoView());
await page.waitForFunction(
  () => document.body.innerText.includes('893 host di lampiran'),
  { timeout: 60000 },
);
await page.type('#cari', 'dev');
await page.waitForFunction(
  () => document.body.innerText.includes('6 host'),
  { timeout: 15000 },
);
await new Promise((r) => setTimeout(r, 800));
await shot(page, 'explorer-desktop.png', 1440, 900);
await shot(page, 'explorer-mobile.png', 390, 844);

// 4. Mitigasi + berkas.
await page.evaluate(() => document.querySelector('#berkas').scrollIntoView());
await new Promise((r) => setTimeout(r, 1200));
await shot(page, 'berkas-desktop.png', 1440, 900);

await browser.close();
console.log('screenshots OK');
