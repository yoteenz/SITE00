// usage: node measure.mjs <port> <css selector to size> <path...> — page / frame scroll, horizontal overflow and element size at the 14 QA viewports
import { chromium } from 'playwright';
const [port, sel, ...paths] = process.argv.slice(2);
const VP = [['m390',390,844],['m393',393,852],['m430',430,932],['m390s',390,664],['m360',360,640],['t768',768,1024],['t820',820,1180],['t1024p',1024,1366],['t1024l',1024,768],['d1440',1440,900],['d1680',1680,1050],['d1920',1920,1080],['d1440s',1440,810],['d1280',1280,720]];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let bad = 0;
for (const path of paths) for (const [k, w, h] of VP) {
  const m = w < 700;
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m });
  const p = await c.newPage();
  await p.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => (document.querySelector('.pxa-body, main')?.textContent?.trim().length ?? 0) > 60, null, { timeout: 25000 }).catch(() => {});
  await p.waitForTimeout(1200);
  const r = await p.evaluate((sel) => {
    const f = document.querySelector('.production-authority-scroll');
    const e = sel ? [...document.querySelectorAll(sel)].filter((x) => x.getBoundingClientRect().width > 0) : [];
    return { ds: document.documentElement.scrollHeight - innerHeight, ho: document.documentElement.scrollWidth - innerWidth, fs: f ? f.scrollHeight - f.clientHeight : 0, el: e.length ? `${Math.round(e[0].getBoundingClientRect().width)}x${Math.round(e[0].getBoundingClientRect().height)}×${e.length}` : '-' };
  }, sel);
  if (r.ds > 0 || r.ho > 0 || r.fs > 1) bad++;
  console.log(path.padEnd(48), k.padEnd(7), JSON.stringify(r));
  await c.close();
}
await b.close();
console.log('VIOLATIONS', bad);
