import type { ForensicSectionId } from './constants.js';

export type ForensicUiBlueprintAuthority = {
  id: string;
  projectId: string;
  viewport: 'MOBILE';
  sourceActualAuthorityId: string;
  sourceActualHash: string;
  falEndpoint: string;
  falRequestId: string;
  falResultUrl: string;
  blueprintImageUri: string;
  blueprintHash: string;
  generatedAt: string;
  status: 'FOUNDER_BLUEPRINT_REVIEW' | 'MACHINE_VALIDATED' | 'REJECTED';
  founderReviewStatus: 'PENDING' | 'APPROVED' | 'CORRECTION_REQUESTED';
};

export type ForensicBlueprintGenerationReceipt = {
  id: string;
  endpoint: string;
  requestId: string;
  sourceActualHash: string;
  secondaryBlueprintHash: string | null;
  promptVersion: string;
  resolution: string;
  outputFormat: string;
  resultUrl: string;
  resultHash: string;
  costUsd: number | null;
  generatedAt: string;
};

export type ForensicUiObjectEntry = {
  forensicObjectId: string;
  semanticObjectId: string;
  parentSectionId: ForensicSectionId;
  siblingOrder: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  alignment: string;
  visualPriority: number;
  objectType: string;
  textRole: string | null;
  assetSlotId: string | null;
  functionId: string | null;
  ownership: string;
  styleNotes: string;
  spacingNotes: string;
  borderNotes: string;
  evidence: string;
  calloutNumber: number;
};

export type ForensicUiObjectMap = {
  id: string;
  hash: string;
  objects: ForensicUiObjectEntry[];
  canonicalViewport: { widthPx: number; heightPx: number };
};

export type ForensicUiSectionEntry = {
  sectionId: ForensicSectionId;
  x: number;
  y: number;
  width: number;
  height: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  parentSectionId: ForensicSectionId | null;
  childSectionIds: ForensicSectionId[];
  layoutMode: string;
  columnCount: number;
  rowCount: number;
  internalGapPx: number;
  paddingPx: number;
  visualWeight: number;
  surfaceTreatment: string;
  dividerBehavior: string;
};

export type ForensicUiSectionMap = { id: string; hash: string; sections: ForensicUiSectionEntry[] };

export type ForensicTypographyEntry = {
  objectId: string;
  textRole: string;
  approximateFamily: string;
  sizePx: number;
  weight: number;
  lineHeight: number;
  tracking: string;
  textCase: string;
  alignment: string;
  widthRatio: number;
  lineCountTarget: number;
  wrapPattern: string;
  prominence: number;
};

export type ForensicTypographyMap = { id: string; hash: string; entries: ForensicTypographyEntry[] };

export type ForensicVisualStyleMap = {
  id: string;
  hash: string;
  pageBackground: string;
  hostBackground: string;
  projectSurface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  limeAccent: string;
  systemAccent: string;
  borderColor: string;
  dividerColor: string;
  borderThicknessPx: number;
  radiusPx: number;
  selectedState: string;
  activeState: string;
};

export type ForensicSpacingMap = {
  id: string;
  hash: string;
  outerMarginPx: number;
  sectionGapPx: number;
  sectionPaddingPx: number;
  rowGapPx: number;
  columnGapPx: number;
  textToControlGapPx: number;
  cardGapPx: number;
  navGapPx: number;
  heroInternalGapPx: number;
  authorityRailSpacingPx: number;
};

export type ForensicAssetPlacementEntry = {
  canonicalAssetId: string;
  targetObjectId: string;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  aspectRatio: string;
  crop: string;
  focalPoint: string;
  objectFit: string;
  framing: string;
  border: string;
  background: string;
};

export type ForensicAssetPlacementMap = { id: string; hash: string; assets: ForensicAssetPlacementEntry[] };

export type ForensicImplementationSpec = {
  id: string;
  hash: string;
  objectMapId: string;
  sectionMapId: string;
  typographyMapId: string;
  visualStyleMapId: string;
  spacingMapId: string;
  assetMapId: string;
};

export type ForensicImplementationCodingPrompt = {
  id: string;
  fullText: string;
  hash: string;
  injected: true;
};

export type RealBrowserTwinScreenshot = {
  id: string;
  browser: string;
  viewport: { widthPx: number; heightPx: number };
  buildId: string;
  route: string;
  screenshotPath: string;
  screenshotHash: string;
  timestamp: string;
  proofKind: 'PLAYWRIGHT_DOM' | 'MANUAL_FOUNDER';
};

export type LiveDomForensicMeasurement = {
  objectId: string;
  forensicObjectId: string;
  liveX: number;
  liveY: number;
  liveWidth: number;
  liveHeight: number;
  targetXRatio: number;
  targetYRatio: number;
  targetWidthRatio: number;
  targetHeightRatio: number;
  positionDeltaRatio: number;
  sizeDeltaRatio: number;
  withinTolerance: boolean;
};

export type ForensicDomCorrectionIteration = {
  iteration: number;
  measurements: LiveDomForensicMeasurement[];
  codeCorrectionsApplied: string[];
  screenshot: RealBrowserTwinScreenshot;
};

export type ForensicFidelityGate = {
  id: string;
  syntheticProofRejected: true;
  realBrowserScreenshotRequired: true;
  realBrowserScreenshotPresent: boolean;
  criticalWithinTolerance: number;
  criticalOutsideTolerance: number;
  actualToLiveFidelityScore: number | null;
  forensicToLiveGeometryScore: number | null;
  status: 'PASS' | 'REVIEW_READY' | 'FAIL' | 'PENDING_REAL_BROWSER';
  founderImplementationReview: 'FOUNDER_IMPLEMENTATION_REVIEW' | 'BLOCKED';
};
