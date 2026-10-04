import type { IconFamily, IconReview } from './iconTypes';
import { pushIconFamilyVersion } from './iconFamilies';

export type IconFounderAction =
  | 'LOVE_IT'
  | 'REFINE_FAMILY'
  | 'REGENERATE_FAMILY'
  | 'WRONG_DIRECTION'
  | 'APPROVE_FAMILY'
  | 'DEFER';

export function applyIconReviewAction(family: IconFamily, action: IconFounderAction, feedback?: string): { family: IconFamily; review: IconReview } {
  const review: IconReview = {
    icon_family_id: family.icon_family_id,
    version: family.version,
    status: action,
    feedback: feedback ?? null,
    parent_version: family.lineage_parent_id ? family.version - 1 : null,
    superseded_by: null,
  };
  if (action === 'APPROVE_FAMILY' || action === 'LOVE_IT') {
    return { family: { ...family, status: 'APPROVED' }, review: { ...review, status: 'APPROVED' } };
  }
  if (action === 'REFINE_FAMILY' || action === 'REGENERATE_FAMILY' || action === 'WRONG_DIRECTION') {
    const next = pushIconFamilyVersion(family, feedback ?? action);
    review.superseded_by = next.version;
    return { family: next, review };
  }
  return { family, review };
}
