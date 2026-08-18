/** Reusable environmental composition metadata — not ASSTS-specific. */

export type CompositionZoneType = 'protected' | 'preferred' | 'conditional' | 'navigation' | 'focal';

export type SemanticZoneRole =
  | 'header'
  | 'metrics'
  | 'status'
  | 'primary-copy'
  | 'secondary-copy'
  | 'floating-panel-left'
  | 'floating-panel-right'
  | 'content'
  | 'library'
  | 'navigation'
  | 'modal'
  | 'hero'
  | 'custom';

export type CompositionAnalysisStatus = 'UNANALYZED' | 'ANALYZING' | 'REVIEW' | 'APPROVED';

export type NormalizedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CompositionFocalPoint = {
  x: number;
  y: number;
  label?: string;
};

export type CompositionZone = {
  id: string;
  type: CompositionZoneType;
  role: SemanticZoneRole;
  rect: NormalizedRect;
  label: string;
  /** Optional tolerance for protected-zone collision (0–1 of zone area). */
  collisionTolerance?: number;
  notes?: string;
};

export type CompositionRules = {
  /** Minimum visible corridor width as fraction of viewport (0–1). */
  minCorridorVisibility?: number;
  /** Prefer UI below this normalized Y in source space. */
  contentBelowY?: number;
  /** Safe padding inside preferred zones (px at reference width). */
  zoneInsetPx?: number;
};

export type EnvironmentCompositionMap = {
  environmentId: string;
  assetId?: string;
  version: string;
  canvasWidth: number;
  canvasHeight: number;
  aspectRatio: number;
  focalPoints: CompositionFocalPoint[];
  protectedZones: CompositionZone[];
  preferredZones: CompositionZone[];
  conditionalZones: CompositionZone[];
  navigationZones: CompositionZone[];
  cropAnchor: CompositionFocalPoint;
  objectFit: 'cover';
  objectPosition: string;
  textContrast?: 'light-on-dark' | 'dark-on-light' | 'mixed';
  rules?: CompositionRules;
  analysisStatus: CompositionAnalysisStatus;
  approvalStatus: CompositionAnalysisStatus;
};

export type ViewportRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type DisplayedImageBounds = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  scale: number;
  /** Visible normalized source rect after crop (cover). */
  visibleSource: NormalizedRect;
};

export type CompositionLayoutContext = {
  containerWidth: number;
  containerHeight: number;
  displayed: DisplayedImageBounds;
  zones: Map<string, ViewportRect>;
};

export type RegisteredOverlay = {
  id: string;
  zoneId?: string;
  rect: ViewportRect;
  persistent: boolean;
};
