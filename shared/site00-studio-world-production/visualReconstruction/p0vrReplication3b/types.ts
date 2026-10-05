/**
 * P0.VR.REPLICATION.3B — Vision-in-the-loop literal replication types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export const VISION_REPLICATION_FAILURE_CODES = [
  'VISION_PROVIDER_UNAVAILABLE',
  'VISION_MODEL_NO_IMAGE_SUPPORT',
  'VISION_OUTPUT_INVALID',
  'VISION_REGION_TOO_LOW_RESOLUTION',
  'VISION_TIMEOUT',
  'VISION_OUTPUT_TOO_GENERIC',
  'SOURCE_COLLAPSED_LITERAL_STRUCTURE',
  'VISION_REPLICATION_CAPABILITY_LIMIT',
] as const;

export type VisionReplicationFailureCode = (typeof VISION_REPLICATION_FAILURE_CODES)[number];

export const LITERAL_UI_REPLICATION_PROMPT_CLASS = 'LITERAL_UI_REPLICATION' as const;

export type VisionProviderAudit = {
  provider: string;
  model: string;
  visionCapability: boolean;
  inputFormat: 'base64-image' | 'url-image' | 'none';
  maxImageResolution: string;
  cropSupport: boolean;
  structuredOutputSupport: boolean;
  escalatedModel: string | null;
};

export type VisionReplicationObservation = {
  regionId: string;
  authorityDescription: string;
  twinDescription: string;
  visibleDifferences: string[];
  missingElements: string[];
  extraElements: string[];
  geometryDifferences: string[];
  surfaceDifferences: string[];
  typographyDifferences: string[];
  assetDifferences: string[];
  layoutRelationships: string[];
  literalCorrections: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OK' | VisionReplicationFailureCode;
};

export type LiteralRegionRelationship =
  | 'leftOf'
  | 'rightOf'
  | 'above'
  | 'below'
  | 'overlaps'
  | 'alignedTop'
  | 'alignedBottom'
  | 'fillsHeight'
  | 'centeredWithin'
  | 'anchoredToEdge'
  | 'spacedBy'
  | 'dominates';

export type LiteralSubregion = {
  id: string;
  role: string;
  bounds: string;
  surface?: string;
  relationships: Array<{ type: LiteralRegionRelationship; targetId: string; note?: string }>;
};

export type LiteralAssetSlot = {
  slotId: string;
  expectedAssetType: 'photography' | 'graphic' | 'icon' | 'decorative-crop';
  authorityCrop: string | null;
  existingAssetCandidate: string | null;
  selectedAsset: string | null;
  bindingStatus: 'BOUND' | 'ASSET_MISSING' | 'PENDING' | 'FAILED';
  fallbackStatus: 'NONE' | 'LITERAL_SLOT' | 'GENERIC_PLACEHOLDER';
};

export type LiteralRegionSpec = {
  regionId: string;
  bounds: string;
  surface: string;
  subregions: LiteralSubregion[];
  textBlocks: Array<{ id: string; role: string; approximateLines: number }>;
  imageSlots: LiteralAssetSlot[];
  graphicSlots: LiteralAssetSlot[];
  controls: Array<{ id: string; kind: string }>;
  dividers: string[];
  relationships: Array<{ type: LiteralRegionRelationship; a: string; b: string }>;
  spacing: string[];
  dominantColors: string[];
  sourceConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type RegionLiteralityScore = {
  regionId: string;
  structure: number;
  geometry: number;
  assetPlacement: number;
  surface: number;
  typography: number;
  controls: number;
  overall: number;
};

export type VisionCorrectionPass = {
  passId: string;
  regionId: string;
  authorityCrop: string;
  twinCrop: string;
  differences: string[];
  corrections: string[];
  sourceChanges: string[];
  beforeScore: number;
  afterScore: number;
  status: 'IMPROVED' | 'UNCHANGED' | 'FAILED' | 'CAPABILITY_LIMIT';
};

export type VisionReplicationReceipt = {
  provider: string;
  model: string;
  inputImages: Array<{ role: 'authority' | 'twin'; bytesOrRef: string; received: boolean }>;
  region: string | 'whole-page';
  visionPromptClass: typeof LITERAL_UI_REPLICATION_PROMPT_CLASS;
  observationCount: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OK' | VisionReplicationFailureCode;
  createdAt: string;
};

export type VisionReplicationReport = {
  reportId: string;
  sessionId: string;
  buildRef: string;
  providerAudit: VisionProviderAudit;
  wholePageObservation: VisionReplicationObservation | null;
  regionObservations: VisionReplicationObservation[];
  literalRegionSpecs: LiteralRegionSpec[];
  correctionPasses: VisionCorrectionPass[];
  regionScores: RegionLiteralityScore[];
  receipts: VisionReplicationReceipt[];
  preVisionBaselineRenderMode: 'SHELL_FIRST_NDX_OVERVIEW';
  twinRenderMode: 'VISION_LITERAL_NDX_OVERVIEW';
  newTwinVersionId: string;
  heroRecognizable: boolean;
  capabilityLimit: boolean;
  nextStrategy: 'CONTINUE_VISION_LOOP' | 'DIRECT_VISUAL_CODE_GENERATION_WITH_VISION_QA' | null;
  playwrightLoopUsed: boolean;
  createdAt: string;
};

export type VisionReplicationInspectInput = {
  authorityImage: string;
  twinScreenshot: string | null;
  viewport: DesignViewportClass;
  regionId: string;
  regionBounds: string;
  domSummary?: string;
  wholePage?: boolean;
};

export type VisionReplicationClient = {
  inspect: (input: VisionReplicationInspectInput) => Promise<VisionReplicationObservation>;
  auditProvider: () => VisionProviderAudit;
};
