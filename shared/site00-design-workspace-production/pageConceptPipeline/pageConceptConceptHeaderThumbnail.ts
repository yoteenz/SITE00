/**
 * P0.VR.DESIGN-WORKSPACE-LIST-GRID-SYNC-AND-GALLERY-THUMBNAIL-REFINEMENT1
 * Derived comparison thumbnails — full portrait artifact unchanged; CSS crops header band.
 */

export const PAGE_CONCEPT_HEADER_THUMBNAIL_ASPECT_RATIO = '16 / 9' as const;

/** Semantic header band (~top 32% of full-page concept). Applied via object-position + cover. */
export const PAGE_CONCEPT_HEADER_THUMBNAIL_CROP = {
  topFraction: 0,
  heightFraction: 0.32,
} as const;

export type PageConceptHeaderThumbnailCrop = typeof PAGE_CONCEPT_HEADER_THUMBNAIL_CROP;

/** Full artifact URI; gallery CSS performs header crop (no duplicate storage). */
export function pageConceptHeaderThumbnailUriFromArtifact(fullArtifactUri: string | null): string | null {
  return fullArtifactUri?.trim() ? fullArtifactUri.trim() : null;
}
