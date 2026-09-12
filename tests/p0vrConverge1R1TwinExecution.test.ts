/**
 * P0.VR.CONVERGE.1R1 — Twin planned → build handoff + real executor.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { P0_VR_CONVERGE_1R1_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/constants.js';
import {
  approvePageCreativeDirection,
  openPageCreativeUpgradeSession,
  resetPageCreativeUpgradeSessionsForTest,
  getPageCreativeUpgradeSession,
  markPageCreativeUpgradeStatus,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCreativeUpgradeSession.js';
import { buildPageVisualDiagnosis } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageVisualDiagnosis.js';
import {
  clearReconstructionTwinSessionsRuntimeOnlyForTest,
  getActiveTwinSessionForPage,
  resetReconstructionTwinSessionsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/reconstructionTwinSession.js';
import { resetPageImplementationRegistryForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/pageImplementationRegistry.js';
import { resetPageReconstructionExecutionsForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageReconstructionExecution.js';
import {
  evaluateTwinPlanInputsStale,
  resolveUpgradeWorkflowState,
  startTwinBuild,
  twinBuildIdempotencyKey,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrConverge1/index.js';
import {
  readPersistedTwinSession,
  resetTwinSessionPersistenceForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/twinSessionPersistence.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('P0.VR.CONVERGE.1R1 twin execution handoff', () => {
  beforeEach(() => {
    resetPageCreativeUpgradeSessionsForTest();
    resetReconstructionTwinSessionsForTest();
    resetPageImplementationRegistryForTest();
    resetPageReconstructionExecutionsForTest();
    resetTwinSessionPersistenceForTest();
  });

  it('build constant v311', () => {
    expect(P0_VR_CONVERGE_1R1_BUILD).toBe('v311');
  });

  it('PLANNED is non-terminal and COMPLETE cannot coexist with PLANNED', () => {
    openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      captureId: 'cap-1',
      pagePurpose: 'NDXBOOK OVERVIEW',
      parentAuthorityLabel: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook/overview',
      isRoot: true,
      designAuthorityVersionId: 'auth-1',
      designAuthorityAssetRef: 'https://cdn.example.com/authority.png',
      captureAssetRef: 'https://cdn.example.com/live.png',
    });
    approvePageCreativeDirection('ndxbook', 'ndxbook:/projects/ndxbook/overview', 'mobile');
    const session = getPageCreativeUpgradeSession('ndxbook', 'ndxbook:/projects/ndxbook/overview', 'mobile')!;
    markPageCreativeUpgradeStatus('ndxbook', 'ndxbook:/projects/ndxbook/overview', 'mobile', 'COMPLETE');
    const twin = getActiveTwinSessionForPage('ndxbook', 'ndxbook:/projects/ndxbook/overview')!;
    expect(twin.status).toBe('PLANNED');
    const workflow = resolveUpgradeWorkflowState({ session: { ...session, status: 'COMPLETE' }, twinSession: twin });
    expect(workflow.state).toBe('READY_TO_BUILD_TWIN');
    expect(workflow.isTerminal).toBe(false);
    expect(workflow.conflictingComplete).toBe(true);
    expect(workflow.founderStatusLabel).toBe('READY TO BUILD TWIN');
    expect(workflow.primaryTask).toBe('BUILD_TWIN');
  });

  it('startTwinBuild runs pipeline PLANNED → READY_FOR_REVIEW with job + receipt', async () => {
    const dx = buildPageVisualDiagnosis({ isRootPage: true, viewport: 'mobile', pagePurpose: 'NDXBOOK OVERVIEW' });
    openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      captureId: 'cap-1',
      pagePurpose: 'NDXBOOK OVERVIEW',
      parentAuthorityLabel: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook/overview',
      isRoot: true,
      designAuthorityVersionId: 'auth-1',
      designAuthorityAssetRef: 'https://cdn.example.com/authority.png',
      captureAssetRef: 'https://cdn.example.com/live.png',
      domMeasurements: [],
    });
    approvePageCreativeDirection('ndxbook', 'ndxbook:/projects/ndxbook/overview', 'mobile');
    const twin = getActiveTwinSessionForPage('ndxbook', 'ndxbook:/projects/ndxbook/overview')!;
    expect(twin.status).toBe('PLANNED');

    const first = await startTwinBuild(twin.sessionId);
    expect(first.error).toBeUndefined();
    expect(first.job?.jobId).toBeTruthy();
    expect(first.session?.status).toBe('READY_FOR_REVIEW');
    expect(first.receipt?.status).toBe('COMPLETE');
    expect(first.receipt?.twinRoute).toContain('reconstruction');
    expect(first.receipt?.regionChangesApplied.length).toBeGreaterThan(0);
    expect(first.receipt?.liveVersionUnchanged).toBe(true);

    const retry = await startTwinBuild(twin.sessionId);
    expect(retry.error?.code).toBe('UNKNOWN_TWIN_BUILD_FAILURE');
    expect(first.job?.idempotencyKey).toBe(
      twinBuildIdempotencyKey({
        sessionId: twin.sessionId,
        authorityVersionId: twin.authorityVersionId,
        captureId: twin.beforeCaptureId,
        reconstructionPlanId: twin.reconstructionPlanId,
      }),
    );
  });

  it('idempotency key stable and stale input guard', () => {
    const key = twinBuildIdempotencyKey({
      sessionId: 'twin_a',
      authorityVersionId: 'auth-1',
      captureId: 'cap-1',
      reconstructionPlanId: 'plan-1',
    });
    expect(key).toBe('twin_a|auth-1|cap-1|plan-1');

    const twin = {
      sessionId: 'twin_a',
      authorityVersionId: 'auth-1',
      beforeCaptureId: 'cap-1',
      reconstructionPlanId: 'plan-1',
    } as ReconstructionTwinSession;
    expect(
      evaluateTwinPlanInputsStale({
        twin,
        authorityVersionId: 'auth-2',
        captureId: 'cap-1',
        reconstructionPlanId: 'plan-1',
      }),
    ).toBe(true);
  });

  it('persists twin session for resume', () => {
    openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      viewport: 'mobile',
      captureId: 'cap-1',
      pagePurpose: 'NDXBOOK OVERVIEW',
      parentAuthorityLabel: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook/overview',
      isRoot: true,
      designAuthorityVersionId: 'auth-1',
      designAuthorityAssetRef: 'https://cdn.example.com/a.png',
      captureAssetRef: 'https://cdn.example.com/l.png',
    });
    approvePageCreativeDirection('ndxbook', 'ndxbook:/projects/ndxbook/overview', 'mobile');
    const twin = getActiveTwinSessionForPage('ndxbook', 'ndxbook:/projects/ndxbook/overview')!;
    expect(readPersistedTwinSession(twin.sessionId)?.status).toBe('PLANNED');
    clearReconstructionTwinSessionsRuntimeOnlyForTest();
    const resumed = getActiveTwinSessionForPage('ndxbook', 'ndxbook:/projects/ndxbook/overview');
    expect(resumed?.sessionId).toBe(twin.sessionId);
    expect(resumed?.status).toBe('PLANNED');
  });

  it('UI panel exposes BUILD TWIN NOW when twin PLANNED', () => {
    const src = readFileSync(
      join(import.meta.dirname, '..', 'src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx'),
      'utf8',
    );
    expect(src).toContain("twinSession?.status === 'PLANNED'");
    expect(src).toContain('BUILD TWIN NOW');
    expect(src).toContain('resolveUpgradeWorkflowState');
    expect(src).toContain('site00-pfw-upgrade-v2__mobile-active-task');
  });
});
