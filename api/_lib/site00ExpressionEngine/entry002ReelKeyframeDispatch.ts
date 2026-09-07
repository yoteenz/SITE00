/**
 * Sprint B4.2 — FAL dispatch for Entry 002 REEL keyframe rasters (execution).
 */

import { randomUUID } from 'node:crypto';
import type { CreativeAssetRecord } from '../../../shared/site00-brand-lore/creativeLineage/types.js';
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
import { buildEntry002ReelKeyframeCreativeAssetRecord } from './entry002ReelKeyframeAssetRecord.js';
import { routeProductionTool } from './productionRouting.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { registerGeneration } from './lineageRegistration.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_REEL_ID } from './entry002ReelShotPlan.js';
import { assertProductionKeyframeGenerationAllowed } from './entry002ReelProductionGates.js';
import type { StoryboardApprovalState } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';

export type ReelKeyframeRasterStatus =
  | 'DISPATCHED'
  | 'CACHED'
  | 'NOT_DISPATCHED'
  | 'FAILED';

export type ReelKeyframeRasterResult = {
  role: ReelKeyframeRole;
  assetId: string;
  storagePath: string;
  previewUrl: string | null;
  provider: string;
  model: string;
  dimensions: { width: number; height: number };
  aspectRatio: typeof ENTRY_002_REEL_KF_ASPECT_RATIO;
  promptLineage: string[];
  referenceLineage: string[];
  planningReceiptId: string | null;
  generationReceipt: ReturnType<typeof registerGeneration> | null;
  creativeAssetRecord: CreativeAssetRecord | null;
  providerRequestId: string | null;
  dispatchAttempted: boolean;
  actualFileExists: boolean;
  fallbackAttempted: boolean;
  status: ReelKeyframeRasterStatus;
  failure: string | null;
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
    'fal-flux': 'fal-ai/flux-pro/v1.1',
  };
  return {
    provider,
    model: modelMap[provider] ?? 'fal-ai/flux-pro/v1.1',
    fallbackProvider,
    fallbackModel: modelMap[fallbackProvider] ?? SITE00_FAL_TEXT_TO_IMAGE_MODEL,
  };
}

export function registerEntry002ReelKeyframePlanningReceipt(params: {
  role: ReelKeyframeRole;
  assetId: string;
  parentAssetId?: string;
}): ReturnType<typeof registerGeneration> {
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
      `kf-entry-002-reel-${params.role.toLowerCase()}`,
      params.role,
      'PLANNING_RECEIPT',
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

function extractProviderRequestId(result: unknown): string {
  const r = result as { requestId?: string; request_id?: string; data?: { request_id?: string } };
  return r.requestId ?? r.request_id ?? r.data?.request_id ?? `fal-${randomUUID()}`;
}

async function dispatchFalImage(params: {
  contentPolicySafePrompt: string;
  negativePrompt: string;
  primaryProvider: string;
  fallbackProvider: string;
  fallbackModel: string;
}): Promise<{
  imageUrl: string;
  usedModel: string;
  usedProvider: string;
  providerRequestId: string;
  fallbackAttempted: boolean;
}> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured — keyframe raster dispatch blocked');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  async function runFlux(): Promise<{
    imageUrl: string;
    usedModel: string;
    usedProvider: string;
    providerRequestId: string;
  }> {
    const usedModel = 'fal-ai/flux-pro/v1.1';
    const result = (await fal.subscribe(usedModel, {
      input: {
        prompt: params.contentPolicySafePrompt,
        aspect_ratio: ENTRY_002_REEL_KF_ASPECT_RATIO,
        num_images: 1,
        output_format: 'png',
      },
      logs: false,
    })) as { data?: { images?: Array<{ url?: string }> } };
    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) throw new Error('FAL flux-pro returned no image for Entry 002 REEL keyframe');
    return {
      imageUrl,
      usedModel,
      usedProvider: 'fal-flux',
      providerRequestId: extractProviderRequestId(result),
    };
  }

  async function runGptImage(): Promise<{
    imageUrl: string;
    usedModel: string;
    usedProvider: string;
    providerRequestId: string;
  }> {
    const fullPrompt = `${params.contentPolicySafePrompt}\n\nAvoid: ${params.negativePrompt}`;
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
    return {
      imageUrl,
      usedModel: falModel,
      usedProvider: 'fal-gpt-image',
      providerRequestId: extractProviderRequestId(result),
    };
  }

  if (params.primaryProvider === 'fal-flux') {
    try {
      const primary = await runFlux();
      return { ...primary, fallbackAttempted: false };
    } catch (primaryErr) {
      const fallback = await runGptImage();
      return { ...fallback, fallbackAttempted: true };
    }
  }

  try {
    const primary = await runGptImage();
    return { ...primary, fallbackAttempted: false };
  } catch {
    const fallback = await runFlux();
    return { ...fallback, fallbackAttempted: true };
  }
}

function buildFailureResult(params: {
  role: ReelKeyframeRole;
  assetId: string;
  storagePath: string;
  planningReceiptId: string | null;
  provider: string;
  model: string;
  promptLineage: string[];
  referenceLineage: string[];
  failure: string;
  fallbackAttempted: boolean;
}): ReelKeyframeRasterResult {
  return {
    role: params.role,
    assetId: params.assetId,
    storagePath: params.storagePath,
    previewUrl: null,
    provider: params.provider,
    model: params.model,
    dimensions: { ...ENTRY_002_REEL_KF_DIMENSIONS },
    aspectRatio: ENTRY_002_REEL_KF_ASPECT_RATIO,
    promptLineage: params.promptLineage,
    referenceLineage: params.referenceLineage,
    planningReceiptId: params.planningReceiptId,
    generationReceipt: null,
    creativeAssetRecord: null,
    providerRequestId: null,
    dispatchAttempted: true,
    actualFileExists: false,
    fallbackAttempted: params.fallbackAttempted,
    status: 'FAILED',
    failure: params.failure,
    founderJudgment: 'UNREVIEWED',
    canonState: 'NON_CANON',
  };
}

export async function dispatchEntry002ReelKeyframeRaster(
  role: ReelKeyframeRole,
  options?: {
    dispatchFal?: boolean;
    forceDispatch?: boolean;
    version?: number;
    planningReceiptId?: string;
    /** B4.4 — skip storyboard gate for legacy B4.1/B4.2 reconciliation only */
    skipStoryboardGateCheck?: boolean;
    /** B4.5 — cinematic sequence gate judgment (parallel dev — non-blocking after B4.6) */
    cinematicSequenceFounderJudgment?: 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';
    storyboardFounderJudgment?: 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';
    /** B4.6 — structural storyboard approval (blocks keyframes until all 5 boards LOVE_IT) */
    structuralStoryboardApproval?: StoryboardApprovalState;
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

  const existsBeforeDispatch = await site00StorageObjectExists(storagePath);
  if (
    shouldDispatch &&
    !existsBeforeDispatch &&
    !options?.skipStoryboardGateCheck
  ) {
    assertProductionKeyframeGenerationAllowed({
      cinematicSequenceJudgment: options?.cinematicSequenceFounderJudgment,
      storyboardJudgment: options?.storyboardFounderJudgment,
      structuralStoryboardApproval: options?.structuralStoryboardApproval,
    });
  }

  const baseFields = {
    role,
    assetId,
    storagePath,
    provider,
    model,
    dimensions: { ...ENTRY_002_REEL_KF_DIMENSIONS },
    aspectRatio: ENTRY_002_REEL_KF_ASPECT_RATIO,
    promptLineage: promptBundle.promptLineage,
    referenceLineage,
    planningReceiptId,
    founderJudgment: 'UNREVIEWED' as const,
    canonState: 'NON_CANON' as const,
  };

  if (process.env.VITEST === 'true' || !shouldDispatch) {
    return {
      ...baseFields,
      previewUrl: null,
      generationReceipt: null,
      creativeAssetRecord: null,
      providerRequestId: null,
      dispatchAttempted: false,
      actualFileExists: false,
      fallbackAttempted: false,
      status: 'NOT_DISPATCHED',
      failure: null,
    };
  }

  const skipProviderCall =
    !options?.forceDispatch && (await site00StorageObjectExists(storagePath));

  if (skipProviderCall) {
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
      model: 'fal-ai/flux-pro/v1.1',
      promptLineage: [...promptBundle.promptLineage, 'GENERATION_RESULT', 'storage-cache-hit'],
      referenceLineage,
    });
    const providerRequestId = `cache-${assetId}`;
    const creativeAssetRecord = buildEntry002ReelKeyframeCreativeAssetRecord({
      assetId,
      role,
      storagePath,
      previewUrl,
      receipt: generationReceipt,
      providerRequestId,
      planningReceiptId,
    });
    return {
      ...baseFields,
      previewUrl,
      generationReceipt,
      creativeAssetRecord,
      providerRequestId,
      dispatchAttempted: true,
      actualFileExists: true,
      fallbackAttempted: false,
      status: 'CACHED',
      failure: null,
    };
  }

  try {
    const falResult = await dispatchFalImage({
      contentPolicySafePrompt: promptBundle.contentPolicySafePrompt,
      negativePrompt: promptBundle.negativePrompt,
      primaryProvider: provider,
      fallbackProvider,
      fallbackModel,
    });

  const buffer = await downloadUrlToBuffer(falResult.imageUrl);
  const contentType = falResult.usedProvider === 'fal-flux' ? 'image/png' : 'image/webp';
  const uploaded = await uploadSite00AssetBuffer(storagePath, buffer, contentType, { upsert: true });
    const exists = await site00StorageObjectExists(storagePath);
    if (!exists) {
      throw new Error(`Storage upload succeeded but object not found: ${storagePath}`);
    }

    const generationReceipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId,
      parentAssetId: planningReceiptId ?? 'founder-cover-authority-phone',
      provider: falResult.usedProvider,
      model: falResult.usedModel,
      promptLineage: [
        ...promptBundle.promptLineage,
        'GENERATION_REQUEST',
        'GENERATION_RESULT',
        falResult.fallbackAttempted ? 'provider-fallback' : 'primary',
      ],
      referenceLineage,
    });

    const creativeAssetRecord = buildEntry002ReelKeyframeCreativeAssetRecord({
      assetId,
      role,
      storagePath: uploaded.storagePath,
      previewUrl: uploaded.publicUrl,
      receipt: generationReceipt,
      providerRequestId: falResult.providerRequestId,
      planningReceiptId,
    });

    return {
      ...baseFields,
      provider: falResult.usedProvider,
      model: falResult.usedModel,
      previewUrl: uploaded.publicUrl,
      generationReceipt,
      creativeAssetRecord,
      providerRequestId: falResult.providerRequestId,
      dispatchAttempted: true,
      actualFileExists: true,
      fallbackAttempted: falResult.fallbackAttempted,
      status: 'DISPATCHED',
      failure: null,
    };
  } catch (err) {
    const failure = err instanceof Error ? err.message : String(err);
    return buildFailureResult({
      role,
      assetId,
      storagePath,
      planningReceiptId,
      provider,
      model,
      promptLineage: promptBundle.promptLineage,
      referenceLineage,
      failure,
      fallbackAttempted: true,
    });
  }
}

export async function dispatchAllEntry002ReelKeyframeRasters(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
}): Promise<ReelKeyframeRasterResult[]> {
  const roles: ReelKeyframeRole[] = ['START', 'MID', 'END'];
  const results: ReelKeyframeRasterResult[] = [];

  for (const role of roles) {
    const assetId = resolveCanonicalKeyframeAssetId(role);
    const planningReceipt = registerEntry002ReelKeyframePlanningReceipt({ role, assetId });
    const raster = await dispatchEntry002ReelKeyframeRaster(role, {
      dispatchFal: options?.dispatchFal,
      forceDispatch: options?.forceDispatch,
      planningReceiptId: planningReceipt.receiptId,
    });
    results.push(raster);
  }

  return results;
}

export function isValidGeneratedRaster(result: ReelKeyframeRasterResult): boolean {
  return (
    result.actualFileExists &&
    Boolean(result.previewUrl) &&
    !result.previewUrl!.includes('expression-engine.local') &&
    Boolean(result.providerRequestId) &&
    Boolean(result.generationReceipt)
  );
}
