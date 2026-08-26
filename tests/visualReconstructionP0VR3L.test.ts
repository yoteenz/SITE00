/**
 * P0.VR.3L — Missing-target family derivation + shell propagation governance tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js', async (importOriginal) => {
  const original = await importOriginal<
    typeof import('../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js')
  >();
  const { registerImplementationSnapshot } = await import(
    '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js'
  );
  const { FAMILY_SOURCE_SNAPSHOT_LABEL, COMPOSER_DERIVED_DRAFT_LABEL } = await import(
    '../shared/site00-studio-world-production/visualReconstruction/p0vr3l/constants.js'
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
        route: input.route ?? `/${input.screenId}?preview=1`,
        resolvedRoute: `http://127.0.0.1:5174/${input.screenId}?preview=1`,
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
        authContext: 'PUBLIC',
        routeState: null,
        visualStateId: null,
        stale: false,
        error: null,
        qaPassed: true,
        qaIssues: [],
        snapshotLabel: input.snapshotLabel ?? FAMILY_SOURCE_SNAPSHOT_LABEL,
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
  clearImplementationSnapshotRegistryForTest,
  getLatestImplementationSnapshot,
  registerImplementationSnapshot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import { captureImplementationSnapshot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js';
import { clearMissingPageCompletionPlanCacheForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3h/repoScopedPlan.js';
import { reconcileNdxbookDesignPilotGaps } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3j/ndxbookDesignPilotReconciliation.js';
import {
  P0_VR_3L_LINEAGE,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
  COMPOSER_DERIVED_DRAFT_LABEL,
  DEFAULT_PROPAGATION_SCOPE,
  classifyMissingTargetType,
  tabStateRemainsSubordinate,
  instanceDoesNotCreatePage,
  discoverMissingDesignTargets,
  getMissingTarget,
  selectBestSibling,
  evaluateSiblingCaptureNeed,
  detectDuplicatedFamilyImplementation,
  sharedCodeExistsBeforeRebuild,
  captureSiblingIfNeeded,
  captureDerivedTargetDraft,
  deriveMissingTargetFromFamily,
  getFamilyDerivedRecord,
  listFamilyDerivationReceipts,
  clearFamilyDerivationForTest,
  normalizePropagationScope,
  analyzeShellPropagationImpact,
  commitShellPropagation,
  buildShellPropagationRecapturePlan,
  addShellPropagationException,
  listShellPropagationExceptions,
  rollbackShellPropagation,
  listShellPropagationReceipts,
  listFamilyShellChanges,
  crossProjectPropagationBlocked,
  hostShellContaminationBlocked,
  propagationRequiresFounderConfirmation,
  detectReferenceConflict,
  clearShellPropagationForTest,
  runFamilyFidelityQa,
  buildMissingTargetQueue,
  summarizeMissingTargetQueue,
  getCharacterLabVoiceLabEntry,
  listSharedShells,
  buildSharedShellDependencyGraph,
  getShellVersion,
  bumpShellVersion,
  getDesignFamilyVersion,
  clearSharedShellRegistryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3l/client.js';
import { EXPERIENCE_PAGE_TEMPLATES } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3g/constants.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function seedSnapshot(projectId: string, screenId: string, viewport: 'mobile' | 'tablet' | 'desktop') {
  registerImplementationSnapshot({
    snapshotId: `snap-seed-${screenId}-${viewport}`,
    projectId,
    designScreenId: screenId,
    implementationRouteId: `impl:${screenId}`,
    viewportClass: viewport,
    route: `/${screenId}?preview=1`,
    resolvedRoute: `http://127.0.0.1:5174/${screenId}?preview=1`,
    capturedUrl: `http://127.0.0.1:5174/${screenId}`,
    width: viewport === 'desktop' ? 1440 : 390,
    height: viewport === 'desktop' ? 900 : 844,
    deviceScaleFactor: 2,
    storagePath: `studio-world/design/implementation-snapshots/${projectId}/${screenId}/${viewport}/seed.webp`,
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
    snapshotLabel: FAMILY_SOURCE_SNAPSHOT_LABEL,
  });
}

describe('P0.VR.3L missing-target family derivation + shell propagation', () => {
  beforeEach(() => {
    clearCanonicalRegistryForTest();
    clearDesignScreenRegistryForTest();
    clearManifestV2CacheForTest();
    clearDesignRouteSyncContractCacheForTest();
    clearMissingPageCompletionPlanCacheForTest();
    clearImplementationSnapshotRegistryForTest();
    clearFamilyDerivationForTest();
    clearShellPropagationForTest();
    clearSharedShellRegistryForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
  });

  it('classifies target types and keeps tabs/material screens subordinate', () => {
    expect(
      classifyMissingTargetType({
        projectId: 'NDXBOOK',
        hasRoute: true,
        hasExperiencePage: true,
        hasMaterialScreen: true,
        hasTabRail: true,
        isInstance: false,
        isDataOnly: false,
      }),
    ).toBe('TAB_STATE');

    expect(tabStateRemainsSubordinate('TAB_STATE')).toBe(true);
    expect(tabStateRemainsSubordinate('MATERIAL_SCREEN')).toBe(true);
    expect(instanceDoesNotCreatePage('TAB_STATE')).toBe(true);
    expect(instanceDoesNotCreatePage('CONTENT_INSTANCE')).toBe(true);
    expect(instanceDoesNotCreatePage('FAMILY_DERIVED_PAGE')).toBe(false);
  });

  it('NDXBOOK Character Lab tabs remain under character-lab experience page', () => {
    const voice = getMissingTarget('ndxbook:character-lab:voice-lab-tab');
    expect(voice?.targetType).toBe('TAB_STATE');
    expect(voice?.experiencePageId).toBe('character-lab');
    expect(voice?.queueStatus).toBe('READY_FOR_DERIVATION');
    expect(voice?.route).toContain('/character/discovery');
  });

  it('selects best sibling and reuses shared code before pixel rebuild', () => {
    const voice = getMissingTarget('ndxbook:character-lab:voice-lab-tab')!;
    const sibling = selectBestSibling(voice);
    expect(sibling?.siblingId).toBe('character-lab-language-lab');
    expect(sharedCodeExistsBeforeRebuild(sibling!.componentPaths)).toBe(true);
    expect(sibling!.componentPaths[0]).toContain('MobileFounderWorkspaceScreens');
  });

  it('on-demand capture runs when snapshot missing; reuses when current', async () => {
    const voice = getMissingTarget('ndxbook:character-lab:voice-lab-tab')!;
    const sibling = selectBestSibling(voice)!;

    const missingDecision = evaluateSiblingCaptureNeed('NDXBOOK', sibling);
    expect(missingDecision.captureRequired).toBe(true);
    expect(missingDecision.reason).toBe('SNAPSHOT_MISSING');

    const captured = await captureSiblingIfNeeded({ projectId: 'NDXBOOK', sibling, baseUrl: 'http://127.0.0.1:5174' });
    expect(captured.captured).toBe(true);
    expect(captured.snapshots.length).toBe(3);
    expect(captured.snapshots[0]?.snapshotLabel).toBe(FAMILY_SOURCE_SNAPSHOT_LABEL);

    for (const vp of ['mobile', 'tablet', 'desktop'] as const) {
      seedSnapshot('ndxbook', sibling.screenId, vp);
    }

    const reuseDecision = evaluateSiblingCaptureNeed('NDXBOOK', sibling);
    expect(reuseDecision.captureRequired).toBe(false);
    expect(reuseDecision.reason).toBe('REUSE_EXISTING');

    const reused = await captureSiblingIfNeeded({ projectId: 'NDXBOOK', sibling });
    expect(reused.reused).toBe(true);
    expect(reused.captured).toBe(false);
  });

  it('derives Voice Lab from Character Lab sibling with Composer authorship and lineage', async () => {
    const result = await deriveMissingTargetFromFamily('ndxbook:character-lab:voice-lab-tab', { skipCapture: true });
    expect(result).not.toBeNull();
    expect(result!.newRouteCreated).toBe(false);
    expect(result!.registrationOnly).toBe(true);
    expect(result!.record.authorType).toBe('COMPOSER');
    expect(result!.record.createdBySprint).toBe(P0_VR_3L_LINEAGE);
    expect(result!.record.reviewStatus).toBe('UNREVIEWED');
    expect(result!.record.publishStatus).toBe('PREVIEW_ONLY');
    expect(result!.record.sharedShellId).toBe('ndx-character-lab-shell');
    expect(result!.receipt.sourceSnapshotLabel).toBe(FAMILY_SOURCE_SNAPSHOT_LABEL);
    expect(result!.receipt.targetSnapshotLabel).toBe(COMPOSER_DERIVED_DRAFT_LABEL);

    const qa = runFamilyFidelityQa(result!.record);
    expect(qa.passed).toBe(true);
    expect(qa.shellDrift).toBe(false);
  });

  it('captures derived target draft with COMPOSER DERIVED label', async () => {
    const snaps = await captureDerivedTargetDraft({
      projectId: 'NDXBOOK',
      screenId: 'character-lab-voice-lab',
      route: '/projects/ndxbook/character/discovery?preview=1&designState=voice-lab-active',
    });
    expect(snaps.length).toBe(3);
    expect(snaps.every((s) => s.snapshotLabel === COMPOSER_DERIVED_DRAFT_LABEL)).toBe(true);
  });

  it('does not rebuild existing unregistered NDXBOOK screens; reconciles instead', async () => {
    const gaps = discoverMissingDesignTargets('NDXBOOK').filter((t) => t.queueStatus === 'EXISTING_UNREGISTERED');
    expect(gaps.length).toBeGreaterThan(0);

    const gap = gaps[0]!;
    const beforeScreens = listDesignScreensForProject('ndxbook', true).length;
    const result = await deriveMissingTargetFromFamily(gap.targetId, { skipCapture: true });
    expect(result).toBeNull();
    reconcileNdxbookDesignPilotGaps();
    expect(listDesignScreensForProject('ndxbook', true).length).toBeGreaterThanOrEqual(beforeScreens);
  });

  it('hands off true missing routes to P0.VR.3H governance', async () => {
    const trueMissing = discoverMissingDesignTargets().filter((t) => t.queueStatus === 'TRUE_MISSING_ROUTE');
    if (trueMissing.length > 0) {
      const result = await deriveMissingTargetFromFamily(trueMissing[0]!.targetId, { skipCapture: true });
      expect(result).toBeNull();
    } else {
      expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr3l/familyDerivation.ts')).toContain(
        "target.queueStatus === 'TRUE_MISSING_ROUTE'",
      );
      expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr3l/targetClassifier.ts')).toContain(
        "'TRUE_MISSING_ROUTE'",
      );
    }
  });

  it('shell propagation scopes, impact analysis, and confirmation gates work', () => {
    expect(normalizePropagationScope({ TARGET_ONLY: true, DESIGN_FAMILY: false, SHARED_SHELL_GLOBAL: false })).toBe(
      'TARGET_ONLY',
    );
    expect(normalizePropagationScope({ TARGET_ONLY: false, DESIGN_FAMILY: true, SHARED_SHELL_GLOBAL: true })).toBe(
      'SHARED_SHELL_GLOBAL',
    );
    expect(DEFAULT_PROPAGATION_SCOPE).toBe('TARGET_ONLY');

    const targetImpact = analyzeShellPropagationImpact({
      scope: 'TARGET_ONLY',
      projectId: 'NDXBOOK',
      shellId: 'ndx-character-lab-shell',
      targetId: 'ndxbook:character-lab:voice-lab-tab',
    });
    expect(targetImpact.blastRadiusSummary).toContain('TARGET ONLY');

    const familyImpact = analyzeShellPropagationImpact({
      scope: 'DESIGN_FAMILY',
      projectId: 'NDXBOOK',
      shellId: 'ndx-character-lab-shell',
      familyId: 'ndxbook-character-lab-family',
    });
    expect(familyImpact.blastRadiusSummary).toContain('UPDATE THIS FAMILY');
    expect(familyImpact.materialScreens.length).toBeGreaterThan(0);

    const globalImpact = analyzeShellPropagationImpact({
      scope: 'SHARED_SHELL_GLOBAL',
      projectId: 'SITE00',
      shellId: 'site00-information-shell',
    });
    expect(globalImpact.blastRadiusSummary).toContain('UPDATE EVERY PAGE');
    expect(globalImpact.pages.length).toBeGreaterThan(1);

    expect(propagationRequiresFounderConfirmation('TARGET_ONLY')).toBe(false);
    expect(propagationRequiresFounderConfirmation('DESIGN_FAMILY')).toBe(true);
    expect(propagationRequiresFounderConfirmation('SHARED_SHELL_GLOBAL')).toBe(true);
  });

  it('blocks cross-project and host shell contamination', () => {
    expect(crossProjectPropagationBlocked('SITE00', 'NDXBOOK')).toBe(true);
    expect(crossProjectPropagationBlocked('NDXBOOK', 'SITE00')).toBe(true);
    expect(crossProjectPropagationBlocked('SITE00', 'SITE00')).toBe(false);
    expect(hostShellContaminationBlocked('SHARED_SHELL_GLOBAL', 'site00-design-workspace-host')).toBe(true);
    expect(hostShellContaminationBlocked('TARGET_ONLY', 'site00-information-shell')).toBe(false);
  });

  it('commits propagation with receipts, versioning, exceptions, rollback, and targeted recapture', () => {
    const blocked = commitShellPropagation({
      scope: 'DESIGN_FAMILY',
      projectId: 'NDXBOOK',
      shellId: 'ndx-character-lab-shell',
      familyId: 'ndxbook-character-lab-family',
      confirmedByFounder: false,
    });
    expect('blocked' in blocked && blocked.blocked).toBe(true);

    const prevFamily = getDesignFamilyVersion('ndxbook-character-lab-family');
    const receipt = commitShellPropagation({
      scope: 'DESIGN_FAMILY',
      projectId: 'NDXBOOK',
      shellId: 'ndx-character-lab-shell',
      familyId: 'ndxbook-character-lab-family',
      confirmedByFounder: true,
    });
    expect('receiptId' in receipt).toBe(true);
    if ('receiptId' in receipt) {
      expect(receipt.confirmedByFounder).toBe(true);
      expect(receipt.affectedPages.length).toBeGreaterThan(0);

      const plan = buildShellPropagationRecapturePlan(receipt);
      expect(plan.fullProjectRecapture).toBe(false);
      expect(plan.consumerIds.length).toBeGreaterThan(0);

      const rolled = rollbackShellPropagation(receipt.receiptId);
      expect(rolled?.rolledBack).toBe(true);
    }

    expect(getDesignFamilyVersion('ndxbook-character-lab-family')).toBe(prevFamily + 1);
    expect(listFamilyShellChanges().length).toBe(1);

    const prevShell = getShellVersion('site00-information-shell');
    commitShellPropagation({
      scope: 'SHARED_SHELL_GLOBAL',
      projectId: 'SITE00',
      shellId: 'site00-information-shell',
      confirmedByFounder: true,
    });
    expect(getShellVersion('site00-information-shell')).toBe(prevShell + 1);

    addShellPropagationException({
      shellId: 'ndx-character-lab-shell',
      consumerId: 'casting',
      reason: 'founder excluded',
    });
    const exceptions = listShellPropagationExceptions('ndx-character-lab-shell');
    expect(exceptions.some((e) => e.consumerId === 'casting' && e.persists)).toBe(true);

    const impactWithExc = analyzeShellPropagationImpact({
      scope: 'DESIGN_FAMILY',
      projectId: 'NDXBOOK',
      shellId: 'ndx-character-lab-shell',
      familyId: 'ndxbook-character-lab-family',
      exceptions: ['casting'],
    });
    expect(impactWithExc.materialScreens).not.toContain('casting');

    expect(detectReferenceConflict('guide', true)).toBe(true);
    expect(listShellPropagationReceipts().length).toBeGreaterThan(0);
  });

  it('detects duplicated family implementation and builds shared shell dependency graph', () => {
    const dup = detectDuplicatedFamilyImplementation(
      EXPERIENCE_PAGE_TEMPLATES.INFORMATION.templateId,
      'SITE00',
    );
    expect(dup?.recommendation).toBe('REFACTOR_TO_SHARED_SHELL');
    expect(dup?.sharedShellCandidate).toBe('site00-information-shell');

    const site00Graph = buildSharedShellDependencyGraph('SITE00');
    const ndxGraph = buildSharedShellDependencyGraph('NDXBOOK');
    expect(site00Graph.shells.length).toBeGreaterThan(0);
    expect(ndxGraph.shells.some((s) => s.shellId === 'ndx-character-lab-shell')).toBe(true);
    expect(listSharedShells('SITE00').every((s) => s.projectId === 'SITE00')).toBe(true);
  });

  it('missing target queue summarizes Voice Lab entry and derived drafts', async () => {
    await deriveMissingTargetFromFamily('ndxbook:character-lab:voice-lab-tab', { skipCapture: true });

    const voiceEntry = getCharacterLabVoiceLabEntry();
    expect(voiceEntry?.displayName).toBe('VOICE LAB');
    expect(voiceEntry?.derived).toBe(true);
    expect(voiceEntry?.sourceSiblingId).toBe('character-lab-language-lab');

    const summary = summarizeMissingTargetQueue('NDXBOOK');
    expect(summary.derivedDraft).toBeGreaterThanOrEqual(1);
    expect(summary.total).toBeGreaterThan(0);

    const queue = buildMissingTargetQueue('NDXBOOK');
    expect(queue.some((q) => q.targetId === 'ndxbook:character-lab:voice-lab-tab' && q.derived)).toBe(true);
    expect(getFamilyDerivedRecord('ndxbook:character-lab:voice-lab-tab')).not.toBeNull();
    expect(listFamilyDerivationReceipts().length).toBeGreaterThan(0);
  });

  it('UI wiring: MISSING tab and design workspace components present', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain("tab === 'MISSING'");
    expect(read('src/site00/components/designWorkspace/DesignMissingTargetQueue.tsx')).toContain('MISSING TARGETS');
    expect(read('src/site00/components/designWorkspace/DesignShellPropagationPanel.tsx')).toContain('SHELL CHANGE SCOPE');
    expect(read('src/site00/styles/site00-pages.css')).toContain('site00-dw-missing-targets');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr2b/designWorkspaceUrlState.ts')).toContain(
      "'MISSING'",
    );
  });

  it('preserves P0.VR.3E capture engine integration and does not require full backfill', async () => {
    const targets = discoverMissingDesignTargets();
    expect(targets.length).toBeGreaterThan(0);
    expect(targets.length).toBeLessThan(500);

    await captureImplementationSnapshot({
      projectId: 'ndxbook',
      screenId: 'character-lab',
      viewportClass: 'mobile',
      snapshotLabel: FAMILY_SOURCE_SNAPSHOT_LABEL,
    });
    const snap = getLatestImplementationSnapshot('ndxbook', 'character-lab', 'mobile');
    expect(snap?.snapshotLabel).toBe(FAMILY_SOURCE_SNAPSHOT_LABEL);
  });
});
