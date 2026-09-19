/**
 * Supabase persistence for Experiment F — six-concept reformation.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { SixConceptReformationRun } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/types.js';
import {
  EXPERIMENT_F_CLASSIFICATION,
  EXPERIMENT_F_DB_ID,
} from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_SIX_CONCEPT_REFORMATION';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getSixConceptReformationRun(_runId: string): Promise<SixConceptReformationRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', EXPERIMENT_F_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as SixConceptReformationRun;
}

export async function saveSixConceptReformationRun(run: SixConceptReformationRun): Promise<SixConceptReformationRun> {
  const row = {
    id: EXPERIMENT_F_DB_ID,
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

export function isExperimentFRecord(record: unknown): record is SixConceptReformationRun {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as SixConceptReformationRun).experimentClassification === EXPERIMENT_F_CLASSIFICATION
  );
}
