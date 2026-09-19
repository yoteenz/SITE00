/**
 * P0.VR.1D.1 — Screenshot-as-design-spec, moodboard extraction, visual-spec-to-code bridge.
 * Extends P0.VR.1D without replacing it.
 */

import type {
  FrameAuthority,
  PixelGeometryContract,
  ReferenceAssetMatch,
  ReferenceTypographyContract,
  ScreenReference,
  ViewportClass,
  VisualRegionMap,
} from '../p0vr1d/types.js';

export type ScreenReferenceResolutionStatus = 'SUFFICIENT' | 'PARTIALLY_SUFFICIENT' | 'INSUFFICIENT';

export type ScreenReferenceAuthoritySource =
  | 'MOOD_BOARD_CROP'
  | 'FOUNDER_FULL_SCREEN_REFERENCE'
  | 'HISTORICAL_REFERENCE';

export type LayoutModel =
  | 'CSS_GRID'
  | 'FLEX'
  | 'ABSOLUTE_IN_FRAME'
  | 'FIXED'
  | 'STICKY'
  | 'FLOW'
  | 'HYBRID';

export type ImplementationRegionLockState = 'UNMEASURED' | 'DRIFTING' | 'MATCHED' | 'LOCKED';

export type ExtractedScreenReference = ScreenReference & {
  sourceBoardId: string;
  croppedReferenceAssetId: string;
  surfaceType: string;
  confidence: number;
  referenceResolution: ScreenReferenceResolutionStatus;
  authoritySource: ScreenReferenceAuthoritySource;
  authorityVersion: number;
  route?: string;
  moduleLabel?: string;
};

export type MoodBoardScreenExtractionResult = {
  boardId: string;
  sourceAssetId: string;
  viewportClass: ViewportClass;
  screens: ExtractedScreenReference[];
  treatedAsSingleScreen: false;
  screensAveraged: false;
  extractedAt: string;
};

export type ScreenReferenceAuthorityVersion = {
  screenId: string;
  version: number;
  authoritySource: ScreenReferenceAuthoritySource;
  referenceAssetId: string;
  supersededBy: string | null;
  updatedAt: string;
};

export type FullScreenReferenceMatchResult = {
  matched: boolean;
  screenId: string | null;
  matchReason: 'EXPLICIT_SCREEN' | 'ROUTE' | 'VIEWPORT_CLASS' | 'VISUAL_SIMILARITY' | 'LABEL' | 'NONE';
  confidence: number;
  duplicatePrevented: boolean;
};

export type RegionCodeSpec = {
  regionId: string;
  semanticRole: string;
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  layoutParent: string | null;
  positioningMode: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  displayMode: string;
  gridTemplate: string | null;
  flexDirection: string | null;
  gapPx: number;
  padding: string;
  margin: string;
  border: string | null;
  borderRadius: number;
  background: string | null;
  zIndex: number;
  overflow: string;
  assetId: string | null;
  textStyles: Record<string, string | number | null>;
  interactionMode: 'static' | 'link' | 'button' | 'scroll';
};

export type ScreenImplementationSpec = {
  specId: string;
  screenId: string;
  route: string;
  referenceAuthorityId: string;
  referenceSource: ScreenReferenceAuthoritySource;
  viewportWidth: number;
  viewportHeight: number;
  layoutModel: LayoutModel;
  regions: RegionCodeSpec[];
  components: Array<{ componentId: string; regionId: string; role: string }>;
  typography: ReferenceTypographyContract['entries'];
  assets: ReferenceAssetMatch[];
  fixedElements: string[];
  stickyElements: string[];
  scrollRegions: string[];
  responsiveMode: 'REFERENCE_LOCKED';
  doNotChangeRegions: string[];
  referenceConfidence: number;
  precisionOverrideAvailable: boolean;
  mobileScreenOrder?: string[];
};

export type ComposerScreenBuildContract = {
  contractId: string;
  screenId: string;
  route: string;
  referenceImageUrl: string;
  referenceImagePath: string | null;
  implementationSpec: ScreenImplementationSpec;
  lockedRegionIds: string[];
  viewportWidth: number;
  viewportHeight: number;
  workflowMode: 'WEBSITE_RECONSTRUCTION';
  emulationMode: 'SCREENSHOT_EMULATION';
  designFreedom: false;
  promptDirectives: readonly string[];
};

export type RenderedDomMeasurement = {
  regionId: string;
  actualX: number;
  actualY: number;
  actualWidth: number;
  actualHeight: number;
  computedPadding: string;
  computedMargin: string;
  computedGap: string;
  computedFontSize: string;
  computedLineHeight: string;
  computedPosition: string;
  computedDisplay: string;
  computedGrid: string | null;
  computedFlex: string | null;
  computedZIndex: string;
};

export type RenderedDomMeasurementMap = {
  mapId: string;
  route: string;
  renderAssetId: string;
  measurements: RenderedDomMeasurement[];
  capturedAt: string;
};

export type ReferenceDomDeltaEntry = {
  regionId: string;
  property: string;
  referenceValue: number | string;
  renderedValue: number | string;
  delta: number | string;
  driftKind: 'POSITION' | 'SIZE' | 'SPACING' | 'TYPOGRAPHY' | 'LAYOUT';
};

export type ReferenceDomDelta = {
  deltaId: string;
  screenId: string;
  entries: ReferenceDomDeltaEntry[];
};

export type CodePatchInstruction = {
  instructionId: string;
  target: string;
  property: string;
  current: string;
  targetValue: string;
  reason: string;
  regionId: string;
  convergenceOrder: number;
};

export type ImplementationRegionLock = {
  regionId: string;
  state: ImplementationRegionLockState;
  lockedAt: string | null;
};

export type DomPatchConvergenceResult = {
  screenId: string;
  route: string;
  implementationSpec: ScreenImplementationSpec;
  composerContract: ComposerScreenBuildContract;
  domMeasurement: RenderedDomMeasurementMap | null;
  domDelta: ReferenceDomDelta | null;
  patchInstructions: CodePatchInstruction[];
  regionLocks: ImplementationRegionLock[];
  iterations: number;
  screenshotEmulationMode: true;
};

export type VisualSpecToCodeBridgeInput = {
  screen: ExtractedScreenReference;
  route: string;
  regionMap: VisualRegionMap;
  geometryContract: PixelGeometryContract;
  typographyContract: ReferenceTypographyContract;
  frameAuthority: FrameAuthority;
  assetMatches: ReferenceAssetMatch[];
  layoutModel?: LayoutModel;
  mobileScreenOrder?: string[];
};
