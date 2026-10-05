import { describe, expect, it } from 'vitest';
import { isSite00ExperienceCompilerPreviewGuestBypass } from '../src/site00/components/loader/site00PreviewHost.js';
import {
  isSite00EcPreviewGuestFeatureActive,
  isSite00PreviewGuestAllowlistedPath,
} from '../src/site00/auth/site00ShellAuthState.js';

describe('Experience Compiler preview guest bypass', () => {
  it('host helper is false in vitest (no tunnel hostname)', () => {
    expect(isSite00ExperienceCompilerPreviewGuestBypass()).toBe(false);
  });

  it('feature requires VITE_SITE00_EC_PREVIEW_GUEST build flag', () => {
    expect(isSite00EcPreviewGuestFeatureActive()).toBe(false);
  });

  it('allowlist is route-specific when preview guest flag is off', () => {
    expect(isSite00PreviewGuestAllowlistedPath('/studio/site00/experience-compiler')).toBe(true);
    expect(isSite00PreviewGuestAllowlistedPath('/control')).toBe(false);
  });
});
