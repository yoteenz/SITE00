/**
 * Supabase persistence for Experiment G — brand presentation concept formation.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { BrandPresentationConceptFormationRun } from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/types.js';
import {
  EXPERIMENT_G_CLASSIFICATION,
  EXPERIMENT_G_DB_ID,
} from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_BRAND_PRESENTATION_CONCEPT_FORMATION';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getBrandPresentationConceptFormationRun(
  _runId: string,
): Promise<BrandPresentationConceptFormationRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', EXPERIMENT_G_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as BrandPresentationConceptFormationRun;
}

export async function saveBrandPresentationConceptFormationRun(
  run: BrandPresentationConceptFormationRun,
): Promise<BrandPresentationConceptFormationRun> {
  const row = {
    id: EXPERIMENT_G_DB_ID,
    organization_id: run.organizationId || NDXBOOK_ORG_ID,
    project_id: null,
    mode: MODE,
    status: run.status,
    record: run,
    updated_at: run.completedAt ?? run.startedAt ?? new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return run;
}

export function isExperimentGRecord(record: unknown): record is BrandPresentationConceptFormationRun {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as BrandPresentationConceptFormationRun).experimentClassification === EXPERIMENT_G_CLASSIFICATION
  );
}
