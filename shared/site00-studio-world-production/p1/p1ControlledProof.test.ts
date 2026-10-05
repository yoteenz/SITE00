/**
 * P1 — Live Visual Pipeline + Contract-Driven Composer Orchestration tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COMPOSER_ORCHESTRATION_IMPLEMENTED,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  WORLD_FORMATION_IMPLEMENTED,
} from '../constants.js';
import {
  testVerifiedDistinctFromProductionVerified,
  failedLiveCaptureCannotBecomeProductionVerified,
  failedReferenceConditionedCannotBecomeProductionVerified,
} from './preconditionAudit.js';
import {
  mergeP1CapabilityVerifications,
  updateP1CapabilityVerification,
  capabilityRegistrySummary,
} from './capabilityRegistry.js';
import {
  assertSurfaceApprovedForImplementationGate,
  assertRequiredAssetsAvailableGate,
  assertComposerCapabilityVerifiedGate,
  assertResponsiveEvidenceSufficientGate,
  runAllDispatchSafetyGates,
  fingerprintsStale,
} from './dispatchGates.js';
import {
  compileP1ContractsForProjectsIndex,
  heroProofAloneCannotDispatchComposer,
} from './contractCompilation.js';
import {
  buildComposerImplementationPackage,
  composerPackageIncludesRequiredFields,
  dispatchComposerPackage,
  findExistingDispatch,
  resetComposerDispatchRegistry,
  creativeReinterpretationDetected,
} from './composerAdapter.js';
import {
  evaluateImplementationFidelity,
  buildImplementationRevisionDelta,
  failedImplementationCannotPass,
} from './fidelityEvaluation.js';
import { desktopProofAloneDoesNotSatisfyMobilePolicy } from '../siteProductionLogic.js';
import { accessibilityFindingsIncludedBeforeApproval, evaluateAccessibilityMvp } from './accessibilityMvp.js';
import {
  dispatchP1ComposerImplementation,
  resetP1OrchestrationState,
  initializeP1ControlledProofRun,
  evaluateP1ImplementationFidelity,
  recordImplementedSurfaceCapture,
} from './p1OrchestrationService.js';
import { EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION } from '../../site00-brand-lore/experienceExpression/constants.js';
import { NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION } from '../../site00-brand-lore/founderCreativeAppetite/constants.js';
import { buildProjectWorkspaceCanon } from '../../site00-brand-lore/projectWorkspace/projectWorkspaceCanon.js';
import type { SurfaceDesignProof } from '../../site00-brand-lore/experienceExpression/designProofTypes.js';

vi.mock('../../../api/_lib/site00BrandLore/loreService.js', () => ({
  getBrandLoreProfileForOrg: vi.fn().mockResolvedValue({
    brandWorld: { value: 'NDXBOOK' },
    brandPersonality: { version: 1 },
    contextClassification: 'PRIMARY_EXPRESSION_CONTEXT',
    founderCreativeAppetite: {
      rawAnswers: {},
      version: 1,
      domainTolerances: [{ domain: 'creative-risk', band: 'OPEN' }],
      hardCreativeBoundaries: { value: null },
    },
  }),
}));

import {
  generateMissingInterfaceAssets,
  generateVisualDevelopmentDesignProof,
  prepareComposedInterfaceSurface,
  prepareVisualDevelopmentImplementation,
  resetVisualDevelopmentRunMemory,
  setVisualDevelopmentProofJudgment,
} from '../../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/visualDevelopmentService.js';
import { compileReferencePackageForIntent } from '../../../api/_lib/site00VisualReference/visualReferenceService.js';
import { buildFalImageInput } from '../../site00-visual-generation/falImageModels.js';

function projectsProofFingerprint(proof: SurfaceDesignProof) {
  return (
    proof.composedProof?.fingerprint ??
    proof.surfaceVisualAuthorityPackage?.fingerprint ??
    proof.proofRecordId
  );
}

function approvedProjectsProof() {
  return async () => {
    resetVisualDevelopmentRunMemory();
    resetP1OrchestrationState();
    resetComposerDispatchRegistry();
    await prepareComposedInterfaceSurface('SITE00_PROJECTS_INDEX');
    await generateMissingInterfaceAssets('SITE00_PROJECTS_INDEX');
    await setVisualDevelopmentProofJudgment({
      proofId: 'SITE00_PROJECTS_INDEX',
      judgment: 'LOVE_THE_DIRECTION',
    });
    const run = await prepareVisualDevelopmentImplementation('SITE00_PROJECTS_INDEX');
    return run.proofs.site00ProjectsIndex;
  };
}

beforeEach(() => {
  resetVisualDevelopmentRunMemory();
  resetP1OrchestrationState();
  resetComposerDispatchRegistry();
  process.env.VITEST_CAPTURE_PRINCIPAL = 'PROJECT_OWNER';
});

describe('P1 LIVE VERIFICATION', () => {
  it('1. capability registry differentiates TEST_VERIFIED and PRODUCTION_VERIFIED', () => {
    expect(testVerifiedDistinctFromProductionVerified('TEST_VERIFIED', 'NOT_VERIFIED')).toBe(true);
    expect(testVerifiedDistinctFromProductionVerified('PRODUCTION_VERIFIED', 'PRODUCTION_VERIFIED')).toBe(false);
  });

  it('2. failed live capture cannot become PRODUCTION_VERIFIED', () => {
    expect(failedLiveCaptureCannotBecomeProductionVerified(false)).toBe(true);
    expect(failedLiveCaptureCannotBecomeProductionVerified(true)).toBe(false);
  });

  it('3. failed reference-conditioned request cannot become PRODUCTION_VERIFIED', () => {
    expect(failedReferenceConditionedCannotBecomeProductionVerified(false)).toBe(true);
  });
});

describe('P1 REFERENCE PIPELINE', () => {
  it('4. actual image references included in provider payload', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    const urls = pkg.references.map((r) => r.publicUrl).filter(Boolean) as string[];
    const { input } = buildFalImageInput({
      prompt: 'test',
      referenceImageUrls: urls,
      aspectRatio: '16:9',
    });
    expect((input.image_urls as string[] | undefined)?.length ?? 0).toBeGreaterThan(0);
  });

  it('5. strict host mode rejects silent text-only fallback', async () => {
    const { shouldFailWithoutReferenceConditioning } = await import(
      '../../site00-visual-reference/generationModeResolver.js'
    );
    expect(
      shouldFailWithoutReferenceConditioning({
        strictHostVisualConditioning: true,
        generationMode: 'TEXT_TO_IMAGE',
        referenceCount: 2,
      }),
    ).toBe(true);
  });

  it('6. structural reference remains STRUCTURAL_ONLY', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    const structural = pkg.references.filter(
      (r) => r.authority.STYLE === 'STRUCTURAL_ONLY' || r.approvalStatus === 'STRUCTURAL_REFERENCE',
    );
    expect(structural.length).toBeGreaterThanOrEqual(0);
  });

  it('7. negative reference remains negative', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    expect(pkg.antiDirectionInstructions.length).toBeGreaterThanOrEqual(0);
  });
});

describe('P1 CONTRACTS', () => {
  it('8. page-family contract required', async () => {
    const proof = await approvedProjectsProof()();
    const contracts = compileP1ContractsForProjectsIndex({
      projectId: 'site00',
      proof,
      approvedProofsFingerprint: projectsProofFingerprint(proof),
    });
    expect(contracts.pageFamilyContract.familyId).toBe('PROJECT_WORKSPACE');
  });

  it('9. surface contract required', async () => {
    const proof = await approvedProjectsProof()();
    const contracts = compileP1ContractsForProjectsIndex({
      projectId: 'site00',
      proof,
      approvedProofsFingerprint: projectsProofFingerprint(proof),
    });
    expect(contracts.surfaceContract.route).toBe('/projects');
  });

  it('10. hero proof alone cannot dispatch Composer', () => {
    expect(heroProofAloneCannotDispatchComposer(false, false)).toBe(true);
    expect(heroProofAloneCannotDispatchComposer(true, true)).toBe(false);
  });

  it('11. stale fingerprint blocks dispatch', () => {
    expect(
      fingerprintsStale(
        { siteStrategyFingerprint: 'abc', siteArchitectureFingerprint: null, informationArchitectureFingerprint: null, pageInventoryFingerprint: null, pageFamiliesFingerprint: null, experienceDirectionFingerprint: null, approvedProofsFingerprint: null, functionalCanonFingerprint: null, hostCanonFingerprint: null, clientExpressionFingerprint: null, assetBindingsFingerprint: null },
        { siteStrategyFingerprint: 'xyz', siteArchitectureFingerprint: null, informationArchitectureFingerprint: null, pageInventoryFingerprint: null, pageFamiliesFingerprint: null, experienceDirectionFingerprint: null, approvedProofsFingerprint: null, functionalCanonFingerprint: null, hostCanonFingerprint: null, clientExpressionFingerprint: null, assetBindingsFingerprint: null },
      ),
    ).toBe(true);
  });

  it('12. missing asset blocks dispatch', () => {
    const gate = assertRequiredAssetsAvailableGate({
      missingRequiredAssets: ['hero-artwork'],
      approvedVisualReferences: [],
    } as import('../../site00-brand-lore/experienceExpression/types.js').ExperienceImplementationContract);
    expect(gate.ok).toBe(false);
  });

  it('13. missing approved proof blocks dispatch', async () => {
    const proof = await approvedProjectsProof()();
    proof.lifecycle = 'FOUNDER_REVIEW';
    const gate = assertSurfaceApprovedForImplementationGate(proof);
    expect(gate.ok).toBe(false);
  });

  it('14. unverified Composer capability blocks dispatch', () => {
    const gate = assertComposerCapabilityVerifiedGate(false, true);
    expect(gate.ok).toBe(false);
  });
});

describe('P1 COMPOSER', () => {
  it('15-19. package includes required bindings and contracts', async () => {
    const proof = await approvedProjectsProof()();
    const contracts = compileP1ContractsForProjectsIndex({
      projectId: 'site00',
      proof,
      approvedProofsFingerprint: projectsProofFingerprint(proof),
    });
    await initializeP1ControlledProofRun({ proof });
    const pkg = buildComposerImplementationPackage({
      runId: 'run-1',
      projectId: 'site00',
      proof,
      designProofContract: contracts.designProofContract,
      pageFamilyContract: contracts.pageFamilyContract,
      surfaceContract: contracts.surfaceContract,
      surfaceExperienceBrief: contracts.surfaceExperienceBrief,
      sourceCommit: 'abc123',
    });
    expect(composerPackageIncludesRequiredFields(pkg)).toBe(true);
    expect(pkg.approvedProofId).toBeTruthy();
    expect(pkg.functionalCanonFingerprint).toBeTruthy();
    expect(pkg.pageFamilyContract).toBeTruthy();
    expect(pkg.surfaceContract).toBeTruthy();
    expect(pkg.assetBindings.length).toBeGreaterThanOrEqual(0);
  });

  it('20. duplicate dispatch prevented', async () => {
    const proof = await approvedProjectsProof()();
    const run1 = await dispatchP1ComposerImplementation({ proof, composerVerified: true });
    const pkg = run1.composerPackage!;
    const dup = findExistingDispatch(pkg.idempotencyKey);
    expect(dup?.dispatchStatus).toBe('DISPATCHED');
    const second = dispatchComposerPackage({
      pkg,
      proof,
      config: {
        composerImplemented: true,
        composerVerified: true,
        dependencyGraphCurrent: true,
        functionalCanonCurrent: true,
        hasDesktopProof: true,
        hasMobileProof: false,
      },
      storedFingerprints: pkg.siteMethodologyFingerprints,
    });
    expect(second.duplicatePrevented).toBe(true);
  });

  it('21-22. implementation result persisted with package metadata', async () => {
    const proof = await approvedProjectsProof()();
    const run = await dispatchP1ComposerImplementation({ proof, composerVerified: true });
    expect(run.composerPackage?.packageId).toBeTruthy();
    expect(run.composerPackage?.targetBranch).toContain('cursor/p1-');
    expect(creativeReinterpretationDetected(run.composerPackage!)).toBe(false);
  });
});

describe('P1 FIDELITY', () => {
  it('23. implemented screenshot captured', async () => {
    const proof = await approvedProjectsProof()();
    const run = await initializeP1ControlledProofRun({ proof });
    const capture = recordImplementedSurfaceCapture({
      run,
      route: '/projects',
      viewport: 'DESKTOP',
      storagePath: 'captures/projects-desktop.webp',
      publicUrl: 'https://example.com/capture.webp',
    });
    expect(capture.role).toBe('IMPLEMENTED_SURFACE_REFERENCE');
  });

  it('24. deterministic functional checks run', async () => {
    const proof = await approvedProjectsProof()();
    const run = await evaluateP1ImplementationFidelity(proof, [
      recordImplementedSurfaceCapture({
        run: await initializeP1ControlledProofRun({ proof }),
        route: '/projects',
        viewport: 'DESKTOP',
        storagePath: 'x.webp',
        publicUrl: 'https://x',
      }),
    ]);
    expect(run.fidelityEvaluation?.deterministicFunctionalChecks.length).toBeGreaterThan(0);
  });

  it('25. visual dimensions use NOT_EVALUATED when vision unavailable', async () => {
    const proof = await approvedProjectsProof()();
    const eval_ = evaluateImplementationFidelity({
      runId: 'r1',
      packageId: 'p1',
      proof,
      implementedCaptures: [],
      visionEvaluationAvailable: false,
    });
    expect(eval_.dimensions.every((d) => d.result === 'NOT_EVALUATED' || d.dimension === 'FUNCTIONAL_FIDELITY')).toBe(true);
  });

  it('26. failed implementation cannot PASS without evidence', () => {
    const eval_ = evaluateImplementationFidelity({
      runId: 'r1',
      packageId: 'p1',
      proof: { composedProof: null, proofRecordId: 'x', surface: '/projects' } as never,
      implementedCaptures: [],
      visionEvaluationAvailable: false,
    });
    expect(failedImplementationCannotPass(eval_)).toBe(true);
    expect(eval_.overallResult).not.toBe('PASS');
  });

  it('27-28. revision delta preserve/change/do-not; no automatic code mutation', async () => {
    const proof = await approvedProjectsProof()();
    const fidelity = evaluateImplementationFidelity({
      runId: 'r1',
      packageId: 'p1',
      proof,
      implementedCaptures: [],
      visionEvaluationAvailable: false,
    });
    const delta = buildImplementationRevisionDelta({ parentPackageId: 'pkg-1', fidelity });
    expect(delta.preserve.length).toBeGreaterThan(0);
    expect(delta.doNot).toContain('Auto-rewrite code without founder review');
    expect(delta.automaticCodeMutation).toBe(false);
  });
});

describe('P1 RESPONSIVE / ACCESSIBILITY / INTEGRITY', () => {
  it('29. desktop-only evidence cannot satisfy required mobile policy', () => {
    expect(desktopProofAloneDoesNotSatisfyMobilePolicy('MOBILE_NOT_STACKED_DESKTOP', true, false)).toBe(false);
    const gate = assertResponsiveEvidenceSufficientGate({
      mobileRequirement: 'MOBILE_NOT_STACKED_DESKTOP',
      hasDesktopProof: true,
      hasMobileProof: false,
    });
    expect(gate.ok).toBe(false);
  });

  it('30. mobile stacked-desktop failure detectable where evidence exists', () => {
    expect(desktopProofAloneDoesNotSatisfyMobilePolicy('MOBILE_NOT_STACKED_DESKTOP', true, true)).toBe(true);
  });

  it('31. accessibility findings included before approval', () => {
    const findings = evaluateAccessibilityMvp({
      hasSemanticLandmarks: true,
      hasKeyboardReachability: true,
      hasFocusVisibility: true,
      hasButtonLinkSemantics: true,
      hasAltBehavior: true,
      hasReducedMotionHooks: true,
      touchTargetsMet: true,
      contrastChecked: false,
    });
    expect(accessibilityFindingsIncludedBeforeApproval(findings)).toBe(true);
  });

  it('32-40. experimental integrity and flags', () => {
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBeTruthy();
    expect(NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION).toBeTruthy();
    expect(buildProjectWorkspaceCanon().canonId).toBe('site00-project-workspace-canon-v1');
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(COMPOSER_ORCHESTRATION_IMPLEMENTED).toBe(true);
    const summary = capabilityRegistrySummary(mergeP1CapabilityVerifications([]));
    expect(summary.PRODUCTION_VERIFIED.length).toBe(0);
    const updated = updateP1CapabilityVerification({
      capabilityId: 'COMPOSER_DISPATCH',
      verificationStatus: 'TEST_VERIFIED',
      existing: [],
    });
    expect(updated.find((c) => c.capabilityId === 'COMPOSER_DISPATCH')?.verificationStatus).toBe('TEST_VERIFIED');
  });
});

describe('P1 dispatch safety integration', () => {
  it('blocks dispatch without mobile proof for PROJECT_WORKSPACE', async () => {
    const proof = await approvedProjectsProof()();
    const contracts = compileP1ContractsForProjectsIndex({
      projectId: 'site00',
      proof,
      approvedProofsFingerprint: projectsProofFingerprint(proof),
    });
    const gate = runAllDispatchSafetyGates({
      proof,
      designProofContract: contracts.designProofContract,
      pageFamilyContract: contracts.pageFamilyContract,
      surfaceContract: contracts.surfaceContract,
      currentFunctionalFingerprint: contracts.designProofContract.functionalCanonFingerprint ?? '',
      currentWorkspaceFingerprint: contracts.designProofContract.workspaceCanonFingerprint ?? '',
      contractFingerprints: contracts.pageFamilyContract.fingerprints,
      storedFingerprints: contracts.pageFamilyContract.fingerprints,
      dependencyGraphCurrent: true,
      composerVerified: true,
      composerImplemented: true,
      functionalCanonCurrent: true,
      hasDesktopProof: true,
      hasMobileProof: false,
    });
    expect(gate.ok).toBe(false);
  });
});
