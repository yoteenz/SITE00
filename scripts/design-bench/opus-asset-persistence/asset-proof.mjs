/**
 * P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — live asset persistence proof.
 *
 * Records the resolved src of every `[data-tod-slot]` across remount, view-mode
 * roundtrip, hard reload, storage clear and a brand-new browser session, and
 * asserts asset identity never changes. Also verifies every plate actually
 * responds 200 rather than silently falling back.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = process.env.PROOF_BASE_URL ?? 'http://127.0.0.1:5174';
const ROUTE = '/projects/ndxbook/design/twin-opus-direct';
const OUT = '/opt/cursor/artifacts';
const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 834, height: 1112 },
  desktop: { width: 1440, height: 900 },
};

/** slot -> resolved URL pathname, read off the live DOM. */
async function readSlots(page) {
  await page.waitForSelector('[data-tod-slot]', { timeout: 20_000 });
  return page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('[data-tod-slot]')]
        .map((el) => [el.dataset.todSlot, new URL(el.currentSrc || el.src).pathname])
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  );
}

async function switchView(page, label) {
  await page.getByRole('radio', { name: label, exact: true }).click();
  await page.waitForTimeout(400);
}

function compare(results, log) {
  const [baselineName, baseline] = results[0];
  let ok = true;
  for (const [name, snapshot] of results.slice(1)) {
    const same = JSON.stringify(snapshot) === JSON.stringify(baseline);
    log(`  ${same ? 'PASS' : 'FAIL'}  ${name} identical to ${baselineName}`);
    if (!same) {
      log(`        expected ${JSON.stringify(baseline)}`);
      log(`        actual   ${JSON.stringify(snapshot)}`);
      ok = false;
    }
  }
  return ok;
}

const lines = [];
const log = (message) => {
  lines.push(message);
  console.log(message);
};

const browser = await chromium.launch();
let ok = true;

try {
  await mkdir(OUT, { recursive: true });
  const context = await browser.newContext({ viewport: VIEWPORTS.mobile });
  const page = await context.newPage();

  const failedRequests = [];
  page.on('response', (response) => {
    if (response.url().includes('/site00/twin-opus-direct/') && !response.ok()) {
      failedRequests.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });

  log('P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — live asset persistence proof');
  log(`base: ${BASE}${ROUTE}`);
  log('');

  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });
  const snapshots = [];

  snapshots.push(['canonical (first load)', await readSlots(page)]);
  log(`slots painted: ${Object.keys(snapshots[0][1]).length}`);
  log(JSON.stringify(snapshots[0][1], null, 2));
  log('');
  await page.screenshot({ path: `${OUT}/opus-asset-persistence-mobile-canonical.png`, fullPage: true });

  await switchView(page, 'LIST');
  snapshots.push(['list', await readSlots(page)]);
  await page.screenshot({ path: `${OUT}/opus-asset-persistence-mobile-list.png`, fullPage: true });

  await switchView(page, 'CANONICAL');
  snapshots.push(['canonical (after C -> L -> C)', await readSlots(page)]);

  await page.reload({ waitUntil: 'networkidle' });
  snapshots.push(['canonical (hard reload)', await readSlots(page)]);

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });
  snapshots.push(['canonical (storage cleared)', await readSlots(page)]);

  for (const [name, size] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(size);
    await page.waitForTimeout(300);
    snapshots.push([`canonical (${name} viewport)`, await readSlots(page)]);
    if (name !== 'mobile') {
      await page.screenshot({ path: `${OUT}/opus-asset-persistence-${name}.png` });
    }
  }

  log('IDENTITY STABILITY');
  ok = compare(snapshots, log) && ok;
  log('');

  // Fresh session: new context means no cookies, no storage, cold cache.
  const freshContext = await browser.newContext({ viewport: VIEWPORTS.mobile });
  const freshPage = await freshContext.newPage();
  await freshPage.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });
  const fresh = await readSlots(freshPage);
  log('FRESH SESSION');
  ok = compare([snapshots[0], ['fresh browser session', fresh]], log) && ok;
  log('');
  await freshContext.close();

  log('ASSET DELIVERY');
  const paths = [...new Set(Object.values(snapshots[0][1]))];
  for (const path of paths) {
    const response = await page.request.get(`${BASE}${path}`);
    const good = response.ok();
    log(`  ${good ? 'PASS' : 'FAIL'}  ${response.status()} ${path}`);
    if (!good) ok = false;
  }
  const fellBack = paths.filter((path) => !path.startsWith('/site00/twin-opus-direct/'));
  log(`  ${fellBack.length === 0 ? 'PASS' : 'FAIL'}  no slot fell back to a legacy texture`);
  if (fellBack.length) {
    log(`        fell back: ${fellBack.join(', ')}`);
    ok = false;
  }
  log(`  ${failedRequests.length === 0 ? 'PASS' : 'FAIL'}  no failed plate requests`);
  if (failedRequests.length) {
    log(`        ${failedRequests.join(', ')}`);
    ok = false;
  }

  log('');
  log(`RESULT: ${ok ? 'PASS' : 'FAIL'}`);
  await context.close();
} finally {
  await browser.close();
  await writeFile(`${OUT}/opus-asset-persistence-proof.log`, `${lines.join('\n')}\n`);
}

process.exit(ok ? 0 : 1);
