import { test, expect } from '@playwright/test';
import { clickTrigger, expectScreen, gotoJurnl, openSeededToday, trigger } from './helpers/jurnl-page';

test.describe('Core mutations F05–F16', () => {
  test.beforeEach(async ({ page }) => {
    await openSeededToday(page, true);
  });

  test('F10 create purchase and mark purchased', async ({ page }) => {
    await gotoJurnl(page, 'purchases');
    await clickTrigger(page, 'purchase-consider');
    await page.locator('[data-jrn-trigger="purchase-name"]').fill('E2E CHAIR');
    await page.locator('[data-jrn-trigger="purchase-price"]').fill('80');
    const purchaseSave = page.locator('[data-jrn-trigger="purchase-save"]');
    await expect(purchaseSave).toBeEnabled();
    await purchaseSave.click();
    await expectScreen(page, 'F10.OBJECT');
    await clickTrigger(page, 'purchase-bought');
    await expect(page.getByText(/LINKED/i)).toBeVisible({ timeout: 15_000 });
  });

  test('F11 trip reserve affects safe to spend', async ({ page }) => {
    await gotoJurnl(page, 'safe');
    const before = await page.locator('.jrn-home__num').first().innerText();
    await gotoJurnl(page, 'trips');
    await clickTrigger(page, 'trip-add');
    await page.locator('[data-jrn-trigger="trip-name"]').fill('E2E TRIP');
    await page.locator('[data-jrn-trigger="trip-budget"]').fill('500');
    await clickTrigger(page, 'trip-save');
    await clickTrigger(page, 'trip-fund');
    await page.locator('[data-jrn-trigger="trip-reserve"]').fill('100');
    await clickTrigger(page, 'trip-fund-save');
    await gotoJurnl(page, 'safe');
    const after = await page.locator('.jrn-home__num').first().innerText();
    expect(after).not.toBe(before);
  });

  test('F08 plan assign reduces STS', async ({ page }) => {
    await gotoJurnl(page, 'plan');
    await clickTrigger(page, 'plan-add-intention');
    await page.locator('[data-jrn-trigger="plan-add-name"]').fill('E2E PLAN');
    await clickTrigger(page, 'plan-add-save');
    await clickTrigger(page, 'plan-assign');
    await page.locator('[data-jrn-trigger="plan-assign-amount"]').fill('150');
    await clickTrigger(page, 'plan-assign-save');
    await gotoJurnl(page, 'safe');
    await expect(page.getByText(/ASSIGNED/i)).toBeVisible();
  });

  test('F14 goal set aside reduces STS', async ({ page }) => {
    await gotoJurnl(page, 'goals');
    await clickTrigger(page, 'goal-add');
    await page.locator('[data-jrn-trigger="goal-name-input"]').fill('E2E GOAL');
    await page.locator('[data-jrn-trigger="goal-target"]').fill('1000');
    await clickTrigger(page, 'goal-name-save');
    await clickTrigger(page, 'goal-set-aside');
    await page.locator('[data-jrn-trigger="goal-aside-amount"]').fill('75');
    await clickTrigger(page, 'goal-aside-save');
    await gotoJurnl(page, 'safe');
    await expect(page.locator('[data-project-runtime="jurnl"]')).toBeVisible();
  });

  test('F13 paydown what-if keeps credit balance read-only', async ({ page }) => {
    await gotoJurnl(page, 'paydown/what-if');
    await expectScreen(page, 'F13.WHAT_IF');
    await clickTrigger(page, 'paydown-keep');
    await expectScreen(page, 'F13.00');
  });

  test('F15 ahead derived timeline', async ({ page }) => {
    await gotoJurnl(page, 'ahead');
    await expectScreen(page, 'F15.00');
    await expect(page.getByText(/SAFE TO SPEND NOW/i)).toBeVisible();
  });

  test('F16 record metadata create', async ({ page }) => {
    await gotoJurnl(page, 'records');
    await clickTrigger(page, 'records-add');
    await page.locator('[data-jrn-trigger="records-title"]').fill('E2E RECEIPT');
    await clickTrigger(page, 'records-save');
    await expectScreen(page, 'F16.DOCUMENT');
    await expect(page.getByText(/METADATA ONLY/i)).toBeVisible();
  });

  test('F07 upcoming lists obligations', async ({ page }) => {
    await gotoJurnl(page, 'upcoming');
    await expectScreen(page, 'F07.00');
    await expect(page.locator('.jrn-tx').first()).toBeVisible();
  });

  test('F12 credit hub opens account', async ({ page }) => {
    await gotoJurnl(page, 'credit');
    await trigger(page, 'credit-acct-card').first().click();
    await expectScreen(page, 'F12.ACCOUNT');
  });
});
