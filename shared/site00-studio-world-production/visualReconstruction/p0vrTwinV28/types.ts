import type {
  FAL_CAPABILITY_CLASSIFICATIONS,
  FAL_TWIN_GENERATION_MODES,
  P0_VR_TWIN_V28_BUILD,
} from './constants.js';
import type { CreativeBrandContext } from '../p0vrTwinV21/types.js';

export type FalTwinGenerationMode = (typeof FAL_TWIN_GENERATION_MODES)[number];
export type FalCapabilityClassification = (typeof FAL_CAPABILITY_CLASSIFICATIONS)[number];

export type MinimalTwinGenerationState = {
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  viewport: 'mobile';
  brandContext: CreativeBrandContext;
  requiredObjects: string[];
  creativeFreedom: string;
  hostBoundary: string;
  objectIds: string[];
  assetIntents: { objectId: string; assetSlotId: string; intent: string }[];
  status: 'DRAFT' | 'READY' | 'GENERATING' | 'COMPLETE' | 'FAILED';
};

export type FalVisualArtifact = {
  artifactId: string;
  artifactKind: 'AUTHORITY_VISUAL' | 'BLUEPRINT_TWIN_VISUAL' | 'STANDALONE_ASSET';
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  objectId: string | null;
  storageUrl: string;
  providerJobRef: string;
  provider: string;
  model: string;
};

export type FalTwinGenerationReceipt = {
  buildRef: typeof P0_VR_TWIN_V28_BUILD;
  compositionStateId: string;
  conceptId: string;
  conceptVersionId: string;
  provider: string;
  authorityModel: string;
  blueprintModel: string;
  generationMode: FalTwinGenerationMode;
  authorityJobRef: string;
  blueprintJobRef: string;
  authorityArtifactId: string;
  blueprintArtifactId: string;
  authorityUrl: string;
  blueprintUrl: string;
  sameCompositionState: boolean;
  sameObjectIds: boolean;
  sameViewport: boolean;
  status: 'PASS' | 'FAIL' | 'PENDING_ALIGNMENT';
  createdAt: string;
};

export type TwinVisualAlignmentReceipt = {
  compositionStateId: string;
  pageStructureMatch: boolean;
  objectPresenceMatch: boolean;
  majorGeometryMatch: boolean;
  heroMatch: boolean;
  navMatch: boolean;
  progressMatch: boolean;
  metricsMatch: boolean;
  assetPlacementMatch: boolean;
  majorDriftObjects: string[];
  status: 'PASS' | 'FAIL' | 'PENDING_FOUNDER_REVIEW';
  method: 'AUTOMATED_HEURISTIC' | 'FOUNDER_CONFIRMED';
};

export type AssetGenerationProofReceipt = {
  objectId: string;
  authorityAppearance: boolean;
  standaloneGenerated: boolean;
  transparentBackground: boolean;
  providerJobRef: string;
  artifactId: string;
  visualSimilarity: number | null;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
};

export type FalParallelTwinProofBundle = {
  minimalState: MinimalTwinGenerationState;
  generationReceipt: FalTwinGenerationReceipt;
  authorityArtifact: FalVisualArtifact;
  blueprintArtifact: FalVisualArtifact;
  alignmentReceipt: TwinVisualAlignmentReceipt;
  assetProofs: AssetGenerationProofReceipt[];
  capabilityClassification: FalCapabilityClassification;
  failureCode: string | null;
  providerTrace: string[];
};
