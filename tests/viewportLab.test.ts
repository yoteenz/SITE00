import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  VIEWPORT_LAB_PRESETS,
  viewportLabPresetById,
} from '../shared/site00-viewport-lab/presets.js';
import {
  buildViewportLabPreviewSrc,
  resolveViewportLabFixtureSlug,
} from '../shared/site00-viewport-lab/previewTargets.js';
import {
  computePreviewScale,
  effectiveViewportSize,
  iframeRefreshKey,
  swapOrientationDimensions,
} from '../shared/site00-viewport-lab/viewportLabLogic.js';

describe('viewport lab presets', () => {
  it('includes required desktop / tablet / mobile dimensions', () => {
    const byId = Object.fromEntries(VIEWPORT_LAB_PRESETS.map((p) => [p.id, p]));
    expect(byId['desktop-wide']).toMatchObject({ width: 1672, height: 941 });
    expect(byId['tablet-portrait']).toMatchObject({ width: 1086, height: 1448 });
    expect(byId['mobile-baseline']).toMatchObject({ width: 390, height: 844 });
    expect(byId['mobile-wide']).toMatchObject({ width: 430, height: 932 });
  });

  it('swaps orientation cleanly from canonical preset dimensions', () => {
    const mobile = viewportLabPresetById('mobile-baseline');
    expect(effectiveViewportSize(mobile, 'portrait')).toEqual({ width: 390, height: 844 });
    expect(effectiveViewportSize(mobile, 'landscape')).toEqual({ width: 844, height: 390 });
    const desktop = viewportLabPresetById('desktop-wide');
    expect(effectiveViewportSize(desktop, 'landscape')).toEqual({ width: 1672, height: 941 });
    expect(effectiveViewportSize(desktop, 'portrait')).toEqual({ width: 941, height: 1672 });
    expect(swapOrientationDimensions(1086, 1448, 'landscape')).toEqual({ width: 1448, height: 1086 });
  });
});

describe('viewport lab preview targets', () => {
  it('resolves ndxbook fixture preview path', () => {
    expect(resolveViewportLabFixtureSlug('ndxbook')).toBe('fixture-app-ndxbook');
    const built = buildViewportLabPreviewSrc({ projectSlug: 'ndxbook' });
    expect(built).toEqual({ src: '/app/preview/fixture-app-ndxbook', reason: 'ok' });
    const reviews = buildViewportLabPreviewSrc({ projectSlug: 'ndxbook', routeSuffix: '/reviews' });
    expect(reviews.src).toBe('/app/preview/fixture-app-ndxbook/reviews');
  });

  it('empty state when no registry target', () => {
    expect(buildViewportLabPreviewSrc({ projectSlug: 'unknown-project' }).reason).toBe('no-target');
  });

  it('manual internal path must stay under /app/', () => {
    expect(buildViewportLabPreviewSrc({ projectSlug: 'ndxbook', manualInternalPath: '/public/foo' }).reason).toBe(
      'invalid-manual',
    );
    expect(
      buildViewportLabPreviewSrc({
        projectSlug: 'ndxbook',
        manualInternalPath: '/app/preview/fixture-app-ndxbook/inbox',
      }).src,
    ).toBe('/app/preview/fixture-app-ndxbook/inbox');
  });
});

describe('viewport lab scale and refresh', () => {
  it('fit mode scales down to workspace', () => {
    const scale = computePreviewScale({
      frameWidth: 1000,
      frameHeight: 800,
      workspaceWidth: 500,
      workspaceHeight: 400,
      zoom: 'fit',
    });
    expect(scale).toBeLessThan(1);
    expect(scale).toBeCloseTo(0.47, 2);
  });

  it('refresh key bumps with nonce', () => {
    expect(iframeRefreshKey('/app/preview/x', 0)).not.toBe(iframeRefreshKey('/app/preview/x', 1));
  });
});

describe('viewport lab route registration', () => {
  it('registers production viewport-lab child route', () => {
    const routes = readFileSync(join(import.meta.dirname, '../src/routes/Site00Routes.tsx'), 'utf8');
    expect(routes).toContain('path="viewport-lab"');
    expect(routes).toContain('ViewportLabPage');
  });
});
