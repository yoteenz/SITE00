import { calculateReadiness, explainRequirement } from './readinessCalculator.js';
import { buildCommandQueue, buildNextActions } from './commandQueue.js';
import { calculateDeferralImpact, buildDeferralRecord } from './deferralEngine.js';
import { generateProposedManifest } from './manifestBuilder.js';
import { validateDependencyGraph, CircularDependencyError } from './dependencyGraph.js';
import { suggestReconciliation, applyReconciliationDecision, evidenceImpliesCompletion } from './reconciliationService.js';
import {
  getOrchestrationStore,
  findOrgBySlug,
  findActiveManifest,
  getRequirementsForManifest,
  getDependenciesForManifest,
} from './memoryStore.js';
import { getEvolveItemsFromRequirements } from './seedFixtures.js';
import type { ManifestBuilderInput, IngestionInput, DeferralImpact } from './types.js';
import type { ManifestRequirementRow } from './types.js';

export async function getOrchestrationDebugPayload() {
  const store = getOrchestrationStore();
  const orgs = store.organizations;
  const clientFacingOrgs = orgs.filter((o) => o.client_facing);
  const infrastructureOrgs = orgs.filter((o) => !o.client_facing);

  const manifestsWithReadiness = store.manifests.map((m) => {
    const reqs = getRequirementsForManifest(m.id);
    const readiness = calculateReadiness(reqs, store.overrides);
    return { ...m, readiness };
  });

  const allRequirements = store.requirements;
  const allDeps = store.dependencies;

  const commandQueue = clientFacingOrgs.flatMap((org) => {
    const manifest = findActiveManifest(org.id);
    if (!manifest) return [];
    const reqs = getRequirementsForManifest(manifest.id);
    const ws = store.workstreams.filter((w) => w.organization_id === org.id);
    const pendingApprovals = store.manifests.filter(
      (m) => m.organization_id === org.id && m.approval_state === 'PENDING',
    ).length;
    return buildCommandQueue({
      organizationSlug: org.slug,
      organizationName: org.name,
      requirements: reqs,
      workstreams: ws,
      overrides: store.overrides,
      pendingApprovals,
    });
  });

  const nextActions = clientFacingOrgs.flatMap((org) => {
    const manifest = findActiveManifest(org.id);
    if (!manifest) return [];
    return buildNextActions({
      organizationSlug: org.slug,
      organizationName: org.name,
      requirements: getRequirementsForManifest(manifest.id),
      workstreams: store.workstreams.filter((w) => w.organization_id === org.id),
      overrides: store.overrides,
      pendingApprovals: 0,
    });
  });

  const relationships = [
    {
      source: 'frontal-slayer',
      target: 'studio-world',
      type: 'PRODUCTION_ENGINE',
      note: 'Frontal Slayer uses Studio World as production engine',
    },
    {
      source: 'studio-world',
      target: 'frontal-slayer',
      type: 'SHARED_REPOSITORY',
      note: 'Same physical repository, different logical systems',
    },
  ];

  const evolveRoadmap = orgs.flatMap((org) =>
    getEvolveItemsFromRequirements(
      store.requirements.filter((r) => {
        const m = store.manifests.find((mf) => mf.id === r.manifest_id && mf.is_active);
        return m && m.organization_id === org.id;
      }),
      org.id,
    ),
  );

  return {
    label: 'DEMO / UNRECONCILED',
    organizations: orgs,
    clientFacingOrganizations: clientFacingOrgs,
    infrastructureOrganizations: infrastructureOrgs,
    relationships,
    manifests: manifestsWithReadiness,
    requirements: allRequirements,
    dependencies: allDeps,
    workstreams: store.workstreams,
    commandQueue,
    nextActions,
    externalConnections: store.externalConnections,
    signals: store.signals,
    evidence: store.evidence,
    reconciliations: store.reconciliations,
    evolveRoadmap,
    deferrals: store.deferrals,
    overrides: [...store.overrides],
    history: store.history,
    ingestions: store.ingestions,
    proposedManifestExample: generateProposedManifest({ organizationSlug: 'all-in-one-enterprises' }),
  };
}

export function proposeManifest(input: ManifestBuilderInput) {
  return generateProposedManifest(input);
}

export function approveManifest(manifestId: string, approverEmail: string): { ok: boolean; error?: string } {
  const store = getOrchestrationStore();
  const manifest = store.manifests.find((m) => m.id === manifestId);
  if (!manifest) return { ok: false, error: 'Manifest not found' };
  if (manifest.approval_state === 'APPROVED' && manifest.is_active) {
    return { ok: false, error: 'Already active' };
  }

  for (const m of store.manifests) {
    if (m.organization_id === manifest.organization_id && m.is_active) {
      m.is_active = false;
      m.manifest_state = 'SUPERSEDED';
    }
  }

  manifest.approval_state = 'APPROVED';
  manifest.manifest_state = 'ACTIVE';
  manifest.is_active = true;
  manifest.approved_at = new Date().toISOString();
  manifest.approved_by = approverEmail;

  store.history.push({
    event_type: 'MANIFEST_APPROVED',
    manifest_id: manifestId,
    actor_email: approverEmail,
    summary: `Manifest "${manifest.target_name}" approved and activated`,
    created_at: new Date().toISOString(),
  });

  return { ok: true };
}

export function canActivateManifest(manifestId: string): boolean {
  const store = getOrchestrationStore();
  const manifest = store.manifests.find((m) => m.id === manifestId);
  return manifest?.approval_state === 'APPROVED' || false;
}

export function deferRequirement(
  requirementId: string,
  deferredByEmail: string,
  reason: string,
): { ok: boolean; deferral?: Record<string, unknown>; evolveItem?: Record<string, unknown>; error?: string } {
  const store = getOrchestrationStore();
  const req = store.requirements.find((r) => r.id === requirementId);
  if (!req) return { ok: false, error: 'Requirement not found' };

  const deps = getDependenciesForManifest(req.manifest_id);
  const impact = calculateDeferralImpact(req, store.requirements, deps);
  const record = buildDeferralRecord(req, req.manifest_id, deferredByEmail, reason, impact);

  const before = { classification: req.classification };
  req.classification = 'DEFERRED_BY_OWNER';
  req.target_milestone = impact.suggestedDestination;
  req.why_required = reason;

  const evolveItem = {
    id: `evolve-${requirementId}`,
    organization_id: store.manifests.find((m) => m.id === req.manifest_id)?.organization_id,
    deferred_requirement_id: requirementId,
    title: req.title,
    description: reason,
    category: 'EVOLVE',
    status: 'PLANNED',
  };

  store.deferrals.push({ ...record, deferred_at: new Date().toISOString() });
  store.evolveItems.push(evolveItem);
  store.history.push({
    event_type: 'REQUIREMENT_DEFERRED',
    requirement_id: requirementId,
    before_state: before,
    after_state: { classification: 'DEFERRED_BY_OWNER', reason },
    actor_email: deferredByEmail,
    summary: `Deferred "${req.title}" to post-launch`,
    created_at: new Date().toISOString(),
  });

  return { ok: true, deferral: record as unknown as Record<string, unknown>, evolveItem };
}

export function previewDeferralImpact(requirementId: string): DeferralImpact | null {
  const store = getOrchestrationStore();
  const req = store.requirements.find((r) => r.id === requirementId);
  if (!req) return null;
  return calculateDeferralImpact(req, store.requirements, getDependenciesForManifest(req.manifest_id));
}

export function applyLaunchOverride(
  requirementId: string,
  approverEmail: string,
  reason: string,
  impactAcknowledgment: string,
): { ok: boolean; error?: string } {
  const store = getOrchestrationStore();
  const req = store.requirements.find((r) => r.id === requirementId);
  if (!req) return { ok: false, error: 'Requirement not found' };

  store.overrides.add(requirementId);
  store.history.push({
    event_type: 'LAUNCH_OVERRIDE_APPROVED',
    requirement_id: requirementId,
    actor_email: approverEmail,
    summary: `Launch override for "${req.title}" — underlying state preserved (${req.execution_status})`,
    metadata: { reason, impactAcknowledgment },
    created_at: new Date().toISOString(),
  });

  return { ok: true };
}

export function recordExternalEvidence(input: {
  organizationSlug: string;
  requirementKey: string;
  title: string;
  source: string;
}): { evidence: Record<string, unknown>; requirementUnchanged: true } {
  const store = getOrchestrationStore();
  const org = findOrgBySlug(input.organizationSlug);
  const manifest = org ? findActiveManifest(org.id) : undefined;
  const req = store.requirements.find(
    (r) => r.manifest_id === manifest?.id && r.requirement_key === input.requirementKey,
  );

  const evidence = {
    id: `evidence-${Date.now()}`,
    organization_id: org?.id,
    requirement_id: req?.id,
    title: input.title,
    source: input.source,
    does_not_imply_completion: true,
    recorded_at: new Date().toISOString(),
  };

  store.evidence.push(evidence);

  if (req && !evidenceImpliesCompletion()) {
    // Requirement execution status intentionally NOT changed
  }

  return { evidence, requirementUnchanged: true };
}

export function runReconciliation(input: {
  organizationSlug: string;
  requirementKey: string;
  declaredState: string;
}): Record<string, unknown> {
  const store = getOrchestrationStore();
  const org = findOrgBySlug(input.organizationSlug)!;
  const manifest = findActiveManifest(org.id)!;
  const req = store.requirements.find(
    (r) => r.manifest_id === manifest.id && r.requirement_key === input.requirementKey,
  )!;

  const relatedEvidence = store.evidence
    .filter((e) => e.requirement_id === req?.id)
    .map((e) => String(e.title));

  const suggestion = suggestReconciliation({
    declaredState: input.declaredState,
    evidenceTitles: relatedEvidence.length ? relatedEvidence : ['search implemented', 'filters implemented', 'responsive route exists'],
    requirementTitle: req?.title ?? input.requirementKey,
  });

  const record = {
    id: `recon-${Date.now()}`,
    organization_id: org.id,
    requirement_id: req?.id,
    ...suggestion,
    admin_decision: null,
    created_at: new Date().toISOString(),
  };

  store.reconciliations.push(record);
  return record;
}

export function decideReconciliation(
  reconciliationId: string,
  decision: 'ACCEPT' | 'REJECT' | 'MODIFY',
  modifiedState?: string,
): Record<string, unknown> {
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
  record.applied = result.applied;
  record.final_state = result.newState;

  return record;
}

export function ingestProject(input: IngestionInput): Record<string, unknown> {
  const store = getOrchestrationStore();
  const ingestion = {
    id: `ingest-${Date.now()}`,
    ...input,
    ingestion_state: 'RECONCILIATION_REQUIRED',
    created_at: new Date().toISOString(),
  };
  store.ingestions.push(ingestion);
  store.history.push({
    event_type: 'PROJECT_INGESTED',
    summary: `Project "${input.projectName}" registered — RECONCILIATION_REQUIRED`,
    created_at: new Date().toISOString(),
  });
  return ingestion;
}

export function getReadinessForOrg(orgSlug: string) {
  const org = findOrgBySlug(orgSlug);
  if (!org) return null;
  const manifest = findActiveManifest(org.id);
  if (!manifest) return null;
  const reqs = getRequirementsForManifest(manifest.id);
  const store = getOrchestrationStore();
  return calculateReadiness(reqs, store.overrides);
}

export function getRequirementExplanation(requirementId: string) {
  const store = getOrchestrationStore();
  const req = store.requirements.find((r) => r.id === requirementId);
  if (!req) return null;
  return explainRequirement(req, getDependenciesForManifest(req.manifest_id), store.requirements);
}

export function validateManifestDependencies(manifestId: string): void {
  const deps = getDependenciesForManifest(manifestId);
  validateDependencyGraph(deps);
}

export function isParentBlockedByDependencies(
  parentKey: string,
  manifestId: string,
): boolean {
  const store = getOrchestrationStore();
  const reqs = getRequirementsForManifest(manifestId);
  const deps = getDependenciesForManifest(manifestId);
  const parent = reqs.find((r) => r.requirement_key === parentKey);
  if (!parent) return false;

  const childDeps = deps.filter((d) => d.source_requirement_id === parent.id);
  for (const dep of childDeps) {
    const child = reqs.find((r) => r.id === dep.target_requirement_id);
    if (child && child.execution_status !== 'COMPLETE' && child.classification !== 'COMPLETE') {
      return true;
    }
  }
  return false;
}

export { CircularDependencyError, generateProposedManifest, calculateReadiness };
export type { ManifestRequirementRow, ManifestBuilderInput, IngestionInput };
