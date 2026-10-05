/**
 * Sprint B4.6 — pinned Entry 002 structural storyboard authority IDs.
 */

export const ENTRY_002_REEL_TREATMENT_001 = 'NDX-ENTRY-002-REEL-TREATMENT-001' as const;
export const ENTRY_002_STORYBOARD_AUTHORITY_001 = 'NDX-ENTRY-002-REEL-STORYBOARD-AUTHORITY-001' as const;

export function buildEntry002StructuralBoardId(boardNumber: number): string {
  return `NDX-ENTRY-002-REEL-SBA-BOARD-${String(boardNumber).padStart(2, '0')}`;
}

export function buildEntry002StructuralBoardStoragePath(boardId: string): string {
  return `site00/assts/expression-engine/ndxbook/entry-002/reel/storyboard-authority/${boardId.toLowerCase()}.webp`;
}

export const ENTRY_002_SBA_BOARD_COUNT = 5 as const;
