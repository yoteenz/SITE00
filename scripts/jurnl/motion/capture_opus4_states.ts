/* OPUS4 before / after screenshots. The same states are captured on any server (BASE env): run against the OPUS3 head for
 * BEFORE and against this branch for AFTER. Mid-motion frames are taken by pausing every running animation at a chosen
 * time (document.getAnimations, currentTime), so a frame is the real runtime's own frame, not a mockup.
 * States: resting · ambient peak (light at its crest, the sheen across the seal) · swipe exit mid-way · MENU closing at
 * 110 ms · MANAGE POCKET note entering at 190 ms · BUFFER effect paper after a stored save (settle crest) · reduced motion
 * (resting, menu open) · resting at six viewports. Each state records the motion attributes on the root and the running
 * animation names. Exchange rates are route-stubbed. Run: npx tsx scripts/jurnl/motion/capture_opus4_states.ts <out> */
import { chromium, type Browser, type Page } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { dot01World } from '../../../e2e/jurnl/helpers/jurnl-dot01-world';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';

const OUT = process.argv[2]!;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const T = (id: string) => `[data-jrn-trigger="${id}"]`;
const VPS: [number, number][] = [[360, 640], [393, 660], [393, 852], [430, 932], [820, 1180], [1440, 900]];

async function page(b: Browser, world: unknown, vp: [number, number], reduced = false): Promise<Page> {
  const ctx = await b.newContext({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: 2, isMobile: vp[0] < 600, hasTouch: vp[0] < 600, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await ctx.route('https://open.er-api.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92 } }) }));
  const bs = world as { session: unknown; device: unknown; snapshot: unknown };
  await ctx.addInitScript(({ st, bs }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.clear();
    localStorage.setItem(st.session, JSON.stringify(bs.session));
    localStorage.setItem(st.device, JSON.stringify(bs.device));
    localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot));
    sessionStorage.setItem('seeded', '1');
    sessionStorage.setItem('jurnl.f05.parent', 'motion');
  }, { st: JURNL_E2E_STORAGE, bs });
  return ctx.newPage();
}
async function go(p: Page, route: string) {
  await p.goto(`${BASE}${route}`);
  await p.locator('[data-jrn-f05-stage], [data-jrn-f05-dot01-stage]').first().waitFor({ state: 'attached', timeout: 30_000 });
  await p.waitForTimeout(2200); // the entrance, and (where it exists) the director's entrance quiet period
}
/** Pause every running animation at `ms` into its own timeline (or a per-name time); finished ones are not rewound. */
const freeze = (p: Page, at: Record<string, number> | number) =>
  p.evaluate((at) => {
    // only what is running now: a finished animation that fills (e.g. a screen fade with fill both) is left alone
    for (const a of document.getAnimations().filter((x) => x.playState === 'running')) {
      const name = (a as CSSAnimation).animationName ?? 'waapi';
      const t = typeof at === 'number' ? at : (at[name] ?? at['*']);
      if (t == null) continue;
      a.pause();
      a.currentTime = t;
    }
  }, at);
const facts = (p: Page) =>
  p.evaluate(() => {
    const r = document.querySelector('.jrn') as HTMLElement | null;
    return {
      motion: r ? { mode: r.dataset.jrnMotionMode ?? null, phase: r.dataset.jrnMotionPhase ?? null, ambient: r.dataset.jrnAmbient ?? null } : null,
      animations: document.getAnimations().map((a) => `${(a as CSSAnimation).animationName ?? ((a as CSSTransition).transitionProperty ? `transition:${(a as CSSTransition).transitionProperty}` : 'waapi')}@${(((a.effect as KeyframeEffect)?.target as Element | null)?.getAttribute('class') ?? '').split(' ')[0]}`),
      closingCopies: document.querySelectorAll('.jm-ghost').length,
      pageScroll: { y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 },
      viewport: [innerWidth, innerHeight],
    };
  });

type S = { id: string; vp?: [number, number]; reduced?: boolean; world?: () => unknown; route?: string; run: (p: Page) => Promise<void> };
const S: S[] = [
  { id: 'P01-parent-resting', run: async () => undefined },
  {
    id: 'P01-parent-ambient-peak',
    run: async (p) => {
      await p.waitForFunction(() => (document.querySelector('.jrn') as HTMLElement)?.dataset.jrnAmbient !== 'off', null, { timeout: 4000 }).catch(() => undefined);
      await freeze(p, { 'jm-amb-light': 600 + 18000 * 0.56, 'jm-amb-sheen': 13450 });
    },
  },
  {
    id: 'P01-parent-swipe-exit-midway',
    world: () => f05World('carousel'),
    run: async (p) => {
      await p.evaluate(() => (document.querySelector('[data-jrn-trigger="f05m-dot-transfers"]') as HTMLElement).click());
      await p.waitForTimeout(30);
      await freeze(p, 150);
    },
  },
  {
    id: 'P04-menu-closing-110ms',
    run: async (p) => {
      await p.locator(T('f09-menu')).first().click();
      await p.waitForTimeout(900);
      await p.keyboard.press('Escape');
      await p.waitForTimeout(16);
      await freeze(p, 110);
    },
  },
  {
    id: 'P02-manage-note-entering-190ms',
    world: () => dot01World(),
    route: 'money/places/bank',
    run: async (p) => {
      await p.locator(T('d01-manage')).first().click();
      await p.waitForTimeout(16);
      await freeze(p, 190);
    },
  },
  {
    id: 'P04-buffer-saved-settle-crest',
    run: async (p) => {
      await p.locator(T('f09-menu')).first().click();
      await p.waitForTimeout(700);
      await p.locator(T('menu-buffer')).click();
      await p.waitForTimeout(900);
      await p.fill(T('buffer-input'), '250');
      await p.locator(T('buffer-save')).click();
      await p.waitForTimeout(16);
      await freeze(p, { waapi: 120, '*': 1000 });
    },
  },
  { id: 'P05-reduced-resting', reduced: true, run: async () => undefined },
  {
    id: 'P05-reduced-menu-open',
    reduced: true,
    run: async (p) => {
      await p.locator(T('f09-menu')).first().click();
      await p.waitForTimeout(400);
    },
  },
  ...VPS.map(([w, h]) => ({ id: `R-parent-resting-${w}x${h}`, vp: [w, h] as [number, number], run: async () => undefined })),
];

(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const all: Record<string, unknown> = {};
  for (const s of S) {
    const p = await page(b, (s.world ?? (() => f05World('approved')))(), s.vp ?? [393, 852], s.reduced);
    try {
      await go(p, s.route ?? 'money?parent=motion');
      await s.run(p);
      // the frame first: a closing copy is removed by its own safety timer (≈ 340 ms) even while paused
      await p.screenshot({ path: join(OUT, `${s.id}.png`) });
      all[s.id] = await facts(p);
    } catch (e) {
      all[s.id] = { error: String(e).slice(0, 300) };
    }
    await p.context().close();
    console.log(s.id, JSON.stringify(all[s.id]).slice(0, 160));
  }
  writeFileSync(join(OUT, 'states.json'), JSON.stringify({ base: BASE, states: all }, null, 1));
  await b.close();
})();
