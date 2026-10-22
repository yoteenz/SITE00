// Shared harness for the Opus 2 responsive boards and layout audit: repo Vite server (SSR data), Playwright Chromium.
// loadData() is the OPUS1 loader unchanged: real icons, objects and commercial config from source → window.__DF.
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const here = dirname(fileURLToPath(import.meta.url));
export const repo = resolve(here, '../../../../..');

export async function loadData(server) {
  const model = await server.ssrLoadModule('/src/site00/foundation-client/model.ts');
  const glyphs = await server.ssrLoadModule('/src/site00/foundation-client/icons/glyphs.ts');
  const meta = await server.ssrLoadModule('/src/site00/foundation-client/icons/meta.ts');
  const catalog = await server.ssrLoadModule('/shared/site00-digital-foundation/addonCatalog.ts');
  const commercial = await server.ssrLoadModule('/shared/site00-digital-foundation/commercialConfig.ts');
  const objects = await server.ssrLoadModule('/src/site00/foundation-client/objects.tsx');
  const req = createRequire(join(repo, 'package.json'));
  const React = req('react');
  const ReactDOMServer = req('react-dom/server');
  const aliases = {};
  for (const item of [...meta.DF_ICON_CATALOG, ...meta.DF_ICON_LEGACY_EXTRAS]) {
    aliases[item.id] = item.id;
    for (const a of item.aliases ?? []) aliases[a] = item.id;
  }
  const render = (C, props = {}) => ReactDOMServer.renderToStaticMarkup(React.createElement(C, props));
  const config = commercial.defaultDigitalFoundationCommercialConfig();
  return {
    glyphs: glyphs.DF_ICON_GLYPHS,
    aliases,
    BUSINESS_TYPES: model.BUSINESS_TYPES,
    DOMAIN_PATHS: model.DOMAIN_PATHS,
    DF_DISCLOSURES: model.DF_DISCLOSURES,
    VIEW_META: model.DF_VIEW_META,
    REVIEW_STATE_LABEL: model.REVIEW_STATE_LABEL,
    ACTIVATION_STATE_LABEL: model.ACTIVATION_STATE_LABEL,
    config,
    addons: catalog.buildDefaultAddonCatalog().map((a) => ({
      id: a.addon_id,
      price_minor_units: a.price_minor_units,
      quantity_unit: Boolean(a.quantity_unit),
      manual_review: a.requires_manual_review,
      ...model.addonPresentation(a.addon_id),
    })),
    objects: {
      hero: render(objects.DfThresholdHero),
      crown: render(objects.DfCrownObject, { variant: 'OVERVIEW' }),
      corner: render(objects.DfCornerFragment),
    },
  };
}

export async function start(port = 5243) {
  const { createServer } = await import(join(repo, 'node_modules/vite/dist/node/index.js'));
  const { chromium } = await import(join(repo, 'node_modules/playwright/index.mjs'));
  const server = await createServer({ root: repo, logLevel: 'error', server: { port, strictPort: false } });
  await server.listen();
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');
  const data = await loadData(server);
  const exe = ['/opt/pw-browsers/chromium'].find((p) => existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const close = async () => {
    await browser.close();
    await server.close();
  };
  return { server, base, data, browser, close };
}

export const SPECIMEN = 'docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/src/specimen.html';

export const VIEWPORTS = [
  [320, 700], [375, 812], [390, 844], [430, 932],
  [768, 1024], [820, 1180], [834, 1112],
  [1024, 768], [1194, 834],
  [1280, 800], [1366, 768], [1440, 900], [1600, 900], [1920, 1080], [2560, 1440], [3440, 1440],
];
export const tierOf = (w) => (w < 768 ? 'M' : w < 1024 ? 'TP' : w < 1280 ? 'TL' : w < 1920 ? 'D' : 'UW');

/** In-page layout measurement (runs inside a specimen document). Shared by audit-layout.mjs and render-boards.mjs. */
export function measure() {
  const vw = innerWidth;
  const vh = innerHeight;
  const out = { overflow: [], collision: [], dimensions: [], inspector: [], truncation: [], multiline: [], minText: [], fonts: [], stretch: [] };
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  };
  const name = (el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : ''} “${(el.textContent || '').trim().slice(0, 28)}”`;
  const clippedByScroller = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/(auto|scroll|hidden)/.test(s.overflowX) && p !== document.body && p !== document.documentElement) {
        const pr = p.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        if (r.right > pr.right + 1 || r.left < pr.left - 1) return true;
      }
    }
    return false;
  };
  const layer = (el) => (el.closest('.ws-ov') ? 'ov' : el.closest('.ws-insp') && getComputedStyle(el.closest('.ws-insp')).position === 'fixed' ? 'sheet' : el.closest('.ws-kbsim') ? 'kb' : 'base');

  // overflow
  const se = document.scrollingElement;
  if (se.scrollWidth > vw + 1) out.overflow.push(`document ${se.scrollWidth} > ${vw}`);
  const stage = document.getElementById('stage');
  if (stage && stage.scrollWidth > stage.clientWidth + 1) out.overflow.push(`stage ${stage.scrollWidth} > ${stage.clientWidth}`);

  // text leaves
  const leaves = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let n;
  while ((n = walker.nextNode())) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (seen.has(el) || el.closest('script,style,.ws-arch,.ws-sr,summary')) continue;
    seen.add(el);
    if (!vis(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
    if (!rects.length) {
      out.dimensions.push(name(el));
      continue;
    }
    // clip to every ancestor that clips (scrollers, ellipsis boxes, panes); text scrolled out of view is not visible
    const clips = [];
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.overflowX !== 'visible' || ps.overflowY !== 'visible') clips.push(p.getBoundingClientRect());
    }
    const inView = rects
      .map((r) => clips.reduce((a, c) => ({ left: Math.max(a.left, c.left), top: Math.max(a.top, c.top), right: Math.min(a.right, c.right), bottom: Math.min(a.bottom, c.bottom) }), { left: r.left, top: r.top, right: r.right, bottom: r.bottom }))
      .map((r) => ({ ...r, width: r.right - r.left, height: r.bottom - r.top }))
      .filter((r) => r.width > 0.5 && r.height > 0.5 && r.bottom > 0 && r.top < vh);
    if (!inView.length) continue;
    leaves.push({ el, rects: inView, layer: layer(el) });
  }

  for (const { el, rects } of leaves) {
    const s = getComputedStyle(el);
    const fs = parseFloat(s.fontSize);
    if (fs < 10 && !el.closest('.rcard, .pspec, .mock, svg')) out.minText.push(`${name(el)} ${fs}px`);
    const fam = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    if (fam !== 'SITE 00 Display' && fam !== 'Saira Semi Condensed') out.fonts.push(`${name(el)} ${fam}`);
    else if (!document.fonts.check(`${s.fontWeight} ${fs}px "${fam}"`, el.textContent.trim().slice(0, 8) || 'A')) out.fonts.push(`${name(el)} ${fam} ${s.fontWeight} not loaded`);
    for (const r of rects) {
      if (r.right > vw + 1 || r.left < -1) {
        out.overflow.push(`text outside viewport ${name(el)} [${Math.round(r.left)}–${Math.round(r.right)}]`);
        break;
      }
    }
  }

  // collisions (same layer, not nested, visible portion)
  const boxes = leaves.flatMap(({ el, rects, layer: L }) => rects.map((r) => ({ el, r, L })));
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.L !== b.L || a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w > 2 && h > 0.3 * Math.min(a.r.height, b.r.height) && w * h > 4) {
        out.collision.push(`${name(a.el)} × ${name(b.el)}`);
      }
    }
  }

  // inspector
  const insp = document.querySelector('.ws-app--insp .ws-insp');
  if (insp && vis(insp)) {
    const r = insp.getBoundingClientRect();
    if (r.width > vw + 1) out.inspector.push(`inspector ${Math.round(r.width)} > viewport ${vw}`);
    if (getComputedStyle(insp).position !== 'fixed' && stage && stage.clientWidth < 680) out.inspector.push(`docked while stage ${stage.clientWidth} < 680`);
  }

  // truncation of mandatory labels
  const MANDATORY = '.ws-label, .ws-h3, .ws-tab, .ws-chip, .ws-st > span:last-child, .ws-btn > span, .reg__h > *, .con__h > *, .qt th, .lc-table th, .ws-side__i > span:nth-child(3), .ws-rail__i > span, .ws-bnav__i, .ws-menu__i > span:nth-child(2), .ws-jn__l, .ws-field__l, .ws-segctl span, .ws-kv dt, .cs, .rf-sig .ws-label, .ldg__h > *';
  for (const el of document.querySelectorAll(MANDATORY)) {
    if (!vis(el) || el.closest('.ws-1l, .ws-2l')) continue;
    if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible') out.truncation.push(name(el));
  }

  // multiline buttons
  for (const el of document.querySelectorAll('.ws-btn > span')) {
    if (!vis(el) || el.closest('.rec-head__acts')) continue;
    const lines = new Set([...el.getClientRects()].map((r) => Math.round(r.top)));
    if (lines.size > 1) out.multiline.push(name(el.parentElement));
  }

  // stretch gaps inside row components
  for (const rowEl of document.querySelectorAll('.reg__r, .con__r, .task, .q-item, .ws-kv, .ws-act, .proj')) {
    if (!vis(rowEl)) continue;
    const rr = rowEl.getBoundingClientRect();
    const xs = leaves.filter((l) => rowEl.contains(l.el)).flatMap((l) => l.rects).filter((r) => r.top < rr.bottom && r.bottom > rr.top).sort((a, b) => a.left - b.left);
    for (let i = 1; i < xs.length; i++) {
      const g = xs[i].left - Math.max(...xs.slice(0, i).map((r) => r.right));
      if (g > 360) {
        out.stretch.push(`${name(rowEl)} gap ${Math.round(g)}px`);
        break;
      }
    }
  }

  for (const k of Object.keys(out)) out[k] = [...new Set(out[k])];
  return out;
}
