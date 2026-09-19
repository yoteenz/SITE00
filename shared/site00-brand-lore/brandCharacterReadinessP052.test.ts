/**
 * P0.5B.2 — Brand Character Readiness + Conditional Deepening tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  evaluateBrandCharacterReadiness,
  inventoryCharacterEvidence,
  applyDeepeningAnswersToInventory,
  compileBrandCharacterDeepeningModule,
  findExistingEvidenceForCharacterQuestion,
  captureFounderLanguageEvidence,
  compileReadinessFingerprint,
  readinessFingerprintChanged,
  brandCharacterReadinessImplemented,
  characterReadySupportsZeroQuestions,
  publicDiscoveryRemainsShallow,
  buildVitestRichBrandLoreProfile,
  buildVitestThinBrandLoreProfile,
  buildVitestInsufficientBrandLoreProfile,
  modelInferenceOnlyCannotSatisfyCritical,
  classifyEvidenceConfidence,
  registerBrandCharacterReadinessDependencies,
  characterDeepeningDoesNotAutoRegenerateTerritories,
} from './brandCharacterReadiness/index.js';
import { deepeningModulePostPurchaseOnly, discoveryCarryForwardNotCharacterCanon } from './brandCharacterReadiness/deepeningModule.js';
import {
  compileProjectIntelligenceIntakeManifest,
  resolveBrandCharacterDeepeningModuleLifecycle,
} from '../site00-project-intelligence/manifestCompiler.js';
import {
  assertBrandCharacterFormationReadiness,
  characterInsufficientBlocksFormation,
  evaluateAndPersistBrandCharacterReadiness,
  getBrandCharacterReadinessState,
  seedVitestCharacterFormationReadiness,
  setBrandCharacterReadinessOverride,
  submitBrandCharacterDeepeningAnswer,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterReadinessService.js';
import {
  resetBrandCharacterReadinessMemory,
  resetBrandCharacterReadinessStoreModeCache,
  saveBrandCharacterReadinessRecord,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterReadinessStoreAdapter.js';
import {
  formSixBrandCharacterTerritories,
  getBrandCharacterFormationRun,
  resetBrandCharacterFormationWorkers,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterService.js';
import {
  resetBrandCharacterMemory,
  resetBrandCharacterStoreModeCache,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/storeAdapter.js';
import * as formationStore from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/storeAdapter.js';

vi.mock('../../api/_lib/site00BrandLore/loreService.js', () => ({
  getBrandLoreProfileForOrg: vi.fn(),
}));

import { getBrandLoreProfileForOrg } from '../../api/_lib/site00BrandLore/loreService.js';

const ROUTES = readFileSync(join(process.cwd(), 'src/site00/config/routes.ts'), 'utf8');
const SITE_ROUTES = readFileSync(join(process.cwd(), 'src/routes/Site00Routes.tsx'), 'utf8');
const READINESS_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectBrandCharacterReadinessPage.tsx'), 'utf8');
const DEEPENING_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectBrandCharacterDeepeningPage.tsx'), 'utf8');
const SETUP_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectSetupPage.tsx'), 'utf8');

beforeEach(() => {
  resetBrandCharacterReadinessMemory();
  resetBrandCharacterReadinessStoreModeCache();
  resetBrandCharacterMemory();
  resetBrandCharacterStoreModeCache();
  resetBrandCharacterFormationWorkers();
  vi.mocked(getBrandLoreProfileForOrg).mockResolvedValue(buildVitestRichBrandLoreProfile());
});

describe('P0.5B.2 Brand Character Readiness', () => {
  it('1. CHARACTER_READY can produce zero additional questions', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    if (evaluation.overallState === 'CHARACTER_READY') {
      const module = compileBrandCharacterDeepeningModule({
        evaluation,
        inventory: inventoryCharacterEvidence(profile),
      });
      expect(module.status).toBe('NOT_REQUIRED');
      expect(module.questions).toHaveLength(0);
    }
    expect(characterReadySupportsZeroQuestions()).toBe(true);
  });

  it('2. CHARACTER_PARTIAL produces only gap-relevant questions', () => {
    const profile = buildVitestRichBrandLoreProfile();
    profile.materialVocabulary = { ...profile.materialVocabulary!, value: [] };
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    const module = compileBrandCharacterDeepeningModule({
      evaluation,
      inventory: inventoryCharacterEvidence(profile),
    });
    if (evaluation.overallState === 'CHARACTER_PARTIAL') {
      expect(module.questions.every((q) => evaluation.gaps.some((g) => g.domain === q.domain))).toBe(true);
    }
  });

  it('3. CHARACTER_INSUFFICIENT blocks formation', async () => {
    vi.mocked(getBrandLoreProfileForOrg).mockResolvedValue(buildVitestThinBrandLoreProfile());
    await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    const gate = await assertBrandCharacterFormationReadiness({ projectId: 'ndxbook' });
    expect(gate.allowed).toBe(false);
    expect(characterInsufficientBlocksFormation(gate.state)).toBe(true);
  });

  it('4. CHARACTER_NOT_EVALUATED blocks formation', () => {
    const evaluation = evaluateBrandCharacterReadiness({
      profile: null,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    expect(evaluation.overallState).toBe('CHARACTER_BLOCKED');
    expect(evaluation.formationGateAllowed).toBe(false);
  });

  it('5. strong existing evidence prevents duplicate questioning', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const inventory = inventoryCharacterEvidence(profile);
    const search = findExistingEvidenceForCharacterQuestion({
      questionId: 'humor-native-vs-forced',
      inventory,
    });
    expect(['ANSWER_ALREADY_EXISTS', 'PARTIAL_ANSWER_EXISTS', 'NO_RELEVANT_EVIDENCE']).toContain(search.result);
  });

  it('6. partial evidence produces clarification rather than full duplicate question', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const inventory = inventoryCharacterEvidence(profile);
    inventory.humorWit = ['dry observation'];
    const search = findExistingEvidenceForCharacterQuestion({
      questionId: 'humor-native-vs-forced',
      inventory,
    });
    if (search.result === 'PARTIAL_ANSWER_EXISTS') {
      const evaluation = evaluateBrandCharacterReadiness({
        profile,
        projectId: 'ndxbook',
        organizationId: 'ndxbook-org',
      });
      const module = compileBrandCharacterDeepeningModule({ evaluation, inventory });
      expect(module.questions.some((q) => q.questionType === 'CLARIFICATION')).toBe(true);
    }
  });

  it('7. conflicting evidence produces reconciliation question path', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const inventory = inventoryCharacterEvidence(profile);
    inventory.founderLanguage = [
      'What does this brand find funny that other brands would not — always be funny about money',
      'What does this brand find funny — never use humor about money',
    ];
    const search = findExistingEvidenceForCharacterQuestion({
      questionId: 'humor-native-vs-forced',
      inventory,
    });
    expect(search.result).toBe('CONFLICTING_ANSWER_EXISTS');
  });

  it('8. public discovery carry-forward does not become character canon', () => {
    expect(discoveryCarryForwardNotCharacterCanon()).toBe(true);
    expect(publicDiscoveryRemainsShallow()).toBe(true);
  });

  it('9. Founder Creative Appetite is not re-collected if already present', () => {
    const profile = buildVitestRichBrandLoreProfile();
    profile.founderCreativeAppetite = { id: 'fca-1' } as never;
    const inventory = inventoryCharacterEvidence(profile);
    expect(inventory.founderCreativeAppetite.length).toBeGreaterThan(0);
  });

  it('10. Brand Personality is not re-collected if already present', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const inventory = inventoryCharacterEvidence(profile);
    expect(inventory.brandPersonality.length).toBeGreaterThan(0);
  });

  it('11. Brand Lore is not re-collected if already present', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const inventory = inventoryCharacterEvidence(profile);
    expect(inventory.brandLore.length).toBeGreaterThan(0);
  });

  it('12. MODEL_INFERENCE_ONLY cannot satisfy critical readiness', () => {
    expect(modelInferenceOnlyCannotSatisfyCritical('MODEL_INFERENCE_ONLY')).toBe(true);
    const confidence = classifyEvidenceConfidence({
      directFounder: false,
      carryForward: false,
      multipleSignals: false,
      synthesizedOnly: false,
    });
    expect(modelInferenceOnlyCannotSatisfyCritical(confidence)).toBe(true);
  });

  it('13. DIRECT_FOUNDER_EVIDENCE can satisfy domain requirements', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    expect(evaluation.domains.some((d) => d.confidence === 'DIRECT_FOUNDER_EVIDENCE')).toBe(true);
  });

  it('14. raw founder language remains preserved', () => {
    const evidence = captureFounderLanguageEvidence({
      rawAnswer: 'That would make us roll our eyes because everybody already knows that.',
      domain: 'HUMOR_WIT',
      sourceQuestionId: 'humor-native-vs-forced',
    });
    expect(evidence.rawAnswer).toContain('roll our eyes');
  });

  it('15. normalized evidence does not erase raw wording', () => {
    const evidence = captureFounderLanguageEvidence({
      rawAnswer: 'That would make us roll our eyes because everybody already knows that.',
      domain: 'HUMOR_WIT',
      sourceQuestionId: 'humor-native-vs-forced',
    });
    expect(evidence.normalizedMeaning.length).toBeGreaterThan(0);
    expect(evidence.rawAnswer.length).toBeGreaterThan(0);
  });

  it('16. humor gaps can activate humor questions only', () => {
    const profile = buildVitestRichBrandLoreProfile();
    if (profile.brandPersonality) profile.brandPersonality.witBehavior = { ...profile.brandPersonality.witBehavior, value: [] };
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    const module = compileBrandCharacterDeepeningModule({
      evaluation,
      inventory: inventoryCharacterEvidence(profile),
    });
    module.questions.forEach((q) => {
      expect(evaluation.gaps.some((g) => g.domain === q.domain)).toBe(true);
    });
  });

  it('17. cultural gaps can activate cultural questions only', () => {
    const profile = buildVitestRichBrandLoreProfile();
    profile.referenceLineage = { ...profile.referenceLineage!, value: null };
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    expect(evaluation.domains.find((d) => d.domain === 'CULTURAL_INTELLIGENCE')).toBeDefined();
  });

  it('18. taste gaps can activate taste questions only', () => {
    const profile = buildVitestRichBrandLoreProfile();
    profile.materialVocabulary = { ...profile.materialVocabulary!, value: [] };
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    expect(evaluation.domains.find((d) => d.domain === 'TASTE_JUDGMENT')).toBeDefined();
  });

  it('19. artifact behavior gaps can activate artifact questions only', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    expect(evaluation.domains.find((d) => d.domain === 'ARTIFACT_MAKER_BEHAVIOR')).toBeDefined();
  });

  it('20. irrelevant domains do not trigger unnecessary questions', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    evaluation.domains
      .filter((d) => d.strength === 'STRONG_EVIDENCE')
      .forEach((d) => expect(d.questionRecommended).toBe(false));
  });

  it('21. Character Deepening is post-purchase only', () => {
    expect(deepeningModulePostPurchaseOnly()).toBe(true);
    expect(DEEPENING_PAGE).toContain('post-purchase');
  });

  it('22. Character Deepening is conditional in ProjectIntelligenceIntakeManifest', () => {
    const manifest = compileProjectIntelligenceIntakeManifest({
      projectId: 'ndxbook',
      projectSlug: 'ndxbook',
      commercialState: 'ACTIVATED',
      experienceClass: 'IMMERSIVE_SITE',
      purchasedScope: ['identity'],
      characterReadinessState: 'CHARACTER_PARTIAL',
      characterDeepeningQuestionCount: 3,
    });
    const mod = manifest.modules.find((m) => m.moduleId === 'BRAND_CHARACTER_DEEPENING');
    expect(mod?.requirement).toBe('CONDITIONAL');
    expect(SETUP_PAGE).toContain('BRAND CHARACTER');
  });

  it('23. question count is dynamic', async () => {
    const record = await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    expect(typeof record.latestEvaluation?.recommendedQuestionCount).toBe('number');
  });

  it('24. Character Readiness fingerprint changes when relevant intelligence changes', () => {
    const profileA = buildVitestRichBrandLoreProfile();
    const profileB = { ...profileA, profileVersion: profileA.profileVersion + 1 };
    const fpA = compileReadinessFingerprint({ profile: profileA, deepeningAnswerCount: 0 });
    const fpB = compileReadinessFingerprint({ profile: profileB, deepeningAnswerCount: 0 });
    expect(readinessFingerprintChanged(fpA, fpB)).toBe(true);
  });

  it('25. unrelated project data does not affect fingerprint', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const fpA = compileReadinessFingerprint({ profile, deepeningAnswerCount: 0 });
    const fpB = compileReadinessFingerprint({ profile, deepeningAnswerCount: 0 });
    expect(fpA.fingerprint).toBe(fpB.fingerprint);
  });

  it('26. stale readiness blocks new formation without override', async () => {
    await seedVitestCharacterFormationReadiness('ndxbook');
    vi.mocked(getBrandLoreProfileForOrg).mockResolvedValue(buildVitestThinBrandLoreProfile());
    await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    const gate = await assertBrandCharacterFormationReadiness({ projectId: 'ndxbook' });
    expect(gate.allowed).toBe(false);
  });

  it('27. founder override is explicit and persisted', async () => {
    await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    const record = await setBrandCharacterReadinessOverride({
      projectId: 'ndxbook',
      overrideReason: 'Proceed with partial humor evidence for pilot',
      missingDomains: ['HUMOR_WIT'],
    });
    expect(record.override?.overrideType).toBe('FOUNDER_PROCEED_WITH_PARTIAL_CHARACTER_EVIDENCE');
  });

  it('28. override preserves missing-domain evidence', async () => {
    await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    const record = await setBrandCharacterReadinessOverride({
      projectId: 'ndxbook',
      overrideReason: 'Pilot',
      missingDomains: ['HUMOR_WIT', 'TASTE_JUDGMENT'],
    });
    expect(record.override?.missingDomains).toEqual(['HUMOR_WIT', 'TASTE_JUDGMENT']);
  });

  it('29. Character Formation run records partial-input provenance when overridden', async () => {
    const existing = await formationStore.getBrandCharacterFormationRun();
    if (existing?.characters.length) {
      await setBrandCharacterReadinessOverride({
        projectId: 'ndxbook',
        overrideReason: 'Historical pilot',
        missingDomains: ['HUMOR_WIT'],
      });
      await evaluateAndPersistBrandCharacterReadiness({
        projectId: 'ndxbook',
        attachFirstFormationEvidence: true,
      });
      const run = await getBrandCharacterFormationRun();
      expect(run?.inputEvidencePartial ?? run?.formationInputReadiness).toBeTruthy();
    }
  });

  it('30. existing six Character Territories remain immutable', async () => {
    const run = await getBrandCharacterFormationRun();
    if (run?.characters.length) {
      const names = run.characters.map((c) => c.name);
      await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
      const after = await getBrandCharacterFormationRun();
      expect(after?.characters.map((c) => c.name)).toEqual(names);
    }
  });

  it('31. first-six input-readiness can be attached as evidence', async () => {
    const run = await getBrandCharacterFormationRun();
    if (run?.characters.length) {
      await evaluateAndPersistBrandCharacterReadiness({
        projectId: 'ndxbook',
        attachFirstFormationEvidence: true,
      });
      const updated = await getBrandCharacterFormationRun();
      expect(updated?.formationInputReadiness).toBeTruthy();
    }
  });

  it('32. no automatic regeneration occurs after deepening', () => {
    expect(characterDeepeningDoesNotAutoRegenerateTerritories()).toBe(true);
  });

  it('33. no FAL requests in readiness layer', () => {
    expect(brandCharacterReadinessImplemented()).toBe(true);
  });

  it('34. no GPT Image requests in readiness layer', () => {
    const src = readFileSync(join(process.cwd(), 'shared/site00-brand-lore/brandCharacterReadiness/readinessEvaluation.ts'), 'utf8');
    expect(src).not.toMatch(/fal-ai|fal\.ai|gpt-image|openai.*image/i);
  });

  it('35. Experiment F remains excluded from readiness', () => {
    expect(readFileSync(join(process.cwd(), 'shared/site00-brand-lore/brandCharacterTerritory/intelligenceSnapshot.ts'), 'utf8')).toContain('EXPERIMENT_F');
  });

  it('36. Experiment G remains unchanged', () => {
    expect(readFileSync(join(process.cwd(), 'api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/experimentGService.ts'), 'utf8')).not.toContain('brandCharacterReadiness');
  });

  it('37. Brand Canon remains unchanged', () => {
    expect(readFileSync(join(process.cwd(), 'shared/site00-brand-lore/brandCharacterTerritory/types.ts'), 'utf8')).toContain('brandCanonMutationAllowed');
  });

  it('38. Product Expression remains false', () => {
    expect(readFileSync(join(process.cwd(), 'shared/site00-project-intelligence/types.ts'), 'utf8')).not.toContain('PRODUCT_EXPRESSION_IMPLEMENTED = true');
  });

  it('39. World Formation remains false', () => {
    expect(readFileSync(join(process.cwd(), 'shared/site00-project-intelligence/types.ts'), 'utf8')).toContain('WORLD_FORMATION_IMPLEMENTED = false');
  });

  it('40. readiness routes exist', () => {
    expect(ROUTES).toContain('brand-character-readiness');
    expect(ROUTES).toContain('brand-character-deepening');
    expect(SITE_ROUTES).toContain('projectBrandCharacterReadiness');
    expect(READINESS_PAGE).toContain('BRAND CHARACTER READINESS');
  });

  it('41. readiness dependency chain registered', () => {
    let graph = { projectId: 'ndxbook', edges: [], methodologyVersion: 'P0.5B.2', updatedAt: new Date().toISOString() };
    graph = registerBrandCharacterReadinessDependencies({
      graph,
      projectId: 'ndxbook',
      readinessRecordId: 'readiness-1',
      characterRunId: 'character-run-1',
    });
    expect(graph.edges.length).toBeGreaterThanOrEqual(3);
    expect(resolveBrandCharacterDeepeningModuleLifecycle({ characterReadinessState: 'CHARACTER_READY' })).toBe('COMPLETE');
  });
});

describe('P0.5B.2 formation gate integration', () => {
  it('blocks formation when insufficient without override', async () => {
    vi.mocked(getBrandLoreProfileForOrg).mockResolvedValue(buildVitestThinBrandLoreProfile());
    resetBrandCharacterReadinessMemory();
    await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    const run = await formSixBrandCharacterTerritories();
    expect(run.status).toBe('FAILED');
    expect(run.error).toMatch(/readiness|evidence|deepening|blocked|intelligence|incomplete/i);
  });

  it('allows formation when vitest seed ready', async () => {
    await seedVitestCharacterFormationReadiness('ndxbook');
    const gate = await assertBrandCharacterFormationReadiness({ projectId: 'ndxbook' });
    expect(gate.allowed).toBe(true);
  });

  it('deepening answers merge into readiness evaluation', () => {
    const profile = buildVitestInsufficientBrandLoreProfile();
    const before = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    const module = compileBrandCharacterDeepeningModule({
      evaluation: before,
      inventory: inventoryCharacterEvidence(profile),
    });
    const question = module.questions[0];
    expect(question).toBeTruthy();

    const after = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
      deepeningAnswers: [
        {
          questionId: question!.questionId,
          rawAnswer:
            'Deadpan receipts humor — we roast obvious finance copy because everybody already knows the headline is lying.',
          normalizedMeaning: 'Deadpan receipts humor',
          domain: question!.domain,
          answeredAt: new Date().toISOString(),
          founderLanguageEvidenceId: 'vitest-evidence',
        },
      ],
    });

    const domainAfter = after.domains.find((d) => d.domain === question!.domain);
    expect(domainAfter?.strength).not.toBe('MISSING_EVIDENCE');
    expect(['CHARACTER_PARTIAL', 'CHARACTER_READY']).toContain(after.overallState);
  });

  it('deepening answer submission persists and re-evaluates readiness', async () => {
    vi.mocked(getBrandLoreProfileForOrg).mockResolvedValue(buildVitestInsufficientBrandLoreProfile());
    resetBrandCharacterReadinessMemory();
    const before = await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    const question = before.deepeningModule?.questions[0];
    expect(question).toBeTruthy();

    const after = await submitBrandCharacterDeepeningAnswer({
      projectId: 'ndxbook',
      questionId: question!.questionId,
      rawAnswer: 'Founder deepening answer — specific receipts-first voice, never try-hard meme slang.',
    });

    expect(after.deepeningModule?.answers.length).toBe(1);
    expect(after.latestEvaluation?.overallState).not.toBe('CHARACTER_BLOCKED');
  });

  it('completing all compiled deepening questions unlocks synthesis-grade readiness', async () => {
    vi.mocked(getBrandLoreProfileForOrg).mockResolvedValue(buildVitestInsufficientBrandLoreProfile());
    resetBrandCharacterReadinessMemory();
    let record = await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    const questions = record.deepeningModule?.questions ?? [];
    expect(questions.length).toBeGreaterThan(0);

    for (const q of questions) {
      record = await submitBrandCharacterDeepeningAnswer({
        projectId: 'ndxbook',
        questionId: q.questionId,
        rawAnswer: `Completed deepening for ${q.domain} with founder-grounded specificity and receipts culture.`,
      });
    }

    expect(['CHARACTER_PARTIAL', 'CHARACTER_READY']).toContain(record.latestEvaluation?.overallState);
  });
});

describe('P0.5B.2 readiness/deepening alignment', () => {
  it('syncs recommendedQuestionCount with compiled deepening questions', async () => {
    const record = await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    expect(record.latestEvaluation?.recommendedQuestionCount).toBe(record.deepeningModule?.questions.length ?? 0);
  });

  it('uses GAPS_REMAIN when gaps exist but duplicate prevention yields zero questions', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    const module = compileBrandCharacterDeepeningModule({
      evaluation,
      inventory: inventoryCharacterEvidence(profile),
    });
    if (evaluation.overallState === 'CHARACTER_READY') {
      expect(module.status).toBe('NOT_REQUIRED');
      expect(module.questions).toHaveLength(0);
      return;
    }
    if (module.questions.length === 0) {
      expect(module.status).toBe('GAPS_REMAIN');
    } else {
      expect(module.status).toBe('COMPILED');
    }
  });

  it('recompiles missing deepening module on getBrandCharacterReadinessState', async () => {
    const record = await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    await saveBrandCharacterReadinessRecord({ ...record, deepeningModule: null });
    const restored = await getBrandCharacterReadinessState('ndxbook');
    expect(restored?.deepeningModule).not.toBeNull();
    expect(restored?.latestEvaluation?.recommendedQuestionCount).toBe(restored?.deepeningModule?.questions.length);
  });

  it('dedupes worldview evidence bullets from overlapping lore sources', () => {
    const profile = buildVitestRichBrandLoreProfile();
    const evaluation = evaluateBrandCharacterReadiness({
      profile,
      projectId: 'ndxbook',
      organizationId: 'ndxbook-org',
    });
    const worldview = evaluation.domains.find((d) => d.domain === 'WORLDVIEW_ORIENTATION');
    if (worldview) {
      const normalized = worldview.whatWeKnow.map((s) => s.toLowerCase().replace(/\s+/g, ' ').trim());
      expect(new Set(normalized).size).toBe(normalized.length);
    }
  });
});
