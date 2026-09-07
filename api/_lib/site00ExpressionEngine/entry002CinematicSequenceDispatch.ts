/**
 * Sprint B4.5 — Reference-conditioned cinematic visual sequence dispatch.
 */

import { randomUUID } from 'node:crypto';
import type { CinematicContinuityReferenceBoard } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import type { CinematicVisualSequenceFrame } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import {
  buildEntry002CinematicContactSheetStoragePath,
  buildEntry002CinematicFrameStoragePath,
  ENTRY_002_CINEMATIC_CONTACT_SHEET_001,
  ENTRY_002_CVS_ASPECT_RATIO,
} from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../site00Assts/storage.js';
import { buildFalImageInput } from '../../../shared/site00-visual-generation/falImageModels.js';
import { compileEntry002CinematicFramePrompt, compileEntry002CinematicContactSheetPrompt } from './entry002CinematicSequencePrompts.js';
import {
  buildEntry002CharacterVisualCanon,
  selectReferenceUrlsForFrame,
} from './entry002CinematicSequenceContinuityPack.js';
import { registerGeneration } from './lineageRegistration.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_REEL_ID } from './entry002ReelShotPlan.js';
import { ENTRY_002_CINEMATIC_SEQUENCE_001 } from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';

export const CINEMATIC_SEQUENCE_STAGE_LABEL = 'CINEMATIC_SEQUENCE_GENERATION' as const;

export type CinematicFrameRasterResult = {
  frameNumber: number;
  frameId: string;
  storagePath: string;
  previewUrl: string | null;
  provider: string;
  model: string;
  providerRequestId: string | null;
  referenceBoardsUsed: string[];
  referenceUrlsUsed: string[];
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

async function dispatchReferenceConditionedImage(params: {
  prompt: string;
  negativePrompt: string;
  referenceImageUrls: string[];
  aspectRatio: string;
}): Promise<{
  imageUrl: string;
  usedModel: string;
  usedProvider: string;
  providerRequestId: string;
}> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured — cinematic sequence dispatch blocked');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const fullPrompt = `${params.prompt}\n\nAvoid: ${params.negativePrompt}`;
  const { model, input } = buildFalImageInput({
    prompt: fullPrompt,
    aspectRatio: params.aspectRatio as '9:16',
    outputFormat: 'webp',
    referenceImageUrls: params.referenceImageUrls.length > 0 ? params.referenceImageUrls : undefined,
  });

  const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
  };
  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('FAL returned no cinematic sequence frame image');

  return {
    imageUrl,
    usedModel: model,
    usedProvider: params.referenceImageUrls.length > 0 ? 'fal-gpt-image-edit' : 'fal-gpt-image',
    providerRequestId: extractProviderRequestId(result),
  };
}

export async function dispatchEntry002CinematicFrame(
  frame: CinematicVisualSequenceFrame,
  boards: CinematicContinuityReferenceBoard[],
  priorFrameUrl: string | null,
  options?: { dispatchFal?: boolean; forceDispatch?: boolean },
): Promise<CinematicFrameRasterResult> {
  const storagePath = buildEntry002CinematicFrameStoragePath(frame.frameId);
  const shouldDispatch = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const exists = await site00StorageObjectExists(storagePath);

  if (exists && !options?.forceDispatch) {
    return {
      frameNumber: frame.frameNumber,
      frameId: frame.frameId,
      storagePath,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      provider: 'cached',
      model: 'cached',
      providerRequestId: null,
      referenceBoardsUsed: frame.referenceBoardIds,
      referenceUrlsUsed: [],
      generationReceipt: null,
      dispatchAttempted: false,
      actualFileExists: true,
      status: 'CACHED',
      failure: null,
    };
  }

  if (!shouldDispatch) {
    return {
      frameNumber: frame.frameNumber,
      frameId: frame.frameId,
      storagePath,
      previewUrl: null,
      provider: 'none',
      model: 'none',
      providerRequestId: null,
      referenceBoardsUsed: frame.referenceBoardIds,
      referenceUrlsUsed: [],
      generationReceipt: null,
      dispatchAttempted: false,
      actualFileExists: false,
      status: 'NOT_DISPATCHED',
      failure: 'FAL_KEY not configured',
    };
  }

  const characterCanon = buildEntry002CharacterVisualCanon();
  const { prompt, negativePrompt } = compileEntry002CinematicFramePrompt(frame, characterCanon);
  const priorUrl = frame.priorFrameReference ? priorFrameUrl : null;
  const referenceUrls = selectReferenceUrlsForFrame(boards, frame.referenceBoardIds, priorUrl);

  try {
    const dispatch = await dispatchReferenceConditionedImage({
      prompt,
      negativePrompt,
      referenceImageUrls: referenceUrls,
      aspectRatio: ENTRY_002_CVS_ASPECT_RATIO,
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
      assetId: frame.frameId,
      parentAssetId: ENTRY_002_CINEMATIC_SEQUENCE_001,
      provider: dispatch.usedProvider,
      model: dispatch.usedModel,
      promptLineage: [
        CINEMATIC_SEQUENCE_STAGE_LABEL,
        'sprint-b4.5-cinematic-visual-sequence',
        `frame-${String(frame.frameNumber).padStart(2, '0')}`,
        frame.argumentBeat,
        `refs:${referenceUrls.length}`,
        'REFERENCE_CONDITIONED',
      ],
      referenceLineage: [
        ENTRY_002_WORLD_ID,
        ENTRY_002_TERRITORY_ID,
        CHAPTER_01_ID,
        ENTRY_002_REEL_ID,
        frame.frameId,
        ...frame.referenceBoardIds,
      ],
      trackingState: 'TRACKED',
    });

    return {
      frameNumber: frame.frameNumber,
      frameId: frame.frameId,
      storagePath,
      previewUrl,
      provider: dispatch.usedProvider,
      model: dispatch.usedModel,
      providerRequestId: dispatch.providerRequestId,
      referenceBoardsUsed: frame.referenceBoardIds,
      referenceUrlsUsed: referenceUrls,
      generationReceipt,
      dispatchAttempted: true,
      actualFileExists: true,
      status: 'DISPATCHED',
      failure: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cinematic frame dispatch failed';
    return {
      frameNumber: frame.frameNumber,
      frameId: frame.frameId,
      storagePath,
      previewUrl: null,
      provider: 'fal-gpt-image',
      model: 'openai/gpt-image-2/edit',
      providerRequestId: null,
      referenceBoardsUsed: frame.referenceBoardIds,
      referenceUrlsUsed: referenceUrls,
      generationReceipt: null,
      dispatchAttempted: true,
      actualFileExists: false,
      status: 'FAILED',
      failure: message,
    };
  }
}

export async function dispatchAllEntry002CinematicVisuals(
  frames: CinematicVisualSequenceFrame[],
  boards: CinematicContinuityReferenceBoard[],
  options?: { dispatchFal?: boolean; forceDispatch?: boolean },
): Promise<CinematicFrameRasterResult[]> {
  const results: CinematicFrameRasterResult[] = [];
  let priorUrl: string | null = null;

  for (const frame of frames) {
    const result = await dispatchEntry002CinematicFrame(frame, boards, priorUrl, options);
    results.push(result);
    if (result.previewUrl) priorUrl = result.previewUrl;
  }

  return results;
}

export async function dispatchEntry002CinematicContactSheet(
  frameCount: number,
  options?: { dispatchFal?: boolean; forceDispatch?: boolean },
): Promise<{
  storagePath: string;
  previewUrl: string | null;
  status: string;
  actualFileExists: boolean;
}> {
  const sheetId = ENTRY_002_CINEMATIC_CONTACT_SHEET_001;
  const storagePath = buildEntry002CinematicContactSheetStoragePath(sheetId);
  const shouldDispatch = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const exists = await site00StorageObjectExists(storagePath);

  if (exists && !options?.forceDispatch) {
    return {
      storagePath,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      status: 'CACHED',
      actualFileExists: true,
    };
  }

  if (!shouldDispatch) {
    return { storagePath, previewUrl: null, status: 'NOT_DISPATCHED', actualFileExists: false };
  }

  const { prompt, negativePrompt } = compileEntry002CinematicContactSheetPrompt(frameCount);
  try {
    const dispatch = await dispatchReferenceConditionedImage({
      prompt,
      negativePrompt,
      referenceImageUrls: [],
      aspectRatio: '16:9',
    });
    const buffer = await downloadUrlToBuffer(dispatch.imageUrl);
    await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');
    registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId: sheetId,
      parentAssetId: ENTRY_002_CINEMATIC_SEQUENCE_001,
      provider: dispatch.usedProvider,
      model: dispatch.usedModel,
      promptLineage: [CINEMATIC_SEQUENCE_STAGE_LABEL, 'contact-sheet', 'sprint-b4.5'],
      referenceLineage: [ENTRY_002_REEL_ID, sheetId],
      trackingState: 'TRACKED',
    });
    return {
      storagePath,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      status: 'DISPATCHED',
      actualFileExists: true,
    };
  } catch {
    return { storagePath, previewUrl: null, status: 'FAILED', actualFileExists: false };
  }
}

export function isValidCinematicFrameRaster(r: CinematicFrameRasterResult): boolean {
  return r.actualFileExists && (r.status === 'DISPATCHED' || r.status === 'CACHED');
}
