/**
 * P0.VR.1D.4A — Founder board ingest + live 6×6 reconstruction types.
 */

import type { NdxProjectHubAlignedLiveReport } from '../p0vr1d4/types.js';
import type { MeasuredScreenReferenceResolution } from '../p0vr1d2/types.js';
import type { MoodBoardScreenExtractionResult } from '../p0vr1d1/types.js';

export type FounderReferenceResolutionProof = {
  desktopResolved: boolean;
  mobileResolved: boolean;
  desktopResolvedUrl: string | null;
  mobileResolvedUrl: string | null;
  desktopLocalPath: string | null;
  mobileLocalPath: string | null;
  source: 'FOUNDER_REFERENCE' | 'NOT_FOUND';
  fixtureFallback: false;
  blocked: boolean;
  blockReason: string | null;
};

export type ExtractedScreenSummary = {
  screenId: string;
  route: string;
  viewportClass: 'desktop' | 'mobile';
  referenceCropPath: string | null;
  viewport: { width: number; height: number };
  resolution: MeasuredScreenReferenceResolution;
  mappedRegions: number;
  unmappedRegions: number;
  firstStructuralScore: number;
  firstVisualScore: number;
  patchesGenerated: number;
  patchesExecuted: number;
  iterations: number;
  finalStructuralScore: number;
  finalVisualScore: number;
  finalPixelScore: number;
  status: string;
  blocker: string | null;
  failRegionMappingRuntime: boolean;
};

export type FounderMoodBoardIngestLiveReport = {
  reportId: string;
  executedAt: string;
  lineage: string;
  founderReferenceProof: FounderReferenceResolutionProof;
  desktopExtraction: MoodBoardScreenExtractionResult;
  mobileExtraction: MoodBoardScreenExtractionResult;
  desktopScreens: ExtractedScreenSummary[];
  mobileScreens: ExtractedScreenSummary[];
  alignedReport: NdxProjectHubAlignedLiveReport | null;
  scopeRevalidation: import('../p0vr1d7/types.js').DesktopCompositeRevalidationReport | null;
  liveFixtureFallbackUsed: false;
  actualFounderDesktopBoardPersisted: boolean;
  actualFounderMobileBoardPersisted: boolean;
  reconstructionBlocked: boolean;
  blockReason: string | null;
};
