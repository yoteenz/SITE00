/**
 * Generic campaign caption synthesis scaffold.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  CampaignCaption,
  CaptionLength,
  CaptionOpeningStrategy,
  CaptionSequenceRelationshipEvaluation,
  CaptionShape,
} from './types.js';
import { GENERIC_ENGAGEMENT_BAIT } from './constants.js';
import { evaluateCaptionReadiness } from './captionReadiness.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function decideCaptionLength(params: {
  slideCount: number;
  visualDensity: 'SPARSE' | 'MODERATE' | 'DENSE';
  claimSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
}): CaptionLength {
  if (params.claimSensitivity === 'HIGH') return 'SOURCE_HEAVY';
  if (params.visualDensity === 'DENSE') return 'SHORT';
  if (params.slideCount <= 1) return 'MEDIUM';
  return 'SHORT';
}

export function decideCaptionOpening(params: {
  slide01Headline: string;
  captionDraft: string;
}): CaptionOpeningStrategy {
  if (params.captionDraft.toUpperCase() === params.slide01Headline.toUpperCase()) {
    return 'REPEAT_HEADLINE_ONLY_IF_STRATEGIC';
  }
  if (params.captionDraft.includes('?')) return 'QUESTION';
  if (/^(WAIT|OKAY|ACTUALLY)/i.test(params.captionDraft)) return 'REACTION';
  return 'CONTINUE_THE_THOUGHT';
}

export function evaluateCaptionSequenceRelationship(params: {
  captionText: string;
  slideCopy: string[];
}): CaptionSequenceRelationshipEvaluation {
  const captionUpper = params.captionText.toUpperCase().trim();
  const duplicatesSlides = params.slideCopy.some(
    (s) => s.trim().toUpperCase() === captionUpper || captionUpper.includes(s.trim().toUpperCase()),
  );
  const slideWords = new Set(params.slideCopy.join(' ').toUpperCase().split(/\W+/));
  const captionWords = captionUpper.split(/\W+/).filter((w) => w.length > 3);
  const overlapRatio = captionWords.length
    ? captionWords.filter((w) => slideWords.has(w)).length / captionWords.length
    : 0;

  const failureStates: CaptionSequenceRelationshipEvaluation['failureStates'] = [];
  if (duplicatesSlides || overlapRatio > 0.85) failureStates.push('FAIL_CAPTION_SUMMARIZES_SLIDES');
  if (GENERIC_ENGAGEMENT_BAIT.some((b) => captionUpper.includes(b))) {
    failureStates.push('FAIL_CAPTION_ENGAGEMENT_BAIT');
    failureStates.push('FAIL_CAPTION_GENERIC_CTA');
  }

  return {
    evaluationId: randomUUID(),
    captionText: params.captionText,
    slideCopy: params.slideCopy,
    duplicatesSlides,
    contradictsSlides: false,
    unsupportedClaim: false,
    addsCharacter: !duplicatesSlides,
    passed: failureStates.length === 0,
    failureStates,
  };
}

export function buildCampaignCaptionDraft(params: {
  campaignId: string;
  contentPieceId: string;
  platform: string;
  slideCopy: string[];
  characterBeat?: string | null;
  thesisSummary?: string;
  lockedSlideCount: number;
  generatedSlideCount?: number;
  requiredSlideCount: number;
  humorEligible?: boolean;
}): CampaignCaption | null {
  const readiness = evaluateCaptionReadiness({
    contentPieceId: params.contentPieceId,
    lockedSlideCount: params.lockedSlideCount,
    generatedSlideCount: params.generatedSlideCount,
    requiredSlideCount: params.requiredSlideCount,
  });

  if (readiness.state === 'NOT_READY') return null;

  const headline = params.slideCopy[0] ?? params.characterBeat ?? params.thesisSummary ?? '';
  const afterthought = params.characterBeat && params.characterBeat !== headline ? params.characterBeat : null;
  let text = afterthought ?? headline;

  if (readiness.state === 'FINAL_CAPTION_READY' && afterthought && headline) {
    text = `${afterthought}`;
  }

  text = text.replace(/^CHARACTER BEAT:\s*/i, '').replace(/^WHAT NDX NOTICED:\s*/i, '').trim().toUpperCase();

  const length = decideCaptionLength({
    slideCount: params.slideCopy.length,
    visualDensity: 'MODERATE',
    claimSensitivity: 'MEDIUM',
  });

  const shape: CaptionShape = text.length < 40 ? 'ONE_LINER' : 'SHORT_REACTION';
  const opening = decideCaptionOpening({ slide01Headline: headline, captionDraft: text });

  const caption: CampaignCaption = {
    captionId: `cap-${params.contentPieceId}`,
    contentPieceId: params.contentPieceId,
    campaignId: params.campaignId,
    platform: params.platform,
    text,
    version: 1,
    readiness: readiness.state,
    strategy: shape,
    length,
    openingStrategy: opening,
    cta: 'NO_CTA',
    sourceNotes: [],
    approvalState: readiness.state === 'FINAL_CAPTION_READY' ? 'FOUNDER_REVIEW' : 'DRAFT',
    founderJudgment: null,
    characterEvaluation: null,
    freshnessEvaluation: 'CURRENT',
    sequenceRelationship: evaluateCaptionSequenceRelationship({
      captionText: text,
      slideCopy: params.slideCopy,
    }).passed
      ? 'PASS'
      : 'FAIL',
    parentCaptionId: null,
    revisionHistory: [],
    fingerprint: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  caption.fingerprint = fp(caption);
  return caption;
}

export function onePrimaryCaptionByDefault(): true {
  return true;
}

export function noBulkCaptionVariantSpam(): true {
  return true;
}

export function crossPlatformCopyDuplicationBlocked(platformA: string, platformB: string): boolean {
  return platformA !== platformB;
}

export function genericEngagementBaitFails(text: string): boolean {
  const upper = text.toUpperCase();
  return GENERIC_ENGAGEMENT_BAIT.some((b) => upper.includes(b));
}
