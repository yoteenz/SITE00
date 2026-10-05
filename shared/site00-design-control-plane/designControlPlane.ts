/**
 * P0.BRIDGE.1 — Site00DesignControlPlane orchestrator.
 * P0.BRIDGE.1B — NDXBOOK SITE00-native authority + change execution target routing.
 */

import { calculateBlastRadius, markReferenceAndSnapshotStaleness } from './blastRadius.js';
import { classifyChangeExecution, studioWorldNativeInfrastructureTargetable } from './capabilityRegistry.js';
import { validateChangeOperations } from './operationValidator.js';
import { STUDIO_WORLD_NATIVE_ROUTE_PREFIXES } from './constants.js';
import { getRepoDefaultBranch } from './repoBranchAuthority.js';
import {
  assertReadyForRepoAuthority,
  resolveChangeExecutionTarget,
} from './resolveChangeExecutionTarget.js';
import type {
  PrepareRepoChangeInput,
  Site00ChangeOperationRecord,
  Site00ChangeRequestRecord,
  Site00ChangeStatus,
  SourceDivergenceCheck,
} from './types.js';
import {
  memoryAddReceipt,
  memoryCreateShellPropagation,
  memoryAddPropagationMember,
  memoryGetChangeRequest,
  memoryGetChangeRequestByIdempotency,
  memoryGetManagedProject,
  memoryGetRepoBindingById,
  memoryGetRepoBindingForProject,
  memoryGetShellPropagation,
  memoryListPropagationMembers,
  memoryListReadyForRepo,
  memoryListReceipts,
  memoryListReferenceBindings,
  memoryListSnapshotBindings,
  memoryMarkStalenessFromBlastRadius,
  memoryReconcileLegacyWrongRepoRequests,
  memorySaveChangeRequest,
  memoryUpdateChangeRequest,
  seedBridgeMemoryStore,
} from './memoryStore.js';

export type DesignControlPlaneStore = {
  mode: 'memory' | 'supabase';
};

let storeMode: DesignControlPlaneStore['mode'] = 'memory';

export function initDesignControlPlaneForTest(): void {
  storeMode = 'memory';
  seedBridgeMemoryStore();
  memoryReconcileLegacyWrongRepoRequests();
}

export function getDesignControlPlaneStoreMode(): DesignControlPlaneStore['mode'] {
  return storeMode;
}

function assertStudioWorldWebsiteScope(projectKey: string, routeKey?: string | null, operations?: Site00ChangeOperationRecord[]): void {
  if (projectKey !== 'studio-world') return;
  const targets = [routeKey, ...(operations?.map((o) => o.targetSelector) ?? [])].filter(Boolean) as string[];
  for (const target of targets) {
    for (const prefix of STUDIO_WORLD_NATIVE_ROUTE_PREFIXES) {
      if (target.includes(prefix)) {
        throw new Error(`Studio World native infrastructure route is not targetable: ${target}`);
      }
    }
  }
}

export function createChangeRequest(input: PrepareRepoChangeInput): Site00ChangeRequestRecord {
  const project = memoryGetManagedProject(input.projectKey);
  if (!project) throw new Error(`Unknown managed project: ${input.projectKey}`);

  const existing = memoryGetChangeRequestByIdempotency(input.projectKey, buildIdempotencyKey(input));
  if (existing && existing.status !== 'SUPERSEDED') {
    return existing;
  }

  assertStudioWorldWebsiteScope(input.projectKey, input.routeKey, input.operations);

  const opValidation = validateChangeOperations(input.operations);
  if (!opValidation.valid) {
    throw new Error(opValidation.errors.join('; '));
  }

  const classification = classifyChangeExecution(input.changeType, input.operations, input.projectKey);
  const binding = memoryGetRepoBindingForProject(input.projectKey);
  const target = resolveChangeExecutionTarget({
    projectKey: input.projectKey,
    changeExecutionClass: classification.executionClass,
    changeType: input.changeType,
    activeBinding: binding,
  });

  const blastRadius = calculateBlastRadius({
    scope: input.scope ?? 'TARGET_ONLY',
    routeKey: input.routeKey,
    pageKey: input.pageKey,
    operations: input.operations,
  });

  const needsBaseCommit = classification.executionClass === 'SOURCE_CODE_MATERIALIZATION';
  if (needsBaseCommit && !input.baseSourceCommit) {
    throw new Error('base_source_commit is required for SOURCE_CODE_MATERIALIZATION');
  }

  const record: Site00ChangeRequestRecord = {
    projectId: project.id,
    projectKey: project.projectKey,
    repoBindingId: target.repoBindingId,
    routeKey: input.routeKey ?? null,
    changeExecutionClass: classification.executionClass,
    changeType: input.changeType,
    scope: input.scope ?? 'TARGET_ONLY',
    status: 'DRAFT',
    idempotencyKey: buildIdempotencyKey(input),
    version: 1,
    baseSourceCommit: input.baseSourceCommit ?? null,
    expectedSourceBranch: target.defaultBranch ?? getRepoDefaultBranch(target.sourceRepo) ?? 'main',
    designVersion: input.designVersion ?? 1,
    shellVersion: input.shellVersion ?? null,
    familyVersion: input.familyVersion ?? null,
    requestedBy: input.requestedBy ?? null,
    implementationMode: target.implementationMode,
    blastRadius,
    riskLevel: classification.executionClass === 'SOURCE_CODE_MATERIALIZATION' ? 'HIGH' : 'LOW',
    metadata: {
      ...(classification.fallbackReason ? { fallbackReason: classification.fallbackReason } : {}),
      executionMode: target.executionMode,
      executionRepo: target.sourceRepo,
      bridgeRequired: target.bridgeRequired,
      implementationModeLabel: target.implementationModeLabel,
    },
  };

  const saved = memorySaveChangeRequest(record, input.operations);

  if (input.scope === 'SHARED_SHELL_GLOBAL' || input.operations.some((o) => o.operationType === 'CHANGE_SHARED_SHELL')) {
    const propagation = memoryCreateShellPropagation({
      projectId: project.id,
      changeRequestId: saved.id!,
      shellId: input.shellVersion ? String(input.shellVersion) : null,
      oldVersion: input.shellVersion ? input.shellVersion - 1 : null,
      newVersion: input.shellVersion ?? null,
      scope: input.scope ?? 'SHARED_SHELL_GLOBAL',
    });
    for (const route of blastRadius.affectedRoutes) {
      memoryAddPropagationMember(propagation.id, { routeKey: route, included: true });
    }
  }

  return saved;
}

export function addChangeOperation(
  changeRequestId: string,
  operation: Site00ChangeOperationRecord,
): Site00ChangeRequestRecord {
  const existing = memoryGetChangeRequest(changeRequestId);
  if (!existing) throw new Error('Change request not found');
  const ops = [...(existing.operations ?? []), operation];
  const validation = validateChangeOperations(ops);
  if (!validation.valid) throw new Error(validation.errors.join('; '));
  return memorySaveChangeRequest(existing, ops);
}

export function validateChangeRequest(changeRequestId: string): { valid: boolean; errors: string[] } {
  const req = memoryGetChangeRequest(changeRequestId);
  if (!req) return { valid: false, errors: ['Change request not found'] };
  const opValidation = validateChangeOperations(req.operations ?? []);
  const errors = [...opValidation.errors];
  if (req.changeExecutionClass === 'SOURCE_CODE_MATERIALIZATION' && !req.baseSourceCommit) {
    errors.push('base_source_commit required');
  }
  return { valid: errors.length === 0, errors };
}

export function calculateBlastRadiusForRequest(changeRequestId: string) {
  const req = memoryGetChangeRequest(changeRequestId);
  if (!req) throw new Error('Change request not found');
  return req.blastRadius;
}

export function approveChangeRequest(changeRequestId: string, approvedBy: string): Site00ChangeRequestRecord {
  const req = memoryGetChangeRequest(changeRequestId);
  if (!req) throw new Error('Change request not found');
  const validation = validateChangeRequest(changeRequestId);
  if (!validation.valid) throw new Error(validation.errors.join('; '));

  const updated = memoryUpdateChangeRequest(changeRequestId, {
    status: 'FOUNDER_APPROVED',
    approvedBy,
    approvedAt: new Date().toISOString(),
  })!;

  if (req.scope === 'SHARED_SHELL_GLOBAL' || req.operations?.some((o) => o.operationType === 'CHANGE_SHARED_SHELL')) {
    memoryMarkStalenessFromBlastRadius(req.projectId, req.blastRadius);
    const propagation = memoryGetShellPropagation(changeRequestId);
    if (propagation) {
      propagation.founderApproved = true;
    }
  }

  return updated;
}

export function markReadyForRepo(
  changeRequestId: string,
  options?: { currentSourceCommit?: string | null },
): Site00ChangeRequestRecord {
  const req = memoryGetChangeRequest(changeRequestId);
  if (!req) throw new Error('Change request not found');
  if (req.status !== 'FOUNDER_APPROVED') {
    throw new Error('Founder approval required before READY_FOR_REPO');
  }
  if (req.changeExecutionClass === 'SOURCE_CODE_MATERIALIZATION' && !req.baseSourceCommit) {
    throw new Error('base_source_commit required');
  }

  const binding = req.repoBindingId ? memoryGetRepoBindingById(req.repoBindingId) : memoryGetRepoBindingForProject(req.projectKey ?? '');
  const authorityCheck = assertReadyForRepoAuthority({
    projectKey: req.projectKey ?? '',
    repoBinding: binding,
    expectedSourceBranch: req.expectedSourceBranch,
  });
  if (!authorityCheck.allowed) {
    return memoryUpdateChangeRequest(changeRequestId, {
      status: authorityCheck.status ?? 'BLOCKED_REPO_AUTHORITY_MISMATCH',
      metadata: {
        ...(req.metadata ?? {}),
        blocker: authorityCheck.status,
        reason: authorityCheck.reason,
      },
    })!;
  }

  const currentCommit =
    options?.currentSourceCommit ?? (req.metadata?.currentSourceCommit as string | undefined);
  const divergence = detectSourceDivergence(req, currentCommit);
  if (divergence.blocked) {
    return memoryUpdateChangeRequest(changeRequestId, { status: 'BLOCKED_SOURCE_DIVERGENCE' })!;
  }
  return memoryUpdateChangeRequest(changeRequestId, { status: 'READY_FOR_REPO' })!;
}

export function publishRuntimeBinding(changeRequestId: string): Site00ChangeRequestRecord {
  const req = memoryGetChangeRequest(changeRequestId);
  if (!req) throw new Error('Change request not found');
  if (req.changeExecutionClass !== 'RUNTIME_SAFE_BINDING') {
    throw new Error('Only RUNTIME_SAFE_BINDING changes can be published directly');
  }
  if (req.status !== 'FOUNDER_APPROVED' && req.status !== 'READY_FOR_REVIEW') {
    throw new Error('Approval required for runtime binding publish');
  }
  return memoryUpdateChangeRequest(changeRequestId, { status: 'MERGED', appliedAt: new Date().toISOString() })!;
}

export function supersedeChangeRequest(changeRequestId: string): Site00ChangeRequestRecord {
  return memoryUpdateChangeRequest(changeRequestId, {
    status: 'SUPERSEDED',
    supersededAt: new Date().toISOString(),
  })!;
}

export function getChangeStatus(changeRequestId: string): Site00ChangeStatus | null {
  return memoryGetChangeRequest(changeRequestId)?.status ?? null;
}

export function detectSourceDivergence(
  request: Site00ChangeRequestRecord,
  currentSourceCommit?: string | null,
): SourceDivergenceCheck {
  if (!request.baseSourceCommit || !currentSourceCommit) {
    return { blocked: false, expectedCommit: request.baseSourceCommit ?? null, currentCommit: currentSourceCommit ?? null, status: request.status };
  }
  if (request.baseSourceCommit !== currentSourceCommit) {
    return {
      blocked: true,
      expectedCommit: request.baseSourceCommit,
      currentCommit: currentSourceCommit,
      status: 'BLOCKED_SOURCE_DIVERGENCE',
    };
  }
  return { blocked: false, expectedCommit: request.baseSourceCommit, currentCommit: currentSourceCommit, status: request.status };
}

export function recordCrossRepoReceipt(input: {
  changeRequestId: string;
  eventType: string;
  actor?: string;
  repoCommit?: string;
  prUrlOrId?: string;
  status: string;
  message?: string;
}): Site00ChangeRequestRecord {
  const req = memoryGetChangeRequest(input.changeRequestId);
  if (!req) throw new Error('Change request not found');
  if (req.metadata?.executionMode === 'SITE00_NATIVE') {
    throw new Error('Cross-repo FSBW receipts are not valid for SITE00_NATIVE projects');
  }

  memoryAddReceipt({
    ...input,
    payload: { executionRepo: req.metadata?.executionRepo, executionMode: req.metadata?.executionMode },
  });
  const nextStatus = mapReceiptToStatus(input.status);
  if (nextStatus) {
    return memoryUpdateChangeRequest(input.changeRequestId, { status: nextStatus })!;
  }
  return req;
}

function mapReceiptToStatus(receiptStatus: string): Site00ChangeStatus | null {
  const map: Record<string, Site00ChangeStatus> = {
    APPLYING: 'APPLYING',
    PR_CREATED: 'PR_CREATED',
    VALIDATED: 'VALIDATED',
    MERGED: 'MERGED',
    FAILED: 'FAILED',
  };
  return map[receiptStatus] ?? null;
}

export function prepareRepoChangeSummary(changeRequestId: string) {
  const req = memoryGetChangeRequest(changeRequestId);
  if (!req) throw new Error('Change request not found');
  const binding = req.repoBindingId
    ? memoryGetRepoBindingById(req.repoBindingId)
    : memoryGetRepoBindingForProject(req.projectKey ?? '');
  const target = resolveChangeExecutionTarget({
    projectKey: req.projectKey ?? '',
    changeExecutionClass: req.changeExecutionClass,
    changeType: req.changeType,
    activeBinding: binding,
  });
  const propagation = memoryGetShellPropagation(changeRequestId);
  return {
    project: req.projectKey,
    page: req.routeKey,
    family: req.familyId,
    shell: req.shellId,
    scope: req.scope,
    sourceRepo: target.sourceRepo,
    executionMode: target.executionMode,
    executionRepo: target.sourceRepo,
    bridgeRequired: target.bridgeRequired,
    implementationModeLabel: target.implementationModeLabel,
    baseCommit: req.baseSourceCommit,
    expectedSourceBranch: req.expectedSourceBranch,
    affectedPages: req.blastRadius.affectedPages,
    affectedComponents: req.blastRadius.affectedComponents,
    affectedRoutes: req.blastRadius.affectedRoutes,
    operations: req.operations,
    risk: req.riskLevel,
    implementationMode: req.implementationMode,
    status: req.status,
    receipts: memoryListReceipts(changeRequestId),
    staleness: markReferenceAndSnapshotStaleness(req.blastRadius),
    referenceStaleness: memoryListReferenceBindings(req.projectId),
    snapshotStaleness: memoryListSnapshotBindings(req.projectId),
    shellPropagation: propagation
      ? {
          ...propagation,
          members: memoryListPropagationMembers(propagation.id),
        }
      : null,
    studioWorldNativeTargetable: studioWorldNativeInfrastructureTargetable(),
  };
}

export function listReadyForRepoHandoffs(repoOwner: string, repoName: string) {
  return memoryListReadyForRepo(repoOwner, repoName);
}

export { resolveChangeExecutionTarget, assertReadyForRepoAuthority } from './resolveChangeExecutionTarget.js';

function buildIdempotencyKey(input: PrepareRepoChangeInput): string {
  const opSig = input.operations.map((o) => `${o.operationOrder}:${o.operationType}`).join('|');
  return `${input.projectKey}:${input.changeType}:${input.routeKey ?? 'global'}:${opSig}`;
}

export const Site00DesignControlPlane = {
  createChangeRequest,
  addChangeOperation,
  validateChangeRequest,
  calculateBlastRadius: calculateBlastRadiusForRequest,
  approveChangeRequest,
  markReadyForRepo,
  publishRuntimeBinding,
  supersedeChangeRequest,
  getChangeStatus,
  detectSourceDivergence,
  recordCrossRepoReceipt,
  prepareRepoChangeSummary,
  listReadyForRepoHandoffs,
  initForTest: initDesignControlPlaneForTest,
};
