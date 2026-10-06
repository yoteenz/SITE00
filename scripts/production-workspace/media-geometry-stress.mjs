#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 — media geometry stress test (live browser).
 *
 * Mounts role-declared media (attributes from the real workspaceMediaAttrs) inside a real EXPRESSION family grid
 * (real density + family CSS, real content-driven panel modes) and feeds it hostile sources, generated in-page
 * (no network, no paid generation):
 *
 *   very tall portrait · very wide landscape · square · transparent logo · tiny source · 4K source · UI screenshot ·
 *   document · authority board · face near the top edge · face near the bottom edge · missing · broken
 *
 * at every scale (CHIP in a row · TILE in a portrait / reference grid · PREVIEW in an authority / media-lead panel)
 * and every QA width. Per case it measures what the viewer sees of the source (same window math as the audit) and
 * asserts the role contract: no-crop roles keep the whole source, focal-safe roles keep their protected region,
 * nothing is distorted, the panel contains its media (grows instead of clipping), the slot holds its size before the
 * source loads and when it fails, and nothing scrolls horizontally.
 *
 *   BASE=http://127.0.0.1:5174 OUT=<dir> npx tsx scripts/production-workspace/media-geometry-stress.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { VIEWPORTS } from './media-geometry-routes.mjs';
import { workspaceMediaAttrs } from '../../src/site00/components/productionAuthority/WorkspaceMediaSlot.tsx';
import { WORKSPACE_INTENTIONAL_CROPS, WORKSPACE_MEDIA_ROLES, workspaceCropGuard } from '../../src/site00/config/production-workspace-media.ts';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5174';
const OUT = process.env.OUT ?? 'media-geometry-stress';
mkdirSync(OUT, { recursive: true });

/** source kind → [w, h, painter, role, focal] — the role a reviewer would give that asset */
const SOURCES = {
  very_tall_portrait: [400, 2400, 'face', 'PORTRAIT', 'face'],
  very_wide_landscape: [4200, 900, 'scene', 'LANDSCAPE_EDITORIAL', 'subject'],
  square: [900, 900, 'scene', 'LANDSCAPE_EDITORIAL', 'subject'],
  transparent_logo: [600, 200, 'logo', 'LOGO_MARK', 'center'],
  tiny_source: [24, 18, 'scene', 'REFERENCE_AUTHORITY', 'center'],
  source_4k: [3840, 2160, 'scene', 'REFERENCE_AUTHORITY', 'center'],
  ui_screenshot: [1179, 2556, 'ui', 'UI_SCREENSHOT', 'top'],
  document: [1700, 2200, 'doc', 'DOCUMENT_PREVIEW', 'top'],
  authority_board: [2000, 1200, 'board', 'REFERENCE_AUTHORITY', 'center'],
  face_near_top: [800, 1000, 'face_top', 'PORTRAIT', { x: 0.5, y: 0.08, w: 0.36, h: 0.16 }],
  face_near_bottom: [800, 1000, 'face_bottom', 'PORTRAIT', { x: 0.5, y: 0.86, w: 0.36, h: 0.2 }],
  missing: [0, 0, 'none', 'REFERENCE_AUTHORITY', 'center'],
  broken: [0, 0, 'broken', 'REFERENCE_AUTHORITY', 'center'],
};
/** scale → panel mode + slot + crop class a call site would use */
const SCALES = {
  CHIP: { mode: 'MEDIA_INLINE', slot: 'ROW_THUMB' },
  TILE: { mode: 'REFERENCE_FRAME', slot: 'CARD_MEDIA' },
  PREVIEW: { mode: 'AUTHORITY_PREVIEW', slot: 'CARD_MEDIA' },
};
const cropFor = (role, scale) => {
  const def = WORKSPACE_MEDIA_ROLES[role];
  if (def.crop === 'NONE' || def.crop === 'CROP_SAFE') return role === 'REFERENCE_AUTHORITY' && scale === 'CHIP' ? 'NODE_ART_CHIP' : undefined;
  return WORKSPACE_INTENTIONAL_CROPS.find((c) => c.role === role && c.where.length === 0 && c.scales.includes(scale))?.id;
};

const CASES = [];
for (const [kind, [w, h, paint, role, focal]] of Object.entries(SOURCES)) {
  for (const scale of Object.keys(SCALES)) {
    const crop = cropFor(role, scale);
    const fit = scale === 'CHIP' && crop ? 'THUMBNAIL_COVER' : role === 'PORTRAIT' ? 'PORTRAIT_COVER' : undefined;
    const attrs = workspaceMediaAttrs({ role, scale, slot: SCALES[scale].slot, focal, crop, fit, aspect: scale === 'PREVIEW' && w ? `${w} / ${h}` : role === 'PORTRAIT' ? 'ACTOR_HEADSHOT' : scale === 'TILE' ? '16 / 10' : undefined });
    const { style, ...data } = attrs;
    CASES.push({ id: `${kind}:${scale}`, kind, w, h, paint, role, scale, mode: SCALES[scale].mode, data, style: style ?? {}, crop: crop ?? null });
  }
}

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium' });
const report = { sprint: 'P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2', sources: Object.keys(SOURCES), scales: Object.keys(SCALES), viewports: {}, totals: {} };

for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('site00-immersive-complete', '1');
    } catch {
      /* ignore */
    }
  });
  await page.goto(`${BASE}/production`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    history.pushState({}, '', '/production/ndxbook/expression/casting');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForSelector('.exf-grid', { timeout: 20000 });
  await page.waitForTimeout(1200);
  const results = await page.evaluate(async ({ cases, crops, roles, guardSrc }) => {
    // the runtime crop guard (pure function from the contract), applied exactly as useWorkspaceCropGuard does
    const cropGuard = new Function(`return (${guardSrc})`)();
    const applyGuard = (img) => {
      const slot = img.closest('[data-media-guard]');
      if (!slot || !img.naturalWidth || !img.clientWidth || !img.clientHeight) return;
      const [min, keep] = slot.dataset.mediaGuard.split(' ');
      const region = slot.dataset.mediaFocalRegion?.split(' ').map(Number);
      const [px = 0.5, py = 0.5] = getComputedStyle(img).objectPosition.split(/\s+/).map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : 0.5));
      const v = cropGuard({ boxAspect: img.clientWidth / img.clientHeight, sourceAspect: img.naturalWidth / img.naturalHeight, position: [px, py], minVisible: Number(min) || 0, region: region?.length === 4 ? region : null, keep });
      if (v === 'contain') img.dataset.cropGuard = 'contain';
      else delete img.dataset.cropGuard;
    };
    const paint = (w, h, kind) => {
      const c = document.createElement('canvas');
      const s = Math.min(1, 1600 / Math.max(w, h));
      c.width = Math.max(1, Math.round(w * s));
      c.height = Math.max(1, Math.round(h * s));
      const g = c.getContext('2d');
      const W = c.width;
      const H = c.height;
      if (kind === 'logo') {
        g.clearRect(0, 0, W, H);
        g.fillStyle = '#e5231b';
        g.fillRect(W * 0.04, H * 0.1, W * 0.92, H * 0.8);
      } else if (kind === 'ui' || kind === 'doc') {
        g.fillStyle = kind === 'ui' ? '#f4f4f6' : '#fffef9';
        g.fillRect(0, 0, W, H);
        g.fillStyle = '#e5231b';
        g.fillRect(0, 0, W, H * 0.06); // nav / header band — must stay visible
        g.fillRect(0, H * 0.94, W, H * 0.06); // footer band
      } else {
        const grad = g.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#2a2a2e');
        grad.addColorStop(1, '#9a9aa2');
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);
        g.fillStyle = '#e5231b';
        const fy = kind === 'face_top' ? 0.08 : kind === 'face_bottom' ? 0.86 : kind === 'face' ? 0.3 : 0.45;
        g.beginPath();
        g.arc(W / 2, H * fy, Math.min(W, H) * 0.1, 0, Math.PI * 2);
        g.fill();
      }
      return c.toDataURL('image/png');
    };
    const grid = document.querySelector('.exf-grid');
    const host = document.createElement('section');
    host.className = 'exf-panel';
    host.style.cssText = 'grid-column: 1 / -1;';
    grid.prepend(host);
    const out = [];
    for (const k of cases) {
      host.innerHTML = '';
      host.setAttribute('data-panel-media', k.mode);
      host.removeAttribute('style');
      host.style.gridColumn = '1 / -1';
      const head = document.createElement('header');
      head.className = 'exf-panel__head';
      head.innerHTML = `<h3><i></i>${k.id}</h3>`;
      const body = document.createElement('div');
      body.className = 'exf-panel__body';
      host.append(head, body);
      let holder = body;
      if (k.scale === 'TILE') {
        holder = document.createElement('div');
        holder.className = 'exf-frames';
        body.append(holder);
      } else if (k.scale === 'CHIP') {
        holder = document.createElement('div');
        holder.className = 'exf-row';
        body.append(holder);
      }
      const slot = document.createElement('span');
      slot.className = `exf-img${k.scale === 'PREVIEW' ? ' exf-fill' : k.scale === 'CHIP' ? ' exf-face' : ''}`;
      for (const [a, v] of Object.entries(k.data)) slot.setAttribute(a, v);
      for (const [a, v] of Object.entries(k.style)) slot.style.setProperty(a, v);
      const wrap = document.createElement('span');
      wrap.className = 'ph-img';
      slot.append(wrap);
      if (k.scale === 'TILE') {
        const btn = document.createElement('button');
        btn.className = 'exf-frame';
        btn.append(slot);
        btn.insertAdjacentHTML('beforeend', '<small>F01</small>');
        holder.append(btn);
      } else holder.append(slot);
      if (k.scale === 'CHIP') holder.insertAdjacentHTML('beforeend', '<span class="exf-row__text"><b>ROW TITLE</b><small>META</small></span>');
      // slot size BEFORE the source exists (loading state must already hold the final box)
      const pre = slot.getBoundingClientRect();
      let img = null;
      if (k.paint === 'none') {
        wrap.className = 'ph-img ph-img--slot';
        wrap.setAttribute('data-asset-state', 'missing');
        wrap.innerHTML = '<span class="ph-slot__label">MISSING</span>';
      } else {
        img = document.createElement('img');
        img.alt = '';
        img.src = k.paint === 'broken' ? '/__missing__/broken.webp' : paint(k.w, k.h, k.paint);
        wrap.append(img);
        await new Promise((res) => {
          img.onload = img.onerror = res;
          setTimeout(res, 2000);
        });
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (img) applyGuard(img);
      await new Promise((r) => requestAnimationFrame(r));
      const P = slot.getBoundingClientRect();
      const H = host.getBoundingClientRect();
      const res = { id: k.id, role: k.role, scale: k.scale, crop: k.crop, box: [Math.round(P.width), Math.round(P.height)], issues: [] };
      if (pre.height < 1 || Math.abs(pre.height - P.height) > 1.5 || Math.abs(pre.width - P.width) > 1.5) res.issues.push(`LAYOUT_SHIFT ${Math.round(pre.width)}x${Math.round(pre.height)}→${Math.round(P.width)}x${Math.round(P.height)}`);
      if (P.width < 1 || P.height < 1) res.issues.push('COLLAPSED');
      if (P.bottom > H.bottom + 1 || P.right > H.right + 1) res.issues.push('PANEL_OVERFLOW');
      if (document.documentElement.scrollWidth > innerWidth + 1) res.issues.push('HORIZONTAL_SCROLL');
      if (img && img.naturalWidth) {
        const cs = getComputedStyle(img);
        const bw = img.clientWidth;
        const bh = img.clientHeight;
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        const fit = cs.objectFit;
        const s = fit === 'cover' ? Math.max(bw / nw, bh / nh) : fit === 'contain' ? Math.min(bw / nw, bh / nh) : null;
        const iw = s ? nw * s : bw;
        const ih = s ? nh * s : bh;
        if (Math.abs(iw / ih / (nw / nh) - 1) > 0.03) res.issues.push('DISTORTION');
        const [px, py] = cs.objectPosition.split(/\s+/).map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : 0.5));
        const ox = (bw - iw) * px;
        const oy = (bh - ih) * py;
        const win = { x0: Math.max(0, -ox / iw), x1: Math.min(1, (bw - ox) / iw), y0: Math.max(0, -oy / ih), y1: Math.min(1, (bh - oy) / ih) };
        const vx = win.x1 - win.x0;
        const vy = win.y1 - win.y0;
        res.fit = fit;
        res.guard = img.dataset.cropGuard ?? null;
        res.visible = [Math.round(vx * 1000) / 1000, Math.round(vy * 1000) / 1000];
        const def = roles[k.role];
        const entry = crops.find((c) => c.id === k.crop);
        if (Math.min(vx, vy) < 0.985) {
          if (def.crop === 'NONE') res.issues.push('CROP_FORBIDDEN');
          else if (!entry) res.issues.push('CROP_UNREGISTERED');
          else if (Math.min(vx, vy) < entry.minVisibleAxis - 0.005) res.issues.push('CROP_OUT_OF_BOUNDS');
          const region = slot.getAttribute('data-media-focal-region')?.split(' ').map(Number);
          if (entry && entry.focal !== 'NONE' && region) {
            const [x0, y0, x1, y1] = region;
            const t = 0.03;
            const ok = entry.focal === 'REGION' ? x0 >= win.x0 - t && x1 <= win.x1 + t && y0 >= win.y0 - t && y1 <= win.y1 + t : (x0 + x1) / 2 >= win.x0 && (x0 + x1) / 2 <= win.x1 && (y0 + y1) / 2 >= win.y0 && (y0 + y1) / 2 <= win.y1;
            if (!ok) res.issues.push('FOCAL_FAIL');
          }
        }
      }
      if (k.paint === 'broken' && img && img.naturalWidth === 0 && P.height < 1) res.issues.push('BROKEN_COLLAPSE');
      out.push(res);
    }
    host.remove();
    return out;
  }, { cases: CASES, crops: WORKSPACE_INTENTIONAL_CROPS, roles: WORKSPACE_MEDIA_ROLES, guardSrc: workspaceCropGuard.toString() });
  const fail = results.filter((r) => r.issues.length);
  report.viewports[vpName] = { width: vp.width, cases: results.length, pass: results.length - fail.length, failures: fail, results };
  console.log(`${vpName.padEnd(8)} ${results.length - fail.length}/${results.length}${fail.length ? `  ${fail.map((f) => `${f.id} ${f.issues.join('+')}`).join(' · ')}` : ''}`);
  await page.close();
}
await browser.close();
const all = Object.values(report.viewports);
report.totals = { cases: all.reduce((n, v) => n + v.cases, 0), pass: all.reduce((n, v) => n + v.pass, 0) };
writeFileSync(`${OUT}/media-stress.json`, JSON.stringify(report, null, 1));
console.log(`TOTAL ${report.totals.pass}/${report.totals.cases}`);
