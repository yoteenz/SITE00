/**
 * Sprint B4.5 — pinned Entry 002 cinematic visual sequence asset identities.
 */

export const ENTRY_002_CINEMATIC_SEQUENCE_001 = 'NDX-ENTRY-002-REEL-CINEMATIC-SEQUENCE-001' as const;
export const ENTRY_002_CINEMATIC_CONTACT_SHEET_001 = 'NDX-ENTRY-002-REEL-CINEMATIC-CONTACT-001' as const;

export const ENTRY_002_CINEMATIC_FRAME_COUNT = 10 as const;

export function buildEntry002CinematicFrameId(frameNumber: number): string {
  return `NDX-ENTRY-002-REEL-CVS-FRAME-${String(frameNumber).padStart(3, '0')}`;
}

export function buildEntry002CinematicFrameStoragePath(frameId: string): string {
  return `site00/assts/expression-engine/ndxbook/entry-002/reel/cinematic-sequence/${frameId.toLowerCase()}.webp`;
}

export function buildEntry002CinematicContactSheetStoragePath(sheetId: string): string {
  return `site00/assts/expression-engine/ndxbook/entry-002/reel/cinematic-sequence/${sheetId.toLowerCase()}.webp`;
}

export const ENTRY_002_CVS_ASPECT_RATIO = '9:16' as const;
export const ENTRY_002_CVS_FRAME_DIMENSIONS = { width: 1080, height: 1920 } as const;

export const ENTRY_002_CONTINUITY_BOARD_IDS = {
  CHARACTER_IDENTITY: 'NDX-ENTRY-002-CONTINUITY-CHARACTER-001',
  HANDS_NAILS: 'NDX-ENTRY-002-CONTINUITY-HANDS-NAILS-001',
  HAIR_SILHOUETTE: 'NDX-ENTRY-002-CONTINUITY-HAIR-001',
  FASHION_EVIDENCE: 'NDX-ENTRY-002-CONTINUITY-FASHION-001',
  PHONE_EDIT_SUITE: 'NDX-ENTRY-002-CONTINUITY-PHONE-WORLD-001',
} as const;
