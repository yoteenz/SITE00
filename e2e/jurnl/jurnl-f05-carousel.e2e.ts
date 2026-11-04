/**
 * F05 MONEY parent — four-collection carousel (P0.JURNL.F05-MONEY.PARENT-FOUR-PANEL-CAROUSEL-AND-MOTION-AUTHORITY-
 * EXPANSION). Synthetic data only. Test names carry the sprint's QA numbers (§17, 01–28); 26–28 are also the
 * financial and JURNL regression suites run beside this file.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { f05World, type F05WorldKind } from './helpers/jurnl-f05-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, safeToSpendCents, storedSnapshot, trigger } from './helpers/jurnl-page';

const SHOTS = process.env.JURNL_F05_CAROUSEL_SHOTS_DIR ?? 'test-results/jurnl-f05-carousel';
const IDS = ['accounts', 'transfers', 'commitments', 'outlook'] as const;
type Coll = (typeof IDS)[number];

async function open(page: Page, kind: F05WorldKind = 'carousel', c?: Coll) {
  await bootstrapJurnl(page, f05World(kind));
  await gotoJurnl(page, `money?parent=motion${c ? `&c=${c}` : ''}`);
  await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached', timeout: 30_000 });
  await settle(page);
}

/** Waits until no collection change is in progress and every animation has finished. */
async function settle(page: Page) {
  await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));
  await expect(page.locator('.jrn-f05m__collection[data-phase="exit"]')).toHaveCount(0);
}

async function shot(page: Page, name: string) {
  const dir = `${SHOTS}/${test.info().project.name}`;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png` });
}

const active = (page: Page) => page.locator('.jrn-f05m__carousel').getAttribute('data-active');
const papers = (page: Page) => page.locator('.jrn-f05m__collection:not([data-phase="exit"]) .jrn-f05m__paper');
const paperKeys = (page: Page) => papers(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-panel') ?? e.getAttribute('data-account-id') ?? e.getAttribute('data-jrn-trigger')));
const cents = async (page: Page, sel: string) => {
  const v = await page.locator(sel).first().getAttribute('data-jrn-amount-cents');
  return v == null ? null : Number(v);
};
const metric = (page: Page, id: string) => cents(page, `[data-jrn-value="money-${id}"]`);
const panelCents = (page: Page, id: string) => cents(page, `[data-panel="${id}"] [data-jrn-amount-cents]`);
const placeCents = (page: Page, id: string) => cents(page, `[data-account-id="${id}"] [data-jrn-amount-cents]`);

async function expectActive(page: Page, id: Coll) {
  await settle(page);
  expect(await active(page)).toBe(id);
  // the four dots follow the shown collection, and the URL keeps it
  expect(await page.locator('.jrn-f05m__dot').evaluateAll((els) => els.map((e) => e.getAttribute('aria-current')))).toEqual(IDS.map((x) => (x === id ? 'true' : null)));
  expect(new URL(page.url()).searchParams.get('c') ?? 'accounts').toBe(id);
}

/** A horizontal drag inside the papers: real touch on touch devices (CDP), the mouse elsewhere. */
async function swipe(page: Page, dx: number, o: { x?: number; y?: number; dy?: number; slow?: boolean } = {}) {
  const box = (await page.locator('.jrn-f05m__swipe').boundingBox())!;
  const x0 = o.x ?? box.x + box.width / 2;
  const y0 = o.y ?? box.y + box.height * 0.46;
  const steps = 10;
  const dy = o.dy ?? 0;
  if (test.info().project.use.hasTouch) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
    for (let i = 1; i <= steps; i += 1) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (dx * i) / steps, y: y0 + (dy * i) / steps }] });
      if (o.slow) await page.waitForTimeout(40);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  } else {
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (let i = 1; i <= steps; i += 1) {
      await page.mouse.move(x0 + (dx * i) / steps, y0 + (dy * i) / steps);
      if (o.slow) await page.waitForTimeout(40);
    }
    await page.mouse.up();
  }
}

/** Marks the shell's nodes; a re-mounted (or duplicated) shell loses the marks. */
async function markShell(page: Page) {
  return page.evaluate(() => {
    const els = document.querySelectorAll('.jrn-f05m__env img, .jrn-f05m__title-paper, .jrn-f05m__seal, .jrn-f05m__tag, .jrn-f05m__mark, h1.jrn-f05m__money, .jrn-f05m__script, .jrn-f05m__metric, .jrn-f05m__chip, .jrn-nav__btn');
    els.forEach((e, i) => ((e as HTMLElement).dataset.e2eShell = String(i)));
    return els.length;
  });
}
const shellMarks = (page: Page) => page.evaluate(() => document.querySelectorAll('[data-e2e-shell]').length);
async function shellPixels(page: Page) {
  const bandBottom = await page.locator('.jrn-f05m__metric').evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().bottom)));
  const nav = (await page.locator('.jrn-nav[data-jrn-nav="parent"]').boundingBox())!;
  const vw = page.viewportSize()!.width;
  return {
    top: (await page.screenshot({ clip: { x: 0, y: 0, width: vw, height: Math.floor(bandBottom) } })).toString('base64'),
    dock: (await page.screenshot({ clip: { x: 0, y: Math.floor(nav.y), width: vw, height: Math.floor(nav.height) } })).toString('base64'),
  };
}

test.describe('F05 MONEY carousel', () => {
  test('01 · the first collection is ACCOUNTS: the approved four places with live, id-bound values', async ({ page }) => {
    await open(page, 'approved');
    await expectActive(page, 'accounts');
    expect(await paperKeys(page)).toEqual(['bank', 'ride', 'cash', 'visa']);
    const stored = (await storedSnapshot(page)) as unknown as { accounts: { account_id: string; balance: number }[] };
    for (const a of stored.accounts) expect(await placeCents(page, a.account_id)).toBe(Math.round(a.balance * 100));
    await expect(page.locator('.jrn-f05m__dot')).toHaveCount(4);
    await shot(page, '01-accounts');
  });

  test('02 / 03 / 04 / 05 · swipes advance one collection at a time, reverse swipes return, the ends do not wrap', async ({ page }) => {
    await open(page);
    await swipe(page, 120); // already the first: nothing before it
    await expectActive(page, 'accounts');
    for (const id of ['transfers', 'commitments', 'outlook'] as const) {
      await swipe(page, -170);
      await expectActive(page, id);
      await shot(page, `02-04-swiped-to-${id}`);
    }
    await swipe(page, -170); // the last: nothing after it
    await expectActive(page, 'outlook');
    for (const id of ['commitments', 'transfers', 'accounts'] as const) {
      await swipe(page, 170);
      await expectActive(page, id);
    }
  });

  test('a drag short of the threshold settles back; a drag never opens the paper it ends on', async ({ page }) => {
    await open(page);
    const url = page.url();
    await swipe(page, -36, { slow: true });
    await expectActive(page, 'accounts');
    expect(page.url()).toBe(url);
    // a full swipe that starts and ends over the BANK paper changes collection and does not route to the place
    const bank = (await page.locator('[data-account-id="bank"]').boundingBox())!;
    await swipe(page, -Math.min(150, bank.width * 0.8), { x: bank.x + bank.width * 0.9, y: bank.y + bank.height / 2 });
    await expectActive(page, 'transfers');
    expect(new URL(page.url()).pathname).toMatch(/\/money$/);
  });

  test('06 · dots, previous / next and the keyboard select the intended collection', async ({ page }) => {
    await open(page);
    await clickTrigger(page, 'f05m-dot-outlook');
    await expectActive(page, 'outlook');
    await clickTrigger(page, 'f05m-dot-transfers');
    await expectActive(page, 'transfers');
    await expect(trigger(page, 'f05m-dot-commitments')).toHaveAttribute('aria-label', 'COMMITMENTS, 3 OF 4');
    // previous / next: keyboard-operable buttons, visible when focused
    await trigger(page, 'f05m-next').focus();
    await expect(trigger(page, 'f05m-next')).toBeVisible();
    await page.keyboard.press('Enter');
    await expectActive(page, 'commitments');
    await trigger(page, 'f05m-prev').focus();
    await page.keyboard.press('Enter');
    await expectActive(page, 'transfers');
    // arrows from a paper: the collection changes and focus lands on the paper in the same place
    await papers(page).nth(1).focus();
    await page.keyboard.press('ArrowRight');
    await expectActive(page, 'commitments');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('data-panel'))).toBe('savings');
    await page.keyboard.press('ArrowLeft');
    await expectActive(page, 'transfers');
    await expect(page.getByTestId('f05m-announce')).toHaveText('TRANSFERS, 2 OF 4.');
  });

  test('07 / 08 / 09 / 10 · environment, MONEY title, summary and the global dock never move or re-mount', async ({ page }) => {
    await open(page);
    const marked = await markShell(page);
    const before = await shellPixels(page);
    const figures = await Promise.all(['held', 'owed', 'committed', 'available'].map((m) => metric(page, m)));
    for (const id of ['transfers', 'commitments', 'outlook', 'accounts'] as const) {
      await clickTrigger(page, `f05m-dot-${id}`);
      await expectActive(page, id);
      expect(await shellMarks(page)).toBe(marked);
      const now = await shellPixels(page);
      expect(now.top === before.top, `top of the page identical on ${id}`).toBe(true);
      expect(now.dock === before.dock, `dock identical on ${id}`).toBe(true);
      expect(await Promise.all(['held', 'owed', 'committed', 'available'].map((m) => metric(page, m)))).toEqual(figures);
      const nav = page.locator('.jrn-nav[data-jrn-nav="parent"]');
      expect(await nav.locator('[data-jrn-trigger^="nav-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-jrn-trigger')))).toEqual(['nav-home', 'nav-money', 'nav-add', 'nav-plan', 'nav-credit']);
      await expect(trigger(page, 'nav-money')).toHaveAttribute('aria-current', 'page');
    }
    // swiping moves only the papers too
    await swipe(page, -170);
    await expectActive(page, 'transfers');
    expect(await shellMarks(page)).toBe(marked);
    expect((await shellPixels(page)).top === before.top).toBe(true);
  });

  test('11 · every collection is four papers, in the four approved places', async ({ page }) => {
    await open(page);
    const expected: Record<Coll, string[]> = {
      accounts: ['bank', 'ride', 'cash', 'visa'],
      transfers: ['in_transit', 'pending', 'scheduled', 'recent'],
      commitments: ['bills', 'savings', 'upcoming', 'reserved'],
      outlook: ['safe_to_spend', 'next_income', 'forecast', 'insights'],
    };
    let places: string | null = null;
    for (const id of IDS) {
      await clickTrigger(page, `f05m-dot-${id}`);
      await expectActive(page, id);
      expect(await paperKeys(page)).toEqual(expected[id]);
      const rects = JSON.stringify(await papers(page).evaluateAll((els) => els.map((e) => [(e as HTMLElement).style.left, (e as HTMLElement).style.top, (e as HTMLElement).style.width, (e as HTMLElement).style.height])));
      places ??= rects;
      expect(rects, `${id} papers sit in the same four places`).toBe(places);
      await expect(page.locator('.jrn-f05m__collection:not([data-phase="exit"]) .jrn-f05m__paper-art')).toHaveCount(4);
    }
  });

  test('12 / 21 · every panel opens its owner; closing or coming back returns to the same collection', async ({ page }) => {
    await open(page);
    const before = JSON.stringify(await storedSnapshot(page));
    const routes: [Coll, string, RegExp][] = [
      ['transfers', 'recent', /\/activity$/],
      ['commitments', 'bills', /\/upcoming$/],
      ['commitments', 'savings', /\/goals$/],
      ['commitments', 'upcoming', /\/upcoming$/],
      ['outlook', 'safe_to_spend', /\/safe$/],
      ['outlook', 'next_income', /\/income$/],
      ['outlook', 'forecast', /\/ahead$/],
      ['outlook', 'insights', /\/activity$/],
    ];
    for (const [c, id, dest] of routes) {
      await clickTrigger(page, `f05m-dot-${c}`);
      await expectActive(page, c);
      await clickTrigger(page, `f05m-panel-${id}`);
      await page.waitForURL((u) => dest.test(u.pathname));
      await page.goBack();
      await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached' });
      await expectActive(page, c);
    }
    // one transfer in a group opens its step sheet; the period sheet for RESERVED; each closes back to its collection
    const sheets: [Coll, string, string][] = [
      ['transfers', 'in_transit', 'transfer-detail'],
      ['transfers', 'pending', 'transfer-detail'],
      ['transfers', 'scheduled', 'transfer-detail'],
      ['commitments', 'reserved', 'safe-horizon-sheet'],
    ];
    for (const [c, id, overlay] of sheets) {
      await clickTrigger(page, `f05m-dot-${c}`);
      await expectActive(page, c);
      await clickTrigger(page, `f05m-panel-${id}`);
      await expect(page.locator(`[data-jrn-overlay="${overlay}"]`)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator(`[data-jrn-overlay="${overlay}"]`)).toHaveCount(0);
      await expectActive(page, c);
      await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-jrn-trigger'))).toBe(`f05m-panel-${id}`);
    }
    // the page's own sheets and the global Quick Add keep the collection too; so does a reload
    await clickTrigger(page, 'f05m-dot-commitments');
    await clickTrigger(page, 'f05m-actions');
    await expect(page.locator('[data-jrn-overlay="f05m-actions-sheet"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expectActive(page, 'commitments');
    await clickTrigger(page, 'nav-add');
    await expect(page.locator('[data-jrn-overlay]').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-jrn-overlay]')).toHaveCount(0);
    await expectActive(page, 'commitments');
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached' });
    await expectActive(page, 'commitments');
    // no destination wrote anything
    expect(JSON.stringify(await storedSnapshot(page))).toBe(before);
  });

  test('13 / 17 / 18 / 19 · figures are canonical: in-transit and pending are not available, debt stays apart, nothing counted twice', async ({ page }) => {
    await open(page, 'carousel', 'transfers');
    // TRANSFERS: each state sums only its own recorded transfers
    expect(await panelCents(page, 'in_transit')).toBe(8_000);
    expect(await panelCents(page, 'pending')).toBe(6_000);
    expect(await panelCents(page, 'scheduled')).toBe(20_000);
    await expect(page.locator('[data-panel="scheduled"]')).toContainText('TOMORROW');
    await expect(page.locator('[data-panel="recent"]')).toHaveAttribute('data-value-kind', 'link');
    await shot(page, '13-transfers');
    // ACCOUNTS: the ledger, not the plan: $80 left RIDESHARE (not at BANK yet); pending and scheduled moved nothing
    await clickTrigger(page, 'f05m-dot-accounts');
    await expectActive(page, 'accounts');
    expect(await placeCents(page, 'bank')).toBe(126_000 - 4_250); // grocer only; the $80 in transit is not received
    expect(await placeCents(page, 'ride')).toBe(84_000 - 8_000 - 3_800);
    expect(await placeCents(page, 'cash')).toBe(35_000); // the $60 pending has not arrived
    await expect(page.locator('[data-account-id="visa"]')).toHaveAttribute('data-nature', 'LIABILITY');
    expect(await metric(page, 'held')).toBe(121_750 + 72_200 + 35_000); // assets only; the card's debt is not netted
    expect(await metric(page, 'owed')).toBe(78_000);
    await shot(page, '13-accounts-with-transfers');
    // COMMITMENTS: bills + upcoming payments + money held back (here: the goal set-aside) = RESERVED = COMMITTED
    await clickTrigger(page, 'f05m-dot-commitments');
    await expectActive(page, 'commitments');
    const bills = (await panelCents(page, 'bills'))!;
    const savings = (await panelCents(page, 'savings'))!;
    const upcoming = (await panelCents(page, 'upcoming'))!;
    const reserved = (await panelCents(page, 'reserved'))!;
    expect(bills).toBe(18_000);
    expect(savings).toBe(12_000);
    expect(upcoming).toBe(3_500); // the card minimum
    expect(reserved).toBe(await metric(page, 'committed'));
    expect(reserved).toBe(bills + upcoming + savings);
    await expect(page.locator('[data-panel="savings"]')).toHaveAttribute('aria-label', /NOT MOVED/);
    await shot(page, '13-commitments');
    // OUTLOOK: Safe to Spend is F09's 30-day figure (the band's AVAILABLE); income is expected, not held
    await clickTrigger(page, 'f05m-dot-outlook');
    await expectActive(page, 'outlook');
    const sts = (await panelCents(page, 'safe_to_spend'))!;
    expect(sts).toBe(await metric(page, 'available'));
    expect(await panelCents(page, 'next_income')).toBe(78_000);
    await expect(page.locator('[data-panel="next_income"]')).toHaveAttribute('aria-label', /EXPECTED, NOT RECEIVED/);
    expect(await panelCents(page, 'insights')).toBe(4_250 + 3_800);
    await shot(page, '13-outlook');
    expect(await safeToSpendCents(page)).toBe(sts);
  });

  test('14 / 15 / 16 · missing data is said plainly: no invented transfers, bills, goals, income or spending', async ({ page }) => {
    await open(page, 'approved', 'transfers');
    for (const id of ['in_transit', 'pending', 'scheduled']) {
      await expect(page.locator(`[data-panel="${id}"]`)).toHaveAttribute('data-value-kind', 'none');
      await expect(page.locator(`[data-panel="${id}"] [data-jrn-amount-cents]`)).toHaveCount(0);
    }
    await expect(page.locator('[data-panel="in_transit"]')).toContainText('NOTHING IN TRANSIT');
    await shot(page, '14-transfers-empty');
    await clickTrigger(page, 'f05m-dot-commitments');
    await expectActive(page, 'commitments');
    await expect(page.locator('[data-panel="bills"]')).toContainText('NO BILLS ADDED');
    // the goal setup created has nothing set aside: $0, said as such (no goals at all reads NO GOALS YET; unit suite)
    expect(await panelCents(page, 'savings')).toBe(0);
    await clickTrigger(page, 'f05m-dot-outlook');
    await expectActive(page, 'outlook');
    await expect(page.locator('[data-panel="next_income"]')).toHaveAttribute('data-value-kind', 'none');
    await expect(page.locator('[data-panel="next_income"]')).toContainText('NOT SET');
    await expect(page.locator('[data-panel="insights"]')).toContainText('NOTHING RECORDED');
    await shot(page, '14-outlook-empty');
    // a missing income date opens the place to add one
    await clickTrigger(page, 'f05m-panel-next_income');
    await page.waitForURL(/\/income\?add=expected$/);
  });

  test('14 · no places at all: Safe to Spend and RESERVED are not known, never a sample figure', async ({ page }) => {
    await open(page, 'none', 'outlook');
    await expect(page.locator('[data-panel="safe_to_spend"] [data-jrn-amount-cents]')).toHaveCount(0);
    await expect(page.locator('[data-panel="safe_to_spend"]')).toContainText('ADD A POCKET FIRST');
    await clickTrigger(page, 'f05m-dot-commitments');
    await expectActive(page, 'commitments');
    await expect(page.locator('[data-panel="reserved"]')).toContainText('ADD A POCKET FIRST');
    await clickTrigger(page, 'f05m-dot-accounts');
    await expectActive(page, 'accounts');
    await expect(page.getByTestId('f05m-empty')).toBeVisible();
    await shot(page, '14-no-places');
  });

  test('20 · changing collection — by swipe, dot, key, button or trackpad — never writes a record', async ({ page }) => {
    await open(page);
    const before = JSON.stringify(await storedSnapshot(page));
    await swipe(page, -170);
    await expectActive(page, 'transfers');
    await clickTrigger(page, 'f05m-dot-outlook');
    await expectActive(page, 'outlook');
    await papers(page).first().focus();
    await page.keyboard.press('ArrowLeft');
    await expectActive(page, 'commitments');
    await trigger(page, 'f05m-prev').focus();
    await page.keyboard.press('Enter');
    await expectActive(page, 'transfers');
    if (!test.info().project.use.hasTouch) {
      const box = (await page.locator('.jrn-f05m__swipe').boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      for (let i = 0; i < 6; i += 1) await page.mouse.wheel(-25, 0);
      await expectActive(page, 'accounts');
    }
    expect(JSON.stringify(await storedSnapshot(page))).toBe(before);
  });

  test('23 · carousel gestures stay inside the carousel: no history entries, no route change, vertical and edge gestures ignored', async ({ page }) => {
    await open(page);
    const length = await page.evaluate(() => history.length);
    const path = new URL(page.url()).pathname;
    await swipe(page, -170);
    await expectActive(page, 'transfers');
    await swipe(page, -170);
    await expectActive(page, 'commitments');
    expect(await page.evaluate(() => history.length)).toBe(length); // the collection replaces, it never pushes
    expect(new URL(page.url()).pathname).toBe(path);
    // a vertical drag over the papers is not a collection change
    await swipe(page, 12, { dy: 160 });
    await expectActive(page, 'commitments');
    // a horizontal drag over the title is outside the carousel
    const title = (await page.locator('h1.jrn-f05m__money').boundingBox())!;
    await swipe(page, -170, { x: title.x + title.width / 2, y: title.y + title.height / 2 });
    await expectActive(page, 'commitments');
    if (test.info().project.use.hasTouch) {
      // a touch from the screen edge is the system's (back / forward), not the carousel's
      const box = (await page.locator('.jrn-f05m__swipe').boundingBox())!;
      await swipe(page, 170, { x: 6, y: box.y + box.height * 0.46 });
      await expectActive(page, 'commitments');
    }
    // the in-app back goes to where the user came from, not through collections
    await clickTrigger(page, 'f05m-panel-bills');
    await page.waitForURL(/\/upcoming$/);
    await page.goBack();
    await expectActive(page, 'commitments');
    expect(await page.evaluate(() => history.length)).toBe(length + 1);
  });

  test('24 · no duplicated images or ghosted layers once a change settles', async ({ page }) => {
    await open(page);
    for (const id of ['outlook', 'transfers', 'commitments', 'accounts'] as const) {
      await clickTrigger(page, `f05m-dot-${id}`);
      await expectActive(page, id);
      const layers = await page.evaluate(() => ({
        collections: document.querySelectorAll('.jrn-f05m__collection').length,
        papers: document.querySelectorAll('.jrn-f05m__paper').length,
        arts: document.querySelectorAll('.jrn-f05m__paper-art').length,
        envImgs: document.querySelectorAll('.jrn-f05m__env img').length,
        seals: document.querySelectorAll('.jrn-f05m__seal').length,
        titles: document.querySelectorAll('.jrn-f05m__title-paper').length,
        h1: document.querySelectorAll('h1.jrn-f05m__money').length,
        docks: document.querySelectorAll('.jrn-nav').length,
        running: document.getAnimations().filter((a) => a.playState === 'running').length,
        translucentPapers: [...document.querySelectorAll('.jrn-f05m__paper')].filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length,
        heldTransforms: [...document.querySelectorAll('.jrn-f05m__collection, .jrn-f05m__paper')].filter((e) => !e.matches(':hover') && getComputedStyle(e).transform !== 'none').length,
      }));
      expect(layers).toEqual({ collections: 1, papers: 4, arts: id === 'accounts' ? 4 : 4, envImgs: layers.envImgs, seals: 1, titles: 1, h1: 1, docks: 1, running: 0, translucentPapers: 0, heldTransforms: 0 });
      expect([1, 2]).toContain(layers.envImgs);
    }
  });

  test('25 · usable at this size: everything on screen, real touch targets, no page scroll', async ({ page }) => {
    await open(page);
    for (const id of IDS) {
      await clickTrigger(page, `f05m-dot-${id}`);
      await expectActive(page, id);
      const r = await page.locator('.jrn-f05m__collection .jrn-f05m__paper, .jrn-f05m__dot, .jrn-nav__btn, .jrn-f05m__metric').evaluateAll((els) =>
        els.map((e) => {
          const b = e.getBoundingClientRect();
          return { t: e.getAttribute('data-jrn-trigger') ?? e.className, l: b.left, top: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height, vw: innerWidth, vh: innerHeight };
        }),
      );
      for (const x of r) {
        expect(x.l, `${x.t} left`).toBeGreaterThanOrEqual(-0.5);
        expect(x.top, `${x.t} top`).toBeGreaterThanOrEqual(-0.5);
        expect(x.r, `${x.t} right`).toBeLessThanOrEqual(x.vw + 0.5);
        expect(x.b, `${x.t} bottom`).toBeLessThanOrEqual(x.vh + 0.5);
      }
      for (const d of r.filter((x) => String(x.t).startsWith('f05m-dot-'))) {
        expect(d.w, `${d.t} width`).toBeGreaterThanOrEqual(24 - 0.5);
        expect(d.h, `${d.t} height`).toBeGreaterThanOrEqual(44 - 0.5);
      }
      // text stays inside its paper
      const overflow = await page.locator('.jrn-f05m__collection .jrn-f05m__paper').evaluateAll((els) =>
        els.flatMap((p) => {
          const pb = p.getBoundingClientRect();
          return [...p.querySelectorAll('.jrn-f05m__paper-name > span, .jrn-f05m__paper-amount, .jrn-f05m__paper-caption')]
            .map((t) => t.getBoundingClientRect())
            .filter((b) => b.right > pb.right + 0.5 || b.bottom > pb.bottom + 0.5 || b.left < pb.left - 0.5)
            .map(() => p.getAttribute('data-jrn-trigger'));
        }),
      );
      expect(overflow).toEqual([]);
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth, sh: document.documentElement.scrollHeight, h: innerHeight }));
      expect(m.sw).toBeLessThanOrEqual(m.w + 1);
      expect(m.sh).toBeLessThanOrEqual(m.h + 1);
      await shot(page, `25-${id}`);
    }
  });

  test('26 · F05 logic intact from the carousel: a place opens by id and back returns to ACCOUNTS', async ({ page }) => {
    await open(page, 'approved');
    await page.locator('[data-account-id="cash"]').click();
    await page.waitForURL(/\/money\/places\/cash$/);
    await expect(page.locator('[data-jrn-screen="F05.ACCOUNT"] h1')).toHaveText('CASH ON HAND');
    await page.goBack();
    await expectActive(page, 'accounts');
  });

  // V9 authority 01 (DOT 01 sprint): the ACCOUNTS collection always shows the first four places of the user's order,
  // and VIEW ALL ACCOUNTS (below the papers) opens the full list. This replaces the earlier ALL PLACES fourth paper.
  test('26 · more than four places: the first four places and VIEW ALL ACCOUNTS, which lists every place; still four dots', async ({ page }) => {
    await open(page, 'many');
    expect(await paperKeys(page)).toEqual(['bank', 'ride', 'cash', 'visa']);
    await expect(page.locator('[data-jrn-trigger="f05m-view-all"]')).toBeVisible();
    await expect(page.locator('.jrn-f05m__dot')).toHaveCount(4); // more places never add dots
    await clickTrigger(page, 'f05m-view-all');
    await page.waitForURL(/\/money\/places$/);
  });

  test('accessibility: carousel semantics and no serious or critical axe violations in any collection', async ({ page }) => {
    await open(page);
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('aria-roledescription', 'carousel');
    for (const id of IDS) {
      await clickTrigger(page, `f05m-dot-${id}`);
      await expectActive(page, id);
      await expect(page.locator('.jrn-f05m__collection')).toHaveAttribute('aria-label', new RegExp(`OF 4$`));
      const r = await new AxeBuilder({ page }).include('[data-jrn-f05-stage]').analyze();
      expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
    }
  });

  test('motion: a collection change is an exit then an entry from the other side, ≤ 520 ms, without replaying the page entrance', async ({ page }) => {
    test.skip(test.info().project.name === 'tablet', 'frames are captured at phone and desktop sizes');
    await bootstrapJurnl(page, f05World('carousel'));
    await page.clock.install();
    await gotoJurnl(page, 'money?parent=motion');
    await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached' });
    await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));
    // hold the controller's timer still so every frame of the change can be seeked exactly
    await page.clock.pauseAt(new Date(Date.now() + 60_000));
    const dir = `${SHOTS}/${test.info().project.name}/frames`;
    mkdirSync(dir, { recursive: true });
    await page.evaluate(() => {
      (document.querySelector('[data-jrn-trigger="f05m-dot-transfers"]') as HTMLElement).click();
    });
    await expect(page.locator('.jrn-f05m__collection[data-phase="exit"][data-dir="next"]')).toHaveCount(1);
    await expect(page.locator('.jrn-f05m__collection[data-phase="enter"][data-dir="next"]')).toHaveCount(1);
    const anims = await page.evaluate(() =>
      document.getAnimations().map((a) => {
        a.pause();
        const t = (a.effect as KeyframeEffect).target as Element;
        const phase = t.closest('.jrn-f05m__collection')?.getAttribute('data-phase') ?? (t.closest('.jrn-f05m__dotrow') ? 'dots' : 'shell');
        return { name: (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty, end: Number(a.effect?.getComputedTiming().endTime ?? 0), phase };
      }),
    );
    // only the papers move (and the active dot fills): no shell animation replays, exit and entry both run, ≤ 520 ms
    expect(anims.filter((a) => a.phase === 'shell')).toEqual([]);
    expect(new Set(anims.filter((a) => a.phase === 'exit').map((a) => a.name))).toEqual(new Set(['f05m-out-next', 'f05m-ghost']));
    expect(anims.filter((a) => a.phase === 'enter').map((a) => a.name)).toEqual(['f05m-in-next', 'f05m-in-next', 'f05m-in-next', 'f05m-in-next']);
    expect(Math.max(...anims.map((a) => a.end))).toBeLessThanOrEqual(520);
    for (const t of [0, 60, 120, 180, 240, 300, 360, 420, 520]) {
      await page.evaluate((ms) => document.getAnimations().forEach((a) => (a.currentTime = ms)), t);
      await page.screenshot({ path: `${dir}/change-accounts-to-transfers-${String(t).padStart(3, '0')}ms.png` });
    }
    await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
    await page.clock.runFor(600);
    await expect(page.locator('.jrn-f05m__collection')).toHaveCount(1);
    await expect(page.locator('.jrn-f05m__collection')).toHaveAttribute('data-phase', 'idle');
    await page.screenshot({ path: `${dir}/change-accounts-to-transfers-settled.png` });
  });

  test('motion: mid-drag, the papers follow the finger with resistance and a shadow lean; the shell stays put', async ({ page }) => {
    test.skip(!!test.info().project.use.hasTouch, 'captured with a mouse drag at tablet and desktop sizes');
    await open(page);
    const box = (await page.locator('.jrn-f05m__swipe').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.46);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height * 0.46, { steps: 8 });
    const c = page.locator('.jrn-f05m__collection');
    await expect(c).toHaveAttribute('data-dragging', 'true');
    const tx = await c.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m41);
    expect(tx).toBeLessThan(-20);
    expect(tx).toBeGreaterThan(-100); // resistance: the papers lag the pointer
    await page.screenshot({ path: `${SHOTS}/${test.info().project.name}-mid-drag.png` });
    await page.mouse.up();
    await expectActive(page, 'transfers');
  });
});

test.describe('F05 MONEY carousel — reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('22 · reduced motion: the collection changes at once; dots, swipes, keys and panels all still work', async ({ page }) => {
    await open(page);
    const stageAnimations = () => page.evaluate(() => document.getAnimations().filter((a) => ((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest('[data-jrn-f05-stage]')).length);
    expect(await stageAnimations()).toBe(0);
    await clickTrigger(page, 'f05m-dot-commitments');
    // immediate: no exit group, no change in progress, nothing animating
    await expect(page.locator('.jrn-f05m__collection[data-phase="exit"]')).toHaveCount(0);
    expect(await page.locator('.jrn-f05m__carousel').getAttribute('data-moving')).toBe('false');
    expect(await stageAnimations()).toBe(0);
    await expectActive(page, 'commitments');
    await swipe(page, -170);
    await expectActive(page, 'outlook');
    expect(await stageAnimations()).toBe(0);
    await papers(page).first().focus();
    await page.keyboard.press('ArrowLeft');
    await expectActive(page, 'commitments');
    await clickTrigger(page, 'f05m-panel-reserved');
    await expect(page.locator('[data-jrn-overlay="safe-horizon-sheet"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expectActive(page, 'commitments');
    await shot(page, '22-reduced-motion-commitments');
  });
});
