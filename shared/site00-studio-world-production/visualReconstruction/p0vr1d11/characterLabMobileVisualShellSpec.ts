/**
 * P0.VR.1D.11 — Character Lab mobile visual shell spec from full-screen reference.
 */

import { NDX_CHARACTER_LAB_REFERENCE_PATH } from './constants.js';
import type { CharacterLabMobileVisualShellSpec } from './types.js';

export const CHARACTER_LAB_MOBILE_VISUAL_SHELL_SPEC: CharacterLabMobileVisualShellSpec = {
  specId: 'ndx-character-lab-mobile-shell-v1d11',
  screenId: 'MOBILE_CHARACTER_LAB',
  referencePath: NDX_CHARACTER_LAB_REFERENCE_PATH,
  viewport: { width: 390, height: 844 },
  background: 'var(--ndx-paper, #faf8f5)',
  headerBounds: { heightPx: 52, paddingX: 20 },
  contentBounds: { paddingX: 20, paddingTop: 0, maxWidthPx: 390 },
  contentGutters: 20,
  tabsBounds: { heightPx: 36 },
  heroBounds: { heightPx: 168, columnRatio: '46% 54%' },
  identityBounds: { minHeightPx: 120 },
  quoteBounds: { minHeightPx: 88 },
  performanceBounds: { columns: 4 },
  bottomNavBounds: { heightPx: 56 },
  sectionGaps: {
    titleToTabs: 8,
    tabsToHero: 12,
    heroToIdentity: 14,
    identityToQuote: 14,
    quoteToPerformance: 14,
  },
  zLayers: { header: 20, content: 1, stickyNote: 4, bottomNav: 120 },
};

export function characterLabShellStyle(spec: CharacterLabMobileVisualShellSpec): Record<string, string | number> {
  return {
    '--ndx-character-shell-gutter': `${spec.contentGutters}px`,
    '--ndx-character-hero-ratio-left': spec.heroBounds.columnRatio.split(' ')[0] ?? '46%',
    '--ndx-character-hero-ratio-right': spec.heroBounds.columnRatio.split(' ')[1] ?? '54%',
    '--ndx-character-section-gap-tabs': `${spec.sectionGaps.titleToTabs}px`,
    '--ndx-character-section-gap-hero': `${spec.sectionGaps.tabsToHero}px`,
    '--ndx-character-section-gap-identity': `${spec.sectionGaps.heroToIdentity}px`,
    '--ndx-character-section-gap-quote': `${spec.sectionGaps.identityToQuote}px`,
    '--ndx-character-section-gap-performance': `${spec.sectionGaps.quoteToPerformance}px`,
  };
}
