/**
 * Experiment E visual development before implementation — sprint tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  assertSurfaceApprovedForImplementation,
  productionPresentationMutationBlocked,
  founderApprovalMutatesProductionUi,
  founderApprovalTriggersComposerAutomatically,
  visualDevelopmentSubstantive,
  AUTHORED_VISUAL_EXPRESSION_REQUIRED,
} from './experienceExpression/surfaceDesignLifecycle.js';
import {
  compileSite00ProjectsIndexProofManifest,
  compileNdxbookProjectHomeProofManifest,
  manifestCompileGeneratesZeroFalRequests,
  pageVisitGeneratesZeroFalRequests,
  buildGeneratesZeroFalRequests,
  projectsIndexDoesNotInheritNdxbookExpression,
} from './experienceExpression/designProofManifest.js';
import {
  deriveProjectsIndexProofArtDirection,
  deriveNdxbookProjectHomeProofArtDirection,
} from './experienceExpression/designProofArtDirection.js';
import {
  evaluateDesignProofQA,
  martianMonoNotNdxbookClientTypography,
  historicalTraitRequiresProvenance,
  parentProofRemainsImmutable,
} from './experienceExpression/designProofQA.js';
import {
  orchestrationRequiresValidContract,
  composerReceivesApprovedVisualReference,
  composerSubstitutionProhibited,
} from './experienceExpression/designProofImplementationContract.js';
import {
  cssFallbackBlocked,
  EXPERIENCE_FAL_MODEL,
  EXPERIENCE_FAL_PROVIDER,
} from './experienceExpression/experienceAssetFalProvider.js';
import { VISUAL_DEVELOPMENT_ROUTE } from './experienceExpression/designProofTypes.js';
import { buildProjectWorkspaceCanon } from './projectWorkspace/projectWorkspaceCanon.js';
import { compileNdxbookClientExpressionProfile } from './projectWorkspace/clientProjectExpressionProfile.js';
import { EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION, EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION } from './experienceExpression/constants.js';
import { NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION } from './founderCreativeAppetite/constants.js';
import { assertCreativeAppetiteNotInjectedIntoFrozenExperiment, shouldIncludeCreativeAppetiteInFormation } from './founderCreativeAppetite/experimentExclusion.js';
import { worldFormationGenerationCountZero, WORLD_FORMATION_IMPLEMENTED } from './worldFormation/futureContracts.js';
import {
  compileVisualDevelopmentProofManifest,
  generateVisualDevelopmentDesignProof,
  getProjectWorkspaceVisualDevelopmentRun,
  orchestrateVisualDevelopmentImplementation,
  prepareVisualDevelopmentImplementation,
  refreshProjectWorkspaceVisualDevelopmentRun,
  resetVisualDevelopmentRunMemory,
  setVisualDevelopmentProofJudgment,
} from '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/visualDevelopmentService.js';
import { buildConceptFirstHeroBrief } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';

vi.mock('../../api/_lib/site00BrandLore/loreService.js', () => ({
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

const PROJECTS_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectsPage.tsx'), 'utf8');
const PROJECT_DETAIL = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectDetailPage.tsx'), 'utf8');
const ROUTES = readFileSync(join(process.cwd(), 'src/routes/Site00Routes.tsx'), 'utf8');
const VISUAL_DEV_PAGE = readFileSync(
  join(process.cwd(), 'src/site00/pages/ProjectWorkspaceVisualDevelopmentPage.tsx'),
  'utf8',
);

beforeEach(() => {
  resetVisualDevelopmentRunMemory();
});

describe('Visual development gate sprint', () => {
  it('1. Live Projects page not visually redesigned before approval', () => {
    expect(PROJECTS_PAGE).toContain('PROJECT INDEX');
    expect(PROJECTS_PAGE).toContain('site00-project-index-list');
    expect(PROJECTS_PAGE).not.toContain('ACTIVE PRODUCTION FLOOR');
  });

  it('2. Live NDXBOOK Project Home not visually redesigned before approval', () => {
    expect(PROJECT_DETAIL).toContain('site00-project-command');
    expect(PROJECT_DETAIL).not.toContain('Site00ProjectWorkspace');
  });

  it('3. Premature presentation restored; methodology infrastructure remains', () => {
    expect(buildProjectWorkspaceCanon().canonId).toBe('site00-project-workspace-canon-v1');
    expect(PROJECTS_PAGE).not.toContain('ProjectWorkspaceEntry');
  });

  it('4. Dedicated visual-development route exists', () => {
    expect(VISUAL_DEVELOPMENT_ROUTE).toBe('/projects/ndxbook/experience-expression/visual-development');
    expect(ROUTES).toContain('projectExperimentEVisualDevelopment');
    expect(VISUAL_DEV_PAGE).toContain('ProjectWorkspaceVisualDevelopmentReview');
  });

  it('5-6. Separate proof records using ProjectWorkspaceCanon', async () => {
    const run = await refreshProjectWorkspaceVisualDevelopmentRun();
    expect(run.proofs.site00ProjectsIndex.proofId).toBe('SITE00_PROJECTS_INDEX');
    expect(run.proofs.ndxbookProjectHome.proofId).toBe('NDXBOOK_PROJECT_HOME');
    expect(run.workspaceCanon.canonId).toBeTruthy();
  });

  it('7-8. Only NDXBOOK proof receives client expression; index does not inherit', async () => {
    const run = await refreshProjectWorkspaceVisualDevelopmentRun();
    expect(run.proofs.ndxbookProjectHome.clientExpression).not.toBeNull();
    expect(run.proofs.site00ProjectsIndex.clientExpression).toBeNull();
    const idxArt = deriveProjectsIndexProofArtDirection();
    expect((idxArt as { clientExpressionApplied: boolean }).clientExpressionApplied).toBe(false);
    const ndxArt = deriveNdxbookProjectHomeProofArtDirection({
      clientExpression: compileNdxbookClientExpressionProfile(null),
    });
    expect((ndxArt as { clientExpressionApplied: boolean }).clientExpressionApplied).toBe(true);
    const idxManifest = compileSite00ProjectsIndexProofManifest({
      artDirection: idxArt,
      workspaceCanon: buildProjectWorkspaceCanon(),
    });
    const ndxManifest = compileNdxbookProjectHomeProofManifest({
      artDirection: ndxArt,
      workspaceCanon: buildProjectWorkspaceCanon(),
      clientExpression: compileNdxbookClientExpressionProfile(null),
    });
    expect(projectsIndexDoesNotInheritNdxbookExpression(idxManifest, ndxManifest)).toBe(true);
  });

  it('9-12. Zero FAL on page visit, manifest compile, build', () => {
    expect(pageVisitGeneratesZeroFalRequests()).toBe(true);
    expect(manifestCompileGeneratesZeroFalRequests()).toBe(true);
    expect(buildGeneratesZeroFalRequests()).toBe(true);
  });

  it('13-15. Generate invokes FAL path; failure blocks ready; no CSS fallback', async () => {
    expect(EXPERIENCE_FAL_PROVIDER).toBe('fal');
    expect(EXPERIENCE_FAL_MODEL).toContain('fal-ai');
    expect(cssFallbackBlocked()).toBe(true);
    const run = await generateVisualDevelopmentDesignProof('SITE00_PROJECTS_INDEX');
    expect(run.accounting.falRequests).toBeGreaterThan(0);
    expect(run.proofs.site00ProjectsIndex.composedProof).not.toBeNull();
  });

  it('16-20. Complete composed image with storage, receipt, lineage', async () => {
    const run = await generateVisualDevelopmentDesignProof('NDXBOOK_PROJECT_HOME');
    const proof = run.proofs.ndxbookProjectHome;
    expect(proof.composedProof?.storagePath).toContain('composed-desktop-proof');
    expect(proof.generationReceipts.length).toBeGreaterThan(0);
    expect(proof.generationReceipts[0]?.lineageKey).toBeTruthy();
  });

  it('21. Visual-development assets non-production by default', async () => {
    const run = await generateVisualDevelopmentDesignProof('SITE00_PROJECTS_INDEX');
    for (const asset of run.proofs.site00ProjectsIndex.generatedAssets) {
      expect(asset.productionState).toBe('VISUAL_DEVELOPMENT');
    }
  });

  it('22-23. Approval does not mutate production UI or trigger Composer', () => {
    expect(founderApprovalMutatesProductionUi()).toBe(false);
    expect(founderApprovalTriggersComposerAutomatically()).toBe(false);
  });

  it('24-27. Prepare/orchestrate gates and blockers', async () => {
    await expect(prepareVisualDevelopmentImplementation('SITE00_PROJECTS_INDEX')).rejects.toThrow();
    const blocked = assertSurfaceApprovedForImplementation('GENERATION_READY');
    expect(blocked.allowed).toBe(false);
    expect(productionPresentationMutationBlocked('DESIGN_PROOF_READY')).toBe(true);

    await generateVisualDevelopmentDesignProof('SITE00_PROJECTS_INDEX');
    await setVisualDevelopmentProofJudgment({
      proofId: 'SITE00_PROJECTS_INDEX',
      judgment: 'LOVE_THE_DIRECTION',
    });
    const run = await prepareVisualDevelopmentImplementation('SITE00_PROJECTS_INDEX');
    const contract = run.proofs.site00ProjectsIndex.implementationContract;
    expect(orchestrationRequiresValidContract(contract)).toBe(true);
    expect(composerReceivesApprovedVisualReference(contract!)).toBe(true);
    expect(composerSubstitutionProhibited(contract!)).toBe(true);
    const orch = await orchestrateVisualDevelopmentImplementation('SITE00_PROJECTS_INDEX');
    expect(orch.orchestrationPackageId).toContain('orch-');
  });

  it('28-33. Substantive gate flags generic/card/workbench/dossier failures', () => {
    const fail = visualDevelopmentSubstantive({
      mostlyText: true,
      mostlyBorderedRectangles: true,
      resemblesCurrentProductionWithRenamedSections: true,
      artworkTinyDecorationOnly: true,
      noGeneratedAssetMateriallyAffectsDesign: true,
      equalWeightRegions: true,
      saasDashboardResemblance: true,
      adminPortalResemblance: true,
      workbenchTerminologyOnly: true,
      dossierTerminologyOnly: true,
      ndxbookNameOnlyRecognition: true,
      site00HostRecognitionLost: true,
      literalWorkbenchImageryDominates: true,
      literalCaseDossierImageryDominates: true,
      generatedAssetCount: 0,
      composedImagePresent: false,
      authoredVisualExpressionRequired: AUTHORED_VISUAL_EXPRESSION_REQUIRED,
    });
    expect(fail.passes).toBe(false);
    expect(fail.failures.length).toBeGreaterThan(5);
  });

  it('34-36. Typography and naming guards', () => {
    expect(martianMonoNotNdxbookClientTypography('Martian Mono')).toBe(false);
    expect(martianMonoNotNdxbookClientTypography('Experimental Grotesk')).toBe(true);
    expect(historicalTraitRequiresProvenance('lime accent', null)).toBe(false);
    expect(historicalTraitRequiresProvenance('neutral spacing', null)).toBe(true);
    expect(compileNdxbookClientExpressionProfile(null).brandId).toContain('ndxbook');
  });

  it('37-39. Independent approval and revision lineage', async () => {
    await generateVisualDevelopmentDesignProof('SITE00_PROJECTS_INDEX');
    await setVisualDevelopmentProofJudgment({
      proofId: 'SITE00_PROJECTS_INDEX',
      judgment: 'LOVE_THE_DIRECTION',
    });
    await setVisualDevelopmentProofJudgment({
      proofId: 'NDXBOOK_PROJECT_HOME',
      judgment: 'NOT_THE_DIRECTION',
    });
    const run = (await getProjectWorkspaceVisualDevelopmentRun())!;
    expect(run.proofs.site00ProjectsIndex.lifecycle).toBe('APPROVED_FOR_IMPLEMENTATION');
    expect(run.proofs.ndxbookProjectHome.lifecycle).toBe('REJECTED');
    expect(parentProofRemainsImmutable()).toBe(true);
  });

  it('40-41. Fidelity evaluation NOT_EVALUATED when vision unavailable', () => {
    const qa = evaluateDesignProofQA({
      visionEvaluationAvailable: false,
      generatedAssetCount: 3,
      composedImagePresent: true,
      generationFailed: false,
      proofId: 'SITE00_PROJECTS_INDEX',
    });
    expect(qa.overallResult).toBe('NOT_EVALUATED');
  });

  it('42-45. Experimental integrity', () => {
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBe(1);
    expect(EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION).toBe(2);
    expect(
      shouldIncludeCreativeAppetiteInFormation({
        experimentId: 'ndxbook-six-concept-hero-range',
        intelligenceSnapshotVersion: EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION,
      }),
    ).toBe(false);
    expect(() =>
      assertCreativeAppetiteNotInjectedIntoFrozenExperiment(
        JSON.stringify({ experimentId: 'ndxbook-six-concept-hero-range', founderCreativeAppetite: { v: 1 } }),
      ),
    ).toThrow();
    expect(buildConceptFirstHeroBrief).toBeDefined();
    expect(worldFormationGenerationCountZero()).toBe(0);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });

  it('manifest compile is founder-triggered path only — no auto generation on refresh', async () => {
    const run = await compileVisualDevelopmentProofManifest('SITE00_PROJECTS_INDEX');
    expect(run.proofs.site00ProjectsIndex.manifest?.expectedFalCalls).toBeGreaterThan(0);
    expect(run.proofs.site00ProjectsIndex.composedProof).toBeNull();
  });

  it('contract includes approved proof image reference', async () => {
    await generateVisualDevelopmentDesignProof('NDXBOOK_PROJECT_HOME');
    await setVisualDevelopmentProofJudgment({
      proofId: 'NDXBOOK_PROJECT_HOME',
      judgment: 'LOVE_THE_DIRECTION',
    });
    const run = await prepareVisualDevelopmentImplementation('NDXBOOK_PROJECT_HOME');
    const contract = run.proofs.ndxbookProjectHome.implementationContract;
    expect(contract?.approvedDesignProofStoragePath).toContain('composed');
    expect(contract?.approvedDesignProofFingerprint).toBeTruthy();
  });

  it('component assets alone cannot satisfy DESIGN_PROOF_READY without composed image', async () => {
    const run = await compileVisualDevelopmentProofManifest('SITE00_PROJECTS_INDEX');
    expect(run.proofs.site00ProjectsIndex.lifecycle).toBe('GENERATION_READY');
    expect(run.proofs.site00ProjectsIndex.composedProof).toBeNull();
  });
});
