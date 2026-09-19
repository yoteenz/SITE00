#!/usr/bin/env node
/**
 * P0.DEPLOY.1 — Poll production backend + frontend and emit release receipt JSON.
 */
import { writeFileSync } from 'node:fs';

const FRONTEND_URL = (process.env.SITE00_FRONTEND_URL ?? 'https://site00.com').replace(/\/$/, '');
const API_URL = (process.env.SITE00_API_URL ?? 'https://api.site00.com').replace(/\/$/, '');
const EXPECTED_RELEASE_ID = process.env.EXPECTED_RELEASE_ID ?? '';
const EXPECTED_VERSION = process.env.EXPECTED_VERSION ?? '';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 15000);
const TIMEOUT_MS = Number(process.env.RAILWAY_POLL_TIMEOUT_MS ?? 600000);
const FRONTEND_POLL_TIMEOUT_MS = Number(process.env.FRONTEND_POLL_TIMEOUT_MS ?? 300000);
const SKIP_FRONTEND = process.env.SKIP_FRONTEND_VERIFY === 'true';

const RETRYABLE_FRONTEND_HTTP = new Set([403, 404, 408, 425, 429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, { headers: { Accept: 'application/json' }, ...options });
  if (!res.ok) {
    const err = new Error(`${url} HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function fetchText(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = new Error(`${url} HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.text();
}

export function isRetryableFrontendHttpStatus(status) {
  return RETRYABLE_FRONTEND_HTTP.has(Number(status));
}

function parseBackend(raw) {
  const release = raw.release ?? raw;
  return {
    ok: Boolean(raw.ok),
    releaseId: release.releaseId ?? null,
    commitSha: release.commitSha ?? raw.gitCommit ?? null,
    apiBuild: release.apiBuild ?? null,
    workerBuild: release.workerBuild ?? null,
    contractVersion: release.contractVersion ?? null,
    serviceReady: Boolean(release.serviceReady ?? raw.ok),
  };
}

function checkCompatibility(manifest, backend, frontend) {
  const fv = frontend?.version ?? manifest?.frontendBuild ?? null;
  const av = backend?.apiBuild ?? manifest?.apiBuild ?? null;
  const wv = backend?.workerBuild ?? manifest?.workerBuild ?? null;
  if (!fv || !av || !wv) return { status: 'UNKNOWN', compatible: false, messages: ['Missing version receipt'] };
  const versionsMatch = fv === av && av === wv;
  if (!versionsMatch) {
    return {
      status: 'VERSION_MISMATCH',
      compatible: false,
      messages: [`frontend=${fv} api=${av} worker=${wv}`],
    };
  }
  return { status: 'COMPATIBLE', compatible: true, messages: [] };
}

async function pollBackend(expectedReleaseId) {
  const deadline = Date.now() + TIMEOUT_MS;
  let lastError = 'timeout';
  while (Date.now() < deadline) {
    try {
      const raw = await fetchJson(`${API_URL}/api/health`);
      const backend = parseBackend(raw);
      if (backend.serviceReady) {
        if (!expectedReleaseId || backend.releaseId === expectedReleaseId) {
          return { ok: true, backend };
        }
        lastError = `releaseId mismatch: expected ${expectedReleaseId}, got ${backend.releaseId}`;
      } else {
        lastError = 'serviceReady=false';
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    console.log(`Backend poll: waiting (${lastError})…`);
    await sleep(POLL_INTERVAL_MS);
  }
  return { ok: false, backend: null, error: lastError };
}

const SPA_DEEP_LINK_PROBE = '/projects/site00/design';

async function verifySpaDeepLinkOnce() {
  const res = await fetch(`${FRONTEND_URL}${SPA_DEEP_LINK_PROBE}`, {
    headers: { Accept: 'text/html' },
    redirect: 'follow',
  });
  if (!res.ok) {
    const err = new Error(`${FRONTEND_URL}${SPA_DEEP_LINK_PROBE} HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const html = await res.text();
  const spaShell = html.includes('id="root"') || html.includes("id='root'");
  if (!spaShell) {
    throw new Error(`SPA deep link missing #root: ${FRONTEND_URL}${SPA_DEEP_LINK_PROBE}`);
  }
  return true;
}

async function verifyFrontendOnce(expectedReleaseId) {
  const manifest = await fetchJson(`${FRONTEND_URL}/release-manifest.json`);
  const html = await fetchText(`${FRONTEND_URL}/`);
  const smokeOk = html.includes('id="root"') || html.includes("id='root'");
  const deepLinkOk = await verifySpaDeepLinkOnce();
  const frontend = {
    ok: true,
    releaseId: manifest.releaseId ?? null,
    version: manifest.version ?? null,
    commitSha: manifest.commitSha ?? null,
    bundleEntry: manifest.bundleEntry ?? null,
  };
  const releaseMatch = !expectedReleaseId || frontend.releaseId === expectedReleaseId;
  return { ok: smokeOk && deepLinkOk && releaseMatch, manifest, frontend, smokeOk, deepLinkOk, releaseMatch };
}

async function pollFrontend(expectedReleaseId) {
  const deadline = Date.now() + FRONTEND_POLL_TIMEOUT_MS;
  let lastError = 'timeout';
  while (Date.now() < deadline) {
    try {
      const fe = await verifyFrontendOnce(expectedReleaseId);
      if (fe.ok) return { ok: true, ...fe };
      if (fe.releaseMatch === false) {
        return {
          ok: false,
          ...fe,
          error: `releaseId mismatch: expected ${expectedReleaseId}, got ${fe.frontend.releaseId}`,
        };
      }
      if (!fe.smokeOk) lastError = 'homepage missing #root';
      else if (fe.deepLinkOk === false) {
        lastError = `SPA deep link 404: ${SPA_DEEP_LINK_PROBE} — redeploy .htaccess + projects/.htaccess (rename htaccess-deploy.txt if needed)`;
      }
      else lastError = 'frontend smoke failed';
    } catch (err) {
      const status = err && typeof err === 'object' && 'status' in err ? err.status : null;
      lastError = err instanceof Error ? err.message : String(err);
      if (!isRetryableFrontendHttpStatus(status)) {
        return { ok: false, error: lastError };
      }
    }
    console.log(`Frontend poll: waiting (${lastError})…`);
    await sleep(POLL_INTERVAL_MS);
  }
  return { ok: false, error: lastError };
}

async function main() {
  const receipt = {
    releaseId: EXPECTED_RELEASE_ID,
    commitSha: process.env.GITHUB_SHA?.slice(0, 12) ?? null,
    frontendUrl: FRONTEND_URL,
    backendUrl: API_URL,
    status: 'FAILED',
    errors: [],
    stages: {},
  };

  const backendResult = await pollBackend(EXPECTED_RELEASE_ID);
  receipt.stages.VERIFY_BACKEND = backendResult.ok ? 'PASS' : 'FAIL';
  if (!backendResult.ok) {
    receipt.errors.push(`RAILWAY_HEALTH_FAILED: ${backendResult.error}`);
    receipt.status = 'PARTIAL';
    console.log(JSON.stringify(receipt, null, 2));
    process.exit(1);
  }
  receipt.backend = backendResult.backend;

  if (SKIP_FRONTEND) {
    receipt.stages.VERIFY_FRONTEND = 'SKIPPED';
    const av = receipt.backend?.apiBuild ?? null;
    const wv = receipt.backend?.workerBuild ?? null;
    if (EXPECTED_VERSION && av && wv) {
      const backendMatch = av === EXPECTED_VERSION && wv === EXPECTED_VERSION;
      receipt.stages.VERIFY_COMPATIBILITY = backendMatch ? 'SKIPPED' : 'FAIL';
      receipt.compatibilityStatus = backendMatch ? 'BACKEND_ONLY' : 'VERSION_MISMATCH';
      if (!backendMatch) {
        receipt.errors.push(`COMPATIBILITY_FAILED: backend api=${av} worker=${wv} expected ${EXPECTED_VERSION}`);
        receipt.status = 'PARTIAL';
        console.log(JSON.stringify(receipt, null, 2));
        process.exit(1);
      }
    } else if (!av || !wv) {
      receipt.stages.VERIFY_COMPATIBILITY = 'FAIL';
      receipt.compatibilityStatus = 'UNKNOWN';
      receipt.errors.push('COMPATIBILITY_FAILED: Missing backend apiBuild/workerBuild receipt');
      receipt.status = 'PARTIAL';
      console.log(JSON.stringify(receipt, null, 2));
      process.exit(1);
    } else {
      receipt.stages.VERIFY_COMPATIBILITY = 'SKIPPED';
      receipt.compatibilityStatus = 'BACKEND_ONLY';
    }
    receipt.status = 'BACKEND_READY';
    const outPath = process.env.RELEASE_RECEIPT_PATH;
    if (outPath) writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);
    console.log(JSON.stringify(receipt, null, 2));
    console.log('BACKEND READY ✓ (frontend verification skipped)');
    process.exit(0);
  }

  const fe = await pollFrontend(EXPECTED_RELEASE_ID);
  receipt.stages.VERIFY_FRONTEND = fe.ok ? 'PASS' : 'FAIL';
  if (fe.frontend) receipt.frontend = fe.frontend;
  if (fe.manifest) receipt.manifest = fe.manifest;
  if (!fe.ok) {
    receipt.errors.push(
      fe.releaseMatch === false
        ? 'VERSION_MISMATCH'
        : `FRONTEND_SMOKE_FAILED: ${fe.error ?? 'frontend verification failed'}`,
    );
    receipt.status = 'PARTIAL';
    console.log(JSON.stringify(receipt, null, 2));
    process.exit(1);
  }

  const compat = checkCompatibility(receipt.manifest, receipt.backend, receipt.frontend);
  receipt.stages.VERIFY_COMPATIBILITY = compat.compatible ? 'PASS' : 'FAIL';
  receipt.compatibilityStatus = compat.status;
  if (!compat.compatible) {
    receipt.errors.push(`COMPATIBILITY_FAILED: ${compat.messages.join('; ')}`);
    receipt.status = 'PARTIAL';
    console.log(JSON.stringify(receipt, null, 2));
    process.exit(1);
  }

  if (EXPECTED_VERSION && receipt.frontend?.version && receipt.frontend.version !== EXPECTED_VERSION) {
    receipt.errors.push(`VERSION_MISMATCH: expected ${EXPECTED_VERSION}, frontend ${receipt.frontend.version}`);
    receipt.status = 'PARTIAL';
    console.log(JSON.stringify(receipt, null, 2));
    process.exit(1);
  }

  receipt.status = 'READY';
  receipt.deployedAt = new Date().toISOString();
  const outPath = process.env.RELEASE_RECEIPT_PATH;
  if (outPath) writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify(receipt, null, 2));
  console.log('PRODUCTION READY ✓');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
