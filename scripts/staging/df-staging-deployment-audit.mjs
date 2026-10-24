#!/usr/bin/env node
/**
 * Non-destructive staging deployment audit for Digital Foundation E2E branch.
 * Compares live Railway SHAs vs expected integration commit; probes SPA bundle for journey route.
 *
 * Usage:
 *   node scripts/staging/df-staging-deployment-audit.mjs
 *   EXPECTED_INTEGRATION_SHA=e907a6331 node scripts/staging/df-staging-deployment-audit.mjs
 */
const SPA = process.env.SITE00_STAGING_SPA_ORIGIN ?? 'https://carefree-luck-staging.up.railway.app';
const API = process.env.SITE00_STAGING_API_ORIGIN ?? 'https://reliable-creation-staging.up.railway.app';
const EXPECTED =
  process.env.EXPECTED_INTEGRATION_SHA?.trim() ||
  process.env.EXPECTED_DF_E2E_SHA?.trim() ||
  'e907a6331ee703967f7618c45f4c1b775337de80';

const ROUTE_MARKERS = [
  'foundation-email-journey',
  'start-automated-email-journey',
  'FoundationEmailJourneyPage',
];

async function main() {
  const out = {
    audited_at: new Date().toISOString(),
    spa_origin: SPA,
    api_origin: API,
    expected_integration_sha: EXPECTED,
    api: {},
    spa: {},
    deployment_match: false,
    e2e_route_in_spa_bundle: false,
    health_gate: null,
  };

  try {
    const healthRes = await fetch(`${API}/api/health`);
    out.api.status = healthRes.status;
    out.api.ok = healthRes.ok;
    const health = await healthRes.json();
    out.api.gitCommit = health.gitCommit ?? null;
    out.api.supabaseProjectRef = health.digitalFoundation?.supabaseProjectRef ?? null;
    out.api.persistSupabase = health.digitalFoundation?.persistSupabaseEnv ?? null;
    out.api.transactionalSendFlag = health.digitalFoundation?.founderReadiness?.transactionalSendFlag ?? null;
    out.api.stripeKeyMode = health.digitalFoundation?.founderReadiness?.stripeKeyMode ?? null;
    out.api.publicAppOrigin = health.digitalFoundation?.publicAppOriginEffective ?? null;
    out.deployment_match = Boolean(
      out.api.gitCommit && out.api.gitCommit.startsWith(EXPECTED.slice(0, 7)),
    );
  } catch (e) {
    out.api.error = String(e);
  }

  try {
    const spaRes = await fetch(SPA);
    out.spa.status = spaRes.status;
    const html = await spaRes.text();
    const jsMatch = html.match(/\/assets\/index\.[A-Za-z0-9_-]+\.js/);
    out.spa.indexBundle = jsMatch?.[0] ?? null;
    if (jsMatch) {
      const jsUrl = `${SPA}${jsMatch[0]}`;
      const jsRes = await fetch(jsUrl);
      out.spa.jsStatus = jsRes.status;
      out.spa.jsContentType = jsRes.headers.get('content-type');
      const js = await jsRes.text();
      out.e2e_route_in_spa_bundle = ROUTE_MARKERS.some((m) => js.includes(m));
      out.spa.route_markers_found = ROUTE_MARKERS.filter((m) => js.includes(m));
    }
  } catch (e) {
    out.spa.error = String(e);
  }

  try {
    const { spawnSync } = await import('node:child_process');
    const gate = spawnSync('node', ['scripts/staging/df-staging-health-gate.mjs'], {
      encoding: 'utf8',
      cwd: new URL('../..', import.meta.url).pathname,
    });
    out.health_gate = JSON.parse(gate.stdout || '{}');
  } catch (e) {
    out.health_gate = { parse_error: String(e) };
  }

  out.ready_for_live_e2e =
    out.deployment_match &&
    out.e2e_route_in_spa_bundle &&
    out.api.transactionalSendFlag !== undefined;

  console.log(JSON.stringify(out, null, 2));
  process.exit(out.deployment_match && out.e2e_route_in_spa_bundle ? 0 : 2);
}

main();
