/* OPUS4 runtime motion recordings (P0.JURNL.F05-MONEY.INTELLIGENT-IMMERSIVE-MOTION-SYSTEM-AND-LIVING-ENVIRONMENT.CONVERGENCE).
 * Real browser sessions on the runtime with synthetic worlds; every recording starts after the page entrance and shows real
 * interactions: P01 MONEY parent (idle ambient, touch interruption and recovery, swipes, a cancelled drag, opening a pocket),
 * P02 ADD / MANAGE POCKET, P02B DELETE BLOCKED, P03 MOVE MONEY and transfer states, P04 GLOBAL MENU (Buffer, Privacy, Search),
 * P05 the same financial feedback under reduced motion.
 * Each recording writes: <id>.webm (the browser's own video), <id>.timeline.json (the director's phase / ambient changes,
 * every CSS animation start and every one-shot response, with the step labels), and a still at each step (<id>-NN-step.png).
 * A small grey dot marks the recording's touches; it is evidence tooling injected here, not part of JURNL.
 * Exchange rates are route-stubbed (no live provider). Run: npx tsx scripts/jurnl/motion/record_opus4.ts <out> [ONLY=P01,P03] */
import { chromium, type BrowserContext, type Page } from 'playwright';
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { dot01World, purchase } from '../../../e2e/jurnl/helpers/jurnl-dot01-world';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';

const OUT = process.argv[2]!;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);
const VP = { width: 393, height: 852 };
const T = (id: string) => `[data-jrn-trigger="${id}"]`;

function deletableWorld() {
  const w = f05World('many');
  const now = new Date().toISOString();
  const accounts = w.snapshot.accounts.map((a) => (a.account_id === 'long' ? { ...a, balance: 18.5, available_balance: 18.5 } : a));
  const long = accounts.find((a) => a.account_id === 'long')!;
  return { ...w, snapshot: { ...w.snapshot, accounts, transactions: [purchase('tx-long-books', long, 'BOOKSHOP', 12.5, 'SHOPPING', 2, now)] } };
}

/** Timeline + touch indicator, installed before any page script. Plain JavaScript text: a function passed from tsx would
 * carry its compiler helpers (`__name`) into the page, where they do not exist. */
const INSTRUMENT = `(() => {
  const w = window;
  w.__tl = [];
  const t = () => Math.round(performance.now());
  w.__mark = (label) => w.__tl.push({ t: t(), step: label });
  let last = '';
  const watch = () => {
    const r = document.querySelector('.jrn');
    if (!r) return void setTimeout(watch, 50);
    const log = () => {
      const s = r.dataset.jrnMotionMode + '|' + r.dataset.jrnMotionPhase + '|' + r.dataset.jrnAmbient;
      if (s === last) return;
      last = s;
      w.__tl.push({ t: t(), mode: r.dataset.jrnMotionMode, phase: r.dataset.jrnMotionPhase, ambient: r.dataset.jrnAmbient });
    };
    log();
    new MutationObserver(log).observe(r, { attributes: true, attributeFilter: ['data-jrn-motion-mode', 'data-jrn-motion-phase', 'data-jrn-ambient'] });
  };
  watch();
  document.addEventListener('animationstart', (e) => w.__tl.push({ t: t(), css: e.animationName, on: ((e.target.getAttribute && e.target.getAttribute('class')) || '').split(' ')[0] }), true);
  const orig = Element.prototype.animate;
  Element.prototype.animate = function (kf, o) {
    const k = Array.isArray(kf) ? kf.map((f) => f.transform || f.opacity || '').join(' -> ') : '';
    w.__tl.push({ t: t(), waapi: k, ms: typeof o === 'object' ? o.duration : o, on: (this.getAttribute('class') || this.tagName.toLowerCase()).split(' ')[0] });
    return orig.call(this, kf, o);
  };
  const dot = () => {
    if (!document.body) return void setTimeout(dot, 30);
    const d = document.createElement('div');
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:fixed;z-index:2147483647;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:rgba(40,40,40,.32);border:2px solid rgba(255,255,255,.7);pointer-events:none;opacity:0;transition:opacity 120ms';
    document.body.appendChild(d);
    const at = (e) => { d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; };
    addEventListener('pointerdown', (e) => { at(e); d.style.opacity = '1'; }, true);
    addEventListener('pointermove', (e) => { if (d.style.opacity === '1') at(e); }, true);
    addEventListener('pointerup', () => (d.style.opacity = '0'), true);
    addEventListener('pointercancel', () => (d.style.opacity = '0'), true);
  };
  dot();
})();`;

type Rec = { id: string; title: string; world: () => unknown; route: string; reduced?: boolean; run: (r: Run) => Promise<void> };
type Run = { page: Page; goto: (route: string) => Promise<void>; step: (label: string, settleMs?: number) => Promise<void>; wait: (ms: number) => Promise<void>; tap: (sel: string) => Promise<void>; swipe: (dx: number, slow?: boolean) => Promise<void>; hold: (ms: number) => Promise<void> };

const RECS: Rec[] = [
  {
    id: 'P01_MONEY_PARENT',
    title: 'MONEY parent: idle ambience after the entrance, touch interruption and recovery, swipes, a cancelled drag, opening a pocket',
    world: () => f05World('carousel'),
    route: 'money?parent=motion',
    run: async ({ step, wait, swipe, hold, tap, page }) => {
      await step('arrived: the entrance plays, ambience stays off', 2600);
      await step('IDLE AMBIENT SEQUENCE: light over the scenery and the seal sheen (granted after the entrance)', 20000);
      await step('touch held on the papers: ambience pauses at once');
      await hold(1400);
      await step('released: a quiet period, then the ambience resumes', 3200);
      await step('swipe left: the papers follow the finger and the change completes at its speed');
      await swipe(-170);
      await wait(2200);
      await step('short drag released before the threshold: the papers settle back, nothing commits');
      await swipe(-45, true);
      await wait(1800);
      await step('swipe left again, then a dot: COMMITMENTS → OUTLOOK');
      await swipe(-170);
      await wait(1400);
      await tap(T('f05m-dot-outlook'));
      await wait(1600);
      await step('swipe right twice: the direction follows the finger');
      await swipe(170);
      await wait(1200);
      await swipe(170);
      await wait(1200);
      await tap(T('f05m-dot-accounts'));
      await wait(1800);
      await step('open a pocket: its paper carries into the account page (no family fade on top)');
      await page.locator('[data-account-id="cash"]').click();
      await wait(3200);
      await step('back to MONEY: the pocket returns to its place', 0);
      await page.goBack();
      await wait(3600);
      await step('at rest again: ambience returns after the quiet period', 9000);
    },
  },
  {
    id: 'P02_ADD_MANAGE_POCKET',
    title: 'ADD A POCKET (saved pocket settles once) and MANAGE POCKET from the directory (note lifts, closes with its copy, RENAME settles the paper, DELETE presses deliberately)',
    world: () => deletableWorld(),
    route: 'money?parent=motion',
    run: async (r0) => {
      const { step, wait, tap, page } = r0;
      await step('arrived', 2400);
      await step('ADD A POCKET opens as a paper over the page');
      await tap(T('f05m-actions'));
      await wait(700);
      await tap(T('f05m-actions-add'));
      await wait(900);
      await page.fill(`${T('money-add-name')} >> nth=0`, 'TRAVEL FUND');
      await tap(T('money-add-kind-savings'));
      await page.fill(`${T('money-add-balance')} >> nth=0`, '125.40');
      await wait(600);
      await step('saved: the sheet closes (shorter exit) and the new pocket settles once');
      await tap(T('money-add-save'));
      await wait(2600);
      await step('the pocket directory: press and hold a pocket — MANAGE POCKET presents the note from it', 0);
      await r0.goto('money/places');
      await wait(2600);
      const long = page.locator('[data-testid="d01-directory"] [data-account-id="long"]');
      await long.scrollIntoViewIfNeeded();
      await long.click({ button: 'right' });
      await wait(1100);
      await step('Escape: the note closes with its short copy; focus returns');
      await page.keyboard.press('Escape');
      await wait(1200);
      await step('RENAME: the cream paper presses; the rename overlay replaces the note (no copy)');
      await long.click({ button: 'right' });
      await wait(900);
      await tap(T('d01-pocket-rename'));
      await wait(1000);
      await page.fill(`${T('d01-pocket-name')} >> nth=0`, 'BOOK FUND');
      await wait(500);
      await step('saved: the renamed pocket paper settles once after the overlay copy has gone');
      await tap(T('d01-save-name'));
      await wait(2400);
      await step('DELETE: the blush paper presses deliberately; the confirmation opens; KEEP POCKET');
      await long.click({ button: 'right' });
      await wait(900);
      await tap(T('d01-pocket-delete'));
      await wait(1400);
      await tap(T('d01-keep-pocket'));
      await wait(1800);
    },
  },
  {
    id: 'P02B_DELETE_BLOCKED',
    title: 'DELETE BLOCKED: the bronze warning seal settles once, slowly; nothing celebrates or loops',
    world: () => dot01World(),
    route: 'money/places/bank',
    run: async ({ step, wait, tap }) => {
      await step('arrived on the bank pocket', 2600);
      await tap(T('d01-manage'));
      await wait(900);
      await step('DELETE on a pocket something depends on: the caution answers deliberately');
      await tap(T('d01-pocket-delete'));
      await wait(2600);
      await step('KEEP POCKET: the overlay closes with its copy');
      await tap(T('d01-keep-pocket'));
      await wait(2000);
    },
  },
  {
    id: 'P03_MOVE_MONEY',
    title: 'MOVE MONEY and transfer states: recorded in transit (no completion motion, the source paper washes once), ARRIVED settles, a failure settles calmly',
    world: () => f05World('approved'),
    route: 'money?parent=motion',
    run: async ({ step, wait, tap, page }) => {
      await step('arrived', 2400);
      await step('MOVE MONEY: the form is a paper over the page');
      await tap(T('f05m-actions'));
      await wait(700);
      await tap(T('f05m-actions-move'));
      await wait(900);
      await tap(T('transfer-from-ride'));
      await tap(T('transfer-to-bank'));
      await page.fill(`${T('transfer-amount')} >> nth=0`, '80');
      await tap(T('transfer-status-in-transit'));
      await wait(700);
      await step('RECORDED, IN TRANSIT: nothing completes; the source paper (its stored balance went down) washes once; the token rests between');
      await tap(T('transfer-save'));
      await wait(2800);
      await step('the transfer opens: in transit shows no motion and no invented progress');
      await page.locator('.jrn-f05m__token:not(.jrn-f05m__token--ghost)').first().click();
      await wait(1600);
      await step('ARRIVED (recorded step): the status settles once; the thread resolves into the destination');
      await tap(T('transfer-step-received'));
      await wait(1600);
      await page.keyboard.press('Escape');
      await wait(2000);
      await step('a second transfer, in transit, then FAILED and NOT BACK YET: a calm settle, no shake');
      await tap(T('f05m-actions'));
      await wait(600);
      await tap(T('f05m-actions-move'));
      await wait(800);
      await tap(T('transfer-from-ride'));
      await tap(T('transfer-to-bank'));
      await page.fill(`${T('transfer-amount')} >> nth=0`, '25');
      await tap(T('transfer-status-in-transit'));
      await tap(T('transfer-save'));
      await wait(1600);
      await page.locator('.jrn-f05m__token:not(.jrn-f05m__token--ghost)').first().click();
      await wait(1200);
      await tap(T('transfer-step-fail'));
      await wait(800);
      await tap(T('transfer-fail-not-returned'));
      await wait(1800);
      await page.keyboard.press('Escape');
      await wait(2200);
    },
  },
  {
    id: 'P04_GLOBAL_MENU',
    title: 'GLOBAL MENU: row response, SAFE TO SPEND BUFFER (saved settle, refused nudge), PRIVACY (consent acknowledged, OFF stays OFF), SEARCH while typing',
    world: () => f05World('approved'),
    route: 'money?parent=motion',
    run: async ({ step, wait, tap, page }) => {
      await step('arrived', 2400);
      await step('the menu enters as a paper over the page');
      await tap(T('f09-menu'));
      await wait(1200);
      await page.hover(T('menu-currency'));
      await wait(500);
      await page.hover(T('menu-buffer'));
      await wait(500);
      await step('SAFE TO SPEND BUFFER replaces the menu (no competing copy)');
      await tap(T('menu-buffer'));
      await wait(1200);
      await page.fill(T('buffer-input'), '250');
      await wait(400);
      await step('SAVE: the stored amount changed, the effect paper settles once');
      await tap(T('buffer-save'));
      await wait(1600);
      await step('a refused amount: the amount paper nudges once; nothing is stored');
      await page.fill(T('buffer-input'), '1.2.3');
      await tap(T('buffer-save'));
      await wait(1600);
      await tap(T('buffer-back'));
      await wait(1000);
      await step('PRIVACY & CONSENTS: a stored consent change warms its row once; turned back OFF it stays OFF');
      await page.locator(T('menu-privacy')).scrollIntoViewIfNeeded();
      await tap(T('menu-privacy'));
      await wait(1200);
      await tap(T('privacy-ask-context'));
      await wait(1300);
      await tap(T('privacy-ask-context'));
      await wait(1300);
      await tap(T('privacy-back'));
      await wait(900);
      await step('Escape: the menu closes with its shorter copy');
      await page.keyboard.press('Escape');
      await wait(1400);
      await step('SEARCH: results change while typing without animating each row');
      await tap(T('f05m-search'));
      await wait(1000);
      await page.locator(T('search-input')).pressSequentially('BANK', { delay: 160 });
      await wait(1200);
      await page.keyboard.press('Escape');
      await wait(2600);
    },
  },
  {
    id: 'P05_FINANCIAL_FEEDBACK_REDUCED_MOTION',
    title: 'REDUCED MOTION: no ambience, no entrance, no exit copy, no response — every action still works',
    world: () => f05World('approved'),
    route: 'money?parent=motion',
    reduced: true,
    run: async ({ step, wait, tap, swipe, page }) => {
      await step('arrived (reduced motion): the scene is still', 6000);
      await step('swipe: the collection changes at once');
      await swipe(-170);
      await wait(1600);
      await tap(T('f05m-dot-accounts'));
      await wait(1200);
      await step('MOVE MONEY recorded in transit: the figures change, nothing animates');
      await tap(T('f05m-actions'));
      await wait(500);
      await tap(T('f05m-actions-move'));
      await wait(600);
      await tap(T('transfer-from-ride'));
      await tap(T('transfer-to-bank'));
      await page.fill(`${T('transfer-amount')} >> nth=0`, '80');
      await tap(T('transfer-status-in-transit'));
      await tap(T('transfer-save'));
      await wait(1800);
      await step('menu, BUFFER save and a refused save: state changes, no motion');
      await tap(T('f09-menu'));
      await wait(800);
      await tap(T('menu-buffer'));
      await wait(900);
      await page.fill(T('buffer-input'), '250');
      await tap(T('buffer-save'));
      await wait(1200);
      await page.fill(T('buffer-input'), '1.2.3');
      await tap(T('buffer-save'));
      await wait(1400);
      await page.keyboard.press('Escape');
      await wait(2000);
    },
  },
];

async function swipeOn(page: Page, dx: number, slow = false) {
  const box = (await page.locator('.jrn-f05m__swipe').boundingBox())!;
  const x0 = box.x + box.width / 2;
  const y0 = box.y + box.height * 0.46;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= 12; i += 1) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (dx * i) / 12, y: y0 }] });
    await page.waitForTimeout(slow ? 45 : 16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

async function seed(ctx: BrowserContext, world: unknown) {
  const bs = world as { session: unknown; device: unknown; snapshot: unknown };
  await ctx.route('https://open.er-api.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92, GBP: 0.79 } }) }));
  await ctx.addInitScript(({ st, bs }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.clear();
    localStorage.setItem(st.session, JSON.stringify(bs.session));
    localStorage.setItem(st.device, JSON.stringify(bs.device));
    localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot));
    sessionStorage.setItem('seeded', '1');
    sessionStorage.setItem('jurnl.f05.parent', 'motion');
  }, { st: JURNL_E2E_STORAGE, bs });
  await ctx.addInitScript({ content: INSTRUMENT });
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const index: Record<string, unknown> = {};
  for (const r of RECS.filter((x) => !ONLY.length || ONLY.includes(x.id))) {
    const vdir = join(OUT, `.video-${r.id}`);
    const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: r.reduced ? 'reduce' : 'no-preference', recordVideo: { dir: vdir, size: VP } });
    await seed(ctx, r.world());
    const page = await ctx.newPage();
    await page.goto(`${BASE}${r.route}`);
    await page.locator('[data-jrn-f05-stage], [data-jrn-f05-dot01-stage]').first().waitFor({ state: 'attached', timeout: 30_000 });
    let n = 0;
    const steps: { n: number; label: string; still: string }[] = [];
    // a full page load resets the in-page log: keep what it held, with the wall-clock offset of each segment
    const kept: unknown[] = [];
    const flush = async () => {
      const seg = await page.evaluate(() => (window as unknown as { __tl: unknown[] }).__tl);
      kept.push({ segment: kept.length, events: seg });
    };
    const run: Run = {
      page,
      goto: async (route) => {
        await flush();
        await page.goto(`${BASE}${route}`);
        await page.locator('[data-jrn-f05-stage], [data-jrn-f05-dot01-stage]').first().waitFor({ state: 'attached', timeout: 30_000 });
      },
      wait: (ms) => page.waitForTimeout(ms),
      tap: async (sel) => {
        await page.locator(sel).first().scrollIntoViewIfNeeded();
        await page.locator(sel).first().tap();
      },
      swipe: (dx, slow) => swipeOn(page, dx, slow),
      hold: async (ms) => {
        const box = (await page.locator('.jrn-f05m__swipe').boundingBox())!;
        const cdp = await page.context().newCDPSession(page);
        const p = { x: box.x + 24, y: box.y + 18 };
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [p] });
        await page.waitForTimeout(ms);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await cdp.detach();
      },
      step: async (label, settleMs = 0) => {
        n += 1;
        await page.evaluate((l) => (window as unknown as { __mark: (l: string) => void }).__mark(l), label);
        const still = `${r.id}-${String(n).padStart(2, '0')}.png`;
        await page.screenshot({ path: join(OUT, still) });
        steps.push({ n, label, still });
        if (settleMs) await page.waitForTimeout(settleMs);
      },
    };
    const t0 = Date.now();
    await r.run(run);
    const last = await page.evaluate(() => (window as unknown as { __tl: unknown[] }).__tl);
    // one flat timeline; each page load starts its own segment (times restart at that load)
    const timeline = [...kept.flatMap((k) => [{ segmentStart: (k as { segment: number }).segment }, ...((k as { events: unknown[] }).events)]), ...(kept.length ? [{ segmentStart: kept.length }] : []), ...last];
    const finalStill = `${r.id}-final.png`;
    await page.screenshot({ path: join(OUT, finalStill) });
    const video = page.video();
    await ctx.close();
    const src = await video!.path();
    renameSync(src, join(OUT, `${r.id}.webm`));
    writeFileSync(join(OUT, `${r.id}.timeline.json`), JSON.stringify({ id: r.id, title: r.title, viewport: VP, reducedMotion: !!r.reduced, wallMs: Date.now() - t0, steps, timeline }, null, 1));
    index[r.id] = { title: r.title, steps: steps.length, events: (timeline as unknown[]).length };
    console.log(r.id, 'done', Math.round((Date.now() - t0) / 1000), 's', (timeline as unknown[]).length, 'events');
  }
  writeFileSync(join(OUT, 'INDEX.json'), JSON.stringify(index, null, 1));
  await b.close();
})();
