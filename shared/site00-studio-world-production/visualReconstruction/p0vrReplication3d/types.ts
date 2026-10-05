/**
 * P0.VR.REPLICATION.3D — Authority-relative coordinate map + grid lock types.
 */

export const MEASUREMENT_SOURCES = [
  'VISION',
  'EDGE_DETECTION',
  'DOM_REFERENCE',
  'MANUAL_NORMALIZATION',
  'RELATIONSHIP_INFERENCE',
] as const;

export type MeasurementSource = (typeof MEASUREMENT_SOURCES)[number];

export const GEOMETRY_FAILURE_CODES = [
  'AUTHORITY_VIEWPORT_INVALID',
  'AUTHORITY_COORDINATE_MAP_FAILED',
  'AUTHORITY_GRID_FAILED',
  'RENDERED_BOUNDS_MISSING',
  'GEOMETRY_DELTA_EXCEEDS_TOLERANCE',
  'TEXT_WRAP_DRIFT',
  'BASELINE_DRIFT',
  'IMAGE_CROP_DRIFT',
  'STALE_COORDINATE_MAP',
  'STALE_TWIN_GEOMETRY',
] as const;

export type GeometryFailureCode = (typeof GEOMETRY_FAILURE_CODES)[number];

export type NormRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type AuthorityElementBounds = {
  elementId: string;
  regionId: string;
  role: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  measurementSource: MeasurementSource;
} & NormRect;

export type AuthorityCoordinateMap = {
  mapId: string;
  pageId: string;
  viewport: string;
  authorityWidthPx: number;
  authorityHeightPx: number;
  normalizedWidth: number;
  normalizedHeight: number;
  sourceAuthorityId: string;
  authorityContentViewportBounds: NormRect & { widthPx: number; heightPx: number; leftPx: number; topPx: number };
  regions: { regionId: string; role: string; bounds: NormRect }[];
  elements: AuthorityElementBounds[];
  createdAt: string;
};

export type AuthorityGrid = {
  gridId: string;
  outerMarginLeft: number;
  outerMarginRight: number;
  columnCount: number;
  columnWidths: number[];
  gutters: number[];
  horizontalGuides: number[];
  verticalGuides: number[];
  baselineGuides: number[];
};

export type GeometricTarget = {
  elementId: string;
  authorityBounds: NormRect;
  targetBoundsPx: { x: number; y: number; width: number; height: number };
  tolerance: { positionPx: number; sizePx: number };
  priority: number;
  responsivePolicy: 'LOCK_TO_AUTHORITY' | 'FLEX_WITH_CLAMP';
};

export type RenderedElementBounds = {
  elementId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type GeometryDelta = {
  elementId: string;
  authority: NormRect;
  rendered: RenderedElementBounds;
  deltaX: number;
  deltaY: number;
  deltaWidth: number;
  deltaHeight: number;
  leftEdgeError: number;
  rightEdgeError: number;
  topEdgeError: number;
  bottomEdgeError: number;
  centerError: number;
  baselineError: number;
  gapError: number;
  severity: number;
  withinTolerance: boolean;
  textWrapDrift?: boolean;
};

export type AuthorityCropGeometry = {
  slotId: string;
  containerBounds: NormRect;
  sourceAspect: number;
  visibleSourceWindow: string;
  objectFit: 'cover' | 'contain';
  objectPosition: string;
};

export type GeometricExecutionPlan = {
  planId: string;
  regionId: string;
  authorityGrid: AuthorityGrid;
  targetElements: GeometricTarget[];
  cssStrategy: 'CSS_GRID' | 'FLEX' | 'GRID_AND_OVERLAY';
  overlayElements: string[];
  dynamicContentPolicy: 'TRUNCATE' | 'LINE_CLAMP' | 'WRAP_WITH_MAX_WIDTH';
  tolerancePolicy: { bandPositionPx: number; bandSizePx: number; internalPx: number; navPx: number; textPx: number };
};

export type GeometryCorrectionPass = {
  passId: string;
  regionId: string;
  beforeErrors: GeometryDelta[];
  sourceChanges: string[];
  afterErrors: GeometryDelta[];
  maxErrorBefore: number;
  maxErrorAfter: number;
  meanErrorBefore: number;
  meanErrorAfter: number;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
};

export type GeometryFidelityReceipt = {
  regionId: string;
  targetCount: number;
  measuredCount: number;
  withinToleranceCount: number;
  maxPositionError: number;
  maxSizeError: number;
  meanPositionError: number;
  meanSizeError: number;
  textWrapDriftCount: number;
  cropDriftCount: number;
  passes: number;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  failureCode: GeometryFailureCode | null;
};

export type GeometryLockReport = {
  reportId: string;
  sessionId: string;
  buildRef: string;
  coordinateMap: AuthorityCoordinateMap;
  authorityGrid: AuthorityGrid;
  executionPlans: GeometricExecutionPlan[];
  fidelityReceipts: GeometryFidelityReceipt[];
  correctionPasses: GeometryCorrectionPass[];
  cssPatch: Record<string, string>;
  heroGeometryPass: boolean;
  createdAt: string;
};
