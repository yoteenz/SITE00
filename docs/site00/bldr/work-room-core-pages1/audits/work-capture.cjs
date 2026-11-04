/**
 * WORK room · CORE PAGES INCLUDED evidence on the real builder.
 * env: OUT NAME PLACE FEEL MODULES WIDTHS  (MODULES are toggled on in the WORK room)
 *      SHOTS=1 for the full shot set; BLUEPRINT=1 to continue to the Blueprint and compare counts
 */
const { chromium } = require('/home/user/SITE00/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const E = process.env;
const OUT = path.resolve(E.OUT);
const NAME = E.NAME;
const WIDTHS = (E.WIDTHS || '390').split(',').map(Number);
const HEIGHT = { 320: 700, 390: 844, 430: 932, 768: 1024, 834: 1194, 1024: 1366, 1440: 900, 1920: 1080 };
const MODULES = E.MODULES ? E.MODULES.split(',') : [];
fs.mkdirSync(OUT, { recursive: true });

const PANEL = () => {
  const core = document.querySelector('.bs-core');
  if (!core) return null;
  const txt = (s) => [...core.querySelectorAll(s)].map((e) => e.textContent.trim());
  return {
    open: core.classList.contains('is-open'),
    summary: txt('.bs-core__summary')[0] ?? null,
    metrics: [...core.querySelectorAll('.bs-core__metric')].map((m) => m.textContent.trim()),
    groups: [...core.querySelectorAll('.bs-core__group')].map((g) => ({
      title: g.querySelector('.bs-core__group-title').textContent,
      pages: g.querySelector('.bs-core__group-pages').textContent,
      open: g.open,
    })),
    features: [...core.querySelectorAll('.bs-core__feature')].map((f) => (f.classList.contains('is-included') ? `(${f.textContent})` : f.textContent)),
    footer: document.querySelector('.bs-core__footer')?.textContent ?? null,
    oldDebug: /COMES WITH THIS CHOICE|^\+ /m.test(document.querySelector('.bs-controls')?.innerText ?? ''),
  };
};

const AUDIT = () => {
  const root = document.querySelector('.bs-root');
  const core = document.querySelector('.bs-core');
  const vw = document.documentElement.clientWidth;
  const lower = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const t = n.data.trim();
    if (!t || !/[a-z]/.test(t)) continue;
    const el = n.parentElement;
    if (!el || el.closest('input,textarea,script,style,.bs-usertext')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.textTransform === 'uppercase') continue;
    lower.push(t.slice(0, 60));
  }
  const off = [];
  if (core) core.querySelectorAll('*').forEach((el) => { const r = el.getBoundingClientRect(); if (r.width && (r.right > vw + 1 || r.left < -1)) off.push(String(el.className.baseVal ?? el.className).slice(0, 40)); });
  // icons, titles, page summaries and chevrons inside a row never overlap
  const collide = [];
  if (core) core.querySelectorAll('.bs-core__group summary').forEach((s) => {
    const parts = [...s.children].map((c) => c.getBoundingClientRect());
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      const a = parts[i], b = parts[j];
      if (a.width && b.width && a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) collide.push(s.querySelector('.bs-core__group-title').textContent);
    }
  });
  let minFont = 99;
  if (core) core.querySelectorAll('*').forEach((el) => { if ([...el.childNodes].some((c) => c.nodeType === 3 && c.data.trim())) minFont = Math.min(minFont, parseFloat(getComputedStyle(el).fontSize)); });
  const stage = document.querySelector('.bs-stage');
  const sr = stage?.getBoundingClientRect();
  const cr = core?.getBoundingClientRect();
  return {
    docOverflowX: document.documentElement.scrollWidth - vw, lowercase: lower, offscreen: off, collide, minFont,
    stage: sr ? { x: Math.round(sr.x), y: Math.round(sr.y + scrollY), w: Math.round(sr.width), h: Math.round(sr.height) } : null,
    panel: cr ? { x: Math.round(cr.x), y: Math.round(cr.y + scrollY), w: Math.round(cr.width), h: Math.round(cr.height) } : null,
    canvas: !!stage?.querySelector('canvas'),
  };
};

async function shot(p, W, file) {
  if (W >= 1100) {
    await p.evaluate(() => { const c = document.querySelector('.bs-controls'); const core = document.querySelector('.bs-core'); if (c && core) c.scrollTop = Math.max(0, core.offsetTop - 200); });
    await p.waitForTimeout(300);
    await p.screenshot({ path: file });
  } else {
    const top = await p.evaluate(() => { const s = document.querySelector('.bs-stage'); return s ? Math.max(0, s.getBoundingClientRect().y + scrollY - 8) : 0; });
    const full = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.screenshot({ path: file, fullPage: true, clip: { x: 0, y: top, width: W, height: full - top } });
  }
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: WIDTHS[0], height: HEIGHT[WIDTHS[0]] || 900 }, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const writes = [];
  p.on('request', (r) => { if (/\/api\//.test(r.url()) && r.method() !== 'GET') writes.push(r.method() + ' ' + r.url().replace(/^https?:\/\/[^/]+/, '')); });
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  const cont = async () => { await p.click('.bs-footer .bs-cta'); await p.waitForTimeout(900); };
  await p.goto('http://127.0.0.1:5182/bldr/studio/place');
  await p.waitForSelector('.bs-cards', { timeout: 90000 });
  await p.waitForTimeout(1200);
  await p.click(`.bs-card:has(.bs-card__label:text-is("${E.PLACE}"))`); await cont();
  await p.waitForTimeout(600);
  await p.click(`[role="radio"]:has-text("${E.FEEL}")`); await cont();
  await p.waitForSelector('.bs-modules', { timeout: 30000 });
  const toggle = async (m) => { await p.click(`button[aria-labelledby="bs-module-${m}"]`); await p.waitForTimeout(500); };
  const isOn = (m) => p.getAttribute(`button[aria-labelledby="bs-module-${m}"]`, 'aria-pressed').then((v) => v === 'true');
  // set exactly MODULES on
  for (const m of ['PAGES', 'BLOG', 'SHOP', 'MEMBER_AREA', 'BOOKING', 'PORTAL']) {
    const want = MODULES.includes(m);
    if ((await isOn(m)) !== want) await toggle(m);
    // a SIMPLE build may ask before adding an advanced module: keep it simple for this evidence
    if (await p.$('.bs-decision')) await p.click('.bs-decision .bs-btn--ghost');
  }
  await p.waitForLoadState('networkidle').catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2000);
  const report = { name: NAME, modules: MODULES, on: {}, widths: {}, errors };
  for (const m of ['PAGES', 'BLOG', 'SHOP', 'MEMBER_AREA', 'BOOKING', 'PORTAL']) report.on[m] = await isOn(m);
  const canvas = await p.evaluateHandle(() => document.querySelector('.bs-stage canvas'));
  for (const W of WIDTHS) {
    await p.setViewportSize({ width: W, height: HEIGHT[W] || 900 });
    await p.waitForTimeout(900);
    const r = { panel: await p.evaluate(PANEL), audit: await p.evaluate(AUDIT) };
    if (E.SHOTS) {
      await shot(p, W, path.join(OUT, `${NAME}-${W}-expanded.png`));
      const el = await p.$('.bs-core');
      await el.screenshot({ path: path.join(OUT, `${NAME}-${W}-panel.png`) });
      // a group opened in place: no writes, same canvas
      const before = writes.length;
      await p.click('.bs-core__group summary >> nth=0');
      if ((await p.$$('.bs-core__group')).length > 1) await p.click('.bs-core__group summary >> nth=1');
      await p.waitForTimeout(400);
      r.groupOpen = { panel: await p.evaluate(PANEL), audit: await p.evaluate(AUDIT), writes: writes.slice(before) };
      await (await p.$('.bs-core')).screenshot({ path: path.join(OUT, `${NAME}-${W}-group-open.png`) });
      if (W < 1100) await shot(p, W, path.join(OUT, `${NAME}-${W}-group-open-room.png`));
      await p.evaluate(() => document.querySelectorAll('.bs-core__group').forEach((g) => { g.open = false; }));
      // collapsed
      const before2 = writes.length;
      await p.click('.bs-core__head');
      await p.waitForTimeout(400);
      r.collapsed = { panel: await p.evaluate(PANEL), audit: await p.evaluate(AUDIT), writes: writes.slice(before2) };
      await shot(p, W, path.join(OUT, `${NAME}-${W}-collapsed.png`));
      await p.click('.bs-core__head');
      await p.waitForTimeout(400);
    }
    r.sameCanvas = await p.evaluate((c) => c === document.querySelector('.bs-stage canvas'), canvas);
    report.widths[W] = r;
  }
  if (E.TOGGLE) {
    // stale check: switch one module and read the panel again
    const m = E.TOGGLE;
    const before = await p.evaluate(PANEL);
    await toggle(m);
    if (await p.$('.bs-decision')) await p.click('.bs-decision .bs-btn--ghost');
    await p.waitForTimeout(600);
    const after = await p.evaluate(PANEL);
    await toggle(m);
    await p.waitForTimeout(600);
    const back = await p.evaluate(PANEL);
    report.toggle = { module: m, before: before.metrics, after: after.metrics, back: back.metrics, featuresAfter: after.features, groupsAfter: after.groups.map((g) => g.title) };
  }
  if (E.BLUEPRINT) {
    report.work = await p.evaluate(PANEL);
    await cont();
    const paceOk = await p.$('[role="radio"]:has-text("STANDARD")');
    if (paceOk) { await p.click('[role="radio"]:has-text("STANDARD")'); await p.waitForTimeout(500); await cont(); }
    await p.waitForSelector('.bs-tabs', { timeout: 60000 });
    await p.waitForTimeout(2000);
    await p.click('.bs-tab:has-text("PAGES")');
    await p.waitForTimeout(900);
    report.blueprint = await p.evaluate(() => ({
      stats: [...document.querySelectorAll('.bs-stats li')].map((li) => li.textContent.trim()),
      groups: [...document.querySelectorAll('.bs-pagegroup')].map((g) => ({ title: g.querySelector('.bs-pagegroup__title').textContent, pages: [...g.querySelectorAll('.bs-pageitem__name')].map((n) => n.textContent).join(', ') })),
    }));
    await p.click('.bs-tab:has-text("FEATURES")');
    await p.waitForTimeout(700);
    report.blueprintFeatures = await p.evaluate(() => document.querySelector('.bs-tabpanel').innerText.match(/\d+\s*\n?\s*FEATURES?/)?.[0] ?? null);
    await p.click('.bs-tab:has-text("PAGES")');
    await p.waitForTimeout(700);
    await shot(p, WIDTHS[WIDTHS.length - 1], path.join(OUT, `${NAME}-blueprint-pages.png`));
    // and back to WORK: the panel reads the same
    await p.goto('http://127.0.0.1:5182/bldr/studio/work');
    await p.waitForSelector('.bs-core', { timeout: 60000 });
    await p.waitForTimeout(1500);
    report.workAfterResume = await p.evaluate(PANEL);
  }
  fs.writeFileSync(path.join(OUT, `work-${NAME}.json`), JSON.stringify(report, null, 1));
  const s = Object.fromEntries(Object.entries(report.widths).map(([w, r]) => [w, { ovx: r.audit.docOverflowX, low: r.audit.lowercase.length, off: r.audit.offscreen.length, col: r.audit.collide.length, min: r.audit.minFont, same: r.sameCanvas, gw: r.groupOpen?.writes.length, cw: r.collapsed?.writes.length }]));
  console.log(NAME, JSON.stringify({ s, metrics: report.widths[WIDTHS[0]].panel.metrics, features: report.widths[WIDTHS[0]].panel.features, toggle: report.toggle, bp: report.blueprint?.stats, errors }));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
