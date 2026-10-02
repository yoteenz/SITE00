import { describe, expect, it } from 'vitest';
import {
  deriveSite00ShellAccess,
  isSite00PreviewGuestAllowlistedPath,
  resolveSite00ShellAuthMode,
} from '../src/site00/auth/site00ShellAuthState.js';
import { resolveOperatingWorldNavHref } from '../src/site00/config/ecosystem-nav.js';

describe('site00ShellAuthState', () => {
  it('allowlists experience compiler and preview-guest studio landing only', () => {
    expect(isSite00PreviewGuestAllowlistedPath('/studio/site00/experience-compiler')).toBe(true);
    expect(isSite00PreviewGuestAllowlistedPath('/studio/site00/preview-guest')).toBe(true);
    expect(isSite00PreviewGuestAllowlistedPath('/studio/site00')).toBe(false);
    expect(isSite00PreviewGuestAllowlistedPath('/studio/site00/input')).toBe(false);
  });

  it('derives preview guest access without protected data or mutations', () => {
    const access = deriveSite00ShellAccess('PREVIEW_GUEST');
    expect(access.canUseExperienceCompiler).toBe(true);
    expect(access.canNavigateStudioPreview).toBe(true);
    expect(access.canReadProtectedProjectData).toBe(false);
    expect(access.canMutateProtectedProjectData).toBe(false);
    expect(access.persistenceDegraded).toBe(true);
  });

  it('forces PREVIEW_GUEST when previewGuestForce is set on allowlisted path', () => {
    expect(
      resolveSite00ShellAuthMode('/studio/site00/experience-compiler', { previewGuestForce: true }),
    ).toBe('PREVIEW_GUEST');
  });
});
