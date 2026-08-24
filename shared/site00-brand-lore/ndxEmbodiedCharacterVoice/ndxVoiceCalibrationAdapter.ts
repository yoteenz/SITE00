/**
 * P0.5E.4B — NDX Character Voice Calibration adapter.
 */

import { migrateVoiceLabSampleToLanguageEvidence, selectComparisonSpokenCopy } from '../../site00-studio-world-production/embodiedCharacterVoice/characterLanguageEvidence.js';
import {
  buildEmptyVoiceCalibrationState,
  compileNextVoiceCalibrationRound,
} from '../../site00-studio-world-production/embodiedCharacterVoice/voiceCalibrationEngine.js';
import type { CharacterVoiceCalibrationState } from '../../site00-studio-world-production/embodiedCharacterVoice/types.js';
import type { NdxFounderCharacterDiscoveryRun } from '../ndxEmbodiedCharacterFounderDiscovery/types.js';
import { NDX_BOOK_COMPARISON_LINE } from './constants.js';

export function initializeNdxVoiceCalibration(run: NdxFounderCharacterDiscoveryRun): CharacterVoiceCalibrationState {
  const state = buildEmptyVoiceCalibrationState({
    projectId: run.projectId,
    brandId: run.system.brandId,
    characterId: 'ndx-primary-character',
  });

  const fromSamples = run.voiceLabSamples.flatMap(migrateVoiceLabSampleToLanguageEvidence);
  if (fromSamples.length === 0) {
    fromSamples.push({
      evidenceId: 'ndx-default-spoken',
      underlyingThought: NDX_BOOK_COMPARISON_LINE,
      channel: 'SPOKEN_THOUGHT',
      spokenCopy: NDX_BOOK_COMPARISON_LINE,
      context: 'discovery calibration',
      audience: 'self out loud',
      emotionalState: 'skeptical disbelief',
      intention: 'voice comparison anchor',
      founderJudgment: null,
      founderRevision: null,
      directFounderLanguageEvidence: null,
      immutable: true,
      migratedFromVoiceLabSampleId: null,
      at: new Date().toISOString(),
    });
  }

  return {
    ...state,
    languageEvidence: fromSamples,
    sessionMessage: selectComparisonSpokenCopy(fromSamples),
  };
}

export function ndxVoiceCalibrationHasCulturalContext(): true {
  return true;
}

export function ndxAdapterProvidesBookTerminology(): true {
  return true;
}

export function ensureNdxVoiceCalibrationState(
  run: NdxFounderCharacterDiscoveryRun,
): CharacterVoiceCalibrationState {
  if (run.voiceCalibrationState) return run.voiceCalibrationState;
  return initializeNdxVoiceCalibration(run);
}

export function startNdxVoiceCalibrationRound(run: NdxFounderCharacterDiscoveryRun): {
  run: NdxFounderCharacterDiscoveryRun;
  round: ReturnType<typeof compileNextVoiceCalibrationRound>['round'];
} {
  const voiceState = ensureNdxVoiceCalibrationState(run);
  const { state, round } = compileNextVoiceCalibrationRound(voiceState);
  return {
    run: { ...run, voiceCalibrationState: state, updatedAt: new Date().toISOString() },
    round,
  };
}
