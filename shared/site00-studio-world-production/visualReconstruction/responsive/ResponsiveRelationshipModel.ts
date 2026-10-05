/**
 * Responsive relationship model — desktop/mobile behavior mapping.
 */

export type ResponsiveRelationship =
  | 'PERSIST'
  | 'REORDER'
  | 'STACK'
  | 'COLLAPSE'
  | 'CAROUSEL'
  | 'HORIZONTAL_SCROLL'
  | 'BOTTOM_SHEET'
  | 'HIDE_TO_INSPECT'
  | 'MERGE'
  | 'SPLIT'
  | 'SCALE'
  | 'RECOMPOSE';

export type ModuleResponsiveBehavior = {
  moduleId: string;
  desktopBehavior: string;
  mobileBehavior: string;
  relationship: ResponsiveRelationship;
};

export const NDX_MODULE_RESPONSIVE_BEHAVIORS: ModuleResponsiveBehavior[] = [
  {
    moduleId: 'overview',
    desktopBehavior: 'full pulse + production strip + radar',
    mobileBehavior: 'compact pulse + horizontal artwork strip',
    relationship: 'PERSIST',
  },
  {
    moduleId: 'campaign-board',
    desktopBehavior: 'multi-column production wall',
    mobileBehavior: 'day selector + swipeable Pages + horizontal Margins + motion preview',
    relationship: 'RECOMPOSE',
  },
  {
    moduleId: 'experiments-hub',
    desktopBehavior: 'six-column journey + recent + actions',
    mobileBehavior: 'horizontal journey scroll + stacked columns',
    relationship: 'HORIZONTAL_SCROLL',
  },
  {
    moduleId: 'content-operations',
    desktopBehavior: 'pulse + production strip + radar + range',
    mobileBehavior: 'compact pulse + horizontal artwork strip',
    relationship: 'COLLAPSE',
  },
  {
    moduleId: 'experiment-01',
    desktopBehavior: '3×3 board + direction sidebar',
    mobileBehavior: 'board-first + selected asset + inspector sheet',
    relationship: 'STACK',
  },
  {
    moduleId: 'experiment-01-mobile',
    desktopBehavior: 'asset grid with inspector panel',
    mobileBehavior: 'selected asset detail in bottom sheet',
    relationship: 'BOTTOM_SHEET',
  },
  {
    moduleId: 'content-ops-desk',
    desktopBehavior: 'tabbed opportunities + current work grid',
    mobileBehavior: 'carousel of review cards',
    relationship: 'CAROUSEL',
  },
  {
    moduleId: 'cultural-intelligence',
    desktopBehavior: 'signals list + map',
    mobileBehavior: 'stacked signals + compact radar',
    relationship: 'STACK',
  },
  {
    moduleId: 'character-lab',
    desktopBehavior: 'portrait + synthesis columns',
    mobileBehavior: 'portrait-first + tabs',
    relationship: 'REORDER',
  },
  {
    moduleId: 'inspect-layer',
    desktopBehavior: 'side inspector rail always visible',
    mobileBehavior: 'metadata hidden until inspect tap',
    relationship: 'HIDE_TO_INSPECT',
  },
];

export function evaluateResponsiveRelationship(
  moduleId: string,
  desktopViewport: boolean,
  _mobileViewport: boolean,
  desktopScore: number,
  mobileScore: number,
): { passed: boolean; score: number; failures: string[]; behavior: ModuleResponsiveBehavior | null } {
  const behavior = NDX_MODULE_RESPONSIVE_BEHAVIORS.find((m) => m.moduleId === moduleId) ?? null;
  const failures: string[] = [];
  if (desktopScore > 0.7 && mobileScore < 0.4) failures.push('FAIL_MOBILE_IS_SHRUNK_DESKTOP');
  if (mobileScore > 0.7 && desktopScore < 0.4 && desktopViewport) failures.push('FAIL_DESKTOP_IS_STRETCHED_MOBILE');
  if (Math.abs(desktopScore - mobileScore) > 0.5) failures.push('FAIL_RESPONSIVE_REFERENCE_RELATIONSHIP');
  const score = (desktopScore + mobileScore) / 2;
  return { passed: failures.length === 0, score, failures, behavior };
}

export function buildVisualReferenceSetFromFounderBoards(input: {
  desktop: import('../types.js').NormalizedVisualReference;
  mobile: import('../types.js').NormalizedVisualReference;
}): import('../types.js').VisualReferenceSetExtended {
  return {
    setId: `founder-ndx-${input.desktop.referenceId}`,
    primaryReferenceId: input.desktop.referenceId,
    references: [
      { ...input.desktop, referenceRole: 'DESKTOP_PRIMARY' as const },
      { ...input.mobile, referenceRole: 'MOBILE_PRIMARY' as const },
    ],
    pageStates: ['DEFAULT'],
  };
}
