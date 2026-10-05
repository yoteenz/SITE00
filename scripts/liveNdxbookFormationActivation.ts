#!/usr/bin/env tsx
/**
 * Live NDX BOOK Core Direction Formation activation.
 * Uses production Supabase + production API (Railway has ANTHROPIC_API_KEY).
 * Does not modify Brand Lore or invoke FAL.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '') ?? '';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
const API_BASE = (process.env.VITE_API_BASE ?? 'https://api.site00.com').replace(/\/$/, '');
const ADMIN_EMAIL = (process.env.ADMIN_EMAILS ?? 'kateenaarmstrong@gmail.com').split(',')[0].trim();

async function getAdminAccessToken(): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
    throw new Error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or anon key');
  }
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

async function apiGet(token: string, action: string, orgSlug = 'ndxbook') {
  const url = `${API_BASE}/api/admin/site00-evolve?action=${encodeURIComponent(action)}&orgSlug=${encodeURIComponent(orgSlug)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(`${action} failed (${res.status}): ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

async function apiPost(token: string, action: string, orgSlug = 'ndxbook') {
  const url = `${API_BASE}/api/admin/site00-evolve`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, orgSlug }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${action} failed (${res.status}): ${JSON.stringify(body).slice(0, 500)}`);
  return body;
}

async function queryFormationFromSupabase() {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await admin
    .from('site00_core_direction_formations')
    .select('*')
    .eq('organization_id', '7681ab75-bddc-43e5-b594-79fcf8168205')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function main() {
  console.log('=== LIVE NDX BOOK FORMATION ACTIVATION ===');
  console.log(`API: ${API_BASE}`);
  console.log(`Admin: ${ADMIN_EMAIL}`);

  const before = await queryFormationFromSupabase();
  console.log('\n--- BEFORE (Supabase) ---');
  console.log(
    JSON.stringify(
      before
        ? {
            id: before.id,
            status: before.status,
            error_code: before.error_code,
            formation_version: before.formation_version,
            idempotency_key: before.idempotency_key,
          }
        : null,
      null,
      2,
    ),
  );

  const token = await getAdminAccessToken();
  console.log('\n--- INSPECTOR (before retry) ---');
  const inspectorBefore = await apiGet(token, 'creative_direction_formation_inspector');
  console.log(JSON.stringify(inspectorBefore, null, 2));

  console.log('\n--- RETRY FAILED FORMATION (canonical path) ---');
  let retryResult: unknown;
  try {
    retryResult = await apiPost(token, 'creative_direction_formation_retry');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('UNKNOWN ACTION') || message.includes('404')) {
      console.log('retry endpoint unavailable on production — using creative_direction_reform fallback');
      retryResult = await apiPost(token, 'creative_direction_reform');
    } else {
      throw err;
    }
  }
  console.log(JSON.stringify(retryResult, null, 2));

  console.log('\n--- INSPECTOR (after retry) ---');
  const inspectorAfter = await apiGet(token, 'creative_direction_formation_inspector');
  console.log(JSON.stringify(inspectorAfter, null, 2));

  const after = await queryFormationFromSupabase();
  console.log('\n--- AFTER (Supabase) ---');
  console.log(JSON.stringify(after, null, 2));

  const record = (retryResult as { record?: Record<string, unknown> }).record ?? inspectorAfter.formation;
  const outPath = '/tmp/ndxbook-live-formation-result.json';
  await import('node:fs/promises').then((fs) =>
    fs.writeFile(
      outPath,
      JSON.stringify({ retryResult, inspectorAfter, supabase: after }, null, 2),
    ),
  );
  console.log(`\nFull result written to ${outPath}`);

  if (record && typeof record === 'object') {
    const status = (record as { status?: string }).status;
    const finals = (record as { finalDirections?: unknown[] }).finalDirections ?? [];
    console.log(`\nSTATUS: ${status}`);
    console.log(`FINAL DIRECTIONS: ${Array.isArray(finals) ? finals.length : 0}`);
    if (Array.isArray(finals)) {
      for (const [i, d] of finals.entries()) {
        const dir = d as { directionName?: string };
        console.log(`  ${i + 1}. ${dir.directionName ?? 'unnamed'}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
