/**
 * Canonical six-direction creative range validation — Experiment B types.
 */

import type { ReplayExecutionAccounting, ReplayHeroAsset } from './personalityReplayTypes.js';
import type { DirectionFormatSelectionRecord } from './sixDirectionConsistencyTypes.js';
import type { CanonicalNdxbookDirectionName } from './canonicalCreativeRangeConstants.js';

export type CanonicalCreativeRangeStatus =
  | 'NOT_STARTED'
  | 'PREFLIGHT'
  | 'DNA_ENVELOPES'
  | 'GENERATING_DIRECTION'
  | 'AUDITING'
  | 'COMPLETE'
  | 'FAILED';

export type CanonicalRangeFounderJudgment = 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_NDXBOOK' | null;

export type DirectionProvenanceReport = {
  directionId: string;
  canonicalName: CanonicalNdxbookDirectionName;
  sourceRecord: string;
  sourceVersion: number;
  sourceFormationId: string;
  approvalState: string;
  coreDirectionAvailable: boolean;
  directionExpressionAvailable: boolean;
  creativeExpressionAvailable: boolean;
  identityArtDirectionAvailable: boolean;
  visualBriefAvailable: boolean;
  formatLineageAvailable: boolean;
  personalityLineageAvailable: boolean;
  missingLayers: string[];
};

export type DirectionDnaEnvelope = {
  directionId: string;
  canonicalName: CanonicalNdxbookDirectionName;
  comparisonIndex: number;
  centralThesis: string;
  creativePremise: string;
  personalityTranslation: string;
  emotionalTerritory: string;
  socialBehavior: string;
  contentBehavior: string;
  visualWorld: string;
  visualGrammar: string;
  compositionLogic: string;
  typographicAttitude: string;
  typographyRoleBehavior: string;
  typographySelectionSource: string;
  typographySelectionReason: string;
  typographyDerivedFromDirection: boolean;
  hostTypographyExcluded: true;
  palette: string;
  dominantColor: string;
  supportingColors: string;
  accentColors: string;
  colorHierarchy: string;
  colorBehavior: string;
  paletteSource: string;
  paletteReason: string;
  paletteDerivedFromDirection: boolean;
  materialLanguage: string;
  imageLanguage: string;
  annotationLanguage: string;
  motionLanguage: string;
  nativeFormat: string;
  nativeFormatBehavior: string;
  signatureDevices: string[];
  antiPatterns: string[];
  mustNotResemble: string[];
  personalityLineage: string[];
  formatLineage: string[];
  directionLineage: string[];
};

export type ConceptualDistinctivenessPairReport = {
  directionA: CanonicalNdxbookDirectionName;
  directionB: CanonicalNdxbookDirectionName;
  conceptualOverlap: number;
  legitimateSharedBrandDna: string;
  directionSpecificDifference: string;
  collapseSuspected: boolean;
  reason: string;
};

export type CrossDirectionGenerationContaminationTest = {
  passed: boolean;
  siblingHeroReferenced: boolean;
  siblingPromptReferenced: boolean;
  notes: string[];
};

export type CanonicalRangeGenerationReceipt = {
  firstGenerationResult: 'SUCCESS' | 'TRANSPORT_FAILURE' | 'BLOCKED' | 'SKIPPED_MISSING_LAYERS';
  creativeAttemptCount: number;
  firstGenerationPromptHash: string | null;
  firstGenerationModel: string;
  firstGenerationCostUsd: number;
  failureReason: string | null;
  generatedAt: string | null;
};

export type CanonicalCreativeRangeDirection = {
  comparisonIndex: number;
  directionId: string;
  canonicalName: CanonicalNdxbookDirectionName;
  sourceFormationId: string;
  sourceFormationVersion: number;
  provenance: DirectionProvenanceReport;
  dnaEnvelope: DirectionDnaEnvelope | null;
  formatSelection: DirectionFormatSelectionRecord | null;
  directionExpression: Record<string, unknown> | null;
  identityArtDirection: Record<string, unknown> | null;
  creativeExpression: Record<string, unknown> | null;
  heroConcept: Record<string, unknown> | null;
  heroBrief: Record<string, unknown> | null;
  heroAsset: ReplayHeroAsset | null;
  generationReceipt: CanonicalRangeGenerationReceipt | null;
  contaminationTest: CrossDirectionGenerationContaminationTest | null;
  firstPassStatus: 'PENDING' | 'IN_PROGRESS' | 'STRONG' | 'WEAK' | 'FAILED' | 'SKIPPED';
  founderJudgment: CanonicalRangeFounderJudgment;
};

export type VisualIdentityStrength = 'STRONG' | 'PARTIAL' | 'WEAK' | 'NOT_EVALUATED';

export type CanonicalCreativeRangeAudit = {
  creativeRange: VisualIdentityStrength;
  personalityContinuity: VisualIdentityStrength;
  typographicContinuity: VisualIdentityStrength;
  typographicRange: VisualIdentityStrength;
  colorContinuity: VisualIdentityStrength;
  colorRange: VisualIdentityStrength;
  socialNativeness: VisualIdentityStrength;
  formatReasoning: VisualIdentityStrength;
  visualCloning: VisualIdentityStrength;
  genericAiSignal: VisualIdentityStrength;
  stockTemplateSignal: VisualIdentityStrength;
  brandRecognition: VisualIdentityStrength;
  typographyIdentityStrength: VisualIdentityStrength;
  colorIdentityStrength: VisualIdentityStrength;
  crossDirectionBrandRecognition: VisualIdentityStrength;
  visualIdentityDnaLayerNeeded: boolean | 'not_evaluated';
  notes: string[];
};

export type CanonicalSixDirectionRosterTest = {
  passed: boolean;
  directionCount: number;
  uniqueCanonicalDirectionCount: number;
  shadowRosterUsed: boolean;
  nearMissNamesPresent: boolean;
  missingDirections: string[];
  duplicateDirections: string[];
  notes: string[];
};

export type CanonicalCreativeRangeRun = {
  experimentClassification: typeof import('./canonicalCreativeRangeConstants.js').CANONICAL_CREATIVE_RANGE_EXPERIMENT;
  runId: string;
  organizationId: string;
  projectId: string;
  status: CanonicalCreativeRangeStatus;
  currentDirectionIndex: number | null;
  rosterTest: CanonicalSixDirectionRosterTest | null;
  provenanceReports: DirectionProvenanceReport[];
  distinctivenessPairs: ConceptualDistinctivenessPairReport[];
  directions: CanonicalCreativeRangeDirection[];
  observedFormatDiversity: {
    uniqueFormats: number;
    formatCounts: Record<string, number>;
    notes: string[];
  } | null;
  audit: CanonicalCreativeRangeAudit | null;
  accounting: ReplayExecutionAccounting;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
};

export type CanonicalRangeGenerationPreflight = {
  canonicalRangeGenerationReady: boolean;
  experimentClassification: typeof import('./canonicalCreativeRangeConstants.js').CANONICAL_CREATIVE_RANGE_EXPERIMENT;
  directions: Array<{ comparisonIndex: number; canonicalName: CanonicalNdxbookDirectionName }>;
  canonicalDirectionCount: number;
  uniqueDirectionCount: number;
  shadowRosterUsed: false;
  nearMissNamesPresent: boolean;
  crossDirectionIsolation: boolean;
  hostTypographyExcluded: boolean;
  formatSelectionDerivedPerDirection: boolean;
  paletteDerivedPerDirection: boolean;
  typographyDerivedPerDirection: boolean;
  rosterTest: CanonicalSixDirectionRosterTest;
  provenanceReports: DirectionProvenanceReport[];
  blockers: string[];
  anthropicRequests: 0;
  gptImageRequests: 0;
  falRequests: 0;
};
