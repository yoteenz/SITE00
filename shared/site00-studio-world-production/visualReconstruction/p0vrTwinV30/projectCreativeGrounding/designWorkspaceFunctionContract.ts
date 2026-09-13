import type { DesignWorkspaceFunctionContract } from './types.js';

export function getDesignWorkspaceFunctionContract(): DesignWorkspaceFunctionContract {
  return {
    version: 'design-workspace-v3-r4',
    compositionRule:
      'Every major UI region must support a real design workspace job — no decorative filler modules.',
    jobs: [
      'REVIEW_ACTIVE_CONCEPT',
      'COMPARE_CONCEPTS',
      'APPROVE',
      'REFINE',
      'REGENERATE',
      'INSPECT_BLUEPRINT',
      'INSPECT_OVERLAY',
      'INSPECT_ASSETS',
      'INSPECT_FUNCTION_MAPPING',
      'VIEW_READINESS',
      'OPEN_TECHNICAL_DETAILS',
      'MOVE_TO_BUILD_WHEN_READY',
    ],
  };
}
