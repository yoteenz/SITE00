/**
 * P0.VR.1D.13 — Mobile Campaign Board full-screen reference authority.
 * Static snapshot constants remain for VR lineage; runtime uses live calendar + campaign API.
 */

export const NDX_CAMPAIGN_BOARD_REFERENCE_PATH =
  '/visual-references/founder/ndxbook/mobile-campaign-board-reference-p0vr1d13.jpg';

export const CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY = 'CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY' as const;

export const NDX_CAMPAIGN_PAGES_TOTAL = 9;
export const NDX_CAMPAIGN_MOTION_TOTAL = 3;

export type NdxCampaignPageCardSpec = {
  id: string;
  index: string;
  title: string;
  statusLabel: string;
  artworkPath: string;
  artworkObjectPosition: string;
  vrRegionId: string;
};

export const NDX_CAMPAIGN_PAGE_CARDS: NdxCampaignPageCardSpec[] = [
  {
    id: 'pages-subscription',
    index: '01',
    title: 'WHY DOES EVERYTHING HAVE A SUBSCRIPTION NOW?',
    statusLabel: 'READY TO GENERATE',
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-subscription.webp',
    artworkObjectPosition: 'center 45%',
    vrRegionId: 'ndx.campaign.page-card.1',
  },
  {
    id: 'pages-theory',
    index: '02',
    title: 'I HAVE A THEORY.',
    statusLabel: 'READY TO GENERATE',
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-theory.webp',
    artworkObjectPosition: 'center 40%',
    vrRegionId: 'ndx.campaign.page-card.2',
  },
  {
    id: 'pages-serious',
    index: '03',
    title: 'BE SERIOUS.',
    statusLabel: 'READY TO GENERATE',
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-serious.webp',
    artworkObjectPosition: 'center 42%',
    vrRegionId: 'ndx.campaign.page-card.3',
  },
  {
    id: 'pages-decade',
    index: '04',
    title: 'DIFFERENT DECADE. SAME MODEL.',
    statusLabel: 'READY TO GENERATE',
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-decade.webp',
    artworkObjectPosition: 'center 38%',
    vrRegionId: 'ndx.campaign.page-card.4',
  },
];

export const NDX_CAMPAIGN_MOTION = {
  titleLines: ['INTERESTING.', 'FAIR.'],
  highlightWord: 'FAIR.',
  tag: 'SOCIAL BEHAVIOR',
  evidenceLabel: 'EVIDENCE FOR CONTRADICTORY PUBLIC STATEMENT',
  fileLabel: 'FILE: 9',
  artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/book-in-motion-interesting-fair.webp',
  artworkObjectPosition: 'center center',
  vrRegionId: 'ndx.campaign.motion',
};

export type NdxCampaignQuickActionSpec = {
  id: string;
  title: string;
  description: string;
  icon: 'sparkle' | 'film' | 'lock' | 'play';
  actionKind: 'link' | 'lock' | 'generate';
  href?: string;
};

export const NDX_CAMPAIGN_QUICK_ACTIONS: NdxCampaignQuickActionSpec[] = [
  {
    id: 'ingest',
    title: 'INGEST FOUNDER CREATIVE',
    description: 'Bring founder-authored creative into the campaign slate.',
    icon: 'sparkle',
    actionKind: 'link',
  },
  {
    id: 'film',
    title: 'FILM PRODUCTION',
    description: 'Open film production and motion review.',
    icon: 'film',
    actionKind: 'link',
  },
  {
    id: 'lock',
    title: 'LOCK ROUND 01 (SLIDE 01)',
    description: 'Lock the first round before generation continues.',
    icon: 'lock',
    actionKind: 'lock',
  },
  {
    id: 'generate',
    title: 'GENERATE SLIDE 01',
    description: 'Trigger slide 01 generation when ready.',
    icon: 'play',
    actionKind: 'generate',
  },
];

/** @deprecated P0.VR.1D.6 margins lane — not in v1d13 mobile reference */
export const NDX_CAMPAIGN_MARGIN_CARDS = [] as const;
export const NDX_CAMPAIGN_MARGINS_PER_DAY = 0;
export const NDX_CAMPAIGN_PAGES_PER_DAY = NDX_CAMPAIGN_PAGES_TOTAL;
export const NDX_CAMPAIGN_MOTION_PER_DAY = NDX_CAMPAIGN_MOTION_TOTAL;

/** @deprecated reference snapshot only */
export const NDX_CAMPAIGN_BOARD_WEEK = 'WEEK 01';
export const NDX_CAMPAIGN_BOARD_DATE_RANGE = 'May 24 – May 30';
export const NDX_CAMPAIGN_BOARD_DAYS = [] as const;
