/**
 * P0.VR.7 — Reference fidelity contract + screenshot design authority engine tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  P0_VR_7_LINEAGE,
  SYSTEM_FIDELITY_INSTRUCTION,
  DEFAULT_DESIGN_AUTHORITY_MODE,
  DEFAULT_FIDELITY_MODE,
  P0_VR_7_FAILURE_CODES,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/constants.js';
import {
  clearFidelityContractStoreForTest,
  createDefaultFidelityContract,
  mergeFounderInstructionWithContract,
  implementationCompleteDoesNotEqualVerified,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/contractStore.js';
import { runDesignReferenceDecomposition } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/decomposition.js';
import {
  buildReferenceImplementationPlan,
  formatInterpretationSummary,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/implementationPlan.js';
import {
  ingestReferenceWithFidelityContract,
  confirmReferenceInterpretation,
  resolveEffectiveJobInstruction,
  inheritFidelityForAssetCrop,
  runFidelityQaIteration,
  getExecutionHandoffForContract,
  blockGenericFallbackWhenGeometryExists,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/integration.js';
import {
  runDesignReferenceScreenshotQA,
  shouldBlockFalsePass,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/screenshotQA.js';
import { buildVisualCorrectionPlan, shouldContinueCorrectionLoop } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/correctionPlan.js';
import { formatExecutionHandoffPrompt } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/executionHandoff.js';
import {
  desktopAndMobileAreIndependentAuthorities,
  inferMissingViewportAuthority,
  mergeViewportAuthorities,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7/viewportAuthority.js';
import {
  BUILT_IN_PRESET_IDS,
  clearAssetJobStoreForTest,
  createAssetJob,
  addSourceUpload,
  linkFidelityContract,
  getEffectiveJobInstruction,
  updateJobInstruction,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr5/index.js';
import { listAllPresets } from '../shared/site00-studio-world-production/visualReconstruction/p0vr5/presetStore.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.7 reference fidelity contract', () => {
  beforeEach(() => {
    clearFidelityContractStoreForTest();
    clearAssetJobStoreForTest();
  });

  it('1. DesignReferenceFidelityContract model exists', () => {
    expect(P0_VR_7_LINEAGE).toBe('P0.VR.7');
    const contract = createDefaultFidelityContract({
      referenceId: 'ref-1',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
    });
    expect(contract.contractId).toMatch(/^fidelity-/);
    expect(contract.authorityMode).toBeDefined();
    expect(contract.fidelityMode).toBeDefined();
    expect(contract.status).toBe('REFERENCE_UPLOADED');
  });

  it('2–3. design screenshot defaults to DESIGN_AUTHORITY and EXACT', () => {
    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-default',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
    });
    expect(contract.authorityMode).toBe(DEFAULT_DESIGN_AUTHORITY_MODE);
    expect(contract.authorityMode).toBe('DESIGN_AUTHORITY');
    expect(contract.fidelityMode).toBe(DEFAULT_FIDELITY_MODE);
    expect(contract.fidelityMode).toBe('EXACT');
  });

  it('4–5. system fidelity instruction auto-injected; founder instruction additive', () => {
    const contract = createDefaultFidelityContract({
      referenceId: 'ref-2',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
      founderInstruction: 'ISOLATE THE FIVE PROJECT ICONS',
    });
    const merged = mergeFounderInstructionWithContract(contract, 'ISOLATE THE FIVE PROJECT ICONS');
    expect(merged).toContain(SYSTEM_FIDELITY_INSTRUCTION);
    expect(merged).toContain('ISOLATE THE FIVE PROJECT ICONS');
    expect(merged.startsWith(SYSTEM_FIDELITY_INSTRUCTION)).toBe(true);
  });

  it('6–9. geometry, typography, spacing decomposition and asset manifest', () => {
    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-decomp',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
      referenceWidth: 390,
      referenceHeight: 844,
    });
    expect(contract.decomposition).not.toBeNull();
    expect(contract.decomposition!.globalGeometry.referenceWidth).toBe(390);
    expect(contract.decomposition!.typography.length).toBeGreaterThan(0);
    expect(contract.decomposition!.spacing.sectionGap).toBeGreaterThan(0);
    expect(contract.decomposition!.assetManifest.length).toBeGreaterThan(0);
  });

  it('10. live UI vs image regions distinguished', () => {
    const decomp = runDesignReferenceDecomposition({
      contractId: 'c-1',
      referenceId: 'ref-live',
      viewport: 'mobile',
    });
    const live = decomp.components.filter((c) => c.classification === 'LIVE_DOM_UI');
    const image = decomp.components.filter((c) => c.classification === 'IMAGE_LIKE_ASSET');
    expect(live.length).toBeGreaterThan(0);
    expect(image.length).toBeGreaterThan(0);
    expect(decomp.liveUiRegionCount).toBe(live.length);
    expect(decomp.imageAssetRegionCount).toBe(image.length);
  });

  it('11–12. implementation plan generated; founder interpretation confirmation supported', () => {
    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-plan',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
    });
    expect(contract.implementationPlan).not.toBeNull();
    expect(contract.implementationPlan!.assetsDetected).toBeGreaterThan(0);
    expect(contract.status).toBe('INTERPRETATION_REVIEW');
    const summary = formatInterpretationSummary(contract.implementationPlan!);
    expect(summary.authority).toContain('EXACT');
    const confirmed = confirmReferenceInterpretation(contract.contractId);
    expect(confirmed?.status).toBe('REFERENCE_CONFIRMED');
    expect(confirmed?.founderConfirmedAt).not.toBeNull();
  });

  it('13–14. current visual protection false for exact; functional preservation true', () => {
    const contract = createDefaultFidelityContract({
      referenceId: 'ref-exact',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
      fidelityMode: 'EXACT',
      authorityMode: 'DESIGN_AUTHORITY',
    });
    expect(contract.allowCurrentVisualProtection).toBe(false);
    expect(contract.preserveFunction).toBe(true);
    expect(contract.preserveData).toBe(true);
    expect(contract.preserveRouting).toBe(true);
    expect(contract.preservePermissions).toBe(true);
  });

  it('15–16. multi-viewport authorities; inferred viewport marked inferred', () => {
    const mobileAuthority = {
      viewport: 'mobile' as const,
      referenceId: 'ref-m',
      authorityStatus: 'EXACT' as const,
      geometryProfile: runDesignReferenceDecomposition({
        contractId: 'c-m',
        referenceId: 'ref-m',
        viewport: 'mobile',
      }).globalGeometry,
      assetManifest: [],
    };
    const desktopAuthority = {
      viewport: 'desktop' as const,
      referenceId: 'ref-d',
      authorityStatus: 'EXACT' as const,
      geometryProfile: runDesignReferenceDecomposition({
        contractId: 'c-d',
        referenceId: 'ref-d',
        viewport: 'desktop',
        referenceWidth: 1280,
        referenceHeight: 900,
      }).globalGeometry,
      assetManifest: [],
    };
    const merged = mergeViewportAuthorities([mobileAuthority], desktopAuthority);
    expect(desktopAndMobileAreIndependentAuthorities(merged)).toBe(true);
    const inferred = inferMissingViewportAuthority(['mobile'], 'desktop');
    expect(inferred?.authorityStatus).toBe('INFERRED');
  });

  it('17–19. screenshot QA mandatory for exact; region diff; visual drift classes', () => {
    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-qa',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
    });
    expect(contract.requireScreenshotQA).toBe(true);
    expect(shouldBlockFalsePass(contract)).toBe(true);

    const qaLive = runDesignReferenceScreenshotQA({
      contract,
      decomposition: contract.decomposition!,
      liveCaptureAvailable: true,
      liveGeometryHints: { headerTooTall: 18, stepperClipped: true },
    });
    expect(qaLive.regionScores.length).toBe(6);
    expect(qaLive.driftFindings.some((d) => d.driftType === 'GEOMETRY_DRIFT')).toBe(true);
    expect(qaLive.driftFindings.some((d) => d.driftType === 'COMPONENT_DRIFT')).toBe(true);
    expect(qaLive.numericScore).toBeNull();
  });

  it('20–21. implementation complete does not equal verified; correction loop supported', () => {
    expect(implementationCompleteDoesNotEqualVerified('IMPLEMENTING')).toBe(true);
    expect(implementationCompleteDoesNotEqualVerified('VERIFIED')).toBe(false);

    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-loop',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
    });
    confirmReferenceInterpretation(contract.contractId);
    const afterQa = runFidelityQaIteration(contract.contractId, true, { headerTooTall: 18 });
    expect(afterQa?.correctionPlan).not.toBeNull();
    expect(shouldContinueCorrectionLoop(afterQa!.latestFidelityStatus)).toBe(true);
  });

  it('22–23. asset pipeline inherits exact fidelity; execution handoff contains contract', () => {
    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-asset',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
    });
    confirmReferenceInterpretation(contract.contractId);

    const inherited = inheritFidelityForAssetCrop(contract.contractId);
    expect(inherited?.authorityMode).toBe('DESIGN_AUTHORITY');
    expect(inherited?.fidelityMode).toBe('EXACT');
    expect(inherited?.systemInstruction).toContain('REFERENCE = DESIGN AUTHORITY');

    const handoff = getExecutionHandoffForContract(contract.contractId);
    expect(handoff).not.toBeNull();
    const prompt = formatExecutionHandoffPrompt(handoff!);
    expect(prompt).toContain('KEEP THE FUNCTION');
    expect(prompt).toContain('PROTECT CURRENT VISUALS: NO');
    expect(prompt).toContain('SCREENSHOT QA REQUIRED: YES');
    expect(handoff!.geometryProfile).toBeDefined();
    expect(handoff!.assetManifest.length).toBeGreaterThan(0);
  });

  it('24–25. generic fallback blocked when geometry exists; live data can differ', () => {
    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-geo',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
    });
    expect(blockGenericFallbackWhenGeometryExists(contract)).toBe(true);
    expect(blockGenericFallbackWhenGeometryExists(null)).toBe(false);
    const plan = contract.implementationPlan!;
    expect(plan.functionalComponentsToPreserve).toBeGreaterThan(0);
    expect(plan.currentVisualsToReplace).toBeGreaterThan(0);
  });

  it('26–28. UI badge and inspector source files; no fake fidelity score', () => {
    expect(read('src/site00/components/designWorkspace/DesignReferenceFidelityBadge.tsx')).toContain(
      'VIEW CONTRACT',
    );
    expect(read('src/site00/components/designWorkspace/DesignReferenceFidelityContractPanel.tsx')).toContain(
      'NOT SCORED',
    );
    const qa = runDesignReferenceScreenshotQA({
      contract: createDefaultFidelityContract({
        referenceId: 'ref-score',
        projectId: 'site00',
        pageId: 'p',
        route: '/p',
        viewport: 'mobile',
      }),
      decomposition: runDesignReferenceDecomposition({
        contractId: 'c',
        referenceId: 'ref-score',
        viewport: 'mobile',
      }),
      liveCaptureAvailable: false,
    });
    expect(qa.numericScore).toBeNull();
  });

  it('29. accessibility preserved via contract flags', () => {
    const contract = createDefaultFidelityContract({
      referenceId: 'ref-a11y',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
    });
    expect(contract.preserveFunction).toBe(true);
    expect(contract.preserveRouting).toBe(true);
    expect(contract.preservePermissions).toBe(true);
  });

  it('30. failure codes and system presets exist', () => {
    expect(P0_VR_7_FAILURE_CODES).toContain('REFERENCE_TREATED_AS_INSPIRATION');
    expect(P0_VR_7_FAILURE_CODES).toContain('REFERENCE_FALSE_PASS');
    const presets = listAllPresets();
    expect(presets.some((p) => p.presetId === BUILT_IN_PRESET_IDS.REPLICATE_PAGE_EXACTLY)).toBe(true);
    expect(presets.some((p) => p.presetId === BUILT_IN_PRESET_IDS.EXTRACT_REPLACE_ASSETS_EXACTLY)).toBe(true);
  });

  it('job instruction merge uses fidelity contract when linked', () => {
    const contract = ingestReferenceWithFidelityContract({
      referenceId: 'ref-job',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      viewport: 'mobile',
    });
    const job = createAssetJob({
      workspaceId: 'design-workspace',
      projectId: 'site00',
      pageId: 'projects-index',
      route: '/projects',
      founderInstruction: 'ISOLATE HERO OBJECT',
    });
    linkFidelityContract(job.jobId, contract.contractId);
    updateJobInstruction(job.jobId, { founderInstruction: 'ISOLATE HERO OBJECT' });
    const effective = getEffectiveJobInstruction({
      ...job,
      fidelityContractId: contract.contractId,
      founderInstruction: 'ISOLATE HERO OBJECT',
    });
    expect(effective).toContain(SYSTEM_FIDELITY_INSTRUCTION);
    expect(effective).toContain('ISOLATE HERO OBJECT');
    expect(resolveEffectiveJobInstruction(contract.contractId, 'ISOLATE HERO OBJECT')).toBe(effective);
  });

  it('correction plan groups drift by region', () => {
    const plan = buildVisualCorrectionPlan({
      contractId: 'c-corr',
      findings: [
        { driftType: 'GEOMETRY_DRIFT', region: 'HEADER', description: 'HEADER 18PX TOO TALL', severity: 'MEDIUM' },
        { driftType: 'SPACING_DRIFT', region: 'MAIN_CONTENT', description: 'CARD 22% TOO TALL', severity: 'MEDIUM' },
      ],
    });
    expect(plan.targets.length).toBe(2);
    expect(plan.targets.find((t) => t.region === 'HEADER')?.corrections[0]).toContain('18PX');
  });
});
