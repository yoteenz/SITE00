/**
 * P0.VR.1D.9 — Reference-derived MobileScreenVisualShellSpec for Campaign + Lab.
 */

import { NDX_CAMPAIGN_BOARD_REFERENCE_PATH } from '../p0vr1d6/constants.js';
import { NDX_EXPERIMENT_01_REFERENCE_PATH } from '../p0vr1d8/constants.js';
import {
  NDX_CAMPAIGN_BOARD_SHELL_ROUTE,
  NDX_LAB_EXPERIMENT_01_SHELL_ROUTE,
  NDX_MOBILE_REFERENCE_VIEWPORT,
} from './constants.js';
import type { FunctionalShellAuthority, MobileScreenVisualShellSpec, VisualShellAuthority } from './types.js';

/** Reference-measured horizontal gutter (390px viewport). */
const CONTENT_GUTTER_X = 20;
const HEADER_HEIGHT = 52;
const BOTTOM_NAV_HEIGHT = 56;
const PAGE_BG = 'var(--ndx-paper, #faf8f5)';

export const FUNCTIONAL_SHELL_AUTHORITY: FunctionalShellAuthority = {
  preservesRouting: true,
  preservesDataHooks: true,
  preservesInteractions: true,
  preservesNotificationCenter: true,
  preservesProjectMenu: true,
  preservesBottomNavRouting: true,
};

export const CAMPAIGN_VISUAL_SHELL_AUTHORITY: VisualShellAuthority = {
  source: 'FULL_SCREEN_REFERENCE',
  referencePath: NDX_CAMPAIGN_BOARD_REFERENCE_PATH,
  viewportWidth: NDX_MOBILE_REFERENCE_VIEWPORT.width,
  viewportHeight: NDX_MOBILE_REFERENCE_VIEWPORT.height,
};

export const LAB_VISUAL_SHELL_AUTHORITY: VisualShellAuthority = {
  source: 'FULL_SCREEN_REFERENCE',
  referencePath: NDX_EXPERIMENT_01_REFERENCE_PATH,
  viewportWidth: NDX_MOBILE_REFERENCE_VIEWPORT.width,
  viewportHeight: NDX_MOBILE_REFERENCE_VIEWPORT.height,
};

function buildSharedShellBase(input: {
  specId: string;
  screenId: MobileScreenVisualShellSpec['screenId'];
  route: string;
  referencePath: string;
  sectionGap: number;
}): MobileScreenVisualShellSpec {
  const { width, height } = NDX_MOBILE_REFERENCE_VIEWPORT;
  const contentWidth = width - CONTENT_GUTTER_X * 2;
  const contentTop = HEADER_HEIGHT + 1;
  const contentHeight = height - contentTop - BOTTOM_NAV_HEIGHT;
  const navTop = height - BOTTOM_NAV_HEIGHT;

  return {
    specId: input.specId,
    screenId: input.screenId,
    route: input.route,
    referencePath: input.referencePath,
    viewport: { width, height },
    pageBackground: PAGE_BG,
    headerBounds: { x: 0, y: 0, width, height: HEADER_HEIGHT },
    headerPadding: { x: CONTENT_GUTTER_X, y: 12 },
    headerDivider: true,
    contentBounds: { x: CONTENT_GUTTER_X, y: contentTop, width: contentWidth, height: contentHeight },
    contentPaddingX: CONTENT_GUTTER_X,
    contentPaddingTop: 12,
    sectionWidth: contentWidth,
    sectionGap: input.sectionGap,
    scrollContainer: 'body',
    bottomNavBounds: { x: 0, y: navTop, width, height: BOTTOM_NAV_HEIGHT },
    bottomNavDivider: true,
    bottomSafeArea: 'env(safe-area-inset-bottom, 0px)',
    zLayers: { header: 20, content: 1, bottomNav: 120 },
  };
}

export const CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC: MobileScreenVisualShellSpec = buildSharedShellBase({
  specId: 'ndx-campaign-mobile-shell-v1d9',
  screenId: 'MOBILE_CAMPAIGN_BOARD',
  route: NDX_CAMPAIGN_BOARD_SHELL_ROUTE,
  referencePath: NDX_CAMPAIGN_BOARD_REFERENCE_PATH,
  sectionGap: 14,
});

export const LAB_MOBILE_VISUAL_SHELL_SPEC: MobileScreenVisualShellSpec = buildSharedShellBase({
  specId: 'ndx-lab-mobile-shell-v1d9',
  screenId: 'MOBILE_LAB_EXPERIMENT_01',
  route: NDX_LAB_EXPERIMENT_01_SHELL_ROUTE,
  referencePath: NDX_EXPERIMENT_01_REFERENCE_PATH,
  sectionGap: 12,
});

export function resolveMobileVisualShellSpec(
  screenId: string,
): MobileScreenVisualShellSpec | null {
  switch (screenId) {
    case 'campaign-board':
      return CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC;
    case 'experiment-01':
      return LAB_MOBILE_VISUAL_SHELL_SPEC;
    default:
      return null;
  }
}

export function mobileVisualShellSpecToCssVars(
  spec: MobileScreenVisualShellSpec,
): Record<string, string | number> {
  return {
    '--ndx-mobile-shell-page-bg': spec.pageBackground,
    '--ndx-mobile-shell-header-h': `${spec.headerBounds.height}px`,
    '--ndx-mobile-shell-header-px': `${spec.headerPadding.x}px`,
    '--ndx-mobile-shell-header-py': `${spec.headerPadding.y}px`,
    '--ndx-mobile-shell-content-x': `${spec.contentBounds.x}px`,
    '--ndx-mobile-shell-content-w': `${spec.contentBounds.width}px`,
    '--ndx-mobile-shell-content-px': `${spec.contentPaddingX}px`,
    '--ndx-mobile-shell-content-pt': `${spec.contentPaddingTop}px`,
    '--ndx-mobile-shell-section-w': `${spec.sectionWidth}px`,
    '--ndx-mobile-shell-section-gap': `${spec.sectionGap}px`,
    '--ndx-mobile-shell-nav-h': `${spec.bottomNavBounds.height}px`,
    '--ndx-mobile-shell-nav-z': spec.zLayers.bottomNav,
    '--ndx-mobile-shell-header-z': spec.zLayers.header,
  };
}

export function functionalAndVisualShellAuthoritySeparated(): boolean {
  return (
    FUNCTIONAL_SHELL_AUTHORITY.preservesRouting === true &&
    CAMPAIGN_VISUAL_SHELL_AUTHORITY.source === 'FULL_SCREEN_REFERENCE' &&
    LAB_VISUAL_SHELL_AUTHORITY.source === 'FULL_SCREEN_REFERENCE'
  );
}
