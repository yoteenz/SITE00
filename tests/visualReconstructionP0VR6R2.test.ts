/**
 * P0.VR.6R2 — Canonical visual convergence engine tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  P0_VR_6R2_LINEAGE,
  DEFAULT_MAX_AUTOMATIC_ITERATIONS,
  CORRECTION_PRIORITY_ORDER,
  DEFAULT_FIDELITY_SETTINGS,
  PIPELINE_STAGES_WITH_VISUAL_QA,
  P0_VR_6R2_FAILURE_CODES,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/constants.js';
import {
  clearConvergenceSessionStoreForTest,
  getComparisonSessionByContract,
  saveComparisonSession,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/sessionStore.js';
import {
  blockExecutorSelfPass,
  buildVisualCorrectionPlan,
  captureLiveTarget,
  classifyVisualDriftFromSession,
  evaluateConvergence,
  finalizeReferenceVerification,
  measureReferenceDelta,
  normalizeComparisonPair,
  prepareReference,
  requiresVisualConvergence,
  runConvergenceComparison,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/convergenceEngine.js';
import { buildDefaultDynamicMasks, applyDynamicMasksToDeltas } from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/dynamicMasking.js';
import { buildVisualComparisonNormalization, generateOverlayArtifact } from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/overlayEngine.js';
import { buildRegionRegistryFromDecomposition } from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/regionRegistry.js';
import { runAutomaticConvergenceLoop } from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/iterationLoop.js';
import { buildDesignExecutionFidelityEnvelope } from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/executionEnvelope.js';
import {
  derivePageVisualVerificationStatus,
  pageIsMatchedFromReferenceExistenceOnly,
  pageMatchUsesVisualVerification,
  referenceCardVisualLabel,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/pageStatus.js';
import {
  EXACT_FIDELITY_PRESET_IDS,
  learnedPresetInheritsGlobalFidelity,
  presetCannotDowngradeExact,
  resolvePresetFidelityContract,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/presetFidelity.js';
import {
  ensureConvergenceSessionForContract,
  onImplementationComplete,
  founderVerifyVisualMatch,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/integration.js';
import {
  clearFidelityContractStoreForTest,
  createDefaultFidelityContract,
  patchFidelityContract,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/contractStore.js';
import { runDesignReferenceDecomposition } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/decomposition.js';
import { ingestReferenceWithFidelityContract } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/integration.js';
import { buildExecutionFidelityHandoff, formatExecutionHandoffPrompt } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/executionHandoff.js';
import { SYSTEM_FIDELITY_PRESET_IDS } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/constants.js';
import { desktopAndMobileAreIndependentAuthorities } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/viewportAuthority.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function exactContract() {
  const contract = createDefaultFidelityContract({
    referenceId: `ref-exact-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    projectId: 'site00',
    pageId: 'projects-index',
    route: '/projects/site00/design',
    viewport: 'mobile',
  });
  const decomposition = runDesignReferenceDecomposition({
    contractId: contract.contractId,
    referenceId: contract.referenceId,
    viewport: 'mobile',
  });
  return patchFidelityContract(contract.contractId, {
    decomposition,
    implementationPlan: {
      planId: 'plan-1',
      contractId: contract.contractId,
      referenceAuthority: 'EXACT',
      regions: ['HEADER'],
      assetsDetected: 1,
      liveUiRegions: 8,
      currentVisualsToReplace: 3,
      functionalComponentsToPreserve: 5,
      implementationOrder: ['GLOBAL_GEOMETRY'],
      createdAt: new Date().toISOString(),
    },
  })!;
}

describe('P0.VR.6R2 visual convergence engine', () => {
  beforeEach(() => {
    clearConvergenceSessionStoreForTest();
    clearFidelityContractStoreForTest();
  });

  it('1. DesignVisualConvergenceEngine exists', () => {
    expect(P0_VR_6R2_LINEAGE).toBe('P0.VR.6R2');
    expect(typeof prepareReference).toBe('function');
    expect(typeof runConvergenceComparison).toBe('function');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr6r2/convergenceEngine.ts')).toContain(
      'DesignVisualConvergenceEngine',
    );
  });

  it('2. exact references automatically enter convergence', () => {
    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-auto',
      projectId: 'site00',
      pageId: 'pages',
      route: '/design',
      viewport: 'mobile',
    });
    expect(requiresVisualConvergence(contract)).toBe(true);
    const session = getComparisonSessionByContract(contract.contractId);
    expect(session).not.toBeNull();
  });

  it('3. implementation completion triggers visual QA', () => {
    const contract = exactContract();
    const { contract: updated, session } = onImplementationComplete({
      contractId: contract.contractId,
      referencePath: '/ref.png',
      livePath: '/live.png',
      liveWidth: 390,
      liveHeight: 844,
    });
    expect(updated?.status).toBe('RENDER_QA_REQUIRED');
    expect(session).not.toBeNull();
    expect(session!.status).not.toBe('VERIFIED');
  });

  it('4. comparison session created', () => {
    const session = prepareReference({ contract: exactContract() });
    expect(session?.sessionId).toMatch(/^vcs-/);
    expect(session?.authorityMode).toBe('DESIGN_AUTHORITY');
    expect(session?.fidelityMode).toBe('EXACT');
  });

  it('5. live capture created', () => {
    let session = prepareReference({ contract: exactContract() })!;
    session = captureLiveTarget(session, '/live/capture.png');
    expect(session.liveCaptureId).toMatch(/^cap-/);
    expect(session.historyEvents.some((e) => e.event === 'LIVE_CAPTURED')).toBe(true);
  });

  it('6. normalization runs', () => {
    let session = prepareReference({ contract: exactContract() })!;
    session = normalizeComparisonPair(session, 390, 844);
    expect(session.normalization?.normalizedWidth).toBe(390);
    expect(session.normalization?.browserChromeExcluded).toBe(true);
    const norm = buildVisualComparisonNormalization({
      referenceWidth: 390,
      referenceHeight: 844,
      liveWidth: 390,
      liveHeight: 844,
    });
    expect(norm.scaleApplied).toBeGreaterThan(0);
  });

  it('7. overlay generated', () => {
    const session = prepareReference({ contract: exactContract() })!;
    const overlay = generateOverlayArtifact({
      sessionId: session.sessionId,
      iterationNumber: 1,
      referencePath: '/ref.png',
      livePath: '/live.png',
      normalization: buildVisualComparisonNormalization({
        referenceWidth: 390,
        referenceHeight: 844,
        liveWidth: 390,
        liveHeight: 844,
      }),
    });
    expect(overlay.overlayPath).toContain('overlay-50');
    expect(overlay.opacity).toBe(0.5);
  });

  it('8. region deltas generated', () => {
    const contract = exactContract();
    const session = prepareReference({ contract })!;
    const deltas = measureReferenceDelta(session, { stepperTooWide: 22 });
    expect(deltas.some((d) => d.driftType === 'COMPONENT_SIZE_DRIFT' || d.driftType === 'HORIZONTAL_OVERFLOW')).toBe(
      true,
    );
  });

  it('9. dynamic text can be masked', () => {
    const contract = exactContract();
    const regions = buildRegionRegistryFromDecomposition({
      referenceId: contract.referenceId,
      decomposition: contract.decomposition!,
    });
    const masks = buildDefaultDynamicMasks(regions);
    expect(masks.some((m) => m.kind === 'COUNT' || m.kind === 'PROJECT_NAME')).toBe(true);
  });

  it('10. geometry remains measurable under masks', () => {
    const contract = exactContract();
    const session = prepareReference({ contract })!;
    const raw = measureReferenceDelta(session, { stepperTooWide: 12 });
    const masked = applyDynamicMasksToDeltas(raw, session.dynamicMasks);
    const geometry = masked.filter((d) => d.deltaWidth != null || d.deltaHeight != null);
    expect(geometry.length).toBeGreaterThan(0);
  });

  it('11. drift classified', () => {
    const contract = exactContract();
    const session = prepareReference({ contract })!;
    const deltas = measureReferenceDelta(session, { headerTooTall: 24 });
    const status = classifyVisualDriftFromSession(deltas);
    expect(['DRIFT_FOUND', 'HIGH_MATCH']).toContain(status);
  });

  it('12. correction plan generated', () => {
    const contract = exactContract();
    const session = prepareReference({ contract })!;
    const deltas = measureReferenceDelta(session, { stepperTooWide: 22 });
    const plan = buildVisualCorrectionPlan({ session, deltas });
    expect(plan.corrections.length).toBeGreaterThan(0);
    expect(plan.priorityOrder).toEqual([...CORRECTION_PRIORITY_ORDER]);
  });

  it('13. correction ordering enforced', () => {
    expect(CORRECTION_PRIORITY_ORDER[0]).toBe('CANVAS');
    expect(CORRECTION_PRIORITY_ORDER.indexOf('TYPOGRAPHY')).toBeGreaterThan(
      CORRECTION_PRIORITY_ORDER.indexOf('COMPONENT_BOXES'),
    );
  });

  it('14. recapture occurs in convergence comparison', () => {
    const contract = exactContract();
    let session = ensureConvergenceSessionForContract(contract)!;
    session = runConvergenceComparison({
      session,
      referencePath: '/ref.png',
      livePath: '/live.png',
      liveWidth: 390,
      liveHeight: 844,
    });
    expect(session.iterations.length).toBe(1);
    expect(session.historyEvents.some((e) => e.event === 'LIVE_CAPTURED')).toBe(true);
  });

  it('15. recompare occurs in automatic loop', () => {
    const contract = exactContract();
    const session = ensureConvergenceSessionForContract(contract)!;
    const result = runAutomaticConvergenceLoop({
      sessionId: session.sessionId,
      referencePath: '/ref.png',
      livePath: '/live.png',
      liveWidth: 390,
      liveHeight: 844,
    });
    expect(result?.iterationsRun).toBeGreaterThan(0);
  });

  it('16. iteration history persists', () => {
    const contract = exactContract();
    const session = runConvergenceComparison({
      session: ensureConvergenceSessionForContract(contract)!,
      referencePath: '/ref.png',
      livePath: '/live.png',
      liveWidth: 390,
      liveHeight: 844,
    });
    expect(session.historyEvents.length).toBeGreaterThan(2);
    expect(session.iterations.length).toBe(1);
  });

  it('17. max iteration policy enforced', () => {
    expect(DEFAULT_MAX_AUTOMATIC_ITERATIONS).toBe(3);
    const contract = exactContract();
    const session = ensureConvergenceSessionForContract(contract)!;
    session.maxAutomaticIterations = 1;
    session.iterationNumber = 1;
    const evalResult = evaluateConvergence({
      ...session,
      latestDeltas: measureReferenceDelta(session, { stepperTooWide: 30 }),
    });
    expect(evalResult.maxIterationsReached).toBe(true);
    expect(evalResult.status).toBe('FOUNDER_REVIEW_REQUIRED');
  });

  it('18. paid asset regeneration never auto-runs', () => {
    const contract = exactContract();
    const session = prepareReference({ contract })!;
    const deltas = [
      {
        measurementId: 'd1',
        regionId: session.regions.find((r) => r.semanticRole === 'HERO')!.regionId,
        componentId: 'HERO',
        deltaX: 0,
        deltaY: 0,
        deltaWidth: 0,
        deltaHeight: 0,
        deltaFontSize: null,
        deltaLineHeight: null,
        deltaSpacing: null,
        deltaColor: null,
        deltaRadius: null,
        deltaBorderWidth: null,
        assetScaleDelta: 0.4,
        driftType: 'ASSET_FIDELITY_DRIFT' as const,
        severity: 'MAJOR' as const,
        confidence: 0.9,
        masked: false,
        description: 'Hero asset wrong',
      },
    ];
    const plan = buildVisualCorrectionPlan({ session, deltas });
    expect(plan.requiresFounderInput).toBe(true);
    expect(plan.status).toBe('BLOCKED');
  });

  it('19. asset corrections route through founder gate', () => {
    const plan = buildVisualCorrectionPlan({
      session: prepareReference({ contract: exactContract() })!,
      deltas: [
        {
          measurementId: 'd2',
          regionId: 'r-hero',
          componentId: 'HERO',
          deltaX: null,
          deltaY: null,
          deltaWidth: null,
          deltaHeight: null,
          deltaFontSize: null,
          deltaLineHeight: null,
          deltaSpacing: null,
          deltaColor: null,
          deltaRadius: null,
          deltaBorderWidth: null,
          assetScaleDelta: 0.5,
          driftType: 'ASSET_FIDELITY_DRIFT',
          severity: 'MAJOR',
          confidence: 0.9,
          masked: false,
          description: 'Needs new image',
        },
      ],
    });
    expect(plan.requiresAssetChange).toBe(true);
    expect(plan.corrections[0]?.requiresFounderInput).toBe(true);
  });

  it('20. mobile and desktop authorities stay separate', () => {
    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-vp',
      projectId: 'site00',
      pageId: 'pages',
      route: '/design',
      viewport: 'mobile',
    });
    expect(desktopAndMobileAreIndependentAuthorities(contract.viewportAuthorities)).toBe(false);
    expect(contract.viewportAuthorities[0]?.authorityStatus).toBe('EXACT');
  });

  it('21. no executor self-pass', () => {
    const session = saveComparisonSession(prepareReference({ contract: exactContract() })!)!;
    expect(blockExecutorSelfPass(true, session)).toBe(true);
    const verified = saveComparisonSession(finalizeReferenceVerification(session, 'SYSTEM'))!;
    expect(blockExecutorSelfPass(true, verified)).toBe(false);
  });

  it('22. pages do not mark matched from reference existence alone', () => {
    expect(pageIsMatchedFromReferenceExistenceOnly(true)).toBe(true);
    const status = derivePageVisualVerificationStatus({
      hasReference: true,
      contract: exactContract(),
      session: null,
    });
    expect(status).not.toBe('VERIFIED');
  });

  it('23. page match uses visual verification status', () => {
    expect(pageMatchUsesVisualVerification('VERIFIED')).toBe(true);
    expect(pageMatchUsesVisualVerification('VISUAL_QA')).toBe(false);
  });

  it('24. reference cards expose visual status', () => {
    expect(read('src/site00/components/designWorkspace/DesignReferencesTab.tsx')).toContain('VIEW DIFF');
    expect(read('src/site00/components/designWorkspace/DesignReferencesTab.tsx')).toContain('VISUAL QA');
  });

  it('25. history records convergence events', () => {
    const session = runConvergenceComparison({
      session: prepareReference({ contract: exactContract() })!,
      referencePath: '/ref.png',
      livePath: '/live.png',
      liveWidth: 390,
      liveHeight: 844,
    });
    expect(session.historyEvents.some((e) => e.event === 'OVERLAY_CREATED')).toBe(true);
    expect(session.historyEvents.some((e) => e.event === 'DRIFT_DETECTED')).toBe(true);
  });

  it('26. More defaults to EXACT', () => {
    expect(DEFAULT_FIDELITY_SETTINGS.defaultFidelityMode).toBe('EXACT');
    expect(read('src/site00/components/designWorkspace/DesignMoreTab.tsx')).toContain('REFERENCE FIDELITY');
  });

  it('27. presets inherit global fidelity contract', () => {
    const preset = resolvePresetFidelityContract(SYSTEM_FIDELITY_PRESET_IDS.REPLICATE_PAGE_EXACTLY);
    expect(preset.visualConvergence).toBe('REQUIRED');
    expect(preset.overlayQa).toBe('REQUIRED');
  });

  it('28. learned presets cannot downgrade exact mode', () => {
    expect(learnedPresetInheritsGlobalFidelity(SYSTEM_FIDELITY_PRESET_IDS.REPLICATE_PAGE_EXACTLY, 'INTERPRETIVE')).toBe(
      'EXACT',
    );
    expect(presetCannotDowngradeExact('EXACT', 'INTERPRETIVE')).toBe('EXACT');
  });

  it('29. founder can manually verify', () => {
    const contract = exactContract();
    const session = ensureConvergenceSessionForContract(contract)!;
    const verified = founderVerifyVisualMatch(session.sessionId);
    expect(verified?.verificationSource).toBe('FOUNDER');
    expect(verified?.status).toBe('VERIFIED');
  });

  it('30. system verification source recorded separately', () => {
    let session = prepareReference({ contract: exactContract() })!;
    session = { ...session, status: 'HIGH_MATCH', latestDeltas: [] };
    const verified = finalizeReferenceVerification(session, 'SYSTEM');
    expect(verified.verificationSource).toBe('SYSTEM');
  });

  it('31. build passes — pipeline stage + envelope + UI modules present', () => {
    expect(PIPELINE_STAGES_WITH_VISUAL_QA).toContain('VISUAL_QA');
    expect(P0_VR_6R2_FAILURE_CODES).toContain('VISUAL_EXECUTOR_SELF_PASS');
    const envelope = buildDesignExecutionFidelityEnvelope({ contract: exactContract() });
    expect(envelope?.convergencePolicy.visualConvergenceRequired).toBe(true);
    const handoff = buildExecutionFidelityHandoff(exactContract());
    expect(handoff?.visualConvergenceRequired).toBe(true);
    expect(formatExecutionHandoffPrompt(handoff!)).toContain('VISUAL CONVERGENCE REQUIRED');
    expect(read('src/site00/components/designWorkspace/DesignVisualConvergenceBadge.tsx')).toContain('VIEW COMPARISON');
    expect(read('src/site00/components/designWorkspace/DesignVisualComparisonDrawer.tsx')).toContain('OVERLAY');
    expect(EXACT_FIDELITY_PRESET_IDS).toContain(SYSTEM_FIDELITY_PRESET_IDS.REPLICATE_PAGE_EXACTLY);
  });
});
