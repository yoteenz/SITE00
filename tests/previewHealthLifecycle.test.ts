import { describe, expect, it } from 'vitest';
import {
  normalizePreviewUrlForComparison,
  resolvePreviewLoadTimeoutMs,
  PREVIEW_REMOTE_STORAGE_TIMEOUT_MS,
  PREVIEW_STATIC_IMAGE_TIMEOUT_MS,
} from '../shared/site00-studio-world-production/assetDelivery/previewHealthLifecycle.js';

describe('previewHealthLifecycle', () => {
  it('uses longer timeout for Supabase public URLs', () => {
    expect(
      resolvePreviewLoadTimeoutMs(
        'https://cdn.example.test/storage/v1/object/public/live-preview/studio-world/x.webp',
      ),
    ).toBe(PREVIEW_REMOTE_STORAGE_TIMEOUT_MS);
    expect(resolvePreviewLoadTimeoutMs('/site00/x.png')).toBe(PREVIEW_STATIC_IMAGE_TIMEOUT_MS);
  });

  it('normalizes cache-bust query params for URL comparison', () => {
    const a = normalizePreviewUrlForComparison('https://example.com/a.webp?v=1');
    const b = normalizePreviewUrlForComparison('https://example.com/a.webp?v=2');
    expect(a).toBe(b);
  });
});
