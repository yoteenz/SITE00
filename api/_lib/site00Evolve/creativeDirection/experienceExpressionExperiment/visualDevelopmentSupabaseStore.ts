/**
 * Supabase persistence for visual development runs.
 */

import { getSupabaseAdmin } from '../../../supabase.js';
import type { ProjectWorkspaceVisualDevelopmentRun } from '../../../../../shared/site00-brand-lore/experienceExpression/designProofTypes.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import { StaleWriteConflictError } from '../../../../../shared/site00-studio-world-execution/errors.js';

const TABLE = 'site00_visual_development_runs';
const DEFAULT_RUN_ID = 'ndxbook-visual-development';

export async function visualDevelopmentTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getVisualDevelopmentRun(): Promise<ProjectWorkspaceVisualDevelopmentRun | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('run_id', DEFAULT_RUN_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as ProjectWorkspaceVisualDevelopmentRun;
}

export async function saveVisualDevelopmentRun(
  next: ProjectWorkspaceVisualDevelopmentRun,
  expectedVersion?: number,
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  const { data: existing } = await getSupabaseAdmin()
    .from(TABLE)
    .select('version')
    .eq('run_id', next.runId || DEFAULT_RUN_ID)
    .maybeSingle();

  const currentVersion = (existing?.version as number) ?? 0;
  if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
    throw new StaleWriteConflictError(
      `Stale write on visual development run ${next.runId}`,
      expectedVersion,
      currentVersion,
    );
  }

  const row = {
    run_id: next.runId || DEFAULT_RUN_ID,
    organization_id: NDXBOOK_ORG_ID,
    project_id: next.projectId,
    project_slug: 'ndxbook',
    record: next,
    version: currentVersion + 1,
    updated_at: next.compiledAt ?? new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'run_id' });
  if (error) throw new Error(error.message);
  return next;
}

export function resetVisualDevelopmentMemory(): void {
  // no-op for supabase
}
