/** Canonical NDXBOOK launch volumes — shared reference only */
export const NDXBOOK_VOLUMES = ['MONEY', 'BODY', 'MIND', 'TECH', 'CONSUMER'] as const;
export type NdxbookVolume = (typeof NDXBOOK_VOLUMES)[number];

export const PAGE_001_REFERENCE = {
  id: 'PAGE 001',
  topic: 'CREDIT SCORE / DEBT PAYOFF',
  volume: 'MONEY' as NdxbookVolume,
  chapter: 'CH.01',
};
