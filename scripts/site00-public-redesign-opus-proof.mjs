#!/usr/bin/env node
/**
 * SITE 00 public redesign — OPUS convergence proof harness (before/after per authority).
 *
 * For EVERY active authority: opens the live route in Chromium at the authority's own mobile framing
 * (390 CSS px wide, height from the authority aspect), captures a render, resizes the authority image
 * beside it, and records layout metrics. Visual PASS/PARTIAL/FAIL is a HUMAN judgement recorded in
 * SONNET-VISUAL-QA.md — this script only produces the evidence.
 *
 * Usage (run scripts/site00-cache-proof-fonts.sh once first — captures without Martian Mono are invalid):
 *   SITE00_AUTHORITY_PACK_DIR=/path/to/SITE00_PUBLIC_REDESIGN_AUTHORITY_PACK_SONNET_LITE \
 *   node scripts/site00-public-redesign-opus-proof.mjs --phase before|after|grok [--base http://localhost:5174] [--out docs/site00/public-redesign/opus-proof] [--only 01_ORIGIN_MAIN,...]
 *   then: node scripts/site00-public-redesign-triptych.mjs
 *
 * The intake API is MOCKED (route interception) so autosave/submit paths can be exercised against the
 * real client code without a server. Nothing here claims a real submission.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { routeProofFonts, routeRemoteStorage } from './lib/site00-proof-fonts.mjs';
import { AUTHORITIES, KEY, SIZES } from './lib/site00-public-redesign-authorities.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true']);
    return acc;
  }, []),
);
const BASE = args.base ?? 'http://localhost:5174';
const OUT = path.resolve(args.out ?? 'docs/site00/public-redesign/opus-proof');
const PHASE = args.phase ?? 'after'; // before | after
const PACK = process.env.SITE00_AUTHORITY_PACK_DIR;
const ONLY = args.only ? new Set(args.only.split(',')) : null;

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
  await routeRemoteStorage(page);
  if (!(await routeProofFonts(page))) console.warn('WARN: Martian Mono cache missing — run scripts/site00-cache-proof-fonts.sh (fallback font = invalid proof)');
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
  await page.screenshot({ path: path.join(dir, `${PHASE}.png`) });
  await page.screenshot({ path: path.join(dir, `${PHASE}-full.jpg`), type: 'jpeg', quality: 60, fullPage: true });

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
    // Final placeholder geometry for the Grok handoff (CSS px at this viewport, page coordinates).
    assetSlots: [...document.querySelectorAll('[data-asset-slot]')].map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        id: el.getAttribute('data-asset-slot'),
        x: Math.round(r.x),
        y: Math.round(r.y + scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
        radius: cs.borderRadius,
        z: getComputedStyle(el.parentElement).zIndex,
      };
    }),
  }));
  fs.writeFileSync(path.join(dir, `metrics-${PHASE}.json`), JSON.stringify({ route: a.route, ...metrics, errors }, null, 2));
  results.push({ id: a.id, route: a.route, ...metrics, errors });
  console.log(a.id.padEnd(40), metrics.finalUrl.padEnd(48), `h=${metrics.docHeight}`, metrics.overflowX ? 'OVERFLOW-X' : 'ok', errors.length ? `ERR:${errors[0]}` : '');
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, `_summary-${PHASE}.json`), JSON.stringify(results, null, 2));
await browser.close();
