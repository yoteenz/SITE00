/**
 * P0.JURNL.GLOBAL-EIGHT-OVERLAYS.MENU-FUNCTIONAL-RECOVERY-AND-SECTIONED-NAVIGATION-CONVERGENCE — the sectioned menu in
 * the browser: every row reaches a real destination and returns to the menu (BACK, Escape, focus), the recovered
 * capabilities work on synthetic records, the defects stay fixed, and nothing scrolls the page — the olive field scrolls
 * on a short phone. Exchange rates are served by a route stub (no live provider is called).
 */
import { expect, test, type Page } from '@playwright/test';
import { bootstrapJurnl, clickTrigger, gotoJurnl, storedSnapshot, trigger } from './helpers/jurnl-page';
import { dot01World } from './helpers/jurnl-dot01-world';
import { f05World } from './helpers/jurnl-f05-world';

const overlay = (page: Page, id: string) => page.locator(`[data-jrn-overlay="${id}"]`);
const pageScroll = (page: Page) => page.evaluate(() => ({ y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 }));
const activeTrigger = (page: Page) => page.evaluate(() => document.activeElement?.closest('[data-jrn-trigger]')?.getAttribute('data-jrn-trigger') ?? null);
const consent = async (page: Page, type: string) => {
  const s = (await storedSnapshot(page)) as unknown as { consent: { consent_type: string; status: string }[] };
  return s.consent.find((c) => c.consent_type === type)?.status ?? null;
};
async function rates(page: Page, ok = true) {
  await page.route('https://open.er-api.com/**', (r) =>
    ok ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, CAD: 1.37, MXN: 18.2 } }) }) : r.fulfill({ status: 503, body: 'unavailable' }),
  );
}
async function openMenu(page: Page) {
  await clickTrigger(page, 'f09-menu');
  await expect(overlay(page, 'global-menu')).toBeVisible();
}

/** [row trigger, destination overlay, back trigger] — every row of the founder's three sections. */
const ROWS: [string, string, string][] = [
  ['menu-connections', 'global-connections', 'connections-back'],
  ['menu-currency', 'settings-currency-sheet', 'settings-currency-sheet-close'],
  ['menu-buffer', 'global-buffer', 'buffer-back'],
  ['menu-ask', 'ask', 'ask-close'],
  ['menu-rules', 'global-rules', 'rules-back'],
  ['menu-account', 'account-drawer', 'account-drawer-close'],
  ['menu-preferences', 'global-preferences', 'preferences-back'],
  ['menu-privacy', 'settings-consents-sheet', 'privacy-back'],
  ['menu-membership', 'global-membership', 'membership-done'],
  ['menu-add-ons', 'global-add-ons', 'add-ons-done'],
  ['menu-help', 'global-help', 'help-back'],
];

test.describe('OPUS2 · sectioned global menu', () => {
  test.beforeEach(async ({ page }) => {
    await rates(page);
    await bootstrapJurnl(page);
    await gotoJurnl(page, 'today');
  });

  test('R1 · three sections on the OV08 shell; every row opens its destination, BACK returns to the menu and focus to the row', async ({ page }) => {
    await openMenu(page);
    const m = overlay(page, 'global-menu');
    await expect(m).toHaveAttribute('data-overlay-asset', 'OV08');
    await expect(m.locator('img[data-asset-id="OV08-IS-GLOBAL-MENU-DRAWER"]')).toBeVisible();
    for (const s of ['YOUR FINANCES', 'YOUR INTELLIGENCE', 'YOUR ACCOUNT']) await expect(m.locator('.jv3-nav-section', { hasText: s })).toHaveCount(1);
    for (const [row, dest, back] of ROWS) {
      await trigger(page, row).scrollIntoViewIfNeeded();
      await trigger(page, row).focus();
      await page.keyboard.press('Enter');
      await expect(overlay(page, dest), row).toBeVisible();
      await expect(overlay(page, 'global-menu'), `${row}: one surface at a time`).toHaveCount(0);
      expect(await pageScroll(page), row).toEqual({ y: false, x: false });
      await clickTrigger(page, back);
      await expect(overlay(page, dest), `${row} closed`).toHaveCount(0);
      await expect(overlay(page, 'global-menu'), `${row} → back to menu`).toBeVisible();
      await expect.poll(() => activeTrigger(page), `${row} focus returns`).toBe(row);
    }
  });

  test('R2 · Escape steps back one level (destination → menu → closed) and focus lands on the hamburger; no orphaned panel', async ({ page }) => {
    await openMenu(page);
    await clickTrigger(page, 'menu-privacy');
    await clickTrigger(page, 'privacy-tool-ai-access');
    await expect(overlay(page, 'privacy-ai-access')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(overlay(page, 'settings-consents-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(overlay(page, 'global-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-jrn-overlay]')).toHaveCount(0);
    await expect(trigger(page, 'f09-menu')).toBeFocused();
    await expect(trigger(page, 'f09-menu')).not.toHaveAttribute('aria-expanded', 'true');
  });

  test('R3 · CURRENCY & EXCHANGE: applying EUR shows the rate, its time and its source; a failed rate keeps the sheet open and says so', async ({ page }) => {
    await openMenu(page);
    await clickTrigger(page, 'menu-currency');
    await expect(page.getByTestId('currency-disclosure')).toContainText('USD IS THE BASE CURRENCY');
    await clickTrigger(page, 'settings-currency-eur');
    await expect(overlay(page, 'settings-currency-sheet')).toHaveCount(0);
    await expect(trigger(page, 'menu-currency')).toContainText('EUR');
    await clickTrigger(page, 'menu-currency');
    const d = page.getByTestId('currency-disclosure');
    await expect(d).toContainText(/RATE UPDATED \d+ [A-Z]{3} \d{4} · USD 0\.92 EUR/);
    await expect(d).toContainText('OPEN EXCHANGE RATES API');
    // the provider fails and the cached book has no rate for the chosen currency: nothing is applied, the sheet says why
    await page.unroute('https://open.er-api.com/**');
    await rates(page, false);
    const missing = await page.evaluate(() => [...document.querySelectorAll('.jrn-currency__list [data-jrn-trigger^="settings-currency-"]')].map((e) => e.getAttribute('data-jrn-trigger')!.slice('settings-currency-'.length)).find((c) => !['usd', 'eur', 'gbp', 'jpy', 'cad', 'mxn'].includes(c)));
    test.skip(!missing, 'every catalog currency is in the stubbed rate book');
    await clickTrigger(page, `settings-currency-${missing}`);
    await expect(page.getByTestId('currency-failed')).toContainText(`${missing!.toUpperCase()} IS NOT AVAILABLE RIGHT NOW`);
    await expect(overlay(page, 'settings-currency-sheet')).toBeVisible();
    await expect(trigger(page, 'settings-currency-eur')).toHaveAttribute('aria-pressed', 'true');
  });

  test('R4 · SAFE TO SPEND BUFFER in EUR is kept in USD (one conversion) and reads back as typed after a reload', async ({ page }) => {
    await openMenu(page);
    await clickTrigger(page, 'menu-currency');
    await clickTrigger(page, 'settings-currency-eur');
    await clickTrigger(page, 'menu-buffer');
    await expect(overlay(page, 'global-buffer')).toContainText('BUFFER · EUR');
    await trigger(page, 'buffer-input').fill('92');
    await clickTrigger(page, 'buffer-save');
    await expect(page.getByTestId('buffer-status')).toContainText('SAVED');
    await expect(page.getByTestId('buffer-usd')).toHaveAttribute('data-usd', '100');
    const settings = ((await storedSnapshot(page)) as unknown as { settings: { safeToSpendBuffer: string } }).settings;
    expect(Number(settings.safeToSpendBuffer)).toBeCloseTo(100, 4);
    await page.reload({ waitUntil: 'networkidle' });
    await openMenu(page);
    await expect(page.getByTestId('menu-buffer-state')).toContainText('KEPT ASIDE');
    await clickTrigger(page, 'menu-buffer');
    await expect(trigger(page, 'buffer-input')).toHaveValue('92');
    await clickTrigger(page, 'buffer-save'); // an unchanged re-save does not drift
    expect(Number(((await storedSnapshot(page)) as unknown as { settings: { safeToSpendBuffer: string } }).settings.safeToSpendBuffer)).toBeCloseTo(100, 4);
  });

  test('R5 · ASK JURNL CONTEXT: OFF stays OFF after the AI choices are saved and after a reload; ASK JURNL links to the consent', async ({ page }) => {
    await openMenu(page);
    await clickTrigger(page, 'menu-privacy');
    await clickTrigger(page, 'privacy-ask-context');
    await expect(trigger(page, 'privacy-ask-context')).toHaveAttribute('aria-checked', 'true');
    await clickTrigger(page, 'privacy-ask-context');
    await expect(trigger(page, 'privacy-ask-context')).toHaveAttribute('aria-checked', 'false');
    await clickTrigger(page, 'privacy-tool-ai-access');
    for (const t of ['naturalLanguage', 'personalizedInsights']) {
      const sw = trigger(page, `privacy-ai-${t}`);
      if (await sw.count()) await sw.click();
    }
    await clickTrigger(page, 'privacy-ai-save');
    expect(await consent(page, 'ASK_JURNL_CONTEXT')).not.toBe('GRANTED');
    await page.reload({ waitUntil: 'networkidle' });
    await openMenu(page);
    await expect(page.getByTestId('menu-ask-state')).toContainText('CONTEXT OFF');
    await clickTrigger(page, 'menu-ask');
    await expect(overlay(page, 'ask')).toContainText('ASK JURNL NEEDS CONTEXT PERMISSION');
    await clickTrigger(page, 'ask-open-privacy');
    await expect(overlay(page, 'settings-consents-sheet')).toBeVisible();
    await expect(trigger(page, 'privacy-ask-context')).toHaveAttribute('aria-checked', 'false');
  });

  test('R6 · the onboarding-stranded tools are reachable after onboarding: AI access, your data, export (honest), delete / revoke / disable AI, Face ID, device trust, sessions', async ({ page }) => {
    await openMenu(page);
    await clickTrigger(page, 'menu-privacy');
    for (const [t, o] of [['privacy-tool-ai-access', 'privacy-ai-access'], ['privacy-tool-your-data', 'privacy-your-data'], ['privacy-tool-data-export', 'privacy-data-export']] as const) {
      await clickTrigger(page, t);
      await expect(overlay(page, o)).toBeVisible();
      if (o === 'privacy-data-export') {
        await expect(trigger(page, 'privacy-export-unavailable')).toContainText('NOTHING HAS BEEN REQUESTED');
        await expect(trigger(page, 'privacy-export-request')).toHaveCount(0);
        await expect(overlay(page, o)).not.toContainText("WE'LL SEND");
      }
      await page.keyboard.press('Escape');
      await expect(overlay(page, 'settings-consents-sheet')).toBeVisible();
    }
    await clickTrigger(page, 'privacy-tool-remove-access');
    await clickTrigger(page, 'privacy-remove-revoke');
    await expect(overlay(page, 'privacy-remove-access')).toContainText('NO CONNECTED ACCOUNTS TO REVOKE');
    await clickTrigger(page, 'privacy-delete-account');
    await expect(overlay(page, 'delete-account')).toBeVisible();
    await page.keyboard.press('Escape'); // cancel: back to REMOVE ACCESS, nothing deleted
    await expect(overlay(page, 'privacy-remove-access')).toBeVisible();
    await clickTrigger(page, 'privacy-remove-disable-ai');
    expect(await consent(page, 'AI_NATURAL_LANGUAGE')).not.toBe('GRANTED');
    await page.keyboard.press('Escape');
    await clickTrigger(page, 'privacy-back');
    await clickTrigger(page, 'menu-preferences');
    for (const [t, o] of [['pref-security-biometric', 'security-biometric'], ['pref-security-device', 'security-device'], ['pref-security-sessions', 'security-sessions']] as const) {
      await clickTrigger(page, t);
      await expect(overlay(page, o)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(overlay(page, 'global-preferences')).toBeVisible();
    }
    await clickTrigger(page, 'pref-security-device');
    await clickTrigger(page, 'security-device-toggle');
    await expect(overlay(page, 'security-device')).toContainText(/TRUSTED|REMOVE/);
  });

  test('R7 · SIGN OUT asks first; cancel keeps the session; confirm signs out, closes everything and lands on the welcome screen', async ({ page }) => {
    await openMenu(page);
    await clickTrigger(page, 'menu-sign-out');
    await expect(overlay(page, 'global-sign-out')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(overlay(page, 'global-menu')).toBeVisible();
    await clickTrigger(page, 'menu-sign-out');
    await clickTrigger(page, 'sign-out-confirm');
    await expect(page).toHaveURL(/\/runtime\/entry$/);
    await expect(page.locator('[data-jrn-overlay="global-menu"], [data-jrn-overlay="global-sign-out"], [data-jrn-overlay^="global-"]')).toHaveCount(0);
    await expect(trigger(page, 'f09-menu')).toHaveCount(0);
    const session = await page.evaluate(() => JSON.parse(sessionStorage.getItem('jurnl.runtime.v1.session') ?? '{}') as { status?: string; account?: unknown });
    expect(session.status).toBe('SIGNED_OUT');
    expect(session.account ?? null).toBeNull();
  });

  test('R8 · the ACCOUNT page and the approved drawer open the same destinations (no toast placeholders); the drawer links the page', async ({ page }) => {
    await openMenu(page);
    await clickTrigger(page, 'menu-account');
    await expect(overlay(page, 'account-drawer')).toBeVisible();
    await clickTrigger(page, 'drawer-connection');
    await expect(overlay(page, 'global-connections')).toBeVisible();
    await clickTrigger(page, 'connections-back');
    await expect(overlay(page, 'account-drawer')).toBeVisible();
    await clickTrigger(page, 'drawer-account');
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator('[data-jrn-overlay]')).toHaveCount(0);
    await clickTrigger(page, 'account-next');
    for (const [t, o] of [['account-notifications', 'global-preferences'], ['account-privacy', 'settings-consents-sheet'], ['account-security', 'security-biometric'], ['account-calendar', 'global-preferences']] as const) {
      await clickTrigger(page, t);
      await expect(overlay(page, o), t).toBeVisible();
      await expect(page.getByTestId('toast-not-yet')).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-jrn-overlay]'), `${t} closed`).toHaveCount(0);
    }
    await clickTrigger(page, 'account-next');
    for (const [t, o] of [['account-export', 'privacy-data-export'], ['account-help', 'global-help'], ['account-legal', 'global-legal'], ['settings-sign-out', 'global-sign-out']] as const) {
      await clickTrigger(page, t);
      await expect(overlay(page, o), t).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-jrn-overlay]'), `${t} closed`).toHaveCount(0);
    }
  });

  test('R9 · CONNECTED ACCOUNTS never shows a live connection; YOUR POCKETS goes to the manual pockets and closes the menu', async ({ page }) => {
    await openMenu(page);
    await clickTrigger(page, 'menu-connections');
    const c = overlay(page, 'global-connections');
    await expect(page.getByTestId('connections-provider')).toContainText('NO BANK CONNECTION IS AVAILABLE');
    await expect(c.locator('[data-state="ACTIVE"], [data-state="INCLUDED"]')).toHaveCount(0);
    await clickTrigger(page, 'connections-manual');
    await expect(page).toHaveURL(/\/money\/places/);
    await expect(page.locator('[data-jrn-overlay^="global-"]')).toHaveCount(0);
  });
});

test.describe('OPUS2 · short phones: the olive field scrolls, the page never does', () => {
  for (const vp of [{ width: 360, height: 640 }, { width: 393, height: 660 }]) {
    test.describe(`${vp.width}×${vp.height}`, () => {
      test.use({ viewport: vp });
      test(`S1 · every row is reachable inside the scrollport; SIGN OUT included; no page scroll`, async ({ page }) => {
        await bootstrapJurnl(page);
        await gotoJurnl(page, 'today');
        await openMenu(page);
        const port = page.locator('[data-jrn-menu-scrollport]');
        const m = await port.evaluate((e) => ({ h: e.clientHeight, sh: e.scrollHeight, oy: getComputedStyle(e).overflowY }));
        expect(m.oy).toBe('auto');
        expect(m.sh).toBeGreaterThan(m.h); // the rows do not fit: the field scrolls
        expect(await pageScroll(page)).toEqual({ y: false, x: false });
        const pb = (await port.boundingBox())!;
        for (const [row] of [...ROWS, ['menu-sign-out']]) {
          const el = trigger(page, row);
          await el.scrollIntoViewIfNeeded();
          const b = (await el.boundingBox())!;
          expect(b.y, row).toBeGreaterThanOrEqual(pb.y - 1);
          expect(b.y + b.height, row).toBeLessThanOrEqual(pb.y + pb.height + 1);
          expect(b.height, `${row} tap target`).toBeGreaterThanOrEqual(44);
        }
        expect(await pageScroll(page)).toEqual({ y: false, x: false });
        await clickTrigger(page, 'menu-sign-out');
        await expect(overlay(page, 'global-sign-out')).toBeVisible();
      });
    });
  }
});

/** The founder production shells mounted on the live overlays (P0.JURNL.GLOBAL-EIGHT-OVERLAYS, OPUS1 parent contract). */
type ShellCase = { id: string; asset: string; route: string; world: () => unknown; open: string[]; controls: string[]; contextmenu?: string };
const SHELLS: ShellCase[] = [
  { id: 'f05m-actions-sheet', asset: 'OV01', route: 'money?parent=motion', world: () => f05World('approved'), open: ['f05m-actions'], controls: ['f05m-actions-add', 'f05m-actions-move', 'f05m-actions-sheet-close'] },
  { id: 'money-add-place', asset: 'OV02', route: 'money?parent=motion', world: () => f05World('approved'), open: ['f05m-actions', 'f05m-actions-add'], controls: ['money-add-name', 'money-add-kind-checking', 'money-add-kind-cash', 'money-add-balance', 'money-add-cancel', 'money-add-save'] },
  { id: 'transfer-sheet', asset: 'OV03', route: 'money?parent=motion', world: () => f05World('approved'), open: ['f05m-actions', 'f05m-actions-move'], controls: ['transfer-amount', 'transfer-date', 'transfer-memo', 'transfer-status-in-transit', 'transfer-cancel', 'transfer-save'] },
  { id: 'd01-pocket-menu', asset: 'OV04', route: 'money/places', world: () => f05World('approved'), open: [], contextmenu: '[data-testid="d01-directory"] [data-account-id="bank"]', controls: ['d01-pocket-rename', 'd01-pocket-delete'] },
  { id: 'global-search', asset: 'OV05', route: 'money?parent=motion', world: () => dot01World(), open: ['f05m-search'], controls: ['search-input', 'search-filter-all', 'search-filter-pockets', 'search-filter-transactions', 'search-all-activity', 'search-advanced'] },
  { id: 'd01-archive-blocked', asset: 'OV07', route: 'money/places/bank/settings', world: () => dot01World(), open: ['d01-archive'], controls: ['d01-blocker-details', 'd01-keep-active', 'd01-archive-blocked-close'] },
];

test.describe('OPUS1 · the founder production shells on the live overlays', () => {
  for (const c of SHELLS) {
    test(`O${c.asset.slice(3)} · ${c.asset} ${c.id}: the shell at one uniform scale, every control on it and reachable, no page scroll`, async ({ page }) => {
      await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
      await bootstrapJurnl(page, c.world() as Parameters<typeof bootstrapJurnl>[1]);
      await gotoJurnl(page, c.route);
      if (c.contextmenu) await page.locator(c.contextmenu).click({ button: 'right' });
      for (const t of c.open) await clickTrigger(page, t);
      const host = overlay(page, c.id);
      await expect(host).toHaveAttribute('data-overlay-asset', c.asset);
      const img = host.locator('img.jsh-shell');
      await expect(img).toBeVisible();
      // one uniform scale: the drawn plate keeps the shell's 9:16 exactly (never stretched, never cropped)
      const pb = (await host.locator('.jsh-plate').boundingBox())!;
      expect(pb.width / pb.height).toBeCloseTo(2016 / 3584, 2);
      const vp = page.viewportSize()!;
      expect(pb.width).toBeLessThanOrEqual(vp.width + 1);
      expect(pb.height).toBeLessThanOrEqual(vp.height + 1);
      // the shell takes no tap; every live control is inside the plate and on screen
      expect(await img.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe('none');
      for (const t of c.controls) {
        const b = (await trigger(page, t).first().boundingBox())!;
        expect(b, t).toBeTruthy();
        expect(b.x, t).toBeGreaterThanOrEqual(pb.x - 1);
        expect(b.x + b.width, t).toBeLessThanOrEqual(pb.x + pb.width + 1);
        expect(b.y, t).toBeGreaterThanOrEqual(Math.max(0, pb.y) - 1);
        expect(b.y + b.height, t).toBeLessThanOrEqual(Math.min(vp.height, pb.y + pb.height) + 1);
      }
      // no second sculpture / foliage / medal layer over the shell
      await expect(host.locator('.jed-art')).toHaveCount(0);
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
      if (c.asset === 'OV04') {
        // full-frame at 90 % of the host width: the card is about 85 % wide when the width limits the plate (phones);
        // when the height limits it (tablet, desktop column) it is narrower, never wider than 90 %
        const card = (await page.getByTestId('d01-pocket-menu').boundingBox())!;
        const hb = (await host.boundingBox())!;
        expect(card.width / hb.width).toBeLessThan(0.9);
        if (pb.width >= hb.width * 0.89) expect(card.width / hb.width).toBeGreaterThan(0.8);
        await page.mouse.click(4, vp.height - 4); // outside the card: closes
        await expect(host).toHaveCount(0);
      } else {
        await page.keyboard.press('Escape');
        await expect(host).toHaveCount(0);
      }
    });
  }

  test('O7b · ARCHIVE BLOCKED on OV07: the real blockers sit on the shell rows; RESOLVE ISSUES on the dark strip leaves for the resolution', async ({ page }) => {
    await bootstrapJurnl(page, dot01World() as Parameters<typeof bootstrapJurnl>[1]);
    await gotoJurnl(page, 'money/places/bank/settings');
    await clickTrigger(page, 'd01-archive');
    const why = page.getByTestId('d01-blocked-why');
    await expect(why).toContainText('THIS ACCOUNT CANNOT BE ARCHIVED YET');
    const rows = why.locator('[data-testid^="d01-blocker-"]');
    expect(await rows.count()).toBeGreaterThan(0);
    const plate = (await overlay(page, 'd01-archive-blocked').locator('.jsh-plate').boundingBox())!;
    const first = (await rows.first().boundingBox())!;
    // the first blocker lands on the shell's first blank row (44.6 %–54.2 % of the shell height)
    expect(Math.abs(first.y - (plate.y + plate.height * 0.4456))).toBeLessThan(plate.height * 0.012);
    await clickTrigger(page, 'd01-blocker-details');
    await expect(overlay(page, 'd01-archive-blocked')).toHaveCount(0);
  });
});
