#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — media stress test (live browser).
 *
 * Mounts WorkspacePanel / WorkspaceMediaSlot markup INSIDE the real production frame (so the real density CSS
 * applies) and feeds every slot very different sources: 1:1, 4:5, 3:4, 16:9, 21:9, very tall, very large,
 * transparent logo, UI screenshot, missing and broken — plus long title / long metadata. Verifies, per case:
 * slot box independent of the source, declared fit applied (cover / contain), focal applied, no distortion,
 * no panel overflow, no horizontal scroll, text inside its zone, narrow panels stack.
 *
 *   BASE=http://127.0.0.1:5174 OUT=<dir> node scripts/production-workspace/density-media-stress.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { VIEWPORTS } from './density-routes.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5174';
const OUT = process.env.OUT ?? 'density-media-stress';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium' });
const report = { sprint: 'P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1', families: {} };

for (const family of ['mobile', 'tablet', 'desktop']) {
  const vp = VIEWPORTS[family];
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: family === 'mobile' ? 2 : 1 });
  await page.goto(`${BASE}/production/libraries`, { waitUntil: 'load' });
  await page.waitForSelector('[data-testid="production-authority-frame"]', { timeout: 30000 });
  await page.waitForTimeout(1500);

  const result = await page.evaluate(async (family) => {
    // ---------- sources (generated in-page: no network, no paid generation)
    const make = (w, h, kind) => {
      const c = document.createElement('canvas');
      const scale = Math.min(1, 1600 / Math.max(w, h)); // canvas budget; natural ratio preserved
      c.width = Math.round(w * scale);
      c.height = Math.round(h * scale);
      const g = c.getContext('2d');
      if (kind === 'logo') {
        g.clearRect(0, 0, c.width, c.height);
        g.fillStyle = '#e5231b';
        g.beginPath();
        g.moveTo(c.width * 0.08, c.height * 0.85);
        g.lineTo(c.width * 0.2, c.height * 0.15);
        g.lineTo(c.width * 0.32, c.height * 0.85);
        g.fill();
        g.fillStyle = '#111114';
        g.fillRect(c.width * 0.4, c.height * 0.3, c.width * 0.52, c.height * 0.4);
      } else if (kind === 'ui') {
        g.fillStyle = '#f4f4f6';
        g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = '#e5231b';
        g.fillRect(0, 0, c.width, c.height * 0.06); // nav band (must stay visible)
        g.fillStyle = '#111114';
        g.fillRect(c.width * 0.08, c.height * 0.09, c.width * 0.6, c.height * 0.03); // title band
      } else {
        const grad = g.createLinearGradient(0, 0, c.width, c.height);
        grad.addColorStop(0, '#2a2a2e');
        grad.addColorStop(1, '#9a9aa2');
        g.fillStyle = grad;
        g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = '#e5231b'; // "subject" in the upper third
        g.beginPath();
        g.arc(c.width / 2, c.height * 0.25, Math.min(c.width, c.height) * 0.12, 0, Math.PI * 2);
        g.fill();
      }
      return { src: c.toDataURL('image/png'), w: c.width, h: c.height };
    };
    const SRC = {
      square_1x1: make(800, 800),
      portrait_4x5: make(800, 1000),
      portrait_3x4: make(750, 1000),
      landscape_16x9: make(1600, 900),
      wide_21x9: make(2100, 900),
      very_tall: make(400, 2400),
      very_large: make(6000, 4000),
      transparent_logo: make(600, 200, 'logo'),
      ui_screenshot: make(1179, 2556, 'ui'),
    };
    const host = document.querySelector('[data-testid="production-authority-frame"] .pxa-body');
    const stage = document.createElement('div');
    stage.id = 'pwk-stress';
    stage.style.cssText = 'display:grid;gap:8px;padding:8px;background:#f4f4f6';
    host.prepend(stage);
    document.querySelector('[data-testid="production-authority-scroll"]').scrollTop = 0;

    const LONG_TITLE = 'ENTRY 002 — EXTREMELY LONG PANEL TITLE THAT KEEPS GOING TO TEST WRAP AND CLAMP BEHAVIOUR IN NARROW PANELS';
    const LONG_META = 'SOURCE: STUDIO WORLD · FILE: ndxbook_entry002_storyboard_frame_final_v12_approved_for_publish_master.png · 7 SCENES';
    const media = (slot, fit, srcKey, focal) => {
      const s = srcKey === 'missing' ? null : srcKey === 'broken' ? '/__does-not-exist__.png' : SRC[srcKey].src;
      const style = focal ? ` style="--pw-focal:${focal}"` : '';
      return s ?
          `<span class="pw-media pwk-panel__media" data-media-slot="${slot}" data-media-fit="${fit}"${style} data-media-state="filled"><img src="${s}" alt=""></span>`
        : `<span class="pw-media pwk-panel__media" data-media-slot="${slot}" data-media-fit="${fit}" data-media-state="missing"><span class="ph-img ph-img--slot" data-asset-state="missing"><span class="ph-slot__corners"></span><span class="ph-slot__label">NO ASSET</span></span></span>`;
    };
    const panel = (id, layout, slot, fit, srcKey, { title = 'PANEL TITLE', meta = 'META · VALUE', focal, width } = {}) => {
      const wrap = document.createElement('div');
      wrap.dataset.case = id;
      if (width) wrap.style.width = `${width}px`;
      wrap.innerHTML = `<section class="pwk-panel" data-panel-layout="${layout}"><div class="pwk-panel__grid">${media(slot, fit, srcKey, focal)}${
        layout === 'MEDIA_ONLY_PREVIEW' ? '' : `<div class="pwk-panel__text"><h3 class="pwk-panel__title">${title}</h3><p class="pwk-panel__meta">${meta}</p></div>`
      }</div></section>`;
      stage.append(wrap);
      return wrap;
    };

    const sources = [...Object.keys(SRC), 'missing', 'broken'];
    const cases = [];
    for (const s of sources) {
      cases.push({ id: `row-thumb/${s}`, group: 'ROW_THUMB', el: panel(`row-thumb/${s}`, 'THUMBNAIL_INLINE', 'ROW_THUMB', 'THUMBNAIL_COVER', s) });
      cases.push({ id: `feature/${s}`, group: 'FEATURE_MEDIA', el: panel(`feature/${s}`, 'MEDIA_LEFT_TEXT_RIGHT', 'FEATURE_MEDIA', 'LANDSCAPE_COVER', s, { title: LONG_TITLE, meta: LONG_META }) });
      cases.push({ id: `card/${s}`, group: 'CARD_MEDIA', el: panel(`card/${s}`, 'MEDIA_TOP_TEXT_BOTTOM', 'CARD_MEDIA', 'LANDSCAPE_COVER', s, { title: LONG_TITLE }) });
    }
    for (const s of ['portrait_4x5', 'portrait_3x4', 'square_1x1', 'very_tall'])
      cases.push({ id: `portrait/${s}`, group: 'PORTRAIT', el: panel(`portrait/${s}`, 'MEDIA_TOP_TEXT_BOTTOM', 'PORTRAIT', 'PORTRAIT_COVER', s) });
    cases.push({ id: 'logo/transparent_logo', group: 'LOGO_MARK', el: panel('logo/transparent_logo', 'METADATA_WITH_SMALL_THUMBNAIL', 'LOGO_MARK', 'LOGO_CONTAIN', 'transparent_logo') });
    cases.push({ id: 'ui/ui_screenshot', group: 'UI_CAPTURE', el: panel('ui/ui_screenshot', 'MEDIA_TOP_TEXT_BOTTOM', 'UI_CAPTURE', 'UI_CAPTURE_CONTAIN', 'ui_screenshot') });
    cases.push({ id: 'document/portrait_3x4', group: 'DOCUMENT', el: panel('document/portrait_3x4', 'MEDIA_TOP_TEXT_BOTTOM', 'DOCUMENT', 'DOCUMENT_PREVIEW_CONTAIN', 'portrait_3x4') });
    cases.push({ id: 'hero/wide_21x9', group: 'HERO_PLATE', el: panel('hero/wide_21x9', 'FULL_BLEED_MEDIA_WITH_OVERLAY', 'HERO_PLATE', 'WIDE_SCENE_COVER', 'wide_21x9', { focal: '30% 40%' }) });
    cases.push({ id: 'stack/narrow-feature', group: 'STACK', el: panel('stack/narrow-feature', 'MEDIA_LEFT_TEXT_RIGHT', 'FEATURE_MEDIA', 'LANDSCAPE_COVER', 'landscape_16x9', { title: LONG_TITLE, meta: LONG_META, width: 240 }) });
    // standalone primitive (no panel): the mobile slot geometry defaults, including the aspect-preserving caps
    if (family === 'mobile') {
      const PRIM = { STRIP_THUMB: 'LANDSCAPE_COVER', CARD_MEDIA: 'LANDSCAPE_COVER', FEATURE_MEDIA: 'LANDSCAPE_COVER', PORTRAIT: 'PORTRAIT_COVER', DOCUMENT: 'DOCUMENT_PREVIEW_CONTAIN', UI_CAPTURE: 'UI_CAPTURE_CONTAIN', ROW_THUMB: 'THUMBNAIL_COVER' };
      for (const [slot, fit] of Object.entries(PRIM))
        for (const s of ['landscape_16x9', 'very_tall', 'missing']) {
          const wrap = document.createElement('div');
          wrap.dataset.case = `primitive/${slot}/${s}`;
          wrap.innerHTML = media(slot, fit, s).replace(" pwk-panel__media", "");
          stage.append(wrap);
          cases.push({ id: `primitive/${slot}/${s}`, group: `PRIMITIVE_${slot}`, el: wrap });
        }
    }

    // wait for every image to settle (load or error)
    await Promise.all(
      [...stage.querySelectorAll('img')].map((im) => (im.complete ? 0 : new Promise((r) => ((im.onload = r), (im.onerror = r), setTimeout(r, 5000))))),
    );
    await new Promise((r) => setTimeout(r, 300));

    const W = window.innerWidth;
    const rows = cases.map(({ id, group, el }) => {
      const sec = el.querySelector('.pwk-panel') ?? el;
      const slot = el.querySelector('.pw-media');
      const img = slot.querySelector('img');
      const text = el.querySelector('.pwk-panel__text');
      const title = el.querySelector('.pwk-panel__title');
      const sb = slot.getBoundingClientRect();
      const pb = sec.getBoundingClientRect();
      const cs = img ? getComputedStyle(img) : null;
      const ib = img?.getBoundingClientRect();
      const nat = img && img.naturalWidth ? { w: img.naturalWidth, h: img.naturalHeight } : null;
      // displayed content box of a contain fit (to prove nothing is cropped)
      let containCropped = null;
      if (cs && cs.objectFit === 'contain' && nat) {
        const k = Math.min(ib.width / nat.w, ib.height / nat.h);
        containCropped = nat.w * k > ib.width + 0.5 || nat.h * k > ib.height + 0.5;
      }
      const tb = text?.getBoundingClientRect();
      const ttb = title?.getBoundingClientRect();
      const gridEl = el.querySelector('.pwk-panel__grid');
      const grid = gridEl ? getComputedStyle(gridEl).gridTemplateColumns.split(' ').length : null;
      const ASPECT = { ROW_THUMB: 1, LOGO_MARK: 1, STRIP_THUMB: 16 / 10, CARD_MEDIA: 16 / 9, FEATURE_MEDIA: 3 / 2, PORTRAIT: 4 / 5, DOCUMENT: 3 / 4, UI_CAPTURE: 9 / 16, HERO_PLATE: 1125 / 315 };
      const slotType = slot.dataset.mediaSlot;
      const declaredAspect = ASPECT[slotType] ?? null;
      const renderedAspect = sb.width / Math.max(1, sb.height);
      return {
        id,
        group,
        slotType,
        slot: { w: Math.round(sb.width * 10) / 10, h: Math.round(sb.height * 10) / 10 },
        declaredAspect: declaredAspect && Math.round(declaredAspect * 1000) / 1000,
        renderedAspect: Math.round(renderedAspect * 1000) / 1000,
        aspectHeld: declaredAspect ? Math.abs(renderedAspect - declaredAspect) / declaredAspect <= 0.03 : null,
        missingLabelClipped: (() => {
          const lab = slot.querySelector('[data-asset-state="missing"] .ph-slot__label');
          if (!lab || getComputedStyle(lab).display === 'none') return false;
          const lb = lab.getBoundingClientRect();
          return lab.scrollWidth > lab.clientWidth + 1 || lab.scrollHeight > lab.clientHeight + 1 || lb.left < sb.left - 0.5 || lb.right > sb.right + 0.5 || lb.top < sb.top - 0.5 || lb.bottom > sb.bottom + 0.5;
        })(),
        panel: { w: Math.round(pb.width), h: Math.round(pb.height) },
        natural: nat,
        state: slot.dataset.mediaState,
        fit: cs?.objectFit ?? null,
        focal: cs?.objectPosition ?? null,
        imgFillsSlot: img ? Math.abs(ib.width - sb.width) < 1 && Math.abs(ib.height - sb.height) < 1 : null,
        distorted: cs ? cs.objectFit === 'fill' && nat && Math.abs(ib.width / ib.height - nat.w / nat.h) / (nat.w / nat.h) > 0.02 : false,
        containCropped,
        panelOverflow: sec.scrollWidth > sec.clientWidth + 1,
        slotOutsidePanel: sb.left < pb.left - 0.5 || sb.right > pb.right + 0.5,
        textOutsidePanel: tb ? tb.right > pb.right + 0.5 || tb.left < pb.left - 0.5 : false,
        titleCollidesMedia: ttb && group !== 'HERO_PLATE' ? !(ttb.top >= sb.bottom - 0.5 || ttb.left >= sb.right - 0.5 || ttb.bottom <= sb.top + 0.5) : false,
        columns: grid,
        viewportOverflow: pb.right > W + 1,
      };
    });
    const docOverflowX = document.documentElement.scrollWidth > W + 1;
    return { rows, docOverflowX, viewport: W };
  }, family);

  // per-group source independence: every source in a group renders the same slot box
  const groups = {};
  for (const r of result.rows) (groups[r.group] ??= []).push(r);
  const independence = Object.fromEntries(
    Object.entries(groups).map(([g, rs]) => {
      const ws = rs.map((r) => r.slot.w);
      const hs = rs.map((r) => r.slot.h);
      return [g, { cases: rs.length, slotW: [Math.min(...ws), Math.max(...ws)], slotH: [Math.min(...hs), Math.max(...hs)], stable: Math.max(...ws) - Math.min(...ws) < 1 && Math.max(...hs) - Math.min(...hs) < 1 }];
    }),
  );
  const fails = [];
  for (const r of result.rows) {
    if (r.distorted) fails.push(`${r.id}: distorted`);
    if (r.containCropped) fails.push(`${r.id}: contain cropped`);
    if (r.panelOverflow) fails.push(`${r.id}: panel overflow`);
    if (r.slotOutsidePanel) fails.push(`${r.id}: slot outside panel`);
    if (r.textOutsidePanel) fails.push(`${r.id}: text outside panel`);
    if (r.titleCollidesMedia) fails.push(`${r.id}: title collides with media`);
    if (r.viewportOverflow) fails.push(`${r.id}: viewport overflow`);
    if (r.imgFillsSlot === false) fails.push(`${r.id}: image does not fill its slot`);
    if (r.slot.w < 1 || r.slot.h < 1) fails.push(`${r.id}: slot collapsed`);
    if (r.missingLabelClipped) fails.push(`${r.id}: missing-state label clipped`);
    if (r.aspectHeld === false) fails.push(`${r.id}: frame aspect ${r.renderedAspect} ≠ declared ${r.declaredAspect} (crushed)`);
  }
  for (const [g, v] of Object.entries(independence)) if (!v.stable && g !== 'STACK') fails.push(`${g}: slot size depends on the source`);
  const stack = result.rows.find((r) => r.id === 'stack/narrow-feature');
  if (stack && stack.columns !== 1) fails.push('narrow MEDIA_LEFT_TEXT_RIGHT did not stack');
  const portrait = result.rows.filter((r) => r.group === 'PORTRAIT' && r.focal);
  for (const p of portrait) if (!/22%/.test(p.focal)) fails.push(`${p.id}: portrait focal not upper-third (${p.focal})`);
  const ui = result.rows.find((r) => r.id === 'ui/ui_screenshot');
  if (ui && (ui.fit !== 'contain' || !/ 0%|top/.test(ui.focal ?? ''))) fails.push(`ui capture fit/focal ${ui.fit} ${ui.focal}`);
  const logo = result.rows.find((r) => r.id === 'logo/transparent_logo');
  if (logo && logo.fit !== 'contain') fails.push('logo not contain');
  const hero = result.rows.find((r) => r.id === 'hero/wide_21x9');
  if (hero && !/30% 40%/.test(hero.focal ?? '')) fails.push(`hero focal metadata ignored (${hero.focal})`);
  if (result.docOverflowX) fails.push('document horizontal overflow');

  // the frame scrolls internally: grow the viewport to the stage so the capture holds every case (geometry is
  // already measured above at the real viewport; the capture is the visual record)
  const stageH = await page.evaluate(() => document.getElementById('pwk-stress').getBoundingClientRect().height);
  await page.setViewportSize({ width: vp.width, height: Math.min(14000, Math.ceil(stageH) + 260) });
  await page.waitForTimeout(400);
  await page.locator('#pwk-stress').screenshot({ path: `${OUT}/media-stress-${family}.png` });
  report.families[family] = { viewport: result.viewport, cases: result.rows.length, independence, fails, pass: fails.length === 0, rows: result.rows };
  console.log(`${family.padEnd(8)} cases=${result.rows.length} fails=${fails.length} ${fails.slice(0, 4).join(' | ')}`);
  await page.close();
}
await browser.close();
report.pass = Object.values(report.families).every((f) => f.pass);
writeFileSync(`${OUT}/SITE00_WORKSPACE_MEDIA_STRESS_TEST.json`, JSON.stringify(report, null, 2));
