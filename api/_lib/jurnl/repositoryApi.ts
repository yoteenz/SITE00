/**
 * JURNL repository snapshot API helpers (Wave 5). User-scoped via Supabase RLS.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type JurnlSnapshotRow = {
  user_id: string;
  schema_version: number;
  snapshot: Record<string, unknown>;
  updated_at: string;
};

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
