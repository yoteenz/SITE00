/* P0.JURNL.GLOBAL-OVERLAYS.CANONICAL-MICRO-ASSETS-AND-UTILITY-BUTTONS.CLEAN-MOUNT-CONVERGENCE.OPUS5 — real runtime captures of
 * the ten screens (OV01–OV08, CH01, CH02) and the MONEY parent, on any server (BASE env): run against the previous head for
 * BEFORE and against this branch for AFTER. Reduced motion, so a frame is the settled composition. Each state records every
 * <img data-asset-id> inside the overlay (duplicates are counted), the line glyphs (<svg>) left inside it, the live
 * switches, the boxes of the micro-asset slots and page scroll.
 * Run: npx tsx scripts/jurnl/overlays-opus5/capture_ten_screens.ts <out> [viewport WxH ...] */
import { chromium, type Browser, type Page } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bootstrapJurnl } from '../../../e2e/jurnl/helpers/jurnl-page';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';
import { dot01World } from '../../../e2e/jurnl/helpers/jurnl-dot01-world';

const OUT = process.argv[2]!;
const VPS = (process.argv.slice(3).length ? process.argv.slice(3) : ['393x852']).map((s) => s.split('x').map(Number) as [number, number]);
const BASE = (process.env.BASE ?? 'http://127.0.0.1:5174').replace(/\/$/, '');
const RT = '/production/jurnl/runtime';
const T = (id: string) => `[data-jrn-trigger="${id}"]`;

type World = Parameters<typeof bootstrapJurnl>[1];
async function open(b: Browser, vp: [number, number], world: unknown, route: string): Promise<Page> {
  const ctx = await b.newContext({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: 3, isMobile: vp[0] < 600, hasTouch: vp[0] < 600, reducedMotion: 'reduce' });
  await ctx.route('https://open.er-api.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92 } }) }));
  const p = await ctx.newPage();
  await p.addInitScript(() => sessionStorage.setItem('jurnl.f05.parent', 'motion'));
  await bootstrapJurnl(p as never, world as World);
  await p.goto(`${BASE}${RT}/${route}`, { waitUntil: 'networkidle', timeout: 120_000 });
  await p.locator('[data-project-runtime="jurnl"]').waitFor({ state: 'attached', timeout: 60_000 });
  await p.waitForTimeout(1200);
  return p;
}
const click = async (p: Page, id: string) => { const l = p.locator(T(id)).first(); await l.scrollIntoViewIfNeeded(); await l.click(); await p.waitForTimeout(650); };
const menu = (p: Page) => click(p, 'f09-menu');

/** Everything drawn inside one overlay host (string evaluate: no compiler helpers in the page). */
const FACTS = (host: string) => `(() => {
  const h = document.querySelector(${JSON.stringify(host)});
  if (!h) return { error: 'no host ' + ${JSON.stringify(host)} };
  const imgs = [...h.querySelectorAll('img[data-asset-id]')].filter((e) => !e.closest('.jm-ghost'));
  const ids = imgs.map((e) => e.getAttribute('data-asset-id'));
  const counts = {}; ids.forEach((i) => (counts[i] = (counts[i] || 0) + 1));
  const slots = [...h.querySelectorAll('[data-micro-slot]')].map((e) => { const b = e.getBoundingClientRect(); const img = e.tagName === 'IMG' ? e : e.querySelector('img'); return { slot: e.getAttribute('data-micro-slot'), asset: img && img.getAttribute('data-asset-id'), loaded: !!img && img.complete && img.naturalWidth > 0, box: [Math.round(b.left * 10) / 10, Math.round(b.top * 10) / 10, Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10] }; });
  const svgs = [...h.querySelectorAll('svg')].filter((e) => !e.closest('.jm-ghost')).map((e) => (e.closest('[data-jrn-trigger]') || e.parentElement).getAttribute('data-jrn-trigger') || e.parentElement.className);
  const switches = [...h.querySelectorAll('[role="switch"]')].map((e) => ({ trigger: e.getAttribute('data-jrn-trigger'), checked: e.getAttribute('aria-checked'), art: [...e.querySelectorAll('img[data-asset-id]')].map((i) => i.getAttribute('data-asset-id')) }));
  return { ids: ids.sort(), counts, duplicates: Object.entries(counts).filter(([k, v]) => v > 1 && !/^B0[1-4]-|CHEVRON/.test(k)).map(([k, v]) => k + ' x' + v), slots, svgs, switches,
    pageScroll: { y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 } };
})()`;

type S = { id: string; world: () => unknown; route: string; host: string; open?: (p: Page) => Promise<void>; close?: [string, string][] };
const S: S[] = [
  { id: '00_MONEY_PARENT', world: () => f05World('approved'), route: 'money?parent=motion', host: '.jrn', close: [['TOP_UTILITY', '.jrn-f05m__chip[data-jrn-trigger="f05m-search"]']] },
  { id: 'OV01_MONEY_ACTION', world: () => f05World('approved'), route: 'money?parent=motion', host: '[data-jrn-overlay="f05m-actions-sheet"]', open: (p) => click(p, 'f05m-actions'), close: [['ADD_CHOICE', '[data-jrn-trigger="f05m-actions-add"]'], ['MOVE_CHOICE', '[data-jrn-trigger="f05m-actions-move"]']] },
  { id: 'OV02_ADD_A_POCKET', world: () => f05World('approved'), route: 'money?parent=motion', host: '[data-jrn-overlay="money-add-place"]', open: async (p) => { await click(p, 'f05m-actions'); await click(p, 'f05m-actions-add'); }, close: [['TYPES', '[data-jrn-overlay="money-add-place"] .jed-choices'], ['FOOT', '[data-jrn-overlay="money-add-place"] .jed-foot']] },
  { id: 'OV03_MOVE_MONEY', world: () => f05World('approved'), route: 'money?parent=motion', host: '[data-jrn-overlay="transfer-sheet"]', open: async (p) => { await click(p, 'f05m-actions'); await click(p, 'f05m-actions-move'); }, close: [['FROM', '[data-testid="transfer-from-selected"]'], ['TO', '[data-testid="transfer-to-selected"]'], ['DATE', '[data-jrn-overlay="transfer-sheet"] .jed-field:has([data-jrn-trigger="transfer-date"])'], ['FOOT', '[data-jrn-overlay="transfer-sheet"] .jed-foot']] },
  { id: 'OV04_MANAGE_POCKET', world: () => f05World('many'), route: 'money/places/long', host: '[data-testid="d01-pocket-menu"]', open: (p) => click(p, 'd01-manage'), close: [['ACTIONS', '[data-testid="d01-pocket-menu"] .jsp-note__items']] },
  { id: 'OV05_SEARCH', world: () => f05World('carousel'), route: 'money?parent=motion', host: '[data-jrn-overlay="global-search"]', open: (p) => click(p, 'f05m-search'), close: [['FIELD', '[data-jrn-overlay="global-search"] .jsx-field'], ['FILTERS', '[data-jrn-overlay="global-search"] .jsx-filters'], ['RESULTS', '[data-jrn-overlay="global-search"] .jsx-results']] },
  { id: 'OV06_ACCOUNT_SETTINGS', world: () => f05World('approved'), route: 'money?parent=motion', host: '[data-jrn-overlay="account-drawer"]', open: async (p) => { await menu(p); await click(p, 'menu-account'); } },
  { id: 'OV07_ARCHIVE_BLOCKED', world: () => dot01World(), route: 'money/places/bank/settings', host: '[data-jrn-overlay="d01-archive-blocked"]', open: (p) => click(p, 'd01-archive') },
  { id: 'OV08_GLOBAL_MENU', world: () => f05World('approved'), route: 'money?parent=motion', host: '[data-jrn-overlay="global-menu"]', open: menu, close: [['ROWS', '[data-jrn-overlay="global-menu"] .jgm-port']] },
  { id: 'CH01_SAFE_TO_SPEND_BUFFER', world: () => f05World('approved'), route: 'money?parent=motion', host: '[data-jrn-overlay="global-buffer"]', open: async (p) => { await menu(p); await click(p, 'menu-buffer'); }, close: [['EFFECT', '[data-testid="buffer-effect-paper"]']] },
  { id: 'CH02_PRIVACY_CONSENTS', world: () => f05World('approved'), route: 'money?parent=motion', host: '[data-jrn-overlay="settings-consents-sheet"]', open: async (p) => { await menu(p); await click(p, 'menu-privacy'); }, close: [['LIST', '[data-jrn-overlay="settings-consents-sheet"] .jce-list'], ['REMOVE', '[data-jrn-overlay="settings-consents-sheet"] .jce-remove']] },
  { id: 'OV02_ADD_A_POCKET_SAVINGS_SELECTED', world: () => f05World('approved'), route: 'money?parent=motion', host: '[data-jrn-overlay="money-add-place"]', open: async (p) => { await click(p, 'f05m-actions'); await click(p, 'f05m-actions-add'); await click(p, 'money-add-kind-savings'); }, close: [['TYPES', '[data-jrn-overlay="money-add-place"] .jed-choices']] },
  { id: 'CH02_PRIVACY_CONSENTS_SCROLLED', world: () => f05World('approved'), route: 'money?parent=motion', host: '[data-jrn-overlay="settings-consents-sheet"]', open: async (p) => { await menu(p); await click(p, 'menu-privacy'); await p.evaluate(() => { const l = document.querySelector('.jce-list'); if (l) l.scrollTop = l.scrollHeight; }); await p.waitForTimeout(300); } },
];

(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const all: Record<string, unknown> = {};
  const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
  for (const vp of VPS) {
    for (const s of S) {
      if (only && !only.has(s.id)) continue;
      const key = `${s.id}_${vp[0]}x${vp[1]}`;
      const p = await open(b, vp, s.world(), s.route);
      try {
        if (s.open) await s.open(p);
        await p.waitForTimeout(500);
        all[key] = await p.evaluate(FACTS(s.host));
        await p.screenshot({ path: join(OUT, `${key}.png`) });
        for (const [name, sel] of s.close ?? []) {
          const l = p.locator(sel).first();
          if (await l.count()) await l.screenshot({ path: join(OUT, `CLOSE_${s.id}_${name}_${vp[0]}x${vp[1]}.png`) }).catch(() => undefined);
        }
      } catch (e) {
        all[key] = { error: String(e).slice(0, 300) };
        await p.screenshot({ path: join(OUT, `${key}_ERROR.png`) }).catch(() => undefined);
      }
      console.log(key, JSON.stringify(all[key]).slice(0, 220));
      await p.context().close();
    }
  }
  writeFileSync(join(OUT, 'states.json'), JSON.stringify({ base: BASE, states: all }, null, 1));
  await b.close();
})();
