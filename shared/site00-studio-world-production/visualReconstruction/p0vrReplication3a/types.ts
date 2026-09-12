/**
 * P0.VR.REPLICATION.3A — Drift triangulation types.
 */

export const REPLICATION_FAILURE_LAYERS = [
  'IMPLEMENTATION',
  'ORCHESTRATION',
  'VISUAL_INTELLIGENCE',
  'EXECUTION_POLICY',
  'SOURCE_GENERATION',
  'ASSET_BINDING',
  'RENDERING',
  'UNKNOWN',
] as const;
export type ReplicationFailureLayer = (typeof REPLICATION_FAILURE_LAYERS)[number];

export const REPLICATION_DRIFT_STAGES = [
  'REFERENCE_INPUT',
  'VISUAL_DETECTION',
  'AUTHORITY_BLUEPRINT',
  'RECONSTRUCTION_DECISION',
  'SOURCE_GENERATION',
  'ASSET_BINDING',
  'BROWSER_RENDER',
  'VISUAL_COMPARE',
] as const;
export type ReplicationDriftStage = (typeof REPLICATION_DRIFT_STAGES)[number];

export type RegionReferenceSnapshot = {
  bounds: string;
  dominantSurfaces: string[];
  majorChildBlocks: string[];
  textBlockCount: number;
  imageBlockCount: number;
  accentColorRole: string;
  layoutDirection: string;
  majorRelationships: string[];
  assetPresence: string[];
  visualDensity: 'COMPACT' | 'MEDIUM' | 'EXPANSIVE';
};

export type DetectedRegionSnapshot = {
  summary: string;
  subregionCount: number;
  features: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  provider: string;
  model: string;
};

export type BlueprintRegionSnapshot = {
  bandId: string;
  geometry: string;
  buildMode: string;
  contentType: string;
  genericness: 'LITERAL' | 'MACRO' | 'GENERIC';
  subregionCount?: number;
};

export type ReconstructionDecisionSnapshot = {
  strategy: string;
  literalReplication: boolean;
  collapsedToGeneric: boolean;
  notes: string;
};

export type GeneratedSourceSnapshot = {
  component: string;
  selectorOrClass: string;
  elementSummary: string;
  subregionCount: number;
};

export type AssetBindingTrace = {
  slotId: string;
  authorityExpected: string;
  decision: string;
  selectedPath: string | null;
  loaded: boolean;
  cropStrategy: string;
  renderSuccess: boolean;
  failureLayer: ReplicationFailureLayer | null;
};

export type RenderedRegionSnapshot = {
  boundsApprox: string;
  computedStylesSummary: string;
  assetLoadState: string;
  textContentSummary: string;
  screenshotCropRef: string | null;
};

export type ReplicationDecisionTrace = {
  traceId: string;
  sessionId: string;
  pageId: string;
  viewport: string;
  regionId: string;
  referenceRegion: RegionReferenceSnapshot;
  detectedRegion: DetectedRegionSnapshot;
  blueprintRegion: BlueprintRegionSnapshot | null;
  decision: ReconstructionDecisionSnapshot;
  generatedSourceTarget: GeneratedSourceSnapshot;
  assetBindings: AssetBindingTrace[];
  renderedRegion: RenderedRegionSnapshot;
  driftStage: ReplicationDriftStage;
  failureLayer: ReplicationFailureLayer;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string[];
  createdAt: string;
};

export type RegionReplicationDiff = {
  regionId: string;
  referenceCrop: string | null;
  renderCrop: string | null;
  macroMatch: boolean;
  internalStructureMatch: boolean;
  assetMatch: boolean;
  surfaceMatch: boolean;
  typographyMatch: boolean;
  driftSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
  highestImpactDifference: string;
};

export type RegionLiteralReplicationScore = {
  regionId: string;
  referencePct: number;
  visualDetectionPct: number;
  blueprintPct: number;
  decisionPct: number;
  sourcePct: number;
  renderPct: number;
  firstLossStage: ReplicationDriftStage;
};

export type ReplicationImplementationReceipt = {
  expectedModule: string;
  actualModule: string;
  wired: boolean;
  calledAtRuntime: boolean;
  version: string;
  status: 'WIRED_EXECUTED' | 'WIRED_NOT_EXECUTED' | 'IMPLEMENTED_NOT_EXECUTED' | 'NOT_WIRED';
  notes: string;
};

export type RuntimeModuleTraceStep = {
  order: number;
  moduleId: string;
  label: string;
  executed: boolean;
  outputSummary: string;
};

export type VisualProviderAudit = {
  provider: string;
  model: string;
  inputDimensions: string;
  cropStrategy: string;
  instructionClass: string;
  outputSchema: string;
  latencyMs: number | null;
  errorOrFallback: string | null;
  confidence: string;
  calledInReplicationPath: boolean;
};

export type ReplicationPolicyAuditEntry = {
  ruleId: string;
  source: string;
  ruleText: string;
  effect: string;
  driftRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  activeAtRuntime: boolean;
  recommendation: string;
};

export type DriftStagePipelineStatus = 'PASS' | 'DRIFT' | 'FAIL';

export type RegionDriftPipelineView = {
  regionId: string;
  stages: { stage: ReplicationDriftStage; status: DriftStagePipelineStatus; summary: string }[];
  culpritLayer: ReplicationFailureLayer;
};

export const NEXT_REPLICATION_FIX_VALUES = [
  'WIRE_CORRECT_MODULE',
  'CHANGE_EXECUTION_POLICY',
  'UPGRADE_VISUAL_MODEL',
  'CHANGE_VISUAL_PROMPT',
  'ADD_LITERAL_REGION_TRACER',
  'FIX_SOURCE_GENERATOR',
  'FIX_ASSET_BINDING',
  'FIX_RENDERER',
  'MULTI_LAYER_FIX',
] as const;
export type NextReplicationFix = (typeof NEXT_REPLICATION_FIX_VALUES)[number];

export type CulpritRankingEntry = {
  layer: ReplicationFailureLayer;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceCount: number;
  affectedRegions: string[];
};

export type DriftTriangulationReport = {
  reportId: string;
  sessionId: string;
  pageId: string;
  viewport: string;
  authorityVersionId: string;
  twinRenderMode: string;
  buildRef: string;
  traces: ReplicationDecisionTrace[];
  regionDiffs: RegionReplicationDiff[];
  literalScores: RegionLiteralReplicationScore[];
  implementationReceipts: ReplicationImplementationReceipt[];
  runtimeModuleTrace: RuntimeModuleTraceStep[];
  visualProviderAudit: VisualProviderAudit;
  policyAudit: ReplicationPolicyAuditEntry[];
  regionPipelineViews: RegionDriftPipelineView[];
  culpritRanking: CulpritRankingEntry[];
  primaryRootCause: ReplicationFailureLayer;
  secondaryRootCause: ReplicationFailureLayer | null;
  nextReplicationFix: NextReplicationFix;
  promotionReady: false;
  hotfixApplied: boolean;
  hotfixNotes: string | null;
  createdAt: string;
};
