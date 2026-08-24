/**
 * Supabase persistence for Brand Character Synthesis run.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { BrandCharacterSynthesisRun } from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/types.js';
import {
  NDXBOOK_CHARACTER_SYNTHESIS_DB_ID,
  NDXBOOK_CHARACTER_SYNTHESIS_MODE,
} from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';

export async function brandCharacterSynthesisTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getBrandCharacterSynthesisRun(
  projectId: string,
): Promise<BrandCharacterSynthesisRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', NDXBOOK_CHARACTER_SYNTHESIS_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  const rec = data.record as BrandCharacterSynthesisRun;
  return rec.projectId === projectId ? rec : null;
}

export async function saveBrandCharacterSynthesisRun(
  record: BrandCharacterSynthesisRun,
): Promise<BrandCharacterSynthesisRun> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(record.projectId, 'ndxbook');
  const row = {
    id: NDXBOOK_CHARACTER_SYNTHESIS_DB_ID,
    organization_id: record.organizationId || NDXBOOK_ORG_ID,
    project_id: projectDbId,
    mode: NDXBOOK_CHARACTER_SYNTHESIS_MODE,
    status: record.status,
    record,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return record;
}
