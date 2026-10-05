/**
 * Generic Studio World — public authorship types.
 */

import type {
  PERSONAL_AUTHORSHIP_CLASSIFICATIONS,
  PERSON_REFERENCE_STATES,
  PUBLIC_ARTIFACT_EXPORT_STATES,
  PUBLIC_AUTHORSHIP_MODES,
  PUBLIC_COPY_FAILURE_STATES,
  PUBLIC_METADATA_ELIGIBILITY,
} from './constants.js';

export type PublicAuthorshipMode = (typeof PUBLIC_AUTHORSHIP_MODES)[number];
export type PersonReferenceState = (typeof PERSON_REFERENCE_STATES)[number];
export type PublicMetadataEligibility = (typeof PUBLIC_METADATA_ELIGIBILITY)[number];
export type PersonalAuthorshipClassification = (typeof PERSONAL_AUTHORSHIP_CLASSIFICATIONS)[number];
export type PublicCopyFailureState = (typeof PUBLIC_COPY_FAILURE_STATES)[number];
export type PublicArtifactExportState = (typeof PUBLIC_ARTIFACT_EXPORT_STATES)[number];

export type PublicCopyTranslation = {
  translationId: string;
  internalMeaning: string;
  publicExpression: string;
  voiceMode: PublicAuthorshipMode;
  characterFaculty: string | null;
  emotionalTemperature: string | null;
  humorMechanism: string | null;
  personReference: PersonReferenceState;
  informationPreserved: string[];
  informationDeferred: string[];
  sourceTextPreserved: string[];
  translationEvaluation: PersonalAuthorshipClassification;
  fingerprint: string;
};

export type ThirdPersonSelfReferenceEvaluation = {
  evaluationId: string;
  text: string;
  state: PersonReferenceState;
  violations: string[];
  passed: boolean;
};

export type PersonalAuthorshipEvaluation = {
  evaluationId: string;
  text: string;
  classification: PersonalAuthorshipClassification;
  soundsLikePerson: boolean;
  soundsLikeSystem: boolean;
  soundsLikeAiSummary: boolean;
  failureStates: PublicCopyFailureState[];
  passed: boolean;
};

export type PublicArtifactExportEvaluation = {
  evaluationId: string;
  visibleText: string[];
  state: PublicArtifactExportState;
  internalLabelsFound: string[];
  debugStringsFound: string[];
  placeholderFound: boolean;
  passed: boolean;
};
