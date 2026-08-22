/**
 * Per-asset production for board manifest entries.
 */

import { CREATIVE_DIRECTION_FAL_MODEL } from '../assetGeneration.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import type {
  BoardAssetManifestEntry,
  BoardAssetRecord,
  CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import { assetJobKey, hashPrompt } from './markedUpCopyBoardPlan.js';
import { storagePathForBoardAsset } from './boardStore.js';
import {
  composeBoardSvg,
  extractMotionProofSvg,
  extractSocialProofSvg,
} from './boardCompositor.js';

const BIREFNET_MODEL = 'fal-ai/birefnet/v2';
const MAX_RETRIES = 2;

export type BoardProductionDeps = {
  generateFalImage?: (params: {
    prompt: string;
    negativePrompt: string;
    aspectRatio: string;
  }) => Promise<{ url: string; model: string }>;
  removeBackground?: (imageUrl: string) => Promise<string>;
  uploadBuffer?: typeof uploadSite00AssetBuffer;
};

async function defaultGenerateFalImage(params: {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
}): Promise<{ url: string; model: string }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const result = (await fal.subscribe(CREATIVE_DIRECTION_FAL_MODEL, {
    input: {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      aspect_ratio: params.aspectRatio,
      output_format: 'webp',
      resolution: '2K',
      num_images: 1,
    },
    logs: false,
  })) as { data?: { images?: Array<{ url?: string }> } };

  const url = result?.data?.images?.[0]?.url;
  if (!url) throw new Error('FAL returned no image URL');
  return { url, model: CREATIVE_DIRECTION_FAL_MODEL };
}

async function defaultRemoveBackground(imageUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured for background removal');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const result = (await fal.subscribe(BIREFNET_MODEL, {
    input: { image_url: imageUrl },
    logs: false,
  })) as { data?: { image?: { url?: string } } };

  const url = result?.data?.image?.url;
  if (!url) throw new Error('BiRefNet returned no isolated image');
  return url;
}

function aspectForRole(role: BoardAssetManifestEntry['role']): string {
  if (role === 'SECONDARY_PHOTOGRAPHIC_EVIDENCE') return '4:3';
  if (role === 'PHYSICAL_EDITOR_OBJECT') return '1:1';
  return '16:9';
}

function inspectAsset(entry: BoardAssetManifestEntry, notes: string[]): 'ACCEPT' | 'REJECT' | 'NEEDS_HUMAN_REVIEW' {
  const hasStockInPrompt = entry.negativeConstraints.some((n) => n.includes('stock'));
  if (notes.some((n) => n.includes('FAL failed'))) return 'REJECT';
  if (entry.classification === 'CODE_NATIVE' || entry.classification === 'SVG_NATIVE') return 'ACCEPT';
  if (notes.some((n) => n.includes('generic') && !hasStockInPrompt)) return 'NEEDS_HUMAN_REVIEW';
  return 'ACCEPT';
}

function buildCodeNativeSvg(entry: BoardAssetManifestEntry, plan: CreativeDirectionBoardPlan): Buffer {
  if (entry.role === 'SOCIAL_FRAME_SUBSTRATE') {
    const svg = extractSocialProofSvg(plan, plan.desktopMap);
    return Buffer.from(svg, 'utf8');
  }
  const svg = extractMotionProofSvg(plan, plan.desktopMap);
  return Buffer.from(svg, 'utf8');
}

export async function produceBoardManifestAsset(params: {
  plan: CreativeDirectionBoardPlan;
  entry: BoardAssetManifestEntry;
  existing?: BoardAssetRecord | null;
  iteration?: number;
  deps?: BoardProductionDeps;
}): Promise<{ asset: BoardAssetRecord; falCalls: number; bgRemovalCalls: number; regenerations: number }> {
  const { plan, entry } = params;
  const deps = params.deps ?? {};
  const generateFal = deps.generateFalImage ?? defaultGenerateFalImage;
  const removeBg = deps.removeBackground ?? defaultRemoveBackground;
  const upload = deps.uploadBuffer ?? uploadSite00AssetBuffer;

  const promptHash = hashPrompt(entry.prompt);
  const referenceHash = entry.referenceInputs.join('|') || 'none';
  const iteration = params.iteration ?? params.existing?.iteration ?? 0;

  if (
    params.existing &&
    params.existing.productionState === 'READY' &&
    params.existing.qaState === 'ACCEPT' &&
    params.existing.promptHash === promptHash
  ) {
    return {
      asset: params.existing,
      falCalls: 0,
      bgRemovalCalls: 0,
      regenerations: 0,
    };
  }

  let falCalls = 0;
  let bgRemovalCalls = 0;
  const notes: string[] = [];
  let storagePath = '';
  let model: string | undefined;
  let buffer: Buffer;
  let contentType = 'image/webp';
  let publicUrl = '';

  try {
    if (entry.classification === 'CODE_NATIVE' || entry.classification === 'SVG_NATIVE') {
      buffer = buildCodeNativeSvg(entry, plan);
      contentType = 'image/svg+xml';
      storagePath = storagePathForBoardAsset({
        comparisonIndex: plan.comparisonIndex,
        manifestId: entry.manifestId,
        iteration,
        ext: 'svg',
      });
      notes.push('Code-native asset composed deterministically');
    } else {
      const negativePrompt = entry.negativeConstraints.join(', ');
      const { url, model: falModel } = await generateFal({
        prompt: entry.prompt,
        negativePrompt,
        aspectRatio: aspectForRole(entry.role),
      });
      falCalls += 1;
      model = falModel;
      notes.push('FAL generation succeeded — asset-role-specific prompt');

      let finalUrl = url;
      if (entry.backgroundRemovalRequired) {
        finalUrl = await removeBg(url);
        bgRemovalCalls += 1;
        notes.push('Background removal applied — overlap-ready alpha');
      }

      buffer = await downloadUrlToBuffer(finalUrl);
      storagePath = storagePathForBoardAsset({
        comparisonIndex: plan.comparisonIndex,
        manifestId: entry.manifestId,
        iteration,
        ext: 'webp',
      });
    }

    const uploaded = await upload(storagePath, buffer, contentType);
    publicUrl = uploaded.publicUrl;
  } catch (e) {
    notes.push(`FAL failed: ${e instanceof Error ? e.message : 'unknown'}`);
    const qaState = inspectAsset(entry, notes);
    return {
      asset: {
        assetId: entry.assetId,
        manifestId: entry.manifestId,
        planId: plan.planId,
        comparisonSetKey: plan.comparisonSetKey,
        directionId: plan.directionId,
        directionName: plan.directionName,
        role: entry.role,
        zoneId: entry.zoneId,
        classification: entry.classification,
        generationMethod: entry.generationMethod,
        url: '',
        storagePath: storagePath || 'failed',
        model,
        promptHash,
        referenceHash,
        qaState,
        productionState: 'FAILED',
        backgroundRemovalRequired: entry.backgroundRemovalRequired,
        iteration,
        inspectionNotes: notes,
        createdAt: new Date().toISOString(),
      },
      falCalls,
      bgRemovalCalls,
      regenerations: iteration,
    };
  }

  const qaState = inspectAsset(entry, notes);

  return {
    asset: {
      assetId: entry.assetId,
      manifestId: entry.manifestId,
      planId: plan.planId,
      comparisonSetKey: plan.comparisonSetKey,
      directionId: plan.directionId,
      directionName: plan.directionName,
      role: entry.role,
      zoneId: entry.zoneId,
      classification: entry.classification,
      generationMethod: entry.generationMethod,
      url: publicUrl,
      storagePath,
      model,
      promptHash,
      referenceHash,
      qaState,
      productionState: qaState === 'REJECT' ? 'FAILED' : 'READY',
      backgroundRemovalRequired: entry.backgroundRemovalRequired,
      iteration,
      inspectionNotes: notes,
      createdAt: new Date().toISOString(),
    },
    falCalls,
    bgRemovalCalls,
    regenerations: iteration,
  };
}

export { composeBoardSvg, MAX_RETRIES, assetJobKey };
