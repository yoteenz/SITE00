#!/usr/bin/env node
/**
 * Non-destructive staging health gate for Digital Foundation (no secrets).
 * Usage: node scripts/staging/df-staging-health-gate.mjs
 */
const SPA = process.env.SITE00_STAGING_SPA_ORIGIN ?? 'https://carefree-luck-staging.up.railway.app';
const API = process.env.SITE00_STAGING_API_ORIGIN ?? 'https://reliable-creation-staging.up.railway.app';

async function check(label, url, expect) {
  const res = await fetch(url, { redirect: 'follow' });
  const ct = res.headers.get('content-type') ?? '';
  const ok = expect(res.status, ct);
  return { label, url, status: res.status, contentType: ct, pass: ok };
}

const results = [];

try {
  const health = await fetch(`${API}/api/health`);
  const healthJson = await health.json();
  results.push({
    label: 'API health',
    pass: health.ok && healthJson.ok === true,
    status: health.status,
    gitCommit: healthJson.gitCommit,
    persist: healthJson.digitalFoundation?.persistSupabaseEnv,
    sendFlag: healthJson.digitalFoundation?.founderReadiness?.transactionalSendFlag,
  });
} catch (e) {
  results.push({ label: 'API health', pass: false, error: String(e) });
}

try {
  const spa = await fetch(SPA);
  const html = await spa.text();
  const jsMatch = html.match(/\/assets\/index\.[A-Za-z0-9_-]+\.js/);
  results.push({
    label: 'SPA shell',
    pass: spa.ok && Boolean(jsMatch),
    status: spa.status,
    bundle: jsMatch?.[0] ?? null,
  });
  if (jsMatch) {
    const jsUrl = `${SPA}${jsMatch[0]}`;
    const js = await fetch(jsUrl);
    results.push({
      label: 'SPA JS asset MIME',
      pass: js.ok && (js.headers.get('content-type') ?? '').includes('javascript'),
      status: js.status,
      contentType: js.headers.get('content-type'),
    });
  }
  const fake = await fetch(`${SPA}/assets/does-not-exist-site00-df.js`);
  results.push({
    label: 'Missing JS not HTML',
    pass: fake.status === 404 && !(fake.headers.get('content-type') ?? '').includes('text/html'),
    status: fake.status,
    contentType: fake.headers.get('content-type'),
  });
} catch (e) {
  results.push({ label: 'SPA checks', pass: false, error: String(e) });
}

try {
  const admin = await fetch(`${API}/api/admin/site00-foundation?action=readiness-report`);
  results.push({
    label: 'Admin API auth gate',
    pass: admin.status === 401,
    status: admin.status,
  });
} catch (e) {
  results.push({ label: 'Admin API auth gate', pass: false, error: String(e) });
}

const failed = results.filter((r) => !r.pass);
console.log(JSON.stringify({ ok: failed.length === 0, spa: SPA, api: API, results }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
