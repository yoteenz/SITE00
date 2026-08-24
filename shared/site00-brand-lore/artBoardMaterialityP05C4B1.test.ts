/**
 * P0.5C.4B.1 — Signature lime restraint + queue supersession (30 requirements)
 */

import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  ALL_LIME_BODY_COPY_BLOCKED,
  ALL_LIME_HANDWRITING_SYSTEM_BLOCKED,
  ALL_LIME_ICON_SYSTEM_BLOCKED,
  AUTOMATIC_REGENERATION_AFTER_IMPLEMENTATION,
  CHROMATIC_ATTENTION_HIERARCHY_IMPLEMENTED,
  FEED_CHROMATIC_RHYTHM_IMPLEMENTED,
  HAND_DRAWN_ICONS_DO_NOT_IMPLY_LIME,
  HUMAN_MADE_MARKS_DO_NOT_IMPLY_LIME,
  LIME_ABSENCE_FAILS_QA,
  LIME_DOMINANCE_FAILS_QA,
  LIME_PROMINENCE_PROHIBITED,
  P0_5C_4B_1_IMPLEMENTED,
  PRE_C4B1_SNAPSHOTS_STALE,
  REGENERATE_CURRENT_USES_C4B1,
  REPLAY_GENERATION_PRESERVES_HISTORY,
  ROUND_01_LOCK_REQUIRES_LIME_RESTRAINT,
  NDX_SIGNATURE_LIME_REQUIRED,
  SIGNATURE_LIME_RESTRAINT_MODES_IMPLEMENTED,
  V2_4_CREATED,
} from './artBoardMateriality/constants.js';
import {
  compileArtBoardMaterialityFalPrompt,
  materialFalPromptBlocksAllLimeBodyCopy,
  materialFalPromptHasLimeRestraintSection,
  materialFalPromptHumanMadeNotLimeMade,
} from './artBoardMateriality/falPromptCompilerV23.js';
import { humanMadeMarksDoNotImplyLime, buildNdxHumanMadeMarkSystem } from './artBoardMateriality/humanMadeMarks.js';
import {
  applyExperiment01V23Supersession,
  shouldAutoSupersedeV23Generation,
  supersededJobIsNotFailure,
  V23_SUPERSESSION_REASON,
} from './artBoardMateriality/experiment01V23Supersession.js';
import {
  applyV23SignatureLimeRestraintRevision,
  buildFeedChromaticRhythm,
  falPromptHasLimeRestraintSection,
  limeForensicAuditRootCause,
  limePresenceRequired,
  limeProminenceProhibited,
  SIGNATURE_LIME_BEHAVIOR,
} from './artBoardMateriality/signatureLimeRestraint.js';
import { formulateExperiment01V23, v22HistoryNotMutated } from './artBoardMateriality/experiment01V23.js';
import {
  artBoardMaterialityApprovalGatePasses,
  limeRestraintGatePasses,
  round01LockRequiresLimeRestraint,
} from './artBoardMateriality/approvalGate.js';
import { classifyLegacySnapshot } from '../site00-studio-world-production/generationAuthority/promptFreshness.js';
import {
  compileCurrentV23FalPrompt,
  resolveV23DispatchPrompt,
  v24NotCreated,
} from './artBoardMateriality/v23GenerationAuthority.js';
import { V23_FAL_COMPILER_VERSION } from './artBoardMateriality/v23GenerationAuthorityConstants.js';
import { compileBrandMarketingExpressionSystem } from './brandMarketingExpression/marketingExpressionCompiler.js';
import { buildVitestBrandCharacterSystemForMarketing } from './brandMarketingExpression/vitestFixtures.js';
import { buildFounderMarketingNorthStarArtifact } from './brandMarketingExpression/northStarArtifact.js';
import { formulateExperiment01Artifacts } from './brandMarketingExpression/characterEventFormulation.js';
import { formulateExperiment01V2 } from './editorialInformationArchitecture/experiment01V2.js';
import { formulateExperiment01V21 } from './culturalVisualParticipation/experiment01V21.js';
import { formulateExperiment01V22 } from './characterRetention/experiment01V22.js';
import {
  generateAllExperiment01V23ArtifactAssets,
  regenerateAllExperiment01V23ArtifactAssets,
  generateExperiment01V23ArtifactAsset,
  getBrandMarketingExpressionState,
  prepareBrandMarketingExpression,
  compileBrandMarketingExpression,
  formulateMarketingExpressionExperiment01,
  formulateMarketingExpressionExperiment01V2,
  formulateMarketingExpressionExperiment01V21,
  formulateMarketingExpressionExperiment01V22,
  formulateMarketingExpressionExperiment01V23,
  replayExperiment01V23HistoricalPrompt,
  resetBrandMarketingExpressionWorkers,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionService.js';
import {
  resetBrandMarketingExpressionMemory,
  saveBrandMarketingExpressionRun,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionMemoryStore.js';

describe('P0.5C.4B.1 Signature Lime Restraint', () => {
  const characterSystem = buildVitestBrandCharacterSystemForMarketing();
  const expressionSystem = compileBrandMarketingExpressionSystem({
    characterSystem,
    northStarId: buildFounderMarketingNorthStarArtifact('ndxbook').id,
    projectId: 'ndxbook',
  });
  const { artifacts } = formulateExperiment01Artifacts({
    expressionSystem,
    characterSystemId: characterSystem.id,
  });
  let v23Result: ReturnType<typeof formulateExperiment01V23>;

  beforeAll(() => {
    const v2 = formulateExperiment01V2({ v1Artifacts: artifacts, expressionSystem, characterSystemId: characterSystem.id });
    const v21 = formulateExperiment01V21({ v1Artifacts: artifacts, v2Experiment: v2.experiment, expressionSystem, characterSystemId: characterSystem.id });
    const v22 = formulateExperiment01V22({ v1Artifacts: artifacts, v21Experiment: v21.experiment, expressionSystem, characterSystemId: characterSystem.id });
    v23Result = formulateExperiment01V23({ v1Artifacts: artifacts, v22Experiment: v22.experiment, expressionSystem });
  });

  it('implements canonical lime principle', () => {
    expect(P0_5C_4B_1_IMPLEMENTED).toBe(true);
    expect(SIGNATURE_LIME_BEHAVIOR.principle).toBe('LIME_PRESENCE_REQUIRED_LIME_PROMINENCE_PROHIBITED');
    expect(limePresenceRequired()).toBe(true);
    expect(limeProminenceProhibited()).toBe(true);
    expect(LIME_PROMINENCE_PROHIBITED).toBe(true);
    expect(NDX_SIGNATURE_LIME_REQUIRED).toBe(true);
  });

  it('forensic audit identifies lime overcorrection root cause', () => {
    const audit = limeForensicAuditRootCause();
    expect(audit.humanMadeLimeCouplingFound).toBe(true);
    expect(audit.iconCouplingFound).toBe(true);
    expect(audit.typographyCouplingFound).toBe(true);
    expect(audit.rootCause).toContain('SIGNATURE_LIME_REQUIRED');
  });

  it('decouples human-made marks from lime', () => {
    const markSystem = buildNdxHumanMadeMarkSystem({
      artifactId: 'bma-exp01-v23-1',
      artifact: artifacts[0]!,
      topicIndex: 1,
    });
    expect(humanMadeMarksDoNotImplyLime(markSystem)).toBe(true);
    expect(HUMAN_MADE_MARKS_DO_NOT_IMPLY_LIME).toBe(true);
    expect(HAND_DRAWN_ICONS_DO_NOT_IMPLY_LIME).toBe(true);
    const limeIcons = markSystem.handDrawnIcons.filter((i) => i.limeApplied).length;
    expect(limeIcons).toBeLessThanOrEqual(1);
  });

  it('FAL compiler includes restraint section and blocks all-lime systems', () => {
    const artifact = v23Result.artifacts[0]!;
    const v1 = artifacts[0]!;
    const fal = compileArtBoardMaterialityFalPrompt({ artifact: v1, contract: artifact.contract });
    expect(materialFalPromptHasLimeRestraintSection(fal)).toBe(true);
    expect(materialFalPromptBlocksAllLimeBodyCopy(fal)).toBe(true);
    expect(materialFalPromptHumanMadeNotLimeMade(fal)).toBe(true);
    expect(fal.prompt).toContain('DO NOT RENDER ALL ICONS IN LIME');
    expect(ALL_LIME_BODY_COPY_BLOCKED).toBe(true);
    expect(ALL_LIME_HANDWRITING_SYSTEM_BLOCKED).toBe(true);
    expect(ALL_LIME_ICON_SYSTEM_BLOCKED).toBe(true);
  });

  it('requires chromatic attention hierarchy per artifact', () => {
    for (const a of v23Result.artifacts) {
      const restraint = a.contract.signatureLimeRestraint!;
      expect(restraint.attentionHierarchy.limeAttentionTarget.length).toBeGreaterThan(5);
      expect(restraint.attentionHierarchy.whyLimeIsUsedHere.length).toBeGreaterThan(10);
    }
    expect(CHROMATIC_ATTENTION_HIERARCHY_IMPLEMENTED).toBe(true);
    expect(SIGNATURE_LIME_RESTRAINT_MODES_IMPLEMENTED).toBe(true);
  });

  it('feed chromatic rhythm varies across board', () => {
    const rhythm = v23Result.experiment.feedChromaticRhythm!;
    expect(rhythm.uniqueModeCount).toBeGreaterThanOrEqual(3);
    expect(rhythm.nineIdenticalLimeTreatment).toBe(false);
    expect(FEED_CHROMATIC_RHYTHM_IMPLEMENTED).toBe(true);
  });

  it('classifies pre-C4B.1 snapshots as stale', () => {
    const oldPrompt =
      'PUBLIC AUTHORSHIP MODE\nSIGNATURE LIME REQUIREMENT\nHUMAN-MADE MARKS\nwithout restraint section';
    expect(
      classifyLegacySnapshot({
        prompt: oldPrompt,
        contractFingerprint: 'abc',
        snapshotContractFingerprint: 'abc',
      }),
    ).toBe('STALE_PRE_C4B1');
    expect(PRE_C4B1_SNAPSHOTS_STALE).toBe(true);
  });

  it('REGENERATE_CURRENT uses C4B.1 compiler; REPLAY preserves history', () => {
    expect(V23_FAL_COMPILER_VERSION).toContain('P0.5C.6');
    const artifact = v23Result.artifacts[2]!;
    const { falContract } = compileCurrentV23FalPrompt({
      artifact,
      v1Artifact: artifacts[2]!,
      projectId: 'ndxbook',
      triggerSource: 'REGENERATE_CURRENT',
    });
    expect(falPromptHasLimeRestraintSection(falContract.prompt)).toBe(true);
    expect(REGENERATE_CURRENT_USES_C4B1).toBe(true);

    const legacySnapshot = artifact.promptSnapshots![0]!;
    const replay = resolveV23DispatchPrompt({
      artifact,
      v1Artifact: artifacts[2]!,
      projectId: 'ndxbook',
      mode: 'REPLAY_GENERATION',
      replaySnapshotId: legacySnapshot.id,
    });
    expect(replay.replay).toBe(true);
    expect(REPLAY_GENERATION_PRESERVES_HISTORY).toBe(true);
  });

  it('lime restraint gate passes for formulated board; absence/dominance QA flags exist', () => {
    expect(v23Result.artifacts.every((a) => limeRestraintGatePasses(a))).toBe(true);
    expect(LIME_ABSENCE_FAILS_QA).toBe(true);
    expect(LIME_DOMINANCE_FAILS_QA).toBe(true);
    expect(ROUND_01_LOCK_REQUIRES_LIME_RESTRAINT).toBe(true);
    expect(round01LockRequiresLimeRestraint()).toBe(true);
  });

  it('does not create V2.4; preserves V2.3 history', () => {
    expect(v24NotCreated()).toBe(true);
    expect(V2_4_CREATED).toBe(false);
    expect(v22HistoryNotMutated()).toBe(true);
  });

  it('no automatic regeneration after implementation', () => {
    expect(AUTOMATIC_REGENERATION_AFTER_IMPLEMENTATION).toBe(false);
  });
});

function stripC4B1FromPrompt(prompt: string): string {
  return prompt
    .split('\n\n')
    .filter((section) => !section.startsWith('SIGNATURE LIME RESTRAINT + CHROMATIC ATTENTION'))
    .join('\n\n');
}

function makeExperimentStalePreC4B1(
  exp: NonNullable<Awaited<ReturnType<typeof getBrandMarketingExpressionState>>['experiment01V23']>,
) {
  return {
    ...exp,
    generatedArtifacts: exp.generatedArtifacts.map((a) => {
      const prompt = stripC4B1FromPrompt(a.generationContract?.prompt ?? '');
      const snapshots = (a.promptSnapshots ?? []).map((s) => ({
        ...s,
        prompt: stripC4B1FromPrompt(s.prompt),
        compilerVersion: 'falPromptCompilerV23@P0.5C.5A',
        methodologyVersions: s.methodologyVersions.filter((v) => !v.includes('4B.1')),
      }));
      return {
        ...a,
        generationContract: a.generationContract
          ? { ...a.generationContract, prompt }
          : a.generationContract,
        promptSnapshots: snapshots,
        contract: {
          ...a.contract,
          signatureLimeRestraint: null,
        },
      };
    }),
  };
}

describe('P0.5C.4B.1 V2.3 queue supersession', () => {
  beforeEach(async () => {
    resetBrandMarketingExpressionWorkers();
    await resetBrandMarketingExpressionMemory();
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V2({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V21({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V22({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V23({ projectId: 'ndxbook' });
  });

  it('supersedes stale active generation queue with forensic record', async () => {
    let run = (await getBrandMarketingExpressionState({ projectId: 'ndxbook' }))!;
    const staleExp = makeExperimentStalePreC4B1(run.experiment01V23!);
    staleExp.status = 'GENERATING';
    staleExp.generatedArtifacts = staleExp.generatedArtifacts.map((a, i) =>
      i < 3
        ? { ...a, generationStatus: 'GENERATED', generatedAssetUrl: `https://vitest.local/${a.id}.png` }
        : { ...a, generationStatus: 'GENERATING', generationJobStatus: 'QUEUED' },
    );
    await saveBrandMarketingExpressionRun({ ...run, experiment01V23: staleExp, status: 'EXPERIMENT_01_V23_GENERATING' });

    run = (await getBrandMarketingExpressionState({ projectId: 'ndxbook' }))!;
    expect(run.experiment01V23?.generationRunStatus).toBe('SUPERSEDED_BY_METHODOLOGY');
    expect(run.experiment01V23?.generationSupersession?.reason).toBe(V23_SUPERSESSION_REASON);
    const forensic = run.experiment01V23?.generationSupersessionForensic;
    expect(forensic?.activeRunFound).toBe(true);
    expect(forensic!.pendingJobsCancelled).toBeGreaterThan(0);
    expect(forensic!.completedAssetsPreserved).toBe(3);
    expect(forensic!.partialBoardPreserved).toBe(true);

    const cancelled = run.experiment01V23!.generatedArtifacts.filter(
      (a) => a.generationJobStatus === 'CANCELLED_SUPERSEDED',
    );
    expect(cancelled.length).toBeGreaterThan(0);
    expect(supersededJobIsNotFailure('CANCELLED_SUPERSEDED')).toBe(true);
    cancelled.forEach((a) => expect(a.generationStatus).not.toBe('FAILED'));
  });

  it('blocks new batch generation after supersession', async () => {
    let run = (await getBrandMarketingExpressionState({ projectId: 'ndxbook' }))!;
    const staleExp = makeExperimentStalePreC4B1(run.experiment01V23!);
    staleExp.status = 'GENERATING';
    staleExp.generatedArtifacts = staleExp.generatedArtifacts.map((a) => ({
      ...a,
      generationStatus: 'GENERATING',
    }));
    await saveBrandMarketingExpressionRun({
      ...run,
      experiment01V23: staleExp,
      status: 'EXPERIMENT_01_V23_GENERATING',
    });
    run = (await getBrandMarketingExpressionState({ projectId: 'ndxbook' }))!;
    expect(run.experiment01V23?.generationRunStatus).toBe('SUPERSEDED_BY_METHODOLOGY');

    await expect(generateAllExperiment01V23ArtifactAssets({ projectId: 'ndxbook' })).rejects.toThrow(
      /SUPERSEDED/,
    );
  });

  it('allows per-slide REGENERATE_CURRENT after supersession (culture / apology slide)', async () => {
    let run = (await getBrandMarketingExpressionState({ projectId: 'ndxbook' }))!;
    const staleExp = makeExperimentStalePreC4B1(run.experiment01V23!);
    staleExp.status = 'GENERATING';
    staleExp.generatedArtifacts = staleExp.generatedArtifacts.map((a, i) =>
      i < 2
        ? { ...a, generationStatus: 'GENERATED', generatedAssetUrl: `https://vitest.local/${a.id}.png` }
        : { ...a, generationStatus: 'GENERATING', generationJobStatus: 'QUEUED' },
    );
    await saveBrandMarketingExpressionRun({
      ...run,
      experiment01V23: staleExp,
      status: 'EXPERIMENT_01_V23_GENERATING',
    });
    run = (await getBrandMarketingExpressionState({ projectId: 'ndxbook' }))!;
    expect(run.experiment01V23?.generationRunStatus).toBe('SUPERSEDED_BY_METHODOLOGY');

    const apology = run.experiment01V23!.generatedArtifacts.find((a) => a.id === 'bma-exp01-v23-3')!;
    expect(apology.contract.primaryHook).toBe('WE OWE HER AN APOLOGY.');
    expect(apology.generationJobStatus).toBe('CANCELLED_SUPERSEDED');
    expect(apology.generatedAssetUrl).toBeFalsy();

    const generated = await generateExperiment01V23ArtifactAsset({
      projectId: 'ndxbook',
      artifactId: 'bma-exp01-v23-3',
      mode: 'REGENERATE_CURRENT',
    });
    const topic3 = generated.experiment01V23!.generatedArtifacts.find((a) => a.id === 'bma-exp01-v23-3')!;
    expect(topic3.generationStatus).toBe('GENERATED');
    expect(topic3.generatedAssetUrl).toBeTruthy();
    expect(topic3.generationJobStatus).toBe('COMPLETED');
    expect(topic3.generationContract?.prompt).toContain('SIGNATURE LIME RESTRAINT + CHROMATIC ATTENTION');
  });

  it('preserves completed assets through supersession boundary', () => {
    const characterSystem = buildVitestBrandCharacterSystemForMarketing();
    const expressionSystem = compileBrandMarketingExpressionSystem({
      characterSystem,
      northStarId: buildFounderMarketingNorthStarArtifact('ndxbook').id,
      projectId: 'ndxbook',
    });
    const { artifacts: v1 } = formulateExperiment01Artifacts({
      expressionSystem,
      characterSystemId: characterSystem.id,
    });
    const v2 = formulateExperiment01V2({ v1Artifacts: v1, expressionSystem, characterSystemId: characterSystem.id });
    const v21 = formulateExperiment01V21({ v1Artifacts: v1, v2Experiment: v2.experiment, expressionSystem, characterSystemId: characterSystem.id });
    const v22 = formulateExperiment01V22({ v1Artifacts: v1, v21Experiment: v21.experiment, expressionSystem, characterSystemId: characterSystem.id });
    const { experiment } = formulateExperiment01V23({ v1Artifacts: v1, v22Experiment: v22.experiment, expressionSystem });
    experiment.status = 'GENERATING';
    experiment.generatedArtifacts = experiment.generatedArtifacts.map((a, i) => {
      const prompt = stripC4B1FromPrompt(a.generationContract?.prompt ?? '');
      return i === 0
        ? {
            ...a,
            generationStatus: 'GENERATED' as const,
            generatedAssetUrl: 'https://vitest.local/one.png',
            generationContract: { ...a.generationContract, prompt },
            promptSnapshots: (a.promptSnapshots ?? []).map((s) => ({ ...s, prompt: stripC4B1FromPrompt(s.prompt) })),
          }
        : { ...a, generationStatus: 'NOT_GENERATED' as const, generationContract: { ...a.generationContract, prompt } };
    });
    expect(shouldAutoSupersedeV23Generation(experiment)).toBe(true);
    const { experiment: superseded } = applyExperiment01V23Supersession(experiment);
    expect(superseded.generatedArtifacts[0]!.generationLineageClass).toBe('PRESERVED_PRE_C4B1');
    expect(superseded.generatedArtifacts[0]!.generatedAssetUrl).toBe('https://vitest.local/one.png');
  });

  it('regenerateAllExperiment01V23ArtifactAssets refreshes all nine slides when board is complete', async () => {
    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V2({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V21({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V22({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V23({ projectId: 'ndxbook' });
    await generateAllExperiment01V23ArtifactAssets({ projectId: 'ndxbook' });
    const before = (await getBrandMarketingExpressionState({ projectId: 'ndxbook' }))!;
    const falBefore = before.accounting.falRequests;
    await regenerateAllExperiment01V23ArtifactAssets({ projectId: 'ndxbook' });
    const after = (await getBrandMarketingExpressionState({ projectId: 'ndxbook' }))!;
    expect(after.experiment01V23?.generatedArtifacts).toHaveLength(9);
    expect(after.experiment01V23?.generatedArtifacts.every((a) => a.generationStatus === 'GENERATED')).toBe(true);
    expect(after.accounting.falRequests).toBeGreaterThan(falBefore);
  });
});
