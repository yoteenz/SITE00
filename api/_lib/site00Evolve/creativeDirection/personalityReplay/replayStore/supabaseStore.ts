/**
 * Supabase persistence for methodology validation replay records.
 */

import { getSupabaseAdmin } from '../../../../supabase.js';
import type { BrandPersonalityReplayRecord } from '../../../../../shared/site00-brand-lore/personalityReplayTypes.js';
import { resolveProjectDbIdForSupabaseFk } from '../../../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function savePersonalityReplayRecord(
  record: BrandPersonalityReplayRecord,
): Promise<BrandPersonalityReplayRecord> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(record.projectId);
  const row = {
    id: record.replayId,
    organization_id: record.organizationId,
    project_id: projectDbId,
    mode: record.mode,
    status: record.status,
    record: record,
    updated_at: record.updatedAt,
  };

  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return record;
}

export async function getPersonalityReplayRecord(replayId: string): Promise<BrandPersonalityReplayRecord | null> {
  const { data, error } = await getSupabaseAdmin().from(TABLE).select('record').eq('id', replayId).maybeSingle();
  if (error || !data) return null;
  return data.record as BrandPersonalityReplayRecord;
}

export async function listPersonalityReplayRecordsForOrg(
  organizationId: string,
): Promise<BrandPersonalityReplayRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => row.record as BrandPersonalityReplayRecord);
}
