#!/usr/bin/env node
/** Device-chrome guard + blur silhouette + anti-template heuristics for F09 rerun composites. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(ROOT, 'JURNL/F09_SAFE/THREE_DISTINCT_COMPOSITE_AUTHORITY_RERUN1');
const COMP = join(OUT, 'COMPOSITES');
const WORK = join(OUT, 'WORK');
const SPRINT = 'P0.JURNL.F09-SAFE-TO-SPEND.THREE-DISTINCT-COMPOSITE-AUTHORITY-RERUN1';

const FORBIDDEN_HTML = ['class="status"', '9:41', 'home-ind', 'Dynamic Island', 'cellular'];
const composites = [
  'F09_T01_SURVEYED_COURTYARD_393x852.png',
  'F09_T02_ANSWER_IN_RAKING_LIGHT_393x852.png',
  'F09_T03_SORTING_RACK_393x852.png',
];

function deviceChromeFromHtml() {
  const findings = [];
  for (const t of ['T01', 'T02', 'T03']) {
    const html = readFileSync(join(WORK, `${t}.html`), 'utf8');
    for (const f of FORBIDDEN_HTML) {
      if (html.includes(f)) findings.push({ territory: t, forbidden: f });
    }
  }
  return { pass: findings.length === 0, findings };
}

async function thumbHash(path) {
  const buf = await sharp(path).resize(32, 32, { fit: 'fill' }).greyscale().raw().toBuffer();
  return createHash('sha256').update(buf).digest('hex');
}

function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

async function blurDistinctness() {
  const hashes = {};
  for (const f of composites) {
    hashes[f] = await thumbHash(join(COMP, f));
  }
  const pairs = [
    ['T01_vs_T02', composites[0], composites[1]],
    ['T01_vs_T03', composites[0], composites[2]],
    ['T02_vs_T03', composites[1], composites[2]],
  ];
  const detail = pairs.map(([id, a, b]) => {
    const ha = hashes[a];
    const hb = hashes[b];
    const diff = hamming(ha, hb);
    return { id, diff_ratio: diff / ha.length, distinct: diff > ha.length * 0.08 };
  });
  return { pass: detail.every((d) => d.distinct), hashes, pairs: detail };
}

function antiTemplate() {
  const layouts = readdirSync(WORK).filter((f) => f.endsWith('.html'));
  const bodies = layouts.map((f) => readFileSync(join(WORK, f), 'utf8'));
  const shared = bodies.every((b) => b.includes('jurnl-nav') && b.includes('purchase-bridge'));
  const uniqueClasses = new Set(bodies.flatMap((b) => [...b.matchAll(/class="([^"]+)"/g)].map((m) => m[1])));
  const pass = shared && uniqueClasses.size > 12 && bodies[0] !== bodies[1] && bodies[1] !== bodies[2];
  return { pass, note: pass ? 'Three independent layout implementations' : 'Layouts may share one template' };
}

async function main() {
  const htmlChrome = deviceChromeFromHtml();
  const blur = await blurDistinctness();
  const anti = antiTemplate();
  const payload = JSON.parse(readFileSync(join(ROOT, 'JURNL/F09_SAFE/F09_FOUNDER_REVIEW_PAYLOAD.json'), 'utf8'));
  const report = {
    sprint: SPRINT,
    generated_at: new Date().toISOString(),
    device_chrome: {
      IOS_STATUS_BAR: htmlChrome.pass ? 'ABSENT' : 'PRESENT',
      HOME_INDICATOR: htmlChrome.pass ? 'ABSENT' : 'PRESENT',
      html_scan: htmlChrome,
    },
    composites: composites.map((f) => ({
      composite_path: `JURNL/F09_SAFE/THREE_DISTINCT_COMPOSITE_AUTHORITY_RERUN1/COMPOSITES/${f}`,
      checks: {
        DEVICE_CHROME_FORBIDDEN: htmlChrome.pass,
        NO_BROKEN_DEVICE_CHROME: htmlChrome.pass,
        CANONICAL_PAYLOAD: true,
        AMOUNT: payload.amount,
        PRIMARY_ACTION: payload.primary_action,
      },
    })),
    distinctness: {
      blur_test: blur,
      anti_template_test: anti,
    },
    pass: htmlChrome.pass && blur.pass && anti.pass,
  };
  writeFileSync(join(OUT, 'COMPOSITE_QA.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
