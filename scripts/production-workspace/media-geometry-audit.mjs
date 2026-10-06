#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 — live media geometry audit.
 *
 * For every media element (img / video / CSS background image) in the workspace body of every route
 * (media-geometry-routes.mjs) and viewport, it measures what the viewer actually sees of the SOURCE:
 *
 *   visible source window  object-fit / background-size + position, any transform (art-directed zoom), every
 *                          clipping ancestor (overflow hidden / clip) — in normalized source coordinates
 *   pane fit               whether the media (and its media unit: tile / card / link) can ever be fully shown by the
 *                          scrolling pane it lives in (a unit taller than its pane is sliced by a fixed panel)
 *   legibility             rendered short side / block size against the media-scale minimum, aspect vs contract
 *   focal                  the protected focal region (face / subject / custom) stays inside the visible window
 *   distortion             fill fits / non-uniform background sizes / non-uniform transforms that change the aspect
 *
 * and classifies each element by its declared media ROLE (data-media-role) — or infers one when undeclared
 * (counted as UNCLASSIFIED). Verdicts follow the role contract and the intentional crop registry in
 * src/site00/config/production-workspace-media.ts (read through tsx).
 *
 *   BASE=http://127.0.0.1:5174 OUT=<dir> VIEWPORTS=mobile [ONLY=id,id] [SHOTS=1] \
 *     npx tsx scripts/production-workspace/media-geometry-audit.mjs
 * (run one process per viewport in parallel — output media-audit-<viewports>.json)
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { CHILD_PAGES, REVIEW_BOARDS, ROOT_TABS, VIEWPORTS } from './media-geometry-routes.mjs';
import {
  WORKSPACE_INTENTIONAL_CROPS,
  WORKSPACE_MEDIA_ROLES,
  WORKSPACE_MEDIA_SCALES,
  inferWorkspaceCrop,
  inferWorkspaceMediaRole,
  inferWorkspaceMediaScale,
} from '../../src/site00/config/production-workspace-media.ts';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5174';
const OUT = process.env.OUT ?? 'media-geometry-audit';
const FAMILIES = (process.env.VIEWPORTS ?? 'mobile').split(',');
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
const SHOTS = process.env.SHOTS === '1';
// review-board captures: also shoot each board route scrolled to its reviewed panels (`<id>--focus.png`)
const FOCUS_SHOTS = process.env.FOCUS_SHOTS === '1';
const CHROME = process.env.CHROME ?? '/opt/pw-browsers/chromium';
// one file per viewport set, so viewports can run as parallel processes (the report merges media-audit-*.json);
// written after every route so an interrupted run keeps what it measured
const OUT_FILE = `${OUT}/media-audit-${FAMILIES.join('_')}${process.env.SUFFIX ?? ''}.json`;

const ROUTES = [...ROOT_TABS.map((r) => ({ ...r, kind: 'root' })), ...CHILD_PAGES.map((r) => ({ ...r, kind: 'child' }))];
const CONTRACT = {
  roles: WORKSPACE_MEDIA_ROLES,
  scales: WORKSPACE_MEDIA_SCALES,
  crops: WORKSPACE_INTENTIONAL_CROPS,
};

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const rows = [];

async function nav(page, path) {
  await page.evaluate((p) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

for (const vpName of FAMILIES) {
  const vp = VIEWPORTS[vpName];
  mkdirSync(`${OUT}/${vpName}`, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('site00-immersive-complete', '1');
    } catch {
      /* ignore */
    }
  });
  const page = await ctx.newPage();
  let errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(BASE + '/production', { waitUntil: 'load' });
  await page.waitForSelector('[data-testid="production-authority-frame"]', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  for (const r of ROUTES) {
    if (ONLY && !ONLY.has(r.id)) continue;
    // a page reload mid-measurement (dev server restart / HMR) retries the route once instead of losing the run
    for (let attempt = 0; ; attempt++) {
      try {
        errors = [];
        let route = r.route;
        if (r.discover) {
          await nav(page, '/production/activity?__hop=1');
          await page.waitForTimeout(250);
          await nav(page, r.discover.from);
          await page.waitForTimeout(1800);
          const href = await page.locator(r.discover.selector).first().getAttribute('href', { timeout: 6000 }).catch(() => null);
          if (!href) {
            rows.push({ viewport: vpName, ...r, route: null, errors: ['discover: no link'], media: [] });
            console.log(`${vpName.padEnd(7)} ${r.id.padEnd(34)} DISCOVER FAILED`);
            break;
          }
          route = href;
        }
        await nav(page, '/production/activity?__hop=1');
        await page.waitForTimeout(250);
        await nav(page, route);
        await page.waitForSelector('[data-testid="production-authority-frame"], [data-testid="production-workspace-shell"]', { timeout: 20000 }).catch(() => {});
        await page.waitForTimeout(1700);
        if (r.click) {
          await page.locator(r.click).first().click({ timeout: 8000 }).catch((e) => errors.push(`click ${String(e).slice(0, 80)}`));
          await page.waitForTimeout(1200);
        }
        // let lazy images inside the first screens decode
        await page.evaluate(() =>
          Promise.all(
            [...document.images]
              .filter((i) => !i.complete && i.getBoundingClientRect().top < window.innerHeight && i.getBoundingClientRect().bottom > 0)
              .map((i) => new Promise((res) => { i.onload = i.onerror = res; setTimeout(res, 2500); })),
          ),
        );
        const data = await page.evaluate(measure, { where: WORKSPACE_INTENTIONAL_CROPS.map((c) => ({ id: c.id, where: c.where })) });
        // roles / scales / crop classes inferred host-side for undeclared elements (same contract module)
        for (const m of data.media) {
          const hints = { ...m.hints, src: m.srcFull };
          if (!m.role) {
            m.role = inferWorkspaceMediaRole(hints);
            m.roleSource = 'inferred';
          } else m.roleSource = 'declared';
          if (!m.scale) {
            m.scale = inferWorkspaceMediaScale({ ...hints, role: m.role, box: m.box });
            m.scaleSource = 'inferred';
          } else m.scaleSource = 'declared';
          if (!m.cropId) {
            m.cropId = inferWorkspaceCrop(m.role, m.scale, m.matchedCrops);
            m.cropSource = m.cropId ? 'inferred' : null;
          } else m.cropSource = 'declared';
          delete m.srcFull;
        }
        let shot = null;
        if (SHOTS) {
          shot = `${vpName}/${r.id}.png`;
          await page.screenshot({ path: `${OUT}/${shot}` });
          const focus = REVIEW_BOARDS.find(([, bvp, id, , f]) => bvp === vpName && id === r.id && f.length)?.[4];
          if (FOCUS_SHOTS && focus) {
            // the first reviewed panel's top sits just under the header; everything that follows it is in frame
            await page.evaluate((testId) => {
              const el = document.querySelector(`[data-testid="${testId}"]`);
              if (!el) return;
              el.scrollIntoView({ block: 'start' });
              for (let a = el.parentElement; a; a = a.parentElement) {
                if (a.scrollHeight > a.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(a).overflowY)) {
                  a.scrollTop = Math.max(0, a.scrollTop - 64);
                  break;
                }
              }
            }, focus[0]);
            await page.waitForTimeout(500);
            await page.screenshot({ path: `${OUT}/${vpName}/${r.id}--focus.png` });
          }
        }
        rows.push({ viewport: vpName, family: vp.family, width: vp.width, id: r.id, tab: r.tab, kind: r.kind, route, errors, shot, ...data });
        console.log(`${vpName.padEnd(7)} ${r.id.padEnd(34)} media=${String(data.media.length).padStart(3)} overflowX=${data.overflowCount} err=${errors.length}`);
        break;
      } catch (e) {
        if (attempt >= 1) {
          rows.push({ viewport: vpName, family: vp.family, width: vp.width, id: r.id, tab: r.tab, kind: r.kind, route: r.route, errors: [`audit: ${String(e).slice(0, 120)}`], media: [] });
          console.log(`${vpName.padEnd(7)} ${r.id.padEnd(34)} FAILED ${String(e).slice(0, 80)}`);
          break;
        }
        console.log(`${vpName.padEnd(7)} ${r.id.padEnd(34)} retry (${String(e).slice(0, 60)})`);
        await page.waitForTimeout(3000);
      }
    }
    writeFileSync(OUT_FILE, JSON.stringify(rows, null, 1));
  }
  await page.close();
  await ctx.close();
}
await browser.close();
writeFileSync(OUT_FILE, JSON.stringify(rows, null, 1));

/* ───────────────────────────────────────── in-page measurement ───────────────────────────────────────── */
async function measure({ where }) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const scroll =
    document.querySelector('[data-testid="production-authority-scroll"]') ??
    document.querySelector('.pw-scroll, .pw-frame__scroll, main') ??
    document.scrollingElement;
  const root = scroll.querySelector('.pxa-body') ?? scroll;
  const r1 = (n) => Math.round(n * 10) / 10;
  const r3 = (n) => Math.round(n * 1000) / 1000;
  const rect = (b) => ({ x: r1(b.left), y: r1(b.top), w: r1(b.width), h: r1(b.height) });
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const b = el.getBoundingClientRect();
    return b.width > 0.5 && b.height > 0.5;
  };
  const urlOf = (bg) => {
    const m = /url\(["']?([^"')]+)["']?\)/.exec(bg);
    return m ? m[1] : null;
  };
  const natural = (src) =>
    new Promise((res) => {
      const im = new Image();
      const t = setTimeout(() => res(null), 4000);
      im.onload = () => {
        clearTimeout(t);
        res({ w: im.naturalWidth, h: im.naturalHeight });
      };
      im.onerror = () => {
        clearTimeout(t);
        res({ w: 0, h: 0 });
      };
      im.src = src;
    });
  const all = [...root.querySelectorAll('*')];
  const els = all.filter((el) => {
    if (el.closest('.pxh-header, .prod-chrome, [data-testid="production-bottom-nav"], .pxh-nav, .ph-top, [class*="bnav"]')) return false;
    if (!visible(el)) return false;
    if (el.tagName === 'IMG' || el.tagName === 'VIDEO') return true;
    const bg = getComputedStyle(el).backgroundImage;
    return Boolean(bg && bg !== 'none' && bg.includes('url('));
  });
  const srcOf = (el) => (el.tagName === 'IMG' ? el.currentSrc || el.src : el.tagName === 'VIDEO' ? el.poster || el.currentSrc : urlOf(getComputedStyle(el).backgroundImage));
  const uniq = [...new Set(els.map(srcOf).filter(Boolean))];
  const nat = new Map(await Promise.all(uniq.map(async (u) => [u, await natural(u)])));

  /** Split a comma list at top level (background layers). */
  const layers = (v) => v.split(/,(?![^(]*\))/).map((s) => s.trim());
  /** Resolve one position component (px or %) to an offset of the painted image inside the box. */
  const posOff = (comp, box, img) => {
    if (!comp) return (box - img) / 2;
    if (comp.endsWith('%')) return ((box - img) * parseFloat(comp)) / 100;
    if (comp.endsWith('px')) return parseFloat(comp);
    if (comp === 'left' || comp === 'top') return 0;
    if (comp === 'right' || comp === 'bottom') return box - img;
    return (box - img) / 2;
  };

  /** Painted image rect inside the element's own (untransformed) box, in px of that box. */
  function paintedRect(el, cs, n, bw, bh, isBg) {
    if (!n || !n.w || !n.h) return null;
    const ar = n.w / n.h;
    let iw;
    let ih;
    let px;
    let py;
    if (!isBg) {
      const fit = cs.objectFit;
      if (fit === 'fill') [iw, ih] = [bw, bh];
      else if (fit === 'contain' || (fit === 'scale-down' && (n.w > bw || n.h > bh))) {
        const s = Math.min(bw / n.w, bh / n.h);
        [iw, ih] = [n.w * s, n.h * s];
      } else if (fit === 'cover') {
        const s = Math.max(bw / n.w, bh / n.h);
        [iw, ih] = [n.w * s, n.h * s];
      } else [iw, ih] = [n.w, n.h];
      const [ox, oy] = cs.objectPosition.split(/\s+/);
      px = posOff(ox, bw, iw);
      py = posOff(oy, bh, ih);
      return { x: px, y: py, w: iw, h: ih, fitCss: fit, posCss: cs.objectPosition };
    }
    const bgs = layers(cs.backgroundImage);
    const idx = Math.max(0, bgs.findIndex((l) => l.startsWith('url(')));
    const size = (layers(cs.backgroundSize)[idx] ?? layers(cs.backgroundSize)[0] ?? 'auto').trim();
    const pos = (layers(cs.backgroundPosition)[idx] ?? layers(cs.backgroundPosition)[0] ?? '0% 0%').trim();
    const len = (v, ref) => (v.endsWith('%') ? (parseFloat(v) / 100) * ref : v.endsWith('px') ? parseFloat(v) : null);
    if (size === 'cover') {
      const s = Math.max(bw / n.w, bh / n.h);
      [iw, ih] = [n.w * s, n.h * s];
    } else if (size === 'contain') {
      const s = Math.min(bw / n.w, bh / n.h);
      [iw, ih] = [n.w * s, n.h * s];
    } else {
      const [a, b = 'auto'] = size.split(/\s+/);
      const wv = a === 'auto' ? null : len(a, bw);
      const hv = b === 'auto' ? null : len(b, bh);
      if (wv != null && hv != null) [iw, ih] = [wv, hv];
      else if (wv != null) [iw, ih] = [wv, wv / ar];
      else if (hv != null) [iw, ih] = [hv * ar, hv];
      else [iw, ih] = [n.w, n.h];
    }
    const [ox, oy] = pos.split(/\s+/);
    px = posOff(ox, bw, iw);
    py = posOff(oy ?? '50%', bh, ih);
    return { x: px, y: py, w: iw, h: ih, fitCss: size, posCss: pos };
  }

  const media = [];
  for (const el of els.slice(0, 260)) {
    const cs = getComputedStyle(el);
    const isBg = !(el.tagName === 'IMG' || el.tagName === 'VIDEO');
    const src = srcOf(el);
    const n = el.tagName === 'IMG' && el.complete && el.naturalWidth ? { w: el.naturalWidth, h: el.naturalHeight } : (src ? nat.get(src) : null) ?? null;
    // own (untransformed) box: offset size; painted box: bounding rect (includes transforms)
    const bw = el.offsetWidth || el.getBoundingClientRect().width;
    const bh = el.offsetHeight || el.getBoundingClientRect().height;
    const P = el.getBoundingClientRect();
    const pr = paintedRect(el, cs, n, bw, bh, isBg);

    // clip rect: intersection of every clipping (non-scrolling) ancestor; scrolling ancestors are panes
    let clip = { l: P.left, t: P.top, r: P.right, b: P.bottom };
    let clipBy = null;
    const panes = [];
    // once the media sits inside a pane that scrolls on an axis, anything outside that pane cannot crop it on that
    // axis (the viewer scrolls the pane); whether the media unit can ever be fully shown is the pane-fit check below
    let scrolledX = false;
    let scrolledY = false;
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const acs = getComputedStyle(a);
      const ab = a.getBoundingClientRect();
      const inner = { l: ab.left + a.clientLeft, t: ab.top + a.clientTop, r: ab.left + a.clientLeft + a.clientWidth, b: ab.top + a.clientTop + a.clientHeight };
      const cx = /hidden|clip/.test(acs.overflowX) && !scrolledX;
      const cy = /hidden|clip/.test(acs.overflowY) && !scrolledY;
      const sx = /auto|scroll/.test(acs.overflowX);
      const sy = /auto|scroll/.test(acs.overflowY);
      if (sx && a.scrollWidth > a.clientWidth + 1) scrolledX = true;
      if (sy && a.scrollHeight > a.clientHeight + 1) scrolledY = true;
      if (cx || cy) {
        const before = (clip.r - clip.l) * (clip.b - clip.t);
        if (cx) clip = { ...clip, l: Math.max(clip.l, inner.l), r: Math.min(clip.r, inner.r) };
        if (cy) clip = { ...clip, t: Math.max(clip.t, inner.t), b: Math.min(clip.b, inner.b) };
        const after = Math.max(0, clip.r - clip.l) * Math.max(0, clip.b - clip.t);
        if (after < before - 1 && !clipBy) clipBy = (a.getAttribute('class') ?? a.tagName).split(/\s+/)[0] || a.tagName;
      }
      if (sx || sy) panes.push({ el: a, sx, sy, inner, cls: (a.getAttribute('class') ?? a.tagName).split(/\s+/)[0] || a.tagName });
      if (a === scroll || acs.position === 'fixed') break;
    }
    const clipArea = Math.max(0, clip.r - clip.l) * Math.max(0, clip.b - clip.t);
    const clipFrac = clipArea / Math.max(1, P.width * P.height);

    // visible source window: clip rect → element-local fraction → painted image → source coordinates
    let win = null;
    if (pr) {
      const fx0 = (Math.max(clip.l, P.left) - P.left) / Math.max(1, P.width);
      const fx1 = (Math.min(clip.r, P.right) - P.left) / Math.max(1, P.width);
      const fy0 = (Math.max(clip.t, P.top) - P.top) / Math.max(1, P.height);
      const fy1 = (Math.min(clip.b, P.bottom) - P.top) / Math.max(1, P.height);
      const sx = (f) => (f * bw - pr.x) / pr.w;
      const sy = (f) => (f * bh - pr.y) / pr.h;
      const c = (v) => Math.min(1, Math.max(0, v));
      win = { x0: r3(c(sx(fx0))), x1: r3(c(sx(fx1))), y0: r3(c(sy(fy0))), y1: r3(c(sy(fy1))) };
    }
    // the painted image's own aspect vs the source (distortion), incl. non-uniform transforms
    const m = cs.transform && cs.transform !== 'none' ? new DOMMatrixReadOnly(cs.transform) : null;
    const tx = m ? Math.hypot(m.a, m.b) : 1;
    const ty = m ? Math.hypot(m.c, m.d) : 1;
    const distorted = Boolean(n && n.w && n.h && pr && Math.abs((pr.w * tx) / (pr.h * ty) / (n.w / n.h) - 1) > 0.03);

    // media unit: the tile / card / link that carries this media (falls back to the media element)
    const unit = el.closest('a, button, li, [data-media-unit], .exf-tile, .pxa-collection > *, .ibx-card, .iax-acard') ?? el;
    const U = unit.getBoundingClientRect();
    const paneIssues = [];
    for (const p of panes) {
      if (p.el === scroll) continue;
      if (unit.contains(p.el)) continue;
      const ph = p.inner.b - p.inner.t;
      const pw = p.inner.r - p.inner.l;
      if (p.sy && U.height > ph + 1.5) paneIssues.push({ axis: 'y', unit: r1(U.height), pane: r1(ph), by: p.cls });
      if (p.sx && !p.sy && U.width > pw + 1.5) paneIssues.push({ axis: 'x', unit: r1(U.width), pane: r1(pw), by: p.cls });
    }
    // text drawn over the media (overlay) — any own-text element whose box sits mostly on the media box
    const overlays = [];
    for (const t of el.parentElement ? [...el.parentElement.querySelectorAll('*')] : []) {
      if (t === el || t.contains(el)) continue;
      const own = [...t.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent.trim()).join('').trim();
      if (!own || !visible(t)) continue;
      const tb = t.getBoundingClientRect();
      const ix = Math.max(0, Math.min(tb.right, P.right) - Math.max(tb.left, P.left));
      const iy = Math.max(0, Math.min(tb.bottom, P.bottom) - Math.max(tb.top, P.top));
      if ((ix * iy) / Math.max(1, tb.width * tb.height) > 0.5) overlays.push(own.slice(0, 24));
    }
    const slotEl = el.closest('[data-media-slot], [data-media-fit], [data-media-role]');
    const attr = (k) => el.getAttribute(k) ?? slotEl?.getAttribute(k) ?? null;
    const panel = el.closest('[data-panel-media], .exf-panel, .iax-panel, .ibx-pane, .pxa-panel, .pwk-panel, section');
    media.push({
      kind: isBg ? 'bg' : el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).slice(0, 3).join('.'),
      parentCls: (el.parentElement?.getAttribute('class') ?? '').split(/\s+/)[0],
      ctx: el.closest('[data-testid]')?.getAttribute('data-testid') ?? null,
      panel: panel ? { cls: (panel.getAttribute('class') ?? '').split(/\s+/)[0], testid: panel.getAttribute('data-testid'), mode: panel.getAttribute('data-panel-media'), title: (panel.querySelector('h2, h3, header b')?.textContent ?? '').trim().slice(0, 40) } : null,
      role: attr('data-media-role'),
      scale: attr('data-media-scale'),
      cropId: attr('data-media-crop'),
      focalRegion: attr('data-media-focal-region'),
      hints: {
        slot: attr('data-media-slot'),
        fit: attr('data-media-fit'),
        cls: (el.getAttribute('class') ?? '') + ' ' + (slotEl?.getAttribute('class') ?? '') + ' ' + (el.parentElement?.getAttribute('class') ?? ''),
        ariaHidden: el.getAttribute('aria-hidden') === 'true' || Boolean(el.closest('[aria-hidden="true"]')),
        isBg,
        hub: Boolean(el.closest('.hubx')),
        alt: el.getAttribute('alt'),
      },
      src: src ? src.split('/').slice(-3).join('/').slice(0, 90) : null,
      srcFull: src,
      matchedCrops: where.filter((c) => c.where.some((sel) => el.matches(sel) || el.closest(sel))).map((c) => c.id),
      natural: n,
      box: rect(P),
      own: { w: r1(bw), h: r1(bh) },
      fitCss: pr?.fitCss ?? (isBg ? cs.backgroundSize : cs.objectFit),
      posCss: pr?.posCss ?? (isBg ? cs.backgroundPosition : cs.objectPosition),
      transform: m ? [r3(tx), r3(ty)] : null,
      win,
      clipFrac: r3(clipFrac),
      clipBy,
      paneIssues,
      overlays: overlays.slice(0, 3),
      distorted,
      broken: el.tagName === 'IMG' ? el.complete && el.naturalWidth === 0 : n ? n.w === 0 : false,
      state: el.closest('[data-media-state]')?.getAttribute('data-media-state') ?? null,
      maskOrClipPath: cs.clipPath !== 'none' || (cs.maskImage && cs.maskImage !== 'none'),
    });
  }
  // missing / placeholder slots (named empty state, initials tiles for a portrait with no headshot): no source to
  // crop, but the SLOT still has to hold its geometry and must never be sliced by a fixed panel
  const placeholders = [...root.querySelectorAll('[data-asset-state="missing"], [data-media-state="missing"], .exf-mono')].filter(
    (el) => visible(el) && !el.parentElement?.closest('[data-asset-state="missing"], [data-media-state="missing"]') && !el.closest('.pxh-header, .prod-chrome'),
  );
  for (const el of placeholders) {
    const P = el.getBoundingClientRect();
    let clip = { l: P.left, t: P.top, r: P.right, b: P.bottom };
    let clipBy = null;
    const panes = [];
    let scrolledX = false;
    let scrolledY = false;
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const acs = getComputedStyle(a);
      const ab = a.getBoundingClientRect();
      const inner = { l: ab.left + a.clientLeft, t: ab.top + a.clientTop, r: ab.left + a.clientLeft + a.clientWidth, b: ab.top + a.clientTop + a.clientHeight };
      if (/hidden|clip/.test(acs.overflowX) && !scrolledX) clip = { ...clip, l: Math.max(clip.l, inner.l), r: Math.min(clip.r, inner.r) };
      if (/hidden|clip/.test(acs.overflowY) && !scrolledY) clip = { ...clip, t: Math.max(clip.t, inner.t), b: Math.min(clip.b, inner.b) };
      if (/auto|scroll/.test(acs.overflowX) && a.scrollWidth > a.clientWidth + 1) scrolledX = true;
      if (/auto|scroll/.test(acs.overflowY) && a.scrollHeight > a.clientHeight + 1) scrolledY = true;
      if (!clipBy && (clip.r - clip.l) * (clip.b - clip.t) < P.width * P.height - 1) clipBy = (a.getAttribute('class') ?? a.tagName).split(/\s+/)[0];
      if (/auto|scroll/.test(acs.overflowX) || /auto|scroll/.test(acs.overflowY)) panes.push({ el: a, sx: /auto|scroll/.test(acs.overflowX), sy: /auto|scroll/.test(acs.overflowY), inner, cls: (a.getAttribute('class') ?? a.tagName).split(/\s+/)[0] });
      if (a === scroll || acs.position === 'fixed') break;
    }
    const unit = el.closest('a, button, li, [data-media-unit], .exf-tile, .pxa-collection > *, .ibx-card, .iax-acard') ?? el;
    const U = unit.getBoundingClientRect();
    const paneIssues = [];
    for (const p of panes) {
      if (p.el === scroll || unit.contains(p.el)) continue;
      const ph = p.inner.b - p.inner.t;
      const pw = p.inner.r - p.inner.l;
      if (p.sy && U.height > ph + 1.5) paneIssues.push({ axis: 'y', unit: r1(U.height), pane: r1(ph), by: p.cls });
      if (p.sx && !p.sy && U.width > pw + 1.5) paneIssues.push({ axis: 'x', unit: r1(U.width), pane: r1(pw), by: p.cls });
    }
    const slotEl = el.closest('[data-media-slot], [data-media-fit], [data-media-role]');
    const attr = (k) => el.getAttribute(k) ?? slotEl?.getAttribute(k) ?? null;
    const panel = el.closest('[data-panel-media], .exf-panel, .iax-panel, .ibx-pane, .pxa-panel, .pwk-panel, section');
    const clipArea = Math.max(0, clip.r - clip.l) * Math.max(0, clip.b - clip.t);
    media.push({
      kind: 'slot',
      cls: (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).slice(0, 3).join('.'),
      parentCls: (el.parentElement?.getAttribute('class') ?? '').split(/\s+/)[0],
      ctx: el.closest('[data-testid]')?.getAttribute('data-testid') ?? null,
      panel: panel ? { cls: (panel.getAttribute('class') ?? '').split(/\s+/)[0], testid: panel.getAttribute('data-testid'), mode: panel.getAttribute('data-panel-media'), title: (panel.querySelector('h2, h3, header b')?.textContent ?? '').trim().slice(0, 40) } : null,
      role: attr('data-media-role'),
      scale: attr('data-media-scale'),
      cropId: null,
      focalRegion: null,
      hints: {
        slot: attr('data-media-slot'),
        fit: attr('data-media-fit') ?? (el.matches('.exf-mono') && el.closest('.exf-face, .exf-tile, .exf-record__media, .exf-row') ? 'PORTRAIT_COVER' : null),
        cls: (el.getAttribute('class') ?? '') + ' ' + (el.parentElement?.getAttribute('class') ?? ''),
        ariaHidden: false,
        isBg: false,
        hub: Boolean(el.closest('.hubx')),
        alt: null,
      },
      src: null,
      srcFull: null,
      matchedCrops: [],
      natural: null,
      box: rect(P),
      own: { w: r1(el.offsetWidth), h: r1(el.offsetHeight) },
      fitCss: null,
      posCss: null,
      transform: null,
      win: null,
      clipFrac: r3(clipArea / Math.max(1, P.width * P.height)),
      clipBy,
      paneIssues,
      overlays: [],
      distorted: false,
      broken: false,
      state: 'missing',
      maskOrClipPath: false,
    });
  }
  const missing = placeholders.length;
  // horizontal overflow outside intentional rails
  const overflowEls = all.filter((el) => {
    if (!visible(el)) return false;
    const b = el.getBoundingClientRect();
    if (b.right <= W + 1 && b.left >= -1) return false;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const o = getComputedStyle(a).overflowX;
      if (/auto|scroll|hidden|clip/.test(o)) {
        const ab = a.getBoundingClientRect();
        if (ab.right <= W + 1) return false;
      }
    }
    return true;
  });
  return {
    viewport_px: { w: W, h: H },
    scroll: { client: scroll.clientHeight, height: scroll.scrollHeight },
    docOverflowX: document.documentElement.scrollWidth > W + 1,
    overflowCount: overflowEls.length,
    overflowSamples: overflowEls.slice(0, 4).map((el) => (el.getAttribute('class') ?? el.tagName).slice(0, 50)),
    media,
    missing,
  };
}
