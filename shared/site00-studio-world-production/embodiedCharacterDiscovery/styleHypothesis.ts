/**
 * P0.5E.3 — Style hypothesis — not final design; no uniform collapse.
 */

import { randomId } from './id.js';
import type { EmbodiedCharacterStyleHypothesis } from './types.js';

export function buildEmbodiedCharacterStyleHypothesis(
  overrides: Partial<EmbodiedCharacterStyleHypothesis> = {},
): EmbodiedCharacterStyleHypothesis {
  return {
    hypothesisId: randomId('sty'),
    hairRange: overrides.hairRange ?? [],
    styleRanges: overrides.styleRanges ?? [],
    limeAccentBehavior:
      overrides.limeAccentBehavior ??
      'Accent may appear through nails, accessory, highlighting tool, book object — not constant wardrobe identity.',
    confirmedVsHypothetical: overrides.confirmedVsHypothetical ?? { confirmed: [], hypothetical: [] },
    uniformCollapseBlocked: true,
  };
}
