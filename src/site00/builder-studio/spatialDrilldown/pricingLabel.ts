import { builderEstimateView, scopeImpact } from '../../builder-experience/clientView';
import type { BuilderSelection } from '../../builder-experience/types';

export type EstimateDeltaLabel =
  | { kind: 'UNCHANGED'; text: string }
  | { kind: 'RANGE_UPDATES'; text: string; before: string; after: string }
  | { kind: 'REQUIRES_QUOTE'; text: string }
  | { kind: 'LEVEL_CHANGE'; text: string };

/** Never invent dollar amounts — only compare canonical estimator output. */
export function estimateDeltaLabel(before: BuilderSelection, after: BuilderSelection): EstimateDeltaLabel {
  try {
    const impact = scopeImpact(before, after);
    if (impact.levelChanges) {
      return { kind: 'LEVEL_CHANGE', text: 'THIS CHOICE CHANGES BUILD LEVEL — REVIEW OPEN DECISIONS BEFORE CONTINUING.' };
    }
    if (impact.size === 'NONE') {
      return { kind: 'UNCHANGED', text: 'INVESTMENT RANGE UNCHANGED FOR THIS ADJUSTMENT.' };
    }
    const a = builderEstimateView(before).investment;
    const b = builderEstimateView(after).investment;
    if (a === b) {
      return { kind: 'UNCHANGED', text: 'INVESTMENT RANGE UNCHANGED FOR THIS ADJUSTMENT.' };
    }
    return {
      kind: 'RANGE_UPDATES',
      text: 'INVESTMENT RANGE UPDATES WHEN YOU CONFIRM.',
      before: a.toUpperCase(),
      after: b.toUpperCase(),
    };
  } catch {
    return { kind: 'REQUIRES_QUOTE', text: 'REQUIRES QUOTE — ESTIMATOR CANNOT PRICE THIS COMBINATION YET.' };
  }
}
