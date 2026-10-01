#!/usr/bin/env node
/**
 * SITE 00 public redesign — browser proof harness (SONNET-STRUCTURE1).
 *
 * For EVERY active authority: opens the live route in Chromium at the authority's own mobile framing
 * (390 CSS px wide, height from the authority aspect), captures a render, resizes the authority image
 * beside it, and records layout metrics. Visual PASS/PARTIAL/FAIL is a HUMAN judgement recorded in
 * SONNET-VISUAL-QA.md — this script only produces the evidence.
 *
 * Usage:
 *   SITE00_AUTHORITY_PACK_DIR=/path/to/SITE00_PUBLIC_REDESIGN_AUTHORITY_PACK_SONNET_LITE \
 *   node scripts/site00-public-redesign-proof.mjs [--base http://localhost:5174] [--out docs/site00/public-redesign/sonnet-proof] [--only 01_ORIGIN_MAIN,...]
 *
 * The intake API is MOCKED (route interception) so autosave/submit paths can be exercised against the
 * real client code without a server. Nothing here claims a real submission.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true']);
    return acc;
  }, []),
);
const BASE = args.base ?? 'http://localhost:5174';
const OUT = path.resolve(args.out ?? 'docs/site00/public-redesign/sonnet-proof');
const PACK = process.env.SITE00_AUTHORITY_PACK_DIR;
const ONLY = args.only ? new Set(args.only.split(',')) : null;

const SIZES = { '941x1672': [390, 693], '1080x1920': [390, 693], '850x1850': [390, 849] };

/* ------------------------------------------------------------- IDNTY seeds */
const KEY = 'site00_idnty_assessment_v1';
const seed = (slug, answers) => ({ identityState: slug, currentStep: null, completedSteps: [], answers: { [slug]: answers } });
const FOUNDATION = seed('starting-at-zero', {
  goal: 'launch-brand',
  audience: 'Early-stage founders, creative entrepreneurs, and small business owners (B2B) who are building intentional brands.',
  timeline: '3-4',
  budget: '5k-10k',
});
const REFINE = seed('some-pieces-exist', {
  assets: ['logo', 'color', 'typography'],
  'cohesion-diagnostic': 'mostly-cohesive',
  gaps: ['inconsistent-visual', 'unclear-messaging', 'no-guidelines'],
});
const EVOLUTION = seed('ready-for-evolution', {
  pathways: ['visual-identity'],
  goals: 'Preserve brand recognition while creating a more cohesive, current visual and messaging system.',
  timeline: '3-4',
});
const BUILD_READY = seed('build-ready', {
  'evidence-strategy': ['brand-strategy', 'positioning', 'market-insights'],
  'evidence-visual': ['logo-files', 'brand-guidelines', 'typography', 'palette'],
  'evidence-voice': ['messaging', 'tone-of-voice', 'example-content'],
  'evidence-values': ['core-values', 'beliefs', 'esg-purpose'],
  'evidence-experience': [],
  'review-flags': ['VOICE'],
});

const idnty = (id, route, size, s, extra = {}) => ({ id, route, size, seed: s, ...extra });
const clickExpand = (label) => async (page) => {
  await page.getByRole('button', { name: label }).click();
  await page.waitForTimeout(700);
};

const AUTHORITIES = [
  { id: '01_ORIGIN_MAIN', route: '/', size: '941x1672', folder: '01_ORIGIN' },
  { id: '02_ORIGIN_IDNTY_EXPANDED', route: '/', size: '941x1672', folder: '01_ORIGIN', action: clickExpand('EXPAND IDNTY') },
  { id: '03_ORIGIN_BLDR_EXPANDED', route: '/', size: '941x1672', folder: '01_ORIGIN', action: clickExpand('EXPAND BLDR') },
  { id: '04_ORIGIN_EVOLVE_EXPANDED', route: '/', size: '941x1672', folder: '01_ORIGIN', action: clickExpand('EXPAND EVOLVE') },
  idnty('01_IDNTY_DIAGNOSTIC_OVERVIEW', '/idnty/state', '941x1672', null, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('02_IDNTY_STATE_00_FOUNDATION', '/idnty/starting-at-zero', '941x1672', FOUNDATION, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('03_IDNTY_STATE_01_REFINE', '/idnty/some-pieces-exist', '850x1850', REFINE, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('04_IDNTY_STATE_02_EVOLUTION', '/idnty/ready-for-evolution', '850x1850', EVOLUTION, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('05_IDNTY_STATE_03_BUILD_READY', '/idnty/build-ready', '850x1850', BUILD_READY, { folder: '02_IDNTY/00_DIAGNOSTIC' }),
  idnty('01_FOUNDATION_PRIMARY_GOAL', '/idnty/starting-at-zero/goal', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('02_FOUNDATION_AUDIENCE', '/idnty/starting-at-zero/audience', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('03_FOUNDATION_TIMELINE', '/idnty/starting-at-zero/timeline', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('04_FOUNDATION_BUDGET', '/idnty/starting-at-zero/budget', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('05_FOUNDATION_REVIEW', '/idnty/starting-at-zero/review', '1080x1920', FOUNDATION, { folder: '02_IDNTY/01_FOUNDATION' }),
  idnty('01_REFINE_EXISTING_ASSETS', '/idnty/some-pieces-exist/assets', '1080x1920', REFINE, { folder: '02_IDNTY/02_REFINE' }),
  idnty('02_REFINE_CONDITION', '/idnty/some-pieces-exist/cohesion-diagnostic', '1080x1920', REFINE, { folder: '02_IDNTY/02_REFINE' }),
  idnty('03_REFINE_GAPS', '/idnty/some-pieces-exist/gaps', '1080x1920', REFINE, { folder: '02_IDNTY/02_REFINE' }),
  idnty('04_REFINE_REVIEW', '/idnty/some-pieces-exist/review', '1080x1920', REFINE, { folder: '02_IDNTY/02_REFINE' }),
  idnty('01_EVOLUTION_AREAS', '/idnty/ready-for-evolution/pathways', '1080x1920', EVOLUTION, { folder: '02_IDNTY/03_READY_FOR_EVOLUTION' }),
  idnty('02_EVOLUTION_GOALS', '/idnty/ready-for-evolution/goals', '1080x1920', EVOLUTION, { folder: '02_IDNTY/03_READY_FOR_EVOLUTION' }),
  idnty('03_EVOLUTION_TIMELINE', '/idnty/ready-for-evolution/timeline', '1080x1920', EVOLUTION, { folder: '02_IDNTY/03_READY_FOR_EVOLUTION' }),
  idnty('04_EVOLUTION_REVIEW', '/idnty/ready-for-evolution/review', '1080x1920', EVOLUTION, { folder: '02_IDNTY/03_READY_FOR_EVOLUTION' }),
  idnty('01_BUILD_READY_VERIFICATION', '/idnty/build-ready/verification', '1080x1920', BUILD_READY, { folder: '02_IDNTY/04_BUILD_READY' }),
  idnty('02_BUILD_READY_EVIDENCE', '/idnty/build-ready/evidence', '1080x1920', BUILD_READY, { folder: '02_IDNTY/04_BUILD_READY' }),
  idnty('03_BUILD_READY_AUTHORITY_CHECK', '/idnty/build-ready/authority-check', '1080x1920', BUILD_READY, { folder: '02_IDNTY/04_BUILD_READY' }),
  idnty('04_BUILD_READY_REVIEW_VERIFICATION', '/idnty/build-ready/review', '1080x1920', BUILD_READY, { folder: '02_IDNTY/04_BUILD_READY' }),
  { id: '01_BLDR_COMMAND_CENTER', route: '/bldr/state', size: '941x1672', folder: '03_BLDR' },
  { id: '02_BLDR_OVERVIEW', route: '/bldr/state?path=overview', size: '941x1672', folder: '03_BLDR' },
  { id: '03_BLDR_SITE', route: '/bldr/state?path=site', size: '941x1672', folder: '03_BLDR' },
  { id: '04_BLDR_WORLD', route: '/bldr/state?path=world', size: '941x1672', folder: '03_BLDR' },
  { id: '05_BLDR_SYSTEMS', route: '/bldr/state?path=systems', size: '941x1672', folder: '03_BLDR' },
  { id: '06_BLDR_EXTENSIONS', route: '/bldr/state?path=extensions', size: '941x1672', folder: '03_BLDR' },
  { id: '01_EVOLVE_INTERVENTION_CENTER', route: '/evolve/state', size: '1080x1920', folder: '04_EVOLVE' },
  { id: '02_EVOLVE_REFINE', route: '/evolve/state?path=refine', size: '941x1672', folder: '04_EVOLVE' },
  { id: '03_EVOLVE_INSTALL', route: '/evolve/state?path=install', size: '941x1672', folder: '04_EVOLVE' },
  { id: '04_EVOLVE_TRANSFORM', route: '/evolve/state?path=transform', size: '941x1672', folder: '04_EVOLVE' },
  { id: '01_LOCATIONS_MAIN', route: '/origin/locations', size: '941x1672', folder: '05_LOCATIONS' },
];

const NOW = '2026-10-01T00:00:00.000Z';
const intake = (status) => ({
  id: 'proof-mock-intake',
  intakeType: 'IDENTITY',
  status,
  referenceCode: 'IDN-PROOF',
  email: null,
  domainLabel: 'proof',
  currentStep: null,
  totalSteps: null,
  createdAt: NOW,
  updatedAt: NOW,
  lastSavedAt: NOW,
  submittedAt: status === 'SUBMITTED' ? NOW : null,
  draftPayload: {},
  submittedPayload: null,
  version: 1,
  source: 'proof-harness-mock',
  sourceRoute: null,
});

async function mockIntakeApi(page) {
  await page.route('**/api/site00/intakes**', async (route) => {
    const action = new URL(route.request().url()).searchParams.get('action');
    const body = { intake: intake(action === 'submit' ? 'SUBMITTED' : 'ACTIVE') };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/api/site00/**', (route) => {
    if (route.request().url().includes('/intakes')) return route.fallback();
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const results = [];

for (const a of AUTHORITIES) {
  if (ONLY && !ONLY.has(a.id)) continue;
  const [w, h] = SIZES[a.size];
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await mockIntakeApi(page);
  if (a.seed) {
    await page.addInitScript(([key, value]) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* ignore */
      }
    }, [KEY, a.seed]);
  }
  await page.goto(BASE + a.route, { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  if (a.action) await a.action(page);
  // The Mobile/Desktop preview toggle is an existing founder control that overlaps the header; hide it
  // for geometry comparison only (documented in SONNET-VISUAL-QA.md).
  await page.addStyleTag({ content: '.site00-origin-layout-switch{display:none !important}' });
  await page.waitForTimeout(250);

  const dir = path.join(OUT, a.id);
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, 'render.jpg'), type: 'jpeg', quality: 72 });
  await page.screenshot({ path: path.join(dir, 'render-full.jpg'), type: 'jpeg', quality: 60, fullPage: true });

  if (PACK) {
    const src = path.join(PACK, a.folder, `${a.id}.jpg`);
    if (fs.existsSync(src)) await sharp(src).resize({ width: w }).jpeg({ quality: 72 }).toFile(path.join(dir, 'authority.jpg'));
  }

  const metrics = await page.evaluate(() => ({
    finalUrl: location.pathname + location.search,
    viewport: [innerWidth, innerHeight],
    docHeight: document.documentElement.scrollHeight,
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    uppercaseViolations: [...document.querySelectorAll('.s00pr *')]
      .filter((el) => el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
      .filter((el) => !['TEXTAREA', 'INPUT', 'STYLE', 'SCRIPT'].includes(el.tagName))
      .filter((el) => getComputedStyle(el).textTransform !== 'uppercase')
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`)
      .slice(0, 5),
    navPresent: Boolean(document.querySelector('.s00pr .site00-mobile-nav')),
  }));
  fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify({ route: a.route, ...metrics, errors }, null, 2));
  results.push({ id: a.id, route: a.route, ...metrics, errors });
  console.log(a.id.padEnd(40), metrics.finalUrl.padEnd(48), `h=${metrics.docHeight}`, metrics.overflowX ? 'OVERFLOW-X' : 'ok', errors.length ? `ERR:${errors[0]}` : '');
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, '_summary.json'), JSON.stringify(results, null, 2));
await browser.close();
