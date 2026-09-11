/**
 * P0.VR.CAPTURE.1R3A — Upload founder page design authority to Supabase via page-mirror API.
 */

import type { DesignViewportClass } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import type { ReplaceDesignAuthorityUploadPayload } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/replaceDesignAuthorityFlow.js';
import { captureApiFetch, PAGE_MIRROR_PATH } from './captureApiFetch';

export async function uploadPageDesignAuthorityViaMirror(input: {
  projectId: string;
  screenId: string;
  viewport: DesignViewportClass;
  dataUrl: string;
  mimeType: string;
}): Promise<{ ok: true; upload: ReplaceDesignAuthorityUploadPayload } | { ok: false; message: string }> {
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
    return {
      ok: false,
      message: result.data?.error ?? result.errorCode ?? 'REFERENCE UPLOAD FAILED',
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
