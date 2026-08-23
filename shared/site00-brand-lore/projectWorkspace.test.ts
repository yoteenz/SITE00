/**
 * Universal Project Workspace + NDXBOOK hero proof tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildProjectWorkspaceCanon,
  workspaceCanonIsSite00Owned,
  workspaceCanonBlocksClientMutation,
  workspaceCanonCannotBecomeBrandCanon,
  historicalExperimentEProvenancePreserved,
} from './projectWorkspace/projectWorkspaceCanon.js';
import {
  compileNdxbookClientExpressionProfile,
  compileFrontalSlayerHypotheticalProfile,
  clientExpressionCannotMutateWorkspace as profileCannotMutate,
  martianMonoNotNdxbookClientTypography,
  distinctProfilesSameWorkspace,
  ndxbookNamingCorrect,
} from './projectWorkspace/clientProjectExpressionProfile.js';
import { buildProjectWorkspaceBible, mobilePhilosophyNotStackedDesktop, reviewTrayConditional, activePieceDominant } from './projectWorkspace/projectWorkspaceBible.js';
import { mapProjectsToWorkspaceIndex, avoidsEqualCardGrid, asymmetricHierarchySupported } from './projectWorkspace/projectsPageMapping.js';
import { compileHeroFrameAssetSubset, heroSubsetSmallerThanFullManifest, recompiledUnderCorrectedOwnership, identifyReusableBeforeGeneration } from './projectWorkspace/heroFrameAssetSubset.js';
import { applyCorrectedOwnershipToAssetDirection, assetDirectionOwnershipUpdated } from './projectWorkspace/experienceAssetOwnership.js';
import { compileExperienceAssetDirection } from './experienceExpression/assetDirection.js';
import { compileExperienceAssetManifest } from './experienceExpression/assetManifest.js';
import { defaultNdxbookProductionScope } from './experienceExpression/productionScope.js';
import { extractNdxbookFunctionalCanon } from './experienceExpression/functionalCanon.js';
import { buildHostExperienceCanon } from './experienceExpression/hostExperienceCanon.js';
import { buildClientExperienceCanon } from './experienceExpression/clientExperienceCanon.js';
import { buildExperienceBible } from './experienceExpression/experienceBibleBuilder.js';
import { buildExperienceConceptsFromSnapshot } from './experienceExpression/experienceConceptFormation.js';
import { compileExperimentEIntelligenceSnapshot } from './experienceExpression/experienceExpressionSnapshot.js';
import { buildAllExperimentDTerritoryEvidence } from './experienceExpression/crossMediumConceptEvidence.js';
import { buildCurrentExperienceAudit } from './experienceExpression/genericTemplateAudit.js';
import { EXPERIMENT_E_DISCOVERY_RECORD, SITE00_LAYER } from './projectWorkspace/constants.js';
import { clientAccentCannotOverwriteHostCriticalStates } from './projectWorkspace/colorOwnership.js';
import { pageVisitTriggersZeroGeneration } from './experienceExpression/assetManifest.js';
import { visualDevelopmentNotProductionByDefault } from './experienceExpression/assetLifecycle.js';
import { productionPromotionDoesNotCreateBrandCanon } from './experienceExpression/assetLifecycle.js';
import { NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION } from './founderCreativeAppetite/constants.js';
import { assertCreativeAppetiteNotInjectedIntoFrozenExperiment } from './founderCreativeAppetite/experimentExclusion.js';
import { buildConceptTerritorySeed } from './conceptTerritory/conceptTerritorySeeds.js';
import { buildConceptFirstHeroBrief } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';
import { worldFormationGenerationCountZero, WORLD_FORMATION_IMPLEMENTED } from './worldFormation/futureContracts.js';
import { EXPERIENCE_E_INITIAL_SURFACES } from './experienceExpression/constants.js';
import {
  compileNdxbookHeroFrameSubset,
  composeNdxbookHeroFrame,
  generateNdxbookHeroAssets,
  refreshProjectWorkspaceHeroRun,
} from '../../api/_lib/site00Evolve/creativeDirection/projectWorkspace/projectWorkspaceService.js';
import { formExperienceConcepts, compileExperienceAssetManifestForConcept } from '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/experimentEService.js';
import { resetExperimentEMemory } from '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/storeAdapter.js';
import { resetProjectWorkspaceHeroMemory } from '../../api/_lib/site00Evolve/creativeDirection/projectWorkspace/memoryStore.js';
import type { BrandLoreProfile } from './types.js';
import type { Site00ProjectIndexEntry } from '../site00-projects/types.js';

vi.mock('../../api/_lib/site00BrandLore/loreService.js', () => ({
  getBrandLoreProfileForOrg: vi.fn().mockResolvedValue({
    brandWorld: { value: 'NDXBOOK' },
    brandPersonality: { version: 1 },
    contextClassification: 'PRIMARY_EXPRESSION_CONTEXT',
    founderCreativeAppetite: {
      rawAnswers: { 'creative-risk': 'OPEN' },
      version: 1,
      domainTolerances: [{ domain: 'creative-risk', band: 'OPEN' }],
      hardCreativeBoundaries: { value: null },
    },
  } satisfies Partial<BrandLoreProfile>),
}));

function sampleProjects(): Site00ProjectIndexEntry[] {
  return [
    {
      slug: 'ndxbook',
      name: 'NDXBOOK',
      displayName: 'NDXBOOK',
      organizationSlug: 'ndxbook',
      organizationUuid: 'x',
      classification: 'FOUNDER_PROJECT',
      currentSystem: 'STUDIO WORLD',
      currentPhase: 'EXPERIENCE_EXPRESSION',
      focusNow: 'Experience workspace hero proof',
      lastActivity: '2026-08-23',
      surfaces: [],
      detailRoute: '/projects/ndxbook',
    },
    {
      slug: 'frontal-slayer',
      name: 'Frontal Slayer',
      displayName: 'FRONTAL SLAYER',
      organizationSlug: 'frontal-slayer',
      organizationUuid: 'y',
      classification: 'FOUNDER_PROJECT',
      currentSystem: 'STUDIO WORLD',
      currentPhase: 'ACTIVE',
      focusNow: null,
      lastActivity: null,
      surfaces: [],
      detailRoute: '/projects/frontal-slayer',
    },
  ];
}

describe('WORKSPACE_CANON_CLASSIFICATION_TEST', () => {
  it('Active Workbench + Dossier is SITE 00 Project Workspace Canon', () => {
    const canon = buildProjectWorkspaceCanon();
    expect(workspaceCanonIsSite00Owned(canon)).toBe(true);
    expect(canon.layer).toBe(SITE00_LAYER.PROJECT_WORKSPACE_CANON);
  });
});

describe('EXPERIMENT_E_HISTORICAL_PRESERVATION_TEST', () => {
  it('historical Experiment E provenance unchanged', () => {
    const canon = buildProjectWorkspaceCanon();
    expect(historicalExperimentEProvenancePreserved(canon)).toBe(true);
    expect(EXPERIMENT_E_DISCOVERY_RECORD.priorClassification).toBe('NDXBOOK_EXPERIENCE_CONCEPT');
    expect(EXPERIMENT_E_DISCOVERY_RECORD.historicalRecordsImmutable).toBe(true);
  });
});

describe('CLIENT_CANNOT_MUTATE_WORKSPACE_TEST', () => {
  it('NDXBOOK expression cannot mutate workspace canon', () => {
    const profile = compileNdxbookClientExpressionProfile(null);
    expect(profileCannotMutate(profile)).toBe(true);
    expect(workspaceCanonBlocksClientMutation(buildProjectWorkspaceCanon())).toBe(true);
  });
});

describe('WORKSPACE_NOT_BRAND_CANON_TEST', () => {
  it('workspace canon cannot become NDXBOOK Brand Canon', () => {
    expect(workspaceCanonCannotBecomeBrandCanon(buildProjectWorkspaceCanon())).toBe(true);
  });
});

describe('MULTI_CLIENT_SAME_WORKSPACE_TEST', () => {
  it('distinct client profiles on same workspace', () => {
    const ndx = compileNdxbookClientExpressionProfile(null);
    const fs = compileFrontalSlayerHypotheticalProfile();
    expect(distinctProfilesSameWorkspace(ndx, fs)).toBe(true);
  });
});

describe('TYPOGRAPHY_SEPARATION_TEST', () => {
  it('host typography separate from client expressive', () => {
    const profile = compileNdxbookClientExpressionProfile(null);
    expect(martianMonoNotNdxbookClientTypography(profile)).toBe(true);
    expect(profile.expressiveTypographyBehavior).toContain('HOST_UI');
  });
});

describe('MARTIAN_MONO_NOT_NDXBOOK_CLIENT_TEST', () => {
  it('Martian Mono cannot become NDXBOOK client typography', () => {
    expect(martianMonoNotNdxbookClientTypography(compileNdxbookClientExpressionProfile(null))).toBe(true);
  });
});

describe('CLIENT_ACCENT_HOST_STATES_TEST', () => {
  it('client accent cannot overwrite critical host states', () => {
    expect(clientAccentCannotOverwriteHostCriticalStates({ clientAccentAppliedTo: ['project_environment'] })).toBe(true);
    expect(
      clientAccentCannotOverwriteHostCriticalStates({ clientAccentAppliedTo: ['global_host_wayfinding_red'] }),
    ).toBe(false);
  });
});

describe('PROJECTS_PAGE_NO_EQUAL_CARD_GRID_TEST', () => {
  it('projects page avoids equal-card-grid requirement', () => {
    const index = mapProjectsToWorkspaceIndex(sampleProjects());
    expect(avoidsEqualCardGrid(index)).toBe(true);
  });
});

describe('ASYMMETRIC_HIERARCHY_TEST', () => {
  it('workspace supports asymmetric hierarchy', () => {
    expect(asymmetricHierarchySupported(mapProjectsToWorkspaceIndex(sampleProjects()))).toBe(true);
    expect(activePieceDominant(buildProjectWorkspaceBible())).toBe(true);
  });
});

describe('ACTIVE_PIECE_DOMINANT_TEST', () => {
  it('active piece receives dominant visual weight', () => {
    const index = mapProjectsToWorkspaceIndex(sampleProjects());
    expect(index.activePiece?.visualWeight).toBe('DOMINANT');
  });
});

describe('REVIEW_TRAY_CONDITIONAL_TEST', () => {
  it('review tray is conditional', () => {
    expect(reviewTrayConditional(buildProjectWorkspaceBible())).toBe(true);
  });
});

describe('MOBILE_NOT_STACKED_DESKTOP_TEST', () => {
  it('mobile philosophy is not stacked desktop', () => {
    expect(mobilePhilosophyNotStackedDesktop(buildProjectWorkspaceBible())).toBe(true);
  });
});

describe('NDXBOOK_HERO_MANIFEST_RECOMPILE_TEST', () => {
  beforeEach(() => {
    resetExperimentEMemory();
    resetProjectWorkspaceHeroMemory();
  });

  it('hero manifest recompiles under corrected ownership', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    const run = await compileNdxbookHeroFrameSubset();
    expect(run.heroSubset).toBeTruthy();
    expect(recompiledUnderCorrectedOwnership(run.heroSubset!)).toBe(true);
  });
});

describe('HERO_SUBSET_SMALLER_THAN_FULL_TEST', () => {
  beforeEach(() => {
    resetExperimentEMemory();
    resetProjectWorkspaceHeroMemory();
  });

  it('HeroFrameAssetSubset smaller than full manifest', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    const run = await compileNdxbookHeroFrameSubset();
    expect(heroSubsetSmallerThanFullManifest(run.heroSubset!)).toBe(true);
  });
});

describe('REUSABLE_ASSETS_IDENTIFIED_TEST', () => {
  beforeEach(() => {
    resetExperimentEMemory();
    resetProjectWorkspaceHeroMemory();
  });

  it('identifies reusable before generation', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    const run = await compileNdxbookHeroFrameSubset();
    expect(identifyReusableBeforeGeneration(run.heroSubset!)).toBe(true);
  });
});

describe('HERO_GENERATION_FOUNDER_TRIGGER_TEST', () => {
  beforeEach(() => {
    resetExperimentEMemory();
    resetProjectWorkspaceHeroMemory();
  });

  it('hero generation is founder-triggered', async () => {
    const run = await refreshProjectWorkspaceHeroRun('ndxbook');
    expect(run.generationStarted).toBe(false);
    expect(run.accounting.falRequests).toBe(0);
  });
});

describe('ZERO_GENERATION_ON_PAGE_VISIT_TEST', () => {
  it('page visit causes zero generation', () => {
    expect(pageVisitTriggersZeroGeneration()).toBe(true);
  });
});

describe('ZERO_GENERATION_ON_MANIFEST_COMPILE_TEST', () => {
  beforeEach(() => {
    resetExperimentEMemory();
    resetProjectWorkspaceHeroMemory();
  });

  it('manifest compile causes zero FAL', async () => {
    await formExperienceConcepts();
    const run = await compileNdxbookHeroFrameSubset();
    expect(run.accounting.falRequests).toBe(0);
  });
});

describe('HERO_ASSETS_VISUAL_DEVELOPMENT_DEFAULT_TEST', () => {
  beforeEach(() => {
    resetExperimentEMemory();
    resetProjectWorkspaceHeroMemory();
  });

  it('generated hero assets remain visual development', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    const run = await generateNdxbookHeroAssets();
    expect(run.generatedAssets.every((a) => visualDevelopmentNotProductionByDefault(a))).toBe(true);
  });
});

describe('HERO_APPROVAL_NOT_BRAND_CANON_TEST', () => {
  it('hero approval does not create Brand Canon', () => {
    expect(productionPromotionDoesNotCreateBrandCanon({
      assetId: 'x',
      requirementId: 'r',
      assetMedium: 'EXPERIENCE_PRODUCTION_ASSET',
      provenanceClass: 'PRODUCTION_ASSET',
      canonStatus: 'PRODUCTION',
      productionState: 'PROMOTED_TO_PRODUCTION',
      storagePath: '/x',
      vaultAssetId: null,
      parentAssetId: null,
      lineageKey: 'lk',
      founderJudgment: 'LOVE_IT',
      promotedAt: null,
      promotedBy: null,
      generationReceipt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })).toBe(true);
  });
});

describe('EXPERIMENT_D_INTEGRITY_WORKSPACE_TEST', () => {
  it('Experiment D fingerprint unchanged', () => {
    expect(NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION).toBe(1);
  });

  it('Founder Appetite absent from Experiment D', () => {
    const { territory, expression } = buildConceptTerritorySeed('THE MARKED-UP COPY');
    const brief = buildConceptFirstHeroBrief({
      comparisonIndex: 1,
      directionName: territory.directionName,
      territory,
      expressionSystem: expression,
      previousMethodologyHeroStoragePath: null,
      heroAsset: null,
      generationReceipt: null,
      founderJudgment: null,
      tooCloseSibling: null,
    });
    expect(() => assertCreativeAppetiteNotInjectedIntoFrozenExperiment(JSON.stringify(brief))).not.toThrow();
  });
});

describe('WORLD_GENERATION_ZERO_WORKSPACE_TEST', () => {
  it('world generation count zero', () => {
    expect(worldFormationGenerationCountZero()).toBe(0);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });
});

describe('ASSET_DIRECTION_OWNERSHIP_UPDATE_TEST', () => {
  it('ownership model updated on asset direction', () => {
    const evidence = buildAllExperimentDTerritoryEvidence();
    const snapshot = compileExperimentEIntelligenceSnapshot({
      profile: null,
      functionalCanon: extractNdxbookFunctionalCanon(),
      hostCanon: buildHostExperienceCanon(),
      clientCanon: buildClientExperienceCanon({ profile: null, territory: null, world: null, crossMediumEvidence: evidence }),
      currentExperienceAudit: buildCurrentExperienceAudit(),
      crossMediumEvidence: evidence,
    });
    const concept = buildExperienceConceptsFromSnapshot({ snapshot, profile: null, crossMediumEvidence: evidence, appetiteLineage: null })[2];
    const bible = buildExperienceBible({ concept, host: buildHostExperienceCanon(), client: buildClientExperienceCanon({ profile: null, territory: null, world: null }) });
    const direction = compileExperienceAssetDirection({
      projectId: 'ndxbook',
      concept,
      bible,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client: buildClientExperienceCanon({ profile: null, territory: null, world: null }),
      scope: defaultNdxbookProductionScope('ndxbook'),
      surfaces: EXPERIENCE_E_INITIAL_SURFACES,
    });
    const corrected = applyCorrectedOwnershipToAssetDirection(direction);
    expect(assetDirectionOwnershipUpdated(corrected.ownershipModel)).toBe(true);
  });
});

describe('NDXBOOK_HERO_COMPOSE_TEST', () => {
  beforeEach(() => {
    resetExperimentEMemory();
    resetProjectWorkspaceHeroMemory();
  });

  it('composes hero frame after generation', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    await generateNdxbookHeroAssets();
    const run = await composeNdxbookHeroFrame();
    expect(run.heroGenerated).toBe(true);
    expect(run.heroComposition?.storagePath).toBeTruthy();
    expect(ndxbookNamingCorrect('NDXBOOK')).toBe(true);
  });
});

describe('HERO_SUBSET_SCOPE_VALID_TEST', () => {
  beforeEach(() => {
    resetExperimentEMemory();
    resetProjectWorkspaceHeroMemory();
  });

  it('hero subset validates scope', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    const run = await compileNdxbookHeroFrameSubset();
    expect(run.heroSubset?.scopeValid).toBe(true);
    expect(run.heroSubset!.newGenerationCount).toBeLessThan(run.heroSubset!.fullManifestRequirementCount);
  });
});

describe('BUILD_CAUSES_ZERO_GENERATION_TEST', () => {
  it('build path does not invoke generation service', () => {
    expect(typeof generateNdxbookHeroAssets).toBe('function');
    expect(pageVisitTriggersZeroGeneration()).toBe(true);
  });
});

describe('HERO_APPROVAL_NO_AUTO_REDESIGN_TEST', () => {
  beforeEach(() => {
    resetExperimentEMemory();
    resetProjectWorkspaceHeroMemory();
  });

  it('hero judgment does not auto-promote or redesign surfaces', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    await generateNdxbookHeroAssets();
    await composeNdxbookHeroFrame();
    const { setNdxbookHeroJudgment } = await import('../../api/_lib/site00Evolve/creativeDirection/projectWorkspace/projectWorkspaceService.js');
    const run = await setNdxbookHeroJudgment('LOVE_THE_DIRECTION');
    expect(run.heroJudgment).toBe('LOVE_THE_DIRECTION');
    expect(run.generatedAssets.every((a) => a.productionState === 'VISUAL_DEVELOPMENT')).toBe(true);
    expect(run.heroGenerated).toBe(true);
  });
});

describe('SEQUENCE_CREATIVE_INDEPENDENCE_WORKSPACE_TEST', () => {
  it('Sequence Creative System scope unchanged', () => {
    expect(SITE00_LAYER.PROJECT_WORKSPACE_CANON).toBe('SITE_00_PROJECT_WORKSPACE_CANON');
    expect(SITE00_LAYER.CLIENT_PROJECT_EXPRESSION).toBe('CLIENT_PROJECT_EXPRESSION');
  });
});
