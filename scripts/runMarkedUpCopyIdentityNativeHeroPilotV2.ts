#!/usr/bin/env tsx
/**
 * Live THE MARKED-UP COPY creative-refined identity hero V2 — ONE hero via Railway API.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '') ?? '';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
const API_BASE = (process.env.VITE_API_BASE ?? 'https://api.site00.com').replace(/\/$/, '');
const ADMIN_EMAIL = (process.env.ADMIN_EMAILS ?? 'kateenaarmstrong@gmail.com').split(',')[0].trim();
const POLL_MS = 10_000;
const MAX_WAIT_MS = 30 * 60_000;

async function getAdminAccessToken(): Promise<string> {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: ADMIN_EMAIL,
  });
  if (linkErr || !linkData?.properties?.email_otp) {
    throw new Error(`Failed to generate admin link: ${linkErr?.message ?? 'no email_otp'}`);
  }
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: sessionData, error: verifyErr } = await client.auth.verifyOtp({
    email: ADMIN_EMAIL,
    token: linkData.properties.email_otp,
    type: 'email',
  });
  if (verifyErr || !sessionData.session?.access_token) {
    throw new Error(`Failed to verify admin OTP: ${verifyErr?.message ?? 'no session'}`);
  }
  return sessionData.session.access_token;
}

async function adminFetch(path: string, token: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

async function pollJob(token: string, jobId: string) {
  const started = Date.now();
  while (Date.now() - started < MAX_WAIT_MS) {
    const res = await adminFetch(
      `/api/admin/site00-evolve?action=creative_direction_production_job&orgSlug=ndxbook&jobId=${encodeURIComponent(jobId)}`,
      token,
    );
    const body = await res.json();
    const job = body.job;
    if (!job) throw new Error('Job not found while polling');
    console.log(`[poll] ${job.status} · ${job.phase} · ${job.progress?.label ?? ''}`);
    if (job.status === 'completed') return job;
    if (job.status === 'failed') throw new Error(job.errorMessage ?? 'Production job failed');
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  throw new Error('Timed out waiting for identity-native hero V2 pilot job');
}

async function main() {
  console.log('=== CREATIVE-REFINED IDENTITY HERO V2 (ONE HERO) ===');
  console.log(`API: ${API_BASE}`);

  const health = await fetch(`${API_BASE}/api/health`);
  console.log(`Health: ${health.status} ${await health.text()}`);

  const token = await getAdminAccessToken();
  const startRes = await adminFetch('/api/admin/site00-evolve', token, {
    method: 'POST',
    body: JSON.stringify({
      action: 'creative_direction_marked_up_copy_identity_native_hero_pilot_v2',
      orgSlug: 'ndxbook',
      dryRun: false,
    }),
  });

  const startBody = await startRes.json();
  console.log(`Start HTTP: ${startRes.status}`);

  let result = startBody;
  if (startRes.status === 202 && startBody.job?.id) {
    const job = await pollJob(token, startBody.job.id);
    result = job.result?.markedUpCopyIdentityNativeHeroPilotV2 ?? job.result ?? job;
    result = { ...result, jobId: job.id, jobStatus: job.status };
  }

  const outPath = '/tmp/marked-up-copy-identity-native-hero-v2-result.json';
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`Status: ${result.status ?? result.error ?? 'unknown'}`);
  console.log(`Written: ${outPath}`);

  if (JSON.stringify(result).includes('sk-ant-')) {
    throw new Error('Credential leak detected in API response');
  }

  process.exit(result.status === 'PILOT_COMPLETE' ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
