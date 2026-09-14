import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ensureFalAccessibleReferenceUrls } from '../shared/site00-visual-generation/falEnsureReferenceUrls.js';

describe('falEnsureReferenceUrls', () => {
  it('vitest passthrough unchanged urls', async () => {
    const urls = await ensureFalAccessibleReferenceUrls(['vitest-fal://mobile-render-test']);
    expect(urls[0]).toBe('vitest-fal://mobile-render-test');
  });

  it('repo public mobile-master is valid JPEG bytes', () => {
    const path = '/workspace/public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg';
    const buf = readFileSync(path);
    expect(buf[0]).toBe(0xff);
    expect(buf[1]).toBe(0xd8);
  });
});
