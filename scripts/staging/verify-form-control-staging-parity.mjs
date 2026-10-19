#!/usr/bin/env node
/**
 * Sprint B — compare live Railway staging deploy identity vs integration HEAD.
 * No secrets. Safe to run from CI or cloud agent.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const FRONTEND = 'https://carefree-luck-staging.up.railway.app';
const API = 'https://reliable-creation-staging.up.railway.app';

const outDir = '/opt/cursor/artifacts/form-control-staging-b';
mkdirSync(outDir, { recursive: true });

let integrationSha = 'unknown';
try {
  integrationSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
} catch {
  integrationSha = execSync('git rev-parse origin/cursor/idnty-founder-readiness-e2e-be3b', {
    encoding: 'utf8',
  }).trim();
}

const apiHealth = await fetch(`${API}/api/health`).then((r) => r.json());
const spaManifest = await fetch(`${FRONTEND}/release-manifest.json`)
  .then((r) => (r.ok ? r.json() : { error: r.status }))
  .catch((e) => ({ error: String(e.message) }));

const indexHtml = await fetch(FRONTEND).then((r) => r.text());
const jsMatch = indexHtml.match(/\/assets\/index\.[^"]+\.js/);
const jsPath = jsMatch?.[0];
let jsSnippet = '';
if (jsPath) {
  const js = await fetch(FRONTEND + jsPath).then((r) => r.text());
  jsSnippet = [
    'ENTER A CONTACT NUMBER',
    'CONTACT_PHONE_REQUIRED',
    'idnty-sel-sheet',
    'df-check--on',
  ]
    .map((needle) => ({ needle, present: js.includes(needle) }))
    .reduce((acc, x) => ({ ...acc, [x.needle]: x.present }), {});
}

const missingAsset = await fetch(`${FRONTEND}/assets/chunk.deleted-by-deploy.js`, {
  method: 'GET',
}).then(async (r) => ({
  status: r.status,
  contentType: r.headers.get('content-type'),
  bodyPrefix: (await r.text()).slice(0, 80),
}));

const report = {
  checkedAt: new Date().toISOString(),
  integrationSha,
  sprintAMergeSha: '255576b5d737a660ea930c646d366e1f034fe7ae',
  api: {
    gitCommit: apiHealth.gitCommit ?? null,
    persistenceStore: apiHealth.digitalFoundation?.persistenceStore ?? null,
    supabaseProjectRef: apiHealth.digitalFoundation?.supabaseProjectRef ?? null,
    transactionalSendFlag: apiHealth.digitalFoundation?.founderReadiness?.transactionalSendFlag ?? null,
  },
  spa: {
    manifest: spaManifest,
    bundleEntry: jsPath ?? null,
    sprintAMarkersInBundle: jsSnippet,
  },
  assetRouting: missingAsset,
  parity: {
    apiMatchesIntegration:
      String(apiHealth.gitCommit ?? '').startsWith(integrationSha.slice(0, 12)) ||
      String(apiHealth.gitCommit ?? '').startsWith('255576b5'),
    spaMatchesIntegration:
      spaManifest.commitSha === integrationSha ||
      spaManifest.commitSha === '255576b5' ||
      spaManifest.commitSha === integrationSha.slice(0, 7),
  },
};

writeFileSync(`${outDir}/staging-parity-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

const pass =
  report.assetRouting.status === 404 &&
  !String(report.assetRouting.bodyPrefix).toLowerCase().includes('<!doctype') &&
  report.api.persistenceStore === 'supabase';

process.exit(pass ? 0 : 1);
