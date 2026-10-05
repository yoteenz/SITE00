/**
 * Cloud preview tunnel — loader skip + auth guard fast path.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('SITE 00 cloud preview tunnel guard', () => {
  it('preview host module reads cloud preview meta', () => {
    const src = read('src/site00/components/loader/site00PreviewHost.ts');
    expect(src).toContain('site00-cloud-preview');
    expect(src).toContain('site00-preview-hostname');
    expect(src).toContain('isSite00CloudPreviewBuild');
  });

  it('boot gate skips loader for cloud preview meta', () => {
    expect(read('public/site00-assts-boot-gate.js')).toContain('site00-cloud-preview');
    expect(read('public/site00-assts-boot-gate.js')).toContain('site00-preview-hostname');
  });

  it('account guard fast-paths cloud preview', () => {
    const guard = read('src/site00/components/guards/Site00AccountRouteGuard.tsx');
    expect(guard).toContain('isSite00CloudPreviewBuild');
    expect(guard).toContain('SIGN IN REQUIRED FOR THIS ROUTE');
    expect(guard).toContain('promiseWithTimeout');
  });

  it('cold start gate releases boot shell synchronously when skipping loader', () => {
    const gate = read('src/site00/components/loader/Site00WorldColdStartGate.tsx');
    expect(gate).toContain('useLayoutEffect');
    expect(gate).toContain('releaseSite00ImmersiveBootRoot');
  });

  it('vite injects cloud preview meta tags', () => {
    expect(read('vite.config.ts')).toContain('site00-cloud-preview');
    expect(read('vite.config.ts')).toContain('site00-preview-hostname');
  });
});
