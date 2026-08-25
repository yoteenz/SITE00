/**
 * P0.VR.1D.5 — Mobile overview reference snapshot metrics (visual reconstruction authority).
 * Live Content Ops pulse overrides when available; reference snapshot preserves founder-approved counts.
 */

export type NdxOverviewTodayAtNdxMetrics = {
  beingMade: number;
  needYourEye: number;
  developing: number;
  fromAudience: number;
  source: 'REFERENCE_SNAPSHOT' | 'CONTENT_OPS_RUN';
};

/** Founder-approved reference snapshot — desktop composite + editorial board use 1 for FROM AUDIENCE. */
export const NDX_OVERVIEW_REFERENCE_METRICS: NdxOverviewTodayAtNdxMetrics = {
  beingMade: 5,
  needYourEye: 2,
  developing: 3,
  fromAudience: 1,
  source: 'REFERENCE_SNAPSHOT',
};

export const NDX_OVERVIEW_IN_PRODUCTION_VIEW_ALL = 5;
export const NDX_OVERVIEW_RADAR_VIEW_ALL = 6;

export type NdxOverviewProductionCardId =
  | 'subscription-normalization'
  | 'corporate-layoff-memo'
  | 'late-fees-across-decades';

export type NdxOverviewProductionCardSpec = {
  id: NdxOverviewProductionCardId;
  title: string;
  tag: string | null;
  tone: 'priority' | 'default';
  subtitle: string;
  artworkPath: string;
  artworkObjectPosition: string;
  vrRegionId: string;
};

export const NDX_OVERVIEW_PRODUCTION_CARDS: NdxOverviewProductionCardSpec[] = [
  {
    id: 'subscription-normalization',
    title: 'Subscription Normalization',
    tag: 'TOP PRIORITY',
    tone: 'priority',
    subtitle: 'Precision tool → routine',
    artworkPath: '/visual-references/founder/ndxbook/card-artwork/subscription-normalization.webp',
    artworkObjectPosition: 'center 42%',
    vrRegionId: 'ndx.overview.production.card.subscription',
  },
  {
    id: 'corporate-layoff-memo',
    title: 'Corporate Layoff Memo',
    tag: null,
    tone: 'default',
    subtitle: 'Layoff memo v2',
    artworkPath: '/visual-references/founder/ndxbook/card-artwork/corporate-layoff-memo.webp',
    artworkObjectPosition: 'center 35%',
    vrRegionId: 'ndx.overview.production.card.layoff',
  },
  {
    id: 'late-fees-across-decades',
    title: 'Late Fees Across Decades',
    tag: null,
    tone: 'default',
    subtitle: 'Narrative in motion',
    artworkPath: '/visual-references/founder/ndxbook/card-artwork/late-fees-across-decades.webp',
    artworkObjectPosition: 'center 40%',
    vrRegionId: 'ndx.overview.production.card.late-fees',
  },
];
