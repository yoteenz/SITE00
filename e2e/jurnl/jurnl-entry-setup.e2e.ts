import { test, expect } from '@playwright/test';
import { JURNL_RUNTIME_PREFIX, gotoJurnl } from './helpers/jurnl-page';

test.describe('F01 entry + F02 handoff surfaces', () => {
  test('F01 entry index resolves to a primary route', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${JURNL_RUNTIME_PREFIX}/?reset=1`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-project-runtime="jurnl"]').waitFor({ state: 'attached', timeout: 60_000 });
    const screen = page.locator('[data-jrn-screen]').first();
    await expect(screen).toBeAttached();
    const id = await screen.getAttribute('data-jrn-screen');
    expect(id).toMatch(/^F01\./);
  });

  test('F02 setup route loads when navigated directly', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(
        'jurnl.runtime.v1.session',
        JSON.stringify({ account: null, status: 'SIGNED_OUT', keepSignedIn: false, pendingEmail: null }),
      );
    });
    await gotoJurnl(page, 'setup');
    await page.locator('[data-jrn-screen^="F02"]').first().waitFor({ state: 'attached', timeout: 30_000 });
  });
});
