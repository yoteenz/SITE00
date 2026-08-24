/**
 * Studio World Visual Reconstruction Engine — core types (P0.VR.1).
 * Generic; no NDXBOOK assumptions.
 */

export type VisualReconstructionMode = 'REPRODUCE' | 'TRANSLATE' | 'EXTRACT' | 'MERGE' | 'AUDIT';

export type PageState =
  | 'DEFAULT'
  | 'HOVER'
  | 'FOCUS'
  | 'MENU_OPEN'
  | 'MODAL_OPEN'
  | 'SCROLLED'
  | 'SELECTED'
  | 'EMPTY'
  | 'LOADING';

export type CopyMatchMode = 'EXACT_REFERENCE_COPY' | 'CANONICAL_REPOSITORY_COPY' | 'VISUAL_PLACEHOLDER_COPY';

export type DeviceClass = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export type VisualRegionRole =
  | 'GLOBAL_SHELL'
  | 'HEADER'
  | 'OWNER_CONTROL'
  | 'PROJECT_CONTEXT'
  | 'LOCAL_NAV'
  | 'HERO'
  | 'METHOD_STAGE'
  | 'EXPERIMENT_GROUP'
  | 'EXPERIMENT_CARD'
  | 'CURRENT_STAGE'
  | 'SECONDARY_NAV'
  | 'BOTTOM_NAV'
  | 'BACKGROUND_FIELD'
  | 'DECORATIVE_OBJECT'
  | 'IMAGE'
  | 'TEXT_BLOCK';

export type RepositoryMatchClassification =
  | 'EXISTING_CANONICAL_COMPONENT'
  | 'EXISTING_REUSABLE_COMPONENT'
  | 'EXISTING_REPO_ASSET'
  | 'CSS_RECONSTRUCTABLE'
  | 'REFERENCE_IMAGE_REQUIRED'
  | 'NEW_COMPONENT_REQUIRED'
  | 'UNKNOWN';

export type ReferenceAssetAuthority =
  | 'EXACT_EXISTING_ASSET'
  | 'LIKELY_EXISTING_ASSET'
  | 'STRUCTURAL_COMPONENT'
  | 'REFERENCE_ONLY'
  | 'MISSING_REQUIRED_ASSET';

export type RegionLockState = 'UNRESOLVED' | 'MATCHING' | 'LOCKED' | 'INVALIDATED';

export type MismatchKind =
  | 'GEOMETRY'
  | 'TYPOGRAPHY'
  | 'SURFACE'
  | 'ASSET'
  | 'COLOR'
  | 'CROP'
  | 'MISSING_ELEMENT'
  | 'EXTRA_ELEMENT'
  | 'OVERFLOW'
  | 'FIXED_POSITION'
  | 'UNKNOWN';

export type CorrectionScope = 'TOKEN' | 'ELEMENT' | 'REGION' | 'PARENT_LAYOUT' | 'PAGE';

export type ReconstructionPass = 'GEOMETRY' | 'TYPOGRAPHY' | 'SURFACE' | 'ASSET' | 'MICRO_ALIGNMENT';

export type ConvergenceTrend = 'improving' | 'plateau' | 'regression' | 'oscillation';

export type Bounds = { x: number; y: number; width: number; height: number };

export type NormalizedBounds = { x: number; y: number; width: number; height: number };

export type NormalizedVisualReference = {
  referenceId: string;
  sourceAsset: string;
  pixelWidth: number;
  pixelHeight: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape' | 'square';
  detectedDeviceClass: DeviceClass;
  estimatedViewportWidth: number;
  estimatedViewportHeight: number;
  browserChromePresent: boolean;
  browserChromeBounds: Bounds | null;
  usablePageBounds: Bounds;
  croppingState: 'none' | 'chrome-excluded' | 'manual';
  scrollPositionConfidence: number;
  referenceAuthority: 'PRIMARY' | 'SECONDARY';
  sourceFingerprint: string;
  ingestedAt: string;
};

export type VisualReferenceRegion = {
  regionId: string;
  parentRegionId: string | null;
  bounds: Bounds;
  normalizedBounds: NormalizedBounds;
  zOrder: number;
  visualRole: VisualRegionRole;
  contentRole: string;
  alignmentRelationships: string[];
  spacingRelationships: string[];
  colorEstimate: string | null;
  surfaceEstimate: string | null;
  typographyEstimate: string | null;
  confidence: number;
};

export type VisualMeasurement = {
  measurementId: string;
  referenceRegionId: string | null;
  property:
    | 'x'
    | 'y'
    | 'width'
    | 'height'
    | 'padding'
    | 'margin'
    | 'gap'
    | 'alignment'
    | 'radius'
    | 'borderWidth'
    | 'color'
    | 'opacity'
    | 'shadow'
    | 'fontSize'
    | 'lineHeight'
    | 'letterSpacing'
    | 'fontWeight'
    | 'textAlign'
    | 'imageCrop'
    | 'aspectRatio';
  measuredValue: number | string;
  relationship: string | null;
  confidence: number;
  measurementMethod: 'heuristic' | 'computed' | 'manual';
};

export type VisualReconstructionBlueprint = {
  blueprintId: string;
  referenceId: string;
  targetRoute: string;
  viewport: { width: number; height: number; deviceScaleFactor: number };
  globalGeometry: VisualMeasurement[];
  layoutRegions: VisualReferenceRegion[];
  typography: VisualMeasurement[];
  surfaces: VisualMeasurement[];
  imagery: Array<{ regionId: string; classification: ReferenceAssetAuthority }>;
  navigation: Array<{ regionId: string; componentMatch: RepositoryMatchClassification }>;
  fixedElements: string[];
  scrollBehavior: 'viewport' | 'full-page';
  responsiveInferences: ResponsiveInferenceEvaluation;
  assetMatches: RepositoryVisualAssetMatch[];
  componentMatches: RepositoryComponentMatch[];
  unknownElements: string[];
  confidenceMap: Record<string, number>;
  copyMatchMode: CopyMatchMode;
  mode: VisualReconstructionMode;
  pageState: PageState;
  createdAt: string;
};

export type RepositoryVisualAssetMatch = {
  regionId: string;
  classification: ReferenceAssetAuthority;
  assetPath: string | null;
  confidence: number;
};

export type RepositoryComponentMatch = {
  regionId: string;
  classification: RepositoryMatchClassification;
  componentId: string | null;
  confidence: number;
};

export type TypographyReferenceEvaluation = {
  regionId: string;
  fontFamily: string | null;
  fontSource: 'repository' | 'reference' | 'unknown';
  fontSize: number | null;
  fontWeight: number | null;
  lineHeight: number | null;
  letterSpacing: number | null;
  caseBehavior: 'upper' | 'lower' | 'mixed' | 'unknown';
  textWidth: number | null;
  wrapPoints: number;
  alignment: string | null;
  exactWrapRequired: boolean;
  confidence: number;
};

export type RenderedReferenceSnapshot = {
  renderId: string;
  route: string;
  viewport: { width: number; height: number; deviceScaleFactor: number };
  timestamp: string;
  commit: string | null;
  screenshotPath: string;
  reconstructionIteration: number;
  blueprintVersion: string;
};

export type RegionMatchScore = {
  regionId: string;
  visualRole: VisualRegionRole;
  pixelDifference: number;
  structuralSimilarity: number;
  edgeSimilarity: number;
  colorDifference: number;
  textBoundsDifference: number;
  layoutDifference: number;
  passed: boolean;
  highAuthority: boolean;
};

export type RenderedReferenceComparison = {
  comparisonId: string;
  referenceId: string;
  renderId: string;
  pixelDifference: number;
  structuralSimilarity: number;
  edgeSimilarity: number;
  regionOverlap: number;
  colorDifference: number;
  textBoundsDifference: number;
  layoutDifference: number;
  regionScores: RegionMatchScore[];
  mismatches: Array<{ regionId: string; kind: MismatchKind; severity: number; detail: string }>;
  heatmapPath: string | null;
  comparedAt: string;
};

export type VisualDifferenceHeatmap = {
  heatmapId: string;
  comparisonId: string;
  width: number;
  height: number;
  outputPath: string;
  mismatchPixels: number;
  totalPixels: number;
  mismatchRatio: number;
  hotspots: Array<{ x: number; y: number; intensity: number; kind: MismatchKind }>;
};

export type VisualRegionLock = {
  regionId: string;
  state: RegionLockState;
  lockedAtIteration: number | null;
  matchScoreAtLock: number | null;
  invalidatedReason: string | null;
  passLockedAt: ReconstructionPass | null;
};

export type VisualCorrection = {
  regionId: string;
  scope: CorrectionScope;
  property: string;
  delta: number | string;
  reason: string;
};

export type VisualCorrectionPlan = {
  planId: string;
  iteration: number;
  pass: ReconstructionPass;
  corrections: VisualCorrection[];
  skippedLockedRegions: string[];
  generatedAt: string;
};

export type ReferenceMatchReadinessEvaluation = {
  ready: boolean;
  blockedReason: string | null;
  macroGeometry: boolean;
  regionGeometry: boolean;
  typography: boolean;
  lineWrapping: boolean;
  surfaceMatch: boolean;
  assetBounds: boolean;
  imageCrop: boolean;
  colorMatch: boolean;
  fixedElements: boolean;
  overallSimilarity: number;
  unresolvedRegions: string[];
  failedHighAuthorityRegions: string[];
};

export type ResponsiveInferenceEvaluation = {
  confidence: number;
  mobileAuthoritative: boolean;
  desktopInferred: boolean;
  tabletInferred: boolean;
  notes: string[];
};

export type ReferenceVisualRegressionBaseline = {
  baselineId: string;
  referenceId: string;
  targetRoute: string;
  viewport: { width: number; height: number };
  approvedAt: string;
  approvedRenderPath: string;
  regionLocks: VisualRegionLock[];
  readinessSnapshot: ReferenceMatchReadinessEvaluation;
};

export type VisualReconstructionReport = {
  reportId: string;
  reference: NormalizedVisualReference;
  targetRoute: string;
  viewport: { width: number; height: number; deviceScaleFactor: number };
  mode: VisualReconstructionMode;
  iterations: number;
  regions: VisualReferenceRegion[];
  lockedRegions: VisualRegionLock[];
  unresolvedRegions: string[];
  overallScore: number;
  geometryScore: number;
  typographyScore: number;
  assetScore: number;
  surfaceScore: number;
  knownLimitations: string[];
  responsiveInference: ResponsiveInferenceEvaluation;
  finalScreenshotPath: string | null;
  heatmapPath: string | null;
  repositoryAssetsReused: string[];
  newComponentsCreated: string[];
  convergenceTrend: ConvergenceTrend;
  manualFounderCorrections: number;
  completedAt: string;
};

export type VisualReferenceSet = {
  setId: string;
  primaryReferenceId: string;
  references: NormalizedVisualReference[];
  pageStates: PageState[];
};

export type ReconstructionLoopConfig = {
  maxIterations: number;
  passes: ReconstructionPass[];
  geometryTolerancePx: number;
  alignmentTolerancePx: number;
  regionPassThreshold: number;
  overallPassThreshold: number;
  copyMatchMode: CopyMatchMode;
};

export type ReconstructionLoopResult =
  | { status: 'REFERENCE_MATCH_READY'; report: VisualReconstructionReport }
  | { status: 'REFERENCE_MATCH_BLOCKED'; report: VisualReconstructionReport; blocker: string };
