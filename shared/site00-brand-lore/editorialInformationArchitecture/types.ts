/**
 * P0.5C.1 — Editorial Information Architecture types
 */

import type {
  CAROUSEL_SEQUENCE_FUNCTIONS,
  DEFER_CLASSIFICATIONS,
  EDITORIAL_FAILURE_STATES,
  FEED_DENSITY_RHYTHM_TARGETS,
  FIRST_SLIDE_SEMANTIC_ROLES,
  LIME_FUNCTIONS,
  TEXT_DENSITY_LEVELS,
  TYPOGRAPHY_ROLES,
  V2_FOUNDER_JUDGMENTS,
} from './constants.js';

export type FirstSlideSemanticRole = (typeof FIRST_SLIDE_SEMANTIC_ROLES)[number];
export type DeferClassification = (typeof DEFER_CLASSIFICATIONS)[number];
export type CarouselSequenceFunction = (typeof CAROUSEL_SEQUENCE_FUNCTIONS)[number];
export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number];
export type TextDensityLevel = (typeof TEXT_DENSITY_LEVELS)[number];
export type FeedDensityRhythmTarget = (typeof FEED_DENSITY_RHYTHM_TARGETS)[number];
export type LimeFunction = (typeof LIME_FUNCTIONS)[number];
export type EditorialFailureState = (typeof EDITORIAL_FAILURE_STATES)[number];
export type V2FounderJudgment = (typeof V2_FOUNDER_JUDGMENTS)[number] | null;

export type InformationDisclosureEntry = {
  element: string;
  classification: DeferClassification;
  reason: string;
};

export type EditorialDecision = {
  id: string;
  projectId: string;
  contentOpportunityId: string | null;
  contentPackageId: string | null;
  characterSystemId: string;
  marketingExpressionSystemId: string;
  primaryObservation: string;
  primaryQuestion: string | null;
  primaryJudgment: string | null;
  primaryContradiction: string | null;
  primaryHook: string;
  viewerShouldNoticeFirst: string;
  supportingEvidence: string[];
  secondaryEvidence: string[];
  deferredEvidence: string[];
  requiredContext: string[];
  optionalContext: string[];
  firstSlidePurpose: string;
  sequencePurpose: string;
  informationPriorityMap: Record<string, 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4'>;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type FirstSlideInformationBudget = {
  primaryHeadlineCount: number;
  primaryEvidenceObjects: number;
  supportingEvidenceObjects: number;
  primaryTraceClusters: number;
  secondaryTraceClusters: number;
  metadataZones: number;
  longParagraphs: number;
  fullResearchExplanations: number;
  fullSourceLists: number;
  multiParagraphAnalysis: number;
  fullMethodologyExplanation: number;
  fullCarouselConclusion: number;
  withinBudget: boolean;
  violations: string[];
};

export type TypographyRoleAssignment = {
  elementId: string;
  text: string;
  role: TypographyRole;
  isNdxAuthored: boolean;
  uppercaseRequired: boolean;
};

export type ArtifactReadingPath = {
  firstLook: string;
  secondLook: string;
  thirdLook: string;
  optionalDiscovery: string;
  articulated: boolean;
};

export type ArtifactDistanceEvaluation = {
  grid: { pass: boolean; survivesWhenSmall: string; notes: string[] };
  feed: { pass: boolean; hookLegible: boolean; notes: string[] };
  inspection: { pass: boolean; rewardsInspection: boolean; notes: string[] };
  evaluatedAt: string;
};

export type TextDensityEvaluation = {
  level: TextDensityLevel;
  justified: boolean;
  justification: string | null;
  firstSlideAllowed: boolean;
};

export type LimeUsageEvaluation = {
  functions: LimeFunction[];
  purposeful: boolean;
  restrained: boolean;
  overused: boolean;
  decorativeOnly: boolean;
};

export type FirstSlideArtDirectionContract = {
  contentPackageId: string | null;
  artifactId: string;
  semanticRole: FirstSlideSemanticRole;
  primaryHook: string;
  secondaryReveal: string | null;
  viewerShouldNoticeFirst: string;
  primaryEvidence: string[];
  deferredEvidence: string[];
  primaryTrace: string;
  optionalSecondaryTrace: string | null;
  typographyAssignments: TypographyRoleAssignment[];
  textDensity: TextDensityEvaluation;
  readingPath: ArtifactReadingPath;
  gridBehavior: string;
  feedBehavior: string;
  inspectionBehavior: string;
  limeFunction: LimeFunction | null;
  compositionIntent: string;
  negativeConstraints: string[];
  informationBudget: FirstSlideInformationBudget;
  informationDisclosure: InformationDisclosureEntry[];
  evaluation: EditorialArtifactEvaluation | null;
  fingerprint: string;
};

export type CarouselSlideContract = {
  slideNumber: number;
  semanticRole: CarouselSequenceFunction;
  purpose: string;
  viewerAlreadyKnows: string;
  viewerLearnsNow: string;
  questionRemaining: string;
  primaryMessage: string;
  evidence: string[];
  trace: string[];
  typographyAssignments: TypographyRoleAssignment[];
  density: TextDensityLevel;
  relationshipToPreviousSlide: string;
  relationshipToNextSlide: string;
  visualContinuity: string[];
  visualVariation: string[];
  resolutionState: string;
};

export type CarouselNarrativeArchitecture = {
  packageId: string | null;
  artifactId: string;
  sequenceThesis: string;
  sequenceArc: string;
  slideCount: number;
  slideRoles: CarouselSequenceFunction[];
  informationDisclosureMap: InformationDisclosureEntry[];
  visualRhythmPlan: string[];
  evidenceDistribution: Record<number, string[]>;
  traceDistribution: Record<number, string[]>;
  densityDistribution: Record<number, TextDensityLevel>;
  resolutionStateBySlide: string[];
  slideContracts: CarouselSlideContract[];
  usesSequenceCreativeSystem: true;
  fingerprint: string;
};

export type FeedDensityRhythm = {
  boardId: string;
  targets: FeedDensityRhythmTarget[];
  artifactDensities: TextDensityLevel[];
  variationAdequate: boolean;
  adjacentIntensityBalanced: boolean;
};

export type EditorialArtifactEvaluation = {
  evaluationId: string;
  artifactId: string;
  primaryIdeaClarity: 'PASS' | 'FAIL';
  readingPathClarity: 'PASS' | 'FAIL';
  thumbnailLegibility: 'PASS' | 'FAIL';
  feedLegibility: 'PASS' | 'FAIL';
  inspectionReward: 'PASS' | 'FAIL';
  typographicCoherence: 'PASS' | 'FAIL';
  uppercaseCompliance: 'PASS' | 'FAIL';
  textDensity: 'PASS' | 'FAIL';
  evidencePriority: 'PASS' | 'FAIL';
  traceRestraint: 'PASS' | 'FAIL';
  limeRestraint: 'PASS' | 'FAIL';
  makerPresence: 'PASS' | 'FAIL';
  characterPresence: 'PASS' | 'FAIL';
  artDirectionQuality: 'PASS' | 'FAIL';
  genericTemplateRisk: boolean;
  aiClutterRisk: boolean;
  bespokeArtDirected: boolean;
  failureStates: EditorialFailureState[];
  distanceEvaluation: ArtifactDistanceEvaluation;
  evaluatedAt: string;
};

export type Experiment01ComparisonEvaluation = {
  evaluationId: string;
  v1Version: string;
  v2Version: string;
  characterChanged: false;
  expressionWorldChanged: false;
  informationArchitectureChanged: true;
  typographyGovernanceChanged: true;
  sequenceAwarenessChanged: true;
  boardEvaluation: {
    characterConsistency: 'PASS' | 'FAIL';
    typographicConsistency: 'PASS' | 'FAIL';
    limeConsistency: 'PASS' | 'FAIL';
    densityRhythm: 'PASS' | 'FAIL';
    templateDependence: 'PASS' | 'FAIL';
    feedFatigue: 'PASS' | 'FAIL';
  };
  evaluatedAt: string;
};

export type EditorialLayerBundle = {
  editorialDecision: EditorialDecision;
  firstSlideContract: FirstSlideArtDirectionContract;
  carouselNarrative: CarouselNarrativeArchitecture;
  feedDensityRhythm: FeedDensityRhythm | null;
  typographyAssignments: TypographyRoleAssignment[];
  informationDisclosureMap: InformationDisclosureEntry[];
};

export type MarketingExpressionExperiment01V2 = {
  experimentId: string;
  version: 'EXPERIMENT_01_V2_INFORMATION_ARCHITECTURE';
  projectId: string;
  status:
    | 'NOT_STARTED'
    | 'FORMULATING'
    | 'CONTRACTS_READY'
    | 'GENERATING'
    | 'GENERATED'
    | 'FOUNDER_REVIEW'
    | 'FAILED';
  topics: string[];
  behavioralModesRepresented: string[];
  v1ArtifactIds: string[];
  contracts: FirstSlideArtDirectionContract[];
  carouselArchitectures: CarouselNarrativeArchitecture[];
  editorialDecisions: EditorialDecision[];
  generatedArtifacts: Experiment01V2Artifact[];
  boardEvaluation: Experiment01ComparisonEvaluation | null;
  founderSetJudgment: V2FounderJudgment;
  formulationStartedAt: string | null;
  formulationAttemptId: string | null;
  error: string | null;
};

export type Experiment01V2Artifact = {
  id: string;
  v1ArtifactId: string;
  topic: string;
  subject: string;
  contract: FirstSlideArtDirectionContract;
  carouselArchitecture: CarouselNarrativeArchitecture;
  editorialDecision: EditorialDecision;
  generationContract: import('../brandMarketingExpression/types.js').MarketingFalPromptContract | null;
  generatedAssetId: string | null;
  generatedAssetUrl: string | null;
  generationStatus: 'NOT_GENERATED' | 'GENERATING' | 'GENERATED' | 'FAILED';
  evaluation: EditorialArtifactEvaluation | null;
  founderJudgment: V2FounderJudgment;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};
