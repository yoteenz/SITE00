/**
 * P0.VR.CAPTURE.1R3A — Page-scoped design authority replacement flow.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import {
  getActiveCanonicalReference,
  promoteReferenceToCanonical,
  promoteVisualImplementationCanon,
  registerCanonicalVisualReference,
} from '../p0vr2/canonicalReferenceRegistry.js';
import { persistCanonicalRegistrySnapshot } from '../p0vr2/canonicalReferencePersistence.js';
import { SUPPORTED_AUTHORITY_UPLOAD_MIMES } from './constants.js';
import {
  buildFounderAuthorityStoragePath,
  fileToDataUrl,
  persistFounderAuthorityUpload,
} from './founderAuthorityUploadStore.js';
import {
  getCurrentDesignAuthorityVersion,
  recordDesignAuthorityVersion,
  supersedeDesignAuthorityVersions,
  type DesignAuthorityVersion,
} from './designAuthorityVersion.js';
import {
  recordDesignAuthorityApprovalReceipt,
  recordDesignAuthoritySupersessionReceipt,
  type DesignAuthoritySupersessionReason,
} from './designAuthorityReceipts.js';

export type ReplaceDesignAuthorityContext = {
  projectId: string;
  pageId: string;
  screenId: string;
  route: string;
  viewport: DesignViewportClass;
  displayName: string;
};

export type ReplaceDesignAuthorityDraft = {
  context: ReplaceDesignAuthorityContext;
  storagePath: string;
  previewDataUrl: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
};

export type ReplaceDesignAuthorityUploadPayload = {
  storagePath: string;
  publicUrl: string;
  byteSize: number;
};

export type ReplaceDesignAuthorityResult =
  | { ok: true; version: DesignAuthorityVersion; referenceId: string; publicUrl: string }
  | { ok: false; errorCode: 'UPLOAD_FAILED' | 'INVALID_MIME' | 'APPROVAL_FAILED'; message: string };

export function validateAuthorityUploadFile(file: File): { ok: boolean; errorCode?: 'INVALID_MIME' } {
  if (!SUPPORTED_AUTHORITY_UPLOAD_MIMES.includes(file.type as (typeof SUPPORTED_AUTHORITY_UPLOAD_MIMES)[number])) {
    return { ok: false, errorCode: 'INVALID_MIME' };
  }
  return { ok: true };
}

export async function beginReplaceDesignAuthorityFromDataUrl(
  context: ReplaceDesignAuthorityContext,
  previewDataUrl: string,
  mimeType: string,
  byteSize: number,
  extension?: string,
): Promise<{ ok: true; draft: ReplaceDesignAuthorityDraft } | { ok: false; errorCode: 'UPLOAD_FAILED' | 'INVALID_MIME'; message: string }> {
  try {
    const ext = extension ?? (mimeType.includes('jpeg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png');
    const storagePath = buildFounderAuthorityStoragePath({
      projectId: context.projectId,
      screenId: context.screenId,
      viewport: context.viewport,
      extension: ext,
    });

    const viewportDims =
      CANONICAL_VIEWPORT_DIMENSIONS[context.viewport] ?? CANONICAL_VIEWPORT_DIMENSIONS.mobile;
    let width: number = viewportDims.width;
    let height: number = viewportDims.height;
    try {
      const decoded = await loadImageDimensions(previewDataUrl);
      width = decoded.width;
      height = decoded.height;
    } catch {
      /* vitest / tiny fixture buffers */
    }

    return {
      ok: true,
      draft: {
        context,
        storagePath,
        previewDataUrl,
        mimeType,
        byteSize,
        width,
        height,
      },
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      errorCode: 'UPLOAD_FAILED',
      message: detail.trim() ? detail : 'REFERENCE UPLOAD FAILED',
    };
  }
}

export async function beginReplaceDesignAuthorityUpload(
  context: ReplaceDesignAuthorityContext,
  file: File,
): Promise<{ ok: true; draft: ReplaceDesignAuthorityDraft } | { ok: false; errorCode: 'UPLOAD_FAILED' | 'INVALID_MIME'; message: string }> {
  const valid = validateAuthorityUploadFile(file);
  if (!valid.ok) {
    return { ok: false, errorCode: valid.errorCode ?? 'INVALID_MIME', message: 'REFERENCE UPLOAD FAILED — unsupported format.' };
  }

  try {
    const previewDataUrl = await fileToDataUrl(file);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    return beginReplaceDesignAuthorityFromDataUrl(context, previewDataUrl, file.type, file.size, ext);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      errorCode: 'UPLOAD_FAILED',
      message: detail.trim() ? detail : 'REFERENCE UPLOAD FAILED',
    };
  }
}

function loadImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  if (typeof globalThis.Image === 'undefined') {
    return Promise.resolve({ width: 390, height: 844 });
  }
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || img.width || CANONICAL_VIEWPORT_DIMENSIONS.mobile.width,
        height: img.naturalHeight || img.height || CANONICAL_VIEWPORT_DIMENSIONS.mobile.height,
      });
    img.onerror = () => reject(new Error('DECODE_FAILED'));
    img.src = dataUrl;
  });
}

export function approveDesignAuthorityReplacement(
  draft: ReplaceDesignAuthorityDraft,
  uploaded?: ReplaceDesignAuthorityUploadPayload | null,
  options?: { reason?: DesignAuthoritySupersessionReason },
): ReplaceDesignAuthorityResult {
  const { context } = draft;
  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[context.viewport];
  const existing = getActiveCanonicalReference(context.projectId, context.screenId, context.viewport);
  const storagePath = uploaded?.storagePath ?? draft.storagePath;
  const renderableRef = uploaded?.publicUrl ?? draft.storagePath;

  try {
    persistFounderAuthorityUpload(storagePath, uploaded?.publicUrl ?? draft.previewDataUrl);

    const reference = registerCanonicalVisualReference({
      projectId: context.projectId,
      screenId: context.screenId,
      route: context.route,
      viewportClass: context.viewport,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      scope: 'FULL_SCREEN_REFERENCE',
      scopeTargetId: context.screenId,
      assetId: `${context.screenId}-${context.viewport}-founder-upload`,
      storagePath: renderableRef.startsWith('http') ? renderableRef : storagePath,
      createdBy: 'founder-upload-page-scoped',
      supersedes: existing?.referenceId ?? null,
      status: 'ACTIVE_CANONICAL',
    });

    promoteVisualImplementationCanon({
      projectId: context.projectId,
      screenId: context.screenId,
      route: context.route,
      viewportClass: context.viewport,
      referenceId: reference.referenceId,
      referenceVersion: reference.version,
      implementationVersion: 'P0.VR.CAPTURE.1R3A',
      visualScore: 1,
      renderSnapshotPath: null,
      approvalDate: new Date().toISOString(),
      founderJudgment: 'MATCHES',
    });

    const authorityVersionId = `authv_${context.projectId}_${context.screenId}_${context.viewport}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const previous = getCurrentDesignAuthorityVersion(context.projectId, context.pageId, context.viewport);
    const reason = options?.reason ?? 'FOUNDER_REPLACE';
    const approvedAt = new Date().toISOString();

    supersedeDesignAuthorityVersions({
      projectId: context.projectId,
      pageId: context.pageId,
      viewport: context.viewport,
      supersededBy: authorityVersionId,
      at: approvedAt,
    });

    const assetRef = uploaded?.publicUrl ?? storagePath;

    const version = recordDesignAuthorityVersion({
      authorityVersionId,
      projectId: context.projectId,
      pageId: context.pageId,
      screenId: context.screenId,
      viewport: context.viewport,
      route: context.route,
      referenceId: reference.referenceId,
      assetRef,
      storagePath: uploaded?.storagePath ?? draft.storagePath,
      status: 'CURRENT',
      approvedAt,
      supersededAt: null,
      supersededBy: null,
      source: 'FOUNDER_UPLOAD',
      createdAt: approvedAt,
    });

    if (previous) {
      recordDesignAuthoritySupersessionReceipt({
        oldAuthorityVersionId: previous.authorityVersionId,
        newAuthorityVersionId: authorityVersionId,
        supersededAt: approvedAt,
        reason,
      });
    }

    recordDesignAuthorityApprovalReceipt({
      projectId: context.projectId,
      pageId: context.pageId,
      viewport: context.viewport,
      oldAuthorityVersionId: previous?.authorityVersionId ?? null,
      newAuthorityVersionId: authorityVersionId,
      approvedAt,
      status: 'APPROVED',
      reason,
    });

    persistCanonicalRegistrySnapshot(context.projectId);

    return {
      ok: true,
      version,
      referenceId: reference.referenceId,
      publicUrl: uploaded?.publicUrl ?? renderableRef,
    };
  } catch (err) {
    return {
      ok: false,
      errorCode: 'APPROVAL_FAILED',
      message: err instanceof Error ? err.message : 'APPROVAL_FAILED',
    };
  }
}

export function cancelDesignAuthorityReplacement(): { ok: true } {
  return { ok: true };
}

/** Promote staged draft reference if using registry draft path. */
export function finalizeDraftReferenceIfNeeded(referenceId: string): void {
  promoteReferenceToCanonical(referenceId);
}
