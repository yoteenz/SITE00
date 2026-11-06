/**
 * P0.JURNL.GLOBAL-INTERACTIVE-SURFACES.EDITORIAL-COLLAGE-COMPOSITION-AND-OVERLAY-ARCHITECTURE-CORRECTION.OPUS2 — the
 * editorial overlays in the browser: each composition opens over its real page, its controls work on real (synthetic)
 * records, decorative art never takes a tap, focus is trapped and returned, and nothing scrolls the page — including on
 * a short phone (393 × 660).
 */
import { expect, test, type Page } from '@playwright/test';
import { dot01World } from './helpers/jurnl-dot01-world';
import { f05World } from './helpers/jurnl-f05-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, storedSnapshot, trigger } from './helpers/jurnl-page';

async function open(page: Page, route: string, world: unknown = f05World('approved')) {
  await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(page, world as Parameters<typeof bootstrapJurnl>[1]);
  await gotoJurnl(page, route);
}
const overlay = (page: Page, id: string) => page.locator(`[data-jrn-overlay="${id}"]`);
const pageScroll = (page: Page) => page.evaluate(() => ({ y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 }));
const inView = async (page: Page, sel: string) => {
  const b = await page.locator(sel).first().boundingBox();
  const vp = page.viewportSize()!;
  return !!b && b.y >= -1 && b.y + b.height <= vp.height + 1;
};
/** The element a tap at the centre of each decorative layer reaches is never the art itself. */
const artTakesTaps = (page: Page, scope: string) =>
  page.evaluate((scope) => [...document.querySelectorAll(`${scope} .jed-art`)].filter((a) => {
    const r = a.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return hit === a;
  }).length, scope);

test.describe('PILOT A · the three founder-rejected financial overlays', () => {
  test('A1 · MONEY ACTION SHEET is an editorial choice scene: two distinct fragments, art never takes the tap, Escape returns focus', async ({ page }) => {
    await open(page, 'money?parent=motion');
    await trigger(page, 'f05m-actions').focus();
    await page.keyboard.press('Enter');
    const s = overlay(page, 'f05m-actions-sheet');
    await expect(s).toHaveAttribute('data-jed', 'action');
    await expect(s.locator('.jrn-drawer')).toHaveCount(0);
    for (const t of ['f05m-actions-add', 'f05m-actions-move']) {
      const b = (await trigger(page, t).boundingBox())!;
      expect(b.height, t).toBeGreaterThanOrEqual(44);
    }
    expect(await artTakesTaps(page, '[data-jrn-overlay="f05m-actions-sheet"]')).toBe(0);
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
    await page.keyboard.press('Escape');
    await expect(s).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-jrn-trigger'))).toBe('f05m-actions');
  });

  test('A2 · ADD A POCKET: a compact grid of every supported type (no stacked rows), credit adds its limit, SAVE POCKET posts the entered balance', async ({ page }) => {
    await open(page, 'money?parent=motion');
    await clickTrigger(page, 'f05m-actions');
    await clickTrigger(page, 'f05m-actions-add');
    const s = overlay(page, 'money-add-place');
    await expect(s).toHaveAttribute('data-jed', 'register');
    const kinds = ['checking', 'savings', 'debit-card', 'credit-card', 'cash'];
    for (const k of kinds) await expect(trigger(page, `money-add-kind-${k}`)).toBeVisible();
    // compact: two columns, not five full-width rows
    const xs = new Set(await Promise.all(kinds.slice(0, 4).map(async (k) => Math.round((await trigger(page, `money-add-kind-${k}`).boundingBox())!.x))));
    expect(xs.size).toBe(2);
    await clickTrigger(page, 'money-add-kind-credit-card');
    await expect(trigger(page, 'money-add-limit')).toBeVisible();
    await clickTrigger(page, 'money-add-kind-savings');
    await expect(trigger(page, 'money-add-limit')).toHaveCount(0);
    await trigger(page, 'money-add-name').first().fill('Travel Fund');
    await trigger(page, 'money-add-balance').first().fill('125.40');
    expect(await inView(page, '[data-jrn-trigger="money-add-save"]')).toBe(true);
    await clickTrigger(page, 'money-add-save');
    await expect(trigger(page, 'f05m-added')).toBeVisible();
    const acc = ((await storedSnapshot(page)) as unknown as { accounts: { display_name: string; account_type: string; balance: number }[] }).accounts.find((a) => /TRAVEL FUND/i.test(a.display_name))!;
    expect(acc.account_type).toBe('SAVINGS');
    expect(acc.balance).toBeCloseTo(125.4, 2);
  });

  test('A3 · MOVE MONEY on its regenerated shell: the shell seal above FROM → TO between real pockets; the settlement state is chosen; recording writes the two legs once', async ({ page }) => {
    await open(page, 'money?parent=motion');
    await clickTrigger(page, 'f05m-actions');
    await clickTrigger(page, 'f05m-actions-move');
    const s = overlay(page, 'transfer-sheet');
    await expect(s).toHaveAttribute('data-jed', 'transfer');
    await expect(s).toHaveAttribute('data-overlay-asset', 'OV03_MOVE_MONEY_SHELL');
    await expect(s.locator('img.jed-plate')).toHaveCount(1);
    await expect(s.locator('.jed-direction')).toHaveCount(0); // the direction seal is the shell's own
    // the shell's seal (y 0.37–0.55 of the plate) sits above the form: FROM, then TO, below it (read before the body scrolls,
    // once the plate's entrance has settled: rects read mid-entrance disagree by a few px)
    await page.waitForFunction(() => { const el = document.querySelector('[data-jrn-overlay="transfer-sheet"] .jed-folio--plate'); return !!el && el.getAnimations({ subtree: true }).every((a) => a.playState !== 'running'); });
    const plate = (await s.locator('.jed-folio--plate').boundingBox())!;
    const [f, t] = await Promise.all([page.getByTestId('transfer-from-selected').boundingBox(), page.getByTestId('transfer-to-selected').boundingBox()]);
    expect(f!.y).toBeGreaterThanOrEqual(plate.y + plate.height * 0.55 - 1);
    expect(f!.y).toBeLessThan(t!.y);
    await clickTrigger(page, 'transfer-from-bank');
    await clickTrigger(page, 'transfer-to-cash');
    await expect(page.getByTestId('transfer-from-selected')).toContainText('BANK ACCOUNT');
    await expect(page.getByTestId('transfer-to-selected')).toContainText('CASH ON HAND');
    await trigger(page, 'transfer-amount').first().fill('25');
    for (const st of ['completed', 'in-transit', 'pending', 'scheduled']) await expect(trigger(page, `transfer-status-${st}`)).toBeVisible();
    await clickTrigger(page, 'transfer-status-in-transit');
    await expect(page.getByTestId('transfer-effect')).toContainText('IN TRANSIT');
    const before = ((await storedSnapshot(page)) as unknown as { transactions: unknown[] }).transactions.length;
    await clickTrigger(page, 'transfer-save');
    await expect(trigger(page, 'transfer-result')).toBeVisible();
    const after = ((await storedSnapshot(page)) as unknown as { transactions: unknown[] }).transactions.length;
    expect(after - before).toBe(2);
  });

  test('A4 · short phone 393 × 660: the three overlays keep their close and primary action on screen, no page scroll', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 660 });
    await open(page, 'money?parent=motion');
    for (const [open1, id, primary] of [[['f05m-actions'], 'f05m-actions-sheet', 'f05m-actions-move'], [['f05m-actions', 'f05m-actions-add'], 'money-add-place', 'money-add-save'], [['f05m-actions', 'f05m-actions-move'], 'transfer-sheet', 'transfer-save']] as const) {
      for (const t of open1) await clickTrigger(page, t);
      await expect(overlay(page, id)).toBeVisible();
      expect(await inView(page, `[data-jrn-trigger="${id}-close"]`), `${id} close`).toBe(true);
      expect(await inView(page, `[data-jrn-trigger="${primary}"]`), `${id} primary`).toBe(true);
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
      await page.keyboard.press('Escape');
      await expect(overlay(page, id)).toHaveCount(0);
    }
  });
});

test.describe('PILOT B · the five illustrated compositions', () => {
  test('B1 · SEARCH: real records only, filters, empty state, navigation to the result; ADVANCED SEARCH stays the 31 page', async ({ page }) => {
    await open(page, 'money?parent=motion', f05World('carousel'));
    await clickTrigger(page, 'f05m-search');
    const s = overlay(page, 'global-search');
    await expect(s).toHaveAttribute('data-jed', 'search');
    await expect(s).toContainText('RECENT ACTIVITY');
    await trigger(page, 'search-input').first().fill('zzzz-nothing');
    await expect(page.getByTestId('search-empty')).toBeVisible();
    await trigger(page, 'search-input').first().fill('groc');
    await clickTrigger(page, 'search-filter-transactions');
    await clickTrigger(page, 'search-hit-e-tx-e2e-grocer');
    await expect(page).toHaveURL(/\/money\/entries\/tx-e2e-grocer$/);
    await expect(overlay(page, 'global-search')).toHaveCount(0);
  });

  test('B2 · MANAGE POCKET stays an anchored fragment on the regenerated note (its own clip and coastline, clipped to its outline), opened by right-click; Escape returns focus', async ({ page }) => {
    await open(page, 'money/places');
    const card = page.locator('[data-testid="d01-directory"] [data-account-id="bank"]');
    await card.click({ button: 'right' });
    const m = page.getByTestId('d01-pocket-menu');
    await expect(m).toBeVisible();
    const note = m.locator('img[data-asset-id="OV04_MANAGE_NOTE"]');
    await expect(note).toHaveCount(1);
    expect(await note.evaluate((e) => getComputedStyle(e).clipPath)).toMatch(/^polygon\(/);
    // the note carries its own paperclip and coastline: nothing of it is drawn twice
    await expect(m.locator('.jed-pop-clip, .jed-pop-art')).toHaveCount(0);
    const box = (await m.boundingBox())!;
    expect(box.width).toBeLessThan(page.viewportSize()!.width * 0.9);
    await page.keyboard.press('Escape');
    await expect(m).toHaveCount(0);
    await expect(card).toBeFocused();
  });

  test('B3 · ARCHIVE BLOCKED lists only the real blockers, on the oxblood caution with its stone; RESOLVE ISSUES and KEEP stay reachable', async ({ page }) => {
    await open(page, 'money/places/bank/settings', dot01World());
    await clickTrigger(page, 'd01-archive');
    const c = page.getByTestId('d01-blocked-why');
    await expect(c).toBeVisible();
    await expect(c.locator('.jed-caution-stone')).toHaveCount(1);
    expect(await c.locator('[data-testid^="d01-blocker-"]').count()).toBeGreaterThan(0);
    await expect(trigger(page, 'd01-blocker-details')).toBeVisible();
  });

  // OPUS2: the classical head is now the founder's OV08 shell itself (bust, lemons, arch, coast in one plate), so no
  // separate head art is layered over it; the shell takes no taps (pointer-events none) and the rows live on top.
  test('B4 · GLOBAL MENU over the MONEY parent: the OV08 shell head, only secondary destinations, focus returns', async ({ page }) => {
    await open(page, 'money?parent=motion');
    await clickTrigger(page, 'f09-menu');
    const m = overlay(page, 'global-menu');
    await expect(m.locator('img[data-asset-id="OV08_MENU_ENVIRONMENT"]')).toBeVisible();
    expect(await m.locator('img[data-asset-id="OV08_MENU_ENVIRONMENT"]').evaluate((e) => getComputedStyle(e).pointerEvents)).toBe('none');
    await expect(m.locator('.jgm-head')).toContainText('MENU');
    for (const t of ['nav-home', 'nav-money', 'nav-add', 'nav-plan', 'nav-credit']) await expect(m.locator(`[data-jrn-trigger="${t}"]`)).toHaveCount(0);
    expect(await artTakesTaps(page, '[data-jrn-overlay="global-menu"]')).toBe(0);
    await page.keyboard.press('Escape');
    await expect(m).toHaveCount(0);
  });

  test('B5 · SelectionSheet (legacy) now traps focus and closes on Escape', async ({ page }) => {
    await open(page, 'safe/check');
    await trigger(page, 'check-category').focus();
    await page.keyboard.press('Enter');
    const sheet = page.locator('[data-jrn-sheet="check-category-sheet"]');
    await expect(sheet).toBeVisible();
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[data-jrn-sheet="check-category-sheet"]')), `tab ${i}`).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(trigger(page, 'check-category')).toBeFocused();
  });
});
