/**
 * Personality, behavior, movement, emotional, voice, animation — performance stack.
 */

export type PersonalityTraitDimension =
  | 'confidence'
  | 'warmth'
  | 'reserve'
  | 'wit'
  | 'intensity'
  | 'dominance'
  | 'vulnerability'
  | 'curiosity'
  | 'formality'
  | 'impulsivity'
  | 'socialEnergy'
  | 'mystery'
  | 'romanticEnergy'
  | 'comedicEnergy'
  | 'rawness'
  | 'specificity';

export type CharacterPersonalityProfile = {
  profileId: string;
  characterId: string;
  traits: Partial<Record<PersonalityTraitDimension, number>>;
  /** 0–1 normalized reusable dimensions */
  notes: string;
};

export type ActorBaselineTraits = {
  actorId: string;
  traits: Partial<Record<PersonalityTraitDimension, number>>;
  performanceQualities: readonly string[];
};

export function characterOverridesActorBaseline(
  actor: ActorBaselineTraits,
  character: CharacterPersonalityProfile,
): CharacterPersonalityProfile {
  return {
    ...character,
    traits: { ...actor.traits, ...character.traits },
  };
}

export type BehaviorSkin = {
  behaviorSkinId: string;
  name: string;
  description: string;
  gestureFrequency: 'LOW' | 'MEDIUM' | 'HIGH';
  eyeBehavior: string;
  headBehavior: string;
  handBehavior: string;
  postureBehavior: string;
  reactionSpeed: 'SLOW' | 'MEDIUM' | 'FAST';
  suitableCharacterTypes: readonly string[];
  tags: readonly string[];
};

export type MovementSkin = {
  movementSkinId: string;
  walkCadence: string;
  gestureAmplitude: string;
  bodyWeightShift: string;
  turnSpeed: string;
  poseHold: string;
  movementEnergy: string;
  animationRealism: 'STILL_INFLUENCE' | 'MOTION_READY';
  tags: readonly string[];
};

export const EMOTIONAL_RANGE_STATES = [
  'NEUTRAL',
  'CURIOUS',
  'AMUSED',
  'SKEPTICAL',
  'ANNOYED',
  'VULNERABLE',
  'CONFIDENT',
  'SURPRISED',
  'KNOWING',
  'ANGRY',
  'RELIEVED',
] as const;

export type EmotionalRangeState = (typeof EMOTIONAL_RANGE_STATES)[number];

export type EmotionalRangeProfile = {
  profileId: string;
  states: readonly EmotionalRangeState[];
};

export type VoiceProfile = {
  voiceProfileId: string;
  tone: string;
  pitchRange: string;
  cadence: string;
  tempo: string;
  accent: string;
  dialect: string;
  breathiness: string;
  formality: string;
  emotionalDelivery: string;
  speechEnergy: string;
  generationRequired: false;
};

export type AnimationSkin = {
  animationSkinId: string;
  label: string;
  motionRealism: string;
  timingStyle: string;
  inertia: string;
  cameraResponse: string;
  posePersistence: string;
  microMovement: string;
  facialAnimationDensity: string;
  transitionBehavior: string;
};

export type CharacterPerformanceSkin = {
  performanceSkinId: string;
  characterId: string;
  personalityProfileId: string;
  behaviorSkinIds: readonly string[];
  movementSkinIds: readonly string[];
  emotionalRangeProfileId: string;
  voiceProfileId: string | null;
  animationSkinId: string | null;
};

export type ShotDirection = {
  shotDirectionId: string;
  shotId: string;
  characterId: string;
  action: string;
  expressionHint: string;
  /** Temporary — not persisted as character identity */
  ephemeral: true;
};

export type PerformanceStackAssembly = {
  actorIdentityAuthorityId: string;
  characterId: string;
  personality: CharacterPersonalityProfile;
  behaviorSkins: readonly BehaviorSkin[];
  movementSkins: readonly MovementSkin[];
  emotionalRange: EmotionalRangeProfile;
  voice: VoiceProfile | null;
  animationSkin: AnimationSkin | null;
  shotDirection: ShotDirection | null;
};

export function assemblePerformanceStack(
  base: Omit<PerformanceStackAssembly, 'shotDirection'>,
  shotDirection: ShotDirection | null,
): PerformanceStackAssembly {
  return { ...base, shotDirection };
}

export function shotDirectionIsEphemeral(direction: ShotDirection): boolean {
  return direction.ephemeral === true && Boolean(direction.shotId);
}
