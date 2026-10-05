/**
 * Post-injection live capture + scroll/overflow detector.
 * BASE=http://127.0.0.1:5174 OUT=/opt/cursor/artifacts/site00-workspace-post-injection node /tmp/post-injection-capture.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5174';
const OUT = process.env.OUT ?? '/opt/cursor/artifacts/site00-workspace-post-injection';
const PHASE = process.env.PHASE ?? 'before';
const CHROME = process.env.CHROME ?? '/usr/local/bin/google-chrome';

const VIEWPORTS = [
  { id: 'm390', w: 390, h: 844, family: 'mobile' },
  { id: 'm393', w: 393, h: 852, family: 'mobile' },
  { id: 'm430', w: 430, h: 932, family: 'mobile' },
  { id: 'm390s', w: 390, h: 664, family: 'mobile' },
  { id: 'm360', w: 360, h: 640, family: 'mobile' },
  { id: 't768', w: 768, h: 1024, family: 'tablet' },
  { id: 't820', w: 820, h: 1180, family: 'tablet' },
  { id: 't1024p', w: 1024, h: 1366, family: 'tablet' },
  { id: 't1024l', w: 1024, h: 768, family: 'tablet' },
  { id: 'd1440', w: 1440, h: 900, family: 'desktop' },
  { id: 'd1680', w: 1680, h: 1050, family: 'desktop' },
  { id: 'd1920', w: 1920, h: 1080, family: 'desktop' },
  { id: 'd1440s', w: 1440, h: 810, family: 'desktop' },
  { id: 'd1280', w: 1280, h: 720, family: 'desktop' },
];

const ROOTS = [
  { tab: 'HUB', route: '/production' },
  { tab: 'INBOX', route: '/production/queue' },
  { tab: 'DESIGN', route: '/production/ndxbook/design' },
  { tab: 'EXPERIENCE', route: '/production/ndxbook/experience' },
  { tab: 'EXPRESSION', route: '/production/ndxbook/expression' },
  { tab: 'LIBRARY', route: '/production/libraries' },
  { tab: 'ACTIVITY', route: '/production/activity' },
];

const SHOTS = [
  { tab: 'HUB', level: 'root', route: '/production' },
  { tab: 'HUB', level: 'child', route: '/production/ndxbook' },
  { tab: 'INBOX', level: 'root', route: '/production/queue' },
  { tab: 'INBOX', level: 'child', route: '/production/queue?state=watching' },
  { tab: 'DESIGN', level: 'root', route: '/production/ndxbook/design' },
  { tab: 'DESIGN', level: 'child', route: '/production/ndxbook/design?mode=experience' },
  { tab: 'DESIGN', level: 'detail', route: '/production/ndxbook/design?mode=viewport' },
  { tab: 'EXPERIENCE', level: 'root', route: '/production/ndxbook/experience' },
  { tab: 'EXPERIENCE', level: 'child', route: '/production/ndxbook/experience/world/overview' },
  { tab: 'EXPERIENCE', level: 'detail', route: '/production/ndxbook/experience/zones/portals' },
  { tab: 'EXPRESSION', level: 'root', route: '/production/ndxbook/expression' },
  { tab: 'EXPRESSION', level: 'child', route: '/production/ndxbook/expression/casting' },
  { tab: 'EXPRESSION', level: 'detail', route: '/production/ndxbook/expression/character-fabrication?entry=002' },
  { tab: 'LIBRARY', level: 'root', route: '/production/libraries' },
  { tab: 'LIBRARY', level: 'child', route: '/production/libraries/authorities' },
  { tab: 'LIBRARY', level: 'detail', route: '/production/libraries/authorities/index' },
  { tab: 'ACTIVITY', level: 'root', route: '/production/activity' },
  { tab: 'ACTIVITY', level: 'child', route: '/production/activity?domain=production' },
];

const SHOT_VP = [
  { id: 'mobile', w: 390, h: 844 },
  { id: 'tablet', w: 768, h: 1024 },
  { id: 'desktop', w: 1440, h: 900 },
];

mkdirSync(`${OUT}/${PHASE}`, { recursive: true });

const measure = () => {
  const doc = document.documentElement;
  const scroll = document.querySelector('[data-testid="production-authority-scroll"]');
  const stages = [...document.querySelectorAll('.pxa-stage')].map((el) => {
    const b = el.getBoundingClientRect();
    return {
      id: el.getAttribute('data-stage'),
      w: Math.round(b.width),
      h: Math.round(b.height),
      nw: el.naturalWidth || 0,
      nh: el.naturalHeight || 0,
    };
  });
  const imgs = [...document.querySelectorAll('img')].map((el) => {
    const b = el.getBoundingClientRect();
    return {
      src: (el.currentSrc || el.src || '').replace(location.origin, '').slice(0, 180),
      w: Math.round(b.width),
      h: Math.round(b.height),
      nw: el.naturalWidth || 0,
      nh: el.naturalHeight || 0,
      alt: (el.getAttribute('alt') || '').slice(0, 40),
      test: el.getAttribute('data-testid'),
    };
  });
  const hero = document.querySelector('.hubx-hero, .xpf-hero, .exf-hero, .libx-hero, .amx-hero, .ibx-hero, .pxa-chamber');
  const hb = hero ? hero.getBoundingClientRect() : null;
  return {
    title: document.title,
    path: location.pathname + location.search,
    hasFrame: !!document.querySelector('[data-testid="production-authority-frame"]'),
    docClientH: doc.clientHeight,
    docScrollH: doc.scrollHeight,
    docClientW: doc.clientWidth,
    docScrollW: doc.scrollWidth,
    pageScrollY: doc.scrollHeight - doc.clientHeight,
    pageOverflowX: doc.scrollWidth - doc.clientWidth,
    pane: scroll
      ? { client: scroll.clientHeight, scroll: scroll.scrollHeight, overflowX: scroll.scrollWidth - scroll.clientWidth }
      : null,
    stages,
    hero: hb ? { w: Math.round(hb.width), h: Math.round(hb.height) } : null,
    imgs: imgs.filter((i) => i.w > 0 && i.h > 0).slice(0, 40),
    bodySnippet: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 180),
  };
};

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const rows = [];
const shots = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: vp.family === 'mobile' ? 2 : 1,
    isMobile: vp.family === 'mobile',
    hasTouch: vp.family === 'mobile',
  });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('site00-immersive-complete', '1'); } catch { /* ignore */ }
  });
  const page = await ctx.newPage();
  for (const root of ROOTS) {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
    let status = 0;
    try {
      const res = await page.goto(BASE + root.route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      status = res?.status() ?? 0;
      await page.waitForSelector('[data-testid="production-authority-frame"]', { timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(700);
    } catch (err) {
      errors.push(String(err).slice(0, 160));
    }
    const m = await page.evaluate(measure).catch((e) => ({ error: String(e).slice(0, 160) }));
    rows.push({ phase: PHASE, viewport: vp.id, w: vp.w, h: vp.h, family: vp.family, tab: root.tab, route: root.route, status, errors: errors.slice(0, 3), ...m });
    page.removeAllListeners('pageerror');
  }
  await ctx.close();
  process.stdout.write(`forensic ${vp.id}\n`);
}

for (const vp of SHOT_VP) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: vp.id === 'mobile' ? 2 : 1,
    isMobile: vp.id === 'mobile',
    hasTouch: vp.id === 'mobile',
  });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('site00-immersive-complete', '1'); } catch { /* ignore */ }
  });
  const page = await ctx.newPage();
  mkdirSync(`${OUT}/${PHASE}/${vp.id}`, { recursive: true });
  for (const shot of SHOTS) {
    try {
      await page.goto(BASE + shot.route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('[data-testid="production-authority-frame"]', { timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(900);
      if (shot.tab === 'ACTIVITY' && shot.level === 'child') {
        const link = page.locator('[data-testid="activity-event-open"]').first();
        if (await link.count()) {
          await link.click();
          await page.waitForTimeout(500);
        }
      }
      if (shot.tab === 'INBOX' && shot.level === 'child') {
        const link = page.locator('[data-testid="inbox-item"], [data-testid="queue-request"]').first();
        if (await link.count()) {
          await link.click();
          await page.waitForTimeout(600);
        }
      }
    } catch (err) {
      shots.push({ ...shot, vp: vp.id, error: String(err).slice(0, 160) });
      continue;
    }
    const file = `${shot.tab.toLowerCase()}-${shot.level}.png`;
    await page.screenshot({ path: `${OUT}/${PHASE}/${vp.id}/${file}` });
    const m = await page.evaluate(measure);
    shots.push({ phase: PHASE, ...shot, vp: vp.id, file: `${PHASE}/${vp.id}/${file}`, path: m.path, hasFrame: m.hasFrame, pageScrollY: m.pageScrollY, pageOverflowX: m.pageOverflowX, stages: m.stages, hero: m.hero, snippet: m.bodySnippet });
  }
  await ctx.close();
  process.stdout.write(`shots ${vp.id}\n`);
}

await browser.close();
writeFileSync(`${OUT}/${PHASE}-rows.json`, JSON.stringify({ phase: PHASE, rows, shots }, null, 2));
const vScroll = rows.filter((r) => (r.pageScrollY ?? 0) > 2);
const hOverflow = rows.filter((r) => (r.pageOverflowX ?? 0) > 2);
console.log(JSON.stringify({ phase: PHASE, rows: rows.length, shots: shots.length, pageScrollViolations: vScroll.length, horizontalOverflow: hOverflow.length }, null, 2));
