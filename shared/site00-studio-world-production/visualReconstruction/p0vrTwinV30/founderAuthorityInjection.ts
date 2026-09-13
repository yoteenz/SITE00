/**
 * P0.VR.TWINV3.0R5F2 — one-time founder authority injection (bypasses broken in-product pair-lock UI only).
 */

import {
  AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_ID,
  AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_STATUS,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  P0_VR_TWIN_V30_BUILD,
  P0_VR_TWIN_V30R5F2_LINEAGE,
} from './constants.js';
import {
  computePairChecksum,
  emptyAuthorityPipelineState,
  getProjectCreativeContextVersion,
  runDesignAuthorityPairReadinessGate,
} from './designWorkspaceAuthorityPipeline.js';
import { loadActiveDesignWorkspaceFeatureManifest } from './designWorkspaceFeatureAuthority/designWorkspaceFeatureManifestV1.js';
import { buildPromotionFeatureBindings } from './designWorkspaceFeatureAuthority/masterFeatureBinding.js';
import { emptyDesignWorkspaceFeatureAuthorityState } from './designWorkspaceFeatureAuthority/featureAuthorityState.js';
import { normalizeDesignPageAuthoritySession } from './designPageAuthorityTerritoryGallery.js';
import { PROJECT_CREATIVE_CONTEXT_VERSION } from './projectCreativeGrounding/types.js';
import type { DesignPageAuthorityReviewSession } from './types.js';
import type {
  AuthorityImageDisplayBrokenIssue,
  DesignWorkspaceAuthorityPair,
  DesignWorkspaceViewport,
  FounderAttachedAuthorityAssetRecord,
  FounderAuthorityInjectionReceipt,
  ViewportMasterAuthority,
} from './designWorkspaceAuthorityTypes.js';

const FOUNDER_CANDIDATE_SENTINEL = 'founder-attached-authority-r5f2';

export type FounderAuthorityAssetSpec = {
  viewport: DesignWorkspaceViewport;
  spec: typeof FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER | typeof FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER;
};

export const FOUNDER_R5F2_NDXBOOK_ASSET_SPECS: readonly FounderAuthorityAssetSpec[] = [
  { viewport: 'MOBILE', spec: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER },
  { viewport: 'DESKTOP', spec: FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER },
] as const;

export const RETAINED_FOUNDER_INJECTION_VALIDATION_GATES = [
  'authority_integrity',
  'viewport_validation',
  'project_context_version',
  'feature_manifest_version',
  'pair_checksum',
  'stale_detection',
  'derivation_readiness',
] as const;

function authorityImageHashFromFounderAsset(originalFileHashSha256: string, viewport: DesignWorkspaceViewport): string {
  return `sha256:${originalFileHashSha256}|${viewport}`;
}

export function registerFounderAttachedAuthorityAsset(input: {
  projectId: string;
  viewport: DesignWorkspaceViewport;
  spec: typeof FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER | typeof FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER;
  ingestedAt?: string;
}): FounderAttachedAuthorityAssetRecord {
  const ingestedAt = input.ingestedAt ?? new Date().toISOString();
  const canonicalStoredAssetId = `faa-${input.viewport.toLowerCase()}-r5f2-${input.spec.originalFileHashSha256.slice(0, 12)}`;
  return {
    id: `faar-${input.viewport.toLowerCase()}-${Date.now()}`,
    originalFilename: input.spec.originalFilename,
    canonicalStoredAssetId,
    originalFileHashSha256: input.spec.originalFileHashSha256,
    canonicalStoredFileHashSha256: input.spec.originalFileHashSha256,
    widthPx: input.spec.widthPx,
    heightPx: input.spec.heightPx,
    mimeType: input.spec.mimeType,
    ingestedAt,
    projectId: input.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    viewport: input.viewport,
    sourceLineage: 'FOUNDER_ATTACHED_AUTHORITY',
    founderJudgment: 'APPROVED',
    storageUri: input.spec.publicPath,
  };
}

export function buildViewportMasterFromFounderAsset(input: {
  projectId: string;
  viewport: DesignWorkspaceViewport;
  asset: FounderAttachedAuthorityAssetRecord;
  recoveryReceiptId: string;
  projectCreativeContextVersion: string;
  featureManifestVersion: string;
  promotedAt: string;
}): ViewportMasterAuthority {
  const hash = authorityImageHashFromFounderAsset(input.asset.originalFileHashSha256, input.viewport);
  return {
    id: `vma-founder-${input.viewport.toLowerCase()}-r5f2-v1-${input.promotedAt.replace(/[:.]/g, '')}`,
    projectId: input.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    viewport: input.viewport,
    sourceConceptCandidateId: FOUNDER_CANDIDATE_SENTINEL,
    sourceGenerationId: 0,
    sourceTerritoryId: 'A',
    authorityImageId: input.asset.canonicalStoredAssetId,
    authorityImageHash: hash,
    authorityImageUri: input.asset.storageUri,
    projectCreativeContextVersion: input.projectCreativeContextVersion,
    designWorkspaceFeatureManifestVersion: input.featureManifestVersion,
    groundingManifestId: null,
    lineageId: P0_VR_TWIN_V30R5F2_LINEAGE,
    promotedBy: 'FOUNDER_AUTHORIZED_RECOVERY',
    promotedAt: input.promotedAt,
    status: 'PROMOTED',
    version: 1,
    supersedesAuthorityId: null,
    immutableAfterPairLock: false,
    sourceType: 'FOUNDER_ATTACHED_AUTHORITY',
    founderApproved: true,
    recoveryReceiptId: input.recoveryReceiptId,
    authorityAssetRecordId: input.asset.id,
  };
}

export function openAuthorityImageDisplayBrokenIssue(): AuthorityImageDisplayBrokenIssue {
  return {
    issueId: AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_ID,
    status: AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_STATUS === 'OPEN' ? 'OPEN' : 'CLOSED',
    diagnostics: [
      'Gallery batch thumbnails may 404 on tunnel/cPanel when storageUrl uses public path without bundled fallback',
      'Signed FAL URLs may expire while persisted in localStorage',
      'resolveDesignPageAuthorityImageSrc may not map founder JPG public paths until v410',
      'Stale object URLs or SPA HTML responses can break img onError recovery',
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function assertFounderAssetViewportMatch(
  viewport: DesignWorkspaceViewport,
  specViewport: DesignWorkspaceViewport,
): void {
  if (viewport !== specViewport) {
    throw new Error('FOUNDER_AUTHORITY_VIEWPORT_MISMATCH');
  }
}

/** Idempotent when pair already locked via same recovery receipt lineage. */
export function applyOneTimeFounderAuthorityInjection(
  session: DesignPageAuthorityReviewSession,
  input?: { injectedBy?: string; projectId?: string },
): DesignPageAuthorityReviewSession {
  const projectId = input?.projectId ?? DESIGN_PAGE_V3_PILOT_PROJECT_ID;
  if (session.projectId !== projectId) {
    throw new Error('FOUNDER_INJECTION_PROJECT_MISMATCH');
  }

  const pipeline = session.authorityPipeline ?? emptyAuthorityPipelineState();
  if (pipeline.authorityPair?.status === 'PAIR_LOCKED' && pipeline.founderAuthorityInjectionReceipt?.status === 'PASS') {
    return session;
  }
  if (pipeline.authorityPair?.status === 'PAIR_LOCKED') {
    throw new Error('DESIGN_AUTHORITY_PAIR_LOCKED');
  }

  const injectedAt = new Date().toISOString();
  const injectedBy = input?.injectedBy ?? 'FOUNDER_AUTHORIZED_RECOVERY';
  const contextVersion = getProjectCreativeContextVersion(session) || PROJECT_CREATIVE_CONTEXT_VERSION;
  const manifest = loadActiveDesignWorkspaceFeatureManifest();
  const featureManifestVersion = manifest.version;

  const mobileAsset = registerFounderAttachedAuthorityAsset({
    projectId,
    viewport: 'MOBILE',
    spec: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
    ingestedAt: injectedAt,
  });
  const desktopAsset = registerFounderAttachedAuthorityAsset({
    projectId,
    viewport: 'DESKTOP',
    spec: FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER,
    ingestedAt: injectedAt,
  });

  const receiptId = `fair-${projectId}-r5f2-${injectedAt.replace(/[:.]/g, '')}`;
  const mobileMaster = buildViewportMasterFromFounderAsset({
    projectId,
    viewport: 'MOBILE',
    asset: mobileAsset,
    recoveryReceiptId: receiptId,
    projectCreativeContextVersion: contextVersion,
    featureManifestVersion,
    promotedAt: injectedAt,
  });
  const desktopMaster = buildViewportMasterFromFounderAsset({
    projectId,
    viewport: 'DESKTOP',
    asset: desktopAsset,
    recoveryReceiptId: receiptId,
    projectCreativeContextVersion: contextVersion,
    featureManifestVersion,
    promotedAt: injectedAt,
  });

  const pairVersion = (pipeline.supersededPairs.length ?? 0) + 1;
  const pairChecksum = computePairChecksum(mobileMaster, desktopMaster, pairVersion);
  const pair: DesignWorkspaceAuthorityPair = {
    id: `dwap-founder-r5f2-${pairVersion}-${Date.now()}`,
    projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    mobileAuthorityId: mobileMaster.id,
    desktopAuthorityId: desktopMaster.id,
    pairVersion,
    status: 'PAIR_LOCKED',
    createdAt: injectedAt,
    lockedAt: injectedAt,
    lockedBy: 'FOUNDER_AUTHORIZED_RECOVERY',
    projectCreativeContextVersion: contextVersion,
    designWorkspaceFeatureManifestVersion: featureManifestVersion,
    pairChecksum,
    supersedesPairId: pipeline.supersededPairs.at(-1)?.id ?? null,
    derivationStatus: 'READY',
    sourceType: 'FOUNDER_AUTHORITY_INJECTION',
    recoveryReceiptId: receiptId,
  };

  const receipt: FounderAuthorityInjectionReceipt = {
    id: receiptId,
    projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    reason: 'AUTHORITY_IMAGE_DISPLAY_BROKEN_IN_DESIGN_WORKSPACE',
    mobileAuthorityId: mobileMaster.id,
    desktopAuthorityId: desktopMaster.id,
    mobileFileHash: mobileAsset.originalFileHashSha256,
    desktopFileHash: desktopAsset.originalFileHashSha256,
    projectCreativeContextVersion: contextVersion,
    featureManifestVersion,
    injectedBy,
    injectedAt,
    normalWorkflowBypassedStep: 'IN_PRODUCT_VISUAL_PAIR_LOCK_INTERACTION',
    retainedValidationGates: [...RETAINED_FOUNDER_INJECTION_VALIDATION_GATES],
    status: 'PASS',
  };

  const lockedMobile: ViewportMasterAuthority = {
    ...mobileMaster,
    status: 'PAIR_LOCKED',
    immutableAfterPairLock: true,
  };
  const lockedDesktop: ViewportMasterAuthority = {
    ...desktopMaster,
    status: 'PAIR_LOCKED',
    immutableAfterPairLock: true,
  };

  let nextPipeline = {
    ...pipeline,
    mobileMaster: lockedMobile,
    desktopMaster: lockedDesktop,
    authorityPair: pair,
    executionIntent: 'TRANSLATION' as const,
    inventionBudget: 'NONE' as const,
    founderAuthorityInjectionReceipt: receipt,
    founderAuthorityAssets: [mobileAsset, desktopAsset],
    authorityImageDisplayIssue: openAuthorityImageDisplayBrokenIssue(),
    events: [
      ...pipeline.events,
      {
        id: `ape-founder-r5f2-${pipeline.events.length}`,
        type: 'FOUNDER_AUTHORITY_INJECTION' as const,
        at: injectedAt,
        pairId: pair.id,
        authorityId: lockedMobile.id,
        note: P0_VR_TWIN_V30R5F2_LINEAGE,
      },
      {
        id: `ape-pair-lock-r5f2-${pipeline.events.length + 1}`,
        type: 'PAIR_LOCKED' as const,
        at: injectedAt,
        pairId: pair.id,
      },
    ],
  };

  const gate = runDesignAuthorityPairReadinessGate(
    normalizeDesignPageAuthoritySession({
      ...session,
      authorityPipeline: nextPipeline,
    }),
    { requireLocked: true },
  );
  if (!gate.pass) {
    receipt.status = 'FAIL';
    throw new Error(gate.errors[0] ?? 'FOUNDER_INJECTION_GATE_FAILED');
  }

  const featureAuthority = session.featureAuthority ?? emptyDesignWorkspaceFeatureAuthorityState();
  const mobileBindings = buildPromotionFeatureBindings(lockedMobile, manifest.requiredFeatureIds);
  const desktopBindings = buildPromotionFeatureBindings(lockedDesktop, manifest.requiredFeatureIds);

  const founderReview = {
    ...session.founderReview,
    mobileApproved: true,
    desktopApproved: true,
    lastAction: 'APPROVE' as const,
    updatedAt: injectedAt,
  };

  return normalizeDesignPageAuthoritySession({
    ...session,
    buildRef: P0_VR_TWIN_V30_BUILD,
    authorityPipeline: nextPipeline,
    featureAuthority: {
      ...featureAuthority,
      activeManifest: manifest,
      masterBindings: [...featureAuthority.masterBindings, ...mobileBindings, ...desktopBindings],
    },
    founderReview,
    updatedAt: injectedAt,
  });
}

export function derivationPrimaryActionLabel(session: DesignPageAuthorityReviewSession): string {
  const pair = session.authorityPipeline?.authorityPair;
  if (pair?.status === 'PAIR_LOCKED' && pair.derivationStatus === 'READY') {
    return 'GENERATE DERIVATIVES';
  }
  if (pair?.derivationStatus === 'STALE') return 'RELOCK OR AMEND BEFORE DERIVATION';
  return 'LOCK AUTHORITY PAIR';
}

export function isFounderInjectedAuthorityPair(session: DesignPageAuthorityReviewSession): boolean {
  return session.authorityPipeline?.authorityPair?.sourceType === 'FOUNDER_AUTHORITY_INJECTION';
}
