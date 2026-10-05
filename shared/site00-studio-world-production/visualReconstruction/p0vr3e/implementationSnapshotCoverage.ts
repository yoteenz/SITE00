/**
 * P0.VR.3E — Implementation snapshot coverage metrics.
 */

import { listDesignScreensForProject } from '../p0vr2/designScreenRegistry.js';
import { buildDesignScreenMatrix } from '../p0vr2/designScreenMatrix.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import { getLatestImplementationSnapshot, listImplementationSnapshotsForScreen } from './implementationSnapshotRegistry.js';
import { isMissingImplementationRoute } from './routeRepresentativeResolver.js';
import type { ImplementationSnapshotCoverage } from './types.js';

function viewportStats(projectId: string, viewport: DesignViewportClass, eligibleIds: string[]) {
  let captured = 0;
  let missing = 0;
  let stale = 0;
  let failed = 0;
  for (const screenId of eligibleIds) {
    const latest = getLatestImplementationSnapshot(projectId, screenId, viewport);
    if (!latest || latest.captureStatus === 'MISSING' || latest.captureStatus === 'IMPLEMENTATION_MISSING') {
      missing++;
    } else if (latest.captureStatus === 'FAILED' || latest.captureStatus === 'AUTH_BLOCKED') {
      failed++;
    } else if (latest.stale || latest.captureStatus === 'STALE' || latest.captureStatus === 'POSSIBLY_STALE') {
      stale++;
      captured++;
    } else if (latest.captureStatus === 'CURRENT') {
      captured++;
    }
  }
  return { captured, missing, stale, failed };
}

export function buildImplementationSnapshotCoverage(projectId: string): ImplementationSnapshotCoverage {
  const screens = listDesignScreensForProject(projectId, true);
  const unique = screens.filter((s, i, arr) => arr.findIndex((x) => x.screenId === s.screenId) === i);
  const eligible = unique.filter((s) => !isMissingImplementationRoute(s));
  const eligibleIds = eligible.map((s) => s.screenId);

  const matrix = buildDesignScreenMatrix(projectId);
  const refCells = matrix.flatMap((r) => [r.mobile, r.tablet, r.desktop]);
  const refCoverage = refCells.filter((c) => c.referenceStatus === 'ACTIVE').length / Math.max(refCells.length, 1);
  const matchCoverage = refCells.filter((c) => c.implementationStatus === 'MATCHED').length / Math.max(refCells.length, 1);

  const mobile = viewportStats(projectId, 'mobile', eligibleIds);
  const tablet = viewportStats(projectId, 'tablet', eligibleIds);
  const desktop = viewportStats(projectId, 'desktop', eligibleIds);
  const totalSlots = eligibleIds.length * 3;
  const capturedTotal = mobile.captured + tablet.captured + desktop.captured;

  return {
    projectId,
    designScreens: unique.length,
    eligibleScreens: eligible.length,
    mobile,
    tablet,
    desktop,
    referenceCoverage: refCoverage,
    matchCoverage,
    implementationSnapshotCoverage: capturedTotal / Math.max(totalSlots, 1),
  };
}

export function listScreensWithSnapshots(projectId: string) {
  return listDesignScreensForProject(projectId, true)
    .filter((s, i, arr) => arr.findIndex((x) => x.screenId === s.screenId) === i)
    .map((screen) => ({
      screenId: screen.screenId,
      displayName: screen.displayName,
      routeFamily: screen.routeFamily ?? 'OTHER',
      mobile: getLatestImplementationSnapshot(projectId, screen.screenId, 'mobile'),
      tablet: getLatestImplementationSnapshot(projectId, screen.screenId, 'tablet'),
      desktop: getLatestImplementationSnapshot(projectId, screen.screenId, 'desktop'),
      historyCount: listImplementationSnapshotsForScreen(projectId, screen.screenId).length,
      missingImplementation: isMissingImplementationRoute(screen),
    }));
}
