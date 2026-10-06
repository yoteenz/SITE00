#!/usr/bin/env npx tsx
/**
 * Live proof prerequisite precheck — names + presence only (never secret values).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type SecretClassification = 'PRESENT' | 'MISSING' | 'OPTIONAL' | 'DERIVABLE' | 'UNUSED';

export type SecretInventoryEntry = {
  name: string;
  purpose: string;
  classification: SecretClassification;
  wired_in_workflow: boolean;
  resolves_from?: string[];
};

export type PrerequisiteReport = {
  generated_at: string;
  all_required_present: boolean;
  gate_status: 'READY' | 'PREREQUISITE_BLOCKED';
  secrets: SecretInventoryEntry[];
  migration: {
    required_file: string;
    local: boolean;
    remote: 'MATCH' | 'PENDING_LOCAL' | 'REMOTE_DRIFT' | 'UNKNOWN';
    remote_tables_present: boolean | null;
    safe_to_apply: boolean;
  };
  user_a_ready: boolean;
  user_b_ready: boolean;
  rls_schema_ready: boolean | null;
};

const REQUIRED_MIGRATION = 'supabase/migrations/20261006103000_jurnl_production_persistence.sql';

function isSet(name: string): boolean {
  return Boolean((process.env[name] ?? '').trim());
}

function resolveSupabaseUrl(): string {
  return (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
}

function resolveAnonKey(): string {
  return (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
}

export function buildSecretInventory(): SecretInventoryEntry[] {
  const urlPresent = isSet('SUPABASE_URL') || isSet('VITE_SUPABASE_URL');
  const anonPresent = isSet('SUPABASE_ANON_KEY') || isSet('VITE_SUPABASE_ANON_KEY');

  return [
    {
      name: 'SUPABASE_URL',
      purpose: 'Supabase project URL for auth + PostgREST (live proof + API)',
      classification: isSet('SUPABASE_URL') ? 'PRESENT' : isSet('VITE_SUPABASE_URL') ? 'DERIVABLE' : 'MISSING',
      wired_in_workflow: true,
      resolves_from: ['secrets.SUPABASE_URL', 'secrets.VITE_SUPABASE_URL'],
    },
    {
      name: 'VITE_SUPABASE_URL',
      purpose: 'Fallback Supabase URL when SUPABASE_URL unset in CI',
      classification: isSet('VITE_SUPABASE_URL') ? 'PRESENT' : urlPresent ? 'DERIVABLE' : 'MISSING',
      wired_in_workflow: true,
      resolves_from: ['secrets.VITE_SUPABASE_URL'],
    },
    {
      name: 'SUPABASE_ANON_KEY',
      purpose: 'User-scoped Supabase client + RLS proof (not service role)',
      classification: isSet('SUPABASE_ANON_KEY') ? 'PRESENT' : isSet('VITE_SUPABASE_ANON_KEY') ? 'DERIVABLE' : 'MISSING',
      wired_in_workflow: true,
      resolves_from: ['secrets.SUPABASE_ANON_KEY', 'secrets.VITE_SUPABASE_ANON_KEY'],
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      purpose: 'Fallback anon key in CI',
      classification: isSet('VITE_SUPABASE_ANON_KEY') ? 'PRESENT' : anonPresent ? 'DERIVABLE' : 'MISSING',
      wired_in_workflow: true,
      resolves_from: ['secrets.VITE_SUPABASE_ANON_KEY'],
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      purpose: 'Admin API: create/confirm synthetic QA users only (not RLS proof)',
      classification: isSet('SUPABASE_SERVICE_ROLE_KEY') ? 'PRESENT' : 'MISSING',
      wired_in_workflow: true,
      resolves_from: ['secrets.SUPABASE_SERVICE_ROLE_KEY'],
    },
    {
      name: 'JURNL_QA_USER_A_EMAIL',
      purpose: 'Synthetic USER_A sign-in (email/password)',
      classification: isSet('JURNL_QA_USER_A_EMAIL') ? 'PRESENT' : 'MISSING',
      wired_in_workflow: true,
      resolves_from: ['secrets.JURNL_QA_USER_A_EMAIL'],
    },
    {
      name: 'JURNL_QA_USER_A_PASSWORD',
      purpose: 'Synthetic USER_A password',
      classification: isSet('JURNL_QA_USER_A_PASSWORD') ? 'PRESENT' : 'MISSING',
      wired_in_workflow: true,
      resolves_from: ['secrets.JURNL_QA_USER_A_PASSWORD'],
    },
    {
      name: 'JURNL_QA_USER_B_EMAIL',
      purpose: 'Synthetic USER_B sign-in (isolation proof)',
      classification: isSet('JURNL_QA_USER_B_EMAIL') ? 'PRESENT' : 'MISSING',
      wired_in_workflow: true,
      resolves_from: ['secrets.JURNL_QA_USER_B_EMAIL'],
    },
    {
      name: 'JURNL_QA_USER_B_PASSWORD',
      purpose: 'Synthetic USER_B password',
      classification: isSet('JURNL_QA_USER_B_PASSWORD') ? 'PRESENT' : 'MISSING',
      wired_in_workflow: true,
      resolves_from: ['secrets.JURNL_QA_USER_B_PASSWORD'],
    },
    {
      name: 'JURNL_LIVE_API_BASE',
      purpose: 'Production-like API host for /api/jurnl/repository (optional — CI starts local API)',
      classification: isSet('JURNL_LIVE_API_BASE') ? 'PRESENT' : 'OPTIONAL',
      wired_in_workflow: true,
      resolves_from: ['secrets.JURNL_LIVE_API_BASE', 'secrets.VITE_API_BASE'],
    },
    {
      name: 'VITE_API_BASE',
      purpose: 'Fallback API base in workflow when JURNL_LIVE_API_BASE unset',
      classification: isSet('VITE_API_BASE') ? 'PRESENT' : 'OPTIONAL',
      wired_in_workflow: true,
      resolves_from: ['secrets.VITE_API_BASE'],
    },
    {
      name: 'ANTHROPIC_API_KEY',
      purpose: 'Ask JURNL live generation (external dependency — not required for boundary proof)',
      classification: 'UNUSED',
      wired_in_workflow: false,
    },
    {
      name: 'JURNL_LIVE_PROOF',
      purpose: 'Gate enable flag (set in workflow env, not a GitHub secret)',
      classification: isSet('JURNL_LIVE_PROOF') ? 'PRESENT' : 'DERIVABLE',
      wired_in_workflow: true,
    },
    {
      name: 'JURNL_LIVE_QA_SETUP',
      purpose: 'Allow service role to provision QA users in harness',
      classification: isSet('JURNL_LIVE_QA_SETUP') ? 'PRESENT' : 'DERIVABLE',
      wired_in_workflow: true,
    },
  ];
}

async function probeRemoteSchema(): Promise<{ tablesPresent: boolean | null; migrationRemote: PrerequisiteReport['migration']['remote'] }> {
  const url = resolveSupabaseUrl();
  const anon = resolveAnonKey();
  if (!url || !anon) return { tablesPresent: null, migrationRemote: 'UNKNOWN' };

  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/jurnl_user_snapshots?select=user_id&limit=1`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (res.status === 404 || res.status === 406) return { tablesPresent: false, migrationRemote: 'PENDING_LOCAL' };
    if (res.ok || res.status === 401 || res.status === 200) return { tablesPresent: true, migrationRemote: 'MATCH' };
    return { tablesPresent: null, migrationRemote: 'UNKNOWN' };
  } catch {
    return { tablesPresent: null, migrationRemote: 'UNKNOWN' };
  }
}

export async function runPrerequisitePrecheck(): Promise<PrerequisiteReport> {
  const secrets = buildSecretInventory();
  const requiredNames = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JURNL_QA_USER_A_EMAIL',
    'JURNL_QA_USER_A_PASSWORD',
    'JURNL_QA_USER_B_EMAIL',
    'JURNL_QA_USER_B_PASSWORD',
  ];

  const present = (name: string): boolean => {
    const row = secrets.find((s) => s.name === name);
    if (!row) return false;
    if (row.classification === 'PRESENT' || row.classification === 'DERIVABLE') return true;
    if (name === 'SUPABASE_URL') return Boolean(resolveSupabaseUrl());
    if (name === 'SUPABASE_ANON_KEY') return Boolean(resolveAnonKey());
    return isSet(name);
  };

  const allRequired = requiredNames.every(present);
  const localMigration = existsSync(join(process.cwd(), REQUIRED_MIGRATION));
  const probe = await probeRemoteSchema();

  const userAReady = present('JURNL_QA_USER_A_EMAIL') && present('JURNL_QA_USER_A_PASSWORD') && Boolean(resolveSupabaseUrl());
  const userBReady = present('JURNL_QA_USER_B_EMAIL') && present('JURNL_QA_USER_B_PASSWORD') && Boolean(resolveSupabaseUrl());

  return {
    generated_at: new Date().toISOString(),
    all_required_present: allRequired && localMigration && probe.migrationRemote !== 'PENDING_LOCAL',
    gate_status: allRequired && localMigration && probe.tablesPresent !== false ? 'READY' : 'PREREQUISITE_BLOCKED',
    secrets,
    migration: {
      required_file: REQUIRED_MIGRATION,
      local: localMigration,
      remote: probe.migrationRemote,
      remote_tables_present: probe.tablesPresent,
      safe_to_apply: localMigration,
    },
    user_a_ready: userAReady,
    user_b_ready: userBReady,
    rls_schema_ready: probe.tablesPresent,
  };
}

async function main() {
  const report = await runPrerequisitePrecheck();
  const missing = report.secrets.filter((s) => s.classification === 'MISSING' && s.wired_in_workflow && !['JURNL_LIVE_API_BASE', 'VITE_API_BASE'].includes(s.name));
  console.log('JURNL live proof prerequisite precheck');
  console.log('gate_status:', report.gate_status);
  console.log('missing_secret_names:', missing.map((m) => m.name).join(', ') || '(none)');
  console.log('migration_local:', report.migration.local);
  console.log('migration_remote:', report.migration.remote);
  console.log('user_a_ready:', report.user_a_ready);
  console.log('user_b_ready:', report.user_b_ready);
  process.exit(report.gate_status === 'READY' ? 0 : 2);
}

if (process.argv[1]?.includes('live-proof-prerequisite-precheck')) {
  void main();
}
