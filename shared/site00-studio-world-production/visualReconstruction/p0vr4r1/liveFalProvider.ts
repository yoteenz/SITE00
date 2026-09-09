/**
 * P0.VR.4R1 — Live FAL provider health + dispatch for GPT Image 2 Edit.
 */

import { createHash } from 'node:crypto';
import {
  buildFalImageInput,
  SITE00_FAL_REFERENCE_EDIT_MODEL,
} from '../../../site00-visual-generation/falImageModels.js';
import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  uploadSite00AssetBuffer,
} from '../../../../api/_lib/site00Assts/storage.js';
import { isFalAccessibleReferenceUrl } from '../../../site00-visual-reference/referencePublicUrl.js';
import type { GenerationReceipt } from './types.js';

export type FalProviderHealth = {
  falKeyPresent: boolean;
  providerAvailable: boolean;
  editEndpointAvailable: boolean;
  liveDispatchAllowed: boolean;
  blocker: string | null;
};

export function checkFalProviderHealth(env?: { falKey?: string }): FalProviderHealth {
  const falKeyPresent = Boolean(env?.falKey?.trim());
  if (!falKeyPresent) {
    return {
      falKeyPresent: false,
      providerAvailable: false,
      editEndpointAvailable: false,
      liveDispatchAllowed: false,
      blocker: 'LIVE_FAL_BLOCKED: FAL_KEY missing',
    };
  }
  return {
    falKeyPresent: true,
    providerAvailable: true,
    editEndpointAvailable: true,
    liveDispatchAllowed: process.env.VITEST !== 'true',
    blocker: process.env.VITEST === 'true' ? 'LIVE_FAL_BLOCKED: vitest mode' : null,
  };
}

export type LiveFalGenerationResult =
  | {
      ok: true;
      receipt: GenerationReceipt;
      outputBuffer: Buffer;
      outputUrl: string;
    }
  | { ok: false; error: string; failureClass: string };

export async function dispatchLiveGptImage2Edit(input: {
  assetId: string;
  promptText: string;
  referenceCropUrl: string;
  promptVersion: number;
  falKey: string;
}): Promise<LiveFalGenerationResult> {
  if (process.env.VITEST === 'true') {
    return { ok: false, error: 'Live FAL blocked in vitest', failureClass: 'LIVE_FAL_PROVIDER_BLOCKED' };
  }

  if (!input.falKey?.trim()) {
    return { ok: false, error: 'FAL_KEY not configured', failureClass: 'LIVE_FAL_PROVIDER_BLOCKED' };
  }

  if (!isFalAccessibleReferenceUrl(input.referenceCropUrl)) {
    return {
      ok: false,
      error: `Reference crop URL not FAL-accessible: ${input.referenceCropUrl}`,
      failureClass: 'REFERENCE_NOT_SENT_TO_PROVIDER',
    };
  }

  const startedAt = new Date().toISOString();

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: input.falKey.trim() });

    const refBuffer = await downloadUrlToBuffer(input.referenceCropUrl);
    const refBlob = new Blob([refBuffer], { type: 'image/png' });
    const falReferenceUrl = await fal.storage.upload(refBlob);

    const { model: editModel, input: editInput } = buildFalImageInput({
      prompt: input.promptText,
      outputFormat: 'png',
      referenceImageUrls: [falReferenceUrl],
    });

    if (editModel !== SITE00_FAL_REFERENCE_EDIT_MODEL) {
      return { ok: false, error: 'Wrong model selected', failureClass: 'LIVE_GENERATION_FAILED' };
    }

    const result = (await fal.subscribe(editModel, { input: editInput as never, logs: false })) as {
      request_id?: string;
      data?: { images?: Array<{ url?: string }> };
    };

    const outputUrl = result?.data?.images?.[0]?.url;
    if (!outputUrl) {
      return { ok: false, error: 'FAL returned no image URL', failureClass: 'LIVE_GENERATION_FAILED' };
    }

    const outputBuffer = await downloadUrlToBuffer(outputUrl);
    const completedAt = new Date().toISOString();

    const receipt: GenerationReceipt = {
      requestId: result.request_id ?? `fal-${input.assetId}-${Date.now()}`,
      provider: 'fal',
      model: editModel,
      startedAt,
      completedAt,
      dispatchCount: 1,
      status: 'COMPLETED',
      outputUrl,
      promptVersion: input.promptVersion,
      referenceCropUrl: input.referenceCropUrl,
      gptImage2EditUsed: true,
      referencePassedToProvider: true,
    };

    return { ok: true, receipt, outputBuffer, outputUrl };
  } catch (err) {
    const falErr = err as { message?: string; body?: { detail?: string } };
    const detail = falErr.body?.detail;
    const message = detail ?? (err instanceof Error ? err.message : String(err));
    const failureClass =
      message.toLowerCase().includes('balance') || message.toLowerCase().includes('locked')
        ? 'LIVE_FAL_PROVIDER_BLOCKED'
        : 'LIVE_GENERATION_FAILED';
    return { ok: false, error: message, failureClass };
  }
}

export async function runBackgroundRemovalIfNeeded(input: {
  falKey: string;
  imageBuffer: Buffer;
  preference?: 'AUTO' | 'IDEOGRAM' | 'PIXELCUT' | 'FAL_BIREFNET';
  env?: { ideogramApiKey?: string; pixelcutApiKey?: string };
}): Promise<
  | { required: false; provider: null; requestId: null; resultUrl: null; buffer: Buffer }
  | { required: true; provider: string; model: string; requestId: string | null; resultUrl: string; buffer: Buffer }
> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: input.falKey.trim() });
  const model = 'fal-ai/birefnet/v2';
  const startedAt = Date.now();

  const blob = new Blob([input.imageBuffer], { type: 'image/png' });
  const uploaded = await fal.storage.upload(blob);

  const result = (await fal.subscribe(model, {
    input: { image_url: uploaded },
    logs: false,
  })) as { request_id?: string; data?: { image?: { url?: string } } };

  const resultUrl = result?.data?.image?.url;
  if (!resultUrl) {
    throw new Error('Background removal returned no URL');
  }

  const buffer = await downloadUrlToBuffer(resultUrl);
  return {
    required: true,
    provider: 'fal',
    model,
    requestId: result.request_id ?? `birefnet-${startedAt}`,
    resultUrl,
    buffer,
  };
}

export function hashBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

export async function uploadCanonicalAsset(input: {
  storagePath: string;
  buffer: Buffer;
  mimeType?: string;
}): Promise<{ publicUrl: string; storagePath: string }> {
  return uploadSite00AssetBuffer(input.storagePath, input.buffer, input.mimeType ?? 'image/png', { upsert: true });
}

export function getPublicUrlForPath(storagePath: string): string {
  return getSite00AssetPublicUrl(storagePath);
}
