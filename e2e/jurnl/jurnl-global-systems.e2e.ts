import { test, expect } from '@playwright/test';
import { clickTrigger, gotoJurnl, openSeededToday, trigger } from './helpers/jurnl-page';

test.describe('Global systems', () => {
  test.beforeEach(async ({ page }) => {
    await openSeededToday(page, true);
  });

  test('Quick Add movement saves', async ({ page }) => {
    await gotoJurnl(page, 'today');
    await clickTrigger(page, 'nav-add');
    await page.locator('[data-jrn-trigger="quick-add-name"]').fill('E2E TX');
    await page.locator('[data-jrn-trigger="quick-add-amount"]').fill('12');
    const save = page.locator('[data-jrn-trigger="quick-add-save"]');
    await expect(save).toBeEnabled({ timeout: 15_000 });
    await save.click();
    await gotoJurnl(page, 'activity');
    await expect(page.getByText(/E2E TX/i)).toBeVisible();
  });

  test('Ask Jurnl opens without provider', async ({ page }) => {
    await gotoJurnl(page, 'today');
    await clickTrigger(page, 'today-ask');
    await expect(page.locator('[data-jrn-trigger="ask-open-settings"]')).toBeVisible();
  });

  test('Settings buffer persists after reload', async ({ page }) => {
    await gotoJurnl(page, 'account');
    await page.locator('[data-jrn-trigger="settings-buffer"]').fill('99');
    await clickTrigger(page, 'settings-buffer-save');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-project-runtime="jurnl"]').waitFor({ state: 'attached', timeout: 60_000 });
    await expect(page.locator('[data-jrn-trigger="settings-buffer"]')).toHaveValue('99', { timeout: 15_000 });
  });
});

test.describe('Quick Add types', () => {
  const types = ['MOVEMENT', 'INCOME', 'GOAL', 'PURCHASE', 'TRIP'] as const;
  for (const label of types) {
    test(`Quick Add exposes ${label}`, async ({ page }) => {
      await openSeededToday(page, true);
      await gotoJurnl(page, 'today');
      await clickTrigger(page, 'nav-add');
      await expect(page.locator('[role="radiogroup"][aria-label="TYPE"]').getByRole('button', { name: label })).toBeVisible();
    });
  }
});
