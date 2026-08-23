/**
 * NDX BOOK — Brand Personality end-to-end replay validation (shadow / non-canonical).
 *
 * Proves methodology convergence without mutating production intelligence.
 */

import type { BrandLoreProfile } from './types.js';
import type { BrandPersonalityProfile, BrandPersonalityReadinessState } from './personalityTypes.js';

/** Opaque pipeline artifacts — canonical types live in creativeIntelligence modules. */
export type ReplayFormationRecord = Record<string, unknown> | null;
export type ReplayDirectionExpression = Record<string, unknown> | null;
export type ReplayCreativeExpression = Record<string, unknown> | null;
export type ReplayIdentityArtDirection = Record<string, unknown> | null;
export type ReplayHeroConcept = Record<string, unknown> | null;
export type ReplayHeroBrief = Record<string, unknown> | null;

export const NDX_PERSONALITY_REPLAY_MODE = 'NDX_PERSONALITY_REPLAY_VALIDATION' as const;

export type PersonalityReplayLoreMode = 'FIXED_LORE_REPLAY' | 'FULL_IDENTITY_REPLAY';

export type PersonalityReplayStatus =
  | 'CREATED'
  | 'INTAKE_IN_PROGRESS'
  | 'PERSONALITY_READY'
  | 'FORMATION_READY'
  | 'CORE_DIRECTION_FORMED'
  | 'DIRECTION_EXPRESSION_READY'
  | 'CREATIVE_EXPRESSION_READY'
  | 'IDENTITY_ART_DIRECTION_READY'
  | 'HERO_GENERATED'
  | 'COMPARISON_READY'
  | 'FOUNDER_REVIEW'
  | 'APPROVED_AS_PIPELINE_VALIDATION'
  | 'FAILED_VALIDATION';

export type PersonalityConvergenceClassification =
  | 'STRONG_CONVERGENCE'
  | 'PARTIAL_CONVERGENCE'
  | 'MEANINGFUL_DIVERGENCE'
  | 'NOT_COMPARABLE';

export type PersonalityDomainConvergenceReport = {
  domain: string;
  canonicalValue: string | null;
  shadowValue: string | null;
  classification: PersonalityConvergenceClassification;
};

export type ReplayConvergenceScores = {
  personalityConvergence: number;
  creativeConvergence: number;
  identityConvergence: number;
  heroConvergence: number;
};

export type ReplayConvergenceReport = {
  personalityDomains: PersonalityDomainConvergenceReport[];
  scores: ReplayConvergenceScores;
  divergenceStage: string | null;
  shadowMarkedUpAnalogDirectionId: string | null;
  benchmarkLoadedAt: string | null;
};

export type FounderReplayValidationJudgment =
  | 'PIPELINE_VALIDATED'
  | 'PARTIAL_REVIEW_DIVERGENCE'
  | 'FAILED_METHODOLOGY_DRIFT'
  | null;

export type ReplayHeroAsset = {
  assetId: string;
  storagePath: string;
  topic: string;
  provider: 'openai/gpt-image-2';
  generatedAt: string;
};

export type BrandPersonalityReplayRecord = {
  replayId: string;
  mode: typeof NDX_PERSONALITY_REPLAY_MODE;
  organizationId: string;
  projectId: string | null;
  sourceProfileId: string | null;
  createdBy: string | null;
  status: PersonalityReplayStatus;
  loreMode: PersonalityReplayLoreMode;

  /** Immutable fixed Brand Lore snapshot — personality stripped. */
  brandLoreSnapshot: BrandLoreProfile;
  rawPersonalityAnswers: Record<string, string | string[]>;
  personalityCompletedSteps: string[];

  synthesizedPersonality: BrandPersonalityProfile | null;
  personalityReadiness: BrandPersonalityReadinessState | null;
  personalityMissingDomains: string[];

  formationRecord: ReplayFormationRecord;
  selectedShadowDirectionId: string | null;
  directionExpression: ReplayDirectionExpression;
  creativeExpression: ReplayCreativeExpression;
  identityArtDirection: ReplayIdentityArtDirection;
  heroConcept: ReplayHeroConcept;
  heroBrief: ReplayHeroBrief;
  heroAsset: ReplayHeroAsset | null;

  comparisonReport: ReplayConvergenceReport | null;
  founderValidationJudgment: FounderReplayValidationJudgment;
  hardcodingAudit: HardcodingAuditReport | null;

  /** Validation-only — never promotes to founder canon. */
  classification: 'SHADOW_VALIDATION';
  createdAt: string;
  updatedAt: string;
};

export type HardcodingAuditFinding = {
  id: string;
  severity: 'FORBIDDEN' | 'WARNING' | 'ALLOWED_NDX_DATA';
  description: string;
  location: string;
};

export type HardcodingAuditReport = {
  scannedAt: string;
  findings: HardcodingAuditFinding[];
  forbiddenCount: number;
  passed: boolean;
};

export type ReplayLeakageGuardResult = {
  allowed: boolean;
  violations: string[];
};

/** Benchmark snapshot — load ONLY after shadow hero generation for comparison. */
export type ReplayBenchmarkSnapshot = {
  brandPersonality: BrandPersonalityProfile | null;
  formationDirections: Array<{ id: string; directionName: string; oneLineThesis?: string }>;
  directionExpressionId: string | null;
  creativeExpressionId: string | null;
  identityArtDirectionId: string | null;
  heroAssetPath: string | null;
  loadedAt: string;
};
