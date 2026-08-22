/**
 * Creative Direction Board — board-first production types (Stage A pilot).
 * Production unit: CREATIVE_DIRECTION_BOARD (not isolated PROOF_IMAGE slot).
 */

import type { RenderingMediumRecommendation } from './types.js';

export const MARKED_UP_COPY_DIRECTION_NAME = 'THE MARKED-UP COPY';
export const MARKED_UP_COPY_BOARD_PLAN_VERSION = 'marked-up-copy-pilot-v1';

export type BoardZoneId =
  | 'heroEditorialSpread'
  | 'primaryRevisionArtifact'
  | 'supportingPhotography'
  | 'physicalEditorObject'
  | 'typographicInterruption'
  | 'socialExpression'
  | 'motionSeedStrip';

export type BoardAssetRole =
  | 'HERO_EDITORIAL_SPREAD'
  | 'REPLACEMENT_PAPER_STRIP'
  | 'EDITORIAL_NOTE_FRAGMENT'
  | 'PHYSICAL_EDITOR_OBJECT'
  | 'SECONDARY_PHOTOGRAPHIC_EVIDENCE'
  | 'SOCIAL_FRAME_SUBSTRATE'
  | 'MOTION_KEYFRAME_SUBSTRATE';

export type BoardAssetClassification =
  | 'CODE_NATIVE'
  | 'SVG_NATIVE'
  | 'FAL_GENERATED'
  | 'FAL_REFERENCE_CONDITIONED'
  | 'FAL_GENERATED_AND_ISOLATED'
  | 'HYBRID_COMPOSITION'
  | 'DETERMINISTIC_COMPOSITE';

export type BoardCompositionPlacement = {
  zoneId: BoardZoneId;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  anchor: 'top-left' | 'center' | 'bottom-right' | 'top-right';
  cropMode: 'cover' | 'contain' | 'none';
  safeArea?: { top: number; right: number; bottom: number; left: number };
  overlapTarget?: BoardZoneId;
  overlapAmount?: number;
  backgroundMode: 'transparent' | 'paper' | 'editorial-field';
  shadowOwner: 'ASSET_INTRINSIC' | 'CODE_NATIVE_SHADOW' | 'COMPOSITE_SHADOW' | 'NONE';
};

export type BoardCompositionMap = {
  canvasWidth: number;
  canvasHeight: number;
  breakpoint: 'DESKTOP' | 'MOBILE';
  placements: BoardCompositionPlacement[];
};

export type BoardReferenceDecomposition = {
  referenceId: string;
  label: string;
  borrow: {
    composition: string[];
    material: string[];
    typography: string[];
    graphicGrammar: string[];
    photography: string[];
  };
  doNotBorrow: string[];
};

export type BoardArtDirectionSpec = {
  boardStory: string;
  firstRead: string;
  secondRead: string;
  editorialTension: string;
  quietZone: string;
  signatureMoment: string;
  boardStructure: Record<BoardZoneId, string>;
  antiGenericConstraints: string[];
  referenceInfluence: string[];
};

export type BoardAssetManifestEntry = {
  assetId: string;
  manifestId: string;
  role: BoardAssetRole;
  zoneId: BoardZoneId;
  classification: BoardAssetClassification;
  generationMethod: RenderingMediumRecommendation;
  referenceInputs: string[];
  backgroundTreatment: 'FULL_BLEED' | 'NEUTRAL_REMOVABLE' | 'TRANSPARENT' | 'CODE_FIELD';
  backgroundRemovalRequired: boolean;
  edgeTreatment: 'NOT_APPLICABLE' | 'PAPER_CLEAN' | 'HARD_ALPHA';
  shadowOwnership: BoardCompositionPlacement['shadowOwner'];
  desktopPlacement: BoardCompositionPlacement;
  mobilePlacement: BoardCompositionPlacement;
  prompt: string;
  negativeConstraints: string[];
  qaCriteria: string[];
};

export type CreativeDirectionBoardPlan = {
  planId: string;
  boardPlanVersion: string;
  comparisonSetKey: string;
  comparisonIndex: number;
  directionId: string;
  directionName: string;
  sourceFormationId: string;
  sourceFormationVersion: number;
  bigIdea: string;
  thesis: string;
  governingBehavior: string;
  artDirection: BoardArtDirectionSpec;
  referenceDecompositions: BoardReferenceDecomposition[];
  desktopMap: BoardCompositionMap;
  mobileMap: BoardCompositionMap;
  assetManifest: BoardAssetManifestEntry[];
  costEstimate: {
    assetsPlanned: number;
    referenceConditionedCalls: number;
    textToImageCalls: number;
    backgroundRemovalCalls: number;
    codeNativeAssets: number;
    estimatedCostUsd: number;
  };
  createdAt: string;
};

export type BoardAssetProductionState =
  | 'PLANNED'
  | 'GENERATING'
  | 'INSPECTING'
  | 'REGENERATING'
  | 'READY'
  | 'NEEDS_REVIEW'
  | 'FAILED';

export type BoardAssetRecord = {
  assetId: string;
  manifestId: string;
  planId: string;
  comparisonSetKey: string;
  directionId: string;
  directionName: string;
  role: BoardAssetRole;
  zoneId: BoardZoneId;
  classification: BoardAssetClassification;
  generationMethod: RenderingMediumRecommendation;
  url: string;
  storagePath: string;
  model?: string;
  promptHash: string;
  referenceHash: string;
  qaState: 'ACCEPT' | 'REJECT' | 'NEEDS_HUMAN_REVIEW';
  productionState: BoardAssetProductionState;
  backgroundRemovalRequired: boolean;
  iteration: number;
  inspectionNotes: string[];
  createdAt: string;
};

export type BoardQaReport = {
  conceptUnder5Seconds: boolean;
  brandWorldNotCollage: boolean;
  contemporary: boolean;
  referenceTranslation: boolean;
  hierarchy: boolean;
  negativeSpace: boolean;
  editorialFrictionStructural: boolean;
  visualRange: boolean;
  socialFirst: boolean;
  motionFromBehavior: boolean;
  wordmarkRemovalRecognition: boolean;
  stockImageRejection: boolean;
  result: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  notes: string[];
};

export type CreativeDirectionBoard = {
  boardId: string;
  planId: string;
  boardPlanVersion: string;
  comparisonSetKey: string;
  comparisonIndex: number;
  directionId: string;
  directionName: string;
  desktopBoardUrl: string;
  desktopBoardStoragePath: string;
  mobileBoardUrl: string;
  mobileBoardStoragePath: string;
  socialProofUrl?: string;
  motionProofUrl?: string;
  socialProofStoragePath?: string;
  motionProofStoragePath?: string;
  assetRecords: BoardAssetRecord[];
  qaReport: BoardQaReport;
  founderVisible: boolean;
  productionState: 'READY' | 'NEEDS_HUMAN_REVIEW' | 'FAILED';
  createdAt: string;
};

export type MarkedUpCopyBoardPilotResult = {
  plan: CreativeDirectionBoardPlan;
  board: CreativeDirectionBoard | null;
  otherDirectionsTouched: false;
  anthropicRequestCount: number;
  falRequestCount: number;
  backgroundRemovalCount: number;
  regenerations: number;
  estimatedCostUsd: number;
  actualCostUsd: number;
  pilotResult: 'PASS' | 'REVISE_METHODOLOGY' | 'NEEDS_HUMAN_REVIEW';
  readyToScale: false;
};
