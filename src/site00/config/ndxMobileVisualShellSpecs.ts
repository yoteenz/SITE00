/**
 * P0.VR.1D.9 / P0.VR.1D.10 — Reference-driven mobile visual shell specs.
 * VisualShellAuthority only — functional behavior stays in route/page layers.
 */

export type MobileScreenVisualShellSpec = {
  screenId: string;
  referencePath: string;
  viewport: { width: number; height: number };
  pageBackground: string;
  headerBounds: { heightPx: number };
  headerPaddingX: number;
  headerDivider: boolean;
  contentBounds: { maxWidthPx: number };
  contentPaddingX: number;
  contentPaddingTop: number;
  sectionGap: number;
  scrollBehavior: 'body' | 'page';
  bottomNavBounds: { heightPx: number };
  bottomNavDivider: boolean;
  bottomSafeArea: boolean;
};

const BASE_SHELL: Omit<MobileScreenVisualShellSpec, 'screenId' | 'referencePath'> = {
  viewport: { width: 390, height: 844 },
  pageBackground: 'var(--ndx-paper)',
  headerBounds: { heightPx: 52 },
  headerPaddingX: 14,
  headerDivider: true,
  contentBounds: { maxWidthPx: 390 },
  contentPaddingX: 14,
  contentPaddingTop: 0,
  sectionGap: 12,
  scrollBehavior: 'body',
  bottomNavBounds: { heightPx: 52 },
  bottomNavDivider: true,
  bottomSafeArea: true,
};

export const NDX_MOBILE_OVERVIEW_VISUAL_SPEC: MobileScreenVisualShellSpec = {
  ...BASE_SHELL,
  screenId: 'overview',
  referencePath: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
  contentPaddingTop: 0,
  sectionGap: 10,
};

export const NDX_MOBILE_CONTENT_OPS_VISUAL_SPEC: MobileScreenVisualShellSpec = {
  ...BASE_SHELL,
  screenId: 'content-ops',
  referencePath: '/visual-references/founder/ndxbook/mobile-content-ops-fullscreen-reference.png',
  contentPaddingTop: 2,
  sectionGap: 10,
};

export const NDX_MOBILE_CULTURAL_INTELLIGENCE_VISUAL_SPEC: MobileScreenVisualShellSpec = {
  ...BASE_SHELL,
  screenId: 'cultural-intelligence',
  referencePath: '/visual-references/founder/ndxbook/mobile-cultural-intelligence-fullscreen-reference.png',
  sectionGap: 12,
};

export const NDX_MOBILE_CHARACTER_LAB_VISUAL_SPEC: MobileScreenVisualShellSpec = {
  ...BASE_SHELL,
  screenId: 'character-lab',
  referencePath: '/visual-references/founder/ndxbook/mobile-character-lab-fullscreen-reference.png',
  sectionGap: 10,
};

export function resolveMobileVisualShellSpec(screenId: string): MobileScreenVisualShellSpec | null {
  switch (screenId) {
    case 'overview':
      return NDX_MOBILE_OVERVIEW_VISUAL_SPEC;
    case 'content-ops':
      return NDX_MOBILE_CONTENT_OPS_VISUAL_SPEC;
    case 'cultural-intelligence':
      return NDX_MOBILE_CULTURAL_INTELLIGENCE_VISUAL_SPEC;
    case 'character-lab':
      return NDX_MOBILE_CHARACTER_LAB_VISUAL_SPEC;
    default:
      return null;
  }
}

export function mobileVisualShellStyle(spec: MobileScreenVisualShellSpec): Record<string, string | number> {
  return {
    '--ndx-mobile-page-bg': spec.pageBackground,
    '--ndx-mobile-header-h': `${spec.headerBounds.heightPx}px`,
    '--ndx-mobile-header-px': `${spec.headerPaddingX}px`,
    '--ndx-mobile-content-px': `${spec.contentPaddingX}px`,
    '--ndx-mobile-content-pt': `${spec.contentPaddingTop}px`,
    '--ndx-mobile-section-gap': `${spec.sectionGap}px`,
    '--ndx-mobile-bottom-nav-h': `${spec.bottomNavBounds.heightPx}px`,
  };
}
