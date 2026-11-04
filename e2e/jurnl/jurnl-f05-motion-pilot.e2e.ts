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

  test('4 · many accounts: the first four places and VIEW ALL ACCOUNTS; more places never add pages or dots', async ({ page }) => {
    // Carousel sprint: the dots are the four collections. More than four places is a nested route, not pagination.
    // DOT 01 sprint (V9 authority 01): four places always, then VIEW ALL ACCOUNTS (replaces the ALL PLACES paper).
    await open(page, 'many');
    expect(await paperIds(page)).toEqual(['bank', 'ride', 'cash', 'visa']);
    await expect(trigger(page, 'f05m-view-all')).toBeVisible();
    await expect(trigger(page, 'f05m-view-all')).toHaveAttribute('aria-label', /7 PLACES/);
    await expect(page.locator('.jrn-f05m__dot')).toHaveCount(4);
    await expect(page.locator('[data-jrn-trigger="f05m-next-page"]')).toHaveCount(0);
    await shot(page, '04-many-accounts');
    await clickTrigger(page, 'f05m-view-all');
    await page.waitForURL(/\/money\/places$/);
    // every place is on the full list, long names in full
    for (const name of ['EMERGENCY SAVINGS', 'NEIGHBOURHOOD CREDIT UNION EVERYDAY CHECKING', 'CAR LOAN']) await expect(page.getByText(name, { exact: false }).first()).toBeAttached();
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
    // the papers name the canonical #1706 state: arriving at the bank, leaving the rideshare card, not received
    await expect(page.locator('[data-account-id="bank"]')).toContainText('← $80 IN TRANSIT');
    await expect(page.locator('[data-account-id="ride"]')).toContainText('→ $80 IN TRANSIT');
    expect(await metric(page, 'held')).toBe(245_000 - 8_000);
    await shot(page, '10-transfer-in-transit');
  });

  test('transfer states drive the thread; only recorded steps move money', async ({ page }) => {
    await open(page);
    const amount = (id: string) => cents(page, `[data-account-id="${id}"] [data-jrn-amount-cents]`);
    const legs = async () => ((await storedSnapshot(page)) as unknown as { transactions: { link?: { kind: string; leg: string; id: string }; settlement?: string }[] }).transactions.filter((t) => t.link);
    const move = async (from: string, to: string, value: string, status: string) => {
      await clickTrigger(page, 'f05m-actions');
      await clickTrigger(page, 'f05m-actions-move');
      await clickTrigger(page, `transfer-from-${from}`);
      await clickTrigger(page, `transfer-to-${to}`);
      await trigger(page, 'transfer-amount').first().fill(value);
      await clickTrigger(page, `transfer-status-${status}`);
      await clickTrigger(page, 'transfer-save');
      await settle(page);
    };
    const token = () => page.locator('.jrn-f05m__token:not(.jrn-f05m__token--ghost)');
    const step = async (name: string) => {
      await token().first().click();
      await clickTrigger(page, name);
      await page.keyboard.press('Escape');
      await settle(page);
    };

    // SCHEDULED: a planned connection, no money moved.
    await move('ride', 'bank', '80', 'scheduled');
    await expect(page.locator('.jrn-f05m__thread')).toHaveAttribute('data-state', 'SCHEDULED');
    await expect(token()).toHaveAttribute('data-state', 'SCHEDULED');
    expect([await amount('ride'), await amount('bank'), await metric(page, 'held')]).toEqual([84_000, 126_000, 245_000]);
    await expect(page.locator('[data-account-id="ride"]')).toContainText('→ $80 PLANNED');
    await expect(page.locator('[data-account-id="bank"]')).toContainText('← $80 PLANNED');
    // the token rests on the source paper (nothing has left)
    const rest = await page.evaluate(() => {
      const t = document.querySelector('.jrn-f05m__token')!.getBoundingClientRect();
      const r = document.querySelector('[data-account-id="ride"]')!.getBoundingClientRect();
      return { overSource: t.left + t.width / 2 > r.left && t.left + t.width / 2 < r.right, nearTop: Math.abs(t.bottom - r.top) < 12 };
    });
    expect(rest).toEqual({ overSource: true, nearTop: true });
    await shot(page, '20-transfer-scheduled');

    // LEFT THE SOURCE (recorded step): the source is debited, the destination is not credited, the token sits between.
    await step('transfer-step-left-source');
    await expect(page.locator('.jrn-f05m__thread')).toHaveAttribute('data-state', 'IN_TRANSIT');
    expect([await amount('ride'), await amount('bank'), await metric(page, 'held')]).toEqual([76_000, 126_000, 237_000]);
    await expect(page.locator('[data-account-id="bank"]')).toContainText('← $80 IN TRANSIT');
    expect((await legs()).map((l) => `${l.link!.leg}:${l.settlement}`).sort()).toEqual(['IN:PENDING', 'OUT:SETTLED']);
    await shot(page, '21-transfer-in-transit');

    // ARRIVED (recorded step): credited exactly once, the thread resolves.
    await step('transfer-step-received');
    await expect(page.locator('.jrn-f05m__thread')).toHaveCount(0);
    expect([await amount('ride'), await amount('bank'), await metric(page, 'held')]).toEqual([76_000, 134_000, 245_000]);
    await expect(page.locator('[data-account-id="bank"]')).not.toContainText('IN TRANSIT');

    // FAILED, money returned (recorded step): restored by the accounting operation, never by the animation.
    await move('cash', 'bank', '50', 'in-transit');
    expect([await amount('cash'), await amount('bank')]).toEqual([30_000, 134_000]);
    await token().first().click();
    await clickTrigger(page, 'transfer-step-fail');
    await clickTrigger(page, 'transfer-fail-returned');
    await page.keyboard.press('Escape');
    await settle(page);
    await expect(page.locator('.jrn-f05m__thread')).toHaveCount(0);
    expect([await amount('cash'), await amount('bank')]).toEqual([35_000, 134_000]);

    // CARD PAYMENT: submitted → paid from the bank, card not confirmed → card confirmed. The debt falls only at the end.
    await move('bank', 'visa', '35', 'pending');
    await expect(token()).toHaveAttribute('data-kind', 'CARD_PAYMENT');
    await expect(page.locator('[data-account-id="visa"]')).toContainText('← $35 PAYMENT SUBMITTED');
    expect([await amount('bank'), await amount('visa'), await metric(page, 'owed')]).toEqual([134_000, 78_000, 78_000]);
    await step('transfer-step-left-source');
    await expect(page.locator('[data-account-id="visa"]')).toContainText('← $35 CARD NOT CONFIRMED');
    await expect(token()).toContainText('NOT CONFIRMED');
    await expect(token()).toHaveAttribute('aria-label', /^PAID FROM ACCOUNT · CARD NOT CONFIRMED: \$35/);
    expect([await amount('bank'), await amount('visa'), await metric(page, 'owed')]).toEqual([130_500, 78_000, 78_000]);
    await expect(token()).toHaveAttribute('aria-label', /RECORDED BY YOU, NOT CONFIRMED BY A BANK/);
    await shot(page, '22-card-payment-not-confirmed');
    await step('transfer-step-received');
    expect([await amount('bank'), await amount('visa'), await metric(page, 'owed')]).toEqual([130_500, 74_500, 74_500]);
    await expect(page.locator('.jrn-f05m__thread')).toHaveCount(0);

    // The page itself never wrote anything: every leg came from the sheets' recorded steps.
    const before = JSON.stringify(await storedSnapshot(page));
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached' });
    await settle(page);
    expect(JSON.stringify(await storedSnapshot(page))).toBe(before);
  });

  test('12 · overlays open, trap focus, close on Escape and return focus to the trigger', async ({ page }) => {
    await open(page);
    await trigger(page, 'f05m-actions').focus();
    await page.keyboard.press('Enter');
    const sheet = page.locator('[data-jrn-overlay="f05m-actions-sheet"]');
    await expect(sheet).toBeVisible();
    await shot(page, '12-money-actions-sheet');
    // focus is inside the sheet while it is open, and comes back to the chip that opened it
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-jrn-overlay="f05m-actions-sheet"]'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-jrn-trigger'))).toBe('f05m-actions');
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
