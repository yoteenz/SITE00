/**
 * Supabase persistence for canonical creative range validation runs.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { CanonicalCreativeRangeRun } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import {
  CANONICAL_CREATIVE_RANGE_EXPERIMENT,
  NDXBOOK_CANONICAL_CREATIVE_RANGE_DB_ID,
} from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_CANONICAL_CREATIVE_RANGE_VALIDATION';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getCanonicalCreativeRangeRun(_runId: string): Promise<CanonicalCreativeRangeRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', NDXBOOK_CANONICAL_CREATIVE_RANGE_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as CanonicalCreativeRangeRun;
}

export async function saveCanonicalCreativeRangeRun(run: CanonicalCreativeRangeRun): Promise<CanonicalCreativeRangeRun> {
  const row = {
    id: NDXBOOK_CANONICAL_CREATIVE_RANGE_DB_ID,
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

export function isCanonicalCreativeRangeRecord(record: unknown): record is CanonicalCreativeRangeRun {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as CanonicalCreativeRangeRun).experimentClassification === CANONICAL_CREATIVE_RANGE_EXPERIMENT
  );
}
