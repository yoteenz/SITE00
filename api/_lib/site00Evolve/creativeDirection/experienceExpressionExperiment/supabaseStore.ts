/**
 * Supabase persistence for Experiment E — experience expression runs.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { ExperienceExpressionRun } from '../../../../../shared/site00-brand-lore/experienceExpression/types.js';
import {
  EXPERIMENT_E_CLASSIFICATION,
  EXPERIMENT_E_DB_ID,
} from '../../../../../shared/site00-brand-lore/experienceExpression/constants.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { StaleWriteConflictError } from '../../../../../shared/site00-studio-world-execution/errors.js';
import { resolveProjectDbIdForSupabaseFk } from '../../../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_methodology_validation_runs';
const MODE = 'NDX_EXPERIENCE_EXPRESSION';

export async function methodologyValidationTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getExperienceExpressionRun(_runId: string): Promise<ExperienceExpressionRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record, version')
    .eq('id', EXPERIMENT_E_DB_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as ExperienceExpressionRun;
}

export async function saveExperienceExpressionRun(
  run: ExperienceExpressionRun,
  expectedVersion?: number,
): Promise<ExperienceExpressionRun> {
  const { data: existing } = await getSupabaseAdmin()
    .from(TABLE)
    .select('version')
    .eq('id', EXPERIMENT_E_DB_ID)
    .maybeSingle();

  const currentVersion = (existing?.version as number) ?? 0;
  if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
    throw new StaleWriteConflictError(
      `Stale write on Experiment E run`,
      expectedVersion,
      currentVersion,
    );
  }

  const projectDbId = await resolveProjectDbIdForSupabaseFk(run.projectId);

  const row = {
    id: EXPERIMENT_E_DB_ID,
    organization_id: run.organizationId || NDXBOOK_ORG_ID,
    project_id: projectDbId,
    mode: MODE,
    status: run.status,
    record: run,
    idempotency_key: run.runId,
    version: currentVersion + 1,
    updated_at: run.completedAt ?? run.startedAt ?? new Date().toISOString(),
  };

  if (expectedVersion !== undefined) {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .update(row)
      .eq('id', EXPERIMENT_E_DB_ID)
      .eq('version', expectedVersion)
      .select('record')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      throw new StaleWriteConflictError('Stale write on Experiment E run', expectedVersion, currentVersion);
    }
    return data.record as ExperienceExpressionRun;
  }

  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return run;
}

export function isExperimentERecord(record: unknown): record is ExperienceExpressionRun {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as ExperienceExpressionRun).experimentClassification === EXPERIMENT_E_CLASSIFICATION
  );
}
