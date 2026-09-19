/**
 * P0.CJ.1 — Creative Judgment Intelligence + maturity program types.
 */

import type { BrandLanguageIdentity } from '../brand-language/types.js';
import type { CreativeJudgmentFailureClass, FounderJudgmentLabel } from './failureClasses.js';

export const CREATIVE_JUDGMENT_DECISIONS = ['ADVANCE', 'REVISE', 'KILL', 'ESCALATE_TO_FOUNDER'] as const;
export type CreativeJudgmentDecision = (typeof CREATIVE_JUDGMENT_DECISIONS)[number];

export const JUDGMENT_MEMORY_SCOPES = [
  'GLOBAL_FOUNDER',
  'BRAND_SPECIFIC',
  'PROJECT_SPECIFIC',
  'CAMPAIGN_SPECIFIC',
] as const;
export type JudgmentMemoryScope = (typeof JUDGMENT_MEMORY_SCOPES)[number];

export const TERRITORY_DISTINCTIVENESS_OUTCOMES = [
  'DISTINCT',
  'COUSINS',
  'DUPLICATE',
  'NEEDS_REGENERATION',
] as const;
export type TerritoryDistinctivenessOutcome = (typeof TERRITORY_DISTINCTIVENESS_OUTCOMES)[number];

export const CONCEPT_PROOF_STATUSES = ['PROVEN', 'WEAK', 'MISSING'] as const;
export type ConceptProofStatus = (typeof CONCEPT_PROOF_STATUSES)[number];

export const REASONING_MODES = ['DETERMINISTIC', 'HYBRID', 'FULL_REASONING'] as const;
export type CreativeReasoningMode = (typeof REASONING_MODES)[number];

export type ConceptMechanismProof = {
  tension: string;
  humanTruth: string;
  contradiction: string;
  mechanism: string;
  obviousAnswer: string;
  nonObviousAnswer: string;
  brandSpecificityReason: string;
  evidenceLogic: string;
  conceptCompression: string;
  proofStatus: ConceptProofStatus;
  whyNotTwentyOtherCampaigns: string | null;
};

export type BrandExpressionFingerprint = {
  brandId: string;
  syntax: string;
  sentenceLength: string;
  humorStyle: string;
  abstractionTolerance: string;
  visualDensity: string;
  emotionalTemperature: string;
  culturalPosture: string;
  metaphorPreference: string;
  pacing: string;
  directness: string;
  wit: string;
  polarizationTolerance: string;
  rawness: string;
  specificity: string;
  tabooLanguage: string[];
  forbiddenCliches: string[];
  favoredMaterials: string[];
  imageGrammar: string;
  compositionBehavior: string;
  motionBehavior: string;
  interjectionBehavior: string;
  copyRhythm: string;
  whatTheBrandWouldNeverDo: string[];
  sourceIdentity: BrandLanguageIdentity | null;
};

export type ChannelRoleEntry = {
  channelId: string;
  format: string;
  role: string;
  narrativeJob: string;
  mustNotDuplicate: string[];
};

export type ChannelRoleMap = {
  campaignId: string;
  entries: ChannelRoleEntry[];
  resizeOnlyRisk: boolean;
  allRolesDistinct: boolean;
};

export type CampaignSequenceStage = {
  stage: string;
  present: boolean;
  channelIds: string[];
};

export type CampaignSequenceIntelligence = {
  campaignId: string;
  stages: CampaignSequenceStage[];
  coherentSequence: boolean;
  missingStages: string[];
};

export type TerritoryCandidate = {
  territoryId: string;
  conceptName: string;
  oneSentenceIdea: string;
  mechanism: string;
  emotionalArc: string;
  visualWorld: string;
  argument: string;
  channelTreatmentHash: string;
};

export type TerritoryDistinctivenessResult = {
  outcome: TerritoryDistinctivenessOutcome;
  cousinPairs: Array<{ a: string; b: string; reason: string }>;
  duplicateGroups: string[][];
  recommendation: string;
};

export type BrandSwapTestResult = {
  passed: boolean;
  swappableBrands: string[];
  failureClass: 'BRAND_GENERICITY' | null;
  rationale: string;
};

export type CrossBrandLeakResult = {
  leaked: boolean;
  leakTypes: string[];
  failureClass: 'NDX_LEAK' | null;
  evidence: string[];
};

export type ProductionUsefulnessScore = {
  score: number;
  specifiesWorld: boolean;
  specifiesRoles: boolean;
  specifiesArtifact: boolean;
  specifiesSequence: boolean;
  specifiesChannelJobs: boolean;
  overSpecifiedEarly: boolean;
  rationale: string;
};

export type CreativeJudgmentScores = {
  overallScore: number;
  brandFidelityScore: number;
  mechanismScore: number;
  originalityScore: number;
  channelDifferentiationScore: number;
  worldBuildingScore: number;
  copyAuthenticityScore: number;
  productionUsefulnessScore: number;
  selfCritiqueAccuracyScore: number;
};

export type CreativeJudgmentResult = {
  judgmentId: string;
  projectId: string;
  brandId: string;
  entryId: string | null;
  campaignId: string;
  territoryId: string;
  overallScore: number;
  decision: CreativeJudgmentDecision;
  strengths: string[];
  weaknesses: string[];
  failureClasses: CreativeJudgmentFailureClass[];
  revisionDirectives: string[];
  brandFidelityScore: number;
  mechanismScore: number;
  originalityScore: number;
  channelDifferentiationScore: number;
  worldBuildingScore: number;
  copyAuthenticityScore: number;
  productionUsefulnessScore: number;
  selfCritiqueAccuracyScore: number;
  requiresFounderReview: boolean;
  confidence: number;
  conceptProof: ConceptMechanismProof;
  channelRoleMap: ChannelRoleMap | null;
  sequenceIntelligence: CampaignSequenceIntelligence | null;
  brandSwapTest: BrandSwapTestResult | null;
  crossBrandLeak: CrossBrandLeakResult | null;
  productionUsefulness: ProductionUsefulnessScore;
  territoryRanking: TerritoryRanking | null;
  engineVersion: string;
  reasoningMode: CreativeReasoningMode;
  createdAt: string;
};

export type TerritoryRanking = {
  strongestTerritoryId: string;
  safestTerritoryId: string;
  mostObviousTerritoryId: string;
  mostBrandSpecificTerritoryId: string;
  mostRiskyTerritoryId: string;
  killFirstTerritoryId: string;
  reasons: Record<string, string>;
};

export type CreativeJudgmentInput = {
  projectId: string;
  brandId: string;
  entryId?: string | null;
  campaignId: string;
  territory: TerritoryCandidate;
  territories?: TerritoryCandidate[];
  channelRoleMap?: ChannelRoleMap;
  brandFingerprint?: BrandExpressionFingerprint;
  copySamples?: string[];
  interjection?: string | null;
  ndxRole?: string | null;
  subjectRole?: string | null;
  worldRole?: string | null;
  artifactRole?: string | null;
  reasoningMode?: CreativeReasoningMode;
  priorBrandId?: string | null;
};

/** P0.CJ.1 structured founder creative judgment (distinct from entry-level FounderJudgmentRecord in types.ts). */
export type CreativeFounderJudgmentRecord = {
  judgmentId: string;
  projectId: string;
  brandId: string;
  entryId: string | null;
  territoryId: string | null;
  artifactId: string | null;
  decision: FounderJudgmentLabel;
  reasonCodes: CreativeJudgmentFailureClass[];
  founderNote: string | null;
  beforeVersion: string | null;
  afterVersion: string | null;
  revisionRequested: boolean;
  revisionSummary: string | null;
  finalOutcome: string | null;
  didLaterEarnApproval: boolean | null;
  scope: JudgmentMemoryScope;
  createdAt: string;
  mutatesCanon: false;
};

export type ApprovalTrajectoryStep = {
  step: string;
  decision: FounderJudgmentLabel | CreativeJudgmentDecision;
  reasonCodes: string[];
  note: string | null;
  timestamp: string;
};

export type ApprovalTrajectory = {
  trajectoryId: string;
  projectId: string;
  brandId: string;
  entryId: string | null;
  territoryId: string;
  steps: ApprovalTrajectoryStep[];
  finalApproved: boolean;
  transformationSummary: string | null;
};

export type SelfRevisionPass = {
  passNumber: number;
  failureClasses: CreativeJudgmentFailureClass[];
  revisionTarget: string;
  beforeScore: number;
  afterScore: number;
  stoppedReason: string | null;
};

export type CreativeSelfRevisionResult = {
  revisionId: string;
  passes: SelfRevisionPass[];
  finalJudgment: CreativeJudgmentResult;
  stopped: boolean;
  stopReason: string | null;
};

export type BenchmarkBrief = {
  briefId: string;
  category: string;
  brandId: string;
  projectId: string;
  title: string;
  objective: string;
  constraints: string[];
};

export type BenchmarkRubricScores = {
  conceptualDepth: number;
  mechanismOriginality: number;
  brandSpecificity: number;
  channelDifferentiation: number;
  worldBuilding: number;
  copyAuthenticity: number;
  productionUsefulness: number;
  selfCritiqueAccuracy: number;
  territoryDistinctiveness: number;
  founderApprovalRate: number;
};

export type BenchmarkRunResult = {
  runId: string;
  briefId: string;
  judgment: CreativeJudgmentResult;
  rubric: BenchmarkRubricScores;
  founderRescueRequired: boolean;
  benchmarkVersion: string;
  engineVersion: string;
  reasoningMode: CreativeReasoningMode;
  createdAt: string;
};

export type ExpressionEngineMaturityScore = {
  maturityId: string;
  engineVersion: string;
  benchmarkVersion: string;
  reasoningMode: CreativeReasoningMode;
  sampleSize: number;
  conceptualReasoningMedian: number;
  packageArchitectureMedian: number;
  brandFidelityMedian: number;
  autonomousJudgmentMedian: number;
  genericFailureRate: number;
  resizeOnlyFailureRate: number;
  brandSwapFailureRate: number;
  crossBrandLeakRate: number;
  founderRescueRate: number;
  selfCritiqueAccuracy: number;
  operational100Eligible: boolean;
  variance: number;
  computedAt: string;
};

export type FounderRescueRate = {
  period: string;
  totalRuns: number;
  rescueRuns: number;
  ratePercent: number;
  rescueReasons: string[];
};

export type SelfCritiqueAccuracy = {
  period: string;
  comparedJudgments: number;
  alignedFailures: number;
  accuracyPercent: number;
  missedByEngine: CreativeJudgmentFailureClass[];
  falsePositives: CreativeJudgmentFailureClass[];
};

export type CreativeBlindComparison = {
  comparisonId: string;
  briefId: string;
  engineA: { mode: CreativeReasoningMode; judgment: CreativeJudgmentResult };
  engineB: { mode: CreativeReasoningMode; judgment: CreativeJudgmentResult };
  founderPreferred: 'A' | 'B' | 'NEITHER' | null;
  revealedAfterJudgment: boolean;
  createdAt: string;
};

export type CreativeReasoningEfficiency = {
  qualityScore: number;
  providerCost: number;
  latencyMs: number;
  founderApproval: boolean;
  rescueRequired: boolean;
  reasoningMode: CreativeReasoningMode;
};

export type MaturityThresholds = {
  conceptualReasoningMedianMin: number;
  genericFailureRateMax: number;
  channelDifferentiationMedianMin: number;
  resizeOnlyFailureRateMax: number;
  brandSpecificityMedianMin: number;
  brandSwapFailureRateMax: number;
  crossBrandLeakRateMax: number;
  founderAgreementMin: number;
  founderRescueRateMax: number;
};

export const DEFAULT_MATURITY_THRESHOLDS: MaturityThresholds = {
  conceptualReasoningMedianMin: 90,
  genericFailureRateMax: 0.05,
  channelDifferentiationMedianMin: 90,
  resizeOnlyFailureRateMax: 0.05,
  brandSpecificityMedianMin: 90,
  brandSwapFailureRateMax: 0.05,
  crossBrandLeakRateMax: 0.03,
  founderAgreementMin: 90,
  founderRescueRateMax: 0.1,
};

export type MaturityScoreHistoryEntry = {
  date: string;
  engineVersion: string;
  reasoningMode: CreativeReasoningMode;
  brandId: string | null;
  category: string | null;
  maturity: ExpressionEngineMaturityScore;
};

export type AdversarialTestCase = {
  testId: string;
  name: string;
  description: string;
  expectedFailureClasses: CreativeJudgmentFailureClass[];
};
