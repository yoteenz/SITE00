/**
 * ProjectExperienceSkin store — versioned project skin bindings.
 */

import { PROOF_PROJECT_SKIN_MAP } from './constants.js';
import { getMasterSkinById } from './catalog.js';
import { BRAND_FAMILY_PROJECT_MAP } from './brandFamily/constants.js';
import type { ExpressionProfile, FieldIndustryTag, ProjectExperienceSkin, ProjectSkinOverride } from './types.js';

const store = new Map<string, ProjectExperienceSkin>();

function now(): string {
  return new Date().toISOString();
}

function defaultExpressionProfile(tags: string[]): ExpressionProfile {
  return {
    profileId: `expr-${Date.now()}`,
    density: tags.includes('DENSE') ? 'HIGH' : tags.includes('CALM') ? 'MEDIUM' : 'MEDIUM',
    formality: 'PROFESSIONAL',
    energy: tags.includes('DYNAMIC') ? 'DYNAMIC' : 'CALM',
    warmth: tags.includes('WARM') || tags.includes('HUMAN') ? 'WARM' : 'NEUTRAL',
    visualWeight: tags.includes('CINEMATIC') ? 'HEAVY' : 'MEDIUM',
    imageLedVsDataLed: tags.includes('TECHNICAL') ? 'DATA_LED' : tags.includes('EDITORIAL') ? 'IMAGE_LED' : 'BALANCED',
    editorialVsOperational: tags.includes('OPERATIONAL') ? 'OPERATIONAL' : tags.includes('EDITORIAL') ? 'EDITORIAL' : 'BALANCED',
    softVsSharp: tags.includes('SOFT') ? 'SOFT' : tags.includes('PRECISE') ? 'SHARP' : 'BALANCED',
    tags: tags as ExpressionProfile['tags'],
  };
}

const DEFAULT_FIELD_TAGS: Record<string, FieldIndustryTag[]> = {
  ndxbook: ['CREATIVE', 'MEDIA'],
  'demo-doctor-health': ['HEALTH', 'MEDICAL'],
  'all-in-one-enterprises': ['LOGISTICS', 'PROFESSIONAL_SERVICES'],
};

const DEFAULT_COLORS: Record<string, string> = {
  ndxbook: '#b7d236',
  'demo-doctor-health': '#2a7f8f',
  'all-in-one-enterprises': '#1f4fd6',
};

export function seedDefaultProjectSkins(): void {
  for (const [projectId, skinId] of Object.entries(PROOF_PROJECT_SKIN_MAP)) {
    if (store.has(projectId)) continue;
    const skin = getMasterSkinById(skinId);
    if (!skin) continue;
    store.set(
      projectId,
      createProjectExperienceSkin({
        projectId,
        masterSkinId: skinId,
        fieldTags: DEFAULT_FIELD_TAGS[projectId] ?? ['OTHER'],
        primaryColor: DEFAULT_COLORS[projectId] ?? '#333333',
        founderApproved: true,
        recommendedBySystem: true,
        selectedAtOnboarding: projectId !== 'demo-doctor-health',
      }),
    );
  }
}

export function createProjectExperienceSkin(input: {
  projectId: string;
  masterSkinId: string;
  fieldTags: FieldIndustryTag[];
  primaryColor: string;
  secondaryColor?: string | null;
  founderApproved?: boolean;
  recommendedBySystem?: boolean;
  recommendedSkinId?: string | null;
  recommendationConfidence?: number;
  selectedAtOnboarding?: boolean;
  selectedBy?: string | null;
}): ProjectExperienceSkin {
  const skin = getMasterSkinById(input.masterSkinId);
  const moduleVariants: Record<string, string> = {};
  for (const v of skin?.moduleVariants ?? []) {
    moduleVariants[v.moduleId] = v.moduleId;
  }

  const record: ProjectExperienceSkin = {
    projectId: input.projectId,
    brandFamilySkinId: BRAND_FAMILY_PROJECT_MAP[input.projectId] ?? null,
    masterSkinId: input.masterSkinId,
    activeSkinVersion: skin?.version ?? '1.0',
    fieldTags: input.fieldTags,
    expressionProfileId: `expr-${input.projectId}`,
    expressionProfile: defaultExpressionProfile(skin?.expressionTags ?? []),
    primaryColor: input.primaryColor,
    secondaryColor: input.secondaryColor ?? null,
    brandPalette: {
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor ?? null,
    },
    moduleVariants,
    brandOverrides: [],
    selectedAtOnboarding: input.selectedAtOnboarding ?? false,
    selectedBy: input.selectedBy ?? null,
    founderApproved: input.founderApproved ?? false,
    recommendedBySystem: input.recommendedBySystem ?? false,
    recommendedSkinId: input.recommendedSkinId ?? input.masterSkinId,
    recommendationConfidence: input.recommendationConfidence ?? 0.8,
    recommendationSource: input.recommendedBySystem ? 'IDENTITY' : 'MANUAL',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  };
  store.set(input.projectId, record);
  return record;
}

export function getProjectExperienceSkin(projectId: string): ProjectExperienceSkin | null {
  seedDefaultProjectSkins();
  return store.get(projectId) ?? null;
}

export function approveProjectSkin(input: {
  projectId: string;
  selectedSkinId: string;
  selectedBy: string;
  primaryColor?: string;
}): ProjectExperienceSkin | null {
  const existing = getProjectExperienceSkin(input.projectId);
  const skin = getMasterSkinById(input.selectedSkinId);
  if (!skin) return null;

  const record = createProjectExperienceSkin({
    projectId: input.projectId,
    masterSkinId: input.selectedSkinId,
    fieldTags: existing?.fieldTags ?? ['OTHER'],
    primaryColor: input.primaryColor ?? existing?.primaryColor ?? '#333333',
    founderApproved: true,
    recommendedBySystem: existing?.recommendedBySystem ?? false,
    recommendedSkinId: existing?.recommendedSkinId ?? input.selectedSkinId,
    recommendationConfidence: existing?.recommendationConfidence ?? 0.8,
    selectedAtOnboarding: true,
    selectedBy: input.selectedBy,
  });
  return record;
}

export function addProjectSkinOverride(projectId: string, override: Omit<ProjectSkinOverride, 'overrideId' | 'projectId'>): ProjectExperienceSkin | null {
  const record = getProjectExperienceSkin(projectId);
  if (!record) return null;
  record.brandOverrides.push({
    overrideId: `ovr-${Date.now()}`,
    projectId,
    ...override,
  });
  record.updatedAt = now();
  return record;
}

export function listProjectExperienceSkins(): ProjectExperienceSkin[] {
  seedDefaultProjectSkins();
  return [...store.values()];
}

export function clearProjectSkinStoreForTest(): void {
  store.clear();
}
