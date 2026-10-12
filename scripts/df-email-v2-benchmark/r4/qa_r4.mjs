// Email V2 R4 — contract, editorial, typographic and variety QA across the full 20-email pack.
//   contract  subject and primary CTA equal the copy contract (or the R3 benchmark contract that superseded it);
//             template tokens ⊆ contract placeholders + footer tokens + asset tokens
//   case      SITE 00-authored text is literal uppercase; sample values, URLs and tokens keep their case
//   type      display roles resolve to Barlow Condensed, everything else to Saira Semi Condensed
//   language  no internal system terms, no SaaS / luxury filler, no stock openers or contrast formulas
//   lines     at 390 / 768 / 1024 with web fonts: no one-word last line in body copy, no one-word headline line
//             created by a natural wrap, no word split across lines (fallback fonts reported, not failed)
//   variety   no display crop is reused between templates; no two templates share a headline
//   email     every image has alt; links are real hrefs; no script; no positioned elements
// Usage: node qa_r4.mjs   ·   writes qa/R4_QA.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..', '..');
const contractsMd = fs.readFileSync(path.join(repo, 'docs/site00/idnty/visual-authority/email-pack/DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md'), 'utf8');
const pack = JSON.parse(fs.readFileSync(path.join(here, 'emails', 'pack.json'), 'utf8'));

const contracts = {};
for (const section of contractsMd.split(/^## /m).slice(1)) {
  const id = section.split('\n')[0].trim();
  const field = (name) => (section.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.*)`)) || [])[1]?.trim();
  contracts[id] = {
    subject: field('Subject'),
    cta: field('Primary CTA'),
    secondary: field('Secondary CTA'),
    placeholders: (field('Placeholders') || '').match(/\{\{\w+\}\}/g) || [],
    destinationTokens: (field('Destination') || '').match(/\{\{\w+\}\}/g) || [],
  };
}
// The R3 benchmark copy contracts superseded subject and action for these two (B01_COPY_R3.md, B03_COPY_R3.md).
const R3_SUPERSEDED = {
  'personal-foundation-invitation': { subject: "WE'VE SET ASIDE A FOUNDATION FOR {{business_name}}", cta: 'BEGIN YOUR FOUNDATION' },
  M06: { subject: 'WHAT STANDS AT YOUR ADDRESS?', cta: 'TAKE A WALK THROUGH BLDR' },
};
const FOOTER_TOKENS = ['{{unsubscribe_url}}', '{{postal_address}}', '{{preference_url}}', '{{recipient_email}}'];
const ASSET_TOKENS = ['{{asset_base}}', '{{font_base}}'];
const SAMPLE_BACK = { 'Halden & Rowe': '{{business_name}}' };

const FORBIDDEN = [
  /\bartifact\b/i, /\bpayload\b/i, /\benqueue/i, /\bpipeline\b/i, /\bwebhook/i, /\btenant\b/i, /\bdispatch/i, /\bCRM\b/,
  /\bSTUDIO WORLD\b/i, /\bNDX\b/, /\bSaaS\b/i, /\blorem\b/i, /\bplaceholder\b/i, /\bDF-[A-Z]\d/, /\bT\d\d\b/,
  /\bunlock\b/i, /\bsupercharge/i, /\bseamless/i, /\belevate/i, /\bgame[- ]chang/i, /\bleverage\b/i, /\brevolution/i,
  /\bluxur/i, /\bexclusive\b/i, /\bworld[- ]class\b/i, /\bcutting[- ]edge\b/i, /\bbespoke\b/i, /\bcurated\b/i,
];
const BANNED_FORMULAS = [
  /\bDEAR VALUED\b/i, /\bWE'RE (SO )?EXCITED\b/i, /\bWE'RE THRILLED\b/i, /\bDON'T MISS\b/i, /\bACT NOW\b/i, /\bHURRY\b/i,
  /\bNOT JUST\b/i, /\bMORE THAN JUST\b/i, /\bISN'T JUST\b/i, /\bIT'S NOT ABOUT\b/i, /\bIN TODAY'S\b/i, /\bLOOK NO FURTHER\b/i,
  /\bHOPE THIS (EMAIL )?FINDS YOU\b/i, /\bCLICK HERE\b/i, /\bJUST WANTED TO\b/i,
];
const SHARED_GRAPHICS = /(icon-|lockup|plan-[abc]|completion-seal|perforation|seal)/;

const norm = (s) => s.replace(/[’‘]/g, "'").replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'");

// Runs in the page: every text block's lines, from word boxes, with forced <br> breaks marked.
function measureLines() {
  const wrap = document.querySelector('table.wrap');
  const SKIP = '.micro, .cap, .fig, .sh, .anno, .cta, .tok, .url, .num, .k, [aria-hidden="true"]';
  const isHeading = (el) => !!el.closest('.dp');
  const blocks = [...wrap.querySelectorAll('p, h1, h2, h3, td, div, li')].filter((el) => {
    if (!el.offsetParent || el.closest(SKIP) || el.matches(SKIP)) return false;
    const kids = [...el.childNodes];
    const hasText = kids.some((n) => n.nodeType === 3 && n.nodeValue.trim());
    const blockKid = [...el.children].some((c) => /^(P|H1|H2|H3|TABLE|DIV|TD|TR|LI|IMG)$/.test(c.tagName) && c.offsetParent);
    return hasText && !blockKid;
  });
  const out = [];
  for (const el of blocks) {
    const words = [];
    let forced = false;
    const walk = (node) => {
      for (const n of node.childNodes) {
        if (n.nodeType === 1) {
          if (n.tagName === 'BR') { forced = true; continue; }
          if (n.matches(SKIP)) continue;
          walk(n);
        } else if (n.nodeType === 3) {
          const re = /\S+/g;
          let m;
          while ((m = re.exec(n.nodeValue))) {
            const r = document.createRange();
            r.setStart(n, m.index);
            r.setEnd(n, m.index + m[0].length);
            const rects = [...r.getClientRects()].filter((x) => x.width > 0);
            if (!rects.length) continue;
            const tops = new Set(rects.map((x) => Math.round(x.top)));
            words.push({ w: m[0], top: Math.round(rects[0].top), split: tops.size > 1 && /[A-Za-z]{2}/.test(m[0]), forced });
            forced = false;
          }
        }
      }
    };
    walk(el);
    if (!words.length) continue;
    const lines = [];
    for (const w of words) {
      const last = lines[lines.length - 1];
      if (last && Math.abs(last.top - w.top) <= 4 && !w.forced) last.words.push(w);
      else lines.push({ top: w.top, words: [w], forcedBefore: w.forced });
    }
    out.push({
      heading: isHeading(el),
      text: el.innerText.replace(/\s+/g, ' ').trim().slice(0, 80),
      lines: lines.map((l) => ({ words: l.words.map((w) => w.w), forcedBefore: l.forcedBefore })),
      splits: words.filter((w) => w.split).map((w) => w.w),
    });
  }
  return out;
}

function lineFaults(blocks) {
  const isWord = (t) => /[A-Za-z0-9]/.test(t);
  const faults = [];
  for (const b of blocks) {
    const lines = b.lines.map((l) => ({ ...l, words: l.words.filter(isWord) })).filter((l) => l.words.length);
    for (const s of b.splits) faults.push(`word split across lines: "${s}" in "${b.text}"`);
    if (lines.length < 2) continue;
    lines.forEach((l, i) => {
      if (l.words.length !== 1) return;
      const naturalBefore = i > 0 && !l.forcedBefore;
      const naturalAfter = i < lines.length - 1 && !lines[i + 1].forcedBefore;
      const total = lines.reduce((n, x) => n + x.words.length, 0);
      if (!b.heading && total >= 3 && i === lines.length - 1 && naturalBefore) faults.push(`one-word last line "${l.words[0]}" in "${b.text}"`);
      if (b.heading && (naturalBefore || (i === 0 && naturalAfter))) faults.push(`one-word headline line "${l.words[0]}" in "${b.text}"`);
    });
  }
  return faults;
}

const browser = await chromium.launch({ headless: true });
const results = [];
const cropOwners = {};
const headlines = {};
for (const meta of pack.emails) {
  const id = meta.template_id;
  const c = contracts[id];
  if (!c) throw new Error(`${id}: no copy contract section`);
  const expect = { ...c, ...(R3_SUPERSEDED[id] || {}) };
  const file = pathToFileURL(path.join(here, 'emails', `${id}.html`)).href;
  const template = fs.readFileSync(path.join(here, 'emails', 'templates', `${id}.template.html`), 'utf8');

  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  await page.goto(file, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const dom = await page.evaluate(() => {
    const wrap = document.querySelector('table.wrap');
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
      if (/^[→■·—\s]+$/.test(t)) continue;
      if (display && !ff.startsWith('"Barlow Condensed"')) roleFails.push(`${t.slice(0, 40)} → ${ff}`);
      if (!display && !ff.startsWith('"Saira Semi Condensed"')) roleFails.push(`${t.slice(0, 40)} → ${ff}`);
    }
    const imgs = [...wrap.querySelectorAll('img')];
    const h1 = wrap.querySelector('h1');
    return {
      visible: wrap.innerText,
      alts: imgs.map((i) => i.alt).join('\n'),
      caseFails,
      roleFails,
      srcs: imgs.filter((i) => i.offsetParent || i.closest('.mob')).map((i) => i.getAttribute('src')),
      missingAlt: imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.getAttribute('src')),
      links: [...wrap.querySelectorAll('a')].map((a) => ({ text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') })),
      scripts: document.querySelectorAll('script').length,
      positioned: [...wrap.querySelectorAll('*')].filter((el) => ['absolute', 'fixed'].includes(getComputedStyle(el).position)).length,
      headline: h1 ? h1.innerText.replace(/\s+/g, ' ').trim() : '',
    };
  });

  const lines = {};
  const fallbackLines = {};
  for (const width of [390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(50);
    lines[width] = lineFaults(await page.evaluate(measureLines));
  }
  await page.close();
  const fb = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await fb.route(/\.(ttf|woff2?)$/, (r) => r.abort());
  await fb.goto(file, { waitUntil: 'networkidle' });
  for (const width of [390, 1024]) {
    await fb.setViewportSize({ width, height: 900 });
    await fb.waitForTimeout(50);
    fallbackLines[width] = lineFaults(await fb.evaluate(measureLines));
  }
  await fb.close();

  const subject = Object.entries(SAMPLE_BACK).reduce((s, [a, b]) => s.replaceAll(a, b), stripTags(meta.subject));
  const subjectOk = norm(subject) === norm(expect.subject);
  const ctaLink = dom.links.find((l) => norm(l.text).replace(/\s*→$/, '') === norm(expect.cta));
  const ctaOk = !!ctaLink && !!ctaLink.href && ctaLink.href !== '#';
  const secondaryOk = !expect.secondary || expect.secondary === 'NONE' || dom.links.some((l) => norm(l.text).startsWith(norm(expect.secondary)));
  const tokens = [...new Set(template.match(/\{\{\w+\}\}/g) || [])];
  const allowed = new Set([...expect.placeholders, ...expect.destinationTokens, ...FOOTER_TOKENS, ...ASSET_TOKENS]);
  const tokenFails = tokens.filter((t) => !allowed.has(t));
  if (template.includes('{{business_name}}') && !expect.placeholders.includes('{{business_name}}')) tokenFails.push('{{business_name}} not supplied');
  const prose = [dom.visible, dom.alts, stripTags(meta.subject), stripTags(meta.preheader)].join('\n');
  const language = [...FORBIDDEN, ...BANNED_FORMULAS].filter((re) => re.test(prose)).map(String);
  const badHrefs = dom.links.filter((l) => !l.href || (l.href === '#' && !/ROUTE PENDING/i.test(dom.visible)));

  for (const src of dom.srcs) {
    if (SHARED_GRAPHICS.test(src)) continue;
    (cropOwners[src] ||= new Set()).add(id);
  }
  if (dom.headline) (headlines[norm(dom.headline)] ||= []).push(id);

  const lineFails = Object.entries(lines).flatMap(([w, f]) => f.map((x) => `${w}: ${x}`));
  const r = {
    code: meta.code,
    id,
    family: meta.family,
    visual_class: meta.visual_class,
    subject_ok: subjectOk,
    subject: subject,
    subject_contract: expect.subject,
    subject_source: R3_SUPERSEDED[id] ? 'R3 benchmark copy contract' : 'DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md',
    cta_ok: ctaOk,
    cta: expect.cta,
    secondary_ok: secondaryOk,
    tokens,
    token_failures: tokenFails,
    uppercase_failures: dom.caseFails,
    type_role_failures: dom.roleFails,
    language_failures: language,
    line_failures: lineFails,
    fallback_line_notes: Object.entries(fallbackLines).flatMap(([w, f]) => f.map((x) => `${w}: ${x}`)),
    images_missing_alt: dom.missingAlt,
    bad_hrefs: badHrefs,
    scripts: dom.scripts,
    positioned_elements: dom.positioned,
    headline: dom.headline,
  };
  r.pass =
    subjectOk && ctaOk && secondaryOk && !tokenFails.length && !dom.caseFails.length && !dom.roleFails.length && !language.length &&
    !lineFails.length && !dom.missingAlt.length && !badHrefs.length && !dom.scripts && !dom.positioned;
  results.push(r);
  console.log(
    `${meta.code} ${id.padEnd(31)} ${r.pass ? 'PASS' : 'FAIL'} · subj ${subjectOk ? 'ok' : 'X'} · cta ${ctaOk ? 'ok' : 'X'} · tokens ${tokenFails.length} · case ${dom.caseFails.length} · type ${dom.roleFails.length} · lang ${language.length} · lines ${lineFails.length} (fallback ${r.fallback_line_notes.length})`,
  );
  if (!r.pass) {
    const show = { tokenFails, caseFails: dom.caseFails, roleFails: dom.roleFails, language, lineFails, badHrefs, subject: subjectOk ? undefined : [subject, expect.subject], cta: ctaOk ? undefined : [expect.cta, dom.links] };
    console.log(JSON.stringify(show, null, 2));
  }
}
await browser.close();

const reusedCrops = Object.entries(cropOwners).filter(([, s]) => s.size > 1).map(([src, s]) => ({ src, templates: [...s] }));
const dupHeadlines = Object.entries(headlines).filter(([, ids]) => ids.length > 1).map(([h, ids]) => ({ headline: h, templates: ids }));
const variety = { reused_crops: reusedCrops, duplicate_headlines: dupHeadlines, pass: !reusedCrops.length && !dupHeadlines.length };
console.log(`variety: ${variety.pass ? 'PASS' : 'FAIL'} · reused crops ${reusedCrops.length} · duplicate headlines ${dupHeadlines.length}`);
if (!variety.pass) console.log(JSON.stringify(variety, null, 2));

const summary = {
  version: 'R4',
  templates: results.length,
  passed: results.filter((r) => r.pass).length,
  variety,
  fallback_line_notes: results.reduce((n, r) => n + r.fallback_line_notes.length, 0),
  results,
};
fs.mkdirSync(path.join(here, 'qa'), { recursive: true });
fs.writeFileSync(path.join(here, 'qa', 'R4_QA.json'), JSON.stringify(summary, null, 2) + '\n');
if (results.some((r) => !r.pass) || !variety.pass) process.exitCode = 1;
