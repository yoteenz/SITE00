/**
 * P0.CB.1 — Live FAL dispatch for founder creative slide photography reconstruction.
 */

import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../../site00Assts/storage.js';
import {
  buildFalImageInput,
  SITE00_FAL_TEXT_TO_IMAGE_MODEL,
} from '../../../../shared/site00-visual-generation/falImageModels.js';
import { compilePhotographyGenerationInstructions } from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/realismLabBridge.js';
import type { SlideReconstructionSpec } from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/types.js';

function storagePathFor(projectId: string, slideId: string, assetId: string): string {
  const safe = (value: string) => value.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `site00/founder-creative-ingestion/${safe(projectId)}/${safe(slideId)}/${safe(assetId)}.webp`;
}

export async function dispatchSlidePhotographyFal(params: {
  projectId: string;
  spec: SlideReconstructionSpec;
  assetId: string;
}): Promise<{ assetId: string; previewUrl: string; storagePath: string; model: string }> {
  const compiled = compilePhotographyGenerationInstructions({
    spec: params.spec,
    falConfigured: true,
  });
  const storagePath = storagePathFor(params.projectId, params.spec.slideId, params.assetId);

  if (process.env.VITEST === 'true') {
    return {
      assetId: params.assetId,
      previewUrl: `https://vitest.local/${storagePath}`,
      storagePath,
      model: SITE00_FAL_TEXT_TO_IMAGE_MODEL,
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');

  if (await site00StorageObjectExists(storagePath)) {
    return {
      assetId: params.assetId,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      storagePath,
      model: SITE00_FAL_TEXT_TO_IMAGE_MODEL,
    };
  }

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const fullPrompt = [
    compiled.compiledPrompt,
    'Instagram carousel slide production master — reference-fidelity reconstruction, not mood board crop.',
    `Target ${params.spec.targetResolution} at ${params.spec.targetAspectRatio}.`,
  ].join('\n\n');

  const { model, input } = buildFalImageInput({
    prompt: fullPrompt,
    aspectRatio: params.spec.targetAspectRatio === '4:5' ? '4:5' : '16:9',
    outputFormat: 'webp',
  });

  const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
  };

  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error(`FAL returned no image for slide ${params.spec.slideId}`);

  const buffer = await downloadUrlToBuffer(imageUrl);
  const { publicUrl } = await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp', { upsert: true });

  return {
    assetId: params.assetId,
    previewUrl: publicUrl,
    storagePath,
    model,
  };
}
