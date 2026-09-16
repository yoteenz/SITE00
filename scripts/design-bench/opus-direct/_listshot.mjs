import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await p.goto('http://localhost:5174/projects/ndxbook/design/twin-opus-direct', { waitUntil: 'networkidle' });
await p.getByRole('radio', { name: 'LIST' }).click();
await p.waitForTimeout(700);
const main = p.locator('.tod-main--list');
const h = await main.evaluate((el) => el.scrollHeight);
console.log('list scrollHeight', h);
let i = 0;
for (let y = 0; y < h; y += 760) {
  await main.evaluate((el, yy) => el.scrollTo(0, yy), y);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `/tmp/lr/list-${String(i).padStart(2, '0')}.png` });
  i += 1;
}
console.log('slices', i);
await b.close();
