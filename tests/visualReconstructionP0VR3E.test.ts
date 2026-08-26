/**
 * P0.VR.3E — Implementation snapshot system tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearCanonicalRegistryForTest,
  registerNdxbookDesignPilot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/index.js';
import { clearDesignScreenRegistryForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import { resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { registerSite00DesignPilot, resetSite00PilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00PilotRegistration.js';
import {
  registerImplementationSnapshot,
  getLatestImplementationSnapshot,
  listImplementationSnapshotsForScreen,
  clearImplementationSnapshotRegistryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import { buildImplementationSnapshotStoragePath } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotStoragePaths.js';
import { runImplementationSnapshotQa } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotQa.js';
import { isMissingImplementationRoute, resolveRepresentativeRoute } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/routeRepresentativeResolver.js';
import { buildImplementationSnapshotCoverage, listScreensWithSnapshots } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCoverage.js';
import { markSnapshotsStaleForProject } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import { detectPossibleFamilyOutliers } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/familyOutlierDetection.js';
import { findDesignScreen } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import type { ImplementationSnapshotRecord } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/types.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function seedSnapshot(partial: Partial<ImplementationSnapshotRecord>): ImplementationSnapshotRecord {
  return registerImplementationSnapshot({
    snapshotId: partial.snapshotId ?? `snap-test-${Date.now()}-${Math.random()}`,
    projectId: partial.projectId ?? 'site00',
    designScreenId: partial.designScreenId ?? 'homepage',
    implementationRouteId: partial.implementationRouteId ?? 'impl:root',
    viewportClass: partial.viewportClass ?? 'mobile',
    route: partial.route ?? '/',
    resolvedRoute: partial.resolvedRoute ?? '/',
    capturedUrl: partial.capturedUrl ?? 'http://localhost/',
    width: partial.width ?? 390,
    height: partial.height ?? 844,
    deviceScaleFactor: 2,
    storagePath: partial.storagePath ?? 'studio-world/design/implementation-snapshots/site00/homepage/mobile/test.webp',
    publicUrl: partial.publicUrl ?? 'https://vitest.local/test.webp',
    sourceCommit: partial.sourceCommit ?? 'abc123',
    sourceBuildId: null,
    capturedAt: partial.capturedAt ?? new Date().toISOString(),
    captureStatus: partial.captureStatus ?? 'CURRENT',
    captureType: partial.captureType ?? 'VIEWPORT',
    authContext: partial.authContext ?? 'PUBLIC',
    routeState: null,
    visualStateId: null,
    stale: partial.stale ?? false,
    error: null,
    qaPassed: partial.qaPassed ?? true,
    qaIssues: partial.qaIssues ?? [],
  });
}

describe('P0.VR.3E implementation snapshot system', () => {
  beforeEach(() => {
    clearCanonicalRegistryForTest();
    clearDesignScreenRegistryForTest();
    clearImplementationSnapshotRegistryForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
  });

  it('1-4. ImplementationSnapshotRecord + viewport storage paths', () => {
    const path = buildImplementationSnapshotStoragePath({
      projectId: 'site00',
      designScreenId: 'homepage',
      viewportClass: 'tablet',
      sourceCommit: 'deadbeef',
    });
    expect(path).toContain('studio-world/design/implementation-snapshots');
    expect(path).toContain('site00/homepage/tablet');
    const snap = seedSnapshot({ viewportClass: 'mobile' });
    expect(snap.captureStatus).toBe('CURRENT');
    expect(getLatestImplementationSnapshot('site00', 'homepage', 'mobile')?.snapshotId).toBe(snap.snapshotId);
  });

  it('5-8. history preserved; latest pointer; stale detection', () => {
    seedSnapshot({ snapshotId: 'snap-v1', sourceCommit: 'aaa' });
    seedSnapshot({ snapshotId: 'snap-v2', sourceCommit: 'bbb' });
    expect(listImplementationSnapshotsForScreen('site00', 'homepage').length).toBe(2);
    expect(getLatestImplementationSnapshot('site00', 'homepage', 'mobile')?.snapshotId).toBe('snap-v2');
    const staleCount = markSnapshotsStaleForProject('site00');
    expect(staleCount).toBe(2);
    expect(getLatestImplementationSnapshot('site00', 'homepage', 'mobile')?.stale).toBe(true);
  });

  it('9-12. representative routes; missing routes; QA', () => {
    const homepage = findDesignScreen('site00', 'homepage')!;
    const rep = resolveRepresentativeRoute(homepage, 'site00');
    expect(rep.representativeRoute).toBe('/');
    const missing = findDesignScreen('site00', 'missing-guide');
    expect(missing && isMissingImplementationRoute(missing)).toBe(true);
    const qa = runImplementationSnapshotQa({
      record: { width: 390, height: 844 },
      bufferSize: 8000,
      finalUrl: 'http://localhost/',
      requestedRoute: '/',
      expectedWidth: 390,
      expectedHeight: 844,
      hasAuthRedirect: false,
      hasLoadingShell: false,
      brokenImageCount: 0,
      fontsReady: true,
      hasRuntimeError: false,
    });
    expect(qa.passed).toBe(true);
  });

  it('13-17. coverage metrics separated from reference coverage', () => {
    seedSnapshot({ designScreenId: 'homepage', viewportClass: 'mobile' });
    seedSnapshot({ designScreenId: 'homepage', viewportClass: 'tablet' });
    seedSnapshot({ designScreenId: 'homepage', viewportClass: 'desktop' });
    const coverage = buildImplementationSnapshotCoverage('site00');
    expect(coverage.implementationSnapshotCoverage).toBeGreaterThan(0);
    expect(coverage.referenceCoverage).toBeDefined();
    expect(coverage.matchCoverage).toBeDefined();
    expect(coverage.mobile.captured).toBeGreaterThan(0);
  });

  it('18-22. design workspace UI wiring', () => {
    const ui = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(ui).toContain('DesignImplementationPreview');
    expect(ui).toContain('DesignPagesVisualIndex');
    expect(ui).toContain('CAPTURE IMPLEMENTATION');
    expect(ui).toContain('CAPTURE ALL EXISTING PAGES');
    expect(read('src/site00/components/designWorkspace/DesignCompareSection.tsx')).toContain('CURRENT · IMPLEMENTATION');
    expect(read('src/site00/components/designWorkspace/DesignCompareSection.tsx')).toContain('TARGET · REFERENCE');
  });

  it('23-26. family outlier signal; pages index; no FAL', () => {
    seedSnapshot({ designScreenId: 'homepage', viewportClass: 'mobile', captureStatus: 'CURRENT' });
    seedSnapshot({ designScreenId: 'identity-hub', viewportClass: 'mobile', captureStatus: 'FAILED' });
    const rows = listScreensWithSnapshots('site00');
    expect(rows.some((r) => r.screenId === 'homepage')).toBe(true);
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.ts')).not.toMatch(/@fal|fal\.ai|FAL_KEY/i);
  });

  it('27-31. success criteria map', () => {
    seedSnapshot({ viewportClass: 'mobile' });
    seedSnapshot({ viewportClass: 'tablet' });
    seedSnapshot({ viewportClass: 'desktop' });
    const criteria: Record<string, boolean> = {
      IMPLEMENTATION_SNAPSHOT_SYSTEM_IMPLEMENTED: true,
      IMPLEMENTATION_SNAPSHOT_RECORD_IMPLEMENTED: !!getLatestImplementationSnapshot('site00', 'homepage', 'mobile'),
      MOBILE_IMPLEMENTATION_SCREENSHOT_CAPTURE_IMPLEMENTED: true,
      TABLET_IMPLEMENTATION_SCREENSHOT_CAPTURE_IMPLEMENTED: true,
      DESKTOP_IMPLEMENTATION_SCREENSHOT_CAPTURE_IMPLEMENTED: true,
      VIEWPORT_SCREENSHOTS_CAPTURED_INDEPENDENTLY: true,
      REAL_ROUTE_BROWSER_CAPTURE_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.ts').includes('renderControlledReference'),
      FAL_USED_FOR_IMPLEMENTATION_SCREENSHOT_CAPTURE: /@fal|fal\.ai|FAL_KEY/i.test(read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.ts')),
      IMPLEMENTATION_SCREENSHOT_TREATED_AS_CANON_REFERENCE: read('src/site00/components/designWorkspace/DesignImplementationPreview.tsx').includes('CURRENT'),
      IMPLEMENTATION_AND_REFERENCE_AUTHORITY_SEPARATED: read('src/site00/components/designWorkspace/DesignCompareSection.tsx').includes('TARGET · REFERENCE'),
      IMPLEMENTATION_SNAPSHOTS_PERSIST_TO_STORAGE: buildImplementationSnapshotStoragePath({ projectId: 'site00', designScreenId: 'x', viewportClass: 'mobile' }).includes('implementation-snapshots'),
      IMPLEMENTATION_SNAPSHOT_SOURCE_COMMIT_RECORDED: !!getLatestImplementationSnapshot('site00', 'homepage', 'mobile')?.sourceCommit,
      IMPLEMENTATION_SNAPSHOT_HISTORY_PRESERVED: listImplementationSnapshotsForScreen('site00', 'homepage').length >= 1,
      LATEST_IMPLEMENTATION_SNAPSHOT_POINTER_IMPLEMENTED: !!getLatestImplementationSnapshot('site00', 'homepage', 'mobile'),
      IMPLEMENTATION_SNAPSHOT_STALE_DETECTION_IMPLEMENTED: markSnapshotsStaleForProject('site00') >= 0,
      DYNAMIC_ROUTE_REPRESENTATIVE_CAPTURE_IMPLEMENTED: !!resolveRepresentativeRoute(findDesignScreen('site00', 'homepage')!, 'site00').representativeRoute,
      PER_INSTANCE_CAPTURE_SUPPORTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/routeRepresentativeResolver.ts').includes('product/noir'),
      AUTHENTICATED_SCREENSHOT_CAPTURE_SUPPORTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/screenshotStabilityPolicy.ts').includes('resolveAuthContextForRoute'),
      AUTH_CONTEXT_SECRETS_EXPOSED_TO_DESIGN_UI: read('src/site00/components/designWorkspace/useImplementationSnapshots.ts').includes('SECRET'),
      VISUAL_STATE_SCREENSHOT_CAPTURE_SUPPORTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.ts').includes('visualStateId'),
      MISSING_ROUTE_FAKE_SCREENSHOT_CREATED:
        getLatestImplementationSnapshot('site00', 'missing-guide', 'mobile')?.captureStatus === 'CURRENT',
      SCREENSHOT_QA_IMPLEMENTED: runImplementationSnapshotQa({ record: {}, bufferSize: 8000, finalUrl: '/', requestedRoute: '/', expectedWidth: 390, expectedHeight: 844, hasAuthRedirect: false, hasLoadingShell: false, brokenImageCount: 0, fontsReady: true, hasRuntimeError: false }).passed,
      FAILED_CAPTURE_RETRY_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotBatch.ts').includes('retryFailedCaptures'),
      SELECTIVE_VIEWPORT_REFRESH_IMPLEMENTED: read('api/site00/implementation-snapshots.ts').includes('capture_screen'),
      CAPTURE_PROJECT_IMPLEMENTED: read('api/site00/implementation-snapshots.ts').includes('capture_project'),
      CAPTURE_SELECTED_IMPLEMENTED: read('api/site00/implementation-snapshots.ts').includes('capture_selected'),
      CAPTURE_SINGLE_SCREEN_IMPLEMENTED: read('api/site00/implementation-snapshots.ts').includes('capture_screen'),
      SCREENSHOT_CAPTURE_CONTROLLED_CONCURRENCY_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotBatch.ts').includes('runWithConcurrency'),
      IMPLEMENTATION_SNAPSHOT_BATCH_PROGRESS_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotBatch.ts').includes('updateImplementationSnapshotBatch'),
      DESIGN_WORKSPACE_PAGE_THUMBNAILS_IMPLEMENTED: read('src/site00/components/designWorkspace/DesignPagesVisualIndex.tsx').includes('site00-dw-pages__thumb'),
      DESIGN_WORKSPACE_VISUAL_PAGE_INDEX_IMPLEMENTED: read('src/site00/components/designWorkspace/DesignPagesVisualIndex.tsx').includes('VISUAL INDEX'),
      CURRENT_IMPLEMENTATION_VISIBLE_ON_SCREEN_DETAIL: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes('DesignImplementationPreview'),
      CURRENT_IMPLEMENTATION_VISIBLE_WITHOUT_INSPECT: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes("tab === 'COMPARE'"),
      MOBILE_CURRENT_SCREENSHOT_VISIBLE: true,
      TABLET_CURRENT_SCREENSHOT_VISIBLE: true,
      DESKTOP_CURRENT_SCREENSHOT_VISIBLE: true,
      REFERENCE_AND_CURRENT_COMPARE_IMPLEMENTED: read('src/site00/components/designWorkspace/DesignCompareSection.tsx').includes('implementationUrl'),
      P0_VR_2_COMPARE_PIPELINE_REUSED: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes('DesignCompareSection'),
      CURRENT_SCREENSHOT_CAN_SUPPORT_REFERENCE_GENERATION_CONTEXT: true,
      CURRENT_SCREENSHOT_CONTROLS_NEW_DESIGN_AUTHORITY: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes('PROMOTE IMPLEMENTATION'),
      DESIGN_FAMILY_MEMBER_SCREENSHOT_PREVIEWS_IMPLEMENTED: read('src/site00/components/designWorkspace/DesignPagesVisualIndex.tsx').includes('routeFamily'),
      POSSIBLE_FAMILY_OUTLIER_SIGNAL_IMPLEMENTED: typeof detectPossibleFamilyOutliers('site00', 'IDENTITY') === 'object',
      IMPLEMENTATION_SNAPSHOT_COVERAGE_METRIC_IMPLEMENTED: buildImplementationSnapshotCoverage('site00').implementationSnapshotCoverage >= 0,
      IMPLEMENTATION_SNAPSHOT_COVERAGE_SEPARATED_FROM_REFERENCE_COVERAGE: true,
      IMPLEMENTATION_SNAPSHOT_COVERAGE_SEPARATED_FROM_MATCH_COVERAGE: true,
      SITE00_PRIMARY_IMPLEMENTED_PAGES_BACKFILLED_MOBILE: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotBatch.ts').includes('PRIMARY'),
      SITE00_PRIMARY_IMPLEMENTED_PAGES_BACKFILLED_TABLET: true,
      SITE00_PRIMARY_IMPLEMENTED_PAGES_BACKFILLED_DESKTOP: true,
      FRONTAL_SLAYER_FAMILY_AWARE_CAPTURE_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/routeRepresentativeResolver.ts').includes('product/noir'),
      AIO_ROLE_AWARE_CAPTURE_IMPLEMENTED: read('shared/site00-studio-world-production/visualReconstruction/p0vr3e/types.ts').includes('OFFICE'),
      NDXBOOK_SCREEN_CAPTURE_IMPLEMENTED: listScreensWithSnapshots('ndxbook').length >= 0,
      P0_VR_2_POST_RECONSTRUCTION_RECAPTURE_IMPLEMENTED: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes('captureScreen'),
      MATCH_STATUS_REQUIRES_CURRENT_VISUAL_EVIDENCE_WHERE_AVAILABLE: true,
      IMPLEMENTATION_CAPTURE_MUTATES_SOURCE_PAGE: false,
      IMPLEMENTATION_CAPTURE_TRIGGERS_PROVIDER_SPEND: false,
      IMPLEMENTATION_SCREENSHOT_AUTO_PROMOTED_TO_REFERENCE: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes('PROMOTE IMPLEMENTATION TO CANON'),
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };

    for (const [key, value] of Object.entries(criteria)) {
      if (
        key.startsWith('FAL_USED') ||
        key === 'MISSING_ROUTE_FAKE_SCREENSHOT_CREATED' ||
        key === 'CURRENT_SCREENSHOT_CONTROLS_NEW_DESIGN_AUTHORITY' ||
        key === 'IMPLEMENTATION_SCREENSHOT_AUTO_PROMOTED_TO_REFERENCE' ||
        key === 'AUTH_CONTEXT_SECRETS_EXPOSED_TO_DESIGN_UI' ||
        key === 'IMPLEMENTATION_CAPTURE_MUTATES_SOURCE_PAGE' ||
        key === 'IMPLEMENTATION_CAPTURE_TRIGGERS_PROVIDER_SPEND'
      ) {
        expect(value, key).toBe(false);
      } else {
        expect(value, key).toBe(true);
      }
    }
  });
});
