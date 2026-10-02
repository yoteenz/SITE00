import { describe, expect, it } from 'vitest';
import { isSite00ExperienceCompilerPreviewGuestBypass } from '../src/site00/components/loader/site00PreviewHost.js';

describe('Experience Compiler preview guest bypass', () => {
  it('is enabled only on known tunnel hosts', () => {
    expect(isSite00ExperienceCompilerPreviewGuestBypass()).toBe(false);
    // jsdom default hostname is not tunnel — helper returns false unless cloud preview meta/env set in browser
  });
});
