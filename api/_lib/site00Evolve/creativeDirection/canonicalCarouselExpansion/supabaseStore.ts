/**
 * Supabase persistence for carousel expansion runs — Experiment C.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { CanonicalCarouselExpansionRun } from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import {
  CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT,
  NDXBOOK_CANONICAL_CAROUSEL_EXPANSION_DB_ID,
} from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionConstants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_CANONICAL_CAROUSEL_EXPANSION';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getCanonicalCarouselExpansionRun(
  _runId: string,
): Promise<CanonicalCarouselExpansionRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('id', NDXBOOK_CANONICAL_CAROUSEL_EXPANSION_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as CanonicalCarouselExpansionRun;
}

export async function saveCanonicalCarouselExpansionRun(
  run: CanonicalCarouselExpansionRun,
): Promise<CanonicalCarouselExpansionRun> {
  const row = {
    id: NDXBOOK_CANONICAL_CAROUSEL_EXPANSION_DB_ID,
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

export function isCanonicalCarouselExpansionRecord(record: unknown): record is CanonicalCarouselExpansionRun {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as CanonicalCarouselExpansionRun).experimentClassification === CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT
  );
}
