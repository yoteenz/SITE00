/**
 * Deterministic downstream invalidation resolver — no subjective creative judgment.
 */

import { FROZEN_EXPERIMENT_IDS } from './constants.js';
import { templatesForChangeType } from './canonicalDependencyEdges.js';
import type {
  DownstreamInvalidationResult,
  InvalidationAffectedNode,
  InvalidationChangeType,
  InvalidationPolicy,
  ProductionDependencyEdge,
  ProductionInvalidationEvent,
  ProductionRecordType,
  StudioWorldDependencyGraph,
} from './dependencyTypes.js';

export type ResolveInvalidationInput = {
  projectId: string;
  changeType: InvalidationChangeType;
  sourceType: ProductionRecordType;
  sourceId: string;
  sourceVersionBefore?: string | null;
  sourceVersionAfter?: string | null;
  changeSummary: string;
  graph?: StudioWorldDependencyGraph;
  downstreamRecords?: Array<{ recordType: ProductionRecordType; recordId: string; frozen?: boolean }>;
};

const POLICY_REQUIRED_ACTION: Record<InvalidationPolicy, string> = {
  NO_INVALIDATION: 'No downstream reconsideration required',
  RECOMPILE_ONLY: 'Recompile downstream artifacts without discarding founder approval',
  SOFT_REVIEW_REQUIRED: 'Review downstream records for continued validity',
  EVIDENCE_STALE: 'Mark evidence stale; recompile reference package; do not auto-delete proofs',
  REGENERATION_REQUIRED: 'Future formation may require regeneration; frozen experiments preserved',
  FOUNDER_REVIEW_REQUIRED: 'Founder review required before downstream execution continues',
  HARD_INVALIDATION: 'Downstream record is no longer trustworthy; compile new version',
  SUPERSEDE_REQUIRED: 'Supersede downstream record with new version',
  BLOCK_DOWNSTREAM_EXECUTION: 'Block downstream execution until resolved',
};

const FOUNDER_ACTION_POLICIES: InvalidationPolicy[] = [
  'FOUNDER_REVIEW_REQUIRED',
  'HARD_INVALIDATION',
  'SUPERSEDE_REQUIRED',
  'BLOCK_DOWNSTREAM_EXECUTION',
  'REGENERATION_REQUIRED',
];

function isFrozenRecord(recordType: ProductionRecordType, recordId: string, frozen?: boolean): boolean {
  if (frozen) return true;
  if (recordType === 'EXPERIMENT_D_RUN') return true;
  if (recordType === 'EXPERIMENT_F_RUN' && recordId.includes('FORMATION_SNAPSHOT')) return true;
  return FROZEN_EXPERIMENT_IDS.some((id) => recordId.includes(id));
}

function strongestPolicy(policies: InvalidationPolicy[]): InvalidationPolicy {
  const rank: Record<InvalidationPolicy, number> = {
    NO_INVALIDATION: 0,
    RECOMPILE_ONLY: 1,
    SOFT_REVIEW_REQUIRED: 2,
    EVIDENCE_STALE: 3,
    REGENERATION_REQUIRED: 4,
    FOUNDER_REVIEW_REQUIRED: 5,
    HARD_INVALIDATION: 6,
    SUPERSEDE_REQUIRED: 7,
    BLOCK_DOWNSTREAM_EXECUTION: 8,
  };
  return policies.reduce((best, p) => (rank[p] > rank[best] ? p : best), 'NO_INVALIDATION');
}

export function resolveDownstreamInvalidation(input: ResolveInvalidationInput): DownstreamInvalidationResult {
  const templates = templatesForChangeType(input.changeType);
  const graphEdges = input.graph?.edges ?? [];
  const downstreamRecords = input.downstreamRecords ?? [];

  const affectedFromGraph = graphEdges
    .filter((e) => e.upstreamType === input.sourceType && e.upstreamId === input.sourceId)
    .map((e) => ({
      recordType: e.downstreamType,
      recordId: e.downstreamId,
      policy: e.invalidationPolicy,
      reason: e.reason,
    }));

  const affectedFromTemplates = templates.flatMap((template) => {
    const matching = downstreamRecords.filter((r) => r.recordType === template.downstreamType);
    return matching.map((r) => ({
      recordType: r.recordType,
      recordId: r.recordId,
      policy: template.invalidationPolicy,
      reason: template.reason,
      frozen: r.frozen,
    }));
  });

  const merged = new Map<string, { recordType: ProductionRecordType; recordId: string; policy: InvalidationPolicy; reason: string; frozen?: boolean }>();

  for (const item of [...affectedFromGraph, ...affectedFromTemplates]) {
    const key = `${item.recordType}:${item.recordId}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, item);
    } else {
      merged.set(key, {
        ...existing,
        policy: strongestPolicy([existing.policy, item.policy]),
        reason: `${existing.reason}; ${item.reason}`,
      });
    }
  }

  const affectedRecords: Array<{ recordType: ProductionRecordType; recordId: string }> = [];

  for (const [, item] of merged) {
    if (isFrozenRecord(item.recordType, item.recordId, item.frozen)) {
      continue;
    }
    affectedRecords.push({ recordType: item.recordType, recordId: item.recordId });
  }

  const policies = [...merged.values()]
    .filter((item) => !isFrozenRecord(item.recordType, item.recordId, item.frozen))
    .map((item) => item.policy);

  const invalidationPolicy = policies.length > 0 ? strongestPolicy(policies) : 'NO_INVALIDATION';
  const reason =
    policies.length > 0
      ? `Upstream ${input.sourceType} change (${input.changeType}): ${input.changeSummary}`
      : 'No downstream invalidation required or all downstream records are frozen experiments';

  return {
    affectedRecords,
    invalidationPolicy,
    reason,
    requiredAction: POLICY_REQUIRED_ACTION[invalidationPolicy],
    founderActionRequired: FOUNDER_ACTION_POLICIES.includes(invalidationPolicy),
    automaticRegenerationBlocked: true,
    automaticDeletionBlocked: true,
  };
}

export function buildInvalidationEvent(
  input: ResolveInvalidationInput,
  resolution?: ProductionInvalidationEvent['resolution'],
): ProductionInvalidationEvent {
  const result = resolveDownstreamInvalidation(input);
  const templates = templatesForChangeType(input.changeType);

  const affectedNodes: InvalidationAffectedNode[] = result.affectedRecords.map((r) => {
    const template = templates.find((t) => t.downstreamType === r.recordType);
    return {
      recordType: r.recordType,
      recordId: r.recordId,
      policyApplied: template?.invalidationPolicy ?? result.invalidationPolicy,
      reason: template?.reason ?? result.reason,
      requiredAction: POLICY_REQUIRED_ACTION[template?.invalidationPolicy ?? result.invalidationPolicy],
      frozenExperimentProtected: false,
    };
  });

  return {
    id: `inv-${input.projectId}-${Date.now()}`,
    projectId: input.projectId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    sourceVersionBefore: input.sourceVersionBefore ?? null,
    sourceVersionAfter: input.sourceVersionAfter ?? null,
    changeType: input.changeType,
    changeSummary: input.changeSummary,
    affectedNodes,
    policyApplied: result.invalidationPolicy,
    createdAt: new Date().toISOString(),
    resolvedAt: resolution ? new Date().toISOString() : null,
    resolution: resolution ?? null,
    founderActionRequired: result.founderActionRequired,
    metadata: {
      automaticRegenerationBlocked: true,
      automaticDeletionBlocked: true,
    },
  };
}

export function registerDependencyEdge(
  graph: StudioWorldDependencyGraph,
  edge: ProductionDependencyEdge,
): StudioWorldDependencyGraph {
  const filtered = graph.edges.filter((e) => e.id !== edge.id);
  return {
    ...graph,
    edges: [...filtered, edge],
    updatedAt: new Date().toISOString(),
  };
}

export function frozenExperimentRemainsValid(
  experimentRecordType: ProductionRecordType,
  experimentRecordId: string,
): { valid: true; status: 'HISTORICAL_EVIDENCE' | 'NO_LONGER_CURRENT_INPUT' } {
  if (isFrozenRecord(experimentRecordType, experimentRecordId)) {
    return { valid: true, status: 'HISTORICAL_EVIDENCE' };
  }
  return { valid: true, status: 'NO_LONGER_CURRENT_INPUT' };
}
