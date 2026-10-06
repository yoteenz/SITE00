/**
 * JURNL CENTER-STAGE QA (P0.JURNL.MOBILE-COMPOSITION.CENTER-STAGE-NAV-ALIGNED-REFINEMENT3).
 * Reads the REAL runtime. For every material mobile route it records:
 *   product nav present · declared composition mode (data-jrn-composition) · nav footprint + `+` axis ·
 *   content field (union of visible surfaces + text ink, area-weighted centroid) vs the nav footprint ·
 *   left-column drift · bottom-nav clearance · and, with the UI hidden, the rendered background salience inside the
 *   CENTER_STAGE safe zone vs the perimeter (edge energy + saturation + bright-window luminance).
 * Usage: node scripts/jurnl/center-stage-qa.mjs <baseUrl> <outDir> <label> [viewports=mobile] [filter]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { openRoute } from './mobile-composition-qa.mjs';
import { qaChromiumPath } from './qa-env.mjs';

export const CS_VIEWPORTS = { mobile: [393, 852], mobile_s: [360, 780], mobile_l: [430, 932], tablet: [834, 1194], desktop: [1440, 900] };

const PRODUCT = [
  ['F03', 'F03.00', 'today'],
  ['F04', 'F04.00', 'activity'],
  ['GS', 'GS.SETTINGS', 'account'],
  ['F05', 'F05.00', 'money'],
  ['F05', 'F05.PLACES', 'money/places'],
  ['F05', 'F05.PLACE', 'money/places/:account'],
  ['F06', 'F06.00', 'income'],
  ['F06', 'F06.SOURCE', 'income/:income'],
  ['F07', 'F07.00', 'upcoming'],
  ['F07', 'F07.ITEM', 'upcoming/:obligation'],
  ['F08', 'F08.00', 'plan'],
  ['F08', 'F08.INTENTION', 'plan/:intention'],
  ['F09', 'F09.00', 'safe'],
  ['F09', 'F09.WHY', 'safe/why'],
  ['F10', 'F10.00', 'purchases'],
  ['F10', 'F10.OBJECT', 'purchases/:purchase'],
  ['F11', 'F11.00', 'trips'],
  ['F11', 'F11.TRIP', 'trips/:trip'],
  ['F12', 'F12.00', 'credit'],
  ['F12', 'F12.ACCOUNT', 'credit/:credit'],
  ['F13', 'F13.00', 'paydown'],
  ['F13', 'F13.WHAT_IF', 'paydown/what-if'],
  ['F14', 'F14.00', 'goals'],
  ['F14', 'F14.GOAL', 'goals/:goal'],
  ['F15', 'F15.00', 'ahead'],
  ['F15', 'F15.BRANCH', 'ahead/base'],
  ['F16', 'F16.00', 'records'],
  ['F16', 'F16.DOCUMENT', 'records/:record'],
  ['BOARD', 'F05_F16.BOARD', 'parents'],
];
export const CS_TARGETS = ['F03', 'F05', 'F09', 'F10', 'F11', 'F13', 'F15', 'F16'];

/** Real ids for child routes, read from the app's own stores after seeding. */
async function childIds(page) {
  return page.evaluate(async () => {
    const im = (p) => import(/* @vite-ignore */ `/src/projects/jurnl/data/${p}`);
    const [acc, inc, obl, plan, pur, trips, goals, recs] = await Promise.all([im('foundation/accounts.ts'), im('f06/incomeStore.ts'), im('f07/obligationsStore.ts'), im('f08/planStore.ts'), im('f10/purchasesStore.ts'), im('f11/tripsStore.ts'), im('f14/goalsStore.ts'), im('f16/recordsStore.ts')]);
    const accounts = acc.listActiveAccounts();
    return {
      account: accounts.find((a) => a.account_type === 'CHECKING')?.account_id ?? accounts[0]?.account_id,
      credit: acc.creditAccounts()[0]?.account_id,
      income: inc.listIncome()[0]?.income_id,
      obligation: obl.listObligations()[0]?.obligation_id,
      intention: plan.listPlanIntentions()[0]?.plan_id,
      purchase: pur.listPurchases()[0]?.purchase_id,
      trip: trips.listTrips()[0]?.trip_id,
      goal: goals.listGoals()[0]?.goal_id,
      record: recs.listRecords()[0]?.record_id,
    };
  });
}

async function entryRoutes(page) {
  return page.evaluate(async () => {
    const f01 = await import(/* @vite-ignore */ '/src/projects/jurnl/data/f01/screens.ts');
    const f02 = await import(/* @vite-ignore */ '/src/projects/jurnl/data/f02/screens.ts');
    return [...f01.F01_SCREENS.map((s) => ['F01', s.id, s.route]), ...f02.F02_SCREENS.map((s) => ['F02', s.id, s.route])];
  });
}

/** Composition geometry from the live DOM. */
export async function composition(page) {
  return page.evaluate(() => {
    const vw = innerWidth;
    const vh = innerHeight;
    const screen = document.querySelector('.jrn-screen');
    const col = screen?.querySelector('.jrn-col');
    const navEl = document.querySelector('[data-jrn-zone="bottom-nav"]');
    const nav = navEl ? navEl.getBoundingClientRect() : null;
    const plus = navEl?.querySelector('[data-jrn-trigger="nav-add"]')?.getBoundingClientRect() ?? null;
    const rect = document.querySelector('[data-jrn-zone="content-rect"]')?.getBoundingClientRect() ?? null;
    const edge = document.querySelector('[data-jrn-zone="composition-edge"]')?.getBoundingClientRect() ?? null;
    const overlayOpen = !!document.querySelector('[data-jrn-overlay]');
    const alpha = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return 0;
      const p = m[1].split(',').map(Number);
      return p.length === 4 ? p[3] : 1;
    };
    const hidden = (el) => !!el.closest('[data-jrn-stage="offscreen"], [aria-hidden="true"]');
    const clip = (r) => {
      // clip to the viewport and to the column
      const top = Math.max(r.top, 0);
      const bottom = Math.min(r.bottom, nav ? nav.top : vh);
      return { left: Math.max(r.left, 0), right: Math.min(r.right, vw), top, bottom };
    };
    const boxes = [];
    const fieldRoot = document.querySelector('[data-jrn-zone="content-rect"]') ?? col;
    if (col) {
      for (const el of fieldRoot.querySelectorAll('*')) {
        if (hidden(el) || el.closest('[data-jrn-zone="bottom-nav"]')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) continue;
        const surface = alpha(cs.backgroundColor) > 0.35 || (cs.borderTopWidth !== '0px' && alpha(cs.borderTopColor) > 0.3 && el.children.length > 0);
        const control = /^(BUTTON|INPUT|A)$/.test(el.tagName);
        if (surface || control) {
          const r = el.getBoundingClientRect();
          if (r.width > 4 && r.height > 4) boxes.push(clip(r));
        }
      }
      // text ink
      const walker = document.createTreeWalker(fieldRoot, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim() || hidden(n.parentElement) || n.parentElement.closest('[data-jrn-zone="bottom-nav"]')) continue;
        const cs = getComputedStyle(n.parentElement);
        if (cs.visibility === 'hidden') continue;
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) boxes.push(clip(r));
      }
    }
    // rasterize to a 3px grid: coverage, bbox, centroid
    const G = 3;
    const gw = Math.ceil(vw / G);
    const gh = Math.ceil(vh / G);
    const grid = new Uint8Array(gw * gh);
    for (const b of boxes) {
      if (b.right <= b.left || b.bottom <= b.top) continue;
      for (let y = Math.floor(b.top / G); y < Math.ceil(b.bottom / G); y++) for (let x = Math.floor(b.left / G); x < Math.ceil(b.right / G); x++) grid[y * gw + x] = 1;
    }
    let n = 0;
    let sx = 0;
    let minX = vw;
    let maxX = 0;
    let minY = vh;
    let maxY = 0;
    // exclude the top chrome row (icon buttons) from the field: it is shared chrome, not the functional field
    const chromeEl = col?.querySelector('[data-jrn-zone="chrome"]');
    const chromeBottom = chromeEl ? chromeEl.getBoundingClientRect().bottom : 0;
    for (let y = 0; y < gh; y++)
      for (let x = 0; x < gw; x++)
        if (grid[y * gw + x] && y * G >= chromeBottom) {
          n++;
          sx += x * G + G / 2;
          minX = Math.min(minX, x * G);
          maxX = Math.max(maxX, x * G + G);
          minY = Math.min(minY, y * G);
          maxY = Math.max(maxY, y * G + G);
        }
    const field = n ? { left: minX, right: maxX, top: minY, bottom: maxY, width: maxX - minX, centroid_x: Math.round((sx / n) * 10) / 10, coverage_px: n * G * G } : null;
    const axis = plus ? plus.x + plus.width / 2 : vw / 2;
    const r1 = (v) => Math.round(v * 10) / 10;
    return {
      viewport_px: [vw, vh],
      screen_id: screen?.dataset.jrnScreen ?? null,
      family: screen?.dataset.jrnFamily ?? null,
      composition: screen?.dataset.jrnComposition ?? null,
      archetype: document.querySelector('[data-jrn-archetype]')?.dataset.jrnArchetype ?? null,
      has_product_nav: !!navEl,
      overlay_open: overlayOpen,
      nav: nav ? { left: r1(nav.left), right: r1(nav.right), width: r1(nav.width), top: r1(nav.top) } : null,
      axis_x: r1(axis),
      field,
      field_vs_nav: field && nav ? { left_delta: r1(field.left - nav.left), right_delta: r1(nav.right - field.right), width_ratio: r1((field.width / nav.width) * 100) / 100, center_offset: r1((field.left + field.right) / 2 - axis), centroid_offset: r1(field.centroid_x - axis) } : null,
      content_rect: rect ? { left: r1(rect.left), right: r1(rect.right), top: r1(rect.top), bottom: r1(rect.bottom) } : null,
      edge: edge ? { top: r1(edge.top), bottom: r1(edge.bottom) } : null,
      clearance_px: nav && field ? r1(nav.top - field.bottom) : null,
      chrome_bottom: r1(chromeBottom),
    };
  });
}

/** Rendered background salience with the UI hidden. Returns stats for the safe zone vs the perimeter. */
export async function backgroundSalience(page, zone, heatmapPath) {
  await page.addStyleTag({ content: '.jrn-col,.jrn-nav-host,.jrn-overlay-host,[data-jrn-zone="bottom-nav"]{visibility:hidden!important}' });
  await page.waitForTimeout(250);
  const png = await page.screenshot({ type: 'png' });
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const L = new Float32Array(W * H);
  const sat = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 3] / 255;
    const g = data[i * 3 + 1] / 255;
    const b = data[i * 3 + 2] / 255;
    L[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    sat[i] = mx > 0 ? (mx - mn) / mx : 0;
  }
  // Sobel edge magnitude, then a 9px box mean = local visual frequency
  const E = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const p = (dx, dy) => L[(y + dy) * W + x + dx];
      const gx = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
      const gy = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
      E[y * W + x] = Math.hypot(gx, gy);
    }
  const R = 4;
  const Eb = new Float32Array(W * H);
  const tmp = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    let s = 0;
    for (let x = -R; x < W + R; x++) {
      if (x + R < W) s += E[y * W + x + R] ?? 0;
      if (x - R - 1 >= 0) s -= E[y * W + x - R - 1];
      if (x >= 0 && x < W) tmp[y * W + x] = s / (2 * R + 1);
    }
  }
  for (let x = 0; x < W; x++) {
    let s = 0;
    for (let y = -R; y < H + R; y++) {
      if (y + R < H) s += tmp[(y + R) * W + x];
      if (y - R - 1 >= 0) s -= tmp[(y - R - 1) * W + x];
      if (y >= 0 && y < H) Eb[y * W + x] = s / (2 * R + 1);
    }
  }
  // fixed normalisers so families are comparable
  const S = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const e = Math.min(1, Eb[i] / 0.35);
    const c = Math.min(1, Math.max(0, sat[i] - 0.18) / 0.35);
    const bright = Math.min(1, Math.max(0, L[i] - 0.9) / 0.08);
    S[i] = Math.min(1, 0.55 * e + 0.3 * c + 0.15 * bright);
  }
  const inZone = (x, y) => x >= zone.left && x < zone.right && y >= zone.top && y < zone.bottom;
  const core = { left: zone.left + (zone.right - zone.left) * 0.12, right: zone.right - (zone.right - zone.left) * 0.12, top: zone.top + (zone.bottom - zone.top) * 0.06, bottom: zone.bottom - (zone.bottom - zone.top) * 0.06 };
  const inCore = (x, y) => x >= core.left && x < core.right && y >= core.top && y < core.bottom;
  const acc = () => ({ n: 0, s: 0, hot: 0, bright: 0, colour: 0, edge: 0 });
  const z = acc();
  const c = acc();
  const p = acc();
  const quad = { tl: acc(), tr: acc(), bl: acc(), br: acc() };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const add = (a) => {
        a.n++;
        a.s += S[i];
        if (S[i] > 0.42) a.hot++;
        if (L[i] > 0.93) a.bright++;
        if (sat[i] > 0.45) a.colour++;
        a.edge += Eb[i];
      };
      if (inZone(x, y)) {
        add(z);
        if (inCore(x, y)) add(c);
      } else add(p);
      add(quad[(y < H / 2 ? 't' : 'b') + (x < W / 2 ? 'l' : 'r')]);
    }
  const fin = (a) => ({ mean: Math.round((a.s / a.n) * 1000) / 1000, hot_share: Math.round((a.hot / a.n) * 1000) / 1000, bright_share: Math.round((a.bright / a.n) * 1000) / 1000, colour_share: Math.round((a.colour / a.n) * 1000) / 1000, edge_density: Math.round((a.edge / a.n) * 1000) / 1000 });
  if (heatmapPath) {
    const out = Buffer.alloc(W * H * 3);
    for (let i = 0; i < W * H; i++) {
      const v = Math.round(S[i] * 255);
      out[i * 3] = v;
      out[i * 3 + 1] = Math.round(v * 0.35);
      out[i * 3 + 2] = 255 - v;
    }
    const zoneSvg = `<svg width="${W}" height="${H}"><rect x="${zone.left}" y="${zone.top}" width="${zone.right - zone.left}" height="${zone.bottom - zone.top}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/></svg>`;
    await sharp(out, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: Buffer.from(zoneSvg) }]).jpeg({ quality: 80 }).toFile(heatmapPath);
    await sharp(png).jpeg({ quality: 80 }).toFile(heatmapPath.replace(/_heat\.jpg$/, '_plate.jpg'));
  }
  const zs = fin(z);
  const ps = fin(p);
  const cs = fin(c);
  return { zone, safe_zone: zs, safe_core: cs, perimeter: ps, quadrants: Object.fromEntries(Object.entries(quad).map(([k, v]) => [k, fin(v)])), centre_to_perimeter_ratio: ps.mean ? Math.round((zs.mean / ps.mean) * 100) / 100 : null };
}

async function main() {
  const [baseUrl, outDir, label, vpArg = 'mobile', filter = ''] = process.argv.slice(2);
  if (!baseUrl || !outDir || !label) throw new Error('usage: <baseUrl> <outDir> <label> [viewports] [filter]');
  const browser = await chromium.launch({ executablePath: qaChromiumPath() });
  const rows = [];
  // route lists (entry routes + real child ids)
  const probe = await openRoute(browser, baseUrl, 'today', CS_VIEWPORTS.mobile, 'populated');
  const ids = await childIds(probe.page);
  const entry = await entryRoutes(probe.page);
  await probe.context.close();
  void ids;
  const routes = [...entry.map(([f, id, r]) => [f, id, r, 'empty']), ...PRODUCT.map(([f, id, r]) => [f, id, r, 'populated'])].filter(([f, id, r]) => !filter || filter.split(',').some((x) => id.startsWith(x) || f === x || r === x));
  for (const vp of vpArg.split(',')) {
    const dir = join(outDir, label, vp);
    mkdirSync(dir, { recursive: true });
    for (const [family, screenId, route, scenario] of routes) {
      // Device data is per browser context: a child route resolves its id inside the context that was seeded.
      const param = route.includes(':');
      const opened = await openRoute(browser, baseUrl, param ? 'today' : route, CS_VIEWPORTS[vp], scenario);
      const { context, page, errors } = opened;
      let { rendered } = opened;
      if (param && rendered) {
        const own = await childIds(page);
        const resolved = route.replace(/:(\w+)/, (_, k) => own[k] ?? 'missing');
        await page.goto(`${baseUrl}/${resolved}`, { waitUntil: 'domcontentloaded' });
        rendered = await page.waitForSelector('.jrn-screen', { timeout: 20000 }).then(() => true).catch(() => false);
        await page.evaluate(() => document.fonts?.ready);
        await page.waitForTimeout(900);
      }
      const slug = screenId.replace(/[^A-Z0-9_.]/gi, '_');
      if (!rendered) {
        rows.push({ viewport: vp, family, screen_id: screenId, route, rendered: false, errors });
        await context.close();
        continue;
      }
      const m = await composition(page);
      await page.screenshot({ path: join(dir, `${slug}.jpg`), type: 'jpeg', quality: 78 });
      let salience = null;
      if (vp.startsWith('mobile') && (m.has_product_nav || family === 'F01')) {
        const navLeft = m.nav?.left ?? (CS_VIEWPORTS[vp][0] - 340) / 2;
        const navRight = m.nav?.right ?? navLeft + 340;
        const top = m.content_rect?.top ?? m.chrome_bottom ?? 64;
        const bottom = m.edge?.bottom ?? (m.nav?.top ?? CS_VIEWPORTS[vp][1] - 64) - 8;
        salience = await backgroundSalience(page, { left: Math.round(navLeft), right: Math.round(navRight), top: Math.round(top), bottom: Math.round(bottom) }, join(dir, `${slug}_heat.jpg`));
      }
      rows.push({ viewport: vp, family, screen_id: screenId, route, scenario, rendered: true, errors: [...new Set(errors)].slice(0, 2), ...m, salience });
      await context.close();
    }
  }
  await browser.close();
  writeFileSync(join(outDir, `${label}-center-stage.json`), `${JSON.stringify(rows, null, 2)}\n`);
  for (const r of rows) {
    if (!r.rendered) {
      console.log(`${r.viewport} ${r.screen_id} NOT_RENDERED`);
      continue;
    }
    const fv = r.field_vs_nav;
    console.log(
      `${r.viewport.padEnd(8)} ${String(r.screen_id).padEnd(16)} nav=${r.has_product_nav ? 'Y' : 'n'} mode=${String(r.composition).padEnd(12)} ${fv ? `L${fv.left_delta} R${fv.right_delta} w${fv.width_ratio} c${fv.center_offset} cen${fv.centroid_offset}` : '-'} clear=${r.clearance_px}${r.salience ? ` sal zone=${r.salience.safe_zone.mean} core=${r.salience.safe_core.mean} perim=${r.salience.perimeter.mean} hot=${r.salience.safe_core.hot_share}` : ''}`,
    );
  }
}

if (process.argv[1] && process.argv[1].endsWith('center-stage-qa.mjs')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
