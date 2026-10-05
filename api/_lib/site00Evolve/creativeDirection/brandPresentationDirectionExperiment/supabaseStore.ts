/**
 * Supabase persistence for Brand Presentation Direction formation.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { BrandPresentationDirectionFormationRun } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/types.js';
import {
  BRAND_PRESENTATION_DIRECTION_CLASSIFICATION,
  BRAND_PRESENTATION_DIRECTION_DB_ID,
} from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_BRAND_PRESENTATION_DIRECTION_FORMATION';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getBrandPresentationDirectionFormationRun(
  _runId: string,
): Promise<BrandPresentationDirectionFormationRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', BRAND_PRESENTATION_DIRECTION_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as BrandPresentationDirectionFormationRun;
}

export async function saveBrandPresentationDirectionFormationRun(
  run: BrandPresentationDirectionFormationRun,
): Promise<BrandPresentationDirectionFormationRun> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(run.projectId, 'ndxbook');
  const row = {
    id: BRAND_PRESENTATION_DIRECTION_DB_ID,
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

export function isBrandPresentationDirectionRecord(
  record: unknown,
): record is BrandPresentationDirectionFormationRun {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as BrandPresentationDirectionFormationRun).experimentClassification ===
      BRAND_PRESENTATION_DIRECTION_CLASSIFICATION
  );
}
