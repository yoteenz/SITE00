/**
 * P0.5E.4B — Generic Embodied Character Voice types.
 */

import type {
  AUDIOVISUAL_COHERENCE_RESPONSES,
  FOUNDER_VOICE_JUDGMENTS,
  FOUNDER_VOICE_RECOGNITION_RESPONSES,
  PAIRWISE_VOICE_PREFERENCES,
  UNSEEN_LINE_RECOGNITION_RESPONSES,
  VOICE_CALIBRATION_PROGRESS_DOMAINS,
  VOICE_CALIBRATION_PROGRESS_LEVELS,
  VOICE_CALIBRATION_ROUND_STATUSES,
  VOICE_CALIBRATION_ROUND_TYPES,
  VOICE_CONTINUITY_FAILURES,
  VOICE_HYPOTHESIS_STATUSES,
  VOICE_IDENTITY_STATUSES,
  VOICE_INFERRED_TRAITS,
  VOICE_LAUGH_BEHAVIORS,
  VOICE_MIGRATION_OUTCOMES,
  VOICE_PAUSE_BEHAVIORS,
  VOICE_PERFORMANCE_STATES,
  VOICE_PROVIDER_ENDPOINT_CLASSES,
  VOICE_RECOGNITION_ANCHOR_TYPES,
  VOICE_TRUTH_EVIDENCE_TYPES,
} from './constants.js';
import type { VoiceLabChannel } from '../embodiedCharacterFounderDiscovery/types.js';

export type VoiceCalibrationRoundType = (typeof VOICE_CALIBRATION_ROUND_TYPES)[number];
export type VoiceCalibrationRoundStatus = (typeof VOICE_CALIBRATION_ROUND_STATUSES)[number];
export type FounderVoiceJudgment = (typeof FOUNDER_VOICE_JUDGMENTS)[number];
export type PairwiseVoicePreference = (typeof PAIRWISE_VOICE_PREFERENCES)[number];
export type VoiceTruthEvidenceType = (typeof VOICE_TRUTH_EVIDENCE_TYPES)[number];
export type VoiceIdentityStatus = (typeof VOICE_IDENTITY_STATUSES)[number];
export type VoicePerformanceState = (typeof VOICE_PERFORMANCE_STATES)[number];
export type VoiceHypothesisStatus = (typeof VOICE_HYPOTHESIS_STATUSES)[number];
export type VoiceInferredTrait = (typeof VOICE_INFERRED_TRAITS)[number];
export type VoiceRecognitionAnchorType = (typeof VOICE_RECOGNITION_ANCHOR_TYPES)[number];
export type VoicePauseBehavior = (typeof VOICE_PAUSE_BEHAVIORS)[number];
export type VoiceLaughBehavior = (typeof VOICE_LAUGH_BEHAVIORS)[number];
export type VoiceProviderEndpointClass = (typeof VOICE_PROVIDER_ENDPOINT_CLASSES)[number];
export type VoiceMigrationOutcome = (typeof VOICE_MIGRATION_OUTCOMES)[number];
export type VoiceContinuityFailure = (typeof VOICE_CONTINUITY_FAILURES)[number];
export type FounderVoiceRecognitionResponse = (typeof FOUNDER_VOICE_RECOGNITION_RESPONSES)[number];
export type UnseenLineRecognitionResponse = (typeof UNSEEN_LINE_RECOGNITION_RESPONSES)[number];
export type AudiovisualCoherenceResponse = (typeof AUDIOVISUAL_COHERENCE_RESPONSES)[number];
export type VoiceCalibrationProgressDomain = (typeof VOICE_CALIBRATION_PROGRESS_DOMAINS)[number];
export type VoiceCalibrationProgressLevel = (typeof VOICE_CALIBRATION_PROGRESS_LEVELS)[number];

/** Reclassified from P0.5E.4 Voice Lab — language register evidence (immutable historical records) */
export type CharacterLanguageEvidence = {
  evidenceId: string;
  underlyingThought: string;
  channel: VoiceLabChannel;
  spokenCopy: string;
  context: string | null;
  audience: string | null;
  emotionalState: string | null;
  intention: string | null;
  founderJudgment: string | null;
  founderRevision: string | null;
  directFounderLanguageEvidence: string | null;
  immutable: true;
  migratedFromVoiceLabSampleId: string | null;
  at: string;
};

export type EmbodiedCharacterVoiceIdentity = {
  id: string;
  projectId: string;
  brandId: string;
  characterId: string;
  version: string;
  status: VoiceIdentityStatus;
  voiceIdentityName: string | null;
  voiceIdentityThesis: string | null;
  voiceProvider: string | null;
  voiceModel: string | null;
  providerVoiceId: string | null;
  vocalAgeBand: string | null;
  register: string | null;
  pitchRange: string | null;
  resonance: string | null;
  texture: string | null;
  warmth: string | null;
  brightness: string | null;
  weight: string | null;
  breathiness: string | null;
  rasp: string | null;
  clarity: string | null;
  cadence: string | null;
  tempoRange: string | null;
  pauseBehavior: VoicePauseBehavior | null;
  sentenceMelody: string | null;
  emphasisBehavior: string | null;
  laughBehavior: VoiceLaughBehavior | null;
  reactionSoundBehavior: string | null;
  defaultEnergy: string | null;
  defaultConfidence: string | null;
  defaultIntimacy: string | null;
  defaultExpressiveness: string | null;
  defaultSeriousness: string | null;
  defaultPlayfulness: string | null;
  regionality: string | null;
  culturalSpeechContext: string | null;
  codeSwitchingBehavior: CharacterCodeSwitchingBehavior | null;
  slangBehavior: string | null;
  pronunciationBehavior: string | null;
  performanceRange: VoicePerformanceState[];
  prohibitedPerformanceStates: string[];
  recognitionAnchors: CharacterVoiceRecognitionAnchor[];
  voiceDriftConstraints: string[];
  sourceCalibrationRounds: string[];
  approvedAudioReferences: string[];
  providerConfiguration: Record<string, unknown> | null;
  founderApproval: boolean;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type CharacterCodeSwitchingBehavior = {
  behaviorId: string;
  contexts: Array<{
    context: string;
    modulation: string;
    sameVoiceIdentity: true;
  }>;
  forcedDialect: false;
  caricatureRisk: false;
};

export type CharacterVoiceRecognitionAnchor = {
  anchorId: string;
  anchorType: VoiceRecognitionAnchorType;
  description: string;
  strength: 'STRONG' | 'EMERGING' | 'HYPOTHESIS';
  founderConfirmed: boolean;
};

export type CharacterVoiceHypothesis = {
  id: string;
  characterId: string;
  roundId: string;
  hypothesisLabel: string;
  vocalCharacter: string;
  whyItFitsCharacter: string;
  primaryDifferencesFromSiblings: string[];
  provider: string;
  model: string;
  voiceId: string;
  generationSettings: Record<string, unknown>;
  predictedTraits: string[];
  uncertainTraits: string[];
  deliberatelyVariedTraits: string[];
  spokenCopy: string;
  emotionalState: VoicePerformanceState;
  audioAssetId: string | null;
  audioUrl: string | null;
  playbackProfile: VoicePlaybackProfile | null;
  spokenLineId: string;
  founderJudgment: FounderVoiceJudgment | null;
  founderNote: string | null;
  status: VoiceHypothesisStatus;
  generatedAt: string;
};

export type VoicePlaybackProfile = {
  pitch: number;
  rate: number;
  voiceIndex: number;
  providerVoiceId: string;
};

export type CharacterVoiceCalibrationRound = {
  roundId: string;
  roundNumber: number;
  roundType: VoiceCalibrationRoundType;
  question: string;
  spokenCopy: string;
  languageEvidenceId: string | null;
  hypothesisIds: string[];
  sameLineAcrossCandidates: true;
  status: VoiceCalibrationRoundStatus;
  blindAudition: boolean;
  pairwiseComparisonId: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type CharacterVoicePairwiseComparison = {
  comparisonId: string;
  roundId: string;
  hypothesisAId: string;
  hypothesisBId: string;
  spokenCopy: string;
  preference: PairwiseVoicePreference | null;
  customNote: string | null;
  at: string | null;
};

export type CharacterVoiceCalibrationInference = {
  inferenceId: string;
  sourceHypothesisId: string | null;
  sourceComparisonId: string | null;
  founderJudgment: FounderVoiceJudgment | null;
  founderNote: string | null;
  inferredTraits: VoiceInferredTrait[];
  rejectedTraits: VoiceInferredTrait[];
  evidenceType: VoiceTruthEvidenceType;
  directlyConfirmed: boolean;
  at: string;
};

export type CharacterVoicePerformanceEnvelope = {
  envelopeId: string;
  voiceIdentityId: string;
  allowedEmotionalRange: VoicePerformanceState[];
  allowedEnergyRange: [string, string];
  allowedTempoRange: [string, string];
  allowedExpressivenessRange: [string, string];
  allowedIntimacyRange: [string, string];
  prohibitedDrift: string[];
};

export type CharacterVoiceGenerationCapability = {
  capabilityId: string;
  provider: string;
  endpoint: string;
  endpointClass: VoiceProviderEndpointClass;
  schemaVersion: string;
  retrievedAt: string;
  supportsTextToSpeech: boolean;
  supportsVoiceSelection: boolean;
  supportsVoiceDesign: boolean;
  supportsPromptedVoiceCreation: boolean;
  supportsReferenceAudio: boolean;
  supportsVoiceCloning: boolean;
  supportsEmotion: boolean;
  supportsStyleInstruction: boolean;
  supportsSpeedControl: boolean;
  supportsPitchControl: boolean;
  supportsProsodyControl: boolean;
  supportsPauseControl: boolean;
  supportsSeed: boolean;
  supportsDeterminism: boolean;
  supportsPersistentVoiceId: boolean;
  supportsMultilingual: boolean;
  supportsStreaming: boolean;
  supportsPhonemeControl: boolean;
  supportsAudioExport: boolean;
  knownLimitations: string[];
};

export type CharacterVoiceGenerationContract = {
  contractId: string;
  characterVoiceIdentityId: string | null;
  languageEvidenceId: string | null;
  voiceCalibrationRoundId: string | null;
  provider: string;
  endpoint: string;
  schemaVersion: string;
  voiceId: string | null;
  referenceAudioIds: string[];
  spokenCopy: string;
  emotionalState: VoicePerformanceState;
  socialContext: string | null;
  platform: string | null;
  intention: string | null;
  performanceDirection: string | null;
  tempo: string | null;
  energy: string | null;
  expressiveness: string | null;
  pauseBehavior: VoicePauseBehavior | null;
  laughBehavior: VoiceLaughBehavior | null;
  reactionBehavior: string | null;
  negativePerformanceConstraints: string[];
  seed: string | null;
  format: string;
  sampleRate: number;
  costEstimate: number | null;
  compilerVersion: string;
  fingerprint: string;
  voiceIdentityCast: boolean;
  blockingReason: string | null;
};

export type CharacterVoiceGenerationSnapshot = {
  snapshotId: string;
  characterBibleVersion: string | null;
  voiceIdentityVersion: string | null;
  languageEvidenceVersion: string | null;
  provider: string;
  endpoint: string;
  modelSchema: string;
  voiceId: string;
  referenceAudio: string[];
  spokenCopy: string;
  performanceSettings: Record<string, unknown>;
  seed: string | null;
  generatedAudioUrl: string | null;
  audioAssetId: string | null;
  cost: number | null;
  founderJudgment: FounderVoiceJudgment | null;
  immutable: true;
  generatedAt: string;
};

export type CharacterVoiceReferenceLibrary = {
  libraryId: string;
  voiceIdentityId: string;
  neutralSampleId: string | null;
  playfulSampleId: string | null;
  seriousSampleId: string | null;
  skepticalSampleId: string | null;
  selfCorrectionSampleId: string | null;
  conversationalSampleId: string | null;
  unseenLineValidationSampleId: string | null;
  stableInternalId: string;
};

export type FounderCharacterVoiceRecognitionEvaluation = {
  evaluationId: string;
  response: FounderVoiceRecognitionResponse | null;
  neutralSampleId: string | null;
  playfulSampleId: string | null;
  seriousSampleId: string | null;
  skepticalSampleId: string | null;
  unseenLineSampleId: string | null;
  note: string | null;
  evaluatedAt: string | null;
  founderCharacterVoiceConfirmed: boolean;
};

export type CharacterVoiceGeneralizationTest = {
  testId: string;
  spokenCopy: string;
  hypothesisId: string;
  response: UnseenLineRecognitionResponse | null;
  wasInCalibrationSet: false;
  at: string | null;
};

export type CharacterVoiceCrossEmotionRecognition = {
  recognitionId: string;
  voiceIdentityId: string;
  emotionSampleIds: Record<string, string>;
  passesCrossEmotion: boolean | null;
  evaluatedAt: string | null;
};

export type CharacterVoiceMigrationEvaluation = {
  evaluationId: string;
  fromProvider: string;
  toProvider: string;
  fromVoiceId: string;
  outcome: VoiceMigrationOutcome | null;
  evaluatedAt: string | null;
  silentlyRecast: false;
};

export type CharacterVoiceContinuityEvaluation = {
  evaluationId: string;
  voiceIdentityId: string;
  result: 'PASS' | 'FAIL' | 'PENDING';
  failures: VoiceContinuityFailure[];
  evaluatedAt: string | null;
};

export type CharacterAudioVisualCoherence = {
  coherenceId: string;
  faceSelected: boolean;
  voiceSelected: boolean;
  response: AudiovisualCoherenceResponse | null;
  finalAudiovisualLockBlocked: true;
  evaluatedAt: string | null;
};

export type CharacterVoiceCalibrationProgress = {
  domain: VoiceCalibrationProgressDomain;
  level: VoiceCalibrationProgressLevel;
  label: string;
};

export type CharacterVoiceCalibrationState = {
  calibrationVersion: string;
  projectId: string;
  brandId: string;
  characterId: string;
  languageEvidence: CharacterLanguageEvidence[];
  rounds: CharacterVoiceCalibrationRound[];
  hypotheses: CharacterVoiceHypothesis[];
  pairwiseComparisons: CharacterVoicePairwiseComparison[];
  inferences: CharacterVoiceCalibrationInference[];
  emergingIdentity: EmbodiedCharacterVoiceIdentity | null;
  canonicalIdentity: EmbodiedCharacterVoiceIdentity | null;
  performanceEnvelope: CharacterVoicePerformanceEnvelope | null;
  referenceLibrary: CharacterVoiceReferenceLibrary | null;
  recognitionEvaluation: FounderCharacterVoiceRecognitionEvaluation;
  generalizationTests: CharacterVoiceGeneralizationTest[];
  crossEmotionRecognition: CharacterVoiceCrossEmotionRecognition | null;
  migrationEvaluation: CharacterVoiceMigrationEvaluation | null;
  continuityEvaluation: CharacterVoiceContinuityEvaluation | null;
  audiovisualCoherence: CharacterAudioVisualCoherence;
  progress: CharacterVoiceCalibrationProgress[];
  sessionMessage: string | null;
  blindAuditionMode: boolean;
  compareModeHypothesisIds: [string, string] | null;
  voiceRequests: number;
  audioAssetsGenerated: number;
  falRequests: number;
  estimatedCost: number;
  actualCost: number;
  updatedAt: string;
};

export type CanonicalCharacterVoiceIdentity = EmbodiedCharacterVoiceIdentity & {
  isCanon: true;
  founderApproval: true;
  ingestibleToContinuityPipeline: true;
};
