/**
 * V2 per-asset production — reference-conditioned FAL, inspection gate, regeneration.
 */

import { randomUUID } from 'node:crypto';
import {
  FAL_REFERENCE_EDIT_MODEL,
  FAL_TEXT_TO_IMAGE_MODEL,
  type BoardAssetManifestEntry,
  type BoardAssetRecord,
  type CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import { hashPrompt } from './markedUpCopyBoardPlanV2.js';
import { storagePathForBoardAsset } from './boardStore.js';
import {
  extractMotionProofSvg,
  extractSocialProofSvg,
} from './boardCompositorV2.js';
import {
  inspectGeneratedBoardAsset,
  inspectionToQaState,
} from './boardAssetInspector.js';

const BIREFNET_MODEL = 'fal-ai/birefnet/v2';
export const MAX_ASSET_RETRIES = 2;

export type BoardProductionV2Deps = {
  generateFalImage?: (params: {
    prompt: string;
    negativePrompt: string;
    aspectRatio: string;
    referenceImageUrls?: string[];
    requireReference?: boolean;
  }) => Promise<{ url: string; model: string }>;
  removeBackground?: (imageUrl: string) => Promise<string>;
  uploadBuffer?: typeof uploadSite00AssetBuffer;
};

async function uploadReferenceToFal(referenceUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const res = await fetch(referenceUrl);
  if (!res.ok) throw new Error(`Reference fetch failed (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const name = referenceUrl.split('/').pop()?.split('?')[0] || 'ref.webp';
  const type = name.endsWith('.png') ? 'image/png' : 'image/webp';
  return fal.storage.upload(new File([bytes], name, { type }));
}

async function defaultGenerateFalImage(params: {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  referenceImageUrls?: string[];
  requireReference?: boolean;
}): Promise<{ url: string; model: string }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured');

  const hasRefs = (params.referenceImageUrls?.length ?? 0) > 0;
  if (params.requireReference && !hasRefs) {
    throw new Error('REFERENCE CONDITIONING FAILED: reference required but not supplied');
  }

  const model = hasRefs ? FAL_REFERENCE_EDIT_MODEL : FAL_TEXT_TO_IMAGE_MODEL;
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  let input: Record<string, unknown>;
  if (hasRefs) {
    const uploaded: string[] = [];
    for (const url of params.referenceImageUrls ?? []) {
      uploaded.push(url.startsWith('http') ? await uploadReferenceToFal(url) : url);
    }
    input = {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      image_urls: uploaded,
      aspect_ratio: params.aspectRatio,
      output_format: 'webp',
      resolution: '2K',
      num_images: 1,
    };
  } else {
    input = {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      aspect_ratio: params.aspectRatio,
      output_format: 'webp',
      resolution: '2K',
      num_images: 1,
    };
  }

  const result = (await fal.subscribe(model, { input, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
  };
  const url = result?.data?.images?.[0]?.url;
  if (!url) throw new Error('FAL returned no image URL');
  return { url, model };
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

function resolveReferenceUrls(
  entry: BoardAssetManifestEntry,
  plan: CreativeDirectionBoardPlan,
): string[] {
  const urls: string[] = [];
  for (const cropId of entry.referenceCropIds ?? []) {
    const crop = plan.referenceCrops?.find((c) => c.cropId === cropId);
    if (crop?.publicUrl) urls.push(crop.publicUrl);
  }
  if (!urls.length) {
    for (const refId of entry.referenceInputs) {
      const ref = plan.resolvedReferences?.find((r) => r.referenceId === refId);
      if (ref?.publicUrl) urls.push(ref.publicUrl);
    }
  }
  return urls;
}

function buildCodeNativeSvg(entry: BoardAssetManifestEntry, plan: CreativeDirectionBoardPlan): Buffer {
  if (entry.role === 'SOCIAL_FRAME_SUBSTRATE') {
    return Buffer.from(extractSocialProofSvg(plan, plan.desktopMap), 'utf8');
  }
  return Buffer.from(extractMotionProofSvg(plan, plan.desktopMap), 'utf8');
}

export type ProduceAssetV2Result = {
  asset: BoardAssetRecord;
  falCalls: number;
  referenceConditionedCalls: number;
  bgRemovalCalls: number;
  rejected: boolean;
};

export async function produceBoardManifestAssetV2(params: {
  plan: CreativeDirectionBoardPlan;
  entry: BoardAssetManifestEntry;
  iteration?: number;
  promptRevision?: string;
  deps?: BoardProductionV2Deps;
  reuseFromV1?: BoardAssetRecord | null;
}): Promise<ProduceAssetV2Result> {
  const { plan, entry } = params;
  const deps = params.deps ?? {};
  const generateFal = deps.generateFalImage ?? defaultGenerateFalImage;
  const removeBg = deps.removeBackground ?? defaultRemoveBackground;
  const baseUpload = deps.uploadBuffer ?? uploadSite00AssetBuffer;
  const upload = (storagePath: string, buffer: Buffer, contentType: string) =>
    baseUpload(storagePath, buffer, contentType, { upsert: true });
  const iteration = params.iteration ?? 0;

  const prompt = params.promptRevision ?? entry.prompt;
  const promptHash = hashPrompt(prompt);
  const referenceUrls = resolveReferenceUrls(entry, plan);
  const referenceHash = [...entry.referenceInputs, ...(entry.referenceCropIds ?? [])].join('|') || 'none';
  const requireReference =
    entry.classification === 'FAL_REFERENCE_CONDITIONED' && (entry.referenceCropIds?.length ?? 0) > 0;

  if (entry.classification === 'CODE_NATIVE' || entry.classification === 'SVG_NATIVE') {
    const svg = buildCodeNativeSvg(entry, plan);
    const storagePath = storagePathForBoardAsset({
      comparisonIndex: plan.comparisonIndex,
      manifestId: entry.manifestId,
      iteration,
      ext: 'svg',
      boardPlanVersion: plan.boardPlanVersion,
    });
    const uploaded = await upload(storagePath, svg, 'image/svg+xml');
    const inspection = await inspectGeneratedBoardAsset({
      imageUrl: uploaded.publicUrl,
      entry,
      plan,
    });
    return {
      asset: {
        assetId: randomUUID(),
        manifestId: entry.manifestId,
        planId: plan.planId,
        comparisonSetKey: plan.comparisonSetKey,
        directionId: plan.directionId,
        directionName: plan.directionName,
        role: entry.role,
        zoneId: entry.zoneId,
        classification: entry.classification,
        generationMethod: entry.generationMethod,
        url: uploaded.publicUrl,
        storagePath,
        promptHash,
        referenceHash,
        referenceImageInputs: [],
        inspectionReport: inspection,
        qaState: inspectionToQaState(inspection),
        productionState: 'READY',
        backgroundRemovalRequired: false,
        iteration,
        inspectionNotes: inspection.reasons,
        createdAt: new Date().toISOString(),
      },
      falCalls: 0,
      referenceConditionedCalls: 0,
      bgRemovalCalls: 0,
      rejected: false,
    };
  }

  let falCalls = 0;
  let referenceConditionedCalls = 0;
  let bgRemovalCalls = 0;
  const notes: string[] = [];

  let imageUrl: string | null = null;
  let model = FAL_TEXT_TO_IMAGE_MODEL;

  if (params.reuseFromV1?.url && iteration === 0) {
    const reinspect = await inspectGeneratedBoardAsset({
      imageUrl: params.reuseFromV1.url,
      entry,
      plan,
    });
    if (reinspect.decision === 'ACCEPT') {
      imageUrl = params.reuseFromV1.url;
      model = params.reuseFromV1.model ?? model;
      notes.push('Reused v1 asset passing v2 inspection');
    } else {
      notes.push(`V1 reuse rejected: ${reinspect.reasons.join('; ')}`);
    }
  }

  if (!imageUrl) {
    try {
      const result = await generateFal({
        prompt,
        negativePrompt: entry.negativeConstraints.join(', '),
        aspectRatio: aspectForRole(entry.role),
        referenceImageUrls: referenceUrls,
        requireReference,
      });
      falCalls += 1;
      if (referenceUrls.length) referenceConditionedCalls += 1;
      imageUrl = result.url;
      model = result.model;
      notes.push('FAL generation succeeded — awaiting inspection');
    } catch (e) {
      return {
        asset: {
          assetId: randomUUID(),
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
          storagePath: '',
          model,
          promptHash,
          referenceHash,
          referenceImageInputs: referenceUrls.map((url) => {
        const crop = plan.referenceCrops?.find((c) => c.publicUrl === url);
        if (crop?.storagePath) return crop.storagePath;
        const ref = plan.resolvedReferences?.find((r) => r.publicUrl === url);
        return ref?.storagePath ?? url.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/[^/]+\//, '');
      }),
          qaState: 'REJECT',
          productionState: 'FAILED',
          backgroundRemovalRequired: entry.backgroundRemovalRequired,
          iteration,
          inspectionNotes: [`FAL failed: ${e instanceof Error ? e.message : String(e)}`],
          rejectionReason: 'FAL generation failed',
          createdAt: new Date().toISOString(),
        },
        falCalls,
        referenceConditionedCalls,
        bgRemovalCalls,
        rejected: true,
      };
    }
  }

  if (entry.backgroundRemovalRequired && imageUrl) {
    imageUrl = await removeBg(imageUrl);
    bgRemovalCalls += 1;
    notes.push('Background removal applied');
  }

  const buffer = await downloadUrlToBuffer(imageUrl!);
  const storagePath = storagePathForBoardAsset({
    comparisonIndex: plan.comparisonIndex,
    manifestId: entry.manifestId,
    iteration,
    ext: 'webp',
    boardPlanVersion: plan.boardPlanVersion,
  });
  const uploaded = await upload(storagePath, buffer, 'image/webp');

  const inspection = await inspectGeneratedBoardAsset({
    imageUrl: uploaded.publicUrl,
    entry,
    plan,
  });
  notes.push(...inspection.reasons);

  const qaState = inspectionToQaState(inspection);
  const productionState =
    qaState === 'ACCEPT' ? 'READY' : qaState === 'REJECT' ? 'FAILED' : 'NEEDS_REVIEW';

  return {
    asset: {
      assetId: randomUUID(),
      manifestId: entry.manifestId,
      planId: plan.planId,
      comparisonSetKey: plan.comparisonSetKey,
      directionId: plan.directionId,
      directionName: plan.directionName,
      role: entry.role,
      zoneId: entry.zoneId,
      classification: entry.classification,
      generationMethod: entry.generationMethod,
      url: uploaded.publicUrl,
      storagePath,
      model,
      promptHash,
      referenceHash,
      referenceImageInputs: referenceUrls.map((url) => {
        const crop = plan.referenceCrops?.find((c) => c.publicUrl === url);
        if (crop?.storagePath) return crop.storagePath;
        const ref = plan.resolvedReferences?.find((r) => r.publicUrl === url);
        return ref?.storagePath ?? url.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/[^/]+\//, '');
      }),
      inspectionReport: inspection,
      qaState,
      productionState,
      backgroundRemovalRequired: entry.backgroundRemovalRequired,
      iteration,
      inspectionNotes: notes,
      rejectionReason: qaState === 'REJECT' ? inspection.reasons.join('; ') : undefined,
      createdAt: new Date().toISOString(),
    },
    falCalls,
    referenceConditionedCalls,
    bgRemovalCalls,
    rejected: qaState === 'REJECT',
  };
}

export { extractMotionProofSvg, extractSocialProofSvg };
