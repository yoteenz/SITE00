/**
 * JURNL CENTER-STAGE CONTRAST QA (P0.JURNL.MOBILE-COMPOSITION.CENTER-STAGE-NAV-ALIGNED-REFINEMENT3 §59–60).
 * For every visible text element on the nav-bearing roots (and the F01 EDGE_LED control): read its colour, re-render with
 * text made transparent, sample the REAL rendered backdrop under its box (plate + calm layer + panels), and score the
 * worst case (5th / 95th luminance percentile) against WCAG AA (4.5:1, large text 3:1). Also reports the focus ring.
 * Usage: node scripts/jurnl/center-stage-contrast-qa.mjs <runtimeBase> <out.json> [routes]
 */
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { openRoute } from './mobile-composition-qa.mjs';
import { qaChromiumPath } from './qa-env.mjs';

const ROUTES = [
  ['F01.00', 'entry', 'empty'],
  ['F03.00', 'today', 'populated'],
  ['F04.00', 'activity', 'populated'],
  ['F05.00', 'money', 'populated'],
  ['F06.00', 'income', 'populated'],
  ['F07.00', 'upcoming', 'populated'],
  ['F08.00', 'plan', 'populated'],
  ['F09.00', 'safe', 'populated'],
  ['F10.00', 'purchases', 'populated'],
  ['F11.00', 'trips', 'populated'],
  ['F12.00', 'credit', 'populated'],
  ['F13.00', 'paydown', 'populated'],
  ['F14.00', 'goals', 'populated'],
  ['F15.00', 'ahead', 'populated'],
  ['F16.00', 'records', 'populated'],
];

const lin = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

async function run() {
  const [base, out, filter = ''] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: qaChromiumPath() });
  const rows = [];
  for (const [id, route, scenario] of ROUTES.filter(([id]) => !filter || filter.split(',').includes(id))) {
    const { context, page } = await openRoute(browser, base, route, [393, 852], scenario);
    const texts = await page.evaluate(() => {
      const items = [];
      const walker = document.createTreeWalker(document.querySelector('.jrn'), NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = n.textContent.trim();
        const el = n.parentElement;
        if (!t || !el || el.closest('[aria-hidden="true"], [data-jrn-stage="offscreen"], .jrn-frame__live, svg')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.1) continue;
        range.selectNodeContents(n);
        const r = range.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue;
        const [cr, cg, cb, ca = 1] = parse(cs.color);
        const size = parseFloat(cs.fontSize);
        const weight = Number(cs.fontWeight) || 400;
        items.push({ text: t.slice(0, 32), x: r.left, y: r.top, w: r.width, h: r.height, rgb: [cr, cg, cb], alpha: ca, size, large: size >= 24 || (size >= 18.66 && weight >= 700), interactive: !!el.closest('button, a, input, [role="button"]') });
      }
      const focus = (() => {
        const b = document.querySelector('.jrn button.jrn-btn');
        if (!b) return null;
        b.focus({ focusVisible: true });
        const cs = getComputedStyle(b);
        return { outline: cs.outlineColor, style: cs.outlineStyle, width: cs.outlineWidth, shadow: cs.boxShadow };
      })();
      return { items, focus };
    });
    await page.addStyleTag({ content: '.jrn *{color:transparent!important;text-shadow:none!important;caret-color:transparent!important;-webkit-text-fill-color:transparent!important}' });
    await page.evaluate(() => document.activeElement?.blur?.());
    await page.waitForTimeout(200);
    const png = await page.screenshot({ type: 'png' });
    const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const results = texts.items.map((t) => {
      const ls = [];
      for (let y = Math.max(0, Math.floor(t.y)); y < Math.min(info.height, Math.ceil(t.y + t.h)); y++)
        for (let x = Math.max(0, Math.floor(t.x)); x < Math.min(info.width, Math.ceil(t.x + t.w)); x++) {
          const i = (y * info.width + x) * 3;
          ls.push(lum(data[i], data[i + 1], data[i + 2]));
        }
      ls.sort((a, b) => a - b);
      const lo = ls[Math.floor(ls.length * 0.05)] ?? 0;
      const hi = ls[Math.floor(ls.length * 0.95)] ?? 1;
      const tl = lum(...t.rgb);
      const worst = Math.min(ratio(tl, lo), ratio(tl, hi));
      const need = t.large ? 3 : 4.5;
      return { ...t, worst: Math.round(worst * 100) / 100, need, pass: worst >= need, backdrop_spread: Math.round((hi - lo) * 1000) / 1000 };
    });
    const fails = results.filter((r) => !r.pass);
    rows.push({ id, route, texts: results.length, pass: results.length - fails.length, fail: fails.length, min_ratio: Math.min(...results.map((r) => r.worst)), median_ratio: results.map((r) => r.worst).sort((a, b) => a - b)[Math.floor(results.length / 2)], busy_backdrops: results.filter((r) => r.backdrop_spread > 0.25).length, focus: texts.focus, failures: fails.slice(0, 12).map(({ text, worst, need, size, interactive, backdrop_spread }) => ({ text, worst, need, size, interactive, backdrop_spread })), busy: results.filter((r) => r.backdrop_spread > 0.25).map(({ text, worst, backdrop_spread, y }) => ({ text, worst, backdrop_spread, y: Math.round(y) })) });
    console.log(`${id.padEnd(8)} texts=${results.length} fail=${fails.length} min=${rows.at(-1).min_ratio} median=${rows.at(-1).median_ratio} busy=${rows.at(-1).busy_backdrops}`);
    await context.close();
  }
  await browser.close();
  writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
