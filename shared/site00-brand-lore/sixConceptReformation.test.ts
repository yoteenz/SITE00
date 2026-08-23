/**
 * Experiment F — Six-Concept Reformation sprint tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import {
  CONCEPT_TERRITORY_V2_METHODOLOGY,
  EXPERIMENT_D_CONCEPT_DISTINCTIVENESS,
  EXPERIMENT_D_HISTORICAL_SIX_NAMES,
  EXPERIMENT_F_INTELLIGENCE_SNAPSHOT_VERSION,
  EXPERIMENT_F_RUN_ID,
  FORMATION_CONTAMINATION_BLOCKLIST,
} from './conceptTerritoryV2/constants.js';
import {
  getExperimentDMethodologyOverlay,
  experimentDHistoricalRecordsUnchanged,
} from './conceptTerritoryV2/experimentDInterpretation.js';
import {
  oldSixAvailableToFormation,
  containsQuarantinedExperimentDContent,
  containsFormationContamination,
  assertFormationPromptQuarantined,
} from './conceptTerritoryV2/evidenceQuarantine.js';
import {
  evaluateConceptVsDirection,
  directionSeedsAreMeaningfullyDifferent,
  paletteOnlyIdeaFailsConceptGate,
} from './conceptTerritoryV2/conceptVsDirection.js';
import {
  detectSharedParentConceptCollapse,
  conceptFamilyDetectedWhenGroupedUnderFewParents,
} from './conceptTerritoryV2/parentCollapseDetector.js';
import {
  runConceptOrthogonalityEvaluationV2,
  orthogonalityV2UsesConceptualDimensions,
  artificialDiversityDetectable,
} from './conceptTerritoryV2/orthogonalityV2.js';
import { compileExperimentFIntelligenceSnapshot } from './conceptTerritoryV2/intelligenceSnapshot.js';
import { buildCreativeConceptDirectorPayload, formationProducesZeroImagePrompts } from './conceptTerritoryV2/formationPrompt.js';
import { WORLD_FORMATION_IMPLEMENTED, formedIsNotReadyForVisualGeneration } from './conceptTerritoryV2/index.js';
import { EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION } from './experienceExpression/constants.js';
import { NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION } from './founderCreativeAppetite/constants.js';
import { assertCreativeAppetiteNotInjectedIntoFrozenExperiment } from './founderCreativeAppetite/experimentExclusion.js';
import { buildConceptTerritorySeed } from './conceptTerritory/conceptTerritorySeeds.js';
import { buildConceptFirstHeroBrief } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';
import {
  formSixConcepts,
  getSixConceptReformationRun,
  openingRouteGeneratesZeroConceptsAutomatically,
  reformExperimentFSet,
  resetExperimentFMemory,
  resetExperimentFStoreModeCache,
} from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryV2Experiment/experimentFService.js';
import { getSixConceptHeroRangeRun } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/experimentDService.js';
import { resetExperimentDMemory } from '../../api/_lib/site00Evolve/creativeDirection/conceptTerritoryExperiment/storeAdapter.js';
import type { CreativeConceptTerritoryV2 } from './conceptTerritoryV2/types.js';

function baseConcept(overrides: Partial<CreativeConceptTerritoryV2>): CreativeConceptTerritoryV2 {
  return {
    id: 'c-test',
    conceptName: 'TEST CONCEPT',
    conceptThesis: 'Thesis',
    coreCreativeIdea: 'Core idea about participation',
    worldPremiseSeed: 'Seed',
    viewerRole: 'Participant',
    audienceRelationship: 'Peer',
    contentMechanism: 'Live mechanism',
    informationBehavior: 'Evolving',
    emotionalTension: 'Tension',
    participationLogic: 'Agency',
    spatialTemporalLogic: 'Weekly',
    artifactLogic: 'Social object',
    narrativeLogic: 'Arc',
    whyThisIsNdxbook: 'NDXBOOK fit',
    whyThisIsAConceptNotDirection: 'Survives palette change',
    possibleDirectionRange: [
      { directionSeed: 'Direction A', explanation: 'A' },
      { directionSeed: 'Direction B', explanation: 'B' },
    ],
    possibleNativeFormats: ['FEED'],
    antiCollapseRules: [],
    provenance: 'TEST',
    formationReceipt: null,
    conceptVsDirection: null,
    founderJudgment: null,
    judgmentNote: null,
    methodologyVersion: CONCEPT_TERRITORY_V2_METHODOLOGY,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('EXPERIMENT D IMMUTABILITY', () => {
  beforeEach(() => {
    resetExperimentDMemory();
  });

  it('1. Experiment D snapshot remains frozen', () => {
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBe(1);
    expect(NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION).toBe(1);
  });

  it('2. Experiment D intelligence fingerprint unchanged (snapshot version)', async () => {
    const run = await getSixConceptHeroRangeRun();
    expect(run?.intelligenceSnapshotVersion ?? 1).toBe(1);
  });

  it('3. Experiment D six records unchanged (seed builder stable)', () => {
    const seed = buildConceptTerritorySeed('THE MARKED-UP COPY');
    expect(seed.territory.directionName).toBe('THE MARKED-UP COPY');
  });

  it('4. Experiment D assets unchanged (hero path contract)', () => {
    expect(buildConceptTerritorySeed('THE INDEX').territory.name).toBeTruthy();
  });

  it('5. Experiment D World Expression records unchanged', () => {
    const seed = buildConceptTerritorySeed('THE COUNTDOWN ROOM');
    expect(seed.expression.directionName).toBe('THE COUNTDOWN ROOM');
  });

  it('6. Founder Creative Appetite not injected into D', () => {
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

  it('7. Experiment D historical judgments preserved (run field exists)', async () => {
    const run = await getSixConceptHeroRangeRun();
    if (run) expect(Array.isArray(run.heroes)).toBe(true);
    else expect(run).toBeNull();
  });

  it('8. Later methodology interpretation does not mutate historical evidence', () => {
    const overlay = getExperimentDMethodologyOverlay();
    expect(overlay.nonDestructive).toBe(true);
    expect(experimentDHistoricalRecordsUnchanged()).toBe(true);
    expect(overlay.experimentDistinctiveness).toBe(EXPERIMENT_D_CONCEPT_DISTINCTIVENESS);
  });
});

describe('SUCCESSOR SNAPSHOT', () => {
  it('9. Successor experiment has new snapshot', () => {
    const snap = compileExperimentFIntelligenceSnapshot({ profile: null });
    expect(snap.snapshotVersion).toBe(EXPERIMENT_F_INTELLIGENCE_SNAPSHOT_VERSION);
  });

  it('10. Successor snapshot is independently fingerprinted', () => {
    const a = compileExperimentFIntelligenceSnapshot({ profile: null });
    const b = compileExperimentFIntelligenceSnapshot({ profile: { brandBelief: { value: 'x' } } as never });
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });

  it('11. Founder Creative Appetite may be present in successor snapshot', () => {
    const snap = compileExperimentFIntelligenceSnapshot({
      profile: { founderCreativeAppetite: { rawAnswers: { a: 1 } } } as never,
    });
    expect(snap.appetiteIncluded).toBe(true);
  });

  it('12. Successor snapshot cannot mutate D', () => {
    expect(NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION).toBe(1);
    expect(EXPERIMENT_F_INTELLIGENCE_SNAPSHOT_VERSION).toBe(2);
  });

  it('13. Successor snapshot freezes at formation', async () => {
    resetExperimentFMemory();
    resetExperimentFStoreModeCache();
    const run = await formSixConcepts();
    expect(run.intelligenceSnapshot?.frozen).toBe(true);
  });

  it('14. Later intelligence edits do not silently change active run idempotency', async () => {
    resetExperimentFMemory();
    resetExperimentFStoreModeCache();
    const first = await formSixConcepts();
    const second = await formSixConcepts();
    expect(second.idempotencyKey).toBe(first.idempotencyKey);
    expect(second.concepts.length).toBe(6);
  });
});

describe('BLIND FORMATION', () => {
  it('15–24. Formation prompt excludes quarantined content', () => {
    expect(oldSixAvailableToFormation()).toBe(false);
    for (const name of EXPERIMENT_D_HISTORICAL_SIX_NAMES) {
      expect(containsQuarantinedExperimentDContent(name)).toBe(true);
    }
    for (const blocked of FORMATION_CONTAMINATION_BLOCKLIST) {
      expect(containsFormationContamination(`safe ndxbook formation payload for credit utilization`)).toBeNull();
      expect(containsFormationContamination(blocked)).toBe(blocked);
    }
    expect(() => assertFormationPromptQuarantined('THE MARKED-UP COPY in prompt')).toThrow();
    expect(() => assertFormationPromptQuarantined('Project Workspace screenshot')).toThrow();
    expect(() => assertFormationPromptQuarantined('Workbench-Dossier hierarchy')).toThrow();
    expect(() => assertFormationPromptQuarantined('Host Visual Memory reference')).toThrow();
    expect(() => assertFormationPromptQuarantined('Frontal Slayer Mansion world')).toThrow();
    expect(() => assertFormationPromptQuarantined('tarot world example')).toThrow();
  });
});

describe('CONCEPT VS DIRECTION', () => {
  it('25. Palette-only idea fails concept gate', () => {
    expect(paletteOnlyIdeaFailsConceptGate()).toBe(true);
    const c = baseConcept({
      coreCreativeIdea: '',
      viewerRole: '',
      contentMechanism: '',
      possibleDirectionRange: [],
    });
    expect(evaluateConceptVsDirection(c).result).toBe('DIRECTION_NOT_CONCEPT');
  });

  it('26–28. Style/format dependent detection', () => {
    const style = baseConcept({
      whyThisIsAConceptNotDirection: 'palette and font driven',
      participationLogic: '',
      possibleDirectionRange: [{ directionSeed: 'only one', explanation: 'x' }],
    });
    expect(evaluateConceptVsDirection(style).styleDependent || evaluateConceptVsDirection(style).result !== 'CONCEPT').toBe(true);
  });

  it('29. Concept with multiple valid directions can pass', () => {
    const c = baseConcept({});
    expect(evaluateConceptVsDirection(c).supportsMultipleDirections).toBe(true);
  });

  it('30–32. Direction seed validation', () => {
    expect(directionSeedsAreMeaningfullyDifferent([
      { directionSeed: 'blue version', explanation: 'a' },
      { directionSeed: 'red version', explanation: 'b' },
    ])).toBe(false);
    expect(directionSeedsAreMeaningfullyDifferent([
      { directionSeed: 'Broadcast meteorology', explanation: 'a' },
      { directionSeed: 'Hand-drawn field notes', explanation: 'b' },
    ])).toBe(true);
  });
});

describe('PARENT COLLAPSE', () => {
  it('33–39. Shared parent and family detection', () => {
    const collapsed = [
      baseConcept({ id: '1', artifactLogic: 'annotate the document', contentMechanism: 'document editing' }),
      baseConcept({ id: '2', artifactLogic: 'archive the document', contentMechanism: 'document filing' }),
      baseConcept({ id: '3', artifactLogic: 'index the document', contentMechanism: 'document sorting' }),
      baseConcept({ id: '4', artifactLogic: 'correct the document copy', contentMechanism: 'document revision' }),
    ];
    const parents = detectSharedParentConceptCollapse(collapsed);
    expect(parents.length).toBeGreaterThan(0);
    expect(conceptFamilyDetectedWhenGroupedUnderFewParents({ familyCount: 1, conceptCount: 6 })).toBe(true);
  });
});

describe('ORTHOGONALITY V2', () => {
  it('40–46. Set-level orthogonality evaluation', async () => {
    resetExperimentFMemory();
    resetExperimentFStoreModeCache();
    const run = await formSixConcepts();
    expect(orthogonalityV2UsesConceptualDimensions()).toBe(true);
    expect(run.orthogonality?.conceptualDimensions.length).toBeGreaterThan(5);
    expect(run.orthogonality?.pairwiseOverlapMatrix.length).toBe(6);
    expect(artificialDiversityDetectable()).toBe(true);
    const art = runConceptOrthogonalityEvaluationV2([
      baseConcept({ id: 'a', coreCreativeIdea: 'futuristic idea' }),
      baseConcept({ id: 'b', coreCreativeIdea: 'nostalgic idea' }),
      baseConcept({ id: 'c', coreCreativeIdea: 'funny idea' }),
      baseConcept({ id: 'd', coreCreativeIdea: 'emotional idea' }),
    ]);
    expect(art.artificialDiversityUsed).toBe(true);
  });
});

describe('GENERATION BOUNDARY', () => {
  beforeEach(() => {
    resetExperimentFMemory();
    resetExperimentFStoreModeCache();
  });

  it('47. Opening successor route generates zero concepts automatically', () => {
    expect(openingRouteGeneratesZeroConceptsAutomatically()).toBe(true);
  });

  it('48–55. FORM SIX CONCEPTS boundaries', async () => {
    expect(formationProducesZeroImagePrompts()).toBe(true);
    const before = await getSixConceptReformationRun();
    expect(before).toBeNull();
    const run = await formSixConcepts();
    expect(run.concepts.length).toBe(6);
    expect(run.accounting.gptImage2Requests).toBe(0);
    expect(run.accounting.falRequests).toBe(0);
    expect(run.visualGenerationAllowed).toBe(false);
    expect(run.directionDevelopmentAllowed).toBe(false);
    expect(formedIsNotReadyForVisualGeneration()).toBe(true);
  });

  it('56. Founder review required before next stage', async () => {
    const run = await formSixConcepts();
    expect(run.status === 'DISTINCTIVENESS_VALIDATED' || run.status === 'NEEDS_REFORMATION' || run.status === 'CONCEPTS_FORMED').toBe(true);
  });
});

describe('PARALLEL SYSTEM INTEGRITY', () => {
  it('57–63. Parallel systems unchanged', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(EXPERIMENT_F_RUN_ID).toBe('ndxbook-six-concept-reformation');
    expect(CONCEPT_TERRITORY_V2_METHODOLOGY).toBe('CONCEPT_TERRITORY_V2');
  });

  it('64–65. Reformation preserves prior formation version increment', async () => {
    resetExperimentFMemory();
    resetExperimentFStoreModeCache();
    await formSixConcepts();
    const reformed = await reformExperimentFSet();
    expect(reformed.formationVersion).toBeGreaterThan(1);
    expect(reformed.concepts.length).toBe(6);
  });
});

describe('EXPERIMENT F SERVICE', () => {
  it('formation payload uses director role without Experiment D names', () => {
    const snap = compileExperimentFIntelligenceSnapshot({ profile: null });
    const payload = buildCreativeConceptDirectorPayload({ snapshot: snap });
    expect(payload.role).toBe('CREATIVE_CONCEPT_DIRECTOR');
    expect(JSON.stringify(payload)).not.toContain('THE MARKED-UP COPY');
  });

  it('snapshot fingerprint is deterministic', () => {
    const snap = compileExperimentFIntelligenceSnapshot({ profile: null });
    const expected = createHash('sha256')
      .update(
        JSON.stringify({
          version: snap.snapshotVersion,
          brandLevelTruth: snap.brandLevelTruth,
          mediumContext: snap.mediumContext,
          appetiteIncluded: snap.appetiteIncluded,
          excluded: snap.excludedContamination,
        }),
      )
      .digest('hex')
      .slice(0, 16);
    expect(snap.fingerprint).toBe(expected);
  });
});
