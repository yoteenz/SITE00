/**
 * Sprint B4.6 follow-up — Pre-storyboard visual authority dispatch (5 separate boards).
 */

import { randomUUID } from 'node:crypto';
import type { PreStoryboardVisualAuthority } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { buildEntry002PreStoryboardAuthorityStoragePath } from '../../../shared/site00-expression-engine/preStoryboardAuthorityIds.js';
import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../site00Assts/storage.js';
import { buildFalImageInput } from '../../../shared/site00-visual-generation/falImageModels.js';
import { compileEntry002PreStoryboardAuthorityPrompt } from './preStoryboardAuthorityPrompts.js';
import { registerGeneration } from './lineageRegistration.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_REEL_ID } from './entry002ReelShotPlan.js';
import { ENTRY_002_PRE_STORYBOARD_AUTHORITY_PACK_001 } from '../../../shared/site00-expression-engine/preStoryboardAuthorityIds.js';

export const PRE_STORYBOARD_AUTHORITY_STAGE_LABEL = 'PRE_STORYBOARD_VISUAL_AUTHORITY' as const;
export const ENTRY_002_PRE_SBA_ASPECT_RATIO = '9:16' as const;

export type PreStoryboardAuthorityRasterResult = {
  boardNumber: number;
  boardId: string;
  storagePath: string;
  previewUrl: string | null;
  status: 'DISPATCHED' | 'CACHED' | 'NOT_DISPATCHED' | 'FAILED';
  actualFileExists: boolean;
};

async function dispatchPreStoryboardImage(params: {
  prompt: string;
  negativePrompt: string;
}): Promise<{ imageUrl: string; model: string; provider: string; providerRequestId: string }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured — pre-storyboard authority dispatch blocked');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const fullPrompt = `${params.prompt}\n\nAvoid: ${params.negativePrompt}`;
  const { model, input } = buildFalImageInput({
    prompt: fullPrompt,
    aspectRatio: ENTRY_002_PRE_SBA_ASPECT_RATIO,
    outputFormat: 'webp',
  });

  const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
  };
  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('FAL returned no pre-storyboard authority image');

  const r = result as { requestId?: string; request_id?: string };
  return {
    imageUrl,
    model,
    provider: 'fal-gpt-image',
    providerRequestId: r.requestId ?? r.request_id ?? `fal-${randomUUID()}`,
  };
}

export async function dispatchEntry002PreStoryboardAuthority(
  board: PreStoryboardVisualAuthority,
  options?: { dispatchFal?: boolean; forceDispatch?: boolean },
): Promise<PreStoryboardAuthorityRasterResult> {
  const storagePath = buildEntry002PreStoryboardAuthorityStoragePath(board.boardId);
  const promptBundle = compileEntry002PreStoryboardAuthorityPrompt(board);
  const shouldDispatch = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const exists = await site00StorageObjectExists(storagePath);

  if (exists && !options?.forceDispatch) {
    return {
      boardNumber: board.boardNumber,
      boardId: board.boardId,
      storagePath,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      status: 'CACHED',
      actualFileExists: true,
    };
  }

  if (!shouldDispatch) {
    return {
      boardNumber: board.boardNumber,
      boardId: board.boardId,
      storagePath,
      previewUrl: exists ? getSite00AssetPublicUrl(storagePath) : null,
      status: 'NOT_DISPATCHED',
      actualFileExists: exists,
    };
  }

  try {
    const dispatched = await dispatchPreStoryboardImage({
      prompt: promptBundle.prompt,
      negativePrompt: promptBundle.negativePrompt,
    });
    const buffer = await downloadUrlToBuffer(dispatched.imageUrl);
    await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');

    registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId: board.boardId,
      parentAssetId: ENTRY_002_PRE_STORYBOARD_AUTHORITY_PACK_001,
      provider: dispatched.provider,
      model: dispatched.model,
      promptLineage: [...promptBundle.promptLineage, PRE_STORYBOARD_AUTHORITY_STAGE_LABEL],
      referenceLineage: [ENTRY_002_WORLD_ID, ENTRY_002_TERRITORY_ID, CHAPTER_01_ID, ENTRY_002_REEL_ID],
      trackingState: 'TRACKED',
    });

    return {
      boardNumber: board.boardNumber,
      boardId: board.boardId,
      storagePath,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      status: 'DISPATCHED',
      actualFileExists: true,
    };
  } catch {
    return {
      boardNumber: board.boardNumber,
      boardId: board.boardId,
      storagePath,
      previewUrl: null,
      status: 'FAILED',
      actualFileExists: false,
    };
  }
}

export async function dispatchAllEntry002PreStoryboardAuthorities(
  authorities: PreStoryboardVisualAuthority[],
  options?: { dispatchFal?: boolean; forceDispatch?: boolean },
): Promise<PreStoryboardAuthorityRasterResult[]> {
  const results: PreStoryboardAuthorityRasterResult[] = [];
  for (const board of authorities) {
    results.push(await dispatchEntry002PreStoryboardAuthority(board, options));
  }
  return results;
}

export function mergePreStoryboardRasterResults(
  authorities: PreStoryboardVisualAuthority[],
  results: PreStoryboardAuthorityRasterResult[],
): PreStoryboardVisualAuthority[] {
  return authorities.map((board) => {
    const raster = results.find((r) => r.boardId === board.boardId);
    if (!raster?.previewUrl) return board;
    return { ...board, storagePath: raster.storagePath, previewUrl: raster.previewUrl };
  });
}
