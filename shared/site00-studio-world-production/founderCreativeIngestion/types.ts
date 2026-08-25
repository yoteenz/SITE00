/**
 * P0.CB.1 — Founder creative ingestion types (Studio World generic).
 */

import type {
  ASSET_KIND_TYPES,
  CREATIVE_AUTHORITY_TYPES,
  CREATIVE_CANON_STATUS,
  CREATIVE_ORIGIN_TYPES,
  CREATIVE_SEQUENCE_ROLES,
  GENERATION_PROVENANCE_TYPES,
  INGESTION_WORKFLOW_STEPS,
  LEARNING_PERMISSION_TYPES,
  PHOTOGRAPHY_SOURCE_MODES,
  RECONSTRUCTION_REVIEW_JUDGMENTS,
} from './constants.js';

export type CreativeOriginType = (typeof CREATIVE_ORIGIN_TYPES)[number];
export type CreativeAuthorityType = (typeof CREATIVE_AUTHORITY_TYPES)[number];
export type GenerationProvenanceType = (typeof GENERATION_PROVENANCE_TYPES)[number];
export type CreativeCanonStatus = (typeof CREATIVE_CANON_STATUS)[number];
export type LearningPermissionType = (typeof LEARNING_PERMISSION_TYPES)[number];
export type AssetKindType = (typeof ASSET_KIND_TYPES)[number];
export type IngestionWorkflowStep = (typeof INGESTION_WORKFLOW_STEPS)[number];
export type PhotographySourceMode = (typeof PHOTOGRAPHY_SOURCE_MODES)[number];
export type ReconstructionReviewJudgment = (typeof RECONSTRUCTION_REVIEW_JUDGMENTS)[number];
export type CreativeSequenceRole = (typeof CREATIVE_SEQUENCE_ROLES)[number];

export type FounderCreativeProvenance = {
  origin: CreativeOriginType;
  creativeAuthority: CreativeAuthorityType;
  generationProvenance: GenerationProvenanceType;
  canonStatus: CreativeCanonStatus;
  learningPermission: LearningPermissionType;
};

export type CreativeReferenceAsset = {
  assetId: string;
  kind: 'REFERENCE_IMAGE';
  storagePath: string | null;
  previewUrl: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  uploadedAt: string;
  notes: string | null;
};

export type CreativeReferenceBoard = {
  boardId: string;
  sequenceId: string;
  referenceAssetId: string;
  gridRows: number;
  gridCols: number;
  slideCount: number;
  decomposedAt: string | null;
  slideReferenceIds: string[];
};

export type SlideReference = {
  slideReferenceId: string;
  boardId: string;
  sequenceId: string;
  slideNumber: number;
  referenceAssetIds: string[];
  /** Reference crop region for display only — NOT a production asset */
  referenceRegion: { row: number; col: number; normalizedBounds: { x: number; y: number; w: number; h: number } };
  observableCopy: string[];
  compositionNotes: string[];
  hasPhotography: boolean;
  hasTypography: boolean;
  hasAnnotations: boolean;
  confidence: number;
};

export type SlideCopySpec = {
  exactText: string[];
  hierarchy: string[];
  emphasis: string[];
  annotationText: string[];
};

export type SlideCompositionSpec = {
  layoutGrammar: string;
  focalRegion: string;
  negativeSpace: string;
  alignment: string;
  geometry: string;
  layering: string;
};

export type SlideSurfaceSpec = {
  background: string;
  paper: string;
  texture: string;
  material: string;
};

export type SlideTypographySpec = {
  roles: string[];
  relativeScale: string;
  treatment: string;
};

export type PhotographyReconstructionSpec = {
  required: boolean;
  role: string;
  sourceMode: PhotographySourceMode;
  referenceIds: string[];
  canonicalAssetId: string | null;
  reconstructionPrompt: string;
  promptEditedByFounder: boolean;
  selectedAssetId: string | null;
  candidateAssetIds: string[];
  lineageAssetIds: string[];
};

export type SlideLayerModel = {
  background: string | null;
  photograph: string | null;
  typography: string | null;
  annotations: string | null;
  decorativeObjects: string | null;
  overlays: string | null;
  texture: string | null;
};

export type SlideReconstructionSpec = {
  slideId: string;
  sequenceId: string;
  slideReferenceId: string;
  referenceAssetIds: string[];
  targetAspectRatio: string;
  targetResolution: string;
  copy: SlideCopySpec;
  composition: SlideCompositionSpec;
  surface: SlideSurfaceSpec;
  typography: SlideTypographySpec;
  photography: PhotographyReconstructionSpec;
  objects: string[];
  annotations: string[];
  brandSignals: string[];
  reconstructionPrompt: string;
  confidence: number;
  founderOverrides: Record<string, unknown>;
  reviewStatus: 'PENDING' | 'RECONSTRUCTION_REVIEW' | 'APPROVED' | 'REVISE';
  productionAssetId: string | null;
  productionMasterUrl: string | null;
  layerModel: SlideLayerModel;
};

export type SlideProductionAsset = {
  assetId: string;
  slideId: string;
  sequenceId: string;
  kind: 'PRODUCTION_ASSET';
  masterUrl: string | null;
  masterResolution: string;
  derivativeUrls: Record<string, string>;
  approvedAt: string | null;
  lineageParentIds: string[];
};

export type FounderCreativeParentSequence = {
  sequenceId: string;
  campaignId: string;
  title: string;
  format: 'CAROUSEL_SEQUENCE';
  role: CreativeSequenceRole;
  franchise: string | null;
  entry: string | null;
  provenance: FounderCreativeProvenance;
  referenceBoardId: string | null;
  slideIds: string[];
  rowIndex: number;
  caption: string | null;
  notes: string | null;
  reconstructionStatus: 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED';
  sequenceReviewStatus: 'PENDING' | 'IN_REVIEW' | 'APPROVED';
};

export type InstagramRowPreview = {
  rowId: string;
  rowNumber: number;
  label: string;
  sequenceIds: string[];
};

export type CreativeSignalLearningRecord = {
  signalId: string;
  campaignId: string;
  territoryLabels: string[];
  principles: string[];
  avoidsTemplateCloning: true;
  recordedAt: string;
};

export type CharacterIdentityAuthority = {
  status: 'LOCKED' | 'NOT_LOCKED';
  canonicalReferenceAssetId: string | null;
  message: string;
};

export type FounderCreativeIngestionState = {
  ingestionVersion: typeof import('./constants.js').FOUNDER_CREATIVE_INGESTION_VERSION;
  workflowStep: IngestionWorkflowStep;
  campaignId: string;
  campaignLabel: string;
  parentSequences: FounderCreativeParentSequence[];
  referenceBoards: CreativeReferenceBoard[];
  referenceAssets: CreativeReferenceAsset[];
  slideReferences: SlideReference[];
  reconstructionSpecs: SlideReconstructionSpec[];
  productionAssets: SlideProductionAsset[];
  rowPreview: InstagramRowPreview[];
  creativeSignals: CreativeSignalLearningRecord[];
  characterIdentity: CharacterIdentityAuthority;
  registeredOnCampaignBoard: boolean;
  falImageRequests: number;
  falVideoRequests: number;
  falGenerationTracking: FounderCreativeFalGenerationTracking | null;
  updatedAt: string;
};

export type FounderCreativeFalGenerationTracking = {
  attemptId: string;
  slideIds: string[];
  startedAt: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  currentSlideId: string | null;
  completedSlideIds: string[];
  errorMessage: string | null;
};
