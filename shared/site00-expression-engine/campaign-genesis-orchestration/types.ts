/**
 * P0.CGO.1 — Campaign World Genesis + Creative Direction Orchestration types.
 */

import type { CampaignObjective, CampaignStrategyType } from '../campaign-strategy-language/types.js';

export const P0_CGO_1_BUILD = 'v273' as const;
export { P0_CGO_2_BUILD } from './conceptualEfficiencyTypes.js';

export type AssociativeDistance = 'LITERAL' | 'ADJACENT' | 'LATERAL' | 'UNEXPECTED' | 'ABSURD';

export type AssociationDomain =
  | 'PRODUCT'
  | 'BODY_RELATIONSHIP'
  | 'HUMAN_GESTURE'
  | 'HUMAN_BEHAVIOR'
  | 'RITUAL'
  | 'SOCIAL_SITUATION'
  | 'OBJECT'
  | 'PROP'
  | 'ENVIRONMENT'
  | 'OCCUPATION'
  | 'GAME'
  | 'COMPETITION'
  | 'RISK'
  | 'REWARD'
  | 'IDIOM'
  | 'PHRASE'
  | 'LANGUAGE'
  | 'NUMBER'
  | 'GEOMETRY'
  | 'SHAPE'
  | 'COLOR'
  | 'MATERIAL'
  | 'TEXTURE'
  | 'SOUND'
  | 'MOTION'
  | 'ERA'
  | 'CULTURAL_REFERENCE'
  | 'MEMORY'
  | 'STATUS'
  | 'DESIRE'
  | 'TENSION'
  | 'CONTRADICTION'
  | 'HUMOR'
  | 'SYMBOL'
  | 'METAPHOR'
  | 'TRANSFORMATION';

export type AssociationChainLink = {
  domain: AssociationDomain;
  term: string;
  distance: AssociativeDistance;
  rationale: string;
};

export type AssociationChain = {
  chainId: string;
  links: AssociationChainLink[];
  connectiveLogic: string;
};

export type ConvergenceDimension =
  | 'SETTING'
  | 'TITLE'
  | 'COPY'
  | 'PROP_SYSTEM'
  | 'PRODUCT_ROLE'
  | 'BODY_INTERACTION'
  | 'HUMAN_BEHAVIOR'
  | 'WARDROBE'
  | 'NAILS'
  | 'HAIR'
  | 'MAKEUP'
  | 'GRAPHIC_LANGUAGE'
  | 'COLOR'
  | 'MOTION'
  | 'SHOT_VARIETY'
  | 'TEASER_POTENTIAL'
  | 'REVEAL_POTENTIAL'
  | 'CHANNEL_ADAPTATION';

export type ConceptualConvergenceMap = {
  centralIdea: string;
  dimensions: Partial<Record<ConvergenceDimension, string>>;
  convergenceCount: number;
};

export type ConceptualYieldScore = {
  overall: number;
  dimensionsCovered: ConvergenceDimension[];
  dimensionCount: number;
  classification: 'HIGH_YIELD' | 'MEDIUM_YIELD' | 'LOW_CONCEPTUAL_YIELD';
};

export type HumanExpressionLayer = {
  hair: string[];
  nails: string[];
  makeup: string[];
  jewelry: string[];
  wardrobe: string[];
  hands: string[];
  bodyLanguage: string[];
  gesture: string[];
  movement: string[];
  attitude: string[];
};

export type ProductBodyRelationship = {
  productCategory: ProductCategory;
  bodySurfaces: string[];
  interactionModes: string[];
  ritualContexts: string[];
};

export type ProductCategory = 'JEWELRY' | 'HAIR' | 'FRAGRANCE' | 'FASHION' | 'GENERAL';

export type WorldCandidateTier = 'SAFE' | 'FRESH' | 'WILD_CARD';

export type CampaignWorldCandidate = {
  candidateId: string;
  tier: WorldCandidateTier;
  coreConcept: string;
  campaignTitleLanguage: string;
  setting: string;
  associationChain: AssociationChain;
  convergenceMap: ConceptualConvergenceMap;
  conceptualYield: ConceptualYieldScore;
  brandFit: number;
  originality: number;
  humanExpression: HumanExpressionLayer;
  productIntegration: string[];
  motifs: string[];
  copyLanguage: string[];
  propSystem: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPERIMENTAL';
  whyItWorks: string;
  isForensicBenchmark?: boolean;
  /** P0.CGO.2 — interaction + efficiency enrichment */
  efficiencyEnrichment?: import('./conceptualEfficiencyTypes.js').ConceptualEfficiencyEnrichment;
};

export type CampaignWorldBible = {
  worldId: string;
  campaignId: string;
  brandId: string;
  /** P0.CBI.1 — lineage to brand truth version */
  brandContextVersion?: number;
  conceptThesis: string;
  associationChain: AssociationChain;
  campaignTitleLanguage: string;
  setting: string;
  environmentRole: string;
  productRole: string;
  humanRole: string;
  humanExpressionRules: HumanExpressionLayer;
  motifs: string[];
  propSystem: string[];
  stylingDirection: string;
  hairDirection: string;
  nailDirection: string;
  makeupDirection: string;
  wardrobeDirection: string;
  graphicLanguage: string;
  colorLogic: string;
  materialLogic: string;
  motionLogic: string;
  copyBehavior: string;
  revealStrategy: string;
  sequenceGrammar: string[];
  nonNegotiables: string[];
  avoidances: string[];
  approvedAt: string | null;
  approvalStage: FounderApprovalStage;
};

export type CampaignExecutionBible = {
  executionBibleId: string;
  worldId: string;
  conceptThesis: string;
  worldRules: string[];
  visualGrammar: string[];
  environmentRules: string[];
  productIntegrationRules: string[];
  humanExpressionRules: string[];
  motifRules: string[];
  stylingRules: string[];
  propRules: string[];
  shotFamilies: CampaignShotFamily[];
  sequenceRules: string[];
  motionGrammar: string[];
  copyRules: string[];
  channelRules: string[];
  continuityRules: string[];
  requiredSurprises: string[];
  antiGenericRules: string[];
  nonNegotiables: string[];
  qaThresholds: { conceptFidelityMin: number; visualQualityMin: number };
};

export type CampaignShotFamily =
  | 'WORLD'
  | 'ESTABLISHING'
  | 'OBJECT'
  | 'DETAIL'
  | 'PRODUCT'
  | 'HANDS'
  | 'BEAUTY'
  | 'FULL_BODY'
  | 'MOTION'
  | 'INTERACTION'
  | 'REFLECTION'
  | 'TEXTURE'
  | 'BEHIND_THE_SCENES'
  | 'CLUE'
  | 'REVEAL'
  | 'PAYOFF'
  | 'CALLBACK'
  | 'OUTTAKE'
  | 'TRANSITION'
  | 'SINGLE_SHOT_CONCEPT';

export type ShotRequirement = 'REQUIRED' | 'OPTIONAL' | 'EXPERIMENTAL';

export type CampaignShotRole = {
  shotId: string;
  role: CampaignShotFamily;
  purpose: string;
  narrativeBeat: string;
  productProminence: 'LOW' | 'MEDIUM' | 'HIGH';
  humanProminence: 'LOW' | 'MEDIUM' | 'HIGH';
  environmentProminence: 'LOW' | 'MEDIUM' | 'HIGH';
  motifsRequired: string[];
  motifsOptional: string[];
  cameraDistance: 'WIDE' | 'MEDIUM' | 'CLOSE' | 'MACRO';
  cameraBehavior: string;
  compositionRule: string;
  behaviorRule: string;
  avoidances: string[];
  sequencePosition: number;
  requirement: ShotRequirement;
};

export type CampaignContentSequenceItem = {
  sequenceIndex: number;
  channel: string;
  shotRole: CampaignShotFamily;
  storyBeat: string;
  assetType: string;
  copyRole: string;
  revealLevel: 'NONE' | 'PARTIAL' | 'FULL';
  dependency: string | null;
  continuityNotes: string;
};

export type CreativeTaskType =
  | 'WORLD_APPROVAL'
  | 'LOCATION'
  | 'PROP_SYSTEM'
  | 'WARDROBE'
  | 'HAIR'
  | 'NAILS'
  | 'MAKEUP'
  | 'CASTING'
  | 'SHOT_LIST'
  | 'KEYFRAME'
  | 'MOTION'
  | 'COPY'
  | 'EDIT'
  | 'SEQUENCE'
  | 'CHANNEL_ADAPTATION'
  | 'QA'
  | 'REVISION'
  | 'FINAL';

export type CreativeTaskNode = {
  taskId: string;
  taskType: CreativeTaskType;
  label: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'BLOCKED';
  dependsOn: string[];
};

export type CreativeNextBestAction = {
  action: string;
  actionType: CreativeTaskType;
  reason: string;
  screen: DirectorWizardStep;
};

export type DirectorWizardStep =
  | 'world'
  | 'look'
  | 'styling'
  | 'shots'
  | 'sequence'
  | 'production'
  | 'review';

export type FounderApprovalStage =
  | 'WORLD'
  | 'LOOK'
  | 'STYLING'
  | 'SHOT_SYSTEM'
  | 'KEY_VISUALS'
  | 'SEQUENCE'
  | 'FINAL'
  | 'NONE';

export type FidelityDimension =
  | 'CONCEPT_VISIBILITY'
  | 'WORLD_INTEGRATION'
  | 'MOTIF_INTELLIGENCE'
  | 'HUMAN_SPECIFICITY'
  | 'PRODUCT_INTEGRATION'
  | 'BEHAVIOR'
  | 'SHOT_ORIGINALITY'
  | 'SEQUENCE_CONTRIBUTION'
  | 'VISUAL_SURPRISE'
  | 'STYLING_COHERENCE'
  | 'ANTI_GENERIC_QUALITY';

export type ConceptToExecutionFidelityScore = {
  overall: number;
  visualQuality: number;
  conceptFidelity: number;
  perDimension: Partial<Record<FidelityDimension, number>>;
  pass: boolean;
  beautifulButGeneric: boolean;
};

export type ConceptDriftDiagnosis = {
  conceptSummary: string;
  executionSummary: string;
  issues: string[];
  behaviorRemoved: boolean;
  environmentBackdropOnly: boolean;
  productOverStaged: boolean;
  motifUnderused: boolean;
};

export type MotifPropagationMap = {
  motif: string;
  appearances: Partial<Record<'PROP' | 'HUMAN_STYLING' | 'GRAPHIC' | 'COPY' | 'MOVEMENT' | 'ENVIRONMENT' | 'PRODUCT', string>>;
  evolutionModes: ('REPEAT' | 'TRANSFORM' | 'ABSTRACT' | 'HIDE' | 'REVEAL')[];
};

export type LocationStoryPotential = {
  location: string;
  shotVariety: number;
  humanAction: number;
  productIntegration: number;
  motifOpportunities: number;
  lightTexture: number;
  productionEfficiency: number;
  narrativeRange: number;
  overall: number;
};

export type CampaignCoverageCell = {
  shotRole: CampaignShotFamily;
  channel: string;
  status: 'PLANNED' | 'PRODUCED' | 'APPROVED' | 'MISSING';
};

export type WorldGenesisInput = {
  brandSlug: string;
  productCategory: ProductCategory;
  productName?: string;
  objective: CampaignObjective;
  strategyHint?: CampaignStrategyType;
  /** P0.CBI.1 */
  brandContext?: import('../../site00-brand-lore/brandCreativeContext/types.js').BrandCreativeContext | null;
  skipGenerationGate?: boolean;
};

export type WorldGenesisResult = {
  brandSlug: string;
  candidates: CampaignWorldCandidate[];
  safe: CampaignWorldCandidate | null;
  fresh: CampaignWorldCandidate | null;
  wildCard: CampaignWorldCandidate | null;
  weakBenchmark: CampaignWorldCandidate | null;
};

export type CompiledProductionDirection = {
  promptSummary: string;
  shotRole: CampaignShotFamily;
  worldRules: string[];
  humanExpression: string[];
  productRole: string;
  motifs: string[];
  cameraBehavior: string;
  composition: string;
  antiGenericRules: string[];
  doNot: string[];
};

export type AssetReviewInput = {
  assetDescription: string;
  visualQualityScore: number;
  shotRole: CampaignShotFamily;
  worldBible: CampaignWorldBible;
  executionBible: CampaignExecutionBible;
};

export type ExecutionWitScore = {
  lateralConnection: number;
  visualPayoff: number;
  motifUsage: number;
  humanIntegration: number;
  surprise: number;
  nonObviousness: number;
  coherence: number;
  overall: number;
};

export type RevisionDirection = {
  summary: string;
  specificDirections: string[];
  preserve: string[];
  reduce: string[];
  introduce: string[];
};
