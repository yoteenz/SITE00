/**
 * Brand Character Readiness + Conditional Deepening types.
 */

import type {
  BRAND_CHARACTER_READINESS_METHODOLOGY_V1,
  CHARACTER_EVIDENCE_CONFIDENCE_LEVELS,
  CHARACTER_EVIDENCE_GAP_SEVERITIES,
  CHARACTER_EVIDENCE_STRENGTHS,
  CHARACTER_READINESS_DOMAINS,
  BRAND_CHARACTER_READINESS_STATES,
  EXISTING_EVIDENCE_SEARCH_RESULTS,
  FORMATION_INPUT_READINESS,
} from './constants.js';

export type BrandCharacterReadinessState = (typeof BRAND_CHARACTER_READINESS_STATES)[number];
export type CharacterEvidenceStrength = (typeof CHARACTER_EVIDENCE_STRENGTHS)[number];
export type CharacterReadinessDomain = (typeof CHARACTER_READINESS_DOMAINS)[number];
export type CharacterEvidenceGapSeverity = (typeof CHARACTER_EVIDENCE_GAP_SEVERITIES)[number];
export type CharacterEvidenceConfidence = (typeof CHARACTER_EVIDENCE_CONFIDENCE_LEVELS)[number];
export type ExistingEvidenceSearchResult = (typeof EXISTING_EVIDENCE_SEARCH_RESULTS)[number];
export type FormationInputReadiness = (typeof FORMATION_INPUT_READINESS)[number];

export type CharacterReadinessDomainEvaluation = {
  domain: CharacterReadinessDomain;
  strength: CharacterEvidenceStrength;
  confidence: CharacterEvidenceConfidence;
  whatWeKnow: string[];
  whatRemainsUnclear: string[];
  whyItMatters: string;
  questionRecommended: boolean;
  blocking: boolean;
};

export type BrandCharacterEvidenceGap = {
  gapId: string;
  domain: CharacterReadinessDomain;
  severity: CharacterEvidenceGapSeverity;
  whyItMatters: string;
  existingEvidence: string[];
  missingEvidence: string;
  canInferSafely: false;
  shouldAskFounder: boolean;
  recommendedQuestionCount: number;
  dependency: string | null;
  blocking: boolean;
};

export type FounderLanguageEvidence = {
  id: string;
  rawAnswer: string;
  normalizedMeaning: string;
  domain: CharacterReadinessDomain;
  confidence: CharacterEvidenceConfidence;
  sourceQuestionId: string | null;
  capturedAt: string;
  provenance: string;
};

export type BrandCharacterDeepeningQuestion = {
  questionId: string;
  domain: CharacterReadinessDomain;
  purpose: string;
  whyAsked: string;
  evidenceGapId: string;
  questionType: 'CORE' | 'DEEPENING' | 'CLARIFICATION' | 'CONFLICT_RESOLUTION';
  answerMode: 'FREE_TEXT' | 'SHORT_TEXT' | 'MULTI_SELECT' | 'EXAMPLE' | 'BOUNDARY';
  required: boolean;
  prompt: string;
  sourceVersion: string;
  provenance: string;
  customGenerated: boolean;
};

export type BrandCharacterDeepeningAnswer = {
  questionId: string;
  rawAnswer: string;
  normalizedMeaning: string;
  domain: CharacterReadinessDomain;
  answeredAt: string;
  founderLanguageEvidenceId: string;
};

export type BrandCharacterReadinessFingerprint = {
  fingerprint: string;
  methodologyVersion: typeof BRAND_CHARACTER_READINESS_METHODOLOGY_V1 | string;
  brandLoreFingerprint: string | null;
  personalityFingerprint: string | null;
  deepeningAnswerCount: number;
  compiledAt: string;
};

export type BrandCharacterReadinessOverride = {
  overrideType: 'FOUNDER_PROCEED_WITH_PARTIAL_CHARACTER_EVIDENCE';
  overrideReason: string;
  missingDomains: CharacterReadinessDomain[];
  founderId: string | null;
  timestamp: string;
  readinessFingerprint: string;
};

export type BrandCharacterReadinessEvaluation = {
  evaluationId: string;
  projectId: string;
  organizationId: string;
  methodologyVersion: typeof BRAND_CHARACTER_READINESS_METHODOLOGY_V1 | string;
  overallState: BrandCharacterReadinessState;
  domains: CharacterReadinessDomainEvaluation[];
  gaps: BrandCharacterEvidenceGap[];
  blockingGapCount: number;
  recommendedQuestionCount: number;
  fingerprint: BrandCharacterReadinessFingerprint;
  forensicInventorySummary: Record<string, string>;
  evaluatedAt: string;
  formationGateAllowed: boolean;
  formationGateReason: string | null;
};

export type BrandCharacterDeepeningModule = {
  moduleId: string;
  projectId: string;
  readinessEvaluationId: string;
  status: 'NOT_REQUIRED' | 'COMPILED' | 'IN_PROGRESS' | 'COMPLETE';
  questions: BrandCharacterDeepeningQuestion[];
  answers: BrandCharacterDeepeningAnswer[];
  founderLanguageEvidence: FounderLanguageEvidence[];
  compiledAt: string;
  completedAt: string | null;
};

export type BrandCharacterReadinessRecord = {
  recordId: string;
  projectId: string;
  organizationId: string;
  latestEvaluation: BrandCharacterReadinessEvaluation | null;
  deepeningModule: BrandCharacterDeepeningModule | null;
  override: BrandCharacterReadinessOverride | null;
  firstFormationInputReadiness: FormationInputReadiness | null;
  inputEvidenceLimited: boolean;
  updatedAt: string;
};
