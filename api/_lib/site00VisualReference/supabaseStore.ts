/**
 * Supabase persistence for visual reference intelligence.
 */

import { getSupabaseAdmin } from '../supabase.js';
import type {
  ClientVisualMemory,
  HostVisualMemory,
  VisualReferenceRecord,
} from '../../../shared/site00-visual-reference/types.js';
import { NDXBOOK_ORG_ID } from '../site00Evolve/creativeDirection/creativeIntelligence/founderComparisonSet.js';
import { StaleWriteConflictError } from '../../../shared/site00-studio-world-execution/errors.js';
import { ensureFounderProjectDbId, resolveFounderProjectDbId } from '../site00Projects/founderProjectDbId.js';
import { isFounderProjectSlug } from '../site00Projects/projectRegistry.js';

const STATE_TABLE = 'site00_visual_reference_state';
const RECORDS_TABLE = 'site00_visual_reference_records';

export async function visualReferenceTablesExist(): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from(STATE_TABLE).select('id').limit(1);
  return !error;
}

async function getState(scope: 'HOST' | 'CLIENT', projectSlug: string | null): Promise<{
  record: HostVisualMemory | ClientVisualMemory;
  version: number;
} | null> {
  let query = getSupabaseAdmin().from(STATE_TABLE).select('record, version').eq('scope', scope);
  if (projectSlug) {
    query = query.eq('project_slug', projectSlug);
  } else {
    query = query.is('project_slug', null);
  }
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return { record: data.record as HostVisualMemory | ClientVisualMemory, version: data.version as number };
}

async function upsertState(params: {
  scope: 'HOST' | 'CLIENT';
  projectSlug: string | null;
  projectId: string | null;
  record: HostVisualMemory | ClientVisualMemory;
}): Promise<void> {
  let query = getSupabaseAdmin().from(STATE_TABLE).select('id, version').eq('scope', params.scope);
  if (params.projectSlug) {
    query = query.eq('project_slug', params.projectSlug);
  } else {
    query = query.is('project_slug', null);
  }
  const { data: existing } = await query.maybeSingle();
  const version = ((existing?.version as number) ?? 0) + 1;
  const row = {
    organization_id: NDXBOOK_ORG_ID,
    scope: params.scope,
    project_id: params.projectId,
    project_slug: params.projectSlug,
    record: params.record,
    version,
    updated_at: new Date().toISOString(),
  };
  if (existing?.id) {
    const { error } = await getSupabaseAdmin().from(STATE_TABLE).update(row).eq('id', existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await getSupabaseAdmin().from(STATE_TABLE).insert(row);
  if (error?.code === '23505') {
    const { data: retry } = await query.maybeSingle();
    if (retry?.id) {
      const { error: updateError } = await getSupabaseAdmin()
        .from(STATE_TABLE)
        .update({ ...row, version: ((retry.version as number) ?? 0) + 1 })
        .eq('id', retry.id);
      if (updateError) throw new Error(updateError.message);
      return;
    }
  }
  if (error) throw new Error(error.message);
}

async function resolveClientProjectDbId(projectSlug: string): Promise<string | null> {
  if (!isFounderProjectSlug(projectSlug)) return null;
  try {
    return await ensureFounderProjectDbId(projectSlug);
  } catch {
    return await resolveFounderProjectDbId(projectSlug);
  }
}

export async function getHostVisualMemory(): Promise<HostVisualMemory | null> {
  const state = await getState('HOST', null);
  return (state?.record as HostVisualMemory) ?? null;
}

export async function saveHostVisualMemory(next: HostVisualMemory): Promise<HostVisualMemory> {
  await upsertState({ scope: 'HOST', projectSlug: null, projectId: null, record: next });
  for (const ref of next.references) {
    await saveVisualReference(ref);
  }
  return next;
}

export async function getClientVisualMemory(projectId: string): Promise<ClientVisualMemory | null> {
  const state = await getState('CLIENT', projectId);
  return (state?.record as ClientVisualMemory) ?? null;
}

export async function saveClientVisualMemory(next: ClientVisualMemory): Promise<ClientVisualMemory> {
  const projectDbId = await resolveClientProjectDbId(next.projectId);
  await upsertState({
    scope: 'CLIENT',
    projectSlug: next.projectId,
    projectId: projectDbId,
    record: next,
  });
  for (const ref of next.references) {
    await saveVisualReference(ref);
  }
  return next;
}

export async function getVisualReferenceById(id: string): Promise<VisualReferenceRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(RECORDS_TABLE)
    .select('record')
    .eq('reference_id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data.record as VisualReferenceRecord;
}

export async function saveVisualReference(
  ref: VisualReferenceRecord,
  expectedVersion?: number,
): Promise<VisualReferenceRecord> {
  const { data: existing } = await getSupabaseAdmin()
    .from(RECORDS_TABLE)
    .select('version')
    .eq('reference_id', ref.id)
    .maybeSingle();

  const currentVersion = (existing?.version as number) ?? 0;
  if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
    throw new StaleWriteConflictError(
      `Stale write on visual reference ${ref.id}`,
      expectedVersion,
      currentVersion,
    );
  }

  const row = {
    reference_id: ref.id,
    organization_id: NDXBOOK_ORG_ID,
    project_slug: ref.projectId,
    scope: ref.projectId ? 'CLIENT' : 'HOST',
    record: ref,
    version: currentVersion + 1,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin().from(RECORDS_TABLE).upsert(row, { onConflict: 'reference_id' });
  if (error) throw new Error(error.message);
  return ref;
}

export function resetVisualReferenceMemory(): void {
  // no-op for supabase
}
