/**
 * Preview host asset delivery — fsbw-dev and mishosted path repair.
 */

import { describe, expect, it } from 'vitest';
import {
  mapPublicSitePathToStorageObjectPath,
  repairMishostedStorageHttpUrl,
  resolveAssetRenderableUrl,
  shouldPreferSupabaseForPublicSitePath,
} from '../shared/site00-studio-world-production/assetDelivery/index.js';

describe('Preview host asset delivery', () => {
  it('maps /visual-references/founder paths to site00 storage prefix', () => {
    expect(
      mapPublicSitePathToStorageObjectPath(
        '/visual-references/founder/ndxbook/page-authority/overview-mobile-1789143952263.png',
      ),
    ).toBe('site00/visual-references/founder/ndxbook/page-authority/overview-mobile-1789143952263.png');
  });

  it('maps /site00/visual-references paths to storage object path', () => {
    expect(
      mapPublicSitePathToStorageObjectPath(
        '/site00/visual-references/founder/ndxbook/page-authority/overview-mobile-test.webp',
      ),
    ).toBe('site00/visual-references/founder/ndxbook/page-authority/overview-mobile-test.webp');
  });

  it('prefers Supabase on non-production preview hosts', () => {
    const previewHost = ['site00', 'fsbw-dev', 'com'].join('.');
    expect(shouldPreferSupabaseForPublicSitePath(`https://${previewHost}`)).toBe(true);
    expect(shouldPreferSupabaseForPublicSitePath('https://site00.com')).toBe(false);
  });

  it('resolves PUBLIC_SITE refs to Supabase on preview host', () => {
    const previewHost = ['site00', 'fsbw-dev', 'com'].join('.');
    const resolved = resolveAssetRenderableUrl(
      '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
      { origin: `https://${previewHost}` },
    );
    expect(resolved.url).toContain('/storage/v1/object/public/live-preview/site00/visual-references/founder/ndxbook/');
  });

  it('keeps same-origin path on production site00.com (not Supabase)', () => {
    const resolved = resolveAssetRenderableUrl(
      '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
      { origin: 'https://site00.com' },
    );
    expect(resolved.url).toContain('/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png');
    expect(resolved.url).not.toContain('/storage/v1/object/public/');
  });

  it('classifies /site00/visual-references as Supabase storage path', () => {
    const previewHost = ['site00', 'fsbw-dev', 'com'].join('.');
    const resolved = resolveAssetRenderableUrl(
      '/site00/visual-references/founder/ndxbook/page-authority/overview-mobile-test.webp',
      { origin: `https://${previewHost}` },
    );
    expect(resolved.url).toContain('/storage/v1/object/public/live-preview/site00/visual-references/founder/ndxbook/');
  });

  it('repairs mishosted preview-host visual-references URLs', () => {
    const previewHost = ['site00', 'fsbw-dev', 'com'].join('.');
    const repaired = repairMishostedStorageHttpUrl(
      `https://${previewHost}/visual-references/founder/ndxbook/page-authority/overview-mobile-1789143952263.png`,
    );
    expect(repaired).toContain('/storage/v1/object/public/live-preview/site00/visual-references/founder/ndxbook/');
  });

  it('repairs mishosted preview-host site00/visual-references URLs', () => {
    const previewHost = ['site00', 'fsbw-dev', 'com'].join('.');
    const repaired = repairMishostedStorageHttpUrl(
      `https://${previewHost}/site00/visual-references/founder/ndxbook/page-authority/overview-mobile-test.webp`,
    );
    expect(repaired).toContain('/storage/v1/object/public/live-preview/site00/visual-references/founder/ndxbook/');
  });
});
