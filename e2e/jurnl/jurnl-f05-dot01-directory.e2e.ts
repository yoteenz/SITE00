/**
 * P0.JURNL.F05-MONEY.DOT01.ALL-37-AUTHORITY-SHELL-SIDEKICK-LAYER-AND-ICON-CONVERGENCE.OPUS3 — ALL ACCOUNTS (06) and EMPTY
 * ACCOUNTS (22) in the browser: the composition holds with 0 · 1 · 2 · 4 · 7 real (synthetic) pockets — the action row,
 * the landscape and the dock stay on screen, the page never scrolls, every pocket is reachable, nothing is invented.
 */
import { expect, test, type Page } from '@playwright/test';
import { f05World } from './helpers/jurnl-f05-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, trigger } from './helpers/jurnl-page';

function worldOf(n: number) {
  const w = f05World('many');
  const accounts = w.snapshot.accounts.slice(0, n);
  const ids = new Set(accounts.map((a) => a.account_id));
  return { ...w, snapshot: { ...w.snapshot, accounts, creditAttributes: w.snapshot.creditAttributes.filter((c: { account_id: string }) => ids.has(c.account_id)) } };
}
async function openDirectory(page: Page, n: number) {
  await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(page, worldOf(n) as Parameters<typeof bootstrapJurnl>[1]);
  await gotoJurnl(page, 'money/places');
  await page.locator('[data-testid="d01-directory"]').waitFor({ state: 'attached', timeout: 30_000 });
}
const pageScroll = (page: Page) => page.evaluate(() => ({ y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 }));
const onScreen = async (page: Page, sel: string) => {
  const b = await page.locator(sel).first().boundingBox();
  const vp = page.viewportSize()!;
  return !!b && b.y >= -1 && b.y + b.height <= vp.height + 1 && b.x >= -1 && b.x + b.width <= vp.width + 1;
};

test.describe('ALL ACCOUNTS (06) — composition holds for any number of real pockets', () => {
  for (const n of [1, 2, 4, 7]) {
    test(`D${n} · ${n} pocket${n === 1 ? '' : 's'}: SK01 scene, every pocket on its kind's 06 paper, actions + dock on screen, no page scroll`, async ({ page }) => {
      await openDirectory(page, n);
      const stage = page.locator('[data-testid="d01-directory"]');
      await expect(stage).toHaveAttribute('data-env', 'SK01_FIELD');
      await expect(page.locator('.d01-dir__paper')).toHaveCount(n);
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
      // the action row and the dock keep their place on screen whatever the count
      expect(await onScreen(page, '[data-jrn-trigger="d01-add-account"]')).toBe(true);
      expect(await onScreen(page, '[data-jrn-trigger="d01-reorder"]')).toBe(true);
      expect(await onScreen(page, '.jrn-nav')).toBe(true);
      // the papers sit above the action row (never under it, never pushed below the fold)
      const actionTop = (await trigger(page, 'd01-add-account').boundingBox())!.y;
      if (n <= 4) {
        for (const b of await page.locator('.d01-dir__paper').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().bottom))) expect(b).toBeLessThanOrEqual(actionTop + 1);
      }
      await expect(trigger(page, 'd01-reorder')).toBeEnabled({ enabled: n >= 2 });
      // the live figure is the pocket's own (BANK ACCOUNT 1,260 in the synthetic world), not the authority's sample
      await expect(page.locator('[data-jrn-trigger="d01-place-bank"] .d01-dir__figure')).toHaveText('$1,260');
      // the last pocket is reachable (inside the card zone's own scroller when there are more than four) and opens
      const last = page.locator('.d01-dir__paper').last();
      await last.scrollIntoViewIfNeeded();
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
      const id = await last.getAttribute('data-account-id');
      await last.click();
      await expect(page).toHaveURL(new RegExp(`/money/places/${id}(/attention)?$`));
    });
  }

  test('D9 · the directory paper art is the 06 kind art (bank village · rideshare lemon · cash amphora · credit coin)', async ({ page }) => {
    await openDirectory(page, 4);
    const kinds = await page.locator('.d01-dir__paper').evaluateAll((els) => els.map((e) => [e.getAttribute('data-kind'), (e.querySelector('img') as HTMLImageElement).src.split('/').pop()!.replace(/[-.][\w-]*\.webp$|\.webp$/, '')]));
    expect(kinds.map(([k]) => k)).toEqual(['bank', 'payout', 'cash', 'credit']);
    for (const [k, src] of kinds) expect(src).toContain(`CARD06_${({ bank: 'BANK', payout: 'PAYOUT', cash: 'CASH', credit: 'CREDIT' } as Record<string, string>)[k!]}`);
  });
});

test.describe('EMPTY ACCOUNTS (22)', () => {
  test('X1 · its own scene: four type papers start ADD ACCOUNT with that type; LEARN ACCOUNT TYPES explains them; no page scroll', async ({ page }) => {
    await openDirectory(page, 0);
    await expect(page.getByTestId('d01-empty-accounts')).toBeVisible();
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
    for (const t of ['d01-empty-bank', 'd01-empty-payout', 'd01-empty-cash', 'd01-empty-credit', 'd01-add-first', 'd01-learn-types']) expect(await onScreen(page, `[data-jrn-trigger="${t}"]`), t).toBe(true);
    await clickTrigger(page, 'd01-learn-types');
    const types = page.locator('[data-jrn-overlay="d01-account-types"]');
    await expect(types).toBeVisible();
    for (const s of ['BANK ACCOUNT', 'RIDESHARE CARD', 'CASH ON HAND', 'CREDIT CARD', 'NO BANK CONNECTION IS NEEDED']) await expect(types).toContainText(s);
    await page.keyboard.press('Escape');
    await expect(types).toHaveCount(0);
    await expect(trigger(page, 'd01-learn-types')).toBeFocused();
    await clickTrigger(page, 'd01-empty-cash');
    await expect(page.locator('[data-jrn-overlay="d01-add-account"]')).toBeVisible();
  });
});
