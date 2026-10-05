/**
 * Sequence slide contracts — Slide 02 methodology + information budget.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  SequencePositionInformationBudget,
  SequencePositionRole,
  SequenceSlideArtDirectionContract,
} from './types.js';
import { REFERENCE_CONDITIONING_ROLE } from './constants.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function sequencePositionInformationBudget(position: number): SequencePositionInformationBudget {
  if (position === 1) {
    return { position: 1, allowedDensity: 'MODERATE', guidance: 'SPARSE → MODERATE — first-slide information budget' };
  }
  if (position === 2) {
    return { position: 2, allowedDensity: 'MODERATE', guidance: 'LIGHT → MODERATE — reward the swipe' };
  }
  return { position, allowedDensity: 'DENSE', guidance: 'MODERATE → DENSE when narratively earned' };
}

export function inferSlide02SemanticRole(slide01Role: string): SequencePositionRole {
  if (slide01Role === 'OPEN' || slide01Role === 'HERO') return 'REVEAL';
  return 'CONTEXT';
}

export function slide02MustProvideSwipeReward(contract: SequenceSlideArtDirectionContract): boolean {
  if (contract.sequencePosition !== 2) return true;
  return Boolean(contract.viewerShouldLearn && contract.viewerShouldWantNext);
}

export function slide02CannotDuplicateSlide01Role(params: {
  slide01Role: SequencePositionRole | string;
  slide02Role: SequencePositionRole | string;
}): boolean {
  return params.slide01Role !== params.slide02Role || params.slide02Role === 'REVEAL';
}

export function buildSequenceSlideArtDirectionContract(params: {
  campaignId: string;
  contentPieceId: string;
  sequencePosition: number;
  slide01ContractSummary?: {
    semanticRole: string;
    viewerShouldNoticeFirst: string;
    informationDeferred: string[];
    primaryVisualSubject: string | null;
    assetId: string | null;
  };
  thesisSummary: string;
  topic: string;
  swipeRewardRequired?: boolean;
}): SequenceSlideArtDirectionContract {
  const budget = sequencePositionInformationBudget(params.sequencePosition);
  const isSlide02 = params.sequencePosition === 2;
  const slide01 = params.slide01ContractSummary;

  const semanticRole: SequencePositionRole = isSlide02
    ? inferSlide02SemanticRole(slide01?.semanticRole ?? 'OPEN')
    : params.sequencePosition === 1
      ? 'OPEN'
      : 'EVIDENCE';

  const contract: SequenceSlideArtDirectionContract = {
    id: `ssc-${params.contentPieceId}-s${params.sequencePosition}-${randomUUID().slice(0, 6)}`,
    campaignId: params.campaignId,
    contentPieceId: params.contentPieceId,
    sequencePosition: params.sequencePosition,
    semanticRole,
    previousSlideAssetId: isSlide02 ? slide01?.assetId ?? null : null,
    nextPlannedRole: isSlide02 ? 'EVIDENCE' : null,
    viewerArrivesKnowing: isSlide02
      ? slide01?.viewerShouldNoticeFirst ?? params.thesisSummary
      : params.thesisSummary,
    viewerShouldLearn: isSlide02
      ? 'First important evidence or context that rewards the swipe'
      : params.thesisSummary,
    viewerShouldFeel: isSlide02 ? 'Curious — pulled forward' : 'Stopped — intrigued',
    viewerShouldNoticeFirst: isSlide02
      ? 'Deferred evidence or contradiction — not a second cover'
      : params.topic,
    viewerShouldWantNext: isSlide02 ? 'What happens when this evidence lands?' : 'Swipe to learn more',
    informationIntroduced: isSlide02 ? ['First deferred evidence from slide 01'] : [params.topic],
    informationDeferred: slide01?.informationDeferred ?? [],
    visualSubjectMatterDecisionId: null,
    visualParticipationBalance: null,
    primaryVisualSubject: isSlide02 ? null : slide01?.primaryVisualSubject ?? null,
    supportingVisualSubjects: [],
    typographicRoles: [],
    continuityRequirements: isSlide02
      ? ['character', 'material world', 'typography family', 'trace identity', 'expression system']
      : [],
    variationRequirements: isSlide02
      ? ['composition', 'scale', 'subject placement', 'density', 'visual rhythm']
      : [],
    mustPreserveFromPrevious: isSlide02 ? ['expression system fidelity'] : [],
    mustChangeFromPrevious: isSlide02 ? ['composition', 'information hierarchy', 'visual subject'] : [],
    mustNotRepeat: isSlide02 ? ['headline-as-cover', 'identical layout'] : [],
    density: budget.allowedDensity,
    emotionalTemperature: isSlide02 ? 'CURIOUS' : 'INTRIGUED',
    referenceConditioningRole: isSlide02 && slide01?.assetId ? REFERENCE_CONDITIONING_ROLE : null,
    generationContractId: null,
    status: 'CONTRACT_READY',
    fingerprint: '',
  };

  contract.fingerprint = fp(contract);
  return contract;
}

export function referenceConditioningNotCompositionTemplate(role: string | null): boolean {
  return role === REFERENCE_CONDITIONING_ROLE || role === null;
}

export function sequenceContractReceivesPreviousSlideContext(
  contract: SequenceSlideArtDirectionContract,
): boolean {
  if (contract.sequencePosition <= 1) return true;
  return Boolean(contract.previousSlideAssetId || contract.viewerArrivesKnowing);
}
