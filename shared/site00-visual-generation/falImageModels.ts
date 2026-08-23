/**
 * SITE 00 canonical FAL image models — GPT Image 2 for all production generation.
 */

export const SITE00_FAL_TEXT_TO_IMAGE_MODEL = 'openai/gpt-image-2' as const;
export const SITE00_FAL_REFERENCE_EDIT_MODEL = 'openai/gpt-image-2/edit' as const;

/** @deprecated Use SITE00_FAL_TEXT_TO_IMAGE_MODEL */
export const EXPERIENCE_FAL_MODEL = SITE00_FAL_TEXT_TO_IMAGE_MODEL;

export function isGptImage2Model(model: string): boolean {
  return model.startsWith('openai/gpt-image-2');
}

export function aspectRatioToGptImage2Size(aspectRatio: string): string {
  if (aspectRatio === '1:1') return 'square_hd';
  if (aspectRatio === '4:3') return 'landscape_4_3';
  if (aspectRatio === '9:16') return 'portrait_16_9';
  return 'landscape_16_9';
}

export function buildGptImage2TextInput(params: {
  prompt: string;
  aspectRatio?: string;
  outputFormat?: 'webp' | 'png';
}): Record<string, unknown> {
  return {
    prompt: params.prompt,
    image_size: aspectRatioToGptImage2Size(params.aspectRatio ?? '16:9'),
    quality: 'high',
    num_images: 1,
    output_format: params.outputFormat ?? 'webp',
  };
}

export function buildGptImage2EditInput(params: {
  prompt: string;
  imageUrls: string[];
  outputFormat?: 'webp' | 'png';
}): Record<string, unknown> {
  return {
    prompt: params.prompt,
    image_urls: params.imageUrls,
    image_size: 'auto',
    quality: 'high',
    num_images: 1,
    output_format: params.outputFormat ?? 'webp',
  };
}

export function resolveFalImageModel(referenceImageUrls?: string[]): string {
  return (referenceImageUrls?.length ?? 0) > 0
    ? SITE00_FAL_REFERENCE_EDIT_MODEL
    : SITE00_FAL_TEXT_TO_IMAGE_MODEL;
}

export function buildFalImageInput(params: {
  prompt: string;
  aspectRatio?: string;
  outputFormat?: 'webp' | 'png';
  referenceImageUrls?: string[];
}): { model: string; input: Record<string, unknown> } {
  const hasRefs = (params.referenceImageUrls?.length ?? 0) > 0;
  const model = resolveFalImageModel(params.referenceImageUrls);
  if (hasRefs) {
    return {
      model,
      input: buildGptImage2EditInput({
        prompt: params.prompt,
        imageUrls: params.referenceImageUrls ?? [],
        outputFormat: params.outputFormat,
      }),
    };
  }
  return {
    model,
    input: buildGptImage2TextInput({
      prompt: params.prompt,
      aspectRatio: params.aspectRatio,
      outputFormat: params.outputFormat,
    }),
  };
}
