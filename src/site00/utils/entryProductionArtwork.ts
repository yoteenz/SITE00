/**
 * B5.7 — Entry card artwork paths for overview production carousel.
 */

const ENTRY_ARTWORK: Record<string, { path: string; objectPosition: string }> = {
  'entry-001': {
    path: '/assets/ndxbook/entry-001/entry001-archive-01-then-now.webp',
    objectPosition: 'center 35%',
  },
  'entry-002': {
    path: '/visual-references/founder/ndxbook/card-artwork/subscription-normalization.webp',
    objectPosition: 'center 42%',
  },
  'entry-003': {
    path: '/visual-references/founder/ndxbook/card-artwork/corporate-layoff-memo.webp',
    objectPosition: 'center 35%',
  },
};

export function entryProductionArtwork(entryId: string): { path: string; objectPosition: string } | null {
  return ENTRY_ARTWORK[entryId] ?? null;
}
