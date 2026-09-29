/**
 * P0.NDX.NARRATIVE-MOMENTUM-ENGINE1 — story architecture between territory and format execution.
 */

export const NARRATIVE_MOMENTUM_ENGINE_VERSION = '1.1.0' as const;

export const NARRATIVE_MOMENTUM_STATUSES = [
  'DRAFT',
  'GENERATED',
  'FOUNDER_REVIEW',
  'APPROVED',
  'NEEDS_REVISION',
  'SUPERSEDED',
] as const;

export type NarrativeMomentumStatus = (typeof NARRATIVE_MOMENTUM_STATUSES)[number];

export const NARRATIVE_MOMENTUM_LAYER_MODES = [
  'STANDARD',
  'RETROACTIVE_AUTHORITY_LAYER',
] as const;

export type NarrativeMomentumLayerMode = (typeof NARRATIVE_MOMENTUM_LAYER_MODES)[number];

export const PROOF_TYPES = [
  'ARTIFACT_PROOF',
  'BEHAVIORAL_PROOF',
  'TEMPORAL_PROOF',
  'CONTRADICTION_PROOF',
  'QUANTITATIVE_PROOF',
  'TESTIMONIAL_PROOF',
  'VISUAL_PROOF',
  'PROCESS_PROOF',
  'ARCHIVAL_PROOF',
  'COMPARATIVE_PROOF',
] as const;

export type ProofType = (typeof PROOF_TYPES)[number];

export const PROOF_STRENGTHS = ['PRIMARY', 'SUPPORTING', 'ATMOSPHERIC'] as const;
export type ProofStrength = (typeof PROOF_STRENGTHS)[number];

export const PROOF_SOURCE_STATUSES = [
  'VERIFIED_SOURCE',
  'SOURCE_AVAILABLE',
  'SOURCE_REQUIRED',
  'FOUNDER_SUPPLIED',
  'DERIVED_COMPARISON',
] as const;

export type ProofSourceStatus = (typeof PROOF_SOURCE_STATUSES)[number];

export const EVIDENCE_SOURCE_TYPES = [
  'ARCHIVED_POST',
  'ARCHIVED_COMMENT',
  'SCREENSHOT',
  'HEADLINE',
  'THEN_NOW_COMPARISON',
  'BEHAVIOR_PATTERN',
  'QUANTITATIVE',
  'VISUAL_CONTINUITY',
  'TESTIMONIAL',
  'PROCESS_DEMONSTRATION',
  'PLATFORM_TONE',
  'EDITORIAL_METAPHOR',
] as const;

export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];

export type NarrativeEvidenceObject = {
  id: string;
  proofType: ProofType;
  sourceType: EvidenceSourceType;
  sourceReference: string;
  whatIsObserved: string;
  whatItSupports: string;
  strength: ProofStrength;
  placement: { beatId: string; whyNow: string; beliefBefore: string; beliefAfter: string };
  status: ProofSourceStatus;
};

export type NarrativeInterpretation = {
  id: string;
  claim: string;
  derivedFromEvidenceIds: readonly string[];
  lens: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  role: 'NDX_LENS' | 'REFRAME' | 'SYNTHESIS' | 'EDITORIAL';
};

export const TENSION_MODELS = [
  'CANONICAL',
  'DOUBLE_PEAK',
  'FALSE_RELEASE',
  'NONLINEAR',
  'SUSTAINED_TENSION',
] as const;

export type TensionModel = (typeof TENSION_MODELS)[number];

export const VALIDATION_SEVERITIES = ['INFO', 'ADVISORY', 'WARNING', 'BLOCKING'] as const;
export type ValidationSeverity = (typeof VALIDATION_SEVERITIES)[number];

export const TRANSFORMATION_TYPES = [
  'PRODUCT_TRANSFORMATION',
  'IDENTITY_TRANSFORMATION',
  'CULTURAL_REFRAME',
  'PROCESS_REVEAL',
  'BELIEF_REVERSAL',
  'STATUS_REFRAME',
  'EMOTIONAL_SHIFT',
  'SYSTEM_UNDERSTANDING',
] as const;

export type TransformationType = (typeof TRANSFORMATION_TYPES)[number];

export const TENSION_CURVE_STAGES = [
  'LOW',
  'RISING',
  'INTERRUPTION',
  'ESCALATION',
  'PEAK',
  'RELEASE',
  'RESIDUAL',
] as const;

export type TensionCurveStage = (typeof TENSION_CURVE_STAGES)[number];

export const SHOT_FUNCTIONS = [
  'ESTABLISH',
  'DISRUPT',
  'PROVE',
  'ESCALATE',
  'CONTRADICT',
  'REVEAL',
  'REFRAME',
  'BREATHE',
  'TRANSFORM',
  'OPEN_LOOP',
] as const;

export type ShotFunction = (typeof SHOT_FUNCTIONS)[number];

export const CONTINUATION_DESTINATIONS = [
  'NEXT_ENTRY',
  'CAROUSEL',
  'STORY',
  'REEL',
  'TIKTOK',
  'TWITTER_X',
  'PRODUCT_PAGE',
  'EDUCATIONAL_MODULE',
  'CAMPAIGN_FOLLOWUP',
  'NONE',
] as const;

export type ContinuationDestination = (typeof CONTINUATION_DESTINATIONS)[number];

export const NARRATIVE_GRAMMAR_IDS = [
  'TRANSFORMATION',
  'INVESTIGATION',
  'CULTURAL_GLITCH',
  'MYTH_BUST',
  'PROCESS_ACCESS',
  'IDENTITY_SHIFT',
  'SYSTEM_REVEAL',
  'CONTRADICTION',
  'BEFORE_AFTER_WITH_CAUSE',
  'DESIRE_GAP_MECHANISM',
] as const;

export type NarrativeGrammarId = (typeof NARRATIVE_GRAMMAR_IDS)[number];

export type NarrativeGrammarBeatTemplate = {
  beatId: string;
  label: string;
  purpose: string;
  defaultShotFunction: ShotFunction;
};

export type NarrativeGrammar = {
  grammarId: NarrativeGrammarId;
  label: string;
  beatSequence: readonly NarrativeGrammarBeatTemplate[];
  bestFor: readonly string[];
  /** Maps legacy Chapter 01 CONTRADICTION lineage when applicable. */
  legacyNdxChapter01?: boolean;
};

export type ProofObject = {
  proofId: string;
  proofType: ProofType;
  source: string;
  whatItProves: string;
  whenAudienceNeedsIt: string;
  bestPlacement: string;
  visualForm: string;
  strength: ProofStrength;
  riskOfOverexplaining: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type ProofArchitecture = {
  objects: readonly ProofObject[];
  placementPlan: ProofPlacementPlan;
};

export type ProofPlacementPlan = {
  strategy: 'ACCUMULATE' | 'SURPRISE_AFTER_CLAIM' | 'PROOF_BEFORE_CLAIM' | 'WITHHOLD_THEN_RELEASE' | 'INTERLEAVED';
  rationale: string;
  beatPlacements: Readonly<Record<string, string[]>>;
};

export type CulturalGlitchMechanic = {
  familiarReality: string;
  glitchMoment: string;
  temporalDislocation: string;
  receiptSource: string;
  contradiction: string;
  culturalLens: string;
  recontextualization: string;
  residualQuestion: string;
};

export type NarrativeBeat = {
  beatId: string;
  order: number;
  label: string;
  beatRole: string;
  grammarBeatId: string;
  shotFunction: ShotFunction;
  tensionStage: TensionCurveStage;
  tensionBefore: TensionCurveStage;
  tensionAfter: TensionCurveStage;
  whatAudienceKnows: string;
  whatAudienceDoesNotKnow: string;
  whatAudienceWantsToKnow: string;
  whatChangesInThisBeat: string;
  proofIds: readonly string[];
  evidenceUsed: readonly string[];
  interpretationIntroduced: readonly string[];
  whyNextBeatIsNecessary: string;
};

export type NarrativeTensionCurve = {
  stages: readonly { stage: TensionCurveStage; beatIds: readonly string[]; note: string }[];
};

export type OpenLoopArchitecture = {
  answered: readonly string[];
  unresolved: readonly string[];
  newQuestion: string;
  audienceWantsNext: string;
  continuation: NarrativeContinuationLink;
};

export type NarrativeContinuationLink = {
  destination: ContinuationDestination;
  targetEntryId: string | null;
  targetLabel: string;
  rationale: string;
};

export type NarrativeTransformationReframe = {
  transformationType: TransformationType;
  before: string;
  after: string;
};

export type NarrativeFormatAdaptation = {
  format: 'REEL' | 'CAROUSEL' | 'STORY' | 'TIKTOK' | 'X';
  beatsUsed: readonly string[];
  beatsMerged: readonly string[];
  openingStrategy: string;
  proofPlacement: string;
  midpointShift: string;
  closingStrategy: string;
  openLoopTreatment: string;
  durationOrSlideCount: string;
  reelArchitecture?: ReelStoryArchitecture;
  reelDetail?: ReelNarrativeAdaptation;
  carouselDetail?: CarouselNarrativeAdaptation;
};

export type ReelStoryArchitecture = {
  openingMoment: string;
  firstQuestion: string;
  firstProof: string;
  escalation: string;
  midpointTurn: string;
  reveal: string;
  reframe: string;
  endingImageOrLine: string;
  openLoop: string;
};

export type ReelBeatAdaptation = {
  sourceNarrativeBeatId: string;
  screenAction: string;
  viewerKnowledgeState: string;
  visualPurpose: string;
  narrativePurpose: string;
  proofUsed: readonly string[];
  transitionFunction: string;
  estimatedDurationRange: string;
};

export type ReelNarrativeAdaptation = {
  openingMoment: string;
  beatSequence: readonly ReelBeatAdaptation[];
  glitchMoment: string;
  firstProofMoment: string;
  evidenceEscalation: string;
  contradictionTurn: string;
  revealMoment: string;
  reframeMoment: string;
  releaseMoment: string;
  endingImage: string;
  openLoop: string;
  pacingNotes: string;
  soundNotes: string;
  visualContinuityRequirements: string;
};

export type CarouselSlideAdaptation = {
  slideNumber: number;
  sourceBeatIds: readonly string[];
  purpose: string;
  contentRole: string;
  proofIds: readonly string[];
  tensionStage: TensionCurveStage;
  transition: string;
};

export type CarouselNarrativeAdaptation = {
  slideSequence: readonly CarouselSlideAdaptation[];
  slidePurpose: string;
  proofPlacement: string;
  argumentEscalation: string;
  reframeSlide: number;
  finalOpenLoop: string;
};

export type NarrativeValidationIssue = {
  flagId: NarrativeMomentumValidationFlag;
  severity: ValidationSeverity;
  trigger: string;
  affectedBeatIds: readonly string[];
  explanation: string;
  suggestedCorrection: string;
  blocking: boolean;
};

export type StoryboardBeatHandoff = {
  beatId: string;
  order: number;
  label: string;
  whatViewerSees: string;
  whatViewerKnows: string;
  whatChanges: string;
  whyNextShotExists: string;
  tensionStage: TensionCurveStage;
  evidenceIds: readonly string[];
};

export type NarrativeMomentumPlan = {
  id: string;
  projectId: string;
  entryId: string;
  topic: string;
  creativeTerritoryId: string;
  creativeTerritoryLabel: string;
  narrativeGoal: string;
  audienceStartingBelief: string;
  audienceDesiredShift: string;
  selectedGrammarId: NarrativeGrammarId;
  grammarReason: string;
  alternateGrammarId: NarrativeGrammarId | null;
  grammarDeviationReason: string | null;
  beats: readonly NarrativeBeat[];
  tensionArc: NarrativeTensionCurve;
  proofArchitecture: ProofArchitecture;
  evidence: readonly NarrativeEvidenceObject[];
  interpretations: readonly NarrativeInterpretation[];
  tensionModel: TensionModel;
  culturalGlitch: CulturalGlitchMechanic | null;
  reframe: NarrativeTransformationReframe;
  transformation: NarrativeTransformationReframe;
  openLoop: OpenLoopArchitecture;
  nextNarrativeOpportunity: string;
  formatAdaptationNotes: string;
  formatAdaptations: readonly NarrativeFormatAdaptation[];
  founderStatus: NarrativeMomentumStatus;
  layerMode: NarrativeMomentumLayerMode;
  version: string;
  providerDispatchCount: 0;
  validationFlags: readonly NarrativeMomentumValidationFlag[];
  validationIssues: readonly NarrativeValidationIssue[];
  campaignHandoff: NarrativeMomentumCampaignHandoff;
  createdAt: string;
  updatedAt: string;
};

export type NarrativeMomentumCampaignHandoff = {
  narrativeGoal: string;
  selectedGrammarId: NarrativeGrammarId;
  openLoopSummary: string;
  continuationTarget: string;
  proofArchitectureSummary: string;
  audienceShift: string;
};

export type NarrativeMomentumValidationFlag =
  | 'GENERIC_FUNNEL_DRIFT'
  | 'CHEAP_OPEN_LOOP_BAIT'
  | 'FORCED_TRANSFORMATION'
  | 'NARRATIVE_REPETITION_WARNING'
  | 'TENSION_SEQUENCE_INCOHERENT'
  | 'PROOF_SOURCE_GAP';

export type NarrativeCampaignGraphEdge = {
  fromEntryId: string;
  toEntryId: string;
  relation: 'CONTINUES' | 'ANSWERS' | 'CONTRADICTS' | 'EXPANDS' | 'REFRAMES' | 'CALLS_BACK' | 'OPENS_LOOP_TO';
};

export type SelectNarrativeGrammarInput = {
  brandId: string;
  topic: string;
  creativeTerritoryLabel: string;
  contentObjective: string;
  audienceStartingBelief: string;
  desiredShift: string;
  availableProofTypes: readonly ProofType[];
  format: string;
  founderCreativeAppetite?: {
    risk: string;
    surprise: string;
    wit: string;
  };
  chapterArgumentLabels?: readonly string[];
};

export type SelectNarrativeGrammarResult = {
  selectedGrammar: NarrativeGrammarId;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  selectionReason: string;
  alternateGrammar: NarrativeGrammarId | null;
};

export type CompileNarrativeMomentumInput = {
  projectId: string;
  entryId: string;
  topic: string;
  creativeTerritoryId: string;
  creativeTerritoryLabel: string;
  brandId: string;
  contentObjective: string;
  audienceStartingBelief: string;
  audienceDesiredShift: string;
  availableProof: readonly ProofObject[];
  chapterMapping?: {
    claim: string;
    receipt: string;
    contradiction: string;
    lens: string;
    interjection: string;
    synthesis: string;
    premise?: string | null;
  };
  layerMode?: NarrativeMomentumLayerMode;
  priorPlans?: readonly NarrativeMomentumPlan[];
};
