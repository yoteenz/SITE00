import { test, expect } from '@playwright/test';
import { clickTrigger, gotoJurnl, openSeededToday } from './helpers/jurnl-page';
import { JURNL_E2E_STORAGE } from '../../src/projects/jurnl/e2e/fixture';

test.describe('Persistence reload', () => {
  test('purchase survives reload', async ({ page }) => {
    await openSeededToday(page, true);
    await gotoJurnl(page, 'purchases');
    await clickTrigger(page, 'purchase-consider');
    await page.locator('[data-jrn-trigger="purchase-name"]').fill('PERSIST ITEM');
    await page.locator('[data-jrn-trigger="purchase-price"]').fill('40');
    await clickTrigger(page, 'purchase-save');
    await expect(page.getByText('PERSIST ITEM')).toBeVisible();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-project-runtime="jurnl"]').waitFor();
    await expect(page.getByText('PERSIST ITEM')).toBeVisible();
    const raw = await page.evaluate((key) => localStorage.getItem(key), JURNL_E2E_STORAGE.repositoryKey);
    expect(raw).toContain('PERSIST ITEM');
  });
});
