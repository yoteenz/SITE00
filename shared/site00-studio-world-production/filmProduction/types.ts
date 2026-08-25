/**
 * P0.FILM.1 — Film production types (brand-agnostic).
 */

import type {
  DAILIES_ACTIONS,
  FILM_AUTONOMY_MODES,
  FILM_INPUT_MODES,
  FILM_PRODUCTION_STATES,
  FOUNDER_GATES,
  NDX_ENVIRONMENTS,
  PRODUCTION_STACK_KINDS,
  QA_FAILURE_CODES,
  QA_STATUSES,
  READINESS_CHECKS,
  ROUGH_CUT_ACTIONS,
  SCENE_DECK_SCENE_STATES,
  SCENE_DECK_SHOT_STATES,
  SHOT_RISK_LEVELS,
  VIDEO_FORMAT_TEMPLATES,
  WARDROBE_MODES,
} from './constants.js';

export type FilmInputMode = (typeof FILM_INPUT_MODES)[number];
export type FilmAutonomyMode = (typeof FILM_AUTONOMY_MODES)[number];
export type FilmWorkflowState = (typeof FILM_PRODUCTION_STATES)[number];
export type FounderGate = (typeof FOUNDER_GATES)[number];
export type ShotRiskLevel = (typeof SHOT_RISK_LEVELS)[number];
export type ProductionStackKind = (typeof PRODUCTION_STACK_KINDS)[number];
export type QAStatus = (typeof QA_STATUSES)[number];
export type DailiesAction = (typeof DAILIES_ACTIONS)[number];
export type RoughCutAction = (typeof ROUGH_CUT_ACTIONS)[number];
export type SceneDeckShotState = (typeof SCENE_DECK_SHOT_STATES)[number];
export type SceneDeckSceneState = (typeof SCENE_DECK_SCENE_STATES)[number];
export type WardrobeMode = (typeof WARDROBE_MODES)[number];
export type NdxEnvironmentId = (typeof NDX_ENVIRONMENTS)[number];
export type VideoFormatTemplateId = (typeof VIDEO_FORMAT_TEMPLATES)[number];
export type ReadinessCheck = (typeof READINESS_CHECKS)[number];
export type QAFailureCode = (typeof QA_FAILURE_CODES)[number];

/* ── Authority stack ── */

export type BrandFilmBible = {
  brandId: string;
  version: string;
  visualTone: string[];
  cameraRelationship: string;
  realismTarget: string;
  pacingRange: { min: number; max: number };
  shotDensity: string;
  preferredCameraDistance: string[];
  preferredLensCharacter: string;
  preferredFraming: string[];
  lightingRules: string[];
  movementRules: string[];
  editingRules: string[];
  soundRules: string[];
  textOverlayRules: string[];
  performanceRules: string[];
  allowedStylization: string[];
  disallowedStylization: string[];
  continuityRules: string[];
  approvedShotIds: string[];
  approvedFormatTemplateIds: VideoFormatTemplateId[];
  founderOverrides: Record<string, unknown>;
};

export type CharacterFilmAuthority = {
  characterId: string;
  identityAnchors: string[];
  bodyProportionAnchors: string[];
  faceAnchors: string[];
  hairAnchors: string[];
  expressionRange: string[];
  gestureVocabulary: string[];
  posture: string;
  walkingBehavior: string;
  sittingBehavior: string;
  cameraAwareness: string;
  socialBehavior: string;
  humorBehavior: string;
  microExpressionRules: string[];
  emotionalRange: string[];
  speechCadence: string;
  voice: string | null;
  negativeBehaviorConstraints: string[];
  referencePackId: string | null;
  continuityBibleId: string | null;
};

export type WardrobeOutfit = {
  continuityId: string;
  mode: WardrobeMode;
  top: string;
  bottom: string;
  outerLayer: string | null;
  shoes: string;
  bag: string | null;
  jewelry: string[];
  eyewear: string | null;
  limeAccent: string | null;
  hairCompatibility: string[];
  environmentCompatibility: NdxEnvironmentId[];
  movementCompatibility: string[];
  season: string;
  temperature: string;
  approvalState: 'APPROVED' | 'DRAFT' | 'PENDING';
};

export type CharacterWardrobeBible = {
  characterId: string;
  modes: WardrobeOutfit[];
  limeRules: string[];
  northStar: string[];
};

export type HairBeautyBible = {
  characterId: string;
  canonicalHairIdentity: string;
  approvedHairModes: string[];
  makeupIntensity: string;
  skinRealism: string;
  nails: string;
  brows: string;
  lashes: string;
  lip: string;
  jewelryCompatibility: string[];
};

export type PropDefinition = {
  propId: string;
  name: string;
  canonicalAppearance: string;
  sceneRole: string;
  continuityImportance: 'HIGH' | 'MEDIUM' | 'LOW';
  handInteractionRisk: ShotRiskLevel;
  providerGenerationRisk: ShotRiskLevel;
  approvedReferenceAsset: string | null;
  replacementRules: string[];
};

export type AccessoryPropBible = {
  brandId: string;
  props: PropDefinition[];
  persistentArtifacts: string[];
};

export type EnvironmentDefinition = {
  environmentId: NdxEnvironmentId;
  visualGrammar: string[];
  lighting: string[];
  cameraPossibilities: string[];
  props: string[];
  backgroundDensity: string;
  realismRisks: string[];
  socialContext: string;
  bestShotClasses: string[];
  timeOfDayOptions: string[];
  wardrobeCompatibility: WardrobeMode[];
};

export type BrandEnvironmentBible = {
  brandId: string;
  environments: EnvironmentDefinition[];
};

export type BrandCinematographyBible = {
  brandId: string;
  primaryPrinciple: string;
  cameraDistancePreference: string[];
  subjectProminence: string;
  environmentVisibility: string;
  framingBias: string[];
  lensRange: string;
  cameraStability: string;
  handheldTolerance: string;
  focusBehavior: string;
  motionBehavior: string;
  directCameraFrequency: string;
  avoid: string[];
};

export type ShotLibraryEntry = {
  shotId: string;
  shotClass: string;
  name: string;
  purpose: string;
  recommendedDuration: { min: number; max: number };
  cameraPosition: string;
  cameraMovement: string;
  lensCharacter: string;
  subjectProminence: string;
  environmentProminence: string;
  performanceBehavior: string;
  propCompatibility: string[];
  modelRiskProfile: ShotRiskLevel;
  preferredProviderEvidence: string[];
  continuityRequirements: string[];
  negativeConstraints: string[];
  referenceExamples: string[];
  founderApprovalState: 'APPROVED' | 'DRAFT' | 'PENDING';
  approvalFrequency: number;
  rejectionFrequency: number;
};

export type BrandShotLibrary = {
  brandId: string;
  shots: ShotLibraryEntry[];
};

export type VideoFormatTemplate = {
  templateId: VideoFormatTemplateId;
  name: string;
  runtimeRange: { min: number; max: number };
  beatStructure: string[];
  shotRoleSequence: string[];
  pacingCurve: string;
  musicBehavior: string;
  ambientSoundBehavior: string;
  dialoguePlacement: string;
  voiceoverRules: string;
  textOverlayRules: string;
  transitionStyle: string;
  openingHookBehavior: string;
  midpointBehavior: string;
  payoffBehavior: string;
  endCardBehavior: string;
  editGrammar: {
    openingRhythm: string;
    averageShotLength: number;
    maxShotLength: number;
    cutAcceleration: string;
    pauseBehavior: string;
    dialoguePriority: string;
    bRollBehavior: string;
    insertBehavior: string;
    endBehavior: string;
  };
};

export type VideoFormatTemplateLibrary = {
  brandId: string;
  templates: VideoFormatTemplate[];
};

export type FounderFilmTasteModel = {
  founderId: string;
  dimensions: Record<string, number>;
  explicitJudgments: Array<{
    filmId: string;
    shotId: string | null;
    action: string;
    dimension: string;
    delta: number;
    at: string;
  }>;
  updatedAt: string;
};

/* ── Input & planning ── */

export type FilmProductionInput = {
  inputId: string;
  inputMode: FilmInputMode;
  title: string;
  objective: string;
  platform: string;
  runtime: { min: number; max: number };
  script: string | null;
  storyboard: FilmStoryboardFrame[] | null;
  formatTemplate: VideoFormatTemplateId | null;
  topic: string | null;
  campaign: string | null;
  desiredMood: string[];
  referenceAssets: string[];
  requiredLines: string[];
  requiredScenes: string[];
  requiredProducts: string[];
  constraints: string[];
};

export type FilmStoryboardFrame = {
  frameId: string;
  beat: string;
  composition: string;
  camera: string;
  action: string;
  subject: string;
  environment: string;
  prop: string | null;
  intendedDuration: number;
  transition: string | null;
  visualAuthority: 'HIGH' | 'MEDIUM' | 'LOW';
  shotClassHint: string | null;
};

export type FilmBeat = {
  beatId: string;
  index: number;
  meaning: string;
  dialogue: string | null;
  action: string;
  emotion: string;
  locationRequirement: NdxEnvironmentId | null;
  propRequirement: string[];
  characterRequirement: string[];
  evidenceRequirement: boolean;
  continuityRequirement: string[];
  transitionPotential: string | null;
};

export type FilmSceneContract = {
  sceneId: string;
  filmId: string;
  purpose: string;
  location: NdxEnvironmentId;
  time: string;
  characterState: string;
  wardrobeContinuityId: string;
  hairBeautyState: string;
  props: string[];
  lighting: string;
  environmentReferences: string[];
  sound: string;
  continuityIn: string[];
  continuityOut: string[];
  shotIds: string[];
  deckState: SceneDeckSceneState;
};

export type FilmShotContract = {
  shotId: string;
  sceneId: string;
  filmId: string;
  shotClass: string;
  storyFunction: string;
  durationTarget: number;
  characterIdentity: string[];
  wardrobe: WardrobeOutfit | null;
  hair: string;
  beauty: string;
  accessories: string[];
  props: string[];
  environment: NdxEnvironmentId;
  cameraPosition: string;
  cameraMovement: string;
  lens: string;
  framing: string;
  composition: string;
  lighting: string;
  action: string;
  microAction: string;
  expression: string;
  gaze: string;
  dialogue: string | null;
  voice: string | null;
  sound: string;
  continuityIn: string[];
  continuityOut: string[];
  referencePack: string[];
  realismRequirements: string[];
  negativeConstraints: string[];
  providerRequirements: string[];
  preferredProviderStack: ProductionStackKind;
  preferredLaneId: string | null;
  generationCount: number;
  qaThresholds: Record<string, number>;
  riskProfile: ShotRiskLevel;
};

export type FilmContinuityNode = {
  nodeId: string;
  shotId: string;
  characterIdentity: string[];
  hair: string;
  wardrobeContinuityId: string;
  jewelry: string[];
  limeArtifact: string | null;
  bag: string | null;
  phone: string | null;
  notebook: string | null;
  location: NdxEnvironmentId;
  time: string;
  light: string;
  propStates: Record<string, string>;
  emotionalState: string;
  dialogueState: string | null;
};

export type FilmContinuityGraph = {
  filmId: string;
  nodes: FilmContinuityNode[];
  conflicts: Array<{ fromShotId: string; toShotId: string; reason: string }>;
};

export type FilmProductionPlan = {
  planId: string;
  filmId: string;
  template: VideoFormatTemplateId;
  beats: FilmBeat[];
  scenes: FilmSceneContract[];
  shots: FilmShotContract[];
  continuityPlan: FilmContinuityGraph;
  wardrobePlan: WardrobeOutfit[];
  locationPlan: NdxEnvironmentId[];
  propPlan: string[];
  voicePlan: string | null;
  soundPlan: string;
  generationPlan: FilmGenerationPlan;
  estimatedCostUsd: number;
  estimatedShotCount: number;
  providerRoutingStatus: string;
  autonomyMode: FilmAutonomyMode;
  compiledAt: string;
};

export type FilmGenerationPlan = {
  planId: string;
  filmId: string;
  approved: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  shots: Array<{
    shotId: string;
    providerStack: ProductionStackKind;
    laneId: string | null;
    estimatedCostUsd: number;
    candidateCount: number;
    riskProfile: ShotRiskLevel;
    blocked: boolean;
    blockReason: string | null;
  }>;
  totalEstimatedCostUsd: number;
  totalGenerations: number;
  blockedShots: string[];
  continuityRisk: string[];
  realismRisk: string[];
  providerSpendAllowed: boolean;
};

export type FilmReadinessEvaluation = {
  filmId: string;
  checks: Record<ReadinessCheck, { ready: boolean; blocker: string | null }>;
  allReady: boolean;
  blockedChecks: ReadinessCheck[];
};

export type RealismProductionStack = {
  shotId: string;
  kind: ProductionStackKind;
  stages: string[];
  currentStage: string | null;
  stillAssetId: string | null;
  videoAssetId: string | null;
};

export type CompiledFilmPrompt = {
  shotId: string;
  providerId: string;
  laneId: string | null;
  payload: Record<string, unknown>;
  promptText: string;
  sections: Record<string, string>;
  authorityOrder: string[];
  compiledAt: string;
  inspectOnly: true;
};

export type FilmShotCandidate = {
  candidateId: string;
  shotId: string;
  filmId: string;
  generationRunId: string;
  assetUrl: string | null;
  qaStatus: QAStatus;
  qaScore: number | null;
  qaFailures: QAFailureCode[];
  correctionPlan: CorrectionPlan | null;
  retryCount: number;
  isPrimary: boolean;
  isAlt: boolean;
  founderVisible: boolean;
  createdAt: string;
};

export type CorrectionPlan = {
  failureCode: QAFailureCode;
  diagnosis: string;
  adjustments: string[];
  retryEligible: boolean;
};

export type FilmShotQA = {
  qaId: string;
  candidateId: string;
  shotId: string;
  scores: Record<string, number>;
  hardGateFailures: QAFailureCode[];
  status: QAStatus;
  evaluatedAt: string;
};

export type FounderDailiesEntry = {
  entryId: string;
  filmId: string;
  sceneId: string;
  shotId: string;
  candidateId: string;
  clipUrl: string | null;
  thumbnailUrl: string | null;
  dialogue: string | null;
  durationSec: number;
  qaScore: number | null;
  founderAction: DailiesAction | null;
  founderNote: string | null;
  reviewedAt: string | null;
};

export type SceneDeckSlot = {
  slotId: string;
  filmId: string;
  sceneId: string;
  shotId: string;
  order: number;
  state: SceneDeckShotState;
  approvedCandidateId: string | null;
  clipUrl: string | null;
  durationSec: number;
  dialogue: string | null;
  voice: string | null;
  sound: string;
  transition: string | null;
  caption: string | null;
  continuityNote: string | null;
  editNote: string | null;
};

export type FilmSceneDeck = {
  deckId: string;
  filmId: string;
  slots: SceneDeckSlot[];
  sceneOrder: string[];
  updatedAt: string;
};

export type EditDecision = {
  decisionId: string;
  clipOrder: number;
  shotId: string;
  candidateId: string;
  trimIn: number;
  trimOut: number;
  targetDuration: number;
  transition: string;
  musicCue: string | null;
  ambientCue: string | null;
  dialogue: string | null;
  voiceover: string | null;
  textOverlay: string | null;
  silenceBeat: boolean;
  speedChange: number | null;
};

export type EditDecisionList = {
  edlId: string;
  filmId: string;
  templateId: VideoFormatTemplateId;
  decisions: EditDecision[];
  totalDuration: number;
  endCard: string | null;
  compiledAt: string;
};

export type FilmRoughCut = {
  roughCutId: string;
  filmId: string;
  edl: EditDecisionList;
  renderStatus: 'READY' | 'ROUGH_CUT_RENDERING_BLOCKED' | 'RENDERED';
  renderUrl: string | null;
  founderReviewActions: Array<{ action: RoughCutAction; note: string | null; at: string }>;
  createdAt: string;
};

export type FilmLineageRecord = {
  filmId: string;
  scriptId: string | null;
  storyboardId: string | null;
  productionPlanId: string | null;
  sceneIds: string[];
  shotContractIds: string[];
  promptSnapshotIds: string[];
  generationRunIds: string[];
  candidateIds: string[];
  qaIds: string[];
  approvedClipIds: string[];
  sceneDeckSlotIds: string[];
  editDecisionIds: string[];
  roughCutId: string | null;
  finalAssetId: string | null;
};

export type FilmProductionRecord = {
  filmId: string;
  projectId: string;
  brandId: string;
  title: string;
  template: VideoFormatTemplateId;
  parentCampaignAssetId: string | null;
  input: FilmProductionInput;
  productionState: FilmWorkflowState;
  autonomyMode: FilmAutonomyMode;
  completedGates: FounderGate[];
  plan: FilmProductionPlan | null;
  generationPlan: FilmGenerationPlan | null;
  readiness: FilmReadinessEvaluation | null;
  candidates: FilmShotCandidate[];
  dailies: FounderDailiesEntry[];
  sceneDeck: FilmSceneDeck | null;
  roughCut: FilmRoughCut | null;
  lineage: FilmLineageRecord;
  accounting: {
    providerRequests: number;
    estimatedCostUsd: number;
    actualCostUsd: number;
    retries: number;
  };
  performanceLinkagePrepared: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FilmProductionState = {
  projectId: string;
  brandId: string;
  films: FilmProductionRecord[];
  tasteModel: FounderFilmTasteModel;
  updatedAt: string;
};

export type StoryboardConflict = {
  frameId: string;
  conflictType: 'BRAND' | 'CONTINUITY' | 'CHARACTER';
  description: string;
  resolution: 'SURFACE' | 'OVERRIDE_STORYBOARD' | 'OVERRIDE_CANON';
};
