/**
 * P0.JURNL.PRODUCT-UTILITY audit journeys — synthetic data, local/preview only.
 * Results feed JURNL_DAILY_FINANCIAL_JOURNEY_AUDIT.md (not production proof).
 */
import { test, expect } from '@playwright/test';
import { buildJurnlE2eEmptyDomainsBootstrap } from '../../src/projects/jurnl/e2e/fixture';
import { bootstrapJurnl, clickTrigger, expectScreen, gotoJurnl, openSeededToday, resetJurnlE2eSeedFlag } from './helpers/jurnl-page';

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
    await gotoJurnl(page, 'upcoming');
    await clickTrigger(page, 'upcoming-add');
    await page.locator('[data-jrn-trigger="upcoming-add-name"]').fill('CAR INSURANCE');
    await page.locator('[data-jrn-trigger="upcoming-add-amount"]').fill('140');
    await clickTrigger(page, 'upcoming-add-save');
    await gotoJurnl(page, 'safe');
    await expectScreen(page, 'F09.00');
    await expect(page.getByText(/UPCOMING|140/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Journey H — edit obligation amount', async ({ page }) => {
    await openSeededToday(page, true);
    await gotoJurnl(page, 'upcoming');
    const first = page.locator('[data-jrn-trigger^="upcoming-up-"]').first();
    await first.click();
    await clickTrigger(page, 'upcoming-edit');
    await page.locator('[data-jrn-trigger="upcoming-edit-amount"]').fill('150');
    await clickTrigger(page, 'upcoming-edit-save');
    await expect(page.getByText('150')).toBeVisible();
  });
});
