/**
 * SITE 00 Builder studio — scripted functional QA in a real browser (46 checks).
 * Run against a dev server started with VITE_SITE00_TEMPLATE_SYSTEM_V1=1 VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1.
 * Usage: BASE=http://127.0.0.1:5174 node scripts/site00/builder-studio-qa/functional.cjs
 */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const go = async (p) => { await page.goto(BASE + p, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.bs-root', { timeout: 60000 }); await page.waitForTimeout(500); };
  const room = () => page.locator('.bs-root').getAttribute('data-room');
  const draft = () => page.evaluate(() => JSON.parse(localStorage.getItem('site00.builderStudio.draft.v1') || 'null'));

  await go('/bldr/builder');
  await page.evaluate(() => localStorage.clear());
  await go('/bldr/builder/blueprint');
  check('locked deep link redirects to PLACE', (await room()) === 'place' && page.url().endsWith('/bldr/builder/place'), page.url());
  check('CONTINUE disabled before a choice', await page.getByRole('button', { name: /^CONTINUE/ }).isDisabled());
  await page.getByRole('button', { name: 'NEXT BUILD' }).click();
  check('stage arrow selects an option', (await page.getByRole('radio', { name: /SIMPLE/ }).getAttribute('aria-checked')) === 'true');
  await page.getByRole('button', { name: 'NEXT BUILD' }).click();
  check('stage arrow cycles to ADVANCED', (await page.getByRole('radio', { name: /ADVANCED/ }).getAttribute('aria-checked')) === 'true');
  await page.getByRole('radio', { name: /SIMPLE/ }).click();
  await page.waitForTimeout(400);
  check('PLACE choice persisted', (await draft())?.path === 'SIMPLE');
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--feel');
  await page.getByRole('radio', { name: /EDITORIAL/ }).click();
  await page.goBack();
  await page.waitForSelector('.bs-room--place');
  check('browser back returns to PLACE with choice kept', (await page.getByRole('radio', { name: /SIMPLE/ }).getAttribute('aria-checked')) === 'true');
  await page.goForward();
  await page.waitForSelector('.bs-room--feel');
  check('browser forward returns to FEEL with choice kept', (await page.getByRole('radio', { name: /EDITORIAL/ }).getAttribute('aria-checked')) === 'true');
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--work');

  // SIMPLE guard rail
  await page.getByRole('button', { name: 'SHOP' }).click();
  check('SIMPLE + SHOP asks before raising the level', await page.getByText('SHOP IS PART OF AN ADVANCED BUILD.').isVisible());
  await page.getByRole('button', { name: 'NOT NOW' }).click();
  check('NOT NOW leaves SHOP off', (await page.getByRole('button', { name: 'SHOP' }).getAttribute('aria-pressed')) === 'false');
  await page.getByRole('button', { name: 'BOOKING' }).click();
  check('BOOKING adds without a decision (any level)', (await page.getByRole('button', { name: 'BOOKING' }).getAttribute('aria-pressed')) === 'true');
  await page.getByRole('button', { name: 'SHOP' }).click();
  await page.getByRole('button', { name: /ADD IT/ }).click();
  await page.waitForTimeout(400);
  const d1 = await draft();
  check('ADD IT keeps SHOP and records the decision', d1.modules.includes('SHOP') && d1.acceptedLevelRaise === true, JSON.stringify(d1.modules));
  check('COMES WITH is visible, never silent', await page.getByText(/TAKE PAYMENT COMES WITH/).isVisible());
  await page.getByRole('button', { name: /CORE PAGES INCLUDED/ }).click();
  check('CORE PAGES expands to the real page list', await page.getByText(/^PAGES /).first().isVisible());
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--pace');
  check('STANDARD selected by default', (await page.getByRole('radio', { name: /STANDARD/ }).getAttribute('aria-checked')) === 'true');
  await page.getByRole('radio', { name: /FLEXIBLE/ }).click();
  await page.getByPlaceholder(/ADD A NOTE/).fill('We would like to launch in spring.');
  await page.waitForTimeout(1000);
  const d2 = await draft();
  check('PACE + notes persisted', d2.pace === 'FLEXIBLE' && d2.notes.includes('spring'), JSON.stringify({ pace: d2.pace, notes: d2.notes }));
  // reload restores
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--pace');
  check('reload restores the room and choices', (await page.getByRole('radio', { name: /FLEXIBLE/ }).getAttribute('aria-checked')) === 'true' && (await page.getByPlaceholder(/ADD A NOTE/).inputValue()).includes('spring'));
  // resume
  await go('/bldr/builder');
  check('root route resumes at the furthest room', (await room()) === 'pace', page.url());
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await page.waitForSelector('.bs-room--blueprint');
  await page.waitForTimeout(600);
  const inv1 = await page.locator('.bs-fact').nth(2).locator('.bs-figure').innerText();
  check('Blueprint shows estimator investment', /\$[\d,]+/.test(inv1), inv1);
  const win1 = await page.locator('.bs-fact').nth(1).locator('.bs-figure').innerText();
  check('Blueprint timeline is not a Digital Foundation timeline', !/BUSINESS DAYS/.test(win1) && /(WEEKS|MONTHS)/.test(win1), win1);
  check('BUILD TYPE reflects the derived level', (await page.locator('.bs-fact').first().locator('.bs-fact__value').innerText()) === 'ADVANCED');
  for (const tab of ['STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE', 'OVERVIEW']) {
    await page.getByRole('tab', { name: tab }).click();
    const text = (await page.locator('.bs-tabpanel').innerText()).trim();
    check(`tab ${tab} has content`, text.length > 40, String(text.length));
  }
  await page.getByRole('tab', { name: 'TIMELINE' }).click();
  check('TIMELINE echoes the client note', await page.getByText('We would like to launch in spring.').isVisible());
  await page.getByRole('tab', { name: 'STRUCTURE' }).click();
  await page.getByRole('radio', { name: /^PORTAL/ }).click();
  await page.getByRole('tab', { name: 'OVERVIEW' }).click();
  await page.waitForTimeout(400);
  const inv2 = await page.locator('.bs-fact').nth(2).locator('.bs-figure').innerText();
  check('changing structure recalculates the estimate', inv2 !== inv1, `${inv1} -> ${inv2}`);
  check('structure override persisted', (await draft()).structure === 'PORTAL');
  await page.getByRole('button', { name: /VISUAL DIRECTION/ }).click();
  await page.waitForSelector('.bs-room--feel');
  check('VISUAL DIRECTION card returns to FEEL', (await room()) === 'feel');
  await go('/bldr/builder/blueprint');
  await page.getByRole('button', { name: /FEATURES:/ }).click();
  check('FEATURES card opens the FEATURES tab', (await page.getByRole('tab', { name: 'FEATURES' }).getAttribute('aria-selected')) === 'true');
  await page.getByRole('tab', { name: 'OVERVIEW' }).click();
  await page.getByRole('button', { name: /EDIT SELECTIONS/ }).click();
  check('EDIT SELECTIONS opens the room menu', await page.getByRole('dialog', { name: 'BUILDER MENU' }).isVisible());
  await page.getByRole('dialog', { name: 'BUILDER MENU' }).getByRole('button', { name: /WORK/ }).click();
  await page.waitForSelector('.bs-room--work');
  check('menu navigates to a room', (await room()) === 'work');
  await go('/bldr/builder/blueprint');
  await page.getByRole('button', { name: 'SAVE FOR LATER' }).click();
  check('SAVE FOR LATER confirms', await page.getByText(/SAVED ON THIS DEVICE/).isVisible());
  const record = await page.evaluate(() => localStorage.getItem('site00.estimator.v1.builder-studio-blueprint'));
  check('SAVE FOR LATER stores an estimator record', !!record && JSON.parse(record).estimatorVersion);
  await page.getByRole('button', { name: 'TURN THE STRUCTURE IN 3D' }).click();
  check('3D inspect toggles', (await page.getByRole('button', { name: 'TURN THE STRUCTURE IN 3D' }).getAttribute('aria-pressed')) === 'true' && await page.getByText('DRAG TO TURN').isVisible());
  const box = await page.locator('.bs-object__canvas').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 }); await page.mouse.up();
  check('drag-to-turn raises no error', errors.length === 0, errors.join(' | '));

  // Submission: real call (no backend here) → honest error; mocked API → sent.
  await page.getByRole('button', { name: /CONFIRM & SUBMIT/ }).click();
  await page.getByRole('button', { name: 'SEND FOR REVIEW' }).click();
  check('invalid email is caught', await page.getByText(/ENTER A VALID EMAIL/).isVisible());
  await page.getByPlaceholder('YOU@YOURBUSINESS.COM').fill('client@example.com');
  await page.getByRole('button', { name: 'SEND FOR REVIEW' }).click();
  await page.waitForSelector('.bs-dialog__error, .bs-dialog__ref', { timeout: 30000 });
  const live = await page.locator('.bs-dialog').innerText();
  check('without a backend the sheet reports failure honestly', /STILL SAVED ON THIS DEVICE/.test(live) && !(await draft()).submission, live.slice(0, 160));
  await page.getByRole('button', { name: 'CLOSE' }).click();
  await page.evaluate(() => { localStorage.removeItem('site00-builder-studio-server-intake-id'); localStorage.removeItem('site00-builder-studio-guest-token'); });
  const calls = [];
  await page.route('**/api/site00/intakes**', async (route) => {
    const url = route.request().url(); const body = route.request().postDataJSON?.() ?? {};
    calls.push(url.split('action=')[1] + (body.draftPayload ? ':payload' : ''));
    const intake = { id: 'fake-intake-1234abcd', intakeType: 'BUILDER', status: url.includes('submit') ? 'SUBMITTED' : 'DRAFT', updatedAt: new Date().toISOString(), submittedAt: url.includes('submit') ? new Date().toISOString() : null };
    const json = url.includes('send-access') ? { intake, accessToken: 'tok', expiresAt: new Date().toISOString() } : { intake };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForSelector('.bs-room--blueprint');
  await page.getByRole('button', { name: /CONFIRM & SUBMIT/ }).click();
  await page.getByPlaceholder('YOU@YOURBUSINESS.COM').fill('client@example.com');
  await page.getByRole('button', { name: 'SEND FOR REVIEW' }).click();
  await page.waitForSelector('.bs-dialog__ref', { timeout: 30000 });
  check('mocked API: start → access → update → submit', calls.join(',') === 'start:payload,send-access,update:payload,submit', calls.join(','));
  await page.getByRole('button', { name: 'DONE' }).click();
  check('submitted state shown on the CTA', await page.getByRole('button', { name: 'SUBMITTED FOR REVIEW' }).isDisabled());
  await page.unroute('**/api/site00/intakes**');
  await page.getByRole('button', { name: 'OPEN BUILDER MENU' }).click();
  await page.getByRole('dialog', { name: 'BUILDER MENU' }).getByRole('button', { name: 'START OVER' }).click();
  await page.getByRole('dialog', { name: 'BUILDER MENU' }).getByRole('button', { name: 'START OVER' }).click();
  await page.waitForSelector('.bs-room--place');
  const stale = await page.evaluate(() => localStorage.getItem('site00-builder-studio-server-intake-id'));
  check('START OVER clears choices and the previous intake', stale === null && (await draft())?.path == null, String(stale));

  // WORLD restrictions
  await page.evaluate(() => localStorage.clear());
  await go('/bldr/builder/place');
  await page.getByRole('radio', { name: /WORLD/ }).click();
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.getByRole('radio', { name: /IMMERSIVE/ }).click();
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--work');
  await page.getByRole('button', { name: 'PAGES' }).click({ force: true });
  check('WORLD: PAGES cannot be enabled', (await page.getByRole('button', { name: 'PAGES' }).getAttribute('aria-pressed')) === 'false' && (await page.getByRole('button', { name: 'PAGES' }).getAttribute('aria-disabled')) === 'true');
  // Priority availability: a large scope where the estimator says priority helps
  // Inject before the app loads: the open page flushes its own draft on navigation (last writer wins).
  await page.addInitScript((json) => { if (!sessionStorage.getItem('bs-inject')) { localStorage.setItem('site00.builderStudio.draft.v1', json); sessionStorage.setItem('bs-inject', '1'); } }, JSON.stringify({ version: 1, path: 'ADVANCED', feel: 'ARCHITECTURAL_MINIMAL', modules: ['SHOP', 'MEMBER_AREA', 'PORTAL', 'BOOKING'], acceptedLevelRaise: false, structure: null, worldForm: null, pace: 'STANDARD', notes: '', furthestRoom: 'pace', updatedAt: null, savedAt: null, submission: null }));
  await go('/bldr/builder/pace');
  const exp = page.getByRole('radio', { name: /EXPEDITED/ });
  check('EXPEDITED offered when the estimator says it shortens the work', (await exp.getAttribute('aria-disabled')) === null);
  await exp.click();
  check('EXPEDITED selectable', (await exp.getAttribute('aria-checked')) === 'true');

  // accessibility: every button has a name
  const unnamed = await page.evaluate(() => [...document.querySelectorAll('.bs-root button')].filter((b) => !(b.getAttribute('aria-label') || b.getAttribute('aria-labelledby') || b.textContent.trim())).length);
  check('every control has an accessible name', unnamed === 0, String(unnamed));
  check('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();

  // reduced motion
  const rctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const rp = await rctx.newPage(); const rerr = []; rp.on('pageerror', (e) => rerr.push(e.message));
  await rp.goto(BASE + '/bldr/builder/place', { waitUntil: 'domcontentloaded' }); await rp.waitForSelector('.bs-root');
  await rp.getByRole('radio', { name: /CUSTOM/ }).click(); await rp.waitForTimeout(300);
  check('reduced motion: renders and responds without errors', rerr.length === 0 && (await rp.getByRole('radio', { name: /CUSTOM/ }).getAttribute('aria-checked')) === 'true', rerr.join('|'));
  await rctx.close();
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : '  — ' + r.detail}`);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  require('fs').writeFileSync(process.env.OUT || 'builder-studio-functional.json', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
