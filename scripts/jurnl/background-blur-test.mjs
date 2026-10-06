/**
 * JURNL BACKGROUND BLUR TEST (P0.JURNL.MOBILE-COMPOSITION-CREATIVE-LANGUAGE-PAGINATION-REFINEMENT2 §4).
 * "Imagine the background image is blurred or removed — the family should still be recognizable through layout,
 * typographic rhythm, panel placement, data presentation, control placement, spatial hierarchy, interaction pattern."
 *
 * For every family root (live runtime, 393×852) this:
 *   1. captures the screen with the family plate BLURRED (filter on the real <img>) and REMOVED (bone field);
 *   2. reads a composition fingerprint from the DOM with the plate gone:
 *        occupancy  — 12 × 20 grid of where opaque panels sit (spatial grammar / card position)
 *        type_stack — top-to-bottom roles of the type (display vs sans, alignment, size band) (typographic stack)
 *        controls   — every control: horizontal band, width band, shape (button stack / control placement)
 *        left_dependence — share of panel area in the left 62% of the column (left-column dependence)
 *   3. compares every pair of families (Jaccard on occupancy, sequence equality on type/control stacks).
 * Usage: node scripts/jurnl/background-blur-test.mjs <baseUrl> <outDir> <label> [scenario=populated]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { FAMILY_ROOTS, QA_VIEWPORTS, openRoute } from './mobile-composition-qa.mjs';
import { qaChromiumPath } from './qa-env.mjs';

const GRID_X = 12;
const GRID_Y = 20;

async function fingerprint(page) {
  return page.evaluate(
    ([gx, gy]) => {
      const col = document.querySelector('.jrn-screen .jrn-col');
      const nav = document.querySelector('[data-jrn-zone="bottom-nav"]');
      const cr = col.getBoundingClientRect();
      const bottom = nav ? nav.getBoundingClientRect().top : cr.bottom;
      const inNav = (el) => !!el.closest('[data-jrn-zone="bottom-nav"]');
      const hidden = (el) => !!el.closest('[data-jrn-stage="offscreen"], [aria-hidden="true"]');
      const vis = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05;
      };
      const alpha = (c) => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return 0;
        const p = m[1].split(',').map((x) => parseFloat(x));
        return p.length === 4 ? p[3] : 1;
      };
      // Opaque surfaces = what still reads when the photograph is gone.
      const surfaces = [...col.querySelectorAll('*')].filter((el) => !inNav(el) && !hidden(el) && vis(el) && (alpha(getComputedStyle(el).backgroundColor) > 0.35 || getComputedStyle(el).backgroundImage.includes('gradient')));
      const grid = new Array(gx * gy).fill(0);
      let area = 0;
      let leftArea = 0;
      const W = cr.width;
      const H = bottom - cr.top;
      for (const el of surfaces) {
        const r = el.getBoundingClientRect();
        const x0 = Math.max(0, r.left - cr.left);
        const x1 = Math.min(W, r.right - cr.left);
        const y0 = Math.max(0, r.top - cr.top);
        const y1 = Math.min(H, r.bottom - cr.top);
        if (x1 <= x0 || y1 <= y0) continue;
        for (let gyI = Math.floor((y0 / H) * gy); gyI < Math.ceil((y1 / H) * gy); gyI++) for (let gxI = Math.floor((x0 / W) * gx); gxI < Math.ceil((x1 / W) * gx); gxI++) grid[gyI * gx + gxI] = 1;
      }
      // Panel-area left dependence on top-level surfaces only (avoid double-counting nested paper).
      const top = surfaces.filter((el) => !surfaces.some((o) => o !== el && o.contains(el)));
      for (const el of top) {
        const r = el.getBoundingClientRect();
        const a = r.width * r.height;
        area += a;
        const leftPart = Math.max(0, Math.min(r.right, cr.left + W * 0.62) - r.left) * r.height;
        leftArea += leftPart;
      }
      const band = (x) => (x < 0.38 ? 'L' : x > 0.62 ? 'R' : 'C');
      const texts = [...col.querySelectorAll('h1, h2, h3, p, b, dd, strong')]
        .filter((el) => !inNav(el) && !hidden(el) && vis(el) && el.textContent.trim() && el.getBoundingClientRect().bottom <= bottom)
        .filter((el) => ![...el.children].some((c) => /^(H1|H2|H3|P)$/.test(c.tagName)));
      const typeStack = texts
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        .map((el) => {
          const s = getComputedStyle(el);
          // the ink, not the block box: a full-width <p> with left-aligned text is LEFT
          const range = document.createRange();
          range.selectNodeContents(el);
          const r = range.getBoundingClientRect();
          const size = parseFloat(s.fontSize);
          const fam = /display|serif|cormorant|bodoni|didot|playfair/i.test(s.fontFamily) && !/sans/i.test(s.fontFamily) ? 'D' : 'S';
          const sizeBand = size >= 34 ? 'XL' : size >= 22 ? 'L' : size >= 14 ? 'M' : 'S';
          return `${fam}${sizeBand}${s.fontStyle === 'italic' ? 'i' : ''}:${band((r.left + r.width / 2 - cr.left) / W)}`;
        })
        // collapse consecutive repeats: rhythm, not item count
        .filter((v, i, a) => i === 0 || v !== a[i - 1]);
      const controls = [...col.querySelectorAll('button, a[href], input')]
        .filter((el) => !inNav(el) && !hidden(el) && vis(el) && el.getBoundingClientRect().bottom <= bottom)
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        .map((el) => {
          const r = el.getBoundingClientRect();
          const w = r.width / W;
          const kind = el.tagName === 'INPUT' ? 'I' : el.classList.contains('jrn-icon-btn') || r.width < 50 ? 'icon' : w > 0.8 ? 'full' : w > 0.42 ? 'half' : 'inline';
          return `${kind}:${band((r.left + r.width / 2 - cr.left) / W)}`;
        })
        .filter((v) => !v.startsWith('icon'));
      const h1 = col.querySelector('h1');
      const h1s = h1 ? getComputedStyle(h1) : null;
      return {
        occupancy: grid,
        occupancy_ratio: Math.round((grid.reduce((a, b) => a + b, 0) / grid.length) * 100) / 100,
        left_dependence: area ? Math.round((leftArea / area) * 100) / 100 : 0,
        type_stack: typeStack,
        controls,
        h1: h1 ? { text: h1.textContent.trim(), font: /sans/i.test(h1s.fontFamily) ? 'SANS' : 'DISPLAY', size: parseFloat(h1s.fontSize), align: h1s.textAlign, tracking: h1s.letterSpacing, italic: h1s.fontStyle === 'italic' } : null,
        archetype: document.querySelector('[data-jrn-archetype]')?.dataset.jrnArchetype ?? null,
      };
    },
    [GRID_X, GRID_Y],
  );
}

const jaccard = (a, b) => {
  let i = 0;
  let u = 0;
  for (let k = 0; k < a.length; k++) {
    if (a[k] || b[k]) u++;
    if (a[k] && b[k]) i++;
  }
  return u ? Math.round((i / u) * 100) / 100 : 1;
};
const seqSim = (a, b) => {
  // normalized LCS length: 1 = identical stack
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const m = Math.max(a.length, b.length);
  return m ? Math.round((dp[a.length][b.length] / m) * 100) / 100 : 1;
};

async function run() {
  const [baseUrl, outDir, label, scenario = 'populated'] = process.argv.slice(2);
  if (!baseUrl || !outDir || !label) throw new Error('usage: <baseUrl> <outDir> <label> [scenario]');
  const dir = join(outDir, label);
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: qaChromiumPath() });
  const fams = [];
  for (const [family, route] of FAMILY_ROOTS) {
    const { context, page, rendered } = await openRoute(browser, baseUrl, route, QA_VIEWPORTS.mobile, scenario);
    if (!rendered) {
      fams.push({ family, route, rendered: false });
      await context.close();
      continue;
    }
    await page.addStyleTag({ content: '.jrn-plate{filter:blur(22px) saturate(.55);transform:scale(1.08)}' });
    await page.waitForTimeout(250);
    const blurred = join(dir, `${family}_${route}_blurred.jpg`);
    await page.screenshot({ path: blurred, type: 'jpeg', quality: 78 });
    await page.addStyleTag({ content: '.jrn-plate{display:none}' });
    await page.waitForTimeout(150);
    const removed = join(dir, `${family}_${route}_removed.jpg`);
    await page.screenshot({ path: removed, type: 'jpeg', quality: 78 });
    fams.push({ family, route, rendered: true, blurred, removed, ...(await fingerprint(page)) });
    await context.close();
  }
  await browser.close();
  const ok = fams.filter((f) => f.rendered);
  const pairs = [];
  for (let i = 0; i < ok.length; i++)
    for (let j = i + 1; j < ok.length; j++) {
      const a = ok[i];
      const b = ok[j];
      pairs.push({
        a: a.family,
        b: b.family,
        adjacent: j === i + 1,
        occupancy_jaccard: jaccard(a.occupancy, b.occupancy),
        type_stack_similarity: seqSim(a.type_stack, b.type_stack),
        control_stack_similarity: seqSim(a.controls, b.controls),
      });
    }
  const out = { label, scenario, viewport: QA_VIEWPORTS.mobile, grid: [GRID_X, GRID_Y], families: fams.map(({ occupancy, ...f }) => ({ ...f, occupancy_rows: occupancy ? Array.from({ length: GRID_Y }, (_, y) => occupancy.slice(y * GRID_X, (y + 1) * GRID_X).join('')) : null })), pairs };
  writeFileSync(join(outDir, `${label}-blur-fingerprints.json`), `${JSON.stringify(out, null, 2)}\n`);
  for (const f of ok) console.log(`${f.family} ${String(f.archetype).padEnd(18)} occ=${f.occupancy_ratio} left=${f.left_dependence} h1=${f.h1?.font}/${f.h1?.align}/${f.h1?.size} type=${f.type_stack.slice(0, 6).join(' ')} ctl=${f.controls.slice(0, 5).join(' ')}`);
  const worst = [...pairs].sort((x, y) => y.occupancy_jaccard + y.type_stack_similarity + y.control_stack_similarity - (x.occupancy_jaccard + x.type_stack_similarity + x.control_stack_similarity)).slice(0, 6);
  console.log('most similar pairs:', worst.map((p) => `${p.a}/${p.b} occ=${p.occupancy_jaccard} type=${p.type_stack_similarity} ctl=${p.control_stack_similarity}`).join(' · '));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
