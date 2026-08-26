/**
 * P0.VR.1D.11 — Full-screen ScreenImplementationSpec for Character Lab.
 */

import type { RegionCodeSpec, ScreenImplementationSpec } from '../p0vr1d1/types.js';
import { NDX_CHARACTER_LAB_ROUTE, NDX_CHARACTER_LAB_VIEWPORT } from './constants.js';
import { CHARACTER_LAB_MOBILE_VISUAL_SHELL_SPEC } from './characterLabMobileVisualShellSpec.js';

function region(
  regionId: string,
  semanticRole: string,
  bounds: { x: number; y: number; width: number; height: number },
  interactionMode: RegionCodeSpec['interactionMode'] = 'static',
): RegionCodeSpec {
  const vp = NDX_CHARACTER_LAB_VIEWPORT;
  return {
    regionId,
    semanticRole,
    xPx: bounds.x,
    yPx: bounds.y,
    widthPx: bounds.width,
    heightPx: bounds.height,
    xPercent: (bounds.x / vp.width) * 100,
    yPercent: (bounds.y / vp.height) * 100,
    widthPercent: (bounds.width / vp.width) * 100,
    heightPercent: (bounds.height / vp.height) * 100,
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

export function buildCharacterLabFullScreenImplementationSpec(): ScreenImplementationSpec {
  const shell = CHARACTER_LAB_MOBILE_VISUAL_SHELL_SPEC;
  const gutter = shell.contentGutters;
  const contentW = shell.viewport.width - gutter * 2;
  const regions: RegionCodeSpec[] = [
    region('ndx.character.screen', 'PAGE_SHELL', { x: 0, y: 0, width: shell.viewport.width, height: shell.viewport.height }),
    region('ndx.character.header', 'TOP_NAV', { x: 0, y: 0, width: shell.viewport.width, height: shell.headerBounds.heightPx }),
    region('ndx.character.tabs', 'TAB_ROW', { x: gutter, y: 88, width: contentW, height: shell.tabsBounds.heightPx }, 'button'),
    region('ndx.character.hero', 'HERO_ROW', { x: gutter, y: 136, width: contentW, height: shell.heroBounds.heightPx }),
    region('ndx.character.portrait', 'PORTRAIT', { x: gutter, y: 136, width: Math.round(contentW * 0.46), height: shell.heroBounds.heightPx }),
    region('ndx.character.language-note', 'LANGUAGE_NOTE', { x: gutter + Math.round(contentW * 0.48), y: 136, width: Math.round(contentW * 0.52), height: shell.heroBounds.heightPx }),
    region('ndx.character.identity', 'IDENTITY', { x: gutter, y: 318, width: contentW, height: shell.identityBounds.minHeightPx }),
    region('ndx.character.sticky-note', 'STICKY_NOTE', { x: gutter + Math.round(contentW * 0.58), y: 330, width: 92, height: 92 }),
    region('ndx.character.quote', 'QUOTE_CARD', { x: gutter, y: 452, width: contentW, height: shell.quoteBounds.minHeightPx }),
    region('ndx.character.performance', 'PERFORMANCE', { x: gutter, y: 560, width: contentW, height: 96 }),
    region('ndx.character.performance.card.1', 'PERFORMANCE_CARD', { x: gutter, y: 584, width: Math.floor(contentW / 4), height: 72 }),
    region('ndx.character.performance.card.2', 'PERFORMANCE_CARD', { x: gutter + Math.floor(contentW / 4), y: 584, width: Math.floor(contentW / 4), height: 72 }),
    region('ndx.character.performance.card.3', 'PERFORMANCE_CARD', { x: gutter + Math.floor(contentW / 2), y: 584, width: Math.floor(contentW / 4), height: 72 }),
    region('ndx.character.performance.card.4', 'PERFORMANCE_CARD', { x: gutter + Math.floor((contentW * 3) / 4), y: 584, width: Math.floor(contentW / 4), height: 72 }),
    region('ndx.character.bottom-nav', 'BOTTOM_NAV', { x: 0, y: 788, width: shell.viewport.width, height: shell.bottomNavBounds.heightPx }, 'link'),
  ];

  return {
    specId: 'ndx-character-lab-full-screen-v1d11',
    screenId: 'MOBILE_CHARACTER_LAB',
    route: NDX_CHARACTER_LAB_ROUTE,
    referenceAuthorityId: shell.referencePath,
    referenceSource: 'FOUNDER_FULL_SCREEN_REFERENCE',
    viewportWidth: NDX_CHARACTER_LAB_VIEWPORT.width,
    viewportHeight: NDX_CHARACTER_LAB_VIEWPORT.height,
    layoutModel: 'FLOW',
    regions,
    components: regions.map((r) => ({ componentId: r.regionId, regionId: r.regionId, role: r.semanticRole })),
    typography: [],
    assets: [],
    fixedElements: ['ndx.character.header', 'ndx.character.bottom-nav'],
    stickyElements: ['ndx.character.header'],
    scrollRegions: ['ndx.character.screen'],
    responsiveMode: 'REFERENCE_LOCKED',
    doNotChangeRegions: [],
    referenceConfidence: 0.94,
    precisionOverrideAvailable: true,
  };
}
