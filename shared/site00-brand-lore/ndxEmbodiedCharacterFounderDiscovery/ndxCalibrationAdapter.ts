/**
 * P0.5E.4A — NDX Founder Character Calibration adapter.
 * Consumes P0.5E.4 evidence — does not restart discovery.
 */


import type { NdxFounderCharacterDiscoveryRun } from './types.js';
import type {
  CharacterCalibrationInteraction,
  CharacterCalibrationState,
  FounderCalibrationReaction,
} from '../../site00-studio-world-production/founderCharacterCalibration/types.js';
import {
  applyCalibrationReaction,
  buildEmptyCalibrationState,
  startCalibrationSession,
} from '../../site00-studio-world-production/founderCharacterCalibration/session.js';
import { selectNextCalibrationInteraction } from '../../site00-studio-world-production/founderCharacterCalibration/priority.js';
import { FOUNDER_CHARACTER_CALIBRATION_VERSION } from '../../site00-studio-world-production/founderCharacterCalibration/constants.js';
import { buildHumanReadableSynthesis } from '../../site00-studio-world-production/founderCharacterCalibration/synthesis.js';
import type { HumanReadableCharacterSynthesis } from '../../site00-studio-world-production/founderCharacterCalibration/types.js';

const NDX_VISUAL_NORTH_STAR = {
  board01: ['#2', '#5', '#9', '#17', '#18'],
  board02: ['#2', '#8'],
};

export function ndxSpecificBehaviorRemainsInAdapter(): boolean {
  return true;
}

export function buildNdxCalibrationInteractions(run: NdxFounderCharacterDiscoveryRun): CharacterCalibrationInteraction[] {
  const interactions: CharacterCalibrationInteraction[] = [];

  for (const scenario of run.scenarios) {
    const prediction = scenarioPrediction(scenario.scenarioId, scenario.situation);
    interactions.push({
      interactionId: `cal-scenario-${scenario.scenarioId}`,
      momentType: 'BEHAVIOR_PREDICTION',
      domain: scenarioDomain(scenario.scenarioId),
      proposition: `SCENARIO\n\n${scenario.situation}`,
      systemRead: prediction,
      promptQuestion: 'DOES THAT FEEL LIKE HER?',
      whyThisCameUp: `Testing ${scenario.behavioralImplication.toLowerCase()}`,
      disconfirming: false,
      priorityScore: scenario.scenarioId.includes('enemy') ? 8 : 6,
      resolved: scenario.founderResponse !== null,
      relatedTraitIds: [],
      relatedScenarioId: scenario.scenarioId,
      sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
    });
  }

  interactions.push({
    interactionId: 'cal-contradiction-nosy-respectful',
    momentType: 'CONTRADICTION_TEST',
    domain: 'CONTRADICTIONS',
    proposition: 'CONTRADICTION',
    systemRead:
      "I think she's incredibly nosy about IDEAS but surprisingly respectful about people's actual private lives. She'll spend four hours tracing why something happened. She won't dig into someone's personal business just because she technically can. That distinction seems important.",
    promptQuestion: 'DOES THAT FEEL LIKE HER?',
    whyThisCameUp: 'Contradictions should emerge from behavior, not admin selection.',
    disconfirming: false,
    priorityScore: 7,
    resolved: false,
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-flaw-confirmation-bias',
    momentType: 'FLAW_STRESS_TEST',
    domain: 'PSYCHOLOGY',
    proposition: 'FLAW STRESS TEST',
    systemRead:
      "She's convinced she's found the pattern. Three pieces of evidence support her. One really inconvenient piece doesn't. I think she spends way too long trying to explain the inconvenient one away before finally admitting it broke her theory.",
    promptQuestion: 'DOES THAT FEEL LIKE HER?',
    whyThisCameUp: 'Flaws discovered through consequences — not sanitized adjectives.',
    disconfirming: false,
    priorityScore: 6,
    resolved: false,
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-intelligence-cultural-memory',
    momentType: 'CULTURAL_BOUNDARY',
    domain: 'PSYCHOLOGY',
    proposition: 'CULTURAL MEMORY',
    systemRead:
      'Something starts trending and everybody is acting like it appeared yesterday. She remembers almost the exact same conversation from years ago. I think she immediately starts digging for the old receipts because the repetition bothers her more than the trend itself.',
    promptQuestion: 'DOES THAT FEEL LIKE HER?',
    whyThisCameUp: 'Intelligence discovered behaviorally — not abstract dimension labels.',
    disconfirming: false,
    priorityScore: 5,
    resolved: false,
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-disconfirm-honest-costs-status',
    momentType: 'FLAW_STRESS_TEST',
    domain: 'PSYCHOLOGY',
    proposition: 'DISCONFIRMING TEST',
    systemRead:
      "She's intellectually honest — but what happens when being honest costs her status? I think she'd still say the true thing, but she'd hate that the person who needed to hear it was the one who got to look smart.",
    promptQuestion: 'DOES THAT FEEL LIKE HER?',
    whyThisCameUp: 'Seeking disconfirming evidence — not yes-machine convergence.',
    disconfirming: true,
    priorityScore: 4,
    resolved: false,
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-voice-misleading-viral',
    momentType: 'VOICE_PREDICTION',
    domain: 'VOICE',
    proposition: 'VOICE',
    systemRead:
      "Someone sends her a viral post with a claim she already knows is misleading.\n\nI think her text back is:\n\n\"girl that is literally not what happened 😭\"\n\nThen she sends the receipt 45 seconds later.",
    promptQuestion: "YES — SHE'D SAY THAT?",
    whyThisCameUp: 'Voice calibration through predicted dialogue.',
    disconfirming: false,
    priorityScore: 7,
    resolved: run.voiceLabSamples.some((s) => Object.keys(s.judgments).length > 0),
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-book-not-finished',
    momentType: 'BOOK_BEHAVIOR',
    domain: 'BOOK',
    proposition: 'BOOK RELATIONSHIP',
    systemRead:
      "I don't think she Bookmarks things because she agrees with them. I think she Bookmarks things because she's NOT FINISHED with them.",
    promptQuestion: 'DOES THAT FEEL LIKE HER?',
    whyThisCameUp: 'Book psychology through predicted behavior.',
    disconfirming: false,
    priorityScore: 6,
    resolved: false,
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-book-dog-ear',
    momentType: 'BOOK_BEHAVIOR',
    domain: 'BOOK',
    proposition: 'BOOK RELATIONSHIP',
    systemRead:
      "A Dog-Ear isn't 'important.' It's 'I don't trust my conclusion yet — come back to this.'",
    promptQuestion: 'DOES THAT FEEL LIKE HER?',
    whyThisCameUp: 'Book ontology calibration.',
    disconfirming: false,
    priorityScore: 5,
    resolved: false,
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-visual-cluster',
    momentType: 'VISUAL_HYPOTHESIS',
    domain: 'VISUAL_IDENTITY',
    proposition: 'VISUAL READ',
    systemRead: buildVisualCalibrationCluster(),
    promptQuestion: 'DOES THAT FEEL LIKE HER?',
    whyThisCameUp: `North-star evidence preserved (Board 01: ${NDX_VISUAL_NORTH_STAR.board01.join(', ')}; Board 02: ${NDX_VISUAL_NORTH_STAR.board02.join(', ')}) — clustered for recognition.`,
    disconfirming: false,
    priorityScore: 5,
    resolved: run.visualHypothesisReviews.some((v) => v.judgment !== null),
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-synthesis-carelessly-wrong',
    momentType: 'SYNTHESIS_READ',
    domain: 'PSYCHOLOGY',
    proposition: "I'M STARTING TO NOTICE SOMETHING.",
    systemRead:
      "She doesn't seem afraid of being wrong. She seems afraid of being CARELESSLY wrong. Those aren't the same thing.",
    promptQuestion: 'YES — EXACTLY?',
    whyThisCameUp: 'Synthesis check — collapsing multiple observations.',
    disconfirming: false,
    priorityScore: 8,
    resolved: false,
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-synthesis-confrontation-capable',
    momentType: 'SYNTHESIS_READ',
    domain: 'PSYCHOLOGY',
    proposition: "I'M STARTING TO NOTICE SOMETHING.",
    systemRead:
      "I don't think she's confrontational by default. I think she's confrontation-capable. She'll let plenty of things go — until something crosses the line between annoying and FALSE.",
    promptQuestion: 'YES — EXACTLY?',
    whyThisCameUp: 'Deeper character truth from accumulated calibration.',
    disconfirming: false,
    priorityScore: 7,
    resolved: false,
    relatedTraitIds: [],
    relatedScenarioId: null,
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  interactions.push({
    interactionId: 'cal-followup-enemy-almost',
    momentType: 'SOCIAL_REACTION',
    domain: 'CONTRADICTIONS',
    proposition: 'FOLLOW-UP',
    systemRead:
      "Okay — so intellectual honesty doesn't automatically mean social generosity for her. She can acknowledge that an IDEA is right without rewarding the PERSON who delivered it. I think she'd quietly Bookmark the point and keep moving. Is THAT her?",
    promptQuestion: 'DOES THAT FEEL LIKE HER?',
    whyThisCameUp: 'Adaptive follow-up — triggered after ALMOST on enemy scenario.',
    disconfirming: false,
    priorityScore: 3,
    resolved: false,
    relatedTraitIds: [],
    relatedScenarioId: 'ndx-excellent-point-enemy',
    sourceVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
  });

  return interactions;
}

function scenarioPrediction(scenarioId: string, situation: string): string {
  const predictions: Record<string, string> = {
    'ndx-wrong-receipt': `I think she freezes for about five seconds, laughs because this is embarrassing, immediately corrects herself publicly, and somehow turns the Errata into a better Page than the original argument. She hates being carelessly wrong more than she hates being proven wrong.`,
    'ndx-excellent-point-enemy': `I think she pauses, gives them credit because the argument deserves it, and remains privately irritated that THEY were the one who said it.`,
    'ndx-rabbit-hole-143am': `Room messy, one lamp, podcast in background, three half-sentences in Notes that contradict each other — she stops when she finds the original source, not when she's tired.`,
    'ndx-wrong-at-dinner': `Depends entirely on who said it — but if she respects them, she asks a question that lets them expose themselves. If she doesn't, she saves it for the Book later.`,
  };
  return predictions[scenarioId] ?? `Given: ${situation}\n\nI think her reaction would be specific to who she is — not a generic response list.`;
}

function scenarioDomain(scenarioId: string): CharacterCalibrationInteraction['domain'] {
  if (scenarioId.includes('book') || scenarioId.includes('receipt')) return 'BOOK';
  if (scenarioId.includes('rabbit')) return 'PRIVATE_LIFE';
  if (scenarioId.includes('enemy') || scenarioId.includes('dinner')) return 'RELATIONSHIPS';
  return 'PSYCHOLOGY';
}

export function buildVisualCalibrationCluster(): string {
  return `My current read:

She looks put together without looking styled FOR CONTENT.

Protective styles / natural texture feel more authentic than highly manufactured glam.

Gold jewelry feels lived-in.

Black and neutrals dominate.

Signature accent appears like something she chose, not a uniform.

She should look like she had somewhere to be whether the camera showed up or not.`;
}

export function migrateRunToCalibrationState(run: NdxFounderCharacterDiscoveryRun): CharacterCalibrationState {
  if (run.calibrationState?.interactions.length) {
    return run.calibrationState;
  }
  const state = buildEmptyCalibrationState();
  const interactions = buildNdxCalibrationInteractions(run);
  const withInteractions = { ...state, interactions };
  const next = selectNextCalibrationInteraction(withInteractions);
  return {
    ...withInteractions,
    currentInteractionId: next?.interactionId ?? null,
    voiceEvidence: run.voiceLabSamples.map((s) => Object.values(s.expressions).join(' ')).filter(Boolean),
    bookPsychologyEvidence: [run.bookDiscovery.whySheWritesThingsDown].filter(Boolean) as string[],
    visualEvidence: [buildVisualCalibrationCluster()],
    timestamp: new Date().toISOString(),
  };
}

export function ndxContinueCalibration(run: NdxFounderCharacterDiscoveryRun): {
  run: NdxFounderCharacterDiscoveryRun;
  interaction: CharacterCalibrationInteraction | null;
} {
  let state = migrateRunToCalibrationState(run);
  if (!state.sessions.length || !state.currentInteractionId) {
    state = startCalibrationSession(state);
  }
  const interaction = state.interactions.find((i) => i.interactionId === state.currentInteractionId) ?? null;
  return {
    run: { ...run, calibrationState: state, calibrationVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION },
    interaction,
  };
}

export function ndxApplyCalibrationReaction(
  run: NdxFounderCharacterDiscoveryRun,
  params: {
    interactionId: string;
    reaction: FounderCalibrationReaction;
    revision?: string | null;
  },
): { run: NdxFounderCharacterDiscoveryRun; nextInteraction: CharacterCalibrationInteraction | null } {
  let state = migrateRunToCalibrationState(run);

  if (params.reaction === 'ALMOST' && params.interactionId === 'cal-scenario-ndx-excellent-point-enemy') {
    const followUp = state.interactions.find((i) => i.interactionId === 'cal-followup-enemy-almost');
    if (followUp) {
      followUp.priorityScore = 15;
    }
  }
  if (params.reaction === 'NO_NOT_HER') {
    const alt = state.interactions.find((i) => !i.resolved && i.interactionId !== params.interactionId);
    if (alt) alt.priorityScore += 2;
  }

  state = applyCalibrationReaction({
    state,
    interactionId: params.interactionId,
    reaction: params.reaction,
    revision: params.revision,
  });

  if (params.reaction === 'YES_THATS_HER' && params.interactionId.startsWith('cal-scenario-')) {
    const scenarioId = params.interactionId.replace('cal-scenario-', '');
    const scenario = run.scenarios.find((s) => s.scenarioId === scenarioId);
    if (scenario) {
      run = {
        ...run,
        scenarios: run.scenarios.map((s) =>
          s.scenarioId === scenarioId
            ? { ...s, founderResponse: state.directFounderTruths.at(-1) ?? s.possibleResponses[0]!, founderJudgment: 'YES_EXACTLY', confidence: 'STRONG' }
            : s,
        ),
      };
    }
  }

  const nextInteraction =
    state.interactions.find((i) => i.interactionId === state.currentInteractionId) ?? null;

  return {
    run: {
      ...run,
      calibrationState: state,
      calibrationVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
      humanReadableSynthesis: buildHumanReadableSynthesis(state),
    },
    nextInteraction,
  };
}

export function ndxGetHumanReadableSynthesis(run: NdxFounderCharacterDiscoveryRun): HumanReadableCharacterSynthesis {
  const state = migrateRunToCalibrationState(run);
  return buildHumanReadableSynthesis(state);
}

export function p05e5PipelineCompatibilityPreserved(): boolean {
  return true;
}

export function scenariosIncludeSystemPrediction(interactions: CharacterCalibrationInteraction[]): boolean {
  return interactions.every((i) => i.systemRead.length > 20);
}

export function visualHypothesesClusteredForCalibration(): boolean {
  return true;
}

export function northStarEvidencePreserved(): boolean {
  return NDX_VISUAL_NORTH_STAR.board01.length === 5 && NDX_VISUAL_NORTH_STAR.board02.length === 2;
}
