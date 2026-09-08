/**
 * Sprint B4.9R — Panel generation + assembly pipeline.
 * ASSEMBLY ≠ GENERATION — Sharp only composes already-rendered panel assets.
 */

import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { FinalCinematicStoryboardPanelManifestEntry } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  buildEntry002FinalCinematicStoryboardPanelPublicPath,
  buildEntry002FinalCinematicStoryboardPublicStripPath,
  buildEntry002FinalCinematicStoryboardStripStoragePath,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_002_ID,
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

const PANEL_W = 360;
const PANEL_H = 640;
const COLS = 4;

export type PanelGenerationTelemetry = {
  panelCompileCount: number;
  panelDispatchCount: number;
  panelRenderCount: number;
  panelFailureCount: number;
  panelRepairCount: number;
};

export type PanelPipelineResult = {
  manifest: FinalCinematicStoryboardPanelManifestEntry[];
  telemetry: PanelGenerationTelemetry;
  assembled: boolean;
  compositePath: string | null;
  compositeUrl: string | null;
};

function publicPathToDisk(publicPath: string): string {
  return path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
}

function allowDeterministicTestPanels(): boolean {
  return process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_PANELS === '1';
}

async function dispatchFalPanel(prompt: string): Promise<{
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
  if (!imageUrl) throw new Error('FAL returned no panel image');

  return {
    imageUrl,
    model,
    provider: 'fal-gpt-image',
    providerRequestId: result.requestId ?? result.request_id ?? `fal-${randomUUID()}`,
  };
}

async function renderDeterministicPanel(
  panel: FinalCinematicStoryboardPanelManifestEntry,
): Promise<Buffer> {
  const hue = (panel.panelNumber * 37) % 360;
  const svg = Buffer.from(
    `<svg width="${PANEL_W}" height="${PANEL_H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue},35%,18%)"/>
          <stop offset="100%" stop-color="hsl(${(hue + 80) % 360},45%,32%)"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="24" y="24" width="${PANEL_W - 48}" height="120" fill="rgba(0,0,0,0.55)" rx="8"/>
      <text x="40" y="58" fill="#c8ff00" font-family="sans-serif" font-size="22" font-weight="700">PANEL ${String(panel.panelNumber).padStart(2, '0')}</text>
      <text x="40" y="88" fill="#ffffff" font-family="sans-serif" font-size="14">${panel.beatId}</text>
      <text x="40" y="112" fill="#cccccc" font-family="sans-serif" font-size="11">${panel.storyFunction.slice(0, 52)}</text>
      <text x="40" y="${PANEL_H - 48}" fill="#ffffff" font-family="sans-serif" font-size="12">${panel.era} · ${panel.cameraFraming}</text>
    </svg>`,
  );
  return sharp(svg).jpeg({ quality: 90 }).toBuffer();
}

function compilePanelPrompt(panel: FinalCinematicStoryboardPanelManifestEntry): string {
  return [
    `Cinematic storyboard frame ${panel.panelNumber} for Entry 002 reel.`,
    `Beat: ${panel.beatId} — ${panel.storyFunction}`,
    panel.description,
    `Camera: ${panel.cameraFraming}, ${panel.cameraAngle}.`,
    `NDX: ${panel.ndxVisibility}. Subject: ${panel.subjectVisibility}. Phone: ${panel.phoneState}. Era: ${panel.era}.`,
    panel.requiredText ? `Mandatory text visible: ${panel.requiredText}` : '',
    'Distinct cinematic shot — not a contact sheet, not repeated composition.',
    'NDX partial observer with short lime-green nails. Subject woman separate with French-tip nails.',
    'Full-body outfit-led phone content when subject appears on screen.',
  ]
    .filter(Boolean)
    .join(' ');
}

export async function generateFinalCinematicStoryboardPanel(
  panel: FinalCinematicStoryboardPanelManifestEntry,
  options?: { dispatchFal?: boolean; repair?: boolean },
): Promise<FinalCinematicStoryboardPanelManifestEntry> {
  const publicPath = buildEntry002FinalCinematicStoryboardPanelPublicPath(
    ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
    panel.panelNumber,
    panel.panelVersion,
  );
  const diskPath = publicPathToDisk(publicPath);
  await fs.mkdir(path.dirname(diskPath), { recursive: true });

  const useDeterministic = allowDeterministicTestPanels();
  const shouldUseFal =
    !useDeterministic && (options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim()));

  if (!shouldUseFal && !useDeterministic) {
    return {
      ...panel,
      generationStatus: 'FAILED',
      qaStatus: 'FAIL',
    };
  }

  try {
    let buffer: Buffer;
    let provider: string;
    let model: string;
    let providerRequestId: string | null = null;
    let dispatched = false;

    if (shouldUseFal) {
      const fal = await dispatchFalPanel(compilePanelPrompt(panel));
      buffer = await downloadUrlToBuffer(fal.imageUrl);
      provider = fal.provider;
      model = fal.model;
      providerRequestId = fal.providerRequestId;
      dispatched = true;
    } else {
      buffer = await renderDeterministicPanel(panel);
      provider = 'deterministic-test-panel';
      model = 'sharp-distinct-v1';
      dispatched = false;
    }

    await fs.writeFile(diskPath, buffer);
    const contentHash = createHash('sha256').update(buffer).digest('hex');

    if (dispatched) {
      registerGeneration({
        projectId: 'ndxbook',
        brandId: 'ndxbook',
        entryId: 'entry-002',
        format: 'REEL',
        territoryId: ENTRY_002_TERRITORY_ID,
        worldId: ENTRY_002_WORLD_ID,
        assetId: panel.assetId,
        parentAssetId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
        provider,
        model,
        promptLineage: [
          FINAL_CINEMATIC_STORYBOARD_STAGE_LABEL,
          'sprint-b4.9r-panel',
          panel.beatId,
          `panel-${String(panel.panelNumber).padStart(2, '0')}`,
        ],
        referenceLineage: [
          ENTRY_002_WORLD_ID,
          ENTRY_002_TERRITORY_ID,
          CHAPTER_01_ID,
          ENTRY_002_REEL_ID,
          ...panel.requiredAuthorityIds,
        ],
        trackingState: 'TRACKED',
      });
    }

    return {
      ...panel,
      storagePath: publicPath,
      previewUrl: publicPath,
      contentHash,
      provider,
      providerRequestId,
      generationStatus: 'RENDERED',
      qaStatus: 'PASS',
    };
  } catch {
    return {
      ...panel,
      generationStatus: 'FAILED',
      qaStatus: 'FAIL',
    };
  }
}

export async function assembleFinalCinematicStoryboardSheet(
  manifest: FinalCinematicStoryboardPanelManifestEntry[],
): Promise<{ compositeUrl: string; compositePath: string } | null> {
  const rendered = manifest.filter((p) => p.generationStatus === 'RENDERED' && p.previewUrl);
  if (rendered.length < manifest.length) return null;

  const rows = Math.ceil(rendered.length / COLS);
  const stripW = PANEL_W * COLS;
  const stripH = PANEL_H * rows;
  const composites: sharp.OverlayOptions[] = [];

  for (const panel of rendered) {
    const idx = panel.panelNumber - 1;
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const buf = await fs.readFile(publicPathToDisk(panel.previewUrl!));
    composites.push({ input: buf, top: row * PANEL_H, left: col * PANEL_W });
  }

  const stripBuffer = await sharp({
    create: { width: stripW, height: stripH, channels: 3, background: { r: 8, g: 8, b: 10 } },
  })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toBuffer();

  const stripId = ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_002_ID;
  const publicPath = buildEntry002FinalCinematicStoryboardPublicStripPath(stripId);
  const diskPath = publicPathToDisk(publicPath);
  await fs.mkdir(path.dirname(diskPath), { recursive: true });
  await fs.writeFile(diskPath, stripBuffer);

  try {
    await uploadSite00AssetBuffer(
      buildEntry002FinalCinematicStoryboardStripStoragePath(stripId),
      stripBuffer,
      'image/jpeg',
    );
  } catch {
    // optional storage upload
  }

  return { compositeUrl: publicPath, compositePath: publicPath };
}

export async function runFinalCinematicStoryboardPanelPipeline(options?: {
  dispatchFal?: boolean;
  repairPanelNumbers?: number[];
}): Promise<PanelPipelineResult> {
  const { compileEntry002FinalCinematicStoryboardPanelManifest } = await import(
    './entry002FinalCinematicStoryboardPanelManifest.js'
  );
  let manifest = compileEntry002FinalCinematicStoryboardPanelManifest();

  const telemetry: PanelGenerationTelemetry = {
    panelCompileCount: manifest.length,
    panelDispatchCount: 0,
    panelRenderCount: 0,
    panelFailureCount: 0,
    panelRepairCount: options?.repairPanelNumbers?.length ?? 0,
  };

  const panelsToGenerate = options?.repairPanelNumbers?.length
    ? manifest.filter((p) => options.repairPanelNumbers!.includes(p.panelNumber))
    : manifest;

  const results = await Promise.all(
    panelsToGenerate.map((panel) =>
      generateFinalCinematicStoryboardPanel(panel, {
        dispatchFal: options?.dispatchFal,
        repair: Boolean(options?.repairPanelNumbers?.length),
      }),
    ),
  );

  const updated = new Map<number, FinalCinematicStoryboardPanelManifestEntry>();
  for (const result of results) {
    updated.set(result.panelNumber, result);
    if (result.generationStatus === 'RENDERED') {
      telemetry.panelRenderCount += 1;
      if (result.providerRequestId) telemetry.panelDispatchCount += 1;
    } else {
      telemetry.panelFailureCount += 1;
    }
  }

  manifest = manifest.map((p) => updated.get(p.panelNumber) ?? p);

  const assembly =
    telemetry.panelRenderCount === manifest.length
      ? await assembleFinalCinematicStoryboardSheet(manifest)
      : null;

  return {
    manifest,
    telemetry,
    assembled: assembly !== null,
    compositePath: assembly?.compositePath ?? null,
    compositeUrl: assembly?.compositeUrl ?? null,
  };
}
