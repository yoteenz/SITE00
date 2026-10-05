/**
 * Measures the Ask Jurnl currency window and a live USD conversion.
 * Run from the repo root against the local Vite server.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.SITE00_QA_BASE ?? 'http://127.0.0.1:5191';
const outDir = '/opt/cursor/artifacts/jurnl-currency';
const viewports = [
  { name: 'mobile', width: 393, height: 852 },
  { name: 'tablet', width: 834, height: 1194 },
  { name: 'desktop', width: 1440, height: 900 },
];

async function readMoney(page) {
  return page.locator('.jrn-home__num').first().innerText();
}

async function measure(page) {
  return page.evaluate(() => {
    const list = document.querySelector('.jrn-currency__list');
    const drawer = document.querySelector('.jrn-drawer');
    const nav = document.querySelector('[data-jrn-zone="bottom-nav"]');
    const doc = document.scrollingElement;
    const root = document.querySelector('.jrn');
    if (!list || !drawer || !doc) return { error: 'missing sheet' };
    const listBox = list.getBoundingClientRect();
    const rows = [...list.querySelectorAll('.jrn-currency__row')].map((row) => {
      const box = row.getBoundingClientRect();
      const overlap = Math.min(box.bottom, listBox.bottom) - Math.max(box.top, listBox.top);
      return {
        code: row.querySelector('.jrn-currency__code')?.textContent ?? '',
        height: Math.round(box.height),
        overlap: Math.round(overlap),
        visible: overlap > 2,
        partial: overlap > 2 && overlap < box.height - 2,
      };
    });
    const visible = rows.filter((row) => row.visible);
    const drawerBox = drawer.getBoundingClientRect();
    const navBox = nav?.getBoundingClientRect() ?? null;
    const navOverlap = navBox ? Math.min(drawerBox.bottom, navBox.bottom) - Math.max(drawerBox.top, navBox.top) : 0;
    return {
      visibleCount: visible.length,
      partialCount: visible.filter((row) => row.partial).length,
      visibleCodes: visible.map((row) => row.code),
      listHeight: Math.round(listBox.height),
      rowHeight: rows[0]?.height ?? 0,
      scrollHeight: list.scrollHeight,
      scrollTop: list.scrollTop,
      clientHeight: list.clientHeight,
      drawerBottom: Math.round(drawerBox.bottom),
      viewportHeight: window.innerHeight,
      drawerPastViewport: drawerBox.bottom > window.innerHeight + 1,
      pageScroll: doc.scrollHeight - doc.clientHeight,
      horizontalOverflow: (root?.scrollWidth ?? doc.scrollWidth) - (root?.clientWidth ?? doc.clientWidth),
      docHorizontal: doc.scrollWidth - doc.clientWidth,
      navOverlap: Math.round(Math.max(0, navOverlap)),
      active: document.querySelector('.jrn-currency__row[aria-pressed="true"] .jrn-currency__code')?.textContent ?? '',
      activeInside: (() => {
        const active = document.querySelector('.jrn-currency__row[aria-pressed="true"]');
        if (!active) return false;
        const box = active.getBoundingClientRect();
        return box.top >= listBox.top - 1 && box.bottom <= listBox.bottom + 1;
      })(),
      copy: document.querySelector('.jrn-currency__note')?.textContent ?? '',
      disclosure: document.querySelector('.jrn-currency__rate')?.textContent ?? '',
      error: document.querySelector('[role="status"]')?.textContent ?? '',
    };
  });
}

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

await mkdir(outDir, { recursive: true });
const report = { base, viewports: {}, conversion: {}, activity: {} };

const videoContext = await browser.newContext({
  viewport: { width: 393, height: 852 },
  recordVideo: { dir: outDir, size: { width: 393, height: 852 } },
});
const page = await videoContext.newPage();
await page.goto(`${base}/production/jurnl/runtime/today`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.jrn-home__num');
const usd = await readMoney(page);
report.conversion.usd = usd;
await page.locator('[data-jrn-trigger="today-ask"]').click();
await page.waitForSelector('.jrn-currency__list');
await page.waitForTimeout(450);
const beforeSwipe = await measure(page);
await page.locator('.jrn-currency__note').first().hover();
await page.mouse.wheel(0, 200);
const outside = await measure(page);
const list = page.locator('.jrn-currency__list');
const box = await list.boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 12);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 12, { steps: 10 });
  await page.mouse.up();
}
const afterDrag = await measure(page);
await list.evaluate((node) => {
  node.scrollTop = 104;
});
const afterScroll = await measure(page);
report.conversion.scroll = { beforeSwipe, outside, afterDrag, afterScroll };

await page.locator('[data-jrn-trigger="currency-eur"]').click();
await page.waitForFunction(
  (previous) => {
    const note = document.querySelector('.jrn-currency__rate');
    const num = document.querySelector('.jrn-home__num');
    return Boolean(note?.textContent) && num?.textContent && num.textContent !== previous;
  },
  usd,
  { timeout: 20000 },
);
await page.locator('[data-jrn-trigger="ask-close"]').click();
await page.waitForSelector('.jrn-home__num');
report.conversion.eur = await readMoney(page);
await page.screenshot({ path: `${outDir}/today-eur-mobile.png` });

await page.locator('[data-jrn-trigger="today-ask"]').click();
await page.locator('[data-jrn-trigger="currency-gbp"]').click();
await page.waitForFunction(
  (previous) => document.querySelector('.jrn-home__num')?.textContent !== previous,
  report.conversion.eur,
  { timeout: 20000 },
);
await page.locator('[data-jrn-trigger="ask-close"]').click();
report.conversion.gbp = await readMoney(page);

await page.locator('[data-jrn-trigger="today-ask"]').click();
await page.locator('[data-jrn-trigger="currency-jpy"]').click();
await page.waitForFunction(
  (previous) => document.querySelector('.jrn-home__num')?.textContent !== previous,
  report.conversion.gbp,
  { timeout: 20000 },
);
const jpySheet = await measure(page);
await page.screenshot({ path: `${outDir}/ask-jpy-mobile.png` });
await page.locator('[data-jrn-trigger="ask-close"]').click();
report.conversion.jpy = await readMoney(page);
report.conversion.jpySheet = jpySheet;

await page.locator('[data-jrn-trigger="today-ask"]').click();
await page.locator('[data-jrn-trigger="currency-usd"]').click();
await page.waitForFunction(
  (previous) => document.querySelector('.jrn-home__num')?.textContent === previous,
  usd,
  { timeout: 20000 },
);
await page.locator('[data-jrn-trigger="ask-close"]').click();
report.conversion.usdReturn = await readMoney(page);

await page.locator('[data-jrn-trigger="today-activity"]').click();
await page.waitForSelector('[data-jrn-tx="tx-atelier"]');
await page.locator('[data-jrn-trigger="today-ask"]').click().catch(() => {});
await page.goto(`${base}/production/jurnl/runtime/activity`, { waitUntil: 'domcontentloaded' });
const activityUsd = await page.locator('[data-jrn-tx="tx-atelier"] .jrn-tx__amt').innerText();
await page.locator('[data-jrn-trigger="activity-ask"]').click();
await page.locator('[data-jrn-trigger="currency-eur"]').click();
await page.waitForFunction(() => (document.querySelector('.jrn-currency__rate')?.textContent ?? '').includes('EUR'), null, { timeout: 20000 });
await page.locator('[data-jrn-trigger="ask-close"]').click();
const activityEur = await page.locator('[data-jrn-tx="tx-atelier"] .jrn-tx__amt').innerText();
report.activity = { usd: activityUsd, eur: activityEur };
await page.screenshot({ path: `${outDir}/activity-eur-mobile.png` });

await page.close();
await videoContext.close();

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  await context.addInitScript(() => {
    localStorage.setItem('jurnl.currency', 'JPY');
  });
  const shot = await context.newPage();
  await shot.goto(`${base}/production/jurnl/runtime/today?overlay=ask`, { waitUntil: 'domcontentloaded' });
  await shot.waitForSelector('.jrn-currency__list');
  await shot.waitForTimeout(400);
  const metrics = await measure(shot);
  await shot.screenshot({ path: `${outDir}/ask-${viewport.name}.png` });
  report.viewports[viewport.name] = metrics;
  await context.close();
}

await browser.close();
await writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
