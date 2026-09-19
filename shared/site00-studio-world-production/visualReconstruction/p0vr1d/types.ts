/**
 * P0.VR.1D — Image-reference website reconstruction types.
 * Extends P0.VR.1 / 1A / 1C; screenshot is primary visual authority.
 */

import type {
  Bounds,
  DeviceClass,
  NormalizedBounds,
  NormalizedVisualReference,
  RegionLockState,
  VisualReferenceRegion,
} from '../types.js';
import type { WebsiteVisualWorkflowMode } from '../modes.js';

export type WebVisualReferenceSourceType =
  | 'FOUNDER_UPLOAD'
  | 'APPROVED_MOODBOARD'
  | 'APPROVED_SCREENSHOT'
  | 'GENERATED_REFERENCE'
  | 'EXISTING_CANONICAL_SCREEN';

export type WebVisualAuthorityStatus =
  | 'PENDING'
  | 'REFERENCE_READY'
  | 'DECOMPOSED'
  | 'RECONSTRUCTING'
  | 'MATCHING'
  | 'FOUNDER_REVIEW'
  | 'CANONICAL';

export type ViewportClass = 'mobile' | 'tablet' | 'desktop' | 'ultrawide' | 'unknown';

export type ResponsiveAuthorityMode = 'REFERENCE_LOCKED' | 'INFERRED_RESPONSIVE';

export type VisualRegionMapRole =
  | 'HEADER_LOGO'
  | 'TOP_NAV'
  | 'LEFT_PANEL'
  | 'CENTER_PANEL'
  | 'RIGHT_PANEL'
  | 'PRIMARY_ARTWORK'
  | 'CTA'
  | 'BOTTOM_NAV'
  | 'BACKGROUND_ARCHITECTURE'
  | 'DECORATIVE_OBJECT'
  | 'STATUS_LABEL'
  | 'IMAGE_SLOT'
  | 'OTHER';

export type RegionCorrectionStatus = 'MATCHED' | 'NEEDS_ADJUSTMENT' | 'BLOCKED' | 'LOCKED';

export type PixelMatchTier = 'STRUCTURAL_PASS' | 'VISUAL_PASS' | 'PIXEL_PASS';

export type VisualDifferenceKind =
  | 'POSITION_DRIFT'
  | 'SIZE_DRIFT'
  | 'TYPOGRAPHY_DRIFT'
  | 'COLOR_DRIFT'
  | 'ARTWORK_DRIFT'
  | 'SPACING_DRIFT'
  | 'CAMERA_DRIFT'
  | 'RESPONSIVE_DRIFT'
  | 'MISSING_ELEMENT'
  | 'EXTRA_ELEMENT';

export type ReferenceAssetMatchType = 'EXACT' | 'CROP' | 'DERIVED' | 'MISSING' | 'NEEDS_RECONSTRUCTION';

export type CanonicalRouteVisualStatus =
  | 'NO_REFERENCE'
  | 'REFERENCE_READY'
  | 'IMPLEMENTATION_PENDING'
  | 'MATCHING'
  | 'FOUNDER_REVIEW'
  | 'CANONICAL';

export type WebReconstructionProviderCapability =
  | 'REFERENCE_STRONG'
  | 'REFERENCE_SUPPORTED'
  | 'TEXT_ONLY'
  | 'UNSUITABLE';

export type ResolvedWebVisualReferenceAsset = {
  assetId: string;
  storagePath: string | null;
  resolvedUrl: string;
  mimeType: string;
  width: number;
  height: number;
  checksum: string;
  sourceType: WebVisualReferenceSourceType;
};

export type WebVisualReferenceAuthority = {
  referenceAssetId: string;
  referenceImageUrl: string;
  surfaceType: string;
  viewportClass: ViewportClass;
  viewportWidth: number;
  viewportHeight: number;
  aspectRatio: number;
  deviceClass: DeviceClass;
  authorityStatus: WebVisualAuthorityStatus;
  sourceType: WebVisualReferenceSourceType;
  workflowMode: WebsiteVisualWorkflowMode;
  responsiveMode: ResponsiveAuthorityMode;
  createdAt: string;
  /** Actual image bytes path or URL — must flow to vision/image-capable stages */
  imageAuthorityPath: string;
};

export type PageVisualDecompositionGlobal = {
  viewportWidth: number;
  viewportHeight: number;
  aspectRatio: number;
  visualCenter: { x: number; y: number };
  contentBounds: Bounds;
  backgroundEstimate: string | null;
  cameraFraming: string;
  density: 'sparse' | 'balanced' | 'dense';
  whitespaceRatio: number;
};

export type LayoutRegionGeometry = {
  regionId: string;
  role: VisualRegionMapRole;
  x: number;
  y: number;
  width: number;
  height: number;
  relativeX: number;
  relativeY: number;
  relativeWidth: number;
  relativeHeight: number;
  zIndexHint: number;
  alignment: string;
  padding: number;
  gap: number;
  borderRadius: number;
  rotation: number;
  opacity: number;
  shadowBehavior: string | null;
};

export type PageVisualDecomposition = {
  decompositionId: string;
  referenceAssetId: string;
  global: PageVisualDecompositionGlobal;
  layoutRegions: LayoutRegionGeometry[];
  derivedFrom: NormalizedVisualReference;
  regions: VisualReferenceRegion[];
  createdAt: string;
};

export type VisualRegionMapEntry = {
  regionId: string;
  mapRole: VisualRegionMapRole;
  bounds: Bounds;
  normalizedBounds: NormalizedBounds;
  correctionStatus: RegionCorrectionStatus;
  lockState: RegionLockState;
};

export type VisualRegionMap = {
  mapId: string;
  referenceAssetId: string;
  entries: VisualRegionMapEntry[];
};

export type PixelGeometryContractEntry = {
  regionId: string;
  referenceX: number;
  referenceY: number;
  referenceWidth: number;
  referenceHeight: number;
  referenceAspectRatio: number;
  positionTolerancePx: number;
  sizeTolerancePx: number;
  rotationToleranceDeg: number;
};

export type PixelGeometryContract = {
  contractId: string;
  referenceAssetId: string;
  viewportClass: ViewportClass;
  entries: PixelGeometryContractEntry[];
};

export type ReferenceTypographyContractEntry = {
  regionId: string;
  fontFamily: string | null;
  fallbackClass: string;
  weight: number;
  sizePx: number;
  lineHeight: number;
  tracking: number;
  textCase: 'upper' | 'lower' | 'mixed' | 'unknown';
  alignment: string;
  maxWidth: number | null;
  lineBreaks: string[];
  position: Bounds;
  preserveLineBreaks: true;
};

export type ReferenceTypographyContract = {
  contractId: string;
  referenceAssetId: string;
  entries: ReferenceTypographyContractEntry[];
};

export type FrameAuthority = {
  cameraDistance: 'close' | 'medium' | 'wide' | 'environmental';
  visualCenter: { x: number; y: number };
  horizon: number | null;
  perspective: 'flat' | 'subtle' | 'dramatic';
  crop: Bounds;
  negativeSpace: number;
  environmentScale: number;
  panelScale: number;
};

export type DesktopVisualReferenceAuthority = WebVisualReferenceAuthority & {
  endpoint: 'desktop';
};

export type MobileVisualReferenceAuthority = WebVisualReferenceAuthority & {
  endpoint: 'mobile';
};

export type ReconstructionRenderSnapshot = {
  snapshotId: string;
  route: string;
  viewport: { width: number; height: number; class: ViewportClass };
  renderAssetId: string;
  referenceAssetId: string;
  iteration: number;
  screenshotPath: string;
  timestamp: string;
};

export type PixelMatchEvaluation = {
  evaluationId: string;
  referenceAssetId: string;
  renderAssetId: string;
  globalAlignment: number;
  regionAlignment: number;
  proportions: number;
  whitespace: number;
  panelGeometry: number;
  artworkPlacement: number;
  typographyPosition: number;
  lineWrapping: number;
  buttonGeometry: number;
  borderRadius: number;
  backgroundFraming: number;
  visualHierarchy: number;
  tier: PixelMatchTier;
  passed: boolean;
};

export type VisualDifferenceMapEntry = {
  regionId: string;
  kind: VisualDifferenceKind;
  severity: 'low' | 'medium' | 'high';
  deltaPx: number | null;
  note: string;
};

export type VisualDifferenceMap = {
  mapId: string;
  referenceAssetId: string;
  renderAssetId: string;
  heatmapPath: string | null;
  entries: VisualDifferenceMapEntry[];
};

export type ReferenceAssetMatch = {
  regionId: string;
  referenceAssetId: string;
  matchedProjectAssetId: string | null;
  matchType: ReferenceAssetMatchType;
  reuseExactAsset: boolean;
};

export type ScreenReference = {
  screenId: string;
  boardId: string;
  bounds: Bounds;
  viewportRatio: number;
  screenType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  viewportClass: ViewportClass;
  crop: Bounds;
  authority: WebVisualReferenceAuthority | null;
};

export type ReferenceBoard = {
  boardId: string;
  sourceAssetId: string;
  screens: ScreenReference[];
  createdAt: string;
};

export type CanonicalRouteVisualAuthority = {
  route: string;
  projectSlug: string;
  desktopRef: WebVisualReferenceAuthority | null;
  mobileRef: WebVisualReferenceAuthority | null;
  approvedVersion: string | null;
  status: CanonicalRouteVisualStatus;
  interpolationAllowed: boolean;
};

export type ImageReferenceProviderInput = {
  referenceImageUrl: string;
  referenceImagePath?: string;
  structuralDecomposition: PageVisualDecomposition;
  geometryContract: PixelGeometryContract;
  typographyContract: ReferenceTypographyContract;
  textDescription: string;
};

export type ScreenshotFirstReconstructionResult = {
  workflowMode: WebsiteVisualWorkflowMode;
  authority: WebVisualReferenceAuthority;
  decomposition: PageVisualDecomposition;
  regionMap: VisualRegionMap;
  geometryContract: PixelGeometryContract;
  typographyContract: ReferenceTypographyContract;
  frameAuthority: FrameAuthority;
  assetMatches: ReferenceAssetMatch[];
  iterations: number;
  snapshots: ReconstructionRenderSnapshot[];
  pixelMatch: PixelMatchEvaluation | null;
  differenceMap: VisualDifferenceMap | null;
  providerCapability: WebReconstructionProviderCapability;
  codedImplementation: true;
  flattenedScreenshotFallback: false;
};
