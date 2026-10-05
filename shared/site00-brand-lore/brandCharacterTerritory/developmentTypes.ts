/**
 * Brand Character Development — Level 2 dimensional character formation.
 */

import type {
  BrandCharacterCore,
  BrandCharacterCulturalIntelligence,
  BrandCharacterEmotional,
  BrandCharacterExpressiveBehavior,
  BrandCharacterHumorWit,
  BrandCharacterIntellectual,
  BrandCharacterLanguage,
  BrandCharacterSocial,
  BrandCharacterTaste,
  CharacterArtifactRelationship,
} from './types.js';
import type { BrandCharacterJudgment } from './constants.js';

export const BRAND_CHARACTER_TERRITORY_V2 = 'BRAND_CHARACTER_TERRITORY_V2' as const;
export const BRAND_CHARACTER_DEVELOPMENT_V1 = 'BRAND_CHARACTER_DEVELOPMENT_V1' as const;

/** Compact territory-level dimensions — divergent selection, not production-ready system. */
export type BrandCharacterTerritoryCompact = {
  territoryName: string;
  characterThesis: string;
  characterEssence: string;
  governingContradiction: string;
  worldview: string;
  characteristicBehavior: string;
  intellectualSignature: string;
  socialSignature: string;
  culturalPositionSeed: string;
  humorPotential: string;
  tastePotential: string;
  artifactPotential: string;
  whyThisBrand: string;
  expansionPotential: string;
  mustNeverBecome: string[];
};

export type BrandCharacterDevelopmentDelta = {
  preserve: string[];
  develop: string[];
  avoid: string[];
};

export const DEVELOPMENT_FOUNDER_JUDGMENTS = [
  'LOVE_THIS_CHARACTER',
  'PROMISING_REFINE',
  'TOO_GENERIC',
  'TOO_PERFORMATIVE',
  'TOO_INTERNET',
  'TOO_ACADEMIC',
  'TOO_NICE',
  'TOO_COLD',
  'TOO_SAFE',
  'TOO_TRY_HARD',
  'CULTURALLY_HOLLOW',
  'HUMOR_FEELS_FORCED',
  'NO_REAL_POINT_OF_VIEW',
  'NO_REAL_TENSION',
  'ARTIFACT_BEHAVIOR_GENERIC',
  'NOT_NDXBOOK',
] as const;

export type DevelopmentFounderJudgment = (typeof DEVELOPMENT_FOUNDER_JUDGMENTS)[number] | null;

/** Deep humor system — behaviorally modeled at development stage. */
export type BrandCharacterHumorSystem = BrandCharacterHumorWit & {
  humorSource: string;
  humorTarget: string;
  humorMechanism: string;
  humorTemperature: string;
  timingBehavior: string;
  deadpan: string;
  selfAwareness: string;
  audienceInclusion: string;
  audienceExclusion: string;
  crueltyBoundary: string;
  seriousnessBoundary: string;
  culturalDependency: string;
  contextualModulation: string;
};

/** Deep cultural intelligence — behavioral, not reference insertion. */
export type BrandCharacterCulturalIntelligenceDeep = BrandCharacterCulturalIntelligence & {
  culturalMemory: string;
  referenceSelection: string;
  culturalAssumptions: string;
  subculturalFluency: string;
  generationalFluency: string;
  internetFluency: string;
  historicalFluency: string;
  highLowCultureMovement: string;
  codeSwitchingBehavior: string;
  culturalHumor: string;
  culturalRestraint: string;
  appropriationBoundaries: string;
  referenceObsolescence: string;
  trendRelationship: string;
  nostalgiaRelationship: string;
  culturalParticipation: string;
  culturalObservation: string;
  culturalJudgment: string;
};

export type CharacterArtifactBehavior = CharacterArtifactRelationship & {
  whatItMarks: string;
  whatItLeavesUntouched: string;
  whatItCircles: string;
  whatItCrossesOut: string;
  whatItEnlarges: string;
  whatItAnnotates: string;
  whatItJuxtaposes: string;
  whatItCollects: string;
  whatItPreserves: string;
  whatItTreatsAsEvidence: string;
  whatItTreatsAsDisposable: string;
  whatItTreatsAsPrecious: string;
};

export type CharacterProductiveTensionEvaluation = {
  governingContradiction: string;
  tensionPairs: string[];
  hasBehavioralRange: boolean;
  flatteningRisk: boolean;
  notes: string[];
};

export type BrandCharacterDevelopment = {
  id: string;
  parentTerritoryId: string;
  parentTerritoryFingerprint: string;
  intelligenceSnapshotFingerprint: string;
  developmentFingerprint: string;
  methodologyVersion: typeof BRAND_CHARACTER_DEVELOPMENT_V1 | string;
  status: 'FORMING' | 'DEVELOPED' | 'FAILED' | 'FOUNDER_REVIEWED';
  founderDevelopmentDelta: BrandCharacterDevelopmentDelta | null;
  parentFounderJudgment: BrandCharacterJudgment;
  coreCharacter: BrandCharacterCore;
  intellectualCharacter: BrandCharacterIntellectual;
  socialCharacter: BrandCharacterSocial;
  emotionalCharacter: BrandCharacterEmotional;
  humorSystem: BrandCharacterHumorSystem;
  culturalIntelligence: BrandCharacterCulturalIntelligenceDeep;
  languageCharacter: BrandCharacterLanguage;
  tasteCharacter: BrandCharacterTaste;
  expressiveBehavior: BrandCharacterExpressiveBehavior;
  artifactBehavior: CharacterArtifactBehavior;
  productiveTension: CharacterProductiveTensionEvaluation;
  allowedRange: string[];
  antiDirections: string[];
  founderJudgment: DevelopmentFounderJudgment;
  judgmentNote: string | null;
  providerReceipt: Record<string, unknown> | null;
  createdAt: string;
};

export type BrandCharacterDevelopmentRun = {
  runId: string;
  organizationId: string;
  projectId: string;
  developments: BrandCharacterDevelopment[];
  accounting: {
    anthropicRequests: number;
    anthropicInputTokens: number;
    anthropicOutputTokens: number;
    anthropicEstimatedCostUsd: number;
  };
};

export type BrandCharacterSetAudit = {
  auditId: string;
  runId: string;
  auditType: 'TERRITORY_SET' | 'DEVELOPMENT_SET';
  methodologyVersion: string;
  structuralDistinctiveness: string;
  archetypeCollapseNotes: string[];
  worldviewDistinction: string;
  behavioralOverlap: string;
  genericBrandProbability: string;
  internalTensionNotes: string[];
  territoryEvaluations: Array<{ territoryId: string; notes: string[] }>;
  winnerSelected: false;
  founderAuthority: true;
  providerReceipt: Record<string, unknown> | null;
  createdAt: string;
};

export type SystemCompilationPolicy = 'DEVELOPMENT_REQUIRED' | 'DEVELOPMENT_SUFFICIENT' | 'ESTABLISHED_CHARACTER_CAPTURE';

export function developmentJudgmentsIncludePromisingDevelop(judgment: BrandCharacterJudgment): boolean {
  return judgment === 'LOVE_THE_CHARACTER' || judgment === 'PROMISING_DEVELOP';
}

export function territoryAloneInsufficientForDownstreamAuthority(): true {
  return true;
}
