/**
 * P0.VR.7R1 — Guided reconstruction flow + workflow sequence intelligence.
 */

import type { ReferenceAssetCandidate } from '../referenceReconstructionIntelligence/referenceAssetMismatch.js';

export const GUIDED_FOUNDER_STAGES = ['SOURCE', 'FRAME', 'BUILD', 'REVIEW', 'REPLACE'] as const;
export type GuidedFounderStage = (typeof GUIDED_FOUNDER_STAGES)[number];

export const SIBLING_SET_TYPES = [
  'BRAND_FAMILY_VISUAL_ROW',
  'ICON_SET',
  'CARD_SET',
  'NAV_SET',
  'PRODUCT_SET',
  'THUMBNAIL_SET',
  'CAROUSEL',
  'GRID',
  'COLUMN',
  'ROW',
  'REPEATED_BADGE_SET',
  'REPEATED_DECORATIVE_OBJECT_SET',
  'UNKNOWN',
] as const;

export type SiblingAssetSetType = (typeof SIBLING_SET_TYPES)[number];

export const SPATIAL_PATTERNS = [
  'HORIZONTAL_ROW_LEFT_TO_RIGHT',
  'VERTICAL_COLUMN_TOP_TO_BOTTOM',
  'GRID_LEFT_TO_RIGHT_TOP_TO_BOTTOM',
  'DOM_ORDER',
  'AMBIGUOUS',
] as const;

export type SpatialPattern = (typeof SPATIAL_PATTERNS)[number];

export const SEQUENCE_ITEM_STATUSES = ['UPCOMING', 'CURRENT', 'COMPLETE', 'NEEDS_ATTENTION', 'SKIPPED'] as const;
export type SequenceItemStatus = (typeof SEQUENCE_ITEM_STATUSES)[number];

export type NormalizedCropRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GuidedSequenceItem = {
  assetId: string;
  candidateId: string;
  displayName: string;
  thumbnailUrl: string;
  orderIndex: number;
  status: SequenceItemStatus;
  cropRegion: NormalizedCropRegion;
  cropProposalSource: 'MANUAL' | 'SIBLING_TRANSFER' | 'PATTERN_LEARNING' | 'DETECTION';
  cropProposalApproved: boolean;
};

export type WorkflowSequenceIntelligenceInput = {
  jobId: string;
  jobType: string;
  sourceReferenceId: string;
  founderInstruction?: string | null;
  candidates: ReferenceAssetCandidate[];
  spatialHints?: { parentComponent?: string; rowIndex?: number; columnIndex?: number };
  previousActions?: Array<{ assetId: string; action: string; cropRegion?: NormalizedCropRegion }>;
  autoAdvanceEnabled?: boolean;
};

export type WorkflowSequenceIntelligenceOutput = {
  sequenceId: string;
  sequenceType: SiblingAssetSetType;
  orderedAssetIds: string[];
  spatialPattern: SpatialPattern;
  sharedIntent: string;
  sharedTreatment: string;
  sharedCropBehavior: string;
  sharedGenerationPolicy: string;
  currentIndex: number;
  nextAssetId: string | null;
  confidence: number;
  autoAdvanceAllowed: boolean;
  orderAmbiguous: boolean;
  intentSummary: string[];
};

export type SiblingAssetSetResolution = {
  setType: SiblingAssetSetType;
  spatialPattern: SpatialPattern;
  orderedCandidateIds: string[];
  sharedParentComponent: string | null;
  confidence: number;
  orderAmbiguous: boolean;
};

export type CropCheckStatus = 'NOT_READY' | 'READY_WITH_WARNING' | 'READY';

export type CropCheckItem = {
  code: string;
  label: string;
  severity: 'warning' | 'blocker';
};

export type CropCheckResult = {
  status: CropCheckStatus;
  items: CropCheckItem[];
};

export type NextBestWorkflowAction = {
  action: string;
  reason: string;
  targetAssetId: string | null;
  targetStage: GuidedFounderStage;
  primaryCta: string;
  requiresFounder: boolean;
  safeToAutoAdvance: boolean;
};

export type GuidedTransitionFeedback = {
  completedAssetName: string;
  completedLabel: string;
  nextAssetName: string | null;
  nextStage: GuidedFounderStage | null;
};

export type FounderWorkflowPattern = {
  patternId: string;
  projectId: string;
  jobType: string;
  assetSetType: SiblingAssetSetType;
  instructionIntent: string;
  orderingRule: SpatialPattern;
  cropPattern: NormalizedCropRegion | null;
  treatmentPattern: string;
  backgroundPolicy: string;
  providerPolicy: string;
  approvalPolicy: string;
  usageCount: number;
  successCount: number;
  founderOverrides: number;
  confidence: number;
  lastUsedAt: string | null;
  corrections: Array<{
    proposedPattern: NormalizedCropRegion;
    founderCorrection: NormalizedCropRegion;
    reason: string;
    finalPattern: NormalizedCropRegion;
  }>;
};

export type GuidedReconstructionSequence = {
  sequenceId: string;
  jobId: string;
  founderStage: GuidedFounderStage;
  workflowStageMap: Record<GuidedFounderStage, string>;
  intelligence: WorkflowSequenceIntelligenceOutput;
  items: GuidedSequenceItem[];
  currentIndex: number;
  autoAdvanceEnabled: boolean;
  lastTransition: GuidedTransitionFeedback | null;
  cropChecksByAssetId: Record<string, CropCheckResult>;
  generationPlanReady: boolean;
  bindingPlanReady: boolean;
  liveQaReady: boolean;
  jobComplete: boolean;
  resumeHint: string | null;
};

export type GeometryTransferProposal = {
  assetId: string;
  proposedRegion: NormalizedCropRegion;
  sourceAssetId: string;
  confidence: number;
  requiresFounderReview: true;
  rationale: string;
};
