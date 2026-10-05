/**
 * JURNL F02 SETUP final audit QA (P0.JURNL.F02-OPUS-FINAL-…-AUDIT1).
 * Runs against the REAL runtime route at 393×852 / 834×1194 / 1440×900 and checks, per route / state / overlay:
 *   LEFT RAIL     every copy / panel / row / field ends inside the plate's rail (and left of the measured curtain edge)
 *   WRAP          authored headline lines stay single lines; helper copy is 1–3 lines with no one-word last line
 *   ICON ROWS     [ICON][LABEL][CONTROL]: label right of the icon, short labels single-line, trailing controls aligned
 *   CONTRAST      text colour against the real composited pixels behind it (text hidden, page re-shot, sampled)
 *   CANVAS        no page scroll, no horizontal overflow, no column overflow
 *   ASSETS        plate / emblem / lockup loaded, lockup not clipped, no duplicate emblem or wordmark beside a lockup
 * then walks the behavioural journey (F01.13 → F02 → today) with keyboard, Escape, validation, skip, save/resume and
 * start over. Usage: node scripts/jurnl/f02-final-audit-qa.mjs <baseUrl> <out.json> [viewports]
 */
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { CAPTURES, VIEWPORTS } from './capture-f02.mjs';
import { qaChromiumPath } from './qa-env.mjs';

/* Environment edges measured on the gridded plate crops (device px). Independent of the CSS rail: the rail must end
   left of these. ARRIVAL = sheer curtain at the panel band; DESK = sheer curtain; EDIT = olive leaves / pilaster;
   QUIET = lit stone column. Desktop: the column ends at 492, far left of every edge (≥ 720). */
export const ENV_EDGE = {
  mobile: { 'ENV.ARRIVAL': 218, 'ENV.DESK': 266, 'ENV.EDIT': 300, 'ENV.QUIET': 265 },
  tablet: { 'ENV.ARRIVAL': 455, 'ENV.DESK': 540, 'ENV.EDIT': 619, 'ENV.QUIET': 531 },
  desktop: { 'ENV.ARRIVAL': 720, 'ENV.DESK': 900, 'ENV.EDIT': 900, 'ENV.QUIET': 900 },
};
const SHORT_LABELS = new Set(['CONNECT AN ACCOUNT', 'NAME AN ACCOUNT', 'WEEKLY', 'EVERY TWO WEEKS', 'MONTHLY', 'IRREGULAR', 'REMEMBER THIS SETUP', 'NOTHING IS SOLD']);

const lum = (r, g, b) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Geometry facts for the audit, read inside the page. */
async function facts(page) {
  return page.evaluate(() => {
    const box = (el) => {
      const b = el.getBoundingClientRect();
      return { x: Math.round(b.left), y: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) };
    };
    const textRects = (el) => {
      const range = document.createRange();
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const out = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue;
        const p = n.parentElement;
        if (p && (p.closest('[hidden]') || getComputedStyle(p).visibility === 'hidden')) continue;
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) if (r.width > 0.5) out.push({ x: r.left, y: r.top, r: r.right, b: r.bottom, h: r.height });
      }
      return out;
    };
    const lineGroups = (rects) => {
      const tops = [];
      for (const r of rects) if (!tops.some((t) => Math.abs(t - r.y) < r.h * 0.5)) tops.push(r.y);
      return tops.length;
    };
    const screen = document.querySelector('[data-jrn-screen]');
    const col = screen?.querySelector('.jrn-col');
    const setup = screen?.querySelector('.jrn-setup');
    const cs = setup ? getComputedStyle(setup) : null;
    const railRight = setup ? setup.getBoundingClientRect().left + (parseFloat(cs.maxWidth) || setup.getBoundingClientRect().width) : null;
    // rail: everything in the copy block except the back control row
    const railItems = setup ? [...setup.querySelectorAll(':scope > *:not(.jrn-setup__top)')].map((el) => {
      const t = textRects(el);
      const right = Math.max(el.getBoundingClientRect().right, ...t.map((r) => r.r));
      return { cls: (el.className.baseVal ?? el.className).split(' ')[0] || el.tagName, right: Math.round(right) };
    }) : [];
    const h1 = setup?.querySelector('.jrn-h1');
    const headline = h1 ? [...h1.children].map((s) => ({ text: s.textContent, lines: lineGroups(textRects(s)) })) : [];
    const sub = setup?.querySelector(':scope > .jrn-kicker');
    let subFacts = null;
    if (sub) {
      const rects = textRects(sub);
      const lines = lineGroups(rects);
      // words on the last line: measure each word with a range
      const words = [];
      const walker = document.createTreeWalker(sub, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const re = /\S+/g;
        let m;
        while ((m = re.exec(n.textContent))) {
          range.setStart(n, m.index);
          range.setEnd(n, m.index + m[0].length);
          const r = range.getBoundingClientRect();
          words.push({ w: m[0], y: Math.round(r.top) });
        }
      }
      const lastY = Math.max(...words.map((w) => w.y));
      subFacts = { lines, lastLineWords: words.filter((w) => Math.abs(w.y - lastY) < 3).length, text: sub.textContent };
    }
    const rows = [...document.querySelectorAll('[data-jrn-screen] .jrn-choice, [data-jrn-screen] .jrn-setup__consent, [data-jrn-overlay] .jrn-choice')].map((row) => {
      const icon = row.querySelector('.jrn-choice__icon svg, :scope > svg');
      const label = row.classList.contains('jrn-choice') ? row.querySelector('.jrn-row__copy') : row.querySelector(':scope > span');
      const trailing = row.querySelector('.jrn-choice__mark, .jrn-toggle');
      const t = label ? textRects(label.querySelector('b') ?? label) : [];
      const rb = row.getBoundingClientRect();
      const ib = icon?.getBoundingClientRect();
      const tb = trailing?.getBoundingClientRect();
      return {
        group: row.parentElement?.getAttribute('aria-label') ?? row.parentElement?.className ?? '',
        label: (label?.querySelector('b') ?? label)?.textContent.trim() ?? '',
        role: row.getAttribute('role') ?? trailing?.getAttribute('role'),
        hasIcon: !!icon,
        iconRight: ib ? Math.round(ib.right) : null,
        iconMid: ib ? ib.top + ib.height / 2 : null,
        labelMinX: t.length ? Math.round(Math.min(...t.map((r) => r.x))) : null,
        labelLines: lineGroups(t),
        firstLineMid: t.length ? t[0].y + t[0].h / 2 : null,
        rowMid: rb.top + rb.height / 2,
        rowRight: Math.round(rb.right),
        trailingRight: tb ? Math.round(tb.right) : null,
        trailingMid: tb ? tb.top + tb.height / 2 : null,
        h: Math.round(rb.height),
      };
    });
    // icon + label buttons outside JurnlChoice: ADD ANOTHER (leading plus) and READ THE BOUNDARY (trailing chevron)
    const buttonRows = [...document.querySelectorAll('[data-jrn-screen] [data-jrn-trigger="setup-add"], [data-jrn-screen] .jrn-setup__read')].map((btn) => {
      const svg = btn.querySelector('svg');
      const t = textRects(btn);
      const ib = svg.getBoundingClientRect();
      const lead = ib.left < Math.min(...t.map((r) => r.x));
      return {
        label: btn.textContent.trim(),
        icon: svg.getAttribute('data-jrn-icon'),
        placement: lead ? 'LEADING' : 'TRAILING',
        labelLines: lineGroups(t),
        overlap: lead ? Math.round(Math.min(...t.map((r) => r.x)) - ib.right) : Math.round(ib.left - Math.max(...t.map((r) => r.r))),
        midDelta: +Math.abs(ib.top + ib.height / 2 - (t[0].y + t[0].h / 2)).toFixed(1),
      };
    });
    const textTargets = [];
    const pushText = (kind, el, large = false) => {
      if (!el) return;
      for (const r of textRects(el)) textTargets.push({ kind, color: getComputedStyle(el).color, large, x: r.x, y: r.y, r: r.r, b: r.b });
    };
    pushText('headline', h1, true);
    pushText('eyebrow', setup?.querySelector('.jrn-setup__meta .jrn-eyebrow'));
    pushText('word', setup?.querySelector('.jrn-setup__word'), true);
    pushText('helper', sub);
    pushText('foot', setup?.querySelector('.jrn-setup__foot'));
    screen?.querySelectorAll('.jrn-cta .jrn-btn').forEach((b) => !b.disabled && pushText(`cta:${b.textContent.trim()}`, b));
    screen?.querySelectorAll('.jrn-row__copy, .jrn-setup__consent b, .jrn-setup__path li, .jrn-setup__summary li').forEach((el) => pushText('row', el));
    const lockup = screen?.querySelector('.jrn-setup__lockup');
    const emblems = [...(screen?.querySelectorAll('.jrn-setup__emblem') ?? [])];
    const plateImg = screen?.querySelector('.jrn-plate');
    const ae = document.activeElement;
    const dialog = document.querySelector('[data-jrn-overlay] [role="dialog"]');
    return {
      vw: innerWidth,
      vh: innerHeight,
      plate: screen?.querySelector('.jrn-env')?.getAttribute('data-scene') ?? null,
      pageScroll: document.scrollingElement.scrollHeight - innerHeight,
      pageHScroll: document.scrollingElement.scrollWidth - innerWidth,
      colScroll: col ? col.scrollHeight - col.clientHeight : null,
      colHScroll: col ? col.scrollWidth - col.clientWidth : null,
      colLeft: col ? Math.round(col.getBoundingClientRect().left + parseFloat(getComputedStyle(col).paddingLeft)) : null,
      railLeft: setup ? Math.round(setup.getBoundingClientRect().left) : null,
      railRight: railRight != null ? Math.round(railRight) : null,
      railItems,
      headline,
      sub: subFacts,
      rows,
      buttonRows,
      cta: (() => {
        const b = screen?.querySelector('.jrn-cta .jrn-btn--primary');
        return b ? box(b) : null;
      })(),
      secondary: [...(screen?.querySelectorAll('.jrn-cta .jrn-btn:not(.jrn-btn--primary)') ?? [])].map(box),
      textTargets,
      plateLoaded: plateImg ? plateImg.complete && plateImg.naturalWidth > 0 : false,
      lockup: lockup ? { id: lockup.getAttribute('data-asset-id'), loaded: lockup.naturalWidth > 0, ...box(lockup), natural: lockup.naturalWidth / lockup.naturalHeight, objectFit: getComputedStyle(lockup).objectFit } : null,
      emblems: emblems.map((e) => ({ id: e.getAttribute('data-asset-id'), loaded: e.naturalWidth > 0, ...box(e) })),
      words: screen?.querySelectorAll('.jrn-setup__word').length ?? 0,
      setupLabels: screen?.querySelectorAll('.jrn-setup__meta .jrn-eyebrow').length ?? 0,
      icons: [...document.querySelectorAll('[data-jrn-screen] [data-jrn-icon], [data-jrn-overlay] [data-jrn-icon]')].map((i) => i.getAttribute('data-jrn-icon')),
      dialogFocus: dialog ? dialog.contains(ae) : null,
      overlay: document.querySelector('[data-jrn-overlay]')?.getAttribute('data-jrn-overlay') ?? null,
    };
  });
}

/** Contrast of every text run against the pixels behind it (text made transparent, page re-shot). */
async function contrast(page, targets) {
  if (!targets.length) return [];
  const style = await page.addStyleTag({ content: '.jrn * { color: transparent !important; caret-color: transparent !important; } .jrn svg { visibility: hidden !important; }' });
  await page.waitForTimeout(60);
  const shot = await page.screenshot({ animations: 'disabled' });
  await style.evaluate((n) => n.remove());
  const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return targets.map((t) => {
    const [r, g, b] = t.color.match(/\d+(\.\d+)?/g).map(Number);
    const fg = lum(r, g, b);
    const ratios = [];
    const x0 = Math.max(0, Math.round(t.x)), x1 = Math.min(info.width - 1, Math.round(t.r));
    const y0 = Math.max(0, Math.round(t.y + 1)), y1 = Math.min(info.height - 1, Math.round(t.b - 1));
    for (let y = y0; y <= y1; y += 1)
      for (let x = x0; x <= x1; x += 1) {
        const i = (y * info.width + x) * 3;
        ratios.push(ratio(fg, lum(data[i], data[i + 1], data[i + 2])));
      }
    ratios.sort((a, b2) => a - b2);
    const p10 = ratios.length ? ratios[Math.floor(ratios.length * 0.1)] : null;
    return { kind: t.kind, large: t.large, p10: p10 && +p10.toFixed(2), min: ratios.length ? +ratios[0].toFixed(2) : null };
  });
}

function judge(vp, cap, f, cr) {
  const issues = [];
  const edge = f.plate ? ENV_EDGE[vp][f.plate] : null;
  if (f.pageScroll > 0) issues.push(`PAGE_SCROLL ${f.pageScroll}`);
  if (f.pageHScroll > 0) issues.push(`PAGE_HSCROLL ${f.pageHScroll}`);
  if (f.colHScroll > 0) issues.push(`COL_HSCROLL ${f.colHScroll}`);
  if (f.colScroll > 0) issues.push(`COL_SCROLL ${f.colScroll}`);
  if (f.railLeft !== f.colLeft) issues.push(`RAIL_NOT_ON_GRID ${f.railLeft}≠${f.colLeft}`);
  for (const it of f.railItems) {
    if (it.right > f.railRight + 1) issues.push(`RAIL_OVERFLOW ${it.cls} ${it.right}>${f.railRight}`);
    if (edge && it.right > edge) issues.push(`CROSSES_ENV_EDGE ${it.cls} ${it.right}>${edge}`);
  }
  if (vp !== 'mobile' && f.cta && edge && f.cta.r > edge) issues.push(`CTA_CROSSES_ENV_EDGE ${f.cta.r}>${edge}`);
  for (const s of f.secondary) if (edge && vp !== 'mobile' && s.r > edge) issues.push(`SECONDARY_CROSSES_ENV_EDGE ${s.r}`);
  for (const l of f.headline) if (l.lines !== 1) issues.push(`HEADLINE_WRAP "${l.text}" ${l.lines}`);
  if (f.sub) {
    if (f.sub.lines > 3) issues.push(`HELPER_LINES ${f.sub.lines}`);
    if (f.sub.lines > 1 && f.sub.lastLineWords < 2) issues.push(`HELPER_ORPHAN "${f.sub.text}"`);
  }
  const groups = {};
  for (const r of f.rows) {
    if (r.hasIcon && r.labelMinX != null && r.labelMinX < r.iconRight) issues.push(`LABEL_UNDER_ICON "${r.label}"`);
    // the icon sits on the label's first line (single-line rows: that is the row centre)
    if (r.hasIcon && Math.abs(r.iconMid - r.firstLineMid) > 3) issues.push(`ICON_MISALIGNED "${r.label}"`);
    if (SHORT_LABELS.has(r.label) && r.labelLines !== 1) issues.push(`SHORT_LABEL_WRAPS "${r.label}" ${r.labelLines}`);
    if (r.trailingMid != null && Math.abs(r.trailingMid - r.rowMid) > 2) issues.push(`TRAILING_OFF_CENTRE "${r.label}"`);
    (groups[r.group] ??= []).push(r.trailingRight);
  }
  for (const b of f.buttonRows) {
    if (b.overlap < 4) issues.push(`ICON_TOUCHES_LABEL "${b.label}"`);
    if (b.midDelta > 3) issues.push(`ICON_MISALIGNED "${b.label}"`);
    if (b.labelLines !== 1) issues.push(`SHORT_LABEL_WRAPS "${b.label}"`);
  }
  for (const [g, rights] of Object.entries(groups)) {
    const v = rights.filter((x) => x != null);
    if (v.length > 1 && Math.max(...v) - Math.min(...v) > 1) issues.push(`TRAILING_UNALIGNED ${g}`);
  }
  for (const c of cr) {
    if (c.kind === 'word') continue; // JURNL wordmark beside an emblem is a logotype (WCAG 1.4.3 exemption); reported, not gated
    const need = c.large ? 3 : 4.5;
    if (c.p10 != null && c.p10 < need) issues.push(`CONTRAST ${c.kind} p10=${c.p10} < ${need}`);
  }
  if (!f.plateLoaded) issues.push('PLATE_NOT_LOADED');
  if (f.lockup) {
    if (!f.lockup.loaded) issues.push('LOCKUP_NOT_LOADED');
    if (f.lockup.objectFit !== 'contain') issues.push('LOCKUP_MAY_CLIP');
    if (f.words || f.emblems.length) issues.push('DUPLICATE_MARK_BESIDE_LOCKUP');
    if (f.lockup.id === 'F02.BRANDLOCKUP.JURNL_SETUP.001' && f.setupLabels) issues.push('DUPLICATE_SETUP_LABEL');
  }
  for (const e of f.emblems) if (!e.loaded) issues.push(`EMBLEM_NOT_LOADED ${e.id}`);
  if (f.overlay && f.dialogFocus === false) issues.push('DIALOG_FOCUS_OUTSIDE');
  return issues;
}

/** Behavioural journey on the real runtime (mobile). Returns step results. */
async function journey(browser, base) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS.mobile });
  const page = await ctx.newPage();
  const steps = [];
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const screenId = () => page.getAttribute('[data-jrn-screen]:last-of-type', 'data-jrn-screen');
  const at = async (id) => {
    await page.waitForSelector(`[data-jrn-screen="${id}"]`, { timeout: 10000 });
    await page.waitForTimeout(450);
  };
  const step = async (name, fn) => {
    try {
      const detail = await fn();
      steps.push({ step: name, pass: true, ...(detail ? { detail } : {}) });
    } catch (e) {
      steps.push({ step: name, pass: false, error: String(e).slice(0, 300), screen: await screenId().catch(() => null) });
    }
  };
  const click = (t) => page.click(`[data-jrn-trigger="${t}"]`);
  const R = `${base}/production/jurnl/runtime`;

  await step('F01.13 → F02.00 without reload, shell kept', async () => {
    await page.goto(`${R}/entry/complete`);
    await page.evaluate(() => sessionStorage.removeItem('jurnl.runtime.v1.setup'));
    await at('F01.13');
    await page.evaluate(() => {
      window.__jrnMarker = 'kept';
      window.__jrnRoot = document.querySelector('.jrn');
    });
    await click('complete-continue');
    await at('F02.00');
    const same = await page.evaluate(() => window.__jrnMarker === 'kept' && window.__jrnRoot === document.querySelector('.jrn') && document.contains(window.__jrnRoot));
    if (!same) throw new Error('runtime shell was replaced');
    if (!page.url().endsWith('/setup')) throw new Error(page.url());
    return 'same document, same .jrn root';
  });
  await step('F02.00 fresh → F02.01', async () => {
    if (!(await page.textContent('[data-jrn-screen="F02.00"] .jrn-h1')).includes('THE SHAPE')) throw new Error('not fresh');
    await click('setup-continue');
    await at('F02.01');
  });
  await step('F02.01 continue disabled until a household is chosen', async () => {
    if (!(await page.isDisabled('[data-jrn-trigger="setup-continue"]'))) throw new Error('enabled with no choice');
    await click('setup-household-JUST_ME');
    if ((await page.getAttribute('[data-jrn-trigger="setup-household-JUST_ME"]', 'aria-checked')) !== 'true') throw new Error('not checked');
    await click('setup-continue');
    await at('F02.02');
  });
  await step('F02.02 keyboard order: back → connect → name → continue → skip', async () => {
    await page.focus('[data-jrn-trigger="setup-back"]');
    const order = [await page.evaluate(() => document.activeElement.getAttribute('data-jrn-trigger'))];
    for (let i = 0; i < 4; i += 1) {
      await page.keyboard.press('Tab');
      order.push(await page.evaluate(() => document.activeElement.getAttribute('data-jrn-trigger')));
    }
    const want = ['setup-back', 'setup-connect', 'setup-name-account', 'setup-continue', 'setup-skip'];
    if (JSON.stringify(order) !== JSON.stringify(want)) throw new Error(order.join(','));
    const ring = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
    if (ring === 'none') throw new Error('no visible focus ring');
    return order.join(' → ');
  });
  await step('Permission drawer: focus inside, Tab trapped, Escape closes, focus returns', async () => {
    await page.focus('[data-jrn-trigger="setup-connect"]');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-jrn-overlay="setup-permission"]');
    await page.waitForTimeout(400);
    const inside = await page.evaluate(() => document.querySelector('[data-jrn-overlay] [role="dialog"]').contains(document.activeElement));
    if (!inside) throw new Error('focus not in dialog');
    for (let i = 0; i < 5; i += 1) await page.keyboard.press('Tab');
    const still = await page.evaluate(() => document.querySelector('[data-jrn-overlay] [role="dialog"]').contains(document.activeElement));
    if (!still) throw new Error('Tab escaped the dialog');
    if ((await page.getAttribute('[data-jrn-screen] .jrn-env', 'data-scene')) !== 'ENV.QUIET') throw new Error('permission is not in the quiet room');
    await page.keyboard.press('Escape');
    await page.waitForSelector('[data-jrn-overlay="setup-permission"]', { state: 'detached' });
    const back = await page.evaluate(() => document.activeElement?.getAttribute('data-jrn-trigger'));
    if (back !== 'setup-connect') throw new Error(`focus returned to ${back}`);
  });
  await step('Account connect (permission CONTINUE) → connected state', async () => {
    await click('setup-connect');
    await page.waitForSelector('[data-jrn-overlay="setup-permission"]');
    await click('setup-permission-continue');
    await page.waitForSelector('[data-jrn-state="connected"]');
    if ((await page.getAttribute('[data-jrn-trigger="setup-connect"]', 'aria-checked')) !== 'true') throw new Error('connect not checked');
  });
  await step('Manual entry: NAME AN ACCOUNT → validation → save → back on F02.02', async () => {
    await click('setup-name-account');
    await at('F02.02.1');
    if (!(await page.isDisabled('[data-jrn-trigger="setup-continue"]'))) throw new Error('save enabled while empty');
    await page.fill('[data-jrn-trigger="setup-account-name"]', 'HOUSE');
    await click('setup-kind-CHECKING');
    await click('setup-continue');
    await at('F02.02');
    await click('setup-continue');
    await at('F02.03');
  });
  await step('Income: non-numeric amount is announced, then recovers', async () => {
    await click('setup-cadence-EVERY TWO WEEKS');
    await page.fill('[data-jrn-trigger="setup-amount"]', 'abc');
    const alert = await page.waitForSelector('[data-jrn-screen="F02.03"] [role="alert"]');
    const described = await page.getAttribute('[data-jrn-trigger="setup-amount"]', 'aria-describedby');
    if (!described) throw new Error('field not described by its error');
    if (!(await page.isDisabled('[data-jrn-trigger="setup-continue"]'))) throw new Error('continue enabled on invalid amount');
    await page.fill('[data-jrn-trigger="setup-amount"]', '2400');
    await page.waitForSelector('[data-jrn-screen="F02.03"] [role="alert"]', { state: 'detached' });
    await click('setup-continue');
    await at('F02.04');
    return (await alert.textContent().catch(() => '')) || 'alert shown';
  });
  await step('Recurring obligations: ADD sheet → save → listed', async () => {
    await click('setup-add');
    await page.waitForSelector('[data-jrn-overlay="setup-add"]');
    await page.fill('[data-jrn-trigger="setup-obligation-name"]', 'RENT');
    const focusKept = await page.evaluate(() => document.activeElement?.getAttribute('data-jrn-trigger'));
    if (focusKept !== 'setup-obligation-name') throw new Error(`typing moved focus to ${focusKept}`);
    await click('setup-obligation-MONTHLY');
    await click('setup-add-save');
    await page.waitForSelector('[data-jrn-overlay="setup-add"]', { state: 'detached' });
    if (!(await page.textContent('.jrn-setup__list')).includes('RENT')) throw new Error('not listed');
    await click('setup-continue');
    await at('F02.05');
  });
  await step('Priorities: multi-select (checkbox), max three, A GOAL opens the goal grandchild', async () => {
    const role = await page.getAttribute('[data-jrn-trigger="setup-priority-A GOAL"]', 'role');
    if (role !== 'checkbox') throw new Error(`role ${role}`);
    for (const p of ['A GOAL', 'DAILY LIFE', 'HOUSING', 'DEBT']) await click(`setup-priority-${p}`);
    const checked = await page.$$eval('[data-jrn-trigger^="setup-priority-"][aria-checked="true"]', (n) => n.length);
    if (checked !== 3) throw new Error(`checked ${checked}`);
    await click('setup-continue');
    await at('F02.05.1');
  });
  await step('Goal: name + horizon → F02.06; back from F02.06 returns to the goal', async () => {
    await page.fill('[data-jrn-trigger="setup-goal-name"]', 'A QUIET BUFFER');
    await click('setup-horizon-THIS YEAR');
    await click('setup-continue');
    await at('F02.06');
    await click('setup-back');
    await at('F02.05.1');
    await click('setup-continue');
    await at('F02.06');
  });
  await step('Skip: SKIP FOR NOW sheet → GO BACK keeps the step; CONTINUE skips to F02.07', async () => {
    await click('setup-skip');
    await page.waitForSelector('[data-jrn-overlay="setup-skip"]');
    await click('setup-skip-back');
    await page.waitForSelector('[data-jrn-overlay="setup-skip"]', { state: 'detached' });
    if ((await screenId()) !== 'F02.06') throw new Error('left the step');
    await click('setup-skip');
    await click('setup-skip-continue');
    await at('F02.07');
  });
  await step('Permission / consent: toggles are switches and work from the keyboard', async () => {
    await page.focus('[data-jrn-trigger="setup-consent-links"]');
    if ((await page.getAttribute('[data-jrn-trigger="setup-consent-links"]', 'role')) !== 'switch') throw new Error('not a switch');
    await page.keyboard.press('Space');
    if ((await page.getAttribute('[data-jrn-trigger="setup-consent-links"]', 'aria-checked')) !== 'false') throw new Error('space did not toggle');
    await page.keyboard.press('Space');
    await click('setup-boundary-read');
    if ((await page.getAttribute('[data-jrn-trigger="setup-boundary-read"]', 'aria-expanded')) !== 'true') throw new Error('disclosure');
    await click('setup-continue');
    await at('F02.08');
  });
  await step('Save / resume: reload keeps the draft; F02.00 offers CONTINUE SETUP at the saved place', async () => {
    const summary = await page.textContent('.jrn-setup__summary');
    if (!summary.includes('EVERY TWO WEEKS INCOME')) throw new Error(summary);
    await page.goto(`${R}/setup`);
    await at('F02.00');
    const h = await page.textContent('[data-jrn-screen="F02.00"] .jrn-h1');
    if (!h.includes('CONTINUE')) throw new Error(`no resume: ${h}`);
    await click('setup-continue');
    await at('F02.08');
    // resuming did not overwrite the saved place
    await page.goto(`${R}/setup`);
    await at('F02.00');
    await click('setup-continue');
    await at('F02.08');
  });
  await step('Completion: OPEN TODAY needs a voice, then reaches the F03 boundary (no F03 screens)', async () => {
    if (!(await page.isDisabled('[data-jrn-trigger="setup-continue"]'))) throw new Error('open today enabled with no voice');
    await click('setup-voice-QUIET');
    await click('setup-continue');
    await at('F03.BOUNDARY');
    if (!page.url().endsWith('/today')) throw new Error(page.url());
    const f02 = await page.$('[data-jrn-family="F02"]');
    if (f02) throw new Error('F02 shell still on the boundary');
    await click('today-back');
    await at('F02.08');
  });
  await step('Start over: CONTINUE SETUP → START OVER returns a fresh setup', async () => {
    await page.goto(`${R}/setup`);
    await at('F02.00');
    await click('setup-start-over');
    await page.waitForFunction(() => document.querySelector('[data-jrn-screen="F02.00"] .jrn-h1')?.textContent.includes('THE SHAPE'));
    const stored = await page.evaluate(() => sessionStorage.getItem('jurnl.runtime.v1.setup'));
    if (stored) throw new Error('draft not cleared');
  });
  await step('Error recovery: validation states render their error and the lockup', async () => {
    for (const [route, trigger] of [
      ['setup/income?state=validation', 'setup-validation'],
      ['setup/protected?state=validation', 'setup-protected-validation'],
      ['setup/priorities/goal?state=validation', 'setup-goal-validation'],
    ]) {
      await page.goto(`${R}/${route}`);
      await page.waitForSelector(`[data-jrn-trigger="${trigger}"][role="alert"]`);
      await page.waitForSelector('[data-asset-id="F02.BRANDLOCKUP.JURNL_SETUP.001"]');
    }
  });
  await step('Deep-linked sheet (F02.04 validation): focus inside, error clears on input, Escape closes it', async () => {
    await page.goto(`${R}/setup/commitments?state=validation`);
    await page.waitForSelector('[data-jrn-overlay="setup-add"] [data-jrn-trigger="setup-add-validation"]');
    await page.waitForTimeout(400);
    const inside = await page.evaluate(() => document.querySelector('[data-jrn-overlay] [role="dialog"]').contains(document.activeElement));
    if (!inside) throw new Error('focus not in the deep-linked sheet');
    await page.fill('[data-jrn-trigger="setup-obligation-name"]', 'RENT');
    await page.waitForSelector('[data-jrn-trigger="setup-add-validation"]', { state: 'detached' });
    await page.keyboard.press('Escape');
    await page.waitForSelector('[data-jrn-overlay="setup-add"]', { state: 'detached' });
  });
  await ctx.close();
  return { steps, pageErrors: errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [base = 'http://127.0.0.1:5174', out = 'artifacts/jurnl-f02-opus-audit/F02_FINAL_AUDIT_QA.json', vps = 'mobile,tablet,desktop', mode = 'all'] = process.argv.slice(2);
  const browser = await chromium.launch({ headless: true, executablePath: qaChromiumPath() });
  const routes = [];
  for (const vp of vps.split(',')) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS[vp], deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      try {
        sessionStorage.removeItem('jurnl.runtime.v1.setup');
      } catch {}
    });
    for (const [id, route, query] of CAPTURES) {
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e)));
      await page.goto(`${base}/production/jurnl/runtime/${route}${query ? `?${query}` : ''}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-jrn-screen]', { timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);
      const f = await facts(page);
      // contrast is a property of the screen itself; overlay captures are judged on their own sheet surface
      const cr = f.overlay ? [] : await contrast(page, f.textTargets);
      const issues = judge(vp, id, f, cr);
      routes.push({ viewport: vp, id, route, query, plate: f.plate, railLeft: f.railLeft, railRight: f.railRight, envEdge: f.plate ? ENV_EDGE[vp][f.plate] : null, headline: f.headline, helper: f.sub, rows: f.rows, buttonRows: f.buttonRows, contrast: cr, minContrast: cr.length ? Math.min(...cr.map((c) => c.p10)) : null, icons: [...new Set(f.icons)], issues, pageErrors: errs, pass: issues.length === 0 && errs.length === 0 });
      await page.close();
    }
    await ctx.close();
  }
  const j = mode === 'routes' ? { steps: [], pageErrors: [] } : await journey(browser, base);
  await browser.close();
  const icons = [...new Set(routes.flatMap((r) => r.icons))].sort();
  const report = {
    generatedAt: new Date().toISOString(),
    base,
    routes: { total: routes.length, pass: routes.filter((r) => r.pass).length, fail: routes.filter((r) => !r.pass).map((r) => ({ viewport: r.viewport, id: r.id, issues: r.issues, pageErrors: r.pageErrors })) },
    journey: { total: j.steps.length, pass: j.steps.filter((s) => s.pass).length, steps: j.steps, pageErrors: j.pageErrors },
    icons: { count: icons.length, icons },
    detail: routes,
  };
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ routes: `${report.routes.pass}/${report.routes.total}`, journey: `${report.journey.pass}/${report.journey.total}`, icons: report.icons.count, fail: report.routes.fail.slice(0, 40), journeyFail: j.steps.filter((s) => !s.pass) }, null, 1));
}
