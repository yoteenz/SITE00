/**
 * P0.STUDIO-WORLD-ACTOR-CATALOGUE-CASTING-AND-CHARACTER-AUTHORITY1
 * Actor ≠ Character ≠ Campaign Look ≠ Shot Appearance
 */

export const ACTING_CATALOGUE_VERSION = '1.0.0' as const;
export const STUDIO_WORLD_SEASON1_CATALOGUE_VERSION = 'season1-v1' as const;
export type ActingCatalogueVersion = typeof ACTING_CATALOGUE_VERSION | typeof STUDIO_WORLD_SEASON1_CATALOGUE_VERSION;

export const PERFORMANCE_QUALITIES = [
  'UNDERSTATED',
  'EXPRESSIVE',
  'AUTHORITATIVE',
  'WARM',
  'INTIMIDATING',
  'COMEDIC',
  'ROMANTIC',
  'MYSTERIOUS',
  'INTELLECTUAL',
  'EVERYDAY',
  'LUXURY',
  'EDITORIAL',
  'DOCUMENTARY',
  'ASPIRATIONAL',
  'RAW',
  'VULNERABLE',
  'CONTROLLED',
  'CHAOTIC',
  'CHARISMATIC',
  'DETACHED',
] as const;

export type PerformanceQuality = (typeof PERFORMANCE_QUALITIES)[number];

export const ROLE_ARCHETYPES = [
  'FOUNDER',
  'CREATIVE_DIRECTOR',
  'STUDENT',
  'EXECUTIVE',
  'STYLIST',
  'DESIGNER',
  'SERVER',
  'SHOPPER',
  'MOTHER',
  'FATHER',
  'FRIEND',
  'PARTNER',
  'INFLUENCER',
  'REPORTER',
  'ARCHIVIST',
  'RESEARCHER',
  'MUSICIAN',
  'MODEL',
  'TEACHER',
  'DOCTOR',
  'BARISTA',
  'RETAIL_WORKER',
  'OFFICE_WORKER',
  'ARTIST',
  'PHOTOGRAPHER',
  'NEIGHBOR',
  'PASSERBY',
  'SUBJECT',
  'OBSERVER',
  'COMMENTER',
] as const;

export type RoleArchetype = (typeof ROLE_ARCHETYPES)[number];

export const ACTOR_AVAILABILITY_STATES = [
  'AVAILABLE',
  'IN_CURRENT_PRODUCTION',
  'RESTING_RECENTLY_USED',
  'RETIRED',
  'ARCHIVED',
] as const;

export type ActorAvailabilityState = (typeof ACTOR_AVAILABILITY_STATES)[number];

export const SCREEN_IMPORTANCE_LEVELS = ['HERO', 'SUPPORTING', 'FEATURED_BACKGROUND', 'ENSEMBLE'] as const;
export type ScreenImportance = (typeof SCREEN_IMPORTANCE_LEVELS)[number];

export const CHARACTER_STATUSES = [
  'DRAFT',
  'CAST_PENDING',
  'LOOK_IN_PROGRESS',
  'FOUNDER_REVIEW',
  'LOCKED',
  'RECAST_PENDING',
] as const;

export type ProductionCharacterStatus = (typeof CHARACTER_STATUSES)[number];

export const CHARACTER_EXPRESSIONS = [
  'NEUTRAL',
  'CURIOUS',
  'AMUSED',
  'SKEPTICAL',
  'ANGRY',
  'VULNERABLE',
  'CONFIDENT',
  'SURPRISED',
] as const;

export type CharacterExpressionId = (typeof CHARACTER_EXPRESSIONS)[number];

export const WARDROBE_CONTINUITY_MODES = ['SAME', 'CHANGED', 'INTENTIONAL_CHANGE'] as const;
export type WardrobeContinuityMode = (typeof WARDROBE_CONTINUITY_MODES)[number];

export type ActorIdentityViewRef = {
  view: 'FRONTAL' | 'THREE_QUARTER' | 'PROFILE' | 'FULL_BODY';
  assetId: string;
  storagePath: string | null;
  previewUrl: string | null;
};

export type ActorIdentityAuthority = {
  identityAuthorityId: string;
  actorId: string;
  canonicalFaceDescription: string;
  facialProportions: string;
  baselineSkinAppearance: string;
  baselineBodyProportions: string;
  baselineHairState: string;
  neutralExpressionNote: string;
  views: readonly ActorIdentityViewRef[];
  immutable: true;
  createdAt: string;
  updatedAt: string;
};

export type StudioWorldActor = {
  actorId: string;
  catalogueNumber: string;
  stageName: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'ARCHIVED';
  identityAuthorityId: string;
  presentation: 'WOMAN' | 'MAN' | 'NONBINARY';
  ageRange: string;
  heightRange: string;
  build: string;
  skinToneDescription: string;
  hairBaseline: string;
  eyeDescription: string;
  facialFeatures: string;
  distinguishingFeatures: string;
  nationalityOrCulturalCastingTags: readonly string[];
  languages: readonly string[];
  accentCapabilities: readonly string[];
  performanceProfile: readonly PerformanceQuality[];
  personalityRange: readonly string[];
  emotionalRange: readonly string[];
  roleArchetypes: readonly RoleArchetype[];
  occupationArchetypes: readonly RoleArchetype[];
  fashionRange: readonly string[];
  wardrobeCompatibility: readonly string[];
  hairAdaptability: readonly string[];
  makeupAdaptability: readonly string[];
  periodAdaptability: readonly string[];
  cinematicPresence: readonly string[];
  commercialFit: readonly string[];
  editorialFit: readonly string[];
  comedicFit: readonly string[];
  dramaticFit: readonly string[];
  projectsUsed: readonly string[];
  campaignsUsed: readonly string[];
  charactersPlayed: readonly string[];
  availabilityState: ActorAvailabilityState;
  continuityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  headshotPreviewUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CharacterCampaignLook = {
  lookId: string;
  characterId: string;
  label: string;
  hair: string;
  makeup: string;
  nails: string;
  wardrobe: string;
  shoes: string;
  jewelry: string;
  accessories: string;
  bodyStyling: string;
  era: string;
  colorPalette: string;
  grooming: string;
  props: readonly string[];
  lookReferences: readonly string[];
  approvedLookAuthorityIds: readonly string[];
  wardrobeLookId: string | null;
  garments: readonly string[];
  layering: string;
  bag: string | null;
  wardrobeContinuityDefault: WardrobeContinuityMode;
  hairAuthorityId: string | null;
  makeupAuthorityId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CharacterTemporalLook = {
  temporalLookId: string;
  characterId: string;
  eraLabel: string;
  campaignLookId: string;
  narrativeReason: string;
  preservesActorIdentity: true;
};

export type CharacterAuthoritySheet = {
  characterAuthorityId: string;
  characterId: string;
  actorId: string;
  actorIdentityAuthorityId: string;
  campaignLookId: string;
  characterName: string;
  narrativeRole: string;
  narrativeFunction: string;
  personalityPerformance: string;
  frontPortraitAssetId: string | null;
  threeQuarterPortraitAssetId: string | null;
  sideProfileAssetId: string | null;
  fullBodyAssetId: string | null;
  wardrobeFrontAssetId: string | null;
  wardrobeBackAssetId: string | null;
  hairDetailAssetId: string | null;
  makeupGroomingAssetId: string | null;
  accessoryDetailAssetId: string | null;
  expressionRange: readonly CharacterExpressionId[];
  keyProp: string | null;
  continuityNotes: string;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductionCharacter = {
  characterId: string;
  projectId: string;
  entryId: string;
  actorId: string | null;
  characterName: string;
  narrativeRole: string;
  storyFunction: string;
  occupation: string;
  personality: string;
  motivation: string;
  relationshipMap: string;
  agePresentation: string;
  performanceDirection: string;
  screenImportance: ScreenImportance;
  campaignLookId: string | null;
  characterAuthorityId: string | null;
  temporalLookIds: readonly string[];
  firstBeat: string | null;
  lastBeat: string | null;
  appearsInBeats: readonly string[];
  appearsInShots: readonly string[];
  status: ProductionCharacterStatus;
  castingRequirementId: string;
  createdAt: string;
  updatedAt: string;
};

export type CastingRequirement = {
  requirementId: string;
  narrativeRole: string;
  storyFunction: string;
  approximateAgePresentation: string;
  presentationRequirements: string;
  performanceEnergy: string;
  wardrobeContext: string;
  era: string;
  requiredContinuity: string;
  screenImportance: ScreenImportance;
  specialVisualRequirements: string;
  suggestedPresentation?: StudioWorldActor['presentation'];
  suggestedRoleArchetypes?: readonly RoleArchetype[];
};

export type CastingRecommendation = {
  actor: StudioWorldActor;
  rationale: string;
  reuseSuggested: boolean;
  recentUsageNote: string | null;
  repetitionRisk: 'NONE' | 'ADVISORY' | 'ELEVATED';
};

export type ShotCastEntry = {
  characterId: string;
  actorId: string;
  lookId: string;
  temporalLookId: string | null;
  position: string;
  screenPriority: ScreenImportance;
  action: string;
  expression: CharacterExpressionId;
  interactionPartners: readonly string[];
  continuitySourceShotId: string | null;
};

export type ActorCampaignHistoryEntry = {
  actorId: string;
  projectId: string;
  entryId: string;
  campaignId: string;
  characterId: string;
  characterName: string;
  shotIds: readonly string[];
  assetIds: readonly string[];
  recordedAt: string;
};

export type StudioWorldActorCatalogue = {
  catalogueId: 'studio-world-acting-company' | 'studio-world-season1-resident-talent';
  version: ActingCatalogueVersion;
  actors: readonly StudioWorldActor[];
  identityAuthorities: readonly ActorIdentityAuthority[];
  updatedAt: string;
};

export type ProductionCastState = {
  projectId: string;
  entryId: string;
  requirements: readonly CastingRequirement[];
  characters: readonly ProductionCharacter[];
  looks: readonly CharacterCampaignLook[];
  temporalLooks: readonly CharacterTemporalLook[];
  authoritySheets: readonly CharacterAuthoritySheet[];
  shotCastByShotId: Readonly<Record<string, readonly ShotCastEntry[]>>;
  providerDispatchCount: number;
  castGateLocked: boolean;
  updatedAt: string;
};

export type CastGateEvaluation = {
  allRequiredCharactersLocked: boolean;
  blockedReason: 'CAST_GATE_BLOCKED' | null;
  uncataloguedHeroes: readonly string[];
  missingCharacterAuthorities: readonly string[];
};

export type HomogeneityGuardResult = {
  flagged: boolean;
  advisory: string | null;
  dimensions: readonly string[];
};
