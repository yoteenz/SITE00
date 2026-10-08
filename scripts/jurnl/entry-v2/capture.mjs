// ENTRY v2 live captures: node scripts/jurnl/entry-v2/capture.mjs <W> <H> <dpr> <tag> [screen prefix]  (dev server on :5174)
// Writes <tag>_<SCREEN>.png in the working directory; qa_score.py reads ref_* captured at 393 699 2.5649.
import { chromium } from 'playwright';
import { qaChromiumPath } from '../qa-env.mjs';
const [W, H, dsf, tag, only] = [Number(process.argv[2]), Number(process.argv[3]), Number(process.argv[4]), process.argv[5], process.argv[6]];
const PAGES = [['01_WELCOME', 'entry'], ['02_VALUE_PROPOSITION', 'entry/value'], ['03_KEY_BENEFITS', 'entry/benefits'], ['04_GET_STARTED', 'entry/begin'], ['05_CREATE_ACCOUNT', 'entry/create'], ['06_EMAIL_VERIFICATION', 'entry/verify-email'], ['07_SIGN_IN', 'entry/sign-in']];
const b = await chromium.launch({ executablePath: qaChromiumPath() });
const DEV = process.env.ENTRY_V2_DEV_URL ?? 'http://localhost:5174';
const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
const out = [];
for (const [id, route] of PAGES) {
  if (only && !id.startsWith(only)) continue;
  await p.goto(`${DEV}/production/jurnl/runtime/${route}`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.jrn-e2', { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.querySelectorAll('.jrn-e2__plate')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 });
  await p.waitForTimeout(700);
  const info = await p.evaluate(() => { const s = document.querySelector('.jrn-e2'); return { screen: s.getAttribute('data-jrn-screen'), fit: s.getAttribute('data-jrn-fit'), lower: (s.innerText.match(/[a-z]/g) || []).length, hscroll: document.documentElement.scrollWidth > innerWidth }; });
  await p.screenshot({ path: `${tag}_${id}.png` });
  out.push([id, info]);
}
console.log(JSON.stringify(out), JSON.stringify(errs));
await b.close();
