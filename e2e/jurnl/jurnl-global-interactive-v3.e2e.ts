/**
 * P0.JURNL.GLOBAL-INTERACTIVE-SURFACES.V3 — browser journeys for the V3 global menu and MEMBERSHIP & ACCESS:
 * secondary navigation only, every destination opens, focus returns, nothing scrolls the page, nothing is for sale.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { bootstrapJurnl, clickTrigger, gotoJurnl, trigger } from './helpers/jurnl-page';

const overlay = (page: Page, id: string) => page.locator(`[data-jrn-overlay="${id}"]`);
const noPageScroll = (page: Page) => page.evaluate(() => ({ x: document.documentElement.scrollWidth > innerWidth + 1, y: document.documentElement.scrollHeight > innerHeight + 1 }));

test.describe('V3 global menu', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapJurnl(page);
    await gotoJurnl(page, 'today');
  });

  test('G1 · the hamburger opens the olive menu: three groups, no dock destinations; Escape closes and focus returns', async ({ page }) => {
    await clickTrigger(page, 'f09-menu');
    const m = overlay(page, 'global-menu');
    await expect(m).toBeVisible();
    await expect(m).toHaveAttribute('data-jv3-family', 'A_NAVIGATION_DRAWER');
    for (const s of ['YOUR ACCOUNT', 'MEMBERSHIP & ACCESS', 'SUPPORT', 'SIGN OUT']) await expect(m).toContainText(s);
    for (const t of ['nav-home', 'nav-money', 'nav-add', 'nav-plan', 'nav-credit']) await expect(m.locator(`[data-jrn-trigger="${t}"]`)).toHaveCount(0);
    expect(await noPageScroll(page)).toEqual({ x: false, y: false });
    await page.keyboard.press('Escape');
    await expect(m).toHaveCount(0);
    await expect(trigger(page, 'f09-menu')).toBeFocused();
  });

  test('G2 · every destination opens its surface: ACCOUNT page, PREFERENCES folio, PRIVACY & DATA consents (labelled switches)', async ({ page }) => {
    await clickTrigger(page, 'f09-menu');
    await clickTrigger(page, 'menu-preferences');
    await expect(overlay(page, 'account-drawer')).toBeVisible();
    await clickTrigger(page, 'account-drawer-close');
    await clickTrigger(page, 'f09-menu');
    await clickTrigger(page, 'menu-privacy');
    const c = overlay(page, 'settings-consents-sheet');
    await expect(c).toBeVisible();
    for (const s of ['REMEMBER SETUP', 'LINKED ACCOUNTS OPTIONAL', 'NOTHING SOLD']) await expect(c).toContainText(s);
    await clickTrigger(page, 'settings-consents-sheet-close');
    await expect(overlay(page, 'global-menu')).toBeVisible();
    await clickTrigger(page, 'menu-account');
    await expect(page).toHaveURL(/\/account$/);
  });

  test('G3 · MY MEMBERSHIP → EXPLORE ADD-ONS → UNLOCK: live plan, honest COMING SOON, no price, no checkout', async ({ page }) => {
    await clickTrigger(page, 'f09-menu');
    await clickTrigger(page, 'menu-membership');
    const m = overlay(page, 'global-membership');
    await expect(m).toBeVisible();
    await expect(page.getByTestId('membership-plan')).toContainText('JURNL FREE');
    await expect(page.getByTestId('membership-billing')).toContainText('NOTHING CAN BE BOUGHT');
    await expect(m).not.toContainText(/\$\s?\d/);
    expect(await noPageScroll(page)).toEqual({ x: false, y: false });
    await clickTrigger(page, 'membership-add-ons');
    const a = overlay(page, 'global-add-ons');
    await expect(a).toBeVisible();
    await expect(a.locator('[data-state="AVAILABLE"]')).toHaveCount(0);
    await clickTrigger(page, 'add-on-jurnl_add_on_travel');
    const u = overlay(page, 'global-unlock');
    await expect(u).toBeVisible();
    await expect(page.getByTestId('unlock-coming-soon')).toBeVisible();
    await expect(u).not.toContainText(/VIEW OPTIONS|BUY|SUBSCRIBE|CHECKOUT/);
    await clickTrigger(page, 'unlock-not-now');
    await expect(a).toBeVisible();
  });

  test('G4 · no serious or critical axe violations on the menu, membership and add-ons', async ({ page }) => {
    const found: Record<string, string[]> = {};
    const scan = async (key: string, sel: string) => {
      const r = await new AxeBuilder({ page }).include(sel).analyze();
      found[key] = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id);
    };
    await clickTrigger(page, 'f09-menu');
    await scan('menu', '[data-jrn-overlay="global-menu"]');
    await clickTrigger(page, 'menu-membership');
    await scan('membership', '[data-jrn-overlay="global-membership"]');
    await clickTrigger(page, 'global-membership-close');
    await clickTrigger(page, 'menu-add-ons');
    await scan('add-ons', '[data-jrn-overlay="global-add-ons"]');
    expect(found).toEqual({ menu: [], membership: [], 'add-ons': [] });
  });
});
