/**
 * Orchestration store adapter — Supabase canonical, memory for unit tests.
 */

import {
  loadOrganizations,
  loadManifests,
  loadRequirements,
  loadAllRequirements,
  loadDependencies,
  loadWorkstreams,
  loadOverrides,
  loadEvidence,
  loadReconciliations,
  loadExternalConnections,
  loadOrchestrationEvents,
  loadEvolveItems,
  orchestrationTablesExist,
  updateReconciliation,
  updateRequirement,
  insertOrchestrationEvent,
  approveManifestDb,
} from './supabaseStore.js';
import {
  getOrchestrationStore,
  resetOrchestrationStore,
  findOrgBySlug as memFindOrg,
  findActiveManifest as memFindManifest,
  getRequirementsForManifest as memGetReqs,
  getDependenciesForManifest as memGetDeps,
} from './memoryStore.js';
import type {
  LaunchManifestRow,
  ManifestRequirementRow,
  OrganizationRow,
  RequirementDependencyRow,
  WorkstreamRow,
} from './types.js';

export function useMemoryStore(): boolean {
  return process.env.ORCHESTRATION_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

export async function resolveStoreMode(): Promise<'memory' | 'supabase'> {
  if (useMemoryStore()) return 'memory';
  if (await orchestrationTablesExist()) return 'supabase';
  return 'memory';
}

export async function getOrganizations(): Promise<OrganizationRow[]> {
  if ((await resolveStoreMode()) === 'memory') return getOrchestrationStore().organizations;
  return loadOrganizations();
}

export async function findOrgBySlug(slug: string): Promise<OrganizationRow | undefined> {
  if ((await resolveStoreMode()) === 'memory') return memFindOrg(slug);
  const orgs = await loadOrganizations();
  return orgs.find((o) => o.slug === slug);
}

export async function findActiveManifest(orgId: string): Promise<LaunchManifestRow | undefined> {
  if ((await resolveStoreMode()) === 'memory') return memFindManifest(orgId);
  const manifests = await loadManifests(orgId);
  return manifests.find((m) => m.is_active);
}

export async function getRequirementsForManifest(manifestId: string): Promise<ManifestRequirementRow[]> {
  if ((await resolveStoreMode()) === 'memory') return memGetReqs(manifestId);
  return loadRequirements(manifestId);
}

export async function getDependenciesForManifest(manifestId: string): Promise<RequirementDependencyRow[]> {
  if ((await resolveStoreMode()) === 'memory') return memGetDeps(manifestId);
  return loadDependencies(manifestId);
}

export async function getAllRequirements(orgId?: string): Promise<ManifestRequirementRow[]> {
  if ((await resolveStoreMode()) === 'memory') {
    const store = getOrchestrationStore();
    if (!orgId) return store.requirements;
    const m = store.manifests.find((mf) => mf.organization_id === orgId && mf.is_active);
    return m ? memGetReqs(m.id) : [];
  }
  return loadAllRequirements(orgId);
}

export async function getWorkstreams(orgId: string): Promise<WorkstreamRow[]> {
  if ((await resolveStoreMode()) === 'memory') {
    return getOrchestrationStore().workstreams.filter((w) => w.organization_id === orgId);
  }
  return loadWorkstreams(orgId);
}

export async function getOverrides(): Promise<Set<string>> {
  if ((await resolveStoreMode()) === 'memory') return getOrchestrationStore().overrides;
  return loadOverrides();
}

export async function getManifests(orgId?: string): Promise<LaunchManifestRow[]> {
  if ((await resolveStoreMode()) === 'memory') {
    const store = getOrchestrationStore();
    return orgId ? store.manifests.filter((m) => m.organization_id === orgId) : store.manifests;
  }
  return loadManifests(orgId);
}

export async function getEvidence(orgId: string) {
  if ((await resolveStoreMode()) === 'memory') {
    return getOrchestrationStore().evidence.filter((e) => e.organization_id === orgId);
  }
  return loadEvidence(orgId);
}

export async function getReconciliations(orgId: string, pendingOnly = false) {
  if ((await resolveStoreMode()) === 'memory') {
    return getOrchestrationStore().reconciliations.filter(
      (r) => r.organization_id === orgId && (!pendingOnly || !r.admin_decision),
    );
  }
  return loadReconciliations(orgId, pendingOnly);
}

export async function getExternalConnections(orgId?: string) {
  if ((await resolveStoreMode()) === 'memory') return getOrchestrationStore().externalConnections;
  return loadExternalConnections(orgId);
}

export async function getHistory(orgId?: string) {
  if ((await resolveStoreMode()) === 'memory') return getOrchestrationStore().history;
  return loadOrchestrationEvents(orgId);
}

export async function getEvolveRoadmap(orgId: string) {
  if ((await resolveStoreMode()) === 'memory') {
    return getOrchestrationStore().evolveItems.filter((e) => e.organization_id === orgId);
  }
  return loadEvolveItems(orgId);
}

export async function decideReconciliationDb(
  id: string,
  decision: 'ACCEPT' | 'REJECT' | 'MODIFY',
  actorEmail: string,
  modifiedState?: string,
) {
  const { getSupabaseAdmin } = await import('../supabase.js');
  const { data: record, error } = await getSupabaseAdmin()
    .from('site00_reconciliation_records')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !record) throw new Error('Reconciliation not found');

  const suggested = String(record.suggested_state ?? '');
  const declared = String(record.declared_state ?? '');
  const finalState = decision === 'ACCEPT' ? suggested : decision === 'MODIFY' && modifiedState ? modifiedState : declared;

  const updated = await updateReconciliation(id, {
    admin_decision: decision,
    decided_at: new Date().toISOString(),
    metadata: { ...(record.metadata as object), final_state: finalState, decided_by_email: actorEmail },
  });

  if (decision !== 'REJECT' && record.metadata && typeof record.metadata === 'object') {
    const wsKey = (record.metadata as Record<string, unknown>).workstream_key;
    if (wsKey && record.organization_id) {
      const orgId = record.organization_id as string;
      const ws = (await getWorkstreams(orgId)).find((w) => w.workstream_key === wsKey);
      if (ws) {
        const { upsertWorkstream } = await import('./supabaseStore.js');
        await upsertWorkstream({ ...ws, execution_status: finalState, updated_at: new Date().toISOString() });
      }
    }
  }

  await insertOrchestrationEvent({
    organization_id: record.organization_id as string,
    event_type: 'RECONCILIATION_DECIDED',
    actor_email: actorEmail,
    summary: `Reconciliation ${decision}: ${declared} → ${decision === 'REJECT' ? declared : finalState}`,
    after_state: { decision, finalState },
  });

  return updated;
}

export async function approveManifestPersisted(manifestId: string, approverEmail: string) {
  if ((await resolveStoreMode()) === 'memory') {
    const store = getOrchestrationStore();
    const manifest = store.manifests.find((m) => m.id === manifestId);
    if (!manifest) return { ok: false, error: 'Manifest not found' };
    for (const m of store.manifests) {
      if (m.organization_id === manifest.organization_id && m.is_active) {
        m.is_active = false;
        m.manifest_state = 'SUPERSEDED';
      }
    }
    manifest.approval_state = 'APPROVED';
    manifest.manifest_state = 'ACTIVE';
    manifest.is_active = true;
    manifest.is_provisional = false;
    manifest.approved_at = new Date().toISOString();
    return { ok: true };
  }
  const data = await approveManifestDb(manifestId, approverEmail);
  await insertOrchestrationEvent({
    manifest_id: manifestId,
    event_type: 'MANIFEST_APPROVED',
    actor_email: approverEmail,
    summary: `Manifest approved: ${data.target_name}`,
  });
  return { ok: true, manifest: data };
}

export { resetOrchestrationStore };
