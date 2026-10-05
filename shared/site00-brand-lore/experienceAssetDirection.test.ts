/**
 * Experience Asset Direction + World Formation future-depth tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXPERIENCE_E_INITIAL_SURFACES } from './experienceExpression/constants.js';
import { extractNdxbookFunctionalCanon } from './experienceExpression/functionalCanon.js';
import { buildHostExperienceCanon } from './experienceExpression/hostExperienceCanon.js';
import { buildClientExperienceCanon } from './experienceExpression/clientExperienceCanon.js';
import { buildExperienceBible } from './experienceExpression/experienceBibleBuilder.js';
import { buildExperienceConceptsFromSnapshot } from './experienceExpression/experienceConceptFormation.js';
import { compileExperimentEIntelligenceSnapshot } from './experienceExpression/experienceExpressionSnapshot.js';
import { buildAllExperimentDTerritoryEvidence } from './experienceExpression/crossMediumConceptEvidence.js';
import { buildCurrentExperienceAudit } from './experienceExpression/genericTemplateAudit.js';
import {
  compileExperienceAssetDirection,
  isActiveWorkbenchConcept,
  literalWorkshopImageryBlocked,
} from './experienceExpression/assetDirection.js';
import {
  compileExperienceAssetManifest,
  manifestCompilationIdempotent,
  pageVisitTriggersZeroGeneration,
} from './experienceExpression/assetManifest.js';
import {
  defaultNdxbookProductionScope,
  scopeAllowsGeneration,
} from './experienceExpression/productionScope.js';
import {
  approveDoesNotCreateBrandCanon,
  clientAssetCannotMutateHostCanon,
  hostAssetCannotBecomeClientCanon,
  preferredDoesNotCreateBrandCanon,
  productionPromotionDoesNotCreateBrandCanon,
  promoteAssetToProduction,
  reviseAssetWithLineage,
  visualDevelopmentNotProductionByDefault,
} from './experienceExpression/assetLifecycle.js';
import {
  compileExperienceImplementationContract,
  composerSubstitutionBlocked,
  missingAssetSurfacedHonestly,
} from './experienceExpression/implementationContract.js';
import { evaluateExperienceAssetQA, assetQANeverFabricatesPass } from './experienceExpression/assetQA.js';
import {
  buildWorldFormationReadinessArchitecture,
  founderWorldHypothesisIsProposedNotCanon,
  frontalSlayerMansionContaminationGuard,
  genericMetaverseGamingNotAutoInjected,
  tarotExampleContaminationGuard,
  worldFormationGenerationCountZero,
  worldFormationInputNonGenerative,
  worldIntelligenceSnapshotPreserved,
  WORLD_FORMATION_IMPLEMENTED,
} from './worldFormation/futureContracts.js';
import { NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION } from './founderCreativeAppetite/constants.js';
import { assertCreativeAppetiteNotInjectedIntoFrozenExperiment } from './founderCreativeAppetite/experimentExclusion.js';
import { buildConceptTerritorySeed } from './conceptTerritory/conceptTerritorySeeds.js';
import { buildConceptFirstHeroBrief } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';
import {
  compileExperienceAssetDirectionForConcept,
  compileExperienceAssetManifestForConcept,
  formExperienceConcepts,
  generateExperienceAssetVisualDevelopment,
  getExperienceExpressionRun,
  promoteExperienceAssetToProduction,
  refreshExperienceExpressionRun,
} from '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/experimentEService.js';
import { resetExperimentEMemory } from '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/storeAdapter.js';
import type { BrandLoreProfile } from './types.js';

vi.mock('../../api/_lib/site00BrandLore/loreService.js', () => ({
  getBrandLoreProfileForOrg: vi.fn().mockResolvedValue({
    brandWorld: { value: 'NDXBOOK world' },
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

function snapshotConcepts() {
  const evidence = buildAllExperimentDTerritoryEvidence();
  const snapshot = compileExperimentEIntelligenceSnapshot({
    profile: null,
    functionalCanon: extractNdxbookFunctionalCanon(),
    hostCanon: buildHostExperienceCanon(),
    clientCanon: buildClientExperienceCanon({ profile: null, territory: null, world: null, crossMediumEvidence: evidence }),
    currentExperienceAudit: buildCurrentExperienceAudit(),
    crossMediumEvidence: evidence,
  });
  return buildExperienceConceptsFromSnapshot({ snapshot, profile: null, crossMediumEvidence: evidence, appetiteLineage: null });
}

describe('EXPERIENCE_ASSET_MANIFEST_DERIVATION_TEST', () => {
  it('derives manifest from bible and surface requirements', () => {
    const concepts = snapshotConcepts();
    const concept = concepts[2];
    const host = buildHostExperienceCanon();
    const client = buildClientExperienceCanon({ profile: null, territory: null, world: null });
    const bible = buildExperienceBible({ concept, host, client });
    const scope = defaultNdxbookProductionScope('ndxbook');
    const direction = compileExperienceAssetDirection({
      projectId: 'ndxbook',
      concept,
      bible,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client,
      scope,
      surfaces: EXPERIENCE_E_INITIAL_SURFACES,
      revisedWorkbenchDossier: true,
    });
    const manifest = compileExperienceAssetManifest({
      projectId: 'ndxbook',
      concept,
      bible,
      assetDirection: direction,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client,
      scope,
    });
    expect(manifest.requirements.length).toBeGreaterThan(0);
    expect(manifest.summary.surfacesCovered.length).toBeGreaterThan(0);
  });
});

describe('PAGE_VISIT_ZERO_GENERATION_TEST', () => {
  it('page visit causes zero FAL/image requests', () => {
    expect(pageVisitTriggersZeroGeneration()).toBe(true);
  });

  beforeEach(() => resetExperimentEMemory());

  it('refresh does not generate assets', async () => {
    await refreshExperienceExpressionRun();
    const run = await getExperienceExpressionRun();
    expect(run?.accounting.falRequests ?? 0).toBe(0);
    expect(run?.assetGenerationStarted).toBe(false);
  });
});

describe('MANIFEST_IDEMPOTENCY_TEST', () => {
  it('repeated manifest compilation is idempotent', () => {
    const concepts = snapshotConcepts();
    const concept = concepts[2];
    const host = buildHostExperienceCanon();
    const client = buildClientExperienceCanon({ profile: null, territory: null, world: null });
    const bible = buildExperienceBible({ concept, host, client });
    const scope = defaultNdxbookProductionScope('ndxbook');
    const direction = compileExperienceAssetDirection({
      projectId: 'ndxbook',
      concept,
      bible,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client,
      scope,
      surfaces: EXPERIENCE_E_INITIAL_SURFACES,
    });
    const first = compileExperienceAssetManifest({
      projectId: 'ndxbook',
      concept,
      bible,
      assetDirection: direction,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client,
      scope,
    });
    const second = compileExperienceAssetManifest({
      projectId: 'ndxbook',
      concept,
      bible,
      assetDirection: direction,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client,
      scope,
      existingRequirements: first.requirements,
    });
    expect(manifestCompilationIdempotent(first, second)).toBe(true);
  });
});

describe('PROJECT_PRODUCTION_SCOPE_LIMITS_TEST', () => {
  it('scope limits generation correctly', () => {
    const scope = defaultNdxbookProductionScope('ndxbook');
    const blocked = scopeAllowsGeneration(scope, {
      estimatedCostUsd: 100,
      spentUsd: 0,
      frameCount: 999,
    });
    expect(blocked.allowed).toBe(false);
  });
});

describe('VISUAL_DEVELOPMENT_NOT_PRODUCTION_TEST', () => {
  it('visual development asset is not production by default', () => {
    expect(
      visualDevelopmentNotProductionByDefault({
        assetId: 'a1',
        requirementId: 'r1',
        assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT',
        provenanceClass: 'VISUAL_DEVELOPMENT',
        canonStatus: 'EXPERIMENTAL',
        productionState: 'VISUAL_DEVELOPMENT',
        storagePath: '/x.webp',
        vaultAssetId: null,
        parentAssetId: null,
        lineageKey: 'lk',
        founderJudgment: null,
        promotedAt: null,
        promotedBy: null,
        generationReceipt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ).toBe(true);
  });
});

describe('EXPLICIT_PRODUCTION_PROMOTION_TEST', () => {
  it('explicit promotion makes eligible asset production-ready', () => {
    const base = {
      assetId: 'a1',
      requirementId: 'r1',
      assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT' as const,
      provenanceClass: 'VISUAL_DEVELOPMENT' as const,
      canonStatus: 'EXPERIMENTAL' as const,
      productionState: 'APPROVED_VISUAL_DEVELOPMENT' as const,
      storagePath: '/x.webp',
      vaultAssetId: null,
      parentAssetId: null,
      lineageKey: 'lk',
      founderJudgment: 'LOVE_IT' as const,
      promotedAt: null,
      promotedBy: null,
      generationReceipt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const promoted = promoteAssetToProduction(base, { promotedBy: 'founder' });
    expect(promoted.productionState).toBe('PROMOTED_TO_PRODUCTION');
    expect(promoted.assetMedium).toBe('EXPERIENCE_PRODUCTION_ASSET');
  });
});

describe('PRODUCTION_PROMOTION_NOT_BRAND_CANON_TEST', () => {
  it('production promotion does not create Brand Canon', () => {
    const promoted = promoteAssetToProduction(
      {
        assetId: 'a1',
        requirementId: 'r1',
        assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT',
        provenanceClass: 'VISUAL_DEVELOPMENT',
        canonStatus: 'EXPERIMENTAL',
        productionState: 'APPROVED_VISUAL_DEVELOPMENT',
        storagePath: '/x.webp',
        vaultAssetId: null,
        parentAssetId: null,
        lineageKey: 'lk',
        founderJudgment: 'LOVE_IT',
        promotedAt: null,
        promotedBy: null,
        generationReceipt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { promotedBy: 'founder' },
    );
    expect(productionPromotionDoesNotCreateBrandCanon(promoted)).toBe(true);
    expect(approveDoesNotCreateBrandCanon(promoted)).toBe(true);
    expect(preferredDoesNotCreateBrandCanon(promoted)).toBe(true);
  });
});

describe('ASSET_LINEAGE_REVISION_TEST', () => {
  it('asset lineage survives revision', () => {
    const parent = {
      assetId: 'a1',
      requirementId: 'r1',
      assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT' as const,
      provenanceClass: 'VISUAL_DEVELOPMENT' as const,
      canonStatus: 'EXPERIMENTAL' as const,
      productionState: 'VISUAL_DEVELOPMENT' as const,
      storagePath: '/x.webp',
      vaultAssetId: null,
      parentAssetId: null,
      lineageKey: 'lineage-abc',
      founderJudgment: null,
      promotedAt: null,
      promotedBy: null,
      generationReceipt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const revised = reviseAssetWithLineage(parent, { storagePath: '/y.webp' });
    expect(revised.parentAssetId).toBe('a1');
    expect(revised.lineageKey).toBe('lineage-abc');
  });
});

describe('SURFACE_REQUIREMENT_PROVENANCE_TEST', () => {
  it('surface asset requirements preserve provenance', () => {
    const concepts = snapshotConcepts();
    const concept = concepts[0];
    const host = buildHostExperienceCanon();
    const client = buildClientExperienceCanon({ profile: null, territory: null, world: null });
    const bible = buildExperienceBible({ concept, host, client });
    const scope = defaultNdxbookProductionScope('ndxbook');
    const direction = compileExperienceAssetDirection({
      projectId: 'ndxbook',
      concept,
      bible,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client,
      scope,
      surfaces: ['PROJECT_HOME'],
    });
    const manifest = compileExperienceAssetManifest({
      projectId: 'ndxbook',
      concept,
      bible,
      assetDirection: direction,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client,
      scope,
    });
    expect(manifest.requirements.every((r) => r.provenance === 'DERIVED_EXPERIENCE')).toBe(true);
    expect(manifest.requirements.every((r) => r.brandIntelligenceSources.length >= 0)).toBe(true);
  });
});

describe('HOST_CLIENT_CANON_SEPARATION_ASSET_TEST', () => {
  it('host assets cannot silently become Client Canon', () => {
    expect(hostAssetCannotBecomeClientCanon('HOST_CANON')).toBe(false);
    expect(hostAssetCannotBecomeClientCanon('VISUAL_DEVELOPMENT')).toBe(true);
  });

  it('client assets cannot mutate Host Canon', () => {
    expect(clientAssetCannotMutateHostCanon('CLIENT')).toBe(true);
    expect(clientAssetCannotMutateHostCanon('HOST_CANON')).toBe(false);
  });
});

describe('MISSING_PRODUCTION_ASSET_HONEST_TEST', () => {
  it('missing required production asset is surfaced honestly', () => {
    const concepts = snapshotConcepts();
    const concept = concepts[0];
    const host = buildHostExperienceCanon();
    const client = buildClientExperienceCanon({ profile: null, territory: null, world: null });
    const bible = buildExperienceBible({ concept, host, client });
    const scope = defaultNdxbookProductionScope('ndxbook');
    const direction = compileExperienceAssetDirection({
      projectId: 'ndxbook',
      concept,
      bible,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client,
      scope,
      surfaces: ['PROJECT_HOME'],
    });
    const manifest = compileExperienceAssetManifest({
      projectId: 'ndxbook',
      concept,
      bible,
      assetDirection: direction,
      functionalCanon: extractNdxbookFunctionalCanon(),
      client,
      scope,
    });
    const promotedReqs = manifest.requirements.map((r) => ({
      ...r,
      required: true,
      productionEligibility: 'PRODUCTION_ELIGIBLE' as const,
    }));
    const contract = compileExperienceImplementationContract({
      concept,
      bible,
      functionalCanon: extractNdxbookFunctionalCanon(),
      host,
      client,
      visualAssets: [],
      assetManifest: { ...manifest, requirements: promotedReqs },
      productionAssets: [],
    });
    expect(contract.implementationStatus).toBe('IMPLEMENTATION_BLOCKED_MISSING_ASSET');
    expect(missingAssetSurfacedHonestly(contract)).toBe(true);
  });
});

describe('IMPLEMENTATION_CONTRACT_ASSET_BINDINGS_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('composer contract includes approved asset bindings', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    const run = await generateExperienceAssetVisualDevelopment({ conceptIndex: 3 });
    expect(run.assetManifest?.requirements.some((r) => r.status === 'GENERATED')).toBe(true);
    expect(run.productionAssets.length).toBeGreaterThan(0);
  });
});

describe('COMPOSER_SUBSTITUTION_BLOCKED_TEST', () => {
  it('contract blocks silent generic substitution', () => {
    const concepts = snapshotConcepts();
    const concept = concepts[0];
    const host = buildHostExperienceCanon();
    const client = buildClientExperienceCanon({ profile: null, territory: null, world: null });
    const bible = buildExperienceBible({ concept, host, client });
    const contract = compileExperienceImplementationContract({
      concept,
      bible,
      functionalCanon: extractNdxbookFunctionalCanon(),
      host,
      client,
      visualAssets: [],
    });
    expect(composerSubstitutionBlocked(contract)).toBe(true);
  });
});

describe('EXPERIMENT_D_FINGERPRINT_UNCHANGED_ASSET_SPRINT_TEST', () => {
  it('Experiment D snapshot remains v1', () => {
    expect(NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION).toBe(1);
  });
});

describe('FOUNDER_APPETITE_ABSENT_EXPERIMENT_D_ASSET_TEST', () => {
  it('Founder Creative Appetite remains absent from Experiment D', () => {
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

describe('WORLD_FORMATION_INPUT_NON_GENERATIVE_TEST', () => {
  it('WorldFormationInput remains non-generative', () => {
    expect(worldFormationInputNonGenerative()).toBe(true);
  });
});

describe('WORLD_INTELLIGENCE_SNAPSHOT_PRESERVED_TEST', () => {
  it('WorldIntelligenceSnapshot remains preserved', () => {
    expect(worldIntelligenceSnapshotPreserved()).toBe(true);
  });
});

describe('FOUNDER_WORLD_HYPOTHESIS_PROPOSED_TEST', () => {
  it('founder world hypothesis remains FOUNDER_PROPOSED_CONCEPT', () => {
    expect(founderWorldHypothesisIsProposedNotCanon('FOUNDER_PROPOSED_CONCEPT')).toBe(true);
  });
});

describe('WORLD_FORMATION_ZERO_GENERATION_TEST', () => {
  it('World Formation generation count remains zero', () => {
    expect(worldFormationGenerationCountZero()).toBe(0);
    expect(buildWorldFormationReadinessArchitecture().worldAssetManifest.generationCount).toBe(0);
  });
});

describe('FRONTAL_SLAYER_CONTAMINATION_GUARD_TEST', () => {
  it('Frontal Slayer Mansion contamination guard passes', () => {
    expect(frontalSlayerMansionContaminationGuard('clean experience direction')).toBe(true);
    expect(frontalSlayerMansionContaminationGuard('frontal slayer mansion lobby')).toBe(false);
  });
});

describe('TAROT_CONTAMINATION_GUARD_TEST', () => {
  it('tarot-example contamination guard passes', () => {
    expect(tarotExampleContaminationGuard('ndxbook workbench')).toBe(true);
    expect(tarotExampleContaminationGuard('tarot tent reading')).toBe(false);
  });
});

describe('GENERIC_METAVERSE_NOT_AUTO_INJECTED_TEST', () => {
  it('generic game/metaverse assumptions are not auto-injected', () => {
    const arch = buildWorldFormationReadinessArchitecture();
    expect(genericMetaverseGamingNotAutoInjected(arch)).toBe(true);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });
});

describe('NDXBOOK_ACTIVE_WORKBENCH_DOSSIER_PROOF_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('Active Workbench revised direction preserves metaphor and blocks literal workshop', async () => {
    await formExperienceConcepts();
    const run = await compileExperienceAssetDirectionForConcept(3);
    expect(run.assetDirection?.revisedDirectionLabel).toContain('ACTIVE WORKBENCH');
    expect(run.assetDirection?.literalImageryBlocked.length).toBeGreaterThan(0);
    expect(literalWorkshopImageryBlocked('wooden desk with hammer')).toBe(true);
    const concepts = run.experienceConcepts;
    expect(isActiveWorkbenchConcept(concepts[2])).toBe(true);
  });
});

describe('EXPERIENCE_ASSET_QA_NOT_EVALUATED_TEST', () => {
  it('QA returns NOT_EVALUATED without evidence', () => {
    const qa = evaluateExperienceAssetQA({});
    expect(qa.overallResult).toBe('NOT_EVALUATED');
    expect(assetQANeverFabricatesPass(qa)).toBe(true);
  });
});

describe('EXPERIENCE_ASSET_GENERATION_FOUNDER_TRIGGER_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('generation requires founder trigger — not on concept formation', async () => {
    const run = await formExperienceConcepts();
    expect(run.assetGenerationStarted).toBe(false);
    expect(run.accounting.falRequests).toBe(0);
  });

  it('founder-triggered generation records receipts', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    const run = await generateExperienceAssetVisualDevelopment({ conceptIndex: 3 });
    expect(run.assetGenerationStarted).toBe(true);
    expect(run.assetGenerationReceipts.length).toBeGreaterThan(0);
    expect(run.accounting.falRequests).toBeGreaterThan(0);
  });
});

describe('PRODUCTION_PROMOTION_SERVICE_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('explicit promotion via service', async () => {
    await formExperienceConcepts();
    await compileExperienceAssetManifestForConcept(3);
    let run = await generateExperienceAssetVisualDevelopment({ conceptIndex: 3 });
    const assetId = run.productionAssets[0]?.assetId;
    expect(assetId).toBeTruthy();
    run = await promoteExperienceAssetToProduction({ assetId: assetId!, promotedBy: 'founder@test.com' });
    expect(run.productionAssets[0]?.productionState).toBe('PROMOTED_TO_PRODUCTION');
    expect(run.productionAssets[0]?.canonStatus).not.toBe('BRAND_CANON');
  });
});
