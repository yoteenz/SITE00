/**
 * Experience Engine V0 — shared types (Studio World production infrastructure).
 */

export type ExperienceViewportClass = 'DESKTOP' | 'MOBILE';

export type RouteReferenceAuthorityLevel =
  | 'DESIGN_AUTHORITY'
  | 'IMPLEMENTATION_BASELINE'
  | 'DERIVED_REFERENCE'
  | 'UNAPPROVED';

export type RouteReferenceKind = 'ENVIRONMENT_ASSET' | 'FULL_VIEWPORT' | 'REGION_CROP';

export type RouteReferenceStatus =
  | 'ACTIVE'
  | 'BLOCKED_PENDING_REFERENCE_AUTHORITY'
  | 'SUPERSEDED'
  | 'ARCHIVED';

export type FidelityIterationStatus =
  | 'CAPTURED'
  | 'COMPARED'
  | 'FAILED'
  | 'PIXEL_PASS'
  | 'FOUNDER_REVIEW'
  | 'BLOCKED';

export type Site00RouteReferenceRecord = {
  id: string;
  projectId: string;
  projectKey: string;
  routeId: string;
  viewportClass: ExperienceViewportClass;
  referenceStoragePath: string;
  authorityLevel: RouteReferenceAuthorityLevel;
  referenceKind: RouteReferenceKind;
  status: RouteReferenceStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type RegionPixelScore = {
  regionId: string;
  label: string;
  pixelScore: number;
  passed: boolean;
  cropBounds: { x: number; y: number; width: number; height: number };
};

export type FidelityComparisonMetadata = {
  fullViewportPixelScore: number;
  structuralScore?: number | null;
  regionScores: RegionPixelScore[];
  heatmapStoragePath: string | null;
  comparisonEngine: string;
  threshold: number;
  mismatches: string[];
};

export type Site00FidelityIterationRecord = {
  id: string;
  routeReferenceId: string;
  iterationNumber: number;
  renderStoragePath: string;
  heatmapStoragePath: string | null;
  pixelScore: number;
  structuralScore: number | null;
  status: FidelityIterationStatus;
  comparisonMetadata: FidelityComparisonMetadata;
  createdAt: string;
};

export type EnterReferenceDecomposition = {
  routeId: '/enter';
  viewportClass: 'DESKTOP';
  viewportCanvas: { width: number; height: number };
  environment: {
    assetId: string;
    focal: string;
    layer: 'BACKGROUND_COVER';
    liveDom: false;
  };
  directoryPanel: {
    role: 'DIRECTORY_PANEL';
    geometry: { x: number; y: number; width: number; height: number };
    liveDom: true;
    selectors: string[];
  };
  statusStrip: {
    role: 'STATUS_STRIP';
    geometry: { x: number; y: number; width: number; height: number };
    liveDom: true;
    selectors: string[];
  };
  typographicHierarchy: string[];
  alignmentAnchors: string[];
  spacingRelationships: string[];
  imageBasedElements: string[];
  responsiveBehaviorInferred: string[];
};

export type PromotionEligibilityResult = {
  eligible: boolean;
  reasons: string[];
  pixelScore: number | null;
  threshold: number;
  authorityLevel: RouteReferenceAuthorityLevel | null;
  iterationStatus: FidelityIterationStatus | null;
};

export type ExperienceEngineRouteProof = {
  routeId: string;
  viewportClass: ExperienceViewportClass;
  references: Site00RouteReferenceRecord[];
  decomposition: EnterReferenceDecomposition | null;
  iterations: Site00FidelityIterationRecord[];
  promotion: PromotionEligibilityResult;
};
