/**
 * Studio World Wardrobe Department — independent from Actors.
 */

export const WARDROBE_CATEGORIES = [
  'TOPS',
  'BOTTOMS',
  'DRESSES',
  'SKIRTS',
  'PANTS',
  'JACKETS',
  'OUTERWEAR',
  'SUITS',
  'SHOES',
  'BAGS',
  'JEWELRY',
  'ACCESSORIES',
  'UNIFORMS',
  'ERA_PIECES',
  'SPECIALTY_COSTUME',
] as const;

export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];

export type OwnerScope =
  | 'STUDIO_WORLD_SHARED'
  | 'INTERNAL'
  | 'CLIENT_PRIVATE'
  | 'CLIENT_EXCLUSIVE'
  | 'END_CLIENT_PRIVATE';

export type WardrobeItem = {
  wardrobeId: string;
  name: string;
  category: WardrobeCategory;
  subcategory: string;
  era: string;
  silhouette: string;
  fit: string;
  material: string;
  colorFamily: string;
  pattern: string;
  formality: string;
  styleLanguage: string;
  roleCompatibility: readonly string[];
  occupationCompatibility: readonly string[];
  characterCompatibility: readonly string[];
  genderExpression: readonly string[];
  climate: string;
  season: string;
  brandCompatibility: readonly string[];
  campaignHistory: readonly string[];
  availability: 'AVAILABLE' | 'IN_USE' | 'ARCHIVED';
  exclusivityScope: OwnerScope;
  assetAuthorityIds: readonly string[];
  tags: readonly string[];
  ownerScope: OwnerScope;
};

export type WardrobePull = {
  pullId: string;
  characterId: string;
  wardrobeItemIds: readonly string[];
  rationale: string;
  catalogueFirst: true;
};

export type FittingRoomSession = {
  sessionId: string;
  actorIdentityAuthorityId: string;
  actorBodyAuthorityId: string;
  characterId: string;
  wardrobePullId: string;
  lookTestAssetIds: readonly string[];
  status: 'IN_PROGRESS' | 'FOUNDER_REVIEW' | 'APPROVED';
};

export type CharacterLookAuthority = {
  lookAuthorityId: string;
  characterId: string;
  wardrobeItemIds: readonly string[];
  hairStyleId: string | null;
  makeupLookId: string | null;
  accessoryIds: readonly string[];
  approvedFromFittingSessionId: string;
  locked: boolean;
};

export type CharacterLookStack = {
  wardrobe: readonly string[];
  hair: string | null;
  makeup: string | null;
  nailsGrooming: string | null;
  accessories: readonly string[];
  personalProps: readonly string[];
};

export function wardrobeDepartmentSeparateFromActor(actorWardrobeBakedIn: boolean): boolean {
  return !actorWardrobeBakedIn;
}

export function lookTestPreservesIdentity(alterations: {
  faceChanged: boolean;
  bodyProportionsChanged: boolean;
  wardrobeChanged: boolean;
}): boolean {
  return !alterations.faceChanged && !alterations.bodyProportionsChanged && alterations.wardrobeChanged;
}
