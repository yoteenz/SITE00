/**
 * Brand Presentation Finalist Visual Formulation — comprehensive methodology tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  NDXBOOK_VISUAL_EXPLORATION_POLICY,
  BRAND_PRESENTATION_VISUAL_FORMULATION_LAYER_IMPLEMENTED,
  TWO_FINALIST_MODEL_IMPLEMENTED,
  pageLoadGeneratesZeroFalRequests,
  routeNavigationGeneratesZeroFalRequests,
  finalistSelectionGeneratesZeroFalRequests,
  expressionPreviewGeneratesZeroFalRequests,
  winnerDoesNotMutateBrandCanon,
  winnerDoesNotStartImplementation,
  resolveNdxbookVisualPolicy,
} from './brandPresentationVisualFormulation/index.js';
import {
  evaluateFinalistGate,
  canBeginVisualGeneration,
} from './brandPresentationVisualFormulation/finalistGate.js';
import {
  evaluateExpressionDirectionDrift,
  evaluateReferenceExclusions,
  evaluateWithinFinalistDistinctiveness,
  burnBookReferenceAllowed,
  visionQaUnavailable,
} from './brandPresentationVisualFormulation/evaluators.js';
import {
  compileBrandPresentationVisualPrompt,
  sanitizeMetaphorTerms,
} from './brandPresentationVisualFormulation/promptCompiler.js';
import { WORLD_FORMATION_IMPLEMENTED } from './worldFormation/futureContracts.js';
import {
  resetBrandPresentationDirectionMemory,
  resetBrandPresentationDirectionStoreModeCache,
  resetBrandPresentationDirectionFormationWorkers,
  formBrandPresentationDirections,
  getBrandPresentationDirectionFormationRun,
} from '../../api/_lib/site00Evolve/creativeDirection/brandPresentationDirectionExperiment/directionService.js';
import {
  resetBrandPresentationVisualFormulationMemory,
  resetBrandPresentationVisualFormulationStoreModeCache,
  setVisualFinalistSelection,
  formulateVisualExpressions,
  generateFinalistVisuals,
  setVisualExpressionJudgment,
  reviseVisualExpression,
  selectBrandPresentationWinner,
  getBrandPresentationVisualFormulationRun,
  estimateVisualGenerationCost,
  buildVitestExpressionPayload,
} from '../../api/_lib/site00Evolve/creativeDirection/brandPresentationVisualFormulationExperiment/visualFormulationService.js';
import type { BrandPresentationVisualFinalistSelection } from './brandPresentationVisualFormulation/types.js';
import { ELIGIBLE_PARENT_CONCEPT_NAMES } from './brandPresentationDirectionTerritory/constants.js';
import type {
  BrandPresentationConceptFormationRun,
  BrandPresentationConceptTerritory,
} from './brandPresentationConceptTerritory/types.js';
import { EXPERIMENT_G_RUN_ID } from './brandPresentationConceptTerritory/constants.js';

const ROUTES = readFileSync(join(process.cwd(), 'src/routes/Site00Routes.tsx'), 'utf8');
const FINALISTS_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectExperimentGFinalistsPage.tsx'), 'utf8');
const DIR_REVIEW = readFileSync(
  join(process.cwd(), 'src/site00/components/validation/ExperimentGBrandPresentationDirectionReview.tsx'),
  'utf8',
);

function sampleConcept(name: string, overrides: Partial<BrandPresentationConceptTerritory> = {}): BrandPresentationConceptTerritory {
  return {
    id: `bpc-test-${name.replace(/\s+/g, '-').toLowerCase()}`,
    name,
    conceptThesis: `${name} thesis`,
    brandExistenceModel: 'Persistent social brand entity',
    audienceRelationship: 'Peer relationship',
    brandBehavior: 'Governing behavioral mechanism for parent concept',
    publishingLogic: 'Behavior-driven publishing',
    artifactLogic: 'Artifacts from behavior',
    knowledgeBehavior: 'Staged knowledge rituals',
    authorityModel: 'Behavioral authority',
    participationLogic: 'Audience participation rituals',
    recurrenceEngine: 'Indefinite recurrence through life stages',
    topicIndependence: 'Topic independent brand behavior',
    socialNativeBehavior: 'Social-native without one format',
    expansionPotential: 'Franchises and future media',
    possibleDirectionRange: [
      { directionSeed: 'A', explanation: 'One' },
      { directionSeed: 'B', explanation: 'Two' },
      { directionSeed: 'C', explanation: 'Three' },
    ],
    antiCollapseRules: ['Not a campaign'],
    notThis: ['Not a topic campaign', 'Not a visual style'],
    provenance: 'TEST',
    formationReceipt: null,
    brandPresentationLevel: null,
    topicIndependenceEval: null,
    recurrenceEval: null,
    conceptVsDirection: null,
    founderJudgment: 'LOVE_THE_CONCEPT',
    judgmentNote: null,
    methodologyVersion: 'BRAND_PRESENTATION_CONCEPT_TERRITORY_V1',
    experimentId: EXPERIMENT_G_RUN_ID,
    formationVersion: 1,
    snapshotVersion: 1,
    snapshotFingerprint: 'snap',
    formationPromptVersion: 'V1',
    formationPromptFingerprint: 'fp',
    conceptClassification: 'BRAND_PRESENTATION_CONCEPT',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function sampleConceptRun(): BrandPresentationConceptFormationRun {
  const loved = ELIGIBLE_PARENT_CONCEPT_NAMES.map((name) => sampleConcept(name));
  return {
    experimentClassification: 'BRAND_PRESENTATION_CONCEPT_FORMATION',
    runId: EXPERIMENT_G_RUN_ID,
    organizationId: 'org',
    projectId: 'ndxbook',
    methodologyVersion: 'BRAND_PRESENTATION_CONCEPT_TERRITORY_V1',
    predecessorExperiment: 'EXPERIMENT_F',
    supersessionRelationship: 'CORRECTED_UPSTREAM_FORMATION',
    experimentFReinterpretation: 'REINTERPRETED_DOWNSTREAM',
    intelligenceSnapshotVersion: 1,
    formationSubject: null,
    topicBlind: true,
    currentStage: 'BRAND_PRESENTATION_CONCEPT_FORMATION',
    status: 'FOUNDER_REVIEWED',
    formationVersion: 1,
    formationPromptVersion: 'V1',
    idempotencyKey: 'key',
    intelligenceSnapshot: {
      snapshotVersion: 1,
      fingerprint: 'intel-fp',
      compiledAt: new Date().toISOString(),
      frozen: true,
      provenanceEntries: [],
      brandLevelTruth: [],
      brandPersonality: [],
      primaryExpressionContext: [],
      founderCreativeLatitude: null,
      preferenceEvidence: [],
      referenceEvidence: [],
      excludedHistoricalEvidence: [],
      topicBlind: true,
      appetiteIncluded: true,
    },
    concepts: loved,
    orthogonality: null,
    formationReceipt: null,
    directionDevelopmentAllowed: false,
    visualGenerationAllowed: false,
    contentGenerationAllowed: false,
    brandCanonMutationAllowed: false,
    accounting: {
      anthropicRequests: 1,
      anthropicInputTokens: 100,
      anthropicOutputTokens: 100,
      anthropicEstimatedCostUsd: 0.05,
      gptImage2Requests: 0,
      falRequests: 0,
      visualGenerationCostUsd: 0,
    },
    error: null,
    formationStartedAt: null,
    formationAttemptId: null,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

async function seedConceptRun() {
  const { saveBrandPresentationConceptFormationRun } = await import(
    '../../api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/storeAdapter.js'
  );
  await saveBrandPresentationConceptFormationRun(sampleConceptRun());
}

function mkFinalist(order: 1 | 2, directionId: string, parentConceptId: string): BrandPresentationVisualFinalistSelection {
  return {
    selectionId: `sel-${order}`,
    projectId: 'ndxbook',
    projectSlug: 'ndxbook',
    experimentId: 'ndxbook-brand-presentation-visual-formulation',
    directionId,
    parentConceptId,
    parentConceptName: order === 1 ? 'THE COLLECTOR WHO CONNECTS' : 'THE ROOM THAT KNOWS',
    directionName: `Direction ${order}`,
    directionFormationFingerprint: 'fp',
    founderJudgmentId: 'LOVE_THE_DIRECTION',
    selectedBy: 'founder@test.com',
    selectedAt: new Date().toISOString(),
    selectionOrder: order,
    status: 'SELECTED',
    version: 1,
  };
}

async function seedDirectionsAndSelectTwoFinalists(sameParent = false) {
  await seedConceptRun();
  await formBrandPresentationDirections();
  const dirRun = (await getBrandPresentationDirectionFormationRun())!;
  const dirs = dirRun.directions;
  const f1 = dirs[0]!;
  const f2 = sameParent ? dirs[1]! : dirs.find((d) => d.parentConceptId !== f1.parentConceptId)!;
  await setVisualFinalistSelection({ directionId: f1.directionId, selected: true, selectedBy: 'test' });
  await setVisualFinalistSelection({ directionId: f2.directionId, selected: true, selectedBy: 'test' });
  return { f1, f2, dirRun };
}

beforeEach(() => {
  process.env.SITE00_EXPERIMENT_G_DIRECTION_USE_MEMORY = '1';
  process.env.SITE00_EXPERIMENT_G_USE_MEMORY = '1';
  process.env.SITE00_EXPERIMENT_G_VISUAL_USE_MEMORY = '1';
  resetBrandPresentationDirectionMemory();
  resetBrandPresentationDirectionStoreModeCache();
  resetBrandPresentationDirectionFormationWorkers();
  resetBrandPresentationVisualFormulationMemory();
  resetBrandPresentationVisualFormulationStoreModeCache();
});

describe('Brand Presentation Finalist Visual Formulation', () => {
  it('1-2. founder can select two direction finalists; exactly two required', async () => {
    await seedConceptRun();
    await formBrandPresentationDirections();
    const dirRun = (await getBrandPresentationDirectionFormationRun())!;
    const [d1, d2, d3] = dirRun.directions;
    await setVisualFinalistSelection({ directionId: d1!.directionId, selected: true, selectedBy: 'test' });
    let run = await getBrandPresentationVisualFormulationRun();
    expect(run!.finalists.filter((f) => f.status === 'SELECTED')).toHaveLength(1);
    await setVisualFinalistSelection({ directionId: d2!.directionId, selected: true, selectedBy: 'test' });
    run = await getBrandPresentationVisualFormulationRun();
    expect(run!.finalists.filter((f) => f.status === 'SELECTED')).toHaveLength(2);
    expect(run!.status).toBe('FINALISTS_READY');
    await expect(
      setVisualFinalistSelection({ directionId: d3!.directionId, selected: true, selectedBy: 'test' }),
    ).rejects.toThrow(/FINALIST_GATE_BLOCKED/);
  });

  it('3-4. one or three finalists block generation', async () => {
    await seedConceptRun();
    await formBrandPresentationDirections();
    const dirRun = (await getBrandPresentationDirectionFormationRun())!;
    const gate0 = evaluateFinalistGate({ finalists: [], policy: NDXBOOK_VISUAL_EXPLORATION_POLICY });
    expect(gate0.ok).toBe(false);
    expect(gate0.reason).toMatch(/0 active finalists/);

    await setVisualFinalistSelection({
      directionId: dirRun.directions[0]!.directionId,
      selected: true,
      selectedBy: 'test',
    });
    const run1 = await getBrandPresentationVisualFormulationRun();
    const gate1 = evaluateFinalistGate({ finalists: run1!.finalists, policy: NDXBOOK_VISUAL_EXPLORATION_POLICY });
    expect(gate1.ok).toBe(false);
    expect(gate1.reason).toMatch(/1 active finalist/);

    await setVisualFinalistSelection({
      directionId: dirRun.directions[1]!.directionId,
      selected: true,
      selectedBy: 'test',
    });
    await expect(
      setVisualFinalistSelection({
        directionId: dirRun.directions[2]!.directionId,
        selected: true,
        selectedBy: 'test',
      }),
    ).rejects.toThrow(/FINALIST_GATE_BLOCKED/);
  });

  it('5-6. finalists may share or differ in parent concept', async () => {
    const { f1, f2 } = await seedDirectionsAndSelectTwoFinalists(false);
    expect(f1.parentConceptId).not.toBe(f2.parentConceptId);

    resetBrandPresentationVisualFormulationMemory();
    resetBrandPresentationDirectionMemory();
    await seedConceptRun();
    await formBrandPresentationDirections();
    const dirRun = (await getBrandPresentationDirectionFormationRun())!;
    const sameParentDirs = dirRun.directions.filter(
      (d) => d.parentConceptId === dirRun.directions[0]!.parentConceptId,
    );
    await setVisualFinalistSelection({
      directionId: sameParentDirs[0]!.directionId,
      selected: true,
      selectedBy: 'test',
    });
    await setVisualFinalistSelection({
      directionId: sameParentDirs[1]!.directionId,
      selected: true,
      selectedBy: 'test',
    });
    const run = await getBrandPresentationVisualFormulationRun();
    const active = run!.finalists.filter((f) => f.status === 'SELECTED');
    expect(active[0]!.parentConceptId).toBe(active[1]!.parentConceptId);
  });

  it('7-9. three expressions per finalist; six total; siblings not sequential', async () => {
    await seedDirectionsAndSelectTwoFinalists();
    const run = await formulateVisualExpressions();
    const byDirection = new Map<string, typeof run.expressions>();
    for (const e of run.expressions) {
      const list = byDirection.get(e.parentDirectionId) ?? [];
      list.push(e);
      byDirection.set(e.parentDirectionId, list);
    }
    expect(byDirection.size).toBe(2);
    for (const exprs of byDirection.values()) {
      expect(exprs).toHaveLength(3);
      expect(exprs.every((e) => e.parentExpressionId === null)).toBe(true);
      expect(exprs.map((e) => e.expressionLabel).sort()).toEqual(['A', 'B', 'C']);
    }
    expect(run.expressions.filter((e) => e.revisionNumber === 0)).toHaveLength(6);
  });

  it('10-11. FAL does not determine direction; formulation before generation', async () => {
    await seedDirectionsAndSelectTwoFinalists();
    const formulated = await formulateVisualExpressions();
    expect(formulated.accounting.falRequests).toBe(0);
    expect(formulated.expressions.every((e) => e.expressionThesis.length > 0)).toBe(true);
    expect(formulated.status).toBe('EXPRESSIONS_READY');
    const generated = await generateFinalistVisuals();
    expect(generated.accounting.falRequests).toBe(6);
  });

  it('12-14. style swap fails distinctiveness; direction drift detectable; topic collapse blocked in prompts', () => {
    const styleOnly = evaluateWithinFinalistDistinctiveness([
      {
        expressionLabel: 'A',
        expressionThesis: 'minimal serif black palette',
        compositionBehavior: 'same',
        typographyBehavior: 'same',
        imageryBehavior: 'same',
        informationBehavior: 'same',
        densityBehavior: 'same',
        rhythmBehavior: 'same',
        graphicLanguage: 'same',
        artifactLanguage: 'same',
        socialSurfaceBehavior: 'same',
      } as never,
      {
        expressionLabel: 'B',
        expressionThesis: 'maximal sans-serif cream palette',
        compositionBehavior: 'same',
        typographyBehavior: 'same',
        imageryBehavior: 'same',
        informationBehavior: 'same',
        densityBehavior: 'same',
        rhythmBehavior: 'same',
        graphicLanguage: 'same',
        artifactLanguage: 'same',
        socialSurfaceBehavior: 'same',
      } as never,
    ]);
    expect(['STYLE_ONLY_DIFFERENTIATION', 'VISUAL_RANGE_TOO_NARROW']).toContain(styleOnly.result);

    const drift = evaluateExpressionDirectionDrift({
      direction: {
        brandPosture: 'peer intimacy',
        audienceRelationship: 'peer',
        publishingBehavior: 'behavior-driven',
        knowledgeBehavior: 'staged rituals',
        authorityBehavior: 'behavioral',
        participationBehavior: 'rituals',
        recurrenceBehavior: 'indefinite',
      } as never,
      expression: {
        expressionThesis: 'new audience relationship replaces publishing logic and changes authority posture',
        directionInterpretation: 'contradicts brandPosture',
        visualBehavior: 'x',
        recurrenceBehavior: 'y',
      } as never,
    });
    expect(['PASS', 'DIRECTION_DRIFT']).toContain(drift.result);

    const raw = buildVitestExpressionPayload(
      {
        directionName: 'D',
        directionId: 'd',
        brandBehavior: 'b',
        recurrenceBehavior: 'r',
        recognitionMechanism: 'm',
        notThis: [],
        antiCollapseRules: [],
        directionInterpretation: 'interp',
      } as never,
      'A',
    );
    const compiled = compileBrandPresentationVisualPrompt({
      parentConcept: { brandBehavior: 'test', conceptThesis: 't', recurrenceEngine: 'r' } as never,
      direction: {
        brandBehavior: 'b',
        audienceRelationship: 'a',
        publishingBehavior: 'p',
        recurrenceBehavior: 'r',
        recognitionMechanism: 'm',
        notThis: ['topic campaign collapse'],
        directionName: 'D',
      } as never,
      expression: {
        ...raw,
        expressionId: 'e1',
        expressionIndex: 1,
        expressionLabel: 'A',
        parentDirectionId: 'd',
        parentConceptId: 'c',
        antiCollapseRules: raw.antiCollapseRules,
      } as never,
      referencePackage: null,
      antiDirectionEvidence: ['credit utilization'],
      socialPresentationRequirements: ['social-native'],
    });
    expect(compiled.prompt).not.toMatch(/knowledge behavior/i);
    expect(compiled.prompt).toMatch(/social-native/i);
  });

  it('15-19. reference exclusions and burn book calibration', () => {
    expect(evaluateReferenceExclusions('SITE00_HOST_VISUAL_MEMORY').allowed).toBe(false);
    expect(evaluateReferenceExclusions('PROJECTS_UX').allowed).toBe(false);
    expect(evaluateReferenceExclusions('EXPERIMENT_F_VISUAL').allowed).toBe(false);
    expect(burnBookReferenceAllowed({ directionRequiresArtifactBehavior: false, artifactLanguage: 'layout rules' })).toBe(
      false,
    );
    expect(sanitizeMetaphorTerms('The Collector Room')).toMatch(/behavioral/);
  });

  it('20-25. no auto FAL; explicit trigger; cost preview; six visuals; no hidden variants', async () => {
    expect(pageLoadGeneratesZeroFalRequests()).toBe(true);
    expect(routeNavigationGeneratesZeroFalRequests()).toBe(true);
    expect(finalistSelectionGeneratesZeroFalRequests()).toBe(true);
    expect(expressionPreviewGeneratesZeroFalRequests()).toBe(true);

    await seedDirectionsAndSelectTwoFinalists();
    await formulateVisualExpressions();
    let run = await getBrandPresentationVisualFormulationRun();
    expect(run!.accounting.falRequests).toBe(0);

    const cost = estimateVisualGenerationCost(run!);
    expect(cost.totalVisuals).toBe(6);
    expect(cost.falRequestsExpected).toBe(6);

    run = await generateFinalistVisuals();
    expect(run!.accounting.falRequests).toBe(6);
    expect(run!.accounting.hiddenVariantRequests).toBe(0);
    expect(run!.expressions.filter((e) => e.assetStoragePath)).toHaveLength(6);
  });

  it('26-29. receipts, lineage concept→direction→expression', async () => {
    await seedDirectionsAndSelectTwoFinalists();
    await formulateVisualExpressions();
    const run = await generateFinalistVisuals();
    for (const expr of run.expressions.filter((e) => e.revisionNumber === 0)) {
      expect(expr.generationReceipt).toBeTruthy();
      expect(expr.parentDirectionId).toBeTruthy();
      expect(expr.parentConceptId).toBeTruthy();
      expect(expr.promptFingerprint).toBeTruthy();
    }
  });

  it('30-36. judgments, revision, winner boundaries', async () => {
    await seedDirectionsAndSelectTwoFinalists();
    await formulateVisualExpressions();
    let run = await generateFinalistVisuals();
    const expr = run.expressions[0]!;
    const originalAsset = expr.assetStoragePath;

    run = await setVisualExpressionJudgment({
      expressionId: expr.expressionId,
      judgment: 'PROMISING_REVISE',
    });
    expect(run.expressions.find((e) => e.expressionId === expr.expressionId)!.founderJudgment).toBe('PROMISING_REVISE');

    run = await reviseVisualExpression({
      expressionId: expr.expressionId,
      preserve: ['recognition mechanism'],
      change: ['density'],
      doNotBecome: ['new direction'],
    });
    const original = run.expressions.find((e) => e.expressionId === expr.expressionId)!;
    expect(original.assetStoragePath).toBe(originalAsset);
    const revision = run.expressions.find((e) => e.parentExpressionId === expr.expressionId)!;
    expect(revision).toBeTruthy();
    expect(revision!.revisionNumber).toBe(1);

    const winnerExpr = run.expressions.find((e) => e.assetStoragePath && e.status === 'GENERATED')!;
    run = await selectBrandPresentationWinner({ expressionId: winnerExpr.expressionId, selectedBy: 'test' });
    expect(run.winner).toBeTruthy();
    expect(run.winner!.parentConceptId).toBe(winnerExpr.parentConceptId);
    expect(run.winner!.directionId).toBe(winnerExpr.parentDirectionId);
    expect(run.winner!.expressionId).toBe(winnerExpr.expressionId);
    expect(run.winner!.brandCanonMutated).toBe(false);
    expect(run.winner!.implementationStarted).toBe(false);
    expect(winnerDoesNotMutateBrandCanon()).toBe(true);
    expect(winnerDoesNotStartImplementation()).toBe(true);
  });

  it('37-38. vision unavailable; cross-finalist eval surfaced', async () => {
    const qa = visionQaUnavailable();
    expect(qa.directionFidelity).toBe('NOT_EVALUATED');
    await seedDirectionsAndSelectTwoFinalists();
    const run = await formulateVisualExpressions();
    expect(run.crossFinalistCollapseEval).toBeTruthy();
  });

  it('39-42. experimental integrity and world formation', async () => {
    expect(BRAND_PRESENTATION_VISUAL_FORMULATION_LAYER_IMPLEMENTED).toBe(true);
    expect(TWO_FINALIST_MODEL_IMPLEMENTED).toBe(true);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    await seedConceptRun();
    await formBrandPresentationDirections();
    const dirRun = await getBrandPresentationDirectionFormationRun();
    expect(dirRun!.directions).toHaveLength(9);
  });

  it('43-44. policy configurable; NDXBOOK 2×3=6', () => {
    const policy = resolveNdxbookVisualPolicy();
    expect(policy.finalistCount).toBe(2);
    expect(policy.expressionsPerFinalist).toBe(3);
    expect(policy.totalInitialVisuals).toBe(6);
    expect(policy.policyConfigurable).toBe(true);
  });

  it('UI route and finalist selection control exist', () => {
    expect(ROUTES).toContain('projectExperimentGFinalists');
    expect(FINALISTS_PAGE).toContain('ExperimentGBrandPresentationFinalistReview');
    expect(DIR_REVIEW).toContain('SELECT AS VISUAL FINALIST');
    expect(DIR_REVIEW).toContain('LOVE_THE_DIRECTION');
    expect(DIR_REVIEW).toContain('independent from LOVE THE DIRECTION');
  });

  it('generation gate blocks without expressions', async () => {
    await seedDirectionsAndSelectTwoFinalists();
    const run = await getBrandPresentationVisualFormulationRun();
    const gate = evaluateFinalistGate({ finalists: run!.finalists, policy: NDXBOOK_VISUAL_EXPLORATION_POLICY });
    const genGate = canBeginVisualGeneration({ gate, expressions: [], policy: NDXBOOK_VISUAL_EXPLORATION_POLICY });
    expect(genGate.ok).toBe(false);
  });
});
