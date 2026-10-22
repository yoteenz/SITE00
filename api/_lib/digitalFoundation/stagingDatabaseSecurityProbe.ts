/**
 * Non-destructive PostgREST exposure checks for Digital Foundation tables (no secret values logged).
 */
import { createClient } from '@supabase/supabase-js';

export type PostgrestExposureResult = 'denied' | 'allowed_rows' | 'not_configured' | 'error';

export type DfDatabaseSecuritySnapshot = {
  supabase_project_ref: string | null;
  project_messages_table: {
    anon_select: PostgrestExposureResult;
    service_role_select: PostgrestExposureResult;
  };
  persistence_safe: boolean;
  notes: string[];
};

function projectRefFromUrl(): string | null {
  const url = process.env.SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    const m = new URL(url).hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

async function probeSelect(
  key: string | undefined,
  label: 'anon' | 'service_role',
): Promise<PostgrestExposureResult> {
  const url = process.env.SUPABASE_URL?.trim();
  if (!url || !key) return 'not_configured';
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    const { data, error } = await client.from('site00_df_project_messages').select('message_id').limit(1);
    if (error) {
      const code = String((error as { code?: string }).code ?? '');
      const msg = String(error.message ?? '').toLowerCase();
      if (code === '42501' || msg.includes('permission denied') || msg.includes('row-level security')) {
        return 'denied';
      }
      if (msg.includes('relation') && msg.includes('does not exist')) {
        return 'error';
      }
      return 'denied';
    }
    if (Array.isArray(data) && data.length > 0) return 'allowed_rows';
    return 'denied';
  } catch {
    return 'error';
  }
}

/**
 * Probe whether PostgREST anon vs service-role can read project_messages.
 * Service role should work when persistence is on; anon must stay denied.
 */
export async function probeDfDatabaseSecurity(): Promise<DfDatabaseSecuritySnapshot> {
  const notes: string[] = [];
  const anon = await probeSelect(process.env.SUPABASE_ANON_KEY?.trim(), 'anon');
  const service = await probeSelect(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim(),
    'service_role',
  );

  if (anon === 'allowed_rows') {
    notes.push('BLOCKER: anon/authenticated PostgREST can read site00_df_project_messages rows');
  } else if (anon === 'denied') {
    notes.push('Anon PostgREST cannot read project_messages (expected before/after RLS hardening)');
  }

  if (service === 'not_configured') {
    notes.push('Service role key not configured — cannot verify API persistence path');
  } else if (service === 'error') {
    notes.push('Service role probe failed — check table exists on connected project');
  }

  const persistenceSafe = anon !== 'allowed_rows';
  return {
    supabase_project_ref: projectRefFromUrl(),
    project_messages_table: {
      anon_select: anon,
      service_role_select: service,
    },
    persistence_safe: persistenceSafe,
    notes,
  };
}
