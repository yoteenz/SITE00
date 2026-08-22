#!/usr/bin/env tsx
/** Read-only production inspector for NDX BOOK formation state. */
import { createClient } from '@supabase/supabase-js';

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
  const token = await getAdminAccessToken();
  const [inspectorRes, payloadRes, healthRes] = await Promise.all([
    fetch(`${API_BASE}/api/admin/site00-evolve?action=creative_direction_formation_inspector&orgSlug=ndxbook`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_BASE}/api/admin/site00-evolve?action=creative_direction&orgSlug=ndxbook`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_BASE}/api/health`),
  ]);
  console.log(JSON.stringify({
    health: await healthRes.json(),
    inspector: await inspectorRes.json(),
    payload: await payloadRes.json(),
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
