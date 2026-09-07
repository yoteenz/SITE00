/**
 * Sprint B4.6 follow-up — Pre-storyboard visual authority IDs.
 */

export const ENTRY_002_PRE_STORYBOARD_AUTHORITY_PACK_001 =
  'NDX-ENTRY-002-PRE-STORYBOARD-VISUAL-AUTHORITY-PACK-001' as const;

export function buildEntry002PreStoryboardAuthorityId(boardNumber: number): string {
  const roles = [
    'NDX-PRESENCE',
    'SUBJECT-DUAL-ERA',
    'NDX-HANDS',
    'FASHION-CONTINUITY',
    'PHONE-GLITCH',
  ];
  return `NDX-ENTRY-002-PRE-SBA-${roles[boardNumber - 1]}-001`;
}

export function buildEntry002PreStoryboardAuthorityStoragePath(boardId: string): string {
  return `site00/assts/expression-engine/ndxbook/entry-002/reel/pre-storyboard-authority/${boardId.toLowerCase()}.webp`;
}

export const ENTRY_002_PRE_SBA_COUNT = 5 as const;
