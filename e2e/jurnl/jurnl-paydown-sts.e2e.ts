import { test, expect } from '@playwright/test';
import { clickTrigger, gotoJurnl, openSeededToday } from './helpers/jurnl-page';

test.describe('F13 paydown → F09 boundary', () => {
  test('simulated extra payment alone does not reduce STS', async ({ page }) => {
    await openSeededToday(page);
    await gotoJurnl(page, 'safe');
    const before = await page.locator('.jrn-home__num').first().innerText();
    await gotoJurnl(page, 'paydown/what-if');
    await page.locator('[data-jrn-trigger="paydown-draft-extra"]').fill('500');
    await gotoJurnl(page, 'safe');
    const after = await page.locator('.jrn-home__num').first().innerText();
    expect(after).toBe(before);
  });

  test('committed trip reserve reduces STS (contrast)', async ({ page }) => {
    await openSeededToday(page, true);
    await gotoJurnl(page, 'safe');
    const before = await page.locator('.jrn-home__num').first().innerText();
    await gotoJurnl(page, 'trips');
    await clickTrigger(page, 'trip-add');
    await page.locator('[data-jrn-trigger="trip-name"]').fill('STS TRIP');
    await page.locator('[data-jrn-trigger="trip-budget"]').fill('300');
    await clickTrigger(page, 'trip-save');
    await clickTrigger(page, 'trip-fund');
    await page.locator('[data-jrn-trigger="trip-reserve"]').fill('50');
    await clickTrigger(page, 'trip-fund-save');
    await gotoJurnl(page, 'safe');
    const after = await page.locator('.jrn-home__num').first().innerText();
    expect(after).not.toBe(before);
  });
});
