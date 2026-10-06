#!/usr/bin/env npx tsx
/**
 * JURNL live RLS + production sync proof gate.
 * Requires real Supabase + API (non-mock). Uses user JWTs — not service role — for RLS proof.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildQaLiveSnapshot, JURNL_QA_LIVE_MARKER } from './live-proof/buildQaSnapshot.js';
import type { LiveProofReport, LiveProofStepResult } from './live-proof/liveProofTypes.js';
import { writeLiveProofArtifacts } from './write-live-proof-artifacts.js';

const OUT = join(process.cwd(), 'docs/jurnl/structural-completion/wave5-live-proof');

function env(name: string): string {
  return (process.env[name] ?? '').trim();
}

function step(id: string, ok: boolean, detail?: string, skip = false): LiveProofStepResult {
  return { id, status: skip ? 'SKIP' : ok ? 'PASS' : 'FAIL', detail };
}

async function waitForHealth(base: string, ms = 60_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/health`);
      if (res.ok) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function ensureQaUsers(): Promise<{ ok: boolean; detail: string }> {
  const url = env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
  const service = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !service) return { ok: false, detail: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for QA setup' };
  if (env('JURNL_LIVE_QA_SETUP') !== '1') return { ok: true, detail: 'QA setup skipped (users must exist)' };

  const emails = [env('JURNL_QA_USER_A_EMAIL'), env('JURNL_QA_USER_B_EMAIL')].filter(Boolean);
  const passwords = [env('JURNL_QA_USER_A_PASSWORD'), env('JURNL_QA_USER_B_PASSWORD')];
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const password = passwords[i];
    if (!email || !password) continue;
    const res = await fetch(`${url.replace(/\/$/, '')}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${service}`,
        apikey: service,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { qa: 'jurnl-live-proof' } }),
    });
    if (res.ok || res.status === 422) continue;
    const body = await res.text();
    return { ok: false, detail: `QA user create failed for ${email}: ${res.status} ${body.slice(0, 200)}` };
  }
  return { ok: true, detail: 'QA users ensured (or already exist)' };
}

async function signIn(
  url: string,
  anon: string,
  email: string,
  password: string,
): Promise<{ client: SupabaseClient; userId: string; accessToken: string } | null> {
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.user) return null;
  return { client, userId: data.session.user.id, accessToken: data.session.access_token };
}

async function rlsMatrix(
  clientA: SupabaseClient,
  clientB: SupabaseClient,
  userAId: string,
  anonClient: SupabaseClient,
): Promise<LiveProofStepResult[]> {
  const tables = ['jurnl_user_snapshots', 'jurnl_record_files', 'jurnl_mutation_idempotency'] as const;
  const out: LiveProofStepResult[] = [];

  for (const table of tables) {
    const own = await clientA.from(table).select('*').eq('user_id', userAId);
    out.push(step(`RLS_${table}_USER_A_OWN`, !own.error, own.error?.message));

    const cross = await clientB.from(table).select('*').eq('user_id', userAId);
    const denied = !cross.error && (cross.data?.length ?? 0) === 0;
    out.push(step(`RLS_${table}_USER_B_DENY_READ`, denied, cross.error?.message ?? `rows=${cross.data?.length ?? 0}`));

    if (table === 'jurnl_user_snapshots') {
      const mut = await clientB.from(table).update({ schema_version: 5 }).eq('user_id', userAId).select();
      const mutDenied = Boolean(mut.error) || (mut.data?.length ?? 0) === 0;
      out.push(step(`RLS_${table}_USER_B_DENY_UPDATE`, mutDenied, mut.error?.message));
    }

    const anon = await anonClient.from(table).select('*').limit(1);
    const anonDenied = Boolean(anon.error) || (anon.data?.length ?? 0) === 0;
    out.push(step(`RLS_${table}_ANON_DENY`, anonDenied, anon.error?.message));
  }
  return out;
}

async function apiRepositoryRoundTrip(
  apiBase: string,
  token: string,
  snapshot: ReturnType<typeof buildQaLiveSnapshot>,
): Promise<LiveProofStepResult[]> {
  const base = apiBase.replace(/\/$/, '');
  const put = await fetch(`${base}/api/jurnl/repository`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Jurnl-Idempotency-Key': `live-proof-${snapshot.updatedAt}`,
    },
    body: JSON.stringify({ snapshot, expectedUpdatedAt: null }),
  });
  const putOk = put.ok;
  const putBody = putOk ? ((await put.json()) as { updatedAt?: string }) : null;

  const get = await fetch(`${base}/api/jurnl/repository`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getJson = get.ok ? ((await get.json()) as { snapshot?: { transactions?: { merchant?: string }[] } }) : null;
  const marker =
    getJson?.snapshot?.transactions?.some((t) => t.merchant === JURNL_QA_LIVE_MARKER) ?? false;

  const dup = await fetch(`${base}/api/jurnl/repository`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Jurnl-Idempotency-Key': `live-proof-${snapshot.updatedAt}`,
    },
    body: JSON.stringify({ snapshot, expectedUpdatedAt: putBody?.updatedAt ?? null }),
  });
  const dupJson = dup.ok ? ((await dup.json()) as { idempotent?: boolean }) : null;

  return [
    step('USER_A_SERVER_WRITE', putOk, putOk ? undefined : await put.text()),
    step('USER_A_SERVER_READ', marker, marker ? undefined : 'marker missing after GET'),
    step('IDEMPOTENCY_SNAPSHOT', Boolean(dupJson?.idempotent), dup.ok ? undefined : await dup.text()),
  ];
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const steps: LiveProofStepResult[] = [];
  const url = env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
  const anon = env('SUPABASE_ANON_KEY') || env('VITE_SUPABASE_ANON_KEY');
  const localPort = env('JURNL_LIVE_API_PORT') || '8787';
  let apiBase = env('JURNL_LIVE_API_BASE') || env('VITE_API_BASE') || `http://127.0.0.1:${localPort}`;
  let serverProc: ChildProcess | null = null;

  if (env('JURNL_LIVE_PROOF') !== '1') {
    const report: LiveProofReport = {
      sprint: 'P0.JURNL.WAVE5-LIVE-RLS-AND-PRODUCTION-SYNC-PROOF',
      generated_at: new Date().toISOString(),
      environment: 'SKIP',
      steps: [step('ENV_GUARD', false, 'Set JURNL_LIVE_PROOF=1 to run live gate', true)],
      gate_status: 'AWAITING_GITHUB_ACTIONS_LIVE_PROOF',
      supabase_reachable: false,
      api_base: apiBase,
    };
    writeLiveProofArtifacts(report);
    console.log('Live proof skipped (JURNL_LIVE_PROOF!=1). Artifacts written with AWAITING status.');
    process.exit(0);
  }

  if (!url || !anon) {
    steps.push(step('ENV_SUPABASE', false, 'Missing SUPABASE_URL and SUPABASE_ANON_KEY'));
  } else {
    try {
      const health = await fetch(`${url.replace(/\/$/, '')}/auth/v1/health`, {
        headers: { apikey: anon },
        signal: AbortSignal.timeout(20_000),
      });
      steps.push(step('SUPABASE_REACHABLE', health.ok, `status=${health.status}`));
    } catch (e) {
      steps.push(step('SUPABASE_REACHABLE', false, String(e)));
    }
  }

  const emailA = env('JURNL_QA_USER_A_EMAIL');
  const passA = env('JURNL_QA_USER_A_PASSWORD');
  const emailB = env('JURNL_QA_USER_B_EMAIL');
  const passB = env('JURNL_QA_USER_B_PASSWORD');
  if (!emailA || !passA || !emailB || !passB) {
    steps.push(step('QA_USER_ENV', false, 'Missing JURNL_QA_USER_A_* and JURNL_QA_USER_B_*'));
  }

  const setup = await ensureQaUsers();
  steps.push(step('QA_USER_SETUP', setup.ok, setup.detail));

  if (!url || !anon || !emailA || !passA) {
    const report: LiveProofReport = {
      sprint: 'P0.JURNL.WAVE5-LIVE-RLS-AND-PRODUCTION-SYNC-PROOF',
      generated_at: new Date().toISOString(),
      environment: 'FAIL',
      steps,
      gate_status: 'FAIL',
      supabase_reachable: steps.some((s) => s.id === 'SUPABASE_REACHABLE' && s.status === 'PASS'),
      api_base: apiBase,
    };
    writeLiveProofArtifacts(report);
    process.exit(1);
  }

  if (!env('JURNL_LIVE_API_BASE') && !env('VITE_API_BASE')) {
    serverProc = spawn('npx', ['tsx', 'server/index.ts'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: localPort,
        SUPABASE_URL: url,
        SUPABASE_ANON_KEY: anon,
      },
      stdio: 'ignore',
    });
    const up = await waitForHealth(apiBase);
    steps.push(step('API_LOCAL_START', up, up ? undefined : 'Local API did not become healthy'));
    if (!up) {
      serverProc.kill();
      writeLiveProofArtifacts(failReport(steps, apiBase, false));
      process.exit(1);
    }
  }

  const sessionA1 = await signIn(url, anon, emailA, passA);
  steps.push(step('USER_A_AUTH', Boolean(sessionA1)));
  if (!sessionA1) {
    writeLiveProofArtifacts(failReport(steps, apiBase, true));
    serverProc?.kill();
    process.exit(1);
  }

  const anonClient = createClient(url, anon, { auth: { persistSession: false } });
  const sessionB = await signIn(url, anon, emailB, passB);
  steps.push(step('USER_B_AUTH', Boolean(sessionB)));
  if (!sessionB) {
    writeLiveProofArtifacts(failReport(steps, apiBase, true));
    serverProc?.kill();
    process.exit(1);
  }

  steps.push(...(await rlsMatrix(sessionA1.client, sessionB.client, sessionA1.userId, anonClient)));

  const snap = buildQaLiveSnapshot(sessionA1.userId);
  steps.push(...(await apiRepositoryRoundTrip(apiBase, sessionA1.accessToken, snap)));

  await sessionA1.client.auth.signOut();
  const sessionA2 = await signIn(url, anon, emailA, passA);
  steps.push(step('USER_A_RELOGIN', Boolean(sessionA2)));
  if (sessionA2) {
    const get2 = await fetch(`${apiBase.replace(/\/$/, '')}/api/jurnl/repository`, {
      headers: { Authorization: `Bearer ${sessionA2.accessToken}` },
    });
    const json2 = get2.ok ? ((await get2.json()) as { snapshot?: { settings?: { timezone?: string } } }) : null;
    steps.push(
      step(
        'CROSS_SESSION_PERSISTENCE',
        json2?.snapshot?.settings?.timezone === 'America/New_York',
        json2?.snapshot?.settings?.timezone,
      ),
    );
    steps.push(step('SETTINGS_PERSISTENCE', json2?.snapshot?.settings?.timezone === 'America/New_York'));
    const consentGranted = json2?.snapshot && 'consent' in json2.snapshot;
    steps.push(step('CONSENT_PERSISTENCE', Boolean(consentGranted)));
  }

  const invalid = await fetch(`${apiBase.replace(/\/$/, '')}/api/jurnl/repository`, {
    headers: { Authorization: 'Bearer invalid-token-jurnl-qa' },
  });
  steps.push(step('SESSION_INVALID_DENY', invalid.status === 401, `status=${invalid.status}`));

  const askToken = sessionA2?.accessToken ?? sessionA1.accessToken;
  const ask = await fetch(`${apiBase.replace(/\/$/, '')}/api/jurnl/ask-context`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${askToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      familyId: 'F09',
      nodeId: 'F09.00',
      route: 'safe',
      consentGranted: true,
      completeness: 'PARTIAL',
      obligationCount: 1,
      displayCurrency: 'USD',
    }),
  });
  steps.push(step('ASK_JURNL_LIVE_BOUNDARY', ask.ok, ask.ok ? undefined : await ask.text()));

  const failed = steps.filter((s) => s.status === 'FAIL');
  const report: LiveProofReport = {
    sprint: 'P0.JURNL.WAVE5-LIVE-RLS-AND-PRODUCTION-SYNC-PROOF',
    generated_at: new Date().toISOString(),
    environment: failed.length === 0 ? 'PASS' : 'FAIL',
    steps,
    gate_status: failed.length === 0 ? 'PASS' : 'FAIL',
    supabase_reachable: true,
    api_base: apiBase,
    user_a_id: sessionA1.userId,
    user_b_id: sessionB.userId,
  };
  writeLiveProofArtifacts(report);
  serverProc?.kill();
  process.exit(failed.length === 0 ? 0 : 1);
}

function failReport(steps: LiveProofStepResult[], apiBase: string, supabaseOk: boolean): LiveProofReport {
  return {
    sprint: 'P0.JURNL.WAVE5-LIVE-RLS-AND-PRODUCTION-SYNC-PROOF',
    generated_at: new Date().toISOString(),
    environment: 'FAIL',
    steps,
    gate_status: 'FAIL',
    supabase_reachable: supabaseOk,
    api_base: apiBase,
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
