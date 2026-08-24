/**
 * P0.5C.4 — Art-Board Materiality types
 */

import type {
  ANTI_AI_ARTIFACT_RESULTS,
  ART_BOARD_QUALITY_RESULTS,
  ARTIFACT_ATTACHMENTS,
  ARTIFACT_DEPTH_BEHAVIORS,
  ARTIFACT_LAYER_TYPES,
  ARTIFACT_SURFACE_ROLES,
  BASE_SURFACE_CLASSES,
  HAND_DRAWN_ICON_SUBJECTS,
  HAND_MARK_LEGIBILITY_RESULTS,
  HUMAN_MADE_FAILURE_STATES,
  HUMAN_MADE_MARK_CLASSES,
  HUMAN_MARK_CONSISTENCY_RESULTS,
  IMAGE_SURFACE_ROLES,
  IMPERFECT_CANVAS_RESULTS,
  LIME_APPLICATION_MODES,
  LIME_FEED_DISTANCE_RESULTS,
  LIME_INTERVENTION_DENSITY_LEVELS,
  MAKER_EVIDENCE_STRENGTH_LEVELS,
  MATERIAL_DENSITY_LEVELS,
  MATERIAL_FAILURE_STATES,
  MATERIAL_MODERNITY_RESULTS,
  PAGE_CONSTRUCTION_MODES,
  PAGE_EDGE_BEHAVIORS,
  PRINT_SCAN_BEHAVIORS,
  TORN_EDGE_BEHAVIORS,
  SIGNATURE_LIME_ACCENT_TARGETS,
  SIGNATURE_LIME_FAILURE_STATES,
  V23A_FOUNDER_JUDGMENTS,
  V23B_FOUNDER_JUDGMENTS,
  V23_FOUNDER_JUDGMENTS,
} from './constants.js';
import type { CharacterRetainedFirstSlideContract, Experiment01V22Artifact } from '../characterRetention/types.js';

export type BaseSurfaceClass = (typeof BASE_SURFACE_CLASSES)[number];
export type ArtifactSurfaceRole = (typeof ARTIFACT_SURFACE_ROLES)[number];
export type PageConstructionMode = (typeof PAGE_CONSTRUCTION_MODES)[number];
export type PageEdgeBehavior = (typeof PAGE_EDGE_BEHAVIORS)[number];
export type TornEdgeBehavior = (typeof TORN_EDGE_BEHAVIORS)[number];
export type ArtifactLayerType = (typeof ARTIFACT_LAYER_TYPES)[number];
export type ArtifactAttachment = (typeof ARTIFACT_ATTACHMENTS)[number];
export type ArtifactDepthBehavior = (typeof ARTIFACT_DEPTH_BEHAVIORS)[number];
export type PrintScanBehavior = (typeof PRINT_SCAN_BEHAVIORS)[number];
export type ImperfectCanvasResult = (typeof IMPERFECT_CANVAS_RESULTS)[number];
export type MaterialDensityLevel = (typeof MATERIAL_DENSITY_LEVELS)[number];
export type ArtBoardQualityResult = (typeof ART_BOARD_QUALITY_RESULTS)[number];
export type MaterialModernityResult = (typeof MATERIAL_MODERNITY_RESULTS)[number];
export type ImageSurfaceRole = (typeof IMAGE_SURFACE_ROLES)[number];
export type V23FounderJudgment =
  | (typeof V23_FOUNDER_JUDGMENTS)[number]
  | (typeof V23A_FOUNDER_JUDGMENTS)[number]
  | (typeof V23B_FOUNDER_JUDGMENTS)[number]
  | null;
export type MaterialFailureState = (typeof MATERIAL_FAILURE_STATES)[number];
export type HumanMadeFailureState = (typeof HUMAN_MADE_FAILURE_STATES)[number];
export type HumanMadeMarkClass = (typeof HUMAN_MADE_MARK_CLASSES)[number];
export type HandDrawnIconSubject = (typeof HAND_DRAWN_ICON_SUBJECTS)[number];
export type LimeInterventionDensity = (typeof LIME_INTERVENTION_DENSITY_LEVELS)[number];
export type LimeApplicationMode = (typeof LIME_APPLICATION_MODES)[number];
export type AntiAIArtifactResult = (typeof ANTI_AI_ARTIFACT_RESULTS)[number];
export type MakerEvidenceStrength = (typeof MAKER_EVIDENCE_STRENGTH_LEVELS)[number];
export type HumanMarkConsistencyResult = (typeof HUMAN_MARK_CONSISTENCY_RESULTS)[number];
export type LimeFeedDistanceResult = (typeof LIME_FEED_DISTANCE_RESULTS)[number];
export type HandMarkLegibilityResult = (typeof HAND_MARK_LEGIBILITY_RESULTS)[number];

export type HandDrawnIconSpec = {
  subject: HandDrawnIconSubject | string;
  markClass: 'HAND_DRAWN_ICON';
  whyDrawn: string;
  limeApplied: true;
  applicationMode: LimeApplicationMode;
};

export type NdxHumanMadeMark = {
  markClass: HumanMadeMarkClass;
  appliedBy: 'NDX';
  applicationMode: LimeApplicationMode;
  causality: string;
  semanticPurpose: string;
  limeApplied: boolean;
  printedVsApplied: 'PRINTED' | 'APPLIED';
};

export type NDXHumanMadeMarkSystem = {
  systemId: string;
  marks: NdxHumanMadeMark[];
  handDrawnIcons: HandDrawnIconSpec[];
  sameHandFamily: string;
  makerActions: string[];
  headlineHierarchyPreserved: true;
};

export type NDXLimeInterventionSystem = {
  density: LimeInterventionDensity;
  applicationModes: LimeApplicationMode[];
  interventionSites: string[];
  semanticPurposes: string[];
  decorativeOnly: false;
  appliedAfterBaseMaterial: boolean;
  elementCount: number;
  semanticallyJustifiedCount: number;
};

export type HumanMarkConsistencyEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: HumanMarkConsistencyResult;
  sameStrokeFamily: boolean;
  mixedIconSystems: boolean;
  evaluatedAt: string;
};

export type AntiAIGeneratedArtifactEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: AntiAIArtifactResult;
  machineSignals: string[];
  passesGate: boolean;
  evaluatedAt: string;
};

export type LimeFeedDistanceEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: LimeFeedDistanceResult;
  evaluatedAt: string;
};

export type HandMarkLegibilityEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: HandMarkLegibilityResult;
  feedRhythmContribution: boolean;
  evaluatedAt: string;
};

export type HumanMadeArtifactEvaluation = {
  evaluationId: string;
  artifactId: string;
  markSystem: NDXHumanMadeMarkSystem;
  limeIntervention: NDXLimeInterventionSystem;
  humanMarkConsistency: HumanMarkConsistencyEvaluation;
  antiAi: AntiAIGeneratedArtifactEvaluation;
  makerEvidenceStrength: MakerEvidenceStrength;
  limeFeedDistance: LimeFeedDistanceEvaluation;
  handMarkLegibility: HandMarkLegibilityEvaluation;
  passesHumanMadeGate: boolean;
  failureStates: HumanMadeFailureState[];
  evaluatedAt: string;
};

export type FeedMakerRhythm = {
  boardId: string;
  handDrawnIconPosts: number;
  handwritingPosts: number;
  markerHighlightPosts: number;
  correctionPosts: number;
  minimalInterventionPosts: number;
  allSameDoodleBehavior: boolean;
  sameMakerDifferentBehaviors: boolean;
};

export type HumanMarkCalibration = {
  calibrationId: string;
  classification: 'HUMAN_MARK_CALIBRATION';
  handDrawnQuality: 'HIGH';
  makerTraces: 'HIGH';
  visualSpontaneity: 'MODERATE';
  evaluatedAt: string;
};

export type LimeInterventionCalibration = {
  calibrationId: string;
  classification: 'LIME_INTERVENTION_CALIBRATION';
  visibility: 'MODERATE';
  appliedNotDecorative: true;
  evaluatedAt: string;
};

export type MakerAuthenticityCalibration = {
  calibrationId: string;
  classification: 'MAKER_AUTHENTICITY_CALIBRATION';
  humanAuthorship: 'HIGH';
  antiAiVectorGuard: 'HIGH';
  evaluatedAt: string;
};

export type SignatureLimeAccentTarget = (typeof SIGNATURE_LIME_ACCENT_TARGETS)[number];
export type SignatureLimeFailureState = (typeof SIGNATURE_LIME_FAILURE_STATES)[number];

export type NDXSignatureLimePresenceRequirement = {
  signatureLimePresent: 'REQUIRED';
  minimumVisibleSignatureElements: number;
  maximumVisibleSignatureElements: 'CONTEXT_DEPENDENT';
  dominantLimeRequired: false;
  limeBackgroundRequired: false;
  limeTypographyRequired: false;
  limeHandwritingRequired: false;
};

export type WordLevelSignatureAccent = {
  word: string;
  role: 'PUNCHLINE' | 'JUDGMENT' | 'QUESTION' | 'CORRECTION' | 'KEY';
  colorToken: string;
  inHeadline: boolean;
};

export type NDXSignatureLimeAccentSelection = {
  targetType: SignatureLimeAccentTarget;
  targetText: string;
  reason: string;
  colorToken: string;
  wordLevelAccent: WordLevelSignatureAccent | null;
  punctuationAccent: string | null;
  secondaryAccent: NDXSignatureLimeAccentSelection | null;
};

export type NDXAuthoredColorOwnershipEvaluation = {
  evaluationId: string;
  artifactId: string;
  ownership: 'SOURCE_COLOR' | 'NDX_SIGNATURE_COLOR' | 'SEMANTIC_EXCEPTION' | 'ACCIDENTAL_GENERATED_COLOR';
  ndxAuthoredMarkColor: string;
  passes: boolean;
  evaluatedAt: string;
};

export type SignatureLimeArtifactEvaluation = {
  evaluationId: string;
  artifactId: string;
  requirement: NDXSignatureLimePresenceRequirement;
  accentSelection: NDXSignatureLimeAccentSelection;
  presence: import('../../site00-studio-world-production/signatureBrandTrace/types.js').SignatureTracePresenceEvaluation;
  dominance: import('../../site00-studio-world-production/signatureBrandTrace/types.js').SignatureTraceDominanceEvaluation;
  perceptible: import('../../site00-studio-world-production/signatureBrandTrace/types.js').PerceptibleSignatureEvaluation;
  colorOwnership: NDXAuthoredColorOwnershipEvaluation;
  passesSignatureLimeGate: boolean;
  failureStates: SignatureLimeFailureState[];
  evaluatedAt: string;
};

export type SignatureLimeRevision = {
  revisionId: string;
  revisionType: 'SIGNATURE_LIME_REVISION';
  parentFingerprint: string;
  migrationClass: V23SignatureLimeMigrationResult['revisionClass'];
  preserve: string[];
  changeOnly: string[];
  colorToken: string;
  appliedAt: string;
};

export type V23SignatureLimeMigrationResult = {
  artifactId: string;
  topicIndex: number;
  signatureLimePresent: boolean;
  semanticTarget: string;
  ndxMakerMarkPresent: boolean;
  currentCompetingAccent: string | null;
  revisionRequired: boolean;
  revisionClass:
    | 'PASS_AS_IS'
    | 'MICRO_LIME_REVISION'
    | 'SEMANTIC_LIME_REVISION'
    | 'MAKER_MARK_REVISION'
    | 'FULL_REVISION_REQUIRED';
};

export type FeedSignatureColorContinuityEvaluation = {
  boardId: string;
  allArtifactsContainSignatureLime: boolean;
  manifestationTypes: string[];
  uniqueManifestationCount: number;
  templateRepetitionDetected: boolean;
  cohesionWithoutTemplate: boolean;
  evaluatedAt: string;
};

export type V23HumanMadeRevision = {
  revisionId: string;
  parentFingerprint: string;
  revisionAppliedAt: string;
  preserve: string[];
  change: string[];
  mustNotBecome: string[];
};

export type ArtifactMaterialitySystem = {
  baseSurface: BaseSurfaceClass;
  surfaceAge: 'FRESH' | 'HANDLED' | 'WORN' | 'ARCHIVAL';
  surfaceFinish: 'MATTE' | 'GLOSS' | 'TEXTURED' | 'SMOOTH';
  surfaceWeight: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  surfaceColor: string;
  surfaceIntegrity: 'INTACT' | 'PARTIAL' | 'FRAGMENT';
  edgeBehavior: PageEdgeBehavior;
  foldBehavior: 'NONE' | 'CORNER' | 'PARTIAL' | 'FULL';
  tearBehavior: TornEdgeBehavior;
  bindingBehavior: 'NONE' | 'SPIRAL' | 'STAPLED' | 'BOUND' | 'LOOSE';
  layerBehavior: ArtifactDepthBehavior;
  attachmentBehavior: ArtifactAttachment;
  markingBehavior: 'NONE' | 'ANNOTATED' | 'STAMPED' | 'CORRECTED';
  printingBehavior: PrintScanBehavior;
  scanningBehavior: PrintScanBehavior;
  shadowBehavior: 'NONE' | 'SUBTLE' | 'EDGE' | 'LAYER';
  wearBehavior: 'NONE' | 'LIGHT' | 'MODERATE';
  handlingEvidence: string[];
};

export type ArtifactLayer = {
  layerType: ArtifactLayerType;
  role: ArtifactSurfaceRole;
  order: number;
  enteredBy: 'ORIGINAL' | 'NDX_INTERVENTION';
  aboveLayer: ArtifactLayerType | null;
  belowLayer: ArtifactLayerType | null;
  causality: string;
};

export type ArtifactConstructionHistory = {
  firstPresent: string;
  ndxAdded: string[];
  ndxRemoved: string[];
  ndxCorrected: string[];
  tapedLater: string[];
  moved: string[];
  overlaps: string[];
  originalSource: string[];
  ndxIntervention: string[];
};

export type CanvasObjectContract = {
  artifactId: string;
  canvasType: PageConstructionMode;
  canvasDimensions: 'SQUARE_FEED' | 'PORTRAIT' | 'LANDSCAPE';
  canvasOrientation: 'UPRIGHT' | 'SLIGHTLY_ROTATED';
  edgeState: PageEdgeBehavior;
  surfaceCondition: string;
  surfaceTexture: string;
  surfaceAge: string;
  physicalDepth: ArtifactDepthBehavior;
  layerCount: number;
  croppingBehavior: string;
  shadowBehavior: string;
  foldBehavior: string;
  tearBehavior: TornEdgeBehavior;
  attachmentPoints: { mechanism: ArtifactAttachment; causality: string }[];
  overlapRules: string[];
  spatialImperfection: string;
  constructionLogic: string;
  whyThisCanvas: string;
  mustNotBecome: string[];
};

export type ArtBoardDirectionContract = {
  id: string;
  projectId: string;
  artifactId: string;
  materialitySystem: ArtifactMaterialitySystem;
  canvasObject: CanvasObjectContract;
  artifactForm: string;
  pageConstructionMode: PageConstructionMode;
  constructionHistory: ArtifactConstructionHistory;
  primaryLayer: ArtifactLayer;
  secondaryLayers: ArtifactLayer[];
  attachmentLogic: { mechanism: ArtifactAttachment; causality: string; placement: string }[];
  edgeBehavior: PageEdgeBehavior;
  depthBehavior: ArtifactDepthBehavior;
  surfaceImperfection: string;
  visualAnchor: string;
  materialAnchor: string;
  typographySurfaceInteraction: string[];
  imageSurfaceInteraction: string[];
  evidenceSurfaceInteraction: string[];
  controlledBreaks: string[];
  whyThisArtBoard: string;
  whyNotCleanTemplate: string;
  mustPreserve: string[];
  mustAvoid: string[];
  modernNotebookExpression: ModernNotebookExpression | null;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type ModernNotebookExpression = {
  contemporary: true;
  traits: string[];
  mustNotFeel: string[];
};

export type MaterialDensityEvaluation = {
  evaluationId: string;
  artifactId: string;
  level: MaterialDensityLevel;
  independentFromText: true;
  independentFromCharacter: true;
  evaluatedAt: string;
};

export type ImperfectCanvasEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: ImperfectCanvasResult;
  canvasParticipation: boolean;
  evaluatedAt: string;
};

export type ArtBoardQualityEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: ArtBoardQualityResult;
  feelsLikeObject: boolean;
  templateRisk: boolean;
  evaluatedAt: string;
};

export type MaterialModernityEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: MaterialModernityResult;
  evaluatedAt: string;
};

export type MaterialCharacterFitEvaluation = {
  evaluationId: string;
  artifactId: string;
  fit: 'STRONG' | 'ADEQUATE' | 'WEAK';
  whyNDXWouldHaveThis: string;
  evaluatedAt: string;
};

export type ArtifactMaterialityEvaluation = {
  evaluationId: string;
  artifactId: string;
  materialDensity: MaterialDensityEvaluation;
  imperfectCanvas: ImperfectCanvasEvaluation;
  artBoardQuality: ArtBoardQualityEvaluation;
  materialModernity: MaterialModernityEvaluation;
  materialCharacterFit: MaterialCharacterFitEvaluation;
  imageSurfaceRole: ImageSurfaceRole;
  passesApprovalGate: boolean;
  failureStates: MaterialFailureState[];
  evaluatedAt: string;
};

export type ArtBoardRetainedFirstSlideContract = CharacterRetainedFirstSlideContract & {
  artBoardDirection: ArtBoardDirectionContract;
  materialityEvaluation: ArtifactMaterialityEvaluation;
  humanMadeEvaluation?: HumanMadeArtifactEvaluation | null;
  humanMadeRevision?: V23HumanMadeRevision | null;
  signatureLimeEvaluation?: SignatureLimeArtifactEvaluation | null;
  signatureLimeRevision?: SignatureLimeRevision | null;
};

export type V23FounderRevisionRecord = {
  revisionId: string;
  judgment: V23FounderJudgment;
  founderNote: string;
  appliedAt: string;
  parentAssetUrl: string | null;
  previousFingerprint: string;
  revisionDirective: string;
  falPromptHash: string;
  generatedAssetUrl: string | null;
  status: 'GENERATING' | 'GENERATED' | 'FAILED';
};

export type Experiment01V23Artifact = {
  id: string;
  v1ArtifactId: string;
  v22ArtifactId: string;
  topic: string;
  subject: string;
  contract: ArtBoardRetainedFirstSlideContract;
  carouselArchitecture: Experiment01V22Artifact['carouselArchitecture'];
  editorialDecision: Experiment01V22Artifact['editorialDecision'];
  generationContract: Experiment01V22Artifact['generationContract'];
  generatedAssetId: string | null;
  generatedAssetUrl: string | null;
  generationStatus: 'NOT_GENERATED' | 'GENERATING' | 'GENERATED' | 'FAILED';
  materialityEvaluation: ArtifactMaterialityEvaluation;
  humanMadeEvaluation: HumanMadeArtifactEvaluation | null;
  humanMadeRevision: V23HumanMadeRevision | null;
  signatureLimeEvaluation: SignatureLimeArtifactEvaluation | null;
  signatureLimeRevision: SignatureLimeRevision | null;
  signatureLimeMigration: V23SignatureLimeMigrationResult | null;
  parentFingerprint: string | null;
  parentGeneratedAssetUrl: string | null;
  founderJudgment: V23FounderJudgment;
  founderJudgmentNote: string | null;
  revisionHistory: V23FounderRevisionRecord[];
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type FeedMaterialRhythm = {
  boardId: string;
  surfaceDistribution: Record<string, number>;
  constructionModeDistribution: Record<string, number>;
  edgeDistribution: Record<string, number>;
  depthDistribution: Record<string, number>;
  attachmentDistribution: Record<string, number>;
  printScanDistribution: Record<string, number>;
  allSameCanvas: boolean;
  allTornPaper: boolean;
  allNotebook: boolean;
  allCollage: boolean;
  variationAdequate: boolean;
};

export type ArtBoardMaterialityCalibration = {
  calibrationId: string;
  northStarId: string;
  surfaceTactility: 'HIGH';
  artifactConstruction: 'HIGH';
  handledObjectFeel: 'HIGH';
  imperfectCanvas: 'HIGH';
  specificPaperType: 'LOW';
  tornEdgeRequirement: 'NONE';
  tapeRequirement: 'NONE';
  notebookRequirement: 'NONE';
  classification: 'ART_BOARD_MATERIALITY_CALIBRATION';
  identityAuthority: 'NONE';
  evaluatedAt: string;
};

export type ContentPackageArtBoardLayer = {
  artBoardDirectionContractId: string;
  contract: ArtBoardDirectionContract;
};

export type MarketingExpressionExperiment01V23 = {
  experimentId: string;
  version: 'EXPERIMENT_01_V2_3_ART_BOARD_MATERIALITY';
  projectId: string;
  status: 'NOT_STARTED' | 'CONTRACTS_READY' | 'GENERATING' | 'GENERATED' | 'FOUNDER_REVIEW' | 'FAILED';
  topics: string[];
  v1ArtifactIds: string[];
  v22ArtifactIds: string[];
  artBoardContracts: ArtBoardRetainedFirstSlideContract[];
  generatedArtifacts: Experiment01V23Artifact[];
  feedMaterialRhythm: FeedMaterialRhythm | null;
  northStarMaterialCalibration: ArtBoardMaterialityCalibration | null;
  humanMarkCalibration: HumanMarkCalibration | null;
  limeInterventionCalibration: LimeInterventionCalibration | null;
  makerAuthenticityCalibration: MakerAuthenticityCalibration | null;
  feedMakerRhythm: FeedMakerRhythm | null;
  feedSignatureColorContinuity: FeedSignatureColorContinuityEvaluation | null;
  signatureLimeMigrations: V23SignatureLimeMigrationResult[];
  founderSetJudgment: V23FounderJudgment;
  error: string | null;
};
