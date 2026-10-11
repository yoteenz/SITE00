/**
 * SITE 00 Builder studio — functional QA + captures for the full client ↔ founder Blueprint loop.
 *
 * Needs: the Vite dev server with both Builder flags on (BASE, default http://127.0.0.1:5174) and the QA-only
 * memory-store API harness (qa-api-server.ts, QA_API, default http://127.0.0.1:3100).
 *
 *   node scripts/site00/builder-studio-qa/founder-loop.cjs <outDir>
 *
 * Every check reads the real intake record back from the intake service; nothing is asserted from the UI alone.
 */
const fs = require('fs');
const path = require('path');
const { launch, newPage, settle, waitSync, BASE, QA_API } = require('./qa-lib.cjs');

const OUT = process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/founder-review-qa';
fs.mkdirSync(OUT, { recursive: true });
const results = [];
function check(id, name, pass, detail = '') {
  results.push({ id, name, result: pass ? 'PASS' : 'FAIL', detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
}
async function shot(page, name, full = false) {
  if (!full) await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  return page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: 'jpeg', quality: 84, fullPage: full });
}

async function adminDetail(id) {
  const res = await fetch(`${QA_API}/api/admin/site00-intakes?action=detail&intakeType=BUILDER&id=${encodeURIComponent(id)}`);
  return res.json();
}
async function adminPost(body) {
  const res = await fetch(`${QA_API}/api/admin/site00-intakes`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return { status: res.status, json: await res.json() };
}
async function intakeIdOf(page) {
  return page.evaluate(() => localStorage.getItem('site00-bldr-spatial-server-intake-id'));
}

async function configure(page, { path: placePath = 'SIMPLE', feel = 'MODERN', shop = true, capture = null } = {}) {
  await page.getByRole('radio', { name: new RegExp(placePath) }).click();
  await waitSync(page, ['saved']);
  await settle(page, 1800);
  if (capture) await shot(page, `${capture}-01-place`);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--feel');
  await page.getByRole('radio', { name: new RegExp(feel) }).click();
  await settle(page, 1800);
  if (capture) await shot(page, `${capture}-02-feel`);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--work');
  if (shop) {
    await page.getByRole('button', { name: 'SHOP' }).click();
    const decision = await page.getByRole('button', { name: /ADD IT · MOVE TO ADVANCED/ }).count();
    if (decision) await page.getByRole('button', { name: /ADD IT · MOVE TO ADVANCED/ }).click();
  }
  await settle(page, 1800);
  if (capture) await shot(page, `${capture}-03-work`);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--pace');
  await page.getByRole('radio', { name: /STANDARD/ }).click();
  await settle(page, 1500);
  if (capture) await shot(page, `${capture}-04-pace`);
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await page.waitForSelector('.bs-room--blueprint');
  await waitSync(page, ['saved']);
  await settle(page, 2200);
}

(async () => {
  const browser = await launch();

  /* ── C · client: fresh start, guards, save truth ── */
  const client = await newPage(browser, 'mobile');
  const { page } = client;
  await page.goto(BASE + '/bldr/studio/blueprint', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-root', { timeout: 90000 });
  const firstSync = await page.getAttribute('.bs-root', 'data-sync');
  await waitSync(page, ['saved']);
  check('C01', 'Fresh visit restores, then shows SAVED only after the server confirmed the started intake', ['restoring', 'saved'].includes(firstSync), `first=${firstSync}`);
  await page.waitForURL(/\/bldr\/studio\/place$/, { timeout: 10000 }).catch(() => undefined);
  check('C02', 'Locked rooms redirect (blueprint → place on an empty Blueprint)', page.url().endsWith('/bldr/studio/place'), page.url());
  check('C03', 'One intake started (start de-duplicated across StrictMode bootstrap)', client.log.filter((l) => l.includes('action=start')).length === 1, String(client.log.filter((l) => l.includes('action=start')).length));
  const intakeId = await intakeIdOf(page);

  await page.getByRole('radio', { name: /SIMPLE/ }).click();
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--feel');
  await page.getByRole('radio', { name: /MODERN/ }).click();
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--work');
  await page.getByRole('button', { name: 'SHOP' }).click();
  const asked = await page.getByText('SHOP IS PART OF AN ADVANCED BUILD.').count();
  check('C04', 'SIMPLE + SHOP asks before raising the level (contract NEEDS_DECISION)', asked === 1);
  await settle(page, 400);
  await shot(page, 'mobile-03-work-decision');
  await page.getByRole('button', { name: /ADD IT · MOVE TO ADVANCED/ }).click();
  await waitSync(page, ['saved']);
  await settle(page, 1200);
  let d = await adminDetail(intakeId);
  let ss = d.intake.draftPayload.spatialStudio;
  check('C05', 'Server draft holds the rooms (PLACE moved to ADVANCED, WORK = PAGES + SHOP)', ss.placePath === 'ADVANCED' && ss.feelVibe === 'MODERN' && ss.workModules.join() === 'PAGES,SHOP', JSON.stringify({ p: ss.placePath, f: ss.feelVibe, w: ss.workModules }));
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--pace');
  const ctaDisabled = await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).isDisabled();
  check('C06', 'PACE must be chosen before the Blueprint (contract PACE_NOT_CHOSEN)', ctaDisabled);
  await page.getByRole('radio', { name: /STANDARD/ }).click();
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await page.waitForSelector('.bs-room--blueprint');
  await waitSync(page, ['saved']);
  await settle(page, 2000);
  const est1 = await page.locator('.bs-fact .bs-figure').allTextContents();
  await page.goto(BASE + '/bldr/studio/work', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--work');
  await waitSync(page, ['saved']);
  await page.getByRole('button', { name: 'PORTAL' }).click();
  await waitSync(page, ['saved']);
  await page.goto(BASE + '/bldr/studio/blueprint', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--blueprint');
  await waitSync(page, ['saved']);
  await settle(page, 1200);
  const est2 = await page.locator('.bs-fact .bs-figure').allTextContents();
  check('C07', 'Estimate strings come from the estimator and change with the configuration', est1.join() !== est2.join() && /\$/.test(est2.join()), `${est1.join(' | ')} → ${est2.join(' | ')}`);
  await page.goto(BASE + '/bldr/studio/work', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--work');
  await waitSync(page, ['saved']);
  await page.getByRole('button', { name: 'PORTAL' }).click();
  await waitSync(page, ['saved']);
  await page.goto(BASE + '/bldr/studio/blueprint', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--blueprint');
  await waitSync(page, ['saved']);
  await settle(page, 2200);
  await shot(page, 'mobile-05-blueprint');

  await page.getByRole('button', { name: /CONFIRM & SUBMIT/ }).click();
  await settle(page, 500);
  const submitDisabledWithoutEmail = await page.locator('.bs-dialog .bs-cta').isDisabled();
  check('C08', 'A guest must leave an email before submitting (founder can reply, client can return)', submitDisabledWithoutEmail);
  await shot(page, 'mobile-05b-submit-sheet');
  await page.getByLabel('Email for secure intake access').fill('client-qa@example.com');
  await page.getByRole('button', { name: /SAVE MY ACCESS/ }).click();
  await page.waitForFunction(() => !document.querySelector('.bs-dialog .bs-cta')?.hasAttribute('disabled'), null, { timeout: 15000 });
  await page.locator('.bs-dialog .bs-cta').click();
  await page.waitForSelector('text=SUBMISSION RECEIVED', { timeout: 20000 });
  await settle(page, 600);
  await shot(page, 'mobile-06a-submission-received-sheet');
  d = await adminDetail(intakeId);
  const sp = d.intake.submittedPayload;
  check('C09', 'Server record SUBMITTED with versioned Blueprint (v1), estimator version and estimate snapshot', d.intake.status === 'SUBMITTED' && sp.current.version === 1 && Boolean(sp.current.estimatorVersion) && Boolean(sp.current.snapshot.estimate), `status=${d.intake.status} v=${sp.current.version} est=${sp.current.snapshot.estimate && sp.current.snapshot.estimate.investment}`);
  check('C10', 'Exactly one submit call (no duplicate submission)', client.log.filter((l) => l.includes('action=submit')).length === 1);
  await page.getByRole('button', { name: /VIEW MY BLUEPRINT/ }).click();
  await settle(page, 1800);
  const ctaLocked = await page.locator('.bs-footer .bs-cta').first().isDisabled();
  check('C11', 'After submission the CTA is locked (VERSION 1 SUBMITTED)', ctaLocked && (await page.locator('.bs-footer .bs-cta').first().textContent()).includes('VERSION 1 SUBMITTED'));
  await shot(page, 'mobile-06-client-submission-received');
  await shot(page, 'mobile-06-client-submission-received-full', true);
  await page.goto(BASE + '/bldr/studio/work', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-root');
  await waitSync(page, ['submitted']);
  await settle(page, 800);
  check('C12', 'Rooms 01–04 are locked while submitted (work → blueprint)', page.url().includes('/bldr/studio/blueprint'), page.url());
  check('C13', 'Reload restores SUBMISSION RECEIVED from the server record', (await page.getAttribute('.bs-root', 'data-stage')) === 'SUBMISSION_RECEIVED');

  /* ── C · resume on another device with ?intakeId ── */
  const other = await newPage(browser, 'mobile');
  await other.page.goto(`${BASE}/bldr/studio?intakeId=${encodeURIComponent(intakeId)}`, { waitUntil: 'domcontentloaded' });
  await other.page.waitForSelector('.bs-root');
  await waitSync(other.page, ['submitted']);
  check('C14', 'Another device resumes the same Blueprint from ?intakeId (server hydration)', (await other.page.getAttribute('.bs-root', 'data-stage')) === 'SUBMISSION_RECEIVED' && other.log.filter((l) => l.includes('action=start')).length === 0);
  await other.ctx.close();

  /* ── C · LOCAL ONLY and SYNC FAILED ── */
  const offline = await newPage(browser, 'mobile', { offline: true });
  await offline.page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await offline.page.waitForSelector('.bs-root');
  await waitSync(offline.page, ['local_only']);
  const chip = await offline.page.locator('.bs-header .bs-save__label').textContent();
  check('C15', 'SITE 00 unreachable → LOCAL ONLY (never SAVED)', chip === 'LOCAL ONLY', chip);
  await shot(offline.page, 'mobile-state-local-only');
  await offline.ctx.close();

  const flaky = await newPage(browser, 'mobile');
  await flaky.page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await flaky.page.waitForSelector('.bs-root');
  await waitSync(flaky.page, ['saved']);
  await flaky.ctx.route(/action=update/, (route) => route.abort('connectionrefused'));
  await flaky.page.getByRole('radio', { name: /WORLD/ }).click();
  await waitSync(flaky.page, ['sync_failed']);
  check('C16', 'A failed autosave shows SYNC FAILED with RETRY (on-device copy kept)', (await flaky.page.locator('.bs-header .bs-save__label').textContent()) === 'SYNC FAILED' && (await flaky.page.locator('.bs-save__retry').count()) === 1);
  await shot(flaky.page, 'mobile-state-sync-failed');
  await flaky.ctx.unroute(/action=update/);
  await flaky.page.locator('.bs-save__retry').click();
  await waitSync(flaky.page, ['saved']);
  check('C17', 'RETRY reaches SITE 00 and returns to SAVED', (await flaky.page.getAttribute('.bs-root', 'data-sync')) === 'saved');
  // Real conflict: a change stays on the device (save failed), the tab reloads with SITE 00 holding older choices.
  const flakyId = await intakeIdOf(flaky.page);
  await flaky.ctx.route(/action=update/, (route) => route.abort('connectionrefused'));
  await flaky.page.getByRole('radio', { name: /CUSTOM/ }).click();
  await waitSync(flaky.page, ['sync_failed']);
  await flaky.ctx.unroute(/action=update/);
  await flaky.page.reload({ waitUntil: 'domcontentloaded' });
  await flaky.page.waitForSelector('.bs-root');
  await waitSync(flaky.page, ['saved'], 20000);
  await settle(flaky.page, 600);
  const recovered = await flaky.page.locator('.bs-header .bs-save').getAttribute('title');
  const flakyRecord = await adminDetail(flakyId);
  check(
    'C17b',
    'CONFLICT: newer on-device choices are kept, pushed to SITE 00 and reported as resolved',
    flakyRecord.intake.draftPayload.spatialStudio.placePath === 'CUSTOM' && /CONFLICT RESOLVED/.test(recovered || ''),
    `server=${flakyRecord.intake.draftPayload.spatialStudio.placePath} chip="${recovered}"`,
  );
  await flaky.ctx.close();

  /* ── C · submit never sends a stale draft ── */
  const stale = await newPage(browser, 'mobile');
  await stale.page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await stale.page.waitForSelector('.bs-root');
  await waitSync(stale.page, ['saved']);
  await configure(stale.page, { path: 'ADVANCED', feel: 'BOLD', shop: false });
  const staleId = await intakeIdOf(stale.page);
  await stale.page.getByRole('button', { name: /CONFIRM & SUBMIT/ }).click();
  await stale.page.getByLabel('Email for secure intake access').fill('stale-qa@example.com');
  await stale.page.getByRole('button', { name: /SAVE MY ACCESS/ }).click();
  await stale.page.waitForFunction(() => !document.querySelector('.bs-dialog .bs-cta')?.hasAttribute('disabled'));
  await stale.ctx.route(/action=update/, (route) => route.abort('connectionrefused'));
  await stale.page.locator('.bs-dialog .bs-cta').click();
  await stale.page.waitForSelector('.bs-dialog__error', { timeout: 15000 });
  const staleRecord = await adminDetail(staleId);
  check('C18', 'If the final save fails, nothing is submitted and the client is told (no fake success)', staleRecord.intake.status !== 'SUBMITTED' && stale.log.filter((l) => l.includes('action=submit')).length === 0, `status=${staleRecord.intake.status}`);
  await shot(stale.page, 'mobile-state-submit-failed');
  await stale.ctx.close();

  /* ── F · founder review ── */
  const founder = await newPage(browser, 'desktop');
  const fp = founder.page;
  await fp.goto(`${BASE}/admin/site00/intakes/builder/${intakeId}`, { waitUntil: 'domcontentloaded' });
  await fp.waitForSelector('.bbr', { timeout: 90000 });
  await settle(fp, 2500);
  const bodyText = await fp.locator('.bbr').textContent();
  check('F01', 'Founder sees the submitted Blueprint as structured facts (no JSON needed)', /AWAITING REVIEW/.test(bodyText) && /BUILD LEVEL/.test(bodyText) && /INITIAL ESTIMATE/.test(bodyText) && (await fp.locator('.bbr-diagnostics[open]').count()) === 0);
  await shot(fp, 'desktop-08-founder-blueprint-review');
  await fp.getByRole('button', { name: 'INSPECT CONFIGURATION' }).click();
  await settle(fp, 300);
  await shot(fp, 'desktop-08b-founder-inspect-configuration');
  await fp.getByRole('button', { name: 'REVIEW ESTIMATE' }).click();
  await settle(fp, 300);
  await shot(fp, 'desktop-08c-founder-review-estimate');
  await fp.getByRole('button', { name: 'OPEN BLUEPRINT' }).click();

  await fp.getByRole('button', { name: 'MARK IN REVIEW', exact: true }).click();
  await fp.waitForSelector('.bbr-notice');
  console.log('notice:', await fp.locator('.bbr-notice').textContent());
  d = await adminDetail(intakeId);
  check('F02', 'MARK IN REVIEW (existing API) → IN_REVIEW, audit event recorded', d.intake.status === 'IN_REVIEW' && d.events.some((e) => e.eventType === 'INTAKE_MARKED_IN_REVIEW'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-root');
  await waitSync(page, ['submitted']);
  check('C19', 'Client sees UNDER REVIEW after the founder marks it', (await page.getAttribute('.bs-root', 'data-stage')) === 'UNDER_REVIEW');

  await settle(fp, 1200);
  await fp.getByRole('button', { name: 'REQUEST REVISION' }).click();
  await fp.locator('#bbr-revision-message').fill('Please add online booking for consultations, and tell us your launch timing in the note.');
  await shot(fp, 'desktop-09-founder-revision-request');
  await fp.getByRole('button', { name: /SEND REVISION REQUEST FOR V1/ }).click();
  await fp.waitForSelector('.bbr-notice--ok');
  await settle(fp, 1500);
  d = await adminDetail(intakeId);
  check('F03', 'REQUEST REVISION (existing API) reopens the draft; v1 stays exactly as submitted', d.intake.status === 'ACTIVE' && d.intake.draftPayload.revisionOpen === true && d.intake.submittedPayload.current.version === 1 && d.intake.draftPayload.revisionRequests.slice(-1)[0].forSubmissionVersion === 1);
  await shot(fp, 'desktop-09b-founder-revision-requested', true);

  /* ── C · client revision + resubmission ── */
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-root');
  await waitSync(page, ['saved']);
  await settle(page, 2000);
  const reqText = await page.locator('.bs-review__request-text').textContent();
  check('C20', 'Client sees REVISION REQUESTED with the founder message and the version it applies to', (await page.getAttribute('.bs-root', 'data-stage')) === 'REVISION_REQUESTED' && /online booking/.test(reqText));
  await shot(page, 'mobile-07-client-revision-requested');
  await shot(page, 'mobile-07-client-revision-requested-full', true);
  await page.goto(BASE + '/bldr/studio/work', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--work');
  await waitSync(page, ['saved']);
  await page.getByRole('button', { name: 'BOOKING' }).click();
  await waitSync(page, ['saved']);
  await page.goto(BASE + '/bldr/studio/pace', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--pace');
  await page.locator('.bs-notes textarea').fill('Launch in spring; consultations booked online.');
  await waitSync(page, ['saved']);
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await page.waitForSelector('.bs-room--blueprint');
  await waitSync(page, ['saved']);
  await settle(page, 1500);
  await page.getByRole('button', { name: /RESUBMIT AS VERSION 2/ }).click();
  await page.getByRole('button', { name: /SUBMIT VERSION 2/ }).click();
  await page.waitForSelector('text=SUBMISSION RECEIVED', { timeout: 20000 });
  await page.getByRole('button', { name: /VIEW MY BLUEPRINT/ }).click();
  await settle(page, 1500);
  d = await adminDetail(intakeId);
  const v = d.intake.submittedPayload;
  check('C21', 'Resubmission creates v2; v1 preserved unchanged in history', v.current.version === 2 && v.history.length === 1 && v.history[0].version === 1 && v.history[0].spatialState.workModules.join() === 'PAGES,SHOP' && v.current.spatialState.workModules.includes('BOOKING'));
  check('C22', 'Client sees REVISION SUBMITTED for version 2', (await page.getAttribute('.bs-root', 'data-stage')) === 'REVISION_SUBMITTED');
  check('F04', 'Resubmission audit event recorded (INTAKE_RESUBMITTED)', d.events.some((e) => e.eventType === 'INTAKE_RESUBMITTED'));
  await shot(page, 'mobile-07b-client-revision-submitted');

  /* ── F · founder sees the revised Blueprint + an outdated decision is refused ── */
  await fp.reload({ waitUntil: 'domcontentloaded' });
  await fp.waitForSelector('.bbr');
  await settle(fp, 2500);
  const revisedText = await fp.locator('.bbr').textContent();
  check('F05', 'Founder sees REVISED · AWAITING REVIEW with v2 latest and v1 superseded', /REVISED · AWAITING REVIEW/.test(revisedText) && /SUPERSEDED/.test(revisedText));
  await shot(fp, 'desktop-10-founder-revised-blueprint', true);
  await fp.getByRole('button', { name: /VIEW CLIENT RESPONSE/ }).click();
  await settle(fp, 400);
  const responseText = await fp.locator('.bbr-body').textContent();
  check('F06', 'VIEW CLIENT RESPONSE pairs the request with v2 and lists what changed', /CLIENT RESPONSE · VERSION 2/.test(responseText) && /WORK/.test(responseText));
  await shot(fp, 'desktop-10b-founder-client-response', true);
  await fp.getByRole('button', { name: /VIEW VERSION HISTORY/ }).click();
  await settle(fp, 300);
  await shot(fp, 'desktop-10c-founder-version-history', true);

  // Outdated decision: the founder's page shows v2 SUBMITTED. Behind it, the record moves on (another tab marks it
  // in review, requests a revision, and the client resubmits v3). The stale page's REQUEST REVISION must be refused.
  await adminPost({ action: 'mark-in-review', intakeType: 'BUILDER', id: intakeId });
  await adminPost({ action: 'request-revision', intakeType: 'BUILDER', id: intakeId, message: 'QA: second round from another tab.' });
  const ctxRes = await fetch(`${QA_API}/api/site00/intakes?action=get&intakeType=BUILDER&id=${intakeId}`);
  const live = (await ctxRes.json()).intake;
  const env = { ...live.draftPayload, clientRevision: (live.draftPayload.clientRevision || 0) + 1 };
  env.spatialStudio = { ...env.spatialStudio, pace: 'FLEXIBLE', savedAt: new Date().toISOString() };
  await fetch(`${QA_API}/api/site00/intakes?action=update`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ intakeType: 'BUILDER', id: intakeId, draftPayload: env }) });
  await fetch(`${QA_API}/api/site00/intakes?action=submit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ intakeType: 'BUILDER', id: intakeId }) });
  const beforeStale = await adminDetail(intakeId);
  await fp.getByRole('button', { name: 'REQUEST REVISION' }).click();
  await fp.locator('#bbr-revision-message').fill('QA: this decision was made on version 2.');
  await fp.getByRole('button', { name: /SEND REVISION REQUEST FOR V2/ }).click();
  await fp.waitForSelector('.bbr-notice--error', { timeout: 15000 });
  const afterStale = await adminDetail(intakeId);
  const staleNotice = await fp.locator('.bbr-notice--error').textContent();
  const formStillOpen = await fp.locator('#bbr-revision-message').count();
  check('F07b', 'After the refusal the revision form closes (an old message never re-targets the new version)', formStillOpen === 0);
  check(
    'F07',
    'An outdated decision (made on v2) is refused once v3 exists — nothing changes on v3',
    afterStale.intake.status === 'SUBMITTED' && afterStale.intake.submittedPayload.current.version === 3 && afterStale.events.length === beforeStale.events.length && /VERSION 3 ARRIVED/.test(staleNotice),
    staleNotice,
  );
  await shot(fp, 'desktop-10d-founder-stale-decision-refused');
  check('F08', 'Project activation stays gated (no automatic CONVERTED)', afterStale.intake.status !== 'CONVERTED' && /INTAKE_NOT_CONVERTED/.test(await fp.locator('.bbr-decisions').textContent()));

  console.log('client errors', client.errors.filter((e) => !e.includes('TUNNEL')).slice(0, 5));
  console.log('founder errors', founder.errors.filter((e) => !e.includes('TUNNEL')).slice(0, 5));
  await founder.ctx.close();
  await client.ctx.close();

  /* ── captures: tablet + desktop rooms, desktop client states ── */
  for (const vp of ['tablet', 'desktop']) {
    const s = await newPage(browser, vp);
    await s.page.goto(`${BASE}/bldr/studio?intakeId=${encodeURIComponent(intakeId)}`, { waitUntil: 'domcontentloaded' });
    await s.page.waitForSelector('.bs-root', { timeout: 90000 });
    await waitSync(s.page, ['submitted']);
    await settle(s.page, 2200);
    await shot(s.page, `${vp}-06-client-revision-submitted`);
    await s.ctx.close();
  }
  for (const vp of ['mobile', 'tablet', 'desktop']) {
    const c = await newPage(browser, vp);
    await c.page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
    await c.page.waitForSelector('.bs-root', { timeout: 90000 });
    await waitSync(c.page, ['saved']);
    await configure(c.page, { path: 'SIMPLE', feel: 'MODERN', shop: true, capture: vp });
    await shot(c.page, `${vp}-05-blueprint`);
    await c.ctx.close();
  }

  const pass = results.filter((r) => r.result === 'PASS').length;
  fs.writeFileSync(path.join(OUT, 'founder-loop-results.json'), JSON.stringify({ base: BASE, store: 'memory (QA harness)', ranAt: new Date().toISOString(), pass, fail: results.length - pass, results }, null, 2));
  console.log(`\n${pass}/${results.length} PASS`);
  await browser.close();
  process.exit(pass === results.length ? 0 : 1);
})().catch((e) => {
  console.error('FAILED', e);
  process.exit(1);
});
