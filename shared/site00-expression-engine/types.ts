/**
 * Expression Engine V0 — shared types (Studio World production infrastructure).
 */

import type { WorldExpressionSystem } from '../site00-brand-lore/conceptTerritory/conceptTerritoryTypes.js';
import type {
  AUDIO_LAYER_TYPES,
  CONTINUITY_NODE_KINDS,
  ENTRY_FORMATS,
  ENTRY_STATUSES,
  LINEAGE_TRACKING_STATES,
  PLATFORM_TARGETS,
  PRODUCTION_TASK_CLASSES,
  TRANSLATION_MODES,
} from './constants.js';

export type EntryFormat = (typeof ENTRY_FORMATS)[number];
export type ProductionTaskClass = (typeof PRODUCTION_TASK_CLASSES)[number];
export type AudioLayerType = (typeof AUDIO_LAYER_TYPES)[number];
export type ContinuityNodeKind = (typeof CONTINUITY_NODE_KINDS)[number];
export type PlatformTarget = (typeof PLATFORM_TARGETS)[number];
export type TranslationMode = (typeof TRANSLATION_MODES)[number];
export type EntryStatus = (typeof ENTRY_STATUSES)[number];
export type LineageTrackingState = (typeof LINEAGE_TRACKING_STATES)[number];

export type FounderJudgmentState =
  | 'UNREVIEWED'
  | 'LOVE_IT'
  | 'PROMISING_REFINE'
  | 'NOT_FOR_ME';

export type CreativeObjective = {
  objectiveId: string;
  brandId: string;
  projectId: string;
  title: string;
  thesis: string;
  subject: string;
  audienceFrame: string;
  createdAt: string;
};

export type FormatExpression = {
  format: EntryFormat;
  role: string;
  behavior: string;
  narrativePurpose: string;
  assetRequirements: string[];
  motionRequirements: string[];
  audioRequirements: string[];
  textDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  continuityRequirements: string[];
  qaRules: string[];
  audioRequired: boolean;
  status: 'PLANNED' | 'IN_PRODUCTION' | 'QA_PASS' | 'QA_FAIL' | 'COMPLETE';
};

export type EntryArtifact = {
  artifactId: string;
  entryId: string;
  type: string;
  symbolicRole: string;
  visualBrief: string;
  continuityRole: string;
  formatUsage: EntryFormat[];
  entrySpecific: true;
};

export type AudioPlanLayer = {
  layerId: string;
  type: AudioLayerType;
  purpose: string;
  timingRelationship: string;
  generatorClass: ProductionTaskClass;
  sourceState: 'GENERATED' | 'SOURCED' | 'LEGACY_UNTRACKED';
  continuityRequirement: string;
  mixPriority: number;
};

export type AudioPlan = {
  planId: string;
  entryId: string;
  layers: AudioPlanLayer[];
  requiredForFormats: EntryFormat[];
  status: 'DRAFT' | 'COMPLETE' | 'LEGACY_PARTIAL';
};

export type ProductionPlanTask = {
  taskId: string;
  format: EntryFormat;
  taskClass: ProductionTaskClass;
  description: string;
  why: string;
  continuityRefs: string[];
  authoritativeReferences: string[];
  exactText: string[];
  variableElements: string[];
  recommendedProviders: string[];
  status: 'PLANNED' | 'DISPATCHED' | 'COMPLETE' | 'BLOCKED';
};

export type ExpressionProductionPlan = {
  planId: string;
  entryId: string;
  tasks: ProductionPlanTask[];
  status: 'DRAFT' | 'COMPILED' | 'IN_PRODUCTION' | 'COMPLETE';
  compiledAt: string | null;
};

export type ContinuityGraphNode = {
  nodeId: string;
  kind: ContinuityNodeKind;
  label: string;
  description: string;
  formatRefs: EntryFormat[];
  authoritative: boolean;
};

export type ContinuityGraphEdge = {
  fromNodeId: string;
  toNodeId: string;
  relationship: string;
};

export type ContinuityGraph = {
  graphId: string;
  entryId: string;
  nodes: ContinuityGraphNode[];
  edges: ContinuityGraphEdge[];
};

export type PlatformTranslation = {
  translationId: string;
  entryId: string;
  platform: PlatformTarget;
  sourceFormat: EntryFormat;
  targetBehavior: string;
  mode: TranslationMode;
  thesisPreserved: boolean;
  requirements: string[];
  status: 'REQUIRED' | 'PLANNED' | 'COMPLETE';
};

/** Native TikTok editorial plan — not a reel repost contract. */
export type TikTokTranslationPlan = {
  planId: string;
  entryId: string;
  adaptationDecision: 'REEDIT' | 'REFRAME' | 'REGENERATE';
  adaptationRationale: string;
  openingHook: string;
  pacing: string;
  runtimeTargetSec: { min: number; max: number };
  editStructure: string[];
  spokenReactionBehavior: string;
  culturalReceiptBehavior: string;
  commentResponsePotential: string;
  assetReuseVsReedit: { reuseFromReel: string[]; requiresReedit: string[] };
  captionBehavior: string;
  thesisPreserved: boolean;
  status: 'PLANNED' | 'PRODUCTION_READY';
};

/** X thread-native expression — DROP→JOKE→RECEIPT→QUESTION→SYNTHESIS→BREADCRUMB */
export type XThreadBeat = {
  beat: 'DROP' | 'JOKE' | 'RECEIPT' | 'QUESTION' | 'SYNTHESIS' | 'BREADCRUMB';
  copy: string;
  mediaBehavior: string;
};

export type XThreadExpression = {
  expressionId: string;
  entryId: string;
  thesis: string;
  beats: XThreadBeat[];
  status: 'PLANNED' | 'COMPLETE';
};

export type FounderJudgmentReadiness = {
  scope: 'ENTRY' | EntryFormat;
  scopeId: string;
  state: FounderJudgmentState;
  explicitRecord: boolean;
};

export type Entry002TerritoryCandidate = {
  territoryId: string;
  name: string;
  coreIdea: string;
  culturalMechanism: string;
  world: string;
  primaryArtifact: string;
  visualGrammar: string;
  whyFitsEntry002: string;
  differsFromEntry001: string;
  differsFromOtherTerritories: string[];
};

export type Entry002TerritoryBrief = {
  entryId: string;
  objective: CreativeObjective;
  candidates: Entry002TerritoryCandidate[];
  collapseGate: ConceptCollapseGateResult;
  status: 'AWAITING_TERRITORY_JUDGMENT';
  assetsGenerated: 0;
};

export type GenerationReceipt = {
  receiptId: string;
  projectId: string;
  brandId: string;
  entryId: string;
  format: EntryFormat;
  territoryId: string | null;
  worldId: string | null;
  parentAssetId: string | null;
  assetId: string;
  provider: string;
  model: string;
  promptLineage: string[];
  referenceLineage: string[];
  generatedAt: string;
  status: 'REGISTERED' | 'QA_PASS' | 'QA_FAIL' | 'ORPHAN';
  judgmentState: FounderJudgmentState;
  canonState: 'NON_CANON' | 'PRODUCTION_CANDIDATE' | 'CANON';
  trackingState: LineageTrackingState;
};

export type FounderJudgmentRecord = {
  judgmentId: string;
  scope: 'ENTRY' | 'FORMAT' | 'ASSET';
  scopeId: string;
  action: FounderJudgmentState;
  canonImpact: 'NON_CANON' | 'PRODUCTION_CANDIDATE';
  preserveHistory: boolean;
  crossBrandPortable: boolean;
  createdAt: string;
};

export type CreativeEntry = {
  id: string;
  projectId: string;
  brandId: string;
  entryNumber: number;
  title: string;
  subject: string;
  objectiveId: string;
  territoryId: string | null;
  worldExpressionId: string | null;
  status: EntryStatus;
  canonState: 'DRAFT' | 'PRODUCTION' | 'CANON_CANDIDATE' | 'CANON';
  formatExpressions: FormatExpression[];
  productionPlan: ExpressionProductionPlan | null;
  audioPlan: AudioPlan | null;
  continuityGraph: ContinuityGraph | null;
  platformTranslations: PlatformTranslation[];
  artifact: EntryArtifact | null;
  generationReceipts: GenerationReceipt[];
  founderJudgments: FounderJudgmentRecord[];
  assetIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type FormatNativeQAResult = {
  passed: boolean;
  format: EntryFormat;
  failures: string[];
  blocking: boolean;
};

export type ConceptCollapseGateResult = {
  passed: boolean;
  sharedParentCandidates: Array<{ label: string; conceptIds: string[] }>;
  blocking: boolean;
  notes: string[];
};

export type SequenceQAResult = {
  passed: boolean;
  cohesion: 'PASS' | 'WARN' | 'FAIL';
  sameness: 'PASS' | 'WARN' | 'FAIL';
  blocking: boolean;
  failures: string[];
  repairLoopsRemaining: number;
};

export type EntryReadinessResult = {
  ready: boolean;
  status: EntryStatus;
  blockers: string[];
  checks: Array<{ check: string; passed: boolean; detail?: string }>;
};

export type ExpressionEngineBrandContext = {
  brandId: string;
  projectId: string;
  projectKey: string;
  organizationId: string | null;
};

export type RouteProductionToolInput = {
  taskClass: ProductionTaskClass;
  format: EntryFormat;
  brandId: string;
  entryId: string;
};

export type RouteProductionToolResult = {
  taskClass: ProductionTaskClass;
  recommendedProviders: string[];
  allowedProviders: string[];
  autoDispatch: false;
};

export type ProductionRoutingRecommendation = {
  taskClass: ProductionTaskClass;
  format: EntryFormat;
  recommendedProvider: string;
  recommendedModel: string;
  why: string;
  inputAssets: string[];
  outputContract: string;
  textFidelityRequirement: 'EXACT_TITLE_THESIS' | 'CONTROLLED' | 'NONE';
  referenceFidelityRequirement: 'HIGH' | 'MEDIUM' | 'LOW';
  fallbackProvider: string;
  autoDispatch: false;
};

export type Entry002CreativeAnchorRecommendation = {
  format: EntryFormat;
  rationale: string;
  taskId: string;
  founderJudgmentRequired: true;
  productionDispatch: 'BLOCKED_PENDING_ANCHOR_APPROVAL';
};

export type Entry002ProductionBlueprint = {
  blueprintId: string;
  entryId: string;
  territoryId: string;
  territoryName: string;
  territoryLockStatus: 'TERRITORY_LOCKED';
  founderJudgment: 'LOVE_IT';
  worldExpressionSystem: WorldExpressionSystem;
  entryArtifact: EntryArtifact;
  continuityGraph: ContinuityGraph;
  formatExpressions: FormatExpression[];
  productionPlan: ExpressionProductionPlan;
  audioPlan: AudioPlan;
  platformTranslations: PlatformTranslation[];
  providerRouting: ProductionRoutingRecommendation[];
  creativeAnchorRecommendation: Entry002CreativeAnchorRecommendation;
  assetsGenerated: 0;
  status: 'BLUEPRINT_COMPILED';
  compiledAt: string;
};
