/**
 * P0.VR.CAPTURE.1R3A — Upload founder page design authority to Supabase via page-mirror API.
 */

import type { DesignViewportClass } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import type { ReplaceDesignAuthorityUploadPayload } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/replaceDesignAuthorityFlow.js';
import {
  formatCaptureTransportError,
  isRecoverableAuthorityUploadError,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/formatCaptureTransportError.js';
import { captureApiFetch, PAGE_MIRROR_PATH } from './captureApiFetch';

export type AuthorityUploadAttempt =
  | { ok: true; upload: ReplaceDesignAuthorityUploadPayload; localOnly?: false }
  | { ok: true; upload: null; localOnly: true; warning: string }
  | { ok: false; message: string; recoverable: boolean };

export async function uploadPageDesignAuthorityViaMirror(input: {
  projectId: string;
  screenId: string;
  viewport: DesignViewportClass;
  dataUrl: string;
  mimeType: string;
}): Promise<
  | { ok: true; upload: ReplaceDesignAuthorityUploadPayload }
  | { ok: false; message: string; errorCode: string | null; recoverable: boolean }
> {
  const result = await captureApiFetch<{
    publicUrl?: string;
    storagePath?: string;
    byteSize?: number;
    error?: string;
  }>(PAGE_MIRROR_PATH, {
    method: 'POST',
    body: {
      action: 'upload_design_authority',
      projectId: input.projectId,
      screenId: input.screenId,
      viewportClass: input.viewport,
      mimeType: input.mimeType,
      dataUrl: input.dataUrl,
    },
    timeoutMs: 60_000,
  });

  if (!result.ok || !result.data?.publicUrl || !result.data.storagePath) {
    const errorCode = result.errorCode ?? result.data?.error ?? null;
    const recoverable = isRecoverableAuthorityUploadError(errorCode);
    return {
      ok: false,
      message: formatCaptureTransportError(errorCode),
      errorCode,
      recoverable,
    };
  }

  return {
    ok: true,
    upload: {
      publicUrl: result.data.publicUrl,
      storagePath: result.data.storagePath,
      byteSize: result.data.byteSize ?? 0,
    },
  };
}

/** Try cloud upload; on recoverable transport failure allow device-local authority save. */
export async function resolveDesignAuthorityUpload(input: {
  projectId: string;
  screenId: string;
  viewport: DesignViewportClass;
  dataUrl: string;
  mimeType: string;
}): Promise<AuthorityUploadAttempt> {
  const remote = await uploadPageDesignAuthorityViaMirror(input);
  if (remote.ok) {
    return { ok: true, upload: remote.upload, localOnly: false };
  }
  if (remote.recoverable) {
    return {
      ok: true,
      upload: null,
      localOnly: true,
      warning: `${remote.message} SAVED ON THIS DEVICE ONLY — retry after Railway redeploy for cloud sync.`,
    };
  }
  return { ok: false, message: remote.message, recoverable: false };
}
