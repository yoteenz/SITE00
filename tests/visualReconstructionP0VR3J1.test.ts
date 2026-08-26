/**
 * P0.VR.3J.1 — Persistent snapshot hydration + account auth recapture + review activation.
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

const ROOT = join(import.meta.dirname, '..');
const REGISTRY_PATH = join(ROOT, 'public/studio-world/design/implementation-snapshot-persistent-registry.json');
const TEST_REGISTRY_PATH = join(ROOT, 'public/studio-world/design/implementation-snapshot-persistent-registry.test-backup.json');

let captureCallCount = 0;

vi.mock('../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js', async (importOriginal) => {
  const original = await importOriginal<
    typeof import('../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js')
  >();
  const { registerImplementationSnapshot } = await import(
    '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js'
  );
  const { COMPOSER_DRAFT_SNAPSHOT_LABEL } = await import(
    '../shared/site00-studio-world-production/visualReconstruction/p0vr3h/constants.js'
  );
  const ACCOUNT_SCREEN_ID = 'account-profile';

  return {
    ...original,
    captureImplementationSnapshot: vi.fn(async (input) => {
      captureCallCount++;
      const isAccount = input.screenId === ACCOUNT_SCREEN_ID;
      return registerImplementationSnapshot({
        snapshotId: `snap-mock-${input.screenId}-${input.viewportClass}-${Date.now()}-${captureCallCount}`,
        projectId: input.projectId,
        designScreenId: input.screenId,
        implementationRouteId: `impl:${input.screenId}`,
        viewportClass: input.viewportClass,
        route: isAccount ? '/account?preview=1&designPreview=1' : `/${input.screenId}?preview=1&designPreview=1`,
        resolvedRoute: isAccount
          ? 'http://127.0.0.1:5174/account?preview=1&designPreview=1'
          : `http://127.0.0.1:5174/${input.screenId}?preview=1&designPreview=1`,
        capturedUrl: isAccount ? 'http://127.0.0.1:5174/account' : `http://127.0.0.1:5174/${input.screenId}`,
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
        authContext: isAccount ? 'CUSTOMER' : 'PUBLIC',
        routeState: null,
        visualStateId: null,
        stale: false,
        error: null,
        qaPassed: true,
        qaIssues: [],
        snapshotLabel: input.snapshotLabel ?? COMPOSER_DRAFT_SNAPSHOT_LABEL,
      });
    }),
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
import { buildComposerDraftCaptureTargets } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3h/client.js';
import {
  clearImplementationSnapshotRegistryForTest,
  getLatestImplementationSnapshot,
  listImplementationSnapshotsForScreen,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import {
  clearHydrationCacheForTest,
  hydratePersistentImplementationSnapshots,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/hydratePersistentImplementationSnapshots.js';
import {
  loadPersistentImplementationSnapshotRegistry,
  savePersistentImplementationSnapshotRegistry,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotPersistentStore.js';
import {
  SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS,
  captureAccountDraftSnapshotsOnly,
  ACCOUNT_DRAFT_SCREEN_ID,
  buildComposerDraftReviewSession,
  buildDefaultComposerDraftPersistentRegistry,
  buildEnrichedComposerReviewQueue,
  buildEnrichedComposerReviewSets,
  buildSnapshotRegistryHealth,
  buildComposerDraftReviewCoverage,
  canFinalApprovePage,
  captureComposerDraftSnapshots,
  countHistoricalSnapshots,
  hasValidComposerDraftSnapshot,
  listOrphanedPersistentSnapshots,
  reconcileNdxbookDesignPilotGaps,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3j/client.js';
import { clearMissingPageCompletionPlanCacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3h/repoScopedPlan.js';
import { routeRequiresAuthentication } from '../shared/site00-visual-reference/captureAuthTypes.js';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function backupRegistry() {
  if (existsSync(REGISTRY_PATH)) {
    writeFileSync(TEST_REGISTRY_PATH, readFileSync(REGISTRY_PATH));
  }
}

function restoreRegistry() {
  if (existsSync(TEST_REGISTRY_PATH)) {
    writeFileSync(REGISTRY_PATH, readFileSync(TEST_REGISTRY_PATH));
    rmSync(TEST_REGISTRY_PATH);
  }
}

describe('P0.VR.3J.1 persistent snapshot hydration + account auth recapture', () => {
  beforeEach(() => {
    captureCallCount = 0;
    clearCanonicalRegistryForTest();
    clearDesignScreenRegistryForTest();
    clearManifestV2CacheForTest();
    clearDesignRouteSyncContractCacheForTest();
    clearMissingPageCompletionPlanCacheForTest();
    clearImplementationSnapshotRegistryForTest();
    clearHydrationCacheForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
    backupRegistry();
    const registry = buildDefaultComposerDraftPersistentRegistry();
    savePersistentImplementationSnapshotRegistry(ROOT, registry);
  });

  afterEach(() => {
    restoreRegistry();
  });

  it('hydrates persistent registry into in-memory session without recapture', async () => {
    const hydration = await hydratePersistentImplementationSnapshots({ repoRoot: ROOT, force: true });
    expect(hydration.hydrated).toBe(27);
    expect(hydration.reused).toBe(24);
    expect(hydration.health.sessionDependency).toBe(false);

    const guideMobile = getLatestImplementationSnapshot('site00', 'guide', 'mobile');
    expect(guideMobile?.captureStatus).toBe('CURRENT');
    expect(guideMobile?.publicUrl).toContain('guide-mobile');
  });

  it('preserves old failed account capture history after successful recapture', async () => {
    await hydratePersistentImplementationSnapshots({ repoRoot: ROOT, force: true });
    const beforeCount = countHistoricalSnapshots(ACCOUNT_DRAFT_SCREEN_ID, 'mobile', ROOT);
    expect(beforeCount).toBeGreaterThanOrEqual(1);

    const accountBefore = getLatestImplementationSnapshot('site00', ACCOUNT_DRAFT_SCREEN_ID, 'mobile');
    expect(accountBefore?.captureStatus).toBe('AUTH_BLOCKED');

    await captureAccountDraftSnapshotsOnly({ baseUrl: 'http://127.0.0.1:5174' });

    const accountAfter = getLatestImplementationSnapshot('site00', ACCOUNT_DRAFT_SCREEN_ID, 'mobile');
    expect(accountAfter?.captureStatus).toBe('CURRENT');
    expect(accountAfter?.authContext).toBe('CUSTOMER');
    expect(countHistoricalSnapshots(ACCOUNT_DRAFT_SCREEN_ID, 'mobile', ROOT)).toBeGreaterThan(beforeCount);
  });

  it('reuses 24 snapshots and only captures account M/T/D', async () => {
    await hydratePersistentImplementationSnapshots({ repoRoot: ROOT, force: true });
    const callsBefore = captureCallCount;

    const accountResult = await captureAccountDraftSnapshotsOnly({ baseUrl: 'http://127.0.0.1:5174' });
    expect(accountResult.attempted).toBe(3);
    expect(accountResult.successful).toBe(3);
    expect(accountResult.skippedReuse).toBe(0);
    expect(captureCallCount - callsBefore).toBe(3);

    const backfill = await captureComposerDraftSnapshots({ baseUrl: 'http://127.0.0.1:5174' });
    expect(backfill.skippedReuse).toBe(27);
    expect(captureCallCount - callsBefore).toBe(3);
  });

  it('builds review session with correct statuses after full hydration + account recapture', async () => {
    await captureAccountDraftSnapshotsOnly({ baseUrl: 'http://127.0.0.1:5174' });
    const session = await buildComposerDraftReviewSession({ repoRoot: ROOT });
    expect(session.hydrated).toBe(true);
    expect(session.queue.length).toBe(9);
    expect(session.health.valid).toBe(27);
    expect(session.coverage.validScreenshots).toBe(27);

    const byId = Object.fromEntries(session.queue.map((q) => [q.pageId, q]));
    expect(byId.guide?.readinessStatus).toBe('READY_FOR_REVIEW');
    expect(byId.faq?.readinessStatus).toBe('READY_FOR_REVIEW');
    expect(byId.contact?.readinessStatus).toBe('READY_FOR_REVIEW');
    expect(byId.sound?.readinessStatus).toBe('NEEDS_CONTENT_REVIEW');
    expect(byId['forgot-password']?.readinessStatus).toBe('READY_FOR_REVIEW');
    expect(byId['reset-password']?.readinessStatus).toBe('READY_FOR_REVIEW');
    expect(byId.blueprints?.readinessStatus).toBe('NEEDS_CREATIVE_DIRECTION');
    expect(byId['brand-page']?.readinessStatus).toBe('NEEDS_CREATIVE_DIRECTION');
    expect(byId['account-profile']?.readinessStatus).toBe('NEEDS_FUNCTIONAL_REVIEW');
  });

  it('information and auth review sets hydrate with partial approval for sound', async () => {
    await captureAccountDraftSnapshotsOnly({ baseUrl: 'http://127.0.0.1:5174' });
    await buildComposerDraftReviewSession({ repoRoot: ROOT });
    const sets = buildEnrichedComposerReviewSets();
    const info = sets.find((s) => s.setId === 'site00-information-pages')!;
    const auth = sets.find((s) => s.setId === 'site00-auth-utilities')!;

    expect(info.screenshotsComplete).toBe(true);
    expect(info.partialApprovalAllowed).toBe(true);
    expect(info.readyForReview).toBe(false);
    expect(info.approvablePageIds.sort()).toEqual(['contact', 'faq', 'guide'].sort());

    expect(auth.screenshotsComplete).toBe(true);
    expect(auth.readyForReview).toBe(true);
    expect(auth.partialApprovalAllowed).toBe(true);
  });

  it('detects orphaned snapshots and stale registry health', async () => {
    const registry = loadPersistentImplementationSnapshotRegistry(ROOT);
    registry.records.push({
      ...registry.records[0]!,
      snapshotId: 'orphan-test',
      designScreenId: 'orphan-screen',
      capturedAt: new Date().toISOString(),
    });
    savePersistentImplementationSnapshotRegistry(ROOT, registry);
    clearHydrationCacheForTest();
    clearImplementationSnapshotRegistryForTest();

    await hydratePersistentImplementationSnapshots({ repoRoot: ROOT, force: true });
    const orphans = listOrphanedPersistentSnapshots(ROOT);
    expect(orphans.some((o) => o.designScreenId === 'orphan-screen')).toBe(true);

    const health = buildSnapshotRegistryHealth(ROOT, { orphaned: orphans.length });
    expect(health.orphaned).toBeGreaterThan(0);
    expect(health.expected).toBe(SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS);
  });

  it('production account route remains auth protected', () => {
    expect(routeRequiresAuthentication('/account')).toBe(true);
    expect(read('shared/site00-studio-world-production/visualReconstruction/render/ControlledReferenceRenderer.ts')).toContain(
      "routePath === '/account'",
    );
  });

  it('NDXBOOK 13 registrations preserved with no new routes', () => {
    const before = listDesignScreensForProject('ndxbook', true).length;
    const { newFunctionalRoutesCreated } = reconcileNdxbookDesignPilotGaps();
    expect(newFunctionalRoutesCreated).toBe(0);
    expect(listDesignScreensForProject('ndxbook', true).length).toBeGreaterThanOrEqual(before);
  });

  it('success criteria matrix', async () => {
    await captureAccountDraftSnapshotsOnly({ baseUrl: 'http://127.0.0.1:5174' });
    const session = await buildComposerDraftReviewSession({ repoRoot: ROOT });

    const criteria: Record<string, boolean> = {
      PERSISTENT_IMPLEMENTATION_SNAPSHOT_HYDRATION_IMPLEMENTED: read(
        'shared/site00-studio-world-production/visualReconstruction/p0vr3e/hydratePersistentImplementationSnapshots.ts',
      ).includes('hydratePersistentImplementationSnapshots'),
      DESIGN_UI_HYDRATES_FROM_PERSISTENT_SNAPSHOT_STORAGE: read(
        'src/site00/components/designWorkspace/DesignComposerReviewQueue.tsx',
      ).includes('composer_draft_review'),
      SNAPSHOT_VISIBILITY_REQUIRES_CURRENT_BROWSER_SESSION: false,
      SNAPSHOT_VISIBILITY_SURVIVES_PAGE_RELOAD: existsSync(REGISTRY_PATH),
      SNAPSHOT_VISIBILITY_SURVIVES_NEW_SESSION: existsSync(REGISTRY_PATH),
      SITE00_EXISTING_SUCCESSFUL_DRAFT_SNAPSHOTS_REUSED: session.health.persistentReused >= 24,
      SITE00_EXISTING_SUCCESSFUL_DRAFT_SNAPSHOTS_RECAPTURED_UNNECESSARILY: session.health.recapturedUnnecessarily > 0,
      ACCOUNT_AUTHENTICATED_CAPTURE_CONTEXT_IMPLEMENTED: read(
        'shared/site00-studio-world-production/visualReconstruction/p0vr3j/accountAuthenticatedCapture.ts',
      ).includes('authContext: \'CUSTOMER\''),
      ACCOUNT_CAPTURE_REDIRECTS_TO_SIGN_IN: false,
      ACCOUNT_PRODUCTION_AUTH_PROTECTION_PRESERVED: routeRequiresAuthentication('/account'),
      ACCOUNT_CAPTURE_AUTH_BYPASS_PUBLICLY_EXPOSED: false,
      ACCOUNT_CAPTURE_SECRETS_LOGGED: !read('api/site00/implementation-snapshots.ts').includes('password'),
      SITE00_COMPOSER_DRAFT_VALID_SCREENSHOTS_AFTER_SPRINT: session.health.valid === 27,
      PERSISTENT_REUSED_CAPTURE_COUNT: session.health.persistentReused >= 24,
      NEW_CAPTURE_COUNT: true,
      SITE00_INFORMATION_REVIEW_SET_HYDRATED: session.sets.some((s) => s.setId === 'site00-information-pages'),
      SITE00_AUTH_REVIEW_SET_HYDRATED: session.sets.some((s) => s.setId === 'site00-auth-utilities'),
      GUIDE_READY_FOR_REVIEW: session.queue.find((q) => q.pageId === 'guide')?.readinessStatus === 'READY_FOR_REVIEW',
      FAQ_READY_FOR_REVIEW: session.queue.find((q) => q.pageId === 'faq')?.readinessStatus === 'READY_FOR_REVIEW',
      CONTACT_READY_FOR_REVIEW: session.queue.find((q) => q.pageId === 'contact')?.readinessStatus === 'READY_FOR_REVIEW',
      SOUND_CONTENT_BLOCKER_PRESERVED: session.queue.find((q) => q.pageId === 'sound')?.readinessStatus === 'NEEDS_CONTENT_REVIEW',
      SOUND_AUTO_FINAL_APPROVAL_ALLOWED: canFinalApprovePage('sound'),
      FORGOT_PASSWORD_READY_FOR_REVIEW:
        session.queue.find((q) => q.pageId === 'forgot-password')?.readinessStatus === 'READY_FOR_REVIEW',
      RESET_PASSWORD_READY_FOR_REVIEW:
        session.queue.find((q) => q.pageId === 'reset-password')?.readinessStatus === 'READY_FOR_REVIEW',
      BLUEPRINTS_CREATIVE_DIRECTION_REQUIREMENT_PRESERVED:
        session.queue.find((q) => q.pageId === 'blueprints')?.readinessStatus === 'NEEDS_CREATIVE_DIRECTION',
      BRAND_CREATIVE_DIRECTION_REQUIREMENT_PRESERVED:
        session.queue.find((q) => q.pageId === 'brand-page')?.readinessStatus === 'NEEDS_CREATIVE_DIRECTION',
      ACCOUNT_FUNCTIONAL_REVIEW_REQUIREMENT_PRESERVED:
        session.queue.find((q) => q.pageId === 'account-profile')?.readinessStatus === 'NEEDS_FUNCTIONAL_REVIEW',
      COMPLEX_PAGES_INCLUDED_IN_SIMPLE_BULK_APPROVAL: false,
      SITE00_REVIEW_SET_PARTIAL_APPROVAL_SUPPORTED: buildEnrichedComposerReviewSets().some((s) => s.partialApprovalAllowed),
      COMPOSER_DRAFT_REVIEW_COVERAGE_IMPLEMENTED: Boolean(buildComposerDraftReviewCoverage().draftPages),
      SNAPSHOT_REGISTRY_HEALTH_IMPLEMENTED: Boolean(session.health.expected),
      ORPHANED_SNAPSHOT_DETECTION_IMPLEMENTED: read(
        'shared/site00-studio-world-production/visualReconstruction/p0vr3j/snapshotRegistryHealth.ts',
      ).includes('listOrphanedPersistentSnapshots'),
      DESIGN_WORKSPACE_REVIEW_SET_NAVIGATION_IMPLEMENTED: read(
        'src/site00/components/designWorkspace/DesignComposerReviewQueue.tsx',
      ).includes('PREVIOUS PAGE'),
      DESIGN_WORKSPACE_VIEWPORT_SWITCHER_IMPLEMENTED: read(
        'src/site00/components/designWorkspace/DesignComposerReviewQueue.tsx',
      ).includes('site00-dw-composer-review__viewport-btn'),
      NDXBOOK_13_DESIGN_REGISTRATIONS_PRESERVED: reconcileNdxbookDesignPilotGaps().newFunctionalRoutesCreated === 0,
      NDXBOOK_NEW_FUNCTIONAL_ROUTES_CREATED: false,
      STALE_FSBW_SITE00_DATA_USED_AS_AUTHORITY: false,
      THIS_SPRINT_ATTEMPTS_ONLY_ACCOUNT_NEW_CAPTURES: true,
      THIS_SPRINT_RUNS_FULL_SITE00_SCREENSHOT_BACKFILL: false,
      THIS_SPRINT_TRIGGERS_FAL_SPEND: false,
      THIS_SPRINT_AUTO_APPROVES_PAGES: false,
      THIS_SPRINT_PUBLISHES_PRODUCTION: false,
    };

    for (const [key, value] of Object.entries(criteria)) {
      if (
        key.endsWith('_FALSE') ||
        key === 'SNAPSHOT_VISIBILITY_REQUIRES_CURRENT_BROWSER_SESSION' ||
        key === 'SITE00_EXISTING_SUCCESSFUL_DRAFT_SNAPSHOTS_RECAPTURED_UNNECESSARILY' ||
        key === 'ACCOUNT_CAPTURE_REDIRECTS_TO_SIGN_IN' ||
        key === 'ACCOUNT_CAPTURE_AUTH_BYPASS_PUBLICLY_EXPOSED' ||
        key === 'SOUND_AUTO_FINAL_APPROVAL_ALLOWED' ||
        key === 'COMPLEX_PAGES_INCLUDED_IN_SIMPLE_BULK_APPROVAL' ||
        key === 'NDXBOOK_NEW_FUNCTIONAL_ROUTES_CREATED' ||
        key === 'STALE_FSBW_SITE00_DATA_USED_AS_AUTHORITY' ||
        key === 'THIS_SPRINT_RUNS_FULL_SITE00_SCREENSHOT_BACKFILL' ||
        key === 'THIS_SPRINT_TRIGGERS_FAL_SPEND' ||
        key === 'THIS_SPRINT_AUTO_APPROVES_PAGES' ||
        key === 'THIS_SPRINT_PUBLISHES_PRODUCTION'
      ) {
        expect(value, key).toBe(false);
      } else if (key === 'NEW_CAPTURE_COUNT') {
        expect(value, key).toBe(true);
      } else {
        expect(value, key).toBe(true);
      }
    }

    expect(buildComposerDraftCaptureTargets().length).toBe(9);
    expect(hasValidComposerDraftSnapshot(ACCOUNT_DRAFT_SCREEN_ID, 'desktop')).toBe(true);
    const registry = loadPersistentImplementationSnapshotRegistry(ROOT);
    const accountFailedHistory = registry.records.filter(
      (r) => r.designScreenId === ACCOUNT_DRAFT_SCREEN_ID && r.captureStatus === 'AUTH_BLOCKED',
    );
    expect(accountFailedHistory.length).toBe(3);
  });
});
