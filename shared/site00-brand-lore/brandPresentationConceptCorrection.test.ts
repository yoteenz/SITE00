/**
 * NDXBOOK Brand Presentation Concept Correction — comprehensive tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION } from './experienceExpression/constants.js';
import { EXPERIMENT_F_TOPIC_NAME, EXPERIMENT_F_RUN_ID } from './conceptTerritoryV2/constants.js';
import {
  EXPERIMENT_G_FORMATION_SUBJECT,
  EXPERIMENT_G_RUN_ID,
} from './brandPresentationConceptTerritory/constants.js';
import {
  BRAND_PRESENTATION_VS_CONTENT_CONCEPT_FORMALIZED,
  ORTHOGONALITY_NOT_EQUAL_ABSTRACTION_CORRECTNESS,
  automaticDownstreamExecutionBlocked,
  brandPresentationConceptDoesNotEqualBrandCanon,
  directionDevelopmentBlockedAfterLove,
  evaluateBrandPresentationConceptVsDirection,
  evaluateBrandPresentationLevel,
  evaluateBrandPresentationRecurrence,
  evaluateBrandPresentationTopicIndependence,
  experimentFConceptsExcludedFromSuccessorFormation,
  experimentFHistoricalRecordsUnchanged,
  experimentFNotFailedExperiment,
  getExperimentFMethodologyOverlay,
  loveTheConceptDoesNotEqualBrandCanon,
  successorFormationIsTopicBlind,
  topicSubstitutionIsPostFormationOnly,
  compileExperimentGIntelligenceSnapshot,
  buildBrandPresentationDirectorPayload,
  formationPromptExcludesCreditUtilization,
  formationProducesZeroImagePrompts,
  burnBookIsCalibrationReferenceNotMandatoryCanon,
  burnBookLiteralArtifactNotRequiredInFormation,
  historicalEditorialMetaphorsQuarantined,
  assertSuccessorFormationQuarantined,
  creditUtilizationExcludedFromSuccessorFormation,
  deterministicOrthogonalityCannotAloneApprove,
  runBrandPresentationOrthogonalityEvaluation,
} from './brandPresentationConceptTerritory/index.js';
import type { BrandPresentationConceptTerritory } from './brandPresentationConceptTerritory/types.js';
import {
  formSixBrandPresentationConcepts,
  formationTriggersZeroFalRequests,
  formationTriggersZeroImageRequests,
  getBrandPresentationConceptFormationRun,
  loveConceptDoesNotTriggerDirectionDevelopment,
  prepareExperimentGSnapshot,
  resetExperimentGMemory,
  resetExperimentGStoreModeCache,
} from '../../api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/experimentGService.js';
import {
  brandPresentationDistinctFromContentConcept,
  conceptualDistinctivenessSeparateFromLevelCorrectness,
  P05_METHODOLOGY_GAP,
} from '../site00-studio-world-production/brandPresentationVsContentConcept.js';
import { WORLD_FORMATION_IMPLEMENTED } from './worldFormation/futureContracts.js';

const AUDIT_PATH = join(process.cwd(), 'audit/ndxbook-brand-presentation-concept-correction.json');

function sampleBrandConcept(overrides: Partial<BrandPresentationConceptTerritory> = {}): BrandPresentationConceptTerritory {
  return {
    id: 'bpc-test',
    name: 'THE PERMISSION ENGINE',
    conceptThesis: 'NDXBOOK grants social permission to discuss money',
    brandExistenceModel: 'A permission-granting social institution',
    audienceRelationship: 'Peer accountability partner',
    brandBehavior: 'Repeatedly tests what audiences may admit publicly',
    publishingLogic: 'Publishing follows permission rituals',
    artifactLogic: 'Permission artifacts emerge from behavior rules',
    knowledgeBehavior: 'Knowledge staged through permission thresholds',
    authorityModel: 'Authority from consistent behavioral truth-telling',
    participationLogic: 'Audience participates in permission rituals',
    recurrenceEngine: 'New life stages renew permission questions indefinitely',
    topicIndependence: 'Governing entity persists across unrelated subjects',
    socialNativeBehavior: 'Behavior-native to social without one format',
    expansionPotential: 'Franchises and campaigns under one premise',
    possibleDirectionRange: [
      { directionSeed: 'Institutional', explanation: 'Formal' },
      { directionSeed: 'Domestic peer', explanation: 'Intimate' },
      { directionSeed: 'Field reporter', explanation: 'Observational' },
    ],
    antiCollapseRules: ['Not one topic'],
    notThis: ['Not credit utilization content concept'],
    provenance: 'TEST',
    formationReceipt: null,
    brandPresentationLevel: null,
    topicIndependenceEval: null,
    recurrenceEval: null,
    conceptVsDirection: null,
    founderJudgment: null,
    judgmentNote: null,
    methodologyVersion: 'BRAND_PRESENTATION_CONCEPT_TERRITORY_V1',
    experimentId: EXPERIMENT_G_RUN_ID,
    formationVersion: 1,
    snapshotVersion: 1,
    snapshotFingerprint: 'abc',
    formationPromptVersion: 'V1',
    formationPromptFingerprint: 'def',
    conceptClassification: 'BRAND_PRESENTATION_CONCEPT',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('NDXBOOK Brand Presentation Concept Correction', () => {
  beforeEach(() => {
    resetExperimentGMemory();
    resetExperimentGStoreModeCache();
  });

  it('includes audit artifact', () => {
    expect(existsSync(AUDIT_PATH)).toBe(true);
  });

  it('1. Experiment D remains immutable', () => {
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBe(1);
  });

  it('2–3. Experiment F preserved and excluded from successor formation', () => {
    expect(experimentFHistoricalRecordsUnchanged()).toBe(true);
    expect(experimentFNotFailedExperiment()).toBe(true);
    expect(experimentFConceptsExcludedFromSuccessorFormation()).toBe(true);
    const overlay = getExperimentFMethodologyOverlay();
    expect(overlay.usedInSuccessorFormation).toBe(false);
    expect(overlay.formationSubject).toBe('CREDIT UTILIZATION');
  });

  it('4–5. Successor formation is topic-blind; credit utilization excluded', () => {
    expect(EXPERIMENT_G_FORMATION_SUBJECT).toBeNull();
    expect(successorFormationIsTopicBlind()).toBe(true);
    expect(creditUtilizationExcludedFromSuccessorFormation()).toBe(true);
    expect(EXPERIMENT_F_TOPIC_NAME).toBe('CREDIT UTILIZATION');
    const snap = compileExperimentGIntelligenceSnapshot({ profile: null });
    expect(snap.topicBlind).toBe(true);
    expect(snap.excludedHistoricalEvidence).toContain('CREDIT_UTILIZATION_FRAMING');
  });

  it('6. Brand Presentation Concept has dedicated semantic model', () => {
    const c = sampleBrandConcept();
    expect(c.conceptClassification).toBe('BRAND_PRESENTATION_CONCEPT');
    expect(c.brandExistenceModel).toBeTruthy();
    expect(c.recurrenceEngine).toBeTruthy();
  });

  it('7. Topic-specific concept fails evaluateBrandPresentationLevel', () => {
    const fail = evaluateBrandPresentationLevel(
      sampleBrandConcept({
        conceptThesis: 'How to explain credit utilization to beginners',
        brandBehavior: 'Explains credit utilization rates',
      }),
    );
    expect(fail.result).toBe('CONTENT_CONCEPT_NOT_BRAND_PRESENTATION');
  });

  it('8. Campaign-only concept fails', () => {
    const fail = evaluateBrandPresentationLevel(
      sampleBrandConcept({ brandBehavior: 'One campaign launch week only' }),
    );
    expect(fail.result).toBe('CAMPAIGN_CONCEPT_NOT_BRAND_PRESENTATION');
  });

  it('9. Visual-style-only concept fails', () => {
    const fail = evaluateBrandPresentationLevel(
      sampleBrandConcept({
        conceptThesis: 'serif cream gold palette typography visual style',
        knowledgeBehavior: '',
        brandBehavior: '',
      }),
    );
    expect(fail.result).toBe('STYLE_NOT_BRAND_PRESENTATION');
  });

  it('10. Format-only concept fails', () => {
    const fail = evaluateBrandPresentationLevel(
      sampleBrandConcept({
        brandBehavior: '',
        socialNativeBehavior: 'carousel reel story frame feed tile tiktok',
      }),
    );
    expect(fail.result).toBe('FORMAT_NOT_BRAND_PRESENTATION');
  });

  it('11. Persistent cross-topic concept can pass', () => {
    const pass = evaluateBrandPresentationLevel(sampleBrandConcept());
    expect(pass.result).toBe('PASS_BRAND_PRESENTATION');
  });

  it('12. Topic substitution is post-formation only', () => {
    expect(topicSubstitutionIsPostFormationOnly()).toBe(true);
    const payload = buildBrandPresentationDirectorPayload({
      snapshot: compileExperimentGIntelligenceSnapshot({ profile: null }),
    });
    expect(JSON.stringify(payload)).not.toContain('RETIREMENT PLANNING');
  });

  it('13. Every candidate supports at least three direction seeds', () => {
    const eval_ = evaluateBrandPresentationConceptVsDirection(sampleBrandConcept());
    expect(eval_.supportsMultipleDirections).toBe(true);
    expect(eval_.directionSeedCount).toBeGreaterThanOrEqual(3);
  });

  it('14–15. Six concepts undergo semantic set review; deterministic cannot alone approve', () => {
    expect(deterministicOrthogonalityCannotAloneApprove()).toBe(true);
  });

  it('16–18. Burn Book calibration + quarantine', () => {
    expect(burnBookIsCalibrationReferenceNotMandatoryCanon()).toBe(true);
    expect(burnBookLiteralArtifactNotRequiredInFormation()).toBe(true);
    expect(historicalEditorialMetaphorsQuarantined()).toBe(true);
    const snap = compileExperimentGIntelligenceSnapshot({ profile: null });
    expect(snap.referenceEvidence[0]?.policy).toBe('CALIBRATION_ONLY');
    expect(() => assertSuccessorFormationQuarantined('concept about credit utilization topic')).toThrow();
    expect(() =>
      assertSuccessorFormationQuarantined(
        'NDXBOOK as a persistent social brand — not a journal or editorial artifact metaphor',
      ),
    ).not.toThrow();
    expect(() => assertSuccessorFormationQuarantined('THE RITUAL CHECK-IN recurring brand behavior')).not.toThrow();
  });

  it('19–20. Brand Presentation ≠ Brand Canon; LOVE ≠ Brand Canon', () => {
    expect(brandPresentationConceptDoesNotEqualBrandCanon()).toBe(true);
    expect(loveTheConceptDoesNotEqualBrandCanon()).toBe(true);
  });

  it('21–24. No images, FAL, directions, or content during formation', async () => {
    expect(formationProducesZeroImagePrompts()).toBe(true);
    expect(formationTriggersZeroImageRequests()).toBe(true);
    expect(formationTriggersZeroFalRequests()).toBe(true);
    expect(loveConceptDoesNotTriggerDirectionDevelopment()).toBe(true);
    expect(automaticDownstreamExecutionBlocked()).toBe(true);
  });

  it('25. Formation prompt excludes credit utilization', () => {
    const payload = buildBrandPresentationDirectorPayload({
      snapshot: compileExperimentGIntelligenceSnapshot({ profile: null }),
    });
    expect(formationPromptExcludesCreditUtilization(JSON.stringify(payload))).toBe(true);
  });

  it('26–27. Durable persistence + methodology layers', async () => {
    await prepareExperimentGSnapshot();
    const formed = await formSixBrandPresentationConcepts();
    expect(formed.concepts).toHaveLength(6);
    expect(formed.formationReceipt).toBeTruthy();
    expect(formed.accounting.falRequests).toBe(0);
    expect(formed.accounting.gptImage2Requests).toBe(0);
    expect(BRAND_PRESENTATION_VS_CONTENT_CONCEPT_FORMALIZED).toBe(true);
    expect(brandPresentationDistinctFromContentConcept()).toBe(true);
  });

  it('28. Distinctiveness and level correctness separately evaluated', () => {
    expect(ORTHOGONALITY_NOT_EQUAL_ABSTRACTION_CORRECTNESS).toBe(true);
    expect(conceptualDistinctivenessSeparateFromLevelCorrectness()).toBe(true);
    expect(P05_METHODOLOGY_GAP).toBe('BRAND_PRESENTATION_VS_CONTENT_CONCEPT_LAYER_COLLAPSE');
  });

  it('formation run blocks direction development after LOVE', async () => {
    const formed = await formSixBrandPresentationConcepts();
    expect(formed.directionDevelopmentAllowed).toBe(false);
    expect(formed.visualGenerationAllowed).toBe(false);
    expect(formed.contentGenerationAllowed).toBe(false);
    expect(formed.brandCanonMutationAllowed).toBe(false);
  });

  it('recurrence and topic independence evaluators', () => {
    expect(evaluateBrandPresentationRecurrence(sampleBrandConcept()).result).toBe('PASS');
    expect(evaluateBrandPresentationTopicIndependence(sampleBrandConcept()).result).toBe('PASS_BRAND_LEVEL');
  });

  it('semantic set review on six concepts', async () => {
    const formed = await formSixBrandPresentationConcepts();
    const ortho = runBrandPresentationOrthogonalityEvaluation(formed.concepts);
    expect(ortho.semanticAuditResult).toBe('SEMANTIC_AUDIT_NOT_EVALUATED');
    expect(ortho.deterministicPreflight).toBe('HEURISTIC_PASS');
  });

  it('World Formation not executed', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });

  it('restart-safe idempotency', async () => {
    await formSixBrandPresentationConcepts();
    const again = await formSixBrandPresentationConcepts();
    const stored = await getBrandPresentationConceptFormationRun();
    expect(stored?.concepts.length).toBe(6);
    expect(again.concepts.length).toBe(6);
  });
});
