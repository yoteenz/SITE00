import type { BlueprintGrammar } from './types.js';

/** Forensic blueprint as approved design grammar — not pixel copy authority. */
export function extractBlueprintGrammarFromForensicNdx(): BlueprintGrammar {
  return {
    density: 'high — founder operating snapshot, not sparse marketing',
    columnBehavior: 'asymmetric three-zone hero (editorial / media / utility)',
    spacingRhythm: 'tight vertical bands with strong dividers',
    typeHierarchy: 'condensed headline → micro supporting → status labels → table microtype',
    imageToTextRatio: 'hero media dominant; lower bands mix editorial crops + data',
    dividerBehavior: '1px structural rules; lime accent line in hero stack',
    accentBehavior: 'lime for accent lines, NDX overlay, active states — never generic SaaS blue',
    navBehavior: 'horizontal module tabs; host bottom nav separate from page bands',
    informationBands: [
      'masthead + project identity',
      'section nav',
      'hero',
      'progress',
      'metrics',
      'current focus',
      'milestone',
      'activity',
      'host bottom nav',
    ],
    metricTreatment: 'compact row with label + bold value + divider grid',
    heroCompositionPatterns: 'editorial left stack + center media + right utility column + NDX overlay',
    activityTableBehavior: 'timestamp column + uppercase title + actor',
    bottomNavBehavior: 'SITE 00 host strip — not NDXBOOK branded cards',
    shellRelationships: 'white page shell bands on dark hero; host chrome wraps client content',
  };
}
