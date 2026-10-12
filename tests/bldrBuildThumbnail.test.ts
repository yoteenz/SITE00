import { describe, expect, it } from 'vitest';
import { compose } from '../src/site00/builder-studio/buildObject/composition';
import {
  buildThumbnailCacheKey,
  getCachedBuildThumbnail,
  scheduleBuildThumbnail,
  webglAvailable,
} from '../src/site00/builder-studio/buildObject/engine';

describe('BLDR build thumbnails', () => {
  it('uses a stable cache key per composition and size', () => {
    const c = compose('place', { path: 'SIMPLE', feel: 'MODERN', modules: [], pace: 'STANDARD' });
    expect(buildThumbnailCacheKey(c, 176, 88)).toBe(`${c.key}@176x88`);
  });

  it('returns the same cached URL on repeat schedule calls', async () => {
    if (!webglAvailable()) return;
    const c = compose('feel', { path: 'ADVANCED', feel: 'BOLD', modules: ['PAGES'], pace: 'STANDARD' });
    const first = await scheduleBuildThumbnail(c, 120, 80);
    const second = getCachedBuildThumbnail(c, 120, 80);
    expect(first).toBeTruthy();
    expect(second).toBe(first);
  });
});
