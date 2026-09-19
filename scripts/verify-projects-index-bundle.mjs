#!/usr/bin/env node
/**
 * B5.9R8R1 — Verify production bundle excludes legacy /projects client-variant strings.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const INDEX_HTML = readFileSync(join(DIST, 'index.html'), 'utf8');
const indexMatch = INDEX_HTML.match(/assets\/(index\.[A-Za-z0-9_-]+\.js)/);
if (!indexMatch) {
  console.error('PROJECTS_BUNDLE_VERIFY: no index chunk in dist/index.html');
  process.exit(1);
}

const indexChunk = indexMatch[1];
const assetDir = join(DIST, 'assets');
const allJs = readdirSync(assetDir).filter((f) => f.endsWith('.js'));

function chunkContains(name, needle) {
  return readFileSync(join(assetDir, name), 'utf8').includes(needle);
}

const projectsChunks = allJs.filter((f) => chunkContains(f, 'data-site00-shell'));
if (projectsChunks.length === 0) {
  console.error('PROJECTS_BUNDLE_VERIFY: no ProjectsPage lazy chunk found');
  process.exit(1);
}

const bannedInProjects = [
  'RETURN TO FOUNDER VIEW',
  'site00-pidx-client-banner',
  'site00-pidx-summary--client',
  'ProjectIndexClientSimulationBanner',
  'YOUR PROJECTS. ONE SYSTEM.',
];

const requiredInProjects = [
  'ALL PROJECTS. ONE SYSTEM.',
  'data-site00-shell',
  'data-site00-hero',
  'data-site00-metrics',
];

const failures = [];

for (const chunk of projectsChunks) {
  for (const needle of bannedInProjects) {
    if (chunkContains(chunk, needle)) {
      failures.push({ class: 'PROJECTS_LEGACY_CLIENT_VARIANT_ACTIVE', message: `${needle} in ${chunk}` });
    }
  }
  for (const needle of requiredInProjects) {
    if (!chunkContains(chunk, needle)) {
      failures.push({ class: 'PROJECTS_RUNTIME_TREE_DIVERGENCE', message: `Missing ${needle} in ${chunk}` });
    }
  }
}

const posBannerChunks = allJs.filter((f) => chunkContains(f, 'RETURN TO FOUNDER VIEW'));

console.log(JSON.stringify({
  ok: failures.length === 0,
  expectedBundle: indexChunk,
  projectsChunks,
  failures,
  posBannerOnlyInLazyChunks: posBannerChunks.filter((f) => !projectsChunks.includes(f)),
}, null, 2));

process.exit(failures.length === 0 ? 0 : 1);
