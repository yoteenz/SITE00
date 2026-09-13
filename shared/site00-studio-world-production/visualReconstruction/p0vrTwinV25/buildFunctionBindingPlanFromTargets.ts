import type { PageFunctionGraph } from '../p0vrTwinV21/types.js';
import type { ConceptFunctionBindingPlan } from '../p0vrTwinV22/types.js';
import type { ConceptFunctionTargetPlan } from './types.js';
import { REQUIRED_NDX_OVERVIEW_FUNCTIONS } from '../p0vrTwinV22/constants.js';

export function buildFunctionBindingPlanFromTargets(input: {
  conceptId: string;
  bindingPlanId: string;
  functionTargetPlan: ConceptFunctionTargetPlan;
  functionGraph: PageFunctionGraph;
}): ConceptFunctionBindingPlan {
  const now = new Date().toISOString();
  const bindings = input.functionTargetPlan.targets.map((t, i) => ({
    bindingId: `bind-${input.conceptId}-${i}`,
    visualRegion: t.objectId,
    liveFunction: t.liveFunction,
    functionKey: t.functionKey,
    status: 'BOUND' as const,
    deferredReason: null,
  }));

  const boundKeys = new Set(bindings.map((b) => b.functionKey));
  const unboundFunctions = [...REQUIRED_NDX_OVERVIEW_FUNCTIONS].filter(
    (f) => !boundKeys.has(f) && !bindings.some((b) => b.liveFunction.includes(f)),
  );

  const requiredFunctionCoverage =
    (REQUIRED_NDX_OVERVIEW_FUNCTIONS.length - unboundFunctions.length) / REQUIRED_NDX_OVERVIEW_FUNCTIONS.length;

  return {
    bindingPlanId: input.bindingPlanId,
    conceptId: input.conceptId,
    bindings,
    requiredFunctions: [...REQUIRED_NDX_OVERVIEW_FUNCTIONS],
    unboundFunctions,
    requiredFunctionCoverage,
    status: requiredFunctionCoverage >= 0.75 ? 'COMPLETE' : 'PARTIAL',
    createdAt: now,
  };
}
