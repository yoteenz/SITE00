/**
 * P0.5E.5 — Supabase persistence for Character Continuity pipeline run.
 */

import { getSupabaseAdmin } from '../../supabase.js';
import type { NdxCharacterContinuityPipelineRun } from '../../../../shared/site00-brand-lore/ndxCharacterContinuityPipeline/types.js';
import {
  NDX_CHARACTER_CONTINUITY_DB_ID,
  NDX_CHARACTER_CONTINUITY_MODE,
} from '../../../../shared/site00-brand-lore/ndxCharacterContinuityPipeline/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';

export async function characterContinuityTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getCharacterContinuityRun(
  projectId: string,
): Promise<NdxCharacterContinuityPipelineRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', NDX_CHARACTER_CONTINUITY_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  const rec = data.record as NdxCharacterContinuityPipelineRun;
  return rec.projectId === projectId && rec.runId === 'ndx-character-continuity-p05e5' ? rec : null;
}

export async function saveCharacterContinuityRun(
  record: NdxCharacterContinuityPipelineRun,
): Promise<NdxCharacterContinuityPipelineRun> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(record.projectId, 'ndxbook');
  const row = {
    id: NDX_CHARACTER_CONTINUITY_DB_ID,
    organization_id: NDXBOOK_ORG_ID,
    project_id: projectDbId,
    mode: NDX_CHARACTER_CONTINUITY_MODE,
    status: record.preCastingStatus,
    record,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return record;
}
