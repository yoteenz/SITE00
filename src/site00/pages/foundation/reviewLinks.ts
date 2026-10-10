import { SITE00_ROUTES } from '../../config/routes';

/** Absolute address for one screen on `/foundation/review`. */
export function reviewScreenUrl(anchorId: string, origin: string = reviewScreenOrigin()): string {
  const base = origin.replace(/\/$/, '');
  return `${base}${SITE00_ROUTES.digitalFoundationReview}#${anchorId}`;
}

/** Current page origin, so the copied address matches the host the founder is on. */
export function reviewScreenOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return '';
}
