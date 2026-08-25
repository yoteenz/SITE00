/**
 * P0.5E.4A — Bridge adaptive calibration progress into P0.5E.4 casting readiness gates.
 */

import type {
  CharacterCastingReadinessEvaluation,
  ExtendedHumanityEvaluation,
} from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';
import { meaningfulContradictionCount } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/contradictionEngine.js';
import { genuineFlawCount } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/flawProfile.js';
import { intelligenceHasShape } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/intelligenceMap.js';
import { evaluateFounderRecognitionGate } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/castingReadiness.js';
import type { NdxFounderCharacterDiscoveryRun } from './types.js';

const CALIBRATION_DISCOVERY_MOMENTS_MIN = 6;
const CALIBRATION_DIRECT_TRUTHS_MIN = 3;

export { CALIBRATION_DISCOVERY_MOMENTS_MIN, CALIBRATION_DIRECT_TRUTHS_MIN };

function calibrationInteractionResolved(run: NdxFounderCharacterDiscoveryRun, interactionId: string): boolean {
  return (
    run.calibrationState?.interactions.find((i) => i.interactionId === interactionId)?.resolved === true
  );
}

export function calibrationDiscoveryComplete(run: NdxFounderCharacterDiscoveryRun): boolean {
  if (!run.calibrationVersion || !run.calibrationState?.interactions.length) return false;
  return (
    run.calibrationState.totalMomentsCompleted >= CALIBRATION_DISCOVERY_MOMENTS_MIN &&
    run.calibrationState.directFounderTruths.length >= CALIBRATION_DIRECT_TRUTHS_MIN
  );
}

export function legacyTraitDiscoveryComplete(run: NdxFounderCharacterDiscoveryRun): boolean {
  return (
    run.forensicReport.founderConfirmedTraits >= 5 && run.forensicReport.unresolvedTraits >= 0
  );
}

export function founderDiscoveryCompleteForRun(run: NdxFounderCharacterDiscoveryRun): boolean {
  return legacyTraitDiscoveryComplete(run) || calibrationDiscoveryComplete(run);
}

export function evaluateNdxFounderCharacterCastingReadiness(params: {
  run: NdxFounderCharacterDiscoveryRun;
  humanityEvaluation: ExtendedHumanityEvaluation;
}): CharacterCastingReadinessEvaluation {
  const { run, humanityEvaluation } = params;
  const discoveryComplete = founderDiscoveryCompleteForRun(run);
  const founderKnowsHer = evaluateFounderRecognitionGate(run.founderRecognition.response);

  const contradictionsConfirmed =
    meaningfulContradictionCount(run.contradictions) >= 3 ||
    calibrationInteractionResolved(run, 'cal-contradiction-nosy-respectful');

  const realFlawsConfirmed =
    genuineFlawCount(run.flawProfile) >= 2 ||
    calibrationInteractionResolved(run, 'cal-flaw-confirmation-bias') ||
    calibrationInteractionResolved(run, 'cal-disconfirm-honest-costs-status');

  const intelligenceUnevennessEstablished =
    intelligenceHasShape(run.intelligenceMap) ||
    calibrationInteractionResolved(run, 'cal-intelligence-cultural-memory');

  const privateHumanityEstablished = run.flawProfile.procrastinates.length > 0;

  const voiceDifferentiationEstablished =
    run.voiceLabSamples.some((s) => Object.keys(s.judgments).length > 0) ||
    calibrationInteractionResolved(run, 'cal-voice-misleading-viral') ||
    (run.voiceCalibrationState?.hypotheses.some((h) => Boolean(h.founderJudgment || h.humanWomanTest)) ?? false);

  const bookRelationshipEstablished =
    Boolean(run.bookDiscovery.whySheWritesThingsDown) ||
    calibrationInteractionResolved(run, 'cal-book-not-finished') ||
    calibrationInteractionResolved(run, 'cal-book-dog-ear');

  const culturalBoundaryEstablished = run.culturalBoundaries.length > 0;

  const visualHypothesesReviewed =
    run.visualHypothesisReviews.some((v) => v.judgment !== null) ||
    calibrationInteractionResolved(run, 'cal-visual-cluster');

  const blockingGates: string[] = [];
  if (!contradictionsConfirmed) blockingGates.push('meaningful_contradictions');
  if (!realFlawsConfirmed) blockingGates.push('real_flaws');
  if (!intelligenceUnevennessEstablished) blockingGates.push('intelligence_unevenness');
  if (!privateHumanityEstablished) blockingGates.push('private_humanity');
  if (!voiceDifferentiationEstablished) blockingGates.push('voice_differentiation');
  if (!bookRelationshipEstablished) blockingGates.push('book_relationship');
  if (!culturalBoundaryEstablished) blockingGates.push('cultural_boundary');
  if (!visualHypothesesReviewed) blockingGates.push('visual_hypotheses');
  if (!humanityEvaluation.passes) blockingGates.push('humanity_evaluation');
  // founder_i_know_her is post-synthesis — tracked via founderKnowsHer but does not block character read

  let state: CharacterCastingReadinessEvaluation['state'] = 'BLOCKED_FOUNDER_DISCOVERY_REQUIRED';
  if (!discoveryComplete) {
    state = 'BLOCKED_FOUNDER_DISCOVERY_REQUIRED';
  } else if (!humanityEvaluation.passes) {
    state = 'BLOCKED_HUMANITY_EVALUATION';
  } else if (blockingGates.length === 0) {
    state = 'READY_FOR_CHARACTER_SYNTHESIS';
  } else {
    state = 'BLOCKED_FOUNDER_DISCOVERY_REQUIRED';
  }

  const visualCastingReady = Boolean(run.visualCastingState?.visualCastingReady);
  const readyForCastingExploration =
    founderKnowsHer && visualCastingReady && Boolean(run.humanReadableSynthesis?.whoIThinkSheIs);

  if (readyForCastingExploration) {
    state = 'READY_FOR_CHARACTER_CASTING_EXPLORATION';
  } else if (founderKnowsHer && !run.humanReadableSynthesis?.whoIThinkSheIs) {
    state = 'BLOCKED_FOUNDER_RECOGNITION';
  }

  return {
    evaluationId: 'casting-readiness-p05e4a',
    state,
    founderDiscoveryComplete: discoveryComplete,
    contradictionsConfirmed,
    realFlawsConfirmed,
    intelligenceUnevennessEstablished,
    privateHumanityEstablished,
    voiceDifferentiationEstablished,
    bookRelationshipEstablished,
    culturalBoundaryEstablished,
    visualHypothesesReviewed,
    humanityEvaluationPass: humanityEvaluation.passes,
    founderKnowsHer,
    readyForCharacterSynthesis: state === 'READY_FOR_CHARACTER_SYNTHESIS' || readyForCastingExploration,
    readyForCastingExploration,
    blockingGates,
  };
}

export function formatCastingBlockingGate(gate: string): string {
  const labels: Record<string, string> = {
    meaningful_contradictions: 'Confirm contradictions (CALIBRATION or INSPECT)',
    real_flaws: 'Confirm flaws (CALIBRATION or INSPECT)',
    intelligence_unevenness: 'Confirm uneven intelligence (CALIBRATION or INSPECT)',
    private_humanity: 'Private humanity evidence',
    voice_differentiation: 'Voice calibration (CALIBRATION or VOICE LAB)',
    book_relationship: 'Book relationship calibration',
    cultural_boundary: 'Cultural boundaries',
    visual_hypotheses: 'Visual hypothesis review',
    humanity_evaluation: 'Humanity evaluation',
    founder_i_know_her: 'Select YES I KNOW HER on I KNOW HER tab',
  };
  return labels[gate] ?? gate.replace(/_/g, ' ');
}

export function castingStatusHeadline(run: NdxFounderCharacterDiscoveryRun): string {
  const casting = run.castingReadiness;
  if (!casting) return 'CASTING: INITIALIZING';
  if (run.visualCastingState?.finalVisualIdentityApproved) return 'CASTING: VISUAL IDENTITY LOCKED — continuity test ready';
  if (run.visualCastingState?.visualCastingReady && casting.founderKnowsHer) {
    return 'CASTING: VISUAL CASTING READY — open CAST NDX';
  }
  if (casting.readyForCastingExploration) return 'CASTING: READY FOR VISUAL CASTING EXPLORATION';
  if (casting.readyForCharacterSynthesis && !run.humanReadableSynthesis?.whoIThinkSheIs) {
    return 'CASTING: READY — generate character read on SYNTHESIS tab';
  }
  if (run.humanReadableSynthesis?.whoIThinkSheIs && !casting.founderKnowsHer) {
    return 'CASTING: Character read ready — confirm I KNOW HER';
  }
  if (casting.readyForCharacterSynthesis) return 'CASTING: READY FOR CHARACTER SYNTHESIS';
  if (casting.founderKnowsHer && casting.blockingGates.length > 0) {
    return `CASTING: YES I KNOW HER recorded — ${casting.blockingGates.length} gate(s) remaining`;
  }
  if (!casting.founderKnowsHer && founderDiscoveryCompleteForRun(run)) {
    return 'CASTING: Discovery complete — select YES I KNOW HER on I KNOW HER tab';
  }
  if (run.calibrationVersion) {
    const moments = run.calibrationState?.totalMomentsCompleted ?? 0;
    return `CASTING: Continue calibration (${moments}/${CALIBRATION_DISCOVERY_MOMENTS_MIN} moments toward discovery)`;
  }
  return 'CASTING: Complete founder discovery in INSPECT or CALIBRATION';
}
