import { chromium } from 'playwright';
import { join } from 'path';

const out = '/opt/cursor/artifacts/df-phase2-visual';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5175/foundation/review', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(1500);
await page.locator('#df-industry').scrollIntoViewIfNeeded();
await page.screenshot({ path: join(out, 'V-10-desktop-closed.png') });
await page.locator('#df-industry').click();
await page.waitForSelector('.df-select__list:not([hidden])', { timeout: 8000 });
await page.screenshot({ path: join(out, 'V-11-desktop-listbox-open.png') });
await page.keyboard.press('ArrowDown');
await page.screenshot({ path: join(out, 'V-12-desktop-keyboard-highlight.png') });
await browser.close();
console.log('desktop captures ok');
