/**
 * P0.5C.5 — NDX first-person authorship types.
 */

import type { V25_FOUNDER_JUDGMENTS } from './constants.js';
import type { PublicCopyTranslation } from '../../site00-studio-world-production/publicAuthorship/types.js';
import type { CampaignCaption } from '../../site00-studio-world-production/campaignCaption/types.js';

export type V25FounderJudgment = (typeof V25_FOUNDER_JUDGMENTS)[number] | null;

export type NdxPublicCopyLayer = {
  layerId: string;
  artifactId: string;
  publicAuthorshipMode: 'FIRST_PERSON_CHARACTER_AUTHORSHIP';
  translations: PublicCopyTranslation[];
  visiblePublicCopy: string[];
  sourceVoiceSegments: string[];
  ndxVoiceSegments: string[];
  uppercaseGoverned: true;
  exportEvaluationId: string | null;
  fingerprint: string;
};

export type V23PublicCopyRevision = {
  revisionId: string;
  artifactId: string;
  parentFingerprint: string;
  preserve: string[];
  change: string[];
  mustNotBecome: string[];
  removedLabels: string[];
  publicCopyBefore: string[];
  publicCopyAfter: string[];
  artDirectionPreserved: true;
  materialityPreserved: true;
  signatureLimePreserved: true;
  makerMarksPreserved: true;
  appliedAt: string;
};

export type ContentPackageCaptionLayer = {
  captionSynthesisContractId: string;
  caption: CampaignCaption | null;
  publicAuthorshipLayerId: string | null;
  founderLanguageEvidenceIds: string[];
  platform: string;
};

export type CampaignContentUnit = {
  contentPieceId: string;
  slides: { assetId: string; sequencePosition: number; generatedAssetUrl: string | null }[];
  caption: CampaignCaption | null;
  platform: string;
  approvalState: 'DRAFT' | 'FOUNDER_REVIEW' | 'APPROVED';
  sourceNotes: string[];
};
