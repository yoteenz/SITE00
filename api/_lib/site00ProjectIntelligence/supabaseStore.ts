/**
 * Supabase persistence for project intelligence manifests.
 */

import { getSupabaseAdmin } from '../supabase.js';
import type { ProjectIntelligenceIntakeManifest } from '../../../shared/site00-project-intelligence/types.js';
import { NDXBOOK_ORG_ID } from '../site00Evolve/creativeDirection/creativeIntelligence/founderComparisonSet.js';
import { StaleWriteConflictError } from '../../../shared/site00-studio-world-execution/errors.js';
import { resolveProjectDbIdForSupabaseFk } from '../site00Projects/founderProjectDbId.js';

const TABLE = 'site00_project_intelligence_manifests';

export async function projectIntelligenceTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(TABLE).select('id').limit(1);
  return !error;
}

export async function getLatestManifest(projectSlug: string): Promise<ProjectIntelligenceIntakeManifest | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('project_slug', projectSlug)
    .order('manifest_version', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as ProjectIntelligenceIntakeManifest;
}

export async function getAllManifests(projectSlug: string): Promise<ProjectIntelligenceIntakeManifest[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('record')
    .eq('project_slug', projectSlug)
    .order('manifest_version', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.record as ProjectIntelligenceIntakeManifest);
}

export async function saveManifest(
  manifest: ProjectIntelligenceIntakeManifest,
  expectedVersion?: number,
): Promise<ProjectIntelligenceIntakeManifest> {
  const { data: existing } = await getSupabaseAdmin()
    .from(TABLE)
    .select('version')
    .eq('manifest_id', manifest.manifestId)
    .maybeSingle();

  const currentVersion = (existing?.version as number) ?? 0;
  if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
    throw new StaleWriteConflictError(
      `Stale write on manifest ${manifest.manifestId}`,
      expectedVersion,
      currentVersion,
    );
  }

  const projectDbId = await resolveProjectDbIdForSupabaseFk(manifest.projectId, manifest.projectSlug);
  if (!projectDbId) {
    throw new Error(`Cannot resolve project UUID for manifest slug ${manifest.projectSlug}`);
  }
  const row = {
    manifest_id: manifest.manifestId,
    organization_id: NDXBOOK_ORG_ID,
    project_id: projectDbId,
    project_slug: manifest.projectSlug,
    manifest_version: manifest.manifestVersion,
    fingerprint: manifest.fingerprint,
    record: manifest,
    version: currentVersion + 1,
    updated_at: manifest.compiledAt,
  };

  const { error } = await getSupabaseAdmin().from(TABLE).upsert(row, { onConflict: 'manifest_id' });
  if (error) throw new Error(error.message);
  return manifest;
}

export function resetProjectIntelligenceMemory(): void {
  // no-op for supabase
}
