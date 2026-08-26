/**
 * P0.VR.1D.10 — Mobile full-screen shell rollout constants.
 */

export const P0_VR_1D10_LINEAGE = 'P0.VR.1D.10' as const;

export const P0_VR_1D10_TARGET_SCREENS = [
  'overview',
  'content-ops',
  'cultural-intelligence',
  'character-lab',
] as const;

export const P0_VR_1D10_REGRESSION_SCREENS = ['campaign-board', 'experiment-01'] as const;

export const P0_VR_1D10_ROUTES = {
  overview: '/projects/ndxbook',
  'content-ops': '/projects/ndxbook/content-operations',
  'cultural-intelligence': '/projects/ndxbook/cultural-intelligence',
  'character-lab': '/projects/ndxbook/character/founder-discovery',
  'campaign-board': '/projects/ndxbook/content-operations/campaign-board',
  'experiment-01': '/projects/ndxbook/marketing-expression/experiment-01',
} as const;

export const P0_VR_1D10_ROUTE_SEARCH = '?site00MobileLayout=1' as const;

export const P0_VR_1D10_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
} as const;

export const P0_VR_1D10_WAIT_SELECTORS: Record<(typeof P0_VR_1D10_TARGET_SCREENS)[number], string> = {
  overview: '[data-visual-reconstruction="mobile-overview"]',
  'content-ops': '[data-visual-reconstruction="mobile-content-ops"]',
  'cultural-intelligence': '[data-visual-reconstruction="mobile-cultural-intelligence"]',
  'character-lab': '[data-visual-reconstruction="mobile-character-lab"]',
};

export const P0_VR_1D10_REFERENCE_PATHS = {
  overview: 'visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
  'content-ops': 'visual-references/founder/ndxbook/mobile-content-ops-fullscreen-reference.png',
  'cultural-intelligence': 'visual-references/founder/ndxbook/mobile-cultural-intelligence-fullscreen-reference.png',
  'character-lab': 'visual-references/founder/ndxbook/mobile-character-lab-fullscreen-reference.png',
} as const;
