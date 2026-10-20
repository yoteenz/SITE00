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

/** Select a screen on `/foundation/review` (hash + event; scroll within the active zone gallery). */
export function navigateToReviewAnchor(anchorId: string): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', `${SITE00_ROUTES.digitalFoundationReview}#${anchorId}`);
  window.dispatchEvent(new CustomEvent('df-review-nav', { detail: { anchorId } }));
  requestAnimationFrame(() => {
    const el =
      document.getElementById(anchorId) ??
      document.querySelector<HTMLElement>(`[data-review-gallery-section="${anchorId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/** @deprecated Prefer navigateToReviewAnchor — kept for in-flow CTAs that only need hash sync. */
export function scrollToReviewAnchor(anchorId: string): void {
  navigateToReviewAnchor(anchorId);
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
