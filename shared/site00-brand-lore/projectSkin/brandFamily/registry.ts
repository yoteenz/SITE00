/**
 * BrandFamilySkinRegistry — five canonical brand family skins (metadata only).
 */

import { BRAND_FAMILY_LEGACY_MASTER_SKIN, BRAND_FAMILY_PRIMARY_COLORS, BRAND_FAMILY_SLUGS } from './constants.js';
import type { BrandFamilySkin, BrandFamilyKey, BrandFamilyModuleVariant } from './types.js';
import { BRAND_FAMILY_KEYS, STANDARD_SCREEN_PACK } from './types.js';

const now = () => new Date().toISOString();

function emptyModuleVariants(brandFamilySkinId: string): BrandFamilyModuleVariant[] {
  return STANDARD_SCREEN_PACK.map((screen) => ({
    brandFamilySkinId,
    moduleId: screen === 'PROJECT_OVERVIEW' ? 'OVERVIEW' : screen,
    authorityStatus: 'NOT_STARTED',
    implementationStatus: 'NOT_STARTED',
    continuityRules: [],
    screenAuthorities: [],
    version: '1.0',
  }));
}

function familyBase(input: {
  brandKey: BrandFamilyKey;
  name: string;
  description: string;
  fieldTags: BrandFamilySkin['fieldTags'];
  skinIntent: BrandFamilySkin['skinIntent'];
  status: BrandFamilySkin['status'];
  version: string;
  visualAuthorityStatus: BrandFamilySkin['visualAuthorityStatus'];
}): BrandFamilySkin {
  const colors = BRAND_FAMILY_PRIMARY_COLORS[input.brandKey] ?? {};
  const id = input.brandKey;
  return {
    id,
    brandKey: input.brandKey,
    name: input.name,
    slug: BRAND_FAMILY_SLUGS[input.brandKey] ?? input.brandKey.toLowerCase(),
    description: input.description,
    fieldTags: input.fieldTags,
    primaryColor: colors.color ?? null,
    primaryColorFamily: colors.family ?? null,
    skinIntent: input.skinIntent,
    status: input.status,
    version: input.version,
    visualAuthorityStatus: input.visualAuthorityStatus,
    moduleVariants: emptyModuleVariants(id),
    approvedScreenAuthorities: [],
    skinCompositionFreedom: 'HIGH',
    legacyMasterSkinId: BRAND_FAMILY_LEGACY_MASTER_SKIN[input.brandKey] ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
}

export const NDXBOOK_BRAND_FAMILY: BrandFamilySkin = familyBase({
  brandKey: BRAND_FAMILY_KEYS.NDXBOOK,
  name: 'NDXBOOK',
  description: 'Editorial intelligence dossier — existing skin to refine screen-by-screen.',
  fieldTags: ['CREATIVE', 'MEDIA'],
  skinIntent: 'EDITORIAL_INTELLIGENCE_DOSSIER',
  status: 'EXISTING_SKIN_TO_REFINE',
  version: '2.0',
  visualAuthorityStatus: 'PARTIAL_AUTHORITY',
});

export const FRONTAL_SLAYER_BRAND_FAMILY: BrandFamilySkin = familyBase({
  brandKey: BRAND_FAMILY_KEYS.FRONTAL_SLAYER,
  name: 'Frontal Slayer',
  description: 'Luxury beauty editorial — awaiting screen-by-screen design authority.',
  fieldTags: ['BEAUTY', 'HAIR', 'RETAIL'],
  skinIntent: 'LUXURY_BEAUTY_EDITORIAL',
  status: 'NEW_SKIN_TO_DESIGN',
  version: '1.0',
  visualAuthorityStatus: 'NOT_STARTED',
});

export const AIO_BRAND_FAMILY: BrandFamilySkin = familyBase({
  brandKey: BRAND_FAMILY_KEYS.AIO,
  name: 'All In One Enterprises',
  description: 'Operational command — distinct from Studio World despite shared gold family.',
  fieldTags: ['LOGISTICS', 'PROFESSIONAL_SERVICES'],
  skinIntent: 'OPERATIONAL_COMMAND',
  status: 'NEW_SKIN_TO_DESIGN',
  version: '1.0',
  visualAuthorityStatus: 'NOT_STARTED',
});

export const ASTRAL_WORLD_BRAND_FAMILY: BrandFamilySkin = familyBase({
  brandKey: BRAND_FAMILY_KEYS.ASTRAL_WORLD,
  name: 'Astral World',
  description: 'Ethereal portal — mystic reader platform skin family.',
  fieldTags: ['OTHER'],
  skinIntent: 'ETHEREAL_PORTAL',
  status: 'NEW_SKIN_TO_DESIGN',
  version: '1.0',
  visualAuthorityStatus: 'NOT_STARTED',
});

export const STUDIO_WORLD_BRAND_FAMILY: BrandFamilySkin = familyBase({
  brandKey: BRAND_FAMILY_KEYS.STUDIO_WORLD,
  name: 'Studio World',
  description: 'Creative command — gold family but distinct grammar from AIO.',
  fieldTags: ['CREATIVE', 'TECH'],
  skinIntent: 'CREATIVE_COMMAND',
  status: 'NEW_SKIN_TO_DESIGN',
  version: '1.0',
  visualAuthorityStatus: 'NOT_STARTED',
});

/** Astral uses CREATIVE/MEDIA field tags (MYSTIC/SPIRITUAL are skin intent, not field=skin). */
ASTRAL_WORLD_BRAND_FAMILY.fieldTags = ['CREATIVE', 'MEDIA', 'OTHER'];

export const BRAND_FAMILY_SKIN_REGISTRY: BrandFamilySkin[] = [
  NDXBOOK_BRAND_FAMILY,
  FRONTAL_SLAYER_BRAND_FAMILY,
  AIO_BRAND_FAMILY,
  ASTRAL_WORLD_BRAND_FAMILY,
  STUDIO_WORLD_BRAND_FAMILY,
];

export function getBrandFamilySkinByKey(brandKey: string): BrandFamilySkin | null {
  return BRAND_FAMILY_SKIN_REGISTRY.find((s) => s.id === brandKey || s.brandKey === brandKey || s.slug === brandKey) ?? null;
}

export function listBrandFamilySkins(): BrandFamilySkin[] {
  return [...BRAND_FAMILY_SKIN_REGISTRY];
}

export function getBrandFamilySkinRegistry(): BrandFamilySkin[] {
  return listBrandFamilySkins();
}
