import type { AuthorityPlanEntry, AuthorityReview, AuthorityReviewStatus } from './map2Types';

export function createReviewFromPlan(entry: AuthorityPlanEntry, version = 1): AuthorityReview {
  return {
    authority_id: entry.authority_id,
    candidate_id: `${entry.authority_id}_cand_v${version}`,
    generation_id: `gen_${entry.authority_id}_v${version}`,
    version,
    surface: entry.surface,
    status: 'READY_FOR_REVIEW',
    founder_judgment: null,
    feedback: null,
    parent_candidate: version > 1 ? `${entry.authority_id}_cand_v${version - 1}` : null,
    combined_from: [],
    approved_as_family_authority: false,
    approved_at: null,
    superseded_by: null,
  };
}

export function applyReviewAction(
  review: AuthorityReview,
  action: AuthorityReviewStatus,
  feedback?: string,
): AuthorityReview {
  review.status = action;
  review.founder_judgment = action;
  if (feedback) review.feedback = feedback;
  if (action === 'APPROVED' || action === 'LOVE_IT') review.approved_at = new Date().toISOString();
  return review;
}

export function refineReview(review: AuthorityReview): AuthorityReview {
  const next = createReviewFromPlan(
    { authority_id: review.authority_id } as AuthorityPlanEntry,
    review.version + 1,
  );
  review.status = 'SUPERSEDED';
  review.superseded_by = next.candidate_id;
  next.parent_candidate = review.candidate_id;
  next.status = 'REFINE';
  next.feedback = review.feedback;
  return next;
}

export function regenerateReview(review: AuthorityReview): AuthorityReview {
  const next = createReviewFromPlan({ authority_id: review.authority_id } as AuthorityPlanEntry, review.version + 1);
  review.superseded_by = next.candidate_id;
  review.status = 'SUPERSEDED';
  next.parent_candidate = review.candidate_id;
  next.status = 'REGENERATE';
  return next;
}

export function combineReviews(primary: AuthorityReview, secondary: AuthorityReview): AuthorityReview {
  const next = createReviewFromPlan({ authority_id: primary.authority_id } as AuthorityPlanEntry, primary.version + 1);
  next.combined_from = [primary.candidate_id, secondary.candidate_id];
  next.status = 'COMBINED';
  primary.superseded_by = next.candidate_id;
  secondary.superseded_by = next.candidate_id;
  return next;
}
