import { calculateReadiness, explainRequirement } from './readinessCalculator.js';
import { buildCommandQueue, buildNextActions } from './commandQueue.js';
import { calculateDeferralImpact, buildDeferralRecord } from './deferralEngine.js';
import { generateProposedManifest } from './manifestBuilder.js';
import { validateDependencyGraph, CircularDependencyError } from './dependencyGraph.js';
import { suggestReconciliation, applyReconciliationDecision, evidenceImpliesCompletion } from './reconciliationService.js';
import {
  getOrganizations,
  findOrgBySlug,
  findActiveManifest,
  getRequirementsForManifest,
  getDependenciesForManifest,
  getManifests,
  getWorkstreams,
  getOverrides,
  getEvidence,
  getReconciliations,
  getExternalConnections,
  getHistory,
  getEvolveRoadmap,
  decideReconciliationDb,
  approveManifestPersisted,
  resolveStoreMode,
  resetOrchestrationStore,
} from './storeAdapter.js';
import { getOrchestrationStore } from './memoryStore.js';
import { deriveProjectHealth, infrastructureHealth } from './projectHealth.js';
import { bootstrapRegistry, isRegistryBootstrapped } from './registryBootstrap.js';
import type { ManifestBuilderInput, IngestionInput, DeferralImpact } from './types.js';
import type { ManifestRequirementRow } from './types.js';

export async function getOrchestrationDebugPayload() {
  const mode = await resolveStoreMode();
  const orgs = await getOrganizations();
  const clientFacingOrgs = orgs.filter((o) => o.client_facing);
  const infrastructureOrgs = orgs.filter((o) => !o.client_facing);
  const overrides = await getOverrides();

  const manifests = await getManifests();
  const manifestsWithReadiness = await Promise.all(
    manifests.map(async (m) => {
      const reqs = await getRequirementsForManifest(m.id);
      const readiness = calculateReadiness(reqs, overrides);
      return {
        ...m,
        readiness,
        label: m.is_provisional !== false ? 'PROVISIONAL' : 'APPROVED',
      };
    }),
  );

  const allRequirements: ManifestRequirementRow[] = [];
  for (const m of manifests.filter((x) => x.is_active)) {
    allRequirements.push(...(await getRequirementsForManifest(m.id)));
  }

  const allDeps = [];
  for (const m of manifests) {
    allDeps.push(...(await getDependenciesForManifest(m.id)));
  }

  const commandQueue = [];
  for (const org of clientFacingOrgs) {
    const manifest = await findActiveManifest(org.id);
    if (!manifest) continue;
    const reqs = await getRequirementsForManifest(manifest.id);
    const ws = await getWorkstreams(org.id);
    const pendingApprovals = manifests.filter(
      (m) => m.organization_id === org.id && m.approval_state === 'PENDING',
    ).length;
    const pendingRecon = (await getReconciliations(org.id, true)).length;
    commandQueue.push(
      ...buildCommandQueue({
        organizationSlug: org.slug,
        organizationName: org.name,
        requirements: reqs,
        workstreams: ws,
        overrides,
        pendingApprovals: pendingApprovals + pendingRecon,
      }),
    );
  }

  const nextActions = [];
  for (const org of clientFacingOrgs) {
    const manifest = await findActiveManifest(org.id);
    if (!manifest) continue;
    nextActions.push(
      ...buildNextActions({
        organizationSlug: org.slug,
        organizationName: org.name,
        requirements: await getRequirementsForManifest(manifest.id),
        workstreams: await getWorkstreams(org.id),
        overrides,
        pendingApprovals: 0,
      }),
    );
  }

  const relationships = [
    { source: 'frontal-slayer', target: 'studio-world', type: 'PRODUCTION_ENGINE', note: 'Frontal Slayer uses Studio World as production engine' },
    { source: 'studio-world', target: 'frontal-slayer', type: 'SHARED_REPOSITORY', note: 'Same physical repository (yoteenz/fsbw), different logical systems' },
  ];

  const evolveRoadmap = [];
  for (const org of orgs) {
    evolveRoadmap.push(...(await getEvolveRoadmap(org.id)));
  }

  const projectHealth: Record<string, string> = {};
  for (const org of orgs) {
    const manifest = await findActiveManifest(org.id);
    const reqs = manifest ? await getRequirementsForManifest(manifest.id) : [];
    projectHealth[org.slug] = org.client_facing
      ? deriveProjectHealth({
          organization: org,
          manifest,
          requirements: reqs,
          overrides,
          pendingReconciliations: (await getReconciliations(org.id, true)).length,
          pendingApprovals: manifests.filter((m) => m.organization_id === org.id && m.approval_state === 'PENDING').length,
        })
      : infrastructureHealth({
          connectionStates: (await getExternalConnections(org.id)).map((c) => c.connection_state as string),
        });
  }

  const reconciliationSummary: Record<string, Record<string, number>> = {};
  for (const org of orgs) {
    const recs = await getReconciliations(org.id);
    reconciliationSummary[org.slug] = {
      total: recs.length,
      confirmed: recs.filter((r) => r.outcome === 'CONFIRMED').length,
      probable: recs.filter((r) => r.outcome === 'PROBABLE').length,
      missing_evidence: recs.filter((r) => r.outcome === 'MISSING_EVIDENCE').length,
      requires_review: recs.filter((r) => r.outcome === 'REQUIRES_REVIEW' || !r.admin_decision).length,
    };
  }

  return {
    label: mode === 'supabase' ? 'RECONCILED / PROVISIONAL' : 'DEMO / UNRECONCILED (memory)',
    persistenceMode: mode,
    organizations: orgs,
    clientFacingOrganizations: clientFacingOrgs,
    infrastructureOrganizations: infrastructureOrgs,
    relationships,
    manifests: manifestsWithReadiness,
    requirements: allRequirements,
    dependencies: allDeps,
    commandQueue: commandQueue.sort((a, b) => a.priority - b.priority),
    nextActions: nextActions.sort((a, b) => a.priority - b.priority),
    externalConnections: await getExternalConnections(),
    evidence: mode === 'supabase' ? (await Promise.all(orgs.map((o) => getEvidence(o.id)))).flat() : [],
    reconciliations: mode === 'supabase' ? (await Promise.all(orgs.map((o) => getReconciliations(o.id)))).flat() : [],
    evolveRoadmap,
    deferrals: [],
    overrides: [...overrides],
    history: await getHistory(),
    ingestions: [],
    projectHealth,
    reconciliationSummary,
    provisionalBaselines: manifestsWithReadiness
      .filter((m) => m.is_active && m.is_provisional !== false)
      .map((m) => ({
        orgId: m.organization_id,
        target: m.target_name,
        readiness: m.readiness?.readinessScore,
        blockers: m.readiness?.blockingRequirementsRemaining,
        pendingDecisions: reconciliationSummary[orgs.find((o) => o.id === m.organization_id)?.slug ?? '']?.requires_review ?? 0,
      })),
    proposedManifestExample: generateProposedManifest({ organizationSlug: 'all-in-one-enterprises' }),
  };
}

export async function runBootstrap(workspaceRoot: string) {
  return bootstrapRegistry(workspaceRoot);
}

export async function ensureBootstrapped(workspaceRoot: string) {
  if (await isRegistryBootstrapped()) return { skipped: true };
  return bootstrapRegistry(workspaceRoot);
}

export function proposeManifest(input: ManifestBuilderInput) {
  return generateProposedManifest(input);
}

export async function approveManifest(manifestId: string, approverEmail: string) {
  return approveManifestPersisted(manifestId, approverEmail);
}

export async function deferRequirement(
  requirementId: string,
  deferredByEmail: string,
  reason: string,
): Promise<{ ok: boolean; deferral?: Record<string, unknown>; evolveItem?: Record<string, unknown>; error?: string }> {
  const mode = await resolveStoreMode();
  if (mode === 'memory') {
    const store = getOrchestrationStore();
    const req = store.requirements.find((r) => r.id === requirementId);
    if (!req) return { ok: false, error: 'Requirement not found' };
    req.classification = 'DEFERRED_BY_OWNER';
    req.target_milestone = 'EVOLVE / POST-LAUNCH';
    store.history.push({ event_type: 'REQUIREMENT_DEFERRED', requirement_id: requirementId, actor_email: deferredByEmail });
    return { ok: true, deferral: { requirementId, reason } };
  }
  const orgs = await getOrganizations();
  let req: ManifestRequirementRow | undefined;
  for (const org of orgs) {
    const m = await findActiveManifest(org.id);
    if (!m) continue;
    req = (await getRequirementsForManifest(m.id)).find((r) => r.id === requirementId);
    if (req) break;
  }
  if (!req) return { ok: false, error: 'Requirement not found' };

  const { updateRequirement, insertEvolveItem, insertOrchestrationEvent } = await import('./supabaseStore.js');
  const deps = await getDependenciesForManifest(req.manifest_id);
  const impact = calculateDeferralImpact(req, [req], deps);
  const record = buildDeferralRecord(req, req.manifest_id, deferredByEmail, reason, impact);

  await updateRequirement(requirementId, {
    classification: 'DEFERRED_BY_OWNER',
    target_milestone: impact.suggestedDestination,
    why_required: reason,
  });

  let orgId: string | undefined;
  for (const o of orgs) {
    const m = await findActiveManifest(o.id);
    if (m?.id === req.manifest_id) {
      orgId = o.id;
      break;
    }
  }

  const evolveItem = await insertEvolveItem({
    organization_id: orgId,
    manifest_id: req.manifest_id,
    deferred_requirement_id: requirementId,
    title: req.title,
    description: reason,
    category: 'EVOLVE',
    status: 'PLANNED',
  });

  await insertOrchestrationEvent({
    organization_id: orgId,
    requirement_id: requirementId,
    event_type: 'REQUIREMENT_DEFERRED',
    actor_email: deferredByEmail,
    summary: `Deferred "${req.title}" to post-launch`,
  });

  return { ok: true, deferral: record as unknown as Record<string, unknown>, evolveItem };
}

export async function previewDeferralImpact(requirementId: string): Promise<DeferralImpact | null> {
  const orgs = await getOrganizations();
  for (const org of orgs) {
    const m = await findActiveManifest(org.id);
    if (!m) continue;
    const req = (await getRequirementsForManifest(m.id)).find((r) => r.id === requirementId);
    if (req) return calculateDeferralImpact(req, await getRequirementsForManifest(m.id), await getDependenciesForManifest(m.id));
  }
  return null;
}

export async function applyLaunchOverride(
  requirementId: string,
  approverEmail: string,
  reason: string,
  impactAcknowledgment: string,
) {
  const orgs = await getOrganizations();
  for (const org of orgs) {
    const m = await findActiveManifest(org.id);
    if (!m) continue;
    const req = (await getRequirementsForManifest(m.id)).find((r) => r.id === requirementId);
    if (!req) continue;

    if ((await resolveStoreMode()) === 'supabase') {
      const { getSupabaseAdmin } = await import('../supabase.js');
      const { insertOrchestrationEvent } = await import('./supabaseStore.js');
      await getSupabaseAdmin().from('site00_launch_overrides').insert({
        requirement_id: requirementId,
        manifest_id: m.id,
        approver_email: approverEmail,
        reason,
        impact_acknowledgment: impactAcknowledgment,
      });
      await insertOrchestrationEvent({
        organization_id: org.id,
        requirement_id: requirementId,
        event_type: 'LAUNCH_OVERRIDE_APPROVED',
        actor_email: approverEmail,
        summary: `Launch override for "${req.title}" — underlying state preserved (${req.execution_status})`,
        metadata: { reason, impactAcknowledgment },
      });
    } else {
      const { getOrchestrationStore } = await import('./memoryStore.js');
      getOrchestrationStore().overrides.add(requirementId);
    }
    return { ok: true };
  }
  return { ok: false, error: 'Requirement not found' };
}

export async function recordExternalEvidence(input: {
  organizationSlug: string;
  requirementKey: string;
  title: string;
  source: string;
}) {
  const org = await findOrgBySlug(input.organizationSlug);
  if (!org) throw new Error('Organization not found');
  const manifest = await findActiveManifest(org.id);
  const req = manifest
    ? (await getRequirementsForManifest(manifest.id)).find((r) => r.requirement_key === input.requirementKey)
    : undefined;

  const evidence = {
    organization_id: org.id,
    requirement_id: req?.id,
    title: input.title,
    source: input.source,
    evidence_type: 'EXTERNAL_ACTIVITY',
    does_not_imply_completion: true,
  };

  if ((await resolveStoreMode()) === 'supabase') {
    await import('./supabaseStore.js').then((s) => s.insertEvidenceBatch([{ ...evidence, description: 'Evidence recorded — does not imply completion' }]));
  }

  return { evidence, requirementUnchanged: true as const };
}

export async function runReconciliation(input: {
  organizationSlug: string;
  requirementKey: string;
  declaredState: string;
}) {
  const org = await findOrgBySlug(input.organizationSlug);
  if (!org) throw new Error('Organization not found');
  const manifest = await findActiveManifest(org.id);
  const req = manifest
    ? (await getRequirementsForManifest(manifest.id)).find((r) => r.requirement_key === input.requirementKey)
    : undefined;

  const evidence = await getEvidence(org.id);
  const relatedEvidence = evidence.filter((e) => e.requirement_id === req?.id || (e.metadata as Record<string, unknown>)?.requirement_key === input.requirementKey);

  const suggestion = suggestReconciliation({
    declaredState: input.declaredState,
    evidenceTitles: relatedEvidence.length ? relatedEvidence.map((e) => String(e.title)) : [],
    requirementTitle: req?.title ?? input.requirementKey,
  });

  if ((await resolveStoreMode()) === 'supabase') {
    const { insertReconciliation } = await import('./supabaseStore.js');
    return insertReconciliation({
      organization_id: org.id,
      requirement_id: req?.id,
      declared_state: input.declaredState,
      observed_evidence_summary: suggestion.observedEvidenceSummary,
      suggested_state: suggestion.suggestedState,
      confidence: suggestion.confidence,
      outcome: suggestion.outcome,
      admin_decision: null,
    });
  }

  const { getOrchestrationStore } = await import('./memoryStore.js');
  const record = {
    id: `recon-${Date.now()}`,
    organization_id: org.id,
    requirement_id: req?.id,
    declaredState: input.declaredState,
    observedEvidenceSummary: suggestion.observedEvidenceSummary,
    suggestedState: suggestion.suggestedState,
    confidence: suggestion.confidence,
    outcome: suggestion.outcome,
    admin_decision: null,
    created_at: new Date().toISOString(),
  };
  getOrchestrationStore().reconciliations.push(record);
  return record;
}

export async function decideReconciliation(
  reconciliationId: string,
  decision: 'ACCEPT' | 'REJECT' | 'MODIFY',
  actorEmail: string,
  modifiedState?: string,
) {
  if ((await resolveStoreMode()) === 'supabase') {
    return decideReconciliationDb(reconciliationId, decision, actorEmail, modifiedState);
  }
  if ((await resolveStoreMode()) === 'memory') {
    const { getOrchestrationStore } = await import('./memoryStore.js');
    const store = getOrchestrationStore();
    const record = store.reconciliations.find((r) => r.id === reconciliationId);
    if (!record) throw new Error('Reconciliation not found');
    const result = applyReconciliationDecision(
      {
        declaredState: String(record.declaredState),
        observedEvidenceSummary: String(record.observedEvidenceSummary),
        suggestedState: String(record.suggestedState),
        confidence: record.confidence as 'LOW' | 'MEDIUM' | 'HIGH',
        outcome: record.outcome as import('./types.js').ReconciliationOutcome,
        requiresAdminApproval: true,
      },
      decision,
      modifiedState,
    );
    record.admin_decision = decision;
    record.final_state = result.newState;
    return record;
  }
  throw new Error('Unknown store mode');
}

export async function ingestProject(input: IngestionInput) {
  if ((await resolveStoreMode()) === 'supabase') {
    const { ingestExistingProject } = await import('./historyService.js');
    return ingestExistingProject(input);
  }
  return { id: `ingest-${Date.now()}`, ...input, ingestion_state: 'RECONCILIATION_REQUIRED' };
}

export async function getReadinessForOrg(orgSlug: string) {
  const org = await findOrgBySlug(orgSlug);
  if (!org) return null;
  const manifest = await findActiveManifest(org.id);
  if (!manifest) return null;
  const reqs = await getRequirementsForManifest(manifest.id);
  const overrides = await getOverrides();
  return calculateReadiness(reqs, overrides);
}

export async function getRequirementExplanation(requirementId: string) {
  const orgs = await getOrganizations();
  for (const org of orgs) {
    const m = await findActiveManifest(org.id);
    if (!m) continue;
    const reqs = await getRequirementsForManifest(m.id);
    const req = reqs.find((r) => r.id === requirementId);
    if (req) return explainRequirement(req, await getDependenciesForManifest(m.id), reqs);
  }
  return null;
}

export async function validateManifestDependencies(manifestId: string) {
  validateDependencyGraph(await getDependenciesForManifest(manifestId));
}

export async function isParentBlockedByDependencies(parentKey: string, manifestId: string) {
  const reqs = await getRequirementsForManifest(manifestId);
  const deps = await getDependenciesForManifest(manifestId);
  const parent = reqs.find((r) => r.requirement_key === parentKey);
  if (!parent) return false;
  const childDeps = deps.filter((d) => d.source_requirement_id === parent.id);
  for (const dep of childDeps) {
    const child = reqs.find((r) => r.id === dep.target_requirement_id);
    if (child && child.execution_status !== 'COMPLETE' && child.classification !== 'COMPLETE') return true;
  }
  return false;
}

export { CircularDependencyError, generateProposedManifest, calculateReadiness, resetOrchestrationStore };
export type { ManifestRequirementRow, ManifestBuilderInput, IngestionInput };
