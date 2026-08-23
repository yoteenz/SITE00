/**
 * Six-direction blind creative consistency validation — shadow replay extension.
 */

import type { ReplayExecutionAccounting, ReplayHeroAsset } from './personalityReplayTypes.js';

export type SixDirectionConsistencyStatus =
  | 'NOT_STARTED'
  | 'FORMING_DIRECTIONS'
  | 'DISTINCTIVENESS_GATE'
  | 'GENERATING_DIRECTION'
  | 'SCORING'
  | 'COMPLETE'
  | 'FAILED';

export type SixDirectionFirstPassStatus =
  | 'PRESERVED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'STRONG'
  | 'WEAK'
  | 'FAILED'
  | 'NEEDS_HUMAN_REVIEW';

export type SixDirectionFounderJudgment = 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_NDXBOOK' | null;

export type SixDirectionDirectionSummary = {
  centralThesis: string;
  emotionalTerritory: string;
  visualPremise: string;
  personalityInterpretation: string;
  primarySocialBehavior: string;
};

export type PersonalityTranslationReceiptRow = {
  domain: string;
  upstreamEvidence: string;
  creativeTranslation: string;
};

export type SixDirectionContaminationAudit = {
  passed: boolean;
  benchmarkHeroExposed: boolean;
  priorHeroExposed: boolean;
  historicalPaletteExposed: boolean;
  historicalTypographyExposed: boolean;
  historicalPromptsExposed: boolean;
  hardcodedRescueLogic: boolean;
  violations: string[];
  auditedAt: string;
};

export type DirectionFormatSelectionRecord = {
  nativeFormat: string;
  nativeFormatReason: string;
  alternativeFormatsConsidered: string[];
  whyAlternativesWereWeaker: string;
  formatSelectionEvidence: string[];
  formatSelectionDerivedFromDirection: boolean;
  formatAssignmentContaminationTest?: {
    passed: boolean;
    notes: string[];
  } | null;
};

export type SixDirectionGenerationReceipt = {
  firstGenerationResult: 'SUCCESS' | 'TRANSPORT_FAILURE' | 'BLOCKED';
  firstGenerationPromptHash: string | null;
  firstGenerationModel: string;
  firstGenerationCostUsd: number;
  qaResult: string | null;
  failureReason: string | null;
  generatedAt: string | null;
};

export type SixDirectionQaScores = {
  identityNative: number | 'NEEDS_HUMAN_REVIEW';
  personalityTranslation: number | 'NEEDS_HUMAN_REVIEW';
  directionNative: number | 'NEEDS_HUMAN_REVIEW';
  formatNative: number | 'NEEDS_HUMAN_REVIEW';
  typographicAuthority: number | 'NEEDS_HUMAN_REVIEW';
  colorAuthority: number | 'NEEDS_HUMAN_REVIEW';
  compositionalArtistry: number | 'NEEDS_HUMAN_REVIEW';
  verbalPersonality: number | 'NEEDS_HUMAN_REVIEW';
  witIntelligence: number | 'NEEDS_HUMAN_REVIEW';
  secondReadDepth: number | 'NEEDS_HUMAN_REVIEW';
  visualSurprise: number | 'NEEDS_HUMAN_REVIEW';
  restraint: number | 'NEEDS_HUMAN_REVIEW';
  memorability: number | 'NEEDS_HUMAN_REVIEW';
  socialApplicability: number | 'NEEDS_HUMAN_REVIEW';
  systemExtensibility: number | 'NEEDS_HUMAN_REVIEW';
  stockResemblance: number | 'NEEDS_HUMAN_REVIEW';
  genericAiResemblance: number | 'NEEDS_HUMAN_REVIEW';
};

export type SixDirectionConsistencyDirection = {
  comparisonIndex: number;
  directionId: string;
  directionName: string;
  sourceFormationId: string;
  sourceFormationVersion: number;
  summary: SixDirectionDirectionSummary;
  nativeProofFormat: string;
  nativeFormatRationale: string;
  formatSelection: DirectionFormatSelectionRecord;
  scrollHookBehavior: string | null;
  repeatableContentSystem: string | null;
  typographyRationale: string | null;
  colorRationale: string | null;
  directionExpression: Record<string, unknown> | null;
  identityArtDirection: Record<string, unknown> | null;
  creativeExpression: Record<string, unknown> | null;
  heroConcept: Record<string, unknown> | null;
  heroBrief: Record<string, unknown> | null;
  heroAsset: ReplayHeroAsset | null;
  personalityTranslationReceipt: PersonalityTranslationReceiptRow[];
  contaminationAudit: SixDirectionContaminationAudit | null;
  generationReceipt: SixDirectionGenerationReceipt | null;
  firstPassStatus: SixDirectionFirstPassStatus;
  qaScores: SixDirectionQaScores | null;
  founderJudgment: SixDirectionFounderJudgment;
};

export type SixDirectionCrossDirectionTests = {
  sixStrangersTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  directionCollapseTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  styleCloningTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  personalityContinuityTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  formatRealityTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  templateTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  stockTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  secondReadTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  fiftyPostTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  notes: string[];
};

export type SixDirectionConsistencyVerdict = {
  strongFirstPassHeroes: number;
  weakFirstPassHeroes: number;
  failedFirstPassHeroes: number;
  hitRate: string;
  verdict:
    | 'CONSISTENCY_VALIDATED'
    | 'PROMISING_TARGETED_REFINEMENT'
    | 'INCONSISTENT_METHODOLOGY_REFINEMENT'
    | 'FAILED_NOT_REPEATABLE'
    | 'INCOMPLETE';
};

export type ComparisonScorerAuditReceipt = {
  auditedAt: string;
  canonicalPersonalityPopulated: boolean;
  shadowPersonalityPopulated: boolean;
  personalityScoreExplanation: string;
  creativeScoreExplanation: string;
  identityScoreExplanation: string;
  heroScoreExplanation: string;
  allDomainsDivergentExplanation: string;
  sonnetComparisonExecuted: boolean;
  bugFound: boolean;
  fixRecommended: string | null;
  recomputedPersonalityScore: number | null;
};

export type SixDirectionConsistencyRun = {
  status: SixDirectionConsistencyStatus;
  currentDirectionIndex: number | null;
  formationRecordV1: Record<string, unknown> | null;
  formationRecordV2: Record<string, unknown> | null;
  directions: SixDirectionConsistencyDirection[];
  distinctivenessGatePassed: boolean | null;
  distinctivenessNotes: string[];
  crossDirectionTests: SixDirectionCrossDirectionTests | null;
  consistencyVerdict: SixDirectionConsistencyVerdict | null;
  comparisonScorerAudit: ComparisonScorerAuditReceipt | null;
  observedFormatDiversity: {
    uniqueFormats: number;
    totalDirections: number;
    formatCounts: Record<string, number>;
    notes: string[];
  } | null;
  accounting: ReplayExecutionAccounting;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
};
