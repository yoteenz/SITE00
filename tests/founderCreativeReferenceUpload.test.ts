/**
 * Reference board upload — body limit + storage handoff.
 */

import { describe, expect, it } from 'vitest';
import {
  buildReferenceBoardStoragePath,
  parseReferenceBoardImageData,
  uploadFounderReferenceBoardImage,
} from '../api/_lib/site00Evolve/founderCreativeIngestion/referenceBoardUpload.js';

describe('reference board upload', () => {
  it('parses data URL image payloads', () => {
    const png = Buffer.from('fake-png').toString('base64');
    const buffer = parseReferenceBoardImageData(`data:image/png;base64,${png}`);
    expect(buffer.toString()).toBe('fake-png');
  });

  it('rejects empty image data', () => {
    expect(() => parseReferenceBoardImageData('')).toThrow(/Empty/);
  });

  it('builds deterministic storage paths', () => {
    const path = buildReferenceBoardStoragePath('ndxbook', 'meet-ndx');
    expect(path).toContain('site00/founder-creative-ingestion/ndxbook/references/meet-ndx/');
    expect(path.endsWith('.webp')).toBe(true);
  });

  it('uploads in vitest without calling Supabase', async () => {
    process.env.VITEST = 'true';
    const tinyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const result = await uploadFounderReferenceBoardImage({
      projectId: 'ndxbook',
      sequenceId: 'meet-ndx',
      imageData: tinyPng,
    });
    expect(result.storagePath).toContain('references/meet-ndx');
    expect(result.previewUrl).toContain('references/meet-ndx');
  });
});
