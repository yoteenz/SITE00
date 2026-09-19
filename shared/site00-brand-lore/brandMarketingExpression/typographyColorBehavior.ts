/**
 * Typography + color behavior — functions without prescribing fonts or palette.
 */

import type { MarketingColorBehavior, MarketingTypographyBehavior } from './types.js';

export const MARKETING_TYPOGRAPHY_BEHAVIORS: MarketingTypographyBehavior[] = [
  { behavior: 'YELL', description: 'A thought became impossible to ignore', prescribesFont: false },
  { behavior: 'STATE', description: 'Plain declarative claim', prescribesFont: false },
  { behavior: 'QUESTION', description: 'Assumption challenge', prescribesFont: false },
  { behavior: 'ANNOTATE', description: 'Marginal intervention on source material', prescribesFont: false },
  { behavior: 'WHISPER', description: 'Intentional restraint', prescribesFont: false },
  { behavior: 'FILE', description: 'Archival reference label', prescribesFont: false },
  { behavior: 'CORRECT', description: 'Revision of prior belief', prescribesFont: false },
  { behavior: 'INTERRUPT', description: 'Break expected reading flow', prescribesFont: false },
  { behavior: 'LABEL', description: 'Evidence metadata', prescribesFont: false },
  { behavior: 'COUNT', description: 'Quantified observation', prescribesFont: false },
  { behavior: 'QUOTE', description: 'Source voice preserved', prescribesFont: false },
  { behavior: 'REMEMBER', description: 'Callback to prior context', prescribesFont: false },
  { behavior: 'ARGUE', description: 'Contradiction surfaced', prescribesFont: false },
  { behavior: 'CONCLUDE', description: 'Provisional or strong judgment', prescribesFont: false },
  { behavior: 'BACKTRACK', description: 'Self-correction visible', prescribesFont: false },
];

export const MARKETING_COLOR_BEHAVIORS: MarketingColorBehavior[] = [
  { function: 'ATTENTION', description: 'Draw eye to unresolved tension', prescribesPalette: false },
  { function: 'SELECTION', description: 'Mark what NDX selected as significant', prescribesPalette: false },
  { function: 'CORRECTION', description: 'Revision or disagreement', prescribesPalette: false },
  { function: 'CONTRADICTION', description: 'Then/now mismatch', prescribesPalette: false },
  { function: 'WARNING', description: 'Failed promise or risk', prescribesPalette: false },
  { function: 'MEMORY', description: 'Archived evidence callback', prescribesPalette: false },
  { function: 'RESOLUTION', description: 'Conclusion reached', prescribesPalette: false },
  { function: 'INTERRUPTION', description: 'Break visual rhythm', prescribesPalette: false },
  { function: 'EVIDENCE', description: 'Source material framing', prescribesPalette: false },
  { function: 'AMBIENCE', description: 'Topic-specific atmosphere', prescribesPalette: false },
];

export function typographyBehaviorDoesNotPrescribeFonts(
  behaviors: MarketingTypographyBehavior[],
): boolean {
  return behaviors.every((b) => b.prescribesFont === false);
}

export function colorBehaviorDoesNotPrescribePalette(behaviors: MarketingColorBehavior[]): boolean {
  return behaviors.every((b) => b.prescribesPalette === false);
}
