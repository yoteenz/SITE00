import type { PageConceptStageId, PageConceptStageState } from '../designPageConceptGeneratorShell.js';

/** Which stage body stays expanded on mobile founder review. */
export function resolveFocusedPageConceptStageId(
  states: Record<PageConceptStageId, PageConceptStageState>,
): PageConceptStageId {
  if (states.GPT2 === 'ACTIVE' || states.GPT2 === 'PARTIAL') return 'GPT2';
  if (states.NBP === 'ACTIVE' || states.NBP === 'PARTIAL') return 'NBP';
  if (states.CGPT === 'ACTIVE' || states.CGPT === 'PARTIAL') return 'CGPT';
  if (states.GPT2 === 'COMPLETE') return 'GPT2';
  if (states.CGPT === 'COMPLETE') return 'GPT2';
  if (states.NBP === 'COMPLETE') return 'NBP';
  return 'GPT2';
}

export function pageConceptStageBodyCollapsed(input: {
  stageId: PageConceptStageId;
  stageState: PageConceptStageState;
  focusedStageId: PageConceptStageId;
  accordionEnabled: boolean;
}): boolean {
  if (!input.accordionEnabled) return false;
  if (input.stageId === input.focusedStageId) return false;
  if (input.stageState === 'PENDING') return true;
  if (input.stageState === 'COMPLETE') return true;
  return false;
}
