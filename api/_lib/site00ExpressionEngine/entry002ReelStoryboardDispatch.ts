/**
 * Sprint B4.4 — Rough storyboard panel + strip FAL dispatch (STORYBOARD_GENERATION stage).
 */

import { randomUUID } from 'node:crypto';
import type { ReelStoryboardPanel } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import {
  buildEntry002ReelStoryboardPanelStoragePath,
  buildEntry002ReelStoryboardStripStoragePath,
  ENTRY_002_REEL_SB_ASPECT_RATIO,
  ENTRY_002_REEL_SB_PANEL_DIMENSIONS,
  ENTRY_002_REEL_SB_STRIP_DIMENSIONS,
  ENTRY_002_REEL_STORYBOARD_STRIP_001,
} from '../../../shared/site00-expression-engine/entry002ReelStoryboardIds.js';
import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../site00Assts/storage.js';
import { buildFalImageInput, SITE00_FAL_TEXT_TO_IMAGE_MODEL } from '../../../shared/site00-visual-generation/falImageModels.js';
import { compileEntry002ReelStoryboardPanelPrompt, compileEntry002ReelStoryboardStripPrompt } from './entry002ReelStoryboardPrompts.js';
import { buildEntry002StoryboardContinuityAuthority } from './entry002ReelStoryboardContinuity.js';
import { registerGeneration } from './lineageRegistration.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_REEL_ID } from './entry002ReelShotPlan.js';
import { STORYBOARD_STAGE_LABEL } from './entry002ReelStoryboardTelemetry.js';
import { buildEntry002ReelStoryboardPanels } from './entry002ReelStoryboardPanels.js';

export type StoryboardPanelRasterResult = {
  panelNumber: number;
  panelId: string;
  storagePath: string;
  previewUrl: string | null;
  provider: string;
  model: string;
  providerRequestId: string | null;
  generationReceipt: ReturnType<typeof registerGeneration> | null;
  dispatchAttempted: boolean;
  actualFileExists: boolean;
  status: 'DISPATCHED' | 'CACHED' | 'NOT_DISPATCHED' | 'FAILED';
  failure: string | null;
};

export type StoryboardStripRasterResult = {
  stripId: string;
  storagePath: string;
  previewUrl: string | null;
  provider: string;
  model: string;
  providerRequestId: string | null;
  generationReceipt: ReturnType<typeof registerGeneration> | null;
  dispatchAttempted: boolean;
  actualFileExists: boolean;
  status: 'DISPATCHED' | 'CACHED' | 'NOT_DISPATCHED' | 'FAILED';
  failure: string | null;
};

function extractProviderRequestId(result: unknown): string {
  const r = result as { requestId?: string; request_id?: string; data?: { request_id?: string } };
  return r.requestId ?? r.request_id ?? r.data?.request_id ?? `fal-${randomUUID()}`;
}

async function dispatchFalSketchImage(params: {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
}): Promise<{
  imageUrl: string;
  usedModel: string;
  usedProvider: string;
  providerRequestId: string;
}> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured — storyboard dispatch blocked');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const usedModel = 'fal-ai/flux-pro/v1.1';
  try {
    const result = (await fal.subscribe(usedModel, {
      input: {
        prompt: params.prompt,
        aspect_ratio: params.aspectRatio,
        num_images: 1,
        output_format: 'png',
      },
      logs: false,
    })) as { data?: { images?: Array<{ url?: string }> } };
    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) throw new Error('FAL flux-pro returned no storyboard image');
    return {
      imageUrl,
      usedModel,
      usedProvider: 'fal-flux',
      providerRequestId: extractProviderRequestId(result),
    };
  } catch {
    const fullPrompt = `${params.prompt}\n\nAvoid: ${params.negativePrompt}`;
    const { model: falModel, input } = buildFalImageInput({
      prompt: fullPrompt,
      aspectRatio: params.aspectRatio as '9:16',
      outputFormat: 'webp',
    });
    const result = (await fal.subscribe(falModel, { input: input as never, logs: false })) as {
      data?: { images?: Array<{ url?: string }> };
    };
    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) throw new Error('FAL gpt-image returned no storyboard image');
    return {
      imageUrl,
      usedModel: falModel,
      usedProvider: 'fal-gpt-image',
      providerRequestId: extractProviderRequestId(result),
    };
  }
}

export async function dispatchEntry002ReelStoryboardPanel(
  panel: ReelStoryboardPanel,
  options?: { dispatchFal?: boolean; forceDispatch?: boolean },
): Promise<StoryboardPanelRasterResult> {
  const storagePath = buildEntry002ReelStoryboardPanelStoragePath(panel.panelId);
  const shouldDispatch = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const exists = await site00StorageObjectExists(storagePath);

  if (exists && !options?.forceDispatch) {
    return {
      panelNumber: panel.panelNumber,
      panelId: panel.panelId,
      storagePath,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      provider: 'cached',
      model: 'cached',
      providerRequestId: null,
      generationReceipt: null,
      dispatchAttempted: false,
      actualFileExists: true,
      status: 'CACHED',
      failure: null,
    };
  }

  if (!shouldDispatch) {
    return {
      panelNumber: panel.panelNumber,
      panelId: panel.panelId,
      storagePath,
      previewUrl: null,
      provider: 'none',
      model: 'none',
      providerRequestId: null,
      generationReceipt: null,
      dispatchAttempted: false,
      actualFileExists: false,
      status: 'NOT_DISPATCHED',
      failure: 'FAL_KEY not configured',
    };
  }

  const continuity = buildEntry002StoryboardContinuityAuthority();
  const { prompt, negativePrompt } = compileEntry002ReelStoryboardPanelPrompt(panel, continuity);

  try {
    const dispatch = await dispatchFalSketchImage({
      prompt,
      negativePrompt,
      aspectRatio: ENTRY_002_REEL_SB_ASPECT_RATIO,
    });

    const buffer = await downloadUrlToBuffer(dispatch.imageUrl);
    await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');
    const previewUrl = getSite00AssetPublicUrl(storagePath);

    const generationReceipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId: panel.panelId,
      parentAssetId: 'NDX-ENTRY-002-REEL-STORYBOARD-001',
      provider: dispatch.usedProvider,
      model: dispatch.usedModel,
      promptLineage: [
        STORYBOARD_STAGE_LABEL,
        'sprint-b4.4-reel-storyboard',
        `panel-${String(panel.panelNumber).padStart(2, '0')}`,
        panel.argumentBeat,
        'ROUGH_SKETCH_NOT_KEYFRAME',
      ],
      referenceLineage: [
        ENTRY_002_WORLD_ID,
        ENTRY_002_TERRITORY_ID,
        CHAPTER_01_ID,
        ENTRY_002_REEL_ID,
        panel.panelId,
      ],
      trackingState: 'TRACKED',
    });

    return {
      panelNumber: panel.panelNumber,
      panelId: panel.panelId,
      storagePath,
      previewUrl,
      provider: dispatch.usedProvider,
      model: dispatch.usedModel,
      providerRequestId: dispatch.providerRequestId,
      generationReceipt,
      dispatchAttempted: true,
      actualFileExists: true,
      status: 'DISPATCHED',
      failure: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Storyboard panel dispatch failed';
    return {
      panelNumber: panel.panelNumber,
      panelId: panel.panelId,
      storagePath,
      previewUrl: null,
      provider: 'fal-flux',
      model: 'fal-ai/flux-pro/v1.1',
      providerRequestId: null,
      generationReceipt: null,
      dispatchAttempted: true,
      actualFileExists: false,
      status: 'FAILED',
      failure: message,
    };
  }
}

export async function dispatchEntry002ReelStoryboardStrip(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
}): Promise<StoryboardStripRasterResult> {
  const stripId = ENTRY_002_REEL_STORYBOARD_STRIP_001;
  const storagePath = buildEntry002ReelStoryboardStripStoragePath(stripId);
  const shouldDispatch = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const exists = await site00StorageObjectExists(storagePath);

  if (exists && !options?.forceDispatch) {
    return {
      stripId,
      storagePath,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      provider: 'cached',
      model: 'cached',
      providerRequestId: null,
      generationReceipt: null,
      dispatchAttempted: false,
      actualFileExists: true,
      status: 'CACHED',
      failure: null,
    };
  }

  if (!shouldDispatch) {
    return {
      stripId,
      storagePath,
      previewUrl: null,
      provider: 'none',
      model: 'none',
      providerRequestId: null,
      generationReceipt: null,
      dispatchAttempted: false,
      actualFileExists: false,
      status: 'NOT_DISPATCHED',
      failure: 'FAL_KEY not configured',
    };
  }

  const panels = buildEntry002ReelStoryboardPanels();
  const continuity = buildEntry002StoryboardContinuityAuthority();
  const { prompt, negativePrompt } = compileEntry002ReelStoryboardStripPrompt(panels, continuity);

  try {
    const dispatch = await dispatchFalSketchImage({
      prompt,
      negativePrompt,
      aspectRatio: '16:9',
    });

    const buffer = await downloadUrlToBuffer(dispatch.imageUrl);
    await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');
    const previewUrl = getSite00AssetPublicUrl(storagePath);

    const generationReceipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId: stripId,
      parentAssetId: 'NDX-ENTRY-002-REEL-STORYBOARD-001',
      provider: dispatch.usedProvider,
      model: dispatch.usedModel,
      promptLineage: [
        STORYBOARD_STAGE_LABEL,
        'sprint-b4.4-reel-storyboard',
        'storyboard-strip-10-panel',
        'ROUGH_SKETCH_NOT_KEYFRAME',
      ],
      referenceLineage: [
        ENTRY_002_WORLD_ID,
        ENTRY_002_TERRITORY_ID,
        CHAPTER_01_ID,
        ENTRY_002_REEL_ID,
        stripId,
      ],
      trackingState: 'TRACKED',
    });

    return {
      stripId,
      storagePath,
      previewUrl,
      provider: dispatch.usedProvider,
      model: dispatch.usedModel,
      providerRequestId: dispatch.providerRequestId,
      generationReceipt,
      dispatchAttempted: true,
      actualFileExists: true,
      status: 'DISPATCHED',
      failure: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Storyboard strip dispatch failed';
    return {
      stripId,
      storagePath,
      previewUrl: null,
      provider: 'fal-flux',
      model: 'fal-ai/flux-pro/v1.1',
      providerRequestId: null,
      generationReceipt: null,
      dispatchAttempted: true,
      actualFileExists: false,
      status: 'FAILED',
      failure: message,
    };
  }
}

export async function dispatchAllEntry002ReelStoryboardVisuals(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
  panelsOnly?: boolean;
}): Promise<{
  panels: StoryboardPanelRasterResult[];
  strip: StoryboardStripRasterResult | null;
}> {
  const panels = buildEntry002ReelStoryboardPanels();
  const panelResults: StoryboardPanelRasterResult[] = [];

  for (const panel of panels) {
    panelResults.push(await dispatchEntry002ReelStoryboardPanel(panel, options));
  }

  const strip = options?.panelsOnly
    ? null
    : await dispatchEntry002ReelStoryboardStrip(options);

  return { panels: panelResults, strip };
}

export function isValidStoryboardPanelRaster(r: StoryboardPanelRasterResult): boolean {
  return r.actualFileExists && (r.status === 'DISPATCHED' || r.status === 'CACHED');
}

export { ENTRY_002_REEL_SB_PANEL_DIMENSIONS, ENTRY_002_REEL_SB_STRIP_DIMENSIONS };
