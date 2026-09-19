/**
 * Supabase persistence for Brand Presentation Visual Formulation.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { BrandPresentationVisualFormulationRun } from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types.js';
import {
  BRAND_PRESENTATION_VISUAL_FORMULATION_CLASSIFICATION,
  BRAND_PRESENTATION_VISUAL_FORMULATION_DB_ID,
} from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { resolveProjectDbIdForSupabaseFk } from '../../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_BRAND_PRESENTATION_VISUAL_FORMULATION';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getBrandPresentationVisualFormulationRun(
  _runId: string,
): Promise<BrandPresentationVisualFormulationRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', BRAND_PRESENTATION_VISUAL_FORMULATION_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as BrandPresentationVisualFormulationRun;
}

export async function saveBrandPresentationVisualFormulationRun(
  run: BrandPresentationVisualFormulationRun,
): Promise<BrandPresentationVisualFormulationRun> {
  const projectDbId = await resolveProjectDbIdForSupabaseFk(run.projectId, 'ndxbook');
  const row = {
    id: BRAND_PRESENTATION_VISUAL_FORMULATION_DB_ID,
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

export function isBrandPresentationVisualFormulationRecord(
  record: unknown,
): record is BrandPresentationVisualFormulationRun {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as BrandPresentationVisualFormulationRun).experimentClassification ===
      BRAND_PRESENTATION_VISUAL_FORMULATION_CLASSIFICATION
  );
}
