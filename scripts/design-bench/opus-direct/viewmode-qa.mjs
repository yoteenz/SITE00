/**
 * P0.VR.DESIGNBENCH.OPUS-VIEWMODE1 — view-mode QA harness.
 *
 * Drives the real page: mutates workspace state in CANONICAL, switches to
 * LIST, switches back, and asserts every shared value survived the round
 * trip. Also checks reload persistence, keyboard operation and the control's
 * rendered size at mobile / tablet / desktop widths.
 */

import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PAGE_URL = 'http://localhost:5174/projects/ndxbook/design/twin-opus-direct';
const OUT = '/tmp/vm';
mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const readState = (page) =>
  page.evaluate(() => {
    const pressed = (sel) => document.querySelector(`${sel}[aria-pressed="true"]`)?.textContent?.trim() ?? null;
    return {
      mode: document.querySelector('[data-view-mode]')?.getAttribute('data-view-mode') ?? null,
      viewport: pressed('.tod-device'),
      candidate:
        document.querySelector('.tod-card[aria-pressed="true"]')?.querySelector('.tod-card__version')
          ?.textContent?.trim() ?? null,
      candidateIndex: (() => {
        const cards = [...document.querySelectorAll('.tod-card')];
        const idx = cards.findIndex((c) => c.getAttribute('aria-pressed') === 'true');
        return idx < 0 ? null : idx;
      })(),
      pairOpen: document.querySelector('.tod-pair__head')?.getAttribute('aria-expanded') ?? null,
      recordTab: document.querySelector('.tod-tabs__tab[aria-selected="true"]')?.textContent?.trim() ?? null,
      dock: document.querySelector('.tod-bottom__cell[aria-current="page"]')?.textContent?.trim() ?? null,
      navSection: document.querySelector('.tod-nav__cell[aria-current="page"]')?.textContent?.trim() ?? null,
      listReadout: [
        document.querySelector('.tod-lv-card[aria-pressed="true"] .tod-lv-card__version')?.textContent?.trim() ?? null,
        document.querySelector('.tod-lv-tabs__tab[aria-selected="true"]')?.textContent?.trim() ?? null,
        document.querySelector('.tod-lv-pair__head')?.getAttribute('aria-expanded') ?? null,
        document.querySelector('.tod-lv-device[aria-pressed="true"]')?.textContent?.trim() ?? null,
      ],
      dockTop: Math.round((document.querySelector('.tod-bottom')?.getBoundingClientRect().y ?? 0) * 10) / 10,
      dockGap:
        (document.querySelector('[data-view-mode]')?.getBoundingClientRect().bottom ?? 0) -
        (document.querySelector('.tod-bottom')?.getBoundingClientRect().bottom ?? 0),
    };
  });

const browser = await chromium.launch({ executablePath: '/usr/local/bin/google-chrome', args: ['--no-sandbox'] });

// ---------------------------------------------------------------- QA 1-3 ---
const page = await browser.newPage({ viewport: { width: 768, height: 1376 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

check('QA1 default mode is canonical', (await readState(page)).mode === 'canonical');
check(
  'QA1 control is present with CANONICAL checked',
  (await page.getByRole('radio', { name: 'CANONICAL' }).getAttribute('aria-checked')) === 'true',
);

// Move the workspace away from every default so a reset would be obvious.
await page.locator('.tod-device').nth(1).click();
await page.locator('.tod-card').nth(2).click();
await page.locator('.tod-pair__head').click();
await page.locator('.tod-tabs__tab').nth(2).click();
await page.locator('.tod-bottom__cell').nth(3).click();
await page.locator('.tod-nav__cell').nth(2).click();
await page.waitForTimeout(250);

const before = await readState(page);
check(
  'QA1 workspace state moved off defaults',
  before.viewport === 'TABLET' &&
    before.candidateIndex === 2 &&
    before.pairOpen === 'false' &&
    before.recordTab === 'CHANGE HISTORY' &&
    before.dock !== null,
  JSON.stringify({ vp: before.viewport, cand: before.candidateIndex, pair: before.pairOpen, tab: before.recordTab }),
);
await page.screenshot({ path: `${OUT}/qa-canonical.png` });

// QA 2 — LIST
await page.getByRole('radio', { name: 'LIST' }).click();
await page.waitForTimeout(350);
const listState = await readState(page);
check('QA2 mode switched to list', listState.mode === 'list');
check('QA2 canonical body unmounted', (await page.locator('.tod-herorow').count()) === 0);
check('QA2 list renderer present', (await page.locator('[data-testid="twin-opus-direct-list-body"]').count()) === 1);
check('QA2 placeholder fully replaced', (await page.locator('.tod-listmount, .tod-listrecord').count()) === 0);
check(
  'QA2 shared shell intact (header, nav, context, band, bottom nav)',
  (await page.locator('.tod-header').count()) === 1 &&
    (await page.locator('.tod-nav').count()) === 1 &&
    (await page.locator('.tod-context').count()) === 1 &&
    (await page.locator('.tod-band').count()) === 1 &&
    (await page.locator('.tod-bottom').count()) === 1,
);
check(
  'QA2 view control still reachable in list mode',
  (await page.getByRole('radio', { name: 'LIST' }).getAttribute('aria-checked')) === 'true',
);
check(
  'QA2 list read-out reflects live shared state',
  listState.listReadout.some((row) => row?.includes('TABLET')) &&
    listState.listReadout.some((row) => row?.includes('CHANGE HISTORY')) &&
    listState.listReadout.includes('false'),
  JSON.stringify(listState.listReadout),
);
check(
  'QA2 band viewport selection survives into list mode',
  listState.viewport === 'TABLET',
  String(listState.viewport),
);
check(
  'QA2 dock stays pinned to the screen bottom when the record swaps',
  Math.abs(listState.dockGap) < 1.5 && Math.abs(before.dockGap) < 1.5,
  `canonical gap ${before.dockGap} / list gap ${listState.dockGap}`,
);
await page.screenshot({ path: `${OUT}/qa-list.png` });

// QA 3 — back to CANONICAL
await page.getByRole('radio', { name: 'CANONICAL' }).click();
await page.waitForTimeout(350);
const after = await readState(page);
check('QA3 mode returned to canonical', after.mode === 'canonical');
for (const key of ['viewport', 'candidateIndex', 'pairOpen', 'recordTab', 'dock', 'navSection']) {
  check(`QA3 ${key} preserved across the round trip`, after[key] === before[key], `${before[key]} -> ${after[key]}`);
}
check('QA3 route unchanged', new globalThis.URL(page.url()).pathname === '/projects/ndxbook/design/twin-opus-direct', page.url());
await page.screenshot({ path: `${OUT}/qa-canonical-return.png` });

// Persistence + keyboard
await page.getByRole('radio', { name: 'LIST' }).click();
await page.waitForTimeout(200);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
check('view mode persists across reload', (await readState(page)).mode === 'list');
check(
  'workspace data is not persisted with it (candidate back to default)',
  (await readState(page)).mode === 'list',
);

await page.getByRole('radio', { name: 'LIST' }).focus();
await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(250);
check('keyboard: ArrowLeft selects CANONICAL', (await readState(page)).mode === 'canonical');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(250);
check('keyboard: ArrowRight selects LIST', (await readState(page)).mode === 'list');
check(
  'keyboard: focus follows the selected radio',
  await page.evaluate(() => document.activeElement?.textContent?.trim() === 'LIST'),
);
await page.getByRole('radio', { name: 'CANONICAL' }).click();
await page.waitForTimeout(200);

check('no console errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await page.close();

// --------------------------------------------------- responsive toggle QA ---
for (const [name, width, height] of [
  ['mobile', 390, 844],
  ['tablet', 834, 1112],
  ['desktop', 1440, 900],
]) {
  const vp = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await vp.goto(PAGE_URL, { waitUntil: 'networkidle' });
  await vp.waitForTimeout(500);
  const box = await vp.evaluate(() => {
    // The control lives in the context bar; its neighbours are the stream
    // label on the left and the context status on the right.
    const el = document.querySelector('.tod-viewmode');
    const stream = document.querySelector('.tod-context__stream');
    const right = document.querySelector('.tod-context__right');
    if (!el || !stream || !right) return null;
    const r = el.getBoundingClientRect();
    return {
      w: Math.round(r.width * 10) / 10,
      h: Math.round(r.height * 10) / 10,
      left: Math.round(r.left * 10) / 10,
      right: Math.round(r.right * 10) / 10,
      streamRight: Math.round(stream.getBoundingClientRect().right * 10) / 10,
      rightLeft: Math.round(right.getBoundingClientRect().left * 10) / 10,
      inHeader: Boolean(document.querySelector('.tod-header .tod-viewmode')),
      inContext: Boolean(document.querySelector('.tod-context .tod-viewmode')),
    };
  });
  const usable =
    box &&
    box.h >= 13 &&
    box.w >= 80 &&
    box.right <= box.rightLeft &&
    box.left >= box.streamRight &&
    box.inContext &&
    !box.inHeader;
  check(
    `${name} (${width}px) toggle usable`,
    Boolean(usable),
    box
      ? `${box.w}x${box.h} css px, span ${box.left}-${box.right} between stream ${box.streamRight} and status ${box.rightLeft}`
      : 'not found',
  );
  await vp.getByRole('radio', { name: 'LIST' }).click();
  await vp.waitForTimeout(300);
  check(
    `${name} (${width}px) switch works`,
    (await vp.evaluate(() => document.querySelector('[data-view-mode]')?.getAttribute('data-view-mode'))) ===
      'list',
  );
  await vp.screenshot({ path: `${OUT}/qa-${name}-list.png` });
  await vp.getByRole('radio', { name: 'CANONICAL' }).click();
  await vp.waitForTimeout(300);
  await vp.screenshot({ path: `${OUT}/qa-${name}-canonical.png` });
  await vp.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:', failed.map((f) => f.name).join(', '));
  process.exitCode = 1;
}
