/**
 * P0.VR.1D.2 — Live reconstruction execution types (no new architecture duplication).
 */

import type { CodePatchInstruction, ScreenImplementationSpec } from '../p0vr1d1/types.js';
import type { PixelMatchEvaluation, VisualDifferenceMap } from '../p0vr1d/types.js';
import type { RenderedDomMeasurementMap, ReferenceDomDelta } from '../p0vr1d1/types.js';

export type ViewportInferenceStatus = 'EXACT' | 'HIGH_CONFIDENCE' | 'INFERRED' | 'UNKNOWN';

export type ReconstructionExecutionStatus =
  | 'ARCHITECTURE_READY'
  | 'REFERENCE_INGESTED'
  | 'SPEC_COMPILED'
  | 'FIRST_RENDER_COMPLETE'
  | 'CORRECTION_IN_PROGRESS'
  | 'FOUNDER_REVIEW'
  | 'VISUAL_PASS'
  | 'PIXEL_PASS'
  | 'NEEDS_CORRECTION';

export type ExtractedScreenGeometry = {
  screenId: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  screenAspectRatio: number;
  screenFrameBounds: { x: number; y: number; width: number; height: number };
  inferredViewportWidth: number;
  inferredViewportHeight: number;
  viewportConfidence: ViewportInferenceStatus;
  boardWidth: number;
  boardHeight: number;
};

export type FounderBoardResolution = {
  source: 'FOUNDER_PERSISTED' | 'ENV_OVERRIDE' | 'CANONICAL_LOCAL' | 'FIXTURE_FALLBACK' | 'NOT_FOUND';
  desktopPath: string | null;
  mobilePath: string | null;
  desktopUrl: string | null;
  mobileUrl: string | null;
  fixtureSubstitution: boolean;
  storageResolution: string;
  failFounderReferenceMissing?: boolean;
  warning?: string;
};

export type MeasuredScreenReferenceResolution = {
  status: 'SUFFICIENT' | 'PARTIALLY_SUFFICIENT' | 'INSUFFICIENT';
  confidence: number;
  effectiveCropWidth: number;
  effectiveCropHeight: number;
  sharpnessScore: number;
  edgeDensityScore: number;
  typographyLegibility: boolean;
  geometryLegibility: boolean;
  artworkLegibility: boolean;
  defaultedToSufficient: false;
};

export type LiveScreenOverlayArtifacts = {
  referencePath: string;
  implementationPath: string;
  overlayPath: string | null;
  differenceMapPath: string | null;
  heatmapPath: string | null;
};

export type LiveScreenRunResult = {
  screenId: string;
  route: string;
  viewportClass: 'desktop' | 'mobile';
  geometry: ExtractedScreenGeometry;
  resolution: MeasuredScreenReferenceResolution;
  implementationSpec: ScreenImplementationSpec;
  status: ReconstructionExecutionStatus;
  skipRender: false;
  viewportUsed: { width: number; height: number; deviceScaleFactor: number };
  firstRenderPath: string | null;
  domMeasurement: RenderedDomMeasurementMap | null;
  domDelta: ReferenceDomDelta | null;
  patchInstructions: CodePatchInstruction[];
  lockedRegionIds: string[];
  pixelMatch: PixelMatchEvaluation | null;
  differenceMap: VisualDifferenceMap | null;
  structuralScore: number;
  visualScore: number;
  pixelScore: number;
  iterations: number;
  overlay: LiveScreenOverlayArtifacts | null;
};

export type NdxProjectHubLiveReconstructionReport = {
  reportId: string;
  executedAt: string;
  founderBoards: FounderBoardResolution;
  boardDimensions: { desktop: { width: number; height: number }; mobile: { width: number; height: number } };
  desktopScreens: LiveScreenRunResult[];
  mobileScreens: LiveScreenRunResult[];
  skipRenderUsed: false;
  browser: 'playwright-chromium';
  architectureReady: true;
  actualReconstructionExecuted: boolean;
  desktopVisualPass: boolean;
  mobileVisualPass: boolean;
  pixelPass: boolean;
};
