/**
 * Identity commercial fulfillment pipeline (shared, testable).
 */

import type { DeliverableRecord, FulfillmentStatus, ProjectBootstrapContext } from '../site00-commercial-canon/types.js';
import { getCanonicalPackage } from '../site00-commercial-canon/serviceCatalog.js';
import { mergeIntakeIntoProjectBootstrap } from '../site00-commercial-canon/contracts.js';
import type { IntakeBootstrapContext } from '../site00-commercial-canon/types.js';
import { isBlockedAutomatedApprover } from '../site00-identity/identityFields.js';
import { identityFulfillmentContract } from './contract.js';
import { commercialBlockFromDraftPayload, mergeCommercialIntoDraftPayload } from './ctaContext.js';
import type {
  ApprovedIdentityAuthority,
  IdentityApprovalRecord,
  IdentityCommercialAuthorization,
  IdentityCommercialSelection,
  IdentityCommercialState,
  IdentityDeliverable,
  IdentityProductionSnapshot,
  IdentityReviewLifecycle,
} from './types.js';
import { getIdentityProductionSnapshot, setIdentityProductionSnapshot } from './runtimeStore.js';
import { IDENTITY_TIER_PACKAGE_IDS, resolveIdentityPackageRow } from './inventory.js';
export function validateIdentityIntakePayload(payload: Record<string, unknown>): { ok: boolean; errors: string[] } {
  const commercial = commercialBlockFromDraftPayload(payload);
  if (!commercial) {
    return { ok: false, errors: ['Missing commercial.serviceId and commercial.packageId on intake draft'] };
  }
  const pkg = getCanonicalPackage(commercial.serviceId, commercial.packageId);
  if (!pkg) return { ok: false, errors: ['Unknown canonical Identity package'] };
  if (pkg.family !== 'IDENTITY') return { ok: false, errors: ['Package is not IDENTITY family'] };
  return { ok: true, errors: [] };
}

export function initialIdentityCommercialState(
  selection: IdentityCommercialSelection,
  linkage?: {
    intakeId: string;
    clientId?: string | null;
    brandId?: string | null;
  },
): IdentityCommercialState {
  const fulfillmentContractId = `${selection.serviceId}:${selection.packageId}`;
  return {
    version: 1,
    selection,
    authorization: {
      status: 'NONE',
      authorizationRef: null,
      authorizedAt: null,
      method: 'QUOTE_APPROVED',
    },
    bootstrap: {
      projectId: null,
      projectSlug: null,
      projectType: 'IDENTITY',
      fulfillmentAdapterId: 'identity-fulfillment',
      fulfillmentContractId,
      commercialRecordId: linkage?.intakeId ?? null,
      clientId: linkage?.clientId ?? null,
      brandId: linkage?.brandId ?? null,
      blockedByFounderDecisionId: null,
    },
    production: null,
  };
}

export function authorizeIdentityCommercial(
  state: IdentityCommercialState,
  input: { authorizationRef: string; method?: IdentityCommercialAuthorization['method']; now?: string },
): IdentityCommercialState {
  const now = input.now ?? new Date().toISOString();
  return {
    ...state,
    authorization: {
      status: 'AUTHORIZED',
      authorizationRef: input.authorizationRef,
      authorizedAt: now,
      method: input.method ?? 'TEST_SIMULATION',
    },
  };
}

export function intakeHandoffFromDraft(draft: Record<string, unknown>): Record<string, unknown> {
  const { commercial: _c, ...production } = draft;
  return production;
}

export function seedProductionSnapshot(args: {
  intakeId: string;
  clientId: string;
  selection: IdentityCommercialSelection;
  draftPayload: Record<string, unknown>;
}): IdentityProductionSnapshot {
  const snapshot: IdentityProductionSnapshot = {
    intakeId: args.intakeId,
    clientId: args.clientId,
    brandId: (args.draftPayload.businessName as string) ?? null,
    serviceId: args.selection.serviceId,
    packageId: args.selection.packageId,
    commercialMode: args.selection.commercialMode,
    projectId: null,
    projectSlug: null,
    authorization: {
      status: 'AUTHORIZED',
      authorizationRef: args.intakeId,
      authorizedAt: new Date().toISOString(),
      method: 'TEST_SIMULATION',
    },
    review: 'NOT_STARTED',
    revisions: [],
    approval: null,
    deliverables: [],
    entitlementUsage: { conceptsPresented: 0, revisionCyclesUsed: 0, deliverableClassesDelivered: 0 },
    projectStatus: null,
    intakeHandoff: intakeHandoffFromDraft(args.draftPayload),
    abandonmentReason: null,
    founderDecisionBlockId: null,
  };
  setIdentityProductionSnapshot(args.intakeId, snapshot);
  return snapshot;
}

export function attachIdentityProjectToSnapshot(
  snapshot: IdentityProductionSnapshot,
  project: { projectId: string; projectSlug: string; projectStatus?: string },
): IdentityProductionSnapshot {
  const next = {
    ...snapshot,
    projectId: project.projectId,
    projectSlug: project.projectSlug,
    projectStatus: project.projectStatus ?? 'ORIGIN_INGESTED',
    review: snapshot.review === 'NOT_STARTED' ? ('REVIEW_READY' as IdentityReviewLifecycle) : snapshot.review,
  };
  setIdentityProductionSnapshot(snapshot.intakeId, next);
  return next;
}

export function bootstrapIdentityProjectContext(args: {
  intake: IntakeBootstrapContext;
  commercialRecordId: string;
  clientId: string;
  brandId?: string | null;
  projectId?: string | null;
  projectSlug?: string | null;
}): ProjectBootstrapContext {
  return mergeIntakeIntoProjectBootstrap(args.intake, {
    clientId: args.clientId,
    brandId: args.brandId ?? null,
    commercialRecordId: args.commercialRecordId,
    projectId: args.projectId ?? null,
    fulfillmentAdapterId: 'identity-fulfillment',
    endClientId: null,
  });
}

export function identityWorkspaceRoute(ctx: ProjectBootstrapContext): string | null {
  const snap = getIdentityProductionSnapshot(ctx.commercialRecordId);
  const slug = snap?.projectSlug;
  if (!slug) return '/account/intakes';
  return `/projects/${slug}/identity`;
}

export function resolveIdentityProductionPipelineId(ctx: ProjectBootstrapContext): string {
  const snap = getIdentityProductionSnapshot(ctx.commercialRecordId);
  const serviceId = snap?.serviceId ?? ctx.serviceId;
  const packageId = snap?.packageId ?? ctx.packageId;
  const row = resolveIdentityPackageRow(serviceId, packageId);
  return row?.currentProductionEntry ?? 'identity-brand-discovery';
}

export function mapSnapshotToFulfillmentStatus(snapshot: IdentityProductionSnapshot | null): FulfillmentStatus {
  if (!snapshot) return 'INTAKE';
  if (snapshot.founderDecisionBlockId) return 'BLOCKED';
  if (snapshot.abandonmentReason === 'INTAKE_ABANDONED') return 'NOT_STARTED';
  if (snapshot.abandonmentReason === 'AUTH_INCOMPLETE') return 'BLOCKED';
  if (snapshot.abandonmentReason === 'PROJECT_CANCELLED' || snapshot.abandonmentReason === 'PRODUCTION_CANCELLED') {
    return 'BLOCKED';
  }
  if (snapshot.authorization.status !== 'AUTHORIZED') return 'INTAKE';
  if (!snapshot.projectId) return 'READY';
  if (snapshot.projectStatus === 'IDENTITY_COMPLETE') {
    return snapshot.deliverables.some((d) => d.deliveryStatus === 'DELIVERED') ? 'COMPLETE' : 'DELIVERED';
  }
  switch (snapshot.review) {
    case 'REVIEW_READY':
    case 'CLIENT_REVIEWING':
      return 'AWAITING_CLIENT';
    case 'REVISION_REQUESTED':
      return 'REVISION';
    case 'APPROVED':
      return snapshot.deliverables.length > 0 ? 'APPROVED' : 'IN_PRODUCTION';
    default:
      return 'IN_PRODUCTION';
  }
}

export function transitionReviewState(
  snapshot: IdentityProductionSnapshot,
  next: IdentityReviewLifecycle,
): IdentityProductionSnapshot {
  const updated = { ...snapshot, review: next };
  setIdentityProductionSnapshot(snapshot.intakeId, updated);
  return updated;
}

export function recordIdentityRevisionRequest(
  snapshot: IdentityProductionSnapshot,
  input: { requestedBy: string; note?: string | null; now?: string },
): IdentityProductionSnapshot {
  const revisionNumber = snapshot.revisions.length + 1;
  const contract = identityFulfillmentContract(snapshot.serviceId, snapshot.packageId);
  const maxRevisions = contract.scopeLimits.revisions;
  if (typeof maxRevisions === 'number' && revisionNumber > maxRevisions) {
    throw new Error('Revision allowance exceeded for package');
  }
  const updated: IdentityProductionSnapshot = {
    ...snapshot,
    review: 'REVISION_REQUESTED',
    revisions: [
      ...snapshot.revisions,
      {
        revisionNumber,
        requestedAt: input.now ?? new Date().toISOString(),
        requestedBy: input.requestedBy,
        note: input.note ?? null,
      },
    ],
    entitlementUsage: {
      ...snapshot.entitlementUsage,
      revisionCyclesUsed: revisionNumber,
    },
  };
  setIdentityProductionSnapshot(snapshot.intakeId, updated);
  return updated;
}

export function recordHumanIdentityApproval(
  snapshot: IdentityProductionSnapshot,
  input: { approvedBy: string; approvedArtifactIds: string[]; now?: string },
): IdentityProductionSnapshot {
  if (isBlockedAutomatedApprover(input.approvedBy)) {
    throw new Error('Automated approver blocked for Identity canon');
  }
  const approval: IdentityApprovalRecord = {
    approvedBy: input.approvedBy,
    approvedAt: input.now ?? new Date().toISOString(),
    approvedArtifactIds: input.approvedArtifactIds,
  };
  const deliverable = buildIdentityDeliverable(snapshot, approval);
  const updated: IdentityProductionSnapshot = {
    ...snapshot,
    review: 'APPROVED',
    approval,
    deliverables: [...snapshot.deliverables.filter((d) => d.version !== deliverable.version), deliverable],
    entitlementUsage: {
      ...snapshot.entitlementUsage,
      deliverableClassesDelivered: deliverable.approvedArtifactIds.length,
    },
  };
  setIdentityProductionSnapshot(snapshot.intakeId, updated);
  return updated;
}

export function buildIdentityDeliverable(
  snapshot: IdentityProductionSnapshot,
  approval: IdentityApprovalRecord,
): IdentityDeliverable {
  const contract = identityFulfillmentContract(snapshot.serviceId, snapshot.packageId);
  const base: DeliverableRecord = {
    deliverableId: `idnty-dlv-${snapshot.intakeId}-v${snapshot.deliverables.length + 1}`,
    projectId: snapshot.projectId ?? 'pending',
    serviceId: snapshot.serviceId,
    packageId: snapshot.packageId,
    version: String(snapshot.deliverables.length + 1),
    reviewStatus: 'APPROVED',
    deliveryStatus: 'CLIENT_VISIBLE',
    completionCriteriaRef: contract.completionCriteria[0] ?? 'APPROVED_IDENTITY_SYSTEM',
  };
  return {
    ...base,
    approvedArtifactIds: approval.approvedArtifactIds,
    identityCanonVersion: snapshot.deliverables.length + 1,
  };
}

export function identityCompletionState(snapshot: IdentityProductionSnapshot | null): FulfillmentStatus {
  if (!snapshot) return 'NOT_STARTED';
  const contract = identityFulfillmentContract(snapshot.serviceId, snapshot.packageId);
  const hasApproval = snapshot.approval != null;
  const hasDeliverable = snapshot.deliverables.some((d) => d.reviewStatus === 'APPROVED');
  const authorized = snapshot.authorization.status === 'AUTHORIZED';
  if (!authorized || !hasApproval || !hasDeliverable) return mapSnapshotToFulfillmentStatus(snapshot);
  const criteriaMet = contract.completionCriteria.every((c) =>
    c === 'APPROVED_IDENTITY_SYSTEM' ? hasDeliverable : true,
  );
  return criteriaMet ? 'COMPLETE' : mapSnapshotToFulfillmentStatus(snapshot);
}

export function enforceIdentityConceptPresentation(
  snapshot: IdentityProductionSnapshot,
  conceptsToAdd: number,
): { ok: boolean; reason?: string } {
  const contract = identityFulfillmentContract(snapshot.serviceId, snapshot.packageId);
  const limit = contract.scopeLimits.concepts;
  if (limit === 'FOUNDER_DECISION_REQUIRED') return { ok: true };
  const next = snapshot.entitlementUsage.conceptsPresented + conceptsToAdd;
  if (next > limit) return { ok: false, reason: 'Concept allowance exceeded' };
  return { ok: true };
}

export function applyConceptPresentation(snapshot: IdentityProductionSnapshot, count: number): IdentityProductionSnapshot {
  const gate = enforceIdentityConceptPresentation(snapshot, count);
  if (!gate.ok) throw new Error(gate.reason ?? 'Entitlement blocked');
  const updated = {
    ...snapshot,
    entitlementUsage: {
      ...snapshot.entitlementUsage,
      conceptsPresented: snapshot.entitlementUsage.conceptsPresented + count,
    },
  };
  setIdentityProductionSnapshot(snapshot.intakeId, updated);
  return updated;
}

export function approvedIdentityAuthorityFromSnapshot(
  snapshot: IdentityProductionSnapshot,
): ApprovedIdentityAuthority | null {
  if (snapshot.review !== 'APPROVED' || !snapshot.approval || !snapshot.projectId || !snapshot.projectSlug) {
    return null;
  }
  return {
    projectId: snapshot.projectId,
    projectSlug: snapshot.projectSlug,
    serviceId: snapshot.serviceId,
    packageId: snapshot.packageId,
    approvedArtifactIds: snapshot.approval.approvedArtifactIds,
    identityCanonVersion: snapshot.deliverables.at(-1)?.identityCanonVersion ?? null,
    approvedAt: snapshot.approval.approvedAt,
    approvedBy: snapshot.approval.approvedBy,
  };
}

export function canAttachApprovedIdentityToBuilder(snapshot: IdentityProductionSnapshot | null): boolean {
  if (!snapshot) return false;
  return approvedIdentityAuthorityFromSnapshot(snapshot) != null;
}

export function guardBuilderIdentityAuthority(snapshot: IdentityProductionSnapshot | null): {
  ok: boolean;
  authority: ApprovedIdentityAuthority | null;
} {
  if (!snapshot) return { ok: false, authority: null };
  const authority = approvedIdentityAuthorityFromSnapshot(snapshot);
  if (!authority) return { ok: false, authority: null };
  return { ok: true, authority };
}

export function identityCustomQuoteRequiresFixedCheckout(selection: IdentityCommercialSelection): boolean {
  if (selection.commercialMode !== 'CUSTOM_QUOTE') return true;
  return false;
}

export function hydrateSnapshotFromCommercialState(
  intakeId: string,
  state: IdentityCommercialState,
  draftPayload: Record<string, unknown>,
): IdentityProductionSnapshot {
  const existing = getIdentityProductionSnapshot(intakeId);
  if (existing) return existing;
  const snap = seedProductionSnapshot({
    intakeId,
    clientId: draftPayload.email ? String(draftPayload.email) : intakeId,
    selection: state.selection,
    draftPayload,
  });
  if (state.bootstrap.projectId && state.bootstrap.projectSlug) {
    return attachIdentityProjectToSnapshot(snap, {
      projectId: state.bootstrap.projectId,
      projectSlug: state.bootstrap.projectSlug,
    });
  }
  setIdentityProductionSnapshot(intakeId, snap);
  return snap;
}

export function mergeIdentityIntakeDraft(
  existing: Record<string, unknown>,
  patch: Record<string, unknown>,
  selection?: IdentityCommercialSelection,
): Record<string, unknown> {
  const merged = { ...existing, ...patch };
  if (selection) return mergeCommercialIntoDraftPayload(merged, selection);
  return merged;
}

export function tierPackageIdsForCatalog(): readonly string[] {
  return IDENTITY_TIER_PACKAGE_IDS;
}
