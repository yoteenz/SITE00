/**
 * P0.5C.2 — Cultural Visual Participation types
 */

import type {
  CULTURAL_FAILURE_STATES,
  CULTURAL_VISUAL_EVIDENCE_CLASSES,
  CULTURAL_VISUAL_ROLES,
  FEED_CULTURAL_RHYTHM_TYPES,
  FEED_EMOTIONAL_TEMPERATURES,
  IMAGE_PARTICIPATION_REQUIREMENTS,
  PHOTOGRAPHY_BEHAVIORS,
  V21_FOUNDER_JUDGMENTS,
  VISUAL_APPETITE_RESULTS,
  VISUAL_EVIDENCE_CLASSIFICATIONS,
  VISUAL_PARTICIPATION_BALANCE,
  VISUAL_PARTICIPATION_MODES,
} from './constants.js';
import type { FirstSlideArtDirectionContract } from '../editorialInformationArchitecture/types.js';

export type CulturalVisualEvidenceClass = (typeof CULTURAL_VISUAL_EVIDENCE_CLASSES)[number];
export type CulturalVisualRole = (typeof CULTURAL_VISUAL_ROLES)[number];
export type VisualParticipationMode = (typeof VISUAL_PARTICIPATION_MODES)[number];
export type ImageParticipationRequirement = (typeof IMAGE_PARTICIPATION_REQUIREMENTS)[number];
export type VisualParticipationBalance = (typeof VISUAL_PARTICIPATION_BALANCE)[number];
export type VisualEvidenceClassification = (typeof VISUAL_EVIDENCE_CLASSIFICATIONS)[number];
export type VisualAppetiteResult = (typeof VISUAL_APPETITE_RESULTS)[number];
export type PhotographyBehavior = (typeof PHOTOGRAPHY_BEHAVIORS)[number];
export type FeedCulturalRhythmType = (typeof FEED_CULTURAL_RHYTHM_TYPES)[number];
export type FeedEmotionalTemperature = (typeof FEED_EMOTIONAL_TEMPERATURES)[number];
export type CulturalFailureState = (typeof CULTURAL_FAILURE_STATES)[number];
export type V21FounderJudgment = (typeof V21_FOUNDER_JUDGMENTS)[number] | null;

export type CulturalVisualEvidence = {
  evidenceId: string;
  evidenceClass: CulturalVisualEvidenceClass;
  visualRole: CulturalVisualRole;
  subjectDescription: string;
  sourceProvenance: string | null;
  usageStatus: 'LICENSED' | 'PUBLIC_DOMAIN' | 'GENERATED' | 'FOUNDER_SUPPLIED' | 'ILLUSTRATIVE' | null;
  licensingStatus: string | null;
  referenceDate: string | null;
  referenceId: string | null;
  transformationStatus: string | null;
  evidenceClassification: VisualEvidenceClassification;
  servesThesis: boolean;
  decorativeOnly: boolean;
};

export type ArtisticEvidence = {
  evidenceId: string;
  kind: 'ORIGINAL_ILLUSTRATION' | 'EXPRESSIVE_COLLAGE' | 'CONCEPTUAL_PHOTOGRAPHY' | 'VISUAL_METAPHOR' | 'TYPOGRAPHIC_IMAGE_MAKING' | 'OBJECT_COMPOSITION';
  description: string;
  classification: 'ARTISTIC_INTERPRETATION' | 'GENERATED_ILLUSTRATION' | 'SYMBOLIC_EXPRESSION';
  embodiesThought: boolean;
  factualEvidence: false;
};

export type VisualSubjectMatterDecision = {
  decisionId: string;
  artifactId: string;
  participationMode: VisualParticipationMode;
  imageParticipationRequired: ImageParticipationRequirement;
  culturalVisualSubject: string;
  whyImageBelongs: string | null;
  whyImageDoesNotBelong: string | null;
  humanPresence: boolean;
  imageHero: boolean;
  objectHero: boolean;
  culturalContextVisible: boolean;
  visualSubjectMatterReasoning: string[];
  fingerprint: string;
};

export type VisualAppetiteEvaluation = {
  evaluationId: string;
  artifactId: string;
  visualSubjectInterest: VisualAppetiteResult;
  humanInterest: VisualAppetiteResult;
  culturalInterest: VisualAppetiteResult;
  objectInterest: VisualAppetiteResult;
  imageTension: VisualAppetiteResult;
  compositionalCuriosity: VisualAppetiteResult;
  emotionalEntry: VisualAppetiteResult;
  surprise: VisualAppetiteResult;
  beauty: VisualAppetiteResult;
  humor: VisualAppetiteResult;
  overall: VisualAppetiteResult;
  question: 'IS THERE SOMETHING HERE I WANT TO LOOK AT BEFORE I READ IT?';
  evaluatedAt: string;
};

export type CulturalAccompliceExpressionEvaluation = {
  evaluationId: string;
  artifactId: string;
  culturalMemory: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  humanPresence: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  socialContext: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  sharedReferences: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  culturalParticipation: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  taste: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  emotionalIntelligence: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  humor: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  overall: 'PASS' | 'FAIL';
  evaluatedAt: string;
};

export type MarketingPlayfulnessEvaluation = {
  evaluationId: string;
  artifactId: string;
  playful: boolean;
  frivolous: boolean;
  visuallyCheeky: boolean;
  culturallyPlayful: boolean;
  appropriate: boolean;
  evaluatedAt: string;
};

export type ReferenceDensityEvaluation = {
  referenceCount: number;
  unrelatedReferences: number;
  stuffingRisk: boolean;
  naturalFluency: boolean;
};

export type FeedCulturalRhythm = {
  boardId: string;
  distribution: Record<FeedCulturalRhythmType, number>;
  variationAdequate: boolean;
  textDocumentMonotony: boolean;
};

export type FeedEmotionalRhythm = {
  boardId: string;
  temperatures: FeedEmotionalTemperature[];
  variationAdequate: boolean;
  emotionallyFlat: boolean;
};

export type MarketingVisualDiversityEvaluation = {
  evaluationId: string;
  imageTypeBalance: 'PASS' | 'FAIL';
  humanPresence: 'PASS' | 'FAIL';
  artisticRange: 'PASS' | 'FAIL';
  culturalRange: 'PASS' | 'FAIL';
  photographicRange: 'PASS' | 'FAIL';
  densityVariation: 'PASS' | 'FAIL';
  emotionalVariation: 'PASS' | 'FAIL';
  failureStates: CulturalFailureState[];
  evaluatedAt: string;
};

export type CulturalImageParticipationCalibration = {
  calibrationId: string;
  northStarId: string;
  humanPresence: 'PASS' | 'FAIL';
  culturalImageUse: 'PASS' | 'FAIL';
  archivalImageUse: 'PASS' | 'FAIL';
  artisticRange: 'PASS' | 'FAIL';
  photographicRange: 'PASS' | 'FAIL';
  objectRange: 'PASS' | 'FAIL';
  visualHumor: 'PASS' | 'FAIL';
  nostalgia: 'PASS' | 'FAIL';
  fashionStyleParticipation: 'PASS' | 'FAIL';
  imageTypeRelationship: 'PASS' | 'FAIL';
  visualSurprise: 'PASS' | 'FAIL';
  emotionalEntry: 'PASS' | 'FAIL';
  classification: 'CULTURAL_IMAGE_PARTICIPATION_CALIBRATION';
  identityAuthority: 'NONE';
  evaluatedAt: string;
};

export type FirstSlideCulturalBalanceExtension = {
  visualParticipationMode: VisualParticipationMode;
  imageParticipationRequired: ImageParticipationRequirement;
  culturalVisualEvidence: CulturalVisualEvidence[];
  artisticEvidence: ArtisticEvidence[];
  visualParticipationBalance: VisualParticipationBalance;
  visualAppetiteTarget: VisualAppetiteResult;
  playfulnessTarget: string;
  imageType: CulturalVisualEvidenceClass | null;
  imageSourceClass: VisualEvidenceClassification | null;
  imageAuthority: string | null;
  imageProvenance: string | null;
  referenceDensity: ReferenceDensityEvaluation;
  visualSubjectMatterDecision: VisualSubjectMatterDecision;
  visualAppetiteEvaluation: VisualAppetiteEvaluation;
  culturalAccompliceEvaluation: CulturalAccompliceExpressionEvaluation;
  playfulnessEvaluation: MarketingPlayfulnessEvaluation;
  photographyBehavior: PhotographyBehavior | null;
  whyImageBelongs: string | null;
  whyImageDoesNotBelong: string | null;
};

export type AmendedFirstSlideContract = FirstSlideArtDirectionContract & {
  culturalParticipation: FirstSlideCulturalBalanceExtension;
};

export type Experiment01V21Artifact = {
  id: string;
  v1ArtifactId: string;
  v2ArtifactId: string | null;
  topic: string;
  subject: string;
  contract: AmendedFirstSlideContract;
  carouselArchitecture: import('../editorialInformationArchitecture/types.js').CarouselNarrativeArchitecture;
  editorialDecision: import('../editorialInformationArchitecture/types.js').EditorialDecision;
  generationContract: import('../brandMarketingExpression/types.js').MarketingFalPromptContract | null;
  generatedAssetId: string | null;
  generatedAssetUrl: string | null;
  generationStatus: 'NOT_GENERATED' | 'GENERATING' | 'GENERATED' | 'FAILED';
  culturalEvaluation: MarketingVisualDiversityEvaluation | null;
  founderJudgment: V21FounderJudgment;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketingExpressionExperiment01V21 = {
  experimentId: string;
  version: 'EXPERIMENT_01_V2_1_CULTURAL_IMAGE_PARTICIPATION';
  projectId: string;
  status: 'NOT_STARTED' | 'CONTRACTS_READY' | 'GENERATING' | 'GENERATED' | 'FOUNDER_REVIEW' | 'FAILED';
  topics: string[];
  v1ArtifactIds: string[];
  v2ArtifactIds: string[];
  amendedContracts: AmendedFirstSlideContract[];
  generatedArtifacts: Experiment01V21Artifact[];
  feedCulturalRhythm: FeedCulturalRhythm | null;
  feedEmotionalRhythm: FeedEmotionalRhythm | null;
  boardEvaluation: MarketingVisualDiversityEvaluation | null;
  northStarCulturalCalibration: CulturalImageParticipationCalibration | null;
  founderSetJudgment: V21FounderJudgment;
  error: string | null;
};

export type ContentPackageVisualSubjectLayer = {
  visualSubjectMatterDecisionId: string;
  culturalVisualEvidenceIds: string[];
  artisticEvidenceIds: string[];
  visualParticipationBalance: VisualParticipationBalance;
  visualAppetiteEvaluation: VisualAppetiteEvaluation;
};

export type OpportunityVisualPotential = {
  humanVisualPotential: number;
  culturalVisualPotential: number;
  objectVisualPotential: number;
  archivalVisualPotential: number;
  artisticVisualPotential: number;
  photographicVisualPotential: number;
};
