/**
 * Minimal live-route capture used by JURNL F01 QA (P0.JURNL.SITE00-INGEST-F01).
 * Usage: node scripts/jurnl/qa-shot.mjs <url> <out.png> [width] [height] [waitMs]
 * Chromium: $SITE00_QA_CHROMIUM, else the cloud image's pre-installed build, else Playwright's default.
 */
import { chromium } from 'playwright';
import { qaChromiumPath } from './qa-env.mjs';

const [url, out, w = '390', h = '844', wait = '4000'] = process.argv.slice(2);
if (url && out) {
  const browser = await chromium.launch({ headless: true, executablePath: qaChromiumPath() });
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(+wait);
  await page.screenshot({ path: out });
  console.log(JSON.stringify({ url: page.url(), pageErrors: errs.slice(0, 8) }));
  await browser.close();
}
