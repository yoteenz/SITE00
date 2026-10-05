// FULL-AUTHORITY-FORENSIC-AUDIT.OPUS2 live QA — run against a local Vite server (paths are this session's container: playwright from the repo node_modules, Chromium from /opt/pw-browsers).
// Live capture + one-viewport / media-hierarchy metrics for every mapped Production route.
// usage: node cap.mjs <outDir> <port> <routes.json> [vpKeys,comma] [concurrency]
import { chromium } from '/home/user/SITE00/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync, readFileSync, appendFileSync } from 'node:fs';
const [OUT, PORT, ROUTES, ONLY, CONC] = process.argv.slice(2);
const B = `http://127.0.0.1:${PORT}`;
const ROUTE_LIST = JSON.parse(readFileSync(ROUTES, 'utf8')); // [{key, path, family}]
const ALL_VPS = [
  ['m390', 390, 844], ['m393', 393, 852], ['m430', 430, 932], ['m390s', 390, 664], ['m360', 360, 640],
  ['t768', 768, 1024], ['t820', 820, 1180], ['t1024p', 1024, 1366], ['t1024l', 1024, 768],
  ['d1440', 1440, 900], ['d1680', 1680, 1050], ['d1920', 1920, 1080], ['d1440s', 1440, 810], ['d1280', 1280, 720],
];
const VPS = ALL_VPS.filter((v) => !ONLY || ONLY.split(',').includes(v[0]));
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const rows = [];

async function measure(p) {
  return p.evaluate(() => {
    const S = document.querySelector('[data-testid=production-authority-scroll]') ?? document.querySelector('[data-testid=cf-scroll]');
    const body = document.querySelector('.pxa-body') ?? document.querySelector('main') ?? document.body;
    const de = document.documentElement;
    const before = scrollY; window.scrollBy(0, 400); const docMoved = scrollY - before; window.scrollTo(0, 0);
    const br = body.getBoundingClientRect();
    const vis = (e) => { const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05; };
    const inView = (r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    // media: <img>, <video>, <canvas>, and boxes with a url() background — inside the body only
    const media = [];
    for (const e of body.querySelectorAll('img, video, canvas, picture, [style*="background-image"], [data-media]')) {
      if (!vis(e)) continue;
      if (e.closest('[data-open="false"], [aria-hidden="true"][data-decor]')) continue;
      let r = e.getBoundingClientRect();
      if (e.tagName === 'PICTURE') continue;
      if (!inView(r)) continue;
      const bg = getComputedStyle(e).backgroundImage;
      if (!['IMG', 'VIDEO', 'CANVAS'].includes(e.tagName) && !(bg && bg.includes('url('))) continue;
      // clip to the overflow-clipping ancestors (what the eye actually sees). A scroll pane's edge only hides the part the
      // user scrolls to, so the strip test uses the box clipped by non-scrolling ancestors (the media's real shape).
      let a = e.parentElement; let L = r.left, T = r.top, R = r.right, Bm = r.bottom;
      let nL = L, nT = T, nR = R, nB = Bm; let pastScroller = false;
      while (a && a !== document.body) {
        const cs = getComputedStyle(a);
        if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
          const ar = a.getBoundingClientRect(); L = Math.max(L, ar.left); T = Math.max(T, ar.top); R = Math.min(R, ar.right); Bm = Math.min(Bm, ar.bottom);
          const scroller = /auto|scroll/.test(cs.overflowY + cs.overflowX);
          if (scroller) pastScroller = true;
          else if (!pastScroller) { nL = Math.max(nL, ar.left); nT = Math.max(nT, ar.top); nR = Math.min(nR, ar.right); nB = Math.min(nB, ar.bottom); }
        }
        a = a.parentElement;
      }
      L = Math.max(L, 0); T = Math.max(T, 0); R = Math.min(R, innerWidth); Bm = Math.min(Bm, innerHeight);
      const w = R - L, h = Bm - T;
      const nw = nR - nL, nh = nB - nT;
      if ((w < 44 && h < 44) || Math.max(w, h) < 64) continue; // icons / avatars (wide-but-short boxes stay: they are the strips)
      const tid = e.closest('[data-testid]')?.getAttribute('data-testid') ?? '';
      const cls = String(e.className?.baseVal ?? e.className ?? '').split(' ')[0];
      media.push({ w: Math.round(w), h: Math.round(h), nw: Math.round(nw), nh: Math.round(nh), x: Math.round(L), y: Math.round(T), tid, cls, src: (e.currentSrc || e.src || bg || '').slice(-60) });
    }
    const bodyArea = Math.max(1, Math.min(br.width, innerWidth) * Math.max(1, Math.min(br.bottom, innerHeight) - Math.max(br.top, 0)));
    media.sort((a, b) => b.w * b.h - a.w * a.h);
    const largest = media[0] ? (media[0].w * media[0].h) / bodyArea : 0;
    const strips = media.filter((m) => (m.nw / m.nh >= 3.2 && m.nh < 0.2 * (br.height || innerHeight)) || (m.nh < 64 && m.nw >= 180)).slice(0, 8);
    // text: min font size of visible text in the body
    let minFont = 99; let minFontEl = '';
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode; if (!t.textContent.trim()) continue;
      const el = t.parentElement; if (!el || !vis(el)) continue;
      const r = el.getBoundingClientRect(); if (!inView(r)) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < minFont) { minFont = fs; minFontEl = String(el.className?.baseVal ?? el.className).split(' ')[0]; }
    }
    const clipped = [...body.querySelectorAll('*')].filter((e) => {
      if (!vis(e)) return false; const cs = getComputedStyle(e);
      const internal = e.closest('[data-scroll]'); if (internal && internal !== e) return false; if (e.matches('[data-scroll]')) return false;
      if (cs.textOverflow === 'ellipsis' || cs.webkitLineClamp !== 'none') return false;
      const r = e.getBoundingClientRect(); if (!inView(r)) return false;
      const v = (cs.overflowY === 'hidden' || cs.overflowY === 'clip' || cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight - e.clientHeight > 2 && !(cs.overflowY === 'auto' || cs.overflowY === 'scroll');
      const h = cs.overflowX !== 'visible' && e.scrollWidth - e.clientWidth > 2;
      return v || h;
    }).map((e) => (e.closest('[data-testid]')?.getAttribute('data-testid') ?? '?') + ':' + String(e.className?.baseVal ?? e.className).split(' ')[0]);
    // horizontal overflow = content that reaches past the viewport edge where the eye (or a horizontal scroll) can
    // meet it. A layer clipped by an overflow-hidden ancestor that itself sits inside the viewport is not overflow.
    const clippedInside = (e) => {
      for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.overflowX === 'hidden' || cs.overflowX === 'clip') { const ar = a.getBoundingClientRect(); if (ar.left >= -1 && ar.right <= innerWidth + 1) return true; }
      }
      return false;
    };
    const hOver = [...body.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return vis(e) && r.width && r.height && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('[data-scroll=internal-x]') && !e.closest('[data-open="false"]') && !clippedInside(e); })
      .map((e) => String(e.className?.baseVal ?? e.className).split(' ')[0]).slice(0, 6);
    const nav = document.querySelector('[data-testid^=nav-].is-active, [data-testid^=nav-][aria-current=page]');
    const navR = nav?.getBoundingClientRect();
    const scrollPanes = [...body.querySelectorAll('*')].filter((e) => { const cs = getComputedStyle(e); return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight - e.clientHeight > 2; })
      .map((e) => (e.closest('[data-testid]')?.getAttribute('data-testid') ?? '?') + ':' + String(e.className?.baseVal ?? e.className).split(' ')[0] + (e.matches('[data-scroll]') ? '' : '!unmarked')).slice(0, 8);
    return {
      frameOverflow: S ? S.scrollHeight - S.clientHeight : null, docOverflow: de.scrollHeight - de.clientHeight, docMoved, docOverflowX: de.scrollWidth - de.clientWidth,
      bodyH: Math.round(br.height), mediaCount: media.length, largestMedia: Math.round(largest * 1000) / 1000,
      largestBox: media[0] ? `${media[0].w}x${media[0].h}@${media[0].tid || media[0].cls}` : null,
      strips: strips.map((m) => `${m.w}x${m.h}@${m.tid || m.cls}`), media: media.slice(0, 10),
      minFont: minFont === 99 ? null : minFont, minFontEl, clipped: [...new Set(clipped)].slice(0, 10), hOver: [...new Set(hOver)],
      navActive: nav?.getAttribute('data-testid') ?? null, navInView: !!navR && navR.bottom <= innerHeight + 1 && navR.top >= -1,
      scrollPanes, title: document.title,
    };
  });
}

async function runVp([vk, w, h]) {
  const m = w < 700;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: m, hasTouch: m });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  let first = true;
  for (const r of ROUTE_LIST) {
    errs.length = 0;
    const guard = new Promise((_, rej) => setTimeout(() => rej(new Error('route timeout')), 45000));
    try {
      await Promise.race([guard, (async () => {
      if (first) { await p.goto(B + r.path, { waitUntil: 'domcontentloaded', timeout: 60000 }); first = false; }
      else {
        await p.evaluate((u) => { history.pushState({}, '', u); dispatchEvent(new PopStateEvent('popstate', { state: {} })); }, r.path);
      }
      await p.waitForSelector('.pxa-body', { timeout: 12000 }).catch(() => {});
      await p.waitForFunction(() => (document.querySelector('.pxa-body')?.innerText.trim().length ?? 0) > 40, null, { timeout: 15000 }).catch(() => {});
      if (r.wait) await p.waitForSelector(r.wait, { timeout: 15000 }).catch(() => {});
      await p.waitForTimeout(r.settle ?? 700);
      await p.evaluate(() => document.fonts.ready).catch(() => {});
      // let lazy images decode
      await p.evaluate(async () => { await Promise.all([...document.images].filter((i) => !i.complete).slice(0, 40).map((i) => new Promise((res) => { i.onload = i.onerror = res; setTimeout(res, 2500); }))); }).catch(() => {});
      const met = await measure(p);
      const dir = `${OUT}/${r.family.toLowerCase()}`; mkdirSync(dir, { recursive: true });
      const file = `${dir}/${r.key}__${vk}.jpg`;
      await p.screenshot({ path: file, type: 'jpeg', quality: 70 });
      const row = { key: r.key, path: r.path, family: r.family, vp: vk, w, h, file: file.replace(OUT + '/', ''), ...met, errs: [...errs] };
      rows.push(row); appendFileSync(`${OUT}/rows.jsonl`, JSON.stringify(row) + '\n');
      })()]);
    } catch (e) {
      rows.push({ key: r.key, path: r.path, family: r.family, vp: vk, w, h, error: String(e).slice(0, 200) });
    }
  }
  await ctx.close();
}

const conc = Number(CONC || 3);
const queue = [...VPS];
await Promise.all(Array.from({ length: conc }, async () => { while (queue.length) await runVp(queue.shift()); }));
await browser.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify(rows, null, 1));
let bad = 0;
for (const r of rows) {
  const scroll = (r.frameOverflow ?? 0) > 1 || r.docOverflow > 1 || r.docMoved;
  const f = r.error || scroll || r.clipped?.length || r.hOver?.length || r.strips?.length || (r.minFont ?? 99) < 8.5;
  if (f) bad++;
}
console.log(`rows ${rows.length} flagged ${bad}`);
