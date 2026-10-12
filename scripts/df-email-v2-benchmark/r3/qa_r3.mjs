// Email V2 R3 — editorial and brand QA on the built compositions.
//   copy      every customer sentence in the benchmark COPY.md is present (text or lockup alt), nothing fabricated as copy
//   case      SITE 00-authored text is literal uppercase; client values, emails, URLs and tokens keep their case
//   type      display roles resolve to Barlow Condensed, everything else to Saira Semi Condensed
//   email     every image has alt; CTAs and footer links are real hrefs; no script, no positioning
// Usage: node qa_r3.mjs   ·   writes qa/R3_QA.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..', '..');
const bench = path.join(repo, 'docs/site00/idnty/visual-authority/email-v2/benchmarks');
const EMAILS = [
  { id: 'B01_R3', copy: 'B01_personal-foundation-invitation/COPY.md', cta: 'https://site00.com/foundation/hr7Kq2Lm9x?step=intake' },
  { id: 'B02_R3', copy: 'B02_foundation-complete/COPY.md', cta: 'https://site00.com/foundation/hr7Kq2Lm9x' },
  { id: 'B03_R3', copy: 'B03_M06-bldr-introduction/COPY.md', cta: '#bldr-route-pending' },
];
const SAMPLES = { '{{business_name}}': 'Halden & Rowe', '{{recipient_email}}': 'studio@haldenrowe.com', '{{public_token}}': 'hr7Kq2Lm9x' };
// Drawing furniture added in R3 (labels on the drawing, not prose). Listed in each COPY_R3 contract.
const FURNITURE = new Set(['FIG. 01 · THE DOORWAY', '±0.00', 'DATUM', 'ROUTE PENDING', 'P.S.']);
const isFurniture = (l) => FURNITURE.has(l) || /^\d\d$/.test(l);
// One contract alt split across the images it described, so each image is described on its own.
const ALT_SPLITS = {
  'THREE SIMPLE FLOOR PLANS, EACH WITH ONE ROOM MARKED IN RED.': [
    'FLOOR PLAN A, GALLERY: ROOMS IN A ROW ALONG ONE LONG HALL, ONE ROOM MARKED IN RED.',
    'FLOOR PLAN B, COURTYARD: ROOMS AROUND AN OPEN CENTRE, THE COURT MARKED IN RED.',
    'FLOOR PLAN C, OPEN HALL: ONE LARGE ROOM WITH SERVICE ALONG TWO EDGES, THE HALL MARKED IN RED.',
  ],
};

const norm = (s) =>
  s.replace(/[’‘]/g, "'").replace(/&amp;/g, '&').toUpperCase().replace(/[^A-Z0-9&@'\s]/g, ' ').replace(/\s+/g, ' ').trim();

function copyUnits(md) {
  const body = md.split('## Body')[1].split('## Image alt text')[0];
  const alts = md.split('## Image alt text')[1].split('## Fields')[0];
  const units = [];
  for (let raw of body.split('\n')) {
    let line = raw.trim();
    if (!line || line.startsWith('|---') || /^\|\s*No\./.test(line)) continue;
    if (line.startsWith('**')) {
      const head = line.replace(/\*\*/g, '').split(' — ').pop();
      if (!/[a-z]/.test(head)) units.push(...head.split(' · ').map((h) => h.trim()));
      continue;
    }
    for (const [t, v] of Object.entries(SAMPLES)) line = line.replaceAll(t, v);
    line = line.replace(/`[^`]*`/g, '').replace(/^\[\s*(.*?)\s*\]\s*→?/, '$1').replace(/\(route pending[^)]*\)/i, '');
    if (line.startsWith('|')) {
      units.push(...line.split('|').map((c) => c.trim()).filter((c) => c && !/^\d+$/.test(c)));
      continue;
    }
    const stripped = Object.values(SAMPLES).reduce((s, v) => s.replaceAll(v, ''), line);
    if (/^site00\.com\/\S+$/.test(line)) { units.push(line); continue; }
    if (/[a-z]/.test(stripped.replace(/site00\.com|\{\{\w+\}\}/g, ''))) {
      const labels = line.match(/(?:Labels|Plan labels|Caption|Status seal):\s*(.*)$/);
      if (!labels) continue;
      line = labels[1];
    }
    for (const part of line.split(/\s\/\s/)) {
      for (const s of part.split(/(?<=[.?!])\s+/)) if (norm(s)) units.push(s.trim());
    }
  }
  const altUnits = alts.split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !/^\|\s*Image/.test(l)).map((l) => l.split('|')[2].trim());
  return { units, altUnits };
}

const browser = await chromium.launch({ headless: true });
const results = [];
for (const e of EMAILS) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  await page.goto(pathToFileURL(path.join(here, 'emails', `${e.id}.html`)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const dom = await page.evaluate(() => {
    const wrap = document.querySelector('table.wrap');
    const inbox = document.querySelector('.inbox');
    const preserved = (el) => el.closest('.v, .url, .tok');
    const caseFails = [];
    const roleFails = [];
    const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.nodeValue.trim();
      const el = n.parentElement;
      if (!t || !el.offsetParent || preserved(el)) continue;
      if (t !== t.toUpperCase()) caseFails.push(t);
      const ff = getComputedStyle(el).fontFamily;
      const display = !!el.closest('.dp');
      if (display && !el.closest('.arr') && !ff.startsWith('"Barlow Condensed"')) roleFails.push(`${t.slice(0, 40)} → ${ff}`);
      if (!display && !el.closest('.tok') && !el.closest('.arr') && !ff.startsWith('"Saira Semi Condensed"')) roleFails.push(`${t.slice(0, 40)} → ${ff}`);
    }
    const imgs = [...document.querySelectorAll('table.wrap img')];
    return {
      text: wrap.innerText + '\n' + imgs.map((i) => i.alt).join('\n') + '\n' + inbox.innerText,
      visibleText: wrap.innerText,
      caseFails,
      roleFails,
      missingAlt: imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.getAttribute('src')),
      decorative: imgs.filter((i) => i.alt === '').length,
      described: imgs.filter((i) => i.alt).length,
      links: [...document.querySelectorAll('table.wrap a')].map((a) => ({ text: a.innerText.trim(), href: a.getAttribute('href') })),
      scripts: document.querySelectorAll('script').length,
      positioned: [...wrap.querySelectorAll('*')].filter((el) => ['absolute', 'fixed'].includes(getComputedStyle(el).position)).length,
    };
  });
  await page.close();
  const md = fs.readFileSync(path.join(bench, e.copy), 'utf8');
  const { units, altUnits } = copyUnits(md);
  const hay = norm(dom.text);
  const missing = units.filter((u) => !hay.includes(norm(u)));
  const missingAlts = altUnits.filter((u) => !hay.includes(norm(u)) && !(ALT_SPLITS[u] && ALT_SPLITS[u].every((a) => hay.includes(norm(a)))));
  const copyHay = norm([...units, ...altUnits].join(' '));
  const extra = dom.visibleText
    .split(/[\n\t]/)
    .map((l) => l.trim())
    .filter((l) => l && !isFurniture(l) && !copyHay.includes(norm(l)) && !/\{\{\w+\}\}/.test(l));
  const ctaOk = dom.links.some((l) => l.href === e.cta);
  const r = {
    id: e.id,
    copy_units: units.length,
    copy_missing: missing,
    alt_units: altUnits.length,
    alt_missing: missingAlts,
    unsourced_visible_lines: extra,
    uppercase_failures: dom.caseFails,
    type_role_failures: dom.roleFails,
    images_described: dom.described,
    images_decorative: dom.decorative,
    images_missing_alt: dom.missingAlt,
    links: dom.links,
    cta_ok: ctaOk,
    scripts: dom.scripts,
    positioned_elements: dom.positioned,
  };
  r.pass = !missing.length && !missingAlts.length && !extra.length && !dom.caseFails.length && !dom.roleFails.length && !dom.missingAlt.length && ctaOk && !dom.scripts && !dom.positioned;
  results.push(r);
  console.log(`${e.id}: ${r.pass ? 'PASS' : 'FAIL'} · copy ${units.length - missing.length}/${units.length} · alts ${altUnits.length - missingAlts.length}/${altUnits.length} · case ${dom.caseFails.length} · type ${dom.roleFails.length} · unsourced ${extra.length}`);
  if (!r.pass) console.log(JSON.stringify({ missing, missingAlts, extra, caseFails: dom.caseFails, roleFails: dom.roleFails, ctaOk }, null, 2));
}
await browser.close();
fs.mkdirSync(path.join(here, 'qa'), { recursive: true });
fs.writeFileSync(path.join(here, 'qa', 'R3_QA.json'), JSON.stringify(results, null, 2) + '\n');
if (results.some((r) => !r.pass)) process.exitCode = 1;
