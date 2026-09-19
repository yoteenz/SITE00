/**
 * P0.5E.3 — Generic Embodied Brand Character Discovery types.
 */

import type {
  ARCHETYPE_COLLAPSE_FAILURES,
  BEAUTY_ROLE_FAILURES,
  CAMERA_RELATIONSHIP_MODES,
  CASTING_READINESS_STATES,
  DISCOVERY_ROUNDS,
  FOUNDER_CHARACTER_JUDGMENTS,
  IDENTITY_AUTHORITY_LEVELS,
  VISUAL_AUTHORITY_LEVELS,
} from './constants.js';

export type DiscoveryRound = (typeof DISCOVERY_ROUNDS)[number];
export type VisualAuthorityLevel = (typeof VISUAL_AUTHORITY_LEVELS)[number];
export type IdentityAuthorityLevel = (typeof IDENTITY_AUTHORITY_LEVELS)[number];
export type CastingReadinessState = (typeof CASTING_READINESS_STATES)[number];
export type FounderCharacterJudgment = (typeof FOUNDER_CHARACTER_JUDGMENTS)[number];
export type ArchetypeCollapseFailure = (typeof ARCHETYPE_COLLAPSE_FAILURES)[number];
export type BeautyRoleFailure = (typeof BEAUTY_ROLE_FAILURES)[number];
export type CameraRelationshipMode = (typeof CAMERA_RELATIONSHIP_MODES)[number];

export type FounderEmbodiedCharacterVisualPreferenceEvidence = {
  evidenceId: string;
  referenceBoardId: string;
  selectionIds: string[];
  founderRawSelection: string;
  observedCommonalities: string[];
  possibleInterpretations: string[];
  uncertainties: string[];
  visualAuthority: VisualAuthorityLevel;
  identityAuthority: IdentityAuthorityLevel;
  visualTendencyHypotheses: string[];
  isFinalCasting: false;
  isFinalFace: false;
  isCharacterCanon: false;
  isGenerationReference: false;
};

export type EmbodiedCharacterPsychology = {
  psychologyId: string;
  whatSheNotices: string[];
  whatSheIgnores: string[];
  whatBothersHer: string[];
  whatDelightsHer: string[];
  attentionBiases: string[];
  curiosityTriggers: string[];
  skepticismTriggers: string[];
  emotionalTriggers: string[];
  petPeeves: string[];
  insecurities: string[];
  confidenceSources: string[];
  avoidancePatterns: string[];
  decisionStyle: string;
  conflictStyle: string;
  selfCorrectionBehavior: string;
  memoryBehavior: string;
  obsessionBehavior: string;
  uncertaintyBehavior: string;
};

export type EmbodiedCharacterIntelligenceProfile = {
  profileId: string;
  strongestIntelligences: string[];
  averageIntelligences: string[];
  blindSpots: string[];
  falseConfidenceAreas: string[];
  thingsSheLearnsSlowly: string[];
  thingsSheLearnsQuickly: string[];
  behavioralExpression: string;
};

export type EmbodiedCharacterContradictionSystem = {
  systemId: string;
  majorContradictions: string[];
  minorContradictions: string[];
  recurringBlindSpots: string[];
  behaviorsSheRegrets: string[];
  traitOthersFindAnnoying: string;
  embarrassedLikes: string;
  pretendsNotToCare: string;
};

export type EmbodiedCharacterHumorSystem = {
  systemId: string;
  whatMakesHerLaugh: string[];
  whatSheFindsCorny: string[];
  nonverbalHumorBehaviors: string[];
  thingsSheWouldNeverJokeAbout: string[];
};

export type EmbodiedCharacterEmotionalRange = {
  rangeId: string;
  supportedStates: string[];
  microReaction: string[];
  fullReaction: string[];
  privateReaction: string[];
  cameraAwareReaction: string[];
  cameraForgottenReaction: string[];
};

export type EmbodiedCharacterVoiceSystem = {
  voiceId: string;
  innerVoice: string;
  spokenVoice: string;
  marginVoice: string;
  pageVoice: string;
  captionVoice: string;
  sentenceRhythm: string;
  swearingBoundary: string;
};

export type EmbodiedCharacterEverydayLife = {
  lifeId: string;
  morningHabits: string[];
  lateNightHabits: string[];
  phoneBehavior: string;
  procrastination: string;
  guiltyPleasures: string[];
  thingsSheAlwaysCarries: string[];
};

export type EmbodiedCharacterBookRelationship = {
  relationshipId: string;
  whySheKeepsIt: string[];
  termMeanings: Record<string, string>;
  behaviorsFeelNatural: string[];
};

export type EmbodiedCharacterPhysicalBehaviorBible = {
  bibleId: string;
  researchBehaviors: string[];
  idleBehavior: string;
  thinkingBehavior: string;
  frustratedBehavior: string;
  excitedBehavior: string;
  skepticalBehavior: string;
  cameraAwareBehavior: string;
  cameraUnawareBehavior: string;
};

export type EmbodiedCharacterCameraRelationship = {
  relationshipId: string;
  modes: CameraRelationshipMode[];
  whenSheTalksToUs: string;
  whenWeObserveHer: string;
  whenSheForgetsCamera: string;
};

export type EmbodiedCharacterStyleHypothesis = {
  hypothesisId: string;
  hairRange: string[];
  styleRanges: string[];
  limeAccentBehavior: string;
  confirmedVsHypothetical: { confirmed: string[]; hypothetical: string[] };
  uniformCollapseBlocked: true;
};

export type CulturalLifeFoundation = {
  foundationId: string;
  generationalContext: string;
  geographicInfluences: string[];
  culturalReferenceFluency: string[];
  culturalBlindSpots: string[];
  thingsSheResearchesInsteadOfPretending: string[];
  codeSwitchingBehavior: string;
  culturallyNeutral: boolean;
};

export type CharacterScenarioTest = {
  testId: string;
  scenario: string;
  thought: string;
  spokenReaction: string;
  physicalReaction: string;
  primaryArtifactBehavior: string;
  platformExpression: string;
  whatSheWouldNotDo: string;
};

export type EmbodiedCharacterHumanityEvaluation = {
  evaluationId: string;
  psychologicalCoherence: number;
  contradictionPresent: boolean;
  emotionalRangeAdequate: boolean;
  imperfectionPresent: boolean;
  existedBeforeCamera: boolean;
  passes: boolean;
  failureReason: string | null;
};

export type EmbodiedCharacterCastingReadiness = {
  readinessId: string;
  state: CastingReadinessState;
  psychologyComplete: boolean;
  contradictionsComplete: boolean;
  voiceComplete: boolean;
  bookRelationshipComplete: boolean;
  behaviorComplete: boolean;
  cameraComplete: boolean;
  styleImplicationsPresent: boolean;
  castingCandidatesMustShareOneCharacter: true;
  finalFaceSelected: false;
  generationPerformed: false;
};

export type EmbodiedCharacterSynthesis = {
  synthesisId: string;
  characterEssence: string;
  psychologicalLogic: string;
  knownUnknowns: string[];
  visualImplications: string[];
  synthesizedAt: string | null;
  founderTriggered: boolean;
};

export type DiscoveryInterviewRound = {
  round: DiscoveryRound;
  title: string;
  prompts: string[];
  founderAnswer: string | null;
  founderRawWording: string | null;
  completedAt: string | null;
};

export type EmbodiedBrandCharacterDiscoverySystem = {
  systemId: string;
  version: string;
  brandId: string;
  distinctFromFounder: true;
  distinctFromBrandCharacter: true;
  brandCharacterInheritance: 'SELECTED_PSYCHOLOGICAL_INHERITANCE';
  visualDesignFinalized: false;
  finalFaceSelected: false;
  characterGenerationPerformed: false;
  falRequired: false;
};

export type EmbodiedCharacterDiscoveryRun = {
  runId: string;
  projectId: string;
  system: EmbodiedBrandCharacterDiscoverySystem;
  visualEvidence: FounderEmbodiedCharacterVisualPreferenceEvidence[];
  psychology: EmbodiedCharacterPsychology;
  intelligence: EmbodiedCharacterIntelligenceProfile;
  contradictions: EmbodiedCharacterContradictionSystem;
  humor: EmbodiedCharacterHumorSystem;
  emotionalRange: EmbodiedCharacterEmotionalRange;
  voice: EmbodiedCharacterVoiceSystem;
  everydayLife: EmbodiedCharacterEverydayLife;
  bookRelationship: EmbodiedCharacterBookRelationship;
  physicalBehavior: EmbodiedCharacterPhysicalBehaviorBible;
  cameraRelationship: EmbodiedCharacterCameraRelationship;
  styleHypothesis: EmbodiedCharacterStyleHypothesis;
  culturalLife: CulturalLifeFoundation;
  scenarioTests: CharacterScenarioTest[];
  humanityEvaluation: EmbodiedCharacterHumanityEvaluation;
  castingReadiness: EmbodiedCharacterCastingReadiness;
  synthesis: EmbodiedCharacterSynthesis | null;
  interviewRounds: DiscoveryInterviewRound[];
  founderJudgments: { judgment: FounderCharacterJudgment; dimension: string; note: string; at: string }[];
  anthropicRequests: number;
  falRequests: number;
  updatedAt: string;
};
