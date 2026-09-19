/**
 * Identity-Native Art Direction — Sonnet IDENTITY ART DIRECTOR output schema.
 */

import type { BrandNativeAssetRole } from './brandNativeVisualBriefTypes.js';

export const IDENTITY_NATIVE_ART_DIRECTION_PROMPT_VERSION = 'marked-up-copy-identity-art-director-v1';

export type PaletteRole = {
  role: string;
  colorDescription: string;
  semanticUse: string;
  visualDominance: 'dominant' | 'secondary' | 'sparse-accent' | 'functional';
};

export type IdentityNativeArtDirection = {
  artDirectionId: string;
  directionId: string;
  directionName: string;
  expressionSystemId: string;
  identityPremise: string;
  proprietaryVisualDNA: string[];
  paletteSystem: PaletteRole[];
  typographyBehavior: string[];
  imageTreatment: string;
  photographicBehavior: string;
  graphicGrammar: string[];
  annotationGrammar: string[];
  materialBehavior: string[];
  compositionalBehavior: string[];
  textureBehavior: string[];
  recurringDevices: string[];
  artifactDesignLanguage: string;
  topicTransformationRules: string;
  customArtworkRequirements: string[];
  forbiddenGenericBehaviors: string[];
  preOverlayRecognitionCriteria: string[];
  referenceIdentityApplications: Array<{
    referenceId: string;
    identityTrait: string;
    application: string;
  }>;
  antiExampleCharacteristics: string[];
  provider: string;
  model: string;
  promptVersion: string;
  createdAt: string;
};

export type IdentityNativeVisualBrief = {
  assetId: string;
  role: BrandNativeAssetRole;
  topicOriginal: string;
  topicContentLayer: string;
  artifactDeclaration: string;
  proprietaryVisualDNA: string[];
  paletteOwnership: string[];
  typographicArchitecture: string[];
  graphicDevices: string[];
  materialSystem: string[];
  imageTreatment: string;
  compositionalHierarchy: string[];
  directionBehavior: string;
  assetRoleObjective: string;
  referenceTranslation: Array<{
    referenceId: string;
    traitsBorrowed: string[];
    traitsForbidden: string[];
  }>;
  forbiddenGenericBehavior: string[];
  preOverlayRequirement: string;
  antiExampleRejection: string[];
  compiledPrompt: string;
  promptHash: string;
  artDirectionId: string;
  expressionSystemId: string;
};

export type IdentityNativeRawImageQa = {
  identityNativeScore: number;
  directionNativeScore: number;
  paletteFidelity: number;
  typographicDna: number;
  graphicGrammarFidelity: number;
  artifactDesignAuthority: number;
  stockResemblance: number;
  topicClicheScore: number;
  preOverlayIdentityRecognitionTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  logoRemovalTestV2: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  strangerTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  result: 'ACCEPT' | 'REJECT' | 'NEEDS_HUMAN_REVIEW';
  reasons: string[];
  visionInspected: boolean;
};

export type IdentityNativeVisualPilotRecord = {
  pilotId: string;
  pilotKind: 'IDENTITY_NATIVE';
  assetId: 'MUC-IDENTITY-NATIVE-HERO-PILOT';
  directionId: string;
  directionName: string;
  expressionSystemId: string;
  artDirectionId: string;
  topic: string;
  assetRole: BrandNativeAssetRole;
  identityArtDirection: IdentityNativeArtDirection;
  identityBrief: IdentityNativeVisualBrief;
  model: string;
  provider: 'fal';
  referenceImageInputs: string[];
  storagePath: string;
  publicUrl: string;
  rawImageQa: IdentityNativeRawImageQa;
  founderPilotStatus: 'PENDING' | 'GENERATED' | 'NEEDS_HUMAN_REVIEW' | 'APPROVED' | 'REJECTED';
  founderPilotLabel: 'IDENTITY-NATIVE VISUAL PILOT';
  codeOverlaysApplied: false;
  estimatedCostUsd: number;
  anthropicArtDirectorRequests: number;
  createdAt: string;
};
