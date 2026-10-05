/**
 * P0.VR.REPLICATION.1 — High-fidelity replication mode types.
 */

export const RECONSTRUCTION_MODES = ['PATCH_MODE', 'RECOMPOSE_MODE', 'REPLICATION_MODE'] as const;
export type ReconstructionMode = (typeof RECONSTRUCTION_MODES)[number];

export const ASSET_REPLICATION_DECISIONS = [
  'REUSE_EXISTING',
  'CROP_EXISTING',
  'RECONSTRUCT',
  'GENERATE_MISSING',
  'FOUNDER_REQUIRED',
] as const;
export type AssetReplicationDecision = (typeof ASSET_REPLICATION_DECISIONS)[number];

export const RECONSTRUCTION_EXPERIENCE_STATES = [
  'REFERENCE_READY',
  'REPLICATING',
  'REVIEW_READY',
  'REFINING',
  'PROMOTION_READY',
  'PROMOTED',
  'FAILED',
] as const;
export type ReconstructionExperienceState = (typeof RECONSTRUCTION_EXPERIENCE_STATES)[number];

export const FOUNDER_VISUAL_ACCEPTANCE_STATUSES = ['ACCEPT', 'REFINE', 'REJECT'] as const;
export type FounderVisualAcceptanceStatus = (typeof FOUNDER_VISUAL_ACCEPTANCE_STATUSES)[number];

export type BlueprintRelationship = {
  type:
    | 'contains'
    | 'above'
    | 'below'
    | 'next_to'
    | 'aligned_left'
    | 'aligned_right'
    | 'aligned_center'
    | 'equal_width'
    | 'equal_height'
    | 'overlaps'
    | 'spaced_by'
    | 'persistent'
    | 'dominant';
  fromRegionId: string;
  toRegionId: string;
  value?: string | number | null;
};

export type VisualBlueprintRegion = {
  regionId: string;
  type: string;
  bounds: { y: number; height: number };
  relativeBounds: { y: number; height: number };
  order: number;
  hierarchyLevel: number;
  layoutMode: string;
  children: string[];
  alignment: string;
  spacing: string;
  assetSlots: string[];
  contentSlots: string[];
  interactionSlots: string[];
  visualTokens: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type VisualPageBlueprint = {
  blueprintId: string;
  pageId: string;
  viewport: string;
  authorityVersionId: string;
  canvas: { width: number; height: number };
  globalGrid: string;
  regionOrder?: string[];
  regions: VisualBlueprintRegion[];
  relationships: BlueprintRelationship[];
  typographySystem: string[];
  surfaceSystem: string[];
  assetSlots: string[];
  interactionSlots: string[];
  persistentControls: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'READY' | 'PARTIAL' | 'FAILED';
};

export type FunctionGraph = {
  graphId: string;
  routes: string[];
  navigationActions: string[];
  dataQueries: string[];
  mutations: string[];
  forms: string[];
  stateKeys: string[];
  auth: string[];
  permissions: string[];
  featureFlags: string[];
  dynamicValues: string[];
  businessRules: string[];
};

export type VisualGraph = {
  graphId: string;
  blueprintId: string;
  regionOrder: string[];
  dominantRegionId: string | null;
  persistentControlIds: string[];
};

export type FunctionToVisualBinding = {
  bindingId: string;
  functionNodeId: string;
  sourceDataPath: string;
  targetRegionId: string;
  targetSlotId: string;
  bindingType: string;
  status: 'READY' | 'PARTIAL' | 'MISSING';
};

export type FunctionToVisualBindingPlan = {
  planId: string;
  bindings: FunctionToVisualBinding[];
  status: 'READY' | 'PARTIAL' | 'FAILED';
};

export type VisualReplicationDiff = {
  diffId: string;
  compositionScore: number | null;
  geometryScore: number | null;
  typographyScore: number | null;
  assetPlacementScore: number | null;
  surfaceScore: number | null;
  controlScore: number | null;
  pixelDiffScore: number | null;
  highestImpactIssues: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  iteration: number;
};

export type ReplicationIteration = {
  iterationId: string;
  twinVersionId: string | null;
  diff: VisualReplicationDiff;
  correctionsApplied: string[];
  renderRef: string | null;
  startedAt: string;
  completedAt: string | null;
  status: 'RUNNING' | 'COMPLETE' | 'PLATEAU' | 'FAILED';
};

export type ReplicationBudgetPolicy = {
  maxIterations: number;
  maxBuildAttempts: number;
  plateauThreshold: number;
  requiresFounderContinueAfter: number;
  status: 'ACTIVE' | 'EXHAUSTED' | 'PAUSED';
};

export type FounderVisualAcceptance = {
  status: FounderVisualAcceptanceStatus;
  note: string | null;
  updatedAt: string;
};

export type ReconstructionModeResolution = {
  mode: ReconstructionMode;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
};
