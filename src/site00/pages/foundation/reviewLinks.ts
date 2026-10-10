import { SITE00_ROUTES } from '../../config/routes';
import type { DfView } from '../../foundation-client/model';

/** Review-page anchor for a Digital Foundation step. */
export function reviewAnchorForView(view: DfView): string {
  return `df-r-${view}`;
}

/** Scroll to a screen on the review page without leaving `/foundation/review`. */
export function scrollToReviewAnchor(anchorId: string): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(anchorId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', `${SITE00_ROUTES.digitalFoundationReview}#${anchorId}`);
  }
}

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
