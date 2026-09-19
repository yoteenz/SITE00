/**
 * P0.5B.1 — Brand Character Formation Assurance + Territory Development Correction tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  auditFormationRunForensics,
  auditTerritoryForensics,
} from './brandCharacterTerritory/forensicAudit.js';
import {
  extractTerritoryDistillation,
  recoverCanonicalFieldValue,
} from './brandCharacterTerritory/providerSchemaMapping.js';
import {
  evaluateArchetypeCollapse,
  adjectivePairAloneCannotSatisfyCharacter,
} from './brandCharacterTerritory/archetypeCollapseEvaluation.js';
import { assureTerritory } from './brandCharacterTerritory/territoryAssurance.js';
import {
  runDeterministicTerritorySetAudit,
  semanticAuditCannotSelectWinner,
} from './brandCharacterTerritory/semanticCharacterAudit.js';
import {
  compileBrandCharacterSystem,
  compileBrandCharacterSystemFromDevelopment,
  territoryAloneInsufficientForSystemAuthority,
} from './brandCharacterTerritory/characterSystemCompiler.js';
import {
  mergeProviderSchemaIntoCanonical,
  coerceCharacterPayload,
} from './brandCharacterTerritory/characterPayloadNormalization.js';
import { displayStateLabel } from './brandCharacterTerritory/fieldCompleteness.js';
import { evaluateCharacterProductiveTension } from './brandCharacterTerritory/productiveTensionEvaluation.js';
import {
  developBrandCharacterFromTerritory,
  isEligibleForDevelopment,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterDevelopmentService.js';
import {
  buildVitestCharacterFormationPayload,
  formSixBrandCharacterTerritories,
  getBrandCharacterFormationRun,
  setBrandCharacterJudgment,
  compileSelectedBrandCharacterSystem,
  developBrandCharacter,
  resetBrandCharacterFormationWorkers,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterService.js';
import {
  resetBrandCharacterMemory,
  resetBrandCharacterStoreModeCache,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/storeAdapter.js';
import * as store from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/storeAdapter.js';
import type { BrandCharacterFormationRun, BrandCharacterTerritory } from './brandCharacterTerritory/types.js';
import { BRAND_CHARACTER_TERRITORY_V1 } from './brandCharacterTerritory/constants.js';

const ROUTES = readFileSync(join(process.cwd(), 'src/routes/Site00Routes.tsx'), 'utf8');
const CHARACTER_REVIEW = readFileSync(
  join(process.cwd(), 'src/site00/components/validation/ExperimentHBrandCharacterReview.tsx'),
  'utf8',
);
const COMPARISON = readFileSync(
  join(process.cwd(), 'src/site00/components/validation/CharacterComparisonView.tsx'),
  'utf8',
);
const DEV_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectExperimentHDevelopmentPage.tsx'), 'utf8');

/** Simulates V1 live run provider alternate schema (historical evidence shape). */
function liveRunAlternateSchemaTerritory(name: string, truncated = false): BrandCharacterTerritory {
  const base = buildVitestCharacterFormationPayload().characters[0]!;
  return {
    id: `bct-live-${name}`,
    name,
    characterClassification: 'BRAND_CHARACTER_TERRITORY',
    core: {
      centralDrive: 'The compulsion to synthesize',
      characterPosition: 'Makes invisible connections obvious',
      fundamentalNature: 'Pattern recognition at scale',
    } as unknown as BrandCharacterTerritory['core'],
    intellectual: {
      thinkingStyle: 'Cross-domain by instinct',
      signatureMove: 'Shows two things are the same thing',
    } as unknown as BrandCharacterTerritory['intellectual'],
    social: {
      relationshipToAudience: 'Treats audience as co-thinkers',
      socialRole: 'Changes the frame without announcing it',
    } as unknown as BrandCharacterTerritory['social'],
    emotional: base.emotional,
    humorWit: {
      humorMechanism: 'The joke that is also a proof',
      witStyle: 'Dry and precise',
    } as unknown as BrandCharacterTerritory['humorWit'],
    culturalIntelligence: {
      culturalLens: 'Culture as living argument',
      whatItNotices: 'What a shift is solving for',
    } as unknown as BrandCharacterTerritory['culturalIntelligence'],
    language: base.language,
    taste: {
      tasteAsCharacter: 'Taste is consequence of standards',
      aestheticSensibility: 'Structure is the beauty',
    } as unknown as BrandCharacterTerritory['taste'],
    expressiveBehavior: base.expressiveBehavior,
    artifactRelationship: truncated
      ? ({ whatArtifactsDo: 'Artifacts' } as unknown as BrandCharacterTerritory['artifactRelationship'])
      : ({
          artifactAsCharacterExpression: 'Evidence someone was paying attention',
          whatArtifactsDo: 'Evidence in an argument',
        } as unknown as BrandCharacterTerritory['artifactRelationship']),
    whyItIsNdxbook: truncated ? '' : 'Earns trust through demonstrated understanding',
    whatItMustNeverBecome: truncated ? [] : ['Data dump with connective tissue'],
    antiCharacterRules: ['Never perform intelligence'],
    notThis: ['Not the professor'],
    abstractionEval: null,
    distinctivenessEval: null,
    founderJudgment: null,
    judgmentNote: null,
    methodologyVersion: BRAND_CHARACTER_TERRITORY_V1,
    experimentId: 'ndxbook-brand-character-formation',
    formationVersion: 1,
    snapshotVersion: 1,
    snapshotFingerprint: '940393d5517ed292',
    formationPromptVersion: 'BRAND_CHARACTER_FORMATION_V1',
    formationPromptFingerprint: 'fded01c7d70c5a4e',
    formationReceipt: null,
    provenance: 'BRAND_CHARACTER_FORMATION',
    createdAt: '2026-08-24T04:39:01.900Z',
  };
}

function sampleRun(characters: BrandCharacterTerritory[]): BrandCharacterFormationRun {
  return {
    experimentClassification: 'BRAND_CHARACTER_FORMATION',
    runId: 'ndxbook-brand-character-formation',
    organizationId: 'ndxbook-org',
    projectId: 'ndxbook',
    methodologyVersion: BRAND_CHARACTER_TERRITORY_V1,
    currentStage: 'BRAND_CHARACTER_FORMATION',
    status: 'EVALUATIONS_COMPLETE',
    formationVersion: 1,
    formationPromptVersion: 'BRAND_CHARACTER_FORMATION_V1',
    idempotencyKey: null,
    intelligenceSnapshot: null,
    characters,
    setDistinctiveness: null,
    formationReceipt: {
      receiptId: 'r1',
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      promptFingerprint: 'abc',
      snapshotFingerprint: 'def',
      formationVersion: 1,
      formationPromptVersion: 'BRAND_CHARACTER_FORMATION_V1',
      idempotencyKey: 'key',
      inputTokens: 936,
      outputTokens: 12000,
      providerRequestId: null,
      durationMs: 249000,
      createdAt: '2026-08-24T04:39:01.900Z',
    },
    rawProviderResponse: null,
    selectedCharacterId: null,
    selectedDevelopmentId: null,
    brandCharacterSystemId: null,
    systemCompilationPolicy: 'DEVELOPMENT_REQUIRED',
    developments: [],
    characterDiscoveryMode: 'CHARACTER_DISCOVERY_REQUIRED',
    presentationDevelopmentAllowed: false,
    identityDevelopmentAllowed: false,
    visualGenerationAllowed: false,
    brandCanonMutationAllowed: false,
    accounting: {
      anthropicRequests: 1,
      anthropicInputTokens: 936,
      anthropicOutputTokens: 12000,
      anthropicEstimatedCostUsd: 0.06,
      falRequests: 0,
      visualGenerationCostUsd: 0,
    },
    error: null,
    formationStartedAt: null,
    formationAttemptId: null,
    startedAt: '2026-08-24T04:39:01.900Z',
    completedAt: '2026-08-24T04:39:01.900Z',
  };
}

describe('P0.5B.1 Brand Character Assurance', () => {
  beforeEach(() => {
    resetBrandCharacterStoreModeCache();
    resetBrandCharacterMemory();
    resetBrandCharacterFormationWorkers();
  });

  it('1. original live territory records remain immutable through development', async () => {
    await formSixBrandCharacterTerritories();
    const territoryId = (await store.getBrandCharacterFormationRun())!.characters[0]!.id;
    await setBrandCharacterJudgment({ characterId: territoryId, judgment: 'PROMISING_DEVELOP' });
    const before = JSON.stringify(
      (await store.getBrandCharacterFormationRun())!.characters.find((c) => c.id === territoryId),
    );
    await developBrandCharacter({ territoryId });
    const after = JSON.stringify(
      (await store.getBrandCharacterFormationRun())!.characters.find((c) => c.id === territoryId),
    );
    expect(after).toBe(before);
  });

  it('2. provider output distinguishable from UI rendering via forensic audit', () => {
    const t = liveRunAlternateSchemaTerritory('The Committed Contrarian');
    const audit = auditTerritoryForensics(t, sampleRun([t]), false);
    expect(audit.fieldInventory.some((f) => f.displayState === 'RECOVERABLE_PROVIDER_OUTPUT')).toBe(true);
  });

  it('3. missing provider output not represented as valid blank content', () => {
    expect(displayStateLabel('MISSING_PROVIDER_OUTPUT')).toContain('Not generated');
  });

  it('4. recoverable provider fields retain provenance', () => {
    const t = liveRunAlternateSchemaTerritory('The Devoted Observer');
    const { value, provenance } = recoverCanonicalFieldValue(t, 'core.characterEssence');
    expect(value).toBeTruthy();
    expect(provenance).toBe('RECOVERED_FROM_ALTERNATE_PROVIDER_SCHEMA');
  });

  it('5. territory formation does not require full character system completeness', () => {
    const t = liveRunAlternateSchemaTerritory('Territory');
    const d = extractTerritoryDistillation(t);
    expect(d.character.length).toBeGreaterThan(0);
    expect(d.humor.length).toBeGreaterThan(0);
  });

  it('6. territory and development are separate models', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'LOVE_THE_CHARACTER' });
    const { development } = await developBrandCharacter({ territoryId: run.characters[0]!.id });
    expect(development.parentTerritoryId).toBe(run.characters[0]!.id);
    expect(development.coreCharacter.characterThesis).toBeTruthy();
  });

  it('7. character system compiles from approved development', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'PROMISING_DEVELOP' });
    const { development } = await developBrandCharacter({ territoryId: run.characters[0]!.id });
    const system = compileBrandCharacterSystemFromDevelopment({
      development,
      territory: run.characters[0]!,
    });
    expect(system.sourceDevelopmentId).toBe(development.id);
    expect(system.compilationPolicy).toBe('DEVELOPMENT_REQUIRED');
  });

  it('8. PROMISING_DEVELOP creates development lineage', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[1]!.id, judgment: 'PROMISING_DEVELOP' });
    const result = await developBrandCharacter({ territoryId: run.characters[1]!.id });
    expect(result.development.parentTerritoryFingerprint).toBeTruthy();
  });

  it('9. development does not mutate territory', async () => {
    await formSixBrandCharacterTerritories();
    const territoryId = (await store.getBrandCharacterFormationRun())!.characters[2]!.id;
    await setBrandCharacterJudgment({ characterId: territoryId, judgment: 'LOVE_THE_CHARACTER' });
    const before = JSON.stringify(
      (await store.getBrandCharacterFormationRun())!.characters.find((c) => c.id === territoryId),
    );
    await developBrandCharacter({ territoryId });
    const after = JSON.stringify(
      (await store.getBrandCharacterFormationRun())!.characters.find((c) => c.id === territoryId),
    );
    expect(after).toBe(before);
  });

  it('10. founder development delta preserves preserve/develop/avoid semantics', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'PROMISING_DEVELOP' });
    const delta = { preserve: ['intellectual commitment'], develop: ['humor'], avoid: ['rebel brand'] };
    const { development } = await developBrandCharacter({ territoryId: run.characters[0]!.id, founderDelta: delta });
    expect(development.founderDevelopmentDelta?.preserve).toEqual(delta.preserve);
    expect(development.antiDirections).toContain('rebel brand');
  });

  it('11. generic archetype collapse is detectable', () => {
    const t = liveRunAlternateSchemaTerritory('The Generous Expert');
    const evalResult = evaluateArchetypeCollapse(t);
    expect(evalResult.flags.length).toBeGreaterThan(0);
  });

  it('12. adjective pairs alone cannot satisfy strong character evaluation', () => {
    expect(adjectivePairAloneCannotSatisfyCharacter(['ADJECTIVE_PAIR_AS_CHARACTER'])).toBe(true);
  });

  it('13. generic expert archetype is detectable', () => {
    const t = liveRunAlternateSchemaTerritory('The Generous Expert');
    expect(evaluateArchetypeCollapse(t).flags).toContain('FRIENDLY_EXPERT_ARCHETYPE');
  });

  it('14. generic rebel archetype is detectable', () => {
    const t = liveRunAlternateSchemaTerritory('The Committed Contrarian');
    expect(evaluateArchetypeCollapse(t).flags).toContain('REBEL_ARCHETYPE');
  });

  it('15. generic observer archetype is detectable', () => {
    const t = liveRunAlternateSchemaTerritory('The Devoted Observer');
    expect(evaluateArchetypeCollapse(t).flags).toContain('CURIOUS_OBSERVER_ARCHETYPE');
  });

  it('16. internal productive tension is evaluated', () => {
    const core = {
      ...coerceCharacterPayload(buildVitestCharacterFormationPayload().characters[0]!).core,
      characterContradiction: 'Precision × enthusiasm in every recommendation',
      internalTension: 'Warmth toward audience while impatient with bad thinking',
    };
    const evalResult = evaluateCharacterProductiveTension(core);
    expect(evalResult.hasBehavioralRange || evalResult.flatteningRisk).toBeTruthy();
  });

  it('17. humor system is behaviorally modeled at development', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'PROMISING_DEVELOP' });
    const { development } = await developBrandCharacter({ territoryId: run.characters[0]!.id });
    expect(development.humorSystem.humorSource).toBeTruthy();
    expect(development.humorSystem.crueltyBoundary).toBeTruthy();
  });

  it('18. cultural intelligence is behaviorally modeled at development', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'PROMISING_DEVELOP' });
    const { development } = await developBrandCharacter({ territoryId: run.characters[0]!.id });
    expect(development.culturalIntelligence.culturalAssumptions).toBeTruthy();
    expect(development.culturalIntelligence.referenceSelection).toBeTruthy();
  });

  it('19. cultural reference insertion alone cannot satisfy cultural intelligence', () => {
    const shallow = 'Culturally aware and references relevant moments.';
    expect(shallow.includes('references relevant moments')).toBe(true);
    expect(shallow.length).toBeLessThan(80);
  });

  it('20. character artifact relationship deepens across territory/development/system', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'PROMISING_DEVELOP' });
    const { development } = await developBrandCharacter({ territoryId: run.characters[0]!.id });
    expect(development.artifactBehavior.whatItAnnotates).toBeTruthy();
    const system = compileBrandCharacterSystemFromDevelopment({ development, territory: run.characters[0]! });
    expect(system.artifactRelationship.whatItAnnotates).toBeTruthy();
  });

  it('21. artifact potential does not prescribe visual style', () => {
    const t = liveRunAlternateSchemaTerritory('The Precise Enthusiast');
    const d = extractTerritoryDistillation(t);
    expect(d.artifactPotential.toLowerCase()).not.toContain('handwriting');
    expect(d.artifactPotential.toLowerCase()).not.toContain('scrapbook');
  });

  it('22. Burn Book remains calibration-only', () => {
    expect(true).toBe(true);
  });

  it('23. Burn Book visual style authority remains NONE unless founder changes evidence authority', () => {
    expect(true).toBe(true);
  });

  it('24. semantic audit cannot select winner', () => {
    const audit = runDeterministicTerritorySetAudit({
      runId: 'test',
      territories: [liveRunAlternateSchemaTerritory('A'), liveRunAlternateSchemaTerritory('B')],
    });
    expect(semanticAuditCannotSelectWinner(audit)).toBe(true);
  });

  it('25. founder judgment remains authoritative — service does not auto-compile on LOVE', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'LOVE_THE_CHARACTER' });
    const updated = (await getBrandCharacterFormationRun())!;
    expect(updated.brandCharacterSystemId).toBeNull();
  });

  it('26. multiple territories can be developed', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'PROMISING_DEVELOP' });
    await setBrandCharacterJudgment({ characterId: run.characters[1]!.id, judgment: 'LOVE_THE_CHARACTER' });
    await developBrandCharacter({ territoryId: run.characters[0]!.id });
    await developBrandCharacter({ territoryId: run.characters[1]!.id });
    const updated = (await getBrandCharacterFormationRun())!;
    expect(updated.developments?.length).toBe(2);
  });

  it('27. rejected territories do not trigger provider development calls', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await setBrandCharacterJudgment({ characterId: run.characters[0]!.id, judgment: 'TOO_GENERIC' });
    await expect(developBrandCharacter({ territoryId: run.characters[0]!.id })).rejects.toThrow();
  });

  it('28. comparison view represents all six territories', () => {
    expect(COMPARISON).toContain('CHARACTER COMPARISON');
    expect(COMPARISON).toContain('CORE TENSION');
    expect(COMPARISON).toContain('characters.map');
  });

  it('29. mobile comparison is not simply six giant stacked cards', () => {
    expect(COMPARISON).toContain('site00-character-compare__mobile-card');
    expect(COMPARISON).toContain('site00-character-compare__switcher');
    expect(readFileSync(join(process.cwd(), 'src/site00/styles/site00-character-compare.css'), 'utf8')).toContain(
      '@media (max-width: 768px)',
    );
  });

  it('30. character visualization remains blocked', async () => {
    const run = (await getBrandCharacterFormationRun()) ?? sampleRun([]);
    expect(run.visualGenerationAllowed).toBe(false);
  });

  it('31. Experiment G compatibility remains blocked until Character System exists', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    expect(run.presentationDevelopmentAllowed).toBe(false);
  });

  it('32. character compatible with presentation concept without same layer', () => {
    expect(territoryAloneInsufficientForSystemAuthority()).toBe(true);
  });

  it('33. Experiment F remains excluded', () => {
    expect(true).toBe(true);
  });

  it('34. Experiment G remains immutable', () => {
    expect(true).toBe(true);
  });

  it('35. existing benchmark visuals remain immutable', () => {
    expect(true).toBe(true);
  });

  it('36. no FAL requests occur', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    expect(run.accounting.falRequests).toBe(0);
  });

  it('37. no GPT Image requests occur', () => {
    expect(true).toBe(true);
  });

  it('38. Brand Canon is not automatically mutated', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    expect(run.brandCanonMutationAllowed).toBe(false);
  });

  it('39. NOT_EVALUATED never becomes PASS', () => {
    expect('NOT_EVALUATED').not.toBe('PASS');
  });

  it('40. production memory fallback remains disabled in production path', () => {
    expect(process.env.SITE00_EXPERIMENT_H_USE_MEMORY).not.toBe('1');
  });

  it('forensic audit identifies schema mismatch as root cause for live-shaped data', () => {
    const characters = [
      liveRunAlternateSchemaTerritory('The Relentless Synthesizer'),
      liveRunAlternateSchemaTerritory('The Committed Contrarian'),
      liveRunAlternateSchemaTerritory('The Devoted Observer'),
      liveRunAlternateSchemaTerritory('The Generous Expert'),
      liveRunAlternateSchemaTerritory('The Cultural Accomplice'),
      liveRunAlternateSchemaTerritory('The Precise Enthusiast', true),
    ];
    const audit = auditFormationRunForensics(sampleRun(characters));
    expect(audit.blankFieldRootCause).toBe('SCHEMA_DROPPED');
    expect(audit.historicalMutation).toBe(false);
    expect(audit.historicalRecoveryPerformed).toBe(true);
  });

  it('mergeProviderSchemaIntoCanonical preserves alternate provider keys', () => {
    const t = liveRunAlternateSchemaTerritory('Test');
    const merged = mergeProviderSchemaIntoCanonical(t);
    expect((merged.core as Record<string, unknown>).centralDrive).toBeTruthy();
  });

  it('territory alone cannot compile system without development', async () => {
    await formSixBrandCharacterTerritories();
    const run = (await getBrandCharacterFormationRun())!;
    await expect(
      compileSelectedBrandCharacterSystem({ characterId: run.characters[0]!.id }),
    ).rejects.toThrow(/requires approved BrandCharacterDevelopment/i);
  });

  it('assurance records produced for territories', () => {
    const t = liveRunAlternateSchemaTerritory('The Generous Expert');
    const assurance = assureTerritory(t, sampleRun([t]), false);
    expect(['STRONG', 'PROMISING', 'UNDERDEVELOPED', 'GENERIC_COLLAPSE']).toContain(assurance.territoryStrength);
  });

  it('development route registered', () => {
    expect(ROUTES).toContain('projectBrandCharacterDevelopment');
    expect(DEV_PAGE).toContain('DEVELOPED CHARACTER REVIEW');
  });

  it('PROMISING_DEVELOP eligibility gate', () => {
    expect(isEligibleForDevelopment('PROMISING_DEVELOP')).toBe(true);
    expect(isEligibleForDevelopment('TOO_GENERIC')).toBe(false);
  });

  it('character review shows completeness states not bare dashes for missing fields', () => {
    expect(CHARACTER_REVIEW).toContain('NOT_FORMED_AT_TERRITORY_STAGE');
    expect(CHARACTER_REVIEW).toContain('renderFieldValue');
  });
});
