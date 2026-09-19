/**
 * Sprint B4.6 — Five separate structural storyboard board dispatch.
 */

import { randomUUID } from 'node:crypto';
import type { StoryboardBoard } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { buildEntry002StructuralBoardStoragePath } from '../../../shared/site00-expression-engine/storyboardAuthorityIds.js';
import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../site00Assts/storage.js';
import { buildFalImageInput } from '../../../shared/site00-visual-generation/falImageModels.js';
import { compileEntry002StructuralBoardPrompt } from './storyboardAuthorityPrompts.js';
import { registerGeneration } from './lineageRegistration.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_REEL_ID } from './entry002ReelShotPlan.js';
import { ENTRY_002_STORYBOARD_AUTHORITY_001 } from '../../../shared/site00-expression-engine/storyboardAuthorityIds.js';

export const STRUCTURAL_STORYBOARD_STAGE_LABEL = 'STRUCTURAL_STORYBOARD_AUTHORITY' as const;
export const ENTRY_002_SBA_ASPECT_RATIO = '9:16' as const;

export type StructuralBoardRasterResult = {
  boardNumber: number;
  boardId: string;
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

async function dispatchStructuralBoardImage(params: {
  prompt: string;
  negativePrompt: string;
}): Promise<{
  imageUrl: string;
  usedModel: string;
  usedProvider: string;
  providerRequestId: string;
}> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured — structural storyboard dispatch blocked');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const fullPrompt = `${params.prompt}\n\nAvoid: ${params.negativePrompt}`;
  const { model, input } = buildFalImageInput({
    prompt: fullPrompt,
    aspectRatio: ENTRY_002_SBA_ASPECT_RATIO,
    outputFormat: 'webp',
  });

  const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
  };
  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('FAL returned no structural storyboard board image');

  return {
    imageUrl,
    usedModel: model,
    usedProvider: 'fal-gpt-image',
    providerRequestId: extractProviderRequestId(result),
  };
}

export async function dispatchEntry002StructuralStoryboardBoard(
  board: StoryboardBoard,
  options?: { dispatchFal?: boolean; forceDispatch?: boolean },
): Promise<StructuralBoardRasterResult> {
  const storagePath = buildEntry002StructuralBoardStoragePath(board.boardId);
  const promptBundle = compileEntry002StructuralBoardPrompt(board);
  const shouldDispatch = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());

  const exists = await site00StorageObjectExists(storagePath);
  if (exists && !options?.forceDispatch) {
    return {
      boardNumber: board.boardNumber,
      boardId: board.boardId,
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
      boardNumber: board.boardNumber,
      boardId: board.boardId,
      storagePath,
      previewUrl: exists ? getSite00AssetPublicUrl(storagePath) : null,
      provider: 'none',
      model: 'none',
      providerRequestId: null,
      generationReceipt: null,
      dispatchAttempted: false,
      actualFileExists: exists,
      status: 'NOT_DISPATCHED',
      failure: null,
    };
  }

  try {
    const dispatched = await dispatchStructuralBoardImage({
      prompt: promptBundle.prompt,
      negativePrompt: promptBundle.negativePrompt,
    });
    const buffer = await downloadUrlToBuffer(dispatched.imageUrl);
    await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');

    const generationReceipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId: board.boardId,
      parentAssetId: ENTRY_002_STORYBOARD_AUTHORITY_001,
      provider: dispatched.usedProvider,
      model: dispatched.usedModel,
      promptLineage: [...promptBundle.promptLineage, STRUCTURAL_STORYBOARD_STAGE_LABEL],
      referenceLineage: [
        ENTRY_002_WORLD_ID,
        ENTRY_002_TERRITORY_ID,
        CHAPTER_01_ID,
        ENTRY_002_REEL_ID,
        'founder-cover-authority-phone',
      ],
      trackingState: 'TRACKED',
    });

    return {
      boardNumber: board.boardNumber,
      boardId: board.boardId,
      storagePath,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      provider: dispatched.usedProvider,
      model: dispatched.usedModel,
      providerRequestId: dispatched.providerRequestId,
      generationReceipt,
      dispatchAttempted: true,
      actualFileExists: true,
      status: 'DISPATCHED',
      failure: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Structural board dispatch failed';
    return {
      boardNumber: board.boardNumber,
      boardId: board.boardId,
      storagePath,
      previewUrl: null,
      provider: 'fal-gpt-image',
      model: 'failed',
      providerRequestId: null,
      generationReceipt: null,
      dispatchAttempted: true,
      actualFileExists: false,
      status: 'FAILED',
      failure: message,
    };
  }
}

export async function dispatchAllEntry002StructuralStoryboardBoards(
  boards: StoryboardBoard[],
  options?: { dispatchFal?: boolean; forceDispatch?: boolean },
): Promise<StructuralBoardRasterResult[]> {
  const results: StructuralBoardRasterResult[] = [];
  for (const board of boards) {
    results.push(await dispatchEntry002StructuralStoryboardBoard(board, options));
  }
  return results;
}

export function isValidStructuralBoardRaster(result: StructuralBoardRasterResult): boolean {
  return result.actualFileExists && Boolean(result.previewUrl);
}

export function mergeBoardRasterResults(
  boards: StoryboardBoard[],
  results: StructuralBoardRasterResult[],
): StoryboardBoard[] {
  return boards.map((board) => {
    const raster = results.find((r) => r.boardId === board.boardId);
    if (!raster?.previewUrl) return board;
    return {
      ...board,
      storagePath: raster.storagePath,
      previewUrl: raster.previewUrl,
    };
  });
}
