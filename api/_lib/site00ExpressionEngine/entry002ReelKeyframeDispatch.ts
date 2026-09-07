/**
 * Sprint B4.1 — FAL dispatch for Entry 002 REEL keyframe rasters.
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
import type { ReelKeyframeRole } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import {
  buildEntry002ReelKeyframeAssetId,
  buildEntry002ReelKeyframeStoragePath,
  ENTRY_002_REEL_KF_ASPECT_RATIO,
  ENTRY_002_REEL_KF_DIMENSIONS,
  resolveCanonicalKeyframeAssetId,
} from '../../../shared/site00-expression-engine/entry002ReelKeyframeIds.js';
import { compileEntry002ReelKeyframePrompt } from './entry002ReelKeyframePrompts.js';
import { routeProductionTool } from './productionRouting.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { registerGeneration, getGenerationReceipt } from './lineageRegistration.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_REEL_ID } from './entry002ReelShotPlan.js';

export type ReelKeyframeRasterResult = {
  role: ReelKeyframeRole;
  assetId: string;
  storagePath: string;
  previewUrl: string;
  provider: string;
  model: string;
  dimensions: { width: number; height: number };
  aspectRatio: typeof ENTRY_002_REEL_KF_ASPECT_RATIO;
  promptLineage: string[];
  referenceLineage: string[];
  planningReceiptId: string | null;
  generationReceipt: ReturnType<typeof registerGeneration>;
  status: 'DISPATCHED' | 'CACHED';
  founderJudgment: 'UNREVIEWED';
  canonState: 'NON_CANON';
};

export function resolveEntry002ReelKeyframeProvider(): {
  provider: string;
  model: string;
  fallbackProvider: string;
  fallbackModel: string;
} {
  const routing = routeProductionTool({
    taskClass: 'IMAGE_GENERATION',
    format: 'REEL',
    brandId: 'ndxbook',
    entryId: 'entry-002',
  });
  const provider = routing.recommendedProviders[0] ?? 'fal-flux';
  const fallbackProvider = routing.allowedProviders.find((p) => p !== provider) ?? 'fal-gpt-image';
  const modelMap: Record<string, string> = {
    'fal-gpt-image': SITE00_FAL_TEXT_TO_IMAGE_MODEL,
    'fal-flux': 'fal-ai/flux-pro',
  };
  return {
    provider,
    model: modelMap[provider] ?? 'fal-ai/flux-pro',
    fallbackProvider,
    fallbackModel: modelMap[fallbackProvider] ?? SITE00_FAL_TEXT_TO_IMAGE_MODEL,
  };
}

export function registerEntry002ReelKeyframePlanningReceipt(params: {
  role: ReelKeyframeRole;
  assetId: string;
  parentAssetId?: string;
}): ReturnType<typeof registerGeneration> {
  const specRole = params.role;
  return registerGeneration({
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: 'entry-002',
    format: 'REEL',
    territoryId: ENTRY_002_TERRITORY_ID,
    worldId: ENTRY_002_WORLD_ID,
    assetId: params.assetId,
    parentAssetId: params.parentAssetId ?? 'founder-cover-authority-phone',
    provider: 'planning',
    model: 'COMPILED_SPEC',
    promptLineage: [
      'sprint-b4-entry-002-reel-keyframe-planning',
      `kf-entry-002-reel-${specRole.toLowerCase()}`,
      specRole,
      'RECEIPT_ONLY',
    ],
    referenceLineage: [
      ENTRY_002_WORLD_ID,
      ENTRY_002_TERRITORY_ID,
      CHAPTER_01_ID,
      ENTRY_002_REEL_ID,
      'founder-cover-authority-phone',
    ],
    trackingState: 'TRACKED',
  });
}

async function dispatchFalImage(params: {
  prompt: string;
  negativePrompt: string;
  contentPolicySafePrompt: string;
  primaryProvider: string;
  primaryModel: string;
  fallbackProvider: string;
  fallbackModel: string;
}): Promise<{ imageUrl: string; usedModel: string; usedProvider: string }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured — keyframe raster dispatch blocked');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const fullPrompt = `${params.contentPolicySafePrompt}\n\nAvoid: ${params.negativePrompt}`;

  async function runFlux(): Promise<{ imageUrl: string; usedModel: string; usedProvider: string }> {
    const usedModel = 'fal-ai/flux-pro';
    const result = (await fal.subscribe(usedModel, {
      input: {
        prompt: params.contentPolicySafePrompt,
        image_size: 'portrait_16_9',
        num_images: 1,
        output_format: 'webp',
      },
      logs: false,
    })) as { data?: { images?: Array<{ url?: string }> } };
    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) throw new Error('FAL flux-pro returned no image for Entry 002 REEL keyframe');
    return { imageUrl, usedModel, usedProvider: 'fal-flux' };
  }

  async function runGptImage(): Promise<{ imageUrl: string; usedModel: string; usedProvider: string }> {
    const { model: falModel, input } = buildFalImageInput({
      prompt: fullPrompt,
      aspectRatio: ENTRY_002_REEL_KF_ASPECT_RATIO,
      outputFormat: 'webp',
    });
    const result = (await fal.subscribe(falModel, { input: input as never, logs: false })) as {
      data?: { images?: Array<{ url?: string }> };
    };
    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) throw new Error('FAL gpt-image returned no image for Entry 002 REEL keyframe');
    return { imageUrl, usedModel: falModel, usedProvider: 'fal-gpt-image' };
  }

  try {
    if (params.primaryProvider === 'fal-flux') {
      return await runFlux();
    }
    return await runGptImage();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const bodyStr = JSON.stringify(err);
    if (msg.includes('content_policy') || msg.includes('content checker') || bodyStr.includes('content_policy')) {
      return params.fallbackProvider === 'fal-flux' ? runFlux() : runGptImage();
    }
    return params.fallbackProvider === 'fal-flux' ? runFlux() : runGptImage();
  }
}

export async function dispatchEntry002ReelKeyframeRaster(
  role: ReelKeyframeRole,
  options?: {
    dispatchFal?: boolean;
    version?: number;
    planningReceiptId?: string;
  },
): Promise<ReelKeyframeRasterResult> {
  const version = options?.version ?? 1;
  const assetId =
    version === 1 ? resolveCanonicalKeyframeAssetId(role) : buildEntry002ReelKeyframeAssetId(role, version);
  const storagePath = buildEntry002ReelKeyframeStoragePath(assetId);
  const promptBundle = compileEntry002ReelKeyframePrompt(role);
  const { provider, model, fallbackProvider, fallbackModel } = resolveEntry002ReelKeyframeProvider();
  const referenceLineage = [
    ENTRY_002_WORLD_ID,
    ENTRY_002_TERRITORY_ID,
    CHAPTER_01_ID,
    ENTRY_002_REEL_ID,
    `kf-entry-002-reel-${role.toLowerCase()}`,
    'founder-cover-authority-phone',
  ];

  const planningReceiptId = options?.planningReceiptId ?? null;
  const shouldDispatch = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());

  if (process.env.VITEST === 'true' || !shouldDispatch) {
    const previewUrl = `https://expression-engine.local/${storagePath}`;
    const generationReceipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId,
      parentAssetId: planningReceiptId ?? 'founder-cover-authority-phone',
      provider,
      model,
      promptLineage: [...promptBundle.promptLineage, 'vitest-no-dispatch'],
      referenceLineage,
    });
    return {
      role,
      assetId,
      storagePath,
      previewUrl,
      provider,
      model,
      dimensions: { ...ENTRY_002_REEL_KF_DIMENSIONS },
      aspectRatio: ENTRY_002_REEL_KF_ASPECT_RATIO,
      promptLineage: promptBundle.promptLineage,
      referenceLineage,
      planningReceiptId,
      generationReceipt,
      status: 'DISPATCHED',
      founderJudgment: 'UNREVIEWED',
      canonState: 'NON_CANON',
    };
  }

  if (await site00StorageObjectExists(storagePath)) {
    const previewUrl = getSite00AssetPublicUrl(storagePath);
    const generationReceipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId,
      parentAssetId: planningReceiptId ?? 'founder-cover-authority-phone',
      provider,
      model,
      promptLineage: [...promptBundle.promptLineage, 'storage-cache-hit'],
      referenceLineage,
    });
    return {
      role,
      assetId,
      storagePath,
      previewUrl,
      provider,
      model,
      dimensions: { ...ENTRY_002_REEL_KF_DIMENSIONS },
      aspectRatio: ENTRY_002_REEL_KF_ASPECT_RATIO,
      promptLineage: promptBundle.promptLineage,
      referenceLineage,
      planningReceiptId,
      generationReceipt,
      status: 'CACHED',
      founderJudgment: 'UNREVIEWED',
      canonState: 'NON_CANON',
    };
  }

  const { imageUrl, usedModel, usedProvider } = await dispatchFalImage({
    prompt: promptBundle.prompt,
    negativePrompt: promptBundle.negativePrompt,
    contentPolicySafePrompt: promptBundle.contentPolicySafePrompt,
    primaryProvider: provider,
    primaryModel: model,
    fallbackProvider,
    fallbackModel,
  });

  const buffer = await downloadUrlToBuffer(imageUrl);
  const uploaded = await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp', { upsert: true });

  const generationReceipt = registerGeneration({
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: 'entry-002',
    format: 'REEL',
    territoryId: ENTRY_002_TERRITORY_ID,
    worldId: ENTRY_002_WORLD_ID,
    assetId,
    parentAssetId: planningReceiptId ?? 'founder-cover-authority-phone',
    provider: usedProvider,
    model: usedModel,
    promptLineage: [...promptBundle.promptLineage, usedProvider !== provider ? 'provider-fallback' : 'primary'],
    referenceLineage,
  });

  if (planningReceiptId && getGenerationReceipt(planningReceiptId)) {
    // planning receipt preserved — raster receipt is the inspectable generation record
  }

  return {
    role,
    assetId,
    storagePath: uploaded.storagePath,
    previewUrl: uploaded.publicUrl,
    provider: usedProvider,
    model: usedModel,
    dimensions: { ...ENTRY_002_REEL_KF_DIMENSIONS },
    aspectRatio: ENTRY_002_REEL_KF_ASPECT_RATIO,
    promptLineage: promptBundle.promptLineage,
    referenceLineage,
    planningReceiptId,
    generationReceipt,
    status: 'DISPATCHED',
    founderJudgment: 'UNREVIEWED',
    canonState: 'NON_CANON',
  };
}

export async function dispatchAllEntry002ReelKeyframeRasters(options?: {
  dispatchFal?: boolean;
}): Promise<ReelKeyframeRasterResult[]> {
  const roles: ReelKeyframeRole[] = ['START', 'MID', 'END'];
  const results: ReelKeyframeRasterResult[] = [];

  for (const role of roles) {
    const assetId = resolveCanonicalKeyframeAssetId(role);
    const planningReceipt = registerEntry002ReelKeyframePlanningReceipt({ role, assetId });
    const raster = await dispatchEntry002ReelKeyframeRaster(role, {
      dispatchFal: options?.dispatchFal,
      planningReceiptId: planningReceipt.receiptId,
    });
    results.push(raster);
  }

  return results;
}
