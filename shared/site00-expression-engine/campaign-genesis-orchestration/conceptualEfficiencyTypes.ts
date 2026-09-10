/**
 * P0.CGO.2 — Conceptual Efficiency + Product/World Interaction types.
 */

import type { AssociativeDistance, ProductCategory } from './types.js';

export const P0_CGO_2_BUILD = 'v274' as const;

export type WorldCategoryDistance = AssociativeDistance;

export type InteractionDomain =
  | 'BODY'
  | 'MOTION'
  | 'TOUCH'
  | 'SPEED'
  | 'WIND'
  | 'WATER'
  | 'LIGHT'
  | 'REFLECTION'
  | 'PRESSURE'
  | 'WEIGHT'
  | 'GRAVITY'
  | 'SOUND'
  | 'RHYTHM'
  | 'GAMEPLAY'
  | 'RITUAL'
  | 'SOCIAL_BEHAVIOR'
  | 'WORK'
  | 'LEISURE'
  | 'TRANSIT'
  | 'SPORT'
  | 'FOOD'
  | 'NIGHTLIFE'
  | 'DOMESTIC_LIFE'
  | 'TECHNOLOGY'
  | 'PUBLIC_SPACE'
  | 'PERFORMANCE';

export type ProductMotionSignature = {
  productCategory: ProductCategory;
  motions: string[];
  primaryMotion: string | null;
};

export type ProductInteractionProfile = {
  productId: string;
  productCategory: ProductCategory;
  bodyInterfaces: string[];
  behaviorInterfaces: string[];
  motionInterfaces: string[];
  environmentInterfaces: string[];
  socialInterfaces: string[];
  sensoryInterfaces: string[];
  visibilityConditions: string[];
  naturalActions: string[];
  unnaturalActions: string[];
  interactionConstraints: string[];
  motionSignature: ProductMotionSignature;
};

export type WorldInteractionBridge = {
  world: string;
  product: string;
  interactionPoint: string;
  requiredAction: string;
  bodyInterface: string;
  behavior: string;
  motif: string;
  whyNatural: string;
  whyMemorable: string;
  riskOfForcedPlacement: number;
};

export type ProductVisibilityThroughBehavior = {
  behavior: string;
  productVisibilityMoment: string;
  visibilityDuration: 'INSTANT' | 'BRIEF' | 'SUSTAINED';
  naturalness: number;
  memorability: number;
  cameraRequirement: 'LOCKED' | 'FOLLOW' | 'HANDHELD' | 'MACRO';
  productionComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type NaturalProductVisibilityScore = {
  overall: number;
  classification: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
};

export type ForcedPlacementFlag =
  | 'MODEL_PRESENTATION_POSE'
  | 'PRODUCT_CENTERED_NO_BEHAVIOR'
  | 'IRRELEVANT_PROP'
  | 'PRODUCT_INSERTED_POST_CONCEPT'
  | 'ACTION_STOPS_FOR_PRODUCT'
  | 'WORLD_PRODUCT_NEVER_INTERSECT';

export type CategoryEnvironmentDependencyScore = {
  overall: number;
  classification: 'HIGH_DEPENDENCY' | 'INTERACTION_LED' | 'INDEPENDENT';
};

export type ProductionComplexityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export type ProductionComplexityScore = {
  level: ProductionComplexityLevel;
  overall: number;
  locationCount: number;
  subjectCount: number;
  propCount: number;
  cameraSetupCount: number;
  shotCount: number;
  effectCount: number;
};

export type ConceptualEfficiencyScore = {
  overall: number;
  classification: 'HIGH_EFFICIENCY' | 'MEDIUM_EFFICIENCY' | 'LOW_EFFICIENCY';
  meaningPerDecision: number;
  narrativeClarity: number;
  productClarity: number;
  motifYield: number;
  copyYield: number;
  worldClarity: number;
  memorability: number;
  extensibility: number;
};

export type YieldEfficiencyQuadrant =
  | 'HIGH_YIELD_HIGH_EFFICIENCY'
  | 'HIGH_YIELD_LOW_EFFICIENCY'
  | 'LOW_YIELD_HIGH_EFFICIENCY'
  | 'LOW_YIELD_LOW_EFFICIENCY';

export type ConceptValueRatio = {
  overall: number;
  numerator: number;
  denominator: number;
  quadrant: YieldEfficiencyQuadrant;
};

export type MinimalExecutionConcept = {
  world: string;
  interactionPoint: string;
  singleAction: string;
  singleVisualHook: string;
  singleMotifSystem: string;
  singleCopyHook: string;
  singlePayoff: string;
  durationSeconds: number;
  shotCount: number;
  productionComplexity: ProductionComplexityLevel;
  conceptualYield: number;
  conceptualEfficiency: number;
};

export type MicroNarrativeGrammarType =
  | 'ACTION_CLUE_TITLE'
  | 'OBJECT_BEHAVIOR_PAYOFF'
  | 'MOTION_REVEAL_END'
  | 'WORLD_PRODUCT_INTERSECTION'
  | 'MOTIF_PRODUCT_COPY'
  | 'SETUP_CONTRADICTION'
  | 'SINGLE_LOOP'
  | 'SINGLE_VISUAL_PUNCHLINE';

export type CreativeLeapTraceStep = {
  stage: 'PRODUCT' | 'INTERACTION' | 'BEHAVIOR' | 'WORLD' | 'MOTIF' | 'COPY';
  value: string;
};

export type CreativeLeapTrace = {
  steps: CreativeLeapTraceStep[];
  connectiveLogic: string;
  fromGenerationPath: true;
};

export type BodyStorySurfaceMap = Partial<
  Record<
    'hair' | 'hands' | 'nails' | 'face' | 'eyes' | 'mouth' | 'ears' | 'neck' | 'shoulders' | 'legs' | 'feet' | 'gesture' | 'posture',
    string[]
  >
>;

export type CameraEconomyScore = {
  overall: number;
  cameraDecisions: number;
  communicationStrength: number;
};

export type OneShotCampaignPotential = {
  viable: boolean;
  confidence: number;
  reason: string;
  suggestedDurationSeconds: number;
};

export type CreativeReductionItem = {
  element: string;
  elementType: 'PROP' | 'SHOT' | 'LOCATION' | 'COPY' | 'CHARACTER' | 'EFFECT';
  servesMeaning: boolean;
  recommendation: 'KEEP' | 'REMOVE' | 'MERGE';
};

export type CreativeReductionPass = {
  question: 'CAN THIS IDEA BE SAID WITH LESS?';
  items: CreativeReductionItem[];
  removedCount: number;
  conceptStrengthAfter: 'STRONGER' | 'UNCHANGED' | 'WEAKER';
};

export type ConceptualDensityScore = {
  overall: number;
  averageRolesPerElement: number;
  highDensityElements: string[];
};

export type CreativeElementType =
  | 'LOCATION'
  | 'PROP'
  | 'WARDROBE'
  | 'BEAUTY'
  | 'HUMAN'
  | 'CAMERA'
  | 'COPY'
  | 'MOTION';

export type CreativeElementUtility = {
  element: string;
  elementType: CreativeElementType;
  rolesServed: string[];
  utilityScore: number;
};

export type CampaignExtensibilityScore = {
  overall: number;
  derivativeAssets: string[];
};

export type LoopabilityScore = {
  overall: number;
  naturalLoop: boolean;
  reason: string;
};

export type ExecutionLevel = 'LEAN' | 'STANDARD' | 'EXPANSIVE';

export type LateralWorldCandidate = {
  worldName: string;
  setting: string;
  worldDistance: WorldCategoryDistance;
  interactionBridge: WorldInteractionBridge;
  connectiveLogic: string;
  motifs: string[];
  copyHooks: string[];
};

export type ConceptualEfficiencyEnrichment = {
  interactionProfile: ProductInteractionProfile;
  interactionBridge: WorldInteractionBridge;
  creativeLeapTrace: CreativeLeapTrace;
  visibilityThroughBehavior: ProductVisibilityThroughBehavior;
  naturalProductVisibility: NaturalProductVisibilityScore;
  categoryEnvironmentDependency: CategoryEnvironmentDependencyScore;
  conceptualEfficiency: ConceptualEfficiencyScore;
  productionComplexity: ProductionComplexityScore;
  conceptValueRatio: ConceptValueRatio;
  minimalExecution: MinimalExecutionConcept;
  microNarrativeGrammar: MicroNarrativeGrammarType;
  bodyStorySurfaces: BodyStorySurfaceMap;
  cameraEconomy: CameraEconomyScore;
  oneShotPotential: OneShotCampaignPotential;
  conceptualDensity: ConceptualDensityScore;
  elementUtilities: CreativeElementUtility[];
  extensibility: CampaignExtensibilityScore;
  loopability: LoopabilityScore;
  executionLevel: ExecutionLevel;
  forcedPlacementFlags: ForcedPlacementFlag[];
  worldDistance: WorldCategoryDistance;
};

export type ConceptualEfficiencyQAResult = {
  pass: boolean;
  checks: Array<{ check: string; pass: boolean; detail: string }>;
  genericFlags: string[];
  revisionHints: string[];
};

export const REFERENCE_ABSTRACTION_PRINCIPLES = [
  'UNRELATED_WORLD',
  'NATURAL_PRODUCT_INTERACTION',
  'ONE_BEHAVIOR',
  'ONE_MOTIF_SYSTEM',
  'WORLD_NATIVE_COPY',
  'MINIMAL_EXECUTION',
] as const;

export const LITERAL_BEAUTY_WORLDS = [
  'SALON',
  'BATHROOM',
  'VANITY',
  'WIG INSTALLATION',
  'BEAUTY STUDIO',
  'GETTING READY',
] as const;
