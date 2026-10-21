/**
 * DF crown text vs locked artwork — measurement on the actual React client.
 *
 * Needs a dev server with the cloud-preview memory store, e.g.
 *   SITE00_CLOUD_MOBILE_PREVIEW=1 SITE00_INTAKES_USE_MEMORY=1 npx vite --port 5181 --strictPort
 * usage: node scripts/site00/df-crown-text-qa/zoom.cjs <out-dir> (ZOOM=browser | ZOOM=text: 200% zoom at 390 and 1440)
 *
 * For every page × width it records rail/headline/lede boxes, computed widths and per-line glyph extents,
 * the artwork boxes and computed styles, a pixel hash of the art-only render (text hidden, screen pinned
 * to 2400px so rasterization does not depend on page height), and per-line clearance to the nearest art
 * ink in that line's rows (art-only render minus art-hidden render). Captures wait for the headline,
 * lede and rail font faces to load, so no measurement uses fallback metrics.
 */
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BASE = process.env.DF_QA_BASE || 'http://127.0.0.1:5181';
const OUT = path.resolve(process.argv[2] || 'df-crown-text-qa-zoom');
const ONLY = [390, 1440];
const ZOOM = process.env.ZOOM; // 'browser' | 'text'
fs.mkdirSync(OUT, { recursive: true });

const SIZES = [
  [320, 568], [360, 780], [375, 812], [390, 844], [402, 874], [430, 932],
  [768, 1024], [834, 1194], [1024, 1366], [1194, 834], [1440, 900], [1920, 1080], [2560, 1440],
];

async function post(body) {
  const r = await fetch(`${BASE}/api/dev/site00-digital-foundation-preview-bootstrap`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  return r.json();
}

function inkMask(a, b) {
  const A = PNG.sync.read(a), B = PNG.sync.read(b);
  const w = A.width, h = A.height, m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    m[i] = Math.max(Math.abs(A.data[o] - B.data[o]), Math.abs(A.data[o + 1] - B.data[o + 1]), Math.abs(A.data[o + 2] - B.data[o + 2]));
  }
  return { w, h, m };
}

/** Leftmost x (>= x0) in rows [y0,y1) where art ink >= T; Infinity if none. */
function inkLeft(mask, x0, y0, y1, T) {
  let best = Infinity;
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(mask.h, Math.ceil(y1)); y++) {
    for (let x = Math.max(0, Math.floor(x0)); x < mask.w && x < best; x++) {
      if (mask.m[y * mask.w + x] >= T) { best = x; break; }
    }
  }
  return best;
}

const MEASURE = (sel) => {
  const screen = document.querySelector(sel);
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2), r: +b.right.toFixed(2), b: +b.bottom.toFixed(2) }; };
  const cs = (el, keys) => { if (!el) return null; const c = getComputedStyle(el); const o = {}; keys.forEach((k) => (o[k] = c.getPropertyValue(k))); return o; };
  const ART_KEYS = ['position', 'top', 'right', 'bottom', 'left', 'width', 'max-width', 'height', 'opacity', 'transform', 'z-index', 'object-fit', 'object-position', 'background-size', 'background-position', 'mask-image', 'filter', 'animation-name', 'visibility', 'display'];
  function lines(el) {
    if (!el) return null;
    const words = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.parentElement && n.parentElement.closest('.df-headline__period')) continue;
      const re = /\S+/g; let m;
      while ((m = re.exec(n.data))) {
        const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        const rects = [...rg.getClientRects()].filter((q) => q.width > 0);
        rects.forEach((q) => words.push({ t: m[0], x: q.left, r: q.right, y: q.top, b: q.bottom }));
      }
    }
    // period box (headline) counts as glyph content
    el.querySelectorAll('.df-headline__period').forEach((p) => { const q = p.getBoundingClientRect(); words.push({ t: '■', x: q.left, r: q.right, y: q.top, b: q.bottom, period: true }); });
    words.sort((a, b) => a.y - b.y || a.x - b.x);
    const out = [];
    for (const w of words) {
      const mid = (w.y + w.b) / 2;
      let L = out.find((l) => mid >= l.y - 1 && mid <= l.b + 1);
      if (!L) { L = { y: w.y, b: w.b, x: w.x, r: w.r, words: [] }; out.push(L); }
      L.y = Math.min(L.y, w.y); L.b = Math.max(L.b, w.b); L.x = Math.min(L.x, w.x); L.r = Math.max(L.r, w.r); L.words.push(w.t);
    }
    out.sort((a, b) => a.y - b.y);
    return out.map((l) => ({ y: +l.y.toFixed(1), b: +l.b.toFixed(1), x: +l.x.toFixed(1), r: +l.r.toFixed(1), w: +(l.r - l.x).toFixed(1), text: l.words.join(' ') }));
  }
  const main = screen.querySelector('.df-screen__main');
  const roles = {
    rail: screen.querySelector('.df-screen__main > .df-rail, .df-screen__main .df-rail'),
    headline: screen.querySelector('.df-headline'),
    lede: screen.querySelector('.df-lede'),
  };
  const roleData = {};
  for (const [k, el] of Object.entries(roles)) {
    roleData[k] = el ? { box: r(el), style: cs(el, ['max-width', 'font-size', 'line-height', 'letter-spacing', 'text-wrap', 'text-wrap-mode', 'text-wrap-style']), lines: lines(el), scrollW: el.scrollWidth, clientW: el.clientWidth } : null;
  }
  const crown = screen.querySelector('.df-object--crown');
  const corner = screen.querySelector('.df-object--corner');
  const hero = screen.querySelector('.df-object--hero');
  const svg = (o) => o && o.querySelector('svg, img');
  return {
    view: screen.dataset.view,
    screen: r(screen), main: r(main), mainStyle: cs(main, ['max-width']),
    vars: cs(screen, ['--df-crown-art-band', '--df-crown-text-gap', '--df-crown-text-max', '--df-gutter', '--df-headline']),
    roles: roleData,
    art: {
      crown: crown && { box: r(crown), style: cs(crown, ART_KEYS), svg: r(svg(crown)), svgAttr: svg(crown) && { viewBox: svg(crown).getAttribute('viewBox'), par: svg(crown).getAttribute('preserveAspectRatio'), src: svg(crown).getAttribute('src') } },
      corner: corner && { box: r(corner), style: cs(corner, ART_KEYS), svg: r(svg(corner)) },
      hero: hero && { box: r(hero), style: cs(hero, ART_KEYS), svg: r(svg(hero)) },
    },
    docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    screenOverflowX: screen.scrollWidth - screen.clientWidth,
    mainOverflowX: main.scrollWidth - main.clientWidth,
  };
};

async function textZoom(page, sel) {
  if (ZOOM !== 'text') return;
  await page.evaluate((s) => {
    const root = document.querySelector(s);
    const els = root.querySelectorAll('.df-headline, .df-lede, .df-rail__index, .df-rail__label');
    const sizes = [...els].map((el) => parseFloat(getComputedStyle(el).fontSize));
    els.forEach((el, i) => { el.style.fontSize = sizes[i] * 2 + 'px'; });
  }, sel);
  await page.waitForTimeout(150);
}

async function capture(page, sel, name, W, H) {
  await page.evaluate((s) => { const el = document.querySelector(s); el.scrollIntoView({ block: 'start' }); }, sel);
  await page.waitForTimeout(150);
  const data = await page.evaluate(MEASURE, sel);
  const s = data.screen;
  const clip = { x: Math.max(0, s.x), y: Math.max(0, s.y), width: Math.min(s.w, W - Math.max(0, s.x)), height: Math.min(s.h, H - Math.max(0, s.y)) };
  const shotFull = await page.screenshot({ clip, scale: 'css' });
  fs.writeFileSync(path.join(OUT, `${name}.png`), shotFull);
  const hideStyle = await page.addStyleTag({ content: `${sel} { height: 2400px !important; min-height: 2400px !important; } ${sel} .df-screen__grid, ${sel} .df-header, ${sel} .df-footer, ${sel} .df-screen__main { visibility: hidden !important; } ${sel} .df-object--hero { visibility: visible !important; }` });
  await page.waitForTimeout(60);
  const shotArt = await page.screenshot({ clip, scale: 'css' });
  const hideArt = await page.addStyleTag({ content: `${sel} .df-object { visibility: hidden !important; }` });
  await page.waitForTimeout(60);
  const shotBare = await page.screenshot({ clip, scale: 'css' });
  await hideArt.evaluate((n) => n.remove());
  await hideStyle.evaluate((n) => n.remove());
  fs.writeFileSync(path.join(OUT, `${name}__art.png`), shotArt);
  const mask = inkMask(shotArt, shotBare);
  // art-only pixel hash over the crown (or hero/corner) object rects, relative to the screen
  const hashRect = (box) => {
    if (!box) return null;
    const A = PNG.sync.read(shotArt);
    const x0 = Math.max(0, Math.round(box.x - clip.x)), y0 = Math.max(0, Math.round(box.y - clip.y));
    const x1 = Math.min(A.width, Math.round(box.r - clip.x)), y1 = Math.min(A.height, Math.round(box.b - clip.y));
    const h = crypto.createHash('sha256');
    for (let y = y0; y < y1; y++) h.update(A.data.subarray((y * A.width + x0) * 4, (y * A.width + x1) * 4));
    return { hash: h.digest('hex').slice(0, 16), rect: [x0, y0, x1, y1] };
  };
  data.artHash = { crown: hashRect(data.art.crown && data.art.crown.box), corner: hashRect(data.art.corner && data.art.corner.box), hero: hashRect(data.art.hero && data.art.hero.box) };
  // clearance per line against art ink (T>=6 visible ink, T>=24 strong ink)
  for (const role of ['rail', 'headline', 'lede']) {
    const R = data.roles[role];
    if (!R || !R.lines) continue;
    for (const l of R.lines) {
      const y0 = l.y - clip.y, y1 = l.b - clip.y, x0 = l.x - clip.x;
      const v = inkLeft(mask, x0, y0, y1, 6), st = inkLeft(mask, x0, y0, y1, 24);
      l.inkVisibleX = v === Infinity ? null : +(v + clip.x).toFixed(1);
      l.inkStrongX = st === Infinity ? null : +(st + clip.x).toFixed(1);
      l.clearVisible = v === Infinity ? null : +(v + clip.x - l.r).toFixed(1);
      l.clearStrong = st === Infinity ? null : +(st + clip.x - l.r).toFixed(1);
      l.overlapsInk = v !== Infinity && v + clip.x < l.r;
    }
  }
  data.W = W; data.H = H; data.name = name;
  return data;
}

(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const lead = await post({ business_name: 'OTC preview business' });
  const a = await post({ fixture_id: 'A_BASE' });
  const j = await post({ fixture_id: 'J_PAYMENT_SUCCESS' });
  const PAGES = [
    { key: 'P01', token: lead.public_token, view: null },
    { key: 'P04', token: a.public_token, view: 'P04' },
    { key: 'P05', token: a.public_token, view: 'P05' },
    { key: 'P06', token: j.public_token, view: 'P06' },
    { key: 'OVERVIEW', token: j.public_token, view: 'OVERVIEW', seen: true },
    { key: 'ROADMAP', token: j.public_token, view: 'ROADMAP', seen: true },
    { key: 'NEEDS_YOU', token: j.public_token, view: 'NEEDS_YOU', seen: true },
    { key: 'RECORDS', token: j.public_token, view: 'RECORDS', seen: true },
  ];
  const results = [];
  for (const [W, H] of SIZES) {
    if (ONLY && !ONLY.includes(W)) continue;
    const VW = ZOOM === 'browser' ? W / 2 : W, VH = ZOOM === 'browser' ? H / 2 : H;
    let ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: ZOOM === 'browser' ? 2 : 1, serviceWorkers: 'block' });
    let page = await ctx.newPage();
    for (const P of PAGES) {
      await page.goto(`${BASE}/foundation/${P.token}`);
      await page.waitForSelector('.df-screen');
      if (P.seen) await page.evaluate((id) => localStorage.setItem(`site00.df.activation-seen.${id}`, '1'), j.artifact.artifact_id);
      if (P.view) {
        await page.evaluate((v) => history.replaceState({ usr: { dfView: v }, key: 'otc', idx: 0 }, ''), P.view);
        await page.reload();
      }
      await page.waitForSelector('.df-screen');
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        const specs = [...document.querySelectorAll('.df-headline, .df-lede, .df-rail__label')].map((el) => {
          const c = getComputedStyle(el);
          return `${c.fontWeight} ${c.fontSize} ${c.fontFamily}`;
        });
        await Promise.all(specs.map((f) => document.fonts.load(f)));
      });
      await page.waitForFunction(() =>
        [...document.querySelectorAll('.df-headline, .df-lede, .df-rail__label')].every((el) => {
          const c = getComputedStyle(el);
          return document.fonts.check(`${c.fontWeight} ${c.fontSize} ${c.fontFamily}`);
        }),
      );
      await page.waitForTimeout(600);
      const got = await page.evaluate(() => document.querySelector('.df-screen').dataset.view);
      if (got !== P.key) { results.push({ name: `${P.key}-${W}`, error: `view ${got}` }); continue; }
      await textZoom(page, '.df-screen');
      results.push(await capture(page, '.df-screen', `${P.key}-${W}`, VW, VH));
    }
    if ([390, 1440].includes(W)) {
      await ctx.close();
      ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: ZOOM === 'browser' ? 2 : 1, serviceWorkers: 'block' });
      page = await ctx.newPage();
      await page.goto(`${BASE}/foundation/review`);
      await page.waitForSelector('#df-r-OVERVIEW .df-screen', { state: 'attached', timeout: 90000 });
      for (const v of ['P04', 'P05', 'P06', 'OVERVIEW']) await page.waitForSelector(`#df-r-${v} .df-headline`, { state: 'attached', timeout: 90000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      for (const v of ['P01', 'P04', 'P05', 'P06', 'OVERVIEW']) {
        await textZoom(page, `#df-r-${v} .df-screen`);
        results.push({ review: true, ...(await capture(page, `#df-r-${v} .df-screen`, `review-${v}-${W}`, VW, VH)) });
      }
    }
    await ctx.close();
    process.stdout.write(`${W} `);
  }
  fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify(results, null, 1));
  await browser.close();
  console.log('\ndone', results.length);
})().catch((e) => { console.error(e); process.exit(1); });
