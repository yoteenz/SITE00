/**
 * Sprint B4.9R3/R4 — ONE reel-first storyboard image via ONE provider dispatch.
 * B4.9R4: five approved authority images MUST be sent as provider reference inputs.
 */

import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { Entry002ReelVisualConception } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import type { Entry002StoryboardVisualAuthorityManifest } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  buildEntry002FinalCinematicStoryboardPublicStripPath,
  buildEntry002FinalCinematicStoryboardStripStoragePath,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_005_ID,
  REEL_STORYBOARD_MOMENT_COUNT_TARGET,
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
import { compileReelFirstStoryboardPrompt } from './entry002ReelStoryboardPrompt.js';
import {
  extractAuthorityImageIdsSentToProvider,
  extractProviderReferenceUrlsFromManifest,
  isDeterministicStoryboardProvider,
} from './entry002StoryboardVisualAuthorityManifest.js';

const SHEET_W = 1080;
const SHEET_H = 1920;
const COLS = 3;
const ROWS = 3;

export type ReelStoryboardArtifactTelemetry = {
  reelConceptionCompileCount: number;
  narrativeBeatCount: number;
  selectedStoryboardMomentCount: number;
  storyboardPromptCompileCount: number;
  storyboardDispatchCount: number;
  storyboardRenderCount: number;
  panelManifestCount: number;
  panelDispatchCount: number;
  panelRenderCount: number;
  storyboardCompileCount: number;
  requiredAuthorityImageCount: number;
  resolvedAuthorityImageCount: number;
  providerAuthorityImageInputCount: number;
  authorityImageIdsSentToProvider: string[];
  independentStoryboardPanelDispatchCount: number;
  independentStoryboardPanelRenderCount: number;
  visualAuthorityFidelityQaExecuted: boolean;
};

export type ReelStoryboardArtifactResult = {
  storyboardId: typeof ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID;
  stripId: typeof ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_005_ID;
  generationMode: 'REEL_FIRST_SINGLE_ARTIFACT';
  compositeUrl: string;
  compositePath: string;
  provider: string;
  providerRequestId: string | null;
  dispatched: boolean;
  rendered: boolean;
  actualFileExists: boolean;
  pipelineTestOnly: boolean;
  realProviderDispatch: boolean;
  realProviderRender: boolean;
  telemetry: ReelStoryboardArtifactTelemetry;
  failure: string | null;
};

function publicPathToDisk(publicPath: string): string {
  return path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
}

function allowDeterministicReelStoryboard(): boolean {
  return process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_REEL_STORYBOARD === '1'
    || process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_STORYBOARD === '1';
}

function baseTelemetry(params: {
  narrativeBeatCount: number;
  selectedStoryboardMomentCount: number;
  manifest: Entry002StoryboardVisualAuthorityManifest;
  providerAuthorityImageInputCount: number;
}): ReelStoryboardArtifactTelemetry {
  return {
    reelConceptionCompileCount: 1,
    narrativeBeatCount: params.narrativeBeatCount,
    selectedStoryboardMomentCount: params.selectedStoryboardMomentCount,
    storyboardPromptCompileCount: 1,
    storyboardDispatchCount: 0,
    storyboardRenderCount: 0,
    storyboardCompileCount: 1,
    panelManifestCount: params.narrativeBeatCount,
    panelDispatchCount: 0,
    panelRenderCount: 0,
    requiredAuthorityImageCount: params.manifest.requiredAuthorityImageCount,
    resolvedAuthorityImageCount: params.manifest.resolvedAuthorityImageCount,
    providerAuthorityImageInputCount: params.providerAuthorityImageInputCount,
    authorityImageIdsSentToProvider: extractAuthorityImageIdsSentToProvider(params.manifest).slice(
      0,
      params.providerAuthorityImageInputCount,
    ),
    independentStoryboardPanelDispatchCount: 0,
    independentStoryboardPanelRenderCount: 0,
    visualAuthorityFidelityQaExecuted: false,
  };
}

async function renderDeterministicReelStoryboardSheet(
  conception: Entry002ReelVisualConception,
): Promise<Buffer> {
  const cellW = Math.floor(SHEET_W / COLS);
  const cellH = Math.floor(SHEET_H / ROWS);
  const baseHue = 220;
  const cells = conception.selectedStoryboardMoments
    .slice(0, COLS * ROWS)
    .map((moment, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const progress = idx / (REEL_STORYBOARD_MOMENT_COUNT_TARGET - 1);
      const hue = baseHue + Math.floor(progress * 18);
      const sat = 22 + Math.floor(progress * 8);
      const light = 12 + Math.floor(progress * 6);
      const x = col * cellW + 6;
      const y = row * cellH + 6;
      const w = cellW - 12;
      const h = cellH - 12;
      return `<rect x="${col * cellW}" y="${row * cellH}" width="${cellW}" height="${cellH}" fill="hsl(${hue},${sat}%,${light}%)"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(0,0,0,0.35)" rx="4"/>
        <text x="${x + 10}" y="${y + 24}" fill="#c8ff00" font-family="sans-serif" font-size="14" font-weight="700">${String(moment.momentNumber).padStart(2, '0')}</text>
        <text x="${x + 10}" y="${y + 44}" fill="#ffffff" font-family="sans-serif" font-size="10">${moment.momentTitle}</text>
        <text x="${x + 10}" y="${y + 60}" fill="#aaaaaa" font-family="sans-serif" font-size="8">same room · same NDX · same phone</text>`;
    })
    .join('');

  const svg = Buffer.from(
    `<svg width="${SHEET_W}" height="${SHEET_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#08080a"/>
      <text x="32" y="32" fill="#c8ff00" font-family="sans-serif" font-size="13" font-weight="700">NDXBOOK · ENTRY 002 · FINAL REEL STORYBOARD · 9 STILLS · ONE REEL</text>
      ${cells}
    </svg>`,
  );
  return sharp(svg).jpeg({ quality: 92 }).toBuffer();
}

async function dispatchFalReelStoryboard(params: {
  prompt: string;
  referenceImageUrls: string[];
}): Promise<{
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
    prompt: params.prompt,
    aspectRatio: '9:16',
    outputFormat: 'webp',
    referenceImageUrls: params.referenceImageUrls,
  });

  const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
    requestId?: string;
    request_id?: string;
  };
  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('FAL returned no reel storyboard image');

  const usedEdit = params.referenceImageUrls.length > 0;
  return {
    imageUrl,
    model,
    provider: usedEdit ? 'fal-gpt-image-edit' : 'fal-gpt-image',
    providerRequestId: result.requestId ?? result.request_id ?? `fal-${randomUUID()}`,
  };
}

export async function dispatchReelFirstStoryboardArtifact(params: {
  conception: Entry002ReelVisualConception;
  brief: FinalCinematicStoryboardBrief;
  visualAuthorityManifest: Entry002StoryboardVisualAuthorityManifest;
  narrativeBeatCount: number;
  dispatchFal?: boolean;
  forceDispatch?: boolean;
  skipAuthorityImageBinding?: boolean;
}): Promise<ReelStoryboardArtifactResult> {
  const stripId = ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_005_ID;
  const publicPath = buildEntry002FinalCinematicStoryboardPublicStripPath(stripId);
  const diskPath = publicPathToDisk(publicPath);

  const referenceImageUrls = params.skipAuthorityImageBinding
    ? []
    : extractProviderReferenceUrlsFromManifest(params.visualAuthorityManifest);

  const useDeterministic = allowDeterministicReelStoryboard();
  const shouldUseFal = !useDeterministic && (params.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim()));

  const providerAuthorityImageInputCount = shouldUseFal ? referenceImageUrls.length : 0;

  const telemetry = baseTelemetry({
    narrativeBeatCount: params.narrativeBeatCount,
    selectedStoryboardMomentCount: params.conception.selectedStoryboardMoments.length,
    manifest: params.visualAuthorityManifest,
    providerAuthorityImageInputCount,
  });

  if (!params.visualAuthorityManifest.validated && !params.skipAuthorityImageBinding) {
    return {
      storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
      stripId,
      generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
      compositeUrl: publicPath,
      compositePath: publicPath,
      provider: 'none',
      providerRequestId: null,
      dispatched: false,
      rendered: false,
      actualFileExists: false,
      pipelineTestOnly: true,
      realProviderDispatch: false,
      realProviderRender: false,
      telemetry,
      failure: params.visualAuthorityManifest.bindingFailureReason ?? 'Visual authority manifest invalid',
    };
  }

  if (!shouldUseFal && !useDeterministic) {
    return {
      storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
      stripId,
      generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
      compositeUrl: publicPath,
      compositePath: publicPath,
      provider: 'none',
      providerRequestId: null,
      dispatched: false,
      rendered: false,
      actualFileExists: false,
      pipelineTestOnly: true,
      realProviderDispatch: false,
      realProviderRender: false,
      telemetry,
      failure: 'No provider configured — set FAL_KEY or EXPRESSION_ENGINE_TEST_DETERMINISTIC_REEL_STORYBOARD=1',
    };
  }

  if (shouldUseFal && providerAuthorityImageInputCount !== 5) {
    return {
      storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
      stripId,
      generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
      compositeUrl: publicPath,
      compositePath: publicPath,
      provider: 'fal-gpt-image-edit',
      providerRequestId: null,
      dispatched: false,
      rendered: false,
      actualFileExists: false,
      pipelineTestOnly: false,
      realProviderDispatch: false,
      realProviderRender: false,
      telemetry,
      failure: 'VISUAL_AUTHORITY_BINDING_FAIL — five authority image references required before FAL dispatch',
    };
  }

  try {
    let buffer: Buffer;
    let provider: string;
    let model: string;
    let providerRequestId: string | null = null;
    let dispatched = false;

    if (shouldUseFal) {
      const prompt = compileReelFirstStoryboardPrompt({
        conception: params.conception,
        brief: params.brief,
        visualAuthorityManifest: params.visualAuthorityManifest,
      });
      const fal = await dispatchFalReelStoryboard({ prompt, referenceImageUrls });
      buffer = await downloadUrlToBuffer(fal.imageUrl);
      provider = fal.provider;
      model = fal.model;
      providerRequestId = fal.providerRequestId;
      dispatched = true;
      telemetry.storyboardDispatchCount = 1;
    } else {
      buffer = await renderDeterministicReelStoryboardSheet(params.conception);
      provider = 'deterministic-reel-storyboard-v1';
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
        parentAssetId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
        provider,
        model,
        promptLineage: [
          FINAL_CINEMATIC_STORYBOARD_STAGE_LABEL,
          'sprint-b4.9r4-visual-authority-binding',
        ],
        referenceLineage: [
          ENTRY_002_WORLD_ID,
          ENTRY_002_TERRITORY_ID,
          CHAPTER_01_ID,
          ENTRY_002_REEL_ID,
          ...telemetry.authorityImageIdsSentToProvider,
        ],
        trackingState: 'TRACKED',
      });
    }

    telemetry.storyboardRenderCount = 1;
    const pipelineTestOnly = isDeterministicStoryboardProvider(provider);
    const realProviderDispatch = dispatched && !pipelineTestOnly;
    const realProviderRender = telemetry.storyboardRenderCount === 1 && !pipelineTestOnly;

    return {
      storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
      stripId,
      generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
      compositeUrl: publicPath,
      compositePath: publicPath,
      provider,
      providerRequestId,
      dispatched,
      rendered: true,
      actualFileExists: true,
      pipelineTestOnly,
      realProviderDispatch,
      realProviderRender,
      telemetry,
      failure: null,
    };
  } catch (err) {
    return {
      storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
      stripId,
      generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
      compositeUrl: publicPath,
      compositePath: publicPath,
      provider: shouldUseFal ? 'fal-gpt-image-edit' : 'deterministic-reel-storyboard-v1',
      providerRequestId: null,
      dispatched: shouldUseFal,
      rendered: false,
      actualFileExists: false,
      pipelineTestOnly: !shouldUseFal,
      realProviderDispatch: false,
      realProviderRender: false,
      telemetry,
      failure: err instanceof Error ? err.message : 'Reel storyboard generation failed',
    };
  }
}
