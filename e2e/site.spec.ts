import { test, expect } from '@playwright/test';

// PDF laporan tidak selalu ada di disk VM dev (unduhan PDF dari GitHub
// mentok EPERM intermiten) — tapi di CI berkas itu ada di checkout.
// ALLOW_MISSING_PDF=1 hanya melonggarkan asersi status HTTP PDF lokal;
// di CI (tanpa env itu) PDF wajib 200.
const allowMissingPdf = process.env.ALLOW_MISSING_PDF === '1';

test.describe('Report Fraud — situs arsip disclosure USK', () => {
  test('hero + OG + tautan GitHub', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Jejak defacement');
    await expect(page.locator('.lede')).toContainText('Open Source Intelligence');
    // Meta OG/Twitter lengkap (og-preview.md).
    for (const prop of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image']) {
      const content = await page.locator(`meta[property="${prop}"]`).getAttribute('content');
      expect(content, `meta ${prop} kosong`).toBeTruthy();
    }
    expect(await page.locator('meta[property="og:image"]').getAttribute('content'))
      .toBe('https://report-fraud.pages.dev/og-image.png');
    for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      const content = await page.locator(`meta[name="${name}"]`).getAttribute('content');
      expect(content, `meta ${name} kosong`).toBeTruthy();
    }
    await expect(page.locator('.gh-link')).toHaveAttribute('href', 'https://github.com/dezzorigin/report-fraud');
    // Berkas asli tertaut dari hero.
    await expect(page.locator('.cover-actions a[download]').first())
      .toHaveAttribute('href', 'Security_Disclosure_USK_2026.pdf');
  });

  test('tiga temuan + bukti', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.finding')).toHaveCount(3);
    await expect(page.locator('.sev-high')).toContainText('TINGGI');
    await expect(page.locator('.sev-med')).toHaveCount(2);
    await expect(page.locator('.evidence code').first())
      .toContainText('fkep.usk.ac.id/BABEJUDI/');
    // Salin URL bukti.
    await page.locator('.copy').first().click();
    await expect(page.locator('.copy').first()).toContainText('Disalin');
    // Surel individual TIDAK dirender — hanya agregat + redaksi.
    await expect(page.locator('#temuan-b')).toContainText('35 alamat');
    await expect(page.locator('#temuan-b')).toContainText('30 alamat di @usk.ac.id');
    await expect(page.locator('#temuan-b')).not.toContainText('hendra_zufry@usk.ac.id');
    await expect(page.locator('#temuan-c')).toContainText('dev.fk.usk.ac.id');
    await expect(page.locator('#temuan-c')).toContainText('perwaliandev.usk.ac.id');
  });

  test('penjelajah: muat 893 host, cari + filter', async ({ page }) => {
    await page.goto('/');
    await page.locator('#penjelajah').scrollIntoViewIfNeeded();
    await expect(page.locator('#explorer-meta')).toContainText('893 host di lampiran', { timeout: 30000 });
    // Cari "dev" -> 6 host.
    await page.fill('#cari', 'dev');
    await expect(page.locator('#explorer-meta')).toContainText('6 host', { timeout: 15000 });
    await expect(page.locator('.host-list li')).toHaveCount(6);
    // Filter Webmail -> 8 host.
    await page.fill('#cari', '');
    await page.locator('.chip[data-filter="webmail"]').click();
    await expect(page.locator('#explorer-meta')).toContainText('8 host', { timeout: 15000 });
    await expect(page.locator('.host-list li')).toHaveCount(8);
    // Filter Fakultas + cari "simkuliah".
    await page.locator('.chip[data-filter="fakultas"]').click();
    await page.fill('#cari', 'simkuliah');
    await expect(page.locator('.host-list li')).toHaveCount(1);
    await expect(page.locator('.host-list li').first()).toContainText('simkuliah.fkip.usk.ac.id');
  });

  test('berkas: data mentah 200, PDF 200 (atau dilewati lokal)', async ({ page, request }) => {
    await page.goto('/');
    const txt = await request.get('/full_hosts_scan_usk.txt');
    expect(txt.status()).toBe(200);
    expect(await txt.text()).toContain('PART 3');
    const pdf = await request.get('/Security_Disclosure_USK_2026.pdf');
    if (allowMissingPdf && pdf.status() === 404) {
      test.skip(true, 'PDF belum ada di disk VM dev (EPERM) — dicek penuh di CI');
    }
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()['content-type'] || '').toMatch(/application\/pdf/);
    const og = await request.get('/og-image.png');
    expect(og.status()).toBe(200);
    expect(og.headers()['content-type'] || '').toMatch(/^image\//);
  });

  test('mobile: tanpa scroll horizontal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#explorer-meta')).toContainText('893 host di lampiran', { timeout: 30000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
});
