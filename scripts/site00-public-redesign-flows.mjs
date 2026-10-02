#!/usr/bin/env node
/**
 * SITE 00 public redesign — functional flow checks in a real browser (SONNET-STRUCTURE1).
 * Exercises the IDNTY continuity contract, conditional OTHER, validation, honest submission and the
 * Build Ready no-fake-verification boundary. The intake API is MOCKED here; nothing is a real submission.
 *
 *   node scripts/site00-public-redesign-flows.mjs [--base http://localhost:5174]
 * Exits non-zero on any failed check.
 */
import { chromium } from 'playwright';
import { routeProofFonts } from './lib/site00-proof-fonts.mjs';

const BASE = process.argv.includes('--base') ? process.argv[process.argv.indexOf('--base') + 1] : 'http://localhost:5174';
const NOW = '2026-10-01T00:00:00.000Z';
const intake = (status) => ({
  id: 'flow-mock-intake', intakeType: 'IDENTITY', status, referenceCode: 'IDN-FLOW', email: null, domainLabel: 'flow',
  currentStep: null, totalSteps: null, createdAt: NOW, updatedAt: NOW, lastSavedAt: NOW,
  submittedAt: status === 'SUBMITTED' ? NOW : null, draftPayload: {}, submittedPayload: null, version: 1, source: 'flow-mock', sourceRoute: null,
});

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });

async function newPage({ mockApi = true, failSubmit = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await routeProofFonts(page);
  const calls = [];
  if (mockApi) {
    await page.route('**/api/site00/intakes**', async (route) => {
      const action = new URL(route.request().url()).searchParams.get('action');
      calls.push(action);
      if (action === 'submit' && failSubmit) return route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"mock submit failure"}' });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ intake: intake(action === 'submit' ? 'SUBMITTED' : 'ACTIVE') }) });
    });
  }
  await page.addStyleTag({ content: '.site00-origin-layout-switch{display:none!important}' }).catch(() => {});
  return { page, ctx, calls };
}
const path = (page) => new URL(page.url()).pathname;
const text = (page, sel) => page.locator(sel).first().innerText();

/* 1 ── continuity + FOUNDATION happy path + honest submit */
{
  const { page, ctx, calls } = await newPage();
  await page.goto(`${BASE}/idnty/state`);
  await page.getByRole('button', { name: /SELECT STATE 00/ }).click();
  await page.getByRole('button', { name: 'SELECT STATE', exact: true }).first().click();
  await page.waitForURL('**/idnty/starting-at-zero');
  check('overview → state detail route', path(page) === '/idnty/starting-at-zero');
  check('detail mode is the lower panel', (await page.locator('.s00pr-panel').getAttribute('data-panel-mode')) === 'detail');

  // tag DOM nodes that must survive the whole intake (page-family continuity)
  await page.evaluate(() => {
    document.querySelector('.s00pr-idhero').dataset.keep = '1';
    document.querySelector('.s00pr-stage').dataset.keep = '1';
    document.querySelector('.s00pr-progression').dataset.keep = '1';
    document.querySelector('.s00pr-panel').dataset.keep = '1';
  });

  await page.getByRole('button', { name: /BEGIN FOUNDATION/ }).click();
  await page.waitForURL('**/starting-at-zero/goal');
  check('detail → first question inside same family', (await page.locator('.s00pr-panel').getAttribute('data-panel-mode')) === 'question');
  check('hero/machine/rail/panel DOM nodes persist (no page replacement)',
    (await page.locator('[data-keep="1"]').count()) === 4, `${await page.locator('[data-keep="1"]').count()}/4`);
  // Authority (FOUNDATION): QUESTION 01 sits in the panel head; OF 04 is visually hidden but announced.
  check('question progress is secondary (panel head, QUESTION 01 + hidden total)',
    /QUESTION 01\s*OF 04/.test(await page.locator('.s00pr-panel__head').innerText()) && (await page.locator('.s00pr-question__segments').count()) === 0);
  check('page load does not move focus to the header scan trigger', await page.evaluate(() => !document.activeElement?.classList.contains('s00pr-scan')));
  check('only one 00–03 rail exists', (await page.locator('.s00pr-progression').count()) === 1);

  // validation: required goal blocks continue
  await page.getByRole('button', { name: /CONTINUE/ }).click();
  check('required question blocks continue with inline error', (await page.locator('.s00pr-error').count()) === 1 && path(page).endsWith('/goal'));

  await page.getByRole('radio', { name: /LAUNCH A NEW BRAND/ }).click();
  check('single-select exposes radio semantics + checked state', (await page.getByRole('radio', { name: /LAUNCH A NEW BRAND/ }).getAttribute('aria-checked')) === 'true');
  await page.getByRole('radio', { name: /SELL ONLINE/ }).click();
  check('single-select replaces selection', (await page.locator('[role=radio][aria-checked=true]').count()) === 1);
  await page.getByRole('radio', { name: /LAUNCH A NEW BRAND/ }).click();
  await page.getByRole('button', { name: /CONTINUE/ }).click();
  await page.waitForURL('**/audience');

  const answer = 'Early-stage founders building intentional brands.';
  await page.locator('textarea').fill(answer);
  check('textarea counter tracks length', (await text(page, '.s00pr-field__count')).startsWith(`${answer.length} / 500`));
  await page.getByRole('button', { name: /CONTINUE/ }).click();
  await page.waitForURL('**/timeline');
  await page.getByRole('radio', { name: /3–4 MONTHS/ }).click();
  await page.getByRole('button', { name: /CONTINUE/ }).click();
  await page.waitForURL('**/budget');
  await page.getByRole('radio', { name: /\$5,000 – \$10,000/ }).click();
  check('last question CTA reads REVIEW ASSESSMENT', (await page.getByRole('button', { name: /REVIEW ASSESSMENT/ }).count()) === 1);
  await page.getByRole('button', { name: /REVIEW ASSESSMENT/ }).click();
  await page.waitForURL('**/review');
  check('review stays inside the state family', (await page.locator('.s00pr-panel').getAttribute('data-panel-mode')) === 'review' && (await page.locator('[data-keep="1"]').count()) === 4);
  const review = await text(page, '.s00pr-review');
  check('review summarises captured inputs', /LAUNCH A NEW BRAND/.test(review) && /EARLY-STAGE FOUNDERS/.test(review) && /3–4 MONTHS/.test(review) && /\$5,000 – \$10,000/.test(review));
  check('review CTA is truthful (no recommendation/world CTA)', (await page.getByRole('button', { name: /SUBMIT IDENTITY ASSESSMENT/ }).count()) === 1 && !/CONTINUE TO BRAND WORLD|VIEW RECOMMENDATION/.test(await page.locator('body').innerText()));
  check('"WHAT ARE YOU BUILDING?" never appears in Foundation', !/WHAT ARE YOU BUILDING/.test(await page.locator('body').innerText()));
  check('SAVED claims only after the mocked server write', (await page.locator('.s00pr-save--saved').count()) === 1);

  await page.getByRole('button', { name: /SUBMIT IDENTITY ASSESSMENT/ }).click();
  await page.waitForURL('**/starting-at-zero/complete', { timeout: 8000 }).catch(() => {});
  check('successful submit calls the existing submit endpoint then routes to complete', calls.includes('submit') && path(page).endsWith('/complete'), `calls=${calls.join(',')}`);
  await ctx.close();
}

/* 2 ── submit failure is honest */
{
  const { page, ctx } = await newPage({ failSubmit: true });
  await page.addInitScript(() => {
    localStorage.setItem('site00_idnty_assessment_v1', JSON.stringify({ identityState: 'starting-at-zero', answers: { 'starting-at-zero': { goal: 'launch-brand', audience: 'x', timeline: '3-4', budget: '5k-10k' } }, completedSteps: [] }));
  });
  await page.goto(`${BASE}/idnty/starting-at-zero/review`);
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /SUBMIT IDENTITY ASSESSMENT/ }).click();
  await page.waitForTimeout(1500);
  check('failed submit stays on review and says so (no fake SUBMITTED)', path(page).endsWith('/review') && /COULD NOT CONFIRM YOUR SUBMISSION/.test(await page.locator('.s00pr-error').innerText()));
  await ctx.close();
}

/* 3 ── no API at all: honest NOT SAVED, no completion */
{
  const { page, ctx } = await newPage({ mockApi: false });
  await page.addInitScript(() => {
    localStorage.setItem('site00_idnty_assessment_v1', JSON.stringify({ identityState: 'starting-at-zero', answers: { 'starting-at-zero': { goal: 'launch-brand', audience: 'x', timeline: '3-4', budget: '5k-10k' } }, completedSteps: [] }));
  });
  await page.route('**/api/site00/**', (r) => r.fulfill({ status: 503, body: '{}', contentType: 'application/json' }));
  await page.goto(`${BASE}/idnty/starting-at-zero/review`);
  // Wait for the save attempt to settle (SAVING… → SAVED / NOT SAVED) instead of a fixed delay.
  await page.waitForFunction(() => {
    const t = document.querySelector('.s00pr-save')?.textContent ?? '';
    return t && !/SAVING/.test(t);
  }, null, { timeout: 10000 }).catch(() => {});
  const saveLabel = await page.locator('.s00pr-save').first().innerText().catch(() => '');
  check('unreachable server shows NOT SAVED (never SAVED)', /NOT SAVED/.test(saveLabel), saveLabel);
  await page.getByRole('button', { name: /SUBMIT IDENTITY ASSESSMENT/ }).click();
  await page.waitForTimeout(1200);
  check('unreachable server never marks the assessment complete', path(page).endsWith('/review'));
  await ctx.close();
}

/* 4 ── incomplete review routes to the first missing required question */
{
  const { page, ctx } = await newPage();
  await page.goto(`${BASE}/idnty/starting-at-zero/review`);
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /SUBMIT IDENTITY ASSESSMENT/ }).click();
  await page.waitForURL('**/starting-at-zero/goal', { timeout: 5000 }).catch(() => {});
  check('incomplete assessment is not submitted; routes to first missing question', path(page).endsWith('/goal'));
  await ctx.close();
}

/* 5 ── retired Foundation step falls back to detail (no old project question) */
{
  const { page, ctx } = await newPage();
  await page.goto(`${BASE}/idnty/starting-at-zero/project`);
  await page.waitForTimeout(800);
  check('retired /project step redirects to state detail', path(page) === '/idnty/starting-at-zero');
  await ctx.close();
}

/* 6 ── REFINE conditional OTHER */
{
  const { page, ctx } = await newPage();
  await page.goto(`${BASE}/idnty/some-pieces-exist/assets`);
  await page.waitForTimeout(800);
  check('OTHER field hidden initially', (await page.locator('[data-conditional-other]').count()) === 0);
  await page.getByRole('checkbox', { name: /LOGO/ }).click();
  await page.getByRole('checkbox', { name: /OTHER/ }).click();
  check('selecting OTHER expands a field inside the same panel', (await page.locator('[data-conditional-other]').count()) === 1 && path(page).endsWith('/assets'));
  await page.locator('[data-conditional-other] textarea').fill('Packaging system');
  await page.getByRole('checkbox', { name: /OTHER/ }).click();
  check('deselecting OTHER collapses the field', (await page.locator('[data-conditional-other]').count()) === 0);
  await page.getByRole('checkbox', { name: /OTHER/ }).click();
  check('OTHER text is preserved when re-expanded', (await page.locator('[data-conditional-other] textarea').inputValue()) === 'Packaging system');
  await page.getByRole('button', { name: /CONTINUE/ }).click();
  await page.waitForURL('**/cohesion-diagnostic');
  check('Refine step 2 is the condition question (no OTHER screen)', /HOW WOULD YOU DESCRIBE WHAT YOU HAVE TODAY/.test(await page.locator('.s00pr-question__title').innerText()));
  check('Refine keeps its compact QUESTION 0N OF 03 counter', (await text(page, '.s00pr-question__counter')).includes('QUESTION 02 OF 03'));
  await ctx.close();
}

/* 7 ── READY FOR EVOLUTION boundary */
{
  const { page, ctx } = await newPage();
  await page.goto(`${BASE}/idnty/ready-for-evolution/pathways`);
  await page.waitForTimeout(800);
  const body = await page.locator('.s00pr-panel').innerText();
  check('Evolution offers exactly the 3 IDNTY identity areas', /BRAND STRATEGY/.test(body) && /VISUAL IDENTITY/.test(body) && /BRAND MESSAGING/.test(body) && (await page.locator('[role=checkbox]').count()) === 3);
  check('Evolution has no cross-domain / public-EVOLVE options', !/GROWTH SYSTEMS|DIGITAL EXPERIENCE|INSTALL|TRANSFORM/.test(body));
  await ctx.close();
}

/* 8 ── BUILD READY: honest verification, no fake VERIFIED, no BLDR unlock */
{
  const { page, ctx } = await newPage();
  await page.goto(`${BASE}/idnty/build-ready`);
  await page.getByRole('button', { name: /BEGIN VERIFICATION/ }).waitFor({ timeout: 8000 }).catch(() => {});
  let all = await page.locator('body').innerText();
  check('Build Ready detail never claims VERIFIED / ENTER BLDR', !/IDENTITY VERIFIED|ENTER BLDR|LOCKED AND VERIFIED/.test(all) && /BEGIN VERIFICATION/.test(all));
  await page.getByRole('button', { name: /BEGIN VERIFICATION/ }).click();
  await page.waitForURL('**/build-ready/verification');
  all = await page.locator('body').innerText();
  check('verification starts with every domain ADD EVIDENCE (nothing pre-verified)', (all.match(/ADD EVIDENCE/g) ?? []).length === 5 && !/EVIDENCE RECEIVED/.test(all));
  await page.getByRole('button', { name: /STRATEGY/ }).first().click();
  await page.waitForURL('**/build-ready/evidence');
  await page.getByRole('checkbox', { name: 'POSITIONING' }).click();
  check('adding evidence flips only that domain to EVIDENCE RECEIVED (provisional)', (await page.locator('[data-authority-status="EVIDENCE_RECEIVED"]').count()) === 1);
  check('no percentage / score anywhere', !/\d+\s?%/.test(await page.locator('body').innerText()));
  await page.getByRole('button', { name: /CONTINUE VERIFICATION/ }).click();
  await page.waitForURL('**/authority-check');
  all = await page.locator('body').innerText();
  check('authority check shows PENDING REVIEW + GAP IDENTIFIED, never ESTABLISHED', /PENDING REVIEW/.test(all) && /GAP IDENTIFIED/.test(all) && !/AUTHORITY ESTABLISHED/.test(all));
  check('authority check carries the provisional disclaimer', /NOTHING HAS BEEN REVIEWED OR VERIFIED BY SITE 00 YET/.test(all));
  await page.getByRole('button', { name: /REVIEW VERIFICATION/ }).click();
  await page.waitForURL('**/build-ready/review');
  check('review counts only (1 provided / 4 require review)', /1 DOMAIN PROVIDED/.test(await page.locator('body').innerText()) && /4 DOMAINS REQUIRE REVIEW/.test(await page.locator('body').innerText()));
  await page.getByRole('button', { name: /SUBMIT FOR VERIFICATION/ }).click();
  await page.waitForTimeout(600);
  check('SUBMIT FOR VERIFICATION reports unavailable and stays put', path(page).endsWith('/build-ready/review') && /NOT AVAILABLE YET/.test(await page.locator('.s00pr-error').innerText()));
  check('no navigation to BLDR is offered from Build Ready', (await page.locator('a[href^="/bldr"]').count()) === 0);
  await ctx.close();
}

/* 9 ── Origin + services route integration */
{
  const { page, ctx } = await newPage();
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(1200);
  check('Origin exposes exactly three entry cards', (await page.locator('.s00pr-origincard').count()) === 3);
  await page.getByRole('button', { name: 'EXPAND BLDR' }).click();
  await page.getByRole('button', { name: /BEGIN BLDR/ }).click();
  await page.waitForURL('**/bldr/state');
  check('Origin BLDR panel → /bldr/state command center', /COMMAND CENTER/.test(await page.locator('.s00pr-svchero__title').innerText()));
  await page.getByRole('link', { name: /EXTENSIONS/ }).first().click();
  await page.waitForURL('**/bldr/state?path=extensions');
  await page.getByRole('link', { name: /BEGIN EXTENSIONS/ }).click();
  await page.waitForURL('**/bldr/not-sure');
  check('BEGIN EXTENSIONS routes to existing BLDR discovery (no invented route)', path(page) === '/bldr/not-sure');
  await page.goto(`${BASE}/evolve/state`);
  await page.locator('.s00pr-svccard').first().waitFor({ timeout: 10000 }).catch(() => {});
  check('EVOLVE center offers exactly 3 paths', (await page.locator('.s00pr-svccard').count()) === 3);
  await page.getByRole('link', { name: /INSTALL/ }).first().click();
  await page.waitForURL('**/evolve/state?path=install');
  await page.getByRole('link', { name: /CHOOSE INSTALL/ }).click();
  await page.waitForURL('**/evolve/install/property');
  check('CHOOSE INSTALL keeps the existing assessment destination', path(page) === '/evolve/install/property');
  await ctx.close();
}

/* 10 ── fast travel focus management (trigger regains focus only after the panel closes) */
{
  const { page, ctx } = await newPage();
  await page.goto(`${BASE}/idnty/state`);
  await page.waitForTimeout(800);
  check('no focus ring on the scan trigger after load', await page.evaluate(() => document.activeElement === document.body || !document.activeElement?.classList.contains('s00pr-scan')));
  await page.getByRole('button', { name: 'OPEN FAST TRAVEL' }).click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('closing fast travel returns focus to its trigger', await page.evaluate(() => document.activeElement?.classList.contains('s00pr-scan') ?? false));
  await ctx.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
process.exit(failed.length ? 1 : 0);
