/**
 * P0.JURNL.SITE00-F01-LIVE-VIEWPORT-DELIVERY1 — live viewport delivery QA.
 *
 * Everything runs THROUGH SITE 00 → DESIGN → JURNL → VIEWPORT: the JURNL project runtime is driven inside the
 * viewport iframe (frameLocator), never by opening the runtime route on its own — except the DIRECT PREVIEW phase,
 * which proves the second inspection surface loads the SAME runtime module.
 *
 * Phases
 *   A  open DESIGN → switch to JURNL → FAMILY RUNTIME card → VIEWPORT (F01 ENTRY)
 *   B  MOBILE / TABLET / DESKTOP × 14 screens via the ROUTE control: live DOM, no full-screen raster, SAFE / GRID / BOUNDS
 *   C  the 17 required interaction types, clicked naturally inside the viewport (journey)
 *   D  every bound F01 interaction trigger (manifest → binding) clicked inside the viewport, result asserted
 *   E  DIRECT PREVIEW = same runtime (same module URL, same route, no workspace chrome)
 *   F  project reactivity: JURNL → ASTRAL WORLD / NDXBOOK → JURNL with no stale runtime state
 *
 * Usage: npx tsx scripts/jurnl/viewport-delivery-qa.ts [baseUrl] [outDir]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Frame, type Page } from 'playwright';
import { listF01Bindings } from '../../src/projects/jurnl/data/f01/interactionBindings';
import { F01_SCREENS } from '../../src/projects/jurnl/data/f01/screens';
// @ts-expect-error — plain .mjs helper shared with the other JURNL QA scripts
import { qaChromiumPath } from './qa-env.mjs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5174';
const OUT = process.argv[3] ?? 'artifacts/jurnl-f01-live-viewport';
for (const d of ['viewport', 'journey', 'bindings', 'surfaces']) mkdirSync(join(OUT, d), { recursive: true });

type Check = { group: string; name: string; pass: boolean; detail?: string };
const checks: Check[] = [];
const check = (group: string, name: string, pass: unknown, detail?: unknown) => {
  const c = { group, name, pass: !!pass, detail: detail === undefined ? undefined : typeof detail === 'string' ? detail : JSON.stringify(detail) };
  checks.push(c);
  console.log(`${c.pass ? 'PASS' : 'FAIL'}  [${group}] ${name}${c.detail && !c.pass ? ` — ${c.detail}` : ''}`);
  return c.pass;
};

const PRESETS = [
  { id: 'MOBILE', w: 393, h: 852 },
  { id: 'TABLET', w: 834, h: 1194 },
  { id: 'DESKTOP', w: 1440, h: 900 },
] as const;

const tid = (t: string) => `[data-testid="${t}"]`;
const trig = (t: string) => `[data-jrn-trigger="${t}"]`;
let shotN = 0;

async function settle(page: Page, ms = 350) {
  await page.waitForTimeout(ms);
}

/** The live runtime document inside the DESIGN viewport. */
async function runtimeFrame(page: Page): Promise<Frame> {
  const el = await page.waitForSelector(`${tid('design-viewport-frame')}[data-project-runtime="jurnl"]`, { timeout: 15000 });
  const f = await el.contentFrame();
  if (!f) throw new Error('viewport iframe has no frame');
  return f;
}

async function waitScreen(page: Page, id: string, timeout = 9000): Promise<boolean> {
  try {
    const f = await runtimeFrame(page);
    await f.waitForSelector(`[data-jrn-screen="${id}"]`, { timeout });
    return true;
  } catch {
    return false;
  }
}

async function deviceShot(page: Page, dir: string, name: string) {
  await settle(page, 450);
  const file = join(OUT, dir, `${String(++shotN).padStart(3, '0')}-${name}.jpg`);
  await page.locator(tid('design-viewport-device')).screenshot({ path: file, type: 'jpeg', quality: 72 });
  return file;
}

async function clearRuntimeStorage(page: Page) {
  await page
    .evaluate(() => {
      for (const s of [localStorage, sessionStorage]) for (const k of Object.keys(s)) if (k.startsWith('jurnl.')) s.removeItem(k);
    })
    .catch(() => null);
}

/** Live-DOM audit of the runtime document on stage (no static full-screen raster, real controls + text). */
async function liveAudit(f: Frame) {
  return f.evaluate(() => {
    const area = innerWidth * innerHeight;
    const imgs = [...document.images].map((i) => {
      const r = i.getBoundingClientRect();
      return { src: (i.currentSrc || i.src).replace(location.origin, ''), share: +((r.width * r.height) / area).toFixed(3) };
    });
    // Code-built SVG textures are quoted data: URIs (their inner url(#filter) refs are not images) — strip them first.
    const bgs = [...document.querySelectorAll<HTMLElement>('body *')]
      .map((el) => ({ el, bg: getComputedStyle(el).backgroundImage.replace(/url\("data:[^"]*"\)/g, 'DATA_URI') }))
      .filter((x) => /url\(/.test(x.bg))
      .map((x) => {
        const r = x.el.getBoundingClientRect();
        return { bg: x.bg.slice(0, 90), share: +((r.width * r.height) / area).toFixed(3) };
      });
    const authorityLoads = performance.getEntriesByType('resource').map((e) => e.name).filter((n) => /\/f01\/authorities\/|ASSET_HARVEST|F01_ENTRY\/(ASSETS|OVERLAYS)/.test(n));
    const h1 = document.querySelector('h1')?.textContent?.trim() ?? '';
    return {
      imgs,
      bgs,
      authorityLoads,
      h1,
      text: document.body.innerText.replace(/\s+/g, ' ').trim().length,
      buttons: document.querySelectorAll('button').length,
      inputs: document.querySelectorAll('input').length,
      svgs: document.querySelectorAll('svg').length,
      lowercase: (document.body.innerText.match(/[a-z]/g) ?? []).length,
    };
  });
}

const auditPass = (a: Awaited<ReturnType<typeof liveAudit>>) =>
  a.text > 20 &&
  a.buttons >= 1 &&
  a.h1.length > 0 &&
  // Only the official logo, plus the one canonical environment plate (mounted since the F01 asset injection, #1339):
  // the plate is the environment layer under live controls, never an authority screenshot.
  a.imgs.every((i) => (i.src.includes('/site00/projects/jurnl/brand/jurnl-logo-official.png') && i.share < 0.08) || /\/assets\/ENTRY\.ENVIRONMENT\.[A-Z_]+\.\d+\.png$/.test(i.src)) &&
  a.imgs.filter((i) => i.share >= 0.08).length <= 1 &&
  a.bgs.every((b) => b.share < 0.08) &&
  a.authorityLoads.length === 0 &&
  a.lowercase === 0;

const browser = await chromium.launch({ headless: true, executablePath: qaChromiumPath() });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const pageErrors: string[] = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));

/* ───────────── A. DESIGN → JURNL → F01 ENTRY → VIEWPORT ───────────── */
await page.goto(`${BASE}/production/ndxbook/design?mode=brand`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector(tid('design-chamber-screen'), { timeout: 30000 });
await page.click(tid('production-chrome-project'));
await page.locator(tid('production-project-menu-item'), { hasText: 'JURNL' }).click();
await page.waitForURL(/\/production\/jurnl\/design\?mode=brand/);
check('PATH', 'SITE 00 → DESIGN → PROJECT SWITCHER → JURNL', page.url().endsWith('/production/jurnl/design?mode=brand'), page.url());
const runtimeCard = page.locator(`${tid('design-table-card')}[data-live="viewport"]`, { hasText: 'FAMILY RUNTIME' });
check('PATH', 'BRAND shows FAMILY RUNTIME · F01 ENTRY LIVE UI card', await runtimeCard.count());
await runtimeCard.click();
await page.waitForURL(/mode=viewport&family=F01/);
check('PATH', 'FAMILY RUNTIME card opens DESIGN → VIEWPORT with family F01', /\/production\/jurnl\/design\?mode=viewport&family=F01$/.test(page.url()), page.url());
check('VIEWPORT', 'FAMILY control = F01 ENTRY', (await page.inputValue(tid('design-viewport-family'))) === 'F01');
check('VIEWPORT', 'iframe mounts the JURNL project runtime route', (await page.getAttribute(tid('design-viewport-frame'), 'src')) === '/production/jurnl/runtime/entry');
check('VIEWPORT', 'F01.00 WELCOME renders live in the viewport', await waitScreen(page, 'F01.00'));
check('VIEWPORT', 'default preset MOBILE 393 × 852', (await page.getAttribute(tid('design-viewport-device'), 'data-target-w')) === '393' && (await page.getAttribute(tid('design-viewport-device'), 'data-target-h')) === '852');
const familyOptions = await page.locator(`${tid('design-viewport-family')} option`).allTextContents();
check('VIEWPORT', 'FAMILY control lists F01 ENTRY + F02 SETUP boundary', familyOptions.includes('F01 ENTRY') && familyOptions.some((o) => o.startsWith('F02 SETUP')), familyOptions);

/* ───────────── B. presets × 14 screens via the ROUTE control ───────────── */
const screenResults: Record<string, number> = {};
for (const p of PRESETS) {
  await page.selectOption(tid('design-viewport-preset'), p.id);
  await settle(page);
  const w = await page.getAttribute(tid('design-viewport-device'), 'data-target-w');
  const h = await page.getAttribute(tid('design-viewport-device'), 'data-target-h');
  check('PRESET', `${p.id} device = ${p.w} × ${p.h}`, w === String(p.w) && h === String(p.h), `${w} × ${h}`);
  let ok = 0;
  for (const s of F01_SCREENS) {
    await clearRuntimeStorage(page);
    await page.selectOption(tid('design-viewport-route'), s.id);
    const on = await waitScreen(page, s.id);
    const f = await runtimeFrame(page);
    const vw = await f.evaluate(() => [innerWidth, innerHeight]);
    const a = await liveAudit(f);
    const pass = on && vw[0] === p.w && vw[1] === p.h && auditPass(a);
    if (check('SCREEN', `${p.id} ${s.id} ${s.name} — live components at ${p.w}×${p.h}`, pass, { on, vw, h1: a.h1, buttons: a.buttons, inputs: a.inputs, imgs: a.imgs, bgs: a.bgs, auth: a.authorityLoads, lc: a.lowercase })) ok++;
    await deviceShot(page, 'viewport', `${p.id.toLowerCase()}-${s.id}`);
  }
  screenResults[p.id] = ok;
  // overlays on this preset
  await page.selectOption(tid('design-viewport-route'), 'F01.01');
  await waitScreen(page, 'F01.01');
  for (const t of ['safe', 'grid', 'bounds']) await page.click(tid(`design-viewport-${t}-toggle`));
  await settle(page, 1300);
  const insets = await page.locator(`${tid('design-viewport-safe')}.pxa-device__safe--exact`).count();
  const cols = await page.getAttribute(tid('design-viewport-grid'), 'data-columns');
  const bounds = Number((await page.getAttribute(tid('design-viewport-bounds'), 'data-count')) ?? 0);
  const expectCols = { MOBILE: '4', TABLET: '8', DESKTOP: '12' }[p.id];
  check('OVERLAY', `${p.id} SAFE AREA (project insets) + GRID ${expectCols} col + BOUNDS (${bounds} runtime blocks)`, insets === 1 && cols === expectCols && bounds >= 2, { insets, cols, bounds });
  await deviceShot(page, 'viewport', `${p.id.toLowerCase()}-overlays-safe-grid-bounds`);
  for (const t of ['safe', 'grid', 'bounds']) await page.click(tid(`design-viewport-${t}-toggle`));
}

/* ───────────── C. 17 required interaction types — natural clicks inside the viewport ───────────── */
await page.selectOption(tid('design-viewport-preset'), 'MOBILE');
await clearRuntimeStorage(page);
await page.selectOption(tid('design-viewport-route'), 'F01.00');
await waitScreen(page, 'F01.00');
let f = await runtimeFrame(page);
const types: Record<string, boolean> = {};
const T = (k: string, pass: unknown, detail?: unknown) => (types[k] = check('INTERACTION', k, pass, detail));

// live navigation: the frame keeps its document; ROUTE control follows
await f.evaluate(() => ((window as unknown as { __qa: number }).__qa = 1));
await f.click(trig('welcome-get-started'));
await waitScreen(page, 'F01.01');
await settle(page, 600);
check('SYNC', 'clicking inside the runtime navigates without reloading it', (await f.evaluate(() => (window as unknown as { __qa?: number }).__qa)) === 1);
check('SYNC', 'ROUTE control follows live navigation (F01.00 → F01.01)', (await page.inputValue(tid('design-viewport-route'))) === 'F01.01');
check('SYNC', 'host LIVE readout = F01.01', (await page.locator('[data-live="screen"] b').textContent()) === 'F01.01');

await f.click(trig('create-first-name'));
T('FOCUSED INPUT', (await f.getAttribute(`.jrn-field:has(${trig('create-first-name')})`, 'data-focused')) === 'true');
await deviceShot(page, 'journey', 'focused-input');
await f.click(trig('create-submit'));
await settle(page);
T('ERROR PANEL', await f.locator('.jrn-error[role="alert"]').first().isVisible());
await deviceShot(page, 'journey', 'error-panel');
await f.fill(trig('create-first-name'), 'KATE');
await f.fill(trig('create-last-name'), 'A.');
await f.fill(trig('create-email'), 'NEW@EXAMPLE.COM');
await f.click(trig('create-password'));
await f.fill(trig('create-password'), 'Jurnl-2026');
await settle(page);
const met = await f.locator(`${trig('create-password-requirements')} .jrn-req[data-met="true"]`).count();
T('PASSWORD REQUIREMENTS', met === 4 && (await f.getAttribute(trig('create-password-requirements'), 'data-open')) === 'true', { met });
T('INLINE EXPANSION', (await f.getAttribute(trig('create-password-requirements'), 'data-open')) === 'true');
await deviceShot(page, 'journey', 'password-requirements-inline-expansion');
const typeBefore = await f.getAttribute(trig('create-password'), 'type');
await f.click(trig('create-password-toggle'));
const typeAfter = await f.getAttribute(trig('create-password'), 'type');
T('SHOW / HIDE PASSWORD', typeBefore === 'password' && typeAfter === 'text', { typeBefore, typeAfter });
await f.click(trig('create-password-toggle'));
// long / scrollable drawer + inline expansion inside it
await f.click(trig('create-terms-link'));
const terms = f.locator('[data-jrn-overlay="terms"]');
await terms.waitFor();
// The long drawer sizes to its content (max 86% of the screen) and scrolls once content exceeds it: rotate the
// viewport (real ORIENTATION control) to MOBILE LANDSCAPE 852 × 393 and scroll it with the wheel.
await page.selectOption(tid('design-viewport-orientation'), 'LANDSCAPE');
await settle(page, 700);
const body = f.locator('[data-jrn-overlay="terms"] .jrn-drawer__body');
const geo = await body.evaluate((n) => ({ sh: n.scrollHeight, ch: n.clientHeight, vw: innerWidth, vh: innerHeight }));
await body.hover();
await page.mouse.wheel(0, 240);
await settle(page, 500);
const moved = await body.evaluate((n) => n.scrollTop);
T('LONG / SCROLLABLE DRAWER', (await terms.getAttribute('data-jrn-drawer')) === 'long' && geo.sh > geo.ch && moved > 0, { ...geo, moved });
await deviceShot(page, 'journey', 'long-drawer-scrolled-landscape');
await page.selectOption(tid('design-viewport-orientation'), 'PORTRAIT');
await settle(page, 700);
await f.locator(trig('terms-section')).first().click();
await settle(page);
check('INTERACTION', 'INLINE EXPANSION inside drawer (terms section)', await f.locator('[data-jrn-overlay="terms"] .jrn-expand[data-open="true"]').count());
await deviceShot(page, 'journey', 'long-drawer-terms');
await f.click(trig('terms-accept'));
await settle(page);
await f.click(trig('create-apple'));
await f.locator('[data-jrn-overlay="social-apple"]').waitFor();
T('SOCIAL AUTH TRANSITION BOUNDARY', await f.locator('[data-jrn-overlay="social-apple"]').isVisible());
await deviceShot(page, 'journey', 'social-auth-boundary');
await f.locator('[data-jrn-overlay="social-apple"] button').last().click();
await settle(page);
await f.click(trig('create-submit'));
const busy = await f.waitForSelector(`${trig('create-submit')}[aria-busy="true"]`, { timeout: 1500 }).then(() => true).catch(() => false);
T('LOADING BUTTON', busy);
check('ROUTING', 'create account → F01.02 EMAIL VERIFICATION', await waitScreen(page, 'F01.02'));
await f.click(trig('verify-resend'));
T('SUCCESS BANNER / TOAST', await f.locator('.jrn-toast').first().isVisible().catch(() => false) || (await f.waitForSelector('.jrn-toast', { timeout: 3000 }).then(() => true).catch(() => false)));
await deviceShot(page, 'journey', 'toast');
await f.click(trig('verify-change-email'));
const short = f.locator('[data-jrn-overlay="change-email"]');
await short.waitFor();
T('SHORT DRAWER', (await short.getAttribute('data-jrn-drawer')) === 'short');
await deviceShot(page, 'journey', 'short-drawer');
await short.locator('button[aria-label]').first().click().catch(() => null);
await settle(page);
const handoffBefore = await page.locator('[data-live="handoff"] b').textContent();
await f.click(trig('verify-open-mail'));
await f.locator('[data-jrn-overlay="mail"]').waitFor();
await f.click(trig('mail-continue'));
await settle(page, 600);
const handoffAfter = await page.locator('[data-live="handoff"] b').textContent();
T('EMAIL APP HANDOFF BOUNDARY', handoffBefore === 'NONE' && /MAIL/.test(handoffAfter ?? ''), { handoffBefore, handoffAfter });
// biometric handoff (F01.09)
await page.selectOption(tid('design-viewport-route'), 'F01.09');
await waitScreen(page, 'F01.09');
f = await runtimeFrame(page);
await f.click(trig('bio-enable'));
const native = f.locator('[data-jrn-overlay="faceid-enable"][data-jrn-handoff="native"]');
T('BIOMETRIC HANDOFF BOUNDARY', await native.waitFor({ timeout: 3000 }).then(() => true).catch(() => false));
await deviceShot(page, 'journey', 'biometric-handoff');
await settle(page, 1800);
// returning user: full-screen sheet, switch account, sign-out confirmation
await clearRuntimeStorage(page);
await page.selectOption(tid('design-viewport-route'), 'F01.04');
await waitScreen(page, 'F01.04');
f = await runtimeFrame(page);
await f.click(trig('unlock-use-password'));
const sheet = f.locator('[data-jrn-overlay="use-password"][data-jrn-sheet="full"]');
T('FULL-SCREEN SHEET', await sheet.waitFor({ timeout: 3000 }).then(() => true).catch(() => false));
await deviceShot(page, 'journey', 'full-screen-sheet');
await f.click(trig('use-password-close'));
await settle(page);
await f.click(trig('unlock-switch-account'));
T('SWITCH ACCOUNT', await f.locator('[data-jrn-overlay="switch-account"]').waitFor({ timeout: 3000 }).then(() => true).catch(() => false));
await deviceShot(page, 'journey', 'switch-account');
await f.click(trig('switch-sign-out'));
const modal = f.locator('[data-jrn-overlay="sign-out"][data-jrn-modal="confirm"]');
T('CONFIRMATION MODAL', await modal.waitFor({ timeout: 3000 }).then(() => true).catch(() => false));
T('SIGN-OUT CONFIRMATION', (await modal.textContent())?.includes('SIGN OUT'));
await deviceShot(page, 'journey', 'sign-out-confirmation');
await f.click(trig('sign-out-confirm'));
check('ROUTING', 'sign out → F01.00 (ROUTE control follows)', (await waitScreen(page, 'F01.00')) && (await settle(page, 500), (await page.inputValue(tid('design-viewport-route'))) === 'F01.00'));
// F01 → F02
await page.selectOption(tid('design-viewport-route'), 'F01.13');
await waitScreen(page, 'F01.13');
f = await runtimeFrame(page);
await f.click(trig('complete-continue'));
// F02 SETUP is a live family since #1353: CONTINUE TO SETUP lands on F02.00, not the old boundary placeholder.
const boundaryOn = await waitScreen(page, 'F02.00');
await settle(page, 900);
T('F01 → F02 FAMILY TRANSITION', boundaryOn);
check('SYNC', 'FAMILY control follows the transition to F02', (await page.inputValue(tid('design-viewport-family'))) === 'F02');
await deviceShot(page, 'journey', 'family-transition-f02');

/* ───────────── D. every bound F01 interaction, inside the viewport ───────────── */
const bindings = listF01Bindings();
const prep: Record<string, (fr: Frame) => Promise<void>> = {
  'forgot-submit': async (fr) => void (await fr.fill(trig('forgot-email'), 'EMMA@EXAMPLE.COM')),
  'newpw-submit': async (fr) => {
    await fr.fill(trig('newpw-password'), 'Jurnl-2027!');
    await fr.fill(trig('newpw-confirm'), 'Jurnl-2027!');
  },
};
let bound = 0;
let fired = 0;
const primitivesSeen = new Set<string>();
for (const b of bindings) {
  if (!b.trigger || !b.surface) continue;
  bound++;
  await clearRuntimeStorage(page);
  const q = b.surface.query ? `&${b.surface.query}` : '';
  await page.goto(`${BASE}/production/jurnl/design?mode=viewport&screen=${b.surface.screenId}${q}`, { waitUntil: 'domcontentloaded' });
  const on = await waitScreen(page, b.surface.screenId, 15000);
  const fr = await runtimeFrame(page);
  await settle(page, 450);
  const t = fr.locator(trig(b.trigger)).first();
  let pass = false;
  let detail: unknown = null;
  try {
    await t.waitFor({ state: 'attached', timeout: 5000 });
    await prep[b.trigger]?.(fr);
    const r = b.result;
    // Error / success PANEL triggers are activated through the panel's own action button.
    const isPanel = await t.evaluate((el) => !['BUTTON', 'INPUT', 'A'].includes(el.tagName) && !!el.querySelector('button'));
    const act = b.action ? fr.locator(trig(b.action)).first() : isPanel ? t.locator('button').first() : t;
    if (r.kind === 'route') {
      await act.click();
      pass = await waitScreen(page, r.screenId);
      if (b.action || isPanel) detail = `panel action ${b.action ?? '(in panel)'}`;
    } else if (r.kind === 'boundary') {
      await t.click();
      pass = await waitScreen(page, 'F02.00');
    } else if (r.kind === 'overlay') {
      const ov = fr.locator(`[data-jrn-overlay="${r.overlayId}"]`);
      const inside = (await ov.count()) > 0 && (await ov.locator(trig(b.trigger)).count()) > 0;
      if (inside) {
        const shown = await ov.isVisible();
        await t.click();
        await settle(page, 500);
        pass = shown && ((await ov.count()) === 0 || !(await ov.isVisible()));
        detail = 'trigger inside overlay: overlay shown, trigger dismisses it';
      } else {
        await t.click();
        pass = await ov.first().waitFor({ timeout: 4000 }).then(() => true).catch(() => false);
      }
    } else if (r.kind === 'inline') {
      if (b.trigger.endsWith('-toggle')) {
        const input = fr.locator(trig(r.marker));
        const before = await input.getAttribute('type');
        await t.click();
        const after = await input.getAttribute('type');
        pass = before === 'password' && after === 'text';
        detail = { before, after };
      } else if (r.marker === b.trigger) {
        const role = await t.getAttribute('role');
        if (role === 'checkbox') {
          const before = await t.getAttribute('aria-checked');
          await t.click();
          pass = before !== (await t.getAttribute('aria-checked'));
        } else pass = await t.isVisible();
      } else {
        await t.click();
        await settle(page);
        const m = fr.locator(trig(r.marker)).first();
        pass = (await m.isVisible()) && (await m.getAttribute('data-open')) !== 'false';
      }
    } else if (r.kind === 'toast') {
      await t.click();
      pass = await fr.waitForSelector('.jrn-toast', { timeout: 4000 }).then(() => true).catch(() => false);
    } else if (r.kind === 'loading') {
      pass = (await t.getAttribute('aria-busy')) === 'true';
    } else if (r.kind === 'focus') {
      await t.click();
      pass = await fr.evaluate((tr) => document.activeElement?.getAttribute('data-jrn-trigger') === tr, b.trigger);
    }
    const seen = await fr.evaluate(() => ({
      short: !!document.querySelector('[data-jrn-drawer="short"]'),
      long: !!document.querySelector('[data-jrn-drawer="long"]'),
      sheet: !!document.querySelector('[data-jrn-sheet="full"]'),
      modal: !!document.querySelector('[data-jrn-modal="confirm"]'),
      native: !!document.querySelector('[data-jrn-handoff="native"]'),
      error: !!document.querySelector('.jrn-error'),
      toast: !!document.querySelector('.jrn-toast'),
      busy: !!document.querySelector('[aria-busy="true"]'),
      expand: !!document.querySelector('.jrn-expand[data-open="true"], .jrn-reqs'),
      focus: !!document.activeElement?.matches('input'),
      transition: !!document.querySelector('[data-transition]'),
    }));
    for (const [k, v] of Object.entries(seen)) if (v) primitivesSeen.add(k);
    if (['mail', 'support'].includes((b.result as { overlayId?: string }).overlayId ?? '')) primitivesSeen.add('external');
  } catch (e) {
    detail = String(e).slice(0, 160);
  }
  if (check('BINDING', `${b.interactionId} — ${b.trigger} @ ${b.surface.screenId}${q.replace('&', ' ?')} → ${b.result.kind}`, on && pass, detail)) fired++;
  if (['F01.01.DRAWER.TERMS', 'F01.03.LOCKED.PANEL', 'F01.04.MODAL.SIGNOUT', 'F01.11.DRAWER.AI_ACCESS', 'F01.12.SURFACE.SESSION_MANAGEMENT', 'F01.09.HANDOFF.ENABLE'].includes(b.interactionId)) {
    await deviceShot(page, 'bindings', b.interactionId);
  }
}
const PRIMITIVE_EVIDENCE: Record<string, string> = {
  'F01.GLOBAL.PRIM.DRAWER.SHORT': 'short',
  'F01.GLOBAL.PRIM.DRAWER.LONG': 'long',
  'F01.GLOBAL.PRIM.SHEET.FULL': 'sheet',
  'F01.GLOBAL.PRIM.MODAL.CONFIRM': 'modal',
  'F01.GLOBAL.PRIM.INLINE.EXPAND': 'expand',
  'F01.GLOBAL.PRIM.ERROR.PANEL': 'error',
  'F01.GLOBAL.PRIM.BANNER.SUCCESS': 'toast',
  'F01.GLOBAL.PRIM.BUTTON.LOADING': 'busy',
  'F01.GLOBAL.PRIM.INPUT.FOCUS': 'focus',
  'F01.GLOBAL.PRIM.HANDOFF.EXTERNAL': 'external',
  'F01.GLOBAL.PRIM.HANDOFF.NATIVE': 'native',
  'F01.GLOBAL.PRIM.ROUTE.TRANSITION': 'transition',
};
let primitives = 0;
for (const b of bindings.filter((x) => !x.trigger)) {
  const ev = PRIMITIVE_EVIDENCE[b.interactionId];
  if (check('PRIMITIVE', `${b.interactionId} rendered live by the triggered interactions (${ev})`, ev && primitivesSeen.has(ev))) primitives++;
}

/* ───────────── E. DIRECT PREVIEW = the same runtime ───────────── */
const runtimeModule = /JurnlRuntimeRoot|\/projects\/jurnl\/runtime\//;
const frameModulesSet = new Set<string>();
const onFrameReq = (req: import('playwright').Request) => {
  if (runtimeModule.test(req.url()) && /\/runtime\//.test(req.frame().url())) frameModulesSet.add(new URL(req.url()).pathname);
};
page.on('request', onFrameReq);
await page.goto(`${BASE}/production/jurnl/design?mode=viewport&screen=F01.03`, { waitUntil: 'domcontentloaded' });
await waitScreen(page, 'F01.03', 15000);
const frameSrc = await page.getAttribute(tid('design-viewport-frame'), 'src');
const directHref = await page.getAttribute(tid('design-viewport-direct-preview'), 'href');
check('DIRECT', 'OPEN DIRECT PREVIEW link = viewport iframe route', directHref === frameSrc, { frameSrc, directHref });
page.off('request', onFrameReq);
const frameModules = [...frameModulesSet].sort();
const directModulesSet = new Set<string>();
ctx.on('request', (req) => {
  if (runtimeModule.test(req.url()) && req.frame().page() !== page) directModulesSet.add(new URL(req.url()).pathname);
});
const [popup] = await Promise.all([page.waitForEvent('popup'), page.click(tid('design-viewport-direct-preview'))]);
await popup.waitForSelector('[data-jrn-screen="F01.03"]', { timeout: 15000 });
const directModules = [...directModulesSet].sort();
check('DIRECT', 'direct preview opens the same route outside the workspace', new URL(popup.url()).pathname === '/production/jurnl/runtime/entry/sign-in', popup.url());
check('DIRECT', 'no DESIGN workspace / host chrome in the direct preview', (await popup.locator('[data-testid="production-workspace-header"], [data-testid="design-modes"], [data-testid="design-viewport-controls"]').count()) === 0);
const rootModule = (xs: string[]) => xs.find((m) => /JurnlRuntimeRoot/.test(m)) ?? null;
check('DIRECT', 'same runtime root module loaded by the viewport iframe and the direct preview', !!rootModule(frameModules) && rootModule(frameModules) === rootModule(directModules), { iframe: rootModule(frameModules), direct: rootModule(directModules), iframeModules: frameModules.length, directModules: directModules.length });
await popup.setViewportSize({ width: 393, height: 852 });
await popup.reload();
await popup.waitForSelector('[data-jrn-screen="F01.03"]');
await popup.fill(trig('signin-email'), 'EMMA@EXAMPLE.COM');
await popup.fill(trig('signin-password'), 'Jurnl-2026');
await popup.click(trig('signin-submit'));
check('DIRECT', 'direct preview is fully interactive (sign in → post-auth route)', await popup.waitForSelector('[data-jrn-screen="F01.09"], [data-jrn-screen="F01.10"], [data-jrn-screen="F01.13"], [data-jrn-screen="F01.11"]', { timeout: 6000 }).then(() => true).catch(() => false));
await popup.screenshot({ path: join(OUT, 'surfaces', 'direct-preview-mobile-after-sign-in.jpg'), type: 'jpeg', quality: 72 });
await popup.close();

/* ───────────── F. project reactivity ───────────── */
await page.click(tid('production-chrome-project'));
await page.locator(tid('production-project-menu-item'), { hasText: 'ASTRAL WORLD' }).click();
await page.waitForURL(/\/production\/astral-world\/design/);
await settle(page, 2000);
const astralFrame = await page.getAttribute(tid('design-viewport-frame'), 'src').catch(() => null);
check('REACTIVE', 'JURNL → ASTRAL WORLD: no JURNL runtime / family / route controls / direct preview remain', !(astralFrame ?? '').includes('/jurnl/') && (await page.locator(`${tid('design-viewport-family')}, ${tid('design-viewport-direct-preview')}, [data-project-runtime="jurnl"]`).count()) === 0, { url: page.url(), astralFrame });
await page.screenshot({ path: join(OUT, 'surfaces', 'switch-jurnl-to-astral-world.jpg'), type: 'jpeg', quality: 70 });
await page.click(tid('production-chrome-project'));
await page.locator(tid('production-project-menu-item'), { hasText: 'NDXBOOK' }).click();
await page.waitForURL(/\/production\/ndxbook\/design/);
await settle(page, 2000);
const ndxFrame = await page.getAttribute(tid('design-viewport-frame'), 'src').catch(() => null);
check('REACTIVE', 'ASTRAL WORLD → NDXBOOK loads its own client app cleanly', !!ndxFrame && !ndxFrame.includes('/runtime/') && (await page.locator(tid('design-viewport-family')).count()) === 0, ndxFrame);
await page.click(tid('production-chrome-project'));
await page.locator(tid('production-project-menu-item'), { hasText: 'JURNL' }).click();
await page.waitForURL(/\/production\/jurnl\/design/);
check('REACTIVE', 'NDXBOOK → JURNL: JURNL runtime remounts (F01.00 live)', await waitScreen(page, 'F01.00', 15000));
await page.screenshot({ path: join(OUT, 'surfaces', 'design-viewport-jurnl-desktop-host.jpg'), type: 'jpeg', quality: 72 });

// founder's phone: the DESIGN viewport + controls at phone width
await page.setViewportSize({ width: 393, height: 852 });
await page.goto(`${BASE}/production/jurnl/design?mode=viewport&family=F01`, { waitUntil: 'domcontentloaded' });
check('PHONE HOST', 'DESIGN → VIEWPORT works on a phone-sized host (JURNL live inside)', await waitScreen(page, 'F01.00', 15000));
await settle(page, 800);
await page.screenshot({ path: join(OUT, 'surfaces', 'design-viewport-phone-host.jpg'), type: 'jpeg', quality: 72, fullPage: true });

await browser.close();

const pass = checks.filter((c) => c.pass).length;
const typesPass = Object.values(types).filter(Boolean).length;
const report = {
  sprint: 'P0.JURNL.SITE00-F01-LIVE-VIEWPORT-DELIVERY1',
  base: BASE,
  at: new Date().toISOString(),
  total: checks.length,
  pass,
  fail: checks.length - pass,
  pageErrors,
  summary: {
    screensInspectable: screenResults,
    requiredInteractionTypes: `${typesPass} / 17`,
    boundTriggersFired: `${fired} / ${bound}`,
    globalPrimitivesRendered: `${primitives} / ${bindings.length - bound}`,
    manifestInteractionsTriggerable: `${fired + primitives} / ${bindings.length}`,
  },
  checks,
};
writeFileSync(join(OUT, 'VIEWPORT_DELIVERY_REPORT.json'), JSON.stringify(report, null, 2));
console.log(`\nVIEWPORT DELIVERY QA: ${pass}/${checks.length} PASS · page errors: ${pageErrors.length}`);
console.log(JSON.stringify(report.summary));
process.exit(pass === checks.length && pageErrors.length === 0 ? 0 : 1);
