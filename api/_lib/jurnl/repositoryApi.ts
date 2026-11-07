/**
 * JURNL repository snapshot API helpers (Wave 5). User-scoped via Supabase RLS.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type JurnlSnapshotRow = {
  user_id: string;
  schema_version: number;
  snapshot: Record<string, unknown>;
  updated_at: string;
  /** Monotonic write counter (compare-and-swap); added by 20261107120000_jurnl_connected_banking. */
  revision?: number;
  data_mode?: 'PRODUCTION' | 'PROVIDER_SANDBOX';
};

export type SnapshotDataMode = 'PRODUCTION' | 'PROVIDER_SANDBOX';

/**
 * Atomic compare-and-swap write (jurnl_put_snapshot). The caller passes the revision it last read (0 = no row yet).
 * A stale revision is refused (SNAPSHOT_CONFLICT), so an older device cannot overwrite a newer server record.
 */
export async function putUserSnapshotRevisioned(
  supabase: SupabaseClient,
  snapshot: Record<string, unknown>,
  schemaVersion: number,
  dataMode: SnapshotDataMode,
  expectedRevision: number,
  source = 'CLIENT',
): Promise<{ revision: number; updated_at: string; schema_version: number; data_mode: SnapshotDataMode }> {
  const { data, error } = await supabase.rpc('jurnl_put_snapshot', {
    p_snapshot: snapshot,
    p_schema_version: schemaVersion,
    p_data_mode: dataMode,
    p_expected_revision: expectedRevision,
    p_source: source,
  });
  if (error) {
    const err = new Error(error.message) as Error & { code?: string };
    err.code = error.code === 'JR409' ? 'SNAPSHOT_CONFLICT' : error.code === 'JR422' ? 'DATA_MODE_MISMATCH' : error.code;
    throw err;
  }
  const row = (Array.isArray(data) ? data[0] : data) as { revision: number; updated_at: string; schema_version: number; data_mode: SnapshotDataMode };
  return { ...row, revision: Number(row.revision) };
}

export async function fetchUserSnapshot(supabase: SupabaseClient, userId: string): Promise<JurnlSnapshotRow | null> {
  const { data, error } = await supabase.from('jurnl_user_snapshots').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as JurnlSnapshotRow | null) ?? null;
}

export async function upsertUserSnapshot(
  supabase: SupabaseClient,
  userId: string,
  snapshot: Record<string, unknown>,
  schemaVersion: number,
  expectedUpdatedAt?: string | null,
): Promise<JurnlSnapshotRow> {
  const existing = await fetchUserSnapshot(supabase, userId);
  if (existing && expectedUpdatedAt && existing.updated_at !== expectedUpdatedAt) {
    const err = new Error('SNAPSHOT_CONFLICT');
    (err as Error & { code?: string }).code = 'SNAPSHOT_CONFLICT';
    throw err;
  }
  const row = {
    user_id: userId,
    schema_version: schemaVersion,
    snapshot,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('jurnl_user_snapshots').upsert(row).select('*').single();
  if (error) throw new Error(error.message);
  return data as JurnlSnapshotRow;
}

export async function registerIdempotencyKey(
  supabase: SupabaseClient,
  userId: string,
  key: string,
  mutationType: string,
  entityId?: string,
): Promise<'OK' | 'DUPLICATE'> {
  const { error } = await supabase.from('jurnl_mutation_idempotency').insert({
    user_id: userId,
    idempotency_key: key,
    mutation_type: mutationType,
    entity_id: entityId ?? null,
  });
  if (error) {
    if (error.code === '23505') return 'DUPLICATE';
    throw new Error(error.message);
  }
  return 'OK';
}
