/**
 * P0.VR.CAPTURE.1R1 — Per-viewport design authority (separate from page identity).
 */

import type { DesignViewportClass } from '../visualReconstruction/p0vr2/types.js';
import {
  getActiveCanonicalReference,
  getActiveImplementationCanon,
} from '../visualReconstruction/p0vr2/canonicalReferenceRegistry.js';
import { ensureNdxbookPilotRegistered } from '../visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { resolveAssetRenderableUrl } from '../assetDelivery/assetRenderableUrlResolver.js';
import { resolveCurrentDesignAuthority } from '../visualReconstruction/p0vrCapture1R3a/currentDesignAuthorityResolver.js';

export const DESIGN_AUTHORITY_STATUSES = [
  'MISSING',
  'PROPOSED',
  'MAPPED',
  'APPROVED',
  'STALE',
  'CONFLICTED',
] as const;

export type DesignAuthorityStatus = (typeof DESIGN_AUTHORITY_STATUSES)[number];

export type PageViewportAuthority = {
  pageId: string;
  screenId: string;
  viewport: DesignViewportClass;
  referenceId: string | null;
  authorityStatus: DesignAuthorityStatus;
  approvedAt: string | null;
  sourceType: 'APPROVED_REFERENCE' | 'APPROVED_CANON' | 'MAPPED_ROUTE' | 'PROPOSED' | 'NONE';
  previewUrl: string | null;
  /** Canonical storage path before URL resolution (for delivery trace). */
  previewAssetRef: string | null;
  previewSource: 'APPROVED_REFERENCE' | 'APPROVED_CANON' | 'REFERENCE_THUMBNAIL' | 'PLACEHOLDER' | 'NONE';
};

export type DesignAuthorityPreview = {
  previewUrl: string | null;
  assetRef: string | null;
  previewSource: PageViewportAuthority['previewSource'];
  label: string;
};

function mapCanonToAuthorityStatus(
  hasReference: boolean,
  canon: ReturnType<typeof getActiveImplementationCanon>,
  mappedOnly: boolean,
): DesignAuthorityStatus {
  if (!hasReference) {
    return mappedOnly ? 'MAPPED' : 'MISSING';
  }
  if (!canon) return 'PROPOSED';
  if (canon.status === 'ACTIVE' && canon.founderJudgment === 'MATCHES') return 'APPROVED';
  if (canon.status === 'STALE_AGAINST_NEW_REFERENCE') return 'STALE';
  if (canon.status === 'ACTIVE') return 'APPROVED';
  return 'PROPOSED';
}

export function resolvePageViewportAuthority(input: {
  projectId: string;
  pageId: string;
  screenId: string;
  viewport: DesignViewportClass;
  routeMapped?: boolean;
  isRoot?: boolean;
}): PageViewportAuthority {
  if (input.projectId === 'ndxbook') {
    ensureNdxbookPilotRegistered();
  }

  const rootScreenId =
    input.isRoot && input.screenId === 'desktop-overview' ? 'overview' : input.screenId;
  const reference = getActiveCanonicalReference(input.projectId, rootScreenId, input.viewport);
  const canon = getActiveImplementationCanon(input.projectId, rootScreenId, input.viewport);
  const mappedOnly = Boolean(input.routeMapped && !reference);
  const authorityStatus = mapCanonToAuthorityStatus(Boolean(reference), canon, mappedOnly);

  const currentAuthority = resolveCurrentDesignAuthority({
    projectId: input.projectId,
    pageId: input.pageId,
    screenId: rootScreenId,
    viewport: input.viewport,
  });

  const founderCurrent = currentAuthority.authorityVersion?.status === 'CURRENT';

  const preview = founderCurrent
    ? {
        previewUrl: currentAuthority.previewUrl,
        assetRef: currentAuthority.previewAssetRef,
        previewSource: 'APPROVED_REFERENCE' as const,
        label: 'DESIGN AUTHORITY',
      }
    : resolveDesignAuthorityPreview({
        referencePath: reference?.storagePath ?? null,
        canonPath: canon?.renderSnapshotPath ?? null,
        authorityStatus,
      });

  const resolvedAuthorityStatus = founderCurrent
    ? 'APPROVED'
    : currentAuthority.isStale
      ? 'STALE'
      : authorityStatus;

  return {
    pageId: input.pageId,
    screenId: rootScreenId,
    viewport: input.viewport,
    referenceId: reference?.referenceId ?? null,
    authorityStatus: resolvedAuthorityStatus,
    approvedAt: currentAuthority.approvedAt ?? (canon?.approvalDate || null),
    sourceType: reference
      ? canon?.status === 'ACTIVE'
        ? 'APPROVED_CANON'
        : 'APPROVED_REFERENCE'
      : mappedOnly
        ? 'MAPPED_ROUTE'
        : 'NONE',
    previewUrl: preview.previewUrl,
    previewAssetRef: preview.assetRef,
    previewSource: preview.previewSource,
  };
}

function resolveAuthorityPreviewUrl(path: string | null): string | null {
  if (!path) return null;
  const resolved = resolveAssetRenderableUrl(path);
  return resolved.url;
}

export function resolveDesignAuthorityPreview(input: {
  referencePath: string | null;
  canonPath?: string | null;
  authorityStatus: DesignAuthorityStatus;
}): DesignAuthorityPreview {
  if (input.authorityStatus === 'APPROVED' || input.authorityStatus === 'STALE') {
    if (input.referencePath) {
      return {
        previewUrl: resolveAuthorityPreviewUrl(input.referencePath),
        assetRef: input.referencePath,
        previewSource: 'APPROVED_REFERENCE',
        label: 'DESIGN AUTHORITY',
      };
    }
    if (input.canonPath) {
      return {
        previewUrl: resolveAuthorityPreviewUrl(input.canonPath),
        assetRef: input.canonPath,
        previewSource: 'APPROVED_CANON',
        label: 'DESIGN AUTHORITY',
      };
    }
  }

  if (input.referencePath && input.authorityStatus === 'PROPOSED') {
    return {
      previewUrl: resolveAuthorityPreviewUrl(input.referencePath),
      assetRef: input.referencePath,
      previewSource: 'REFERENCE_THUMBNAIL',
      label: 'PROPOSED REFERENCE',
    };
  }

  return {
    previewUrl: null,
    assetRef: null,
    previewSource: 'PLACEHOLDER',
    label: input.authorityStatus === 'MAPPED' ? 'MAPPED — NOT APPROVED' : 'DESIGN AUTHORITY MISSING',
  };
}

export function authorityStatusLabel(status: DesignAuthorityStatus, options?: { isCurrent?: boolean }): string {
  if (options?.isCurrent && status === 'APPROVED') return 'CURRENT ✓';
  switch (status) {
    case 'APPROVED':
      return 'APPROVED ✓';
    case 'MAPPED':
      return 'MAPPED';
    case 'PROPOSED':
      return 'PROPOSED';
    case 'STALE':
      return 'APPROVED · STALE';
    case 'CONFLICTED':
      return 'CONFLICTED';
    default:
      return 'MISSING';
  }
}

export function canReplaceDesignAuthority(status: DesignAuthorityStatus): boolean {
  return status === 'APPROVED' || status === 'STALE' || status === 'PROPOSED';
}

export function shouldSetDesignAuthority(status: DesignAuthorityStatus): boolean {
  return status === 'MISSING' || status === 'MAPPED';
}

export function resolveRootUpgradePrimaryAction(authority: PageViewportAuthority): 'SET_DESIGN_AUTHORITY' | 'UPGRADE_THIS_PAGE' {
  if (authority.authorityStatus === 'APPROVED' || authority.authorityStatus === 'STALE') {
    return 'UPGRADE_THIS_PAGE';
  }
  return 'SET_DESIGN_AUTHORITY';
}
