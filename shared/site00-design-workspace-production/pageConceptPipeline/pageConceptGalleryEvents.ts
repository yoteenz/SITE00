export const PAGE_CONCEPT_MOBILE_SELECTION_MADE_EVENT = 'page_concept_mobile_selection_made' as const;

export type PageConceptMobileSelectionMadeDetail = {
  projectId: string;
  pageId: string;
  conceptId: string;
  artifactId: string | null;
  runId: string | null;
};

export const PAGE_CONCEPT_GALLERY_INSPECT_EVENT = 'site00:page-concept-gallery-inspect' as const;

export type PageConceptGalleryInspectDetail = {
  projectId: string;
  pageId: string;
  conceptId: string;
};
