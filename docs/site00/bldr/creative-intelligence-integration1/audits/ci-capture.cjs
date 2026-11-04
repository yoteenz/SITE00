/**
 * Creative-intelligence evidence on the real builder: drive the rooms for one configuration, then capture STRUCTURE
 * (creative direction) and PAGES (named pages expanded) at each width. Records tab-switch writes and panel text.
 * env: NAME PLACE FEEL MODULES PACE  WIDTHS  OPEN (comma page labels to expand)  OUT
 */
const { chromium } = require('/home/user/SITE00/node_modules/playwright');
const { PNG } = require('/home/user/SITE00/node_modules/pngjs');
const fs = require('fs');
const path = require('path');
const E = process.env;
const NAME = E.NAME;
const OUT = path.resolve(E.OUT);
const WIDTHS = (E.WIDTHS || '390,834,1440').split(',').map(Number);
const HEIGHT = { 320: 700, 390: 844, 768: 1024, 834: 1194, 1024: 1366, 1440: 900, 1920: 1080 };
const CFG = { place: E.PLACE, feel: E.FEEL, modules: E.MODULES.split(','), pace: E.PACE || 'STANDARD' };
const OPEN = (E.OPEN || 'HOME,ABOUT,SHOP,ACCOUNT,DASHBOARD').split(',');
fs.mkdirSync(OUT, { recursive: true });

async function fonts(p) {
  await p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(['700 12px "Saira Semi Condensed"', '500 12px "Saira Semi Condensed"', '400 12px "Saira Semi Condensed"'].map((f) => document.fonts.load(f)));
  });
}

async function stitch(p, file) {
  const box = await p.evaluate(() => {
    const c = document.querySelector('.bs-controls');
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(c.clientHeight), total: c.scrollHeight };
  });
  const tall = new PNG({ width: box.w, height: box.total });
  for (let y = 0; y < box.total; y += box.h) {
    const at = await p.evaluate((v) => { const c = document.querySelector('.bs-controls'); c.scrollTop = v; return c.scrollTop; }, y);
    await p.waitForTimeout(200);
    const shot = PNG.sync.read(await p.screenshot({ clip: { x: box.x, y: box.y, width: box.w, height: box.h } }));
    PNG.bitblt(shot, tall, 0, 0, box.w, Math.min(box.h, box.total - at), 0, at);
  }
  await p.evaluate(() => { document.querySelector('.bs-controls').scrollTop = 0; });
  fs.writeFileSync(file, PNG.sync.write(tall));
}

async function shoot(p, W, file, focusSel) {
  if (W >= 1100) {
    // desktop: one fixed screen with the model, the tab column scrolled to the section in question; plus the whole column
    if (focusSel) await p.evaluate((s) => { const el = document.querySelector(s); const c = document.querySelector('.bs-controls'); if (el && c) c.scrollTop = el.offsetTop - 120; }, focusSel);
    await p.waitForTimeout(300);
    await p.screenshot({ path: file.replace('.png', '-screen.png') });
    await stitch(p, file.replace('.png', '-panel.png'));
  } else {
    const top = await p.evaluate(() => { const s = document.querySelector('.bs-stage'); return s ? Math.max(0, s.getBoundingClientRect().y + scrollY - 8) : 0; });
    const full = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.screenshot({ path: file, fullPage: true, clip: { x: 0, y: top, width: W, height: full - top } });
  }
}

const AUDIT = () => {
  const root = document.querySelector('.bs-root');
  const panel = document.querySelector('.bs-tabpanel');
  const lower = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const t = n.data.trim();
    if (!t || !/[a-z]/.test(t)) continue;
    const el = n.parentElement;
    if (!el || el.closest('input,textarea,[contenteditable],script,style,.bs-usertext')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.textTransform === 'uppercase') continue;
    lower.push(t.slice(0, 60));
  }
  const overflow = [];
  panel.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > document.documentElement.clientWidth + 1 && !el.closest('svg')) overflow.push(String(el.className).slice(0, 50));
  });
  // text clipped by its own box (cropped descriptions)
  const clipped = [];
  panel.querySelectorAll('p,dd,dt,span').forEach((el) => {
    const cs = getComputedStyle(el);
    if ((cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) clipped.push(String(el.className).slice(0, 50));
  });
  // a direction row's label and its source never overlap
  const overlaps = [];
  panel.querySelectorAll('.bs-dir').forEach((li) => {
    const a = li.querySelector('.bs-dir__label').getBoundingClientRect();
    const b = li.querySelector('.bs-dir__source').getBoundingClientRect();
    const v = li.querySelector('.bs-dir__value').getBoundingClientRect();
    const hit = (x, y) => x.left < y.right && y.left < x.right && x.top < y.bottom && y.top < x.bottom;
    if (hit(a, b) || hit(b, v)) overlaps.push(li.querySelector('.bs-dir__label').textContent);
  });
  // smallest rendered font size inside the panel
  let minFont = 99;
  panel.querySelectorAll('*').forEach((el) => { if (el.childNodes.length && [...el.childNodes].some((c) => c.nodeType === 3 && c.data.trim())) minFont = Math.min(minFont, parseFloat(getComputedStyle(el).fontSize)); });
  return { docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, lowercase: lower, overflow, clipped, overlaps, minFont, headers: document.querySelectorAll('.bs-header').length };
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: WIDTHS[0], height: HEIGHT[WIDTHS[0]] || 900 }, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const writes = [];
  p.on('request', (r) => { if (/\/api\//.test(r.url()) && r.method() !== 'GET') writes.push(`${r.method()} ${r.url().replace(/^https?:\/\/[^/]+/, '')}`); });
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  const cont = async () => { await p.click('.bs-footer .bs-cta'); await p.waitForTimeout(900); };
  await p.goto('http://127.0.0.1:5182/bldr/studio/place');
  await p.waitForSelector('.bs-cards', { timeout: 90000 });
  await p.waitForTimeout(1200);
  await p.click(`.bs-card:has(.bs-card__label:text-is("${CFG.place}"))`); await cont();
  await p.waitForTimeout(600);
  await p.click(`[role="radio"]:has-text("${CFG.feel}")`); await cont();
  for (const m of CFG.modules) {
    const pressed = await p.getAttribute(`button[aria-labelledby="bs-module-${m}"]`, 'aria-pressed');
    if (pressed !== 'true') await p.click(`button[aria-labelledby="bs-module-${m}"]`);
    await p.waitForTimeout(400);
  }
  await cont();
  await p.click(`[role="radio"]:has-text("${CFG.pace}")`); await p.waitForTimeout(500); await cont();
  await p.waitForSelector('.bs-tabs', { timeout: 60000 });
  await p.waitForLoadState('networkidle').catch(() => {});
  await fonts(p);
  await p.waitForTimeout(2500);
  const report = { name: NAME, cfg: CFG, url: p.url(), widths: {} };
  const canvas = await p.evaluateHandle(() => document.querySelector('.bs-stage canvas'));
  const writesBefore = writes.length;
  const headerBefore = await p.textContent('.bs-header');
  for (const W of WIDTHS) {
    await p.setViewportSize({ width: W, height: HEIGHT[W] || 900 });
    await p.waitForTimeout(900);
    const r = {};
    // STRUCTURE
    await p.click('.bs-tab:has-text("STRUCTURE")');
    await p.waitForTimeout(900);
    r.structure = await p.evaluate(AUDIT);
    r.direction = await p.evaluate(() => [...document.querySelectorAll('.bs-dir')].map((li) => ({
      label: li.querySelector('.bs-dir__label').textContent,
      source: li.querySelector('.bs-dir__source').textContent,
      value: li.querySelector('.bs-dir__value').textContent,
      note: li.querySelector('.bs-dir__note').textContent,
    })));
    r.directionNote = await p.evaluate(() => { const h = [...document.querySelectorAll('.bs-section')].find((x) => x.textContent === 'CREATIVE DIRECTION'); return h?.nextElementSibling?.textContent ?? null; });
    await shoot(p, W, path.join(OUT, `structure-${NAME}-${W}.png`), '.bs-direction');
    // with every IN DETAIL open
    await p.evaluate(() => document.querySelectorAll('.bs-dir details').forEach((d) => { d.open = true; }));
    await p.waitForTimeout(300);
    r.structureOpen = await p.evaluate(AUDIT);
    if (W === WIDTHS[0]) {
      const el = await p.$('.bs-direction');
      await el.screenshot({ path: path.join(OUT, `structure-${NAME}-${W}-direction-detail.png`) });
    }
    await p.evaluate(() => document.querySelectorAll('.bs-dir details').forEach((d) => { d.open = false; }));
    // PAGES
    await p.click('.bs-tab:has-text("PAGES")');
    await p.waitForTimeout(900);
    const opened = await p.evaluate((labels) => {
      const got = [];
      document.querySelectorAll('details.bs-pageitem').forEach((d) => {
        const name = d.querySelector('.bs-pageitem__name').textContent;
        if (labels.includes(name)) { d.open = true; got.push(name); }
      });
      return got;
    }, OPEN);
    await p.waitForTimeout(400);
    r.pages = await p.evaluate(AUDIT);
    r.pageText = await p.evaluate(() => [...document.querySelectorAll('details.bs-pageitem')].map((d) => ({
      name: d.querySelector('.bs-pageitem__name').textContent,
      purpose: d.querySelector('.bs-pageitem__purpose').textContent,
      facts: [...d.querySelectorAll('.bs-pagefacts > div')].map((f) => `${f.querySelector('dt').textContent} — ${f.querySelector('dd').textContent}`),
    })));
    r.opened = opened;
    await shoot(p, W, path.join(OUT, `pages-${NAME}-${W}.png`), 'details.bs-pageitem[open]');
    if (W === WIDTHS[0]) {
      for (const name of opened) {
        const el = await p.evaluateHandle((n) => [...document.querySelectorAll('details.bs-pageitem')].find((d) => d.querySelector('.bs-pageitem__name').textContent === n), name);
        await el.asElement().scrollIntoViewIfNeeded();
        await el.asElement().screenshot({ path: path.join(OUT, `pages-${NAME}-${W}-${name.toLowerCase()}.png`) });
      }
    }
    await p.evaluate(() => document.querySelectorAll('details.bs-pageitem').forEach((d) => { d.open = false; }));
    r.sameCanvas = await p.evaluate((c) => c === document.querySelector('.bs-stage canvas'), canvas);
    report.widths[W] = r;
  }
  // tab sweep, then resume
  for (const t of ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE']) { await p.click(`.bs-tab:has-text("${t}")`); await p.waitForTimeout(500); }
  report.writesDuringTabs = writes.slice(writesBefore);
  report.headerSame = headerBefore === (await p.textContent('.bs-header'));
  report.estimate = await p.evaluate(() => { const t = document.querySelector('.bs-tabpanel'); return t ? t.innerText.match(/\$[\d,]+\s*[–-]\s*\$[\d,]+|\d+\s*[–-]\s*\d+\s*(MONTHS|WEEKS)/g) : null; });
  await p.reload();
  await p.waitForSelector('.bs-tabs', { timeout: 60000 });
  await p.waitForTimeout(2000);
  report.resumeUrl = p.url();
  await p.click('.bs-tab:has-text("STRUCTURE")');
  await p.waitForTimeout(800);
  report.resumeDirection = await p.evaluate(() => [...document.querySelectorAll('.bs-dir__value')].map((v) => v.textContent));
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, `ci-${NAME}.json`), JSON.stringify(report, null, 1));
  const sum = Object.fromEntries(Object.entries(report.widths).map(([w, r]) => [w, { ovx: r.structure.docOverflowX + r.pages.docOverflowX, low: r.structure.lowercase.length + r.pages.lowercase.length + r.structureOpen.lowercase.length, of: r.structure.overflow.length + r.pages.overflow.length, clip: r.structure.clipped.length + r.pages.clipped.length, ov: r.structure.overlaps.length + r.structureOpen.overlaps.length, minFont: Math.min(r.structure.minFont, r.pages.minFont), same: r.sameCanvas, opened: r.opened.length }]));
  console.log(NAME, JSON.stringify({ sum, writes: report.writesDuringTabs, headerSame: report.headerSame, resume: report.resumeDirection.length, errors }));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
