#!/usr/bin/env node
/**
 * P0.SITE00.PUBLIC-REDESIGN.FOUNDER-VISUAL-PATCH-AUDIT1
 * Diagnostic only — crawls preview, records broken imgs + asset placeholders.
 */
import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.SITE00_AUDIT_BASE_URL || 'http://127.0.0.1:5174';
const OUT_DIR = process.env.SITE00_AUDIT_OUT_DIR || 'docs/site00/public-redesign/FOUNDER_VISUAL_PATCH_AUDIT1';
const VIEWPORTS = process.env.SITE00_AUDIT_VIEWPORTS
  ? JSON.parse(process.env.SITE00_AUDIT_VIEWPORTS)
  : [
      { name: '390x844', width: 390, height: 844 },
      { name: '430x932', width: 430, height: 932 },
      { name: '360x800', width: 360, height: 800 },
    ];

/** Public SITE 00 surface — founder review branch (static crawl list). */
const ROUTES = [
  { id: 'origin-root', path: '/', family: 'ORIGIN', states: ['collapsed'] },
  { id: 'origin-alias', path: '/origin', family: 'ORIGIN', states: ['collapsed'] },
  { id: 'locations', path: '/origin/locations', family: 'LOCATIONS' },
  { id: 'idnty-state-overview', path: '/idnty/state', family: 'IDNTY' },
  { id: 'idnty-state-foundation', path: '/idnty/starting-at-zero', family: 'IDNTY' },
  { id: 'idnty-state-refine', path: '/idnty/some-pieces-exist', family: 'IDNTY' },
  { id: 'idnty-state-evolution', path: '/idnty/ready-for-evolution', family: 'IDNTY' },
  { id: 'idnty-state-build-ready', path: '/idnty/build-ready', family: 'IDNTY' },
  { id: 'idnty-hub', path: '/idnty', family: 'IDNTY' },
  { id: 'bldr-state-center', path: '/bldr/state', family: 'BLDR' },
  { id: 'bldr-path-overview', path: '/bldr/state?path=overview', family: 'BLDR' },
  { id: 'bldr-path-site', path: '/bldr/state?path=site', family: 'BLDR' },
  { id: 'bldr-path-world', path: '/bldr/state?path=world', family: 'BLDR' },
  { id: 'bldr-path-systems', path: '/bldr/state?path=systems', family: 'BLDR' },
  { id: 'bldr-path-extensions', path: '/bldr/state?path=extensions', family: 'BLDR' },
  { id: 'bldr-hub', path: '/bldr', family: 'BLDR' },
  { id: 'bldr-start', path: '/bldr/start', family: 'BLDR' },
  { id: 'evolve-state-center', path: '/evolve/state', family: 'EVOLVE' },
  { id: 'evolve-path-refine', path: '/evolve/state?path=refine', family: 'EVOLVE' },
  { id: 'evolve-path-install', path: '/evolve/state?path=install', family: 'EVOLVE' },
  { id: 'evolve-path-transform', path: '/evolve/state?path=transform', family: 'EVOLVE' },
  { id: 'evolve-hub', path: '/evolve', family: 'EVOLVE' },
  { id: 'enter', path: '/enter', family: 'ORIGIN' },
  { id: 'sites', path: '/sites', family: 'PUBLIC' },
  { id: 'services', path: '/services', family: 'PUBLIC' },
  { id: 'system', path: '/system', family: 'PUBLIC' },
  { id: 'about', path: '/about', family: 'PUBLIC' },
  { id: 'journal', path: '/journal', family: 'PUBLIC' },
  { id: 'support', path: '/support', family: 'PUBLIC' },
  { id: 'sign-in', path: '/origin/sign-in', family: 'AUTH' },
  { id: 'create-account', path: '/origin/create-account', family: 'AUTH' },
  { id: 'control-overview', path: '/control', family: 'YOUR_SPACE' },
  { id: 'control-sites', path: '/control/sites', family: 'YOUR_SPACE' },
  { id: 'projects', path: '/projects', family: 'PROJECTS' },
];

async function auditRoute(page, route, viewport) {
  const url = `${BASE}${route.path}`;
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch((e) => ({
    ok: false,
    error: String(e),
  }));
  if (res && typeof res === 'object' && 'error' in res) {
    return { route, viewport, loadError: res.error, brokenImages: [], placeholders: [], hasS00pr: false };
  }

  await page.waitForTimeout(1200);

  const metrics = await page.evaluate(() => {
    const broken = [];
    for (const img of document.querySelectorAll('img')) {
      const complete = img.complete;
      const nw = img.naturalWidth;
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith('data:')) continue;
      if (!complete || nw === 0) {
        broken.push({
          src: src.slice(0, 200),
          alt: img.alt || '',
          className: img.className?.slice?.(0, 120) || '',
        });
      }
    }
    const placeholders = [];
    for (const el of document.querySelectorAll('[data-asset-status="placeholder"]')) {
      placeholders.push({
        slot: el.getAttribute('data-asset-slot'),
        className: el.className?.slice?.(0, 80) || '',
      });
    }
    const hasS00pr = Boolean(document.querySelector('.s00pr-shell, .s00pr'));
    const title = document.title;
    return { broken, placeholders, hasS00pr, title };
  });

  const shotName = `${route.id}__${viewport.name}.png`.replace(/[^a-zA-Z0-9._-]/g, '_');
  const shotPath = path.join(OUT_DIR, 'screenshots', shotName);
  fs.mkdirSync(path.dirname(shotPath), { recursive: true });
  await page.screenshot({ path: shotPath, fullPage: true }).catch(() => {});

  return {
    route,
    viewport,
    url,
    ...metrics,
    screenshot: shotPath,
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let manifest = {};
  try {
    manifest = JSON.parse(await fetch(`${BASE}/release-manifest.json`).then((r) => r.text()));
  } catch {
    manifest = { error: 'manifest_unavailable' };
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    for (const route of ROUTES) {
      results.push(await auditRoute(page, route, vp));
    }
    await context.close();
  }

  await browser.close();

  const report = {
    sprint: 'P0.SITE00.PUBLIC-REDESIGN.FOUNDER-VISUAL-PATCH-AUDIT1',
    generatedAt: new Date().toISOString(),
    previewBaseUrl: BASE,
    releaseManifest: manifest,
    routesEnumerated: ROUTES.length,
    viewports: VIEWPORTS.map((v) => v.name),
    crawlResults: results,
  };

  fs.writeFileSync(path.join(OUT_DIR, 'crawl-raw.json'), JSON.stringify(report, null, 2));
  console.log(`Wrote ${OUT_DIR}/crawl-raw.json (${results.length} captures)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
