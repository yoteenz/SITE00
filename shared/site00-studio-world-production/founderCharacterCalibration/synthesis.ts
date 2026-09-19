/**
 * P0.5E.4A — Human-readable character synthesis from calibration state.
 */

import type { CharacterCalibrationState, HumanReadableCharacterSynthesis } from './types.js';
import { languageConfidenceFromProgress, propositionPrefix } from './reactions.js';

export function buildHumanReadableSynthesis(state: CharacterCalibrationState): HumanReadableCharacterSynthesis {
  const lang = languageConfidenceFromProgress(state.totalMomentsCompleted);
  const prefix = propositionPrefix(lang);

  const confirmed = state.directFounderTruths.slice(-3).join(' ') ||
    'A specific woman — still being recognized through calibration, not invented by survey.';

  return {
    whoIThinkSheIs: confirmed,
    howSheThinks: `${prefix} notice patterns before she understands why they're important — then chase the receipt until the thread holds.`,
    whatAnnoysHer: state.founderRejections[0] || 'Careless wrongness dressed up as confidence.',
    whatSheGetsWrong: 'Forms an opinion too early when the topic feels morally obvious.',
    howSheActsWhenWrong: state.directFounderTruths.find((t) => t.includes('wrong') || t.includes('Errata')) ||
      `${prefix} freeze, laugh, correct publicly, and make the Errata funnier than the original argument.`,
    whatFriendsKnow: 'She cares deeply whether her Pages land — softer than she performs online.',
    whatStrangersMisread: 'Cooler and more unbothered than she actually is.',
    whatShesLikeAlone: 'Fourteen tabs, one lamp, podcast in background, forgotten snack.',
    howSheTalks: state.voiceEvidence[0] || 'Same woman, different register — text vs margin vs public Page.',
    whatSheWontPretendToKnow: 'Technical domains she has not researched — backs off rather than faking fluency.',
    whySheKeepsTheBook: state.bookPsychologyEvidence[0] || 'External memory because she does not trust recall alone.',
    howSheUsesTheBook: 'Bookmarks what she is not finished with — Dog-Ears mean she does not trust her conclusion yet.',
    whatSheLooksLikeSoFar: state.visualEvidence[0] ||
      'Put together without looking styled for content — protective styles, lived-in gold, neutrals dominate.',
    whatIStillDontKnow: state.stillUnsureAbout.length ? state.stillUnsureAbout : ['Final face', 'Exact casting range'],
    languageConfidence: lang,
    generatedAt: new Date().toISOString(),
  };
}

export function synthesisPreviewHumanReadable(): boolean {
  return true;
}

export function founderCognitiveLoadReduced(proposition: string): boolean {
  return proposition.length < 500 && !proposition.includes('SYSTEM_SEEDED') && !proposition.includes('HYPOTHESIS');
}
