/**
 * P0.JURNL.PRODUCT-UTILITY audit journeys — synthetic data, local/preview only.
 * Results feed JURNL_DAILY_FINANCIAL_JOURNEY_AUDIT.md (not production proof).
 */
import { test, expect } from '@playwright/test';
import { buildJurnlE2eEmptyDomainsBootstrap } from '../../src/projects/jurnl/e2e/fixture';
import { addDays, getTodayKey } from '../../src/projects/jurnl/data/foundation/dates';
import { bootstrapJurnl, clickTrigger, expectScreen, gotoJurnl, openSeededToday, resetJurnlE2eSeedFlag, safeToSpendCents, storedSnapshot } from './helpers/jurnl-page';

test.describe('Product utility audit journeys', () => {
  test('Journey A — add subscription-like recurring obligation', async ({ page }) => {
    await openSeededToday(page, true);
    await gotoJurnl(page, 'upcoming');
    await expectScreen(page, 'F07.00');
    await clickTrigger(page, 'upcoming-add');
    await page.locator('[data-jrn-trigger="upcoming-add-name"]').fill('STREAMING SERVICE');
    await page.locator('[data-jrn-trigger="upcoming-add-amount"]').fill('17.99');
    await clickTrigger(page, 'upcoming-add-save');
    await expect(page.getByText('STREAMING SERVICE')).toBeVisible({ timeout: 15_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await gotoJurnl(page, 'upcoming');
    await expect(page.getByText('STREAMING SERVICE')).toBeVisible();
  });

  test('Journey B — obligation visible on Safe to Spend after amount entry', async ({ page }) => {
    await resetJurnlE2eSeedFlag(page);
    await bootstrapJurnl(page, buildJurnlE2eEmptyDomainsBootstrap());
    const before = await safeToSpendCents(page);
    await gotoJurnl(page, 'upcoming');
    await clickTrigger(page, 'upcoming-add');
    await page.locator('[data-jrn-trigger="upcoming-add-name"]').fill('CAR INSURANCE');
    await page.locator('[data-jrn-trigger="upcoming-add-amount"]').fill('140');
    // Due in 3 days: exactly one occurrence falls in the 30-day period (a monthly bill due TODAY also has its next
    // occurrence on day 30, which the period includes — see JURNL/MANIFEST/FINANCIAL_OS_STABILIZATION_V1/03_DUAL_HORIZON_SAFE_TO_SPEND_CONTRACT.md).
    await page.locator('[data-jrn-trigger="upcoming-due"]').fill(addDays(getTodayKey(), 3));
    await clickTrigger(page, 'upcoming-add-save');
    const stored = await storedSnapshot(page);
    expect(stored.obligations.find((o) => o.name === 'CAR INSURANCE')).toMatchObject({ amount: 140 });
    // Safe to Spend is $140 lower, exactly once.
    expect(before - (await safeToSpendCents(page))).toBe(14_000);
    await expectScreen(page, 'F09.00');
  });

  test('Journey H — edit obligation amount', async ({ page }) => {
    await openSeededToday(page, true);
    await gotoJurnl(page, 'upcoming');
    // Bills only: the timeline also lists expected income (up-inc-*), which has no amount to edit here.
    const first = page.locator('[data-jrn-trigger^="upcoming-up-obl-"]').first();
    await first.click();
    await clickTrigger(page, 'upcoming-edit');
    await page.locator('[data-jrn-trigger="upcoming-edit-amount"]').fill('150');
    await clickTrigger(page, 'upcoming-edit-save');
    await expect(page.getByTestId('obligation-funding')).toContainText('$150');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByTestId('obligation-funding')).toContainText('$150');
  });
});
