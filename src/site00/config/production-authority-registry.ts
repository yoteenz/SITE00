/**
 * P0.STUDIOOS.PRODUCTION.AUTHORITY-ALIGNMENT.SONNET1R1
 * Typed registry of the 36 approved Production authorities (12 screen families x 3 viewport families).
 *
 * The authority images are QA / reference inputs only. Nothing here is imported by runtime UI as an
 * image; the filenames exist so the proof matrix and tests cannot drift from the approved manifest.
 */

export type ProductionViewportFamily = 'mobile' | 'tablet' | 'desktop';

export const PRODUCTION_VIEWPORT_FAMILIES: readonly ProductionViewportFamily[] = ['mobile', 'tablet', 'desktop'];

export const PRODUCTION_GLOBAL_TAB_ORDER = ['hub', 'inbox', 'design', 'experience', 'expression', 'library', 'activity'] as const;
export type ProductionGlobalTab = (typeof PRODUCTION_GLOBAL_TAB_ORDER)[number];

export const PRODUCTION_DESIGN_MODE_ORDER = ['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'] as const;
export type ProductionDesignMode = (typeof PRODUCTION_DESIGN_MODE_ORDER)[number];

export function isProductionDesignMode(value: string | null | undefined): value is ProductionDesignMode {
  return !!value && (PRODUCTION_DESIGN_MODE_ORDER as readonly string[]).includes(value);
}

/** Viewport class boundaries (CSS px of the layout viewport). Host chrome uses explicit px per class. */
export const PRODUCTION_TABLET_MIN_WIDTH = 700;
export const PRODUCTION_DESKTOP_MIN_WIDTH = 1120;

export function productionViewportFamilyForWidth(width: number): ProductionViewportFamily {
  if (width >= PRODUCTION_DESKTOP_MIN_WIDTH) return 'desktop';
  if (width >= PRODUCTION_TABLET_MIN_WIDTH) return 'tablet';
  return 'mobile';
}

/** Reference artboards used by the QA proof matrix (authority aspect families: 9:16, 4:3, 16:9). */
export const PRODUCTION_AUTHORITY_VIEWPORTS: Record<ProductionViewportFamily, { width: number; height: number; deviceScaleFactor: number }> = {
  mobile: { width: 360, height: 640, deviceScaleFactor: 2 },
  tablet: { width: 1024, height: 768, deviceScaleFactor: 1 },
  desktop: { width: 1280, height: 720, deviceScaleFactor: 1 },
};

export type ProductionAuthorityScreenId =
  | 'hub'
  | 'inbox'
  | 'experience'
  | 'expression'
  | 'library'
  | 'activity'
  | 'design-brand'
  | 'design-experience'
  | 'design-surfaces'
  | 'design-compiler'
  | 'design-assets'
  | 'design-viewport';

export type ProductionAuthorityScreen = {
  id: ProductionAuthorityScreenId;
  /** 1..12 */
  order: number;
  /** Which global bottom-nav item is active on this screen. */
  workspace: ProductionGlobalTab;
  /** Internal DESIGN mode; null for global tabs. */
  designMode: ProductionDesignMode | null;
  label: string;
  /** Authority image per viewport family (QA input only — never shipped as UI). */
  files: Record<ProductionViewportFamily, string>;
};

const f = (mobile: string, tablet: string, desktop: string): Record<ProductionViewportFamily, string> => ({
  mobile: `IMG_${mobile}`,
  tablet: `IMG_${tablet}`,
  desktop: `IMG_${desktop}`,
});

export const PRODUCTION_AUTHORITY_SCREENS: readonly ProductionAuthorityScreen[] = [
  { id: 'hub', order: 1, workspace: 'hub', designMode: null, label: 'HUB', files: f('5922', '6004', '5981') },
  { id: 'inbox', order: 2, workspace: 'inbox', designMode: null, label: 'INBOX', files: f('5924', '6005', '5982') },
  { id: 'experience', order: 3, workspace: 'experience', designMode: null, label: 'EXPERIENCE', files: f('5925', '6006', '5988') },
  { id: 'expression', order: 4, workspace: 'expression', designMode: null, label: 'EXPRESSION', files: f('5957', '6007', '5989') },
  { id: 'library', order: 5, workspace: 'library', designMode: null, label: 'LIBRARY', files: f('5979', '6008', '5990') },
  { id: 'activity', order: 6, workspace: 'activity', designMode: null, label: 'ACTIVITY', files: f('5936', '6009', '5991') },
  { id: 'design-brand', order: 7, workspace: 'design', designMode: 'brand', label: 'DESIGN / BRAND', files: f('5968', '6010', '5983') },
  { id: 'design-experience', order: 8, workspace: 'design', designMode: 'experience', label: 'DESIGN / EXPERIENCE', files: f('5963', '6019', '5992') },
  { id: 'design-surfaces', order: 9, workspace: 'design', designMode: 'surfaces', label: 'DESIGN / SURFACES', files: f('5969', '6011', '5984') },
  { id: 'design-compiler', order: 10, workspace: 'design', designMode: 'compiler', label: 'DESIGN / COMPILER', files: f('5970', '6012', '5985') },
  { id: 'design-assets', order: 11, workspace: 'design', designMode: 'assets', label: 'DESIGN / ASSETS', files: f('5974', '6013', '5986') },
  { id: 'design-viewport', order: 12, workspace: 'design', designMode: 'viewport', label: 'DESIGN / VIEWPORT', files: f('5975', '6014', '5987') },
];

export type ProductionAuthorityEntry = {
  key: string;
  screen: ProductionAuthorityScreen;
  family: ProductionViewportFamily;
  authorityFile: string;
  route: string;
};

/** Route / state selector that opens a given screen in the running app. */
export function productionAuthorityRoute(screen: ProductionAuthorityScreen, projectSlug = 'ndxbook'): string {
  switch (screen.id) {
    case 'hub':
      return '/production';
    case 'inbox':
      return '/production/queue';
    case 'experience':
      return `/production/${projectSlug}/experience`;
    case 'expression':
      return `/production/${projectSlug}/expression`;
    case 'library':
      return '/production/libraries';
    case 'activity':
      return '/production/activity';
    default:
      return `/production/${projectSlug}/design?mode=${screen.designMode}`;
  }
}

export function listProductionAuthorityEntries(projectSlug = 'ndxbook'): ProductionAuthorityEntry[] {
  const out: ProductionAuthorityEntry[] = [];
  for (const family of PRODUCTION_VIEWPORT_FAMILIES) {
    for (const screen of PRODUCTION_AUTHORITY_SCREENS) {
      out.push({
        key: `${family}:${screen.id}`,
        screen,
        family,
        authorityFile: screen.files[family],
        route: productionAuthorityRoute(screen, projectSlug),
      });
    }
  }
  return out;
}

export const PRODUCTION_PROJECT = { slug: 'ndxbook', name: 'NDXBOOK' } as const;
