import { SITE00_ROUTES } from '../../config/routes';
import type { DfView } from '../../foundation-client/model';

/** Review-page anchor for a Digital Foundation step. */
export function reviewAnchorForView(view: DfView): string {
  return `df-r-${view}`;
}

/** Map hash anchors to canonical review entries (legacy BLDR ids stay addressable). */
export function normalizeReviewAnchor(anchorId: string): string {
  if (anchorId.startsWith('df-r-bldr-')) return anchorId;
  return anchorId;
}

/** Scroll to a screen on the review page without leaving `/foundation/review`. */
export function scrollToReviewAnchor(anchorId: string): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', `${SITE00_ROUTES.digitalFoundationReview}#${anchorId}`);
  const target = document.getElementById(anchorId) ?? document.querySelector(`[data-review-gallery-section="${anchorId}"]`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  window.dispatchEvent(new CustomEvent('df-review-nav', { detail: { anchorId } }));
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
