/**
 * P0.5C.6A — Generic Authored Artifact types.
 */

import type {
  AUTHORED_ARTIFACT_FAILURE_STATES,
  GENERIC_AUTHORED_ARTIFACT_AUTHORITY_CHAIN,
  HUMAN_HISTORY_TRACE_TYPES,
  INFORMATION_INHABITATION_MODES,
  TEMPLATE_FRAME_FAILURE_STATES,
} from './constants.js';

export type AuthoredArtifactAuthorityStep = (typeof GENERIC_AUTHORED_ARTIFACT_AUTHORITY_CHAIN)[number];
export type TemplateFrameFailureState = (typeof TEMPLATE_FRAME_FAILURE_STATES)[number];
export type AuthoredArtifactFailureState = (typeof AUTHORED_ARTIFACT_FAILURE_STATES)[number];
export type InformationInhabitationMode = (typeof INFORMATION_INHABITATION_MODES)[number];
export type HumanHistoryTraceType = (typeof HUMAN_HISTORY_TRACE_TYPES)[number];

export type ArtifactHumanHistoryContract = {
  contractId: string;
  artifactId: string;
  whatExistedFirst: string;
  whatAuthorDid: string;
  whatChangedAfterReview: string;
  survivingProcessTrace: string;
  traceType: HumanHistoryTraceType;
  causalReason: string;
  fingerprint: string;
};

export type AuthoredInterventionContract = {
  contractId: string;
  artifactId: string;
  rawVisualArtifact: string;
  authorIntervention: string;
  interventionCausality: string;
  originalIdentifiableWithoutMarks: boolean;
  interventionsRevealThinking: boolean;
  fingerprint: string;
};

export type InformationInhabitationContract = {
  contractId: string;
  artifactId: string;
  headlinePlacement: string;
  evidencePlacement: string;
  inhabitationMode: InformationInhabitationMode;
  whyThisPlacement: string;
  informationInsideArtifactWorld: boolean;
  fingerprint: string;
};

export type TemplateFrameDetectionEvaluation = {
  evaluationId: string;
  artifactId: string;
  topHeadlinePanelRisk: boolean;
  bottomEvidencePanelRisk: boolean;
  headerBodyFooterRisk: boolean;
  infographicShellRisk: boolean;
  symmetricalZonesRisk: boolean;
  presentationBoardRisk: boolean;
  posterTemplateRisk: boolean;
  contentContainerRisk: boolean;
  artisticPremiseRequiresFrame: boolean;
  passes: boolean;
  failureStates: TemplateFrameFailureState[];
  evaluatedAt: string;
};

export type OverResolvedArtifactEvaluation = {
  evaluationId: string;
  artifactId: string;
  tooFinalized: boolean;
  tooPackaged: boolean;
  tooPresentationReady: boolean;
  tooEvenlyDistributed: boolean;
  tooCleanlyModular: boolean;
  tooPerfectlyAligned: boolean;
  tooComprehensivelyExplained: boolean;
  passes: boolean;
  failureState: 'FAIL_OVER_RESOLVED_GENERATED_GRAPHIC' | null;
  evaluatedAt: string;
};

export type AuthoredInterventionEvaluation = {
  evaluationId: string;
  artifactId: string;
  originalVisualIdentifiable: boolean;
  authorActionsIdentifiable: boolean;
  interventionsRevealThinking: boolean;
  decorativeMarksDetected: boolean;
  randomAnalogTextureDetected: boolean;
  passes: boolean;
  failureStates: AuthoredArtifactFailureState[];
  evaluatedAt: string;
};

export type ArtifactGrammarDiversityEvaluation = {
  evaluationId: string;
  boardId: string;
  headlinePositions: string[];
  evidencePositions: string[];
  uniqueHeadlinePositionCount: number;
  uniqueEvidencePositionCount: number;
  templateConvergenceDetected: boolean;
  authorshipContinuityPresent: boolean;
  passes: boolean;
  failureState: 'FAIL_REPEATED_ARTIFACT_GRAMMAR' | null;
  evaluatedAt: string;
};

export type AuthoredArtifactEvaluationBundle = {
  humanHistory: ArtifactHumanHistoryContract;
  intervention: AuthoredInterventionContract;
  informationInhabitation: InformationInhabitationContract;
  templateFrameDetection: TemplateFrameDetectionEvaluation;
  overResolved: OverResolvedArtifactEvaluation;
  authoredIntervention: AuthoredInterventionEvaluation;
  authoredArtifactGatePasses: boolean;
  generationReadinessBlocked: boolean;
  failureStates: AuthoredArtifactFailureState[];
};

/** Adapter supplies brand-specific authorship psychology without hard-coding into generic infra. */
export type AuthoredArtifactAdapterInput = {
  artifactId: string;
  topic: string;
  subject: string;
  primaryHook: string;
  artisticPremise: string;
  dominantVisualSubject: string;
  artifactForm: string;
  topicIndex: number;
};

export type AuthoredArtifactAdapterOutput = {
  humanHistory: Omit<ArtifactHumanHistoryContract, 'contractId' | 'fingerprint' | 'artifactId'>;
  intervention: Omit<AuthoredInterventionContract, 'contractId' | 'fingerprint' | 'artifactId'>;
  informationInhabitation: Omit<InformationInhabitationContract, 'contractId' | 'fingerprint' | 'artifactId'>;
  templateFrameArtisticPremiseRequiresFrame: boolean;
};
