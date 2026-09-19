import { NDXBOOK_IMPLEMENTATION_COPY } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';

/** Authority panel hierarchy copy (R8M2 fidelity). */
export const NDXBOOK_R8M2_COPY_OVERRIDES: Record<string, string> = {
  'select-mobile-btn': 'SELECT FOR MOBILE',
  'select-desktop-btn': 'SELECT FOR DESKTOP',
  'promote-mobile-btn': 'PROMOTE MOBILE',
  'promote-desktop-btn': 'PROMOTE DESKTOP',
  'pair-review-btn': 'PAIR REVIEW',
  'lock-pair-btn': 'LOCK MOBILE + DESKTOP AUTHORITY PAIR',
  'authority-pair-label': 'AUTHORITY PAIR',
  'mobile-master-label': 'MOBILE MASTER',
  'desktop-master-label': 'DESKTOP MASTER',
  'review-authority-btn': 'REVIEW AUTHORITY',
  'replace-authority-btn': 'REPLACE',
  'entry-label': 'ENTRY',
  'cultural-receipt-label': 'CULTURAL RECEIPT',
  'evidence-badge': 'EVIDENCE',
  'compare-control': 'COMPARE',
  'gallery-version-label': 'v1',
};

export function resolveR8M2ImplementationCopy(objectId: string, category: string, index?: number): string | null {
  const key = objectId.replace(/^mobile-/, '');
  if (NDXBOOK_R8M2_COPY_OVERRIDES[key]) return NDXBOOK_R8M2_COPY_OVERRIDES[key]!;
  if (NDXBOOK_IMPLEMENTATION_COPY[key]) return NDXBOOK_IMPLEMENTATION_COPY[key]!;
  if (key.startsWith('gallery-thumb-')) {
    const n = key.split('-').pop();
    return `Concept ${n ?? index ?? '·'} · ${NDXBOOK_R8M2_COPY_OVERRIDES['gallery-version-label']}`;
  }
  if (category === 'BORDER' || category === 'DIVIDER') return null;
  if (category === 'IMAGE') return null;
  if (category === 'PROGRESS') return '82%';
  return null;
}
