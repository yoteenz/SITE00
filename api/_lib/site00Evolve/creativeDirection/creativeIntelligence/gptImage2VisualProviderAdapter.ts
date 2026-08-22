/**
 * GPT Image 2 provider adapter — BrandNativeVisualBrief → FAL input (provider-agnostic brief in, model-specific out).
 */

import {
  FAL_REFERENCE_EDIT_MODEL,
  FAL_TEXT_TO_IMAGE_MODEL,
} from './creativeDirectionBoardTypes.js';
import type { BrandNativeVisualBrief } from './brandNativeVisualBriefTypes.js';
import type { IdentityNativeVisualBrief } from './identityNativeArtDirectionTypes.js';

export type GptImage2GenerationInput = {
  model: string;
  input: Record<string, unknown>;
};

export function briefToGptImage2Input(params: {
  brief: BrandNativeVisualBrief;
  referenceImageUrls?: string[];
  aspectRatio?: string;
}): GptImage2GenerationInput {
  const hasRefs = (params.referenceImageUrls?.length ?? 0) > 0;
  const model = hasRefs ? FAL_REFERENCE_EDIT_MODEL : FAL_TEXT_TO_IMAGE_MODEL;
  const imageSize =
    params.aspectRatio === '1:1'
      ? 'square_hd'
      : params.aspectRatio === '4:3'
        ? 'landscape_4_3'
        : 'landscape_16_9';

  const negativeSuffix = params.brief.negativeInstructions.slice(0, 12).join('; ');
  const prompt =
    negativeSuffix.length > 0
      ? `${params.brief.compiledPrompt}\n\nAvoid: ${negativeSuffix}`
      : params.brief.compiledPrompt;

  if (hasRefs) {
    return {
      model,
      input: {
        prompt,
        image_urls: params.referenceImageUrls,
        image_size: 'auto',
        quality: 'high',
        num_images: 1,
        output_format: 'webp',
      },
    };
  }

  return {
    model,
    input: {
      prompt,
      image_size: imageSize,
      quality: 'high',
      num_images: 1,
      output_format: 'webp',
    },
  };
}

export async function generateBrandNativeImageFromBrief(params: {
  brief: BrandNativeVisualBrief;
  referenceImageUrls?: string[];
  uploadReference?: (url: string) => Promise<string>;
}): Promise<{ url: string; model: string; costEstimateUsd: number }> {
  return generateImageFromCompiledBrief({
    compiledPrompt: params.brief.compiledPrompt,
    negativeInstructions: params.brief.negativeInstructions,
    referenceImageUrls: params.referenceImageUrls,
    uploadReference: params.uploadReference,
    aspectRatio: '16:9',
  });
}

export async function generateIdentityNativeImageFromBrief(params: {
  brief: IdentityNativeVisualBrief;
  referenceImageUrls?: string[];
  uploadReference?: (url: string) => Promise<string>;
}): Promise<{ url: string; model: string; costEstimateUsd: number }> {
  return generateImageFromCompiledBrief({
    compiledPrompt: params.brief.compiledPrompt,
    negativeInstructions: params.brief.forbiddenGenericBehavior,
    referenceImageUrls: undefined,
    uploadReference: params.uploadReference,
    aspectRatio: '16:9',
    textOnly: true,
  });
}

async function generateImageFromCompiledBrief(params: {
  compiledPrompt: string;
  negativeInstructions: string[];
  referenceImageUrls?: string[];
  uploadReference?: (url: string) => Promise<string>;
  aspectRatio: string;
  textOnly?: boolean;
}): Promise<{ url: string; model: string; costEstimateUsd: number }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured');

  let refUrls = params.referenceImageUrls ?? [];
  if (refUrls.length && params.uploadReference) {
    refUrls = [];
    for (const url of params.referenceImageUrls ?? []) {
      refUrls.push(url.startsWith('http') ? await params.uploadReference(url) : url);
    }
  }

  const useRefs = !params.textOnly && refUrls.length > 0;
  const negativeSuffix = params.negativeInstructions.slice(0, 14).join('; ');
  const prompt =
    negativeSuffix.length > 0 ? `${params.compiledPrompt}\n\nAvoid: ${negativeSuffix}` : params.compiledPrompt;

  const model = useRefs ? FAL_REFERENCE_EDIT_MODEL : FAL_TEXT_TO_IMAGE_MODEL;
  const imageSize =
    params.aspectRatio === '1:1'
      ? 'square_hd'
      : params.aspectRatio === '4:3'
        ? 'landscape_4_3'
        : 'landscape_16_9';

  const input: Record<string, unknown> = useRefs
    ? { prompt, image_urls: refUrls, image_size: 'auto', quality: 'high', num_images: 1, output_format: 'webp' }
    : { prompt, image_size: imageSize, quality: 'high', num_images: 1, output_format: 'webp' };

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const result = (await fal.subscribe(model, { input, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
  };
  const url = result?.data?.images?.[0]?.url;
  if (!url) throw new Error('FAL returned no image URL');

  return { url, model, costEstimateUsd: 0.045 };
}
