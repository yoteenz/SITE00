/**
 * P0.VR.MOBILE-AUTHORITY-CONFIRM-AND-EXPERIENCE-EXPRESSION-STAGE-FIX1
 */

import type { ExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import type { PageViewportAuthorityFamily } from './pageConceptViewportAuthorityFamily.js';
import type { PageConceptPipelineSet } from './types.js';

export type MobileAuthorityStatus = 'NONE' | 'SELECTED' | 'CONFIRMED';

export function resolveMobileAuthorityStatus(family: PageViewportAuthorityFamily | null | undefined): MobileAuthorityStatus {
  if (!family?.selectedMobileConceptId) return 'NONE';
  if (family.mobileAuthorityStatus === 'CONFIRMED') return 'CONFIRMED';
  return 'SELECTED';
}

export function isMobileAuthorityConfirmed(family: PageViewportAuthorityFamily | null | undefined): boolean {
  return resolveMobileAuthorityStatus(family) === 'CONFIRMED';
}

export function resolveExperienceExpressionStatus(
  pipelineSet: PageConceptPipelineSet | null | undefined,
): ExperienceExpressionAuthority['status'] {
  const authority = pipelineSet?.experienceExpressionAuthority ?? null;
  if (authority?.status) return authority.status;
  const contract = pipelineSet?.experienceExpressionContract;
  if (contract?.approvedAt) return 'APPROVED';
  if (contract && !contract.approvedAt) return 'READY_FOR_REVIEW';
  return 'NOT_STARTED';
}

export function experienceArtifactReadyForReview(pipelineSet: PageConceptPipelineSet | null | undefined): boolean {
  const status = resolveExperienceExpressionStatus(pipelineSet);
  return status === 'READY_FOR_REVIEW' || status === 'PARTIAL_FAILURE' || status === 'APPROVED';
}

export function slotLabelFromConceptId(
  pipelineSet: PageConceptPipelineSet | null,
  conceptId: string | null,
): string | null {
  if (!conceptId || !pipelineSet?.mobileConcepts?.length) return null;
  const row = pipelineSet.mobileConcepts.find((c) => c.conceptId === conceptId);
  if (!row) return null;
  if (row.slot === 'MOBILE_CONCEPT_A') return 'CONCEPT A';
  if (row.slot === 'MOBILE_CONCEPT_B') return 'CONCEPT B';
  return 'CONCEPT C';
}
