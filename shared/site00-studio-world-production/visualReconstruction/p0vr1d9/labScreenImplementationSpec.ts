/**
 * P0.VR.1D.9 — Full-screen ScreenImplementationSpec for Lab / Experiment 01 (includes shell regions).
 */

import type { RegionCodeSpec, ScreenImplementationSpec } from '../p0vr1d1/types.js';
import { NDX_LAB_EXPERIMENT_01_SHELL_ROUTE, NDX_MOBILE_REFERENCE_VIEWPORT } from './constants.js';
import { LAB_MOBILE_VISUAL_SHELL_SPEC } from './mobileScreenVisualShellSpec.js';

function shellRegion(
  regionId: string,
  semanticRole: string,
  bounds: { x: number; y: number; width: number; height: number },
  viewport: { width: number; height: number },
  interactionMode: RegionCodeSpec['interactionMode'] = 'static',
): RegionCodeSpec {
  return {
    regionId,
    semanticRole,
    xPx: bounds.x,
    yPx: bounds.y,
    widthPx: bounds.width,
    heightPx: bounds.height,
    xPercent: (bounds.x / viewport.width) * 100,
    yPercent: (bounds.y / viewport.height) * 100,
    widthPercent: (bounds.width / viewport.width) * 100,
    heightPercent: (bounds.height / viewport.height) * 100,
    layoutParent: null,
    positioningMode: semanticRole.includes('NAV') ? 'fixed' : 'relative',
    displayMode: 'block',
    gridTemplate: null,
    flexDirection: null,
    gapPx: 0,
    padding: '0',
    margin: '0',
    border: null,
    borderRadius: 0,
    background: null,
    zIndex: semanticRole.includes('NAV') ? 120 : 1,
    overflow: 'visible',
    assetId: null,
    textStyles: {},
    interactionMode,
  };
}

export function buildLabFullScreenImplementationSpec(): ScreenImplementationSpec {
  const shell = LAB_MOBILE_VISUAL_SHELL_SPEC;
  const vp = shell.viewport;
  const regions: RegionCodeSpec[] = [
    shellRegion('ndx.lab.screen', 'PAGE_SHELL', { x: 0, y: 0, width: vp.width, height: vp.height }, vp),
    shellRegion('ndx.lab.header-shell', 'TOP_NAV', shell.headerBounds, vp),
    shellRegion('ndx.lab.content-shell', 'CENTER_PANEL', shell.contentBounds, vp, 'scroll'),
    shellRegion('ndx.lab.breadcrumb', 'BREADCRUMB', {
      x: shell.contentBounds.x,
      y: shell.contentBounds.y,
      width: shell.sectionWidth,
      height: 18,
    }, vp),
    shellRegion('ndx.lab.title', 'TITLE_ROW', {
      x: shell.contentBounds.x,
      y: shell.contentBounds.y + 28,
      width: shell.sectionWidth,
      height: 32,
    }, vp),
    shellRegion('ndx.lab.metrics', 'METRICS_ROW', {
      x: shell.contentBounds.x,
      y: shell.contentBounds.y + 120,
      width: shell.sectionWidth,
      height: 44,
    }, vp),
    shellRegion('ndx.lab.grid', 'EXPERIMENT_GRID', {
      x: shell.contentBounds.x,
      y: shell.contentBounds.y + 176,
      width: shell.sectionWidth,
      height: 320,
    }, vp),
    shellRegion('ndx.lab.direction', 'CURRENT_DIRECTION', {
      x: shell.contentBounds.x,
      y: shell.contentBounds.y + 510,
      width: shell.sectionWidth,
      height: 140,
    }, vp, 'button'),
    shellRegion('ndx.lab.bottom-nav-shell', 'BOTTOM_NAV', shell.bottomNavBounds, vp, 'link'),
  ];

  return {
    specId: 'ndx-lab-full-screen-v1d9',
    screenId: 'MOBILE_LAB_EXPERIMENT_01',
    route: NDX_LAB_EXPERIMENT_01_SHELL_ROUTE,
    referenceAuthorityId: shell.referencePath,
    referenceSource: 'FOUNDER_FULL_SCREEN_REFERENCE',
    viewportWidth: NDX_MOBILE_REFERENCE_VIEWPORT.width,
    viewportHeight: NDX_MOBILE_REFERENCE_VIEWPORT.height,
    layoutModel: 'FLOW',
    regions,
    components: regions.map((r) => ({ componentId: r.regionId, regionId: r.regionId, role: r.semanticRole })),
    typography: [],
    assets: [],
    fixedElements: ['ndx.lab.header-shell', 'ndx.lab.bottom-nav-shell'],
    stickyElements: ['ndx.lab.header-shell'],
    scrollRegions: ['ndx.lab.content-shell'],
    responsiveMode: 'REFERENCE_LOCKED',
    doNotChangeRegions: [],
    referenceConfidence: 0.92,
    precisionOverrideAvailable: true,
  };
}
