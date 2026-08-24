/**
 * P0.5B — Brand Character System + NDXBOOK Character Formation tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BRAND_CHARACTER_LAYER_FORMALIZED,
  BRAND_CHARACTER_SYSTEM_IMPLEMENTED,
  CHARACTER_ARTIFACT_RELATIONSHIP_FORMALIZED,
  CHARACTER_VS_PRESENTATION_BOUNDARY_ENFORCED,
  CULTURAL_INTELLIGENCE_FIRST_CLASS,
  NDXBOOK_CHARACTER_FORMATION_PIPELINE_READY,
  UPSTREAM_CHARACTER_LAYER_MISSING,
} from './brandCharacterTerritory/constants.js';
import {
  characterDistinctFromBrandPersonalityEvidence,
  characterDistinctFromBrandPresentationConcept,
  characterDistinctFromIdentityDirection,
  evaluateCharacterAbstractionLevel,
  styleCannotSatisfyCharacterFormation,
  contentConceptCannotSatisfyCharacterFormation,
  topicCannotSatisfyCharacterFormation,
} from './brandCharacterTerritory/abstractionGuard.js';
import {
  compileBrandCharacterIntelligenceSnapshot,
  experimentFExcludedFromCharacterFormation,
  experimentGExcludedAsCharacterAnswers,
  benchmarkVisualsExcludedAsPositiveCharacterAnswers,
  creditUtilizationExcludedFromCharacterFormation,
} from './brandCharacterTerritory/intelligenceSnapshot.js';
import {
  evaluateCharacterArtifactRelationship,
  characterArtifactRelationshipExists,
  notEvaluatedCannotBecomePass,
} from './brandCharacterTerritory/artifactRelationship.js';
import {
  evaluateBrandCharacterSetDistinctiveness,
  deterministicCannotDeclareSemanticDistinctiveness,
  humorModeledBeyondFunnyBoolean,
  culturalIntelligenceDistinctFromReferenceInsertion,
  characterSupportsEmotionalTonalRange,
} from './brandCharacterTerritory/distinctiveness.js';
import {
  compileBrandCharacterSystem,
  loveDoesNotMutateBrandCanon,
  multiplePromisingCharactersMaySurvive,
  characterFingerprintPropagatesDownstream,
  characterConsistencyDistinctFromTonalSameness,
} from './brandCharacterTerritory/characterSystemCompiler.js';
import {
  burnBookLiteralCloningPrevented,
  burnBookProvidesCharacterCalibrationAuthority,
  experimentGRecordsRemainImmutable,
  noVisualGenerationDuringCharacterFormation,
  founderSelectionRequiredForCharacterSystem,
  establishedBrandMayCaptureExistingCharacter,
} from './brandCharacterTerritory/evidenceQuarantine.js';
import {
  characterChangeDoesNotAutoRegenerateDownstream,
  historicalExperimentGRecordsImmutable,
} from './brandCharacterTerritory/invalidationRegistration.js';
import {
  buildVitestCharacterFormationPayload,
  formSixBrandCharacterTerritories,
  getBrandCharacterFormationRun,
  prepareBrandCharacterSnapshot,
  setBrandCharacterJudgment,
  compileSelectedBrandCharacterSystem,
  developBrandCharacter,
  resetBrandCharacterFormationWorkers,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterService.js';
import {
  resetBrandCharacterMemory,
  resetBrandCharacterStoreModeCache,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/storeAdapter.js';
import { resolveDownstreamInvalidation } from '../site00-studio-world-production/invalidationResolver.js';
import { instantiateCanonicalEdge } from '../site00-studio-world-production/canonicalDependencyEdges.js';
import { classifyBurnBookReferenceAuthority, burnBookLiteralStyleAuthorityBlocked } from '../site00-visual-reference/culturalCalibration.js';
import type { BrandCharacterTerritory } from './brandCharacterTerritory/types.js';

const ROUTES = readFileSync(join(process.cwd(), 'src/routes/Site00Routes.tsx'), 'utf8');
const CHARACTER_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectExperimentHPage.tsx'), 'utf8');
const CHARACTER_REVIEW = readFileSync(
  join(process.cwd(), 'src/site00/components/validation/ExperimentHBrandCharacterReview.tsx'),
  'utf8',
);

function sampleTerritory(overrides?: Partial<BrandCharacterTerritory>): BrandCharacterTerritory {
  const raw = buildVitestCharacterFormationPayload().characters[0]!;
  return {
    id: 'bct-test-1',
    name: raw.name,
    characterClassification: 'BRAND_CHARACTER_TERRITORY',
    core: raw.core,
    intellectual: raw.intellectual,
    social: raw.social,
    emotional: raw.emotional,
    humorWit: raw.humorWit,
    culturalIntelligence: raw.culturalIntelligence,
    language: raw.language,
    taste: raw.taste,
    expressiveBehavior: raw.expressiveBehavior,
    artifactRelationship: raw.artifactRelationship,
    whyItIsNdxbook: raw.whyItIsNdxbook,
    whatItMustNeverBecome: raw.whatItMustNeverBecome,
    antiCharacterRules: raw.antiCharacterRules,
    notThis: raw.notThis,
    abstractionEval: null,
    distinctivenessEval: null,
    founderJudgment: null,
    judgmentNote: null,
    methodologyVersion: 'BRAND_CHARACTER_TERRITORY_V1',
    experimentId: 'ndxbook-brand-character-formation',
    formationVersion: 1,
    snapshotVersion: 1,
    snapshotFingerprint: 'abc',
    formationPromptVersion: 'BRAND_CHARACTER_FORMATION_V1',
    formationPromptFingerprint: 'def',
    formationReceipt: null,
    provenance: 'TEST',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  process.env.SITE00_EXPERIMENT_H_USE_MEMORY = '1';
  resetBrandCharacterMemory();
  resetBrandCharacterStoreModeCache();
  resetBrandCharacterFormationWorkers();
});

describe('P0.5B Brand Character System', () => {
  it('1. Brand Character is distinct from Brand Personality evidence', () => {
    expect(characterDistinctFromBrandPersonalityEvidence()).toBe(true);
    expect(BRAND_CHARACTER_LAYER_FORMALIZED).toBe(true);
  });

  it('2. Brand Character is distinct from Brand Presentation Concept', () => {
    expect(characterDistinctFromBrandPresentationConcept()).toBe(true);
    expect(CHARACTER_VS_PRESENTATION_BOUNDARY_ENFORCED).toBe(true);
  });

  it('3. Brand Character is distinct from Identity Direction', () => {
    expect(characterDistinctFromIdentityDirection()).toBe(true);
  });

  it('4. Style cannot satisfy character formation', () => {
    expect(styleCannotSatisfyCharacterFormation()).toBe(true);
    const styleTerritory = sampleTerritory({
      core: { ...sampleTerritory().core, characterThesis: 'Use Helvetica Neue Bold as our visual style guide' },
    });
    styleTerritory.abstractionEval = evaluateCharacterAbstractionLevel(styleTerritory);
    expect(styleTerritory.abstractionEval?.result).toBe('STYLE_AS_CHARACTER');
  });

  it('5. Content concept cannot satisfy character formation', () => {
    expect(contentConceptCannotSatisfyCharacterFormation()).toBe(true);
    const contentTerritory = sampleTerritory({
      core: { ...sampleTerritory().core, characterThesis: 'A content concept about credit utilization campaigns' },
    });
    contentTerritory.abstractionEval = evaluateCharacterAbstractionLevel(contentTerritory);
    expect(contentTerritory.abstractionEval?.result).toBe('CONTENT_CONCEPT_AS_CHARACTER');
  });

  it('6. Topic cannot satisfy character formation', () => {
    expect(topicCannotSatisfyCharacterFormation()).toBe(true);
  });

  it('7. Six NDXBOOK territories formed topic-blind', async () => {
    await prepareBrandCharacterSnapshot();
    const run = await formSixBrandCharacterTerritories();
    expect(run.characters).toHaveLength(6);
    expect(run.intelligenceSnapshot?.topicBlind).toBe(true);
    run.characters.forEach((c) => {
      expect(c.abstractionEval?.answersWhoQuestion).toBe(true);
    });
  });

  it('8. Experiment F cannot contaminate character formation', () => {
    expect(experimentFExcludedFromCharacterFormation()).toBe(true);
    const snapshot = compileBrandCharacterIntelligenceSnapshot({ profile: null });
    expect(snapshot.excludedHistoricalEvidence).toContain('EXPERIMENT_F_SIX_CONTENT_CONCEPTS');
  });

  it('9. Experiment G concepts cannot anchor character formation', () => {
    expect(experimentGExcludedAsCharacterAnswers()).toBe(true);
    const snapshot = compileBrandCharacterIntelligenceSnapshot({ profile: null });
    expect(snapshot.excludedHistoricalEvidence).toContain('EXPERIMENT_G_SIX_BRAND_PRESENTATION_CONCEPTS');
    const anchored = sampleTerritory({ name: 'THE ROOM THAT KNOWS VARIANT' });
    anchored.abstractionEval = evaluateCharacterAbstractionLevel(anchored);
    expect(anchored.abstractionEval?.result).toBe('PRESENTATION_CONCEPT_AS_CHARACTER');
  });

  it('10. Burn Book cannot become literal style authority', () => {
    expect(burnBookLiteralCloningPrevented()).toBe(true);
    expect(burnBookLiteralStyleAuthorityBlocked()).toBe(true);
    const authority = classifyBurnBookReferenceAuthority();
    expect(authority.VISUAL_STYLE).toBe('NONE');
    expect(authority.TYPOGRAPHIC_BEHAVIOR).toBe('NONE');
  });

  it('11. Burn Book can provide cultural/character calibration authority', () => {
    expect(burnBookProvidesCharacterCalibrationAuthority()).toBe(true);
    const authority = classifyBurnBookReferenceAuthority();
    expect(authority.CHARACTER_CALIBRATION).toBe('CALIBRATION_ONLY');
    expect(authority.HUMOR_CALIBRATION).toBe('CALIBRATION_ONLY');
  });

  it('12. CharacterArtifactRelationship exists', () => {
    expect(characterArtifactRelationshipExists()).toBe(true);
    expect(CHARACTER_ARTIFACT_RELATIONSHIP_FORMALIZED).toBe(true);
  });

  it('13. Cultural intelligence is distinct from reference insertion', () => {
    expect(culturalIntelligenceDistinctFromReferenceInsertion()).toBe(true);
    expect(CULTURAL_INTELLIGENCE_FIRST_CLASS).toBe(true);
  });

  it('14. Humor is modeled beyond FUNNY boolean/adjective', () => {
    expect(humorModeledBeyondFunnyBoolean()).toBe(true);
    const t = sampleTerritory();
    expect(t.humorWit.witMechanism).toBeTruthy();
    expect(t.humorWit.whatTheBrandWouldNeverJokeAbout).toBeTruthy();
  });

  it('15. Character supports emotional/tonal range', () => {
    expect(characterSupportsEmotionalTonalRange()).toBe(true);
    expect(characterConsistencyDistinctFromTonalSameness()).toBe(true);
  });

  it('16. Character fingerprint propagates downstream', async () => {
    await prepareBrandCharacterSnapshot();
    const run = await formSixBrandCharacterTerritories();
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'PROMISING_DEVELOP' });
    const { development } = await developBrandCharacter({ territoryId: run.characters[0]!.id });
    const { system } = await compileSelectedBrandCharacterSystem({
      characterId: run.characters[0]!.id,
      developmentId: development.id,
    });
    const fp = characterFingerprintPropagatesDownstream(system);
    expect(fp.brandCharacterSystemId).toBe(system.id);
    expect(fp.brandCharacterFingerprint).toBeTruthy();
  });

  it('17. Character changes invalidate appropriate downstream artifacts', () => {
    const edge = instantiateCanonicalEdge(
      'ndxbook',
      {
        upstreamType: 'BRAND_CHARACTER_SYSTEM',
        downstreamType: 'CONCEPT_FORMATION',
        invalidationPolicy: 'SOFT_REVIEW_REQUIRED',
        reason: 'Presentation concepts need character compatibility review',
        changeTypes: ['BRAND_CHARACTER_CHANGE'],
      },
      'bcs-test',
      'concept-formation',
    );
    const result = resolveDownstreamInvalidation({
      projectId: 'ndxbook',
      changeType: 'BRAND_CHARACTER_CHANGE',
      sourceType: 'BRAND_CHARACTER_SYSTEM',
      sourceId: 'bcs-test',
      changeSummary: 'Character system updated',
      graph: { edges: [edge], nodes: [] },
      downstreamRecords: [{ recordType: 'CONCEPT_FORMATION', recordId: 'concept-formation' }],
    });
    expect(result.invalidationPolicy).toBe('SOFT_REVIEW_REQUIRED');
    expect(result.automaticRegenerationBlocked).toBe(true);
  });

  it('18. No automatic regeneration occurs after invalidation', () => {
    expect(characterChangeDoesNotAutoRegenerateDownstream()).toBe(true);
  });

  it('19. Historical Experiment G records remain immutable', () => {
    expect(experimentGRecordsRemainImmutable()).toBe(true);
    expect(historicalExperimentGRecordsImmutable()).toBe(true);
  });

  it('20. No visual generation during character formation', async () => {
    expect(noVisualGenerationDuringCharacterFormation()).toBe(true);
    await prepareBrandCharacterSnapshot();
    const run = await formSixBrandCharacterTerritories();
    expect(run.visualGenerationAllowed).toBe(false);
    expect(run.accounting.falRequests).toBe(0);
  });

  it('21. Founder selection is required', () => {
    expect(founderSelectionRequiredForCharacterSystem()).toBe(true);
  });

  it('22. LOVE does not automatically mutate Brand Canon', async () => {
    expect(loveDoesNotMutateBrandCanon()).toBe(true);
    await prepareBrandCharacterSnapshot();
    const run = await formSixBrandCharacterTerritories();
    const updated = await setBrandCharacterJudgment({
      characterId: run.characters[0]!.id,
      judgment: 'LOVE_THE_CHARACTER',
    });
    expect(updated.brandCanonMutationAllowed).toBe(false);
  });

  it('23. NOT_EVALUATED cannot become PASS', () => {
    const evalResult = evaluateCharacterArtifactRelationship({
      artifactDescription: '',
      expressiveChoices: [],
      annotationPresent: false,
      judgmentPresent: false,
      reactionPresent: false,
      personalityWrittenAboutOnly: false,
    });
    expect(evalResult.result).toBe('FAIL_NO_DETECTABLE_MAKER');
    expect(notEvaluatedCannotBecomePass('NOT_EVALUATED')).toBe(true);
    expect(notEvaluatedCannotBecomePass('PASS_CHARACTER_EVIDENCE')).toBe(false);
  });

  it('24. Established future brands can skip invention and capture existing character', () => {
    expect(establishedBrandMayCaptureExistingCharacter()).toBe(true);
    const snapshot = compileBrandCharacterIntelligenceSnapshot({
      profile: null,
      characterDiscoveryMode: 'CHARACTER_ESTABLISHED',
    });
    expect(snapshot.characterDiscoveryMode).toBe('CHARACTER_ESTABLISHED');
  });

  it('25. NDXBOOK character formation remains independent of CREDIT UTILIZATION', () => {
    expect(creditUtilizationExcludedFromCharacterFormation()).toBe(true);
    expect(benchmarkVisualsExcludedAsPositiveCharacterAnswers()).toBe(true);
    const snapshot = compileBrandCharacterIntelligenceSnapshot({ profile: null });
    expect(snapshot.excludedHistoricalEvidence).toContain('CREDIT_UTILIZATION_FRAMING');
    expect(UPSTREAM_CHARACTER_LAYER_MISSING).toBe('UPSTREAM_CHARACTER_LAYER_MISSING');
  });

  it('pipeline flags and UI route', () => {
    expect(BRAND_CHARACTER_SYSTEM_IMPLEMENTED).toBe(true);
    expect(NDXBOOK_CHARACTER_FORMATION_PIPELINE_READY).toBe(true);
    expect(ROUTES).toContain('ProjectExperimentHPage');
    expect(CHARACTER_REVIEW).toContain('Brand Character Territories');
    expect(CHARACTER_REVIEW).toContain('UPSTREAM_CHARACTER_LAYER_MISSING');
  });

  it('set distinctiveness requires semantic audit', async () => {
    await prepareBrandCharacterSnapshot();
    const run = await formSixBrandCharacterTerritories();
    expect(run.setDistinctiveness?.semanticAuditRequired).toBe(true);
    expect(deterministicCannotDeclareSemanticDistinctiveness()).toBe(true);
    const evalResult = evaluateBrandCharacterSetDistinctiveness(run.characters);
    expect(evalResult.result).toBe('REQUIRES_SEMANTIC_AUDIT');
  });

  it('multiple promising characters may survive', () => {
    expect(multiplePromisingCharactersMaySurvive()).toBe(true);
  });

  it('brand character system compiles from territory', async () => {
    await prepareBrandCharacterSnapshot();
    const run = await formSixBrandCharacterTerritories();
    const system = compileBrandCharacterSystem({ territory: run.characters[0]! });
    expect(system.sourceTerritoryId).toBe(run.characters[0]!.id);
    expect(system.humorSystem.humorLogic).toBeTruthy();
    expect(system.allowedRange.length).toBeGreaterThan(0);
  });

  it('get run after formation', async () => {
    await prepareBrandCharacterSnapshot();
    await formSixBrandCharacterTerritories();
    const run = await getBrandCharacterFormationRun();
    expect(run?.status).toBe('EVALUATIONS_COMPLETE');
  });

  it('coerces partial character payloads without crashing UI', async () => {
    const { coerceCharacterPayload, migrateCharacterTerritory } = await import(
      './brandCharacterTerritory/characterPayloadNormalization.js'
    );
    const partial = {
      name: 'PARTIAL CHARACTER',
      core: { characterThesis: 'A thesis only' },
      whatItMustNeverBecome: 'Generic influencer',
    };
    const coerced = coerceCharacterPayload(partial);
    expect(coerced.core.characterThesis).toBe('A thesis only');
    expect(coerced.intellectual.intelligenceStyle).toBe('');
    expect(coerced.whatItMustNeverBecome).toEqual(['Generic influencer']);

    const migrated = migrateCharacterTerritory({
      ...(sampleTerritory()),
      core: undefined as unknown as BrandCharacterTerritory['core'],
      whatItMustNeverBecome: 'One string item' as unknown as string[],
    });
    expect(Array.isArray(migrated.whatItMustNeverBecome)).toBe(true);
    expect(migrated.core.characterThesis).toBeTruthy();
  });
});
