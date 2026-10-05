/**
 * P0.VR.3A — SITE 00 design coverage summary + queues.
 */

import type {
  NeedsBetterReferenceQueueItem,
  NeedsReferenceQueueItem,
  Site00DesignCoverageSummary,
  StudioWorldDesignRouteManifestEntry,
  ViewportCoverageSummary,
} from '../p0vr3/types.js';
import type { DesignViewportClass, ReferenceQualityLabel } from '../p0vr2/types.js';
import { buildSite00VisualStates } from './site00RouteForensics.js';
import { auditSite00References } from './site00ReferenceDiscovery.js';

function summarizeViewport(
  audit: ReturnType<typeof auditSite00References>,
  viewport: DesignViewportClass,
): ViewportCoverageSummary {
  const rows = audit.filter((a) => a.viewport === viewport);
  return {
    canonical: rows.filter((r) => r.quality === 'CANONICAL_GOOD').length,
    missing: rows.filter((r) => r.quality === 'MISSING').length,
    stale: rows.filter((r) => r.quality === 'OUTDATED').length,
    needsRebuild: rows.filter((r) => r.quality === 'SHOULD_REPLACE').length,
    partial: rows.filter((r) => r.quality === 'PARTIAL').length,
    outdated: rows.filter((r) => r.quality === 'OUTDATED').length,
  };
}

export function buildSite00DesignCoverageSummary(
  routes: StudioWorldDesignRouteManifestEntry[],
): Site00DesignCoverageSummary {
  const audit = auditSite00References();
  const designable = routes.filter((r) => r.showInDefaultSelector !== false);
  const totalCells = designable.length * 3;
  const missingCells = audit.filter((a) => a.quality === 'MISSING').length;
  const partialCells = audit.filter((a) => a.quality === 'PARTIAL' || a.quality === 'USABLE').length;

  return {
    totalDesignablePages: designable.length,
    totalImportantStates: buildSite00VisualStates().length,
    mobile: summarizeViewport(audit, 'mobile'),
    tablet: summarizeViewport(audit, 'tablet'),
    desktop: summarizeViewport(audit, 'desktop'),
    routeCompleteness: designable.filter((r) => r.dependencyClosure === 'COMPLETE').length / Math.max(designable.length, 1),
    referenceCoverage: (totalCells - missingCells) / Math.max(totalCells, 1),
    implementationCoverage: partialCells / Math.max(totalCells, 1),
    viewportCoverage: (totalCells - missingCells) / Math.max(totalCells, 1),
  };
}

export function buildNeedsReferenceQueue(routes: StudioWorldDesignRouteManifestEntry[]): NeedsReferenceQueueItem[] {
  const audit = auditSite00References();
  const priorityByScreen = new Map(routes.map((r) => [r.screenId, r.priority ?? 'SECONDARY']));
  return audit
    .filter((a) => a.quality === 'MISSING')
    .map((a) => ({
      screenId: a.screenId,
      displayName: routes.find((r) => r.screenId === a.screenId)?.displayName ?? a.screenId,
      viewport: a.viewport,
      status: a.quality as ReferenceQualityLabel,
      priority: priorityByScreen.get(a.screenId) ?? 'SECONDARY',
    }))
    .sort((a, b) => a.priority.localeCompare(b.priority));
}

export function buildNeedsBetterReferenceQueue(
  routes: StudioWorldDesignRouteManifestEntry[],
): NeedsBetterReferenceQueueItem[] {
  const audit = auditSite00References();
  const badQualities: ReferenceQualityLabel[] = [
    'OUTDATED',
    'LOW_RESOLUTION',
    'WRONG_SHELL',
    'WRONG_VIEWPORT',
    'SHOULD_REPLACE',
    'PARTIAL',
  ];
  return audit
    .filter((a) => badQualities.includes(a.quality))
    .map((a) => ({
      screenId: a.screenId,
      displayName: routes.find((r) => r.screenId === a.screenId)?.displayName ?? a.screenId,
      viewport: a.viewport,
      quality: a.quality,
      reason: `${a.quality} — ${a.storagePath}`,
    }));
}

export function buildSite00PageCoverageMatrix(
  routes: StudioWorldDesignRouteManifestEntry[],
): Array<{ page: string; mobile: string; tablet: string; desktop: string }> {
  const audit = auditSite00References();
  return routes
    .filter((r) => r.showInDefaultSelector !== false)
    .map((route) => {
      const cell = (vp: DesignViewportClass) => {
        const hit = audit.find((a) => a.screenId === route.screenId && a.viewport === vp);
        return hit?.quality ?? 'MISSING';
      };
      return {
        page: route.displayName,
        mobile: cell('mobile'),
        tablet: cell('tablet'),
        desktop: cell('desktop'),
      };
    });
}
