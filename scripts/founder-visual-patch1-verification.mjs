#!/usr/bin/env node
/**
 * P0.SITE00.PUBLIC-REDESIGN.FOUNDER-VISUAL-PATCH1 — post-patch verification crawl.
 */
import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.SITE00_AUDIT_BASE_URL || 'http://127.0.0.1:5174';
const OUT_DIR = process.env.SITE00_PATCH1_OUT_DIR || 'docs/site00/public-redesign/FOUNDER_VISUAL_PATCH1';

const ASSESSMENT_ROUTES = [
  '/idnty/starting-at-zero/goal',
  '/idnty/starting-at-zero/audience',
  '/idnty/starting-at-zero/timeline',
  '/idnty/starting-at-zero/budget',
  '/idnty/starting-at-zero/review',
  '/idnty/some-pieces-exist/assets',
  '/idnty/some-pieces-exist/cohesion-diagnostic',
  '/idnty/some-pieces-exist/gaps',
  '/idnty/some-pieces-exist/review',
  '/idnty/ready-for-evolution/pathways',
  '/idnty/ready-for-evolution/goals',
  '/idnty/ready-for-evolution/timeline',
  '/idnty/ready-for-evolution/review',
  '/idnty/build-ready/verification',
  '/idnty/build-ready/evidence',
  '/idnty/build-ready/authority-check',
  '/idnty/build-ready/review',
];

const REDESIGN_ROUTES = [
  '/',
  '/origin',
  '/origin/locations',
  '/idnty/state',
  '/idnty/starting-at-zero',
  '/idnty/some-pieces-exist',
  '/idnty/ready-for-evolution',
  '/idnty/build-ready',
  '/bldr/state',
  '/bldr/state?path=systems',
  '/evolve/state',
  '/evolve/state?path=transform',
  ...ASSESSMENT_ROUTES,
];

function countBroken(pageMetrics) {
  return pageMetrics.broken?.length ?? 0;
}

async function brokenOnPage(page) {
  return page.evaluate(() => {
    const broken = [];
    for (const img of document.querySelectorAll('img')) {
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith('data:')) continue;
      if (!img.complete || img.naturalWidth === 0) {
        broken.push({ src: src.slice(0, 220), className: img.className });
      }
    }
    return { broken, hasS00pr: Boolean(document.querySelector('.s00pr-shell')) };
  });
}

async function originTransitionCycle(page, outDir) {
  const steps = [];
  const panels = [
    { key: 'collapsed', action: null },
    { key: 'idnty-open', label: 'EXPAND IDNTY' },
    { key: 'idnty-close', collapse: true },
    { key: 'bldr-open', label: 'EXPAND BLDR' },
    { key: 'bldr-close', collapse: true },
    { key: 'evolve-open', label: 'EXPAND EVOLVE' },
    { key: 'evolve-close', collapse: true },
  ];

  await page.goto(`${BASE}/origin`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  for (const step of panels) {
    if (step.label) {
      await page.goto(`${BASE}/origin`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(600);
      const btn = page.getByRole('button', { name: step.label });
      await btn.first().click({ timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    if (step.collapse) {
      await page.locator('button[aria-label="CLOSE PANEL"], button[aria-label="BACK"]').first().click({ timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(400);
    }
    const env = await page.evaluate(() => {
      const active = document.querySelector('.s00pr-origin-env-layer--active');
      return {
        activeEnv: active?.getAttribute('data-origin-env') ?? null,
        expandedShell: document.querySelector('.s00pr-shell--origin-expanded') !== null,
      };
    });
    const metrics = await brokenOnPage(page);
    const file = path.join(outDir, 'origin-transition', `${step.key}.png`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await page.screenshot({ path: file, fullPage: false });
    steps.push({ step: step.key, env, brokenCount: metrics.broken.length, broken: metrics.broken });
  }

  return steps;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  const routeResults = [];
  let totalBroken = 0;

  for (const routePath of REDESIGN_ROUTES) {
    await page.goto(`${BASE}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(900);
    const metrics = await brokenOnPage(page);
    totalBroken += metrics.broken.length;
    routeResults.push({ path: routePath, ...metrics });
  }

  const originPanels = [];
  for (const { panel, label } of [
    { panel: 'idnty', label: 'IDNTY' },
    { panel: 'bldr', label: 'BLDR' },
    { panel: 'evolve', label: 'EVOLVE' },
  ]) {
    await page.goto(`${BASE}/origin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    await page.locator('button.s00pr-origincard').filter({ hasText: label }).first().click({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const metrics = await brokenOnPage(page);
    const framework = await page.evaluate(() =>
      [...document.querySelectorAll('.s00pr-framework__icon')].map((el) => ({
        tag: el.tagName,
        nw: el.naturalWidth ?? null,
        src: el.src?.slice(0, 120),
      })),
    );
    originPanels.push({ panel, broken: metrics.broken, framework });
    totalBroken += metrics.broken.length;
  }

  const transitionSteps = await originTransitionCycle(page, OUT_DIR);

  await browser.close();

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    brokenResourceCount: totalBroken,
    routeResults,
    originPanels,
    originTransitionSteps: transitionSteps,
    assessmentRoutesEnumerated: ASSESSMENT_ROUTES.length,
    assessmentRoutesVerified: routeResults.filter((r) => ASSESSMENT_ROUTES.includes(r.path)).length,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'verification-crawl.json'), JSON.stringify(report, null, 2));
  console.log('Wrote', path.join(OUT_DIR, 'verification-crawl.json'), 'broken=', totalBroken);
}

main();
