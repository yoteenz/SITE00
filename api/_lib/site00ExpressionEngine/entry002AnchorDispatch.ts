/**
 * Sprint B3 — FAL dispatch for ENTRY 002 COVER creative anchor.
 */

import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../site00Assts/storage.js';
import {
  buildFalImageInput,
  SITE00_FAL_TEXT_TO_IMAGE_MODEL,
} from '../../../shared/site00-visual-generation/falImageModels.js';
import type { Entry002AnchorCompositionRoute } from '../../../shared/site00-expression-engine/anchorTypes.js';
import { compileEntry002AnchorPrompt } from './entry002AnchorPrompt.js';
import {
  buildEntry002AnchorAssetId,
  buildEntry002AnchorStoragePath,
} from './entry002AnchorAssetRecord.js';
import { routeProductionTool } from './productionRouting.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { registerGeneration } from './lineageRegistration.js';

export type Entry002AnchorDispatchResult = {
  assetId: string;
  storagePath: string;
  previewUrl: string;
  provider: string;
  model: string;
  promptLineage: string[];
  referenceLineage: string[];
  receipt: ReturnType<typeof registerGeneration>;
};

export function resolveEntry002AnchorProvider(): { provider: string; model: string } {
  const routing = routeProductionTool({
    taskClass: 'IMAGE_GENERATION',
    format: 'COVER',
    brandId: 'ndxbook',
    entryId: 'entry-002',
  });
  const provider = routing.recommendedProviders[0] ?? 'fal-gpt-image';
  const modelMap: Record<string, string> = {
    'fal-gpt-image': SITE00_FAL_TEXT_TO_IMAGE_MODEL,
    'fal-flux': 'fal-ai/flux-pro',
  };
  return { provider, model: modelMap[provider] ?? SITE00_FAL_TEXT_TO_IMAGE_MODEL };
}

export async function dispatchEntry002CreativeAnchor(
  route: Entry002AnchorCompositionRoute,
  options?: { dispatchFal?: boolean },
): Promise<Entry002AnchorDispatchResult> {
  const assetId = buildEntry002AnchorAssetId();
  const storagePath = buildEntry002AnchorStoragePath(assetId).replace(/\.webp$/, '.png');
  const { prompt, negativePrompt, promptLineage, contentPolicySafePrompt } = compileEntry002AnchorPrompt(route);
  const { provider, model } = resolveEntry002AnchorProvider();
  const referenceLineage = [
    ENTRY_002_WORLD_ID,
    ENTRY_002_TERRITORY_ID,
    route.routeId,
    'chapter-01-nostalgia-revision',
  ];

  const shouldDispatch = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());

  if (process.env.VITEST === 'true' || !shouldDispatch) {
    const previewUrl = `https://expression-engine.local/${storagePath}`;
    const receipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'COVER',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId,
      provider,
      model,
      promptLineage,
      referenceLineage,
      trackingState: process.env.VITEST === 'true' ? 'TRACKED' : 'TRACKED',
    });

    return { assetId, storagePath, previewUrl, provider, model, promptLineage, referenceLineage, receipt };
  }

  if (await site00StorageObjectExists(storagePath)) {
    const previewUrl = getSite00AssetPublicUrl(storagePath);
    const receipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'COVER',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId,
      provider,
      model,
      promptLineage,
      referenceLineage,
    });
    return { assetId, storagePath, previewUrl, provider, model, promptLineage, referenceLineage, receipt };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    throw new Error('FAL_KEY not configured — creative anchor dispatch blocked');
  }

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const fullPrompt = `${contentPolicySafePrompt}\n\nAvoid: ${negativePrompt}`;
  const { model: falModel, input } = buildFalImageInput({
    prompt: fullPrompt,
    aspectRatio: '4:5',
    outputFormat: 'webp',
  });

  let result: { data?: { images?: Array<{ url?: string }> } };
  let usedModel = falModel;
  try {
    result = (await fal.subscribe(falModel, { input: input as never, logs: false })) as {
      data?: { images?: Array<{ url?: string }> };
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const bodyStr = JSON.stringify(err);
    if (msg.includes('content_policy') || msg.includes('content checker') || bodyStr.includes('content_policy')) {
      usedModel = 'fal-ai/flux-pro';
      result = (await fal.subscribe(usedModel, {
        input: {
          prompt: contentPolicySafePrompt,
          image_size: 'portrait_4_3',
          num_images: 1,
          output_format: 'png',
        },
        logs: false,
      })) as { data?: { images?: Array<{ url?: string }> } };
    } else {
      throw err;
    }
  }

  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('FAL returned no image for ENTRY 002 creative anchor');

  const buffer = await downloadUrlToBuffer(imageUrl);
  const contentType = storagePath.endsWith('.png') ? 'image/png' : 'image/webp';
  const uploaded = await uploadSite00AssetBuffer(storagePath, buffer, contentType, { upsert: true });

  const receipt = registerGeneration({
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: 'entry-002',
    format: 'COVER',
    territoryId: ENTRY_002_TERRITORY_ID,
    worldId: ENTRY_002_WORLD_ID,
    assetId,
    provider,
    model: usedModel,
    promptLineage: [...promptLineage, usedModel !== falModel ? 'fal-flux-fallback' : 'primary'],
    referenceLineage,
  });

  return {
    assetId,
    storagePath: uploaded.storagePath,
    previewUrl: uploaded.publicUrl,
    provider,
    model: usedModel,
    promptLineage,
    referenceLineage,
    receipt,
  };
}
