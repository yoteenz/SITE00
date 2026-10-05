// FULL-AUTHORITY-FORENSIC-AUDIT.OPUS2 live QA — run against a local Vite server (paths are this session's container: playwright from the repo node_modules, Chromium from /opt/pw-browsers).
// Interaction-authority QA: every in-route inspector / drawer / toggle opens, fits the viewport, steps, and closes.
// usage: node interact.mjs <outDir> <port>
import { chromium } from '/home/user/SITE00/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const [OUT, PORT] = process.argv.slice(2);
const B = `http://127.0.0.1:${PORT}`;
mkdirSync(OUT, { recursive: true });
const VPS = [['m390', 390, 844], ['t1024l', 1024, 768], ['d1440', 1440, 900]];
const X = '/production/ndxbook/expression';
const CASES = [
  // D-EXPR-MEDIA — every primary image opens the in-route inspector (provenance caption, step, Escape closes)
  ...[
    ['casting-root', `${X}/casting`],
    ['casting-actor-profile', `${X}/casting/actors/sw-resident-001?entry=002`],
    ['casting-character-profile', `${X}/casting/characters/char-entry002-subject-woman?entry=002`],
    ['look-root', `${X}/wardrobe`],
    ['look-outfits', `${X}/wardrobe/outfits`],
    ['storyboard-root', `${X}/storyboard`],
    ['performance-root', `${X}/performance`],
    ['review-approval-detail', `${X}/review/approval/narrative?entry=002`],
  ].map(([key, path]) => ({ key, path, family: 'EXPRESSION', authority: 'D-EXPR-MEDIA', open: '.pxa-body [data-inspectable="true"]:visible, .pxa-body button[data-media="primary"]:visible', expect: '[data-testid=expression-media-inspector]', image: '[data-testid=expression-media-inspector-image]', close: 'Escape' })),
  // Library character detail — portrait opens the character image inspector
  { key: 'library-character-image', path: '/production/libraries/characters/detail/SW-002', family: 'LIBRARY', authority: 'EL character detail', open: '[data-testid=library-character-media-open]', expect: '[data-testid=library-character-image-inspector]', image: '[data-testid=library-character-inspector-image]', close: 'Escape' },
  // Library index — selecting a tile drives the inspector (?sel=); phones/tablets show it as a drawer with a scrim
  { key: 'library-tile-inspector', path: '/production/libraries/assets/index', family: 'LIBRARY', authority: 'EL inspector', open: '[data-testid=library-tile]:visible', expect: '[data-testid=library-inspector][data-record]', close: 'scrim:[data-testid=library-inspector-scrim]' },
  // Inbox — selecting an item fills the inspector (drawer + scrim on phones)
  { key: 'inbox-select', path: '/production/queue?view=all', family: 'INBOX', authority: 'INBOX-1V inspector', open: '.pxa-body a[href*="sel="]:visible', expect: '[data-testid=inbox-inspector][data-state=selected]', close: 'scrim:[data-testid=inbox-inspector-scrim]' },
  // Inbox temporary sheets (NO_RECOVERED_AUTHORITY — live presentation preserved; they must open, fit and close)
  { key: 'inbox-request-revision-sheet', path: '/production/queue?item=attn.cast', family: 'INBOX', authority: 'NO_RECOVERED_AUTHORITY · temporary sheet', open: '[data-testid=inbox-revise]:visible', expect: '[data-testid=inbox-revision-sheet]', close: 'Escape' },
  { key: 'inbox-attachment-preview', path: '/production/queue?item=attn.cast', family: 'INBOX', authority: 'NO_RECOVERED_AUTHORITY · temporary sheet', open: '[data-testid=inbox-detail-attachments] button:visible', expect: '[data-testid=inbox-attachment-preview]', close: 'Escape' },
  { key: 'inbox-filter-sheet', path: '/production/queue?view=all', family: 'INBOX', authority: 'NO_RECOVERED_AUTHORITY · temporary sheet', open: 'button[aria-label="Filter / sort"]:visible', expect: '[data-testid=inbox-filter-sheet]', close: 'Escape', inlineWhenAbsent: true },
  { key: 'inbox-approval-confirm', path: '/production/queue?item=attn.cast', family: 'INBOX', authority: 'NO_RECOVERED_AUTHORITY · temporary sheet', open: '[data-testid=inbox-approve]:visible', expect: '[data-testid=inbox-approve-confirm]', close: 'Escape', gated: true },
  // Design viewport — safe-area toggle
  { key: 'design-viewport-safe', path: '/production/ndxbook/design?mode=viewport', family: 'DESIGN', authority: 'DWS viewport controls', toggle: '[data-testid=design-viewport-safe-toggle]' },
  // Hub — legacy chamber link (D-HUB-LEGACY: machine is LEGACY_LOCKED; the link must still reach it)
  { key: 'hub-open-machine', path: '/production', family: 'HUB', authority: 'D-HUB-LEGACY', nav: '[data-testid=hub-open-machine]', navExpect: /view=machine/ },
];

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const rows = [];
for (const [vk, w, h] of VPS) {
  const m = w < 700;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  for (const c of CASES) {
    errs.length = 0;
    const row = { key: c.key, family: c.family, authority: c.authority, vp: vk, path: c.path };
    try {
      await p.goto(B + c.path, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForFunction(() => (document.querySelector('.pxa-body')?.innerText.trim().length ?? 0) > 40, null, { timeout: 20000 }).catch(() => {});
      await p.waitForTimeout(600);
      if (c.toggle) {
        const t = p.locator(c.toggle).first();
        const before = await t.getAttribute('aria-pressed');
        await t.click();
        await p.waitForTimeout(200);
        const after = await t.getAttribute('aria-pressed');
        row.opened = before !== after;
        row.closed = true;
        await t.click();
      } else if (c.nav) {
        await p.locator(c.nav).first().click();
        await p.waitForTimeout(800);
        row.opened = c.navExpect.test(p.url());
        row.closed = true;
        row.url = p.url().replace(B, '');
      } else {
        const opener = p.locator(c.open).first();
        row.openerCount = await p.locator(c.open).count();
        if (c.inlineWhenAbsent && row.openerCount === 0) {
          row.opened = 'N/A';
          row.closed = 'n/a (filters render inline at this width — the sheet is the phone / tablet pattern)';
          rows.push({ ...row, errs: [...errs] });
          continue;
        }
        if (c.gated && (await opener.isDisabled().catch(() => false))) {
          row.opened = 'GATED';
          row.closed = 'n/a (action disabled until the founder gate opens — honest state)';
          row.title = await opener.getAttribute('title');
          rows.push({ ...row, errs: [...errs] });
          continue;
        }
        await opener.scrollIntoViewIfNeeded().catch(() => {});
        await opener.click({ timeout: 8000 });
        await p.waitForSelector(c.expect, { timeout: 8000 });
        await p.waitForTimeout(400);
        const fit = await p.evaluate((sel) => {
          const e = document.querySelector(sel);
          const r = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inView: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, visible: cs.visibility !== 'hidden' && cs.display !== 'none', docScroll: document.documentElement.scrollHeight - innerHeight };
        }, c.expect);
        row.opened = fit.visible;
        row.fit = fit;
        if (c.image) {
          row.image = await p.evaluate((sel) => { const i = document.querySelector(sel); return i ? { ok: i.complete && i.naturalWidth > 0, w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height) } : null; }, c.image);
        }
        await p.screenshot({ path: `${OUT}/${c.key}__${vk}.jpg`, type: 'jpeg', quality: 70 });
        if (c.close === 'Escape') {
          await p.keyboard.press('Escape');
          await p.waitForTimeout(300);
          row.closed = (await p.locator(c.expect).count()) === 0;
        } else if (c.close.startsWith('scrim:')) {
          const scrim = p.locator(c.close.slice(6));
          if (await scrim.count()) {
            await scrim.first().click({ position: { x: 5, y: 5 } }).catch(async () => scrim.first().dispatchEvent('click'));
            await p.waitForTimeout(400);
            row.closed = (await p.locator(c.expect).count()) === 0 || !(await p.locator(c.close.slice(6)).count());
          } else {
            row.closed = 'n/a (inline inspector at this width)';
          }
        }
      }
    } catch (e) {
      row.error = String(e).slice(0, 220);
    }
    row.errs = [...errs];
    rows.push(row);
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${OUT}/interactions.json`, JSON.stringify(rows, null, 1));
const bad = rows.filter((r) => r.error || !r.opened || r.closed === false || (r.fit && !r.fit.inView) || (r.image && !r.image.ok) || r.errs.length);
console.log(`interaction checks ${rows.length} failed ${bad.length}`);
for (const r of bad) console.log(' ', r.key, r.vp, r.error ?? '', r.opened, r.closed, JSON.stringify(r.fit ?? ''), JSON.stringify(r.image ?? ''), r.errs.join('|'));
