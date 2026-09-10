#!/usr/bin/env node
/**
 * P0.DEPLOY.1 — Write dist/release-manifest.json after Vite production build.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const INDEX = join(DIST, 'index.html');
const OUT = join(DIST, 'release-manifest.json');

const VERSION = process.env.SITE00_RELEASE_VERSION ?? 'v271';

function resolveCommitSha() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 12);
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().slice(0, 12);
  } catch {
    return 'unknown';
  }
}

function resolveBundleEntry(html) {
  const scriptMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
  return scriptMatch ? scriptMatch[1] : null;
}

function buildReleaseId(version, commitSha) {
  const ver = version.replace(/^v/, '');
  const short = commitSha.replace(/^v/, '').slice(0, 7);
  return `site00-v${ver}-${short}`;
}

if (!existsSync(INDEX)) {
  console.error('site00-generate-release-manifest: dist/index.html not found — run vite build first');
  process.exit(1);
}

const commitSha = resolveCommitSha();
const html = readFileSync(INDEX, 'utf8');
const manifest = {
  releaseId: buildReleaseId(VERSION, commitSha),
  version: VERSION,
  commitSha,
  frontendBuild: VERSION,
  apiBuild: VERSION,
  workerBuild: VERSION,
  builtAt: new Date().toISOString(),
  bundleEntry: resolveBundleEntry(html),
};

writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${manifest.releaseId})`);
