/**
 * P0.5E.4A — Calibration session + state management.
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterCalibrationProgress,
  CharacterCalibrationSession,
  CharacterCalibrationState,
  FounderCalibrationReaction,
} from './types.js';
import { FOUNDER_CHARACTER_CALIBRATION_VERSION } from './constants.js';
import { buildCalibrationInferences } from './inference.js';
import { selectNextCalibrationInteraction } from './priority.js';
import { languageConfidenceFromProgress } from './reactions.js';

export function buildEmptyCalibrationState(): CharacterCalibrationState {
  return {
    calibrationVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
    timestamp: new Date().toISOString(),
    interactions: [],
    currentInteractionId: null,
    directFounderTruths: [],
    founderRevisions: [],
    founderRejections: [],
    contextualTruths: [],
    unresolvedTruths: [],
    systemInferences: [],
    activeHypotheses: [],
    retiredHypotheses: [],
    confidenceMap: {},
    voiceEvidence: [],
    visualEvidence: [],
    bookPsychologyEvidence: [],
    founderDistinctions: [],
    remainingHighValueQuestions: [],
    progress: defaultProgress(),
    stillUnsureAbout: [],
    sessions: [],
    totalMomentsCompleted: 0,
    anthropicRequests: 0,
    reasoningRequests: 0,
  };
}

function defaultProgress(): CharacterCalibrationProgress[] {
  return [
    { domain: 'PSYCHOLOGY', level: 'EARLY', label: 'PSYCHOLOGY' },
    { domain: 'VOICE', level: 'EARLY', label: 'VOICE' },
    { domain: 'CONTRADICTIONS', level: 'EARLY', label: 'CONTRADICTIONS' },
    { domain: 'PRIVATE_LIFE', level: 'EARLY', label: 'PRIVATE LIFE' },
    { domain: 'RELATIONSHIPS', level: 'EARLY', label: 'RELATIONSHIPS' },
    { domain: 'BOOK', level: 'EARLY', label: 'BOOK' },
    { domain: 'VISUAL_IDENTITY', level: 'EARLY', label: 'VISUAL IDENTITY' },
  ];
}

export function startCalibrationSession(state: CharacterCalibrationState): CharacterCalibrationState {
  const session: CharacterCalibrationSession = {
    sessionId: randomUUID(),
    startedAt: new Date().toISOString(),
    momentsCompleted: 0,
    lastMomentAt: null,
    sessionCompleteMessage: null,
    learnedThisSession: [],
  };
  const next = selectNextCalibrationInteraction(state);
  return {
    ...state,
    sessions: [...state.sessions, session],
    currentInteractionId: next?.interactionId ?? null,
    timestamp: new Date().toISOString(),
  };
}

export function applyCalibrationReaction(params: {
  state: CharacterCalibrationState;
  interactionId: string;
  reaction: FounderCalibrationReaction;
  revision?: string | null;
}): CharacterCalibrationState {
  let workingState = params.state;
  if (!workingState.sessions.length) {
    workingState = startCalibrationSession(workingState);
  }

  const interaction = workingState.interactions.find((i) => i.interactionId === params.interactionId);
  if (!interaction) throw new Error('Calibration interaction not found');

  const inferences = buildCalibrationInferences({
    interaction,
    reaction: params.reaction,
    revision: params.revision,
  });

  const resolvedInteractions = workingState.interactions.map((i) =>
    i.interactionId === params.interactionId ? { ...i, resolved: true } : i,
  );

  let directFounderTruths = [...workingState.directFounderTruths];
  let founderRevisions = [...workingState.founderRevisions];
  let founderRejections = [...workingState.founderRejections];
  let contextualTruths = [...workingState.contextualTruths];
  let unresolvedTruths = [...workingState.unresolvedTruths];
  let founderDistinctions = [...workingState.founderDistinctions];

  if (params.reaction === 'YES_THATS_HER') {
    directFounderTruths.push(interaction.systemRead);
  } else if (params.reaction === 'ALMOST' && params.revision?.trim()) {
    founderRevisions.push(params.revision.trim());
    founderDistinctions.push(params.revision.trim());
  } else if (params.reaction === 'NO_NOT_HER') {
    founderRejections.push(interaction.systemRead);
  } else if (params.reaction === 'IT_DEPENDS') {
    contextualTruths.push(params.revision?.trim() || interaction.systemRead);
    if (params.revision?.trim()) founderDistinctions.push(params.revision.trim());
  } else if (params.reaction === 'I_DONT_KNOW_YET') {
    unresolvedTruths.push(interaction.systemRead);
  }

  const totalMomentsCompleted = workingState.totalMomentsCompleted + 1;
  const updatedState: CharacterCalibrationState = {
    ...workingState,
    calibrationVersion: FOUNDER_CHARACTER_CALIBRATION_VERSION,
    timestamp: new Date().toISOString(),
    interactions: resolvedInteractions,
    systemInferences: [...workingState.systemInferences, ...inferences],
    directFounderTruths,
    founderRevisions,
    founderRejections,
    contextualTruths,
    unresolvedTruths,
    founderDistinctions,
    totalMomentsCompleted,
    progress: updateProgress(workingState.progress, interaction.domain, totalMomentsCompleted),
    stillUnsureAbout: [...new Set(unresolvedTruths)].slice(-5),
  };

  const next = selectNextCalibrationInteraction(updatedState);
  const sessions = updatedState.sessions.map((s, idx) => {
    if (idx !== updatedState.sessions.length - 1) return s;
    const learned = [...s.learnedThisSession];
    if (params.reaction === 'YES_THATS_HER') learned.push(`Confirmed: ${interaction.domain}`);
    if (params.revision?.trim()) learned.push(params.revision.trim());
    const momentsCompleted = s.momentsCompleted + 1;
    return {
      ...s,
      momentsCompleted,
      lastMomentAt: new Date().toISOString(),
      learnedThisSession: learned,
      sessionCompleteMessage:
        momentsCompleted >= 3 && momentsCompleted % 3 === 0
          ? "THAT'S ENOUGH FOR NOW. I learned a few useful things."
          : s.sessionCompleteMessage,
    };
  });

  return {
    ...updatedState,
    sessions,
    currentInteractionId: next?.interactionId ?? null,
    remainingHighValueQuestions: updatedState.interactions.filter((i) => !i.resolved).slice(0, 5).map((i) => i.proposition.slice(0, 80)),
  };
}

function updateProgress(
  progress: CharacterCalibrationProgress[],
  domain: CharacterCalibrationProgress['domain'],
  completed: number,
): CharacterCalibrationProgress[] {
  return progress.map((p) => {
    if (p.domain !== domain) return p;
    let level: CharacterCalibrationProgress['level'] = 'EARLY';
    if (completed >= 8) level = 'STRONG';
    else if (completed >= 3) level = 'FORMING';
    return { ...p, level };
  });
}

export function shortCalibrationSessionsSupported(state: CharacterCalibrationState): boolean {
  const last = state.sessions[state.sessions.length - 1];
  return Boolean((last && last.momentsCompleted >= 1) || state.totalMomentsCompleted >= 1);
}

export function calibrationStateVersioned(state: CharacterCalibrationState): boolean {
  return Boolean(state.calibrationVersion);
}

export function systemDoesNotForgetFounderDistinctions(state: CharacterCalibrationState): boolean {
  return state.founderDistinctions.length === new Set(state.founderDistinctions).size;
}

export function getLanguageConfidence(completed: number): ReturnType<typeof languageConfidenceFromProgress> {
  return languageConfidenceFromProgress(completed);
}
