/**
 * Sprint B4.9 — Final cinematic storyboard render + optional FAL dispatch.
 * Local sharp composite is the CI-safe default; FAL only when explicitly dispatched.
 */

import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';
import {
  buildEntry002FinalCinematicStoryboardPublicStripPath,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_ID,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { buildFalImageInput } from '../../../shared/site00-visual-generation/falImageModels.js';
import { buildFinalCinematicStoryboardPrompt } from './entry002FinalCinematicStoryboardBrief.js';
import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../site00Assts/storage.js';
import { registerGeneration } from './lineageRegistration.js';
import { ENTRY_002_TERRITORY_ID, ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_REEL_ID } from './entry002ReelShotPlan.js';
import { buildEntry002FinalCinematicStoryboardStripStoragePath } from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

export const FINAL_CINEMATIC_STORYBOARD_STAGE_LABEL = 'FINAL_CINEMATIC_STORYBOARD' as const;

export type FinalCinematicStoryboardRenderResult = {
  stripId: string;
  storagePath: string;
  publicPath: string;
  previewUrl: string;
  provider: string | null;
  model: string | null;
  providerRequestId: string | null;
  compiled: true;
  dispatched: boolean;
  rendered: boolean;
  actualFileExists: boolean;
  status: 'RENDERED_LOCAL' | 'DISPATCHED' | 'CACHED' | 'FAILED';
  failure: string | null;
  generationReceipt: ReturnType<typeof registerGeneration> | null;
};

const PANEL_W = 320;
const PANEL_H = 568;
const COLS = 5;
const ROWS = 3;

function workspacePublicStripPath(): string {
  return path.join(
    process.cwd(),
    'public',
    buildEntry002FinalCinematicStoryboardPublicStripPath().replace(/^\//, ''),
  );
}

async function readAuthorityBuffer(publicRelativePath: string): Promise<Buffer | null> {
  const fullPath = path.join(process.cwd(), 'public', publicRelativePath.replace(/^\//, ''));
  try {
    return await fs.readFile(fullPath);
  } catch {
    return null;
  }
}

async function renderLocalStoryboardStrip(brief: FinalCinematicStoryboardBrief): Promise<Buffer> {
  const stripW = PANEL_W * COLS;
  const stripH = PANEL_H * ROWS;
  const composites: sharp.OverlayOptions[] = [];

  for (let i = 0; i < brief.panels.length; i++) {
    const panel = brief.panels[i]!;
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const left = col * PANEL_W;
    const top = row * PANEL_H;

    const authorityRef = brief.referenceConditioning[i % brief.referenceConditioning.length];
    const refBuffer = authorityRef?.previewUrl
      ? await readAuthorityBuffer(authorityRef.previewUrl)
      : null;

    let panelSurface: Buffer;
    if (refBuffer) {
      panelSurface = await sharp(refBuffer)
        .resize(PANEL_W, PANEL_H, { fit: 'cover' })
        .modulate({ brightness: 0.72 })
        .toBuffer();
    } else {
      panelSurface = await sharp({
        create: {
          width: PANEL_W,
          height: PANEL_H,
          channels: 3,
          background: { r: 18, g: 18, b: 22 },
        },
      })
        .png()
        .toBuffer();
    }

    const labelSvg = Buffer.from(
      `<svg width="${PANEL_W}" height="${PANEL_H}">
        <rect x="0" y="0" width="${PANEL_W}" height="72" fill="rgba(0,0,0,0.72)"/>
        <text x="12" y="28" fill="#c8ff00" font-family="sans-serif" font-size="14" font-weight="700">
          ${String(panel.panelNumber).padStart(2, '0')}
        </text>
        <text x="12" y="52" fill="#ffffff" font-family="sans-serif" font-size="11">
          ${panel.panelTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 42)}
        </text>
        ${
          panel.mandatoryText
            ? `<rect x="8" y="${PANEL_H - 88}" width="${PANEL_W - 16}" height="72" fill="rgba(0,0,0,0.78)"/>
               <text x="16" y="${PANEL_H - 52}" fill="#c8ff00" font-family="sans-serif" font-size="10" font-weight="700">
                 ${panel.mandatoryText.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 48)}
               </text>`
            : ''
        }
      </svg>`,
    );

    const labeledPanel = await sharp(panelSurface)
      .composite([{ input: labelSvg, top: 0, left: 0 }])
      .jpeg({ quality: 88 })
      .toBuffer();

    composites.push({ input: labeledPanel, top, left });
  }

  return sharp({
    create: {
      width: stripW,
      height: stripH,
      channels: 3,
      background: { r: 8, g: 8, b: 10 },
    },
  })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function dispatchFalStoryboardStrip(prompt: string): Promise<{
  imageUrl: string;
  model: string;
  provider: string;
  providerRequestId: string;
}> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured — final storyboard FAL dispatch blocked');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const { model, input } = buildFalImageInput({
    prompt,
    aspectRatio: '16:9',
    outputFormat: 'webp',
  });

  const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
    requestId?: string;
    request_id?: string;
  };
  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('FAL returned no final cinematic storyboard image');

  return {
    imageUrl,
    model,
    provider: 'fal-gpt-image',
    providerRequestId: result.requestId ?? result.request_id ?? `fal-${randomUUID()}`,
  };
}

export async function renderEntry002FinalCinematicStoryboardStrip(
  brief: FinalCinematicStoryboardBrief,
  options?: { dispatchFal?: boolean; forceDispatch?: boolean },
): Promise<FinalCinematicStoryboardRenderResult> {
  const stripId = ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_ID;
  const storagePath = buildEntry002FinalCinematicStoryboardStripStoragePath();
  const publicPath = buildEntry002FinalCinematicStoryboardPublicStripPath();
  const publicFile = workspacePublicStripPath();
  const shouldDispatchFal = options?.dispatchFal ?? false;

  let publicExists = false;
  try {
    await fs.access(publicFile);
    publicExists = true;
  } catch {
    publicExists = false;
  }

  const storageExists = await site00StorageObjectExists(storagePath);

  if (publicExists && !options?.forceDispatch && !shouldDispatchFal) {
    const previewUrl = publicPath;
    return {
      stripId,
      storagePath,
      publicPath,
      previewUrl,
      provider: null,
      model: null,
      providerRequestId: null,
      compiled: true,
      dispatched: false,
      rendered: publicExists,
      actualFileExists: publicExists,
      status: 'CACHED',
      failure: null,
      generationReceipt: null,
    };
  }

  if (shouldDispatchFal && process.env.FAL_KEY?.trim()) {
    try {
      const prompt = buildFinalCinematicStoryboardPrompt(brief);
      const dispatched = await dispatchFalStoryboardStrip(prompt);
      const buffer = await downloadUrlToBuffer(dispatched.imageUrl);
      await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');
      await fs.mkdir(path.dirname(publicFile), { recursive: true });
      await fs.writeFile(publicFile, await sharp(buffer).jpeg({ quality: 90 }).toBuffer());

      const generationReceipt = registerGeneration({
        projectId: 'ndxbook',
        brandId: 'ndxbook',
        entryId: 'entry-002',
        format: 'REEL',
        territoryId: ENTRY_002_TERRITORY_ID,
        worldId: ENTRY_002_WORLD_ID,
        assetId: stripId,
        parentAssetId: brief.storyboardId,
        provider: dispatched.provider,
        model: dispatched.model,
        promptLineage: [FINAL_CINEMATIC_STORYBOARD_STAGE_LABEL, 'sprint-b4.9-final-cinematic-storyboard'],
        referenceLineage: [
          ENTRY_002_WORLD_ID,
          ENTRY_002_TERRITORY_ID,
          CHAPTER_01_ID,
          ENTRY_002_REEL_ID,
          brief.treatmentId,
          ...brief.authorityIds,
        ],
        trackingState: 'TRACKED',
      });

      return {
        stripId,
        storagePath,
        publicPath,
        previewUrl: publicPath,
        provider: dispatched.provider,
        model: dispatched.model,
        providerRequestId: dispatched.providerRequestId,
        compiled: true,
        dispatched: true,
        rendered: true,
        actualFileExists: true,
        status: 'DISPATCHED',
        failure: null,
        generationReceipt,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Final storyboard FAL dispatch failed';
      return {
        stripId,
        storagePath,
        publicPath,
        previewUrl: publicPath,
        provider: 'fal-gpt-image',
        model: null,
        providerRequestId: null,
        compiled: true,
        dispatched: true,
        rendered: false,
        actualFileExists: false,
        status: 'FAILED',
        failure: message,
        generationReceipt: null,
      };
    }
  }

  try {
    const buffer = await renderLocalStoryboardStrip(brief);
    await fs.mkdir(path.dirname(publicFile), { recursive: true });
    await fs.writeFile(publicFile, buffer);

    try {
      await uploadSite00AssetBuffer(storagePath, buffer, 'image/jpeg');
    } catch {
      // Storage upload optional in CI — public artifact is sufficient for render proof.
    }

    const generationReceipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId: stripId,
      parentAssetId: brief.storyboardId,
      provider: 'local-sharp-composite',
      model: 'sharp-composite-v1',
      promptLineage: [FINAL_CINEMATIC_STORYBOARD_STAGE_LABEL, 'sprint-b4.9-local-composite'],
      referenceLineage: [
        ENTRY_002_WORLD_ID,
        ENTRY_002_TERRITORY_ID,
        CHAPTER_01_ID,
        ENTRY_002_REEL_ID,
        brief.treatmentId,
        ...brief.authorityIds,
      ],
      trackingState: 'TRACKED',
    });

    return {
      stripId,
      storagePath,
      publicPath,
      previewUrl: publicPath,
      provider: 'local-sharp-composite',
      model: 'sharp-composite-v1',
      providerRequestId: null,
      compiled: true,
      dispatched: false,
      rendered: true,
      actualFileExists: true,
      status: 'RENDERED_LOCAL',
      failure: null,
      generationReceipt,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Local storyboard render failed';
    return {
      stripId,
      storagePath,
      publicPath,
      previewUrl: publicPath,
      provider: 'local-sharp-composite',
      model: 'sharp-composite-v1',
      providerRequestId: null,
      compiled: true,
      dispatched: false,
      rendered: false,
      actualFileExists: false,
      status: 'FAILED',
      failure: message,
      generationReceipt: null,
    };
  }
}

export function resolveFinalStoryboardStripPreviewUrl(): string | null {
  const publicFile = workspacePublicStripPath();
  try {
    return buildEntry002FinalCinematicStoryboardPublicStripPath();
  } catch {
    return null;
  }
}
