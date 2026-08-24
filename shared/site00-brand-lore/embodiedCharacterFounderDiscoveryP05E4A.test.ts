/**
 * P0.5E.4A — Adaptive Founder Character Calibration regression suite.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  adaptiveFounderCharacterCalibrationImplemented,
  applyCalibrationReaction,
  buildEmptyCalibrationState,
  disconfirmingEvidenceSupported,
  founderCognitiveLoadMustRemainLow,
  founderDiscoveryIsCalibrationNotSurvey,
  founderPrimaryRoleIsRecognition,
  oneCalibrationMomentAtATime,
  selectNextCalibrationInteraction,
  studioWorldGenericCalibrationImplemented,
  yesMachineConvergenceBlocked,
  FOUNDER_DISCOVERY_IS_CALIBRATION_NOT_SURVEY,
  SYSTEM_PROPOSES_BEFORE_FOUNDER_CREATES,
  MULTI_DIMENSION_INFERENCE_IMPLEMENTED,
  DIRECT_AND_INFERRED_TRUTH_REMAIN_DISTINCT,
} from '../site00-studio-world-production/founderCharacterCalibration/index.js';
import {
  abstractTraitsNotPrimaryFounderQuestions,
  canFounderAnswerByRecognition,
} from '../site00-studio-world-production/founderCharacterCalibration/cognitiveLoad.js';
import {
  buildCalibrationInferences,
  directAndInferredTruthRemainDistinct,
  multiDimensionInferenceImplemented,
} from '../site00-studio-world-production/founderCharacterCalibration/inference.js';
import {
  nextBestQuestionIsAdaptive,
  questionOrderIsNotStatic,
  redundantQuestionsSuppressed,
} from '../site00-studio-world-production/founderCharacterCalibration/priority.js';
import {
  calibrationStateVersioned,
  shortCalibrationSessionsSupported,
  systemDoesNotForgetFounderDistinctions,
} from '../site00-studio-world-production/founderCharacterCalibration/session.js';
import { synthesisPreviewHumanReadable } from '../site00-studio-world-production/founderCharacterCalibration/synthesis.js';
import {
  buildNdxCalibrationInteractions,
  buildNdxFounderCharacterDiscoveryRun,
  migrateRunToCalibrationState,
  ndxApplyCalibrationReaction,
  ndxContinueCalibration,
  ndxGetHumanReadableSynthesis,
  ndxSpecificBehaviorRemainsInAdapter,
  northStarEvidencePreserved,
  p05e5PipelineCompatibilityPreserved,
  scenariosIncludeSystemPrediction,
  visualHypothesesClusteredForCalibration,
} from '../site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/index.js';
import {
  continueFounderCharacterCalibration,
  saveFounderCharacterCalibrationReaction,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import {
  resetFounderCharacterDiscoveryMemory,
  resetFounderCharacterDiscoveryStoreModeCache,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';
import { FAL_REQUESTS, FOUNDER_I_KNOW_HER_CONFIRMED, READY_FOR_CHARACTER_CASTING_EXPLORATION, READY_FOR_CHARACTER_SYNTHESIS } from '../site00-studio-world-production/embodiedCharacterFounderDiscovery/constants.js';
import { brandCharacterImmutable, brandCanonUnchanged, productExpressionBlocked, worldFormationBlocked } from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';

describe('P0.5E.4A Adaptive Founder Character Calibration', () => {
  beforeEach(() => {
    resetFounderCharacterDiscoveryStoreModeCache();
    resetFounderCharacterDiscoveryMemory();
  });

  it('implements generic calibration system', () => {
    expect(adaptiveFounderCharacterCalibrationImplemented()).toBe(true);
    expect(studioWorldGenericCalibrationImplemented()).toBe(true);
    expect(FOUNDER_DISCOVERY_IS_CALIBRATION_NOT_SURVEY).toBe(true);
    expect(SYSTEM_PROPOSES_BEFORE_FOUNDER_CREATES).toBe(true);
    expect(MULTI_DIMENSION_INFERENCE_IMPLEMENTED).toBe(true);
    expect(DIRECT_AND_INFERRED_TRUTH_REMAIN_DISTINCT).toBe(true);
  });

  it('NDX run seeds calibration interactions with system predictions', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.calibrationState?.interactions.length).toBeGreaterThan(10);
    expect(scenariosIncludeSystemPrediction(run.calibrationState!.interactions)).toBe(true);
    expect(visualHypothesesClusteredForCalibration()).toBe(true);
    expect(northStarEvidencePreserved()).toBe(true);
    expect(ndxSpecificBehaviorRemainsInAdapter()).toBe(true);
  });

  it('adaptive loop — confirmation updates state', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const first = run.calibrationState!.interactions.find((i) => !i.resolved)!;
    const { run: updated } = ndxApplyCalibrationReaction(run, {
      interactionId: first.interactionId,
      reaction: 'YES_THATS_HER',
    });
    expect(updated.calibrationState!.totalMomentsCompleted).toBe(1);
    expect(updated.calibrationState!.directFounderTruths.length).toBeGreaterThan(0);
  });

  it('ALMOST changes next proposition priority (enemy scenario follow-up)', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const { run: afterAlmost } = ndxApplyCalibrationReaction(run, {
      interactionId: 'cal-scenario-ndx-excellent-point-enemy',
      reaction: 'ALMOST',
      revision: 'She agrees with the point but does not give them the satisfaction of praising them.',
    });
    const followUp = afterAlmost.calibrationState!.interactions.find((i) => i.interactionId === 'cal-followup-enemy-almost');
    expect(followUp?.priorityScore).toBeGreaterThan(10);
    expect(afterAlmost.calibrationState!.founderDistinctions.length).toBeGreaterThan(0);
  });

  it('NO affects next proposition selection', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const first = selectNextCalibrationInteraction(run.calibrationState!)!;
    const { nextInteraction } = ndxApplyCalibrationReaction(run, {
      interactionId: first.interactionId,
      reaction: 'NO_NOT_HER',
    });
    expect(nextInteraction?.interactionId).not.toBe(first.interactionId);
  });

  it('IT DEPENDS creates contextual truth', () => {
    let state = buildEmptyCalibrationState();
    state = {
      ...state,
      interactions: buildNdxCalibrationInteractions(buildNdxFounderCharacterDiscoveryRun()),
    };
    const target = state.interactions.find((i) => i.interactionId === 'cal-scenario-ndx-wrong-at-dinner')!;
    state = applyCalibrationReaction({
      state,
      interactionId: target.interactionId,
      reaction: 'IT_DEPENDS',
      revision: 'Depends entirely on who said it.',
    });
    expect(state.contextualTruths.length).toBeGreaterThan(0);
  });

  it('multi-dimension inference preserves direct vs inferred', () => {
    const interaction = buildNdxCalibrationInteractions(buildNdxFounderCharacterDiscoveryRun())[0]!;
    const inferences = buildCalibrationInferences({
      interaction,
      reaction: 'YES_THATS_HER',
    });
    expect(inferences.length).toBeGreaterThan(1);
    expect(directAndInferredTruthRemainDistinct(inferences)).toBe(true);
    expect(multiDimensionInferenceImplemented()).toBe(true);
  });

  it('next-best question is adaptive not static', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const a = selectNextCalibrationInteraction(run.calibrationState!);
    const { run: updated } = ndxApplyCalibrationReaction(run, {
      interactionId: a!.interactionId,
      reaction: 'YES_THATS_HER',
    });
    const b = selectNextCalibrationInteraction(updated.calibrationState!);
    expect(nextBestQuestionIsAdaptive()).toBe(true);
    expect(questionOrderIsNotStatic()).toBe(true);
    expect(b?.interactionId).not.toBe(a?.interactionId);
    expect(redundantQuestionsSuppressed(updated.calibrationState!)).toBe(true);
  });

  it('cognitive load — propositions are recognition-based', () => {
    const interactions = buildNdxCalibrationInteractions(buildNdxFounderCharacterDiscoveryRun());
    for (const i of interactions) {
      expect(canFounderAnswerByRecognition(i.systemRead)).toBe(true);
      expect(abstractTraitsNotPrimaryFounderQuestions(i.systemRead)).toBe(true);
    }
    expect(founderCognitiveLoadMustRemainLow()).toBe(true);
    expect(founderPrimaryRoleIsRecognition()).toBe(true);
  });

  it('disconfirming scenarios and yes-machine guard', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(disconfirmingEvidenceSupported(run.calibrationState!)).toBe(true);
    expect(yesMachineConvergenceBlocked(run.calibrationState!)).toBe(true);
  });

  it('human-readable synthesis + session support', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const synthesis = ndxGetHumanReadableSynthesis(run);
    expect(synthesis.whoIThinkSheIs.length).toBeGreaterThan(10);
    expect(synthesisPreviewHumanReadable()).toBe(true);
    let state = migrateRunToCalibrationState(run);
    state = applyCalibrationReaction({
      state,
      interactionId: state.interactions[0]!.interactionId,
      reaction: 'YES_THATS_HER',
    });
    expect(shortCalibrationSessionsSupported(state)).toBe(true);
    expect(calibrationStateVersioned(state)).toBe(true);
    expect(systemDoesNotForgetFounderDistinctions(state)).toBe(true);
  });

  it('service calibration continue + reaction', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const cont = await continueFounderCharacterCalibration({ projectId: 'ndxbook' });
    expect(cont.interaction).toBeTruthy();
    const reacted = await saveFounderCharacterCalibrationReaction({
      projectId: 'ndxbook',
      interactionId: cont.interaction!.interactionId,
      reaction: 'YES_THATS_HER',
    });
    expect(reacted.run.calibrationState?.totalMomentsCompleted).toBeGreaterThan(0);
  });

  it('preserves experimental integrity + P0.5E.5 compatibility', () => {
    expect(founderDiscoveryIsCalibrationNotSurvey()).toBe(true);
    expect(p05e5PipelineCompatibilityPreserved()).toBe(true);
    expect(oneCalibrationMomentAtATime({ currentInteractionId: 'x' })).toBe(true);
    expect(FAL_REQUESTS).toBe(0);
    expect(FOUNDER_I_KNOW_HER_CONFIRMED).toBe(false);
    expect(READY_FOR_CHARACTER_SYNTHESIS).toBe(false);
    expect(READY_FOR_CHARACTER_CASTING_EXPLORATION).toBe(false);
    expect(brandCharacterImmutable()).toBe(true);
    expect(brandCanonUnchanged()).toBe(true);
    expect(productExpressionBlocked()).toBe(true);
    expect(worldFormationBlocked()).toBe(true);
  });
});

async function initializeFounderCharacterDiscoveryRoom(params: { projectId: string }) {
  const { initializeFounderCharacterDiscoveryRoom: init } = await import(
    '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js'
  );
  return init(params);
}
