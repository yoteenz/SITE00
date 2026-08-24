/**
 * Founder Character Discovery — closed-loop progress checklist for mobile UX.
 */

import type { NdxFounderCharacterDiscoveryRun } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types';
import {
  CALIBRATION_DIRECT_TRUTHS_MIN,
  CALIBRATION_DISCOVERY_MOMENTS_MIN,
} from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxCastingReadinessBridge';

export type DiscoveryProgressNavigateTarget =
  | { kind: 'section'; section: 'CALIBRATION' | 'INSPECT' | 'SYNTHESIS' | 'RECOGNITION' | 'CASTING' }
  | { kind: 'inspect'; inspectSection: string };

export type FounderDiscoveryProgressStep = {
  id: string;
  title: string;
  complete: boolean;
  detail: string;
  navigate: DiscoveryProgressNavigateTarget;
};

export type FounderDiscoveryProgressSummary = {
  steps: FounderDiscoveryProgressStep[];
  completedCount: number;
  totalCount: number;
  percentComplete: number;
  readyForCharacterSynthesis: boolean;
  nextStep: FounderDiscoveryProgressStep | null;
  headline: string;
  momentsCompleted: number;
  directTruthsCount: number;
  unresolvedCalibrationCount: number;
};

function unresolvedCalibrationCount(run: NdxFounderCharacterDiscoveryRun): number {
  return run.calibrationState?.interactions.filter((i) => !i.resolved).length ?? 0;
}

function gateNavigateTarget(gate: string): DiscoveryProgressNavigateTarget {
  switch (gate) {
    case 'voice':
      return { kind: 'inspect', inspectSection: 'VOICE_LAB' };
    case 'visual':
      return { kind: 'inspect', inspectSection: 'VISUAL' };
    case 'book':
      return { kind: 'inspect', inspectSection: 'BOOK' };
    case 'i_know_her':
      return { kind: 'section', section: 'RECOGNITION' };
    case 'character_read':
      return { kind: 'section', section: 'SYNTHESIS' };
    default:
      return { kind: 'section', section: 'CALIBRATION' };
  }
}

export function buildFounderCharacterDiscoveryProgress(
  run: NdxFounderCharacterDiscoveryRun,
): FounderDiscoveryProgressSummary {
  const casting = run.castingReadiness;
  const momentsCompleted = run.calibrationState?.totalMomentsCompleted ?? 0;
  const directTruthsCount = run.calibrationState?.directFounderTruths.length ?? 0;
  const unresolved = unresolvedCalibrationCount(run);
  const hasCharacterRead = Boolean(run.humanReadableSynthesis?.whoIThinkSheIs);

  const steps: FounderDiscoveryProgressStep[] = [
    {
      id: 'moments',
      title: 'Calibration moments',
      complete: momentsCompleted >= CALIBRATION_DISCOVERY_MOMENTS_MIN,
      detail: `${momentsCompleted}/${CALIBRATION_DISCOVERY_MOMENTS_MIN} answered`,
      navigate: gateNavigateTarget('moments'),
    },
    {
      id: 'truths',
      title: "Direct YES — THAT'S HER confirmations",
      complete: directTruthsCount >= CALIBRATION_DIRECT_TRUTHS_MIN,
      detail: `${directTruthsCount}/${CALIBRATION_DIRECT_TRUTHS_MIN} — use YES THAT'S HER (ALMOST does not count)`,
      navigate: gateNavigateTarget('moments'),
    },
    {
      id: 'contradictions',
      title: 'Contradictions confirmed',
      complete: casting?.contradictionsConfirmed ?? false,
      detail: casting?.contradictionsConfirmed ? 'Done' : 'Answer contradiction moments on CALIBRATION',
      navigate: gateNavigateTarget('contradictions'),
    },
    {
      id: 'flaws',
      title: 'Real flaws confirmed',
      complete: casting?.realFlawsConfirmed ?? false,
      detail: casting?.realFlawsConfirmed ? 'Done' : 'Answer flaw stress tests on CALIBRATION',
      navigate: gateNavigateTarget('flaws'),
    },
    {
      id: 'intelligence',
      title: 'Intelligence shape established',
      complete: casting?.intelligenceUnevennessEstablished ?? false,
      detail: casting?.intelligenceUnevennessEstablished ? 'Done' : 'Answer intelligence moments on CALIBRATION',
      navigate: gateNavigateTarget('intelligence'),
    },
    {
      id: 'voice',
      title: 'Voice calibrated',
      complete: casting?.voiceDifferentiationEstablished ?? false,
      detail: casting?.voiceDifferentiationEstablished
        ? 'Done'
        : 'Judge voices on INSPECT → VOICE LAB (or voice moment on CALIBRATION)',
      navigate: gateNavigateTarget('voice'),
    },
    {
      id: 'book',
      title: 'Book relationship established',
      complete: casting?.bookRelationshipEstablished ?? false,
      detail: casting?.bookRelationshipEstablished ? 'Done' : 'Answer book moments on CALIBRATION',
      navigate: gateNavigateTarget('book'),
    },
    {
      id: 'visual',
      title: 'Visual hypotheses reviewed',
      complete: casting?.visualHypothesesReviewed ?? false,
      detail: casting?.visualHypothesesReviewed ? 'Done' : 'Review visuals on INSPECT → VISUAL',
      navigate: gateNavigateTarget('visual'),
    },
    {
      id: 'humanity',
      title: 'Humanity evaluation',
      complete: casting?.humanityEvaluationPass ?? false,
      detail: casting?.humanityEvaluationPass
        ? 'Pass'
        : `Needs evidence — ${run.humanityEvaluation.failures.join(', ') || 'complete calibration'}`,
      navigate: gateNavigateTarget('humanity'),
    },
    {
      id: 'i_know_her',
      title: 'YES I KNOW HER',
      complete: casting?.founderKnowsHer ?? false,
      detail: casting?.founderKnowsHer ? 'Recorded' : 'Select on I KNOW HER tab',
      navigate: gateNavigateTarget('i_know_her'),
    },
    {
      id: 'character_read',
      title: 'Character read generated',
      complete: hasCharacterRead,
      detail: hasCharacterRead ? 'View on SYNTHESIS tab' : 'Generate after gates pass',
      navigate: gateNavigateTarget('character_read'),
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;
  const totalCount = steps.length;
  const readyForCharacterSynthesis = casting?.readyForCharacterSynthesis ?? false;
  const nextStep = steps.find((s) => !s.complete) ?? null;

  let headline: string;
  if (readyForCharacterSynthesis && hasCharacterRead) {
    headline = 'COMPLETE — character read ready; embodied casting is next';
  } else if (readyForCharacterSynthesis) {
    headline = 'READY — generate character read on SYNTHESIS tab';
  } else if (nextStep) {
    headline = `NEXT: ${nextStep.title}`;
  } else {
    headline = 'Continue calibration';
  }

  return {
    steps,
    completedCount,
    totalCount,
    percentComplete: totalCount ? Math.round((completedCount / totalCount) * 100) : 0,
    readyForCharacterSynthesis,
    nextStep,
    headline,
    momentsCompleted,
    directTruthsCount,
    unresolvedCalibrationCount: unresolved,
  };
}
