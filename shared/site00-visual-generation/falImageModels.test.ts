import { describe, expect, it } from 'vitest';
import {
  SITE00_FAL_REFERENCE_EDIT_MODEL,
  SITE00_FAL_TEXT_TO_IMAGE_MODEL,
  buildFalImageInput,
  resolveFalImageModel,
} from './falImageModels.js';

describe('SITE00 FAL image models', () => {
  it('uses GPT Image 2 for text-to-image and edit', () => {
    expect(SITE00_FAL_TEXT_TO_IMAGE_MODEL).toBe('openai/gpt-image-2');
    expect(SITE00_FAL_REFERENCE_EDIT_MODEL).toBe('openai/gpt-image-2/edit');
  });

  it('builds gpt-image-2 input shape', () => {
    const t2i = buildFalImageInput({ prompt: 'test', aspectRatio: '16:9' });
    expect(t2i.model).toBe('openai/gpt-image-2');
    expect(t2i.input.image_size).toBe('landscape_16_9');
    expect(t2i.input.quality).toBe('high');

    const edit = buildFalImageInput({ prompt: 'test', referenceImageUrls: ['https://example.com/a.png'] });
    expect(edit.model).toBe('openai/gpt-image-2/edit');
    expect(edit.input.image_urls).toEqual(['https://example.com/a.png']);
  });

  it('resolveFalImageModel picks edit when refs present', () => {
    expect(resolveFalImageModel()).toBe('openai/gpt-image-2');
    expect(resolveFalImageModel(['x'])).toBe('openai/gpt-image-2/edit');
  });
});
