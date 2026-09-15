import type { TwinV4ForensicReconstructionGateStatus } from './constants.js';

export type { TwinV4ForensicReconstructionGateStatus };

export type TwinV4IsolationContract = {
  inheritsV3RenderTree: false;
  inheritsV3Css: false;
  inheritsV3LayoutContracts: false;
  inheritsV3ExpressionIR: false;
  inheritsV3TranslationBrief: false;
  inheritsV3ForensicGenerationPath: false;
  inheritsV3AutobuildCache: false;
};

export type TwinV4ForensicAuthorityLock = {
  forensicBlueprintArtifactId: string;
  forensicBlueprintHash: string;
  sourcePackageId: string;
  approvedAt: string;
  approvalStatus: 'APPROVED';
  immutable: true;
};

export type TwinV4ForensicBlueprintIngestionReceipt = {
  id: string;
  forensicBlueprintArtifactId: string;
  forensicBlueprintHash: string;
  contentUri: string;
  contentAvailable: boolean;
  noRegeneration: true;
  ingestedAt: string;
};

export type TwinV4SceneNodeType =
  | 'PAGE'
  | 'SECTION'
  | 'GROUP'
  | 'PANEL'
  | 'TEXT'
  | 'TABLE'
  | 'TABLE_ROW'
  | 'CALLOUT'
  | 'LEGEND'
  | 'ANNOTATION';

export type TwinV4VisualSceneNode = {
  sceneNodeId: string;
  parentNodeId: string | null;
  type: TwinV4SceneNodeType;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  alignment: 'left' | 'center' | 'right';
  background: string | null;
  border: string | null;
  radius: string | null;
  textRole: string | null;
  textContent: string | null;
  textUncertain: boolean;
  assetRole: string | null;
  visualWeight: number;
  siblingOrder: number;
  sectionMembership: string;
  confidence: number;
};

export type TwinV4VisualSceneGraph = {
  id: string;
  hash: string;
  rootNodeId: string;
  nodes: TwinV4VisualSceneNode[];
  canonicalViewport: { widthPx: number; heightPx: number };
};

export type TwinV4TextObjectEntry = {
  sceneNodeId: string;
  text: string;
  role: string;
  fontFamily: string;
  sizePx: number;
  weight: number;
  lineHeight: number;
  tracking: string;
  alignment: string;
  casing: string;
  widthRatio: number;
  lineCount: number;
  uncertain: boolean;
};

export type TwinV4TextObjectMap = {
  id: string;
  entries: TwinV4TextObjectEntry[];
};

export type TwinV4DomPlanNode = {
  sceneNodeId: string;
  elementType: 'div' | 'span' | 'section';
  positioning: 'absolute' | 'relative' | 'flex-child';
  parentLayout: 'absolute-stack' | 'flex-column' | 'flex-row' | 'grid';
  widthBehavior: string;
  heightBehavior: string;
  typographyRule: string | null;
  borderRule: string | null;
  backgroundRule: string | null;
  assetRule: string | null;
};

export type TwinV4DomReconstructionPlan = {
  id: string;
  hash: string;
  nodes: TwinV4DomPlanNode[];
};

export type TwinV4DomMeasurement = {
  sceneNodeId: string;
  targetXRatio: number;
  targetYRatio: number;
  targetWidthRatio: number;
  targetHeightRatio: number;
  liveXRatio: number;
  liveYRatio: number;
  liveWidthRatio: number;
  liveHeightRatio: number;
};

export type TwinV4DomMeasurementMap = {
  id: string;
  viewport: { widthPx: number; heightPx: number };
  measurements: TwinV4DomMeasurement[];
};

export type TwinV4ObjectGeometryReceipt = {
  sceneNodeId: string;
  xDeltaRatio: number;
  yDeltaRatio: number;
  widthDeltaRatio: number;
  heightDeltaRatio: number;
  withinTolerance: boolean;
};

export type TwinV4RegionDriftLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TwinV4VisualComparisonReceipt = {
  id: string;
  silhouetteMatch: boolean;
  sectionPositionsMatch: boolean;
  tableWidthMatch: boolean;
  legendPositionsMatch: boolean;
  typographyDensityMatch: boolean;
  calloutAlignmentMatch: boolean;
  whitespaceMatch: boolean;
  overallScore: number;
};

export type TwinV4RegionDriftReport = {
  regionId: string;
  drift: TwinV4RegionDriftLevel;
};

export type TwinV4RealBrowserScreenshot = {
  id: string;
  proofKind: 'PLAYWRIGHT_DOM' | 'MANUAL_FOUNDER';
  screenshotPath: string;
  screenshotHash: string;
  viewport: { widthPx: number; heightPx: number };
  capturedAt: string;
};

export type TwinV4CorrectionIteration = {
  iteration: number;
  geometryReceipts: TwinV4ObjectGeometryReceipt[];
  codeCorrections: string[];
  screenshot: TwinV4RealBrowserScreenshot;
};

export type TwinV4ForensicReconstructionGate = {
  status: TwinV4ForensicReconstructionGateStatus;
  realBrowserScreenshotPresent: boolean;
  runtimeRasterUsage: number;
  sceneGraphConsumed: boolean;
  domMeasurementsCaptured: boolean;
  majorHighDriftCount: number;
};

export type TwinV4ReconstructionProofAnswer = 'YES' | 'NO' | 'INCONCLUSIVE';

export type TwinV4ForensicReconstructionBundle = {
  lineage: typeof import('./constants.js').P0_VR_TWIN_V40_LINEAGE;
  isolation: TwinV4IsolationContract;
  authorityLock: TwinV4ForensicAuthorityLock;
  ingestionReceipt: TwinV4ForensicBlueprintIngestionReceipt;
  sceneGraph: TwinV4VisualSceneGraph;
  textMap: TwinV4TextObjectMap;
  domPlan: TwinV4DomReconstructionPlan;
  domMeasurementMap: TwinV4DomMeasurementMap;
  geometryReceipts: TwinV4ObjectGeometryReceipt[];
  visualComparison: TwinV4VisualComparisonReceipt;
  regionDrifts: TwinV4RegionDriftReport[];
  correctionIterations: TwinV4CorrectionIteration[];
  gate: TwinV4ForensicReconstructionGate;
  proofAnswer: TwinV4ReconstructionProofAnswer;
  proofPrimaryCause: string | null;
};
