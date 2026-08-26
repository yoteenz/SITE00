/**
 * P0.VR.3H — Composer draft snapshot capture integration (P0.VR.3E).
 */

import { COMPOSER_DRAFT_SNAPSHOT_LABEL } from './constants.js';
import { isComposerDraftRoute } from './draftRouteGuard.js';
import type { ComposerReviewQueueEntry } from './types.js';

export type ComposerDraftCaptureTarget = {
  projectId: string;
  screenId: string;
  route: string;
  viewportClasses: ('mobile' | 'tablet' | 'desktop')[];
  snapshotLabel: typeof COMPOSER_DRAFT_SNAPSHOT_LABEL;
  captureQuery: string;
};

export function buildComposerDraftCaptureTargets(): ComposerDraftCaptureTarget[] {
  const routes = [
    { screenId: 'missing-guide', route: '/guide' },
    { screenId: 'missing-sound', route: '/sound' },
    { screenId: 'missing-faq', route: '/faq' },
    { screenId: 'missing-contact', route: '/contact' },
    { screenId: 'missing-forgot-password', route: '/origin/forgot-password' },
    { screenId: 'missing-reset-password', route: '/origin/reset-password' },
    { screenId: 'missing-blueprints', route: '/blueprints' },
    { screenId: 'missing-account-profile', route: '/account' },
    { screenId: 'missing-brand-page', route: '/brand' },
  ];

  return routes
    .filter((r) => isComposerDraftRoute(r.route))
    .map((r) => ({
      projectId: 'site00',
      screenId: r.screenId,
      route: r.route,
      viewportClasses: ['mobile', 'tablet', 'desktop'] as const,
      snapshotLabel: COMPOSER_DRAFT_SNAPSHOT_LABEL,
      captureQuery: 'preview=1&designPreview=1',
    }));
}

export function attachSnapshotsToReviewQueue(
  queue: ComposerReviewQueueEntry[],
  snapshots: Record<string, Partial<ComposerReviewQueueEntry['screenshots']>>,
): ComposerReviewQueueEntry[] {
  return queue.map((entry) => ({
    ...entry,
    screenshots: {
      mobile: snapshots[entry.pageId]?.mobile ?? entry.screenshots.mobile,
      tablet: snapshots[entry.pageId]?.tablet ?? entry.screenshots.tablet,
      desktop: snapshots[entry.pageId]?.desktop ?? entry.screenshots.desktop,
    },
  }));
}

export function composerDraftCaptureRoute(route: string): string {
  const separator = route.includes('?') ? '&' : '?';
  return `${route}${separator}preview=1&designPreview=1`;
}

/** P0.VR.3E resolver should capture implemented composer drafts (not skip as missing). */
export function isComposerDraftImplementationRoute(route: string): boolean {
  return isComposerDraftRoute(route);
}
