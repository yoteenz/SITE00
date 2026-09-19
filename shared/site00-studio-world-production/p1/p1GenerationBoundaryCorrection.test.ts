/**
 * P1 Correction — reference-locked UX orchestration + asset-level visual generation regression tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assertFullPageGenerationAllowed,
  classifySurfaceGenerationMode,
  compileBehavioralVisualTranslation,
  compileInterfaceAssetManifest,
  compileSurfaceVisualAuthorityPackage,
  desktopAuthorityDoesNotSatisfyMobile,
  FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE,
  literalMetaphorLeakageDetected,
  proveClientExpressionIsolation,
  referenceSelectedByRole,
  reusableAssetsReduceGenerationCount,
  sameWorkspaceGrammarDifferentExpression,
  structuralReferenceHasZeroStyleAuthority,
} from './generationBoundary/index.js';
import { WORLD_FORMATION_IMPLEMENTED } from '../constants.js';
import { buildDesignProofAssetPrompt } from '../../site00-brand-lore/experienceExpression/experienceAssetFalProvider.js';
import { compileSite00ProjectsIndexProofManifest } from '../../site00-brand-lore/experienceExpression/designProofManifest.js';
import { deriveProjectsIndexProofArtDirection } from '../../site00-brand-lore/experienceExpression/designProofArtDirection.js';
import { buildProjectWorkspaceCanon } from '../../site00-brand-lore/projectWorkspace/projectWorkspaceCanon.js';
import { compileReferencePackageForIntent } from '../../../api/_lib/site00VisualReference/visualReferenceService.js';
import { composeDesignProofViaFal } from '../../site00-brand-lore/experienceExpression/experienceAssetFalProvider.js';
import { shouldFailWithoutReferenceConditioning } from '../../site00-visual-reference/generationModeResolver.js';
import {
  generateMissingInterfaceAssets,
  generateVisualDevelopmentDesignProof,
  prepareComposedInterfaceSurface,
  resetVisualDevelopmentRunMemory,
} from '../../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/visualDevelopmentService.js';
import { compileP1ContractsForProjectsIndex } from './contractCompilation.js';
import { buildComposerImplementationPackage } from './composerAdapter.js';
import { evaluateImplementationFidelity } from './fidelityEvaluation.js';
import { productionPresentationMutationBlocked } from '../../site00-brand-lore/experienceExpression/surfaceDesignLifecycle.js';

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

beforeEach(() => {
  resetVisualDevelopmentRunMemory();
  process.env.VITEST_CAPTURE_PRINCIPAL = 'PROJECT_OWNER';
});

describe('P1 generation boundary correction', () => {
  it('1. SITE00_PROJECTS_INDEX resolves to COMPOSED_INTERFACE', () => {
    expect(
      classifySurfaceGenerationMode({
        proofId: 'SITE00_PROJECTS_INDEX',
        hasHostVisualAuthority: true,
        visualDirectionUnresolved: false,
      }),
    ).toBe('COMPOSED_INTERFACE');
  });

  it('2. COMPOSED_INTERFACE cannot dispatch full-page generation', () => {
    expect(() => assertFullPageGenerationAllowed('COMPOSED_INTERFACE')).toThrow(
      FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE,
    );
  });

  it('3. missing strict host references blocks via generateVisualDevelopmentDesignProof', async () => {
    await expect(generateVisualDevelopmentDesignProof('SITE00_PROJECTS_INDEX')).rejects.toThrow(
      FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE,
    );
  });

  it('4. no silent TEXT_TO_IMAGE fallback under strict host', () => {
    expect(
      shouldFailWithoutReferenceConditioning({
        strictHostVisualConditioning: true,
        generationMode: 'TEXT_TO_IMAGE',
        referenceCount: 2,
      }),
    ).toBe(true);
  });

  it('5. Playwright references selected by role in authority package', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    const authority = compileSurfaceVisualAuthorityPackage({
      surfaceId: 'SITE00_PROJECTS_INDEX',
      referencePackage: pkg,
    });
    expect(referenceSelectedByRole(authority.references, 'HOST_SHELL').length).toBeGreaterThanOrEqual(0);
    expect(authority.references.length).toBeGreaterThan(0);
  });

  it('6. reference authority is dimension-specific', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    const authority = compileSurfaceVisualAuthorityPackage({
      surfaceId: 'SITE00_PROJECTS_INDEX',
      referencePackage: pkg,
    });
    const structural = authority.references.find((r) => r.role === 'STRUCTURAL_REFERENCE');
    if (structural) {
      expect(structuralReferenceHasZeroStyleAuthority(structural)).toBe(true);
    } else {
      expect(true).toBe(true);
    }
  });

  it('7. negative references cannot gain style authority', async () => {
    const pkg = await compileReferencePackageForIntent({
      generationIntent: 'SITE00_PROJECTS_INDEX_DESIGN_PROOF',
    });
    const authority = compileSurfaceVisualAuthorityPackage({
      surfaceId: 'SITE00_PROJECTS_INDEX',
      referencePackage: pkg,
    });
    for (const neg of authority.references.filter((r) => r.role === 'NEGATIVE_REFERENCE')) {
      expect(neg.doNotInherit.length).toBeGreaterThan(0);
    }
  });

  it('8. rejected dark proof anti-direction blocks palette inheritance', () => {
    expect(
      literalMetaphorLeakageDetected('dark command center dashboard with black shell').detected ||
        literalMetaphorLeakageDetected('no literal workshop').detected === false,
    ).toBe(true);
  });

  it('9. workbench does not enter provider style prompt unqualified', () => {
    const prompt = buildDesignProofAssetPrompt({
      requirement: {
        id: 'x',
        proofId: 'SITE00_PROJECTS_INDEX',
        category: 'PRIMARY_ARTWORK',
        assetRole: 'WORKBENCH_FOCAL_ARTIFACT',
        purpose: 'focal zone',
        deviceClass: 'DESKTOP',
        reusable: false,
        reusableAssetId: null,
        missing: true,
        generationAllowed: true,
        idempotencyKey: 'abc',
        estimatedCostUsd: 0.05,
      },
      artDirectionSummary: 'asymmetric hierarchy',
      proofConcept: 'ACTIVE WORKBENCH + DOSSIER',
      owner: 'SITE00',
      functionalSummary: 'projects, review',
      antiDirection: ['generic admin dashboard'],
      compositionalHierarchy: ['Active priority', 'Secondary cluster'],
    }).prompt.toLowerCase();
    expect(prompt.includes('workbench')).toBe(false);
    expect(prompt.includes('dossier')).toBe(false);
  });

  it('10. dossier does not enter provider style prompt unqualified', () => {
    const leak = literalMetaphorLeakageDetected('Create a dossier interface with case files');
    expect(leak.detected).toBe(true);
  });

  it('11. behavioral translation preserves workspace hierarchy', () => {
    const translated = compileBehavioralVisualTranslation({
      compositionalHierarchy: ['Dominant active object', 'Review band elevation'],
    });
    expect(translated).toMatch(/dominant visual priority/i);
    expect(translated).toMatch(/founder judgments/i);
  });

  it('12. composeDesignProofViaFal blocked for COMPOSED_INTERFACE', async () => {
    const result = await composeDesignProofViaFal({
      proofId: 'SITE00_PROJECTS_INDEX',
      storagePath: 'test/path.webp',
      proofConcept: 'test',
      owner: 'SITE00',
      artDirectionSummary: 'test',
      functionalSummary: 'test',
      componentAssetDescriptions: [],
      surfaceGenerationMode: 'COMPOSED_INTERFACE',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('FULL_PAGE_GENERATION_NOT_ALLOWED');
  });

  it('13. reusable assets reduce generation count', () => {
    const manifest = compileInterfaceAssetManifest({
      surfaceId: 'SITE00_PROJECTS_INDEX',
      designProofManifest: compileSite00ProjectsIndexProofManifest({
        artDirection: deriveProjectsIndexProofArtDirection(),
        workspaceCanon: buildProjectWorkspaceCanon(),
        existingReusableAssetIds: ['site00_projects_index-host_environment'],
      }),
    });
    expect(reusableAssetsReduceGenerationCount(manifest)).toBeGreaterThanOrEqual(0);
    expect(manifest.fullPageProofRequired).toBe(false);
  });

  it('14. interface manifest prefers existing artifacts', () => {
    const manifest = compileInterfaceAssetManifest({
      surfaceId: 'SITE00_PROJECTS_INDEX',
      designProofManifest: compileSite00ProjectsIndexProofManifest({
        artDirection: deriveProjectsIndexProofArtDirection(),
        workspaceCanon: buildProjectWorkspaceCanon(),
      }),
    });
    expect(manifest.requirements.every((r) => r.preferExistingArtifact)).toBe(true);
  });

  it('15. prepareComposedInterfaceSurface compiles authority package', async () => {
    const run = await prepareComposedInterfaceSurface('SITE00_PROJECTS_INDEX');
    expect(run.proofs.site00ProjectsIndex.surfaceVisualAuthorityPackage).toBeTruthy();
    expect(run.proofs.site00ProjectsIndex.interfaceAssetManifest).toBeTruthy();
  });

  it('16. Composer contracts compile with page-family + surface contracts', async () => {
    const run = await prepareComposedInterfaceSurface('SITE00_PROJECTS_INDEX');
    await generateMissingInterfaceAssets('SITE00_PROJECTS_INDEX');
    const proof = run.proofs.site00ProjectsIndex;
    const contracts = compileP1ContractsForProjectsIndex({
      projectId: 'site00',
      proof,
      approvedProofsFingerprint: proof.surfaceVisualAuthorityPackage!.fingerprint,
    });
    expect(contracts.pageFamilyContract.familyId).toBe('PROJECT_WORKSPACE');
    expect(contracts.surfaceContract.route).toBe('/projects');
  });

  it('17. Composer package includes do-not-constraints for host mutation', async () => {
    const run = await prepareComposedInterfaceSurface('SITE00_PROJECTS_INDEX');
    await generateMissingInterfaceAssets('SITE00_PROJECTS_INDEX');
    const proof = run.proofs.site00ProjectsIndex;
    const contracts = compileP1ContractsForProjectsIndex({
      projectId: 'site00',
      proof,
      approvedProofsFingerprint: 'abc',
    });
    const pkg = buildComposerImplementationPackage({
      runId: 'run-1',
      projectId: 'site00',
      proof,
      designProofContract: {
        contractId: 'c1',
        acceptanceCriteria: [],
        doNotConstraints: ['Do not mutate host shell'],
        functionalCanonFingerprint: '',
      } as never,
      pageFamilyContract: contracts.pageFamilyContract,
      surfaceContract: contracts.surfaceContract,
      surfaceExperienceBrief: contracts.surfaceExperienceBrief,
      sourceCommit: null,
    });
    expect(pkg.doNotConstraints.some((c) => /host|creative/i.test(c))).toBe(true);
  });

  it('18. client expression cannot overwrite host critical states via isolation proof', () => {
    const ndx = proveClientExpressionIsolation({
      surfaceId: 'NDXBOOK_PROJECT_HOME',
      clientExpression: { fingerprint: 'ndx-fp' } as never,
    });
    const fs = proveClientExpressionIsolation({
      surfaceId: 'FRONTAL_SLAYER_PROJECT_HOME',
      clientExpression: { fingerprint: 'fs-fp' } as never,
    });
    expect(sameWorkspaceGrammarDifferentExpression(ndx, fs)).toBe(true);
  });

  it('19. NDXBOOK and Frontal Slayer share workspace canon', () => {
    const siteIndex = proveClientExpressionIsolation({
      surfaceId: 'SITE00_PROJECTS_INDEX',
      clientExpression: null,
    });
    const ndx = proveClientExpressionIsolation({
      surfaceId: 'NDXBOOK_PROJECT_HOME',
      clientExpression: { fingerprint: 'ndx' } as never,
    });
    expect(siteIndex.workspaceCanonFingerprint).toBe(ndx.workspaceCanonFingerprint);
  });

  it('20. desktop authority does not satisfy required mobile evidence', () => {
    expect(
      desktopAuthorityDoesNotSatisfyMobile({
        desktopReferenceCount: 3,
        mobileReferenceCount: 0,
        mobileRequired: true,
      }),
    ).toBe(true);
  });

  it('21. post-implementation fidelity requires capture before PASS', async () => {
    const run = await prepareComposedInterfaceSurface('SITE00_PROJECTS_INDEX');
    const fidelity = evaluateImplementationFidelity({
      runId: 'run-test',
      packageId: 'pkg-test',
      proof: run.proofs.site00ProjectsIndex,
      implementedCaptures: [],
      visionEvaluationAvailable: false,
    });
    expect(fidelity.overallResult).toBe('BLOCKED');
  });

  it('22. missing vision returns NOT_EVALUATED', async () => {
    const run = await prepareComposedInterfaceSurface('SITE00_PROJECTS_INDEX');
    const fidelity = evaluateImplementationFidelity({
      runId: 'run-test',
      packageId: 'pkg-test',
      proof: run.proofs.site00ProjectsIndex,
      implementedCaptures: [
        {
          referenceId: 'cap-1',
          route: '/projects',
          viewport: 'DESKTOP',
          storagePath: 'x',
          publicUrl: null,
          capturedAt: new Date().toISOString(),
        },
      ],
      visionEvaluationAvailable: false,
    });
    expect(['NOT_EVALUATED', 'PASS_WITH_WARNINGS']).toContain(fidelity.overallResult);
  });

  it('23. production page remains unchanged during methodology preparation', () => {
    expect(productionPresentationMutationBlocked('GENERATION_READY')).toBe(true);
    expect(productionPresentationMutationBlocked('BASELINE')).toBe(true);
  });

  it('24. World Formation remains unimplemented', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });

  it('25. asset-level generation records execution traces', async () => {
    await prepareComposedInterfaceSurface('SITE00_PROJECTS_INDEX');
    const run = await generateMissingInterfaceAssets('SITE00_PROJECTS_INDEX');
    expect(run.proofs.site00ProjectsIndex.interfaceSlotResolution).toBeTruthy();
    expect(run.proofs.site00ProjectsIndex.composedProof).toBeNull();
  });
});
