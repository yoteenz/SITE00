import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PAGE_URL = 'http://localhost:5174/projects/ndxbook/design/twin-opus-direct';
const OUT = process.argv[2] ?? '/tmp/lr/before';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
for (const [name, width, height] of [
  ['mobile', 390, 844],
  ['tablet', 834, 1112],
  ['desktop', 1440, 900],
  ['artboard', 768, 1376],
]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.sessionStorage.removeItem('site00:twin-opus-direct:view-mode:v1'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}-canonical.png`, fullPage: false });
  await page.getByRole('radio', { name: 'LIST' }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}-list.png`, fullPage: false });
  await page.close();
}
await browser.close();
console.log('shots ->', OUT);
