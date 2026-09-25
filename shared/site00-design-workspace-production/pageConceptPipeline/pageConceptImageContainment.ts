/**
 * P0.VR.PAGE-CONCEPT-MOBILE-IMAGE-CONTAINMENT-UX1
 * Presentation constants for bounded concept previews (not generation logic).
 */

/** Primary mobile concept review frame height in generator panel. */
export const PAGE_CONCEPT_MOBILE_PREVIEW_MAX_HEIGHT = 'clamp(220px, 34vh, 340px)';

export const PAGE_CONCEPT_TABLET_PREVIEW_MAX_HEIGHT = 'clamp(200px, 32vh, 320px)';

export const PAGE_CONCEPT_DESKTOP_PREVIEW_MAX_HEIGHT = 'clamp(200px, 32vh, 320px)';

export const PAGE_CONCEPT_THUMBNAIL_PREVIEW_MAX_HEIGHT = '88px';

/** Landscape header-crop gallery thumb (16:9) — full artifact cropped in CSS. */
export const PAGE_CONCEPT_HEADER_THUMB_ASPECT_RATIO = '16 / 9';

export const PAGE_CONCEPT_PREVIEW_OBJECT_FIT = 'contain' as const;

export type PageConceptPreviewContainSize = 'mobile' | 'tablet' | 'desktop' | 'thumb' | 'headerThumb' | 'heroReview';

export function pageConceptPreviewHeightForSize(size: PageConceptPreviewContainSize): string {
  switch (size) {
    case 'tablet':
      return PAGE_CONCEPT_TABLET_PREVIEW_MAX_HEIGHT;
    case 'desktop':
      return PAGE_CONCEPT_DESKTOP_PREVIEW_MAX_HEIGHT;
    case 'thumb':
      return PAGE_CONCEPT_THUMBNAIL_PREVIEW_MAX_HEIGHT;
    case 'headerThumb':
      return 'auto';
    case 'heroReview':
      return '100%';
    default:
      return PAGE_CONCEPT_MOBILE_PREVIEW_MAX_HEIGHT;
  }
}

/** CSS class names — must stay aligned with site00-page-concept-generator.css */
export const PAGE_CONCEPT_CONTAINED_PREVIEW_CLASS = 's00-pcg__containPreview';

export const PAGE_CONCEPT_CONTAINED_PREVIEW_IMG_CLASS = 's00-pcg__containPreviewImg';
