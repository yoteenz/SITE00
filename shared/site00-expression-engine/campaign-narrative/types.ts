/**
 * C1.3 — Generic marketing campaign narrative contracts (brand-agnostic).
 * NDXBOOK Entry is one subtype of CampaignContentUnit.
 */

export const CAMPAIGN_NARRATIVE_VERSION = '1.3.0' as const;

export const CAMPAIGN_CONTENT_UNIT_FUNCTIONS = [
  'OPENING_PROVOCATION',
  'FIRST_RECEIPT',
  'ESCALATION',
  'REVERSAL',
  'DEEPENING',
  'COUNTEREXAMPLE',
  'MIRROR',
  'PAYOFF',
  'FALSE_RESOLUTION',
  'AFTERSHOCK',
  'BRIDGE',
  'CHAPTER_CLIMAX',
  'CHAPTER_EXIT',
  'HERO',
  'PROOF',
  'EMOTIONAL',
  'CONVERSION',
  'TEASE',
] as const;
export type CampaignContentUnitFunction = (typeof CAMPAIGN_CONTENT_UNIT_FUNCTIONS)[number];

export const CAMPAIGN_HANDOFF_TYPES = [
  'OBJECT_CONTINUATION',
  'DEVICE_CONTINUATION',
  'MATCH_CUT',
  'SOUND_BRIDGE',
  'QUESTION_BRIDGE',
  'VISUAL_MOTIF',
  'TEXT_INTERRUPT',
  'NOTIFICATION',
  'TRANSMISSION',
  'ENVIRONMENTAL_CONTINUATION',
  'CHARACTER_CONTINUATION',
  'FALSE_ENDING',
  'HARD_CONTRAST',
  'ARTIFACT_BRIDGE',
] as const;
export type CampaignHandoffType = (typeof CAMPAIGN_HANDOFF_TYPES)[number];

export const ARTIFACT_LINEAGE_ACTIONS = [
  'CONTINUE',
  'TRANSFORM',
  'HAND_OFF',
  'BREAK',
  'DISAPPEAR',
  'BE_REPLACED',
  'BECOME_A_CLUE',
  'BECOME_A_CONTRADICTION',
  'BECOME_A_RED_HERRING',
] as const;
export type ArtifactLineageAction = (typeof ARTIFACT_LINEAGE_ACTIONS)[number];

export const CAMPAIGN_COHESION_FAILURE_CLASSES = [
  'ISOLATED_CONTENT_UNITS',
  'WEAK_HANDOFF',
  'REPEATED_ARTIFACT',
  'REPEATED_WORLD_MECHANISM',
  'NO_ESCALATION',
  'FLAT_CAMPAIGN_RHYTHM',
  'TEASER_WITHOUT_PAYOFF',
  'PAYOFF_WITHOUT_SETUP',
  'FORMAT_DRIVING_STORY_TOO_EARLY',
  'CHAPTER_REPETITION',
  'MOTIF_REUSE_WITHOUT_EVOLUTION',
  'SERIES_FEELS_DISCONNECTED',
  'CAMPAIGN_HAS_NO_DESTINATION',
  'ARTIFACT_BRIDGE_CONFUSED_WITH_REUSE',
] as const;
export type CampaignCohesionFailureClass = (typeof CAMPAIGN_COHESION_FAILURE_CLASSES)[number];

export type CampaignContentUnit = {
  unitId: string;
  sequenceNumber: number;
  title: string;
  subject: string;
  unitFunction: CampaignContentUnitFunction;
  coreQuestion: string;
  contradiction: string;
  world: string;
  artifact: string;
  endingLogic: string;
  formatHint?: string;
  nonCanon?: boolean;
};

export type CampaignHandoffPlan = {
  fromUnitId: string;
  toUnitId: string;
  handoffType: CampaignHandoffType;
  handoffObject: string;
  handoffImage: string;
  handoffSound: string;
  handoffQuestion: string;
  handoffAction: string;
  handoffLine: string;
  continuityStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  narrativeNecessity: 'OPTIONAL' | 'RECOMMENDED' | 'REQUIRED';
  reuseRisk: 'LOW' | 'MODERATE' | 'HIGH';
  whyItWorks: string;
  artifactBridgeNotReuse: boolean;
};

export type CampaignMotifRecord = {
  motif: string;
  firstUsedInUnitId: string;
  meaningAtIntroduction: string;
  evolutionNotes: string;
  status: 'AVAILABLE' | 'USED' | 'REPEATED' | 'RETIRED' | 'EVOLVED';
};

export type CampaignMotifSystem = {
  motifsUsed: string[];
  motifsRepeated: string[];
  motifsRetired: string[];
  motifsAvailable: string[];
  motifRecords: CampaignMotifRecord[];
  repetitionRiskNotes: string[];
};

export type CampaignEscalationPlan = {
  escalationModel: string;
  stakesProgression: string[];
  personalToSystemic: boolean;
  discomfortCurve: string;
  whatEachUnitMustAdd: Record<string, string>;
  repetitionGuard: string;
};

export type CampaignCreativeRhythm = {
  tempoByUnit: Record<string, string>;
  densityByUnit: Record<string, string>;
  humorByUnit: Record<string, string>;
  darknessByUnit: Record<string, string>;
  visualScaleByUnit: Record<string, string>;
  intimacyByUnit: Record<string, string>;
  protagonistVisibilityByUnit: Record<string, string>;
  artifactScaleByUnit: Record<string, string>;
  endingTypeByUnit: Record<string, string>;
  rhythmDiagnosis: string;
};

export type CampaignArtifactLineageEntry = {
  unitId: string;
  artifact: string;
  action: ArtifactLineageAction;
  bridgesToNext: boolean;
  primaryArtifactOfUnit: boolean;
  rationale: string;
};

export type CampaignArtifactLineage = {
  entries: CampaignArtifactLineageEntry[];
  bridgeRule: 'ARTIFACT_BRIDGE ≠ ARTIFACT_REUSE';
  notes: string;
};

export type CampaignTeaseSeed = {
  seedType: 'QUESTION' | 'OBJECT' | 'INTERRUPTION' | 'IMAGE' | 'CONTRADICTION' | 'LINE';
  seedObject: string;
  seedQuestion: string;
  seedVisual: string;
  seedLine: string;
  whyItExtendsCampaign: string;
  constraints: string[];
  nonCanon: true;
  targetUnitId?: string;
};

export type CampaignUnitRole = {
  unitId: string;
  sequenceNumber: number;
  unitFunction: CampaignContentUnitFunction;
  whatItInherits: string;
  whatItEscalates: string;
  whatItContradicts: string;
  whatItIntroduces: string;
  whatItResolves: string;
  whatItLeavesOpen: string;
  handoffIn: string;
  handoffOut: string;
  teaserToNext: string;
  artifactCarryover: string;
  motifCarryover: string;
  questionCarryover: string;
  emotionalCarryover: string;
  visualContinuityRules: string[];
  differenceFromPrevious: string;
  differenceFromNextCandidate: string;
};

export type CampaignContentSequence = {
  campaignId: string;
  units: CampaignContentUnit[];
  unitRoles: CampaignUnitRole[];
  handoffs: CampaignHandoffPlan[];
  teaseSeeds: CampaignTeaseSeed[];
  version: string;
};

export type CampaignNarrativeArc = {
  arcId: string;
  campaignId: string;
  brandId: string;
  campaignThesis: string;
  audienceJourney: string[];
  heroMoments: string[];
  escalation: CampaignEscalationPlan;
  motifSystem: CampaignMotifSystem;
  artifactLineage: CampaignArtifactLineage;
  rhythm: CampaignCreativeRhythm;
  sequence: CampaignContentSequence;
  campaignEnding: string;
  formatPlanNotes: string;
  version: string;
};

export type CampaignNarrativeCohesionQA = {
  qaId: string;
  campaignId: string;
  domains: {
    sequenceLogic: { pass: boolean; note: string };
    handoffStrength: { pass: boolean; note: string };
    motifEvolution: { pass: boolean; note: string };
    repetitionRisk: { pass: boolean; note: string };
    escalation: { pass: boolean; note: string };
    emotionalRhythm: { pass: boolean; note: string };
    worldDifferentiation: { pass: boolean; note: string };
    artifactDifferentiation: { pass: boolean; note: string };
    unitPurposeClarity: { pass: boolean; note: string };
    formatAppropriateness: { pass: boolean; note: string };
    payoffIntegrity: { pass: boolean; note: string };
    campaignEndingStrength: { pass: boolean; note: string };
  };
  failureClasses: CampaignCohesionFailureClass[];
  overallPass: boolean;
};

export type MarketingPackageMasterDirectorOutput = {
  directorId: string;
  campaignThesis: string;
  audienceJourney: string[];
  contentSequence: CampaignContentSequence;
  unitRoles: CampaignUnitRole[];
  heroMoments: string[];
  handoffs: CampaignHandoffPlan[];
  callbacks: string[];
  escalation: CampaignEscalationPlan;
  motifs: CampaignMotifSystem;
  artifactLineage: CampaignArtifactLineage;
  formatPlan: string;
  payoff: string;
  campaignEnding: string;
  cohesionQA: CampaignNarrativeCohesionQA;
  /** C1.4 — pipeline stack including Senior Creative Judgment layer */
  creativePipelineStack: string[];
  version: string;
};
