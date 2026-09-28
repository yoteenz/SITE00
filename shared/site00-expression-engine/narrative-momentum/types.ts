/**
 * P0.NDX.NARRATIVE-MOMENTUM-ENGINE1 — story architecture between territory and format execution.
 */

export const NARRATIVE_MOMENTUM_ENGINE_VERSION = '1.0.0' as const;

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
  grammarBeatId: string;
  shotFunction: ShotFunction;
  tensionStage: TensionCurveStage;
  whatAudienceKnows: string;
  whatAudienceDoesNotKnow: string;
  whatAudienceWantsToKnow: string;
  whatChangesInThisBeat: string;
  proofIds: readonly string[];
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
  | 'NARRATIVE_REPETITION_WARNING';

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
