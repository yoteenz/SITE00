/**
 * P0.VR.DESIGN-WORKSPACE-LIST-GRID-SYNC-AND-GALLERY-THUMBNAIL-REFINEMENT1
 * Derived comparison thumbnails — full portrait artifact unchanged; CSS crops header band.
 */

export const PAGE_CONCEPT_HEADER_THUMBNAIL_ASPECT_RATIO = '16 / 9' as const;

/**
 * Semantic header overview band for gallery thumbs (16:9 container unchanged).
 * Wider vertical slice + softer scale than 0.32 crop — exposes nav / identity / header hierarchy.
 */
export type PageConceptHeaderThumbnailCrop = {
  topFraction: number;
  heightFraction: number;
  scale: number;
};

export const PAGE_CONCEPT_HEADER_THUMBNAIL_CROP: PageConceptHeaderThumbnailCrop = {
  topFraction: 0,
  heightFraction: 0.48,
  /** CSS transform scale divisor — must match heightFraction for cover band math. */
  scale: 1 / 0.48,
};

/** Full artifact URI; gallery CSS performs header crop (no duplicate storage). */
export function pageConceptHeaderThumbnailUriFromArtifact(fullArtifactUri: string | null): string | null {
  return fullArtifactUri?.trim() ? fullArtifactUri.trim() : null;
}
