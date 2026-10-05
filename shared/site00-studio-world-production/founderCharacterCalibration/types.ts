/**
 * P0.5E.4A — Generic Founder Character Calibration types.
 */

import type {
  CALIBRATION_MOMENT_TYPES,
  CALIBRATION_PROGRESS_DOMAINS,
  CALIBRATION_PROGRESS_LEVELS,
  CALIBRATION_TRUTH_STATES,
  FOUNDER_CALIBRATION_REACTIONS,
} from './constants.js';

export type FounderCalibrationReaction = (typeof FOUNDER_CALIBRATION_REACTIONS)[number];
export type CalibrationTruthState = (typeof CALIBRATION_TRUTH_STATES)[number];
export type CalibrationMomentType = (typeof CALIBRATION_MOMENT_TYPES)[number];
export type CalibrationProgressLevel = (typeof CALIBRATION_PROGRESS_LEVELS)[number];
export type CalibrationProgressDomain = (typeof CALIBRATION_PROGRESS_DOMAINS)[number];

export type CharacterCalibrationInteraction = {
  interactionId: string;
  momentType: CalibrationMomentType;
  domain: CalibrationProgressDomain;
  proposition: string;
  systemRead: string;
  promptQuestion: string;
  whyThisCameUp: string;
  disconfirming: boolean;
  priorityScore: number;
  resolved: boolean;
  relatedTraitIds: string[];
  relatedScenarioId: string | null;
  sourceVersion: string;
};

export type CharacterCalibrationInference = {
  inferenceId: string;
  sourceInteractionId: string;
  founderReaction: FounderCalibrationReaction;
  founderRevision: string | null;
  inference: string;
  affectedDimensions: string[];
  confidenceDelta: number;
  truthState: CalibrationTruthState;
  directlyConfirmed: boolean;
  at: string;
};

export type CharacterCalibrationPriorityEvaluation = {
  interactionId: string;
  uncertainty: number;
  contradictionValue: number;
  downstreamImpact: number;
  existingEvidenceStrength: number;
  redundancyRisk: number;
  founderFatigueCost: number;
  informationGain: number;
  totalScore: number;
};

export type CharacterCalibrationProgress = {
  domain: CalibrationProgressDomain;
  level: CalibrationProgressLevel;
  label: string;
};

export type CharacterCalibrationSession = {
  sessionId: string;
  startedAt: string;
  momentsCompleted: number;
  lastMomentAt: string | null;
  sessionCompleteMessage: string | null;
  learnedThisSession: string[];
};

export type CharacterCalibrationState = {
  calibrationVersion: string;
  timestamp: string;
  interactions: CharacterCalibrationInteraction[];
  currentInteractionId: string | null;
  directFounderTruths: string[];
  founderRevisions: string[];
  founderRejections: string[];
  contextualTruths: string[];
  unresolvedTruths: string[];
  systemInferences: CharacterCalibrationInference[];
  activeHypotheses: string[];
  retiredHypotheses: string[];
  confidenceMap: Record<string, CalibrationProgressLevel>;
  voiceEvidence: string[];
  visualEvidence: string[];
  bookPsychologyEvidence: string[];
  founderDistinctions: string[];
  remainingHighValueQuestions: string[];
  progress: CharacterCalibrationProgress[];
  stillUnsureAbout: string[];
  sessions: CharacterCalibrationSession[];
  totalMomentsCompleted: number;
  anthropicRequests: number;
  reasoningRequests: number;
};

export type HumanReadableCharacterSynthesis = {
  whoIThinkSheIs: string;
  howSheThinks: string;
  whatAnnoysHer: string;
  whatSheGetsWrong: string;
  howSheActsWhenWrong: string;
  whatFriendsKnow: string;
  whatStrangersMisread: string;
  whatShesLikeAlone: string;
  howSheTalks: string;
  whatSheWontPretendToKnow: string;
  whySheKeepsTheBook: string;
  howSheUsesTheBook: string;
  whatSheLooksLikeSoFar: string;
  whatIStillDontKnow: string[];
  languageConfidence: 'EARLY' | 'MID' | 'LATE' | 'HIGH';
  generatedAt: string;
};
