import { test, expect } from '@playwright/test';
import { clickTrigger, expectScreen, gotoJurnl, openSeededToday } from './helpers/jurnl-page';

test.describe.configure({ mode: 'serial' });

test.describe('JURNL golden journey', () => {
  test('F01–F16 coherent path with reload verification', async ({ page }) => {
    await openSeededToday(page, true);
    await expectScreen(page, 'F03.00');

    await gotoJurnl(page, 'money');
    await expectScreen(page, 'F05.00');

    await gotoJurnl(page, 'income');
    await expectScreen(page, 'F06.00');

    await gotoJurnl(page, 'upcoming');
    await expectScreen(page, 'F07.00');

    await gotoJurnl(page, 'plan');
    await clickTrigger(page, 'plan-add-intention');
    await page.locator('[data-jrn-trigger="plan-add-name"]').fill('GOLDEN PLAN');
    await clickTrigger(page, 'plan-add-save');

    await gotoJurnl(page, 'goals');
    await clickTrigger(page, 'goal-add');
    await page.locator('[data-jrn-trigger="goal-name-input"]').fill('GOLDEN GOAL');
    await clickTrigger(page, 'goal-name-save');

    await gotoJurnl(page, 'safe');
    await expectScreen(page, 'F09.00');

    await gotoJurnl(page, 'purchases');
    await clickTrigger(page, 'purchase-consider');
    await page.locator('[data-jrn-trigger="purchase-name"]').fill('GOLDEN BUY');
    await page.locator('[data-jrn-trigger="purchase-price"]').fill('25');
    await clickTrigger(page, 'purchase-save');
    await clickTrigger(page, 'purchase-bought');

    await gotoJurnl(page, 'trips');
    await clickTrigger(page, 'trip-add');
    await page.locator('[data-jrn-trigger="trip-name"]').fill('GOLDEN TRIP');
    await page.locator('[data-jrn-trigger="trip-budget"]').fill('200');
    await clickTrigger(page, 'trip-save');

    await gotoJurnl(page, 'credit');
    await expectScreen(page, 'F12.00');

    await gotoJurnl(page, 'paydown');
    await expectScreen(page, 'F13.00');

    await gotoJurnl(page, 'ahead');
    await expectScreen(page, 'F15.00');

    await gotoJurnl(page, 'records');
    await clickTrigger(page, 'records-add');
    await page.locator('[data-jrn-trigger="records-title"]').fill('GOLDEN DOC');
    await clickTrigger(page, 'records-save');

    await gotoJurnl(page, 'account');
    await clickTrigger(page, 'settings-buffer-save');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await gotoJurnl(page, 'purchases');
    await expect(page.getByText('GOLDEN BUY')).toBeVisible();
    await gotoJurnl(page, 'records');
    await expect(page.getByText('GOLDEN DOC')).toBeVisible();
  });
});
