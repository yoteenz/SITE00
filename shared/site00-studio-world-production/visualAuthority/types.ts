/**
 * P0.5C.6 — Generic Visual Authority types.
 */

import type {
  EVIDENCE_COMPOSITION_ROLES,
  FEED_ARTISTIC_BEHAVIORS,
  NDX_FIRST_SLIDE_DESIGN_AUTHORITY_CHAIN,
  TEXT_REMOVAL_RESULTS,
  VISUAL_AUTHORITY_FAILURE_STATES,
  VISUAL_PRIORITY_HIERARCHY,
} from './constants.js';

export type DesignAuthorityStep = (typeof NDX_FIRST_SLIDE_DESIGN_AUTHORITY_CHAIN)[number];
export type VisualPriorityStep = (typeof VISUAL_PRIORITY_HIERARCHY)[number];
export type TextRemovalResult = (typeof TEXT_REMOVAL_RESULTS)[number];
export type EvidenceCompositionRole = (typeof EVIDENCE_COMPOSITION_ROLES)[number];
export type FeedArtisticBehavior = (typeof FEED_ARTISTIC_BEHAVIORS)[number];
export type VisualAuthorityFailureState = (typeof VISUAL_AUTHORITY_FAILURE_STATES)[number];

export type BespokeArtDirectionContract = {
  contractId: string;
  artifactId: string;
  artisticPremise: string;
  visualEntryPoint: string;
  dominantVisualSubject: string;
  whySomeoneLooksBeforeReading: string;
  visualTension: string;
  unexpectedElement: string;
  compositionBehavior: string;
  imageBehavior: string;
  scaleBehavior: string;
  cropBehavior: string;
  negativeSpaceBehavior: string;
  materialRelationship: string;
  culturalParticipation: string;
  emotionalEntry: string;
  visualSurprise: string;
  whyThisCouldOnlyBelongToThisTopic: string;
  whyThisIsNotATemplate: string;
  whatWouldRemainCompellingWithoutCopy: string;
  fingerprint: string;
};

export type WouldIStopBeforeReadingEvaluation = {
  evaluationId: string;
  artifactId: string;
  question: 'WOULD I STOP ON THIS PAGE BEFORE I KNEW WHAT IT SAID?';
  humanInterest: boolean;
  objectInterest: boolean;
  culturalInterest: boolean;
  photographicInterest: boolean;
  artisticInterest: boolean;
  compositionalInterest: boolean;
  emotionalInterest: boolean;
  surprise: boolean;
  curiosity: boolean;
  passes: boolean;
  failureState: 'FAIL_NO_PRE_READING_VISUAL_APPETITE' | null;
  evaluatedAt: string;
};

export type TextRemovalVisualIntegrityEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: TextRemovalResult;
  typographyDominantIntentional: boolean;
  passes: boolean;
  failureState: 'FAIL_TEXT_AS_DEFAULT_VISUAL_INTEREST' | null;
  evaluatedAt: string;
};

export type EvidenceCompositionRoleEvaluation = {
  evaluationId: string;
  artifactId: string;
  role: EvidenceCompositionRole;
  evidenceIsComposition: boolean;
  passes: boolean;
  failureState: 'FAIL_EVIDENCE_BECAME_DEFAULT_COMPOSITION' | null;
  evaluatedAt: string;
};

export type TopicSpecificArtDirectionEvaluation = {
  evaluationId: string;
  artifactId: string;
  reusableAcrossTopics: boolean;
  passes: boolean;
  failureState: 'FAIL_REUSABLE_TEMPLATE_COMPOSITION' | null;
  evaluatedAt: string;
};

export type FeedArtisticRangeEvaluation = {
  evaluationId: string;
  boardId: string;
  behaviors: FeedArtisticBehavior[];
  uniqueBehaviorCount: number;
  convergenceDetected: boolean;
  failureStates: VisualAuthorityFailureState[];
  passes: boolean;
  evaluatedAt: string;
};

export type VisualDiscoveryInheritance = {
  v21: string[];
  v22: string[];
  v23: string[];
  c4a: string[];
  c4b1: string[];
  c5: string[];
  c5a: string[];
};

export type ExperimentVisualAuthorityForensic = {
  forensicId: string;
  v21VisualStrengths: string[];
  v23LogicStrengths: string[];
  weakenedByLaterMethodology: string[];
  genuineImprovements: string[];
  constraintsBecameVisualPrescriptions: string[];
  informationRestraintMinimalismConflation: boolean;
  evidenceAsCompositionProblem: boolean;
  typographyCarryingVisualInterest: boolean;
  materialityAsArtDirectionSubstitute: boolean;
  governanceConvergence: boolean;
  evaluatedAt: string;
};

export type VisualAuthorityEvaluationBundle = {
  bespokeArtDirection: BespokeArtDirectionContract;
  wouldIStopBeforeReading: WouldIStopBeforeReadingEvaluation;
  textRemovalIntegrity: TextRemovalVisualIntegrityEvaluation;
  evidenceCompositionRole: EvidenceCompositionRoleEvaluation;
  topicSpecificArtDirection: TopicSpecificArtDirectionEvaluation;
  visualAppetiteGatePasses: boolean;
  generationReadinessBlocked: boolean;
  failureStates: VisualAuthorityFailureState[];
};
