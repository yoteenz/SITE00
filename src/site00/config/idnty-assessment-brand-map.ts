import type { IdntyBrandStateIconId } from './idnty-brand-state-icons';
import type { IdntyAssessmentStateId } from './idnty-assessment';

/** Map IDNTY brand state card ids → assessment route slugs. */
export const IDNTY_BRAND_STATE_TO_ASSESSMENT: Record<IdntyBrandStateIconId, IdntyAssessmentStateId> = {
  'starting-at-zero': 'starting-at-zero',
  'some-pieces': 'some-pieces-exist',
  'needs-cohesion': 'needs-cohesion',
  'ready-evolution': 'ready-for-evolution',
  'build-ready': 'build-ready',
};

export function brandStateToAssessmentSlug(brandStateId: string): IdntyAssessmentStateId | null {
  if (brandStateId in IDNTY_BRAND_STATE_TO_ASSESSMENT) {
    return IDNTY_BRAND_STATE_TO_ASSESSMENT[brandStateId as IdntyBrandStateIconId];
  }
  return null;
}
