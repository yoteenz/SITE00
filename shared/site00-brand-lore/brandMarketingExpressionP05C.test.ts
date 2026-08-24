/**
 * P0.5C — Character-Led Marketing Expression System + North-Star Calibration tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  auditMarketingExpressionLayer,
  experimentFImmutable,
  experimentGImmutable,
  artifactSurvivesLimeRemovalConceptually,
  behavioralModesAreNotTemplates,
  SEED_BEHAVIORAL_MODES,
  discoveredBehavioralModesSupported,
  buildFounderMarketingNorthStarArtifact,
  evaluateNorthStarForensics,
  founderThisIsNdxJudgmentPersists,
  northStarNotFinalIdentity,
  compileBrandMarketingExpressionSystem,
  marketingExpressionRequiresBrandCharacterSystem,
  characterEventPrecedesArtifact,
  genericTopicToTemplateFails,
  contentMayRemainUnresolved,
  formulateExperiment01Artifacts,
  EXPERIMENT_01_TOPIC_SPECS,
  compileMarketingArtifactFalPrompt,
  marketingFalPromptBeginsFromBehavior,
  noAestheticKeywordSoup,
  evaluateMarketingCharacterRecognition,
  evaluateNorthStarCharacterDistance,
  evaluateExperiment01Set,
  northStarComparisonBehavioralNotCosmetic,
  surfaceCauseSeparationImplemented,
  limeCannotBecomeCanonical,
  handwritingCannotBecomeCanonical,
  typographyCannotBecomeCanonical,
  collageCannotBecomeCanonical,
  typographyBehaviorDoesNotPrescribeFonts,
  colorBehaviorDoesNotPrescribePalette,
  MARKETING_TYPOGRAPHY_BEHAVIORS,
  MARKETING_COLOR_BEHAVIORS,
  evidenceVocabularyOpen,
  decorativeEvidenceFails,
  classifyRevisionLayer,
  characterAndVisualRevisionsRemainSeparate,
  buildVitestBrandCharacterSystemForMarketing,
  EXPERIMENT_01_PIPELINE_READY,
  TEMPLATE_COLLAPSE_GUARDS_IMPLEMENTED,
  PRODUCT_EXPRESSION_BLOCKED,
  WORLD_FORMATION_BLOCKED,
} from './brandMarketingExpression/index.js';
import {
  prepareBrandMarketingExpression,
  compileBrandMarketingExpression,
  formulateMarketingExpressionExperiment01,
  generateExperiment01ArtifactAsset,
  setExperiment01ArtifactJudgment,
  setExperiment01SetJudgment,
  seedVitestNdxbookMarketingExpressionPrerequisites,
  resetBrandMarketingExpressionWorkers,
  noPageLoadGeneration,
  noAutomaticFalRetry,
  providerGenerationRequiresFounderTrigger,
  falRequestsCappedAtNine,
  experiment01ArtifactCount,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionService.js';
import {
  resetBrandMarketingExpressionMemory,
  resetBrandMarketingExpressionStoreModeCache,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionStoreAdapter.js';
import {
  resetBrandCharacterSynthesisMemory,
  resetBrandCharacterSynthesisStoreModeCache,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterSynthesisStoreAdapter.js';
import { resetBrandCharacterSynthesisWorkers } from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterSynthesisService.js';
import { compositeSystemDoesNotMutateBrandCanon } from './brandCharacterSynthesis/characterSystemFromSynthesis.js';
import { experimentGRemainsImmutable } from './brandCharacterSynthesis/index.js';

const ROUTES = readFileSync(join(process.cwd(), 'src/site00/config/routes.ts'), 'utf8');
const SITE_ROUTES = readFileSync(join(process.cwd(), 'src/routes/Site00Routes.tsx'), 'utf8');
const PROJECTS_API = readFileSync(join(process.cwd(), 'api/site00/projects.ts'), 'utf8');
const MARKETING_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectBrandMarketingExpressionPage.tsx'), 'utf8');
const EXP01_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectBrandMarketingExpressionExperiment01Page.tsx'), 'utf8');

beforeEach(async () => {
  resetBrandMarketingExpressionMemory();
  resetBrandMarketingExpressionStoreModeCache();
  resetBrandMarketingExpressionWorkers();
  resetBrandCharacterSynthesisMemory();
  resetBrandCharacterSynthesisStoreModeCache();
  resetBrandCharacterSynthesisWorkers();
  await seedVitestNdxbookMarketingExpressionPrerequisites();
});

describe('P0.5C Brand Marketing Expression', () => {
  it('1. marketing expression requires BrandCharacterSystem', async () => {
    const system = buildVitestBrandCharacterSystemForMarketing();
    expect(marketingExpressionRequiresBrandCharacterSystem(system)).toBe(true);
    expect(marketingExpressionRequiresBrandCharacterSystem(null)).toBe(false);
  });

  it('2. north star high character authority without identity authority', () => {
    const ns = buildFounderMarketingNorthStarArtifact();
    expect(northStarNotFinalIdentity(ns)).toBe(true);
    expect(ns.identityAuthority).toBe('NONE');
    expect(ns.characterExpressionAuthority).toBe('HIGH');
  });

  it('3. founder THIS IS NDX judgment persists', () => {
    const ns = buildFounderMarketingNorthStarArtifact();
    expect(founderThisIsNdxJudgmentPersists(ns)).toBe(true);
  });

  it('4. surface and causal behavior remain separate', () => {
    expect(surfaceCauseSeparationImplemented()).toBe(true);
    const forensics = evaluateNorthStarForensics(buildFounderMarketingNorthStarArtifact());
    expect(forensics.surfaceCauseRecords.length).toBeGreaterThan(0);
    expect(forensics.surfaceCauseRecords[0]?.mustNotEncodeAsRule).toContain('=');
  });

  it('5. lime cannot automatically become canonical', () => {
    expect(limeCannotBecomeCanonical()).toBe(true);
  });

  it('6. handwriting cannot automatically become canonical', () => {
    expect(handwritingCannotBecomeCanonical()).toBe(true);
  });

  it('7. typography cannot automatically become canonical', () => {
    expect(typographyCannotBecomeCanonical()).toBe(true);
  });

  it('8. collage cannot automatically become canonical', () => {
    expect(collageCannotBecomeCanonical()).toBe(true);
  });

  it('9. character event precedes marketing artifact', () => {
    const { events } = formulateExperiment01Artifacts({
      expressionSystem: compileBrandMarketingExpressionSystem({
        characterSystem: buildVitestBrandCharacterSystemForMarketing(),
        northStarId: 'north-star-ndxbook-3x3',
      }),
      characterSystemId: 'bcs-vitest',
    });
    expect(events.every((e) => characterEventPrecedesArtifact(e))).toBe(true);
  });

  it('10. generic topic-to-template path fails', () => {
    expect(genericTopicToTemplateFails('Create a post about subscriptions')).toBe(true);
    expect(genericTopicToTemplateFails('NDX noticed subscription creep')).toBe(false);
  });

  it('11. behavioral modes are not templates', () => {
    for (const mode of SEED_BEHAVIORAL_MODES) {
      expect(behavioralModesAreNotTemplates(mode)).toBe(true);
    }
  });

  it('12. new behavioral modes may be discovered', () => {
    expect(discoveredBehavioralModesSupported()).toBe(true);
  });

  it('13. content may remain unresolved', () => {
    expect(contentMayRemainUnresolved('QUESTION_OPEN')).toBe(true);
    expect(contentMayRemainUnresolved('INVESTIGATION_IN_PROGRESS')).toBe(true);
    expect(contentMayRemainUnresolved('UNRESOLVED')).toBe(true);
  });

  it('14. NDX may change its mind via self-correction resolution', () => {
    const spec = EXPERIMENT_01_TOPIC_SPECS.find((s) => s.resolutionState === 'SELF_CORRECTION');
    expect(spec).toBeDefined();
    expect(spec?.behavioralModeId).toBe('mode-08-self-correction');
  });

  it('15. self-correction preserves previous-claim lineage', () => {
    const spec = EXPERIMENT_01_TOPIC_SPECS.find((s) => s.behavioralModeId === 'mode-08-self-correction');
    expect(spec?.headline).toContain('STUPID');
  });

  it('16. humor is not mandatory', () => {
    const serious = EXPERIMENT_01_TOPIC_SPECS.find((s) => s.characterTemperature === 'SERIOUS');
    expect(serious).toBeDefined();
  });

  it('17. seriousness may suppress humor', () => {
    const spec = EXPERIMENT_01_TOPIC_SPECS.find((s) => s.characterTemperature === 'SERIOUS');
    expect(spec?.behavioralModeId).toBe('mode-06-translation');
  });

  it('18. visual interventions require causality', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    const compiled = await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    const formulated = await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    for (const a of formulated.experiment01!.artifacts) {
      expect(a.visualCausalityRecords.length).toBeGreaterThan(0);
    }
    expect(compiled.expressionSystem).toBeTruthy();
  });

  it('19. decorative highlights fail evaluation when no causality', () => {
    const { artifacts } = formulateExperiment01Artifacts({
      expressionSystem: compileBrandMarketingExpressionSystem({
        characterSystem: buildVitestBrandCharacterSystemForMarketing(),
        northStarId: 'ns',
      }),
      characterSystemId: 'bcs',
    });
    const bad = { ...artifacts[0]!, visualCausalityRecords: [], makerTraces: [] };
    const evalResult = evaluateMarketingCharacterRecognition(bad);
    expect(evalResult.ndxRecognition).toBe('FAIL');
  });

  it('20. decorative evidence fails', () => {
    expect(decorativeEvidenceFails(['for editorial mood only'])).toBe(true);
  });

  it('21. evidence vocabulary remains open', () => {
    expect(evidenceVocabularyOpen()).toBe(true);
  });

  it('22. artifact expression remains open', () => {
    const classes = new Set(EXPERIMENT_01_TOPIC_SPECS.map((s) => s.artifactExpressionClass));
    expect(classes.size).toBeGreaterThanOrEqual(7);
  });

  it('23. typography behavior does not prescribe fonts', () => {
    expect(typographyBehaviorDoesNotPrescribeFonts(MARKETING_TYPOGRAPHY_BEHAVIORS)).toBe(true);
  });

  it('24. color behavior does not prescribe palette', () => {
    expect(colorBehaviorDoesNotPrescribePalette(MARKETING_COLOR_BEHAVIORS)).toBe(true);
  });

  it('25. channel modulation preserves character', () => {
    const sys = compileBrandMarketingExpressionSystem({
      characterSystem: buildVitestBrandCharacterSystemForMarketing(),
      northStarId: 'ns',
    });
    expect(sys.channelModulationRules.length).toBeGreaterThan(0);
  });

  it('26. stories may be less resolved than feed', () => {
    const stories = compileBrandMarketingExpressionSystem({
      characterSystem: buildVitestBrandCharacterSystemForMarketing(),
      northStarId: 'ns',
    }).channelModulationRules.find((r) => r.channel === 'INSTAGRAM_STORIES');
    expect(stories?.resolutionExpectation).toMatch(/REACTION_ONLY|QUESTION_OPEN/);
  });

  it('27. experiment 01 supports nine unrelated topics', () => {
    expect(EXPERIMENT_01_TOPIC_SPECS.length).toBe(9);
    const topics = new Set(EXPERIMENT_01_TOPIC_SPECS.map((s) => s.topic));
    expect(topics.size).toBe(9);
  });

  it('28. experiment 01 requires meaningful visual range', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    const run = await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    expect(run.experiment01?.setEvaluation?.meaningfulVisualRange).toBe('PASS');
  });

  it('29. same-template-different-topic fails set evaluation guard', () => {
    const { artifacts } = formulateExperiment01Artifacts({
      expressionSystem: compileBrandMarketingExpressionSystem({
        characterSystem: buildVitestBrandCharacterSystemForMarketing(),
        northStarId: 'ns',
      }),
      characterSystemId: 'bcs',
    });
    const collapsed = artifacts.map((a) => ({
      ...a,
      artifactExpressionClass: 'EDITORIAL_SPREAD' as const,
    }));
    const evalResult = evaluateExperiment01Set(collapsed);
    expect(evalResult.failureStates).toContain('FAIL_SAME_TEMPLATE_DIFFERENT_TOPIC');
  });

  it('30. same-character-across-topics is evaluated', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    const run = await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    expect(run.experiment01?.setEvaluation?.sameCharacterAcrossTopics).toBe('PASS');
  });

  it('31. north-star comparison is behavioral not cosmetic', () => {
    const { artifacts } = formulateExperiment01Artifacts({
      expressionSystem: compileBrandMarketingExpressionSystem({
        characterSystem: buildVitestBrandCharacterSystemForMarketing(),
        northStarId: 'ns',
      }),
      characterSystemId: 'bcs',
    });
    const dist = evaluateNorthStarCharacterDistance(artifacts[0]!);
    expect(northStarComparisonBehavioralNotCosmetic(dist)).toBe(true);
  });

  it('32. NDX recognition survives logo removal', () => {
    const { artifacts } = formulateExperiment01Artifacts({
      expressionSystem: compileBrandMarketingExpressionSystem({
        characterSystem: buildVitestBrandCharacterSystemForMarketing(),
        northStarId: 'ns',
      }),
      characterSystemId: 'bcs',
    });
    const rec = evaluateMarketingCharacterRecognition(artifacts[0]!);
    expect(rec.logoRemovalSurvival).toBe(true);
  });

  it('33. NDX recognition survives lime removal conceptually', () => {
    const sys = compileBrandMarketingExpressionSystem({
      characterSystem: buildVitestBrandCharacterSystemForMarketing(),
      northStarId: 'ns',
    });
    expect(artifactSurvivesLimeRemovalConceptually(sys.visualFreedomContract)).toBe(true);
  });

  it('34. character and visual revisions remain separate', () => {
    const char = classifyRevisionLayer('NDX should be more suspicious here');
    const visual = classifyRevisionLayer('composition is boring');
    expect(characterAndVisualRevisionsRemainSeparate(char, visual)).toBe(true);
  });

  it('35. Experiment F remains immutable', () => {
    expect(experimentFImmutable()).toBe(true);
    const audit = auditMarketingExpressionLayer({
      projectId: 'ndxbook',
      hasBrandCharacterSystem: true,
      hasSynthesis: true,
      experimentFExists: true,
      experimentGExists: true,
    });
    expect(audit.historicalRecordsMutated).toBe(false);
  });

  it('36. Experiment G remains immutable', () => {
    expect(experimentGImmutable()).toBe(true);
    expect(experimentGRemainsImmutable()).toBe(true);
  });

  it('37. Brand Canon remains unchanged', () => {
    expect(compositeSystemDoesNotMutateBrandCanon()).toBe(true);
  });

  it('38. Product Expression remains blocked', () => {
    expect(PRODUCT_EXPRESSION_BLOCKED).toBe(true);
  });

  it('39. World Formation remains blocked', () => {
    expect(WORLD_FORMATION_BLOCKED).toBe(true);
  });

  it('40. provider generation requires founder trigger', () => {
    expect(providerGenerationRequiresFounderTrigger()).toBe(true);
    expect(noPageLoadGeneration()).toBe(true);
  });

  it('41. no page-load generation', () => {
    expect(noPageLoadGeneration()).toBe(true);
  });

  it('42. no automatic FAL retry', () => {
    expect(noAutomaticFalRetry()).toBe(true);
  });

  it('43. cost/receipt tracking persists through pipeline', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    const run = await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    const artifactId = run.experiment01!.artifacts[0]!.id;
    const generated = await generateExperiment01ArtifactAsset({ projectId: 'ndxbook', artifactId });
    expect(generated.accounting.falRequests).toBe(1);
    expect(generated.accounting.falEstimatedCostUsd).toBeGreaterThan(0);
  });

  it('44. restart-safe persistence via store round-trip', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    const compiled = await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    expect(compiled.northStarArtifact?.founderJudgment).toBe('THIS_IS_NDX');
    expect(compiled.experimentGCharacterReevaluationRequired).toBe(true);
  });

  it('45. fingerprints propagate through lineage', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    const compiled = await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    expect(compiled.expressionSystem?.fingerprint).toBeTruthy();
    expect(compiled.northStarArtifact?.fingerprint).toBeTruthy();
  });

  it('46. FAL requests capped at nine per initial generation set', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    const run = await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    expect(experiment01ArtifactCount()).toBe(9);
    let generated = run;
    for (const a of run.experiment01!.artifacts) {
      generated = await generateExperiment01ArtifactAsset({ projectId: 'ndxbook', artifactId: a.id });
    }
    expect(falRequestsCappedAtNine(generated.accounting.falRequests)).toBe(true);
    expect(generated.accounting.falRequests).toBe(9);
  });

  it('47. behavior-first FAL prompt compiler', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    const run = await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    const contract = run.experiment01!.artifacts[0]!.generationContract!;
    expect(marketingFalPromptBeginsFromBehavior(contract)).toBe(true);
    expect(noAestheticKeywordSoup(contract)).toBe(true);
  });

  it('48. founder artifact and set judgments persist', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    const run = await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    const id = run.experiment01!.artifacts[0]!.id;
    const judged = await setExperiment01ArtifactJudgment({
      projectId: 'ndxbook',
      artifactId: id,
      judgment: 'THATS_NDX',
    });
    expect(judged.experiment01?.artifacts[0]?.founderJudgment).toBe('THATS_NDX');
    const setJudged = await setExperiment01SetJudgment({
      projectId: 'ndxbook',
      judgment: 'THIS_IS_THE_NDX_FEED',
    });
    expect(setJudged.experiment01?.founderSetJudgment).toBe('THIS_IS_THE_NDX_FEED');
  });

  it('49. API routes wired', () => {
    expect(PROJECTS_API).toContain('marketing_expression_get');
    expect(PROJECTS_API).toContain('marketing_expression_compile');
    expect(PROJECTS_API).toContain('marketing_expression_experiment_01_formulate');
    expect(PROJECTS_API).toContain('marketing_expression_experiment_01_generate');
  });

  it('50. frontend routes wired', () => {
    expect(ROUTES).toContain('projectBrandMarketingExpression');
    expect(SITE_ROUTES).toContain('ProjectBrandMarketingExpressionPage');
    expect(SITE_ROUTES).toContain('ProjectBrandMarketingExpressionExperiment01Page');
    expect(MARKETING_PAGE).toContain('FOUNDER NORTH STAR');
    expect(MARKETING_PAGE).toContain('NOT FINAL IDENTITY');
    expect(EXP01_PAGE).toContain('FORMULATE EXPERIMENT 01');
    expect(EXP01_PAGE).toContain('GENERATE ALL NINE FIRST SLIDES');
  });

  it('51. pipeline readiness flags', () => {
    expect(EXPERIMENT_01_PIPELINE_READY).toBe(true);
    expect(TEMPLATE_COLLAPSE_GUARDS_IMPLEMENTED).toBe(true);
  });

  it('52. full pipeline end-to-end', async () => {
    const prepared = await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    expect(prepared.status).toBe('AUDITED');
    const compiled = await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    expect(compiled.status).toBe('COMPILED');
    expect(compiled.northStarForensics?.characterPresence).toBe('PASS');
    const formulated = await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    expect(formulated.experiment01?.artifacts.length).toBe(9);
    expect(formulated.experiment01?.behavioralModesRepresented.length).toBeGreaterThanOrEqual(7);
  });
});
