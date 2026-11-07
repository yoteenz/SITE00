/**
 * P0.JURNL.F05-MONEY.DOT01-ACCOUNTS — the live camera preview on CAPTURE RECEIPT (authority 26), with Chromium's fake
 * camera (a moving test pattern, not a receipt). Kept in its own file because the camera flags are browser launch
 * options. The frame is read by the app's own on-device OCR; nothing is stubbed.
 */
import { expect, test } from '@playwright/test';
import { dot01World } from './helpers/jurnl-dot01-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, storedSnapshot } from './helpers/jurnl-page';

test.use({ launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] }, permissions: ['camera'] });

test('26 · TAKE PHOTO opens a live preview in the frame; CAPTURE reads that frame; nothing is saved without review', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'fake camera flags are Chromium-only');
  test.setTimeout(150_000);
  await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(page, dot01World() as Parameters<typeof bootstrapJurnl>[1]);
  await gotoJurnl(page, 'money/places/bank/history');
  const count = async () => ((await storedSnapshot(page)) as unknown as { transactions: unknown[] }).transactions.length;
  const before = await count();
  await clickTrigger(page, 'd01-history-scan');
  await clickTrigger(page, 'd01-receipt-take');
  const live = page.getByTestId('d01-receipt-live');
  await expect(live).toBeVisible();
  await expect.poll(() => live.evaluate((v) => (v as HTMLVideoElement).videoWidth), { timeout: 15_000 }).toBeGreaterThan(0);
  await clickTrigger(page, 'd01-receipt-shutter');
  await expect(page.locator('[data-jrn-overlay="d01-receipt-scanning"]')).toBeVisible();
  // a test pattern is not a receipt: the reader says so honestly (or shows only what it read, for review)
  await expect(page.locator('[data-jrn-overlay="d01-receipt-failure"], [data-jrn-overlay="d01-review-purchase"]')).toBeVisible({ timeout: 90_000 });
  expect(await count()).toBe(before);
  // the camera is released once the frame is taken
  expect(await page.evaluate(() => document.querySelectorAll('video').length)).toBe(0);
});
