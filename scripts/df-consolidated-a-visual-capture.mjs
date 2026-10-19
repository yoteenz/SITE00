/**
 * Consolidated A form-control evidence — System B, contact phone, validation.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const outDir = '/opt/cursor/artifacts/df-consolidated-a-visual';
mkdirSync(outDir, { recursive: true });

const base = process.env.DF_CAPTURE_BASE ?? 'http://127.0.0.1:5174';
const meta = [];

async function capture(name, page, selector, note) {
  const loc = page.locator(selector).first();
  await loc.scrollIntoViewIfNeeded().catch(() => undefined);
  await page.waitForTimeout(150);
  const path = join(outDir, `${name}.png`);
  if (await loc.count()) {
    await loc.screenshot({ path }).catch(async () => {
      await page.screenshot({ path, fullPage: false });
    });
  } else {
    await page.screenshot({ path, fullPage: false });
  }
  meta.push({ name, note, path });
}

const browser = await chromium.launch();

async function gotoReview(page, hash) {
  await page.goto(`${base}/foundation/review${hash ? `#${hash}` : ''}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.waitForSelector('.df-screen', { timeout: 30000 });
}

const viewports = [
  { w: 390, h: 844, tag: '390x844' },
  { w: 320, h: 700, tag: '320x700' },
  { w: 834, h: 1112, tag: '834x1112' },
  { w: 1194, h: 834, tag: '1194x834' },
  { w: 1440, h: 900, tag: '1440x900' },
];

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: vp.w < 600 ? 2 : 1,
    isMobile: vp.w < 600,
    hasTouch: vp.w < 600,
  });
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('site00-immersive-complete', '1');
    } catch {}
  });

  await gotoReview(page, 'df-r-P02');
  const phoneSel = '#df-phone, [name="phone"], input[autocomplete="tel"]';
  await page.waitForSelector(phoneSel, { timeout: 15000 }).catch(() => undefined);
  await capture(`CA-${vp.tag}-p02-contact-empty`, page, phoneSel, 'CONTACT NUMBER field');

  const continueBtn = page.getByRole('button', { name: /CONTINUE|CHECK/i }).first();
  if (await continueBtn.count()) {
    await continueBtn.click().catch(() => undefined);
    await page.waitForTimeout(300);
    await capture(`CA-${vp.tag}-p02-phone-missing-error`, page, '.df-field', 'Missing phone after continue');
  }

  await page.locator(phoneSel).first().fill('12').catch(() => undefined);
  if (await continueBtn.count()) {
    await continueBtn.click().catch(() => undefined);
    await page.waitForTimeout(300);
    await capture(`CA-${vp.tag}-p02-phone-invalid-error`, page, '.df-field', 'Invalid phone');
  }

  await page.locator(phoneSel).first().fill('+44 20 7946 0958').catch(() => undefined);
  await capture(`CA-${vp.tag}-p02-intl-phone`, page, phoneSel, 'Valid international');

  if (vp.w <= 390) {
    await gotoReview(page, 'df-r-P03');
    await page.waitForTimeout(400);
    const svc = page.locator('.df-service-row, [data-service-id]').first();
    if (await svc.count()) {
      await svc.click().catch(() => undefined);
      await page.waitForTimeout(200);
      await capture(`CA-${vp.tag}-p03-system-b-checked`, page, svc, 'Service System B checked');
    }
  }

  await page.close();
}

await browser.close();
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(meta, null, 2));
console.log(JSON.stringify({ outDir, shots: meta.length }, null, 2));
