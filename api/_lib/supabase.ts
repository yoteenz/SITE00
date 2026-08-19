/**
 * Supabase server client for API routes.
 * Use getSupabaseAdmin() for service-role (bypass RLS) or getSupabaseUser(token) for user-scoped RLS.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

/** True if service role key is set (required for auth.admin operations like deleteUser). */
export function hasSupabaseServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let serviceRoleClient: SupabaseClient | null = null;

/** Admin client that MUST use service role key (bypasses RLS). Use for listing all profiles, auth.admin.listUsers, etc. Throws if service role key is not set. */
export function getSupabaseAdminServiceRole(): SupabaseClient {
  if (!serviceRoleClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (required for admin clients list)');
    serviceRoleClient = createClient(url, key);
  }
  return serviceRoleClient;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY');
    adminClient = createClient(url, key);
  }
  return adminClient;
}

/** Create a Supabase client that uses the user's JWT so RLS applies (auth.uid() = user_id). */
export function getSupabaseUser(accessToken: string): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
