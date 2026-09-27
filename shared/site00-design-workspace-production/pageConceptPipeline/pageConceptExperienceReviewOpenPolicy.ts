/**
 * Founder review rail / overlay: open existing FAL package vs dispatch new generation.
 */

import type { ExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import type { PageConceptPipelineSet } from './types.js';
import { resolveExperienceExpressionStatus } from './pageConceptViewportFamilyState.js';

function falPreviewCount(authority: ExperienceExpressionAuthority | null | undefined): number {
  return (authority?.visualStates ?? []).filter((v) => Boolean(v.previewImageUri?.trim())).length;
}

function experienceAuthorityProgressScore(authority: ExperienceExpressionAuthority | null | undefined): number {
  if (!authority) return 0;
  const statusRank: Record<ExperienceExpressionAuthority['status'], number> = {
    APPROVED: 500,
    READY_FOR_REVIEW: 400,
    PARTIAL_FAILURE: 350,
    GENERATING: 200,
    FAILED: 100,
    NOT_STARTED: 0,
    SUPERSEDED: 0,
  };
  return (statusRank[authority.status] ?? 0) + falPreviewCount(authority) * 10;
}

/** Prefer the authority snapshot with more founder-visible FAL progress (server vs local merge). */
export function pickRicherExperienceExpressionAuthority(
  local: ExperienceExpressionAuthority | null | undefined,
  merged: ExperienceExpressionAuthority | null | undefined,
): ExperienceExpressionAuthority | null | undefined {
  if (!local) return merged;
  if (!merged) return local;
  const localScore = experienceAuthorityProgressScore(local);
  const mergedScore = experienceAuthorityProgressScore(merged);
  return localScore >= mergedScore ? local : merged;
}

/**
 * True when the hero rail "view experience" action should only open the review panel —
 * not re-run full-package FAL generation.
 */
export function shouldDispatchGenerateExperienceOnReviewOpen(
  pipelineSet: PageConceptPipelineSet | null | undefined,
): boolean {
  const authority = pipelineSet?.experienceExpressionAuthority ?? null;
  if (!authority) {
    const status = resolveExperienceExpressionStatus(pipelineSet);
    return status === 'NOT_STARTED' || status === 'SUPERSEDED';
  }
  if (authority.status === 'NOT_STARTED' || authority.status === 'SUPERSEDED') return true;
  if (falPreviewCount(authority) > 0) return false;
  if (authority.status === 'GENERATING') return false;
  return authority.status === 'FAILED';
}
