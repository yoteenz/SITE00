/**
 * P0.5C.4 — Art-Board Materiality types
 */

import type {
  ART_BOARD_QUALITY_RESULTS,
  ARTIFACT_ATTACHMENTS,
  ARTIFACT_DEPTH_BEHAVIORS,
  ARTIFACT_LAYER_TYPES,
  ARTIFACT_SURFACE_ROLES,
  BASE_SURFACE_CLASSES,
  IMAGE_SURFACE_ROLES,
  IMPERFECT_CANVAS_RESULTS,
  MATERIAL_DENSITY_LEVELS,
  MATERIAL_FAILURE_STATES,
  MATERIAL_MODERNITY_RESULTS,
  PAGE_CONSTRUCTION_MODES,
  PAGE_EDGE_BEHAVIORS,
  PRINT_SCAN_BEHAVIORS,
  TORN_EDGE_BEHAVIORS,
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
export type V23FounderJudgment = (typeof V23_FOUNDER_JUDGMENTS)[number] | null;
export type MaterialFailureState = (typeof MATERIAL_FAILURE_STATES)[number];

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
  founderJudgment: V23FounderJudgment;
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
  founderSetJudgment: V23FounderJudgment;
  error: string | null;
};
