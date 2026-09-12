/**
 * Build twin preview URL with hero inspection query (no manual editing).
 */
export function buildTwinHeroInspectionUrl(twinRoute: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://site00.com');
  const url = new URL(twinRoute.startsWith('http') ? twinRoute : `${base}${twinRoute.startsWith('/') ? '' : '/'}${twinRoute}`);
  url.searchParams.set('blueprintDebug', 'hero');
  url.hash = 'hero-inspection';
  return `${url.pathname}${url.search}${url.hash}`;
}

export function stripHeroInspectionFromUrl(pathWithSearch: string): string {
  const url = new URL(pathWithSearch, 'https://site00.com');
  url.searchParams.delete('blueprintDebug');
  if (url.hash === '#hero-inspection') url.hash = '';
  return `${url.pathname}${url.search}${url.hash}`;
}
