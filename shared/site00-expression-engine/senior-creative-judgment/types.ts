/**
 * C1.4 — Senior Creative Judgment Engine — generic creative maturity types.
 */

export const CREATIVE_QUALITY_TIERS = ['VALID', 'STRONG', 'EXCEPTIONAL'] as const;
export type CreativeQualityTier = (typeof CREATIVE_QUALITY_TIERS)[number];

export const CREATIVE_CONFIDENCE_LEVELS = ['LOW', 'MODERATE', 'HIGH'] as const;
export type CreativeConfidence = (typeof CREATIVE_CONFIDENCE_LEVELS)[number];

export const FOUNDER_HANDHOLDING_RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH'] as const;
export type FounderHandholdingRisk = (typeof FOUNDER_HANDHOLDING_RISK_LEVELS)[number];

export const METAPHOR_MATURITY_CLASSES = [
  'DECORATIVE',
  'ILLUSTRATIVE',
  'FUNCTIONAL',
  'STRUCTURAL',
  'TRANSFORMATIVE',
] as const;
export type MetaphorMaturityClass = (typeof METAPHOR_MATURITY_CLASSES)[number];

export const ARTIFACT_NECESSITY_OUTCOMES = [
  'PRIMARY_ARTIFACT_REQUIRED',
  'SUPPORTING_ARTIFACT_ONLY',
  'ENVIRONMENT_IS_RECEIPT',
  'BEHAVIOR_IS_RECEIPT',
  'CHARACTER_IS_RECEIPT',
  'NO_ARTIFACT_REQUIRED',
] as const;
export type ArtifactNecessityOutcome = (typeof ARTIFACT_NECESSITY_OUTCOMES)[number];

export const RECEIPT_MODES = [
  'DOCUMENT',
  'OBJECT',
  'ENVIRONMENT',
  'BEHAVIOR',
  'SPATIAL_REVEAL',
  'PERFORMANCE',
  'SOUND',
  'EDIT',
  'ABSENCE',
  'REPETITION',
  'ACCUMULATION',
  'CONTRAST',
  'SYSTEM',
  'CHARACTER_REACTION',
] as const;
export type ReceiptMode = (typeof RECEIPT_MODES)[number];

export const CAMERA_DISCOVERY_FUNCTIONS = [
  'DISCOVERS',
  'FOLLOWS',
  'SPIES',
  'MISDIRECTS',
  'REVEALS',
  'BECOMES_COMPLICIT',
  'CROSSES_THRESHOLD',
  'REFUSES_TO_LOOK',
  'GETS_INTERRUPTED',
  'CHANGES_ALLEGIANCE',
  'IS_FORCED_BACK',
  'LOSES_SUBJECT',
  'FINDS_EVIDENCE',
] as const;
export type CameraDiscoveryFunction = (typeof CAMERA_DISCOVERY_FUNCTIONS)[number];

export const HANDOFF_MATURITY_TYPES = ['CLOSED_HANDOFF', 'OPEN_HANDOFF'] as const;
export type HandoffMaturityType = (typeof HANDOFF_MATURITY_TYPES)[number];

export const DIRECTOR_CHALLENGE_OUTCOMES = [
  'ORIGINAL_WINNER_RETAINED',
  'WINNER_DEEPENED',
  'WINNER_HYBRIDIZED',
  'WINNER_SUPERSEDED',
] as const;
export type DirectorChallengeOutcome = (typeof DIRECTOR_CHALLENGE_OUTCOMES)[number];

export const CHALLENGE_RESOLUTIONS = ['KEEP', 'DEEPEN', 'HYBRIDIZE', 'SUPERSEDE'] as const;
export type ChallengeResolution = (typeof CHALLENGE_RESOLUTIONS)[number];

export const SENIOR_CREATIVE_FAILURE_CLASSES = [
  'METRIC_IS_THE_IDEA',
  'EXPLANATORY_PROP',
  'TEASER_BECAME_NEXT_BRIEF',
  'EXAMPLE_ONLY_ESCALATION',
  'FIRST_GOOD_ANSWER_ACCEPTED_TOO_EARLY',
  'INSIGHT_TOO_SHALLOW',
  'METAPHOR_TOO_LITERAL',
  'WORLD_TOO_DECORATIVE',
  'ARTIFACT_REDUNDANT',
  'RECEIPT_TOO_EXPLANATORY',
  'CAMERA_TOO_PASSIVE',
  'PERFORMANCE_TOO_PASSIVE',
  'CONCEPT_TOO_STATIC',
  'WIT_ONLY_IN_COPY',
  'ENDING_TOO_CLOSED',
  'HANDOFF_TOO_LITERAL',
  'CAMPAIGN_NOT_ESCALATING',
  'NEXT_UNIT_PREMATURELY_DEFINED',
  'FORMAT_DRIVING_STORY',
  'FOUNDER_CONNECTING_DOTS',
  'REASONING_DEPTH_LIMITED',
  'REASONING_PROVIDER_FAILURE',
] as const;
export type SeniorCreativeFailureClass = (typeof SENIOR_CREATIVE_FAILURE_CLASSES)[number];

export const CORRECTION_TAXONOMY = [
  'INSIGHT_TOO_SHALLOW',
  'METAPHOR_TOO_LITERAL',
  'WORLD_TOO_DECORATIVE',
  'ARTIFACT_REDUNDANT',
  'RECEIPT_TOO_EXPLANATORY',
  'CAMERA_TOO_PASSIVE',
  'PERFORMANCE_TOO_PASSIVE',
  'CONCEPT_TOO_STATIC',
  'WIT_ONLY_IN_COPY',
  'ENDING_TOO_CLOSED',
  'TEASE_TOO_DETERMINISTIC',
  'HANDOFF_TOO_LITERAL',
  'CAMPAIGN_NOT_ESCALATING',
  'NEXT_UNIT_PREMATURELY_DEFINED',
  'FORMAT_DRIVING_STORY',
  'FOUNDER_CONNECTING_DOTS',
  'FIRST_GOOD_ANSWER_ACCEPTED_TOO_EARLY',
] as const;
export type CorrectionTaxonomyClass = (typeof CORRECTION_TAXONOMY)[number];

export const MEDIUM_FORMATS = [
  'FILM',
  'REEL',
  'CAROUSEL',
  'STORY',
  'STATIC',
  'X',
  'EMAIL',
  'TIKTOK',
] as const;
export type MediumFormat = (typeof MEDIUM_FORMATS)[number];

export type DeepCreativeReframe = {
  surfaceObservation: string;
  firstOrderContradiction: string;
  secondOrderContradiction: string;
  humanContradiction: string;
  culturalContradiction: string;
  behavioralContradiction: string;
  systemicContradiction: string;
  emotionalTruth: string;
  mostInterestingLevel: string;
};

export type MetaphorMaturityAssessment = {
  argumentIntegration: number;
  narrativeNecessity: number;
  physicalBehavior: number;
  visualPotential: number;
  surprise: number;
  specificity: number;
  depth: number;
  discoverability: number;
  nonLiteralness: number;
  subjectOwnership: number;
  classification: MetaphorMaturityClass;
  rationale: string;
};

export type WorldArgumentAssessment = {
  worldVerb: string;
  genericRoomTest: boolean;
  losesMeaningWithoutWorld: boolean;
  decorativeRisk: boolean;
  structuralIntegration: number;
  rationale: string;
};

export type ArtifactNecessityAssessment = {
  outcome: ArtifactNecessityOutcome;
  uniqueStoryFunction: string | null;
  worldCanProve: boolean;
  behaviorCanProve: boolean;
  editCanProve: boolean;
  spatialRevealCanProve: boolean;
  explanatoryPropRisk: boolean;
  rationale: string;
};

export type CinematicNecessityAssessment = {
  cinematicNecessity: 'LOW' | 'MODERATE' | 'HIGH';
  temporalDiscovery: number;
  cameraDiscovery: number;
  performance: number;
  spatialReveal: number;
  movement: number;
  escalation: number;
  staticEquivalentRisk: boolean;
  rationale: string;
};

export type HeroMemoryImage = {
  imageDescription: string;
  recognizability: number;
  conceptCompression: number;
  surprise: number;
  emotionalCharge: number;
  brandSpecificity: number;
  thumbnailStrength: number;
  present: boolean;
};

export type PerformanceLogic = {
  subjectBehaviorBeforeReveal: string;
  subjectBelievesCameraSees: string;
  changeOnExposure: string;
  performanceChanges: boolean;
  audienceInterpretationChanges: boolean;
  passiveSubjectRisk: boolean;
};

export type VisualWitAssessment = {
  copyWit: number;
  visualWit: number;
  structuralIrony: number;
  soundOffComprehension: boolean;
  visualReversal: boolean;
  behavioralIrony: boolean;
  spatialIrony: boolean;
};

export type MediumNecessityAssessment = {
  medium: MediumFormat;
  necessityScore: number;
  whyThisMedium: string;
  mediumExploited: boolean;
};

export type FirstAnswerAttack = {
  vector: string;
  diagnosis: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH';
};

export type FirstAnswerChallenge = {
  initialWinnerId: string;
  attackVectors: FirstAnswerAttack[];
  resolution: ChallengeResolution;
  rationale: string;
};

export type CreativeRedTeamPass = {
  strongestCriticism: string;
  missedOpportunity: string;
  moreDangerousInterpretation: string;
  moreCinematicMechanism: string;
  moreMemorableImage: string;
  moreHumanTruth: string;
};

export type ChallengerConcept = {
  challengerId: string;
  conceptName: string;
  oneSentenceIdea: string;
  whyItCouldBeatWinner: string;
  scores: {
    depth: number;
    originality: number;
    cinematicity: number;
    wit: number;
    humanTruth: number;
    worldFunction: number;
    artifactNecessity: number;
    memoryImage: number;
    campaignFit: number;
  };
};

export type WinnerChallengerComparison = {
  winnerId: string;
  challengerId: string;
  winnerWinsOn: string[];
  challengerWinsOn: string[];
  overallWinner: 'WINNER' | 'CHALLENGER' | 'TIE';
};

export type DirectorChallengePass = {
  passNumber: number;
  diagnose: string;
  challenge: string;
  reframe: string;
  reconceive: string;
  reEvaluate: string;
  outcome: DirectorChallengeOutcome;
};

export type ExceptionalConceptGate = {
  passed: boolean;
  domains: Record<string, { score: number; note: string }>;
  failureClasses: SeniorCreativeFailureClass[];
  blocksFounderReview: boolean;
};

export type FutureUnitTease = {
  teaseId: string;
  fromUnitId: string;
  seedType: string;
  visualSeed: string | null;
  soundSeed: string | null;
  objectSeed: string | null;
  questionSeed: string | null;
  behaviorSeed: string | null;
  emotionalSeed: string | null;
  constraints: string[];
  opennessScore: number;
  conceptLockRisk: boolean;
  nonCanon: boolean;
};

export type CampaignResponsibilitySnapshot = {
  whatPreviousUnitsProved: string[];
  whatRemainsUnresolved: string[];
  whatAudienceNowKnows: string[];
  whatAudienceNowFeels: string[];
  whatNextUnitMustAdd: string[];
  whatNextUnitMustNotRepeat: string[];
  availableEscalationDirections: string[];
};

export type CreativeCorrectionRecord = {
  correctionId: string;
  projectId: string;
  campaignId: string;
  contentUnitId: string;
  feedbackType: string;
  surfaceFeedback: string;
  diagnosedUnderlyingIssue: string;
  generalizablePrinciple: string;
  applicableDomains: string[];
  nonApplicableDomains: string[];
  overfitRisk: 'LOW' | 'MODERATE' | 'HIGH';
  examples: string[];
  counterExamples: string[];
  confidence: number;
  createdAt: string;
};

export type SeniorDirectorReviewPresentation = {
  qualityTier: CreativeQualityTier;
  confidence: CreativeConfidence;
  founderHandholdingRisk: FounderHandholdingRisk;
  initialWinner: string;
  theChallenge: string;
  deeperIdea: string;
  finalDirection: string;
  whyItSurvived: string[];
  campaignFit: string;
  evolutionPath: string;
};

export type SeniorCreativeJudgmentInput = {
  projectId: string;
  campaignId: string;
  contentUnitId: string;
  formatTarget: MediumFormat;
  conceptName: string;
  oneSentenceIdea: string;
  thesis: string;
  world: string;
  worldFunction: string;
  artifact: string | null;
  artifactFunction: string | null;
  interjection: string;
  openingImage: string;
  centralReveal: string;
  turningPoint: string;
  climaxImage: string;
  endingImage: string;
  handoffOut: string;
  entry004Tease: string;
  deeperContradiction: string;
  culturalRead: string;
};

export type SeniorCreativeJudgmentOutput = {
  judgmentId: string;
  engineVersion: '1.4.0';
  input: SeniorCreativeJudgmentInput;
  qualityTier: CreativeQualityTier;
  confidence: CreativeConfidence;
  founderHandholdingRisk: FounderHandholdingRisk;
  deepReframe: DeepCreativeReframe;
  measurableVsHuman: { measurableReceipt: string; humanRevelation: string; metricIsTheIdea: boolean };
  metaphorMaturity: MetaphorMaturityAssessment;
  worldArgument: WorldArgumentAssessment;
  artifactNecessity: ArtifactNecessityAssessment;
  receiptModes: ReceiptMode[];
  cinematicNecessity: CinematicNecessityAssessment;
  heroMemoryImage: HeroMemoryImage;
  cameraDiscovery: { function: CameraDiscoveryFunction; whatCameraLearns: string };
  performanceLogic: PerformanceLogic;
  visualWit: VisualWitAssessment;
  firstAnswerChallenge: FirstAnswerChallenge;
  redTeam: CreativeRedTeamPass;
  challenger: ChallengerConcept;
  winnerComparison: WinnerChallengerComparison;
  directorChallengeLoop: DirectorChallengePass[];
  finalOutcome: DirectorChallengeOutcome;
  exceptionalGate: ExceptionalConceptGate;
  blocksFounderReview: boolean;
  handoffMaturity: HandoffMaturityType;
  futureUnitTease: FutureUnitTease;
  campaignResponsibility: CampaignResponsibilitySnapshot;
  mediumNecessity: MediumNecessityAssessment;
  seniorDirectorReview: SeniorDirectorReviewPresentation;
  supersededConceptHistory: Array<{ conceptName: string; supersededAt: string; reason: string }>;
  failureClasses: SeniorCreativeFailureClass[];
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
  createdAt: string;
};

export const SENIOR_CREATIVE_JUDGMENT_GATE_ID = 'GATE_SENIOR_CREATIVE_JUDGMENT_REVIEW' as const;
