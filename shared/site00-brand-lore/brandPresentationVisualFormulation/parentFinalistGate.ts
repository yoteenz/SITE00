/**
 * Parent finalist gate — 2 parent concepts × all qualifying directions × 1 benchmark.
 */

import {
  EXPLORATION_MODES,
  NDXBOOK_PARENT_FINALIST_SCAN_POLICY,
  type BrandPresentationVisualExplorationPolicy,
} from './constants.js';
import type {
  BrandPresentationDirectionVisualBenchmark,
  BrandPresentationParentDeferredRecord,
  BrandPresentationParentVisualFinalistSelection,
} from './types.js';
import type { BrandPresentationDirectionCandidate } from '../brandPresentationDirectionTerritory/types.js';

export function isParentFinalistScanPolicy(
  policy: BrandPresentationVisualExplorationPolicy,
): policy is typeof NDXBOOK_PARENT_FINALIST_SCAN_POLICY {
  return policy.mode === EXPLORATION_MODES.PARENT_FINALIST_DIRECTION_SCAN;
}

export type ParentFinalistGateResult =
  | {
      ok: true;
      activeParentFinalists: BrandPresentationParentVisualFinalistSelection[];
      eligibleDirections: BrandPresentationDirectionCandidate[];
    }
  | { ok: false; reason: string; activeCount: number; requiredCount: number };

export function evaluateParentFinalistGate(params: {
  parentFinalists: BrandPresentationParentVisualFinalistSelection[];
  deferredParents: BrandPresentationParentDeferredRecord[];
  directions: BrandPresentationDirectionCandidate[];
  policy: typeof NDXBOOK_PARENT_FINALIST_SCAN_POLICY;
}): ParentFinalistGateResult {
  const active = params.parentFinalists
    .filter((f) => f.status === 'SELECTED')
    .sort((a, b) => a.selectionOrder - b.selectionOrder);

  const required = params.policy.parentFinalistCount;
  const count = active.length;

  if (count !== required) {
    return {
      ok: false,
      reason:
        count === 0
          ? `PARENT_FINALIST_GATE_BLOCKED — 0 active parent finalists. Expected ${required} selected parent concepts.`
          : count < required
            ? `PARENT_FINALIST_GATE_BLOCKED — ${count} active parent finalist(s). Expected ${required}.`
            : `PARENT_FINALIST_GATE_BLOCKED — ${count} active parent finalists. Expected exactly ${required}.`,
      activeCount: count,
      requiredCount: required,
    };
  }

  const selectedParentIds = new Set(active.map((f) => f.parentConceptId));
  const deferredNames = new Set(params.deferredParents.map((d) => d.parentConceptName));

  const eligibleDirections = params.directions.filter((d) => {
    if (deferredNames.has(d.parentConceptName)) return false;
    if (params.policy.deferredParentNames.includes(d.parentConceptName as never)) return false;
    return selectedParentIds.has(d.parentConceptId);
  });

  const expectedTotal = params.policy.parentFinalistCount * params.policy.directionsPerParent;
  if (eligibleDirections.length !== expectedTotal) {
    return {
      ok: false,
      reason: `DIRECTION_ELIGIBILITY_INCOMPLETE — ${eligibleDirections.length}/${expectedTotal} directions eligible under selected parent finalists.`,
      activeCount: count,
      requiredCount: required,
    };
  }

  return { ok: true, activeParentFinalists: active, eligibleDirections };
}

export function canBeginBenchmarkFormulation(gate: ParentFinalistGateResult): boolean {
  return gate.ok;
}

export function canBeginBenchmarkGeneration(params: {
  gate: ParentFinalistGateResult;
  benchmarks: BrandPresentationDirectionVisualBenchmark[];
  policy: typeof NDXBOOK_PARENT_FINALIST_SCAN_POLICY;
}): { ok: true } | { ok: false; reason: string } {
  if (!params.gate.ok) {
    return { ok: false, reason: params.gate.reason };
  }

  const eligibleIds = new Set(params.gate.eligibleDirections.map((d) => d.directionId));
  const formulated = params.benchmarks.filter(
    (b) => b.revisionNumber === 0 && b.status !== 'SUPERSEDED' && eligibleIds.has(b.directionId),
  );

  if (formulated.length !== params.policy.totalInitialVisuals) {
    return {
      ok: false,
      reason: `BENCHMARK_FORMULATION_INCOMPLETE — ${formulated.length}/${params.policy.totalInitialVisuals} direction benchmarks formulated.`,
    };
  }

  return { ok: true };
}

export function collectorDirectionsExcludedFromDispatch(params: {
  directions: BrandPresentationDirectionCandidate[];
  deferredParentNames: readonly string[];
}): BrandPresentationDirectionCandidate[] {
  return params.directions.filter((d) => !params.deferredParentNames.includes(d.parentConceptName as never));
}
