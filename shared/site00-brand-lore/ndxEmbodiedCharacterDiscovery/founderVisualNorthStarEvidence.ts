/**
 * P0.5E.3 — Founder visual north-star evidence from reference boards 01 & 02.
 */

import { buildFounderVisualPreferenceEvidence } from '../../site00-studio-world-production/embodiedCharacterDiscovery/founderVisualEvidence.js';
import type { FounderEmbodiedCharacterVisualPreferenceEvidence } from '../../site00-studio-world-production/embodiedCharacterDiscovery/types.js';
import {
  FOUNDER_BOARD_01_SELECTIONS,
  FOUNDER_BOARD_02_SELECTIONS,
  FOUNDER_REFERENCE_BOARD_01_ID,
  FOUNDER_REFERENCE_BOARD_02_ID,
  VISUAL_TENDENCY_HYPOTHESES,
} from './constants.js';

const BOARD_01_COMMONALITIES = [
  'Contemporary Black femininity with editorial ease',
  'Natural/protective hair textures',
  'Gold jewelry and personal accessories',
  'Streetwear-to-elevated fashion range',
  'Warm expression with guarded undertone',
  'Lived-in styling — not costume',
];

const BOARD_02_COMMONALITIES = [
  'Effortless off-duty polish',
  'Approachable cool without performance',
  'Understated sensuality',
  'Visually expressive face',
];

export function buildNdxFounderVisualNorthStarEvidence(): FounderEmbodiedCharacterVisualPreferenceEvidence[] {
  return [
    buildFounderVisualPreferenceEvidence({
      referenceBoardId: FOUNDER_REFERENCE_BOARD_01_ID,
      selectionIds: [...FOUNDER_BOARD_01_SELECTIONS],
      observedCommonalities: BOARD_01_COMMONALITIES,
      possibleInterpretations: [
        'She could dress up or down without becoming a different person',
        'Style reads as personal taste, not brand uniform',
        'Hair and jewelry feel chosen, not assigned',
      ],
      uncertainties: [
        'Exact age range not determined from references alone',
        'Which protective styles feel most natural to her daily life',
        'How much editorial polish vs off-duty dominates her baseline',
      ],
      visualTendencyHypotheses: [...VISUAL_TENDENCY_HYPOTHESES],
    }),
    buildFounderVisualPreferenceEvidence({
      referenceBoardId: FOUNDER_REFERENCE_BOARD_02_ID,
      selectionIds: [...FOUNDER_BOARD_02_SELECTIONS],
      observedCommonalities: BOARD_02_COMMONALITIES,
      possibleInterpretations: [
        'She may be most recognizable in motion between styled and tired',
        'Camera may catch her mid-thought more than mid-pose',
      ],
      uncertainties: [
        'Whether #2 and #8 share energy temperature or only styling register',
        'Face structure still undetermined — references are tendency only',
      ],
      visualTendencyHypotheses: [...VISUAL_TENDENCY_HYPOTHESES],
    }),
  ];
}

export function interpretVisualTendenciesWithoutAveraging(
  evidence: FounderEmbodiedCharacterVisualPreferenceEvidence[],
): string[] {
  const hypotheses = new Set<string>();
  for (const board of evidence) {
    for (const h of board.visualTendencyHypotheses) hypotheses.add(h);
  }
  return [...hypotheses];
}
