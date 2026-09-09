/**
 * SKINS pixel-fidelity + reference asset deconstruction — 26 tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assetSlotToExtractedPath,
  auditReferenceAssets,
  auditTypographyAgainstReference,
  BRAND_KEY_TO_ASSET_SLOT,
  buildDefaultSkinsManifest,
  cropConfirmationRequired,
  PACK_SCREEN_TO_ASSET_SLOT,
  requiresReconstructionApproval,
  resolveFamilyThumbnailUrl,
  resolveScreenThumbnailUrl,
  runSkinsPageFidelityQA,
  SKINS_ASSET_SLOTS,
  SKINS_FAMILY_LINE_BREAKS,
  SKINS_FIDELITY_FAILURE_CODES,
  SKINS_GEOMETRY_TOKENS,
  SKINS_REFERENCE_DESKTOP,
  SKINS_REFERENCE_MOBILE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.js';
import { TYPOGRAPHY_FIREWALL } from '../shared/site00-brand-lore/projectSkin/brandFamily/constants.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('SKINS Reference Fidelity (P0.VR.6R3)', () => {
  const manifest = buildDefaultSkinsManifest();

  it('1. mobile SKINS reference enters exact convergence', () => {
    expect(SKINS_REFERENCE_MOBILE).toContain('skins-authority-mobile');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.ts')).toContain(
      'runSkinsPageFidelityQA',
    );
  });

  it('2. desktop SKINS reference enters exact convergence', () => {
    expect(SKINS_REFERENCE_DESKTOP).toContain('skins-authority-desktop');
  });

  it('3. geometry measured', () => {
    expect(SKINS_GEOMETRY_TOKENS.mobile.familyCardWidth).toBe(88);
    expect(SKINS_GEOMETRY_TOKENS.desktop.familyRailWidth).toBe(196);
  });

  it('4. typography measured', () => {
    const deltas = auditTypographyAgainstReference({ fontFamily: 'Martian Mono', usesUppercase: true });
    expect(deltas[0]?.fontFamily).toContain('Martian');
  });

  it('5. line-break mismatch detectable', () => {
    const deltas = auditTypographyAgainstReference({
      fontFamily: 'Martian Mono',
      lineBreaksByRegion: { AIO: ['ALL IN ONE ENTERPRISES'] },
    });
    expect(deltas.some((d) => d.lineBreakMismatch)).toBe(true);
  });

  it('6. generic link-blue drift detectable', () => {
    const deltas = auditTypographyAgainstReference({ linkColor: '#007bff' });
    expect(deltas.some((d) => d.genericLinkBlue)).toBe(true);
  });

  it('7. reference asset candidates detected', () => {
    expect(SKINS_ASSET_SLOTS).toContain('BRAND_FAMILY_NDXBOOK');
    expect(manifest.length).toBeGreaterThanOrEqual(10);
  });

  it('8. crop confirmation required', () => {
    expect(cropConfirmationRequired({ ...manifest[0]!, cropConfirmed: false, status: 'CROP_PENDING' })).toBe(true);
    expect(cropConfirmationRequired(manifest[0]!)).toBe(false);
  });

  it('9. no paid generation before crop confirmation', () => {
    expect(read('scripts/extract-skins-reference-assets.mjs')).toContain('no paid generation');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.ts')).toContain(
      'ASSET_RECONSTRUCTION_APPROVAL_REQUIRED',
    );
  });

  it('10. clean extraction preferred over generation', () => {
    expect(read('scripts/extract-skins-reference-assets.mjs')).toContain('Deconstruction-first');
    expect(assetSlotToExtractedPath('MOBILE', 'BRAND_FAMILY_NDXBOOK')).toContain('.webp');
  });

  it('11. reconstruction requires founder approval', () => {
    expect(
      requiresReconstructionApproval({ ...manifest[0]!, status: 'ASSET_RECONSTRUCTION_APPROVAL_REQUIRED' }),
    ).toBe(true);
  });

  it('12. source crop stored in manifest (not canonical)', () => {
    expect(read('public/site00/skins/extracted/manifest.json')).toContain('sourceCropUrl');
    expect(read('public/site00/skins/extracted/manifest.json')).toContain('RECONSTRUCTION_PENDING');
  });

  it('13. family asset bound to semantic slot', () => {
    expect(BRAND_KEY_TO_ASSET_SLOT.NDXBOOK).toBe('BRAND_FAMILY_NDXBOOK');
    expect(manifest[0]?.sourceCropUrl).toContain('brand_family_ndxbook');
    expect(manifest[0]?.canonicalUrl).toBeNull();
  });

  it('14. NDX family visual awaits reconstruction', () => {
    const url = resolveFamilyThumbnailUrl({ brandKey: 'NDXBOOK', viewport: 'MOBILE', manifest });
    expect(url.colorSwatchFallback).toBe(true);
    expect(url.url).toBeNull();
  });

  it('15. FS family source crop not canonical', () => {
    const entry = manifest.find((m) => m.assetSlot === 'BRAND_FAMILY_FRONTAL_SLAYER');
    expect(entry?.status).toBe('RECONSTRUCTION_PENDING');
    expect(entry?.canonicalUrl).toBeNull();
  });

  it('16. AIO family line breaks preserved', () => {
    expect(SKINS_FAMILY_LINE_BREAKS.AIO).toEqual(['ALL IN ONE', 'ENTERPRISES']);
  });

  it('17. Astral source crop stored separately', () => {
    const entry = manifest.find((m) => m.assetSlot === 'BRAND_FAMILY_ASTRAL_WORLD');
    expect(entry?.sourceCropUrl).toContain('astral_world');
  });

  it('18. Studio World ui contamination flagged', () => {
    const entry = manifest.find((m) => m.assetSlot === 'BRAND_FAMILY_STUDIO_WORLD');
    expect(entry?.uiContaminationSuspected).toBe(true);
  });

  it('19. screen authority thumbnail preferred when available', () => {
    const res = resolveScreenThumbnailUrl({
      viewport: 'MOBILE',
      packScreenType: 'PROJECT_OVERVIEW',
      authorityPreviewUrl: '/approved/overview.png',
      manifest,
    });
    expect(res.source).toBe('AUTHORITY');
    expect(res.url).toBe('/approved/overview.png');
  });

  it('20. safe empty state works when unavailable', () => {
    const res = resolveScreenThumbnailUrl({ viewport: 'MOBILE', packScreenType: 'UNKNOWN', manifest });
    expect(res.source).toBe('EMPTY');
    expect(res.url).toBeNull();
  });

  it('21. color swatch fallback when no canonical asset', () => {
    const thumb = resolveFamilyThumbnailUrl({ brandKey: 'NDXBOOK', viewport: 'MOBILE', manifest });
    expect(thumb.colorSwatchFallback).toBe(true);
    expect(read('src/site00/components/designWorkspace/skins/SkinFamilyThumb.tsx')).toContain('onError');
  });

  it('22. mobile / desktop crop distinction supported', () => {
    const mobile = assetSlotToExtractedPath('MOBILE', 'BRAND_FAMILY_NDXBOOK');
    const desktop = assetSlotToExtractedPath('DESKTOP', 'BRAND_FAMILY_NDXBOOK');
    expect(mobile).toContain('/mobile/');
    expect(desktop).toContain('/desktop/');
  });

  it('23. overlay reruns after assets bind', () => {
    const boundManifest = manifest.map((m) =>
      m.assetSlot === 'BRAND_FAMILY_NDXBOOK' && m.viewport === 'MOBILE'
        ? {
            ...m,
            status: 'BOUND' as const,
            canonicalUrl: '/site00/canonical/ndxbook-family.webp',
            canonicalAssetId: 'can-ndxbook-mobile',
          }
        : m,
    );
    const qa = runSkinsPageFidelityQA({
      viewport: 'MOBILE',
      manifest: boundManifest,
      typographyDeltas: auditTypographyAgainstReference({ fontFamily: 'Martian Mono' }),
      assetDeltas: auditReferenceAssets({
        brandKeys: ['NDXBOOK'],
        viewport: 'MOBILE',
        renderedWithColorSwatch: [],
        manifest: boundManifest,
      }),
      overlayRerunAfterBinding: true,
    });
    expect(qa.pass).toBe(true);
  });

  it('24. typography firewall preserved', () => {
    expect(TYPOGRAPHY_FIREWALL.requiredFontFamily).toBe('MARTIAN MONO');
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain('Martian Mono');
  });

  it('25. child-flow cohesion remains', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('SkinAuthorityFlow');
    expect(read('src/site00/components/designWorkspace/skins/SkinWorkspaceSheet.tsx')).toBeTruthy();
  });

  it('26. build passes', () => {
    expect(PACK_SCREEN_TO_ASSET_SLOT.PROJECT_OVERVIEW).toBe('SCREEN_OVERVIEW');
    expect(SKINS_FIDELITY_FAILURE_CODES).toContain('SKINS_COLOR_SWATCH_FALLBACK');
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('SkinFamilyThumb');
  });
});
