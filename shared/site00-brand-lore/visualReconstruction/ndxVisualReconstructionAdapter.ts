/**
 * NDXBOOK visual reconstruction adapter — client-specific evaluation + tokens.
 * Generic engine must NOT hard-code these values.
 */

import type { ReferenceEvaluationWeights } from '../../site00-studio-world-production/visualReconstruction/evaluation/referenceEvaluationWeights.js';

/** Founder-approved P0.VR.1A palette */
export const NDX_WORKSPACE_TOKENS = {
  paper: '#FAF8F5',
  ink: '#111111',
  lime: '#B7D236',
  muted: '#8A857C',
  border: '#E8E4DC',
  hostRed: '#E85656',
} as const;

export const DARK_PRIMARY_NDX_WORKSPACE = 'SUPERSEDED_VISUAL_DIRECTION' as const;

export type NdxBrandExpressionTraits = {
  primary: readonly string[];
  secondary: readonly string[];
  prohibited: readonly string[];
};

export const NDX_BRAND_EXPRESSION_TRAITS: NdxBrandExpressionTraits = {
  primary: [
    'cream/paper field',
    'black ink',
    'signature lime',
    'editorial paper artifacts',
    'artwork-first',
    'warm neutral physicality',
    'light workspace',
  ],
  secondary: [
    'SITE 00 red for host/system',
    'subtle paper texture',
    'handwritten interventions',
    'thin technical notation',
  ],
  prohibited: [
    'blue accent system',
    'dark-primary UI',
    'cyberpunk color',
    'sterile SaaS cards',
    'black canvas dominance',
  ],
};

export const NDX_EVALUATION_WEIGHTS: ReferenceEvaluationWeights = {
  geometryWeight: 0.12,
  typographyWeight: 0.1,
  brandWeight: 0.18,
  artworkWeight: 0.16,
  compositionWeight: 0.16,
  responsiveWeight: 0.14,
  paletteWeight: 0.14,
};

export type NdxCalibrationRoute = {
  routeId: string;
  path: string;
  renderSelector: string;
  moduleLabel: string;
  artworkHeavy: boolean;
  focalRegion: string;
};

export const NDX_CALIBRATION_ROUTES: NdxCalibrationRoute[] = [
  {
    routeId: 'project-hub-overview',
    path: '/projects/ndxbook',
    renderSelector: '.site00-fws-hub-board, .site00-fws-mobile-overview, .site00-fws-canvas',
    moduleLabel: 'Founder Workspace Overview',
    artworkHeavy: true,
    focalRegion: 'HERO',
  },
  {
    routeId: 'mobile-overview',
    path: '/projects/ndxbook',
    renderSelector: '.site00-fws-mobile-overview, .site00-fws-mobile-chrome--overview',
    moduleLabel: 'Mobile Overview Home',
    artworkHeavy: false,
    focalRegion: 'HERO',
  },
  {
    routeId: 'mobile-campaign-board',
    path: '/projects/ndxbook/content-operations/campaign-board',
    renderSelector: '.site00-fws-campaign-wall, .site00-fws-mobile-chrome--campaign-board',
    moduleLabel: 'Mobile Campaign Board',
    artworkHeavy: true,
    focalRegion: 'IMAGE',
  },
  {
    routeId: 'mobile-content-ops',
    path: '/projects/ndxbook/content-operations',
    renderSelector: '.site00-fws-editorial-desk, .site00-fws-mobile-chrome--content-ops',
    moduleLabel: 'Mobile Content Ops Desk',
    artworkHeavy: true,
    focalRegion: 'HERO',
  },
  {
    routeId: 'mobile-cultural-intelligence',
    path: '/projects/ndxbook/cultural-intelligence',
    renderSelector: '.site00-fws-mobile-chrome--cultural-intelligence',
    moduleLabel: 'Mobile Cultural Intelligence',
    artworkHeavy: false,
    focalRegion: 'METHOD_STAGE',
  },
  {
    routeId: 'mobile-character-lab',
    path: '/projects/ndxbook/character/discovery',
    renderSelector: '.site00-fws-mobile-chrome--character-lab',
    moduleLabel: 'Mobile Character Lab',
    artworkHeavy: true,
    focalRegion: 'IMAGE',
  },
  {
    routeId: 'experiments-hub',
    path: '/projects/ndxbook/experiments',
    renderSelector: '.site00-vr-experiments-hub, .site00-fws-canvas',
    moduleLabel: 'Experiments Hub',
    artworkHeavy: false,
    focalRegion: 'METHOD_STAGE',
  },
  {
    routeId: 'campaign-board',
    path: '/projects/ndxbook/content-operations/campaign-board',
    renderSelector: '.site00-fws-campaign-wall, .site00-fws-campaign, .site00-fws-canvas',
    moduleLabel: 'Campaign Board',
    artworkHeavy: true,
    focalRegion: 'IMAGE',
  },
  {
    routeId: 'content-operations',
    path: '/projects/ndxbook/content-operations',
    renderSelector: '.site00-fws-editorial-desk, .site00-fws-canvas',
    moduleLabel: 'Content Operations',
    artworkHeavy: true,
    focalRegion: 'HERO',
  },
];

export const NDX_FOUNDER_REFERENCE_PATHS = {
  desktop: 'tests/fixtures/visual-reconstruction/ndxbook-workspace-desktop-primary.png',
  mobile: 'tests/fixtures/visual-reconstruction/ndxbook-workspace-mobile-primary.png',
} as const;

export function ndxLuminanceTarget(): number {
  return 0.88;
}

export function ndxLimePresenceMin(): number {
  return 0.02;
}

export function ndxLimeProminenceMax(): number {
  return 0.18;
}
