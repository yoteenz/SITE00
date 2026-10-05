/**
 * Master skin integration — identity ingestion + project defaults.
 */

import { recommendMasterSkins } from './recommendationEngine.js';
import {
  approveProjectSkin,
  createProjectExperienceSkin,
  getProjectExperienceSkin,
  seedDefaultProjectSkins,
} from './projectSkinStore.js';
import { resolveModuleSkin, skinInspectorPayload } from './resolver.js';
import type { ExpressionProfileTag, FieldIndustryTag } from './types.js';

export type IdentitySkinSignals = {
  fieldTags?: FieldIndustryTag[];
  brandPersonality?: ExpressionProfileTag[];
  primaryColor?: string | null;
  audience?: string;
  projectType?: string;
};

export function consumeIdentityForSkinRecommendation(signals: IdentitySkinSignals): ReturnType<typeof recommendMasterSkins> {
  return recommendMasterSkins({
    fieldTags: signals.fieldTags ?? ['OTHER'],
    brandPersonality: signals.brandPersonality,
    identityPersonalityTags: signals.brandPersonality,
    identityPrimaryColor: signals.primaryColor,
    audience: signals.audience,
    projectType: signals.projectType,
  });
}

export function initializeProjectSkinFromOnboarding(input: {
  projectId: string;
  fieldTags: FieldIndustryTag[];
  recommendedSkinId: string;
  selectedSkinId: string;
  primaryColor: string;
  founderApproved: boolean;
  selectedBy: string;
  recommendation: ReturnType<typeof recommendMasterSkins>;
}): ReturnType<typeof getProjectExperienceSkin> {
  if (!input.founderApproved) {
    return createProjectExperienceSkin({
      projectId: input.projectId,
      masterSkinId: input.recommendedSkinId,
      fieldTags: input.fieldTags,
      primaryColor: input.primaryColor,
      founderApproved: false,
      recommendedBySystem: true,
      recommendedSkinId: input.recommendedSkinId,
      recommendationConfidence: input.recommendation.confidence,
      selectedAtOnboarding: false,
    });
  }
  return approveProjectSkin({
    projectId: input.projectId,
    selectedSkinId: input.selectedSkinId,
    selectedBy: input.selectedBy,
    primaryColor: input.primaryColor,
  });
}

export function clientSeesAssignedSkinOnly(viewMode: 'FOUNDER' | 'CLIENT'): boolean {
  return viewMode === 'CLIENT';
}

export function founderSeesSkinConfiguration(viewMode: 'FOUNDER' | 'CLIENT'): boolean {
  return viewMode === 'FOUNDER';
}

export {
  seedDefaultProjectSkins,
  getProjectExperienceSkin,
  approveProjectSkin,
  resolveModuleSkin,
  skinInspectorPayload,
  recommendMasterSkins,
};
