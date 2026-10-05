import type { TwinV41RequiredMajorRegionId } from './constants.js';

export type TwinV41ForensicPixelAuthorityLock = {
  artifactId: string;
  artifactHash: string;
  imageUri: string;
  imageWidth: number;
  imageHeight: number;
  immutable: true;
  source: 'FOUNDER_APPROVED_FORENSIC_BLUEPRINT';
};

export type ForensicPixelCoordinateSpace = {
  sourceWidth: number;
  sourceHeight: number;
  originX: number;
  originY: number;
  normalizedScale: number;
};

export type PixelDerivedRegion = {
  regionId: TwinV41RequiredMajorRegionId | string;
  x: number;
  y: number;
  width: number;
  height: number;
  normalizedBounds: { x: number; y: number; w: number; h: number };
  evidenceType: 'PIXEL_CONTRAST' | 'PIXEL_EDGE' | 'PIXEL_COLOR_CLUSTER';
  edgeConfidence: number;
  contrastConfidence: number;
  dominantColors: string[];
  sourcePixelHash: string;
  sourceCropRef: string;
  confidence: number;
  classification: 'CRITICAL' | 'STRUCTURAL' | 'SECONDARY' | 'NOISE';
};

export type ForensicEdgeSegment = {
  edgeId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  thickness: number;
  approximateColor: string;
  confidence: number;
};

export type ForensicEdgeMap = {
  id: string;
  edges: ForensicEdgeSegment[];
};

export type ForensicPixelColorSample = {
  sampleId: string;
  role: string;
  hex: string;
  x: number;
  y: number;
};

export type ForensicPixelColorSampleMap = {
  id: string;
  samples: ForensicPixelColorSample[];
};

export type ForensicTextRegion = {
  textRegionId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lineCount: number;
  alignment: 'left' | 'center' | 'right';
  approximateFontScale: number;
  foregroundColor: string;
  density: number;
  ocrText: string | null;
  confidence: number;
};

export type ForensicTextRegionMap = {
  id: string;
  regions: ForensicTextRegion[];
};

export type ForensicCalloutMarker = {
  calloutId: string;
  visibleNumber: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  textColor: string;
  connectorLineRef: string | null;
  targetRegionRef: string | null;
  confidence: number;
};

export type ForensicCalloutMap = {
  id: string;
  callouts: ForensicCalloutMarker[];
};

export type ForensicVisualObjectRegion = {
  objectRegionId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  objectClass: 'PAGE_PREVIEW' | 'PALETTE_CHIP' | 'TYPO_SAMPLE' | 'DIVIDER_SAMPLE' | 'IMAGE_BLOCK';
  dominantColors: string[];
  edgeShape: 'RECT' | 'ROUND';
  confidence: number;
  sourceCropRef: string;
};

export type PixelEvidenceRef = {
  kind: 'crop' | 'edge' | 'text' | 'callout' | 'visualObject' | 'pixelHash';
  refId: string;
};

export type PixelEvidenceContract = {
  evidenceRefs: PixelEvidenceRef[];
  evidenceCount: number;
  confidence: number;
  extractionMethod: string;
  sourceAuthorityHash: string;
};

export type TwinV41PixelSceneNode = {
  sceneNodeId: string;
  parentNodeId: string | null;
  type: 'DOCUMENT' | 'REGION' | 'GROUP' | 'TEXT' | 'CALLOUT' | 'EDGE' | 'VISUAL_OBJECT';
  x: number;
  y: number;
  width: number;
  height: number;
  semanticLabel: string | null;
  evidence: PixelEvidenceContract;
};

export type TwinV41PixelDerivedSceneGraph = {
  id: string;
  coordinateSpace: ForensicPixelCoordinateSpace;
  rootNodeId: string;
  nodes: TwinV41PixelSceneNode[];
  v40Rejected: true;
  v40RejectionReason: string;
};

export type ForensicPixelAnalysis = {
  id: string;
  coordinateSpace: ForensicPixelCoordinateSpace;
  majorRegions: PixelDerivedRegion[];
  edgeMap: ForensicEdgeMap;
  colorSampleMap: ForensicPixelColorSampleMap;
  textRegionMap: ForensicTextRegionMap;
  calloutMap: ForensicCalloutMap;
  visualObjectRegions: ForensicVisualObjectRegion[];
};

export type TwinV41PixelExtractionGateStatus =
  | 'BLOCKED'
  | 'EXTRACTING'
  | 'FOUNDER_EXTRACTION_REVIEW'
  | 'FOUNDER_APPROVED'
  | 'FOUNDER_REJECTED';

export type TwinV41PixelExtractionReceipt = {
  authorityArtifactId: string;
  authorityHash: string;
  sourceDimensions: { width: number; height: number };
  extractionVersion: string;
  majorRegionCount: number;
  textRegionCount: number;
  edgeCount: number;
  calloutCount: number;
  visualObjectCount: number;
  sceneNodeCount: number;
  nodesWithoutEvidence: number;
  criticalRegionsMissing: string[];
  averageConfidence: number;
  status: TwinV41PixelExtractionGateStatus;
};

export type TwinV41PixelExtractionBundle = {
  lineage: string;
  authorityLock: TwinV41ForensicPixelAuthorityLock;
  analysis: ForensicPixelAnalysis;
  sceneGraph: TwinV41PixelDerivedSceneGraph;
  receipt: TwinV41PixelExtractionReceipt;
  gate: { status: TwinV41PixelExtractionGateStatus };
  reconstructionEngineProof: 'INCONCLUSIVE';
  domReconstructionTriggered: false;
  pixelExtractionReviewRequired: true;
  criticalRegionChecks: Record<TwinV41RequiredMajorRegionId, boolean>;
};

export type TwinV41ProjectStyleFirewall = {
  forbidNdxbookDarkTheme: true;
  forbidLimePageBackground: true;
  forbidV3ImplementationCards: true;
  forbidProjectPanelStyling: true;
};
