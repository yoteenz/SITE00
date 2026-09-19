/**
 * Supabase persistence for Brand Character Readiness.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { BrandCharacterReadinessRecord } from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/types.js';
import { NDXBOOK_CHARACTER_READINESS_DB_ID } from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_BRAND_CHARACTER_READINESS';

export async function brandCharacterReadinessTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getBrandCharacterReadinessRecord(
  projectId: string,
): Promise<BrandCharacterReadinessRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', NDXBOOK_CHARACTER_READINESS_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  const rec = data.record as BrandCharacterReadinessRecord;
  return rec.projectId === projectId ? rec : null;
}

export async function saveBrandCharacterReadinessRecord(
  record: BrandCharacterReadinessRecord,
): Promise<BrandCharacterReadinessRecord> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(record.projectId, 'ndxbook');
  const row = {
    id: NDXBOOK_CHARACTER_READINESS_DB_ID,
    organization_id: record.organizationId || NDXBOOK_ORG_ID,
    project_id: projectDbId,
    mode: MODE,
    status: record.latestEvaluation?.overallState ?? 'CHARACTER_NOT_EVALUATED',
    record,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return record;
}
