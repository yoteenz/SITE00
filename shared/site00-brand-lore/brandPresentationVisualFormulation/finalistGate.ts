/**
 * Finalist gate — exactly two active finalists required before visual formulation.
 */

import type { BrandPresentationVisualExplorationPolicy } from './constants.js';
import type { BrandPresentationVisualFinalistSelection } from './types.js';

export type FinalistGateResult =
  | { ok: true; activeFinalists: BrandPresentationVisualFinalistSelection[] }
  | { ok: false; reason: string; activeCount: number; requiredCount: number };

export function evaluateFinalistGate(params: {
  finalists: BrandPresentationVisualFinalistSelection[];
  policy: BrandPresentationVisualExplorationPolicy;
}): FinalistGateResult {
  const active = params.finalists
    .filter((f) => f.status === 'SELECTED')
    .sort((a, b) => a.selectionOrder - b.selectionOrder);

  const required = params.policy.finalistCount;
  const count = active.length;

  if (count === 0) {
    return {
      ok: false,
      reason: 'FINALIST_GATE_BLOCKED — 0 active finalists. Select exactly 2 directions as visual finalists.',
      activeCount: 0,
      requiredCount: required,
    };
  }
  if (count === 1) {
    return {
      ok: false,
      reason: 'FINALIST_GATE_BLOCKED — 1 active finalist. Select one more direction as visual finalist.',
      activeCount: 1,
      requiredCount: required,
    };
  }
  if (count > required) {
    return {
      ok: false,
      reason: `FINALIST_GATE_BLOCKED — ${count} active finalists. Withdraw one before proceeding (exactly ${required} required).`,
      activeCount: count,
      requiredCount: required,
    };
  }

  return { ok: true, activeFinalists: active };
}

export function canBeginVisualFormulation(gate: FinalistGateResult): boolean {
  return gate.ok;
}

export function canBeginVisualGeneration(params: {
  gate: FinalistGateResult;
  expressions: { parentDirectionId: string }[];
  policy: BrandPresentationVisualExplorationPolicy;
}): { ok: true } | { ok: false; reason: string } {
  if (!params.gate.ok) {
    return { ok: false, reason: params.gate.reason };
  }

  for (const finalist of params.gate.activeFinalists) {
    const count = params.expressions.filter((e) => e.parentDirectionId === finalist.directionId).length;
    if (count !== params.policy.expressionsPerFinalist) {
      return {
        ok: false,
        reason: `EXPRESSION_FORMULATION_INCOMPLETE — direction ${finalist.directionId} has ${count}/${params.policy.expressionsPerFinalist} expressions formulated.`,
      };
    }
  }

  return { ok: true };
}
