/**
 * Page concept GENERATE transport + capture URL payload fixes.
 */

import { describe, expect, it, vi } from 'vitest';

import {
  pageGenerationCapturePayloadValid,
  resolvePageGenerationCaptureBase64,
} from '../api/_lib/site00PageConcept/resolvePageGenerationCapture.js';

describe('page concept transport fix', () => {
  it('accepts artifactUrl-only capture payloads', () => {
    expect(
      pageGenerationCapturePayloadValid({
        captureId: 'c1',
        artifactUrl: 'https://api.site00.com/snap.png',
        width: 390,
        height: 844,
      }),
    ).toBe(true);
    expect(pageGenerationCapturePayloadValid({ captureId: 'c1', width: 1, height: 1 })).toBe(false);
  });

  it('server resolves artifactUrl to base64', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]).toString('base64');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => Buffer.from(png, 'base64'),
      })),
    );
    const out = await resolvePageGenerationCaptureBase64({
      captureId: 'c1',
      artifactUrl: 'https://example.com/a.png',
      width: 390,
      height: 844,
    });
    expect(out).toBe(png);
    vi.unstubAllGlobals();
  });
});
