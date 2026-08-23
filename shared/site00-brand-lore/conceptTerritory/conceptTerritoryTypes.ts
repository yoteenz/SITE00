/**
 * Creative Concept Territory + World Expression System — first-class methodology models.
 */

import type { CanonicalNdxbookDirectionName } from '../canonicalCreativeRangeConstants.js';
import {
  EXPERIMENT_D_CLASSIFICATION,
  type ConceptOrthogonalityResult,
  type TraitProvenance,
} from './conceptTerritoryConstants.js';

export type CreativeConceptTerritory = {
  territoryId: string;
  brandSlug: string;
  sourceDirectionId: string;
  directionName: CanonicalNdxbookDirectionName;
  name: string;
  centralConcept: string;
  bigCreativeIdea: string;
  worldPremise: string;
  conceptualMetaphor: string;
  viewerRole: string;
  audienceExperience: string;
  brandRole: string;
  emotionalMechanism: string;
  culturalMechanism: string;
  contentMechanism: string;
  whatMakesThisAWorld: string;
  whyThisBelongsToBrand: string;
  whyThisIsNotJustAStyle: string;
  primaryVisualMechanism: string;
  secondaryVisualMechanisms: string[];
  primaryArtifactFamily: string;
  contentBehavior: string;
  requiredSignals: string[];
  forbiddenSignals: string[];
  ownedVisualMechanisms: string[];
  antiCousinRules: string[];
  antiCloneRules: string[];
  conceptualDistanceFromSiblingTerritories: string[];
  sourceLineage: string[];
  methodologyVersion: string;
  version: number;
  createdAt: string;
};

export type WorldExpressionSystem = {
  expressionSystemId: string;
  territoryId: string;
  directionName: CanonicalNdxbookDirectionName;
  typographySystem: string;
  paletteSystem: string;
  materialSystem: string;
  imagerySystem: string;
  compositionSystem: string;
  graphicGrammar: string;
  artifactSystem: string;
  motionSystem: string;
  socialBehavior: string;
  recognitionMechanisms: string[];
  signatureBehaviors: string[];
  forbiddenSiblingBehaviors: string[];
  derivationEvidence: string[];
  conceptAlignment: string;
  orthogonalityEvidence: string[];
  nativeProofFormat: string;
  methodologyVersion: string;
  version: number;
  createdAt: string;
};

export type TerritoryGraphicGrammar = {
  territoryId: string;
  ownedDevices: string[];
  allowedDevices: string[];
  rareDevices: string[];
  forbiddenSiblingDevices: string[];
  semanticPurposeByDevice: Record<string, string>;
};

export type ConceptCollisionEvidence = {
  collisionPair: [CanonicalNdxbookDirectionName, CanonicalNdxbookDirectionName];
  sharedConceptualCore: string;
  meaningfulDifferences: string[];
  insufficientDifferences: string[];
  recommendedInterpretiveBoundary: string;
  result: 'CONCEPT_COLLISION' | 'COUSIN_BUT_DISTINCT' | 'PASS';
};

export type CousinPairDisentanglement = {
  directionA: CanonicalNdxbookDirectionName;
  directionB: CanonicalNdxbookDirectionName;
  philosophicalDifference: string;
  viewerRoleDifference: string;
  worldPremiseDifference: string;
  contentMechanismDifference: string;
  visualMechanismDifference: string;
  artifactFamilyDifference: string;
  materialLogicDifference: string;
  typographicLogicDifference: string;
  paletteLogicDifference: string;
  compositionLogicDifference: string;
  socialLogicDifference: string;
  motionLogicDifference: string;
  neverInABecauseBelongsToB: string[];
  neverInBBecauseBelongsToA: string[];
  collisionStatus: ConceptOrthogonalityResult;
};

export type VisualConvergenceTraitReport = {
  trait: string;
  directionsSharing: CanonicalNdxbookDirectionName[];
  similarityDimensions: string[];
};

export type AccidentalBrandConstantReport = {
  trait: string;
  occurrenceCount: number;
  provenance: TraitProvenance;
  rationale: string;
  mustNotBecomeUniversal: boolean;
};

export type ForensicVisualConvergenceAudit = {
  auditedAt: string;
  brandSlug: string;
  methodologyVersion: string;
  sharedVisualTraits: VisualConvergenceTraitReport[];
  accidentalBrandConstants: AccidentalBrandConstantReport[];
  trueBrandConstants: string[];
  conceptualConvergenceNotes: string[];
  visualConvergenceNotes: string[];
  pairwiseComparisons: Array<{
    directionA: CanonicalNdxbookDirectionName;
    directionB: CanonicalNdxbookDirectionName;
    conceptualSimilarity: string;
    typographicSimilarity: string;
    paletteSimilarity: string;
    materialSimilarity: string;
    imagerySimilarity: string;
    compositionSimilarity: string;
    graphicGrammarSimilarity: string;
    artifactSimilarity: string;
    formatSimilarity: string;
  }>;
};

export type ConceptOrthogonalityGateResult = {
  passed: boolean;
  result: ConceptOrthogonalityResult;
  collisions: ConceptCollisionEvidence[];
  cousinPairs: CousinPairDisentanglement[];
  notes: string[];
};

export type VisualOrthogonalityGateResult = {
  passed: boolean;
  tooClosePairs: Array<{ pair: [string, string]; overlappingTraits: string[] }>;
  cloneRisks: Array<{ pair: [string, string]; reason: string }>;
  blocksGeneration: boolean;
  notes: string[];
};

export type ExperimentDStatus =
  | 'NOT_STARTED'
  | 'TERRITORIES_FORMED'
  | 'ORTHOGONALITY_READY'
  | 'GENERATION_READY'
  | 'GENERATING'
  | 'COMPLETE'
  | 'FAILED';

export type ExperimentDHeroJudgment =
  | 'LOVE_THE_CONCEPT'
  | 'PROMISING_REFINE'
  | 'TOO_CLOSE_TO_ANOTHER'
  | 'NOT_NDXBOOK'
  | null;

export type ExperimentDHeroCandidate = {
  comparisonIndex: number;
  directionName: CanonicalNdxbookDirectionName;
  territory: CreativeConceptTerritory;
  expressionSystem: WorldExpressionSystem;
  previousMethodologyHeroStoragePath: string | null;
  heroAsset: {
    assetId: string;
    storagePath: string;
    generatedAt: string;
  } | null;
  generationReceipt: Record<string, unknown> | null;
  founderJudgment: ExperimentDHeroJudgment;
  tooCloseSibling: CanonicalNdxbookDirectionName | null;
};

export type SixConceptHeroRangeRun = {
  experimentClassification: typeof EXPERIMENT_D_CLASSIFICATION;
  runId: string;
  organizationId: string;
  projectId: string;
  methodologyVersion: string;
  /** Intelligence boundary frozen at experiment start — appetite excluded when < 2. */
  intelligenceSnapshotVersion: number;
  topicId: string;
  topicName: string;
  status: ExperimentDStatus;
  generationReady: boolean;
  generationStarted: boolean;
  territories: CreativeConceptTerritory[];
  expressionSystems: WorldExpressionSystem[];
  conceptOrthogonality: ConceptOrthogonalityGateResult | null;
  visualOrthogonality: VisualOrthogonalityGateResult | null;
  forensicAudit: ForensicVisualConvergenceAudit | null;
  heroes: ExperimentDHeroCandidate[];
  accounting: {
    anthropicRequests: number;
    gptImage2Requests: number;
    falRequests: number;
    estimatedCostUsd: number;
  };
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
};
