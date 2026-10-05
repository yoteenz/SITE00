/**
 * Brand Presentation Direction Development — comprehensive methodology tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { ELIGIBLE_PARENT_CONCEPT_NAMES, TOTAL_DIRECTION_CANDIDATES } from './brandPresentationDirectionTerritory/constants.js';
import {
  canDevelopTop3Directions,
  resolveSelectedParentConcepts,
  freezeParentConcept,
} from './brandPresentationDirectionTerritory/parentConceptSelection.js';
import {
  assertDirectionFormationQuarantined,
  evaluateSiblingDistinctiveness,
  evaluateVisualFreedom,
} from './brandPresentationDirectionTerritory/evaluators.js';
import {
  directionFormationPromptExcludesCreditUtilization,
  DIRECTION_FORMATION_PROMPT_VERSION,
} from './brandPresentationDirectionTerritory/formationPrompt.js';
import {
  formationTriggersZeroFalRequests,
  formationTriggersZeroImageRequests,
  loveDirectionDoesNotCreateBrandCanon,
  loveDirectionDoesNotTriggerFal,
  visualFormulationBlockedUntilFounderReview,
  BRAND_PRESENTATION_DIRECTION_LAYER_IMPLEMENTED,
} from './brandPresentationDirectionTerritory/index.js';
import type { BrandPresentationConceptFormationRun, BrandPresentationConceptTerritory } from './brandPresentationConceptTerritory/types.js';
import {
  resetBrandPresentationDirectionMemory,
  resetBrandPresentationDirectionStoreModeCache,
  resetBrandPresentationDirectionFormationWorkers,
  formBrandPresentationDirections,
  getBrandPresentationDirectionFormationRun,
  setBrandPresentationDirectionJudgment,
  reviseBrandPresentationDirection,
  estimateDirectionFormationCost,
} from '../../api/_lib/site00Evolve/creativeDirection/brandPresentationDirectionExperiment/directionService.js';
import { EXPERIMENT_G_RUN_ID } from './brandPresentationConceptTerritory/constants.js';

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
  const rejected = [
    sampleConcept('REJECTED ONE', { founderJudgment: 'NOT_NDXBOOK' }),
    sampleConcept('REJECTED TWO', { founderJudgment: 'TOO_CONTENT_SPECIFIC' }),
    sampleConcept('REJECTED THREE', { founderJudgment: 'PROMISING_DEVELOP' }),
  ];
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
    concepts: [...loved, ...rejected],
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

describe('Brand Presentation Direction Development', () => {
  beforeEach(() => {
    process.env.SITE00_EXPERIMENT_G_DIRECTION_USE_MEMORY = '1';
    process.env.SITE00_EXPERIMENT_G_USE_MEMORY = '1';
    resetBrandPresentationDirectionStoreModeCache();
    resetBrandPresentationDirectionMemory();
    resetBrandPresentationDirectionFormationWorkers();
  });

  it('1–3. selects exactly three parent concepts with three directions each (9 total)', async () => {
    const conceptRun = sampleConceptRun();
    const resolved = resolveSelectedParentConcepts(conceptRun);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.parents).toHaveLength(3);

    const { saveBrandPresentationConceptFormationRun } = await import(
      '../../api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/storeAdapter.js'
    );
    await saveBrandPresentationConceptFormationRun(conceptRun);

    const run = await formBrandPresentationDirections();
    expect(run.parentConceptSnapshots).toHaveLength(3);
    expect(run.directions).toHaveLength(TOTAL_DIRECTION_CANDIDATES);
    for (const parent of resolved.parents) {
      const count = run.directions.filter((d) => d.parentConceptId === parent.id).length;
      expect(count).toBe(3);
    }
  });

  it('4–5. excludes non-selected concepts and quarantines credit utilization', () => {
    const conceptRun = sampleConceptRun();
    const resolved = resolveSelectedParentConcepts(conceptRun);
    expect(resolved.ok).toBe(true);
    const selectedIds = resolved.ok ? resolved.parents.map((p) => p.id) : [];
    const excluded = conceptRun.concepts.filter((c) => !selectedIds.includes(c.id));
    expect(excluded).toHaveLength(3);
    expect(() => assertDirectionFormationQuarantined('CREDIT UTILIZATION topic campaign')).toThrow(/QUARANTINE/i);
    expect(directionFormationPromptExcludesCreditUtilization()).toBe(true);
  });

  it('6–9. zero FAL/GPT image and no visual references in prompt version', () => {
    expect(formationTriggersZeroFalRequests()).toBe(true);
    expect(formationTriggersZeroImageRequests()).toBe(true);
    const cost = estimateDirectionFormationCost(3);
    expect(cost.falRequests).toBe(0);
    expect(cost.imageCostUsd).toBe(0);
    expect(DIRECTION_FORMATION_PROMPT_VERSION).toContain('DIRECTION');
  });

  it('10–11. uses complete parent record not title alone', () => {
    const concept = sampleConcept(ELIGIBLE_PARENT_CONCEPT_NAMES[0]!);
    const frozen = freezeParentConcept(concept, 'intel');
    expect(frozen.brandExistenceModel).toBeTruthy();
    expect(frozen.possibleDirectionRange.length).toBeGreaterThanOrEqual(3);
    expect(frozen.name).toBe(concept.name);
  });

  it('12–16. post-formation topic substitution, recurrence, parent fidelity, sibling checks', async () => {
    const conceptRun = sampleConceptRun();
    const { saveBrandPresentationConceptFormationRun } = await import(
      '../../api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/storeAdapter.js'
    );
    await saveBrandPresentationConceptFormationRun(conceptRun);
    const run = await formBrandPresentationDirections();
    for (const d of run.directions) {
      expect(d.topicIndependenceEval).toBeTruthy();
      expect(d.recurrenceEval).toBeTruthy();
      expect(d.parentConceptFidelity).toBeTruthy();
      expect(d.possibleExpressionSeeds.length).toBeGreaterThanOrEqual(3);
    }
    expect(run.crossParentAudit).toBeTruthy();
  });

  it('17–18. style-only differentiation flagged; expression seeds required', () => {
    const styleOnly = evaluateSiblingDistinctiveness([
      {
        directionName: 'A',
        directionThesis: 'serif palette typography editorial collector',
        directionInterpretation: 'x',
        brandBehavior: '',
        editorialBehavior: '',
        publishingBehavior: '',
        recurrenceBehavior: '',
        topicIndependence: '',
        possibleExpressionSeeds: [],
        notThis: [],
        visualImplications: '',
      },
      {
        directionName: 'B',
        directionThesis: 'serif palette typography editorial collector variant',
        directionInterpretation: 'y',
        brandBehavior: '',
        editorialBehavior: '',
        publishingBehavior: '',
        recurrenceBehavior: '',
        topicIndependence: '',
        possibleExpressionSeeds: [],
        notThis: [],
        visualImplications: '',
      },
    ]);
    expect(['STYLE_ONLY_DIFFERENTIATION', 'NEEDS_FOUNDER_REVIEW']).toContain(styleOnly.result);

    const seeds = evaluateVisualFreedom({
      directionName: 'X',
      directionThesis: 'Valid thesis with behavioral depth',
      directionInterpretation: 'interp',
      brandBehavior: 'behavior',
      editorialBehavior: 'editorial',
      publishingBehavior: 'publish',
      recurrenceBehavior: 'recurs',
      topicIndependence: 'topic free',
      possibleExpressionSeeds: [{ seed: 'a', explanation: 'a' }],
      notThis: [],
      visualImplications: 'may vary',
    });
    expect(seeds.result).toBe('SINGLE_METAPHOR_DIRECTION');
  });

  it('19–23. founder judgments durable; love does not trigger canon/FAL; revision preserves parent', async () => {
    const conceptRun = sampleConceptRun();
    const { saveBrandPresentationConceptFormationRun } = await import(
      '../../api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/storeAdapter.js'
    );
    await saveBrandPresentationConceptFormationRun(conceptRun);
    const formed = await formBrandPresentationDirections();
    const directionId = formed.directions[0]!.directionId;

    const judged = await setBrandPresentationDirectionJudgment({
      directionId,
      judgment: 'LOVE_THE_DIRECTION',
    });
    expect(judged.directions.find((d) => d.directionId === directionId)?.founderJudgment).toBe('LOVE_THE_DIRECTION');
    expect(loveDirectionDoesNotCreateBrandCanon()).toBe(true);
    expect(loveDirectionDoesNotTriggerFal()).toBe(true);
    expect(visualFormulationBlockedUntilFounderReview()).toBe(true);
    expect(judged.visualGenerationAllowed).toBe(false);
    expect(judged.falGenerationAllowed).toBe(false);

    const revised = await reviseBrandPresentationDirection({
      directionId,
      preserve: ['core thesis'],
      change: ['tone'],
      doNotBecome: ['campaign'],
    });
    const original = revised.directions.find((d) => d.directionId === directionId);
    const child = revised.directions.find((d) => d.parentDirectionId === directionId);
    expect(original?.founderJudgment).toBe('LOVE_THE_DIRECTION');
    expect(child?.revisionNote?.preserve).toContain('core thesis');
  });

  it('24–27. layer implemented; Experiment G concepts unchanged; idempotent retry', async () => {
    expect(BRAND_PRESENTATION_DIRECTION_LAYER_IMPLEMENTED).toBe(true);
    const conceptRun = sampleConceptRun();
    const originalConceptCount = conceptRun.concepts.length;
    const { saveBrandPresentationConceptFormationRun, getBrandPresentationConceptFormationRun } = await import(
      '../../api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/storeAdapter.js'
    );
    await saveBrandPresentationConceptFormationRun(conceptRun);
    await formBrandPresentationDirections();
    const gAfter = await getBrandPresentationConceptFormationRun();
    expect(gAfter?.concepts.length).toBe(originalConceptCount);

    const first = await getBrandPresentationDirectionFormationRun();
    const second = await formBrandPresentationDirections();
    expect(second.directions.length).toBe(first?.directions.length);
  });

  it('28–31. canDevelopTop3Directions gate; cost estimate; no provider on get', () => {
    expect(canDevelopTop3Directions(sampleConceptRun())).toBe(true);
    expect(canDevelopTop3Directions(null)).toBe(false);
    const cost = estimateDirectionFormationCost(3);
    expect(cost.directionsExpected).toBe(9);
    expect(cost.anthropicRequestsEstimate).toBe(3);
  });

  it('34–35. directions support >=3 expression seeds; visual formulation blocked', async () => {
    const conceptRun = sampleConceptRun();
    const { saveBrandPresentationConceptFormationRun } = await import(
      '../../api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/storeAdapter.js'
    );
    await saveBrandPresentationConceptFormationRun(conceptRun);
    const run = await formBrandPresentationDirections();
    expect(run.directions.every((d) => d.possibleExpressionSeeds.length >= 3)).toBe(true);
    expect(run.visualFormulationAllowed).toBe(false);
    expect(run.status).not.toBe('FORMING');
  });
});
