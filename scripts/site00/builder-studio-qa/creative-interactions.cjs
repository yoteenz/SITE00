/**
 * SITE 00 Builder studio — Creative Refinement 1 interaction and layout regression.
 * Checks the refined surfaces against the live dev server (same setup as creative-captures.cjs):
 *
 *   node scripts/site00/builder-studio-qa/creative-interactions.cjs <outDir>
 *
 * Typography is the Production Workspace face, actually loaded; no page scrolls sideways and no headline line
 * wraps at the four review viewports; Blueprint tabs work by pointer and keyboard and re-light the object;
 * the confirmation sheet takes and returns focus; reduced motion holds the reveal still.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const OUT = path.resolve(process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/creative-refinement-qa');
fs.mkdirSync(OUT, { recursive: true });
const VIEWPORTS = {
  '390x844': { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  '393x852': { viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  '834x1194': { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 1 },
  '1440x900': { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const results = [];
const check = (id, name, pass, detail = '') => {
  results.push({ id, name, result: pass ? 'PASS' : 'FAIL', detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
};
const waitSync = (page) =>
  page.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });
const objectKey = (page) => page.getAttribute('.bs-object.bs-stage', 'data-object-key');

/** Layout facts for the current room: horizontal overflow, headline line wrapping, text clipped by its box. */
async function layout(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const lines = [...document.querySelectorAll('.bs-headline__line')].map((el) => {
      const lh = parseFloat(getComputedStyle(el.parentElement).lineHeight) || parseFloat(getComputedStyle(el.parentElement).fontSize);
      const r = el.getBoundingClientRect();
      return { text: el.textContent, wraps: r.height > lh * 1.5, right: r.right };
    });
    const clipped = [...document.querySelectorAll('.bs-root h1, .bs-root h2, .bs-root button, .bs-root dd, .bs-root p')]
      .filter((el) => el.offsetParent && getComputedStyle(el).overflow === 'visible' && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
      .map((el) => (el.textContent || '').trim().slice(0, 40));
    return { overflowX: doc.scrollWidth - doc.clientWidth, vw: doc.clientWidth, lines, clipped };
  });
}

async function journeyTo(page, room) {
  await page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--place');
  await waitSync(page);
  const facts = { place: await layout(page) };
  await page.getByRole('radio', { name: /^ADVANCED/ }).click();
  await waitSync(page);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--feel');
  facts.feel = await layout(page);
  await page.getByRole('radio', { name: /^EDITORIAL/ }).click();
  await waitSync(page);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--work');
  await page.getByRole('button', { name: 'SHOP', exact: true }).click();
  await waitSync(page);
  facts.work = await layout(page);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--pace');
  await page.getByRole('radio', { name: /^STANDARD/ }).click();
  await waitSync(page);
  facts.pace = await layout(page);
  if (room === 'pace') return facts;
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await page.waitForSelector('.bs-room--blueprint');
  await waitSync(page);
  facts.blueprint = await layout(page);
  return facts;
}

(async () => {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const browser = await chromium.launch({ args, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });

  // L: layout at every review viewport, every room.
  for (const [name, vp] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ ...vp, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.setDefaultTimeout(90000);
    const facts = await journeyTo(page, 'blueprint');
    const rooms = Object.entries(facts);
    check(`L-${name}-1`, `${name}: no horizontal page scroll in any room`, rooms.every(([, f]) => f.overflowX <= 0), rooms.map(([r, f]) => `${r}:${f.overflowX}`).join(' '));
    const wrapped = rooms.flatMap(([r, f]) => f.lines.filter((l) => l.wraps || l.right > f.vw).map((l) => `${r}:${l.text}`));
    check(`L-${name}-2`, `${name}: every headline line sets on one line inside the viewport`, wrapped.length === 0, wrapped.join(', '));
    const clipped = rooms.flatMap(([r, f]) => f.clipped.map((t) => `${r}:${t}`));
    check(`L-${name}-3`, `${name}: no text overflows its box`, clipped.length === 0, clipped.slice(0, 5).join(', '));
    await ctx.close();
  }

  // T, K, F, D, R on the 390 mobile journey.
  const ctx = await browser.newContext({ ...VIEWPORTS['390x844'], reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  await journeyTo(page, 'blueprint');

  const type = await page.evaluate(async () => {
    await document.fonts.ready;
    const fam = (sel) => getComputedStyle(document.querySelector(sel)).fontFamily;
    const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight}`);
    return { headline: fam('.bs-headline'), lede: fam('.bs-lede'), tab: fam('.bs-tab__label'), loaded };
  });
  check('T01', 'Headline, lede and tabs use the Production Workspace face', [type.headline, type.lede, type.tab].every((f) => /^"?Saira Semi Condensed/.test(f)), type.headline);
  check('T02', 'Saira Semi Condensed is actually loaded (not a fallback)', type.loaded.some((f) => /^Saira Semi Condensed (600|700)$/.test(f)), type.loaded.filter((f) => /Saira/.test(f)).join(', '));
  check('T03', 'No Anton / Inter faces are loaded by the studio', !type.loaded.some((f) => /^(Anton|Inter)\b/.test(f)), '');

  const overview = await objectKey(page);
  const tabs = page.getByRole('tab');
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  const afterRight = await page.evaluate(() => ({ sel: document.querySelector('[role=tab][aria-selected=true]')?.textContent, focus: document.activeElement?.textContent }));
  check('K01', 'ArrowRight selects and focuses the next Blueprint section', /STRUCTURE/.test(afterRight.sel) && /STRUCTURE/.test(afterRight.focus), JSON.stringify(afterRight));
  await page.keyboard.press('End');
  const atEnd = await page.evaluate(() => document.querySelector('[role=tab][aria-selected=true]')?.textContent);
  await page.keyboard.press('ArrowRight');
  const wrapped = await page.evaluate(() => document.querySelector('[role=tab][aria-selected=true]')?.textContent);
  await page.keyboard.press('ArrowLeft');
  const back = await page.evaluate(() => document.querySelector('[role=tab][aria-selected=true]')?.textContent);
  await page.keyboard.press('Home');
  const home = await page.evaluate(() => document.querySelector('[role=tab][aria-selected=true]')?.textContent);
  check('K02', 'End / wrap / ArrowLeft / Home move through the sections', /TIMELINE/.test(atEnd) && /OVERVIEW/.test(wrapped) && /TIMELINE/.test(back) && /OVERVIEW/.test(home), [atEnd, wrapped, back, home].join(' → '));
  const roving = await page.evaluate(() => [...document.querySelectorAll('[role=tab]')].map((t) => t.tabIndex));
  check('K03', 'Only the selected section is in the tab order (roving tabindex)', roving.filter((t) => t === 0).length === 1, JSON.stringify(roving));

  const keys = {};
  for (const t of ['STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE']) {
    await page.getByRole('tab', { name: new RegExp(t) }).click();
    await page.waitForTimeout(250);
    keys[t] = await objectKey(page);
  }
  check('F01', 'Each Blueprint section re-lights the Build Object (distinct inspection focus)', new Set([overview, ...Object.values(keys)]).size === 5, Object.values(keys).join(' | '));
  const ink = await page.evaluate(() => getComputedStyle(document.querySelector('.bs-tabs')).getPropertyValue('--bs-tab-i').trim());
  check('F02', 'Section indicator follows the selected section', ink === '4', `--bs-tab-i=${ink}`);
  const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.bs-tabpanel')).animationName);
  check('R01', 'Reduced motion: the section reveal does not animate', anim === 'none', anim);
  await page.getByRole('tab', { name: /OVERVIEW/ }).click();
  check('F03', 'Returning to OVERVIEW restores the overview composition', (await objectKey(page)) === overview, '');

  const estimate = await page.locator('.bs-figure').allTextContents();
  await page.getByRole('button', { name: /CONFIRM & SUBMIT/ }).click();
  await page.waitForSelector('.bs-dialog');
  const dialog = await page.evaluate(() => ({
    focus: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent,
    modal: document.querySelector('.bs-dialog')?.getAttribute('aria-modal'),
    place: [...document.querySelectorAll('.bs-proposal__row')].map((r) => r.textContent),
    range: document.querySelector('.bs-proposal__range-value')?.textContent,
  }));
  check('D01', 'Confirmation opens as a modal dialog and takes focus', dialog.modal === 'true' && !!dialog.focus, JSON.stringify({ modal: dialog.modal, focus: dialog.focus }));
  check('D02', 'Proposal rows name each choice once (no "BUILD BUILD")', dialog.place.length === 4 && !dialog.place.some((r) => /BUILD BUILD/.test(r)), dialog.place.join(' / '));
  check('D03', 'Proposal range is the same canonical figure as the Blueprint', estimate.some((e) => e.trim() === (dialog.range || '').trim()), `${dialog.range} vs ${estimate.join(' | ')}`);
  const submitDisabled = await page.locator('.bs-dialog .bs-cta').isDisabled();
  check('D04', 'Submit stays locked until SITE 00 can reply (guest email)', submitDisabled, '');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const closed = await page.evaluate(() => ({ open: !!document.querySelector('.bs-dialog'), status: document.querySelector('.bs-root')?.getAttribute('data-sync') }));
  check('D05', 'Escape closes the sheet without submitting', !closed.open && closed.status === 'saved', JSON.stringify(closed));

  await ctx.close();
  await browser.close();
  const pass = results.filter((r) => r.result === 'PASS').length;
  console.log(`\n${pass}/${results.length} PASS`);
  fs.writeFileSync(path.join(OUT, 'creative-interactions.json'), JSON.stringify(results, null, 2));
  process.exit(pass === results.length ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
