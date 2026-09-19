/**
 * Sequence visual variation — anti-template guard.
 */

import type { CampaignFailureState, SequenceSlideArtDirectionContract } from './types.js';

export function evaluateSequenceVisualVariation(params: {
  contracts: SequenceSlideArtDirectionContract[];
  contentPieceId: string;
}): { pass: boolean; failureStates: CampaignFailureState[] } {
  const piece = params.contracts
    .filter((c) => c.contentPieceId === params.contentPieceId)
    .sort((a, b) => a.sequencePosition - b.sequencePosition);

  const failures: CampaignFailureState[] = [];
  if (piece.length < 2) return { pass: true, failureStates: [] };

  for (let i = 1; i < piece.length; i++) {
    const prev = piece[i - 1]!;
    const curr = piece[i]!;
    if (
      prev.viewerShouldNoticeFirst === curr.viewerShouldNoticeFirst &&
      prev.primaryVisualSubject === curr.primaryVisualSubject &&
      prev.density === curr.density
    ) {
      failures.push('FAIL_TEMPLATE_PRODUCTION');
    }
    if (curr.sequencePosition === 2 && curr.semanticRole === prev.semanticRole) {
      failures.push('FAIL_SLIDE_02_AS_SECOND_COVER');
    }
  }

  return { pass: failures.length === 0, failureStates: failures };
}

export function typographyContinuityWithoutIdenticalLayout(
  contracts: SequenceSlideArtDirectionContract[],
): boolean {
  const densities = contracts.map((c) => c.density);
  if (new Set(densities).size > 1) return true;
  return contracts.some((c) => c.sequencePosition > 1 && c.variationRequirements.length > 0);
}

export function templateRepetitionGuardActive(): true {
  return true;
}
