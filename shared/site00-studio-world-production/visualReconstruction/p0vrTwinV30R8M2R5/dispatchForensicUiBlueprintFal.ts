import { site00IsVitest } from '../../runtime/site00RuntimeEnv.js';
import { runFalReferenceImageJob } from '../../../site00-visual-generation/falReferenceImageJob.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { forensicBlueprintContentHash } from './forensicBlueprintHash.js';
import {
  FORENSIC_BLUEPRINT_FAL_ENDPOINT,
  FORENSIC_BLUEPRINT_OUTPUT_FORMAT,
  FORENSIC_BLUEPRINT_PROMPT_VERSION,
  FORENSIC_BLUEPRINT_RESOLUTION,
  FORENSIC_BLUEPRINT_GENERATION_FAILED,
} from './constants.js';
import { buildForensicUiBlueprintPrompt } from './buildForensicUiBlueprintPrompt.js';
import {
  forensicBlueprintCacheKey,
  readForensicBlueprintFromCache,
  writeForensicBlueprintToCache,
} from './forensicBlueprintCache.js';
import type { ForensicBlueprintGenerationReceipt, ForensicUiBlueprintAuthority } from './forensicTypes.js';
import { evaluateForensicBlueprintQualityGate } from './forensicBlueprintQualityGate.js';

export function buildNanoBanana2EditInput(input: {
  prompt: string;
  primaryImageUrl: string;
  secondaryImageUrl?: string | null;
}): Record<string, unknown> {
  const imageUrls = [input.primaryImageUrl];
  if (input.secondaryImageUrl) imageUrls.push(input.secondaryImageUrl);
  return {
    prompt: input.prompt,
    image_urls: imageUrls,
    output_format: FORENSIC_BLUEPRINT_OUTPUT_FORMAT,
    resolution: FORENSIC_BLUEPRINT_RESOLUTION,
    num_images: 1,
    limit_generations: true,
    enable_web_search: false,
    thinking_level: 'high',
  };
}

export async function generateForensicUiBlueprintAuthority(input: {
  projectId: string;
  sourceActualAuthorityId: string;
  sourceActualHash: string;
  primaryActualImageUrl: string;
  secondaryLightBlueprintUrl?: string | null;
  canonicalViewport: { widthPx: number; heightPx: number };
}): Promise<{
  authority: ForensicUiBlueprintAuthority;
  receipt: ForensicBlueprintGenerationReceipt;
}> {
  const cacheKey = forensicBlueprintCacheKey({ actualHash: input.sourceActualHash });
  const cached = readForensicBlueprintFromCache(cacheKey);
  if (cached) {
    return {
      authority: cached,
      receipt: {
        id: `fbgr-cache-${cached.id}`,
        endpoint: cached.falEndpoint,
        requestId: cached.falRequestId,
        sourceActualHash: input.sourceActualHash,
        secondaryBlueprintHash:
          input.secondaryLightBlueprintUrl ? forensicBlueprintContentHash(input.secondaryLightBlueprintUrl) : null,
        promptVersion: FORENSIC_BLUEPRINT_PROMPT_VERSION,
        resolution: FORENSIC_BLUEPRINT_RESOLUTION,
        outputFormat: FORENSIC_BLUEPRINT_OUTPUT_FORMAT,
        resultUrl: cached.falResultUrl,
        resultHash: cached.blueprintHash,
        costUsd: null,
        generatedAt: cached.generatedAt,
      },
    };
  }

  const prompt = buildForensicUiBlueprintPrompt({
    sourceActualHash: input.sourceActualHash,
    canonicalViewport: input.canonicalViewport,
  });

  let falResult: Awaited<ReturnType<typeof runFalReferenceImageJob>>;
  try {
    falResult = await runFalReferenceImageJob({
      jobKey: `forensic-ui-blueprint-${input.projectId}`,
      prompt,
      referenceImageUrls: input.secondaryLightBlueprintUrl ?
        [input.primaryActualImageUrl, input.secondaryLightBlueprintUrl]
      : [input.primaryActualImageUrl],
      aspectRatio: '9:16',
      model: FORENSIC_BLUEPRINT_FAL_ENDPOINT,
    });
  } catch {
    throw new Error(FORENSIC_BLUEPRINT_GENERATION_FAILED);
  }

  const blueprintHash = forensicBlueprintContentHash(`${falResult.url}:${input.sourceActualHash}`);
  const quality = evaluateForensicBlueprintQualityGate({
    sourceActualHash: input.sourceActualHash,
    blueprintHash,
    compositionObjectCount: 0,
  });

  const authority: ForensicUiBlueprintAuthority = {
    id: `fuba-${fnv1aHex(blueprintHash).slice(0, 12)}`,
    projectId: input.projectId,
    viewport: 'MOBILE',
    sourceActualAuthorityId: input.sourceActualAuthorityId,
    sourceActualHash: input.sourceActualHash,
    falEndpoint: FORENSIC_BLUEPRINT_FAL_ENDPOINT,
    falRequestId: falResult.jobRef,
    falResultUrl: falResult.url,
    blueprintImageUri: falResult.url,
    blueprintHash,
    generatedAt: new Date().toISOString(),
    status: quality.pass ? 'MACHINE_VALIDATED' : 'FOUNDER_BLUEPRINT_REVIEW',
    founderReviewStatus: 'PENDING',
  };

  if (!quality.pass) {
    throw new Error(quality.failureCode ?? 'FORENSIC_BLUEPRINT_NOT_FAITHFUL');
  }

  writeForensicBlueprintToCache(cacheKey, authority);

  const receipt: ForensicBlueprintGenerationReceipt = {
    id: `fbgr-${authority.id}`,
    endpoint: FORENSIC_BLUEPRINT_FAL_ENDPOINT,
    requestId: falResult.jobRef,
    sourceActualHash: input.sourceActualHash,
    secondaryBlueprintHash:
      input.secondaryLightBlueprintUrl ? forensicBlueprintContentHash(input.secondaryLightBlueprintUrl) : null,
    promptVersion: FORENSIC_BLUEPRINT_PROMPT_VERSION,
    resolution: FORENSIC_BLUEPRINT_RESOLUTION,
    outputFormat: FORENSIC_BLUEPRINT_OUTPUT_FORMAT,
    resultUrl: falResult.url,
    resultHash: blueprintHash,
    costUsd: site00IsVitest() ? 0 : null,
    generatedAt: authority.generatedAt,
  };

  return { authority, receipt };
}

export { resolveForensicUiBlueprintAuthoritySync } from './resolveForensicUiBlueprintAuthoritySync.js';
