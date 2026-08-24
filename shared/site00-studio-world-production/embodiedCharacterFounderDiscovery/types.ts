/**
 * P0.5E.4 — Generic Embodied Character Founder Discovery types.
 */

import type {
  CASTING_READINESS_STATES_P05E4,
  CHARACTER_TRUTH_CONFIDENCE_STATES,
  CULTURAL_KNOWLEDGE_LEVELS,
  DISCOVERY_DOMAIN_IDS,
  FLAW_CATEGORIES,
  FOUNDER_DISCOVERY_JUDGMENTS,
  FOUNDER_RECOGNITION_RESPONSES,
  HUMANITY_FAILURE_STATES,
  HUMOR_MECHANISMS,
  INTELLIGENCE_DIMENSIONS,
  RELATIONSHIP_CLASSES,
  STYLE_REASON_CATEGORIES,
  TRAIT_AUTHORITY_STATES,
  VISUAL_HYPOTHESIS_JUDGMENTS,
  VOICE_LAB_CHANNELS,
} from './constants.js';

export type TraitAuthorityState = (typeof TRAIT_AUTHORITY_STATES)[number];
export type CharacterTruthConfidenceState = (typeof CHARACTER_TRUTH_CONFIDENCE_STATES)[number];
export type DiscoveryDomainId = (typeof DISCOVERY_DOMAIN_IDS)[number];
export type FounderDiscoveryJudgment = (typeof FOUNDER_DISCOVERY_JUDGMENTS)[number];
export type FlawCategory = (typeof FLAW_CATEGORIES)[number];
export type IntelligenceDimension = (typeof INTELLIGENCE_DIMENSIONS)[number];
export type HumorMechanism = (typeof HUMOR_MECHANISMS)[number];
export type RelationshipClass = (typeof RELATIONSHIP_CLASSES)[number];
export type CulturalKnowledgeLevel = (typeof CULTURAL_KNOWLEDGE_LEVELS)[number];
export type VoiceLabChannel = (typeof VOICE_LAB_CHANNELS)[number];
export type VisualHypothesisJudgment = (typeof VISUAL_HYPOTHESIS_JUDGMENTS)[number];
export type StyleReasonCategory = (typeof STYLE_REASON_CATEGORIES)[number];
export type FounderRecognitionResponse = (typeof FOUNDER_RECOGNITION_RESPONSES)[number];
export type CastingReadinessStateP05E4 = (typeof CASTING_READINESS_STATES_P05E4)[number];
export type HumanityFailureState = (typeof HUMANITY_FAILURE_STATES)[number];

export type CharacterDiscoveryDomain = {
  domainId: DiscoveryDomainId;
  title: string;
  description: string;
  optional: true;
  unresolvedAllowed: true;
};

export type CharacterDiscoveryScenario = {
  scenarioId: string;
  domain: DiscoveryDomainId;
  situation: string;
  possibleResponses: string[];
  escapeOptions: readonly ['NONE_OF_THESE', 'SOMETHING_ELSE', 'IT_DEPENDS', 'I_DONT_KNOW_YET'];
  behavioralImplication: string;
  characterEvidence: string | null;
  founderResponse: string | null;
  founderJudgment: FounderDiscoveryJudgment | null;
  confidence: CharacterTruthConfidenceState;
  notes: string | null;
  followUpPotential: string | null;
};

export type FounderDiscoveryJudgmentRecord = {
  recordId: string;
  targetType: 'TRAIT' | 'SCENARIO' | 'CONTRADICTION' | 'FLAW' | 'VISUAL_HYPOTHESIS' | 'VOICE_SAMPLE' | 'STYLE';
  targetId: string;
  judgment: FounderDiscoveryJudgment;
  note: string;
  at: string;
};

export type CharacterContradiction = {
  contradictionId: string;
  traitA: string;
  traitB: string;
  whyBothAreTrue: string;
  whenAAppears: string;
  whenBAppears: string;
  doesSheRecognizeContradiction: boolean;
  doesSheFindItEmbarrassing: boolean;
  doesAnyoneCallHerOutOnIt: boolean;
  founderAuthority: TraitAuthorityState;
  confidence: CharacterTruthConfidenceState;
  genericAdjectivePair: false;
};

export type CharacterFlawEntry = {
  flawId: string;
  category: FlawCategory;
  description: string;
  founderAuthority: TraitAuthorityState;
  secretlyFlattering: boolean;
};

export type CharacterFlawProfile = {
  profileId: string;
  flaws: CharacterFlawEntry[];
  bestFriendWouldRoastHerFor: string[];
  knowsItsAnnoying: string[];
  doesNotRealizeAnnoying: string[];
  defendedBadHabit: string[];
  learnedMoreThanOnce: string[];
  procrastinates: string[];
  hypocriticalAreas: string[];
};

export type CharacterIntelligenceMap = {
  mapId: string;
  dimensions: Record<IntelligenceDimension, 'STRONG' | 'AVERAGE' | 'WEAK' | 'UNSET'>;
  embarrassinglyBadAt: string[];
  falseConfidenceAreas: string[];
  researchesInsteadOfPretending: string[];
  couldTalkForHours: string[];
  admitsNotKnowingEnough: string[];
};

export type CharacterHumorBehavior = {
  behaviorId: string;
  mechanisms: HumorMechanism[];
  whatMakesHerLaugh: string[];
  neverMakesThisJoke: string[];
  funnyIntentionally: boolean | null;
  funniestWhenSerious: boolean | null;
  laughsAtInappropriateMoments: boolean | null;
  absurdReaction: string | null;
  sarcasmLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNSET';
  canLaughAtSelf: boolean | null;
  nonverbalFirstHypothesis: true;
};

export type CharacterRelationshipModel = {
  modelId: string;
  classes: RelationshipClass[];
  firstScreenshotGoesTo: string | null;
  canTellHerShesWrong: string | null;
  alwaysAnswersCall: string | null;
  leavesOnRead: string | null;
  immediatelySuspiciousOf: string | null;
  embarrassingSoftSpotFor: string | null;
  whenSheLikesSomeone: string | null;
  whenMadButClaimsNot: string | null;
};

export type CulturalKnowledgeBoundary = {
  boundaryId: string;
  topic: string;
  level: CulturalKnowledgeLevel;
  researchNotPretendPhrase: string | null;
  fabricatedLivedExperience: false;
};

export type PublicPrivateCharacterDifference = {
  differenceId: string;
  strangersThink: string[];
  friendsKnow: string[];
  performsUnintentionally: string[];
  protects: string[];
  embarrassesHer: string[];
  sharesEasily: string[];
  refusesToShare: string[];
  changesWhenCameraOn: string | null;
  changesWhenCameraForgotten: string | null;
};

export type VoiceLabSample = {
  sampleId: string;
  underlyingThought: string;
  expressions: Partial<Record<VoiceLabChannel, string>>;
  judgments: Partial<Record<VoiceLabChannel, FounderDiscoveryJudgment>>;
};

export type VisualHypothesisReview = {
  hypothesisId: string;
  hypothesis: string;
  judgment: VisualHypothesisJudgment | null;
  note: string | null;
  identityAuthority: 'NONE';
  isCastingCanon: false;
};

export type CharacterStyleReasoning = {
  reasoningId: string;
  proposedBehavior: string;
  whyWouldSheWearThis: string;
  reasons: StyleReasonCategory[];
  costumeDisguisedAsPersonalStyle: false;
  limeUniformRequired: false;
};

export type BookRelationshipDiscovery = {
  discoveryId: string;
  whySheWritesThingsDown: string | null;
  whyNotTrustMemory: string | null;
  whenHabitStarted: string | null;
  bookmarksInsteadOfCommitting: string[];
  earnsDogEar: string[];
  makesHerFlipBack: string[];
  hatesErrata: string[];
  bookProvedHerWrong: boolean | null;
  resistsAddingBecauseImplies: string | null;
  revisitsAndCringes: boolean | null;
  attachedToPhysicalPages: boolean | null;
  refusesToRemove: string[];
};

export type CharacterDiscoveryLedgerEntry = {
  entryId: string;
  proposal: string;
  source: TraitAuthorityState;
  founderJudgment: FounderDiscoveryJudgment | null;
  founderRevision: string | null;
  currentStatement: string;
  at: string;
  authority: TraitAuthorityState;
  confidence: CharacterTruthConfidenceState;
  contradictionsCreated: string[];
  domainsAffected: DiscoveryDomainId[];
  downstreamImplications: string[];
  priorEntryId: string | null;
};

export type CharacterTruthConfidence = {
  traitId: string;
  statement: string;
  confidence: CharacterTruthConfidenceState;
  locked: boolean;
};

export type AuditedTrait = {
  traitId: string;
  category: string;
  statement: string;
  authority: TraitAuthorityState;
  confidence: CharacterTruthConfidenceState;
};

export type CharacterForensicAudit = {
  auditId: string;
  auditedAt: string;
  totalSeededTraits: number;
  founderConfirmedTraits: number;
  unresolvedTraits: number;
  contradictionsRequiringDiscovery: number;
  visualHypothesesAwaitingConfirmation: number;
  startingCastingReadiness: CastingReadinessStateP05E4;
  traits: AuditedTrait[];
};

export type ExtendedHumanityEvaluation = {
  evaluationId: string;
  contradictionDepth: boolean;
  nonFlatteringFlaws: boolean;
  unevenIntelligence: boolean;
  privateHumanity: boolean;
  socialRelationships: boolean;
  culturalBoundaries: boolean;
  emotionalVariability: boolean;
  behavioralSpecificity: boolean;
  humorSpecificity: boolean;
  publicPrivateDifference: boolean;
  capacityToBeWrong: boolean;
  capacityToChange: boolean;
  capacityToSurprise: boolean;
  lifeOutsideBrand: boolean;
  founderCloneRisk: boolean;
  mascotRisk: boolean;
  influencerRisk: boolean;
  archetypeRisk: boolean;
  passes: boolean;
  failures: HumanityFailureState[];
};

export type CharacterSynthesisPreview = {
  previewId: string;
  whoSheIs: string;
  whatSheWants: string;
  whatSheFears: string;
  whatShesGoodAt: string;
  whatShesBadAt: string;
  whatSheGetsWrong: string;
  whatMakesHerFunny: string;
  whatMakesHerAnnoying: string;
  whatSheLoves: string;
  whatSheHides: string;
  whatFriendsKnow: string;
  whatStrangersAssume: string;
  whenWrong: string;
  whenCurious: string;
  whenBored: string;
  whenHurt: string;
  whenRight: string;
  bookMeaning: string;
  howSheSounds: string;
  howSheMoves: string;
  howSheOccupiesRoom: string;
  stillDontKnow: string[];
  readsLikeBrandDeck: boolean;
  generatedAt: string;
};

export type FounderCharacterRecognitionEvaluation = {
  evaluationId: string;
  response: FounderRecognitionResponse | null;
  note: string | null;
  evaluatedAt: string | null;
  inferred: false;
};

export type CharacterCastingReadinessEvaluation = {
  evaluationId: string;
  state: CastingReadinessStateP05E4;
  founderDiscoveryComplete: boolean;
  contradictionsConfirmed: boolean;
  realFlawsConfirmed: boolean;
  intelligenceUnevennessEstablished: boolean;
  privateHumanityEstablished: boolean;
  voiceDifferentiationEstablished: boolean;
  bookRelationshipEstablished: boolean;
  culturalBoundaryEstablished: boolean;
  visualHypothesesReviewed: boolean;
  humanityEvaluationPass: boolean;
  founderKnowsHer: boolean;
  readyForCharacterSynthesis: boolean;
  readyForCastingExploration: false;
  blockingGates: string[];
};

export type EmbodiedCharacterFounderDiscoverySystem = {
  systemId: string;
  version: string;
  brandId: string;
  falRequired: false;
  characterGenerationPerformed: false;
  finalFaceSelected: false;
  visualDesignFinalized: false;
};

export type EmbodiedCharacterFounderDiscoveryRun = {
  runId: string;
  projectId: string;
  system: EmbodiedCharacterFounderDiscoverySystem;
  forensicReport: CharacterForensicAudit;
  domains: CharacterDiscoveryDomain[];
  scenarios: CharacterDiscoveryScenario[];
  ledger: CharacterDiscoveryLedgerEntry[];
  contradictions: CharacterContradiction[];
  flawProfile: CharacterFlawProfile;
  intelligenceMap: CharacterIntelligenceMap;
  humorBehavior: CharacterHumorBehavior;
  relationships: CharacterRelationshipModel;
  culturalBoundaries: CulturalKnowledgeBoundary[];
  publicPrivate: PublicPrivateCharacterDifference;
  voiceLabSamples: VoiceLabSample[];
  visualHypothesisReviews: VisualHypothesisReview[];
  styleReasonings: CharacterStyleReasoning[];
  bookDiscovery: BookRelationshipDiscovery;
  truthConfidence: CharacterTruthConfidence[];
  humanityEvaluation: ExtendedHumanityEvaluation;
  synthesisPreview: CharacterSynthesisPreview | null;
  founderRecognition: FounderCharacterRecognitionEvaluation;
  castingReadiness: CharacterCastingReadinessEvaluation;
  founderJudgments: FounderDiscoveryJudgmentRecord[];
  anthropicRequests: number;
  falRequests: 0;
  updatedAt: string;
};
