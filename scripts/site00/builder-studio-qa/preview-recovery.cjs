/**
 * SITE 00 Builder studio — recovery QA against a dev server configured like the founder tunnel's dev mode:
 *
 *   SITE00_INTAKES_USE_MEMORY=1 VITE_SITE00_TEMPLATE_SYSTEM_V1=1 VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1 \
 *     npx vite --port 5174 --host 127.0.0.1
 *   node scripts/site00/builder-studio-qa/preview-recovery.cjs <outDir>
 *
 * The browser talks to the dev server's own in-process /api/site00/intakes (the real handler on the intake
 * service's memory store), exactly as the tunnel does in dev mode. Nothing is forwarded or mocked, except the
 * two failure checks, which abort a request to prove the failure path. Supabase is NOT exercised.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const OUT = process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/recovery-preview-qa';
fs.mkdirSync(OUT, { recursive: true });
const VP = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 1 },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const results = [];
const check = (id, name, pass, detail = '') => {
  results.push({ id, name, result: pass ? 'PASS' : 'FAIL', detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
};

async function newPage(browser, vp, { reduced = true } = {}) {
  const ctx = await browser.newContext({ ...VP[vp], reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  const errors = [];
  const calls = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('request', (r) => r.url().includes('/api/site00/intakes') && calls.push(`${r.method()} ${new URL(r.url()).search}`));
  return { ctx, page, errors, calls };
}
const settle = (page, ms = 1500) => page.waitForTimeout(ms);
const sync = (page) => page.getAttribute('.bs-root', 'data-sync');
async function waitSync(page, list, timeout = 20000) {
  await page.waitForFunction((l) => l.includes(document.querySelector('.bs-root')?.getAttribute('data-sync')), list, { timeout });
}
async function shot(page, name, full = false) {
  if (!full) await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: 'jpeg', quality: 86, fullPage: full });
}
async function serverIntake(id) {
  const res = await fetch(`${BASE}/api/site00/intakes?action=get&intakeType=BUILDER&id=${encodeURIComponent(id)}`);
  return (await res.json()).intake;
}
const objectKey = (page) => page.getAttribute('.bs-object.bs-stage', 'data-object-key');
async function canvasHash(page) {
  const buf = await page.locator('.bs-stage canvas').screenshot();
  return require('crypto').createHash('sha1').update(buf).digest('hex');
}
/** Share of the stage canvas that is SITE 00 red: proves the object actually rendered (a blank canvas is 0). */
async function redShare(page) {
  const sharp = require('sharp');
  const buf = await page.locator('.bs-stage canvas').screenshot();
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let red = 0;
  for (let i = 0; i < data.length; i += info.channels) if (data[i] > 170 && data[i + 1] < 90 && data[i + 2] < 90) red += 1;
  return red / (info.width * info.height);
}
function expected(state) {
  const out = execFileSync('npx', ['tsx', path.join(__dirname, 'expected-estimate.ts'), JSON.stringify(state)], { encoding: 'utf8' });
  return JSON.parse(out);
}
const expand = (r) => r.replace(/\$(\d+)K/g, (_, n) => `$${(Number(n) * 1000).toLocaleString('en-US')}`).replace(/\s*–\s*/, ' – ');

(async () => {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const browser = await chromium.launch({ args, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });

  /* ── client A, mobile ── */
  const a = await newPage(browser, 'mobile');
  const p = a.page;
  await p.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.bs-root');
  await waitSync(p, ['saved']);
  await p.waitForURL(/\/bldr\/studio\/place$/, { timeout: 10000 }).catch(() => undefined);
  check('Q01', 'Flag on: /bldr/studio opens room 01 and SITE 00 confirms the started intake (SAVED)', p.url().endsWith('/bldr/studio/place') && (await sync(p)) === 'saved', p.url());
  const idA = await p.evaluate(() => localStorage.getItem('site00-bldr-spatial-server-intake-id'));

  const k0 = await objectKey(p);
  await p.getByRole('radio', { name: /SIMPLE/ }).click();
  await settle(p, 1800);
  const k1 = await objectKey(p);
  await p.getByRole('radio', { name: /WORLD/ }).click();
  await settle(p, 1200);
  const k2 = await objectKey(p);
  check('Q02', 'PLACE selection changes the Build Object (state-driven composition)', k0 !== k1 && k1 !== k2, `${k0} → ${k1} → ${k2}`);
  await p.getByRole('radio', { name: /SIMPLE/ }).click();
  await waitSync(p, ['saved']);
  await settle(p, 1500);
  await shot(p, 'mobile-01-place');
  await p.getByRole('button', { name: /^CONTINUE/ }).click();
  await p.waitForSelector('.bs-room--feel');
  await p.getByRole('radio', { name: /MODERN/ }).click();
  const kf1 = await objectKey(p);
  await p.getByRole('radio', { name: /IMMERSIVE/ }).click();
  const kf2 = await objectKey(p);
  await p.getByRole('radio', { name: /MODERN/ }).click();
  check('Q03', 'FEEL selection changes the material study', kf1 !== kf2, `${kf1} → ${kf2}`);
  await waitSync(p, ['saved']);
  await settle(p, 1500);
  await shot(p, 'mobile-02-feel');
  await p.getByRole('button', { name: /^CONTINUE/ }).click();
  await p.waitForSelector('.bs-room--work');
  const kw1 = await objectKey(p);
  await p.getByRole('button', { name: 'BOOKING' }).click();
  await settle(p, 600);
  const kw2 = await objectKey(p);
  const floors = await p.evaluate(() => document.querySelector('.bs-object.bs-stage')?.getAttribute('data-object-key'));
  check('Q04', 'WORK capability adds a floor to the structure', kw1 !== kw2 && /BOOKING/.test(floors || ''), `${kw1} → ${kw2}`);
  await waitSync(p, ['saved']);
  await settle(p, 1500);
  await shot(p, 'mobile-03-work');
  await p.getByRole('button', { name: /^CONTINUE/ }).click();
  await p.waitForSelector('.bs-room--pace');
  await p.getByRole('radio', { name: /STANDARD/ }).click();
  await waitSync(p, ['saved']);
  await settle(p, 1500);
  await shot(p, 'mobile-04-pace');

  // Back / forward navigation.
  await p.goBack();
  await p.waitForSelector('.bs-room--work');
  const back = p.url();
  await p.goForward();
  await p.waitForSelector('.bs-room--pace');
  check('Q05', 'Device back and forward move between rooms', back.endsWith('/work') && p.url().endsWith('/pace'), `${back} ↔ ${p.url()}`);

  await p.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await p.waitForSelector('.bs-room--blueprint');
  await waitSync(p, ['saved']);
  await settle(p, 2200);
  await shot(p, 'mobile-05-blueprint');

  // Estimate and timeline come from the canonical estimator for the server-held state.
  let rec = await serverIntake(idA);
  let st = rec.draftPayload.spatialStudio;
  let exp = expected(st);
  let figures = await p.locator('.bs-fact .bs-figure').allTextContents();
  check('Q06', 'Server draft holds the four rooms', st.placePath === 'SIMPLE' && st.feelVibe === 'MODERN' && st.workModules.join() === 'PAGES,BOOKING' && st.pace === 'STANDARD', JSON.stringify([st.placePath, st.feelVibe, st.workModules, st.pace]));
  check('Q07', 'Blueprint investment = canonical estimator', figures[1] === expand(exp.investment), `${figures[1]} vs ${exp.investment}`);
  check('Q08', 'Blueprint timeline = canonical estimator', figures[0] === exp.productionWindow.replace(/\s*–\s*/, ' – '), `${figures[0]} vs ${exp.productionWindow}`);

  // Edit selections from the Blueprint, then return: the Blueprint follows.
  await p.getByRole('button', { name: /EDIT SELECTIONS/ }).click();
  await p.getByRole('dialog', { name: 'BUILDER MENU' }).getByRole('button', { name: /03\s*WORK/ }).click();
  await p.waitForSelector('.bs-room--work');
  await p.getByRole('button', { name: 'BLOG' }).click();
  await waitSync(p, ['saved']);
  await p.goto(BASE + '/bldr/studio/blueprint', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.bs-room--blueprint');
  await waitSync(p, ['saved']);
  await settle(p, 1500);
  rec = await serverIntake(idA);
  st = rec.draftPayload.spatialStudio;
  exp = expected(st);
  figures = await p.locator('.bs-fact .bs-figure').allTextContents();
  check('Q09', 'EDIT SELECTIONS → change → Blueprint shows the re-estimated range', st.workModules.includes('BLOG') && figures[1] === expand(exp.investment), `${figures[1]} (${st.workModules.join('+')})`);

  // Drag to rotate (inspect mode) and fullscreen.
  const before = await canvasHash(p);
  await p.getByRole('button', { name: 'TURN THE STRUCTURE IN 3D' }).click();
  const box = await p.locator('.bs-stage canvas').boundingBox();
  await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await p.mouse.down();
  await p.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.45, { steps: 12 });
  await p.mouse.up();
  await settle(p, 800);
  const after = await canvasHash(p);
  const redAfterTurn = await redShare(p);
  check('Q10', 'Drag to rotate turns the live object (inspect mode) and it stays rendered', before !== after && redAfterTurn > 0.01, `red=${(redAfterTurn * 100).toFixed(1)}%`);
  await shot(p, 'mobile-05b-blueprint-rotated');
  await p.getByRole('button', { name: 'VIEW FULL SCREEN' }).click();
  await settle(p, 1200);
  const fs1 = await p.evaluate(() => Boolean(document.fullscreenElement) || Boolean(document.querySelector('.is-expanded')));
  const redFull = await redShare(p);
  check('Q11', 'Fullscreen inspection opens and the object is visible in it', fs1 && redFull > 0.01, `red=${(redFull * 100).toFixed(1)}%`);
  await p.screenshot({ path: path.join(OUT, 'mobile-05c-blueprint-fullscreen.jpg'), type: 'jpeg', quality: 86 });
  await p.evaluate(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    document.querySelectorAll('.is-expanded').forEach((el) => el.classList.remove('is-expanded'));
  });
  await settle(p, 600);

  // Save state: SAVE FOR LATER confirms with SITE 00.
  await p.getByRole('button', { name: 'SAVE FOR LATER' }).click();
  await p.waitForSelector('.bs-dialog__title:has-text("SAVED")', { timeout: 15000 });
  await shot(p, 'mobile-05d-blueprint-save-state');
  check('Q12', 'SAVE FOR LATER is confirmed by SITE 00 (no local-only claim)', (await p.locator('.bs-dialog__text').first().textContent()).includes('SAVED WITH SITE 00'));
  await p.getByRole('button', { name: 'DONE' }).click();

  // Resume on another device.
  const b = await newPage(browser, 'mobile');
  await b.page.goto(`${BASE}/bldr/studio?intakeId=${encodeURIComponent(idA)}`, { waitUntil: 'domcontentloaded' });
  await b.page.waitForSelector('.bs-root');
  await waitSync(b.page, ['saved']);
  await settle(b.page, 800);
  const resumed = await b.page.evaluate(() => document.querySelector('.bs-root')?.getAttribute('data-room'));
  check('Q13', 'Returning client restores the server-backed draft (?intakeId) without a new intake', resumed === 'blueprint' && !b.calls.some((c) => c.includes('action=start')), `room=${resumed}`);
  await b.ctx.close();

  // Cross-client isolation: a fresh client gets its own intake and none of A's choices.
  const c = await newPage(browser, 'mobile');
  await c.page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await c.page.waitForSelector('.bs-root');
  await waitSync(c.page, ['saved']);
  const idC = await c.page.evaluate(() => localStorage.getItem('site00-bldr-spatial-server-intake-id'));
  const cChecked = await c.page.locator('[role="radio"][aria-checked="true"]').count();
  check('Q14', 'A different client gets a separate intake and sees none of client A’s choices', idC && idC !== idA && cChecked === 0, `${idA} vs ${idC}`);
  await c.ctx.close();

  // Submission failure, then real submission, then duplicate protection.
  await p.getByRole('button', { name: /CONFIRM & SUBMIT/ }).click();
  await p.getByLabel('Email for secure intake access').fill('founder-preview-qa@example.com');
  await p.getByRole('button', { name: /SAVE MY ACCESS/ }).click();
  await p.waitForFunction(() => !document.querySelector('.bs-dialog .bs-cta')?.hasAttribute('disabled'), null, { timeout: 15000 });
  await a.ctx.route(/action=submit/, (route) => route.abort('connectionrefused'));
  await p.locator('.bs-dialog .bs-cta').click();
  await p.waitForSelector('.bs-dialog__error', { timeout: 15000 });
  rec = await serverIntake(idA);
  check('Q15', 'Submission failure is shown; the record stays unsubmitted (no fake success)', rec.status !== 'SUBMITTED' && (await p.locator('.bs-dialog__error').textContent()).includes('NOT SUBMITTED'), rec.status);
  await shot(p, 'mobile-05e-blueprint-submission-failed');
  await a.ctx.unroute(/action=submit/);
  await p.locator('.bs-dialog .bs-cta').click();
  await p.waitForSelector('text=SUBMISSION RECEIVED', { timeout: 20000 });
  await shot(p, 'mobile-05f-blueprint-submission-received');
  rec = await serverIntake(idA);
  check('Q16', 'Submission calls the real server API: SUBMITTED with versioned Blueprint v1 + estimate snapshot', rec.status === 'SUBMITTED' && rec.submittedPayload.current.version === 1 && Boolean(rec.submittedPayload.current.snapshot.estimate));
  await p.getByRole('button', { name: /VIEW MY BLUEPRINT/ }).click();
  await settle(p, 1800);
  await shot(p, 'mobile-05g-blueprint-submission-state');
  const okSubmits = a.calls.filter((x) => x.includes('action=submit')).length;
  const ctaDisabled = await p.locator('.bs-footer .bs-cta').first().isDisabled();
  check('Q17', 'Duplicate submission protection (CTA locked; one failed + one confirmed submit call only)', ctaDisabled && okSubmits === 2, `submit calls=${okSubmits}`);
  check('Q18', 'No console errors in the client flow', a.errors.filter((e) => !/ERR_TUNNEL_CONNECTION_FAILED|net::ERR_CONNECTION_REFUSED|Failed to load resource/.test(e)).length === 0, JSON.stringify(a.errors.slice(0, 3)));
  await a.ctx.close();

  /* ── reduced motion vs idle sway ── */
  for (const reduced of [false, true]) {
    const m = await newPage(browser, 'mobile', { reduced });
    await m.page.goto(BASE + '/bldr/studio/place', { waitUntil: 'domcontentloaded' });
    await m.page.waitForSelector('.bs-stage canvas');
    await waitSync(m.page, ['saved']);
    // Measure idle motion only once the stage has its final look (reflections applied).
    await m.page.waitForSelector('.bs-object__host[data-env]', { timeout: 30000 });
    await settle(m.page, 2500);
    const s1 = await m.page.locator('.bs-stage canvas').screenshot();
    await settle(m.page, 1200);
    const s2 = await m.page.locator('.bs-stage canvas').screenshot();
    // Pixel comparison with a tolerance: the stage is a transparent canvas composited over a CSS plate, and the
    // compositor can round a few channels by ±1 between passes. "Still" = nothing moves more than 2 levels;
    // "sways" = over a thousand channels move more than 8 levels.
    const sharp = require('sharp');
    const [r1, r2] = await Promise.all([sharp(s1).raw().toBuffer(), sharp(s2).raw().toBuffer()]);
    let maxDelta = 0;
    let moved = 0;
    for (let i = 0; i < Math.min(r1.length, r2.length); i += 1) {
      const d = Math.abs(r1[i] - r2[i]);
      if (d > maxDelta) maxDelta = d;
      if (d > 8) moved += 1;
    }
    if (maxDelta > 2) [s1, s2].forEach((buf, i) => fs.writeFileSync(path.join(OUT, `motion-${reduced ? 'reduced' : 'default'}-${i + 1}.png`), buf));
    if (reduced) check('Q20', 'Reduced motion: the object holds still (no idle sway)', maxDelta <= 2, `max channel delta ${maxDelta}`);
    else check('Q19', 'Default motion: the object sways gently when idle', moved > 1000, `${moved} channels moved > 8`);
    await m.ctx.close();
  }

  /* ── tablet + desktop: a room and the Blueprint ── */
  for (const vp of ['tablet', 'desktop']) {
    const t = await newPage(browser, vp);
    await t.page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
    await t.page.waitForSelector('.bs-root');
    await waitSync(t.page, ['saved']);
    await t.page.getByRole('radio', { name: /ADVANCED/ }).click();
    await t.page.getByRole('button', { name: /^CONTINUE/ }).click();
    await t.page.waitForSelector('.bs-room--feel');
    await t.page.getByRole('radio', { name: /EDITORIAL/ }).click();
    await t.page.getByRole('button', { name: /^CONTINUE/ }).click();
    await t.page.waitForSelector('.bs-room--work');
    await t.page.getByRole('button', { name: 'SHOP' }).click();
    await waitSync(t.page, ['saved']);
    await settle(t.page, 1800);
    await shot(t.page, `${vp}-03-work`);
    await t.page.getByRole('button', { name: /^CONTINUE/ }).click();
    await t.page.waitForSelector('.bs-room--pace');
    await t.page.getByRole('radio', { name: /STANDARD/ }).click();
    await t.page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
    await t.page.waitForSelector('.bs-room--blueprint');
    await waitSync(t.page, ['saved']);
    await settle(t.page, 2200);
    await shot(t.page, `${vp}-05-blueprint`);
    await t.ctx.close();
  }

  const pass = results.filter((r) => r.result === 'PASS').length;
  fs.writeFileSync(
    path.join(OUT, 'recovery-qa-results.json'),
    JSON.stringify({ base: BASE, mode: 'vite dev + SITE00_INTAKES_USE_MEMORY=1 (tunnel dev-mode equivalent)', supabase: 'NOT EXERCISED', ranAt: new Date().toISOString(), pass, fail: results.length - pass, results }, null, 2),
  );
  console.log(`\n${pass}/${results.length} PASS`);
  await browser.close();
  process.exit(pass === results.length ? 0 : 1);
})().catch((e) => {
  console.error('FAILED', e);
  process.exit(1);
});
