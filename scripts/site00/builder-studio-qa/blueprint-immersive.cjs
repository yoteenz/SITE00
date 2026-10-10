/**
 * SITE 00 Builder studio — Immersive Blueprint interaction QA.
 *
 *   node scripts/site00/builder-studio-qa/blueprint-immersive.cjs <outDir>
 *
 * Against the live dev server (memory intake, preview flags; see creative-captures.cjs). For each section it
 * captures the default, a selection, a second selection and the reset, and checks that the model actually
 * answers: the composition key, the lit elements, the camera target and the stage pixels. It also checks keyboard
 * use, reversal, tab switching, fullscreen context, the sticky stage, rotation, reduced motion, that the estimate
 * figures are untouched, and the layout at six viewports. A screen recording of the walk-through is kept as
 * interaction evidence. Writes `immersive-results.json`.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const OUT = path.resolve(process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/immersive-blueprint-qa');
const SHOTS = path.join(OUT, 'after');
const SEQ = path.join(OUT, 'interaction');
for (const d of [OUT, SHOTS, SEQ]) fs.mkdirSync(d, { recursive: true });

const MOBILE = { deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const VIEWPORTS = {
  '390x844': { viewport: { width: 390, height: 844 }, ...MOBILE },
  '393x852': { viewport: { width: 393, height: 852 }, ...MOBILE },
  '834x1194': { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 1 },
  '1440x900': { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  '339x734 (text 115%)': { viewport: { width: 339, height: 734 }, ...MOBILE },
  '300x649 (text 130%)': { viewport: { width: 300, height: 649 }, ...MOBILE },
};
const results = [];
const check = (id, name, pass, detail = '') => {
  results.push({ id, name, result: pass ? 'PASS' : 'FAIL', detail: String(detail).slice(0, 400) });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + String(detail).slice(0, 200) : ''}`);
};
const info = (id, name, detail) => {
  results.push({ id, name, result: 'INFO', detail: String(detail).slice(0, 400) });
  console.log(`INFO ${id} ${name} — ${detail}`);
};

const waitSync = (page) =>
  page.waitForFunction(() => document.querySelector('.bs-root')?.getAttribute('data-sync') === 'saved', null, { timeout: 30000 });

async function toBlueprint(page) {
  await page.goto(BASE + '/bldr/studio', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bs-room--place');
  await waitSync(page);
  await page.getByRole('radio', { name: /^ADVANCED/ }).click();
  await waitSync(page);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--feel');
  await page.getByRole('radio', { name: /^MODERN/ }).click();
  await waitSync(page);
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--work');
  for (const m of ['SHOP', 'PORTAL']) {
    await page.getByRole('button', { name: m, exact: true }).click();
    await waitSync(page);
  }
  await page.getByRole('button', { name: /^CONTINUE/ }).click();
  await page.waitForSelector('.bs-room--pace');
  await page.getByRole('radio', { name: /^STANDARD/ }).click();
  await waitSync(page);
  await page.getByRole('button', { name: /REVIEW MY BLUEPRINT/ }).click();
  await page.waitForSelector('.bs-room--blueprint');
  await waitSync(page);
  await page.waitForSelector('.bs-object__host[data-env]', { timeout: 30000 }).catch(() => undefined);
  await page.evaluate(() => document.fonts.ready);
}

const state = (page) =>
  page.evaluate(() => {
    const host = document.querySelector('.bs-object__host');
    const on = document.querySelector('.bs-mark.is-on');
    return {
      key: document.querySelector('.bs-object.bs-stage')?.getAttribute('data-object-key') ?? '',
      camera: host?.dataset.camera ?? '',
      lit: Number(host?.dataset.lit ?? 0),
      marks: [...document.querySelectorAll('.bs-mark')].filter((m) => m.style.visibility !== 'hidden').length,
      callout: on?.querySelector('.bs-mark__text')?.textContent ?? null,
      pressed: [...document.querySelectorAll('.bs-tabpanel [aria-pressed="true"]')].map((b) => (b.textContent || '').trim().slice(0, 40)),
      hint: document.querySelector('.bs-mode__hint')?.textContent ?? '',
    };
  });

async function stagePng(page) {
  const box = await page.locator('.bs-object.bs-stage').boundingBox();
  return page.screenshot({ type: 'png', clip: box });
}

/** Share of stage pixels that differ by more than 12/255 (stage crops of equal size). */
async function delta(a, b) {
  const [ra, rb] = await Promise.all([sharp(a).raw().toBuffer({ resolveWithObject: true }), sharp(b).raw().toBuffer({ resolveWithObject: true })]);
  if (ra.info.width !== rb.info.width || ra.info.height !== rb.info.height) return 1;
  const n = ra.info.width * ra.info.height;
  const c = ra.info.channels;
  let moved = 0;
  for (let i = 0; i < n; i += 1) {
    let d = 0;
    for (let k = 0; k < 3; k += 1) d = Math.max(d, Math.abs(ra.data[i * c + k] - rb.data[i * c + k]));
    if (d > 12) moved += 1;
  }
  return moved / n;
}

const pct = (x) => `${(x * 100).toFixed(1)}%`;

async function layout(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const vw = doc.clientWidth;
    const clipped = [...document.querySelectorAll('.bs-tabpanel button, .bs-tabpanel p, .bs-tabpanel dd, .bs-tabpanel dt, .bs-tab, .bs-mode p')]
      .filter((el) => el.offsetParent && !el.closest('.bs-visually-hidden') && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && getComputedStyle(el).overflow === 'visible')
      .map((el) => (el.textContent || '').trim().slice(0, 30));
    const tabs = [...document.querySelectorAll('.bs-tab')].map((t) => t.getBoundingClientRect());
    const tabsFit = tabs.every((r) => r.left >= -1 && r.right <= vw + 1 && r.height >= 40);
    const small = [...document.querySelectorAll('.bs-tabpanel *, .bs-mode *')]
      .filter((el) => el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.offsetParent)
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 7.8)
      .map((el) => `${el.className || el.tagName}:${getComputedStyle(el).fontSize}`);
    const targets = [...document.querySelectorAll('.bs-tabpanel button, .bs-tab')]
      .filter((el) => el.offsetParent && !el.closest('.bs-detail'))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.height < 24 || r.width < 24;
      })
      .map((el) => `${el.className}:${Math.round(el.getBoundingClientRect().height)}`);
    return { overflowX: doc.scrollWidth - doc.clientWidth, clipped, tabsFit, smallText: small.length, smallTargets: targets.length, small: [...new Set(small)].slice(0, 6), targets: targets.slice(0, 4) };
  });
}

(async () => {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const launch = { args, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) };
  const browser = await chromium.launch(launch);

  // PART selects one slice (walk:<viewport> | motion | layout) so each fits one run; results merge by part.
  const PART = process.env.PART || 'all';
  const want = (p) => PART === 'all' || PART === p;
  /* ── 1. Interaction walk at 390 and 1440 (reduced motion for deterministic frames) ── */
  for (const name of ['390x844', '1440x900'].filter((n) => want(`walk:${n}`))) {
    const ctx = await browser.newContext({ ...VIEWPORTS[name], reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await toBlueprint(page);
    const v = name.startsWith('390') ? 'm' : 'd';
    const settle = () => page.waitForTimeout(900);
    const top = () => page.evaluate(() => window.scrollTo(0, 0));
    const snap = async (file) => {
      await settle();
      await page.screenshot({ path: path.join(SHOTS, `${name}-${file}.jpg`), type: 'jpeg', quality: 82 });
    };
    const tab = async (t) => {
      await top();
      await page.getByRole('tab', { name: new RegExp(t) }).click();
      await settle();
    };

    // Estimate figures as the OVERVIEW shows them (compared again from TIMELINE).
    const facts = await page.evaluate(() => [...document.querySelectorAll('.bs-fact .bs-figure')].map((el) => el.textContent.trim()));
    const overview = await state(page);
    const overviewPng = await stagePng(page);
    await snap('01-overview');

    // I01 tab switching: each section has its own key, purpose and default model.
    const keys = {};
    const defaults = {};
    for (const t of ['STRUCTURE', 'PAGES', 'FEATURES']) {
      await tab(t);
      keys[t] = await state(page);
      defaults[t] = await stagePng(page);
    }
    const distinctKeys = new Set([overview.key, keys.STRUCTURE.key, keys.PAGES.key, keys.FEATURES.key]).size === 4;
    check(`${v}-I01`, `${name}: every section puts its own state on the model`, distinctKeys && keys.STRUCTURE.key.endsWith('STRUCTURE:-') && keys.PAGES.lit > 0 && keys.FEATURES.lit > 0, `${keys.STRUCTURE.key.split('|').pop()} lit=${keys.STRUCTURE.lit} · ${keys.PAGES.key.split('|').pop()} lit=${keys.PAGES.lit} · ${keys.FEATURES.key.split('|').pop()} lit=${keys.FEATURES.lit}`);
    const dS = await delta(overviewPng, defaults.STRUCTURE);
    const dP = await delta(overviewPng, defaults.PAGES);
    const dF = await delta(overviewPng, defaults.FEATURES);
    check(`${v}-I02`, `${name}: each section's default view differs visibly from the whole place`, dS > 0.02 && dP > 0.02 && dF > 0.02, `STRUCTURE ${pct(dS)} · PAGES ${pct(dP)} · FEATURES ${pct(dF)}`);

    // STRUCTURE: select a layer, a second layer, an undrawn layer, then return.
    await tab('STRUCTURE');
    await snap('02a-structure-default');
    const sDefault = await state(page);
    await page.getByRole('button', { name: /^L3/ }).click();
    const s1 = await state(page);
    const s1png = await stagePng(page);
    await snap('02b-structure-L3-envelope');
    await page.getByRole('button', { name: /^L4/ }).click();
    const s2 = await state(page);
    await snap('02c-structure-L4-wings');
    check(`${v}-S01`, `${name}: STRUCTURE layer lights its geometry, moves the camera, pins a callout`, s1.lit > 0 && s1.camera !== sDefault.camera && /L3 · ENVELOPE/.test(s1.callout ?? '') && (await delta(defaults.STRUCTURE, s1png)) > 0.02, `lit ${s1.lit} · cam ${sDefault.camera} → ${s1.camera} · callout ${s1.callout}`);
    check(`${v}-S02`, `${name}: STRUCTURE a second layer replaces the first`, s2.key !== s1.key && s2.pressed.length === 1 && /^L4/.test(s2.pressed[0]) && /L4 · WINGS/.test(s2.callout ?? ''), `${s2.pressed.join(',')} · ${s2.callout}`);
    await page.getByRole('button', { name: /^L6/ }).click();
    const sUndrawn = await state(page);
    check(`${v}-S03`, `${name}: STRUCTURE an undrawn line lights nothing and says so`, sUndrawn.lit === 0 && /NOT DRAWN/.test(sUndrawn.hint), sUndrawn.hint);
    await page.getByRole('button', { name: /SHOW THE WHOLE STRUCTURE/ }).click();
    const sReset = await state(page);
    await snap('02d-structure-reset');
    check(`${v}-S04`, `${name}: STRUCTURE returns to its default exactly`, sReset.key === sDefault.key && sReset.camera === sDefault.camera && sReset.lit === sDefault.lit, `${sReset.key.split('|').pop()} · ${sReset.camera}`);

    // PAGES: the count, a page, another page, a group, Escape.
    await tab('PAGES');
    await snap('03a-pages-default');
    const pDefault = await state(page);
    const counts = await page.evaluate(() => ({ shown: Number(document.querySelector('.bs-count__value')?.textContent), plates: document.querySelectorAll('.bs-plate').length }));
    check(`${v}-P01`, `${name}: PAGES shows every page once, the count from the Blueprint`, counts.shown === counts.plates && counts.plates > 0, `${counts.shown} counted · ${counts.plates} plates`);
    await page.getByRole('button', { name: /^P06/ }).click();
    const p1 = await state(page);
    const p1detail = await page.locator('.bs-plates__detail').textContent();
    await snap('03b-pages-P06-shop');
    await top();
    await snap('03b-pages-P06-shop-model');
    check(`${v}-P02`, `${name}: PAGES a page lights the volume it lives in and names it`, p1.lit === 2 && /P06 · SHOP/.test(p1.callout ?? '') && /LIVES IN\s*THE SHOP WING/.test(p1detail) && p1.camera !== pDefault.camera, `lit ${p1.lit} · ${p1.callout} · ${p1detail.replace(/\s+/g, ' ').slice(0, 90)}`);
    await page.getByRole('button', { name: /^P10/ }).click();
    const p2 = await state(page);
    await top();
    await snap('03c-pages-P10-account-model');
    check(`${v}-P03`, `${name}: PAGES another page moves to its own volume`, p2.key !== p1.key && /P10 · ACCOUNT/.test(p2.callout ?? '') && p2.camera !== p1.camera && p2.pressed.length === 1, `${p2.callout} · cam ${p2.camera}`);
    await page.getByRole('button', { name: /^SIGNED IN/ }).click();
    const pg = await state(page);
    check(`${v}-P04`, `${name}: PAGES a group lights where its pages live`, pg.lit > 0 && /SIGNED IN/.test(pg.hint), `${pg.hint} · lit ${pg.lit}`);
    await page.keyboard.press('Escape');
    await settle();
    const pReset = await state(page);
    await snap('03d-pages-reset');
    check(`${v}-P05`, `${name}: PAGES Escape returns to every page`, pReset.key === pDefault.key && pReset.lit === pDefault.lit, pReset.key.split('|').pop());

    // FEATURES: a feature, its relationship chip, reset by selecting again.
    await tab('FEATURES');
    await snap('04a-features-default');
    const fDefault = await state(page);
    await page.getByRole('button', { name: /^SELL/ }).click();
    const f1 = await state(page);
    await snap('04b-features-sell');
    const chip = page.locator('.bs-detail .bs-chip', { hasText: 'TAKE PAYMENT' });
    await chip.click();
    const f2 = await state(page);
    await snap('04c-features-take-payment');
    check(`${v}-F01`, `${name}: FEATURES a feature lights its module and pins it`, f1.lit === 2 && /SELL/.test(f1.callout ?? '') && f1.camera !== fDefault.camera, `lit ${f1.lit} · ${f1.callout}`);
    check(`${v}-F02`, `${name}: FEATURES a relationship opens the related feature on the same module`, /TAKE PAYMENT/.test(f2.callout ?? '') && f2.pressed.length === 1 && /TAKE PAYMENT/.test(f2.pressed[0]), `${f2.callout} · ${f2.pressed.join(',')}`);
    await page.getByRole('button', { name: /^TAKE PAYMENT/ }).click();
    const fReset = await state(page);
    check(`${v}-F03`, `${name}: FEATURES selecting again returns to every feature`, fReset.key === fDefault.key, fReset.key.split('|').pop());

    // Tab switch clears; OVERVIEW restores the whole place.
    await page.getByRole('button', { name: /^ACCOUNTS/ }).click();
    await tab('PAGES');
    const cleared = await state(page);
    await tab('OVERVIEW');
    const back = await state(page);
    check(`${v}-X01`, `${name}: a section change clears the selection; OVERVIEW restores the whole place`, cleared.key === pDefault.key && cleared.pressed.length === 0 && back.key === overview.key && back.lit === 0 && back.camera === overview.camera, `${cleared.key.split('|').pop()} · ${back.key === overview.key}`);

    // Keyboard: arrows across the tabs, Enter on a layer, Escape.
    await page.getByRole('tab', { name: /OVERVIEW/ }).focus();
    await page.keyboard.press('ArrowRight');
    const k1 = await page.evaluate(() => document.activeElement?.textContent);
    await page.keyboard.press('End');
    const k2 = await page.evaluate(() => document.activeElement?.textContent);
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await settle();
    await page.getByRole('button', { name: /^L2/ }).focus();
    await page.keyboard.press('Enter');
    const k3 = await state(page);
    await page.keyboard.press('Escape');
    const k4 = await state(page);
    check(`${v}-K01`, `${name}: keyboard — arrows/Home/End move between sections, Enter selects, Escape returns`, /STRUCTURE/.test(k1 ?? '') && /TIMELINE/.test(k2 ?? '') && /L2 · CORE/.test(k3.callout ?? '') && k4.pressed.length === 0, `${k1} · ${k2} · ${k3.callout} · ${k4.pressed.length}`);

    // Fullscreen keeps the section and its selection, and shows its caption.
    await page.getByRole('button', { name: /^L3/ }).click();
    const beforeFs = await state(page);
    await page.getByRole('button', { name: 'VIEW FULL SCREEN' }).click();
    await page.waitForTimeout(1200);
    const fs1 = await page.evaluate(() => ({
      full: Boolean(document.fullscreenElement) || document.querySelector('.bs-stage-wrap')?.classList.contains('is-expanded'),
      caption: getComputedStyle(document.querySelector('.bs-stagecap') ?? document.body).display !== 'none' ? document.querySelector('.bs-stagecap__title')?.textContent : null,
    }));
    const inFs = await state(page);
    await page.screenshot({ path: path.join(SHOTS, `${name}-06-fullscreen-structure-L3.jpg`), type: 'jpeg', quality: 82 });
    check(`${v}-X02`, `${name}: full screen keeps the section, the selection and its caption`, fs1.full && inFs.key === beforeFs.key && /L3 · ENVELOPE/.test(fs1.caption ?? ''), `${fs1.full} · ${fs1.caption}`);
    await page.evaluate(async () => {
      if (document.fullscreenElement) await document.exitFullscreen();
      document.querySelector('.bs-stage-wrap')?.classList.remove('is-expanded');
    });
    await settle();

    // Rotation stays usable during an inspection.
    await top();
    // Full screen already switches drag on (existing behaviour); only switch it on if it is off.
    const cube = page.getByRole('button', { name: 'TURN THE STRUCTURE IN 3D' });
    if ((await cube.getAttribute('aria-pressed')) !== 'true') await cube.click();
    await settle();
    const r0 = await stagePng(page);
    const box = await page.locator('.bs-object__canvas').boundingBox();
    await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.82);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.78, { steps: 8 });
    await page.mouse.up();
    await settle();
    const r1 = await stagePng(page);
    const turned = await state(page);
    check(`${v}-X03`, `${name}: the model still turns by drag during an inspection, selection kept`, (await delta(r0, r1)) > 0.03 && turned.key === beforeFs.key, `stage ${pct(await delta(r0, r1))}`);
    await page.getByRole('button', { name: 'RESET VIEW' }).click();
    await cube.click();

    // Sticky stage on phones: the model stays in view while the index scrolls.
    if (v === 'm') {
      await tab('PAGES');
      await page.getByRole('button', { name: /^P12/ }).scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: /^P12/ }).click();
      await settle();
      const sticky = await page.evaluate(() => {
        const wrap = document.querySelector('.bs-stage-wrap');
        const r = wrap.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, stuck: wrap.classList.contains('is-stuck'), scrollY };
      });
      await page.screenshot({ path: path.join(SHOTS, `${name}-07-sticky-pages-P12.jpg`), type: 'jpeg', quality: 82 });
      check(`${v}-X04`, `${name}: the stage stays in view (sticky) while the page index scrolls`, sticky.scrollY > 100 && Math.abs(sticky.top) < 1 && sticky.stuck, JSON.stringify(sticky));
    }

    // TIMELINE under reduced motion: opens complete, steps by hand; estimate figures unchanged.
    await tab('TIMELINE');
    const t0 = await state(page);
    const tStill = await stagePng(page);
    await page.waitForTimeout(800);
    const tStill2 = await stagePng(page);
    check(`${v}-R01`, `${name}: reduced motion — TIMELINE opens complete, holds still, never autoplays`, /TIMELINE:done/.test(t0.key) && (await delta(tStill, tStill2)) < 0.002, `${t0.key.split('|').pop()} · drift ${pct(await delta(tStill, tStill2))}`);
    await page.getByRole('button', { name: 'STAGE 02 DIRECTION' }).click();
    const t2 = await state(page);
    await snap('05a-timeline-stage-02');
    await page.getByRole('button', { name: 'NEXT STAGE' }).click();
    const t3 = await state(page);
    await snap('05b-timeline-stage-03');
    await page.getByRole('button', { name: 'PREVIOUS STAGE' }).click();
    const t4 = await state(page);
    check(`${v}-T01`, `${name}: TIMELINE steps stage by stage (current lit, later stages outlined)`, /TIMELINE:1$/.test(t2.key) && /TIMELINE:2$/.test(t3.key) && /TIMELINE:1$/.test(t4.key) && t2.lit > 0 && /02 · DIRECTION/.test(t2.callout ?? ''), `${t2.key.split('|').pop()} → ${t3.key.split('|').pop()} → ${t4.key.split('|').pop()} · ${t2.callout}`);
    const tl = await page.evaluate(() => ({
      lanes: [...document.querySelectorAll('.bs-lane__window')].map((el) => el.textContent.trim()),
      notice: document.querySelector('.bs-stagecard__notice')?.textContent ?? '',
      fine: document.querySelector('.bs-fineprint')?.textContent ?? '',
    }));
    check(`${v}-T02`, `${name}: TIMELINE keeps the canonical window and says it is not a schedule`, facts.length >= 2 && tl.lanes.includes(facts[0]) && /NOT A SCHEDULE/.test(tl.notice) && /not a quote and not a schedule/i.test(tl.fine), `facts ${facts.join(' / ')} · lanes ${tl.lanes.join(' / ')}`);

    // Layout at this viewport, in every section.
    const lay = [];
    for (const t of ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE']) {
      await tab(t);
      lay.push([t, await layout(page)]);
    }
    check(`${v}-L01`, `${name}: no sideways scroll, nothing clipped, tabs fit with 40px+ targets`, lay.every(([, l]) => l.overflowX <= 0 && l.clipped.length === 0 && l.tabsFit), lay.map(([t, l]) => `${t}:${l.overflowX}/${l.clipped.slice(0, 2).join('+') || '-'}/${l.tabsFit}`).join(' '));
    info(`${v}-L02`, `${name}: text under 7.8px / targets under 24px in the sections`, lay.map(([t, l]) => `${t}:${l.smallText}/${l.smallTargets} ${l.small.join(',')} ${l.targets.join(',')}`).join(' | '));
    check(`${v}-E01`, `${name}: no script errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  /* ── 2. Motion: the timeline plays, recorded as video (390×844) ── */
  if (want('motion')) {
    const ctx = await browser.newContext({ ...VIEWPORTS['390x844'], reducedMotion: 'no-preference', recordVideo: { dir: SEQ, size: { width: 390, height: 844 } } });
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await toBlueprint(page);
    const go = async (t) => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole('tab', { name: new RegExp(t) }).click();
    };
    await page.waitForTimeout(1500);
    await go('STRUCTURE');
    await page.waitForTimeout(1600);
    for (const l of ['L3', 'L4', 'L5']) {
      await page.getByRole('button', { name: new RegExp(`^${l}`) }).click();
      await page.waitForTimeout(1500);
    }
    await go('PAGES');
    await page.waitForTimeout(1400);
    for (const p of ['P06', 'P10']) {
      await page.getByRole('button', { name: new RegExp(`^${p}`) }).click();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1600);
    }
    await go('FEATURES');
    await page.waitForTimeout(1400);
    await page.getByRole('button', { name: /^SELL/ }).click();
    await page.waitForTimeout(1600);
    // TIMELINE: sample frames as it plays.
    await go('TIMELINE');
    const keys = [];
    const frames = [];
    const t0 = Date.now();
    while (Date.now() - t0 < 9500) {
      const k = await page.getAttribute('.bs-object.bs-stage', 'data-object-key');
      if (!keys.length || keys[keys.length - 1] !== k) keys.push(k);
      if (frames.length < 12) {
        const box = await page.locator('.bs-object.bs-stage').boundingBox();
        frames.push(await page.screenshot({ type: 'jpeg', quality: 80, clip: box }));
      }
      await page.waitForTimeout(650);
    }
    const order = keys.map((k) => k.split('|').pop());
    check('M01', '390×844 motion: TIMELINE plays itself stage by stage, then rests complete', order[0] === 'TIMELINE:0' && order.includes('TIMELINE:3') && order[order.length - 1] === 'TIMELINE:done', order.join(' → '));
    // Frame sheet: the model assembling.
    const metas = await Promise.all(frames.map((f) => sharp(f).metadata()));
    const w = metas[0].width;
    const h = metas[0].height;
    const cols = 4;
    const rows = Math.ceil(frames.length / cols);
    await sharp({ create: { width: cols * (w + 8), height: rows * (h + 8), channels: 3, background: '#2a2a2e' } })
      .composite(frames.map((f, i) => ({ input: f, left: (i % cols) * (w + 8), top: Math.floor(i / cols) * (h + 8) })))
      .jpeg({ quality: 78 })
      .toFile(path.join(SEQ, 'timeline-assembly-frames.jpg'));
    // Frame rate while it plays.
    await page.getByRole('button', { name: 'PLAY THE ASSEMBLY' }).click();
    const fps = await page.evaluate(
      () =>
        new Promise((resolve) => {
          let n = 0;
          const t = performance.now();
          const tick = () => {
            n += 1;
            if (performance.now() - t < 2000) requestAnimationFrame(tick);
            else resolve(Math.round(n / 2));
          };
          requestAnimationFrame(tick);
        }),
    );
    info('M02', '390×844 motion: page frame rate during assembly (software GL in this sandbox)', `${fps} fps`);
    const video = await page.video();
    await ctx.close();
    if (video) {
      const file = await video.path();
      fs.renameSync(file, path.join(SEQ, 'blueprint-immersive-walkthrough-390x844.webm'));
    }
  }

  /* ── 3. Layout at the other viewports ── */
  for (const name of ['393x852', '834x1194', '339x734 (text 115%)', '300x649 (text 130%)'].filter(() => want('layout'))) {
    const ctx = await browser.newContext({ ...VIEWPORTS[name], reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await toBlueprint(page);
    const lay = [];
    const file = name.split(' ')[0];
    for (const [i, t] of ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE'].entries()) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole('tab', { name: new RegExp(t) }).click();
      await page.waitForTimeout(900);
      if (t === 'PAGES') await page.getByRole('button', { name: /^P06/ }).click();
      if (t === 'FEATURES') await page.getByRole('button', { name: /^SELL/ }).click();
      if (t === 'STRUCTURE') await page.getByRole('button', { name: /^L3/ }).click();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(700);
      lay.push([t, await layout(page)]);
      await page.screenshot({ path: path.join(SHOTS, `${file}-0${i + 1}-${t.toLowerCase()}.jpg`), type: 'jpeg', quality: 80 });
    }
    check(`L-${name}`, `${name}: no sideways scroll, nothing clipped, tabs fit`, lay.every(([, l]) => l.overflowX <= 0 && l.clipped.length === 0 && l.tabsFit), lay.map(([t, l]) => `${t}:${l.overflowX}/${l.clipped.slice(0, 2).join('+') || '-'}/${l.tabsFit}`).join(' '));
    await ctx.close();
  }

  await browser.close();
  // Merge this part's results into the suite file (a part replaces its own earlier rows).
  const file = path.join(OUT, 'immersive-results.json');
  const prior = fs.existsSync(file) && PART !== 'all' ? JSON.parse(fs.readFileSync(file, 'utf8')) : { parts: {} };
  prior.parts = { ...(prior.parts || {}), [PART]: { ranAt: new Date().toISOString(), results } };
  const all = Object.values(prior.parts).flatMap((p) => p.results);
  prior.base = BASE;
  prior.summary = `${all.filter((r) => r.result === 'PASS').length}/${all.filter((r) => r.result !== 'INFO').length} PASS`;
  fs.writeFileSync(file, JSON.stringify(prior, null, 2));
  const failed = results.filter((r) => r.result === 'FAIL').length;
  const passed = results.filter((r) => r.result === 'PASS').length;
  console.log(`${passed}/${passed + failed} PASS`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
