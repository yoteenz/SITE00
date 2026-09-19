/**
 * P0.5E.4F — Character canon contamination evaluation.
 */

import { randomUUID } from 'node:crypto';
import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import type {
  CharacterCanonContaminationEvaluation,
  PreCanonAssetClassification,
} from './types.js';
import { evaluateNDXVisualIdentityReadiness } from './readiness.js';

export function evaluateCharacterCanonContamination(params: {
  casting: CharacterVisualCastingState | null | undefined;
  assetPreviewUrl: string | null;
  assetClassification: PreCanonAssetClassification;
  usedAsIdentityAuthority: boolean;
  isStaleCastingCandidate: boolean;
  isGenericVisualHypothesis: boolean;
  isPostLockHistoricalReuse: boolean;
  explicitlyApproved: boolean;
}): CharacterCanonContaminationEvaluation {
  const reasons: string[] = [];
  let failureCode: CharacterCanonContaminationEvaluation['failureCode'] = null;

  const visualReady = evaluateNDXVisualIdentityReadiness(params.casting).ready;

  if (params.usedAsIdentityAuthority && !visualReady) {
    reasons.push('Pre-canon image used as character reference authority');
    failureCode = 'FAIL_PRECANON_CHARACTER_CONTAMINATION';
  }

  if (params.isStaleCastingCandidate && params.usedAsIdentityAuthority) {
    reasons.push('Unrelated casting candidate entered prompt reference pack');
    failureCode = 'FAIL_PRECANON_CHARACTER_CONTAMINATION';
  }

  if (params.isGenericVisualHypothesis && params.usedAsIdentityAuthority) {
    reasons.push('Generic visual hypothesis used as identity anchor');
    failureCode = 'FAIL_PRECANON_CHARACTER_CONTAMINATION';
  }

  if (params.isPostLockHistoricalReuse && !params.explicitlyApproved && visualReady) {
    reasons.push('Historical generated woman reused after final identity lock without approval');
    failureCode = 'FAIL_PRECANON_CHARACTER_CONTAMINATION';
  }

  if (
    params.assetClassification === 'PRE_CANON_CHARACTER_PLACEHOLDER' &&
    params.usedAsIdentityAuthority
  ) {
    reasons.push('Placeholder asset cannot become character authority');
    failureCode = 'FAIL_PRECANON_CHARACTER_CONTAMINATION';
  }

  return {
    evaluationId: randomUUID(),
    passed: failureCode === null,
    failureCode,
    reasons,
    assetClassification: params.assetClassification,
    evaluatedAt: new Date().toISOString(),
  };
}

export function classifyPreCanonAsset(params: {
  isFounderUpload: boolean;
  isApprovedAnchor: boolean;
  isApprovedBibleAsset: boolean;
  isHistoricalCastingRound: boolean;
  isPlaceholder: boolean;
  isNegativeEvidence: boolean;
}): PreCanonAssetClassification {
  if (params.isPlaceholder) return 'PRE_CANON_CHARACTER_PLACEHOLDER';
  if (params.isNegativeEvidence) return 'NEGATIVE_IDENTITY_EVIDENCE';
  if (params.isApprovedAnchor || params.isApprovedBibleAsset) return 'CANONICAL_REFERENCE_CANDIDATE';
  if (params.isFounderUpload) return 'FOUNDER_VISUAL_REFERENCE';
  if (params.isHistoricalCastingRound) return 'HISTORICAL_EXPLORATION';
  return 'HISTORICAL_EXPLORATION';
}

export function historicalAssetAutoPromotedToCanon(classification: PreCanonAssetClassification): boolean {
  return classification === 'CANONICAL_REFERENCE_CANDIDATE';
}
