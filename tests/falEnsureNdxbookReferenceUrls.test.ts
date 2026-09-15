import { describe, expect, it } from 'vitest';
import { ensureFalAccessibleReferenceUrls } from '../shared/site00-visual-generation/falEnsureReferenceUrls.js';

describe('falEnsureReferenceUrls ndxbook reconstruction', () => {
  it('loads light blueprint when site00.com serves SPA HTML', async () => {
    if (!process.env.FAL_KEY?.trim()) {
      expect(true).toBe(true);
      return;
    }
    const site00Url =
      'https://site00.com/assets/ndxbook-reconstruction/ndxbook-mobile-light-technical-blueprint-v1.jpg';
    const out = await ensureFalAccessibleReferenceUrls([site00Url]);
    expect(out[0]).toMatch(/^https:\/\/v3b\.fal\.media\//);
  });
});
