/**
 * P0.VR.DESIGNBENCH.SPARK-LIST-INTEGRATION1 — list renderer QA harness.
 *
 * Drives the real page: mutates workspace state in LIST (candidate, authority
 * pair, record tab, list viewport control, dock), switches back to CANONICAL,
 * and asserts every shared value transferred. Also checks overflow and that
 * the dock stays pinned to the screen bottom in both modes.
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

const readBoth = (page) =>
  page.evaluate(() => {
    const screen = document.querySelector('[data-view-mode]');
    const bottom = document.querySelector('.tod-bottom');
    const main = document.querySelector('.tod-main');
    const screenBox = screen?.getBoundingClientRect();
    const bottomBox = bottom?.getBoundingClientRect();
    return {
      mode: screen?.getAttribute('data-view-mode') ?? null,
      // Canonical read-outs.
      canonCandidate: (() => {
        const cards = [...document.querySelectorAll('.tod-card')];
        return cards.findIndex((c) => c.getAttribute('aria-pressed') === 'true');
      })(),
      canonPairOpen: document.querySelector('.tod-pair__head')?.getAttribute('aria-expanded') ?? null,
      canonTab: document.querySelector('.tod-tabs__tab[aria-selected="true"]')?.textContent?.trim() ?? null,
      // List read-outs.
      listCandidate: (() => {
        const cards = [...document.querySelectorAll('.tod-lv-card')];
        return cards.findIndex((c) => c.getAttribute('aria-pressed') === 'true');
      })(),
      listPairOpen: document.querySelector('.tod-lv-pair__head')?.getAttribute('aria-expanded') ?? null,
      listTab: document.querySelector('.tod-lv-record__tab[aria-selected="true"]')?.textContent?.trim() ?? null,
      // Shared chrome (identical selectors in both modes).
      viewport:
        document.querySelector('.tod-device[aria-pressed="true"]')?.textContent?.trim() ?? null,
      listViewport:
        document.querySelector('.tod-lv-device[aria-pressed="true"]')?.textContent?.trim() ?? null,
      dock: document.querySelector('.tod-bottom__cell[aria-current="page"]')?.textContent?.trim() ?? null,
      dockPinned:
        screenBox && bottomBox ? Math.abs(screenBox.bottom - bottomBox.bottom) < 1.5 : null,
      mainOverflowX: main ? main.scrollWidth - main.clientWidth : null,
      bodyOverflowX: document.body.scrollWidth - document.body.clientWidth,
    };
  });

const browser = await chromium.launch({ executablePath: '/usr/local/bin/google-chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 768, height: 1376 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

// Canonical baseline: move everything off defaults.
await page.locator('.tod-device').nth(2).click();
await page.locator('.tod-card').nth(1).click();
await page.locator('.tod-tabs__tab').nth(1).click();
await page.locator('.tod-bottom__cell').nth(2).click();
await page.waitForTimeout(250);
const canonBefore = await readBoth(page);

// Switch to LIST: shared state must arrive intact.
await page.getByRole('radio', { name: 'LIST' }).click();
await page.waitForTimeout(400);
const listArrived = await readBoth(page);
check('LIST shows canonical candidate (index 1)', listArrived.listCandidate === 1, String(listArrived.listCandidate));
check('LIST shows canonical pair open', listArrived.listPairOpen === 'true', String(listArrived.listPairOpen));
check('LIST shows canonical record tab', listArrived.listTab === 'VERSION HISTORY', String(listArrived.listTab));
check('LIST shows canonical viewport', listArrived.listViewport === 'DESKTOP', String(listArrived.listViewport));
check('LIST keeps canonical dock selection', listArrived.dock === canonBefore.dock, String(listArrived.dock));
check(
  'LIST renderer sections mounted',
  (await page.locator('.tod-lv-hero').count()) === 1 &&
    (await page.locator('.tod-lv-gallery').count()) === 1 &&
    (await page.locator('.tod-lv-out').count()) === 1 &&
    (await page.locator('.tod-lv-pipe').count()) === 1 &&
    (await page.locator('.tod-lv-record').count()) === 1,
);
check('placeholder fully replaced', (await page.locator('.tod-listmount, .tod-listrecord').count()) === 0);

// Mutate inside LIST through the shared actions.
await page.locator('.tod-lv-card').nth(3).click();
await page.locator('.tod-lv-pair__head').click();
await page.locator('.tod-lv-record__tab').nth(3).click();
await page.locator('.tod-lv-device').nth(1).click();
await page.locator('.tod-bottom__cell').nth(4).click();
await page.waitForTimeout(250);
const listMutated = await readBoth(page);
check('LIST candidate mutation applies', listMutated.listCandidate === 3, String(listMutated.listCandidate));
check('LIST pair collapse applies', listMutated.listPairOpen === 'false', String(listMutated.listPairOpen));
check('LIST tab mutation applies', listMutated.listTab === 'MASTER UPDATE', String(listMutated.listTab));
check('LIST viewport control drives shared state', listMutated.viewport === 'TABLET', String(listMutated.viewport));
check('dock pinned to screen bottom in LIST', listMutated.dockPinned === true, String(listMutated.dockPinned));
check('LIST body has no horizontal overflow', (listMutated.mainOverflowX ?? 99) <= 1, String(listMutated.mainOverflowX));
check('page has no horizontal overflow', (listMutated.bodyOverflowX ?? 99) <= 1, String(listMutated.bodyOverflowX));
await page.screenshot({ path: `${OUT}/qa-list-mutated.png` });

// Back to CANONICAL: every LIST mutation must have transferred.
await page.getByRole('radio', { name: 'CANONICAL' }).click();
await page.waitForTimeout(400);
const canonAfter = await readBoth(page);
check('candidate transfers LIST -> CANONICAL', canonAfter.canonCandidate === 3, String(canonAfter.canonCandidate));
check('pair state transfers LIST -> CANONICAL', canonAfter.canonPairOpen === 'false', String(canonAfter.canonPairOpen));
check('record tab transfers LIST -> CANONICAL', canonAfter.canonTab === 'MASTER UPDATE', String(canonAfter.canonTab));
check('viewport transfers LIST -> CANONICAL', canonAfter.viewport === 'TABLET', String(canonAfter.viewport));
check('dock selection transfers LIST -> CANONICAL', canonAfter.dock === listMutated.dock, `${listMutated.dock} -> ${canonAfter.dock}`);
check('dock pinned to screen bottom in CANONICAL', canonAfter.dockPinned === true, String(canonAfter.dockPinned));
check('no console errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await page.close();

// Viewport sweep: LIST mounts and switches cleanly at every width.
for (const [name, width, height] of [
  ['mobile', 390, 844],
  ['tablet', 834, 1112],
  ['desktop', 1440, 900],
]) {
  const vp = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await vp.goto(PAGE_URL, { waitUntil: 'networkidle' });
  await vp.waitForTimeout(500);
  await vp.getByRole('radio', { name: 'LIST' }).click();
  await vp.waitForTimeout(350);
  const s = await readBoth(vp);
  check(`${name} LIST mounts`, s.mode === 'list', String(s.mode));
  check(`${name} LIST record + dock present`, (await vp.locator('.tod-lv-record, .tod-bottom').count()) === 2);
  check(`${name} dock pinned`, s.dockPinned === true, String(s.dockPinned));
  check(`${name} no horizontal overflow`, (s.mainOverflowX ?? 99) <= 1, String(s.mainOverflowX));
  await vp.screenshot({ path: `${OUT}/qa-${name}-list2.png` });
  await vp.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:', failed.map((f) => f.name).join(', '));
  process.exitCode = 1;
}
