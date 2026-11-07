/**
 * P0.JURNL.F05-MONEY.CANONICAL-UTILITY-ICON-FAMILY-INTEGRATION.OPUS1 — the four founder-supplied utility artworks (CLOSE,
 * MENU, SEARCH, ADD) on live controls, in the browser, on synthetic records:
 *   · MOUNT: SEARCH, ADD and the hamburger on the MONEY parent each wear their artwork once (loaded, decorative, never a
 *     target); no line glyph, CSS circle, border, background or second shadow is drawn; the trigger ids and order are kept
 *   · BEHAVIOUR: each opens the flow it opened before; each close (the cream / gold disc authorities) closes; Escape closes;
 *     focus returns to the trigger; Enter and Space activate; a focus ring shows on keyboard focus
 *   · SIZE: one visible disc for the three header controls, touch targets 44 tall (header chips as wide as the approved
 *     pitch allows, no overlap), overlay closes 44 x 44 or more; no page scroll at phone, tablet and desktop sizes
 *   · MOTION: a small press compression with motion allowed, none under reduced motion, nothing while idle
 *   · SCOPE: other hubs keep their hamburger (the MENU artwork is claimed by the MONEY parent only while mounted)
 */
import { expect, test, type Page } from '@playwright/test';
import { f05World } from './helpers/jurnl-f05-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, trigger } from './helpers/jurnl-page';

const ART: Record<string, string> = {
  'f05m-search': 'F05.UTILITY.SEARCH.GOLD',
  'f05m-actions': 'F05.UTILITY.ADD.GOLD',
  'f09-menu': 'F05.UTILITY.MENU.GOLD',
};
const HEADER = ['f05m-search', 'f05m-actions', 'f09-menu'];
const overlay = (page: Page, id: string) => page.locator(`[data-jrn-overlay="${id}"]`);
const live = (page: Page, id: string) => page.locator(`[data-jrn-trigger="${id}"]:not(.jm-ghost *)`);
const pageScroll = (page: Page) => page.evaluate(() => ({ y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 }));
const activeTrigger = (page: Page) => page.evaluate(() => document.activeElement?.closest('[data-jrn-trigger]')?.getAttribute('data-jrn-trigger') ?? null);

async function rates(page: Page) {
  await page.route('https://open.er-api.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92 } }) }));
}
async function openParent(page: Page) {
  await rates(page);
  await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(page, f05World('approved') as unknown as Parameters<typeof bootstrapJurnl>[1]);
  await gotoJurnl(page, 'money?parent=motion');
  await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached', timeout: 30_000 });
}
/** Waits until no animation runs in the document (entrances settled: rects are final). */
const settled = (page: Page) => page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || (a.effect?.getComputedTiming().iterations ?? 1) === Infinity), undefined, { timeout: 10_000 });

/** The facts of one live utility control: its artwork, styling, visible disc and the probed touch target. */
function facts(page: Page, id: string) {
  return page.evaluate((id) => {
    const el = [...document.querySelectorAll(`[data-jrn-trigger="${id}"]`)].find((e) => !e.closest('.jm-ghost')) as HTMLElement;
    const b = el.getBoundingClientRect();
    const img = el.querySelector('img.jrn-uab__art') as HTMLImageElement | null;
    const ib = img?.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    const hits = (dx: number, dy: number) => { const h = document.elementFromPoint(cx + dx, cy + dy); return !!h && (h === el || el.contains(h)); };
    const reach = (sx: number, sy: number) => { let d = 0; for (let s = 0; s <= 40; s += 0.5) { if (hits(sx * s, sy * s)) d = s; else break; } return d; };
    return {
      art: img?.getAttribute('data-asset-id') ?? null,
      loaded: !!img && img.complete && img.naturalWidth > 0,
      imgs: el.querySelectorAll('img').length,
      svgs: el.querySelectorAll('svg').length,
      alt: img?.getAttribute('alt'),
      ariaHidden: img?.getAttribute('aria-hidden'),
      imgPointer: img ? getComputedStyle(img).pointerEvents : null,
      label: el.getAttribute('aria-label'),
      tag: el.tagName,
      border: cs.borderTopWidth,
      background: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      shadow: cs.boxShadow,
      radius: cs.borderTopLeftRadius,
      box: { x: b.left, y: b.top, w: b.width, h: b.height, cx, cy },
      disc: ib ? { d: ib.width * 0.8065, cx: ib.left + ib.width / 2, cy: ib.top + ib.height / 2 } : null,
      target: { w: reach(-1, 0) + reach(1, 0), h: reach(0, -1) + reach(0, 1) },
      inViewport: b.left >= 0 && b.top >= 0 && b.right <= innerWidth + 0.5 && b.bottom <= innerHeight + 0.5,
    };
  }, id);
}
type Facts = Awaited<ReturnType<typeof facts>>;
function expectArt(f: Facts, id: string, art: string) {
  expect(f.tag, id).toBe('BUTTON');
  expect(f.art, id).toBe(art);
  expect(f.loaded, `${id} artwork decoded`).toBe(true);
  expect(f.imgs, `${id} one artwork`).toBe(1);
  expect(f.svgs, `${id} no line glyph`).toBe(0);
  expect(f.alt, id).toBe('');
  expect(f.ariaHidden, id).toBe('true');
  expect(f.imgPointer, `${id} artwork is never the target`).toBe('none');
  // the artwork carries its own disc, bevel and shadow: nothing is drawn behind it
  expect(f.border, id).toBe('0px');
  expect(f.background, id).toBe('rgba(0, 0, 0, 0)');
  expect(f.backgroundImage, id).toBe('none');
  expect(f.shadow, id).toBe('none');
  expect(f.radius, `${id} square-rounded hit area, not a circular control`).toBe('12px');
}

test.describe('OPUS1 · MONEY parent utility controls', () => {
  test('U1 · SEARCH, ADD and MENU each wear their founder artwork once; names, trigger ids and order kept; one control each', async ({ page }) => {
    await openParent(page);
    await settled(page);
    const f: Record<string, Facts> = {};
    for (const id of HEADER) {
      await expect(live(page, id), `${id} rendered once`).toHaveCount(1);
      f[id] = await facts(page, id);
      expectArt(f[id], id, ART[id]!);
      expect(f[id].inViewport, `${id} on screen`).toBe(true);
    }
    expect(f['f05m-search']!.label).toBe('SEARCH POCKETS AND ACTIVITY');
    expect(f['f05m-actions']!.label).toBe('ADD A POCKET OR MOVE YOUR MONEY');
    expect(f['f09-menu']!.label).toBe('MENU');
    await expect(live(page, 'f05m-search')).toHaveAttribute('aria-haspopup', 'dialog');
    // as before: aria-expanded is stated while the menu is open (U5) and absent while it is closed
    expect(await live(page, 'f09-menu').getAttribute('aria-expanded')).toBeNull();
    // order and placement: SEARCH, ADD, MENU left to right on one row, one disc size, no two discs overlapping
    const [s, a, m] = HEADER.map((id) => f[id]!.disc!);
    expect(s.cx).toBeLessThan(a.cx);
    expect(a.cx).toBeLessThan(m.cx);
    for (const d of [a, m]) {
      expect(Math.abs(d.cy - s.cy)).toBeLessThan(1);
      expect(Math.abs(d.d - s.d)).toBeLessThan(0.75);
    }
    expect(a.cx - s.cx).toBeGreaterThan(s.d);
    expect(m.cx - a.cx).toBeGreaterThan(a.d);
    // no other utility artwork and no leftover line glyph in the header row
    expect(await page.locator('img[data-asset-id^="F05.UTILITY."]:not(.jm-ghost *)').count()).toBe(3);
  });

  test('U2 · touch targets: 44 tall; the chips fill the approved pitch without overlapping a neighbour; the hamburger ≥ 38 wide', async ({ page }) => {
    await openParent(page);
    await settled(page);
    const [s, a, m] = await Promise.all(HEADER.map((id) => facts(page, id)));
    const pitch = a!.box.cx - s!.box.cx;
    for (const [id, f] of [['f05m-search', s], ['f05m-actions', a]] as const) {
      expect(f!.target.h, `${id} height`).toBeGreaterThanOrEqual(44);
      expect(f!.target.w, `${id} width fills the pitch`).toBeGreaterThanOrEqual(Math.min(44, pitch) - 1.5);
      expect(f!.target.w, `${id} width stays within the pitch`).toBeLessThanOrEqual(Math.max(44, pitch) + 1);
    }
    expect(m!.target.h, 'f09-menu height').toBeGreaterThanOrEqual(44);
    expect(m!.target.w, 'f09-menu width').toBeGreaterThanOrEqual(38);
    // the point midway between two neighbours belongs to at most one of them
    const mid = await page.evaluate(([x, y]) => document.elementFromPoint(x!, y!)?.closest('[data-jrn-trigger]')?.getAttribute('data-jrn-trigger') ?? null, [(s!.box.cx + a!.box.cx) / 2, s!.box.cy]);
    expect([null, 'f05m-search', 'f05m-actions', 'f05m-env']).toContain(mid);
  });

  test('U3 · SEARCH opens SEARCH; its close wears the CLOSE artwork and closes; Escape closes; focus returns to SEARCH', async ({ page }) => {
    await openParent(page);
    await clickTrigger(page, 'f05m-search');
    const host = overlay(page, 'global-search');
    await expect(host).toBeVisible();
    await settled(page);
    expectArt(await facts(page, 'global-search-close'), 'global-search-close', 'F05.UTILITY.CLOSE.GOLD');
    const c = await facts(page, 'global-search-close');
    expect(c.target.w).toBeGreaterThanOrEqual(44);
    expect(c.target.h).toBeGreaterThanOrEqual(44);
    await expect(live(page, 'global-search-close')).toHaveAttribute('aria-label', /CLOSE/);
    await clickTrigger(page, 'global-search-close');
    await expect(host).toHaveCount(0);
    await expect.poll(() => activeTrigger(page)).toBe('f05m-search');
    await clickTrigger(page, 'f05m-search');
    await expect(host).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(host).toHaveCount(0);
    await expect.poll(() => activeTrigger(page)).toBe('f05m-search');
  });

  test('U4 · ADD opens the money action sheet; ADD A POCKET and MOVE MONEY close on the CLOSE artwork; focus returns', async ({ page }) => {
    await openParent(page);
    for (const [step, id] of [[null, 'f05m-actions-sheet'], ['f05m-actions-add', 'money-add-place'], ['f05m-actions-move', 'transfer-sheet']] as const) {
      await clickTrigger(page, 'f05m-actions');
      await expect(overlay(page, 'f05m-actions-sheet')).toBeVisible();
      if (step) await clickTrigger(page, step);
      await expect(overlay(page, id)).toBeVisible();
      await settled(page);
      const c = await facts(page, `${id}-close`);
      expectArt(c, `${id}-close`, 'F05.UTILITY.CLOSE.GOLD');
      expect(c.target.w, id).toBeGreaterThanOrEqual(44);
      expect(c.target.h, id).toBeGreaterThanOrEqual(44);
      await expect(live(page, `${id}-close`), `${id}: one close`).toHaveCount(1);
      await clickTrigger(page, `${id}-close`);
      await expect(overlay(page, id)).toHaveCount(0);
      await expect.poll(() => activeTrigger(page), `${id} focus returns`).toBe('f05m-actions');
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
    }
  });

  test('U5 · MENU opens the global menu; its close wears the CLOSE artwork and closes; Escape closes; focus returns to MENU', async ({ page }) => {
    await openParent(page);
    await clickTrigger(page, 'f09-menu');
    const menu = overlay(page, 'global-menu');
    await expect(menu).toBeVisible();
    await expect(live(page, 'f09-menu')).toHaveAttribute('aria-expanded', 'true');
    await settled(page);
    const c = await facts(page, 'global-menu-close');
    expectArt(c, 'global-menu-close', 'F05.UTILITY.CLOSE.GOLD');
    expect(c.label).toBe('CLOSE MENU');
    expect(c.target.w).toBeGreaterThanOrEqual(44);
    expect(c.target.h).toBeGreaterThanOrEqual(44);
    await clickTrigger(page, 'global-menu-close');
    await expect(menu).toHaveCount(0);
    await expect(live(page, 'f09-menu')).toBeFocused();
    await clickTrigger(page, 'f09-menu');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(live(page, 'f09-menu')).toBeFocused();
  });

  test('U6 · menu destinations on the cream / gold disc authorities (BUFFER, PRIVACY) close on the CLOSE artwork', async ({ page }) => {
    await openParent(page);
    for (const [row, id] of [['menu-buffer', 'global-buffer'], ['menu-privacy', 'settings-consents-sheet']] as const) {
      await clickTrigger(page, 'f09-menu');
      await expect(overlay(page, 'global-menu')).toBeVisible();
      await trigger(page, row).scrollIntoViewIfNeeded();
      await clickTrigger(page, row);
      await expect(overlay(page, id)).toBeVisible();
      await settled(page);
      const c = await facts(page, `${id}-close`);
      expectArt(c, `${id}-close`, 'F05.UTILITY.CLOSE.GOLD');
      expect(c.target.w, id).toBeGreaterThanOrEqual(44);
      expect(c.target.h, id).toBeGreaterThanOrEqual(44);
      expect(c.inViewport, `${id} close on screen`).toBe(true);
      await clickTrigger(page, `${id}-close`);
      await expect(overlay(page, id)).toHaveCount(0);
      if (await overlay(page, 'global-menu').count()) await page.keyboard.press('Escape');
      await expect(overlay(page, 'global-menu')).toHaveCount(0);
    }
  });

  test('U7 · keyboard: Tab reaches each control with a visible focus ring; Enter and Space activate; disabled art never shows', async ({ page }) => {
    await openParent(page);
    await live(page, 'f05m-search').focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(live(page, 'f05m-search')).toBeFocused();
    // the parent chips keep their approved gold focus ring (5 board px, scaled with the board)
    const ring = await live(page, 'f05m-search').evaluate((e) => ({ fv: e.matches(':focus-visible'), style: getComputedStyle(e).outlineStyle, width: getComputedStyle(e).outlineWidth }));
    expect(ring).toEqual({ fv: true, style: 'solid', width: '5px' });
    await page.keyboard.press('Enter');
    await expect(overlay(page, 'global-search')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(overlay(page, 'global-search')).toHaveCount(0);
    await expect(live(page, 'f05m-search')).toBeFocused();
    await live(page, 'f05m-actions').focus();
    await page.keyboard.press('Space');
    await expect(overlay(page, 'f05m-actions-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(overlay(page, 'f05m-actions-sheet')).toHaveCount(0);
    await live(page, 'f09-menu').focus();
    const menuRing = await live(page, 'f09-menu').evaluate((e) => ({ style: getComputedStyle(e).outlineStyle, width: parseFloat(getComputedStyle(e).outlineWidth) }));
    expect(menuRing.style).toBe('solid');
    expect(menuRing.width).toBeGreaterThanOrEqual(2);
    await page.keyboard.press('Enter');
    await expect(overlay(page, 'global-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(live(page, 'f09-menu')).toBeFocused();
    // none of the live controls is disabled (the disabled dim applies only to a disabled button)
    for (const id of HEADER) await expect(live(page, id)).toBeEnabled();
  });

  test('U8 · press: a small compression while held, a settle on release; nothing animates while idle', async ({ page }) => {
    await openParent(page);
    await settled(page);
    const art = live(page, 'f05m-search').locator('img.jrn-uab__art');
    const scale = () => art.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
    expect(await scale()).toBeCloseTo(1, 3);
    expect(await art.evaluate((e) => e.getAnimations().length), 'no idle animation on the artwork').toBe(0);
    const b = (await live(page, 'f05m-search').boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await expect.poll(scale, { timeout: 2_000 }).toBeCloseTo(0.955, 3);
    await page.mouse.move(b.x - 60, b.y + b.height + 60); // slide off: nothing opens
    await page.mouse.up();
    await expect.poll(scale, { timeout: 2_000 }).toBeCloseTo(1, 3);
    await expect(overlay(page, 'global-search')).toHaveCount(0);
  });

  test('U9 · other hubs keep their own hamburger: one control, the line glyph, no MENU artwork after leaving MONEY', async ({ page }) => {
    await openParent(page);
    await expect(live(page, 'f09-menu').locator('img[data-asset-id="F05.UTILITY.MENU.GOLD"]')).toHaveCount(1);
    await clickTrigger(page, 'nav-home');
    await expect(page.locator('[data-jrn-f05-stage]')).toHaveCount(0);
    await expect(live(page, 'f09-menu')).toHaveCount(1);
    await expect(live(page, 'f09-menu').locator('img')).toHaveCount(0);
    await expect(live(page, 'f09-menu').locator('svg')).toHaveCount(1);
    await expect(page.locator('img[data-asset-id^="F05.UTILITY."]')).toHaveCount(0);
  });
});

test.describe('OPUS1 · reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('R1 · under reduced motion a press does not move the artwork; the controls still work', async ({ page }) => {
    await openParent(page);
    const art = live(page, 'f05m-actions').locator('img.jrn-uab__art');
    expect(await art.evaluate((e) => getComputedStyle(e).transitionDuration)).toBe('0s');
    const b = (await live(page, 'f05m-actions').boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(250);
    expect(await art.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a)).toBeCloseTo(1, 3);
    await page.mouse.up();
    await expect(overlay(page, 'f05m-actions-sheet')).toBeVisible();
  });
});

test.describe('OPUS1 · responsive', () => {
  for (const vp of [{ width: 360, height: 640 }, { width: 393, height: 660 }, { width: 393, height: 852 }, { width: 430, height: 932 }, { width: 820, height: 1180 }, { width: 1440, height: 900 }]) {
    test(`V · ${vp.width}×${vp.height}: the three controls on screen, loaded, one disc size, no overlap, no page scroll`, async ({ page }) => {
      await page.setViewportSize(vp);
      await openParent(page);
      await settled(page);
      const f = await Promise.all(HEADER.map((id) => facts(page, id)));
      f.forEach((x, i) => {
        expectArt(x, HEADER[i]!, ART[HEADER[i]!]!);
        expect(x.inViewport, `${HEADER[i]} on screen`).toBe(true);
        expect(x.disc!.d, `${HEADER[i]} visible disc`).toBeGreaterThan(20);
      });
      for (let i = 1; i < 3; i++) {
        expect(Math.abs(f[i]!.disc!.d - f[0]!.disc!.d)).toBeLessThan(0.75);
        expect(f[i]!.disc!.cx - f[i]!.disc!.d / 2, 'discs do not overlap').toBeGreaterThan(f[i - 1]!.disc!.cx + f[i - 1]!.disc!.d / 2);
      }
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
      // SEARCH opened on this size: its close is on screen, a full target, and the page still does not scroll
      await clickTrigger(page, 'f05m-search');
      await expect(overlay(page, 'global-search')).toBeVisible();
      await settled(page);
      const c = await facts(page, 'global-search-close');
      expect(c.inViewport).toBe(true);
      expect(c.target.w).toBeGreaterThanOrEqual(44);
      expect(c.target.h).toBeGreaterThanOrEqual(44);
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
    });
  }

  for (const vp of [{ width: 820, height: 1180 }, { width: 834, height: 1194 }]) {
    test(`T · ${vp.width}×${vp.height}: with the menu open its CLOSE is the one target where the hamburger sits; MENU returns on close`, async ({ page }) => {
      await page.setViewportSize(vp);
      await openParent(page);
      await clickTrigger(page, 'f09-menu');
      await expect(overlay(page, 'global-menu')).toBeVisible();
      await settled(page);
      const c = await facts(page, 'global-menu-close');
      expect(c.target.w).toBeGreaterThanOrEqual(44);
      expect(c.target.h).toBeGreaterThanOrEqual(44);
      const menuVis = await live(page, 'f09-menu').evaluate((e) => getComputedStyle(e).visibility);
      const overlaps = await page.evaluate(() => {
        const a = document.querySelector('.jrn-corner [data-jrn-trigger="f09-menu"]')!.getBoundingClientRect();
        const b = document.querySelector('[data-jrn-overlay="global-menu"] [data-jrn-trigger="global-menu-close"]')!.getBoundingClientRect();
        return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      });
      // the hamburger steps aside only when the two would overlap; either way the close is never covered
      expect(menuVis).toBe(overlaps ? 'hidden' : 'visible');
      await clickTrigger(page, 'global-menu-close');
      await expect(overlay(page, 'global-menu')).toHaveCount(0);
      await expect(live(page, 'f09-menu')).toBeVisible();
      await expect(live(page, 'f09-menu')).toBeFocused();
    });
  }
});
