/**
 * P0.JURNL.GLOBAL-OVERLAYS.CANONICAL-MICRO-ASSETS-AND-UTILITY-BUTTONS.CLEAN-MOUNT-CONVERGENCE.OPUS5 — the GROK2 micro-assets
 * in the browser, on synthetic records:
 *   · every mounted slot wears exactly one decoded asset, decorative and never a target; no slot keeps a line glyph next to it
 *   · PRIVACY: the consent switch is the art hardware (olive / charcoal track, separate thumb) and React owns the value: a
 *     tap, Space and a reload all agree; policy statements carry no switch
 *   · MENU, SEARCH, ADD A POCKET, MOVE MONEY, MANAGE POCKET, BUFFER and MONEY ACTION wear their art; the papers replace the
 *     generic backings (never both); the flows still open, close and return focus
 *   · F09 ACCOUNT (OV06) and ARCHIVE BLOCKED (OV07) carry no GROK2 art; nothing scrolls the page at six sizes
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { f05World } from './helpers/jurnl-f05-world';
import { dot01World } from './helpers/jurnl-dot01-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, trigger } from './helpers/jurnl-page';

type World = Parameters<typeof bootstrapJurnl>[1];
const overlay = (page: Page, id: string) => page.locator(`[data-jrn-overlay="${id}"]`);
const pageScroll = (page: Page) => page.evaluate(() => ({ y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 }));
const activeTrigger = (page: Page) => page.evaluate(() => document.activeElement?.closest('[data-jrn-trigger]')?.getAttribute('data-jrn-trigger') ?? null);

async function rates(page: Page) {
  await page.route('https://open.er-api.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92 } }) }));
}
async function open(page: Page, route = 'money?parent=motion', world: unknown = f05World('approved')) {
  await rates(page);
  await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(page, world as World);
  await gotoJurnl(page, route);
  await page.locator('[data-jrn-f05-stage], [data-jrn-f05-dot01-stage]').first().waitFor({ state: 'attached', timeout: 30_000 });
}
async function openMenu(page: Page) {
  await clickTrigger(page, 'f09-menu');
  await expect(overlay(page, 'global-menu')).toBeVisible();
}

/** Every GROK2 slot inside a host: its asset, decoded, decorative, never a target; slots unique; one asset per slot. */
async function slots(host: Locator) {
  // the art is decoded before it is judged (decoding is async)
  await host.locator('img[data-asset-id^="GROK2."]').evaluateAll((els) => Promise.all(els.map((e) => (e as HTMLImageElement).decode().catch(() => undefined))));
  return host.evaluate((h) => {
    const imgs = [...h.querySelectorAll('img[data-asset-id^="GROK2."]')].filter((e) => !e.closest('.jm-ghost')) as HTMLImageElement[];
    return {
      count: imgs.length,
      slots: imgs.map((i) => i.dataset.microSlot ?? ''),
      bad: imgs
        .filter((i) => !(i.complete && i.naturalWidth > 0) || i.alt !== '' || i.getAttribute('aria-hidden') !== 'true' || getComputedStyle(i).pointerEvents !== 'none' || getComputedStyle(i).objectFit !== 'contain')
        .map((i) => i.dataset.microSlot),
      byAsset: Object.fromEntries(imgs.map((i) => [i.dataset.microSlot, i.dataset.assetId])),
    };
  });
}
async function expectClean(host: Locator) {
  const s = await slots(host);
  expect(s.bad, 'decoded, decorative, never a target, never stretched').toEqual([]);
  expect(new Set(s.slots).size, 'one asset per slot').toBe(s.slots.length);
  return s;
}

test.describe('OPUS5 · PRIVACY & CONSENTS (CH02)', () => {
  test('P1 · eight row icons and the cream chevrons; the switches are the art hardware; statements carry no switch', async ({ page }) => {
    await open(page);
    await openMenu(page);
    await clickTrigger(page, 'menu-privacy');
    const host = overlay(page, 'settings-consents-sheet');
    await expect(host).toBeVisible();
    const s = await expectClean(host);
    for (const [slot, id] of [
      ['settings-consent-remember-icon', 'B01-GEAR-REMEMBER-SETUP'],
      ['privacy-statement-links-icon', 'B01-BANK-LINKED-ACCOUNTS'],
      ['privacy-statement-sale-icon', 'B01-SHIELD-NOTHING-SOLD'],
      ['privacy-ask-context-icon', 'B01-SPARKLE-ASK-CONTEXT'],
      ['privacy-tool-ai-access-icon', 'B01-AI-STAR'],
      ['privacy-tool-your-data-icon', 'B01-DATABASE-YOUR-DATA'],
      ['privacy-tool-data-export-icon', 'B01-EXPORT-DOWN'],
      ['privacy-tool-remove-access-icon', 'B01-TRASH-REMOVE'],
    ]) expect(s.byAsset[slot], slot).toBe(`GROK2.${id}`);
    await expect(host.locator('svg:not(.jm-ghost *):not(.jsh-ornament *)')).toHaveCount(0); // no line glyph is left (the ornament under the script is the shell's live rule)
    await expect(host.locator('.jrn-toggle')).toHaveCount(0); // no CSS switch is left
    await expect(host.locator('[role="switch"]')).toHaveCount(2);
    for (const t of ['privacy-statement-links', 'privacy-statement-sale']) await expect(page.getByTestId(t).locator('[role="switch"]')).toHaveCount(0);
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
  });

  test('P2 · a tap, Space and a reload agree: the track and thumb follow the stored consent; OFF stays OFF', async ({ page }) => {
    await open(page);
    await openMenu(page);
    await clickTrigger(page, 'menu-privacy');
    const sw = trigger(page, 'privacy-ask-context');
    const look = () => sw.evaluate((e) => {
      const track = e.querySelector('.jma-switch__track')!.getAttribute('data-asset-id');
      const t = e.querySelector('.jma-switch__thumb')!.getBoundingClientRect();
      const b = e.getBoundingClientRect();
      return { checked: e.getAttribute('aria-checked'), track, side: t.left + t.width / 2 > b.left + b.width / 2 ? 'right' : 'left' };
    });
    expect(await look()).toEqual({ checked: 'false', track: 'GROK2.B01-TOGGLE-TRACK-CHARCOAL', side: 'left' });
    await sw.click();
    await expect.poll(look).toEqual({ checked: 'true', track: 'GROK2.B01-TOGGLE-TRACK-OLIVE', side: 'right' });
    // the 44 px touch target: a probe 21 px above and below the centre still hits the switch
    const hit = await sw.evaluate((e) => { const r = e.getBoundingClientRect(); const cx = r.x + r.width / 2; const cy = r.y + r.height / 2; return [cy - 21, cy + 21].every((y) => e.contains(document.elementFromPoint(cx, y))); });
    expect(hit).toBe(true);
    await page.reload({ waitUntil: 'networkidle' });
    await openMenu(page);
    await clickTrigger(page, 'menu-privacy');
    await expect.poll(look).toEqual({ checked: 'true', track: 'GROK2.B01-TOGGLE-TRACK-OLIVE', side: 'right' });
    await sw.focus();
    await page.keyboard.press('Space');
    await expect.poll(look).toEqual({ checked: 'false', track: 'GROK2.B01-TOGGLE-TRACK-CHARCOAL', side: 'left' });
    await page.reload({ waitUntil: 'networkidle' });
    await openMenu(page);
    await clickTrigger(page, 'menu-privacy');
    await expect.poll(look).toEqual({ checked: 'false', track: 'GROK2.B01-TOGGLE-TRACK-CHARCOAL', side: 'left' });
  });
});

test.describe('OPUS5 · GLOBAL MENU (OV08) and SAFE TO SPEND BUFFER (CH01)', () => {
  test('M1 · eleven art icons and twelve chevrons; SAFE TO SPEND BUFFER keeps its held glyph; rows still open and return', async ({ page }) => {
    await open(page);
    await openMenu(page);
    const host = overlay(page, 'global-menu');
    const s = await expectClean(host);
    expect(s.slots.filter((x) => x.endsWith('-chevron'))).toHaveLength(12);
    expect(s.slots.filter((x) => x.endsWith('-icon'))).toHaveLength(11);
    await expect(trigger(page, 'menu-buffer').locator('svg')).toHaveCount(1);
    for (const t of ['menu-connections', 'menu-privacy', 'menu-sign-out']) await expect(trigger(page, t).locator('svg')).toHaveCount(0);
    await clickTrigger(page, 'menu-buffer');
    await expect(overlay(page, 'global-buffer')).toBeVisible();
    const b = await expectClean(overlay(page, 'global-buffer'));
    expect(b.byAsset['buffer-effect-info-mark']).toBe('GROK2.B06-INFO');
    await clickTrigger(page, 'buffer-effect-info');
    await expect(page.getByTestId('buffer-effect-note')).toBeVisible();
    await clickTrigger(page, 'buffer-back');
    await expect(overlay(page, 'global-menu')).toBeVisible();
    await expect.poll(() => activeTrigger(page)).toBe('menu-buffer');
  });
});

test.describe('OPUS5 · MONEY overlays', () => {
  test('A1 · MONEY ACTION wears the dark chevrons; ADD A POCKET its type art, the check disc and its own papers (no generic backing)', async ({ page }) => {
    await open(page);
    await clickTrigger(page, 'f05m-actions');
    const sheet = overlay(page, 'f05m-actions-sheet');
    const a = await expectClean(sheet);
    expect(a.byAsset['f05m-actions-add-chevron']).toBe('GROK2.B03-CHEVRON');
    expect(a.byAsset['f05m-actions-move-chevron']).toBe('GROK2.B03-CHEVRON');
    await clickTrigger(page, 'f05m-actions-add');
    const host = overlay(page, 'money-add-place');
    await expect(host).toBeVisible();
    let s = await expectClean(host);
    expect(s.byAsset['money-add-kind-checking-icon']).toBe('GROK2.B03-BANK-SELECTED'); // the authority's light bank when selected
    expect(s.byAsset['money-add-kind-savings-icon']).toBe('GROK2.B03-COIN-STACK');
    expect(s.byAsset['money-add-kind-check']).toBe('GROK2.B03-CHECK-SELECTED');
    expect(s.byAsset['money-add-cancel-paper']).toBe('GROK2.B05-ADD-CANCEL');
    expect(s.byAsset['money-add-save-paper']).toBe('GROK2.B05-CREATE-POCKET');
    await expect(host.locator('.jed-foot .jed-action__paper, .jed-foot .jed-action__strip')).toHaveCount(0);
    await clickTrigger(page, 'money-add-kind-savings');
    s = await expectClean(host);
    expect(s.byAsset['money-add-kind-checking-icon']).toBe('GROK2.B03-BANK-SOURCE');
    expect(await trigger(page, 'money-add-kind-savings').locator('img').first().evaluate((e) => getComputedStyle(e).filter)).toMatch(/invert/);
    expect(s.slots.filter((x) => x === 'money-add-kind-check')).toHaveLength(1);
    // the flow still saves through its own path
    await trigger(page, 'money-add-name').first().fill('OPUS5 POT');
    await trigger(page, 'money-add-balance').first().fill('42.10');
    await clickTrigger(page, 'money-add-save');
    await expect(trigger(page, 'f05m-added')).toBeVisible();
  });

  test('A2 · MOVE MONEY: the source bank and the destination pocket mark once each; its own papers; Escape returns focus', async ({ page }) => {
    await open(page);
    await clickTrigger(page, 'f05m-actions');
    await clickTrigger(page, 'f05m-actions-move');
    const host = overlay(page, 'transfer-sheet');
    await expect(host).toBeVisible();
    const s = await expectClean(host);
    expect(s.byAsset['transfer-from-mark']).toBe('GROK2.B03-BANK-SOURCE');
    expect(s.byAsset['transfer-to-mark']).toBe('GROK2.B03-POCKET-MARK');
    expect(s.byAsset['transfer-cancel-paper']).toBe('GROK2.B05-MOVE-CANCEL');
    expect(s.byAsset['transfer-save-paper']).toBe('GROK2.B05-RECORD-TRANSFER');
    await expect(host.locator('.jed-foot .jed-action__strip')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(host).toHaveCount(0);
    await expect.poll(() => activeTrigger(page)).toBe('f05m-actions');
  });

  test('A3 · SEARCH: the magnifier inside the field never covers the typed text; POCKETS wears the bank; results their marks', async ({ page }) => {
    await open(page, 'money?parent=motion', f05World('carousel'));
    await clickTrigger(page, 'f05m-search');
    const host = overlay(page, 'global-search');
    const s = await expectClean(host);
    expect(s.byAsset['search-input-mark']).toBe('GROK2.B04-SEARCH');
    expect(s.byAsset['search-filter-pockets-mark']).toBe('GROK2.B03-BANK-SOURCE');
    const geo = await page.evaluate(() => {
      const i = document.querySelector('[data-jrn-trigger="search-input"]') as HTMLInputElement;
      const m = document.querySelector('[data-micro-slot="search-input-mark"]')!.getBoundingClientRect();
      const r = i.getBoundingClientRect();
      return { textStart: r.left + parseFloat(getComputedStyle(i).paddingLeft), markRight: m.right, inside: m.left >= r.left && m.right <= r.right && m.top >= r.top && m.bottom <= r.bottom };
    });
    expect(geo.inside).toBe(true);
    expect(geo.textStart).toBeGreaterThan(geo.markRight);
    await trigger(page, 'search-input').fill('TRANSFER');
    const r = await expectClean(host);
    expect(r.slots.filter((x) => x.startsWith('search-hit-')).length).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(host).toHaveCount(0);
  });

  test('A4 · MANAGE POCKET: pencil and trash with the dark chevron on the independent papers; RENAME and DELETE still open', async ({ page }) => {
    await open(page, 'money/places/long', f05World('many'));
    await clickTrigger(page, 'd01-manage');
    const menu = page.getByTestId('d01-pocket-menu');
    await expect(menu).toBeVisible();
    const s = await expectClean(menu);
    expect(s.byAsset['d01-pocket-rename-icon']).toBe('GROK2.B03-PENCIL');
    expect(s.byAsset['d01-pocket-delete-icon']).toBe('GROK2.B03-TRASH');
    expect(s.byAsset['d01-pocket-rename-chevron']).toBe('GROK2.B03-CHEVRON');
    await expect(menu.locator('svg')).toHaveCount(0);
    await expect(menu.locator('img[data-asset-id="OV04_RENAME_PAPER"]')).toHaveCount(1);
    await expect(menu.locator('img[data-asset-id="OV04_DELETE_PAPER"]')).toHaveCount(1);
    await clickTrigger(page, 'd01-pocket-rename');
    await expect(menu).toHaveCount(0);
  });

  test('A5 · F09 ACCOUNT (OV06) and ARCHIVE BLOCKED (OV07) carry no GROK2 art (FD-12 / BLOCKED_ARTWORK)', async ({ page }) => {
    await open(page);
    await openMenu(page);
    await clickTrigger(page, 'menu-account');
    await expect(overlay(page, 'account-drawer')).toBeVisible();
    await expect(overlay(page, 'account-drawer').locator('img[data-asset-id^="GROK2."]')).toHaveCount(0);
    await page.goto('about:blank');
    await open(page, 'money/places/bank/settings', dot01World());
    await clickTrigger(page, 'd01-archive');
    await expect(overlay(page, 'd01-archive-blocked')).toBeVisible();
    await expect(overlay(page, 'd01-archive-blocked').locator('img[data-asset-id^="GROK2."]')).toHaveCount(0);
  });
});

test.describe('OPUS5 · reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('R1 · the switch thumb moves with no transition; the value still changes', async ({ page }) => {
    await open(page);
    await openMenu(page);
    await clickTrigger(page, 'menu-privacy');
    const thumb = trigger(page, 'privacy-ask-context').locator('.jma-switch__thumb');
    expect(await thumb.evaluate((e) => getComputedStyle(e).transitionDuration)).toBe('0s');
    await clickTrigger(page, 'privacy-ask-context');
    await expect(trigger(page, 'privacy-ask-context')).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('OPUS5 · responsive', () => {
  for (const vp of [{ width: 360, height: 640 }, { width: 393, height: 660 }, { width: 393, height: 852 }, { width: 430, height: 932 }, { width: 820, height: 1180 }, { width: 1440, height: 900 }]) {
    test(`V · ${vp.width}×${vp.height}: PRIVACY, MENU and ADD A POCKET wear their art inside their columns, no page scroll`, async ({ page }) => {
      await page.setViewportSize(vp);
      await open(page);
      await openMenu(page);
      for (const [hostId, row] of [['global-menu', 'menu-connections'], ['settings-consents-sheet', 'settings-consent-remember']] as const) {
        if (hostId === 'settings-consents-sheet') await clickTrigger(page, 'menu-privacy');
        const host = overlay(page, hostId);
        await expect(host).toBeVisible();
        await expectClean(host);
        const inside = await page.evaluate(([r]) => {
          const el = document.querySelector(`[data-jrn-trigger="${r}"]`)!.closest('.jce-row, .jgm-row')!;
          const row = el.getBoundingClientRect();
          return [...el.querySelectorAll('img[data-asset-id^="GROK2."]')].every((i) => { const b = i.getBoundingClientRect(); return b.width > 6 && b.left >= row.left - 1 && b.right <= row.right + 1 && b.top >= row.top - 1 && b.bottom <= row.bottom + 1; });
        }, [row]);
        expect(inside, `${hostId} art inside its row`).toBe(true);
        expect(await pageScroll(page)).toEqual({ y: false, x: false });
      }
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      await expect(overlay(page, 'global-menu')).toHaveCount(0);
      await clickTrigger(page, 'f05m-actions');
      await clickTrigger(page, 'f05m-actions-add');
      await expectClean(overlay(page, 'money-add-place'));
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
    });
  }
});
