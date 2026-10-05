/**
 * CASTING_THUMBNAIL — SITE00 Production → Expression → Casting → Actors only.
 * Separate from Studio World natural-habitat / wardrobe authorities (season1-v1).
 */

export const STUDIO_WORLD_CASTING_THUMBNAIL_BASE =
  '/site00/studio-world-residents/casting-thumbnails-v1' as const;

export type CastingThumbnailAuthorityType = 'CASTING_THUMBNAIL';

export type CastingThumbnailAuthorityStatus = 'FOUNDER_APPROVED';

export type CastingThumbnailScope = 'SITE00_PRODUCTION_EXPRESSION_CASTING';

export type CastingThumbnailAuthority = {
  authorityType: CastingThumbnailAuthorityType;
  status: CastingThumbnailAuthorityStatus;
  scope: CastingThumbnailScope;
  /** Primary image for Casting actor list only */
  primary: true;
  sourceResidentId: string;
  url: string;
  filename: string;
};

const CASTING_THUMBNAIL_FILES: Record<string, string> = {
  'SW-RESIDENT-001': 'SW-RESIDENT-001_ETTA_VALE.jpg',
  'SW-RESIDENT-002': 'SW-RESIDENT-002_ZURI_XU.jpg',
  'SW-RESIDENT-003': 'SW-RESIDENT-003_JULES_MERCER.jpg',
  'SW-RESIDENT-004': 'SW-RESIDENT-004_NOA_KLINE.jpg',
  'SW-RESIDENT-005': 'SW-RESIDENT-005_CASPIAN_REED.jpg',
  'SW-RESIDENT-006': 'SW-RESIDENT-006_IONA_WELLS.jpg',
  'SW-RESIDENT-007': 'SW-RESIDENT-007_MARLOWE_SAINT.jpg',
  'SW-RESIDENT-008': 'SW-RESIDENT-008_ELIO_EV_VAHN.jpg',
};

/** Normalize eye-line / face framing in the actor list (CSS background-position). */
const CASTING_THUMBNAIL_OBJECT_POSITION: Record<string, string> = {
  'SW-RESIDENT-001': 'center 22%',
  'SW-RESIDENT-002': 'center 24%',
  'SW-RESIDENT-003': 'center 20%',
  'SW-RESIDENT-004': 'center 26%',
  'SW-RESIDENT-005': 'center 22%',
  'SW-RESIDENT-006': 'center 24%',
  'SW-RESIDENT-007': 'center 20%',
  'SW-RESIDENT-008': 'center 24%',
};

export function castingThumbnailUrl(sourceResidentId: string): string | null {
  const file = CASTING_THUMBNAIL_FILES[sourceResidentId];
  if (!file) return null;
  return `${STUDIO_WORLD_CASTING_THUMBNAIL_BASE}/${file}`;
}

export function buildCastingThumbnailAuthority(sourceResidentId: string): CastingThumbnailAuthority | null {
  const filename = CASTING_THUMBNAIL_FILES[sourceResidentId];
  const url = castingThumbnailUrl(sourceResidentId);
  if (!filename || !url) return null;
  return {
    authorityType: 'CASTING_THUMBNAIL',
    status: 'FOUNDER_APPROVED',
    scope: 'SITE00_PRODUCTION_EXPRESSION_CASTING',
    primary: true,
    sourceResidentId,
    url,
    filename,
  };
}

export function listCastingThumbnailResidentIds(): readonly string[] {
  return Object.keys(CASTING_THUMBNAIL_FILES);
}

export function resolveCastingThumbnailObjectPosition(sourceResidentId: string): string {
  return CASTING_THUMBNAIL_OBJECT_POSITION[sourceResidentId] ?? 'center 22%';
}
