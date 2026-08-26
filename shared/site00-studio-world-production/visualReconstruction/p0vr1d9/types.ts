/**
 * P0.VR.1D.9 — Mobile page shell reconstruction types.
 * Separates functional shell authority from visual shell authority.
 */

import type { ScreenImplementationSpec } from '../p0vr1d1/types.js';
import type { RenderedDomMeasurementMap } from '../p0vr1d1/types.js';
import type { PixelMatchEvaluation } from '../p0vr1d/types.js';

/** Preserves routing, data hooks, interactions — never blocks shell replacement. */
export type FunctionalShellAuthority = {
  preservesRouting: true;
  preservesDataHooks: true;
  preservesInteractions: true;
  preservesNotificationCenter: true;
  preservesProjectMenu: true;
  preservesBottomNavRouting: true;
};

/** Reference screenshot governs layout, geometry, surfaces. */
export type VisualShellAuthority = {
  source: 'FULL_SCREEN_REFERENCE';
  referencePath: string;
  viewportWidth: number;
  viewportHeight: number;
};

export type MobileScreenVisualShellBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MobileScreenVisualShellSpec = {
  specId: string;
  screenId: 'MOBILE_CAMPAIGN_BOARD' | 'MOBILE_LAB_EXPERIMENT_01';
  route: string;
  referencePath: string;
  viewport: { width: number; height: number };
  pageBackground: string;
  headerBounds: MobileScreenVisualShellBounds;
  headerPadding: { x: number; y: number };
  headerDivider: boolean;
  contentBounds: MobileScreenVisualShellBounds;
  contentPaddingX: number;
  contentPaddingTop: number;
  sectionWidth: number;
  sectionGap: number;
  scrollContainer: 'body';
  bottomNavBounds: MobileScreenVisualShellBounds;
  bottomNavDivider: boolean;
  bottomSafeArea: string;
  zLayers: { header: number; content: number; bottomNav: number };
};

export type VisualShellMatchMetric =
  | 'VIEWPORT_MATCH'
  | 'HEADER_HEIGHT_MATCH'
  | 'HEADER_CONTENT_POSITION_MATCH'
  | 'CONTENT_X_MATCH'
  | 'CONTENT_WIDTH_MATCH'
  | 'CONTENT_TOP_MATCH'
  | 'SECTION_FLOW_MATCH'
  | 'BOTTOM_NAV_TOP_MATCH'
  | 'BOTTOM_NAV_HEIGHT_MATCH'
  | 'BACKGROUND_MATCH';

export type VisualShellMatchEvaluation = {
  evaluationId: string;
  screenId: MobileScreenVisualShellSpec['screenId'];
  metrics: Record<VisualShellMatchMetric, boolean>;
  score: number;
  tolerancePx: number;
  failures: string[];
};

export type ShellRegionLockExtension = {
  regionId: string;
  priorState: string;
  state: 'STALE_AFTER_SHELL_RECONSTRUCTION';
  invalidatedAt: string;
  reason: string;
};

export type NdxMobileShellReconstructionReport = {
  reportId: string;
  executedAt: string;
  campaignSpec: MobileScreenVisualShellSpec;
  labSpec: MobileScreenVisualShellSpec;
  campaignImplementationSpec: ScreenImplementationSpec;
  labImplementationSpec: ScreenImplementationSpec;
  campaignShellMatch: VisualShellMatchEvaluation;
  labShellMatch: VisualShellMatchEvaluation;
  staleLocks: ShellRegionLockExtension[];
  domMeasurementCampaign: RenderedDomMeasurementMap | null;
  domMeasurementLab: RenderedDomMeasurementMap | null;
  campaignOverlayPath: string | null;
  labOverlayPath: string | null;
  campaignRenderPath: string | null;
  labRenderPath: string | null;
  pixelMatchCampaign: PixelMatchEvaluation | null;
  pixelMatchLab: PixelMatchEvaluation | null;
};
