/**
 * Experiment E — Experience Expression methodology tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EXPERIMENT_E_CLASSIFICATION,
  EXPERIMENT_E_RUN_ID,
  EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
  EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION,
  EXPERIENCE_TERRITORY_SELECTION_PURPOSE,
  FORBIDDEN_GENERIC_PROMPT_PHRASES,
} from './experienceExpression/constants.js';
import { extractNdxbookFunctionalCanon, functionalActionsPreserved, functionalRoutesPreserved } from './experienceExpression/functionalCanon.js';
import { buildHostExperienceCanon, hostClientSeparationValid } from './experienceExpression/hostExperienceCanon.js';
import { buildClientExperienceCanon, experimentalAssetNotCanon } from './experienceExpression/clientExperienceCanon.js';
import { auditNdxbookProjectHomeTemplate, cardDefaultNotRequired } from './experienceExpression/genericTemplateAudit.js';
import { assessExperienceExpressionReadiness } from './experienceExpression/readiness.js';
import { buildExperienceConceptsForTerritory, experienceConceptIsolationValid } from './experienceExpression/experienceConceptSeeds.js';
import { buildExperienceConceptsFromSnapshot } from './experienceExpression/experienceConceptFormation.js';
import { compileExperimentEIntelligenceSnapshot } from './experienceExpression/experienceExpressionSnapshot.js';
import {
  buildAllExperimentDTerritoryEvidence,
  crossMediumEvidenceStatus,
  historicalRepetitionNotAutoCanon,
} from './experienceExpression/crossMediumConceptEvidence.js';
import { buildCurrentExperienceAudit } from './experienceExpression/genericTemplateAudit.js';
import { buildExperienceBible, experienceBibleCompletenessTest } from './experienceExpression/experienceBibleBuilder.js';
import { runExperienceConceptDistinctivenessGate, noStyleOnlyCollapseFixAllowed } from './experienceExpression/distinctiveness.js';
import { translateWorldBehaviorIntoExperienceBehavior } from './experienceExpression/behaviorTranslation.js';
import { compileExperienceVisualPrompt, buildResponsiveExperienceTranslation, assertNoGenericDashboardPrompt } from './experienceExpression/visualPromptCompiler.js';
import {
  runAllExperienceContaminationTests,
  fsMansionExperienceLeakageTest,
  tarotWorldExperienceLeakageTest,
  brainstormExampleExperienceLeakageTest,
  socialArtifactAsPageLayoutTest,
} from './experienceExpression/contaminationGuards.js';
import { compileExperienceImplementationContract, functionalCanonInContract, hostInvariantInContract } from './experienceExpression/implementationContract.js';
import { evaluateExperienceImplementation, implementationEvaluationNotEvaluatedBehavior } from './experienceExpression/implementationEvaluation.js';
import { buildExperienceRevisionDelta } from './experienceExpression/revisionDelta.js';
import { buildConceptTerritorySeed } from './conceptTerritory/conceptTerritorySeeds.js';
import { buildConceptFirstHeroBrief } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';
import { assertCreativeAppetiteNotInjectedIntoFrozenExperiment } from './founderCreativeAppetite/experimentExclusion.js';
import { NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION } from './founderCreativeAppetite/constants.js';
import type { BrandLoreProfile } from './types.js';
import {
  formExperienceConcepts,
  generateExperienceVisualDevelopment,
  getExperienceExpressionRun,
  refreshExperienceExpressionRun,
  selectExperienceTestTerritory,
  compileExperienceImplementationContractForConcept,
} from '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/experimentEService.js';
import { resetExperimentEMemory } from '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/storeAdapter.js';

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

function territoryPair(name: 'THE MARKED-UP COPY' | 'THE COUNTDOWN ROOM' | 'THE INDEX' = 'THE MARKED-UP COPY') {
  return buildConceptTerritorySeed(name);
}

describe('EXPERIMENT_E_NAMING_TEST', () => {
  it('uses EXPERIENCE_EXPRESSION classification', () => {
    expect(EXPERIMENT_E_CLASSIFICATION).toBe('EXPERIENCE_EXPRESSION_EXPERIMENT');
    expect(EXPERIMENT_E_RUN_ID).toBe('ndxbook-experience-expression');
  });
});

describe('EXPERIMENT_D_SNAPSHOT_IMMUTABILITY_TEST', () => {
  it('Experiment D remains snapshot v1', () => {
    expect(NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION).toBe(1);
    expect(EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION).toBe(2);
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBe(1);
  });

  it('blocks appetite in Experiment D hero brief', () => {
    const { territory, expression } = territoryPair();
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
    expect(() =>
      assertCreativeAppetiteNotInjectedIntoFrozenExperiment(
        JSON.stringify({ ...brief, founderCreativeAppetite: 'leak', experimentClassification: 'ndxbook-six-concept-hero-range' }),
      ),
    ).toThrow(/CREATIVE_APPETITE_CONTAMINATION/);
    expect(brief.intelligenceSnapshotVersion).toBe(1);
  });
});

describe('FOUNDER_APPETITE_AVAILABLE_TO_EXPERIMENT_E_TEST', () => {
  it('Experiment E uses snapshot v2', () => {
    expect(EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION).toBeGreaterThan(NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION);
  });
});

describe('EXPERIENCE_EXPRESSION_READINESS_TEST', () => {
  it('ready without territory when snapshot compiled', () => {
    const functionalCanon = extractNdxbookFunctionalCanon();
    const hostCanon = buildHostExperienceCanon();
    const crossMediumEvidence = buildAllExperimentDTerritoryEvidence();
    const snapshot = compileExperimentEIntelligenceSnapshot({
      profile: { brandWorld: { value: 'x' }, brandPersonality: {}, contextClassification: 'ctx' } as BrandLoreProfile,
      functionalCanon,
      hostCanon,
      clientCanon: buildClientExperienceCanon({ profile: null, territory: null, world: null, crossMediumEvidence }),
      currentExperienceAudit: buildCurrentExperienceAudit(),
      crossMediumEvidence,
    });
    const readiness = assessExperienceExpressionReadiness({
      profile: { brandWorld: { value: 'x' }, brandPersonality: {}, contextClassification: 'ctx' } as BrandLoreProfile,
      territory: null,
      world: null,
      functionalCanon,
      hostCanon,
      experimentSnapshot: snapshot,
      crossMediumEvidence,
    });
    expect(readiness.state).toBe('READY_FOR_EXPERIENCE_FORMATION');
    expect(readiness.snapshotCompiled).toBe(true);
    expect(readiness.crossMediumEvidenceStatus).toBe('MEDIUM_SPECIFIC_ONLY');
  });
});

describe('CONCEPT_TERRITORY_NOT_REQUIRED_FOR_EXPERIENCE_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('forms concepts without territory selection', async () => {
    await refreshExperienceExpressionRun();
    const run = await formExperienceConcepts();
    expect(run.experienceConcepts.length).toBe(3);
    expect(run.experimentSnapshot?.fingerprint).toBeTruthy();
  });
});

describe('CROSS_MEDIUM_EVIDENCE_STATUS_TEST', () => {
  it('medium-specific evidence does not auto-promote', () => {
    const evidence = buildAllExperimentDTerritoryEvidence();
    expect(crossMediumEvidenceStatus(evidence)).toBe('MEDIUM_SPECIFIC_ONLY');
    expect(historicalRepetitionNotAutoCanon(evidence)).toBe(true);
  });
});

describe('EXPERIMENT_E_SNAPSHOT_INDEPENDENCE_TEST', () => {
  it('Experiment E snapshot has independent fingerprint', () => {
    const evidence = buildAllExperimentDTerritoryEvidence();
    const snapshot = compileExperimentEIntelligenceSnapshot({
      profile: { brandWorld: { value: 'NDXBOOK' }, brandPersonality: {}, contextClassification: 'CONTENT_FIRST' } as BrandLoreProfile,
      functionalCanon: extractNdxbookFunctionalCanon(),
      hostCanon: buildHostExperienceCanon(),
      clientCanon: buildClientExperienceCanon({ profile: null, territory: null, world: null, crossMediumEvidence: evidence }),
      currentExperienceAudit: buildCurrentExperienceAudit(),
      crossMediumEvidence: evidence,
    });
    expect(snapshot.snapshotVersion).toBe(2);
    expect(snapshot.fingerprint).toHaveLength(16);
  });
});

describe('WORLD_EXPRESSION_EVIDENCE_OPTIONAL_TEST', () => {
  it('world evidence available via cross-medium records', () => {
    const { territory } = territoryPair();
    const evidence = buildAllExperimentDTerritoryEvidence();
    const readiness = assessExperienceExpressionReadiness({
      profile: null,
      territory,
      world: null,
      functionalCanon: extractNdxbookFunctionalCanon(),
      hostCanon: buildHostExperienceCanon(),
      experimentSnapshot: null,
      crossMediumEvidence: evidence,
      experienceTestTerritoryId: territory.territoryId,
    });
    expect(readiness.worldExpressionAvailable).toBe(true);
  });
});

describe('FUNCTIONAL_CANON_EXTRACTION_TEST', () => {
  it('extracts routes from implementation', () => {
    const canon = extractNdxbookFunctionalCanon();
    expect(canon.routes).toContain('/projects/ndxbook');
    expect(canon.routes).toContain('/projects/ndxbook/experience-expression');
  });
});

describe('FUNCTIONAL_ACTION_PRESERVATION_TEST', () => {
  it('preserves creative direction action', () => {
    expect(functionalActionsPreserved(extractNdxbookFunctionalCanon())).toBe(true);
  });
});

describe('FUNCTIONAL_ROUTE_PRESERVATION_TEST', () => {
  it('preserves core routes', () => {
    expect(functionalRoutesPreserved(extractNdxbookFunctionalCanon())).toBe(true);
  });
});

describe('HOST_EXPERIENCE_CANON_TEST', () => {
  it('defines host UI typography', () => {
    const host = buildHostExperienceCanon();
    expect(host.hostUiTypography).toContain('HOST_UI');
  });
});

describe('HOST_CLIENT_SEPARATION_TEST', () => {
  it('validates separation', () => {
    expect(hostClientSeparationValid(buildHostExperienceCanon())).toBe(true);
  });
});

describe('HOST_FONT_AS_CLIENT_CANON_TEST', () => {
  it('flags martian mono as client canon', () => {
    const host = buildHostExperienceCanon();
    const client = buildClientExperienceCanon({
      profile: null,
      territory: territoryPair().territory,
      world: { ...territoryPair().expression, typographySystem: 'Martian Mono as brand type' },
    });
    const result = runAllExperienceContaminationTests({
      serializedPrompt: 'clean prompt',
      host,
      client,
    });
    expect(result.passed).toBe(false);
  });
});

describe('CLIENT_EXPERIENCE_PROVENANCE_TEST', () => {
  it('tags traits with provenance', () => {
    const { territory, expression } = territoryPair();
    const client = buildClientExperienceCanon({ profile: null, territory, world: expression });
    expect(client.traits.some((t) => t.provenance === 'CONCEPT_TERRITORY')).toBe(true);
  });
});

describe('EXPERIMENTAL_ASSET_NOT_CANON_TEST', () => {
  it('excludes experimental traits', () => {
    expect(experimentalAssetNotCanon(buildClientExperienceCanon({ profile: null, territory: null, world: null }))).toBe(true);
  });
});

describe('GENERIC_TEMPLATE_RESEMBLANCE_AUDIT_TEST', () => {
  it('audits high card dependence', () => {
    const audit = auditNdxbookProjectHomeTemplate();
    expect(audit.overallResemblance).toBe('HIGH');
    expect(cardDefaultNotRequired(audit)).toBe(true);
  });
});

describe('CARD_DEFAULT_NOT_REQUIRED_TEST', () => {
  it('cards are habit not requirement', () => {
    expect(cardDefaultNotRequired(auditNdxbookProjectHomeTemplate())).toBe(true);
  });
});

describe('EXPERIENCE_CONCEPT_ISOLATION_TEST', () => {
  it('concepts form in isolation from snapshot', () => {
    const evidence = buildAllExperimentDTerritoryEvidence();
    const snapshot = compileExperimentEIntelligenceSnapshot({
      profile: null,
      functionalCanon: extractNdxbookFunctionalCanon(),
      hostCanon: buildHostExperienceCanon(),
      clientCanon: buildClientExperienceCanon({ profile: null, territory: null, world: null, crossMediumEvidence: evidence }),
      currentExperienceAudit: buildCurrentExperienceAudit(),
      crossMediumEvidence: evidence,
    });
    const concepts = buildExperienceConceptsFromSnapshot({ snapshot, profile: null, crossMediumEvidence: evidence, appetiteLineage: null });
    expect(experienceConceptIsolationValid(concepts)).toBe(true);
  });
});

describe('EXPERIENCE_CONCEPT_DISTINCTIVENESS_TEST', () => {
  it('passes for three snapshot concepts', () => {
    const evidence = buildAllExperimentDTerritoryEvidence();
    const snapshot = compileExperimentEIntelligenceSnapshot({
      profile: null,
      functionalCanon: extractNdxbookFunctionalCanon(),
      hostCanon: buildHostExperienceCanon(),
      clientCanon: buildClientExperienceCanon({ profile: null, territory: null, world: null, crossMediumEvidence: evidence }),
      currentExperienceAudit: buildCurrentExperienceAudit(),
      crossMediumEvidence: evidence,
    });
    const concepts = buildExperienceConceptsFromSnapshot({ snapshot, profile: null, crossMediumEvidence: evidence, appetiteLineage: null });
    const report = runExperienceConceptDistinctivenessGate(concepts);
    expect(['PASS', 'COUSIN_BUT_DISTINCT']).toContain(report.result);
    expect(report.artificialDiversityUsed).toBe(false);
  });
});

describe('CONCEPTUAL_COLLAPSE_TEST', () => {
  it('detects collapse when concepts duplicate', () => {
    const { territory, expression } = territoryPair();
    const concepts = buildExperienceConceptsForTerritory({ territory, world: expression, appetiteLineage: null });
    const collapsed = [concepts[0], { ...concepts[0], experienceConceptId: 'dup-2', conceptIndex: 2 as const }, { ...concepts[0], experienceConceptId: 'dup-3', conceptIndex: 3 as const }];
    const report = runExperienceConceptDistinctivenessGate(collapsed);
    expect(report.conceptualCollapse).toBe(true);
  });
});

describe('NO_STYLE_ONLY_COLLAPSE_FIX_TEST', () => {
  it('does not allow style-only fix', () => {
    const report = runExperienceConceptDistinctivenessGate([]);
    expect(noStyleOnlyCollapseFixAllowed(report)).toBe(true);
  });
});

describe('EXPERIENCE_BIBLE_COMPLETENESS_TEST', () => {
  it('builds complete bible without territory', () => {
    const host = buildHostExperienceCanon();
    const client = buildClientExperienceCanon({ profile: null, territory: null, world: null });
    const evidence = buildAllExperimentDTerritoryEvidence();
    const snapshot = compileExperimentEIntelligenceSnapshot({
      profile: null,
      functionalCanon: extractNdxbookFunctionalCanon(),
      hostCanon: host,
      clientCanon: client,
      currentExperienceAudit: buildCurrentExperienceAudit(),
      crossMediumEvidence: evidence,
    });
    const concept = buildExperienceConceptsFromSnapshot({ snapshot, profile: null, crossMediumEvidence: evidence, appetiteLineage: null })[0];
    const bible = buildExperienceBible({ concept, host, client });
    expect(experienceBibleCompletenessTest(bible)).toBe(true);
  });
});

describe('INFORMATION_BEHAVIOR_TEST', () => {
  it('defines information behavior per concept', () => {
    const { territory, expression } = territoryPair('THE INDEX');
    const concepts = buildExperienceConceptsForTerritory({ territory, world: expression, appetiteLineage: null });
    expect(concepts.every((c) => c.informationBehavior.length > 10)).toBe(true);
  });
});

describe('INTERACTION_GRAMMAR_TEST', () => {
  it('defines interaction grammar', () => {
    const evidence = buildAllExperimentDTerritoryEvidence();
    const snapshot = compileExperimentEIntelligenceSnapshot({
      profile: null,
      functionalCanon: extractNdxbookFunctionalCanon(),
      hostCanon: buildHostExperienceCanon(),
      clientCanon: buildClientExperienceCanon({ profile: null, territory: null, world: null, crossMediumEvidence: evidence }),
      currentExperienceAudit: buildCurrentExperienceAudit(),
      crossMediumEvidence: evidence,
    });
    const concept = buildExperienceConceptsFromSnapshot({ snapshot, profile: null, crossMediumEvidence: evidence, appetiteLineage: null })[0];
    expect(concept.interactionGrammar).toMatch(/TUNE|OPEN|PICK UP|INSPECT|ACKNOWLEDGE/);
  });
});

describe('HIERARCHY_GRAMMAR_TEST', () => {
  it('defines hierarchy behavior', () => {
    const { territory, expression } = territoryPair();
    const concept = buildExperienceConceptsForTerritory({ territory, world: expression, appetiteLineage: null })[0];
    expect(concept.hierarchyBehavior.length).toBeGreaterThan(5);
  });
});

describe('RESPONSIVE_EXPERIENCE_TRANSLATION_TEST', () => {
  it('translates mobile and desktop separately', () => {
    const { territory, expression } = territoryPair();
    const concept = buildExperienceConceptsForTerritory({ territory, world: expression, appetiteLineage: null })[0];
    const translation = buildResponsiveExperienceTranslation(concept);
    expect(translation.mobileBehavior).toBeTruthy();
    expect(translation.desktopBehavior).toBeTruthy();
  });
});

describe('BRAND_BEHAVIOR_TO_EXPERIENCE_BEHAVIOR_TRANSLATION_TEST', () => {
  it('translates world to experience', () => {
    const { territory, expression } = territoryPair();
    const concept = buildExperienceConceptsForTerritory({ territory, world: expression, appetiteLineage: null })[0];
    const translation = translateWorldBehaviorIntoExperienceBehavior({
      territory,
      world: expression,
      concept,
      functionalCanon: extractNdxbookFunctionalCanon(),
      hostCanon: buildHostExperienceCanon(),
    });
    expect(translation.socialLayoutCopyingBlocked).toBe(true);
    expect(translation.translations.length).toBeGreaterThan(0);
  });
});

describe('SOCIAL_ARTIFACT_AS_PAGE_LAYOUT_TEST', () => {
  it('blocks social layout copy prompts', () => {
    const result = socialArtifactAsPageLayoutTest('paste social layout onto dashboard');
    expect(result.passed).toBe(false);
  });
});

describe('SEQUENCE_SYSTEM_AS_EXPERIENCE_SYSTEM_TEST', () => {
  it('passes clean experience prompts', () => {
    const result = runAllExperienceContaminationTests({
      serializedPrompt: 'experience concept spatial navigation',
      host: buildHostExperienceCanon(),
      client: buildClientExperienceCanon({ profile: null, territory: null, world: null }),
    });
    expect(result.passed).toBe(true);
  });
});

describe('EXPERIENCE_VISUAL_BRIEF_TEST', () => {
  it('compiles visual brief without generic dashboard language', () => {
    const { territory, expression } = territoryPair();
    const host = buildHostExperienceCanon();
    const client = buildClientExperienceCanon({ profile: null, territory, world: expression });
    const concept = buildExperienceConceptsForTerritory({ territory, world: expression, appetiteLineage: null })[0];
    const bible = buildExperienceBible({ concept, territory, world: expression, host, client });
    const brief = compileExperienceVisualPrompt({
      concept,
      bible,
      territory,
      world: expression,
      host,
      client,
      functionalCanon: extractNdxbookFunctionalCanon(),
      surfaceType: 'PROJECT_HOME',
      deviceClass: 'MOBILE',
    });
    expect(brief.imageModelRole).toBe('VISUAL_DEVELOPMENT');
    expect(brief.promptHash).toHaveLength(16);
  });
});

describe('GENERIC_DASHBOARD_PROMPT_BLOCK_TEST', () => {
  it('blocks forbidden phrases', () => {
    for (const phrase of FORBIDDEN_GENERIC_PROMPT_PHRASES) {
      expect(() => assertNoGenericDashboardPrompt(phrase)).toThrow(/GENERIC_DASHBOARD_PROMPT_BLOCK/);
    }
  });
});

describe('EXPERIENCE_VISUAL_LINEAGE_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('records lineage fields on visual assets', async () => {
    await selectExperienceTestTerritory({ directionName: 'THE MARKED-UP COPY' });
    await formExperienceConcepts();
    const run = await generateExperienceVisualDevelopment({ conceptIndex: 1 });
    const asset = run.visualAssets[0];
    expect(asset.assetMedium).toBe('EXPERIENCE_VISUAL_DEVELOPMENT');
    expect(asset.intelligenceSnapshotVersion).toBe(2);
    expect(asset.idempotencyKey).toBeTruthy();
  });
});

describe('EXPERIENCE_JUDGMENT_TEST', () => {
  it('supports concept judgments without auto winner', async () => {
    resetExperimentEMemory();
    await selectExperienceTestTerritory({ directionName: 'THE COUNTDOWN ROOM' });
    const run = await formExperienceConcepts();
    expect(run.experienceConcepts.every((c) => c.founderJudgment === null)).toBe(true);
  });
});

describe('NO_AUTO_IMPLEMENTATION_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('does not auto-implement page', async () => {
    await selectExperienceTestTerritory({ directionName: 'THE MARKED-UP COPY' });
    await formExperienceConcepts();
    const run = await getExperienceExpressionRun();
    expect(run?.implementationContract).toBeNull();
  });
});

describe('NO_AUTO_CANON_TEST', () => {
  it('territory selection is EXPERIMENT_E_ONLY', () => {
    expect(EXPERIENCE_TERRITORY_SELECTION_PURPOSE).toBe('EXPERIMENT_E_ONLY');
  });
});

describe('IMPLEMENTATION_CONTRACT_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('compiles contract on founder action', async () => {
    await selectExperienceTestTerritory({ directionName: 'THE MARKED-UP COPY' });
    await formExperienceConcepts();
    const run = await compileExperienceImplementationContractForConcept(1);
    expect(run.implementationContract?.contractId).toContain('contract-');
    expect(functionalCanonInContract(run.implementationContract!)).toBe(true);
    expect(hostInvariantInContract(run.implementationContract!)).toBe(true);
  });
});

describe('FUNCTIONAL_CANON_IN_CONTRACT_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('includes routes in contract', async () => {
    await selectExperienceTestTerritory({ directionName: 'THE INDEX' });
    await formExperienceConcepts();
    const run = await compileExperienceImplementationContractForConcept(1);
    expect(run.implementationContract?.functionalPreservation.some((f) => f.includes('/projects/ndxbook'))).toBe(true);
  });
});

describe('HOST_INVARIANT_IN_CONTRACT_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('includes host invariants', async () => {
    await selectExperienceTestTerritory({ directionName: 'THE INDEX' });
    await formExperienceConcepts();
    const run = await compileExperienceImplementationContractForConcept(1);
    expect(hostInvariantInContract(run.implementationContract!)).toBe(true);
  });
});

describe('IMPLEMENTATION_EVALUATION_NOT_EVALUATED_TEST', () => {
  it('returns NOT_EVALUATED without evidence', () => {
    const eval_ = evaluateExperienceImplementation({ contract: null });
    expect(eval_.overallResult).toBe('NOT_EVALUATED');
    expect(implementationEvaluationNotEvaluatedBehavior(eval_)).toBe(true);
  });
});

describe('GENERIC_TEMPLATE_FIDELITY_TEST', () => {
  it('evaluation scaffold includes template dimension', () => {
    const eval_ = evaluateExperienceImplementation({ contract: null });
    expect(eval_.dimensions.some((d) => d.dimension === 'GENERIC_TEMPLATE_RESEMBLANCE')).toBe(true);
  });
});

describe('FS_MANSION_EXPERIENCE_LEAKAGE_TEST', () => {
  it('blocks mansion leakage', () => {
    expect(fsMansionExperienceLeakageTest('welcome to frontal slayer mansion').passed).toBe(false);
  });
});

describe('TAROT_WORLD_EXPERIENCE_LEAKAGE_TEST', () => {
  it('blocks tarot world', () => {
    expect(tarotWorldExperienceLeakageTest('tarot world navigation').passed).toBe(false);
  });
});

describe('BRAINSTORM_EXAMPLE_EXPERIENCE_LEAKAGE_TEST', () => {
  it('blocks brainstorm examples', () => {
    expect(brainstormExampleExperienceLeakageTest('project chamber layout').passed).toBe(false);
  });
});

describe('GENERATION_IDEMPOTENCY_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('does not duplicate assets on retry', async () => {
    await selectExperienceTestTerritory({ directionName: 'THE MARKED-UP COPY' });
    await formExperienceConcepts();
    await generateExperienceVisualDevelopment({ conceptIndex: 1 });
    const run2 = await generateExperienceVisualDevelopment({ conceptIndex: 1 });
    const keys = run2.visualAssets.map((a) => a.idempotencyKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('GENERATION_REFRESH_SAFE_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('refresh preserves run', async () => {
    await refreshExperienceExpressionRun();
    await selectExperienceTestTerritory({ directionName: 'THE PERSONAL ARCHIVE' });
    const run = await refreshExperienceExpressionRun();
    expect(run.experienceTestTerritoryName).toBe('THE PERSONAL ARCHIVE');
  });
});

describe('NO_DEPLOY_TIME_VISUAL_GENERATION_TEST', () => {
  beforeEach(() => resetExperimentEMemory());

  it('does not auto-generate visuals on concept formation', async () => {
    await refreshExperienceExpressionRun();
    const run = await formExperienceConcepts();
    expect(run.visualGenerationStarted).toBe(false);
    expect(run.visualAssets.length).toBe(0);
    expect(run.accounting.gptImage2Requests).toBe(0);
  });
});

describe('EXPERIENCE_REVISION_DELTA_TEST', () => {
  it('builds revision delta', () => {
    const { territory, expression } = territoryPair();
    const concept = buildExperienceConceptsForTerritory({ territory, world: expression, appetiteLineage: null })[0];
    const delta = buildExperienceRevisionDelta({ concept });
    expect(delta.preserve.some((p) => p.includes('bottom navigation'))).toBe(true);
  });
});
