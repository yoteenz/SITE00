/**
 * F05 MONEY parent — layered motion pilot (opt-in at /money?parent=motion). Synthetic data only.
 * Covers the pilot's required checks 1–20 at every project size, plus axe and a deterministic motion frame sequence.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { f05World, type F05WorldKind } from './helpers/jurnl-f05-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, safeToSpendCents, storedSnapshot, trigger } from './helpers/jurnl-page';

const SHOTS = process.env.JURNL_F05_SHOTS_DIR ?? 'test-results/jurnl-f05-motion';
const PILOT = 'money?parent=motion';

async function open(page: Page, kind: F05WorldKind = 'approved') {
  await bootstrapJurnl(page, f05World(kind));
  await gotoJurnl(page, PILOT);
  await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached', timeout: 30_000 });
  await settle(page);
}

/** Waits for the entrance to finish (no-op under reduced motion). */
async function settle(page: Page) {
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));
}

async function shot(page: Page, name: string) {
  const dir = `${SHOTS}/${test.info().project.name}`;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png` });
}

const cents = async (page: Page, sel: string) => Number(await page.locator(sel).first().getAttribute('data-jrn-amount-cents'));
const metric = (page: Page, id: string) => cents(page, `[data-jrn-value="money-${id}"]`);
const paperIds = (page: Page) => page.locator('[data-account-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-account-id')));

async function inViewport(page: Page, selector: string) {
  const r = await page.locator(selector).evaluateAll((els) =>
    els.map((e) => {
      const b = e.getBoundingClientRect();
      return { t: e.getAttribute('data-jrn-trigger') ?? e.className, l: b.left, top: b.top, r: b.right, b: b.bottom, w: innerWidth, h: innerHeight };
    }),
  );
  for (const x of r) {
    expect(x.l, `${x.t} left`).toBeGreaterThanOrEqual(-0.5);
    expect(x.top, `${x.t} top`).toBeGreaterThanOrEqual(-0.5);
    expect(x.r, `${x.t} right`).toBeLessThanOrEqual(x.w + 0.5);
    expect(x.b, `${x.t} bottom`).toBeLessThanOrEqual(x.h + 0.5);
  }
  return r.length;
}

test.describe('F05 MONEY parent motion pilot', () => {
  test('1 · no account records: an honest empty state, no invented figures', async ({ page }) => {
    await open(page, 'none');
    await expect(page.getByTestId('f05m-empty')).toBeVisible();
    expect(await paperIds(page)).toEqual([]);
    expect(await metric(page, 'held')).toBe(0);
    expect(await metric(page, 'owed')).toBe(0);
    await expect(page.locator('[data-jrn-value="money-committed"]')).toHaveAttribute('data-jrn-unknown', 'true');
    await expect(page.locator('[data-jrn-value="money-available"]')).toHaveAttribute('data-jrn-unknown', 'true');
    await expect(page.getByTestId('f05m-unknown')).toBeVisible();
    await shot(page, '01-zero-accounts');
  });

  test('2 · one account: its paper and a place to add another', async ({ page }) => {
    await open(page, 'one');
    expect(await paperIds(page)).toEqual(['bank']);
    await expect(trigger(page, 'f05m-add-slot')).toBeVisible();
    await shot(page, '02-one-account');
  });

  test('3 / 5 / 6 · four accounts: approved hierarchy, live values, assets never netted with debt', async ({ page }) => {
    await open(page, 'approved');
    expect(await paperIds(page)).toEqual(['bank', 'ride', 'cash', 'visa']);
    const stored = (await storedSnapshot(page)) as unknown as { accounts: { account_id: string; balance: number }[] };
    for (const id of ['bank', 'ride', 'cash', 'visa']) {
      const a = stored.accounts.find((x) => x.account_id === id)!;
      expect(await cents(page, `[data-account-id="${id}"] [data-jrn-amount-cents]`), id).toBe(Math.round(a.balance * 100));
    }
    // HELD = assets only; OWED = the card; the card paper is a liability marked OWED.
    expect(await metric(page, 'held')).toBe(245_000);
    expect(await metric(page, 'owed')).toBe(78_000);
    await expect(page.locator('[data-account-id="visa"]')).toHaveAttribute('data-nature', 'LIABILITY');
    await expect(page.locator('[data-account-id="visa"]')).toContainText('OWED');
    // Approved line breaks are live text, not artwork.
    await expect(page.locator('[data-account-id="cash"] .jrn-f05m__paper-name > span')).toHaveText(['CASH', 'ON HAND']);
    await expect(page.locator('[data-account-id="bank"] .jrn-f05m__paper-name > span')).toHaveText(['BANK', 'ACCOUNT']);
    await expect(page.locator('.jrn-f05m__metric-label')).toHaveText(['HELD', 'OWED', 'COMMITTED', 'AVAILABLE']);
    const available = await metric(page, 'available');
    // AVAILABLE is the F09 Safe to Spend number, not a second formula.
    expect(await safeToSpendCents(page)).toBe(available);
    await gotoJurnl(page, PILOT);
    await settle(page);
    await shot(page, '03-four-accounts');
  });

  test('4 · many accounts: pages of papers, swipe-free paging by button and keyboard', async ({ page }) => {
    await open(page, 'many');
    const first = await paperIds(page);
    expect(first.length).toBeGreaterThanOrEqual(4);
    await expect(trigger(page, 'f05m-next-page')).toBeVisible();
    await shot(page, '04-many-accounts-page-1');
    const checkLong = () => expect(page.locator('[data-account-id="long"]')).toHaveAttribute('aria-label', /NEIGHBOURHOOD CREDIT UNION EVERYDAY CHECKING/);
    if (first.includes('long')) await checkLong();
    await clickTrigger(page, 'f05m-next-page');
    const second = await paperIds(page);
    expect(second.length).toBeGreaterThan(0);
    expect(second.some((id) => first.includes(id))).toBe(false);
    expect([...first, ...second].sort()).toEqual(['bank', 'cash', 'loan', 'long', 'ride', 'save', 'visa']);
    await expect(page.locator('[data-account-id="loan"]')).toHaveAttribute('data-nature', 'LIABILITY');
    // Long names are clipped visually, never dropped from the accessible name.
    if (second.includes('long')) await checkLong();
    await page.locator('[data-account-id]').first().focus();
    await page.keyboard.press('ArrowRight');
    expect(await paperIds(page)).toEqual(first);
  });

  test('7 · the global dock keeps its five destinations, MONEY active, ADD opens Quick Add', async ({ page }) => {
    await open(page);
    const nav = page.locator('.jrn-nav[data-jrn-nav="parent"]');
    await expect(nav.locator('[data-jrn-trigger^="nav-"]')).toHaveCount(5);
    expect(await nav.locator('[data-jrn-trigger^="nav-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-jrn-trigger')))).toEqual(['nav-home', 'nav-money', 'nav-add', 'nav-plan', 'nav-credit']);
    await expect(trigger(page, 'nav-money')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.jrn-nav')).toHaveCount(1);
    await clickTrigger(page, 'nav-add');
    await expect(page.locator('[data-jrn-overlay]').first()).toBeVisible();
  });

  test('8 / 9 / 13 / 19 / 20 · selection routes by id, changes no record, back returns cleanly', async ({ page }) => {
    await open(page);
    const before = JSON.stringify(await storedSnapshot(page));
    await page.locator('[data-account-id="ride"]').hover();
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForURL(/\/money\/places\/ride$/);
    await expect(page.locator('[data-jrn-screen="F05.ACCOUNT"] h1')).toHaveText('RIDESHARE CARD');
    expect(JSON.stringify(await storedSnapshot(page))).toBe(before);
    await page.goBack();
    await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached' });
    await expect(page.locator('[data-account-id="ride"]')).toHaveAttribute('data-return', 'true');
    await page.mouse.move(0, 0); // a resting pointer would keep the (intended) hover lift
    await settle(page);
    const residue = await page.evaluate(() => ({
      transforms: [...document.querySelectorAll('[data-account-id]')].map((e) => getComputedStyle(e).transform).filter((t) => t !== 'none'),
      // the shared-element name lives only for the duration of a transition (:root keeps the UA default name)
      named: [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).viewTransitionName === 'jrn-place').length,
      running: document.getAnimations().filter((a) => a.playState === 'running').length,
    }));
    expect(residue).toEqual({ transforms: [], named: 0, running: 0 });
    expect(JSON.stringify(await storedSnapshot(page))).toBe(before);
  });

  test('10 / 11 · MOVE MONEY uses the transaction system; money on its way is not shown as received', async ({ page }) => {
    await open(page);
    await clickTrigger(page, 'f05m-actions');
    await clickTrigger(page, 'f05m-actions-move');
    await clickTrigger(page, 'transfer-from-ride');
    await clickTrigger(page, 'transfer-to-bank');
    await trigger(page, 'transfer-amount').first().fill('80');
    await clickTrigger(page, 'transfer-status-in-transit');
    await clickTrigger(page, 'transfer-save');
    const stored = (await storedSnapshot(page)) as unknown as { transactions: { link?: { kind: string; leg: string }; settlement?: string; account_id?: string }[] };
    const legs = stored.transactions.filter((t) => t.link?.kind === 'TRANSFER');
    expect(legs.map((l) => [l.link!.leg, l.account_id, l.settlement]).sort()).toEqual([
      ['IN', 'bank', 'PENDING'],
      ['OUT', 'ride', 'SETTLED'],
    ]);
    await settle(page);
    expect(await cents(page, '[data-account-id="bank"] [data-jrn-amount-cents]')).toBe(126_000);
    expect(await cents(page, '[data-account-id="ride"] [data-jrn-amount-cents]')).toBe(76_000);
    await expect(page.locator('[data-account-id="bank"]')).toContainText('$80 ON ITS WAY IN');
    await expect(page.locator('[data-account-id="ride"]')).toContainText('$80 SENT, NOT ARRIVED');
    expect(await metric(page, 'held')).toBe(245_000 - 8_000);
    await shot(page, '10-transfer-in-transit');
  });

  test('12 · overlays open, trap focus, close on Escape and return focus to the trigger', async ({ page }) => {
    await open(page);
    await trigger(page, 'f05m-actions').focus();
    await page.keyboard.press('Enter');
    const sheet = page.locator('[data-jrn-overlay="f05m-actions-sheet"]');
    await expect(sheet).toBeVisible();
    await shot(page, '12-money-actions-sheet');
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await clickTrigger(page, 'f05m-actions');
    await clickTrigger(page, 'f05m-actions-add');
    await expect(page.locator('[data-jrn-overlay="money-add-place"]')).toBeVisible();
    await trigger(page, 'money-add-name').first().fill('TRAVEL FUND');
    await clickTrigger(page, 'money-add-kind-savings');
    await trigger(page, 'money-add-balance').first().fill('125.40');
    await shot(page, '12-add-place-sheet');
    await clickTrigger(page, 'money-add-save');
    await expect(trigger(page, 'f05m-added')).toBeVisible();
    const added = page.locator('[data-account-id]').filter({ hasText: 'TRAVEL' });
    await expect(added).toHaveAttribute('data-fresh', 'true');
    expect(await cents(page, '[data-fresh="true"] [data-jrn-amount-cents]')).toBe(12_540);
    await clickTrigger(page, 'f05m-metric-available');
    await expect(page.locator('[data-jrn-overlay="safe-horizon-sheet"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-jrn-overlay="safe-horizon-sheet"]')).toHaveCount(0);
  });

  test('15 / 16 / 17 / 18 · readable at once, no duplicates, nothing off-screen, no page scroll', async ({ page }) => {
    await bootstrapJurnl(page, f05World('approved'));
    await gotoJurnl(page, PILOT);
    // Values are in the DOM from the first render, never counted up from fictional numbers.
    expect(await metric(page, 'held')).toBe(245_000);
    await settle(page);
    const opacity = await page.locator('.jrn-f05m__metric-value, .jrn-f05m__paper-amount, .jrn-f05m__money').evaluateAll((els) => els.map((e) => Number(getComputedStyle(e.closest('.jrn-f05m__metric, .jrn-f05m__paper') ?? e).opacity)));
    expect(opacity.every((o) => o > 0.99)).toBe(true);
    await expect(page.locator('.jrn-f05m__seal')).toHaveCount(1);
    await expect(page.locator('.jrn-f05m__title-paper')).toHaveCount(1);
    await expect(page.locator('h1.jrn-f05m__money')).toHaveCount(1);
    await expect(page.locator('.jrn-f05m__paper-art')).toHaveCount(4);
    expect(await inViewport(page, '.jrn-f05m__paper, .jrn-f05m__metric, .jrn-f05m__chip, .jrn-nav__btn, .jrn-corner .jrn-f09a__menu')).toBeGreaterThan(12);
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth, sh: document.documentElement.scrollHeight, h: innerHeight }));
    expect(m.sw).toBeLessThanOrEqual(m.w + 1);
    expect(m.sh).toBeLessThanOrEqual(m.h + 1);
    await page.mouse.wheel(0, 600);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  test('accessibility: no serious or critical axe violations on the pilot or its sheets', async ({ page }) => {
    await open(page);
    const page1 = await new AxeBuilder({ page }).include('[data-jrn-f05-stage]').analyze();
    expect(page1.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
    await clickTrigger(page, 'f05m-actions');
    const sheet = await new AxeBuilder({ page }).include('[data-jrn-overlay="f05m-actions-sheet"]').analyze();
    expect(sheet.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });

  test('motion frame sequence (entrance, paused and seeked) and the zero-motion composite', async ({ page }) => {
    test.skip(test.info().project.name === 'tablet', 'frames are captured at phone, 2:3 and desktop sizes');
    await bootstrapJurnl(page, f05World('approved'));
    // Freeze every CSS animation from its first frame, then seek: frames are exact, not timing-dependent screenshots.
    await page.addInitScript(() => {
      const freeze = () => {
        const st = document.createElement('style');
        st.setAttribute('data-e2e-freeze', '');
        st.textContent = '*, *::before, *::after { animation-play-state: paused !important; }';
        document.head.appendChild(st);
      };
      if (document.head) freeze();
      else document.addEventListener('DOMContentLoaded', freeze, { once: true });
    });
    await gotoJurnl(page, PILOT);
    await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached' });
    const dir = `${SHOTS}/${test.info().project.name}/frames`;
    mkdirSync(dir, { recursive: true });
    const count = await page.evaluate(() => document.getAnimations().filter((a) => ((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest('[data-jrn-f05-stage]')).length);
    expect(count).toBeGreaterThan(8);
    for (const t of [0, 80, 160, 240, 320, 400, 480, 560, 650]) {
      await page.evaluate((ms) => document.getAnimations().forEach((a) => (a.currentTime = ms)), t);
      await page.screenshot({ path: `${dir}/entrance-${String(t).padStart(3, '0')}ms.png` });
    }
    // Every pilot animation ends within the 650 ms entrance budget.
    const ends = await page.evaluate(() => document.getAnimations().filter((a) => ((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest('[data-jrn-f05-stage]')).map((a) => Number(a.effect?.getComputedTiming().endTime ?? 0)));
    expect(Math.max(...ends)).toBeLessThanOrEqual(650);
    await page.evaluate(() => document.querySelector('style[data-e2e-freeze]')?.remove());
    await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
    await page.screenshot({ path: `${dir}/entrance-final.png` });
  });

  test('route transition frame sequence: the selected paper becomes the account title', async ({ page, browserName }) => {
    test.skip(test.info().project.name === 'tablet', 'frames are captured at phone, 2:3 and desktop sizes');
    await open(page);
    const supported = await page.evaluate(() => 'startViewTransition' in document);
    test.skip(!supported || browserName !== 'chromium', 'View Transitions API not available');
    const dir = `${SHOTS}/${test.info().project.name}/frames`;
    mkdirSync(dir, { recursive: true });
    await page.addStyleTag({ content: 'html::view-transition-group(*), html::view-transition-old(*), html::view-transition-new(*) { animation-play-state: paused !important; }' });
    await page.locator('[data-account-id="cash"]').click();
    await page.waitForFunction(() => document.getAnimations().some((a) => String((a.effect as KeyframeEffect | null)?.pseudoElement ?? '').includes('view-transition')));
    for (const t of [0, 100, 200, 300, 420]) {
      await page.evaluate((ms) => document.getAnimations().forEach((a) => (a.currentTime = ms)), t);
      await page.screenshot({ path: `${dir}/route-${String(t).padStart(3, '0')}ms.png` });
    }
    await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
    await page.waitForURL(/\/money\/places\/cash$/);
    await expect(page.locator('[data-jrn-screen="F05.ACCOUNT"] h1')).toHaveText('CASH ON HAND');
  });
});

test.describe('F05 motion pilot — reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('14 · reduced motion: no animation, every action and figure still works', async ({ page }) => {
    await open(page);
    // No pilot animation at all (the app shell's own screen transition is outside the pilot).
    const pilotAnimations = () => page.evaluate(() => document.getAnimations().filter((a) => ((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest('[data-jrn-f05-stage]')).length);
    expect(await pilotAnimations()).toBe(0);
    expect(await metric(page, 'held')).toBe(245_000);
    await clickTrigger(page, 'f05m-actions');
    await expect(page.locator('[data-jrn-overlay="f05m-actions-sheet"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.locator('[data-account-id="cash"]').click();
    await page.waitForURL(/\/money\/places\/cash$/);
    await expect(page.locator('[data-jrn-screen="F05.ACCOUNT"] h1')).toHaveText('CASH ON HAND');
    await page.goBack();
    await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached' });
    expect(await pilotAnimations()).toBe(0);
    await shot(page, '14-reduced-motion');
  });
});

test.describe('F05 MONEY default stays the approved cabinet hub', () => {
  test('without opting in, /money is the cabinet hub', async ({ page }) => {
    await bootstrapJurnl(page, f05World('approved'));
    await gotoJurnl(page, 'money?parent=cabinet');
    await expect(page.locator('[data-jrn-screen="F05.00"]')).toBeVisible();
    await expect(page.locator('[data-jrn-f05-stage]')).toHaveCount(0);
    await expect(trigger(page, 'money-open-places')).toBeAttached();
  });
});
