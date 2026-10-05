import type { PageConceptRenditionSlotId } from './types.js';

export const PAGE_CONCEPT_TARGET_TYPE = 'PAGE' as const;

export const PAGE_RENDITION_SLOT_IDS: readonly PageConceptRenditionSlotId[] = [
  'RENDITION_A',
  'RENDITION_B',
  'RENDITION_C',
];

export const PAGE_RENDITION_GALLERY_IDS = {
  RENDITION_A: 'rendition-a',
  RENDITION_B: 'rendition-b',
  RENDITION_C: 'rendition-c',
} as const;

export function renditionSlotToGalleryConceptId(slot: PageConceptRenditionSlotId): string {
  switch (slot) {
    case 'RENDITION_A':
      return PAGE_RENDITION_GALLERY_IDS.RENDITION_A;
    case 'RENDITION_B':
      return PAGE_RENDITION_GALLERY_IDS.RENDITION_B;
    case 'RENDITION_C':
      return PAGE_RENDITION_GALLERY_IDS.RENDITION_C;
  }
}

export function galleryConceptIdToRenditionSlot(conceptId: string): PageConceptRenditionSlotId | null {
  if (conceptId === PAGE_RENDITION_GALLERY_IDS.RENDITION_A) return 'RENDITION_A';
  if (conceptId === PAGE_RENDITION_GALLERY_IDS.RENDITION_B) return 'RENDITION_B';
  if (conceptId === PAGE_RENDITION_GALLERY_IDS.RENDITION_C) return 'RENDITION_C';
  return null;
}

export function renditionDisplayLabel(slot: PageConceptRenditionSlotId): string {
  return slot.replace('_', ' ');
}
