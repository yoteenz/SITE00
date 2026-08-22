#!/usr/bin/env tsx
/**
 * Live THE MARKED-UP COPY board v4 — DirectionExpressionSystem + Sonnet via Railway API.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '') ?? '';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
const API_BASE = (process.env.VITE_API_BASE ?? 'https://api.site00.com').replace(/\/$/, '');
const ADMIN_EMAIL = (process.env.ADMIN_EMAILS ?? 'kateenaarmstrong@gmail.com').split(',')[0].trim();

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

async function main() {
  console.log('=== LIVE MARKED-UP COPY BOARD V4 ===');
  console.log(`API: ${API_BASE}`);

  const health = await fetch(`${API_BASE}/api/health`);
  console.log(`Health: ${health.status} ${await health.text()}`);

  const token = await getAdminAccessToken();
  const res = await fetch(`${API_BASE}/api/admin/site00-evolve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'creative_direction_marked_up_copy_board_pilot',
      orgSlug: 'ndxbook',
      dryRun: false,
    }),
  });

  const body = await res.json();
  const outPath = '/tmp/marked-up-copy-board-v4-result.json';
  writeFileSync(outPath, JSON.stringify(body, null, 2));
  console.log(`HTTP: ${res.status}`);
  console.log(`Status: ${body.status ?? body.error ?? 'unknown'}`);
  console.log(`Written: ${outPath}`);

  if (!res.ok) {
    process.exit(1);
  }

  if (body.credentialExposed === true || JSON.stringify(body).includes('sk-ant-')) {
    throw new Error('Credential leak detected in API response');
  }

  if (body.status === 'BLOCKED_ON_PRODUCTION_SONNET_CREDENTIAL') {
    process.exit(2);
  }
  process.exit(body.status === 'PASS' ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
