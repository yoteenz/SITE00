/**
 * Supabase persistence for Experiment D — six-concept hero range.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { SixConceptHeroRangeRun } from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritoryTypes.js';
import {
  EXPERIMENT_D_CLASSIFICATION,
  EXPERIMENT_D_DB_ID,
} from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritoryConstants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_SIX_CONCEPT_HERO_RANGE';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getSixConceptHeroRangeRun(_runId: string): Promise<SixConceptHeroRangeRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', EXPERIMENT_D_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as SixConceptHeroRangeRun;
}

export async function saveSixConceptHeroRangeRun(run: SixConceptHeroRangeRun): Promise<SixConceptHeroRangeRun> {
  const row = {
    id: EXPERIMENT_D_DB_ID,
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

export function isExperimentDRecord(record: unknown): record is SixConceptHeroRangeRun {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as SixConceptHeroRangeRun).experimentClassification === EXPERIMENT_D_CLASSIFICATION
  );
}
