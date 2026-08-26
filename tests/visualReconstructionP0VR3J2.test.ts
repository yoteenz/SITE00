/**
 * P0.VR.3J.2-SITE00 — Account capture execution + Voice Lab family derivation execution.
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

const ROOT = join(import.meta.dirname, '..');
const REGISTRY_PATH = join(ROOT, 'public/studio-world/design/implementation-snapshot-persistent-registry.json');
const REGISTRY_BACKUP = join(ROOT, 'public/studio-world/design/implementation-snapshot-persistent-registry.test-backup.json');

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
  const { FAMILY_SOURCE_SNAPSHOT_LABEL, COMPOSER_DERIVED_DRAFT_LABEL } = await import(
    '../shared/site00-studio-world-production/visualReconstruction/p0vr3l/constants.js'
  );

  return {
    ...original,
    captureImplementationSnapshot: vi.fn(async (input) => {
      const isAccount = input.screenId === 'account-profile';
      const isVoiceTarget = input.screenId === 'character-lab-voice-lab';
      const label = isVoiceTarget
        ? COMPOSER_DERIVED_DRAFT_LABEL
        : input.route?.includes('language-lab')
          ? FAMILY_SOURCE_SNAPSHOT_LABEL
          : input.snapshotLabel ?? COMPOSER_DRAFT_SNAPSHOT_LABEL;

      return registerImplementationSnapshot({
        snapshotId: `snap-mock-${input.screenId}-${input.viewportClass}-${Date.now()}`,
        projectId: input.projectId,
        designScreenId: input.screenId,
        implementationRouteId: `impl:${input.screenId}`,
        viewportClass: input.viewportClass,
        route: input.route ?? `/${input.screenId}`,
        resolvedRoute: `http://127.0.0.1:5174${input.route ?? `/${input.screenId}`}`,
        capturedUrl: `http://127.0.0.1:5174/${input.screenId}`,
        width: input.viewportClass === 'desktop' ? 1440 : 390,
        height: input.viewportClass === 'desktop' ? 900 : 844,
        deviceScaleFactor: 2,
        storagePath: `studio-world/design/implementation-snapshots/${input.projectId}/${input.screenId}/${input.viewportClass}/mock.webp`,
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
        snapshotLabel: label,
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
import { clearManifestV2CacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3b/manifestV2Compiler.js';
import { clearDesignRouteSyncContractCacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3d/designRouteSyncContract.js';
import {
  registerSite00DesignPilot,
  resetSite00PilotForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00PilotRegistration.js';
import {
  clearImplementationSnapshotRegistryForTest,
  getLatestImplementationSnapshot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import { clearHydrationCacheForTest, hydratePersistentImplementationSnapshots } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/hydratePersistentImplementationSnapshots.js';
import {
  loadPersistentImplementationSnapshotRegistry,
  savePersistentImplementationSnapshotRegistry,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotPersistentStore.js';
import {
  captureAccountDraftSnapshotsOnly,
  ACCOUNT_DRAFT_SCREEN_ID,
  buildDefaultComposerDraftPersistentRegistry,
  captureComposerDraftSnapshots,
  buildComposerDraftReviewSession,
  reconcileNdxbookDesignPilotGaps,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3j/client.js';
import {
  clearFamilyDerivationForTest,
  deriveMissingTargetFromFamily,
  getFamilyDerivedRecord,
  DEFAULT_PROPAGATION_SCOPE,
  tabStateRemainsSubordinate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3l/client.js';
import { routeRequiresAuthentication } from '../shared/site00-visual-reference/captureAuthTypes.js';
import {
  executePreparedCaptures,
  buildVoiceLabSourceDerivedReview,
  VOICE_LAB_TARGET_ID,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3j2/client.js';
import { clearMissingPageCompletionPlanCacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3h/repoScopedPlan.js';
import { captureImplementationSnapshot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.3J.2 account capture execution + Voice Lab derivation', () => {
  beforeEach(() => {
    vi.mocked(captureImplementationSnapshot).mockClear();
    clearCanonicalRegistryForTest();
    clearDesignScreenRegistryForTest();
    clearManifestV2CacheForTest();
    clearDesignRouteSyncContractCacheForTest();
    clearMissingPageCompletionPlanCacheForTest();
    clearImplementationSnapshotRegistryForTest();
    clearHydrationCacheForTest();
    clearFamilyDerivationForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
    if (existsSync(REGISTRY_PATH)) writeFileSync(REGISTRY_BACKUP, readFileSync(REGISTRY_PATH));
    savePersistentImplementationSnapshotRegistry(ROOT, buildDefaultComposerDraftPersistentRegistry());
  });

  afterEach(() => {
    if (existsSync(REGISTRY_BACKUP)) {
      writeFileSync(REGISTRY_PATH, readFileSync(REGISTRY_BACKUP));
      rmSync(REGISTRY_BACKUP);
    }
  });

  it('executes Account capture 3/3 without recapturing other composer drafts', async () => {
    await hydratePersistentImplementationSnapshots({ repoRoot: ROOT, force: true });
    const account = await captureAccountDraftSnapshotsOnly({ baseUrl: 'http://127.0.0.1:5174' });
    expect(account.attempted).toBe(3);
    expect(account.successful).toBe(3);

    const backfill = await captureComposerDraftSnapshots({ baseUrl: 'http://127.0.0.1:5174' });
    expect(backfill.skippedReuse).toBe(27);
  });

  it('normalizes SITE 00 coverage to 27/27', async () => {
    await captureAccountDraftSnapshotsOnly({ baseUrl: 'http://127.0.0.1:5174' });
    const session = await buildComposerDraftReviewSession({ repoRoot: ROOT });
    expect(session.health.valid).toBe(27);
    expect(session.queue.find((q) => q.pageId === 'account-profile')?.readinessStatus).toBe('NEEDS_FUNCTIONAL_REVIEW');
  });

  it('executes Voice Lab derivation and source vs derived review', async () => {
    const result = await deriveMissingTargetFromFamily(VOICE_LAB_TARGET_ID, { baseUrl: 'http://127.0.0.1:5174' });
    expect(result?.record.sourceSiblingId).toBe('character-lab-language-lab');
    const review = buildVoiceLabSourceDerivedReview();
    expect(review.readyForFounderReview).toBe(true);
    expect(review.reviewStatus).toBe('READY_FOR_REVIEW');
  });

  it('executePreparedCaptures orchestrates both workflows', async () => {
    const report = await executePreparedCaptures({ baseUrl: 'http://127.0.0.1:5174', repoRoot: ROOT });
    expect(report.site00Health.valid).toBe(27);
    expect(report.voiceLab.readyForFounderReview).toBe(true);
    expect(report.propagationApplied).toBe(false);
  });

  it('success criteria matrix', async () => {
    await executePreparedCaptures({ baseUrl: 'http://127.0.0.1:5174', repoRoot: ROOT });
    const session = await buildComposerDraftReviewSession({ repoRoot: ROOT });
    expect(session.health.valid).toBe(27);
    expect(routeRequiresAuthentication('/account')).toBe(true);
    expect(tabStateRemainsSubordinate('TAB_STATE')).toBe(true);
    expect(DEFAULT_PROPAGATION_SCOPE).toBe('TARGET_ONLY');
    expect(reconcileNdxbookDesignPilotGaps().newFunctionalRoutesCreated).toBe(0);
    expect(read('api/site00/implementation-snapshots.ts')).toContain('execute_p0vr3j2');
    expect(getLatestImplementationSnapshot('site00', ACCOUNT_DRAFT_SCREEN_ID, 'mobile')?.authContext).toBe('CUSTOMER');
    expect(getFamilyDerivedRecord(VOICE_LAB_TARGET_ID)?.authorType).toBe('COMPOSER');
  });
});
