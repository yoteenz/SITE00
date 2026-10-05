export const PAGE_CONCEPT_GALLERY_MOBILE_SLOT_LABELS = ['A', 'B', 'C'] as const;

export type PageConceptGalleryMobileSlotLabel = (typeof PAGE_CONCEPT_GALLERY_MOBILE_SLOT_LABELS)[number];

export type PageConceptGallerySlottableCandidate = {
  slotLabel?: string | null;
  version?: string;
};

export function resolvePageConceptGalleryMobileSlotLabel(
  candidate: PageConceptGallerySlottableCandidate,
): PageConceptGalleryMobileSlotLabel | null {
  const direct = candidate.slotLabel?.trim().toUpperCase();
  if (direct === 'A' || direct === 'B' || direct === 'C') return direct;
  const fromVersion = /CONCEPT\s+([ABC])\b/i.exec(candidate.version ?? '');
  if (fromVersion?.[1]) {
    return fromVersion[1].toUpperCase() as PageConceptGalleryMobileSlotLabel;
  }
  return null;
}

/** Pin each CURRENT candidate to A/B/C so the gallery grid keeps three equal columns. */
export function mapPageConceptGalleryCurrentByMobileSlot<T extends PageConceptGallerySlottableCandidate>(
  current: readonly T[],
): Record<PageConceptGalleryMobileSlotLabel, T | null> {
  const out: Record<PageConceptGalleryMobileSlotLabel, T | null> = { A: null, B: null, C: null };
  for (const candidate of current) {
    const slot = resolvePageConceptGalleryMobileSlotLabel(candidate);
    if (slot && !out[slot]) out[slot] = candidate;
  }
  let slotIndex = 0;
  for (const candidate of current) {
    if (resolvePageConceptGalleryMobileSlotLabel(candidate)) continue;
    while (slotIndex < PAGE_CONCEPT_GALLERY_MOBILE_SLOT_LABELS.length && out[PAGE_CONCEPT_GALLERY_MOBILE_SLOT_LABELS[slotIndex]!]) {
      slotIndex += 1;
    }
    if (slotIndex >= PAGE_CONCEPT_GALLERY_MOBILE_SLOT_LABELS.length) break;
    out[PAGE_CONCEPT_GALLERY_MOBILE_SLOT_LABELS[slotIndex]!] = candidate;
    slotIndex += 1;
  }
  return out;
}
