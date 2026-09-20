/**
 * Playwright CAPTURE SCREEN uses ?designPreview=1 — guard must not redirect to sign-in without API token.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolveCaptureWaitSelector } from '../shared/site00-studio-world-production/visualReconstruction/render/resolveCaptureWaitSelector.js';

describe('designPreview capture auth guard', () => {
  it('Site00AccountRouteGuard bypasses api token redirect for designPreview=1', () => {
    const src = readFileSync('src/site00/components/guards/Site00AccountRouteGuard.tsx', 'utf8');
    expect(src).toContain('allowUnauthenticatedCaptureSurface');
    expect(src).toContain("get('designPreview') === '1'");
    expect(src).toMatch(/allowUnauthenticatedCaptureSurface[\s\S]*apiTokenReady === false && isSignedIn\(\)/);
    expect(src).toMatch(/allowUnauthenticatedCaptureSurface[\s\S]*!isSignedIn\(\)/);
  });

  it('desktop overview capture waits for project hub board marker', () => {
    expect(
      resolveCaptureWaitSelector({
        route: '/projects/ndxbook/overview',
        screenId: 'overview',
        previewDeviceMode: 'desktop',
      }),
    ).toBe('[data-visual-reconstruction="project-hub-desktop-board"]');
  });
});
