/**
 * P0.JURNL.FINANCIAL-OS.FOUNDER-DECISIONS-TRANSFER-SETTLEMENT-AND-E2E-STABILIZATION1 — journeys.
 * Same synthetic world as jurnl-financial-os.e2e.ts (helpers/jurnl-financial-world.ts). Device repository only.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { addDays, getTodayKey } from '../../src/projects/jurnl/data/foundation/dates';
import { financialWorld } from './helpers/jurnl-financial-world';
import { bootstrapJurnl, clickTrigger, expectScreen, gotoJurnl, safeToSpendCents, trigger } from './helpers/jurnl-page';

const TODAY = getTodayKey();
const SHOTS = process.env.JURNL_STAB_SHOTS_DIR ?? 'test-results/jurnl-stabilization-shots';

async function shot(page: Page, name: string) {
  const dir = `${SHOTS}/${test.info().project.name}`;
  mkdirSync(dir, { recursive: true });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${dir}/${name}.png` });
}

async function fill(page: Page, name: string, value: string) {
  const el = trigger(page, name).first();
  await el.scrollIntoViewIfNeeded();
  await el.fill(value);
}

async function reveal(page: Page, name: string) {
  return revealSelector(page, `[data-jrn-trigger="${name}"]`);
}

/** Pages a frame forward until the element is on screen (FamilyFrame paginates instead of scrolling). */
async function revealSelector(page: Page, selector: string) {
  for (let i = 0; i < 6; i += 1) {
    if (await page.locator(selector).first().isVisible().catch(() => false)) return;
    const next = page.locator('[data-jrn-trigger="frame-next"]').first();
    if (!(await next.isVisible().catch(() => false))) return;
    await next.click();
  }
}

async function placeAmount(page: Page, id: string) {
  await gotoJurnl(page, 'money/places');
  return (await trigger(page, `money-place-${id}`).first().locator('.jrn-tx__amt').innerText()).trim();
}

async function noPageOverflow(page: Page) {
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth, sh: document.documentElement.scrollHeight, h: window.innerHeight }));
  expect(m.sw, 'no horizontal page scroll').toBeLessThanOrEqual(m.w + 1);
  expect(m.sh, 'no page-level vertical scroll').toBeLessThanOrEqual(m.h + 1);
}

async function addBill(page: Page, name: string, amount: string, dueIn: number, account: string, cardLink?: string) {
  await gotoJurnl(page, 'upcoming');
  await reveal(page, 'upcoming-add');
  await clickTrigger(page, 'upcoming-add');
  await fill(page, 'upcoming-add-name', name);
  await fill(page, 'upcoming-add-amount', amount);
  await fill(page, 'upcoming-due', addDays(TODAY, dueIn));
  await clickTrigger(page, `upcoming-account-${account}`);
  if (cardLink) await clickTrigger(page, `upcoming-card-link-${cardLink}`);
  await clickTrigger(page, 'upcoming-add-save');
}

test.describe('Stabilization journeys', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapJurnl(page, financialWorld());
  });

  test('D1 Safe to Spend: next 30 days, then before next income; the 30-day number never changes', async ({ page }) => {
    const before = await safeToSpendCents(page);
    await expect(trigger(page, 'safe-open-horizon')).toContainText('NEXT 30 DAYS');
    await noPageOverflow(page);
    await shot(page, '01-safe-parent-period-line');
    await clickTrigger(page, 'safe-open-horizon');
    await expect(page.getByTestId('safe-horizon-30')).toContainText('UPCOMING PAYMENTS');
    await clickTrigger(page, 'safe-horizon-before-next-income');
    await expect(page.getByTestId('safe-horizon-no-income')).toHaveText('NO NEXT INCOME DATE RECORDED.');
    await shot(page, '02-horizon-no-income');
    await clickTrigger(page, 'safe-horizon-add-income');
    await expect(page.locator('[data-jrn-overlay="income-add-sheet"]')).toBeVisible();
    await fill(page, 'income-add-name', 'PAYCHECK');
    await fill(page, 'income-add-date', addDays(TODAY, 7));
    await fill(page, 'income-add-amount', '1200');
    await clickTrigger(page, 'income-add-save');
    expect(await safeToSpendCents(page)).toBe(before);
    await clickTrigger(page, 'safe-open-horizon');
    await clickTrigger(page, 'safe-horizon-before-next-income');
    await expect(page.getByTestId('safe-horizon-income')).toContainText('PAYCHECK');
    await expect(page.getByTestId('safe-horizon-income')).toContainText('$1,200 EXPECTED, NOT RECEIVED');
    await expect(page.getByTestId('safe-horizon-unchanged')).toContainText('STAYS');
    await shot(page, '03-horizon-before-next-income');
    await page.keyboard.press('Escape');
    expect(await safeToSpendCents(page)).toBe(before);
  });

  test('transfer in transit: out of the source, not in the bank until it arrives, credited once', async ({ page }) => {
    await gotoJurnl(page, 'money/places');
    await reveal(page, 'money-move');
    await clickTrigger(page, 'money-move');
    await clickTrigger(page, 'transfer-from-uber');
    await clickTrigger(page, 'transfer-to-bank');
    await fill(page, 'transfer-amount', '80');
    await clickTrigger(page, 'transfer-status-in-transit');
    await expect(page.getByTestId('transfer-effect')).toContainText('IN TRANSIT');
    await shot(page, '04-transfer-in-transit-form');
    await clickTrigger(page, 'transfer-save');
    expect(await placeAmount(page, 'uber')).toBe('$160');
    expect(await placeAmount(page, 'bank')).toBe('$500');
    await expect(page.getByTestId('places-summary')).toContainText('$80 IN TRANSIT');
    await shot(page, '05-places-in-transit');
    await revealSelector(page, '[data-jrn-trigger^="open-transfer-"]');
    await page.locator('[data-jrn-trigger^="open-transfer-"]').first().click();
    await expect(page.getByTestId('transfer-detail-facts')).toHaveAttribute('data-state', 'IN_TRANSIT');
    await clickTrigger(page, 'transfer-step-received');
    await expect(trigger(page, 'transfer-step-result')).toContainText('ARRIVED');
    expect(await placeAmount(page, 'bank')).toBe('$580');
    expect(await placeAmount(page, 'uber')).toBe('$160');
    await expect(page.getByTestId('places-summary')).not.toContainText('IN TRANSIT');
  });

  test('a started transfer that never left can be cancelled with no change', async ({ page }) => {
    await gotoJurnl(page, 'money/places');
    await reveal(page, 'money-move');
    await clickTrigger(page, 'money-move');
    await clickTrigger(page, 'transfer-from-cash');
    await clickTrigger(page, 'transfer-to-bank');
    await fill(page, 'transfer-amount', '60');
    await clickTrigger(page, 'transfer-status-pending');
    await clickTrigger(page, 'transfer-save');
    expect(await placeAmount(page, 'cash')).toBe('$100');
    expect(await placeAmount(page, 'bank')).toBe('$500');
    await revealSelector(page, '[data-jrn-trigger^="open-transfer-"]');
    await page.locator('[data-jrn-trigger^="open-transfer-"]').first().click();
    await clickTrigger(page, 'transfer-step-cancel');
    expect(await placeAmount(page, 'cash')).toBe('$100');
    expect(await placeAmount(page, 'bank')).toBe('$500');
  });

  test('card payment on its way: the card is not settled until it confirms; the minimum is counted once', async ({ page }) => {
    const before = await safeToSpendCents(page);
    await gotoJurnl(page, 'credit/visa');
    await reveal(page, 'credit-record-payment');
    await clickTrigger(page, 'credit-record-payment');
    await clickTrigger(page, 'card-pay-status-in-transit');
    await clickTrigger(page, 'card-pay-save');
    await expect(trigger(page, 'card-pay-result')).toContainText('STILL OWES $400');
    await expect(page.getByTestId('card-safety-line')).toHaveAttribute('data-state', 'PAYMENT_PENDING');
    await expect(page.getByTestId('card-headline')).toContainText('$400 OWED');
    await shot(page, '06-card-payment-pending');
    // Money left UBER CARD ($45) and the minimum is no longer deducted: Safe to Spend is unchanged overall.
    expect(await safeToSpendCents(page)).toBe(before);
    await gotoJurnl(page, 'credit/visa');
    await revealSelector(page, '[data-jrn-trigger^="open-transfer-"]');
    await page.locator('[data-jrn-trigger^="open-transfer-"]').first().click();
    await clickTrigger(page, 'transfer-step-received');
    await gotoJurnl(page, 'credit/visa');
    await expect(page.getByTestId('card-headline')).toContainText('$355 OWED');
    await expect(page.getByTestId('card-safety-line')).toHaveAttribute('data-state', 'MINIMUM_PAID');
    expect(await safeToSpendCents(page)).toBe(before);
  });

  test('D3 set money aside: the bill page and Plan show and change the same amount', async ({ page }) => {
    await addBill(page, 'CAR INSURANCE', '140', 3, 'bank');
    const before = await safeToSpendCents(page);
    await gotoJurnl(page, 'upcoming');
    await page.locator('[data-jrn-trigger^="upcoming-up-obl-"]').first().click();
    await reveal(page, 'upcoming-set-aside');
    await clickTrigger(page, 'upcoming-set-aside');
    await clickTrigger(page, 'set-aside-account-bank');
    await fill(page, 'set-aside-amount', '95');
    await clickTrigger(page, 'set-aside-save');
    await expect(page.getByTestId('obligation-funding-line')).toContainText('$95 OF $140 SET ASIDE · $45 STILL NEEDED');
    await gotoJurnl(page, 'plan');
    await clickTrigger(page, 'plan-add-intention');
    const row = page.getByTestId('plan-bill-set-asides');
    await expect(row).toContainText('$95 OF $140 SET ASIDE · $45 STILL NEEDED');
    await shot(page, '07-plan-set-aside-shared');
    await page.locator('[data-jrn-trigger^="plan-bill-"]').first().click();
    await fill(page, 'set-aside-amount', '35');
    await clickTrigger(page, 'set-aside-reduce-bank');
    await gotoJurnl(page, 'upcoming');
    await page.locator('[data-jrn-trigger^="upcoming-up-obl-"]').first().click();
    await expect(page.getByTestId('obligation-funding-line')).toContainText('$60 OF $140 SET ASIDE · $80 STILL NEEDED');
    expect(await safeToSpendCents(page)).toBe(before);
  });

  test('D2 a bill that is the card payment is counted once, through the card', async ({ page }) => {
    const before = await safeToSpendCents(page);
    await addBill(page, 'VISA PAYMENT', '45', 3, 'uber', 'visa');
    expect(await safeToSpendCents(page)).toBe(before);
    await gotoJurnl(page, 'upcoming');
    await expect(page.locator('.jrn-tl__label', { hasText: 'VISA PAYMENT' })).toHaveCount(1);
  });

  test('D4 headlines and TODAY: straightforward labels; ASK JURNL reachable with an honest fallback', async ({ page }) => {
    await gotoJurnl(page, 'today');
    await expectScreen(page, 'F03.00');
    await expect(page.locator('[data-jrn-zone="intro"]').first()).toContainText('YOUR MONEY.');
    await noPageOverflow(page);
    await shot(page, '08-today-headline');
    await clickTrigger(page, 'today-more');
    await clickTrigger(page, 'today-ask');
    await expect(page.locator('[data-jrn-overlay="ask"]')).toContainText('NO LIVE AI PROVIDER');
    await gotoJurnl(page, 'income');
    await expect(page.locator('.jrn-lang__editorial').first()).toHaveText('YOUR INCOME AND DAILY EARNINGS.');
    await gotoJurnl(page, 'money');
    await expect(page.locator('[data-jrn-zone="intro"]').first()).toContainText('YOUR ACCOUNTS, CARDS AND CASH.');
    await noPageOverflow(page);
    await gotoJurnl(page, 'credit');
    await expect(page.locator('[data-jrn-zone="intro"]').first()).toContainText('WHAT YOU OWE AND WHEN.');
    await noPageOverflow(page);
    await shot(page, '09-credit-headline');
  });

  test('accessibility: new sheets have no serious or critical axe violations', async ({ page }) => {
    const check = async (label: string) => {
      const r = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
      const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${label}: ${v.id} (${v.nodes.length})`)).toEqual([]);
    };
    await safeToSpendCents(page);
    await clickTrigger(page, 'safe-open-horizon');
    await check('planning period');
    await gotoJurnl(page, 'money/places');
    await reveal(page, 'money-move');
    await clickTrigger(page, 'money-move');
    await check('move money');
    await gotoJurnl(page, 'today');
    await clickTrigger(page, 'today-more');
    await check('today more');
  });
});
