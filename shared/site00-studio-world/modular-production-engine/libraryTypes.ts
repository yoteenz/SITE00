/**
 * Core library records — acting, character, environment, set, wardrobe, prop, performance skins.
 */

import type { RoleArchetype } from '../acting-catalogue/types.js';

export const APPROVAL_STATUSES = [
  'DRAFT',
  'EXPLORATION',
  'FOUNDER_REVIEW',
  'APPROVED',
  'CANON',
  'SUPERSEDED',
  'ARCHIVED',
] as const;

export type LibraryApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const ASSET_SCOPE_TIERS = [
  'SHARED_LIBRARY',
  'CLIENT_PRIVATE',
  'PREMIUM_EXCLUSIVE',
  'FOUNDER_INTERNAL_ONLY',
] as const;

export type AssetScopeTier = (typeof ASSET_SCOPE_TIERS)[number];

export const EXCLUSIVITY_STATUSES = ['NONE', 'CLIENT_EXCLUSIVE', 'CAMPAIGN_EXCLUSIVE', 'INTERNAL_ONLY'] as const;
export type ExclusivityStatus = (typeof EXCLUSIVITY_STATUSES)[number];

export type TaggedEntity = {
  tags: readonly string[];
  version: string;
  approvalStatus: LibraryApprovalStatus;
  scopeTier: AssetScopeTier;
  exclusivity: ExclusivityStatus;
  clientIds: readonly string[];
  projectIds: readonly string[];
  createdAt: string;
  updatedAt: string;
};

/** ACTING CATALOGUE — extends acting-catalogue StudioWorldActor with engine metadata. */
export type ActingCatalogueEntry = TaggedEntity & {
  libraryKind: 'ACTING_CATALOGUE';
  actorId: string;
  catalogueNumber: string;
  identityAuthorityId: string;
  demographicTags: readonly string[];
  beautyFashionEditorialTags: readonly string[];
  personalityCompatibility: readonly string[];
  roleHistory: readonly string[];
  wardrobeCompatibility: readonly string[];
  movementCompatibility: readonly string[];
  usageHistorySummary: string;
};

export type PerformanceSkinRecord = TaggedEntity & {
  libraryKind: 'PERFORMANCE_SKIN';
  performanceSkinId: string;
  label: string;
  posture: string;
  gestureLanguage: string;
  walkStyle: string;
  eyeBehavior: string;
  energyLevel: string;
  emotionalCadence: string;
  interactionStyle: string;
  animationRealismMode: 'STILL_INFLUENCE' | 'MOTION_READY' | 'FULL_ANIMATION';
  useCaseNotes: string;
};

export type CharacterProfileRecord = TaggedEntity & {
  libraryKind: 'CHARACTER_PROFILE';
  characterId: string;
  actorId: string;
  roleType: RoleArchetype | string;
  campaignId: string | null;
  projectId: string;
  personalitySkinId: string | null;
  behaviorSkinId: string | null;
  animationSkinId: string | null;
  voiceToneNotes: string;
  approvedWardrobeLinkIds: readonly string[];
  approvedSetLinkIds: readonly string[];
};

export type EnvironmentLibraryRecord = TaggedEntity & {
  libraryKind: 'ENVIRONMENT_LIBRARY';
  environmentId: string;
  category: string;
  worldId: string;
  visualLanguage: string;
  reusableSetIds: readonly string[];
  brandCompatibility: readonly string[];
  lightingModeIds: readonly string[];
  signageTextSlotInventory: readonly SignageTextSlot[];
};

export type SignageTextSlot = {
  slotId: string;
  label: string;
  replaceableText: boolean;
  defaultCopy: string | null;
  anchorRef: string;
};

export type SetZoneDefinition = {
  zoneId: string;
  label: string;
  blockingNotes: string;
  approvedAngleRefs: readonly string[];
  interactionAnchors: readonly string[];
};

export type SetLibraryRecord = TaggedEntity & {
  libraryKind: 'SET_LIBRARY';
  setId: string;
  environmentId: string;
  setFunction: string;
  zones: readonly SetZoneDefinition[];
  propCompatibilityTags: readonly string[];
  graphicTextAssetAnchors: readonly string[];
  interactionAnchorMap: Readonly<Record<string, string>>;
};

export type WardrobeLibraryRecord = TaggedEntity & {
  libraryKind: 'WARDROBE_LIBRARY';
  wardrobeId: string;
  garmentType: string;
  styleCategory: string;
  era: string;
  mood: string;
  formality: string;
  roleCompatibility: readonly RoleArchetype[];
  colorFamily: string;
  fitSilhouette: string;
  accessoryCompatibility: readonly string[];
  stylingNotes: string;
};

export type PropGraphicAssetRecord = TaggedEntity & {
  libraryKind: 'PROP_GRAPHIC';
  assetId: string;
  assetType: 'PROP' | 'SCREEN' | 'SIGNAGE' | 'FRAMED_GRAPHIC' | 'TEXT_OVERLAY' | 'PRINTED_MATTER' | 'UI_OVERLAY';
  styleTags: readonly string[];
  brandingCompatibility: readonly string[];
  setCompatibilityTags: readonly string[];
  textReplaceable: boolean;
  artifactSlotRefs: readonly string[];
};

export type StudioWorldLibraryUnion =
  | ActingCatalogueEntry
  | CharacterProfileRecord
  | EnvironmentLibraryRecord
  | SetLibraryRecord
  | WardrobeLibraryRecord
  | PropGraphicAssetRecord
  | PerformanceSkinRecord;
