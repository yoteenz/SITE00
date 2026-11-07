/**
 * Connected banking — production-mode UI E2E (`/jurnl/app`).
 *
 * Part 1 runs on the normal dev server (no auth / persistence env): the real app must fail closed, never showing
 * preview data. Part 2 needs a second dev server started with production env pointing at stub hosts
 * (JURNL_E2E_PROD_BASE_URL; see docs) and runs the REAL browser code against the STUBBED network in
 * helpers/jurnl-stub-backend.ts — synthetic institutions, not a real bank, not a real auth server.
 */
import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import { StubBackend } from './helpers/jurnl-stub-backend';

const PROD = process.env.JURNL_E2E_PROD_BASE_URL ?? '';
const SHOTS = process.env.JURNL_CB_SHOTS ?? '';
const shot = async (page: Page, name: string) => {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
};
const t = (page: Page, id: string) => page.locator(`[data-jrn-trigger="${id}"]`).first();
const noHorizontalOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const DEVICE = JSON.stringify({ remembered: [], biometric: 'DECLINED', biometricMethod: 'FACE_ID', deviceTrust: 'NOT_NOW', ai: { personalizedInsights: false, smartCategorization: false, budgetRecommendations: false, naturalLanguage: false, marketTrends: false }, exportRequested: false });

test.describe('real app without configuration', () => {
  test('fails closed: no preview data, no sample balances, no pretend connection', async ({ page }) => {
    await page.goto('/jurnl/app/entry', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'JURNL SERVICE UNAVAILABLE' })).toBeVisible();
    await expect(page.locator('[data-project-runtime="jurnl"]')).toHaveCount(0);
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('ATELIER');
    expect(text).not.toMatch(/8,420/);
    await shot(page, '01_real_app_fail_closed');
  });
});

test.describe('real app against stubbed auth / API / Link (synthetic, not a real bank)', () => {
  test.skip(!PROD, 'needs JURNL_E2E_PROD_BASE_URL (dev server with production env and stub hosts)');
  test.describe.configure({ mode: 'serial' });

  const signIn = async (page: Page, email: string, password: string) => {
    await page.goto(`${PROD}/jurnl/app/entry/sign-in`, { waitUntil: 'domcontentloaded' });
    await t(page, 'signin-email').fill(email);
    await t(page, 'signin-password').fill(password);
    await t(page, 'signin-submit').click();
  };

  test('register → verify → sign in → the real account starts EMPTY', async ({ page }) => {
    const stub = new StubBackend();
    await stub.install(page);
    await page.addInitScript((d) => localStorage.setItem('jurnl.runtime.v1.device', d), DEVICE);
    await page.goto(`${PROD}/jurnl/app/entry/create`, { waitUntil: 'domcontentloaded' });
    await t(page, 'create-first-name').fill('Ada');
    await t(page, 'create-last-name').fill('Founder');
    await t(page, 'create-email').fill('ada.founder@example.test');
    await t(page, 'create-password').fill('Jurnl-2026!');
    await t(page, 'create-agree').click();
    await t(page, 'create-submit').click();
    await expect(page.locator('[data-jrn-screen="F01.02"]')).toBeVisible();
    await shot(page, '02_registration_check_your_email');
    // Unverified sign-in is refused and returns to CHECK YOUR EMAIL.
    await signIn(page, 'ada.founder@example.test', 'Jurnl-2026!');
    await expect(page.locator('[data-jrn-screen="F01.02"]')).toBeVisible();
    await shot(page, '03_unverified_sign_in_refused');
    // The founder opens the emailed link (stub marks the address confirmed), then signs in.
    stub.users.get('ada.founder@example.test')!.confirmed = true;
    await signIn(page, 'ada.founder@example.test', 'Jurnl-2026!');
    await expect(page.locator('[data-jrn-screen="F01.13"]')).toBeVisible({ timeout: 15_000 });
    await shot(page, '04_signed_in_entry_complete');
    await page.goto(`${PROD}/jurnl/app/money`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const text = await page.locator('[data-project-runtime="jurnl"]').innerText();
    expect(text).not.toContain('ATELIER');
    expect(text).not.toMatch(/8,420/);
    await shot(page, '05_first_run_real_account_empty');
  });

  test('connected accounts: import, health states, reconnect, connect, disconnect, sign out / in, responsive', async ({ page }) => {
    const stub = new StubBackend();
    stub.user('ada.founder@example.test', 'Jurnl-2026!', true);
    stub.snapshot = { data: null, revision: 0 };
    stub.seedBanks();
    await stub.install(page);
    await page.addInitScript((d) => localStorage.setItem('jurnl.runtime.v1.device', d), DEVICE);
    await signIn(page, 'ada.founder@example.test', 'Jurnl-2026!');
    await expect(page.locator('[data-jrn-screen="F01.13"]')).toBeVisible({ timeout: 15_000 });

    await page.goto(`${PROD}/jurnl/app/money`, { waitUntil: 'domcontentloaded' });
    await page.waitForResponse((r) => r.url().includes('op=transactions'), { timeout: 15_000 });
    await page.waitForTimeout(600);
    await shot(page, '06_money_with_imported_accounts');

    await t(page, 'f09-menu').click();
    await t(page, 'menu-connections').click();
    const panel = page.locator('[data-jrn-overlay="global-connections"]');
    await expect(panel).toBeVisible();
    await expect(panel.locator('[data-testid="connections-sandbox"]')).toBeVisible();
    await expect(panel.locator('[data-health="UP_TO_DATE"]')).toHaveCount(6);
    await expect(panel.getByText('READ ONLY', { exact: true })).toBeVisible();
    await shot(page, '07_connected_accounts_up_to_date');

    // Reconnect state comes from the server's record (never from a local account).
    stub.items[2].status = 'NEEDS_REAUTH';
    await t(page, 'connection-retry-item-bank').click();
    await expect(panel.locator('[data-testid="connection-item-card"]')).toHaveAttribute('data-health', 'NEEDS_RECONNECTION');
    await panel.locator('[data-testid="connection-item-card"]').scrollIntoViewIfNeeded();
    await shot(page, '08_needs_reconnection');

    // Connect another institution through the (stubbed) hosted Link: link token → Link → server exchange.
    stub.linkedOnExchange = () => {
      stub.items.push({ item_id: 'item-savings', institution_name: 'SYNTHETIC SAVINGS (TEST)', status: 'ACTIVE', last_successful_sync_at: new Date().toISOString(), last_balance_at: new Date().toISOString(), disconnected_at: null });
      stub.accounts.push({ ...stub.accounts[0], bank_account_id: 'sv', item_id: 'item-savings', provider_account_id: 'sav4444', name: 'HIGH YIELD SAVINGS', subtype: 'savings', mask: '4444', current_balance: 1200, available_balance: 1200 });
    };
    await t(page, 'connections-connect').click();
    await expect(panel.locator('[data-testid="connection-item-savings"]')).toBeVisible({ timeout: 10_000 });
    await shot(page, '09_connected_new_institution');

    // Disconnect with confirmation; the state shown is the server's DISCONNECTED.
    await t(page, 'connection-disconnect-item-card').click();
    await expect(page.locator('[data-jrn-overlay="connections-disconnect-confirm"]')).toBeVisible();
    await shot(page, '10_disconnect_confirm');
    await t(page, 'connections-disconnect-confirm-yes').click();
    await expect(panel.locator('[data-testid="connections-notice"]')).toContainText('DISCONNECTED');
    await shot(page, '11_disconnected');

    // The financial state saved to the server (compare-and-swap on revision).
    await expect.poll(() => stub.snapshot.revision, { timeout: 10_000 }).toBeGreaterThan(0);
    expect(stub.putLog.every((p) => p.result !== 'CONFLICT')).toBe(true);

    // Responsive (contained scroll, no horizontal overflow).
    for (const [w, hgt] of [[360, 640], [393, 660], [393, 852], [430, 932], [834, 1194], [1440, 900]]) {
      await page.setViewportSize({ width: w, height: hgt });
      await page.waitForTimeout(250);
      expect(await noHorizontalOverflow(page), `${w}x${hgt}`).toBe(true);
      await shot(page, `12_connections_${w}x${hgt}`);
    }
    await page.setViewportSize({ width: 393, height: 852 });

    // Sign out, sign back in: the records restore from the server.
    const revision = stub.snapshot.revision;
    await page.goto(`${PROD}/jurnl/app/money`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('jurnl.runtime.v1.session'));
    const savedCount = () => ((stub.snapshot.data as { transactions?: unknown[] } | null)?.transactions ?? []).length;
    await expect.poll(savedCount, { timeout: 10_000 }).toBeGreaterThanOrEqual(7);
    const savedTx = savedCount();
    expect((stub.snapshot.data as { dataMode?: string }).dataMode).toBe('PROVIDER_SANDBOX');
    await page.context().clearCookies();
    await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('sb-') || k.startsWith('jurnl.repository')).forEach((k) => localStorage.removeItem(k)));
    await signIn(page, 'ada.founder@example.test', 'Jurnl-2026!');
    await expect(page.locator('[data-jrn-screen="F01.13"]')).toBeVisible({ timeout: 15_000 });
    await page.goto(`${PROD}/jurnl/app/money`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const uid = stub.users.get('ada.founder@example.test')!.id;
    const restored = await page.evaluate((id) => {
      const k = Object.keys(localStorage).find((x) => x === `jurnl.repository.v5.provider_sandbox.${id}`);
      const s = k ? JSON.parse(localStorage.getItem(k) || '{}') : {};
      return { tx: (s.transactions ?? []).length, mode: s.dataMode, rev: s.syncBase?.revision };
    }, uid);
    expect(restored.mode).toBe('PROVIDER_SANDBOX');
    expect(restored.tx).toBe(savedTx);
    expect(restored.rev).toBeGreaterThanOrEqual(revision);
    await shot(page, '13_signed_back_in_restored');
  });
});
