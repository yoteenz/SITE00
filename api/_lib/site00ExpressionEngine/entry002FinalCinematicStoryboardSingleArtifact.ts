/**
 * Sprint B4.9R2 — ONE multi-panel storyboard image via ONE provider dispatch.
 * NO panel fan-out. Sharp may only format-convert, never synthesize panel visuals.
 */

import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { FinalCinematicStoryboardPanelManifestEntry } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  buildEntry002FinalCinematicStoryboardPublicStripPath,
  buildEntry002FinalCinematicStoryboardStripStoragePath,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_003_ID,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { buildFalImageInput } from '../../../shared/site00-visual-generation/falImageModels.js';
import {
  downloadUrlToBuffer,
  uploadSite00AssetBuffer,
} from '../site00Assts/storage.js';
import { registerGeneration } from './lineageRegistration.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_REEL_ID } from './entry002ReelShotPlan.js';
import { FINAL_CINEMATIC_STORYBOARD_STAGE_LABEL } from './entry002FinalCinematicStoryboardDispatch.js';
import type { FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';
import { compileSingleMultiPanelStoryboardPrompt } from './entry002FinalCinematicStoryboardSingleArtifactPrompt.js';

const SHEET_W = 1080;
const SHEET_H = 1920;
const COLS = 4;
const ROWS = 4;

export type SingleStoryboardArtifactTelemetry = {
  storyboardCompileCount: number;
  storyboardDispatchCount: number;
  storyboardRenderCount: number;
  panelManifestCount: number;
  panelDispatchCount: number;
  panelRenderCount: number;
};

export type SingleStoryboardArtifactResult = {
  storyboardId: typeof ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID;
  stripId: typeof ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_003_ID;
  generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT';
  compositeUrl: string;
  compositePath: string;
  provider: string;
  providerRequestId: string | null;
  dispatched: boolean;
  rendered: boolean;
  actualFileExists: boolean;
  telemetry: SingleStoryboardArtifactTelemetry;
  failure: string | null;
};

function publicPathToDisk(publicPath: string): string {
  return path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
}

function allowDeterministicSingleStoryboard(): boolean {
  return process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_STORYBOARD === '1';
}

async function renderDeterministicSingleStoryboardSheet(
  manifest: FinalCinematicStoryboardPanelManifestEntry[],
): Promise<Buffer> {
  const cellW = Math.floor(SHEET_W / COLS);
  const cellH = Math.floor(SHEET_H / ROWS);
  const cells = manifest
    .slice(0, COLS * ROWS)
    .map((panel, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const hue = (panel.panelNumber * 37) % 360;
      const x = col * cellW + 8;
      const y = row * cellH + 8;
      const w = cellW - 16;
      const h = cellH - 16;
      return `<rect x="${col * cellW}" y="${row * cellH}" width="${cellW}" height="${cellH}" fill="hsl(${hue},28%,${14 + (idx % 3) * 4}%)"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(0,0,0,0.45)" rx="6"/>
        <text x="${x + 12}" y="${y + 28}" fill="#c8ff00" font-family="sans-serif" font-size="16" font-weight="700">${String(panel.panelNumber).padStart(2, '0')}</text>
        <text x="${x + 12}" y="${y + 50}" fill="#ffffff" font-family="sans-serif" font-size="11">${panel.beatId}</text>
        <text x="${x + 12}" y="${y + 68}" fill="#cccccc" font-family="sans-serif" font-size="9">${panel.storyFunction.slice(0, 40)}</text>`;
    })
    .join('');

  const svg = Buffer.from(
    `<svg width="${SHEET_W}" height="${SHEET_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0a0a0c"/>
      <text x="40" y="36" fill="#c8ff00" font-family="sans-serif" font-size="14" font-weight="700">NDXBOOK · ENTRY 002 · FINAL CINEMATIC STORYBOARD · 16 PANELS</text>
      ${cells}
    </svg>`,
  );
  return sharp(svg).jpeg({ quality: 92 }).toBuffer();
}

async function dispatchFalSingleStoryboard(prompt: string): Promise<{
  imageUrl: string;
  model: string;
  provider: string;
  providerRequestId: string;
}> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const { model, input } = buildFalImageInput({
    prompt,
    aspectRatio: '9:16',
    outputFormat: 'webp',
  });

  const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
    requestId?: string;
    request_id?: string;
  };
  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('FAL returned no storyboard image');

  return {
    imageUrl,
    model,
    provider: 'fal-gpt-image',
    providerRequestId: result.requestId ?? result.request_id ?? `fal-${randomUUID()}`,
  };
}

export async function dispatchSingleMultiPanelStoryboardArtifact(params: {
  manifest: FinalCinematicStoryboardPanelManifestEntry[];
  brief: FinalCinematicStoryboardBrief;
  dispatchFal?: boolean;
  forceDispatch?: boolean;
}): Promise<SingleStoryboardArtifactResult> {
  const stripId = ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_003_ID;
  const publicPath = buildEntry002FinalCinematicStoryboardPublicStripPath(stripId);
  const diskPath = publicPathToDisk(publicPath);

  const telemetry: SingleStoryboardArtifactTelemetry = {
    storyboardCompileCount: 1,
    storyboardDispatchCount: 0,
    storyboardRenderCount: 0,
    panelManifestCount: params.manifest.length,
    panelDispatchCount: 0,
    panelRenderCount: 0,
  };

  const useDeterministic = allowDeterministicSingleStoryboard();
  const shouldUseFal = !useDeterministic && (params.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim()));

  if (!shouldUseFal && !useDeterministic) {
    return {
      storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID,
      stripId,
      generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
      compositeUrl: publicPath,
      compositePath: publicPath,
      provider: 'none',
      providerRequestId: null,
      dispatched: false,
      rendered: false,
      actualFileExists: false,
      telemetry,
      failure: 'No provider configured — set FAL_KEY or EXPRESSION_ENGINE_TEST_DETERMINISTIC_STORYBOARD=1',
    };
  }

  try {
    let buffer: Buffer;
    let provider: string;
    let model: string;
    let providerRequestId: string | null = null;
    let dispatched = false;

    if (shouldUseFal) {
      const prompt = compileSingleMultiPanelStoryboardPrompt({
        manifest: params.manifest,
        brief: params.brief,
      });
      const fal = await dispatchFalSingleStoryboard(prompt);
      buffer = await downloadUrlToBuffer(fal.imageUrl);
      provider = fal.provider;
      model = fal.model;
      providerRequestId = fal.providerRequestId;
      dispatched = true;
      telemetry.storyboardDispatchCount = 1;
    } else {
      buffer = await renderDeterministicSingleStoryboardSheet(params.manifest);
      provider = 'deterministic-single-storyboard-v1';
      model = 'sharp-format-convert-v1';
    }

    await fs.mkdir(path.dirname(diskPath), { recursive: true });
    const jpegBuffer = await sharp(buffer).jpeg({ quality: 92 }).toBuffer();
    await fs.writeFile(diskPath, jpegBuffer);

    try {
      await uploadSite00AssetBuffer(
        buildEntry002FinalCinematicStoryboardStripStoragePath(stripId),
        jpegBuffer,
        'image/jpeg',
      );
    } catch {
      // optional remote storage
    }

    if (dispatched) {
      registerGeneration({
        projectId: 'ndxbook',
        brandId: 'ndxbook',
        entryId: 'entry-002',
        format: 'REEL',
        territoryId: ENTRY_002_TERRITORY_ID,
        worldId: ENTRY_002_WORLD_ID,
        assetId: stripId,
        parentAssetId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID,
        provider,
        model,
        promptLineage: [
          FINAL_CINEMATIC_STORYBOARD_STAGE_LABEL,
          'sprint-b4.9r2-single-multi-panel-artifact',
        ],
        referenceLineage: [
          ENTRY_002_WORLD_ID,
          ENTRY_002_TERRITORY_ID,
          CHAPTER_01_ID,
          ENTRY_002_REEL_ID,
          ...params.brief.authorityIds,
        ],
        trackingState: 'TRACKED',
      });
    }

    telemetry.storyboardRenderCount = 1;

    return {
      storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID,
      stripId,
      generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
      compositeUrl: publicPath,
      compositePath: publicPath,
      provider,
      providerRequestId,
      dispatched,
      rendered: true,
      actualFileExists: true,
      telemetry,
      failure: null,
    };
  } catch (err) {
    return {
      storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID,
      stripId,
      generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
      compositeUrl: publicPath,
      compositePath: publicPath,
      provider: shouldUseFal ? 'fal-gpt-image' : 'deterministic-single-storyboard-v1',
      providerRequestId: null,
      dispatched: shouldUseFal,
      rendered: false,
      actualFileExists: false,
      telemetry,
      failure: err instanceof Error ? err.message : 'Single storyboard generation failed',
    };
  }
}
