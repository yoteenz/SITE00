/**
 * ProjectExperienceSkin — brand family binding per project.
 */

import { BRAND_FAMILY_PRIMARY_COLORS, BRAND_FAMILY_PROJECT_MAP } from './constants.js';
import { getBrandFamilySkinByKey } from './registry.js';
import type { BrandFamilyProjectExperienceSkin, BrandFamilyKey } from './types.js';
import type { FieldIndustryTag } from '../types.js';
import { MASTER_SKIN_CATALOG_IDS } from '../constants.js';

const bindingStore = new Map<string, BrandFamilyProjectExperienceSkin>();

const DEFAULT_FIELD_TAGS: Record<string, FieldIndustryTag[]> = {
  ndxbook: ['CREATIVE', 'MEDIA'],
  'frontal-slayer': ['BEAUTY', 'HAIR', 'RETAIL'],
  'all-in-one-enterprises': ['LOGISTICS', 'PROFESSIONAL_SERVICES'],
  'astral-world': ['CREATIVE', 'MEDIA'],
  'studio-world': ['CREATIVE', 'TECH'],
  'demo-doctor-health': ['HEALTH', 'MEDICAL'],
};

function now() {
  return new Date().toISOString();
}

export function createBrandFamilyProjectBinding(input: {
  projectId: string;
  brandFamilySkinId: string;
  fieldTags?: FieldIndustryTag[];
  primaryColor?: string;
  secondaryColor?: string | null;
  founderApproved?: boolean;
  selectedAtOnboarding?: boolean;
  selectedBy?: string | null;
  masterSkinId?: string | null;
}): BrandFamilyProjectExperienceSkin {
  const family = getBrandFamilySkinByKey(input.brandFamilySkinId);
  const colors = family ? BRAND_FAMILY_PRIMARY_COLORS[family.brandKey] : null;

  const record: BrandFamilyProjectExperienceSkin = {
    projectId: input.projectId,
    brandFamilySkinId: family?.id ?? input.brandFamilySkinId,
    skinVersion: family?.version ?? '1.0',
    fieldTags: input.fieldTags ?? DEFAULT_FIELD_TAGS[input.projectId] ?? ['OTHER'],
    primaryColor: input.primaryColor ?? colors?.color ?? family?.primaryColor ?? '#333333',
    secondaryColor: input.secondaryColor ?? null,
    moduleVariantOverrides: {},
    selectedAtOnboarding: input.selectedAtOnboarding ?? false,
    selectedBy: input.selectedBy ?? null,
    founderApproved: input.founderApproved ?? false,
    active: true,
    masterSkinId: input.masterSkinId ?? family?.legacyMasterSkinId ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  bindingStore.set(input.projectId, record);
  return record;
}

export function seedBrandFamilyProjectBindings(): void {
  for (const [projectId, brandKey] of Object.entries(BRAND_FAMILY_PROJECT_MAP)) {
    if (bindingStore.has(projectId)) continue;
    createBrandFamilyProjectBinding({
      projectId,
      brandFamilySkinId: brandKey,
      founderApproved: true,
      selectedAtOnboarding: true,
      selectedBy: 'system',
    });
  }
}

export function getProjectBrandFamilyBinding(projectId: string): BrandFamilyProjectExperienceSkin | null {
  seedBrandFamilyProjectBindings();
  return bindingStore.get(projectId) ?? null;
}

export function suggestBrandFamilyForProject(projectNameOrSlug: string): BrandFamilyKey | null {
  const slug = projectNameOrSlug.toLowerCase().replace(/\s+/g, '-');
  if (BRAND_FAMILY_PROJECT_MAP[slug]) return BRAND_FAMILY_PROJECT_MAP[slug] as BrandFamilyKey;
  if (slug.includes('frontal') || slug.includes('slayer')) return 'FRONTAL_SLAYER';
  if (slug.includes('aio') || slug.includes('all-in-one')) return 'AIO';
  if (slug.includes('astral')) return 'ASTRAL_WORLD';
  if (slug.includes('studio-world') || slug.includes('studio world')) return 'STUDIO_WORLD';
  if (slug.includes('ndx')) return 'NDXBOOK';
  return null;
}

export function approveBrandFamilyAssignment(input: {
  projectId: string;
  brandFamilySkinId: string;
  selectedBy: string;
  primaryColor?: string;
}): BrandFamilyProjectExperienceSkin | null {
  const family = getBrandFamilySkinByKey(input.brandFamilySkinId);
  if (!family) return null;
  const existing = getProjectBrandFamilyBinding(input.projectId);
  return createBrandFamilyProjectBinding({
    projectId: input.projectId,
    brandFamilySkinId: family.id,
    fieldTags: existing?.fieldTags,
    primaryColor: input.primaryColor ?? existing?.primaryColor,
    founderApproved: true,
    selectedAtOnboarding: true,
    selectedBy: input.selectedBy,
    masterSkinId: family.legacyMasterSkinId ?? MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL,
  });
}

export function fieldIsNotSkin(fieldTags: FieldIndustryTag[], brandFamilySkinId: string): boolean {
  const family = getBrandFamilySkinByKey(brandFamilySkinId);
  if (!family) return true;
  return !(fieldTags.length === 1 && fieldTags[0] === family.fieldTags[0] && family.fieldTags.length === 1);
}

export function listBrandFamilyProjectBindings(): BrandFamilyProjectExperienceSkin[] {
  seedBrandFamilyProjectBindings();
  return [...bindingStore.values()];
}

export function clearBrandFamilyBindingsForTest(): void {
  bindingStore.clear();
}
