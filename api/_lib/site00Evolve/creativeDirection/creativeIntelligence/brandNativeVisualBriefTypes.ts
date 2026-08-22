/**
 * Brand-native visual brief — compiled FROM DirectionExpressionSystem, not topic-first stock prompts.
 */

import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';

export type BrandNativeAssetRole =
  | 'HERO_EDITORIAL_WORLD'
  | 'PRIMARY_ARTIFACT'
  | 'PHOTOGRAPHIC_EVIDENCE'
  | 'MATERIAL_SPECIMEN'
  | 'SOCIAL_APPLICATION_SUBSTRATE';

export type BrandNativeVisualPilotStatus =
  | 'PENDING'
  | 'GENERATED'
  | 'NEEDS_HUMAN_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type BrandNativeVisualBrief = {
  assetId: string;
  role: BrandNativeAssetRole;
  topicOriginal: string;
  topicTransformed: string;
  worldPremise: string;
  brandBehavior: string;
  visualObjective: string;
  subjectMatter: string;
  subjectTransformation: string;
  photographyRules: string[];
  materialRules: string[];
  colorRules: string[];
  spatialRules: string[];
  textureRules: string[];
  lightingRules: string[];
  cropRules: string[];
  objectRules: string[];
  humanPresenceRules: string[];
  referenceApplications: Array<{
    referenceId: string;
    cropId?: string;
    traitsBorrowed: string[];
    traitsForbidden: string[];
  }>;
  requiredBrandSpecificSignals: string[];
  forbiddenGenericSignals: string[];
  forbiddenTopicCliches: string[];
  textOwnership: 'FAL_FORBIDDEN';
  modelInstructions: string;
  negativeInstructions: string[];
  recognitionTest: string;
  compiledPrompt: string;
  promptHash: string;
  expressionSystemId: string;
};

export type BrandNativeRawImageQa = {
  directionNativeScore: number;
  topicClicheScore: number;
  stockLikeness: number;
  materialFidelity: number;
  photographySystemFidelity: number;
  colorRoleFidelity: number;
  referenceTranslation: number;
  roleFit: number;
  preOverlayDirectionRecognitionTest: 'PASS' | 'FAIL' | 'NEEDS_HUMAN_REVIEW';
  result: 'ACCEPT' | 'REJECT' | 'NEEDS_HUMAN_REVIEW';
  reasons: string[];
  visionInspected: boolean;
};

export type BrandNativeVisualPilotRecord = {
  pilotId: string;
  directionId: string;
  directionName: string;
  expressionSystemId: string;
  topic: string;
  assetRole: BrandNativeAssetRole;
  brief: BrandNativeVisualBrief;
  model: string;
  provider: 'fal';
  referenceImageInputs: string[];
  storagePath: string;
  publicUrl: string;
  rawImageQa: BrandNativeRawImageQa;
  founderPilotStatus: BrandNativeVisualPilotStatus;
  founderPilotLabel: 'VISUAL LANGUAGE PILOT';
  codeOverlaysApplied: false;
  estimatedCostUsd: number;
  createdAt: string;
};

export type CompileBrandNativeBriefParams = {
  expressionSystem: DirectionExpressionSystem;
  role: BrandNativeAssetRole;
  topic: string;
  referenceInfluence?: Array<{
    referenceId: string;
    cropId?: string;
    traitsBorrowed: string[];
    traitsForbidden: string[];
  }>;
  zoneId?: string;
};
