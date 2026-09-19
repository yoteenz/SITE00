import type { NDXIconName } from '../types.js';

export type NdxIconVisualVersion = 'NDX_ICON_V1_REFERENCE_TRACED';

export type NdxIconTraceClassification =
  | 'REFERENCE_TRACED'
  | 'GENERIC_SEMANTIC_APPROXIMATION'
  | 'LEGACY'
  | 'UNKNOWN';

export type NdxIconVisualMatchStatus = 'UNTRACED' | 'TRACED' | 'NEEDS_ADJUSTMENT' | 'VISUAL_MATCH' | 'LOCKED';

export type NdxIconActiveBehavior = 'color-only' | 'structural';

export type IconReferenceSample = {
  iconName: NDXIconName;
  sourceReferenceId: string;
  cropBounds: { x: number; y: number; width: number; height: number };
  referenceAssetId: string;
  referenceWidth: number;
  referenceHeight: number;
  activeState: 'inactive' | 'active';
  screenContext: string;
  confidence: number;
  cropAssetPath?: string;
};

export type IconOpticalBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  visualWidth: number;
  visualHeight: number;
  visualCenterX: number;
  visualCenterY: number;
};

export type IconStrokeCalibration = {
  strokeWidth: number;
  familyWeight: 'thin-medium';
  notes?: string;
};

export type IconOpticalCalibration = {
  opticalScale: number;
  opticalOffsetX: number;
  opticalOffsetY: number;
  bounds: IconOpticalBounds;
};

export type ReferenceTracedIconSpec = {
  iconName: NDXIconName;
  referenceSampleId: string;
  viewBox: number;
  pathData: string[];
  circleData?: Array<{ cx: number; cy: number; r: number; fill?: 'currentColor' | 'none' }>;
  strokeWidth: number;
  fillMode: 'none';
  lineCap: 'round';
  lineJoin: 'round';
  opticalBounds: IconOpticalBounds;
  referenceBounds: IconOpticalBounds;
  optical: IconOpticalCalibration;
  strokeCalibration: IconStrokeCalibration;
  activeBehavior: NdxIconActiveBehavior;
  classification: NdxIconTraceClassification;
  visualMatchStatus: NdxIconVisualMatchStatus;
  visualVersion: NdxIconVisualVersion;
  supersededGeometryId?: string;
  notes?: string;
};

export type IconVisualMatchDimension =
  | 'SILHOUETTE_MATCH'
  | 'STROKE_MATCH'
  | 'PROPORTION_MATCH'
  | 'NEGATIVE_SPACE_MATCH'
  | 'OPTICAL_SIZE_MATCH'
  | 'CENTERING_MATCH'
  | 'ACTIVE_STATE_MATCH';

export type IconVisualMatchEvaluation = {
  iconName: NDXIconName;
  referenceSampleId: string;
  dimensions: Record<IconVisualMatchDimension, number>;
  overallScore: number;
  status: NdxIconVisualMatchStatus;
  overlayRun: boolean;
  notes?: string;
};

export type NdxIconVisualReferenceAuthority = {
  id: string;
  sourceReferenceId: string;
  sourceAssetPath: string;
  boardWidth: number;
  boardHeight: number;
  screenContext: string;
  screenBounds: { x: number; y: number; width: number; height: number };
  iconCropBounds: Record<string, { x: number; y: number; width: number; height: number }>;
};
