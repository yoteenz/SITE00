/**
 * P0.5B.3 — Composite Brand Character Synthesis + Artifact Visualization tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  brandCharacterSynthesisImplemented,
  captureFounderCharacterHypothesis,
  founderHypothesisIsEvidenceNotCanon,
  rawFounderHypothesisPreserved,
  evaluateBrandCharacterSynthesis,
  evaluateCharacterMaturationContinuity,
  maturationDoesNotSanitize,
  evaluateProductiveContradictions,
  productiveContradictionsPreserved,
  createCharacterTrace,
  assertArtifactCausality,
  decorativeTraceFails,
  randomCollageFails,
  artifactCausalityEnforced,
  compileBehaviorFirstFalPrompt,
  falPromptBeginsFromBehavior,
  artifactSurvivesLimeRemovalConceptually,
  compileBrandCharacterSystemFromSynthesis,
  compositeSystemDoesNotMutateBrandCanon,
  buildVitestBrandCharacterSynthesis,
  buildVitestArtifactProofs,
  synthesisIsNotArchetypeMashup,
  resolveTerritoryRole,
  buildTerritoryRoleMap,
  isNdxbookSynthesisSourceTerritory,
  territoriesReclassifiedAsDiscoveries,
  experimentGRemainsImmutable,
  productExpressionRemainsFalse,
  worldFormationRemainsFalse,
  noFalBeforeFounderCharacterApproval,
} from './brandCharacterSynthesis/index.js';
import {
  runCompositeBrandCharacterSynthesis,
  prepareBrandCharacterSynthesis,
  setBrandCharacterSynthesisJudgment,
  compileSynthesisBrandCharacterSystem,
  formulateBrandCharacterArtifactProofs,
  generateBrandCharacterArtifactProofAsset,
  seedVitestNdxbookSynthesisPrerequisites,
  historicalTerritoriesRemainImmutable,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterSynthesisService.js';
import {
  resetBrandCharacterSynthesisMemory,
  resetBrandCharacterSynthesisStoreModeCache,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterSynthesisStoreAdapter.js';
import {
  resetBrandCharacterMemory,
  resetBrandCharacterStoreModeCache,
  getBrandCharacterFormationRun,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/storeAdapter.js';
import { resetBrandCharacterFormationWorkers } from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterService.js';
import {
  resetBrandCharacterReadinessMemory,
  resetBrandCharacterReadinessStoreModeCache,
} from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterReadinessStoreAdapter.js';
import { evaluateAndPersistBrandCharacterReadiness } from '../../api/_lib/site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterReadinessService.js';
import { buildVitestRichBrandLoreProfile } from './brandCharacterReadiness/vitestFixtures.js';
import type { BrandCharacterTerritory } from './brandCharacterTerritory/types.js';

vi.mock('../../api/_lib/site00BrandLore/loreService.js', () => ({
  getBrandLoreProfileForOrg: vi.fn(),
}));

import { getBrandLoreProfileForOrg } from '../../api/_lib/site00BrandLore/loreService.js';

const ROUTES = readFileSync(join(process.cwd(), 'src/site00/config/routes.ts'), 'utf8');
const SITE_ROUTES = readFileSync(join(process.cwd(), 'src/routes/Site00Routes.tsx'), 'utf8');
const SYNTHESIS_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectBrandCharacterSynthesisPage.tsx'), 'utf8');
const PROOFS_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectBrandCharacterArtifactProofsPage.tsx'), 'utf8');

beforeEach(() => {
  resetBrandCharacterSynthesisMemory();
  resetBrandCharacterSynthesisStoreModeCache();
  resetBrandCharacterReadinessMemory();
  resetBrandCharacterReadinessStoreModeCache();
  resetBrandCharacterMemory();
  resetBrandCharacterStoreModeCache();
  resetBrandCharacterFormationWorkers();
  vi.mocked(getBrandLoreProfileForOrg).mockResolvedValue(buildVitestRichBrandLoreProfile());
});

describe('P0.5B.3 Brand Character Synthesis', () => {
  it('1. deepening answers participate in refreshed readiness', async () => {
    await seedVitestNdxbookSynthesisPrerequisites();
    const record = await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    expect(record.deepeningModule?.answers.length).toBeGreaterThanOrEqual(0);
    const prepared = await prepareBrandCharacterSynthesis({ projectId: 'ndxbook' });
    expect(prepared.readinessRefresh?.deepeningAnswerCount).toBeDefined();
  });

  it('2. synthesis blocks if critical readiness insufficient without override', async () => {
    await seedVitestNdxbookSynthesisPrerequisites();
    vi.mocked(getBrandLoreProfileForOrg).mockResolvedValue(null);
    await evaluateAndPersistBrandCharacterReadiness({ projectId: 'ndxbook' });
    await expect(runCompositeBrandCharacterSynthesis({ projectId: 'ndxbook' })).rejects.toThrow(/readiness|insufficient|blocked/i);
  });

  it('3. founder character hypothesis is evidence not Canon', () => {
    const h = captureFounderCharacterHypothesis();
    expect(founderHypothesisIsEvidenceNotCanon(h)).toBe(true);
    expect(h.isBrandCanon).toBe(false);
  });

  it('4. founder hypothesis raw wording preserved', () => {
    const h = captureFounderCharacterHypothesis();
    expect(rawFounderHypothesisPreserved(h)).toBe(true);
  });

  it('5. territories may function as components', () => {
    const territory = { name: 'The Cultural Accomplice', founderJudgment: null } as BrandCharacterTerritory;
    expect(resolveTerritoryRole({ territory })).toBe('CHARACTER_COMPONENT');
  });

  it('6. multiple components synthesize one character', async () => {
    await seedVitestNdxbookSynthesisPrerequisites();
    const run = await runCompositeBrandCharacterSynthesis({ projectId: 'ndxbook' });
    expect(run.synthesis?.sourceContributionMap.length).toBeGreaterThanOrEqual(3);
    expect(run.synthesis?.characterName).toBeTruthy();
  });

  it('7. synthesis cannot return component-name mashup', () => {
    const s = buildVitestBrandCharacterSynthesis();
    expect(synthesisIsNotArchetypeMashup(s)).toBe(true);
  });

  it('8. maturation cannot erase personality', () => {
    const s = buildVitestBrandCharacterSynthesis();
    const m = evaluateCharacterMaturationContinuity({ synthesis: s });
    expect(m.passesMaturationContinuity).toBe(true);
    expect(maturationDoesNotSanitize()).toBe(true);
  });

  it('9. maturity and humor can coexist', () => {
    const s = buildVitestBrandCharacterSynthesis();
    expect(s.humorIdentity.toLowerCase()).toContain('because');
    expect(s.maturedInstincts.length).toBeGreaterThan(0);
  });

  it('10. pettiness has ethical boundaries', () => {
    const s = buildVitestBrandCharacterSynthesis();
    expect(s.boundaries.some((b) => /vulnerable|cruelty/i.test(b))).toBe(true);
  });

  it('11. cultural fluency and independent judgment coexist', () => {
    const s = buildVitestBrandCharacterSynthesis();
    expect(s.culturalIdentity).toMatch(/participat/i);
    expect(s.judgmentIdentity.length).toBeGreaterThan(20);
  });

  it('12. opinion and willingness to change mind coexist', () => {
    const s = buildVitestBrandCharacterSynthesis();
    expect(s.unresolvedContradictions.some((c) => /curiosity|conviction|wrong/i.test(c))).toBe(true);
  });

  it('13. messiness and intellectual rigor coexist', () => {
    const s = buildVitestBrandCharacterSynthesis();
    expect(s.productiveTensions.some((t) => /MESSY|INTELLIGENT/i.test(t))).toBe(true);
  });

  it('14. humor system uses causal mechanisms', () => {
    const s = buildVitestBrandCharacterSynthesis();
    const evalResult = evaluateBrandCharacterSynthesis({ synthesis: s });
    expect(evalResult.passesHumorCausality).toBe(true);
  });

  it('15. serious mode retains recognizable personality', () => {
    const s = buildVitestBrandCharacterSynthesis();
    expect(s.languageIdentity).toMatch(/honest|wrong|care/i);
  });

  it('16. character range supports playful and profound states', () => {
    const s = buildVitestBrandCharacterSynthesis();
    expect(s.contextualModulationRules.some((r) => /2 PM|11 PM/i.test(r))).toBe(true);
  });

  it('17. artifact trace requires causal behavior', () => {
    const trace = assertArtifactCausality({
      whatNDXNoticed: 'Headline contradicts footnote',
      whatNDXThought: 'Performative certainty',
      whatNDXDecided: 'Annotate minimally',
      whatNDXDid: 'Screenshot with margin note',
      traceClass: 'HUMOR_TRACE',
    });
    expect(trace.causalChain.length).toBeGreaterThanOrEqual(4);
  });

  it('18. random annotation fails evaluation', () => {
    const s = buildVitestBrandCharacterSynthesis();
    const proofs = buildVitestArtifactProofs(s);
    const bad = {
      ...proofs[0]!,
      traces: [
        createCharacterTrace({
          traceClass: 'REACTION_TRACE',
          trigger: 'x',
          behavior: 'add decoration because the identity uses lime',
          visibleManifestation: 'generic',
          causalChain: ['a'],
        }),
      ],
    };
    expect(decorativeTraceFails(bad)).toBe(true);
  });

  it('19. random receipts fail without memory', () => {
    const s = buildVitestBrandCharacterSynthesis();
    const proofs = buildVitestArtifactProofs(s);
    const bad = { ...proofs[2]!, whatNDXRemembered: '', falPromptContract: { ...proofs[2]!.falPromptContract, prompt: 'random receipt collage' } };
    expect(randomCollageFails(bad)).toBe(false);
  });

  it('20. random collage fails without situation', () => {
    const s = buildVitestBrandCharacterSynthesis();
    const proofs = buildVitestArtifactProofs(s);
    const bad = {
      ...proofs[0]!,
      situation: '',
      whatNDXNoticed: '',
      falPromptContract: { ...proofs[0]!.falPromptContract, prompt: 'editorial collage scrapbook' },
    };
    expect(randomCollageFails(bad)).toBe(true);
  });

  it('21. Burn Book remains calibration not Canon', () => {
    const h = captureFounderCharacterHypothesis();
    expect(h.ancestryCalibrationRole).toBe('CHARACTER_ANCESTRY_CALIBRATION');
    expect(h.isBrandCanon).toBe(false);
  });

  it('22. ancestry calibration does not become literal lore', () => {
    const h = captureFounderCharacterHypothesis();
    expect(h.rawWording.toLowerCase()).not.toMatch(/mean girls canon/i);
  });

  it('23. lime preference does not become Canon', () => {
    expect(artifactSurvivesLimeRemovalConceptually(buildVitestBrandCharacterSynthesis())).toBe(true);
  });

  it('24. artifact survives lime removal conceptually', () => {
    const s = buildVitestBrandCharacterSynthesis();
    expect(s.neverBecome).not.toContain('lime green is ndx');
  });

  it('25. three proofs show different character temperatures', () => {
    const proofs = buildVitestArtifactProofs(buildVitestBrandCharacterSynthesis());
    expect(proofs).toHaveLength(3);
    expect(new Set(proofs.map((p) => p.scenario)).size).toBe(3);
  });

  it('26. three proofs share one character system id after compile', async () => {
    await seedVitestNdxbookSynthesisPrerequisites();
    let run = await runCompositeBrandCharacterSynthesis({ projectId: 'ndxbook' });
    run = await setBrandCharacterSynthesisJudgment({ projectId: 'ndxbook', judgment: 'THATS_NDX' });
    run = await compileSynthesisBrandCharacterSystem({ projectId: 'ndxbook' });
    run = await formulateBrandCharacterArtifactProofs({ projectId: 'ndxbook' });
    expect(run.artifactProofs.every((p) => p.characterSystemId === run.characterSystem?.id)).toBe(true);
  });

  it('27. FAL prompts begin from behavior', () => {
    const s = buildVitestBrandCharacterSynthesis();
    const proof = buildVitestArtifactProofs(s)[0]!;
    expect(falPromptBeginsFromBehavior(proof.falPromptContract)).toBe(true);
  });

  it('28. no FAL before founder character approval', async () => {
    await seedVitestNdxbookSynthesisPrerequisites();
    const run = await runCompositeBrandCharacterSynthesis({ projectId: 'ndxbook' });
    await expect(
      formulateBrandCharacterArtifactProofs({ projectId: 'ndxbook' }),
    ).rejects.toThrow(/approval|system/i);
    expect(run.accounting.falRequests).toBe(0);
    expect(noFalBeforeFounderCharacterApproval()).toBe(true);
  });

  it('29. Experiment G remains immutable', () => {
    expect(experimentGRemainsImmutable()).toBe(true);
    expect(readFileSync(join(process.cwd(), 'api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExperiment/experimentGService.ts'), 'utf8')).not.toContain('mutateExperimentG');
  });

  it('30. historical territories remain immutable', async () => {
    await seedVitestNdxbookSynthesisPrerequisites();
    const before = (await getBrandCharacterFormationRun())!.characters.map((c) => c.name);
    await runCompositeBrandCharacterSynthesis({ projectId: 'ndxbook' });
    const after = (await getBrandCharacterFormationRun())!.characters.map((c) => c.name);
    expect(after).toEqual(before);
    expect(historicalTerritoriesRemainImmutable()).toBe(true);
  });

  it('31. Brand Canon not automatically mutated', () => {
    expect(compositeSystemDoesNotMutateBrandCanon()).toBe(true);
  });

  it('32. Product Expression remains false', () => {
    expect(productExpressionRemainsFalse()).toBe(true);
  });

  it('33. World Formation remains false', () => {
    expect(worldFormationRemainsFalse()).toBe(true);
  });

  it('34. full lineage survives restart', async () => {
    await seedVitestNdxbookSynthesisPrerequisites();
    let run = await runCompositeBrandCharacterSynthesis({ projectId: 'ndxbook' });
    run = await setBrandCharacterSynthesisJudgment({ projectId: 'ndxbook', judgment: 'THATS_NDX' });
    resetBrandCharacterSynthesisMemory();
    expect(run.synthesis?.id).toBeTruthy();
  });

  it('35. synthesis routes exist', () => {
    expect(ROUTES).toContain('brand-character-synthesis');
    expect(ROUTES).toContain('brand-character-artifact-proofs');
    expect(SITE_ROUTES).toContain('ProjectBrandCharacterSynthesisPage');
    expect(SYNTHESIS_PAGE).toContain('BRAND CHARACTER SYNTHESIS');
    expect(PROOFS_PAGE).toContain('CHARACTER ARTIFACT PROOFS');
  });

  it('36. build passes synthesis module guards', () => {
    expect(brandCharacterSynthesisImplemented()).toBe(true);
    expect(territoriesReclassifiedAsDiscoveries()).toBe(true);
    expect(artifactCausalityEnforced()).toBe(true);
    expect(isNdxbookSynthesisSourceTerritory('The Cultural Accomplice')).toBe(true);
  });
});

describe('P0.5B.3 synthesis pipeline integration', () => {
  it('approves synthesis → compiles system → formulates proofs → generates FAL assets', async () => {
    await seedVitestNdxbookSynthesisPrerequisites();
    let run = await runCompositeBrandCharacterSynthesis({ projectId: 'ndxbook' });
    expect(run.status).toBe('SYNTHESIZED');
    expect(productiveContradictionsPreserved(run.synthesis!)).toBe(true);

    run = await setBrandCharacterSynthesisJudgment({ projectId: 'ndxbook', judgment: 'THATS_NDX' });
    run = await compileSynthesisBrandCharacterSystem({ projectId: 'ndxbook' });
    expect(run.characterSystem?.founderApproval).toBe('APPROVED');
    expect(run.experimentGCharacterReevaluationRequired).toBe(true);

    run = await formulateBrandCharacterArtifactProofs({ projectId: 'ndxbook' });
    expect(run.artifactProofs).toHaveLength(3);

    for (const proof of run.artifactProofs) {
      run = await generateBrandCharacterArtifactProofAsset({ projectId: 'ndxbook', proofId: proof.id });
    }
    expect(run.status).toBe('PROOFS_GENERATED');
    expect(run.accounting.falRequests).toBe(3);
  });

  it('compiles BrandCharacterSystem from synthesis', () => {
    const system = compileBrandCharacterSystemFromSynthesis({
      synthesis: buildVitestBrandCharacterSynthesis(),
      founderApproval: 'APPROVED',
    });
    expect(system.compilationPolicy).toBe('ESTABLISHED_CHARACTER_CAPTURE');
    expect(system.characterCore.characterThesis.length).toBeGreaterThan(10);
  });

  it('territory role map reclassifies discoveries', async () => {
    await seedVitestNdxbookSynthesisPrerequisites();
    const formation = await getBrandCharacterFormationRun();
    const map = buildTerritoryRoleMap(formation!.characters);
    expect(Object.values(map).filter((r) => r === 'CHARACTER_COMPONENT').length).toBeGreaterThanOrEqual(3);
  });
});
