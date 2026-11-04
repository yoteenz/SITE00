import { test, expect } from '@playwright/test';
import { clickTrigger, gotoJurnl, openSeededToday, safeToSpendCents, storedSnapshot } from './helpers/jurnl-page';

test.describe('F13 paydown → F09 boundary', () => {
  test('simulated extra payment alone does not reduce STS', async ({ page }) => {
    await openSeededToday(page);
    const before = await safeToSpendCents(page);
    const storedBefore = await storedSnapshot(page);
    await gotoJurnl(page, 'paydown/what-if');
    await page.locator('[data-jrn-trigger="paydown-draft-extra"]').fill('500');
    // A what-if is a simulation: no ledger entry, no balance change, the same Safe to Spend to the cent.
    expect(await safeToSpendCents(page)).toBe(before);
    expect(((await storedSnapshot(page)).transactions as unknown[]).length).toBe((storedBefore.transactions as unknown[]).length);
  });

  test('committed trip reserve reduces STS (contrast)', async ({ page }) => {
    await openSeededToday(page, true);
    const before = await safeToSpendCents(page);
    await gotoJurnl(page, 'trips');
    await clickTrigger(page, 'trip-add');
    await page.locator('[data-jrn-trigger="trip-name"]').fill('STS TRIP');
    await page.locator('[data-jrn-trigger="trip-budget"]').fill('300');
    await clickTrigger(page, 'trip-save');
    await clickTrigger(page, 'trip-fund');
    await page.locator('[data-jrn-trigger="trip-reserve"]').fill('50');
    await clickTrigger(page, 'trip-fund-save');
    expect((await storedSnapshot(page)).trips.find((t) => t.title === 'STS TRIP')?.reserved_amount).toBe(50);
    // Committing $50 to the trip lowers Safe to Spend by exactly $50 (contrast with the simulation above).
    expect(before - (await safeToSpendCents(page))).toBe(5_000);
  });
});
