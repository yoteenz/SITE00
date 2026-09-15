import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ensureFalAccessibleReferenceUrls } from '../shared/site00-visual-generation/falEnsureReferenceUrls.js';

const FIXTURE_PNG = join(
  dirname(fileURLToPath(import.meta.url)),
  'fixtures/twin-v41-founder-forensic-blueprint.png',
);

describe('falEnsureReferenceUrls', () => {
  it('vitest passthrough unchanged urls', async () => {
    const urls = await ensureFalAccessibleReferenceUrls(['vitest-fal://mobile-render-test']);
    expect(urls[0]).toBe('vitest-fal://mobile-render-test');
  });

  it('repo forensic fixture PNG has valid magic bytes', () => {
    expect(existsSync(FIXTURE_PNG)).toBe(true);
    const buf = readFileSync(FIXTURE_PNG);
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
  });
});
