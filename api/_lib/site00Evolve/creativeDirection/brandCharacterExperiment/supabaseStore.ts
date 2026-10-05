/**
 * Supabase persistence for Brand Character formation.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { BrandCharacterFormationRun } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/types.js';
import {
  BRAND_CHARACTER_FORMATION_CLASSIFICATION,
  NDXBOOK_CHARACTER_FORMATION_DB_ID,
} from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_BRAND_CHARACTER_FORMATION';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getBrandCharacterFormationRun(
  _runId: string,
): Promise<BrandCharacterFormationRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', NDXBOOK_CHARACTER_FORMATION_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as BrandCharacterFormationRun;
}

export async function saveBrandCharacterFormationRun(
  run: BrandCharacterFormationRun,
): Promise<BrandCharacterFormationRun> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(run.projectId, 'ndxbook');
  const row = {
    id: NDXBOOK_CHARACTER_FORMATION_DB_ID,
    organization_id: run.organizationId || NDXBOOK_ORG_ID,
    project_id: projectDbId,
    mode: MODE,
    status: run.status,
    record: run,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return run;
}

export function isBrandCharacterRecord(record: unknown): record is BrandCharacterFormationRun {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as BrandCharacterFormationRun).experimentClassification === BRAND_CHARACTER_FORMATION_CLASSIFICATION
  );
}
