/**
 * P0.VR.CAPTURE.1R3A — Current design authority keyed by project + page + viewport.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import {
  getActiveCanonicalReference,
  getActiveImplementationCanon,
} from '../p0vr2/canonicalReferenceRegistry.js';
import { resolveAssetRenderableUrl } from '../../assetDelivery/assetRenderableUrlResolver.js';
import { readFounderAuthorityUpload } from './founderAuthorityUploadStore.js';
import {
  getCurrentDesignAuthorityVersion,
  listDesignAuthorityHistory,
  type DesignAuthorityVersion,
} from './designAuthorityVersion.js';

export type CurrentDesignAuthority = {
  referenceId: string | null;
  storagePath: string | null;
  previewAssetRef: string | null;
  previewUrl: string | null;
  authorityVersion: DesignAuthorityVersion | null;
  isStale: boolean;
  isCurrent: boolean;
  approvedAt: string | null;
};

function resolveAuthorityPreviewUrl(storagePath: string | null): string | null {
  if (!storagePath) return null;
  const local = readFounderAuthorityUpload(storagePath);
  if (local?.startsWith('data:')) return local;
  return resolveAssetRenderableUrl(storagePath).url;
}

export function resolveCurrentDesignAuthority(input: {
  projectId: string;
  pageId: string;
  screenId: string;
  viewport: DesignViewportClass;
}): CurrentDesignAuthority {
  const reference = getActiveCanonicalReference(input.projectId, input.screenId, input.viewport);
  const canon = getActiveImplementationCanon(input.projectId, input.screenId, input.viewport);
  const version = getCurrentDesignAuthorityVersion(input.projectId, input.pageId, input.viewport);
  const isStale = canon?.status === 'STALE_AGAINST_NEW_REFERENCE';
  const storagePath = reference?.storagePath ?? version?.storagePath ?? null;

  return {
    referenceId: reference?.referenceId ?? version?.referenceId ?? null,
    storagePath,
    previewAssetRef: storagePath,
    previewUrl: resolveAuthorityPreviewUrl(storagePath),
    authorityVersion: version,
    isStale,
    isCurrent: Boolean(reference && !isStale),
    approvedAt: canon?.approvalDate || version?.approvedAt || null,
  };
}

export function listPageDesignAuthorityHistory(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): DesignAuthorityVersion[] {
  return listDesignAuthorityHistory(projectId, pageId, viewport);
}
