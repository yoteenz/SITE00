import type { NDXIconName } from '../types.js';

export type NdxIconVisualVersionV2 = 'NDX_ICON_V2_PIXEL_TRACED';

export type IconGeometryDrawMode = 'STROKE_PATH' | 'FILLED_PATH' | 'MIXED';

export type ExactIconReferenceCrop = {
  iconName: NDXIconName;
  sourceReferenceId: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  referenceScale: number;
  activeState: 'inactive' | 'active';
  foregroundColor: string;
  backgroundColor: string;
};

export type IconPixelMask = {
  iconName: NDXIconName;
  width: number;
  height: number;
  /** 0 = background, 1 = foreground */
  data: Uint8Array;
  foregroundPixelCount: number;
  extractionNotes?: string;
};

export type IconVectorContour = {
  iconName: NDXIconName;
  drawMode: IconGeometryDrawMode;
  /** Closed polygon contours in crop pixel space */
  outerContours: Array<Array<{ x: number; y: number }>>;
  holes: Array<Array<{ x: number; y: number }>>;
  /** Disconnected filled marks (dots) */
  dots: Array<{ cx: number; cy: number; r: number }>;
  /** Internal stroke segments */
  internalStrokes: Array<Array<{ x: number; y: number }>>;
};

export type IconReferenceFootprint = {
  iconName: NDXIconName;
  referenceOuterWidth: number;
  referenceOuterHeight: number;
  referenceVisualCenterX: number;
  referenceVisualCenterY: number;
  referenceToButtonRatio: number;
};

export type ExactIconGeometryMetric =
  | 'MASK_IOU'
  | 'SILHOUETTE_DELTA'
  | 'BOUNDING_BOX_DELTA'
  | 'CENTER_DELTA'
  | 'NEGATIVE_SPACE_DELTA'
  | 'STROKE_FOOTPRINT_DELTA';

export type ExactIconGeometryEvaluation = {
  iconName: NDXIconName;
  referenceSampleId: string;
  metrics: Record<ExactIconGeometryMetric, number>;
  overallScore: number;
  status: 'VISUAL_MATCH' | 'NEEDS_ADJUSTMENT' | 'LOCKED';
  overlayRun: boolean;
  semanticSubstitutionDetected: boolean;
  failureCodes: string[];
  notes?: string;
};

export type PixelTracedIconSpec = {
  iconName: NDXIconName;
  referenceSampleId: string;
  viewBox: number;
  pathData: string[];
  circleData?: Array<{ cx: number; cy: number; r: number; fill?: 'currentColor' | 'none' }>;
  drawMode: IconGeometryDrawMode;
  strokeWidth: number;
  fillMode: 'none';
  lineCap: 'round';
  lineJoin: 'round';
  opticalBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    visualWidth: number;
    visualHeight: number;
    visualCenterX: number;
    visualCenterY: number;
  };
  footprint: IconReferenceFootprint;
  classification: 'PIXEL_TRACED';
  visualMatchStatus: 'VISUAL_MATCH' | 'NEEDS_ADJUSTMENT' | 'LOCKED';
  visualVersion: NdxIconVisualVersionV2;
  supersededGeometryId: string;
  maskIou: number;
  notes?: string;
};

export type IconTraceOverlayResult = {
  iconName: NDXIconName;
  referenceCropPath: string;
  traceRasterPath: string;
  overlayPath: string;
  differenceMaskPath: string;
  pass: boolean;
};

export type NdxIconPixelReferenceAuthority = {
  id: string;
  sourceReferenceId: string;
  sourceAssetPath: string;
  imageWidth: number;
  imageHeight: number;
  screenContext: string;
  iconCrops: Record<string, ExactIconReferenceCrop>;
};

export type SemanticSubstitutionAudit = {
  iconName: NDXIconName;
  referenceSilhouette: string;
  implementationSilhouette: string;
  passed: boolean;
  failureCode?: 'FAIL_ICON_SEMANTIC_SUBSTITUTION';
};
