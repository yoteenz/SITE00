/** Real NDXBOOK / SITE 00 copy — not compiler semantic roles. */
export const NDXBOOK_IMPLEMENTATION_COPY: Record<string, string> = {
  'host-brand': 'SITE 00',
  'host-nav-references': 'REFERENCES',
  'host-nav-assets': 'ASSETS',
  'host-nav-pages': 'PAGES',
  'host-nav-skins': 'SKINS',
  'host-nav-more': 'MORE',
  'host-status-compiler': 'COMPILER · READY',
  'context-project-label': 'PROJECT · NDXBOOK',
  'context-viewport-mobile': 'MOBILE',
  'context-viewport-tablet': 'TABLET',
  'context-viewport-desktop': 'DESKTOP',
  'context-stage-badge': 'DESIGN',
  'dominant-headline': 'THE SIGNAL IS THE INDEX',
  'dominant-subcopy': 'Cultural intelligence · editorial receipt · pilot r4',
  'select-mobile-btn': 'SELECT MOBILE',
  'select-desktop-btn': 'SELECT DESKTOP',
  'promote-mobile-btn': 'PROMOTE MOBILE',
  'promote-desktop-btn': 'PROMOTE DESKTOP',
  'pair-review-btn': 'PAIR REVIEW',
  'lock-pair-btn': 'LOCK PAIR',
  'refine-btn': 'REFINE',
  'regen-btn': 'REGENERATE',
  'inspect-btn': 'INSPECT',
  'primary-next-action': 'CONTEXTUAL NEXT',
  'grounding-card': 'GROUNDING',
  'blueprint-card': 'BLUEPRINT',
  'overlay-card': 'OVERLAY',
  'assets-card': 'ASSETS',
  'function-card': 'FUNCTION',
  'readiness-checklist': 'Checks · authority · assets · compile',
  'technical-details-trigger': 'TECHNICAL DETAILS',
  'history-access': 'DESIGN HISTORY',
  'feature-history-access': 'FEATURE CHANGE',
  'master-amendment-badge': 'MASTER AMENDMENT',
  'mobile-nav-references': 'WORKSPACE',
  'mobile-nav-assets': 'DESIGN HISTORY',
  'mobile-nav-pages': 'FEATURE CHANGE',
  'mobile-nav-skins': 'MASTER AMENDMENT',
  'mobile-nav-more': 'CONTEXTUAL NEXT',
};

export function resolveTemplateKeyFromObjectId(objectId: string): string {
  return objectId.replace(/^mobile-/, '');
}

export function resolveImplementationCopy(objectId: string, category: string, index?: number): string | null {
  const key = resolveTemplateKeyFromObjectId(objectId);
  if (NDXBOOK_IMPLEMENTATION_COPY[key]) return NDXBOOK_IMPLEMENTATION_COPY[key]!;
  if (key.startsWith('gallery-thumb-')) {
    const n = key.split('-').pop();
    return `Concept ${n ?? index ?? '·'}`;
  }
  if (category === 'BORDER' || category === 'DIVIDER') return null;
  if (category === 'IMAGE' || category === 'ARTIFACT' && key.includes('artifact-image')) return null;
  if (category === 'PROGRESS') return '82%';
  return null;
}
