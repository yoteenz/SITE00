/**
 * JURNL MOBILE COMPOSITION QA (P0.JURNL.MOBILE-COMPOSITION-CREATIVE-LANGUAGE-PAGINATION-REFINEMENT2).
 * Reads the REAL runtime. Per family root × scenario × viewport it records:
 *   nav center vs viewport center · plus-control center · nav rect · content-rect bottom vs nav top ·
 *   visible elements under the nav · body (column) scroll · pagination state (screen count, panels per screen,
 *   split panels) · screenshot.
 * Usage: node scripts/jurnl/mobile-composition-qa.mjs <baseUrl> <outDir> <label> [viewports=mobile] [routes=all]
 *   label: before | after   viewports: mobile,tablet,desktop
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { qaChromiumPath } from './qa-env.mjs';

export const QA_VIEWPORTS = { mobile: [393, 852], tablet: [834, 1194], desktop: [1440, 900] };
export const FAMILY_ROOTS = [
  ['F03', 'today'],
  ['F04', 'activity'],
  ['F05', 'money'],
  ['F06', 'income'],
  ['F07', 'upcoming'],
  ['F08', 'plan'],
  ['F09', 'safe'],
  ['F10', 'purchases'],
  ['F11', 'trips'],
  ['F12', 'credit'],
  ['F13', 'paydown'],
  ['F14', 'goals'],
  ['F15', 'ahead'],
  ['F16', 'records'],
];

/** Seeds a realistic device through the app's own store modules (same Vite module instances as the runtime). */
export async function seedPopulated(page) {
  await page.evaluate(async () => {
    // Store ids are Date.now()-based: space the writes so two records never share a millisecond.
    const tick = () => new Promise((r) => setTimeout(r, 3));
    const im = (p) => import(/* @vite-ignore */ `/src/projects/jurnl/data/${p}`);
    const acc = await im('foundation/accountMutations.ts');
    const credit = await im('f12/creditStore.ts');
    const income = await im('f06/incomeStore.ts');
    const obl = await im('f07/obligationsStore.ts');
    const plan = await im('f08/planStore.ts');
    const goals = await im('f14/goalsStore.ts');
    const purchases = await im('f10/purchasesStore.ts');
    const trips = await im('f11/tripsStore.ts');
    const paydown = await im('f13/paydownStore.ts');
    const records = await im('f16/recordsStore.ts');
    acc.createManualAccount('EVERYDAY', 'CHECKING', 4200);
    await tick();
    acc.createManualAccount('RESERVE', 'SAVINGS', 9800);
    await tick();
    acc.createManualAccount('WALLET', 'CASH', 140);
    await tick();
    const card = acc.createManualAccount('STUDIO CARD', 'CREDIT_CARD', 1240);
    await tick();
    const loan = acc.createManualAccount('CAR LOAN', 'LOAN', 8400);
    await tick();
    credit.upsertCreditTerms(card.account_id, { credit_limit: 6000, current_balance: 1240, apr: 22.9, minimum_payment: 45, payment_due_day: 18 });
    await tick();
    credit.upsertCreditTerms(loan.account_id, { current_balance: 8400, apr: 6.4, minimum_payment: 310, payment_due_day: 2 });
    await tick();
    income.createIncomeSource({ source_name: 'STUDIO WORK', amount: 3200, cadence: 'MONTHLY', next_due_date: '2026-10-15' });
    await tick();
    obl.createObligation({ name: 'RENT', amount: 1800, cadence: 'MONTHLY', next_due_date: '2026-10-09', kind: 'BILL' });
    await tick();
    obl.createObligation({ name: 'PHONE', amount: 60, cadence: 'MONTHLY', next_due_date: '2026-10-12', kind: 'BILL' });
    await tick();
    obl.createObligation({ name: 'STREAMING', amount: 15, cadence: 'MONTHLY', next_due_date: '2026-10-20', kind: 'SUBSCRIPTION' });
    await tick();
    plan.createPlanIntention({ title: 'HOUSING', assigned_amount: 1800 });
    await tick();
    plan.createPlanIntention({ title: 'DAILY LIFE', assigned_amount: 600 });
    await tick();
    const g = goals.createGoal({ title: 'LISBON FUND', target_amount: 3000, horizon: 'THIS YEAR' });
    await tick();
    goals.setGoalAside(g.goal_id, 900);
    await tick();
    purchases.createPurchase({ title: 'LINEN SOFA', target_amount: 2400 });
    await tick();
    purchases.createPurchase({ title: 'CAMERA', target_amount: 900 });
    await tick();
    const t = trips.createTrip({ title: 'LISBON', destination: 'LISBON', target_budget: 2800 });
    await tick();
    trips.updateTrip({ ...t, reserved_amount: 900 });
    await tick();
    trips.createTrip({ title: 'ALPS', destination: 'CHAMONIX', target_budget: 1600 });
    await tick();
    paydown.upsertPaydownPlan({ strategy_type: 'AVALANCHE', extra_payment: 200 });
    await tick();
    for (const [title, type] of [
      ['SEPTEMBER STATEMENT', 'STATEMENT'],
      ['AUGUST STATEMENT', 'STATEMENT'],
      ['SOFA RECEIPT', 'RECEIPT'],
      ['CAMERA RECEIPT', 'RECEIPT'],
      ['2025 TAX RETURN', 'TAX'],
      ['LEASE', 'OTHER'],
      ['WARRANTY', 'OTHER'],
    ]) {
      records.createRecord({ title, record_type: type });
      await tick();
    }
  });
}

/** Geometry read from the live DOM. */
export async function measure(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const nav = document.querySelector('[data-jrn-zone="bottom-nav"]');
    const navRect = nav?.getBoundingClientRect() ?? null;
    const plus = nav?.querySelector('[data-jrn-trigger="nav-add"]')?.getBoundingClientRect() ?? null;
    const navButtons = nav ? [...nav.querySelectorAll('button')].map((b) => { const r = b.getBoundingClientRect(); return { id: b.dataset.jrnTrigger, x: Math.round(r.x * 10) / 10, w: Math.round(r.width * 10) / 10, cx: Math.round((r.x + r.width / 2) * 10) / 10 }; }) : [];
    const col = document.querySelector('.jrn-screen .jrn-col');
    const frameContent = document.querySelector('[data-jrn-zone="content-rect"]');
    const edge = document.querySelector('[data-jrn-zone="composition-edge"]');
    // The rect a person can actually see: the element box clipped by every overflow-clipping ancestor up to the column
    // (a row scrolled out of an oversize panel, or a panel parked off-screen, is not visible).
    const seenRect = (el) => {
      const r = el.getBoundingClientRect();
      let top = r.top;
      let bottom = r.bottom;
      for (let a = el.parentElement; a && a !== col; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.overflowY !== 'visible' || cs.overflowX !== 'visible') {
          const ar = a.getBoundingClientRect();
          top = Math.max(top, ar.top);
          bottom = Math.min(bottom, ar.bottom);
        }
      }
      return { top, bottom, width: r.width };
    };
    const visible = (el) => {
      if (el.closest('[data-jrn-stage="offscreen"]')) return false;
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) return false;
      const r = seenRect(el);
      return r.width > 0 && r.bottom - r.top > 0;
    };
    const leaves = col ? [...col.querySelectorAll('button, a, input, p, b, h1, h2, h3, li, small, span, [data-jrn-panel]')].filter((el) => !el.closest('[data-jrn-zone="bottom-nav"]') && visible(el)) : [];
    const navTop = navRect ? navRect.top : vh;
    const under = leaves.filter((el) => { const r = seenRect(el); return r.bottom > navTop + 0.5 && r.top < vh; }).map((el) => ({ tag: el.tagName, text: (el.textContent || '').trim().slice(0, 40), bottom: Math.round(seenRect(el).bottom) }));
    const offscreen = leaves.filter((el) => seenRect(el).top >= vh).length;
    const stack = document.querySelector('[data-jrn-stack]');
    const contentRect = frameContent?.getBoundingClientRect() ?? null;
    const panels = stack ? [...stack.querySelectorAll(':scope [data-jrn-panel-slot]')].map((el) => { const r = el.getBoundingClientRect(); return { id: el.dataset.jrnPanelSlot, screen: Number(el.dataset.jrnScreen), shown: el.dataset.jrnShown === 'true', oversize: el.dataset.jrnOversize === 'true', top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; }) : [];
    // A shown panel cut by the content rect is a clipped (split) panel. Oversize panels are clamped and scroll inside.
    const clipped = contentRect ? panels.filter((p) => p.shown && p.h > 0 && (p.top < contentRect.top - 0.5 || p.bottom > contentRect.bottom + 0.5)).map((p) => p.id) : [];
    return {
      viewport_px: [vw, vh],
      nav: navRect ? { x: Math.round(navRect.x * 10) / 10, w: Math.round(navRect.width * 10) / 10, top: Math.round(navRect.top), bottom: Math.round(navRect.bottom), center_offset: Math.round((navRect.x + navRect.width / 2 - vw / 2) * 10) / 10 } : null,
      plus_center_offset: plus ? Math.round((plus.x + plus.width / 2 - vw / 2) * 10) / 10 : null,
      nav_buttons: navButtons,
      column_scroll: col ? Math.max(0, col.scrollHeight - col.clientHeight) : null,
      content_rect: contentRect ? { top: Math.round(contentRect.top), bottom: Math.round(contentRect.bottom) } : null,
      edge: edge ? (() => { const r = edge.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; })() : null,
      under_nav: under,
      offscreen_below_viewport: offscreen,
      clipped_panels: clipped,
      stack: stack ? { screen_index: Number(stack.dataset.jrnScreenIndex), screen_count: Number(stack.dataset.jrnScreenCount), label: stack.getAttribute('aria-label'), panels } : null,
      family: document.querySelector('.jrn-screen')?.dataset.jrnFamily ?? null,
      archetype: document.querySelector('[data-jrn-archetype]')?.dataset.jrnArchetype ?? null,
      safe_area_rule: nav ? getComputedStyle(nav).bottom : null,
    };
  });
}

async function settle(page) {
  await page.waitForSelector('.jrn-screen', { timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(900);
}

/** Opens a route on a fresh device (optionally seeded). A route that never renders is recorded, not thrown. */
export async function openRoute(browser, baseUrl, route, [w, h], scenario) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  let rendered = true;
  try {
    await page.goto(`${baseUrl}/${route}?reset=1`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    if (scenario === 'populated') {
      await seedPopulated(page);
      await page.goto(`${baseUrl}/${route}`, { waitUntil: 'domcontentloaded' });
      await settle(page);
    }
  } catch {
    rendered = false;
  }
  return { context, page, errors, rendered };
}

async function main() {
  const [baseUrl, outDir, label, vpArg = 'mobile', routeArg = 'all'] = process.argv.slice(2);
  if (!baseUrl || !outDir || !label) throw new Error('usage: <baseUrl> <outDir> <label> [viewports] [routes]');
  const viewports = vpArg.split(',');
  const routes = routeArg === 'all' ? FAMILY_ROOTS : FAMILY_ROOTS.filter(([id, r]) => routeArg.split(',').includes(r) || routeArg.split(',').includes(id));
  const browser = await chromium.launch({ executablePath: qaChromiumPath() });
  const rows = [];
  for (const vp of viewports) {
    for (const scenario of ['empty', 'populated']) {
      const dir = join(outDir, label, vp, scenario);
      mkdirSync(dir, { recursive: true });
      for (const [family, route] of routes) {
        const { context, page, errors, rendered } = await openRoute(browser, baseUrl, route, QA_VIEWPORTS[vp], scenario);
        const shot = join(dir, `${family}_${route}.jpg`);
        if (!rendered) {
          await page.screenshot({ path: shot, type: 'jpeg', quality: 78 }).catch(() => {});
          rows.push({ label, viewport: vp, scenario, family, route, screenshot: shot, rendered: false, errors: [...new Set(errors)].slice(0, 3), under_nav: [], offscreen_below_viewport: 0 });
          await context.close();
          continue;
        }
        const m = await measure(page);
        await page.screenshot({ path: shot, type: 'jpeg', quality: 78 });
        rows.push({ label, viewport: vp, scenario, family, route, screenshot: shot, rendered: true, errors: [...new Set(errors)].slice(0, 3), ...m });
        await context.close();
      }
    }
  }
  await browser.close();
  const file = join(outDir, `${label}-measurements.json`);
  writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`);
  const summary = rows.map((r) => !r.rendered ? `${r.viewport.padEnd(7)} ${r.scenario.padEnd(9)} ${r.family} NOT_RENDERED ${r.errors?.[0] ?? ''}` : `${r.viewport.padEnd(7)} ${r.scenario.padEnd(9)} ${r.family} nav_off=${r.nav?.center_offset} plus_off=${r.plus_center_offset} under_nav=${r.under_nav.length} clipped=${r.clipped_panels?.length ?? 0} offscreen=${r.offscreen_below_viewport} col_scroll=${r.column_scroll} screens=${r.stack ? r.stack.screen_count : '-'}`);
  console.log(summary.join('\n'));
}

if (process.argv[1] && process.argv[1].endsWith('mobile-composition-qa.mjs')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
