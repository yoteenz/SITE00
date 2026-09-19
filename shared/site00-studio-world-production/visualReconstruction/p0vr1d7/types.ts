/**
 * P0.VR.1D.7 — Reference scope awareness (full-screen vs panel vs module authority).
 */

import type { ScreenImplementationSpec } from '../p0vr1d1/types.js';
import type { LiveScreenRunResult } from '../p0vr1d2/types.js';
import type { PixelMatchEvaluation } from '../p0vr1d/types.js';

export const VISUAL_REFERENCE_SCOPES = [
  'FULL_SCREEN_REFERENCE',
  'WORKSPACE_PANEL_REFERENCE',
  'MODULE_REFERENCE',
  'COMPONENT_REFERENCE',
  'INTERACTION_STATE_REFERENCE',
  'ARTWORK_REFERENCE',
] as const;

export type VisualReferenceScope = (typeof VISUAL_REFERENCE_SCOPES)[number];

export type ScopeTargetType = 'ROUTE' | 'CANONICAL_REGION' | 'COMPONENT' | 'STATE';

export type ScopedComparisonMode = 'FULL_ROUTE' | 'SCOPED_REGION' | 'COMPONENT' | 'STATE';

export type FullRouteReferenceStatus = 'FULL_SCREEN' | 'MISSING' | 'PARTIAL_AUTHORITY_ONLY';

export type ScopeAwareVisualAuthority = {
  referenceId: string;
  screenId: string;
  scope: VisualReferenceScope;
  scopeTargetId: string;
  scopeTargetType: ScopeTargetType;
  route: string;
  rootSelector: string;
  scopeRootAttribute: string | null;
  comparisonMode: ScopedComparisonMode;
  referenceBounds: { width: number; height: number };
  fullRouteReferenceStatus: FullRouteReferenceStatus;
  standaloneRoute: string | null;
  pixelPassEligible: boolean;
};

export type ScopedImplementationSpec = ScreenImplementationSpec & {
  referenceId: string;
  scope: VisualReferenceScope;
  scopeTargetId: string;
  scopeTargetType: ScopeTargetType;
  rootSelector: string;
  scopeRootAttribute: string | null;
  comparisonMode: ScopedComparisonMode;
  targetBounds: { width: number; height: number };
  fullRouteReferenceStatus: FullRouteReferenceStatus;
};

export type ScopedRenderCaptureInput = {
  route: string;
  baseUrl: string;
  scopeAuthority: ScopeAwareVisualAuthority;
  outputDir: string;
  reconstructionIteration: number;
  previewDeviceMode: 'mobile' | 'desktop';
  routeSearch?: string;
};

export type ScopedRenderCaptureResult = {
  snapshotPath: string;
  renderId: string;
  scopeRootRect: { x: number; y: number; width: number; height: number } | null;
  captureMode: 'FULL_VIEWPORT' | 'SCOPED_ELEMENT';
  finalUrl: string;
};

export type ScopedLiveScreenRunResult = LiveScreenRunResult & {
  scopeAuthority: ScopeAwareVisualAuthority;
  scopedImplementationSpec: ScopedImplementationSpec;
  scopedPixelMatch: PixelMatchEvaluation | null;
  scopeVisualScoreLabel: string;
  invalidScopeComparison: boolean;
  historicalComparisonMarked: boolean;
};

export type ReclassifiedFounderReference = {
  screenId: string;
  viewportClass: 'desktop' | 'mobile';
  scope: VisualReferenceScope;
  scopeTargetId: string;
  scopeTargetType: ScopeTargetType;
  route: string;
  standaloneRoute: string | null;
  rootSelector: string;
  comparisonMode: ScopedComparisonMode;
  fullRouteReferenceStatus: FullRouteReferenceStatus;
  referenceBounds: { width: number; height: number };
};

export type ScopedRevalidationSummary = {
  screenId: string;
  scope: VisualReferenceScope;
  scopeTargetId: string;
  scopeVisualScore: number;
  scopeVisualScoreLabel: string;
  mappedRegions: number;
  status: string;
  previousComparisonInvalid: boolean;
  pixelPassEligible: boolean;
};

export type DesktopCompositeRevalidationReport = {
  reportId: string;
  executedAt: string;
  lineage: string;
  fullWorkspace: ScopedRevalidationSummary | null;
  embeddedPanels: ScopedRevalidationSummary[];
  mobileFullScreens: ScopedRevalidationSummary[];
  invalidHistoricalMarked: number;
};
