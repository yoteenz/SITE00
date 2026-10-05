/**
 * Brand family skin integration — onboarding, client/founder visibility, workflow.
 */

import { suggestBrandFamilyForProject, approveBrandFamilyAssignment, getProjectBrandFamilyBinding } from './projectBinding.js';
import { getBrandFamilySkinByKey, listBrandFamilySkins } from './registry.js';
import { getStandardScreenPackStatus, getDefaultFirstAuthorityScreen } from './skinPack.js';
import { createSkinScreenAuthority, approveSkinScreenAuthority } from './screenAuthority.js';
import { createSkinScreenImplementationJob, buildFidelityContractInputFromAuthority } from './implementationJob.js';
import { refreshSkinPack } from './skinPack.js';
import { updateContinuityAfterApprovedScreen } from './continuity.js';
import type { FieldIndustryTag } from '../types.js';

export const SCREEN_BY_SCREEN_WORKFLOW = [
  'SKIN_BRIEF',
  'SCREEN_01_DESIGN',
  'FOUNDER_REVIEW',
  'REVISE_UNTIL_APPROVED',
  'LOCK_SCREEN_AUTHORITY',
  'REPEAT',
  'SKIN_PACK_COMPLETE',
  'IMPLEMENT_ONE_SCREEN_AT_A_TIME',
  'VISUAL_CONVERGENCE_QA',
  'LOCK_SKIN_VERSION',
] as const;

export function initializeBrandFamilyFromOnboarding(input: {
  projectId: string;
  projectName?: string;
  fieldTags: FieldIndustryTag[];
  brandFamilySkinId?: string;
  founderApproved: boolean;
  selectedBy: string;
  primaryColor?: string;
}) {
  const suggested = input.brandFamilySkinId ?? suggestBrandFamilyForProject(input.projectName ?? input.projectId);
  if (!suggested) return null;

  if (!input.founderApproved) {
    return approveBrandFamilyAssignment({
      projectId: input.projectId,
      brandFamilySkinId: suggested,
      selectedBy: input.selectedBy,
      primaryColor: input.primaryColor,
    });
  }

  return approveBrandFamilyAssignment({
    projectId: input.projectId,
    brandFamilySkinId: suggested,
    selectedBy: input.selectedBy,
    primaryColor: input.primaryColor,
  });
}

export function founderSeesBrandFamilySkinConfig(viewMode: 'FOUNDER' | 'CLIENT'): boolean {
  return viewMode === 'FOUNDER';
}

export function clientSeesBrandFamilySkinOnly(viewMode: 'FOUNDER' | 'CLIENT'): boolean {
  return viewMode === 'CLIENT';
}

export function processFirstApprovedAuthority(input: {
  brandFamilySkinId: string;
  moduleId: string;
  screenType: string;
  viewport: 'MOBILE' | 'DESKTOP';
  referenceAssetId: string;
  projectId: string;
}) {
  const authority = createSkinScreenAuthority({
    ...input,
    approvedByFounder: true,
  });
  approveSkinScreenAuthority(authority.id);
  refreshSkinPack(input.brandFamilySkinId);
  const family = getBrandFamilySkinByKey(input.brandFamilySkinId);
  if (family) {
    updateContinuityAfterApprovedScreen(family.id, family.version, `SCREEN_${input.screenType}_APPROVED`);
  }
  const job = createSkinScreenImplementationJob(authority);
  const fidelityInput = buildFidelityContractInputFromAuthority(authority, input.projectId);
  return { authority, job, fidelityInput };
}

export function getExperienceSkinManagementPayload(projectId: string) {
  const binding = getProjectBrandFamilyBinding(projectId);
  const family = binding ? getBrandFamilySkinByKey(binding.brandFamilySkinId) : null;
  return {
    currentSkin: family?.name ?? null,
    brandFamilySkinId: binding?.brandFamilySkinId ?? null,
    skinStatus: family?.status ?? null,
    version: family?.version ?? null,
    screenAuthorities: family ? getStandardScreenPackStatus(family.id) : {},
    packCompletion: family ? refreshSkinPack(family.id).completionStatus : null,
    primaryColor: binding?.primaryColor ?? family?.primaryColor,
    skinIntent: family?.skinIntent ?? null,
    visualAuthorityStatus: family?.visualAuthorityStatus ?? null,
    defaultFirstScreen: getDefaultFirstAuthorityScreen(),
    registry: listBrandFamilySkins().map((s) => ({
      brandKey: s.brandKey,
      name: s.name,
      primaryColor: s.primaryColor,
      primaryColorFamily: s.primaryColorFamily,
      skinIntent: s.skinIntent,
      version: s.version,
      status: s.status,
      visualAuthorityStatus: s.visualAuthorityStatus,
      screenPackStatus: getStandardScreenPackStatus(s.id),
    })),
  };
}

export {
  listBrandFamilySkins,
  getBrandFamilySkinByKey,
  suggestBrandFamilyForProject,
  getProjectBrandFamilyBinding,
  approveBrandFamilyAssignment,
};
