/**
 * Parent-concept finalist direction visualization — NDXBOOK 2×3×1 = 6 benchmarks.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  NDXBOOK_PARENT_FINALIST_SCAN_POLICY,
  NDXBOOK_VISUAL_EXPLORATION_POLICY,
  PARENT_FINALIST_SCAN_IMPLEMENTED,
  DIRECTION_BENCHMARK_JUDGMENTS,
  pageLoadGeneratesZeroFalRequests,
  parentFinalistSelectionGeneratesZeroFalRequests,
  benchmarkPreviewGeneratesZeroFalRequests,
  resolveNdxbookVisualPolicy,
  winnerDoesNotMutateBrandCanon,
} from './brandPresentationVisualFormulation/index.js';
import {
  evaluateParentFinalistGate,
  canBeginBenchmarkGeneration,
  collectorDirectionsExcludedFromDispatch,
  isParentFinalistScanPolicy,
} from './brandPresentationVisualFormulation/parentFinalistGate.js';
import {
  evaluateReferenceExclusions,
  evaluateSiblingBenchmarkDistinctiveness,
  directionBenchmarkVisionQaUnavailable,
} from './brandPresentationVisualFormulation/evaluators.js';
import {
  compileDirectionBenchmarkPrompt,
  sanitizeMetaphorTerms,
} from './brandPresentationVisualFormulation/promptCompiler.js';
import { buildDirectionBenchmarkFormationPayload } from './brandPresentationVisualFormulation/directionBenchmarkPrompt.js';
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
  prepareVisualFormulationRun,
  formulateVisualExpressions,
  generateFinalistVisuals,
  setDirectionBenchmarkJudgment,
  reviseDirectionBenchmark,
  selectBrandPresentationWinner,
  getBrandPresentationVisualFormulationRun,
  estimateVisualGenerationCost,
  buildVitestBenchmarkPayload,
  seedParentFinalistSelection,
} from '../../api/_lib/site00Evolve/creativeDirection/brandPresentationVisualFormulationExperiment/visualFormulationService.js';
import type { BrandPresentationConceptFormationRun, BrandPresentationConceptTerritory } from './brandPresentationConceptTerritory/types.js';
import { EXPERIMENT_G_RUN_ID } from './brandPresentationConceptTerritory/constants.js';
import { ELIGIBLE_PARENT_CONCEPT_NAMES } from './brandPresentationDirectionTerritory/constants.js';

const ROUTES = readFileSync(join(process.cwd(), 'src/routes/Site00Routes.tsx'), 'utf8');
const FINALISTS_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectExperimentGFinalistsPage.tsx'), 'utf8');
const DIR_REVIEW = readFileSync(
  join(process.cwd(), 'src/site00/components/validation/ExperimentGBrandPresentationDirectionReview.tsx'),
  'utf8',
);

function sampleConcept(name: string): BrandPresentationConceptTerritory {
  return {
    id: `bpc-test-${name.replace(/\s+/g, '-').toLowerCase()}`,
    name,
    conceptThesis: `${name} thesis`,
    brandExistenceModel: 'Persistent social brand entity',
    audienceRelationship: 'Peer relationship',
    brandBehavior: 'Governing behavioral mechanism',
    publishingLogic: 'Behavior-driven publishing',
    artifactLogic: 'Artifacts from behavior',
    knowledgeBehavior: 'Staged knowledge rituals',
    authorityModel: 'Behavioral authority',
    participationLogic: 'Audience participation rituals',
    recurrenceEngine: 'Indefinite recurrence',
    topicIndependence: 'Topic independent',
    socialNativeBehavior: 'Social-native',
    expansionPotential: 'Franchises',
    possibleDirectionRange: [
      { directionSeed: 'A', explanation: 'One' },
      { directionSeed: 'B', explanation: 'Two' },
      { directionSeed: 'C', explanation: 'Three' },
    ],
    antiCollapseRules: ['Not a campaign'],
    notThis: ['Not a topic campaign'],
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
  };
}

function sampleConceptRun(): BrandPresentationConceptFormationRun {
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
    concepts: ELIGIBLE_PARENT_CONCEPT_NAMES.map((name) => sampleConcept(name)),
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

async function seedDirectionsAndParentFinalists() {
  const { saveBrandPresentationConceptFormationRun } = await import(
    '../../api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/storeAdapter.js'
  );
  await saveBrandPresentationConceptFormationRun(sampleConceptRun());
  await formBrandPresentationDirections();
  await prepareVisualFormulationRun();
  const run = await getBrandPresentationVisualFormulationRun();
  return { run: run!, dirRun: (await getBrandPresentationDirectionFormationRun())! };
}

beforeEach(() => {
  delete process.env.SITE00_EXPERIMENT_G_VISUAL_DEEP_DIVE;
  process.env.SITE00_EXPERIMENT_G_DIRECTION_USE_MEMORY = '1';
  process.env.SITE00_EXPERIMENT_G_USE_MEMORY = '1';
  process.env.SITE00_EXPERIMENT_G_VISUAL_USE_MEMORY = '1';
  resetBrandPresentationDirectionMemory();
  resetBrandPresentationDirectionStoreModeCache();
  resetBrandPresentationDirectionFormationWorkers();
  resetBrandPresentationVisualFormulationMemory();
  resetBrandPresentationVisualFormulationStoreModeCache();
});

describe('Brand Presentation Parent Finalist Direction Scan', () => {
  it('1. parent-finalist exploration policy exists', () => {
    expect(PARENT_FINALIST_SCAN_IMPLEMENTED).toBe(true);
    expect(isParentFinalistScanPolicy(NDXBOOK_VISUAL_EXPLORATION_POLICY)).toBe(true);
    expect(NDXBOOK_VISUAL_EXPLORATION_POLICY.mode).toBe('PARENT_FINALIST_DIRECTION_SCAN');
  });

  it('2-5. exactly two parent finalists: Room + Noticing; Collector deferred', async () => {
    const { run } = await seedDirectionsAndParentFinalists();
    expect(run.parentFinalists.filter((p) => p.status === 'SELECTED')).toHaveLength(2);
    const names = run.parentFinalists.filter((p) => p.status === 'SELECTED').map((p) => p.parentConceptName);
    expect(names).toContain('THE ROOM THAT KNOWS');
    expect(names).toContain('THE THING THAT KEEPS NOTICING');
    expect(run.deferredParents).toHaveLength(1);
    expect(run.deferredParents[0]!.parentConceptName).toBe('THE COLLECTOR WHO CONNECTS');
    expect(run.deferredParents[0]!.status).toBe('FOUNDER_DEFERRED_VISUALIZATION');
    expect(run.deferredParents[0]!.salvageEligible).toBe(true);
    expect(run.deferredParents[0]!.historicalRecordsPreserved).toBe(true);
  });

  it('6-9. Room + Noticing directions eligible; Collector excluded from dispatch', async () => {
    const { run, dirRun } = await seedDirectionsAndParentFinalists();
    const gate = evaluateParentFinalistGate({
      parentFinalists: run.parentFinalists,
      deferredParents: run.deferredParents,
      directions: dirRun.directions,
      policy: NDXBOOK_PARENT_FINALIST_SCAN_POLICY,
    });
    expect(gate.ok).toBe(true);
    if (gate.ok) {
      expect(gate.eligibleDirections).toHaveLength(6);
      const roomDirs = gate.eligibleDirections.filter((d) => d.parentConceptName === 'THE ROOM THAT KNOWS');
      const noticingDirs = gate.eligibleDirections.filter((d) => d.parentConceptName === 'THE THING THAT KEEPS NOTICING');
      expect(roomDirs).toHaveLength(3);
      expect(noticingDirs).toHaveLength(3);
      expect(gate.eligibleDirections.every((d) => d.parentConceptName !== 'THE COLLECTOR WHO CONNECTS')).toBe(true);
    }
    const excluded = collectorDirectionsExcludedFromDispatch({
      directions: dirRun.directions,
      deferredParentNames: NDXBOOK_PARENT_FINALIST_SCAN_POLICY.deferredParentNames,
    });
    expect(excluded).toHaveLength(6);
  });

  it('10-13. six benchmarks, one per direction, six FAL requests, no hidden variants', async () => {
    await seedDirectionsAndParentFinalists();
    const formulated = await formulateVisualExpressions();
    expect(formulated.directionBenchmarks.filter((b) => b.revisionNumber === 0)).toHaveLength(6);
    expect(formulated.expressions).toHaveLength(0);
    const generated = await generateFinalistVisuals();
    expect(generated.accounting.falRequests).toBe(6);
    expect(generated.accounting.hiddenVariantRequests).toBe(0);
    expect(generated.directionBenchmarks.filter((b) => b.assetStoragePath)).toHaveLength(6);
  });

  it('14-15. Anthropic formulation precedes FAL; raw direction JSON not sent as prompt', async () => {
    await seedDirectionsAndParentFinalists();
    const formulated = await formulateVisualExpressions();
    expect(formulated.accounting.falRequests).toBe(0);
    expect(formulated.accounting.anthropicRequests).toBe(0);
    expect(formulated.directionBenchmarks.every((b) => b.benchmarkThesis.length > 0)).toBe(true);

    const payload = buildDirectionBenchmarkFormationPayload({
      parentConcept: {
        id: 'p',
        name: 'THE ROOM THAT KNOWS',
        conceptThesis: 't',
        brandBehavior: 'b',
        recurrenceEngine: 'r',
      } as never,
      direction: {
        directionId: 'd',
        directionName: 'THE AMBIENT AUTHORITY DIRECTION',
        brandBehavior: 'quiet certainty',
        audienceRelationship: 'peer',
        publishingBehavior: 'p',
        knowledgeBehavior: 'k',
        recurrenceBehavior: 'r',
        recognitionMechanism: 'm',
        antiCollapseRules: [],
        notThis: [],
        directionThesis: 'thesis',
      } as never,
    });
    expect(payload).toContain('Formulate one direction visual benchmark');
    expect(payload).not.toContain('"task": "Formulate three visual expression');
  });

  it('16-17. Room and noticing literalization guarded in prompts', () => {
    const raw = buildVitestBenchmarkPayload({
      directionName: 'THE AMBIENT AUTHORITY DIRECTION',
      directionId: 'd',
      brandBehavior: 'ambient authority',
      parentConceptName: 'THE ROOM THAT KNOWS',
      parentConceptId: 'p',
      recurrenceBehavior: 'r',
      recognitionMechanism: 'm',
      notThis: [],
      antiCollapseRules: [],
    } as never);
    const compiled = compileDirectionBenchmarkPrompt({
      parentConcept: { name: 'THE ROOM THAT KNOWS', brandBehavior: 'knowing', recurrenceEngine: 'r' } as never,
      direction: {
        brandBehavior: 'b',
        audienceRelationship: 'a',
        publishingBehavior: 'p',
        recurrenceBehavior: 'r',
        notThis: [],
        directionName: 'THE AMBIENT AUTHORITY DIRECTION',
      } as never,
      benchmark: {
        ...raw,
        benchmarkId: 'b1',
        negativeDirection: raw.negativeDirection,
        antiLiteralizationRules: ['Do not show literal room interior'],
      } as never,
      referencePackage: null,
      antiDirectionEvidence: [],
      parentMetaphorGuards: ['literal room', 'library'],
      socialPresentationRequirements: ['social-native'],
    });
    expect(compiled.prompt).toMatch(/DO NOT LITERALIZE/i);
    expect(compiled.prompt).toMatch(/literal room/i);
    expect(sanitizeMetaphorTerms('The Room Noticing')).toMatch(/behavioral/);
  });

  it('18-22. sibling directions remain distinct; pattern vs collector; slow observation not slow aesthetic', () => {
    const ambient = buildVitestBenchmarkPayload({
      directionName: 'THE AMBIENT AUTHORITY DIRECTION',
      brandBehavior: 'quiet certainty epistemic posture',
      notThis: [],
    } as never);
    const interior = buildVitestBenchmarkPayload({
      directionName: 'THE CONTINUOUS INTERIOR DIRECTION',
      brandBehavior: 'midstream continuity temporal',
      notThis: [],
    } as never);
    ambient.compositionBehavior = 'Hierarchical assumed-knowledge column';
    ambient.typographyBehavior = 'Confident compression display system';
    ambient.imageryBehavior = 'Editorial evidence assumed not explained';
    ambient.informationBehavior = 'Quiet authority progressive disclosure';
    ambient.densityBehavior = 'Medium density restrained';
    ambient.rhythmBehavior = 'Steady authoritative pulse';
    interior.compositionBehavior = 'Partial glimpse mid-conversation extract';
    interior.typographyBehavior = 'Interrupted mid-thought label system';
    interior.imageryBehavior = 'Cropped ongoing activity fragments';
    interior.informationBehavior = 'Midstream context partial visibility';
    interior.densityBehavior = 'Layered incomplete density';
    interior.rhythmBehavior = 'Interrupted conversational rhythm';
    const evalResult = evaluateSiblingBenchmarkDistinctiveness([
      { ...ambient, directionName: 'THE AMBIENT AUTHORITY DIRECTION' } as never,
      { ...interior, directionName: 'THE CONTINUOUS INTERIOR DIRECTION' } as never,
    ]);
    expect(evalResult.result).not.toBe('SIBLING_VISUAL_COLLAPSE');

    const pattern = buildVitestBenchmarkPayload({
      directionName: 'THE PATTERN NOTICING DIRECTION',
      brandBehavior: 'separate observations resolve into discovered structure',
    } as never);
    expect(pattern.benchmarkThesis).not.toMatch(/network diagram/i);

    const slow = buildVitestBenchmarkPayload({
      directionName: 'THE SLOW OBSERVATION DIRECTION',
      brandBehavior: 'layers revealed through sustained looking not slow aesthetic',
    } as never);
    expect(slow.benchmarkThesis).not.toMatch(/quiet luxury/i);
  });

  it('23-25. SITE 00 and Experiment F excluded; lineage preserved', async () => {
    expect(evaluateReferenceExclusions('SITE00_HOST_VISUAL_MEMORY').allowed).toBe(false);
    expect(evaluateReferenceExclusions('EXPERIMENT_F_VISUAL').allowed).toBe(false);
    await seedDirectionsAndParentFinalists();
    await formulateVisualExpressions();
    const run = await generateFinalistVisuals();
    for (const b of run.directionBenchmarks) {
      expect(b.parentConceptId).toBeTruthy();
      expect(b.directionId).toBeTruthy();
      expect(b.directionFingerprint).toBeTruthy();
    }
  });

  it('26-29. visual judgment durable; independent from conceptual; revision single benchmark', async () => {
    await seedDirectionsAndParentFinalists();
    await formulateVisualExpressions();
    let run = await generateFinalistVisuals();
    const benchmark = run.directionBenchmarks[0]!;
    const originalAsset = benchmark.assetStoragePath;

    run = await setDirectionBenchmarkJudgment({
      benchmarkId: benchmark.benchmarkId,
      judgment: 'LOVE_THIS_DIRECTION',
    });
    expect(run.directionBenchmarks.find((b) => b.benchmarkId === benchmark.benchmarkId)!.founderJudgment).toBe(
      'LOVE_THIS_DIRECTION',
    );

    run = await setDirectionBenchmarkJudgment({
      benchmarkId: benchmark.benchmarkId,
      judgment: 'PROMISING_REVISE',
    });
    run = await reviseDirectionBenchmark({
      benchmarkId: benchmark.benchmarkId,
      preserve: ['recognition mechanism'],
      change: ['density'],
      doNotBecome: ['new direction'],
    });
    const original = run.directionBenchmarks.find((b) => b.benchmarkId === benchmark.benchmarkId)!;
    expect(original.assetStoragePath).toBe(originalAsset);
    const revision = run.directionBenchmarks.find((b) => b.parentBenchmarkId === benchmark.benchmarkId)!;
    expect(revision).toBeTruthy();
    expect(run.accounting.falRequests).toBe(7);
  });

  it('30-33. no automatic winner; no brand canon; collector salvage founder-controlled', async () => {
    await seedDirectionsAndParentFinalists();
    const run = await getBrandPresentationVisualFormulationRun();
    expect(run!.winner).toBeNull();
    expect(winnerDoesNotMutateBrandCanon()).toBe(true);
    expect(run!.deferredParents[0]!.salvageEligible).toBe(true);
  });

  it('35. vision unavailable returns NOT_EVALUATED', () => {
    const qa = directionBenchmarkVisionQaUnavailable();
    expect(qa.directionFidelity).toBe('NOT_EVALUATED');
    expect(qa.parentConceptFidelity).toBe('NOT_EVALUATED');
  });

  it('36-40. experimental integrity', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(DIRECTION_BENCHMARK_JUDGMENTS).toContain('LOVE_THIS_DIRECTION');
    expect(pageLoadGeneratesZeroFalRequests()).toBe(true);
    expect(parentFinalistSelectionGeneratesZeroFalRequests()).toBe(true);
    expect(benchmarkPreviewGeneratesZeroFalRequests()).toBe(true);
  });

  it('41-42. generic policy supports parent scan; NDXBOOK resolves 2×3×1=6', () => {
    const policy = resolveNdxbookVisualPolicy();
    expect(policy.mode).toBe('PARENT_FINALIST_DIRECTION_SCAN');
    expect(policy.parentFinalistCount).toBe(2);
    expect(policy.directionsPerParent).toBe(3);
    expect(policy.benchmarksPerDirection).toBe(1);
    expect(policy.totalInitialVisuals).toBe(6);
    expect(policy.policyConfigurable).toBe(true);
  });

  it('cost preview and generation gate', async () => {
    await seedDirectionsAndParentFinalists();
    let run = await getBrandPresentationVisualFormulationRun();
    const costBefore = estimateVisualGenerationCost(run!);
    expect(costBefore.totalVisuals).toBe(6);
    expect(costBefore.falRequestsExpected).toBe(6);

    await formulateVisualExpressions();
    run = await getBrandPresentationVisualFormulationRun();
    const gate = evaluateParentFinalistGate({
      parentFinalists: run!.parentFinalists,
      deferredParents: run!.deferredParents,
      directions: (await getBrandPresentationDirectionFormationRun())!.directions,
      policy: NDXBOOK_PARENT_FINALIST_SCAN_POLICY,
    });
    const genGate = canBeginBenchmarkGeneration({
      gate,
      benchmarks: run!.directionBenchmarks,
      policy: NDXBOOK_PARENT_FINALIST_SCAN_POLICY,
    });
    expect(genGate.ok).toBe(true);
  });

  it('UI parent finalist review route and controls', () => {
    expect(ROUTES).toContain('projectExperimentGFinalists');
    expect(FINALISTS_PAGE).toContain('PARENT FINALIST VISUAL REVIEW');
    expect(FINALISTS_PAGE).toContain('ExperimentGBrandPresentationFinalistReview');
    expect(DIR_REVIEW).toContain('THE COLLECTOR WHO CONNECTS deferred');
    expect(DIR_REVIEW).not.toContain('SELECT AS VISUAL FINALIST');
  });

  it('winner selection via benchmark optional', async () => {
    await seedDirectionsAndParentFinalists();
    await formulateVisualExpressions();
    let run = await generateFinalistVisuals();
    const b = run.directionBenchmarks.find((x) => x.assetStoragePath)!;
    run = await selectBrandPresentationWinner({ benchmarkId: b.benchmarkId, selectedBy: 'test' });
    expect(run.winner!.benchmarkId).toBe(b.benchmarkId);
    expect(run.winner!.brandCanonMutated).toBe(false);
  });

  it('seedParentFinalistSelection is idempotent', async () => {
    await seedDirectionsAndParentFinalists();
    let run = (await getBrandPresentationVisualFormulationRun())!;
    const firstIds = run.parentFinalists.map((p) => p.selectionId);
    run = await seedParentFinalistSelection(run);
    expect(run.parentFinalists.map((p) => p.selectionId)).toEqual(firstIds);
  });
});
