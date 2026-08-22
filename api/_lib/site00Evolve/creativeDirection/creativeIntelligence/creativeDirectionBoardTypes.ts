/**
 * Creative Direction Board — board-first production types (Stage A pilot).
 * Production unit: CREATIVE_DIRECTION_BOARD (not isolated PROOF_IMAGE slot).
 */

import type { RenderingMediumRecommendation } from './types.js';

export const MARKED_UP_COPY_DIRECTION_NAME = 'THE MARKED-UP COPY';
export const MARKED_UP_COPY_BOARD_PLAN_VERSION = 'marked-up-copy-pilot-v1';
export const MARKED_UP_COPY_BOARD_PLAN_VERSION_V2 = 'marked-up-copy-pilot-v2';
export const MARKED_UP_COPY_BOARD_PLAN_VERSION_V3 = 'marked-up-copy-pilot-v3';

export const FOUNDER_VISUAL_FEEDBACK_V2 =
  'The board has the right idea, but it still feels mechanically assembled rather than fully creative-directed. It needs stronger visual hierarchy, more intentional tension, more variety in scale and material behavior, stronger reference translation, and a composition where the editorial argument transforms the page rather than appearing as decoration layered over it.';

export type FounderVisualApproval = 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED';

export type BoardAssetReuseDecision =
  | 'REUSE_AS_IS'
  | 'REUSE_WITH_NEW_CROP'
  | 'REUSE_WITH_EDIT'
  | 'REGENERATE'
  | 'REMOVE'
  | 'NEW_ASSET_REQUIRED';

export type BoardCreativeCritique = {
  whatWorks: string[];
  whatFeelsMechanical: string[];
  whatIsTooSafe: string[];
  whatIsTooClean: string[];
  whatIsTooEven: string[];
  whatNeedsMoreTension: string[];
  whatNeedsMoreNegativeSpace: string[];
  whatNeedsMoreScaleContrast: string[];
  whatNeedsMoreMateriality: string[];
  whatNeedsMoreReferenceTranslation: string[];
  whatNeedsMoreBrandSpecificity: string[];
  whatShouldBeRemoved: string[];
  whatShouldBecomeDominant: string[];
  whatShouldBecomeSecondary: string[];
  whatShouldOverlap: string[];
  whatShouldBreakTheGrid: string[];
  whatShouldRemainQuiet: string[];
  lineage: {
    provider: string;
    model: string;
    promptVersion: string;
    inputFingerprint: string;
    outputHash: string;
    createdAt: string;
  };
};

export type BoardReferenceTranslationDecision = {
  referenceId: string;
  cropId?: string;
  trait: string;
  currentBoardUnderuse: string;
  newBoardTranslation: string;
  zone: BoardZoneId;
  assetManifestId: string;
  compositionDecision: string;
};

export type BoardTypographicVoiceSystem = {
  cleanVoice: string;
  revisionVoice: string;
  marginVoice: string;
  metadataVoice: string;
};

export type BoardGraphicGrammarSystem = {
  selectedDevices: string[];
  semanticBehavior: string;
};

export type BoardColorRoleSystem = Record<string, string>;

export type BoardHierarchyPlan = {
  dominantEvent: string;
  supportingDiscoveries: string[];
  minorEvidence: string[];
  quietZone: string;
};

export type BoardAssetDecision = {
  manifestId: string;
  decision: BoardAssetReuseDecision;
  rationale: string;
  referenceConditioned?: boolean;
};

export type BoardCreativeDirectorPass = {
  critique: BoardCreativeCritique;
  artDirection: CreativeDirectionBoardArtDirection;
  hierarchy: BoardHierarchyPlan;
  referenceTranslations: BoardReferenceTranslationDecision[];
  typographicVoices: BoardTypographicVoiceSystem;
  graphicGrammar: BoardGraphicGrammarSystem;
  colorRoles: BoardColorRoleSystem;
  socialSystem: string;
  motionSystem: string;
  desktopMap: BoardCompositionMap;
  mobileMap: BoardCompositionMap;
  assetManifest: BoardAssetManifestEntry[];
  assetDecisions: BoardAssetDecision[];
  creativeDirectionAuthorityScore: number;
};

export const FAL_REFERENCE_EDIT_MODEL = 'fal-ai/nano-banana-pro/edit';
export const FAL_TEXT_TO_IMAGE_MODEL = 'fal-ai/nano-banana-pro';

export type TextOwnership = 'CODE_NATIVE' | 'SVG_NATIVE' | 'FAL_FORBIDDEN' | 'HYBRID_OVERLAY';

export type BoardPresentationMode = 'LEGACY_PROOF' | 'BOARD_PRODUCTION' | 'BOARD_READY';

export type CreativeDirectionBoardArtDirection = {
  boardStory: string;
  firstRead: string;
  secondRead: string;
  thirdRead: string;
  signatureMoment: string;
  visualHierarchy: string;
  compositionBehavior: string;
  negativeSpaceStrategy: string;
  imageLanguageApplication: string;
  materialApplication: string;
  typographicBehavior: string;
  graphicGrammar: string;
  annotationGrammar: string;
  artifactBehavior: string;
  socialBehavior: string;
  motionBehavior: string;
  referenceApplication: string[];
  antiGenericRules: string[];
  antiCousinRules: string[];
  lineage: {
    provider: string;
    model: string;
    promptVersion: string;
    inputFingerprint: string;
    outputHash: string;
    createdAt: string;
  };
};

export type ResolvedBoardReference = {
  referenceId: string;
  assetId: string;
  source: 'SUPABASE_MANIFEST' | 'BOARD_V1_ASSET' | 'BRAND_LORE';
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  width: number;
  height: number;
  founderNote: string;
  referenceRole: string;
};

export type BoardReferenceCrop = {
  cropId: string;
  sourceReferenceId: string;
  sourceX: number;
  sourceY: number;
  cropWidth: number;
  cropHeight: number;
  purpose: string;
  boardZone: BoardZoneId;
  influencedAssetIds: string[];
  storagePath: string;
  publicUrl: string;
};

export type BoardReferenceInfluenceEdge = {
  referenceId: string;
  cropId?: string;
  trait: string;
  boardZone: BoardZoneId;
  assetManifestId: string;
  application: 'FAL_REFERENCE_CONDITIONED' | 'CODE_NATIVE' | 'COMPOSITION_MAP' | 'HYBRID_OVERLAY';
};

export type BoardAssetInspectionReport = {
  conceptFit: number;
  roleFit: number;
  referenceFidelity: number;
  compositionUsability: number;
  stockLikeness: number;
  unwantedText: boolean;
  unwantedLogo: boolean;
  malformedObjects: boolean;
  cropUsability: number;
  materialFidelity: number;
  directionSpecificity: number;
  decision: 'ACCEPT' | 'REJECT' | 'NEEDS_HUMAN_REVIEW';
  reasons: string[];
  visionInspected: boolean;
};

export type BoardQaScoreReport = {
  CONCEPT_IMMEDIACY: number;
  BRAND_SPECIFICITY: number;
  REFERENCE_TRANSLATION: number;
  COMPOSITION_INTENT: number;
  SYSTEM_EXTENSIBILITY: number;
  TYPOGRAPHIC_INTEGRITY: number;
  MATERIAL_RELEVANCE: number;
  SOCIAL_APPLICABILITY: number;
  MOTION_COHERENCE: number;
  NON_STOCK_DISTINCTIVENESS: number;
  CREATIVE_DIRECTION_AUTHORITY?: number;
  total: number;
  WORDMARK_REMOVAL_TEST: 'PASS' | 'FAIL';
  GENERIC_STOCK_TEST: 'PASS' | 'FAIL';
  DIRECTION_CONTAMINATION_TEST: 'PASS' | 'FAIL';
  REFERENCE_TRANSLATION_TEST: 'PASS' | 'FAIL';
  result: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  notes: string[];
};

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
  referenceCropIds?: string[];
  textOwnership?: TextOwnership;
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
  dynamicArtDirection?: CreativeDirectionBoardArtDirection;
  referenceDecompositions: BoardReferenceDecomposition[];
  resolvedReferences?: ResolvedBoardReference[];
  referenceCrops?: BoardReferenceCrop[];
  referenceInfluenceGraph?: BoardReferenceInfluenceEdge[];
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
  referenceImageInputs?: string[];
  inspectionReport?: BoardAssetInspectionReport;
  qaState: 'ACCEPT' | 'REJECT' | 'NEEDS_HUMAN_REVIEW';
  productionState: BoardAssetProductionState;
  backgroundRemovalRequired: boolean;
  iteration: number;
  inspectionNotes: string[];
  rejectionReason?: string;
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
  qaScoreReport?: BoardQaScoreReport;
  creativeDirectorCritique?: BoardCreativeCritique;
  founderVisualApproval?: FounderVisualApproval;
  presentationMode?: BoardPresentationMode;
  founderVisible: boolean;
  productionState: 'READY' | 'NEEDS_HUMAN_REVIEW' | 'FAILED';
  createdAt: string;
};

export type MarkedUpCopyBoardPilotV3Result = {
  status:
    | 'PASS'
    | 'FAIL'
    | 'NEEDS_HUMAN_REVIEW'
    | 'PILOT_BLOCKED_ON_DIRECTION_COMPLETION'
    | 'BLOCKED_ON_SONNET_ART_DIRECTION'
    | 'REVISE_METHODOLOGY';
  plan: CreativeDirectionBoardPlan | null;
  board: CreativeDirectionBoard | null;
  creativeDirectorPass: BoardCreativeDirectorPass | null;
  directionCompletion: MarkedUpCopyBoardPilotV2Result['directionCompletion'];
  anthropic: MarkedUpCopyBoardPilotV2Result['anthropic'] & { creativeDirectorRequests: number };
  fal: MarkedUpCopyBoardPilotV2Result['fal'];
  otherDirectionsTouched: false;
  v2Preserved: boolean;
};

export type MarkedUpCopyBoardPilotV2Result = {
  status:
    | 'PASS'
    | 'FAIL'
    | 'NEEDS_HUMAN_REVIEW'
    | 'PILOT_BLOCKED_ON_DIRECTION_COMPLETION'
    | 'REVISE_METHODOLOGY';
  plan: CreativeDirectionBoardPlan | null;
  board: CreativeDirectionBoard | null;
  directionCompletion: {
    missingFieldsBefore: string[];
    completionExecuted: boolean;
    fieldsCompleted: string[];
    fieldCompletenessAfter: boolean;
    immutableAnchorsPreserved: boolean;
  };
  anthropic: {
    completionRequests: number;
    artDirectionRequests: number;
    visionRequests: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  };
  fal: {
    referenceConditionedRequests: number;
    textToImageRequests: number;
    backgroundRemovalRequests: number;
    regenerations: number;
    rejectedGenerations: number;
    estimatedCostUsd: number;
  };
  otherDirectionsTouched: false;
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
