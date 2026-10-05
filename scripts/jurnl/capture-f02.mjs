/**
 * JURNL F02 SETUP live capture + layout metrics (P0.JURNL.F02-OPUS-FINAL-…-AUDIT1).
 * Captures every F02 route (+ states / overlays) at 393×852 / 834×1194 / 1440×900 from the REAL runtime route and
 * records measurable layout facts per capture: page / screen scroll, horizontal overflow, element boxes (headline,
 * sub, panels, choice rows, icon/label geometry, CTA) for the content-rail, wrap and icon-row audits.
 * Usage: node scripts/jurnl/capture-f02.mjs <baseUrl> <outDir> [viewports] [filter]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { qaChromiumPath } from './qa-env.mjs';

export const VIEWPORTS = { mobile: { width: 393, height: 852 }, tablet: { width: 834, height: 1194 }, desktop: { width: 1440, height: 900 } };
export const CAPTURES = [
  ['F02.00', 'setup', ''],
  ['F02.00.RESUME', 'setup', 'state=resume'],
  ['F02.01', 'setup/household', ''],
  ['F02.02', 'setup/accounts', ''],
  ['F02.02.CONNECTED', 'setup/accounts', 'state=connected'],
  ['F02.02.PERMISSION', 'setup/accounts', 'overlay=permission'],
  ['F02.02.SKIP', 'setup/accounts', 'overlay=skip'],
  ['F02.02.1', 'setup/accounts/name', ''],
  ['F02.02.1.VALIDATION', 'setup/accounts/name', 'state=validation'],
  ['F02.03', 'setup/income', ''],
  ['F02.03.VALIDATION', 'setup/income', 'state=validation'],
  ['F02.04', 'setup/commitments', ''],
  ['F02.04.ADD', 'setup/commitments', 'overlay=add'],
  ['F02.04.VALIDATION', 'setup/commitments', 'state=validation'],
  ['F02.05', 'setup/priorities', ''],
  ['F02.05.1', 'setup/priorities/goal', ''],
  ['F02.05.1.VALIDATION', 'setup/priorities/goal', 'state=validation'],
  ['F02.06', 'setup/protected', ''],
  ['F02.06.VALIDATION', 'setup/protected', 'state=validation'],
  ['F02.07', 'setup/boundaries', ''],
  ['F02.08', 'setup/ready', ''],
];

/** Layout facts measured inside the runtime document. */
export async function measure(page) {
  return page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), r: Math.round(b.right), b: Math.round(b.bottom) };
    };
    const screen = document.querySelector('[data-jrn-screen]');
    const lines = (el) => {
      if (!el) return 0;
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 1;
      return Math.round(el.getBoundingClientRect().height / lh);
    };
    const rows = [...document.querySelectorAll('[data-jrn-screen] .jrn-choice, [data-jrn-screen] .jrn-setup__consent, [data-jrn-overlay] .jrn-choice')].map((row) => {
      const icon = row.querySelector('svg');
      const copy = row.querySelector('.jrn-row__copy, .jrn-setup__consent > span');
      const text = (copy ?? row).textContent.trim().replace(/\s+/g, ' ');
      const range = document.createRange();
      const textNodes = [...(copy ?? row).querySelectorAll('*')].concat([copy ?? row]).flatMap((n) => [...n.childNodes].filter((c) => c.nodeType === 3 && c.textContent.trim()));
      const textRects = textNodes.flatMap((t) => {
        range.selectNodeContents(t);
        return [...range.getClientRects()];
      });
      const firstText = textRects[0] ?? null;
      const iconBox = icon?.getBoundingClientRect() ?? null;
      const lineTops = [...new Set(textRects.map((t) => Math.round(t.top)))];
      const trailing = row.querySelector('.jrn-choice__mark, .jrn-toggle');
      return {
        text,
        hasIcon: !!icon,
        row: r(row),
        icon: iconBox ? { x: Math.round(iconBox.left), y: Math.round(iconBox.top), w: Math.round(iconBox.width), h: Math.round(iconBox.height) } : null,
        textLines: lineTops.length,
        firstTextX: firstText ? Math.round(firstText.left) : null,
        firstTextMidY: firstText ? Math.round(firstText.top + firstText.height / 2) : null,
        minTextX: textRects.length ? Math.round(Math.min(...textRects.map((t) => t.left))) : null,
        iconMidY: iconBox ? Math.round(iconBox.top + iconBox.height / 2) : null,
        trailing: trailing ? r(trailing) : null,
      };
    });
    const h1 = document.querySelector('[data-jrn-screen] .jrn-h1');
    const sub = document.querySelector('[data-jrn-screen] .jrn-setup > .jrn-kicker, [data-jrn-screen] .jrn-setup .jrn-kicker');
    const panels = [...document.querySelectorAll('[data-jrn-screen] .jrn-setup__path, [data-jrn-screen] .jrn-setup__list, [data-jrn-screen] .jrn-setup__summary, [data-jrn-screen] .jrn-setup__choices, [data-jrn-screen] .jrn-setup__consents, [data-jrn-screen] .jrn-field, [data-jrn-screen] .jrn-error, [data-jrn-screen] .jrn-success, [data-jrn-screen] .jrn-setup__read')].map((p) => ({ cls: p.className.split(' ').slice(0, 2).join(' '), ...r(p) }));
    const cta = document.querySelector('[data-jrn-screen] .jrn-cta .jrn-btn--primary, [data-jrn-screen] [data-jrn-trigger="setup-continue"]');
    const secondary = [...document.querySelectorAll('[data-jrn-screen] .jrn-cta .jrn-btn:not(.jrn-btn--primary)')].map(r);
    const mark = document.querySelector('[data-jrn-screen] .jrn-setup__mark, [data-jrn-screen] .jrn-setup__lockup');
    const eyebrow = document.querySelector('[data-jrn-screen] .jrn-setup > .jrn-eyebrow');
    const imgs = [...document.querySelectorAll('[data-jrn-screen] img')].map((i) => ({ id: i.getAttribute('data-asset-id'), cls: i.className, ...r(i) }));
    return {
      vw: innerWidth,
      vh: innerHeight,
      pageScroll: document.scrollingElement.scrollHeight - innerHeight,
      pageHScroll: document.scrollingElement.scrollWidth - innerWidth,
      screenScroll: screen ? screen.scrollHeight - screen.clientHeight : null,
      screenHScroll: screen ? screen.scrollWidth - screen.clientWidth : null,
      col: r(document.querySelector('[data-jrn-screen] .jrn-col')),
      plate: document.querySelector('[data-jrn-screen] .jrn-env')?.getAttribute('data-scene') ?? null,
      h1: h1 ? { ...r(h1), lines: [...h1.querySelectorAll('span')].map((s) => ({ text: s.textContent, w: Math.round(s.getBoundingClientRect().width), h: Math.round(s.getBoundingClientRect().height) })), fontSize: parseFloat(getComputedStyle(h1).fontSize) } : null,
      sub: sub ? { ...r(sub), lines: lines(sub), text: sub.textContent } : null,
      eyebrow: r(eyebrow),
      mark: r(mark),
      panels,
      rows,
      cta: r(cta),
      secondary,
      overlay: r(document.querySelector('[data-jrn-overlay] .jrn-drawer, [data-jrn-overlay] .jrn-sheet, [data-jrn-overlay] .jrn-modal')),
      imgs,
    };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [base = 'http://127.0.0.1:5174', out = 'artifacts/jurnl-f02-opus-audit/captures', vps = 'mobile,tablet,desktop', filter = ''] = process.argv.slice(2);
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: qaChromiumPath() });
  const report = [];
  for (const vp of vps.split(',')) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS[vp], deviceScaleFactor: 1 });
    // Every capture starts from an empty setup draft (fresh family state).
    await ctx.addInitScript(() => {
      try {
        sessionStorage.removeItem('jurnl.runtime.v1.setup');
      } catch {}
    });
    const errs = [];
    for (const [id, route, query] of CAPTURES) {
      if (filter && !id.includes(filter)) continue;
      const page = await ctx.newPage();
      page.on('pageerror', (e) => errs.push(String(e)));
      await page.goto(`${base}/production/jurnl/runtime/${route}${query ? `?${query}` : ''}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-jrn-screen]', { timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);
      const file = `${vp}-${id}.png`;
      await page.screenshot({ path: join(out, file) });
      report.push({ viewport: vp, id, route, query, file, ...(await measure(page)), pageErrors: [...errs] });
      errs.length = 0;
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  writeFileSync(join(out, 'CAPTURE_METRICS.json'), JSON.stringify(report, null, 2));
  console.log(`captured ${report.length}`);
}
