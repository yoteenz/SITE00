import type { ConceptCandidate } from './types.js';

/** Cache-bust gallery/review images when URL is reused (CDN, static fallback, Safari). */
export function conceptImageDisplayUrl(candidate: Pick<ConceptCandidate, 'visualAssetUrl' | 'updatedAt' | 'conceptId'>): string | undefined {
  const url = candidate.visualAssetUrl?.trim();
  if (!url) return undefined;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  const bust = encodeURIComponent(candidate.updatedAt || candidate.conceptId);
  try {
    const parsed = new URL(url, 'https://site00.local');
    parsed.searchParams.set('site00ConceptRev', bust);
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return parsed.toString();
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}site00ConceptRev=${bust}`;
  }
}
