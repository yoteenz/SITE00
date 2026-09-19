export const P0_VR_REPLICATION_3C_BUILD = 'v319' as const;

export const MAX_HERO_ASSET_CORRECTION_PASSES = 3;

/** Hero slice crops against full authority mobile PNG (percent-based). */
export const HERO_AUTHORITY_SLICE_CROPS: Record<string, { backgroundSize: string; backgroundPosition: string }> = {
  slice_a: { backgroundSize: '220% 180%', backgroundPosition: '42% 28%' },
  slice_b: { backgroundSize: '220% 180%', backgroundPosition: '48% 52%' },
  slice_c: { backgroundSize: '220% 180%', backgroundPosition: '55% 78%' },
  right_graphic: { backgroundSize: '180% 120%', backgroundPosition: '88% 45%' },
};

export const KNOWN_NDX_LIBRARY_ASSETS = [
  '/assets/ndxbook/entry-001/entry001-archive-01-then-now.webp',
  '/visual-references/founder/ndxbook/card-artwork/subscription-normalization.webp',
  '/visual-references/founder/ndxbook/card-artwork/corporate-layoff-memo.webp',
];
