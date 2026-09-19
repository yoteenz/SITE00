/**
 * SkinScreenAuthorityIngestion — register whole-screen authorities (not asset extraction).
 */

import { routeReferenceJob, screenAuthorityMustNotRouteToAssetPipeline } from './referenceJobRouter.js';
import type { DesignReferencePurpose } from './referencePurpose.js';
import { buildScreenAuthorityPrefill } from './screenSlotConfig.js';
import {
  approveSkinScreenAuthority,
  createSkinScreenAuthority,
  getSkinScreenAuthority,
  listScreenAuthoritiesForFamily,
  replaceSkinScreenAuthorityVersion,
} from './screenAuthority.js';
import {
  completeScreenAuthorityImplementation,
  createSkinScreenImplementationJob,
  startScreenAuthorityImplementation,
} from './implementationJob.js';
import { refreshSkinPack } from './skinPack.js';
import { updateContinuityAfterApprovedScreen } from './continuity.js';
import { getBrandFamilySkinByKey } from './registry.js';
import type { ScreenAuthorityViewport, StandardScreenType } from './types.js';

export type AuthorityModeOption = 'DESIGN_AUTHORITY' | 'INSPIRATION' | 'CONTENT_REFERENCE' | 'ASSET_REFERENCE';
export type FidelityModeOption = 'EXACT' | 'HIGH' | 'INTERPRETIVE';

export type ScreenAuthorityContractPreview = {
  keepFunction: boolean;
  rebuildLook: boolean;
  protectCurrentVisuals: boolean;
  screenshotQaRequired: boolean;
  visualConvergenceRequired: boolean;
};

export function deriveVisualConvergenceRequired(
  authorityMode: AuthorityModeOption,
  fidelityMode: FidelityModeOption,
): boolean {
  return authorityMode === 'DESIGN_AUTHORITY' && fidelityMode === 'EXACT';
}

export function buildContractPreview(
  authorityMode: AuthorityModeOption = 'DESIGN_AUTHORITY',
  fidelityMode: FidelityModeOption = 'EXACT',
): ScreenAuthorityContractPreview {
  const exactDesign = authorityMode === 'DESIGN_AUTHORITY' && fidelityMode === 'EXACT';
  return {
    keepFunction: true,
    rebuildLook: exactDesign,
    protectCurrentVisuals: false,
    screenshotQaRequired: exactDesign,
    visualConvergenceRequired: deriveVisualConvergenceRequired(authorityMode, fidelityMode),
  };
}

export function registerScreenAuthority(input: {
  brandFamilySkinId: string;
  packScreenType: StandardScreenType;
  moduleId?: string;
  screenType?: string;
  viewport: ScreenAuthorityViewport;
  referenceAssetId: string;
  referencePurpose?: DesignReferencePurpose;
  authorityMode?: AuthorityModeOption;
  fidelityMode?: FidelityModeOption;
  founderNote?: string | null;
  approvedByFounder?: boolean;
  projectId: string;
}) {
  const purpose: DesignReferencePurpose = input.referencePurpose ?? 'SCREEN_AUTHORITY';
  const route = routeReferenceJob(purpose);

  if (!screenAuthorityMustNotRouteToAssetPipeline(purpose)) {
    return {
      ok: false as const,
      failureCode: 'SCREEN_AUTHORITY_ROUTED_TO_ASSET_PIPELINE' as const,
      route,
    };
  }

  const prefill = buildScreenAuthorityPrefill(input.brandFamilySkinId, input.packScreenType);
  const moduleId = input.moduleId ?? prefill.moduleId;
  const screenType = input.screenType ?? prefill.screenType;
  const authorityMode = input.authorityMode ?? 'DESIGN_AUTHORITY';
  const fidelityMode = input.fidelityMode ?? 'EXACT';

  if (fidelityMode !== 'EXACT' && input.approvedByFounder) {
    return { ok: false as const, failureCode: 'SCREEN_AUTHORITY_FIDELITY_NOT_EXACT' as const };
  }

  const convergenceRequired = deriveVisualConvergenceRequired(authorityMode, fidelityMode);
  if (authorityMode === 'DESIGN_AUTHORITY' && fidelityMode === 'EXACT' && !convergenceRequired) {
    return { ok: false as const, failureCode: 'SCREEN_AUTHORITY_CONVERGENCE_NOT_REQUIRED' as const };
  }

  const existing = getSkinScreenAuthority(input.brandFamilySkinId, moduleId, screenType, input.viewport);
  const authority = existing
    ? replaceSkinScreenAuthorityVersion(existing.id, {
        referenceAssetId: input.referenceAssetId,
        approvedByFounder: input.approvedByFounder ?? true,
        founderNote: input.founderNote ?? null,
      })
    : createSkinScreenAuthority({
        brandFamilySkinId: input.brandFamilySkinId,
        moduleId,
        screenType,
        viewport: input.viewport,
        referenceAssetId: input.referenceAssetId,
        approvedByFounder: input.approvedByFounder ?? true,
        referencePurpose: purpose,
        jobType: 'SCREEN_AUTHORITY',
        founderNote: input.founderNote ?? null,
        authorityMode: authorityMode === 'DESIGN_AUTHORITY' ? 'DESIGN_AUTHORITY' : 'DESIGN_AUTHORITY',
        fidelityMode: fidelityMode === 'EXACT' ? 'EXACT' : 'EXACT',
      });

  if (!authority) {
    return { ok: false as const, failureCode: 'SCREEN_AUTHORITY_INGESTION_MISSING' as const };
  }

  if (input.approvedByFounder !== false) {
    approveSkinScreenAuthority(authority.id);
  }

  refreshSkinPack(input.brandFamilySkinId);
  const family = getBrandFamilySkinByKey(input.brandFamilySkinId);
  if (family) {
    updateContinuityAfterApprovedScreen(family.id, family.version, `SCREEN_${screenType}_${input.viewport}_APPROVED`);
  }

  const contractPreview = buildContractPreview(authorityMode, fidelityMode);
  const job = createSkinScreenImplementationJob(authority);

  return {
    ok: true as const,
    authority,
    job,
    contractPreview,
    prefill: {
      brandFamilySkinId: input.brandFamilySkinId,
      moduleId,
      screenType,
      viewport: input.viewport,
      packScreenType: input.packScreenType,
    },
    referencePurpose: purpose,
    jobType: 'SCREEN_AUTHORITY' as const,
    route,
    projectId: input.projectId,
  };
}

export function implementScreenAuthority(input: {
  brandFamilySkinId: string;
  moduleId: string;
  screenType: string;
  viewport: ScreenAuthorityViewport;
  projectId: string;
}) {
  const authority = getSkinScreenAuthority(
    input.brandFamilySkinId,
    input.moduleId,
    input.screenType,
    input.viewport,
  );
  if (!authority || authority.status !== 'APPROVED') {
    return { ok: false as const, failureCode: 'SCREEN_AUTHORITY_INGESTION_MISSING' as const };
  }

  const result = startScreenAuthorityImplementation(authority, input.projectId);
  if (!result.job) {
    return { ok: false as const, failureCode: 'SCREEN_AUTHORITY_IMPLEMENTATION_JOB_MISSING' as const };
  }

  return { ok: true as const, ...result };
}

export function getAuthorityCardPayload(
  brandFamilySkinId: string,
  moduleId: string,
  screenType: string,
  viewport: ScreenAuthorityViewport,
) {
  const authority = getSkinScreenAuthority(brandFamilySkinId, moduleId, screenType, viewport);
  if (!authority) return null;

  return {
    screenType: authority.screenType,
    moduleId: authority.moduleId,
    viewport: authority.viewport,
    version: authority.version,
    authorityMode: authority.authorityMode,
    fidelityMode: authority.fidelityMode,
    status: authority.status,
    implementationStatus: authority.implementationStatus,
    visualMatchStatus: authority.visualMatchStatus,
    visualConvergenceRequired: authority.visualConvergenceRequired,
    referenceAssetId: authority.referenceAssetId,
    approvedByFounder: authority.approvedByFounder,
    approvedAt: authority.approvedAt,
    jobType: authority.jobType,
    referencePurpose: authority.referencePurpose,
  };
}

export function getScreenPackWithAuthorities(brandFamilySkinId: string) {
  const authorities = listScreenAuthoritiesForFamily(brandFamilySkinId);
  return authorities;
}

export function simulateExecutionCompleteForAuthority(
  brandFamilySkinId: string,
  moduleId: string,
  screenType: string,
  viewport: ScreenAuthorityViewport,
) {
  const authority = getSkinScreenAuthority(brandFamilySkinId, moduleId, screenType, viewport);
  if (!authority) return null;
  return completeScreenAuthorityImplementation(authority);
}
