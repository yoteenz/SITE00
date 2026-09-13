import type { PageFunctionGraph } from '../p0vrTwinV21/types.js';
import type { ConceptBlueprint, ConceptFunctionBindingPlan } from './types.js';
import { REQUIRED_NDX_OVERVIEW_FUNCTIONS } from './constants.js';

const FUNCTION_MAP: Record<string, { region: string; live: string }> = {
  project_progress: { region: 'PROJECT PROGRESS', live: 'live progress data' },
  current_phase: { region: 'CURRENT PHASE', live: 'current phase panel' },
  key_metrics: { region: 'KEY METRICS', live: 'project metrics row' },
  current_focus: { region: 'CURRENT FOCUS', live: 'current project focus' },
  next_milestone: { region: 'NEXT MILESTONE', live: 'milestone state' },
  recent_activity: { region: 'RECENT ACTIVITY', live: 'activity feed' },
  section_nav: { region: 'MODULE NAV', live: 'existing section routes' },
  shell_host: { region: 'HOST CHROME', live: 'SITE 00 shell behavior' },
};

export function generateConceptFunctionBindingPlan(input: {
  conceptId: string;
  blueprint: ConceptBlueprint;
  functionGraph: PageFunctionGraph;
}): ConceptFunctionBindingPlan {
  const now = new Date().toISOString();
  const bindingPlanId = `cfbp-${input.conceptId}`;

  const bindings = REQUIRED_NDX_OVERVIEW_FUNCTIONS.map((key, i) => {
    const meta = FUNCTION_MAP[key];
    const bound = input.functionGraph.sectionNavigation.length > 0 || key === 'shell_host';
    return {
      bindingId: `bind-${i + 1}`,
      visualRegion: meta.region,
      liveFunction: meta.live,
      functionKey: key,
      status: bound ? ('BOUND' as const) : ('DEFERRED' as const),
      deferredReason: bound ? null : 'Awaiting explicit region mapping',
    };
  });

  const boundCount = bindings.filter((b) => b.status === 'BOUND').length;
  const unbound = bindings.filter((b) => b.status === 'DEFERRED').map((b) => b.functionKey);

  return {
    bindingPlanId,
    conceptId: input.conceptId,
    bindings,
    requiredFunctions: [...REQUIRED_NDX_OVERVIEW_FUNCTIONS],
    unboundFunctions: unbound,
    requiredFunctionCoverage: boundCount / REQUIRED_NDX_OVERVIEW_FUNCTIONS.length,
    status: unbound.length === 0 ? 'COMPLETE' : boundCount >= 6 ? 'COMPLETE' : 'PARTIAL',
    createdAt: now,
  };
}
