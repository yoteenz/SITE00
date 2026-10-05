// P0.SITE00.PRODUCTION-WORKSPACE-GROK-HANDOFF-AUDIT-LITEPACK1 — runtime captures for surfaces whose visual
// authority is the live runtime (founder FINAL directives, no recovered image) and for the portrait-tablet
// preset (834×1194), which no founder board covers (T12 tablet boards are 4:3 landscape).
// usage: node capture-runtime.mjs <outDir> <port>
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const [OUT, PORT] = process.argv.slice(2);
const B = `http://127.0.0.1:${PORT}`;
mkdirSync(OUT, { recursive: true });
const PRESETS = { mobile: [393, 852], tablet: [834, 1194], desktop: [1440, 900] };
const X = '/production/ndxbook';

const PARENTS = [
  ['hub.root', '/production'],
  ['inbox.root', '/production/queue'],
  ...['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'].map((m) => [`design.${m}`, `${X}/design?mode=${m}`]),
  ['experience.root', `${X}/experience`],
  ['expression.floor', `${X}/expression`],
  ['library.root', '/production/libraries'],
  ['activity.root', '/production/activity'],
  ['expression.character-fabrication', `${X}/expression/character-fabrication`],
];

// [surface, path, preset, action] — action opens the in-route interaction surface before the capture.
const STATES = [
  ['activity.inspector', '/production/activity', 'mobile', { click: '[data-testid=activity-event] a, [data-testid=activity-event] button, [data-testid=activity-event]' }],
  ['activity.inspector', '/production/activity', 'tablet', { click: '[data-testid=activity-event] a, [data-testid=activity-event] button, [data-testid=activity-event]' }],
  ['activity.inspector', '/production/activity', 'desktop', { click: '[data-testid=activity-event] a, [data-testid=activity-event] button, [data-testid=activity-event]' }],
  ['inbox.inspector', '/production/queue?view=all', 'mobile', { click: '.pxa-body a[href*="sel="]' }],
  ['inbox.inspector', '/production/queue?view=all', 'desktop', { click: '.pxa-body a[href*="sel="]' }],
  ['inbox.children', '/production/queue?view=all', 'mobile', null],
  ['activity.root', '/production/activity', 'mobile', null],
  ['hub.root', '/production', 'mobile', null],
  ['hub.root', '/production', 'desktop', null],
  ['inbox.children', '/production/queue?view=all', 'tablet', null],
  ['inbox.children', '/production/queue?view=all', 'desktop', null],
  ['inbox.revision-sheet', '/production/queue?item=attn.cast', 'mobile', { click: '[data-testid=inbox-revise]', wait: '[data-testid=inbox-revision-sheet]' }],
  ['inbox.attachment-preview', '/production/queue?item=attn.cast', 'mobile', { click: '[data-testid=inbox-detail-attachments] button', wait: '[data-testid=inbox-attachment-preview]' }],
  ['inbox.filter-sheet', '/production/queue?view=all', 'mobile', { click: 'button[aria-label="Filter / sort"]', wait: '[data-testid=inbox-filter-sheet]' }],
  ['inbox.decision-detail', '/production/queue?item=attn.cast', 'mobile', null],
  ['inbox.decision-detail', '/production/queue?item=attn.cast', 'desktop', null],
  ['shell.menu-panel', '/production', 'mobile', { click: '[data-testid=production-menu-toggle], .ph-top__menu', wait: '[data-testid=production-menu]' }],
  ['shell.menu-panel', '/production', 'desktop', { click: '[data-testid=production-host-menu]', wait: '[data-testid=production-menu]' }],
];

const browser = await chromium.launch({ executablePath: process.env.SITE00_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const rows = [];
async function shoot(key, path, preset, action) {
  const [w, h] = PRESETS[preset];
  const m = preset === 'mobile';
  // Phones at 2× so the packed copies stay legible after downsampling; tablet / desktop at 1×.
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m, deviceScaleFactor: m ? 2 : 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  const row = { key, path, preset, w, h };
  try {
    await p.goto(B + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForFunction(() => (document.querySelector('.pxa-body, .cf-root, main')?.textContent?.trim().length ?? 0) > 40, null, { timeout: 25000 }).catch(() => {});
    await p.waitForTimeout(900);
    if (action) {
      const el = p.locator(action.click).filter({ visible: true }).first();
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await el.click({ timeout: 8000 });
      if (action.wait) await p.waitForSelector(action.wait, { timeout: 8000 });
      await p.waitForTimeout(700);
      row.url = p.url().replace(B, '');
    }
    row.metrics = await p.evaluate(() => ({
      docScroll: document.documentElement.scrollHeight - innerHeight,
      hOverflow: document.documentElement.scrollWidth - innerWidth,
      body: document.querySelector('.pxa-body')?.getBoundingClientRect().height ?? null,
    }));
    row.file = `${key}__${preset}.jpg`;
    await p.screenshot({ path: `${OUT}/${row.file}`, type: 'jpeg', quality: 82 });
  } catch (e) {
    row.error = String(e).slice(0, 240);
  }
  row.errs = errs;
  rows.push(row);
  await ctx.close();
}

for (const [key, path] of PARENTS) await shoot(key, path, 'tablet', null);
for (const [key, path, preset, action] of STATES) await shoot(key, path, preset, action);
await browser.close();
writeFileSync(`${OUT}/captures.json`, JSON.stringify(rows, null, 1));
const bad = rows.filter((r) => r.error || r.errs.length);
console.log(`captures ${rows.length} · failed ${bad.length}`);
for (const r of bad) console.log(' ', r.key, r.preset, r.error ?? '', r.errs.join(' | '));
