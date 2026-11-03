/**
 * P0.JURNL.PERSONAL-FINANCIAL-OPERATING-SYSTEM — user journeys across F03 / F04 / F05 / F06 / F07 / F09 / F12.
 * Synthetic world only: BANK $500 · UBER CARD (payout debit card) $240 · CASH $100 · VISA owes $400 of a $2,000 limit,
 * minimum $45 due in 3 days. No sample transactions, so every figure on screen is checkable by hand.
 * Device repository (localStorage) — not production persistence and not a bank connection.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { buildJurnlE2eBootstrap } from '../../src/projects/jurnl/e2e/fixture';
import type { JurnlAccountRecord } from '../../src/projects/jurnl/data/foundation/accounts';
import { addDays, getTodayKey } from '../../src/projects/jurnl/data/foundation/dates';
import { bootstrapJurnl, clickTrigger, expectScreen, gotoJurnl, trigger } from './helpers/jurnl-page';

const TODAY = getTodayKey();
const SHOTS = process.env.JURNL_FIN_SHOTS_DIR ?? 'test-results/jurnl-financial-os-shots';

function acct(id: string, name: string, type: JurnlAccountRecord['account_type'], balance: number, extra: Partial<JurnlAccountRecord> = {}): JurnlAccountRecord {
  const now = new Date().toISOString();
  return {
    account_id: id,
    user_id: 'E2E@JURNL.TEST',
    institution_id: null,
    display_name: name,
    account_type: type,
    subtype: null,
    currency: 'USD',
    balance,
    available_balance: balance,
    credit_limit: null,
    is_manual: true,
    is_connected: false,
    connection_id: null,
    status: 'ACTIVE',
    include_in_safe_to_spend: type !== 'CREDIT_CARD',
    include_in_net_worth: true,
    include_in_spending: true,
    masked_identifier: null,
    as_of: TODAY,
    created_at: now,
    updated_at: now,
    archived_at: null,
    ...extra,
  };
}

function financialWorld() {
  const base = buildJurnlE2eBootstrap();
  const now = new Date().toISOString();
  return {
    ...base,
    snapshot: {
      ...base.snapshot,
      accounts: [
        acct('bank', 'BANK', 'CHECKING', 500),
        acct('uber', 'UBER CARD', 'DEBIT_CARD', 240, { is_payout_card: true }),
        acct('cash', 'CASH', 'CASH', 100),
        acct('visa', 'VISA', 'CREDIT_CARD', 400, { credit_limit: 2000, available_balance: 1600, include_in_safe_to_spend: false }),
      ],
      creditAttributes: [
        {
          account_id: 'visa',
          credit_limit: 2000,
          current_balance: 400,
          minimum_payment: 45,
          payment_due_day: null,
          statement_day: null,
          apr: 24.9,
          statement_balance: 400,
          statement_closing_date: addDays(TODAY, -10),
          payment_due_date: addDays(TODAY, 3),
          carries_interest_balance: false,
          terms_entered_at: now,
          updated_at: now,
        },
      ],
      transactions: [],
      obligations: [],
      incomeSources: [],
      planIntentions: [],
      goals: [],
      purchases: [],
      trips: [],
      dailyEarnings: [],
      reservations: [],
      settings: { ...base.snapshot.settings, safeToSpendBuffer: '' },
      setup: { ...base.snapshot.setup, protectedAmount: '', protectedSkipped: true, obligations: [] },
    },
  };
}

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

async function placeAmount(page: Page, id: string) {
  await gotoJurnl(page, 'money/places');
  return (await trigger(page, `money-place-${id}`).first().locator('.jrn-tx__amt').innerText()).trim();
}

/** The live Safe to Spend figure from the F09 parent (one formula owner). */
async function safeToSpend(page: Page) {
  await gotoJurnl(page, 'safe');
  await expectScreen(page, 'F09.00');
  return (await page.locator('[data-jrn-panel="signal"]').first().innerText()).replace(/\s+/g, ' ');
}

/** Pages a frame forward until the trigger is reachable (FamilyFrame paginates instead of scrolling). */
async function reveal(page: Page, name: string) {
  for (let i = 0; i < 6; i += 1) {
    if (await trigger(page, name).first().isVisible().catch(() => false)) return;
    const next = page.locator('[data-jrn-trigger="frame-next"], [data-jrn-frame-next]').first();
    if (!(await next.isVisible().catch(() => false))) return;
    await next.click();
  }
}

async function noPageOverflow(page: Page) {
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth, sh: document.documentElement.scrollHeight, h: window.innerHeight }));
  expect(m.sw, 'no horizontal page scroll').toBeLessThanOrEqual(m.w + 1);
  expect(m.sh, 'no page-level vertical scroll').toBeLessThanOrEqual(m.h + 1);
}

test.describe('Financial operating system journeys', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapJurnl(page, financialWorld());
  });

  test('daily earnings: one entry, cash and digital land in the right places, edit without duplication', async ({ page }) => {
    await gotoJurnl(page, 'income');
    await expectScreen(page, 'F06.00');
    await reveal(page, 'income-add-earnings');
    await clickTrigger(page, 'income-add-earnings');
    await expect(page.locator('[data-jrn-overlay="earnings-sheet"]')).toBeVisible();
    await fill(page, 'earnings-digital', '180');
    await fill(page, 'earnings-digital-tips', '25');
    await fill(page, 'earnings-cash-tips', '15');
    const totals = page.getByTestId('earnings-totals');
    await expect(totals).toContainText('TOTAL EARNED');
    await expect(totals).toContainText('$195');
    await expect(totals).toContainText('$180');
    await expect(totals).toContainText('$15');
    // The usual account for rideshare pay is the payout card; cash tips go to cash.
    await expect(trigger(page, 'earnings-digital-account-uber')).toHaveAttribute('aria-pressed', 'true');
    await expect(trigger(page, 'earnings-cash-account-cash')).toHaveAttribute('aria-pressed', 'true');
    await shot(page, '01-daily-earnings-form');
    await clickTrigger(page, 'earnings-save');
    await expect(page.locator('[data-jrn-overlay="earnings-next"]')).toBeVisible();
    await shot(page, '02-daily-earnings-saved-next-steps');
    await clickTrigger(page, 'earnings-next-done');
    expect(await placeAmount(page, 'uber')).toBe('$420');
    expect(await placeAmount(page, 'cash')).toBe('$115');
    expect(await placeAmount(page, 'bank')).toBe('$500');
    await shot(page, '03-places-after-earnings');
    // Edit: cash tips were really $0 → cash goes back, no second income.
    await gotoJurnl(page, 'income');
    await reveal(page, 'income-add-earnings');
    await page.locator('[data-jrn-trigger^="earnings-day-"]').first().click();
    await clickTrigger(page, 'earnings-edit');
    await fill(page, 'earnings-cash-tips', '0');
    await clickTrigger(page, 'earnings-save');
    expect(await placeAmount(page, 'cash')).toBe('$100');
    expect(await placeAmount(page, 'uber')).toBe('$420');
    await gotoJurnl(page, 'activity');
    await expect(page.locator('.jrn-tx__name', { hasText: 'UBER EARNINGS' })).toHaveCount(1);
    await expect(page.locator('.jrn-tx__name', { hasText: 'CASH TIPS' })).toHaveCount(0);
    // Persists across a reload.
    await page.reload({ waitUntil: 'networkidle' });
    expect(await placeAmount(page, 'uber')).toBe('$420');
  });

  test('spending: card purchase raises what the card owes; cash purchase lowers cash; usual account suggested', async ({ page }) => {
    const before = await safeToSpend(page);
    await gotoJurnl(page, 'activity');
    await clickTrigger(page, 'activity-record-spending');
    await expect(page.getByTestId('spend-suggestion')).toContainText('VISA');
    await fill(page, 'spend-merchant', 'GROCER');
    await fill(page, 'spend-amount', '65');
    await shot(page, '04-record-spending-card-suggested');
    await clickTrigger(page, 'spend-save');
    await gotoJurnl(page, 'credit/visa');
    await expect(page.getByTestId('card-headline')).toContainText('$465 OWED');
    expect(await placeAmount(page, 'bank')).toBe('$500');
    // Safe to Spend does not drop for a credit purchase (no cash left any account).
    expect(await safeToSpend(page)).toBe(before);
    // Override the suggestion: pay cash.
    await gotoJurnl(page, 'activity');
    await clickTrigger(page, 'activity-record-spending');
    await clickTrigger(page, 'spend-category-food');
    await clickTrigger(page, 'spend-account-cash');
    await fill(page, 'spend-merchant', 'LUNCH');
    await fill(page, 'spend-amount', '12.45');
    await clickTrigger(page, 'spend-save');
    expect(await placeAmount(page, 'cash')).toBe('$87.55');
    expect(await placeAmount(page, 'bank')).toBe('$500');
  });

  test('transfer: moving money between owned accounts is not income', async ({ page }) => {
    await gotoJurnl(page, 'money/places');
    await reveal(page, 'money-move');
    await clickTrigger(page, 'money-move');
    await clickTrigger(page, 'transfer-from-uber');
    await clickTrigger(page, 'transfer-to-bank');
    await fill(page, 'transfer-amount', '200');
    await shot(page, '05-move-money');
    await clickTrigger(page, 'transfer-save');
    expect(await placeAmount(page, 'uber')).toBe('$40');
    expect(await placeAmount(page, 'bank')).toBe('$700');
    // Not income: nothing is earned today, and Activity labels both sides as a transfer.
    await gotoJurnl(page, 'income');
    await expect(page.getByTestId('earnings-today')).toContainText('$0');
    await gotoJurnl(page, 'activity');
    await expect(page.locator('.jrn-tx', { hasText: 'TRANSFER TO BANK' })).toContainText('TRANSFER');
    await expect(page.locator('.jrn-tx', { hasText: 'TRANSFER FROM UBER CARD' })).toContainText('TRANSFER');
  });

  test('bill funding: $95 set aside toward $140 does not lower Safe to Spend again; paying records one payment', async ({ page }) => {
    await gotoJurnl(page, 'upcoming');
    await reveal(page, 'upcoming-add');
    await clickTrigger(page, 'upcoming-add');
    await fill(page, 'upcoming-add-name', 'CAR INSURANCE');
    await fill(page, 'upcoming-add-amount', '140');
    await fill(page, 'upcoming-due', addDays(TODAY, 3));
    await clickTrigger(page, 'upcoming-account-bank');
    await clickTrigger(page, 'upcoming-add-save');
    const withBill = await safeToSpend(page);
    await gotoJurnl(page, 'upcoming');
    await page.locator('[data-jrn-trigger^="upcoming-up-obl-"]').first().click();
    await expectScreen(page, 'F07.ITEM');
    await reveal(page, 'upcoming-set-aside');
    await clickTrigger(page, 'upcoming-set-aside');
    await clickTrigger(page, 'set-aside-account-bank');
    await fill(page, 'set-aside-amount', '95');
    await shot(page, '06-set-aside-sheet');
    await clickTrigger(page, 'set-aside-save');
    await expect(page.getByTestId('obligation-funding-line')).toContainText('$95 OF $140 SET ASIDE · $45 STILL NEEDED');
    await shot(page, '07-bill-funding-progress');
    expect(await safeToSpend(page)).toBe(withBill);
    // Over-setting aside the same money is refused with the exact numbers.
    await gotoJurnl(page, 'upcoming');
    await page.locator('[data-jrn-trigger^="upcoming-up-obl-"]').first().click();
    await reveal(page, 'upcoming-mark-paid');
    await clickTrigger(page, 'upcoming-mark-paid');
    await clickTrigger(page, 'pay-save');
    await expect(trigger(page, 'pay-result')).toContainText('$95 SET ASIDE WAS USED');
    await expect(page.getByTestId('obligation-funding')).toContainText('DUE');
    expect(await placeAmount(page, 'bank')).toBe('$360');
    await gotoJurnl(page, 'activity');
    await expect(page.locator('.jrn-tx__name', { hasText: 'CAR INSURANCE' })).toHaveCount(1);
  });

  test('subscriptions: add, see renewal and monthly / yearly cost', async ({ page }) => {
    await gotoJurnl(page, 'upcoming/subscriptions');
    await expectScreen(page, 'F07.SUBSCRIPTIONS');
    await reveal(page, 'subs-add');
    await clickTrigger(page, 'subs-add');
    await fill(page, 'upcoming-add-name', 'MUSIC');
    await fill(page, 'upcoming-add-amount', '10.99');
    await clickTrigger(page, 'upcoming-add-save');
    await expect(page.getByTestId('subscriptions-totals')).toContainText('1 ACTIVE · $10.99 A MONTH · $131.88 A YEAR');
    await shot(page, '08-subscriptions');
  });

  test('credit: payment plan shows minimum, source money and a target the user picks; recording a payment updates it', async ({ page }) => {
    await gotoJurnl(page, 'credit/visa');
    await expectScreen(page, 'F12.ACCOUNT');
    await reveal(page, 'credit-plan');
    await clickTrigger(page, 'credit-plan');
    await expect(page.getByTestId('card-safety')).toContainText('THE MINIMUM REMAINING IS $45');
    await expect(page.getByTestId('card-source')).toContainText('UBER CARD HAS $240 RECORDED');
    await fill(page, 'card-util-target', '10');
    await expect(page.getByTestId('card-util-result')).toContainText('THAT TAKES A PAYMENT OF $200');
    await shot(page, '09-card-payment-plan');
    await clickTrigger(page, 'card-plan-record');
    await clickTrigger(page, 'card-pay-save');
    await expect(trigger(page, 'card-pay-result')).toContainText('VISA NOW OWES $355');
    await expect(page.getByTestId('card-safety-line')).toHaveAttribute('data-state', 'MINIMUM_PAID');
    expect(await placeAmount(page, 'uber')).toBe('$195');
  });

  test('today: real attention fact and the money reading in SEE WHY', async ({ page }) => {
    await gotoJurnl(page, 'today');
    await expectScreen(page, 'F03.00');
    await expect(page.locator('[data-jrn-trigger="today-attention"]')).toContainText('CARD DUE');
    await noPageOverflow(page);
    await shot(page, '10-today-parent');
    await clickTrigger(page, 'today-why');
    const why = page.locator('[data-jrn-overlay="see-why"]');
    await expect(why).toContainText('HOW THIS NUMBER IS MADE');
    await expect(page.getByTestId('today-places')).toContainText('UBER CARD');
    await expect(page.getByTestId('today-places')).toContainText('VISA OWES');
    await shot(page, '11-today-see-why');
  });

  test('accessibility: new sheets have no serious or critical axe violations', async ({ page }) => {
    const check = async (label: string) => {
      const r = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
      const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${label}: ${v.id} (${v.nodes.length})`)).toEqual([]);
    };
    await gotoJurnl(page, 'income');
    await reveal(page, 'income-add-earnings');
    await clickTrigger(page, 'income-add-earnings');
    await check('daily earnings');
    await gotoJurnl(page, 'credit/visa');
    await reveal(page, 'credit-plan');
    await clickTrigger(page, 'credit-plan');
    await check('card plan');
    await gotoJurnl(page, 'activity');
    await clickTrigger(page, 'activity-record-spending');
    await check('record spending');
  });
});
