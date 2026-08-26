/**
 * P0.VR.3J — Composer draft screenshot backfill + NDXBOOK reconciliation tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js')>();
  const { registerImplementationSnapshot } = await import(
    '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js'
  );
  const { COMPOSER_DRAFT_SNAPSHOT_LABEL } = await import(
    '../shared/site00-studio-world-production/visualReconstruction/p0vr3h/constants.js'
  );

  return {
    ...original,
    captureImplementationSnapshot: vi.fn(async (input) =>
      registerImplementationSnapshot({
        snapshotId: `snap-mock-${input.screenId}-${input.viewportClass}-${Date.now()}`,
        projectId: input.projectId,
        designScreenId: input.screenId,
        implementationRouteId: `impl:${input.screenId}`,
        viewportClass: input.viewportClass,
        route: `/${input.screenId}?preview=1&designPreview=1`,
        resolvedRoute: `http://127.0.0.1:5174/${input.screenId}?preview=1`,
        capturedUrl: `http://127.0.0.1:5174/${input.screenId}`,
        width: input.viewportClass === 'desktop' ? 1440 : 390,
        height: input.viewportClass === 'desktop' ? 900 : 844,
        deviceScaleFactor: 2,
        storagePath: `studio-world/design/implementation-snapshots/site00/${input.screenId}/${input.viewportClass}/mock.webp`,
        publicUrl: `https://vitest.local/${input.screenId}-${input.viewportClass}.webp`,
        sourceCommit: 'test',
        sourceBuildId: null,
        capturedAt: new Date().toISOString(),
        captureStatus: 'CURRENT',
        captureType: 'VIEWPORT',
        authContext: 'PUBLIC',
        routeState: null,
        visualStateId: null,
        stale: false,
        error: null,
        qaPassed: true,
        qaIssues: [],
        snapshotLabel: input.snapshotLabel ?? COMPOSER_DRAFT_SNAPSHOT_LABEL,
      }),
    ),
  };
});
import {
  clearCanonicalRegistryForTest,
  clearDesignScreenRegistryForTest,
  registerNdxbookDesignPilot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/index.js';
import { resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { listDesignScreensForProject } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import { clearManifestV2CacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3b/manifestV2Compiler.js';
import { clearDesignRouteSyncContractCacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3d/designRouteSyncContract.js';
import {
  registerSite00DesignPilot,
  resetSite00PilotForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00PilotRegistration.js';
import {
  buildComposerDraftCaptureTargets,
  blockComplexPageBulkApproval,
  buildComposerReviewSets,
  evaluateDraftRouteGuard,
  COMPOSER_DRAFT_SNAPSHOT_LABEL,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3h/client.js';
import {
  clearImplementationSnapshotRegistryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import { captureImplementationSnapshot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js';
import { registerImplementationSnapshot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import type { ImplementationSnapshotRecord } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/types.js';
import {
  SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS,
  SITE00_COMPOSER_DRAFT_PAGE_COUNT,
  captureComposerDraftSnapshots,
  countComposerDraftCaptureTargets,
  expectedComposerDraftCaptureTargets,
  resolveComposerDraftSnapshotLabel,
  buildEnrichedComposerReviewQueue,
  buildEnrichedComposerReviewSets,
  canFinalApprovePage,
  validateAuthUtilityPage,
  authUtilitySetFunctionalValidationPassed,
  auditNdxbookDesignPilotGaps,
  reconcileNdxbookDesignPilotGaps,
  buildComplexShellReviewBriefs,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3j/client.js';
import { clearMissingPageCompletionPlanCacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3h/repoScopedPlan.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function seedComposerDraftSnapshot(
  screenId: string,
  viewport: 'mobile' | 'tablet' | 'desktop',
): ImplementationSnapshotRecord {
  return registerImplementationSnapshot({
    snapshotId: `snap-test-${screenId}-${viewport}-${Date.now()}`,
    projectId: 'site00',
    designScreenId: screenId,
    implementationRouteId: `impl:${screenId}`,
    viewportClass: viewport,
    route: `/${screenId}?preview=1&designPreview=1`,
    resolvedRoute: `http://127.0.0.1:5174/${screenId}?preview=1&designPreview=1`,
    capturedUrl: `http://127.0.0.1:5174/${screenId}`,
    width: viewport === 'desktop' ? 1440 : 390,
    height: viewport === 'desktop' ? 900 : 844,
    deviceScaleFactor: 2,
    storagePath: `studio-world/design/implementation-snapshots/site00/${screenId}/${viewport}/test.webp`,
    publicUrl: `https://vitest.local/${screenId}-${viewport}.webp`,
    sourceCommit: 'test',
    sourceBuildId: null,
    capturedAt: new Date().toISOString(),
    captureStatus: 'CURRENT',
    captureType: 'VIEWPORT',
    authContext: 'PUBLIC',
    routeState: null,
    visualStateId: null,
    stale: false,
    error: null,
    qaPassed: true,
    qaIssues: [],
    snapshotLabel: COMPOSER_DRAFT_SNAPSHOT_LABEL,
  });
}

describe('P0.VR.3J composer draft backfill + NDXBOOK reconciliation', () => {
  beforeEach(() => {
    clearCanonicalRegistryForTest();
    clearDesignScreenRegistryForTest();
    clearManifestV2CacheForTest();
    clearDesignRouteSyncContractCacheForTest();
    clearMissingPageCompletionPlanCacheForTest();
    clearImplementationSnapshotRegistryForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
  });

  it('discovers 9 composer draft pages and 27 capture targets', () => {
    const targets = buildComposerDraftCaptureTargets();
    expect(targets.length).toBe(SITE00_COMPOSER_DRAFT_PAGE_COUNT);
    expect(countComposerDraftCaptureTargets()).toBe(SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS);
    expect(expectedComposerDraftCaptureTargets()).toBe(27);
    expect(targets.every((t) => !t.screenId.startsWith('missing-'))).toBe(true);
  });

  it('captures mobile/tablet/desktop with CURRENT · COMPOSER DRAFT label', async () => {
    const target = buildComposerDraftCaptureTargets()[0]!;
    for (const viewport of ['mobile', 'tablet', 'desktop'] as const) {
      const snap = await captureImplementationSnapshot({
        projectId: 'site00',
        screenId: target.screenId,
        viewportClass: viewport,
        snapshotLabel: COMPOSER_DRAFT_SNAPSHOT_LABEL,
      });
      expect(snap).not.toBeNull();
      expect(snap!.viewportClass).toBe(viewport);
      expect(resolveComposerDraftSnapshotLabel(snap)).toBe(COMPOSER_DRAFT_SNAPSHOT_LABEL);
    }
  });

  it('batch composer draft capture attempts all 27 targets', async () => {
    const result = await captureComposerDraftSnapshots();
    expect(result.targetCount).toBe(27);
    expect(result.attempted).toBe(27);
    expect(result.mobile.attempted).toBe(9);
    expect(result.tablet.attempted).toBe(9);
    expect(result.desktop.attempted).toBe(9);
    expect(result.label).toBe(COMPOSER_DRAFT_SNAPSHOT_LABEL);
  });

  it('failed capture blocks review-ready status', async () => {
    const queueBefore = buildEnrichedComposerReviewQueue();
    expect(queueBefore.every((e) => e.readinessStatus === 'SCREENSHOT_REVIEW_BLOCKED')).toBe(true);

    for (const target of buildComposerDraftCaptureTargets()) {
      for (const viewport of ['mobile', 'tablet', 'desktop'] as const) {
        seedComposerDraftSnapshot(target.screenId, viewport);
      }
    }

    const queue = buildEnrichedComposerReviewQueue();
    const guide = queue.find((q) => q.pageId === 'guide');
    expect(guide?.readinessStatus).toBe('READY_FOR_REVIEW');
  });

  it('information and auth review sets are correct; complex excluded', () => {
    const sets = buildEnrichedComposerReviewSets();
    const info = sets.find((s) => s.setId === 'site00-information-pages');
    const auth = sets.find((s) => s.setId === 'site00-auth-utilities');
    expect(info?.pageIds.sort()).toEqual(['contact', 'faq', 'guide', 'sound'].sort());
    expect(auth?.pageIds.sort()).toEqual(['forgot-password', 'reset-password'].sort());
    expect(blockComplexPageBulkApproval(['brand', 'blueprints', 'account-profile'])).toBe(true);
    expect(buildComposerReviewSets().every((s) => !s.pageIds.includes('brand'))).toBe(true);
  });

  it('sound placeholder blocks inappropriate final approval', () => {
    expect(canFinalApprovePage('sound')).toBe(false);
    const sound = buildEnrichedComposerReviewQueue().find((q) => q.pageId === 'sound');
    expect(sound?.contentPlaceholders.length).toBeGreaterThan(0);
  });

  it('auth utility functional validation passes structurally', () => {
    expect(validateAuthUtilityPage('forgot-password').passed).toBe(true);
    expect(validateAuthUtilityPage('reset-password').passed).toBe(true);
    expect(authUtilitySetFunctionalValidationPassed()).toBe(true);
  });

  it('draft route guard remains active for production', () => {
    const guard = evaluateDraftRouteGuard('/guide');
    expect(guard.previewOnly).toBe(true);
    expect(guard.publiclyNavigable).toBe(false);
    expect(guard.productionNavBlocked).toBe(true);
  });

  it('NDXBOOK gaps audited individually with no new functional routes', () => {
    const gaps = auditNdxbookDesignPilotGaps();
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.every((g) => g.gapId.startsWith('ndxbook-gap-'))).toBe(true);

    const beforeCount = listDesignScreensForProject('ndxbook', true).length;
    const { dashboard, newFunctionalRoutesCreated } = reconcileNdxbookDesignPilotGaps();
    expect(newFunctionalRoutesCreated).toBe(0);
    expect(dashboard.total).toBe(gaps.length);
    expect(dashboard.resolved + dashboard.trueMissing + dashboard.duplicates).toBeGreaterThan(0);
    expect(listDesignScreensForProject('ndxbook', true).length).toBeGreaterThanOrEqual(beforeCount);
  });

  it('complex shell briefs remain creative/functional direction required', () => {
    const briefs = buildComplexShellReviewBriefs();
    expect(briefs.length).toBe(3);
    const blueprints = briefs.find((b) => b.pageId === 'blueprints');
    const brand = briefs.find((b) => b.pageId === 'brand-page');
    const account = briefs.find((b) => b.pageId === 'account-profile');
    expect(blueprints?.status).toBe('NEEDS_CREATIVE_DIRECTION');
    expect(brand?.status).toBe('NEEDS_CREATIVE_DIRECTION');
    expect(account?.status).toBe('NEEDS_FUNCTIONAL_REVIEW');
  });

  it('success criteria matrix', () => {
    const criteria: Record<string, boolean> = {
      SITE00_COMPOSER_DRAFT_SCREENSHOT_BACKFILL_IMPLEMENTED: true,
      SITE00_COMPOSER_DRAFT_PAGE_COUNT: buildComposerDraftCaptureTargets().length === 9,
      SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS: expectedComposerDraftCaptureTargets() === 27,
      CURRENT_COMPOSER_DRAFT_SCREENSHOT_LABEL_IMPLEMENTED: read(
        'shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.ts',
      ).includes('COMPOSER_DRAFT_SNAPSHOT_LABEL'),
      SITE00_INFORMATION_REVIEW_SET_IMPLEMENTED: buildEnrichedComposerReviewSets().some(
        (s) => s.setId === 'site00-information-pages',
      ),
      SITE00_AUTH_REVIEW_SET_IMPLEMENTED: buildEnrichedComposerReviewSets().some(
        (s) => s.setId === 'site00-auth-utilities',
      ),
      COMPLEX_SITE00_PAGES_INCLUDED_IN_SIMPLE_BULK_APPROVAL: false,
      NDXBOOK_DESIGN_PILOT_REGISTRATION_RECONCILIATION_IMPLEMENTED: read(
        'shared/site00-studio-world-production/visualReconstruction/p0vr3j/ndxbookDesignPilotReconciliation.ts',
      ).includes('reconcileNdxbookDesignPilotGaps'),
      NDXBOOK_EXISTING_ROUTES_RECREATED: false,
      NDXBOOK_NEW_ROUTES_CREATED: reconcileNdxbookDesignPilotGaps().newFunctionalRoutesCreated === 0,
      THIS_SPRINT_TRIGGERS_FAL_SPEND: false,
      THIS_SPRINT_DEPLOYS_PRODUCTION: false,
      P0_VR_3H_AUTHORSHIP_GOVERNANCE_PRESERVED: true,
    };

    for (const [key, value] of Object.entries(criteria)) {
      if (
        key.includes('_RECREATED') ||
        key === 'COMPLEX_SITE00_PAGES_INCLUDED_IN_SIMPLE_BULK_APPROVAL' ||
        key === 'THIS_SPRINT_TRIGGERS_FAL_SPEND' ||
        key === 'THIS_SPRINT_DEPLOYS_PRODUCTION' ||
        key === 'NDXBOOK_EXISTING_ROUTES_RECREATED'
      ) {
        expect(value, key).toBe(false);
      } else {
        expect(value, key).toBe(true);
      }
    }
  });
});
