/**
 * JURNL MOBILE PAGINATION + NAV GEOMETRY QA (P0.JURNL.MOBILE-COMPOSITION-CREATIVE-LANGUAGE-PAGINATION-REFINEMENT2).
 * Drives the REAL runtime: NEXT / context-aware BACK / 3+ screens / oversize panel / dynamic expansion / dynamic data
 * change on a continuation screen / keyboard freeze / safe area / nav centering on every screen.
 * Usage: node scripts/jurnl/mobile-pagination-qa.mjs <baseUrl> <outDir>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { QA_VIEWPORTS, measure, openRoute } from './mobile-composition-qa.mjs';
import { qaChromiumPath } from './qa-env.mjs';

const MOBILE = QA_VIEWPORTS.mobile;

/** Frame state + no-split / no-clip proof for the screen currently shown. */
async function frameState(page) {
  return page.evaluate(() => {
    const stack = document.querySelector('[data-jrn-stack]');
    if (!stack) return null;
    const content = stack.getBoundingClientRect();
    const edge = document.querySelector('[data-jrn-zone="composition-edge"]').getBoundingClientRect();
    const nav = document.querySelector('[data-jrn-zone="bottom-nav"]').getBoundingClientRect();
    const slots = [...stack.querySelectorAll('[data-jrn-panel-slot]')];
    const shown = slots.filter((s) => s.dataset.jrnShown === 'true');
    const split = shown
      .filter((s) => s.getBoundingClientRect().height > 0)
      .filter((s) => {
        const r = s.getBoundingClientRect();
        // An oversize panel is clamped to the rect and scrolls inside itself; anything else must sit wholly inside.
        return r.top < content.top - 0.5 || r.bottom > content.bottom + 0.5;
      })
      .map((s) => s.dataset.jrnPanelSlot);
    const hiddenInteractive = slots
      .filter((s) => s.dataset.jrnShown !== 'true')
      .filter((s) => s.getAttribute('aria-hidden') !== 'true' || !s.inert).length;
    const next = document.querySelector('[data-jrn-trigger="frame-next"]');
    const back = document.querySelector('.jrn-frame .jrn-home__top [data-jrn-trigger$="-back"]');
    const active = document.activeElement;
    return {
      index: Number(stack.dataset.jrnScreenIndex),
      count: Number(stack.dataset.jrnScreenCount),
      region_label: stack.getAttribute('aria-label'),
      live: document.querySelector('.jrn-frame__live')?.textContent ?? '',
      caption: document.querySelector('[data-jrn-zone="continuation-caption"]')?.textContent ?? null,
      next_label: next?.getAttribute('aria-label') ?? null,
      back_label: back?.getAttribute('aria-label') ?? null,
      focus_on_region: active === stack,
      shown_panels: shown.map((s) => s.dataset.jrnPanelSlot),
      panel_screens: slots.map((s) => [s.dataset.jrnPanelSlot, Number(s.dataset.jrnScreen)]),
      oversize: slots.filter((s) => s.dataset.jrnOversize === 'true').map((s) => ({ id: s.dataset.jrnPanelSlot, scroll_h: s.scrollHeight, client_h: s.clientHeight, overflow_y: getComputedStyle(s).overflowY })),
      split_or_clipped_panels: split,
      offscreen_not_inert: hiddenInteractive,
      content_bottom: Math.round(content.bottom),
      edge_top: Math.round(edge.top),
      edge_bottom: Math.round(edge.bottom),
      nav_top: Math.round(nav.top),
      nav_rect: { x: Math.round(nav.x * 10) / 10, w: Math.round(nav.width * 10) / 10, top: Math.round(nav.top), bottom: Math.round(nav.bottom) },
      edge_clear_of_nav: edge.bottom <= nav.top + 0.5,
      path: location.pathname,
      history_length: history.length,
    };
  });
}

const clickNext = (page) => page.click('[data-jrn-trigger="frame-next"]').then(() => page.waitForTimeout(450));
const clickBack = (page) => page.click('.jrn-frame .jrn-home__top [data-jrn-trigger$="-back"]').then(() => page.waitForTimeout(450));

async function seedRecords(page, counts) {
  await page.evaluate(async (c) => {
    const records = await import(/* @vite-ignore */ '/src/projects/jurnl/data/f16/recordsStore.ts');
    const tick = () => new Promise((r) => setTimeout(r, 3));
    for (const [type, n] of Object.entries(c)) {
      for (let i = 1; i <= n; i++) {
        records.createRecord({ title: `${type} ${String(i).padStart(2, '0')}`, record_type: type });
        await tick();
      }
    }
  }, counts);
}

/** Draws the viewport center line + plus center marker so the screenshot itself is the centering proof. */
async function drawCenterProof(page) {
  await page.evaluate(() => {
    const plus = document.querySelector('[data-jrn-trigger="nav-add"]').getBoundingClientRect();
    const line = document.createElement('div');
    line.setAttribute('data-qa-overlay', '');
    line.style.cssText = 'position:fixed;top:0;bottom:0;left:50%;width:1px;margin-left:-0.5px;background:rgba(220,30,60,.9);z-index:9999;pointer-events:none';
    const mark = document.createElement('div');
    mark.setAttribute('data-qa-overlay', '');
    mark.style.cssText = `position:fixed;top:${plus.top - 6}px;left:${plus.left + plus.width / 2 - 0.5}px;width:1px;height:${plus.height + 12}px;background:rgba(20,120,220,.95);z-index:9999;pointer-events:none`;
    document.body.append(line, mark);
  });
}

async function run() {
  const [baseUrl, outDir] = process.argv.slice(2);
  if (!baseUrl || !outDir) throw new Error('usage: <baseUrl> <outDir>');
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: qaChromiumPath() });
  const cases = [];
  const shot = (page, name) => page.screenshot({ path: join(outDir, `${name}.jpg`), type: 'jpeg', quality: 80 });
  const record = (name, pass, data) => {
    cases.push({ case: name, pass, ...data });
    console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
  };

  // 1 ── ALL FIT: one screen, no NEXT, no marks, no caption.
  {
    const { context, page } = await openRoute(browser, baseUrl, 'safe', MOBILE, 'empty');
    const s = await frameState(page);
    const m = await measure(page);
    record('ALL_FIT_F09_EMPTY', s.count === 1 && !s.next_label && !s.caption && s.split_or_clipped_panels.length === 0 && m.under_nav.length === 0 && m.column_scroll === 0, { state: s });
    await context.close();
  }

  // 2 ── OVERFLOW ONE PANEL (F05 populated): NEXT → screen 2, BACK → screen 1, BACK → route back. No history entries.
  {
    const { context, page } = await openRoute(browser, baseUrl, 'money', MOBILE, 'populated');
    const s1 = await frameState(page);
    await shot(page, 'continuation_F05_screen1');
    await clickNext(page);
    const s2 = await frameState(page);
    const m2 = await measure(page);
    await shot(page, 'continuation_F05_screen2');
    await clickBack(page);
    const s1b = await frameState(page);
    await clickBack(page);
    const after = await page.evaluate(() => location.pathname);
    const pass =
      s1.count === 2 &&
      s1.split_or_clipped_panels.length === 0 &&
      s2.index === 1 &&
      s2.split_or_clipped_panels.length === 0 &&
      s2.region_label.endsWith('SCREEN 2 OF 2') &&
      s2.live === 'SCREEN 2 OF 2' &&
      s2.caption?.includes('CONTINUED') &&
      s2.next_label === null &&
      s2.back_label === 'BACK TO SCREEN 1' &&
      s2.focus_on_region &&
      s2.path === s1.path &&
      s2.history_length === s1.history_length &&
      JSON.stringify(s2.nav_rect) === JSON.stringify(s1.nav_rect) &&
      m2.under_nav.length === 0 &&
      s1b.index === 0 &&
      s1b.back_label !== 'BACK TO SCREEN 1' &&
      after !== s1.path;
    record('OVERFLOW_ONE_PANEL_F05_NEXT_BACK', pass, { screen1: s1, screen2: s2, back_to_screen1: s1b, route_after_second_back: after });
    await context.close();
  }

  // 3 ── OVERFLOW MULTIPLE PANELS → 3+ CONTINUATION SCREENS (F16 with a full archive).
  {
    const { context, page } = await openRoute(browser, baseUrl, 'records', MOBILE, 'empty');
    await seedRecords(page, { STATEMENT: 5, RECEIPT: 5, INVOICE: 3, PAYSTUB: 3, TAX: 3, OTHER: 4 });
    await page.goto(`${baseUrl}/records`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-jrn-stack]');
    await page.waitForTimeout(900);
    const screens = [await frameState(page)];
    await shot(page, 'multiscreen_F16_screen1');
    for (let i = 1; i < screens[0].count; i++) {
      await clickNext(page);
      screens.push(await frameState(page));
      await shot(page, `multiscreen_F16_screen${i + 1}`);
    }
    const order = screens[0].panel_screens.map(([id]) => id);
    const seen = screens.flatMap((s) => s.shown_panels);
    const backs = [];
    for (let i = screens.length - 1; i > 0; i--) {
      await clickBack(page);
      backs.push((await frameState(page)).index);
    }
    await clickBack(page);
    const after = await page.evaluate(() => location.pathname);
    const navRects = new Set(screens.map((s) => JSON.stringify(s.nav_rect)));
    const pass =
      screens[0].count >= 3 &&
      screens.every((s, i) => s.index === i && s.split_or_clipped_panels.length === 0 && s.offscreen_not_inert === 0 && s.edge_clear_of_nav) &&
      JSON.stringify(seen) === JSON.stringify(order) &&
      new Set(seen).size === order.length &&
      screens.at(-1).next_label === null &&
      navRects.size === 1 &&
      JSON.stringify(backs) === JSON.stringify([...Array(screens.length - 1).keys()].reverse()) &&
      after !== screens[0].path;
    record('THREE_PLUS_SCREENS_F16', pass, { screen_count: screens[0].count, screens, back_sequence: backs, route_after_last_back: after });
    await context.close();
  }

  // 4 ── OVERSIZE PANEL: one folder taller than the whole rect gets its own screen and scrolls inside itself; stable.
  {
    const { context, page } = await openRoute(browser, baseUrl, 'records', MOBILE, 'empty');
    await seedRecords(page, { STATEMENT: 26, RECEIPT: 2 });
    await page.goto(`${baseUrl}/records`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-jrn-stack]');
    await page.waitForTimeout(900);
    const mutations = await page.evaluate(
      () =>
        new Promise((resolve) => {
          let n = 0;
          const obs = new MutationObserver((list) => (n += list.length));
          obs.observe(document.querySelector('[data-jrn-stack]'), { subtree: true, attributes: true, attributeFilter: ['data-jrn-screen', 'data-jrn-oversize', 'data-jrn-screen-count'] });
          setTimeout(() => (obs.disconnect(), resolve(n)), 1500);
        }),
    );
    const s1 = await frameState(page);
    let target = s1;
    while (!target.shown_panels.includes('folder-STATEMENT') && target.index < target.count - 1) {
      await clickNext(page);
      target = await frameState(page);
    }
    const m = await measure(page);
    await shot(page, 'oversize_F16_statement_folder');
    const scrolled = await page.evaluate(() => {
      const el = document.querySelector('[data-jrn-panel-slot="folder-STATEMENT"]');
      el.scrollTop = 200;
      return el.scrollTop;
    });
    const o = target.oversize.find((x) => x.id === 'folder-STATEMENT');
    const pass = !!o && o.scroll_h > o.client_h && o.overflow_y === 'auto' && scrolled > 0 && m.column_scroll === 0 && m.under_nav.length === 0 && mutations === 0;
    record('OVERSIZE_PANEL_INTERNAL_SCROLL_F16', pass, { screen: target, attribute_mutations_while_idle_1500ms: mutations, inner_scroll_top_after_scroll: scrolled, column_scroll: m.column_scroll });
    await context.close();
  }

  // 5 ── DYNAMIC EXPANSION (search → no-results message) re-paginates; nothing slides under the nav.
  {
    const { context, page } = await openRoute(browser, baseUrl, 'records', MOBILE, 'populated');
    const before = await frameState(page);
    await page.fill('[data-jrn-trigger="records-find"] input, input[data-jrn-trigger="records-find"]', 'ZZZ NOTHING');
    await page.waitForTimeout(500);
    await page.locator('[data-jrn-trigger="records-find"] input, input[data-jrn-trigger="records-find"]').first().blur();
    await page.waitForTimeout(500);
    const none = await frameState(page);
    const mNone = await measure(page);
    await shot(page, 'dynamic_F16_no_results');
    await page.fill('[data-jrn-trigger="records-find"] input, input[data-jrn-trigger="records-find"]', '');
    await page.locator('[data-jrn-trigger="records-find"] input, input[data-jrn-trigger="records-find"]').first().blur();
    await page.waitForTimeout(600);
    const restored = await frameState(page);
    const pass = before.count >= 2 && none.count === 1 && none.shown_panels.includes('no-results') && none.split_or_clipped_panels.length === 0 && mNone.under_nav.length === 0 && restored.count === before.count;
    record('DYNAMIC_EXPANSION_SEARCH_NO_RESULTS_F16', pass, { before: before.count, no_results: none, restored: restored.count });
    await context.close();
  }

  // 6 ── DYNAMIC DATA CHANGE while reading screen 2: the panel being read stays on screen; nothing clips.
  {
    const { context, page } = await openRoute(browser, baseUrl, 'money', MOBILE, 'populated');
    await clickNext(page);
    const s2 = await frameState(page);
    const anchor = s2.shown_panels.find((id) => !id.startsWith('panel-')) ?? s2.shown_panels[0];
    await page.evaluate(async () => {
      const acc = await import(/* @vite-ignore */ '/src/projects/jurnl/data/foundation/accountMutations.ts');
      const tick = () => new Promise((r) => setTimeout(r, 3));
      for (const [n, k, v] of [['TRAVEL POT', 'SAVINGS', 1200], ['JAR', 'CASH', 60], ['BROKERAGE', 'INVESTMENT', 5000]]) {
        acc.createManualAccount(n, k, v);
        await tick();
      }
    });
    await page.waitForTimeout(900);
    const after = await frameState(page);
    const m = await measure(page);
    const pass = after.shown_panels.includes(anchor) && after.split_or_clipped_panels.length === 0 && m.under_nav.length === 0 && m.column_scroll === 0 && after.path === s2.path;
    record('DYNAMIC_DATA_CHANGE_ON_SCREEN_2_F05', pass, { anchor, before: s2, after });
    await context.close();
  }

  // 7 ── KEYBOARD: a focused field + a shrunken viewport freezes pagination; blur + restore returns the same layout.
  {
    const { context, page } = await openRoute(browser, baseUrl, 'records', MOBILE, 'populated');
    const before = await frameState(page);
    await page.focus('[data-jrn-trigger="records-find"] input, input[data-jrn-trigger="records-find"]');
    await page.setViewportSize({ width: MOBILE[0], height: 520 });
    await page.waitForTimeout(600);
    const typing = await frameState(page);
    await page.locator('[data-jrn-trigger="records-find"] input, input[data-jrn-trigger="records-find"]').first().blur();
    await page.setViewportSize({ width: MOBILE[0], height: MOBILE[1] });
    await page.waitForTimeout(700);
    const restored = await frameState(page);
    const pass = typing.count === before.count && typing.index === before.index && JSON.stringify(restored.panel_screens) === JSON.stringify(before.panel_screens) && restored.count === before.count;
    record('KEYBOARD_DOES_NOT_REPAGINATE_F16', pass, { before: before.panel_screens, while_typing: typing.panel_screens, restored: restored.panel_screens });
    await context.close();
  }

  // 8 ── NAV CENTERING on every root, empty + populated, and on every continuation screen.
  {
    const rows = [];
    for (const scenario of ['empty', 'populated']) {
      for (const route of ['today', 'activity', 'money', 'income', 'upcoming', 'plan', 'safe', 'purchases', 'trips', 'credit', 'paydown', 'goals', 'ahead', 'records']) {
        const { context, page } = await openRoute(browser, baseUrl, route, MOBILE, scenario);
        const m = await measure(page);
        rows.push({ route, scenario, screen: 1, nav: m.nav, plus: m.plus_center_offset, buttons: m.nav_buttons.map((b) => b.w) });
        let s = await frameState(page);
        while (s && s.index < s.count - 1) {
          await clickNext(page);
          s = await frameState(page);
          const mm = await measure(page);
          rows.push({ route, scenario, screen: s.index + 1, nav: mm.nav, plus: mm.plus_center_offset, buttons: mm.nav_buttons.map((b) => b.w) });
        }
        if (scenario === 'populated' && ['money', 'safe', 'trips', 'records'].includes(route)) {
          if (s && s.count > 1) {
            // proof on the continuation screen itself
          }
          await drawCenterProof(page);
          await shot(page, `nav_center_${route}_screen${s ? s.index + 1 : 1}`);
        }
        await context.close();
      }
    }
    const rects = new Set(rows.map((r) => JSON.stringify(r.nav)));
    const widths = new Set(rows.flatMap((r) => r.buttons));
    const pass = rows.every((r) => r.nav.center_offset === 0 && r.plus === 0) && rects.size === 1 && widths.size === 1;
    record('NAV_CENTERED_ALL_ROOTS_ALL_SCREENS_MOBILE', pass, { distinct_nav_rects: [...rects], distinct_button_widths: [...widths], rows });
  }

  // 9 ── SAFE AREA: emulate a 34px home indicator; the dock lifts by exactly the inset and the reserve grows with it.
  {
    const { context, page } = await openRoute(browser, baseUrl, 'money', MOBILE, 'populated');
    const base = await page.evaluate(() => ({ nav_bottom_gap: innerHeight - document.querySelector('[data-jrn-zone="bottom-nav"]').getBoundingClientRect().bottom, reserve: document.querySelector('.jrn-frame__navspace').getBoundingClientRect().height }));
    const cdp = await context.newCDPSession(page);
    let supported = true;
    try {
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 47, bottom: 34 } });
    } catch (e) {
      supported = false;
    }
    await page.waitForTimeout(700);
    const inset = await page.evaluate(() => ({ nav_bottom_gap: innerHeight - document.querySelector('[data-jrn-zone="bottom-nav"]').getBoundingClientRect().bottom, reserve: document.querySelector('.jrn-frame__navspace').getBoundingClientRect().height, rule: getComputedStyle(document.querySelector('[data-jrn-zone="bottom-nav"]')).bottom }));
    const s = await frameState(page);
    const m = await measure(page);
    if (supported) await shot(page, 'safe_area_F05_inset34');
    const lifted = Math.round(inset.nav_bottom_gap - base.nav_bottom_gap);
    const grown = Math.round(inset.reserve - base.reserve);
    const pass = supported ? lifted === 34 && grown === 34 && s.edge_clear_of_nav && m.under_nav.length === 0 && m.nav.center_offset === 0 : false;
    record('SAFE_AREA_INSET_EMULATED', pass, { cdp_override_supported: supported, base, inset, nav_lift_px: lifted, reserve_growth_px: grown, frame: s });
    await context.close();
  }

  // 10 ── TABLET + DESKTOP continuation (regression): NEXT/BACK still work, nav stays centered.
  for (const vp of ['tablet', 'desktop']) {
    const { context, page } = await openRoute(browser, baseUrl, 'ahead', QA_VIEWPORTS[vp], 'populated');
    const s1 = await frameState(page);
    let s2 = s1;
    if (s1.count > 1) {
      await clickNext(page);
      s2 = await frameState(page);
      await shot(page, `continuation_F15_${vp}_screen2`);
      await clickBack(page);
    }
    const s1b = await frameState(page);
    const m = await measure(page);
    const pass = s1.count >= 1 && (s1.count === 1 || (s2.index === 1 && s1b.index === 0 && s2.split_or_clipped_panels.length === 0)) && m.nav.center_offset === 0 && m.plus_center_offset === 0 && m.under_nav.length === 0;
    record(`CONTINUATION_${vp.toUpperCase()}_F15`, pass, { count: s1.count, screen2: s2, back: s1b.index });
    await context.close();
  }

  await browser.close();
  writeFileSync(join(outDir, 'pagination-qa.json'), `${JSON.stringify(cases, null, 2)}\n`);
  const failed = cases.filter((c) => !c.pass).length;
  console.log(`${cases.length - failed}/${cases.length} PASS`);
  if (failed) process.exitCode = 1;
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
