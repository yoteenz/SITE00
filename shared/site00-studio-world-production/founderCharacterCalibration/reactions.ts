/**
 * P0.5E.4A — Founder calibration reaction mapping.
 */

import type { FounderCalibrationReaction, CalibrationTruthState } from './types.js';

export function reactionToTruthState(reaction: FounderCalibrationReaction, hasRevision: boolean): CalibrationTruthState {
  switch (reaction) {
    case 'YES_THATS_HER':
      return 'FOUNDER_CONFIRMED';
    case 'ALMOST':
      return hasRevision ? 'FOUNDER_REVISED' : 'FOUNDER_CONTEXTUAL';
    case 'NO_NOT_HER':
      return 'FOUNDER_REJECTED';
    case 'IT_DEPENDS':
      return 'FOUNDER_CONTEXTUAL';
    case 'I_DONT_KNOW_YET':
      return 'FOUNDER_UNRESOLVED';
  }
}

export function reactionPromptLabel(reaction: FounderCalibrationReaction): string {
  switch (reaction) {
    case 'YES_THATS_HER':
      return "YES — THAT'S HER";
    case 'ALMOST':
      return 'ALMOST';
    case 'NO_NOT_HER':
      return 'NO — NOT HER';
    case 'IT_DEPENDS':
      return 'IT DEPENDS';
    case 'I_DONT_KNOW_YET':
      return "I'M NOT SURE YET";
  }
}

export function languageConfidenceFromProgress(completed: number): 'EARLY' | 'MID' | 'LATE' | 'HIGH' {
  if (completed >= 12) return 'HIGH';
  if (completed >= 8) return 'LATE';
  if (completed >= 4) return 'MID';
  return 'EARLY';
}

export function propositionPrefix(confidence: 'EARLY' | 'MID' | 'LATE' | 'HIGH'): string {
  switch (confidence) {
    case 'EARLY':
      return 'I think she would';
    case 'MID':
      return 'My read is that she';
    case 'LATE':
      return "She'd probably";
    case 'HIGH':
      return 'She would';
  }
}

export function founderDiscoveryIsCalibrationNotSurvey(): boolean {
  return true;
}

export function systemProposesBeforeFounderCreates(): boolean {
  return true;
}
