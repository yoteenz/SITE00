/**
 * GLOBAL JURNL INTERACTIVE-TEXT CONTAINMENT QA.
 * Every clickable label on every live JURNL route (F01, F02, F03, F04, F05–F16 parents) and its overlays, at
 * 393×852 / 834×1194 / 1440×900, read from the REAL runtime. Per label:
 *   single_line_expected · actual_line_count · font_size · tracking · available_width · measured (single-line) width
 *   environment_overlap · underline / rule width vs the text footprint · rule alignment · tap target · controlled wrap
 * A failure is classed INTERACTIVE_TEXT_CONTAINMENT_DRIFT.
 * Usage: node scripts/jurnl/interactive-text-qa.mjs <baseUrl> <out.json> [viewports] [filter]
 */
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { CAPTURES as F02_CAPTURES, VIEWPORTS } from './capture-f02.mjs';
import { edgeX } from './f02-plate-edges.mjs';
import { qaChromiumPath } from './qa-env.mjs';

const F01 = [
  ['F01.00', 'entry'],
  ['F01.01', 'entry/create'],
  ['F01.01.TERMS', 'entry/create?overlay=terms'],
  ['F01.01.PRIVACY', 'entry/create?overlay=privacy-policy'],
  ['F01.01.APPLE', 'entry/create?overlay=social-apple'],
  ['F01.02', 'entry/verify-email'],
  ['F01.02.MAIL', 'entry/verify-email?overlay=mail'],
  ['F01.02.CHANGE', 'entry/verify-email?overlay=change-email'],
  ['F01.03', 'entry/sign-in'],
  ['F01.03.LOCKED', 'entry/sign-in?overlay=locked'],
  ['F01.03.SUPPORT', 'entry/sign-in?overlay=support'],
  ['F01.04', 'entry/unlock'],
  ['F01.04.FACEID', 'entry/unlock?overlay=faceid-unlock'],
  ['F01.04.PASSWORD', 'entry/unlock?overlay=use-password'],
  ['F01.04.SWITCH', 'entry/unlock?overlay=switch-account'],
  ['F01.04.SIGNOUT', 'entry/unlock?overlay=sign-out'],
  ['F01.05', 'entry/forgot-password'],
  ['F01.06', 'entry/reset-sent'],
  ['F01.07', 'entry/new-password'],
  ['F01.08', 'entry/reset-success'],
  ['F01.09', 'entry/biometric'],
  ['F01.09.ENABLE', 'entry/biometric?overlay=faceid-enable'],
  ['F01.09.DENIED', 'entry/biometric?overlay=biometric-denied'],
  ['F01.10', 'entry/device-trust'],
  ['F01.10.LEARN', 'entry/device-trust?overlay=device-learn'],
  ['F01.11', 'entry/privacy'],
  ['F01.11.DELETE', 'entry/privacy?overlay=delete-account'],
  ['F01.12', 'entry/security'],
  ['F01.12.REVOKE', 'entry/security?overlay=revoke-session'],
  ['F01.13', 'entry/complete'],
];
const HOME = [
  ['F03.00', 'today'],
  ['F03.00.WHY', 'today?overlay=see-why'],
  ['F03.00.ADD', 'today?overlay=quick-add'],
  ['F03.00.ASK', 'today?overlay=ask'],
  ['F04.00', 'activity'],
  ['F04.00.FILTER', 'activity?overlay=filter'],
  ['F04.00.DETAIL', 'activity?overlay=detail'],
];
const PARENTS = ['money', 'income', 'upcoming', 'plan', 'safe', 'purchases', 'trips', 'credit', 'paydown', 'goals', 'ahead', 'records'].map((r) => [`PARENT.${r.toUpperCase()}`, r]);
export const VIEWS = [
  ...F01.map(([id, r]) => ['F01', id, r]),
  ...F02_CAPTURES.map(([id, r, q]) => ['F02', id, q ? `${r}?${q}` : r]),
  ...HOME.map(([id, r]) => [id.slice(0, 3), id, r]),
  ['PARENTS', 'PARENT.BOARD', 'parents'],
  ...PARENTS.map(([id, r]) => ['PARENTS', id, r]),
];

/** Clearance a label must keep from a traced F02 plate edge (type, not boxes). */
const ENV_CLEARANCE = { mobile: 28, tablet: 44, desktop: 60 };

async function collect(page) {
  return page.evaluate(() => {
    const SEL = 'button, a[href], [role="button"], [role="link"], [role="radio"], [role="checkbox"], [role="switch"], [role="tab"], [role="menuitem"], summary';
    const root = document.querySelector('.jrn');
    const els = [...root.querySelectorAll(SEL)].filter((el) => {
      if (el.closest('[aria-hidden="true"]') && !el.closest('[data-jrn-overlay]')) return false;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && el.innerText.trim().length > 0;
    });
    // inside an open overlay only the overlay is interactive
    const overlay = document.querySelector('[data-jrn-overlay]');
    const scope = overlay ? els.filter((el) => overlay.contains(el)) : els;
    const range = document.createRange();
    const canvas = document.createElement('canvas').getContext('2d');
    const out = [];
    for (const el of scope) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let first = null;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.textContent.trim() && !n.parentElement.closest('[aria-hidden="true"], svg')) {
          first = n;
          break;
        }
      }
      if (!first) continue;
      const labelEl = first.parentElement === el || el.contains(first.parentElement) ? first.parentElement : el;
      // the label: all text inside labelEl
      const rects = [];
      const w2 = document.createTreeWalker(labelEl, NodeFilter.SHOW_TEXT);
      for (let n = w2.nextNode(); n; n = w2.nextNode()) {
        if (!n.textContent.trim()) continue;
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) if (r.width > 0.5) rects.push(r);
      }
      if (!rects.length) continue;
      const tops = [];
      for (const r of rects) if (!tops.some((t) => Math.abs(t - r.top) < r.height * 0.5)) tops.push(r.top);
      const lineWidths = tops.map((t) => {
        const on = rects.filter((r) => Math.abs(r.top - t) < r.height * 0.5);
        return Math.max(...on.map((r) => r.right)) - Math.min(...on.map((r) => r.left));
      });
      const cs = getComputedStyle(labelEl);
      const fs = parseFloat(cs.fontSize);
      const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
      const text = labelEl.innerText.trim().replace(/\s+/g, ' ');
      canvas.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      canvas.letterSpacing = `${ls}px`;
      const single = canvas.measureText(text).width;
      // available width: the label's own box if it is a block / flex item, else its nearest non-inline ancestor
      // (a flex / grid item may grow to its container's content width minus its siblings and gaps)
      let box = labelEl;
      while (box && getComputedStyle(box).display === 'inline' && box !== el) box = box.parentElement;
      if (getComputedStyle(box).display === 'inline') box = el.parentElement;
      const contentW = (n) => {
        const c = getComputedStyle(n);
        return n.getBoundingClientRect().width - parseFloat(c.paddingLeft) - parseFloat(c.paddingRight) - parseFloat(c.borderLeftWidth) - parseFloat(c.borderRightWidth);
      };
      let available = contentW(box);
      const parent = box.parentElement;
      const pd = parent ? getComputedStyle(parent).display : '';
      if (parent && box !== el.parentElement && /flex|grid/.test(pd)) {
        const sibs = [...parent.children].filter((c) => c !== box && getComputedStyle(c).position !== 'absolute');
        const gap = parseFloat(getComputedStyle(parent).columnGap) || 0;
        available = contentW(parent) - sibs.reduce((a, c) => a + c.getBoundingClientRect().width, 0) - gap * sibs.length;
      }
      // decorative rule: text-decoration, a bottom border, or a thin ::after / ::before
      let rule = null;
      for (let n = labelEl; n && (n === el || el.contains(n)); n = n.parentElement) {
        const c = getComputedStyle(n);
        if (c.textDecorationLine.includes('underline')) {
          rule = { kind: 'TEXT_DECORATION', width: Math.max(...lineWidths), left: Math.min(...rects.map((r) => r.left)) };
          break;
        }
        if (parseFloat(c.borderBottomWidth) > 0 && c.borderBottomStyle !== 'none' && n !== el) {
          const inline = c.display === 'inline';
          const b = n.getBoundingClientRect();
          rule = { kind: inline ? 'INLINE_BORDER' : 'BOX_BORDER', width: inline ? Math.max(...lineWidths) : b.width, left: b.left };
          break;
        }
        for (const pseudo of ['::after', '::before']) {
          const p = getComputedStyle(n, pseudo);
          if (p.content !== 'none' && parseFloat(p.height) > 0 && parseFloat(p.height) <= 3 && parseFloat(p.width) > 0) {
            rule = { kind: 'PSEUDO_RULE', width: parseFloat(p.width), left: n.getBoundingClientRect().left };
          }
        }
        if (rule) break;
        if (n === el) break;
      }
      const eb = el.getBoundingClientRect();
      // hit area: the control's box, grown by an absolutely positioned ::before / ::after hit extension
      let hitW = eb.width;
      let hitH = eb.height;
      for (const pseudo of ['::before', '::after']) {
        const p = getComputedStyle(el, pseudo);
        if (p.content !== 'none' && p.position === 'absolute') {
          const n = (v) => (v.endsWith('px') ? parseFloat(v) : 0);
          hitW = Math.max(hitW, eb.width - n(p.left) - n(p.right));
          hitH = Math.max(hitH, eb.height - n(p.top) - n(p.bottom));
        }
      }
      const col = el.closest('.jrn-col, [data-runtime-bounds="column"], .jrn-drawer, .jrn-sheet, .jrn-modal, .jrn-parent__rail');
      const cb = col?.getBoundingClientRect();
      out.push({
        trigger: el.getAttribute('data-jrn-trigger'),
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        cls: (el.className.baseVal ?? el.className).split(' ').slice(0, 2).join(' '),
        text,
        lines: tops.length,
        lineWidths: lineWidths.map((w) => Math.round(w)),
        footprint: Math.round(Math.max(...lineWidths)),
        single: Math.round(single),
        fontSize: fs,
        tracking: +(ls / fs).toFixed(3),
        available: Math.round(available),
        whiteSpace: cs.whiteSpace,
        balanced: ['balance', 'pretty'].includes(getComputedStyle(labelEl).textWrap ?? '') || ['balance', 'pretty'].includes(getComputedStyle(labelEl).textWrapStyle ?? ''),
        rule: rule ? { kind: rule.kind, width: Math.round(rule.width), offset: Math.round(rule.left - Math.min(...rects.map((r) => r.left))) } : null,
        tap: { w: Math.round(hitW), h: Math.round(hitH) },
        fit: labelEl.getAttribute('data-jrn-fit') ?? el.querySelector('[data-jrn-fit]')?.getAttribute('data-jrn-fit') ?? 'NATURAL',
        textRight: Math.round(Math.max(...rects.map((r) => r.right))),
        textTop: Math.round(Math.min(...rects.map((r) => r.top))),
        textBottom: Math.round(Math.max(...rects.map((r) => r.bottom))),
        textLeft: Math.round(Math.min(...rects.map((r) => r.left))),
        boxRight: Math.round(eb.right),
        colRight: cb ? Math.round(cb.right) : innerWidth,
        inOverlay: !!el.closest('[data-jrn-overlay]'),
        zone: el.closest('[data-jrn-zone]')?.getAttribute('data-jrn-zone') ?? null,
        // bare type over the photograph vs type on a painted surface (button, row, panel, dock)
        onSurface: (() => {
          for (let n = labelEl; n && !n.classList.contains('jrn-screen'); n = n.parentElement) {
            const bg = getComputedStyle(n).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
            if ((bg.length === 3 ? 1 : bg[3]) >= 0.5) return true;
          }
          return false;
        })(),
      });
    }
    const screen = document.querySelector('[data-jrn-screen]');
    return { vw: innerWidth, vh: innerHeight, plate: screen?.getAttribute('data-jrn-plate') ?? null, photographic: !!screen?.querySelector('.jrn-env img, .jrn-env .jrn-p'), family: screen?.getAttribute('data-jrn-family') ?? null, items: out };
  });
}

/* Plate probe for every family: the UI is hidden, the bare plate is shot, and the strip just right of each label
   (one clearance wide, the label's height) is checked for sheer white curtain: bright, near-neutral pixels. */
async function plateProbe(page, items, vp, photographic) {
  if (!photographic || !items.some((it) => !it.inOverlay && !it.onSurface)) return items.map(() => null);
  const style = await page.addStyleTag({ content: '.jrn-screen > :not(.jrn-env), .jrn-overlay-host, [data-jrn-overlay], .jrn-nav, .jrn-toast { visibility: hidden !important; }' });
  await page.waitForTimeout(80);
  const shot = await page.screenshot();
  await style.evaluate((n) => n.remove());
  const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const band = ENV_CLEARANCE[vp];
  return items.map((it) => {
    if (it.inOverlay || it.onSurface) return null;
    const x0 = Math.min(info.width - 1, Math.max(0, it.textRight + 1));
    const x1 = Math.min(info.width - 1, it.textRight + band);
    const y0 = Math.max(0, it.textTop);
    const y1 = Math.min(info.height - 1, it.textBottom);
    let n = 0;
    let sheer = 0;
    for (let y = y0; y <= y1; y += 1)
      for (let x = x0; x <= x1; x += 1) {
        const i = (y * info.width + x) * 3;
        const mx = Math.max(data[i], data[i + 1], data[i + 2]);
        const mn = Math.min(data[i], data[i + 1], data[i + 2]);
        n += 1;
        if (mx > 215 && (mx - mn) / mx < 0.075) sheer += 1;
      }
    return n ? +(sheer / n).toFixed(3) : 0;
  });
}

export function judgeItem(vp, view, f, it) {
  const issues = [];
  const shortLabel = it.text.length <= 32;
  const singleExpected = shortLabel;
  const controlled = it.balanced || it.whiteSpace === 'nowrap';
  if (singleExpected && it.lines > 1) issues.push(`WRAP ${it.lines} lines (single ${it.single} > available ${it.available})`);
  if (!singleExpected && it.lines > 1 && !controlled) issues.push('UNCONTROLLED_WRAP');
  if (it.textRight > it.boxRight + 1) issues.push(`TEXT_OUTSIDE_CONTROL ${it.textRight}>${it.boxRight}`);
  if (it.textRight > it.colRight + 1 || it.textRight > f.vw) issues.push(`TEXT_OUTSIDE_COLUMN ${it.textRight}>${it.colRight}`);
  if (it.rule) {
    if (it.rule.width > it.footprint + 6) issues.push(`RULE_WIDER_THAN_TEXT ${it.rule.width}>${it.footprint}`);
    if (Math.abs(it.rule.offset) > 3) issues.push(`RULE_MISALIGNED ${it.rule.offset}`);
  }
  if (Math.min(it.tap.w, it.tap.h) < 24) issues.push(`TAP_TARGET ${it.tap.w}x${it.tap.h}`);
  if (it.fontSize < 9.5) issues.push(`TOO_SMALL ${it.fontSize}px`);
  // top chrome (back / board / today corners) sits in the global top safe zone by design; it is reported, not gated
  if (it.curtainShare != null && it.curtainShare > 0.2 && it.zone !== 'chrome') issues.push(`NEAR_WHITE_CURTAIN ${Math.round(it.curtainShare * 100)}% of the clearance strip`);
  if (f.plate && !it.inOverlay) {
    const e = edgeX(f.plate, f.vw, f.vh, it.textTop, it.textBottom);
    if (e != null && e - it.textRight < ENV_CLEARANCE[vp]) issues.push(`ENV_OVERLAP clearance ${e - it.textRight}`);
  }
  return issues;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [base = 'http://127.0.0.1:5174', out = 'artifacts/jurnl-interactive-text/INTERACTIVE_TEXT_QA.json', vps = 'mobile,tablet,desktop', filter = ''] = process.argv.slice(2);
  const browser = await chromium.launch({ headless: true, executablePath: qaChromiumPath() });
  const rows = [];
  for (const vp of vps.split(',')) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS[vp], deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      try {
        sessionStorage.removeItem('jurnl.runtime.v1.setup');
      } catch {}
    });
    for (const [family, id, route] of VIEWS) {
      if (filter && !id.includes(filter)) continue;
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e)));
      await page.goto(`${base}/production/jurnl/runtime/${route}`, { waitUntil: 'domcontentloaded' });
      try {
        await page.waitForSelector('.jrn button, .jrn [role]', { timeout: 30000 });
      } catch {
        rows.push({ viewport: vp, family, view: id, route, issues: ['VIEW_NOT_RENDERED'], pass: false });
        await page.close();
        continue;
      }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      const f = await collect(page);
      const probe = await plateProbe(page, f.items, vp, f.photographic);
      f.items.forEach((it, i) => (it.curtainShare = probe[i]));
      for (const it of f.items) {
        const issues = judgeItem(vp, id, f, it);
        rows.push({ viewport: vp, family, view: id, route, ...it, issues, pass: issues.length === 0 });
      }
      if (errs.length) rows.push({ viewport: vp, family, view: id, route, pageErrors: errs, issues: ['PAGE_ERROR'], pass: false });
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  const fails = rows.filter((r) => !r.pass);
  const report = {
    generatedAt: new Date().toISOString(),
    base,
    rule: 'GLOBAL JURNL TYPOGRAPHIC CONTAINMENT RULE',
    labels: rows.length,
    pass: rows.length - fails.length,
    drift: fails.length,
    driftClass: 'INTERACTIVE_TEXT_CONTAINMENT_DRIFT',
    byIssue: fails.flatMap((r) => r.issues.map((i) => i.split(' ')[0])).reduce((a, k) => ((a[k] = (a[k] ?? 0) + 1), a), {}),
    chromeNearBright: rows.filter((r) => r.zone === 'chrome' && r.curtainShare > 0.2).map((r) => ({ viewport: r.viewport, view: r.view, trigger: r.trigger, text: r.text, share: r.curtainShare })),
    fits: rows.filter((r) => r.fit && r.fit !== 'NATURAL').map((r) => ({ viewport: r.viewport, view: r.view, trigger: r.trigger, text: r.text, fit: r.fit, fontSize: r.fontSize, tracking: r.tracking, lines: r.lines })),
    fails: fails.map((r) => ({ viewport: r.viewport, view: r.view, trigger: r.trigger, text: r.text, lines: r.lines, fontSize: r.fontSize, tracking: r.tracking, single: r.single, available: r.available, rule: r.rule, tap: r.tap, issues: r.issues })),
    rows,
  };
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ labels: report.labels, pass: report.pass, drift: report.drift, byIssue: report.byIssue }, null, 1));
}
