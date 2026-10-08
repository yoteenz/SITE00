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

  test('a new account walks ENTRY from WELCOME to SETUP (the preview follows the emailed link)', async ({ page }) => {
    const t = (id: string) => page.locator(`[data-jrn-trigger="${id}"]`);
    const at = (id: string) => page.locator(`[data-jrn-screen="${id}"]`).first().waitFor({ state: 'attached', timeout: 30_000 });
    await page.addInitScript(() => {
      if (sessionStorage.getItem('jurnl.e2e.entry-walk')) return;
      localStorage.clear();
      sessionStorage.setItem('jurnl.e2e.entry-walk', '1');
    });
    await gotoJurnl(page, 'entry');
    await at('F01.00');
    await t('welcome-get-started').click();
    await at('F01.14');
    await t('value-continue').click();
    await at('F01.15');
    await t('benefits-continue').click();
    await at('F01.16');
    await t('begin-get-started').click();
    await at('F01.01');
    await t('create-first-name').fill('Ada');
    await t('create-last-name').fill('Lovelace');
    await t('create-email').fill(`ada.${Date.now()}@example.com`);
    await t('create-password').fill('Jurnl-2026!');
    await t('create-agree').click();
    await t('create-submit').click();
    await at('F01.02');
    await t('verify-open-mail').click();
    await t('mail-continue').click();
    await t('verify-success-continue').click();
    await at('F01.09');
    await t('bio-not-now').click();
    await at('F01.10');
    await t('trust-not-now').click();
    await at('F01.11');
    await t('privacy-continue').click();
    await at('F01.12');
    await t('security-continue').click();
    await at('F01.13');
    await t('complete-continue').click();
    await at('F02.00');
  });

  test('forgot password reaches CREATE NEW PASSWORD from the reset email', async ({ page }) => {
    const t = (id: string) => page.locator(`[data-jrn-trigger="${id}"]`);
    await gotoJurnl(page, 'entry/forgot-password');
    await t('forgot-email').fill('EMMA@EXAMPLE.COM');
    await t('forgot-submit').click();
    await page.locator('[data-jrn-screen="F01.06"]').first().waitFor({ state: 'attached', timeout: 30_000 });
    await t('reset-sent-open-mail').click();
    await t('mail-continue').click();
    await page.locator('[data-jrn-screen="F01.07"]').first().waitFor({ state: 'attached', timeout: 30_000 });
  });
});
