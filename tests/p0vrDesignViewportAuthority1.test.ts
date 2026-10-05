/**
 * P0.VR.DESIGN-VIEWPORT-AUTHORITY1
 */

import { describe, expect, it } from 'vitest';

import {
  mergePageViewportIntoReadiness,
  pageRecordToAuthorities,
  resolveHeroPreviewForViewport,
  summarizePageViewportCoverage,
} from '../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';
import { computeDesignReadiness } from '../shared/site00-design-workspace-production/designReadinessEngine.js';
import { createInitialDesignProductionState } from '../shared/site00-design-workspace-production/designProductionStore.js';
import type { DesignBoundPageRecord } from '../shared/site00-design-workspace-production/designProjectBinding/types.js';

function mockPage(partial: Partial<DesignBoundPageRecord> & Pick<DesignBoundPageRecord, 'pageId' | 'screenId'>): DesignBoundPageRecord {
  return {
    projectId: 'ndxbook',
    pageName: partial.pageName ?? 'Test',
    route: '/projects/ndxbook',
    pageRole: 'PAGE',
    parentPageId: null,
    childPageIds: [],
    designStatus: 'IN_REVIEW',
    buildStatus: 'DESIGN',
    authorityStatus: 'MISSING',
    designAuthorityVersion: null,
    interactionContractVersion: 'v1',
    assetManifestVersion: null,
    isConceptOrphan: false,
    mirrorStatus: 'CONCEPT',
    mobilePreviewUrl: null,
    desktopPreviewUrl: null,
    ...partial,
  };
}

describe('P0.VR.DESIGN-VIEWPORT-AUTHORITY1', () => {
  it('mobile-only page: tablet waiting, desktop missing — never reuses mobile src', () => {
    const page = mockPage({
      pageId: 'ndxbook:entry-001-concept',
      screenId: 'entry-001-concept',
      mobilePreviewUrl: '/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg',
      desktopPreviewUrl: null,
    });
    const auth = pageRecordToAuthorities(page);
    const mobile = resolveHeroPreviewForViewport(auth, 'MOBILE');
    const tablet = resolveHeroPreviewForViewport(auth, 'TABLET');
    const desktop = resolveHeroPreviewForViewport(auth, 'DESKTOP');

    expect(mobile.kind).toBe('image');
    if (mobile.kind === 'image') expect(mobile.src).toContain('mobile-master');

    expect(tablet.kind).toBe('tablet-waiting');
    expect(desktop.kind).toBe('missing-design');

    if (tablet.kind === 'image' || desktop.kind === 'image') {
      throw new Error('must not reuse mobile image for tablet/desktop');
    }
  });

  it('mobile + desktop page: tablet derived, desktop available', () => {
    const page = mockPage({
      pageId: 'ndxbook:overview',
      screenId: 'overview',
      mobilePreviewUrl: '/visual-references/founder/ndxbook/mobile-overview.png',
      desktopPreviewUrl: '/visual-references/founder/ndxbook/desktop-overview.png',
      tabletDerivedPreviewUrl: '/visual-references/founder/ndxbook/tablet-derived-overview.png',
    });
    const auth = pageRecordToAuthorities(page);
    const tablet = resolveHeroPreviewForViewport(auth, 'TABLET');
    const desktop = resolveHeroPreviewForViewport(auth, 'DESKTOP');

    expect(tablet.kind).toBe('image');
    if (tablet.kind === 'image') {
      expect(tablet.status).toBe('DERIVED');
      expect(tablet.src).toContain('tablet-derived');
    }
    expect(desktop.kind).toBe('image');
    if (desktop.kind === 'image') expect(desktop.src).toContain('desktop-overview');
  });

  it('tablet override wins over derived', () => {
    const page = mockPage({
      pageId: 'ndxbook:page-c',
      screenId: 'page-c',
      mobilePreviewUrl: '/m.jpg',
      desktopPreviewUrl: '/d.jpg',
      tabletOverridePreviewUrl: '/tablet-override.jpg',
    });
    const auth = pageRecordToAuthorities(page);
    const tablet = resolveHeroPreviewForViewport(auth, 'TABLET');
    expect(tablet.kind).toBe('image');
    if (tablet.kind === 'image') {
      expect(tablet.status).toBe('OVERRIDE');
      expect(tablet.src).toBe('/tablet-override.jpg');
    }
  });

  it('readiness blocks desktop when page coverage missing desktop', () => {
    const state = createInitialDesignProductionState('ndxbook');
    const receipt = computeDesignReadiness(state);
    const merged = mergePageViewportIntoReadiness(receipt, summarizePageViewportCoverage({
      projectId: 'ndxbook',
      pageId: 'x',
      mobileAuthorityUrl: '/m.jpg',
      desktopAuthorityUrl: null,
      tabletOverrideUrl: null,
      tabletDerivedUrl: null,
    }));
    const desktopGate = merged.checks.find((c) => c.id === 'desktop_authority_ready');
    expect(desktopGate?.result).toBe('BLOCKED');
    const tabletGate = merged.checks.find((c) => c.id === 'tablet_responsive');
    expect(tabletGate?.result).toBe('NOT_APPLICABLE');
  });
});
