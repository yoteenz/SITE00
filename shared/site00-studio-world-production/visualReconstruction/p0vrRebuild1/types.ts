/**
 * P0.VR.REBUILD.1 — Authority-first twin reconstruction types.
 */

export const RECONSTRUCTION_STRATEGIES = ['PATCH_EXISTING', 'RECOMPOSE_EXISTING', 'REBUILD_FROM_AUTHORITY'] as const;
export type ReconstructionStrategy = (typeof RECONSTRUCTION_STRATEGIES)[number];

export const VISUAL_AUTHORITY_STATUSES = [
  'PENDING',
  'AUTHORITY_FIRST_BUILT',
  'FAILED_VISUAL_AUTHORITY',
  'VISUAL_AUTHORITY_FAILED',
  'ACCEPTED',
] as const;
export type VisualAuthorityStatus = (typeof VISUAL_AUTHORITY_STATUSES)[number];

export type AuthorityRegionBlueprint = {
  regionId: string;
  regionType: string;
  regionName: string;
  order: number;
  hierarchyLevel: number;
  layoutMode: 'STACK' | 'GRID' | 'RAIL' | 'PERSISTENT';
  bounds: { y: number; height: number };
  assetSlots: string[];
  contentSlots: string[];
  interactionSlots: string[];
  visualTokens: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type AuthorityCompositionBlueprint = {
  blueprintId: string;
  pageId: string;
  viewport: string;
  authorityVersionId: string;
  canvas: { width: number; height: number };
  regions: AuthorityRegionBlueprint[];
  regionOrder: string[];
  globalGrid: string;
  gutterProfile: string;
  verticalRhythm: string;
  typographyHierarchy: string[];
  persistentControls: string[];
  assetSlots: string[];
  interactionSlots: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'READY' | 'PARTIAL' | 'FAILED';
};

export type FunctionalBinding = {
  bindingId: string;
  sourceFunctionId: string;
  sourceDataPath: string;
  targetRegionId: string;
  targetSlotId: string;
  bindingType: 'DATA' | 'ACTION' | 'NAVIGATION' | 'FORM' | 'STATE' | 'AUTH' | 'PERMISSION' | 'FEATURE_FLAG' | 'DISPLAY_VALUE';
  preservationRequirements: string[];
  status: 'READY' | 'PARTIAL' | 'MISSING';
};

export type FunctionalTransplantPlan = {
  planId: string;
  sessionId: string;
  bindings: FunctionalBinding[];
  status: 'READY' | 'PARTIAL' | 'FAILED';
};

export type CurrentPageFunctionalInventory = {
  inventoryId: string;
  routes: string[];
  actions: string[];
  dataQueries: string[];
  mutations: string[];
  forms: string[];
  links: string[];
  navigation: string[];
  state: string[];
  permissions: string[];
  featureFlags: string[];
};

export type CompositionDivergenceScore = {
  score: number;
  regionCountDelta: number;
  orderMismatch: number;
  hierarchyMismatch: number;
  layoutModeMismatch: number;
  persistentControlMismatch: number;
  dominantRegionMismatch: boolean;
  status: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type TwinCompositionVersion = {
  versionId: string;
  sessionId: string;
  strategy: ReconstructionStrategy;
  blueprintVersionId: string;
  functionalTransplantPlanId: string;
  buildRef: string;
  createdAt: string;
  status: 'DRAFT' | 'READY' | 'FAILED';
};

export type AuthorityCompositionCoverage = {
  authorityMajorRegions: number;
  twinMajorRegions: number;
  matchedRegions: number;
  missingRegions: string[];
  extraLegacyRegions: string[];
  orderMatch: boolean;
  hierarchyMatch: boolean;
  status: 'PASS' | 'WARN' | 'FAIL';
  flags: string[];
};

export type LegacyStructureRetentionCheck = {
  legacyStackDetected: boolean;
  legacyDominates: boolean;
  retainedLegacyRegionIds: string[];
  status: 'PASS' | 'LEGACY_COMPOSITION_RETAINED' | 'FAILED_AUTHORITY_RECONSTRUCTION';
};

export type FidelityScoreProvenance = {
  dimension: string;
  before: number | null;
  after: number | null;
  source: string;
  evidenceCount: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  status: 'MEASURED' | 'INFERRED' | 'UNKNOWN' | 'NOT_COMPARED';
};

export type VisualAuthorityAcceptanceGate = {
  compositionCoverage: AuthorityCompositionCoverage;
  legacyCheck: LegacyStructureRetentionCheck;
  functionQaPass: boolean;
  founderApproved: boolean;
  promotionAllowed: boolean;
  blockingReasons: string[];
};

export const TWIN_RENDER_MODES = ['LEGACY_PATCH', 'AUTHORITY_FIRST_NDX_OVERVIEW'] as const;
export type TwinRenderMode = (typeof TWIN_RENDER_MODES)[number];
