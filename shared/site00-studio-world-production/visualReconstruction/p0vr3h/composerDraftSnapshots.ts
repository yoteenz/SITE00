/**
 * P0.VR.3H — Composer draft snapshot capture integration (P0.VR.3E).
 */

import { buildSite00DiscoveredRoutes } from '../p0vr3a/site00RouteForensics.js';
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
  const drafts = buildSite00DiscoveredRoutes().filter((r) => r.dependencyClosure === 'IMPLEMENTED_DRAFT');

  return drafts
    .filter((r) => isComposerDraftRoute(r.resolvedRoute))
    .map((r) => ({
      projectId: 'site00',
      screenId: r.screenId,
      route: r.resolvedRoute,
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
