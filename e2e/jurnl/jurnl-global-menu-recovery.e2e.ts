/**
 * P0.JURNL.GLOBAL-EIGHT-OVERLAYS.MENU-FUNCTIONAL-RECOVERY-AND-SECTIONED-NAVIGATION-CONVERGENCE — the sectioned menu in
 * the browser: every row reaches a real destination and returns to the menu (BACK, Escape, focus), the recovered
 * capabilities work on synthetic records, the defects stay fixed, and nothing scrolls the page — the olive field scrolls
 * on a short phone. Exchange rates are served by a route stub (no live provider is called).
 */
import { expect, test, type Page } from '@playwright/test';
import { bootstrapJurnl, clickTrigger, gotoJurnl, storedSnapshot, trigger } from './helpers/jurnl-page';
import { dot01World, purchase } from './helpers/jurnl-dot01-world';
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
    await expect(m.locator('img[data-asset-id="OV08_MENU_ENVIRONMENT"]')).toBeVisible();
    await expect(m.locator('.jgm-tag')).toHaveText('JURNL');
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
    await expect(overlay(page, 'global-buffer')).toContainText('BUFFER AMOUNT');
    await expect(trigger(page, 'buffer-currency')).toContainText('EUR');
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

/**
 * OPUS3 · the curated clean artwork in the browser (P0.JURNL.GLOBAL-OVERLAYS.CLEAN-ARTWORK-CURATED-MOUNT-AND-CHILD-
 * ENVIRONMENT-CONVERGENCE): SEARCH on the regenerated OV05 shell with 0 / 4 / 20 live rows and a long merchant; MANAGE POCKET
 * on the regenerated note with the independent RENAME / DELETE papers; SAFE TO SPEND BUFFER and PRIVACY & CONSENTS on the
 * founder's regenerated shells (named correct 2026-11-06), with the keyboard open and on short phones. The OV01–OV03 / OV07 shells of OPUS1
 * are retired (their live compositions are covered by jurnl-editorial-overlays.e2e.ts).
 */
const plateOf = (page: Page, id: string) => overlay(page, id).locator('.jsh-plate');
/** Wait until the plate's entrance motion has finished (rects read mid-animation disagree by a few px). */
const settle = (page: Page, id: string) => page.waitForFunction((sel) => { const el = document.querySelector(sel); return !!el && el.getAnimations({ subtree: true }).every((a) => a.playState !== 'running'); }, `[data-jrn-overlay="${id}"] .jsh-plate`);
async function insidePlate(page: Page, id: string, triggers: string[]) {
  await settle(page, id);
  const pb = (await plateOf(page, id).boundingBox())!;
  const vp = page.viewportSize()!;
  for (const t of triggers) {
    const b = (await trigger(page, t).first().boundingBox())!;
    expect(b, t).toBeTruthy();
    expect(b.x, t).toBeGreaterThanOrEqual(pb.x - 1);
    expect(b.x + b.width, t).toBeLessThanOrEqual(pb.x + pb.width + 1);
    expect(b.y, t).toBeGreaterThanOrEqual(Math.max(0, pb.y) - 1);
    expect(b.y + b.height, t).toBeLessThanOrEqual(Math.min(vp.height, pb.y + pb.height) + 1);
  }
  return pb;
}
/** The pockets spec's deletable world: LONG has a small balance and two spends, nothing that blocks a delete. */
function deletableWorld() {
  const w = f05World('many');
  const now = new Date().toISOString();
  const accounts = w.snapshot.accounts.map((a) => (a.account_id === 'long' ? { ...a, balance: 18.5, available_balance: 18.5 } : a));
  const long = accounts.find((a) => a.account_id === 'long')!;
  return { ...w, snapshot: { ...w.snapshot, accounts, transactions: [purchase('tx-long-books', long, 'BOOKSHOP', 12.5, 'SHOPPING', 2, now), purchase('tx-long-cafe', long, 'CORNER CAFE', 6, 'DINING', 1, now)] } };
}
/** The DOT 01 world plus `n` matching spends (OPUS3 ROW i), the first with a merchant long enough to wrap. */
function searchWorld(n: number) {
  const w = dot01World();
  const bank = w.snapshot.accounts.find((a) => a.account_id === 'bank')!;
  const now = new Date().toISOString();
  const rows = Array.from({ length: n }, (_, i) => purchase(`tx-opus3-${i}`, bank, i === 0 ? 'OPUS3 THE EXTREMELY LONG MERCHANT NAME THAT KEEPS GOING SO IT MUST WRAP' : `OPUS3 ROW ${String(i).padStart(2, '0')}`, 10 + i, 'SHOPPING', 1 + (i % 9), now));
  return { ...w, snapshot: { ...w.snapshot, transactions: [...w.snapshot.transactions, ...rows] } };
}

test.describe('OPUS3 · SEARCH on the regenerated OV05 shell', () => {
  for (const n of [0, 4, 20]) {
    test(`C${n} · ${n} matching results: live rows of their own height, only the results scroll, no page scroll`, async ({ page }) => {
      await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
      await bootstrapJurnl(page, searchWorld(n) as Parameters<typeof bootstrapJurnl>[1]);
      await gotoJurnl(page, 'money?parent=motion');
      await clickTrigger(page, 'f05m-search');
      const host = overlay(page, 'global-search');
      await expect(host).toHaveAttribute('data-overlay-asset', 'OV05_SEARCH_SHELL');
      await expect(host.locator('img')).toHaveCount(1); // one art layer: no painted wells, no foreground duplicates
      const pb = await insidePlate(page, 'global-search', ['search-input', 'search-filter-all', 'search-filter-pockets', 'search-filter-transactions', 'search-all-activity', 'search-advanced']);
      expect(pb.width / pb.height).toBeCloseTo(2016 / 3584, 2);
      await trigger(page, 'search-input').fill('OPUS3');
      const results = page.getByTestId('search-results');
      const hits = results.locator('[data-jrn-trigger^="search-hit-"]');
      if (n === 0) {
        await expect(page.getByTestId('search-empty')).toBeVisible();
        await expect(hits).toHaveCount(0);
      } else {
        await expect(hits).toHaveCount(n);
        const heights = await hits.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
        // the long merchant wraps: its row is taller than a one-line row (no fixed row height, no truncation slot)
        expect(Math.max(...heights)).toBeGreaterThan(Math.min(...heights));
        await expect(hits.filter({ hasText: 'KEEPS GOING SO IT MUST WRAP' })).toHaveCount(1);
        const r = await results.evaluate((e) => ({ h: e.clientHeight, sh: e.scrollHeight, oy: getComputedStyle(e).overflowY }));
        expect(r.oy).toBe('auto');
        if (n === 20) {
          expect(r.sh).toBeGreaterThan(r.h); // the list scrolls inside the paper
          const last = hits.last();
          await last.scrollIntoViewIfNeeded();
          const rb = (await results.boundingBox())!;
          const lb = (await last.boundingBox())!;
          expect(lb.y).toBeGreaterThanOrEqual(rb.y - 1);
          expect(lb.y + lb.height).toBeLessThanOrEqual(rb.y + rb.height + 1);
        }
      }
      // the actions stay on the paper whatever the count
      await insidePlate(page, 'global-search', ['search-all-activity', 'search-advanced']);
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
      await page.keyboard.press('Escape');
      await expect(host).toHaveCount(0);
    });
  }
});

test.describe('OPUS3 · MANAGE POCKET with the independent papers', () => {
  test('C5 · RENAME / DELETE each wear their own text-free paper once; the keyboard reaches both; rename and delete open their confirmations', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
    await bootstrapJurnl(page, deletableWorld() as Parameters<typeof bootstrapJurnl>[1]);
    await gotoJurnl(page, 'money/places/long');
    await page.locator('[data-jrn-f05-dot01-stage], [data-jrn-f05-stage]').first().waitFor({ state: 'attached', timeout: 30_000 });
    await clickTrigger(page, 'd01-manage');
    const menu = page.getByTestId('d01-pocket-menu');
    await expect(menu).toBeVisible();
    await expect(page.getByTestId('d01-pocket-menu-backdrop')).toHaveCount(1); // the live page behind is blurred
    await expect(menu.locator('img[data-asset-id="OV04_RENAME_PAPER"]')).toHaveCount(1);
    await expect(menu.locator('img[data-asset-id="OV04_DELETE_PAPER"]')).toHaveCount(1);
    for (const t of ['d01-pocket-rename', 'd01-pocket-delete']) {
      const b = (await trigger(page, t).boundingBox())!;
      expect(b.height, `${t} tap target`).toBeGreaterThanOrEqual(44);
      const ratio = await trigger(page, t).evaluate((e) => getComputedStyle(e).aspectRatio);
      expect(ratio, `${t} keeps its paper ratio`).toMatch(/^1645 \/ (319|346)$/);
      expect(await trigger(page, t).locator('img').evaluate((e) => getComputedStyle(e).objectFit)).toBe('contain');
    }
    await trigger(page, 'd01-pocket-rename').focus();
    await page.keyboard.press('Enter');
    await expect(overlay(page, 'd01-rename-pocket')).toBeVisible();
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
    await page.keyboard.press('Escape');
    await expect(overlay(page, 'd01-rename-pocket')).toHaveCount(0);
    await clickTrigger(page, 'd01-manage');
    await trigger(page, 'd01-pocket-delete').focus();
    await page.keyboard.press('Enter');
    await expect(overlay(page, 'd01-delete-pocket')).toBeVisible();
    await expect(trigger(page, 'd01-keep-pocket')).toBeFocused();
    await clickTrigger(page, 'd01-keep-pocket');
    await expect(overlay(page, 'd01-delete-pocket')).toHaveCount(0);
  });
});

test.describe('OPUS3 · SAFE TO SPEND BUFFER and PRIVACY & CONSENTS on the regenerated shells', () => {
  test.beforeEach(async ({ page }) => {
    await rates(page);
    await bootstrapJurnl(page);
    await gotoJurnl(page, 'today');
  });

  test('C6 · BUFFER on its regenerated shell: the shell once, the papers once each, no second header or coin; keyboard open keeps the field and the actions on screen; saves USD', async ({ page }) => {
    await openMenu(page);
    await clickTrigger(page, 'menu-buffer');
    const host = overlay(page, 'global-buffer');
    await expect(host).toHaveAttribute('data-overlay-asset', 'CH01_BUFFER_SHELL');
    const ids = await host.locator('img').evaluateAll((els) => els.map((e) => e.getAttribute('data-asset-id')).sort());
    expect(ids).toEqual(['CH01_AMOUNT_PAPER', 'CH01_BACK_PAPER', 'CH01_BUFFER_SHELL', 'CH01_EFFECT_PAPER']);
    // the shell has no tag or title paper: the headline is live cream type on its olive field, no wordmark is invented
    await expect(host.locator('.jsh-tag')).toHaveCount(0);
    await expect(host.locator('.jsh-head')).toHaveAttribute('data-tone', 'cream');
    // one uniform scale: the plate keeps the shell's own ratio (560 x 887)
    await settle(page, 'global-buffer');
    const pb = (await plateOf(page, 'global-buffer').boundingBox())!;
    expect(pb.width / pb.height).toBeCloseTo(560 / 887, 2);
    await insidePlate(page, 'global-buffer', ['buffer-input', 'buffer-currency', 'buffer-back', 'buffer-save']);
    // the keyboard: focus the field, then the visual viewport loses ~40 % of its height
    await trigger(page, 'buffer-input').focus();
    const vp = page.viewportSize()!;
    await page.setViewportSize({ width: vp.width, height: Math.round(vp.height * 0.6) });
    await expect(trigger(page, 'buffer-input')).toBeFocused();
    await insidePlate(page, 'global-buffer', ['buffer-input', 'buffer-back', 'buffer-save']);
    const kb = (await plateOf(page, 'global-buffer').boundingBox())!;
    expect(kb.width / kb.height).toBeCloseTo(560 / 887, 2); // one uniform scale, never squashed
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
    await trigger(page, 'buffer-input').fill('250');
    await clickTrigger(page, 'buffer-save');
    await expect(page.getByTestId('buffer-status')).toHaveText('SAVED');
    await expect(page.getByTestId('buffer-usd')).toHaveAttribute('data-usd', '250');
    await expect(page.getByTestId('buffer-usd')).toContainText('KEPT ASIDE');
    await page.setViewportSize(vp);
    // the authority's (i) discloses what the buffer does, inside the column (never the page)
    await clickTrigger(page, 'buffer-effect-info');
    await expect(trigger(page, 'buffer-effect-info')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('buffer-effect-note')).toBeVisible();
    await expect(page.getByTestId('buffer-effect-note')).toContainText('SAFE TO SPEND LEAVES THIS AMOUNT OUT');
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
    // the currency mark on the amount paper opens DISPLAY CURRENCY; BACK returns to the buffer
    await clickTrigger(page, 'buffer-currency');
    await expect(overlay(page, 'settings-currency-sheet')).toBeVisible();
    await clickTrigger(page, 'settings-currency-sheet-close');
    await expect(host).toBeVisible();
  });

  for (const vp of [{ width: 360, height: 640 }, { width: 393, height: 660 }]) {
    test(`C7 · PRIVACY at ${vp.width}×${vp.height}: its regenerated shell once, only the list scrolls, every row reachable, statements carry no switch`, async ({ page }) => {
      await page.setViewportSize(vp);
      await openMenu(page);
      await trigger(page, 'menu-privacy').scrollIntoViewIfNeeded();
      await clickTrigger(page, 'menu-privacy');
      const host = overlay(page, 'settings-consents-sheet');
      await expect(host).toHaveAttribute('data-overlay-asset', 'CH02_PRIVACY_SHELL');
      const ids = await host.locator('img').evaluateAll((els) => els.map((e) => e.getAttribute('data-asset-id')).sort());
      expect(ids).toEqual(['CH02_BACK_PAPER', 'CH02_PRIVACY_SHELL', 'CH02_REMOVE_ACCESS_PAPER']);
      await expect(host.locator('.jsh-tag')).toHaveText('JURNL');
      await settle(page, 'settings-consents-sheet');
      const list = host.locator('.jce-list');
      const l = await list.evaluate((e) => ({ h: e.clientHeight, sh: e.scrollHeight, oy: getComputedStyle(e).overflowY }));
      expect(l.oy).toBe('auto');
      const lb = (await list.boundingBox())!;
      for (const t of ['settings-consent-remember', 'privacy-ask-context', 'privacy-tool-ai-access', 'privacy-tool-your-data', 'privacy-tool-data-export']) {
        const el = trigger(page, t);
        await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
        const b = (await el.boundingBox())!;
        expect(b.y, t).toBeGreaterThanOrEqual(lb.y - 1);
        expect(b.y + b.height, t).toBeLessThanOrEqual(lb.y + lb.height + 1);
        // the tap target is at least 44 px tall: probe 21 px above and below the centre (a switch's hit area is larger than its track)
        const hit = await el.evaluate((e, t) => {
          const r = e.getBoundingClientRect(); const cx = r.x + r.width / 2; const cy = r.y + r.height / 2;
          return [cy - 21, cy + 21].every((y) => document.elementFromPoint(cx, y)?.closest('[data-jrn-trigger]')?.getAttribute('data-jrn-trigger') === t);
        }, t);
        expect(hit, `${t} tap target ≥ 44 px`).toBe(true);
      }
      for (const t of ['privacy-statement-links', 'privacy-statement-sale']) await expect(page.getByTestId(t).locator('[role="switch"]'), t).toHaveCount(0);
      // REMOVE ACCESS and BACK sit on their papers below the list, always on screen
      await insidePlate(page, 'settings-consents-sheet', ['privacy-tool-remove-access', 'privacy-back']);
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
      await clickTrigger(page, 'privacy-back');
      await expect(host).toHaveCount(0);
      await expect(overlay(page, 'global-menu')).toBeVisible();
    });
  }
});
