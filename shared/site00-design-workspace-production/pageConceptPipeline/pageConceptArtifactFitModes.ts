/** Presentation fit modes — distinct surfaces (not generation). */

export const PAGE_CONCEPT_FIT_FULL_SCREEN = 'FIT_FULL_SCREEN' as const;
export const PAGE_CONCEPT_FIT_HEADER_CROP = 'HEADER_CROP' as const;
export const PAGE_CONCEPT_FIT_FULL_RESOLUTION = 'FULL_RESOLUTION' as const;

export type PageConceptArtifactFitMode =
  | typeof PAGE_CONCEPT_FIT_FULL_SCREEN
  | typeof PAGE_CONCEPT_FIT_HEADER_CROP
  | typeof PAGE_CONCEPT_FIT_FULL_RESOLUTION;
