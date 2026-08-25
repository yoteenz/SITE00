/**
 * P0.VR.1D.6 — Mobile Campaign Board reference snapshot (visual reconstruction authority).
 */

export const NDX_CAMPAIGN_BOARD_REFERENCE_PATH =
  '/visual-references/founder/ndxbook/mobile-campaign-board-reference.png';

export const NDX_CAMPAIGN_BOARD_WEEK = 'WEEK 01';
export const NDX_CAMPAIGN_BOARD_DATE_RANGE = 'May 24 – May 30';

export type NdxCampaignDayCell = {
  id: string;
  letter: string;
  month: string;
  day: string;
  active: boolean;
};

export const NDX_CAMPAIGN_BOARD_DAYS: NdxCampaignDayCell[] = [
  { id: 'mon-524', letter: 'M', month: '5', day: '24', active: true },
  { id: 'tue-525', letter: 'T', month: '5', day: '25', active: false },
  { id: 'wed-526', letter: 'W', month: '5', day: '26', active: false },
  { id: 'thu-527', letter: 'T', month: '5', day: '27', active: false },
  { id: 'fri-528', letter: 'F', month: '5', day: '28', active: false },
  { id: 'sat-529', letter: 'S', month: '5', day: '29', active: false },
  { id: 'sun-530', letter: 'S', month: '5', day: '30', active: false },
];

export const NDX_CAMPAIGN_PAGES_PER_DAY = 3;
export const NDX_CAMPAIGN_MARGINS_PER_DAY = 4;
export const NDX_CAMPAIGN_MOTION_PER_DAY = 1;

export type NdxCampaignPageCardSpec = {
  id: string;
  titleLines: string[];
  note?: string;
  noteTone?: 'lime' | 'ink';
  artworkPath: string;
  artworkObjectPosition: string;
  action?: 'expand' | 'close';
  vrRegionId: string;
};

export const NDX_CAMPAIGN_PAGE_CARDS: NdxCampaignPageCardSpec[] = [
  {
    id: 'pages-subscription',
    titleLines: ['WHY DOES EVERYTHING', 'HAVE A SUBSCRIPTION', 'NOW?'],
    note: 'audience signal',
    noteTone: 'lime',
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-subscription.webp',
    artworkObjectPosition: 'center 45%',
    action: 'expand',
    vrRegionId: 'ndx.campaign.pages.card.1',
  },
  {
    id: 'pages-layoffs',
    titleLines: ['LAYOFFS:', 'THE NEW', 'NORMAL.'],
    note: 'not normal.',
    noteTone: 'ink',
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-layoffs.webp',
    artworkObjectPosition: 'center 40%',
    action: 'close',
    vrRegionId: 'ndx.campaign.pages.card.2',
  },
  {
    id: 'pages-continuation',
    titleLines: ['NEXT', 'PAGE'],
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/pages-layoffs.webp',
    artworkObjectPosition: 'left center',
    vrRegionId: 'ndx.campaign.pages.card.3',
  },
];

export type NdxCampaignMarginCardSpec = {
  id: string;
  index: string;
  titleLines: string[];
  artworkPath: string;
  artworkObjectPosition: string;
  vrRegionId: string;
};

export const NDX_CAMPAIGN_MARGIN_CARDS: NdxCampaignMarginCardSpec[] = [
  {
    id: 'margins-gibl',
    index: '01',
    titleLines: ['GIBL—', 'LOOK AT', 'THIS.'],
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/margins-gibl.webp',
    artworkObjectPosition: 'center 42%',
    vrRegionId: 'ndx.campaign.margins.card.1',
  },
  {
    id: 'margins-nope',
    index: '02',
    titleLines: ['NOPE.', 'NOT', 'NORMAL.'],
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/margins-nope.webp',
    artworkObjectPosition: 'center 40%',
    vrRegionId: 'ndx.campaign.margins.card.2',
  },
  {
    id: 'margins-pattern',
    index: '03',
    titleLines: ['THIS IS', 'A WHOLE', 'PATTERN.'],
    artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/margins-pattern.webp',
    artworkObjectPosition: 'center 38%',
    vrRegionId: 'ndx.campaign.margins.card.3',
  },
];

export const NDX_CAMPAIGN_MOTION = {
  titleLines: ['SUBSCRIPTIONS:', 'THE SWITCH NOBODY', 'ASKED FOR'],
  duration: '01:47',
  artworkPath: '/visual-references/founder/ndxbook/campaign-board-artwork/book-in-motion.webp',
  artworkObjectPosition: 'right center',
  vrRegionId: 'ndx.campaign.motion',
};
