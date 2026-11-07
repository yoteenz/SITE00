/**
 * P0.JURNL.F05-MONEY.INTELLIGENT-IMMERSIVE-MOTION-SYSTEM-AND-LIVING-ENVIRONMENT.CONVERGENCE.OPUS4 — the motion language in the
 * browser, on real (synthetic) records:
 *   · AMBIENT: nothing during the entrance; then at most two channels, only on the independent ambient layers (light over
 *     the scenery, a sheen masked to the wax seal), compositor-only; paused by touch, typing, overlays, navigation and a
 *     hidden page, and resumed after a quiet period; never under reduced motion
 *   · SWIPE: progress follows the finger, a cancel settles back, a commit continues at the finger's speed, and no unrelated
 *     entrance plays after it; rapid taps never stack changes
 *   · OVERLAYS: one entrance each; a shorter inert exit copy that carries no ids, triggers or roles and is always removed;
 *     a replaced overlay leaves no copy; focus returns
 *   · FINANCIAL FEEDBACK: motion follows the stored state only (BUFFER, PRIVACY, a transfer's recorded state, a blocked
 *     delete); nothing on open, nothing for a state that has not finished
 */
import { expect, test, type Page } from '@playwright/test';
import { dot01World } from './helpers/jurnl-dot01-world';
import { f05World } from './helpers/jurnl-f05-world';
import { bootstrapJurnl, clickTrigger, gotoJurnl, storedSnapshot, trigger } from './helpers/jurnl-page';

const QUIET_ENTRANCE = 1400;
const QUIET_INTERACTION = 900;

async function openParent(page: Page, world: unknown = f05World('approved'), route = 'money?parent=motion') {
  await page.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(page, world as Parameters<typeof bootstrapJurnl>[1]);
  await gotoJurnl(page, route);
  await page.locator('[data-jrn-f05-stage], [data-jrn-f05-dot01-stage]').first().waitFor({ state: 'attached', timeout: 30_000 });
}
const motion = (page: Page) =>
  page.evaluate(() => {
    const r = document.querySelector('.jrn') as HTMLElement;
    return { mode: r.dataset.jrnMotionMode, phase: r.dataset.jrnMotionPhase, ambient: r.dataset.jrnAmbient };
  });
/** Running animations, split into the OPUS4 ambient loops and everything else. */
const running = (page: Page) =>
  page.evaluate(() => {
    const all = document.getAnimations().filter((a) => a.playState === 'running');
    const amb = all.filter((a) => String((a as CSSAnimation).animationName ?? '').startsWith('jm-amb-'));
    const target = (a: Animation) => (a.effect as KeyframeEffect).target as Element;
    return {
      ambient: amb.map((a) => (a as CSSAnimation).animationName).sort(),
      ambientTargets: amb.map((a) => (target(a).matches('.jma-light') ? 'light' : target(a).matches('.jma-sheen > i') ? 'sheen' : `OTHER:${target(a).className}`)).sort(),
      ambientProps: [...new Set(amb.flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k).filter((p) => !['offset', 'easing', 'composite', 'computedOffset'].includes(p)))))].sort(),
      ambientInfinite: amb.every((a) => a.effect?.getComputedTiming().iterations === Infinity),
      other: all.filter((a) => !amb.includes(a)).map((a) => (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? 'waapi'),
    };
  });
const ghosts = (page: Page) => page.evaluate(() => document.querySelectorAll('.jm-ghost').length);
const pageScroll = (page: Page) => page.evaluate(() => ({ y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 }));
/** Records every CSS animation that starts from now on (name and the class of its element). */
const recordStarts = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __starts: string[] };
    w.__starts = [];
    document.addEventListener('animationstart', (e) => w.__starts.push(`${e.animationName}@${(e.target as Element).getAttribute('class')?.split(' ')[0] ?? ''}`), true);
  });
const starts = (page: Page) => page.evaluate(() => (window as unknown as { __starts: string[] }).__starts);
async function waitForAmbient(page: Page, want = 'D C') {
  await expect.poll(async () => (await motion(page)).ambient, { timeout: 6_000 }).toBe(want);
}
async function swipe(page: Page, dx: number, slow = false) {
  const box = (await page.locator('.jrn-f05m__swipe').boundingBox())!;
  const x0 = box.x + box.width / 2;
  const y0 = box.y + box.height * 0.46;
  const steps = 10;
  if (test.info().project.use.hasTouch) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
    for (let i = 1; i <= steps; i += 1) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (dx * i) / steps, y: y0 }] });
      if (slow) await page.waitForTimeout(40);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  } else {
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (let i = 1; i <= steps; i += 1) {
      await page.mouse.move(x0 + (dx * i) / steps, y0);
      if (slow) await page.waitForTimeout(40);
    }
    await page.mouse.up();
  }
}
const activeCollection = (page: Page) => page.locator('.jrn-f05m__carousel').getAttribute('data-active');

test.describe('OPUS4 · AMBIENT on the MONEY parent', () => {
  test('A1 · nothing during the entrance; then light and the seal sheen only, compositor-only, infinite but mostly still', async ({ page }) => {
    await openParent(page);
    expect((await motion(page)).ambient).toBe('off');
    expect((await running(page)).ambient).toEqual([]);
    await waitForAmbient(page);
    const r = await running(page);
    expect(r.ambient).toEqual(['jm-amb-light', 'jm-amb-sheen']);
    expect(r.ambientTargets).toEqual(['light', 'sheen']);
    expect(r.ambientProps.every((p) => p === 'opacity' || p === 'transform')).toBe(true);
    expect(r.ambientInfinite).toBe(true);
    expect(r.other).toEqual([]); // nothing else moves while the scene is at rest
    expect(await motion(page)).toEqual({ mode: 'FULL', phase: 'AMBIENT', ambient: 'D C' });
    // the layers never take a tap and sit inside the board
    const hit = await page.evaluate(() => [...document.querySelectorAll('.jma-light, .jma-sheen')].map((e) => getComputedStyle(e).pointerEvents));
    expect(hit).toEqual(['none', 'none']);
    // the seal itself and the scenery do not move: no animation on the SIDEKICK, the seal or the title paper
    const still = await page.evaluate(() => document.querySelectorAll('.jrn-f05m__env, .jrn-f05m__seal, .jrn-f05m__title-paper').length && [...document.querySelectorAll('.jrn-f05m__env, .jrn-f05m__seal, .jrn-f05m__title-paper')].every((e) => e.getAnimations().length === 0));
    expect(still).toBe(true);
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
  });

  test('A2 · a touch pauses it at once and it returns after a quiet period; an overlay and typing pause it until they end', async ({ page }) => {
    await openParent(page);
    await waitForAmbient(page);
    // touch (pointer held on the papers' region)
    const box = (await page.locator('.jrn-f05m__swipe').boundingBox())!;
    await page.mouse.move(box.x + 8, box.y + 8);
    await page.mouse.down();
    expect(await motion(page)).toMatchObject({ phase: 'INTERACTING', ambient: 'off' });
    expect((await running(page)).ambient).toEqual([]);
    await page.mouse.up();
    expect((await motion(page)).ambient).toBe('off');
    await waitForAmbient(page);
    // an overlay
    await clickTrigger(page, 'f05m-search');
    await expect(page.locator('[data-jrn-overlay="global-search"]')).toBeVisible();
    await page.waitForTimeout(QUIET_INTERACTION + 300);
    expect((await motion(page)).ambient).toBe('off');
    // typing inside it
    await trigger(page, 'search-input').fill('BANK');
    expect((await motion(page)).phase).toBe('INTERACTING');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-jrn-overlay="global-search"]')).toHaveCount(0);
    expect((await motion(page)).ambient).toBe('off');
    await waitForAmbient(page);
    expect(await ghosts(page)).toBe(0);
  });

  test('A3 · a hidden page is SUSPENDED (no ambience, no running response) and the scene resumes after it is visible again', async ({ page }) => {
    await openParent(page);
    await waitForAmbient(page);
    const setHidden = (hidden: boolean) =>
      page.evaluate((h) => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
        document.dispatchEvent(new Event('visibilitychange'));
      }, hidden);
    await setHidden(true);
    expect(await motion(page)).toMatchObject({ phase: 'SUSPENDED', ambient: 'off' });
    expect((await running(page)).ambient).toEqual([]);
    await setHidden(false);
    expect((await motion(page)).ambient).toBe('off');
    await waitForAmbient(page);
  });

  test('A4 · navigation pauses it: a collection change is NAVIGATING, and the light returns only once the new papers have landed', async ({ page }) => {
    await openParent(page, f05World('carousel'));
    await waitForAmbient(page);
    await page.evaluate(() => (document.querySelector('[data-jrn-trigger="f05m-dot-transfers"]') as HTMLElement).click());
    expect(await motion(page)).toMatchObject({ phase: 'NAVIGATING', ambient: 'off' });
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
    expect((await motion(page)).ambient).toBe('off');
    await waitForAmbient(page);
  });

  test('A5 · a constrained device (data saver) is SUBTLE: one channel only, the light', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, get: () => ({ saveData: true }) }));
    await openParent(page);
    await waitForAmbient(page, 'D');
    expect(await motion(page)).toMatchObject({ mode: 'SUBTLE', ambient: 'D' });
    expect((await running(page)).ambient).toEqual(['jm-amb-light']);
  });
});

test.describe('OPUS4 · SWIPE CONTRACT on the MONEY carousel', () => {
  test('W1 · a short drag follows the finger and settles back (time follows the distance); nothing commits, nothing re-enters', async ({ page }) => {
    await openParent(page, f05World('carousel'));
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
    const before = await activeCollection(page);
    await recordStarts(page);
    await swipe(page, -40, true);
    const c = page.locator('.jrn-f05m__collection');
    await expect(c).toHaveAttribute('data-settling', 'true');
    const ms = await c.evaluate((e) => parseFloat((e as HTMLElement).style.getPropertyValue('--f05m-settle-ms')));
    expect(ms).toBeGreaterThanOrEqual(140);
    expect(ms).toBeLessThanOrEqual(280);
    await expect.poll(() => c.evaluate((e) => getComputedStyle(e).transform)).toBe('none');
    expect(await activeCollection(page)).toBe(before);
    expect(await starts(page)).toEqual([]); // no entrance replays after a cancelled drag
  });

  test('W2 · a committed swipe continues in the finger direction at the finger speed, and only the papers move', async ({ page }) => {
    await openParent(page, f05World('carousel'));
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
    expect(await activeCollection(page)).toBe('accounts');
    await recordStarts(page);
    await swipe(page, -170);
    const exit = page.locator('.jrn-f05m__collection[data-phase="exit"]');
    await expect(exit).toHaveAttribute('data-dir', 'next');
    const exitMs = await exit.evaluate((e) => parseFloat((e as HTMLElement).style.getPropertyValue('--f05m-exit-ms')));
    expect(exitMs).toBeGreaterThanOrEqual(180);
    expect(exitMs).toBeLessThanOrEqual(300);
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
    expect(await activeCollection(page)).toBe('transfers');
    const names = (await starts(page)).map((s) => s.split('@')[0]);
    // only the collection change itself: no page / shell / paper-arrival entrance after a swipe
    for (const n of names) expect(['f05m-out-next', 'f05m-in-next', 'f05m-ghost', 'f05m-fade', 'f05m-token'], n).toContain(n);
    expect(names.filter((n) => n === 'f05m-in-next').length).toBe(4);
    // right swipe back goes the other way
    await recordStarts(page);
    await swipe(page, 170);
    await expect(page.locator('.jrn-f05m__collection[data-phase="exit"]')).toHaveAttribute('data-dir', 'prev');
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
    expect(await activeCollection(page)).toBe('accounts');
    expect((await starts(page)).map((s) => s.split('@')[0]).every((n) => /^f05m-(out-prev|in-prev|ghost|fade|token)$/.test(n))).toBe(true);
  });

  test('W3 · rapid taps never stack changes: one exit group at most, and it lands on the last collection asked for', async ({ page }) => {
    await openParent(page, f05World('carousel'));
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
    for (let i = 0; i < 3; i += 1) await page.evaluate(() => (document.querySelector('[data-jrn-trigger="f05m-next"]') as HTMLElement).click());
    expect(await page.locator('.jrn-f05m__collection[data-phase="exit"]').count()).toBeLessThanOrEqual(1);
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
    expect(await activeCollection(page)).toBe('outlook');
    await expect(page.locator('.jrn-f05m__collection')).toHaveCount(1);
    await expect(page.locator('.jrn-f05m__collection')).toHaveAttribute('data-phase', 'idle');
    // no held transforms anywhere on the papers
    const held = await page.evaluate(() => [...document.querySelectorAll('.jrn-f05m__collection, .jrn-f05m__paper')].filter((e) => getComputedStyle(e).transform !== 'none').length);
    expect(held).toBe(0);
  });

  test('W4 · a just-added pocket settles once; a later collection change never replays it', async ({ page }) => {
    await openParent(page);
    await clickTrigger(page, 'f05m-actions');
    await clickTrigger(page, 'f05m-actions-add');
    await trigger(page, 'money-add-name').first().fill('TRAVEL FUND');
    await clickTrigger(page, 'money-add-kind-savings');
    await trigger(page, 'money-add-balance').first().fill('125.40');
    await clickTrigger(page, 'money-add-save');
    await expect(trigger(page, 'f05m-added')).toBeVisible();
    const added = page.locator('[data-account-id]').filter({ hasText: 'TRAVEL' });
    await expect(added).toHaveAttribute('data-fresh', 'true');
    await expect(added).not.toHaveAttribute('data-settle', 'true', { timeout: 3_000 });
    await recordStarts(page);
    await page.evaluate(() => (document.querySelector('[data-jrn-trigger="f05m-dot-transfers"]') as HTMLElement).click());
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
    await page.evaluate(() => (document.querySelector('[data-jrn-trigger="f05m-dot-accounts"]') as HTMLElement).click());
    await expect(page.locator('.jrn-f05m__carousel')).toHaveAttribute('data-moving', 'false');
    expect((await starts(page)).filter((s) => s.startsWith('f05m-return'))).toEqual([]);
  });
});

test.describe('OPUS4 · OVERLAYS', () => {
  test('O1 · each overlay enters once; it closes with a shorter inert copy that carries no ids, triggers or roles and is removed', async ({ page }) => {
    await openParent(page);
    for (const [open, id, plate] of [
      ['f09-menu', 'global-menu', '.jgm-plate'],
      ['f05m-search', 'global-search', '.jsh-plate'],
      ['f05m-move', 'transfer-sheet', '.jed-folio'],
    ] as const) {
      await clickTrigger(page, open);
      await expect(page.locator(`[data-jrn-overlay="${id}"]`)).toBeVisible();
      const enter = await page.locator(`[data-jrn-overlay="${id}"] ${plate}`).evaluate((e) => e.getAnimations().map((a) => ({ name: (a as CSSAnimation).animationName, ms: Number(a.effect?.getComputedTiming().duration) })));
      expect(enter, id).toEqual([{ name: 'jm-ovl-in', ms: 420 }]);
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await expect(page.locator(`[data-jrn-overlay="${id}"]`)).toHaveCount(0);
      const g = await page.evaluate(() => {
        const el = document.querySelector('.jm-ghost');
        if (!el) return null;
        const all = [el, ...el.querySelectorAll('*')];
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return {
          inert: el.hasAttribute('inert') && el.getAttribute('aria-hidden') === 'true',
          ids: all.filter((e) => e.hasAttribute('id') || e.hasAttribute('data-testid') || e.hasAttribute('data-jrn-trigger') || e.hasAttribute('data-jrn-overlay') || e.hasAttribute('role') || e.hasAttribute('data-asset-id')).length,
          takesTap: !!hit && el.contains(hit),
          anims: el.getAnimations({ subtree: true }).map((a) => ({ css: (a as CSSAnimation).animationName ?? null, ms: Number(a.effect?.getComputedTiming().duration) })),
        };
      });
      expect(g, `${id} closing copy`).toEqual({ inert: true, ids: 0, takesTap: false, anims: [{ css: null, ms: 220 }] });
      await expect.poll(() => ghosts(page)).toBe(0);
      await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-jrn-trigger'))).toBe(open);
    }
    expect(await pageScroll(page)).toEqual({ y: false, x: false });
  });

  test('O2 · a menu destination replaces the menu with no copy (the two never compete); BACK returns with no copy either', async ({ page }) => {
    await openParent(page);
    await clickTrigger(page, 'f09-menu');
    await expect(page.locator('[data-jrn-overlay="global-menu"]')).toBeVisible();
    await clickTrigger(page, 'menu-buffer');
    await expect(page.locator('[data-jrn-overlay="global-buffer"]')).toBeVisible();
    expect(await ghosts(page)).toBe(0);
    await clickTrigger(page, 'buffer-back');
    await expect(page.locator('[data-jrn-overlay="global-menu"]')).toBeVisible();
    expect(await ghosts(page)).toBe(0);
  });

  test('O3 · an open / close race leaves nothing behind: no copy, no overlay count, and the ambience comes back', async ({ page }) => {
    await openParent(page);
    for (let i = 0; i < 5; i += 1) {
      await clickTrigger(page, 'f09-menu');
      await page.keyboard.press('Escape');
    }
    await expect(page.locator('[data-jrn-overlay="global-menu"]')).toHaveCount(0);
    await expect.poll(() => ghosts(page)).toBe(0);
    await waitForAmbient(page);
  });

  test('O4 · MANAGE POCKET: the note lifts from its pocket, holds the ambience, closes with its copy; RENAME replaces it with no copy', async ({ page }) => {
    await openParent(page, dot01World(), 'money/places/bank');
    await clickTrigger(page, 'd01-manage');
    const menu = page.getByTestId('d01-pocket-menu');
    await expect(menu).toBeVisible();
    expect(await menu.evaluate((e) => e.getAnimations().map((a) => (a as CSSAnimation).animationName))).toEqual([expect.stringMatching(/^jm-note-in(-up)?$/)]);
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect.poll(() => ghosts(page)).toBe(1);
    await expect.poll(() => ghosts(page)).toBe(0);
    await clickTrigger(page, 'd01-manage');
    await clickTrigger(page, 'd01-pocket-rename');
    await expect(page.locator('[data-jrn-overlay="d01-rename-pocket"]')).toBeVisible();
    await page.waitForTimeout(60);
    expect(await ghosts(page)).toBe(0);
  });
});

test.describe('OPUS4 · FINANCIAL FEEDBACK follows the stored state', () => {
  const rates = (page: Page) =>
    page.route('https://open.er-api.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92 } }) }));
  const waapi = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => e.getAnimations().filter((a) => !(a as CSSAnimation).animationName && !(a as CSSTransition).transitionProperty).map((a) => (a.effect as KeyframeEffect).getKeyframes().map((k) => k.transform ?? k.opacity)));

  test('F1 · BUFFER: nothing on open; a saved new amount settles the effect paper once (CONFIRMED); a refused save nudges the amount paper', async ({ page }) => {
    await rates(page);
    await openParent(page);
    await clickTrigger(page, 'f09-menu');
    await clickTrigger(page, 'menu-buffer');
    const host = page.locator('[data-jrn-overlay="global-buffer"]');
    await expect(host).toBeVisible();
    expect(await waapi(page, '[data-testid="buffer-effect-paper"]')).toEqual([]);
    await trigger(page, 'buffer-input').fill('250');
    await clickTrigger(page, 'buffer-save');
    await expect(page.getByTestId('buffer-status')).toHaveText('SAVED');
    const settle = await waapi(page, '[data-testid="buffer-effect-paper"]');
    expect(settle).toEqual([['translateY(0px)', 'translateY(-3px)', 'translateY(0px)']]);
    expect((await motion(page)).phase).toBe('CONFIRMED');
    // the figure itself never moves
    expect(await page.getByTestId('buffer-usd').evaluate((e) => e.getAnimations().length)).toBe(0);
    // saving the same amount again changes nothing stored: no response
    await page.waitForTimeout(500);
    await clickTrigger(page, 'buffer-save');
    expect(await waapi(page, '[data-testid="buffer-effect-paper"]')).toEqual([]);
    // a refused save (not a number) nudges the amount paper and stores nothing
    const stored = JSON.stringify(((await storedSnapshot(page)) as unknown as { settings: unknown }).settings);
    await trigger(page, 'buffer-input').fill('1.2.3');
    await clickTrigger(page, 'buffer-save');
    await expect(host.getByRole('alert')).toBeVisible();
    expect((await waapi(page, '[data-testid="buffer-amount-paper"]'))[0]?.[1]).toBe('translateX(-3px)');
    expect(JSON.stringify(((await storedSnapshot(page)) as unknown as { settings: unknown }).settings)).toBe(stored);
  });

  test('F2 · PRIVACY: nothing on open; a stored consent change warms only its own row once; OFF stays OFF', async ({ page }) => {
    await rates(page);
    await openParent(page);
    await clickTrigger(page, 'f09-menu');
    await clickTrigger(page, 'menu-privacy');
    await expect(page.locator('[data-jrn-overlay="settings-consents-sheet"]')).toBeVisible();
    const acks = () => page.evaluate(() => [...document.querySelectorAll('.jce-ack')].map((e) => e.getAnimations().length));
    expect(await acks()).toEqual([0, 0]);
    await clickTrigger(page, 'privacy-ask-context');
    await expect(trigger(page, 'privacy-ask-context')).toHaveAttribute('aria-checked', 'true');
    expect(await acks()).toEqual([0, 1]);
    await page.waitForTimeout(700);
    await clickTrigger(page, 'privacy-ask-context');
    await expect(trigger(page, 'privacy-ask-context')).toHaveAttribute('aria-checked', 'false');
    expect(await acks()).toEqual([0, 1]);
    await page.waitForTimeout(800);
    await expect(trigger(page, 'privacy-ask-context')).toHaveAttribute('aria-checked', 'false');
  });

  test('F3 · a transfer: recorded / in transit never animate; ARRIVED settles the status line once, after the record says so', async ({ page }) => {
    await openParent(page);
    await clickTrigger(page, 'f05m-actions');
    await clickTrigger(page, 'f05m-actions-move');
    await clickTrigger(page, 'transfer-from-ride');
    await clickTrigger(page, 'transfer-to-bank');
    await trigger(page, 'transfer-amount').first().fill('80');
    await clickTrigger(page, 'transfer-status-in-transit');
    await clickTrigger(page, 'transfer-save');
    await expect(page.locator('[data-jrn-overlay="transfer-sheet"]')).toHaveCount(0);
    // the source's stored balance went down (it left): one opacity wash on that paper only; the figure never moves
    const washes = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-account-id]')].map((p) => [p.getAttribute('data-account-id'), p.querySelector('.jrn-f05m__paper-ack')?.getAnimations().length ?? 0])));
    expect(await washes()).toMatchObject({ ride: 1, bank: 0 });
    expect(await page.locator('[data-account-id="ride"] .jrn-f05m__paper-amount').evaluate((e) => e.getAnimations().length)).toBe(0);
    await page.locator('.jrn-f05m__token:not(.jrn-f05m__token--ghost)').first().click();
    const status = page.getByTestId('transfer-detail-status');
    await expect(status).toContainText('IN TRANSIT');
    expect(await waapi(page, '[data-testid="transfer-detail-status"]')).toEqual([]);
    await clickTrigger(page, 'transfer-step-received');
    await expect(status).not.toContainText('IN TRANSIT');
    expect(await waapi(page, '[data-testid="transfer-detail-status"]')).toEqual([['translateY(0px)', 'translateY(-3px)', 'translateY(0px)']]);
    // the figures in the sheet never move
    expect(await page.getByTestId('transfer-detail-facts').locator('b').evaluateAll((els) => els.slice(1).some((e) => e.getAnimations().length > 0))).toBe(false);
  });

  test('F4 · a blocked delete answers deliberately: the bronze warning seal settles once, slowly, and nothing loops', async ({ page }) => {
    await openParent(page, dot01World(), 'money/places/bank');
    await clickTrigger(page, 'd01-manage');
    await clickTrigger(page, 'd01-pocket-delete');
    const d = page.locator('[data-jrn-overlay="d01-delete-blocked"]');
    await expect(d).toBeVisible();
    const seal = await d.locator('.jv3-caution__head > .jv3-seal').evaluate((e) => e.getAnimations().map((a) => ({ name: (a as CSSAnimation).animationName, ms: Number(a.effect?.getComputedTiming().duration), it: a.effect?.getComputedTiming().iterations })));
    expect(seal).toEqual([{ name: 'jm-warn-seal', ms: 620, it: 1 }]);
    expect(await d.getByRole('alert').evaluate((e) => [...e.querySelectorAll('h3, p')].every((t) => t.getAnimations().length === 0))).toBe(true);
  });

  test('F5 · DOT 01: the account page never takes the family fade on top of its own entrance', async ({ page }) => {
    await openParent(page);
    await page.locator('[data-account-id="cash"]').click();
    await expect(page.locator('[data-jrn-screen="F05.ACCOUNT"] h1')).toHaveText('CASH ON HAND');
    expect(new URL(page.url()).pathname).toMatch(/\/money\/places\/cash$/);
    const screenAnims = await page.evaluate(() => [...document.querySelectorAll('.jrn-screen')].flatMap((e) => e.getAnimations().map((a) => (a as CSSAnimation).animationName)));
    expect(screenAnims.filter((n) => n === 'jrn-family' || n === 'jrn-enter')).toEqual([]);
  });
});

test.describe('OPUS4 · REDUCED MOTION', () => {
  test.use({ reducedMotion: 'reduce' });
  test('R1 · OFF: no ambience ever, no entrance, no closing copy, no response — and every action still works', async ({ page }) => {
    await openParent(page);
    await page.waitForTimeout(QUIET_ENTRANCE + 600);
    expect(await motion(page)).toMatchObject({ mode: 'OFF', ambient: 'off' });
    expect(await running(page)).toMatchObject({ ambient: [], other: [] });
    await clickTrigger(page, 'f09-menu');
    await expect(page.locator('[data-jrn-overlay="global-menu"]')).toBeVisible();
    expect(await page.locator('.jgm-plate').evaluate((e) => e.getAnimations().length)).toBe(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-jrn-overlay="global-menu"]')).toHaveCount(0);
    expect(await ghosts(page)).toBe(0);
    await swipe(page, -170);
    await expect.poll(() => activeCollection(page)).toBe('transfers');
    expect((await running(page)).other.filter((n) => /^f05m-|^jm-/.test(n))).toEqual([]);
  });
});

test.describe('OPUS4 · RESPONSIVE', () => {
  for (const vp of [
    { width: 360, height: 640 },
    { width: 393, height: 660 },
    { width: 393, height: 852 },
    { width: 430, height: 932 },
    { width: 820, height: 1180 },
    { width: 1440, height: 900 },
  ]) {
    test(`V · ${vp.width}×${vp.height}: the ambient layers sit on the scenery and the seal, inside the board; no page scroll`, async ({ page }) => {
      test.skip(test.info().project.name !== 'mobile', 'one project sweeps the viewports');
      await page.setViewportSize(vp);
      await openParent(page);
      await waitForAmbient(page);
      const g = await page.evaluate(() => {
        const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        const seal = r('.jrn-f05m__seal');
        const sheen = r('.jma-sheen');
        const light = r('.jma-light');
        const board = r('.jrn-f05m__board');
        return {
          sheenOnSeal: Math.abs(seal.x - sheen.x) < 1 && Math.abs(seal.y - sheen.y) < 1 && Math.abs(seal.width - sheen.width) < 1,
          lightInBoard: light.x >= board.x - 1 && light.right <= board.right + 1 && light.y >= board.y - 1,
          lightTopRight: light.x > board.x + board.width / 2,
        };
      });
      expect(g).toEqual({ sheenOnSeal: true, lightInBoard: true, lightTopRight: true });
      expect(await pageScroll(page)).toEqual({ y: false, x: false });
    });
  }
});
