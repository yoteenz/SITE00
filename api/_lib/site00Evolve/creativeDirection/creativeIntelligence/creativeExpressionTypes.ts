/**
 * Creative Expression Layer — personality, wit, typography roles, hero concept (THE MARKED-UP COPY).
 */

import type { BrandNativeAssetRole } from './brandNativeVisualBriefTypes.js';
import type { IdentityNativeArtDirection, IdentityNativeVisualBrief } from './identityNativeArtDirectionTypes.js';

export const CREATIVE_EXPRESSION_PROMPT_VERSION = 'marked-up-copy-creative-expression-v1';

export const IDENTITY_NATIVE_HERO_V2_ASSET_ID = 'MUC-IDENTITY-NATIVE-HERO-PILOT-V2';

export type MartianMonoTypographyRoles = {
  martianMonoAvailable: boolean;
  actualSource: string;
  displayVoice: string;
  systemVoice: string;
  revisionVoice: string;
  marginVoice: string;
  microVoice: string;
  rolesSummary: string[];
};

export type CreativeExpressionSystem = {
  expressionId: string;
  directionId: string;
  directionName: string;
  expressionSystemId: string;
  artDirectionId: string;
  editorialPersonality: string;
  verbalPersonality: string;
  witMechanics: string[];
  headlineBehavior: string[];
  microcopyBehavior: string[];
  annotationVoice: string[];
  typographyPersonality: string[];
  compositionPersonality: string[];
  graphicSurpriseRules: string[];
  secondReadDiscoveryRules: string[];
  restraintRules: string[];
  recurringEditorialJokes: string[];
  culturalIntelligenceRules: string[];
  artifactPersonalityTest: string[];
  antiGenericCreativeRules: string[];
  typographyRoles: MartianMonoTypographyRoles;
  /** Upstream Brand Personality fields this expression translates — not invented ex nihilo. */
  personalityLineage: Array<{
    upstreamField: string;
    upstreamValue: string;
    derivedBehavior: string;
    classification: string;
  }>;
  provider: string;
  model: string;
  promptVersion: string;
  createdAt: string;
};

export type HeroCreativeConcept = {
  conceptId: string;
  centralEditorialArgument: string;
  dominantEvent: string;
  cleanClaim: string;
  revisionMove: string;
  replacementMove: string;
  marginCounterpoint: string;
  microcopyDiscovery: string;
  evidenceDevice: string;
  visualPunchline: string;
  dominantTypeBehavior: string;
  martianMonoApplication: string[];
  graphicInterventions: Array<{ device: string; semanticPurpose: string }>;
  intentionalGridBreak: string;
  quietZone: string;
  readingSequence: string[];
  restraintDecision: string;
};

export type CopyQualityScores = {
  editorialVoice: number;
  wit: number;
  specificity: number;
  memorability: number;
  directionFit: number;
  pass: boolean;
  reasons: string[];
};

export type CopyQualityGateResult = {
  scores: CopyQualityScores;
  revisedCopy: HeroCreativeConcept | null;
  revisionRounds: number;
  visionInspected: boolean;
};

export type IdentityNativeV2RawImageQa = {
  identityNativeScore: number;
  directionNativeScore: number;
  paletteFidelity: number;
  typographicDna: number;
  graphicGrammarFidelity: number;
  artifactDesignAuthority: number;
  stockResemblance: number;
  topicClicheScore: number;
  voicePersonality: number;
  wit: number;
  compositionalArtistry: number;
  secondReadDepth: number;
  visualSurprise: number;
  restraint: number;
  martianMonoIntegration: number;
  memorability: number;
  artDirectionQa: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  textPrecisionQa: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  threeSecondTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  thirtySecondTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  personalityRemovalTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  preOverlayIdentityRecognitionTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  logoRemovalTestV2: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  strangerTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  result: 'ACCEPT' | 'REJECT' | 'NEEDS_HUMAN_REVIEW';
  reasons: string[];
  visionInspected: boolean;
};

export type IdentityNativeV2VisualBrief = IdentityNativeVisualBrief & {
  assetId: typeof IDENTITY_NATIVE_HERO_V2_ASSET_ID;
  creativeExpressionId: string;
  heroConceptId: string;
  creativeExpressionBlock: string[];
  heroConceptBlock: string[];
  typographyRolesBlock: string[];
  copyQualityScores: CopyQualityScores;
};

export type IdentityNativeV2PilotRecord = {
  pilotId: string;
  pilotKind: 'IDENTITY_NATIVE_V2';
  assetId: typeof IDENTITY_NATIVE_HERO_V2_ASSET_ID;
  directionId: string;
  directionName: string;
  expressionSystemId: string;
  artDirectionId: string;
  topic: string;
  assetRole: BrandNativeAssetRole;
  identityArtDirection: IdentityNativeArtDirection;
  creativeExpression: CreativeExpressionSystem;
  heroCreativeConcept: HeroCreativeConcept;
  copyQualityGate: CopyQualityGateResult;
  identityBrief: IdentityNativeV2VisualBrief;
  v1PilotId: string | null;
  model: string;
  provider: 'fal';
  referenceImageInputs: string[];
  storagePath: string;
  publicUrl: string;
  rawImageQa: IdentityNativeV2RawImageQa;
  founderPilotStatus: 'PENDING' | 'GENERATED' | 'NEEDS_HUMAN_REVIEW' | 'APPROVED' | 'REJECTED';
  founderPilotLabel: 'CREATIVE-REFINED IDENTITY PILOT';
  codeOverlaysApplied: false;
  estimatedCostUsd: number;
  anthropicCreativeExpressionRequests: number;
  createdAt: string;
};

export type VisualPilotComparisonPayload = {
  brandNativePilot: import('./brandNativeVisualBriefTypes.js').BrandNativeVisualPilotRecord | null;
  identityNativePilot: import('./identityNativeArtDirectionTypes.js').IdentityNativeVisualPilotRecord | null;
  identityNativeV2Pilot: IdentityNativeV2PilotRecord | null;
};
