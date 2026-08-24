/**
 * Generic Studio World — campaign caption types.
 */

import type {
  CAPTION_APPROVAL_STATES,
  CAPTION_CTA_OPTIONS,
  CAPTION_FAILURE_STATES,
  CAPTION_FOUNDER_JUDGMENTS,
  CAPTION_LENGTHS,
  CAPTION_OPENING_STRATEGIES,
  CAPTION_READINESS_STATES,
  CAPTION_SHAPES,
} from './constants.js';

export type CaptionReadinessState = (typeof CAPTION_READINESS_STATES)[number];
export type CaptionLength = (typeof CAPTION_LENGTHS)[number];
export type CaptionShape = (typeof CAPTION_SHAPES)[number];
export type CaptionOpeningStrategy = (typeof CAPTION_OPENING_STRATEGIES)[number];
export type CaptionCtaOption = (typeof CAPTION_CTA_OPTIONS)[number];
export type CaptionApprovalState = (typeof CAPTION_APPROVAL_STATES)[number];
export type CaptionFounderJudgment = (typeof CAPTION_FOUNDER_JUDGMENTS)[number] | null;
export type CaptionFailureState = (typeof CAPTION_FAILURE_STATES)[number];

export type CaptionReadinessEvaluation = {
  evaluationId: string;
  contentPieceId: string;
  state: CaptionReadinessState;
  lockedSlideCount: number;
  requiredSlideCount: number;
  reason: string | null;
};

export type CampaignCaption = {
  captionId: string;
  contentPieceId: string;
  campaignId: string;
  platform: string;
  text: string;
  version: number;
  readiness: CaptionReadinessState;
  strategy: CaptionShape;
  length: CaptionLength;
  openingStrategy: CaptionOpeningStrategy;
  cta: CaptionCtaOption;
  sourceNotes: string[];
  approvalState: CaptionApprovalState;
  founderJudgment: CaptionFounderJudgment;
  characterEvaluation: string | null;
  freshnessEvaluation: 'CURRENT' | 'STALE' | 'REVIEW_REQUIRED';
  sequenceRelationship: 'PASS' | 'FAIL';
  parentCaptionId: string | null;
  revisionHistory: CaptionRevisionRecord[];
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type CaptionRevisionRecord = {
  revisionId: string;
  parentCaptionId: string;
  judgment: CaptionFounderJudgment;
  founderNote: string | null;
  previousText: string;
  revisedText: string;
  revisionReason: 'MEANING_CHANGE' | 'VISUAL_ONLY' | 'FOUNDER_REVISION' | 'STALE_CONTEXT';
  appliedAt: string;
};

export type CaptionSequenceRelationshipEvaluation = {
  evaluationId: string;
  captionText: string;
  slideCopy: string[];
  duplicatesSlides: boolean;
  contradictsSlides: boolean;
  unsupportedClaim: boolean;
  addsCharacter: boolean;
  passed: boolean;
  failureStates: CaptionFailureState[];
};

export type CaptionFreshnessEvaluation = {
  evaluationId: string;
  contentPieceId: string;
  status: 'CURRENT' | 'STALE' | 'CAPTION_OR_CONTENT_REVIEW_REQUIRED';
  contextChanged: boolean;
  evaluatedAt: string;
};
