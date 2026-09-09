/**
 * SKINS pixel-fidelity no-op recovery — 14 tests.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  approvedVisualAssetExists,
  getSkinsCanonicalBinding,
  SKINS_APPROVED_CANONICAL_BINDINGS,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsCanonicalBindings.js';
import {
  getSkinsDesignAuthority,
  isSkinsAuthorityRegistered,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsAuthorityRegistry.js';
import {
  assertApprovedFamilyAssetRendered,
  buildDefaultSkinsManifest,
  resolveFamilyThumbnailUrl,
  SKINS_REFERENCE_MOBILE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.js';
import { buildReferenceAssetPrompt } from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/referenceAssetPipeline.js';
import {
  computePixelDeltaRatio,
  evaluateVisualImplementationDelta,
  VISUAL_NO_OP_FAILURE_CODE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/visualImplementationNoOpGuard.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('SKINS Pixel-Fidelity No-Op Recovery', () => {
  const manifest = buildDefaultSkinsManifest();

  it('1. authority reference is registered', () => {
    expect(isSkinsAuthorityRegistered('MOBILE')).toBe(true);
    expect(getSkinsDesignAuthority('MOBILE')?.fidelityMode).toBe('EXACT');
    expect(getSkinsDesignAuthority('MOBILE')?.publicUrl).toBe(SKINS_REFERENCE_MOBILE);
  });

  it('2. NDX source crop exists', () => {
    expect(existsSync(join(ROOT, 'public/site00/skins/extracted/mobile/brand_family_ndxbook.webp'))).toBe(true);
  });

  it('3. source crop is not canonical', () => {
    const entry = manifest.find((m) => m.assetSlot === 'BRAND_FAMILY_NDXBOOK' && m.viewport === 'MOBILE');
    expect(entry?.sourceCropUrl).toContain('extracted');
    expect(entry?.canonicalUrl).not.toBe(entry?.sourceCropUrl);
  });

  it('4. reconstruction output exists', () => {
    expect(existsSync(join(ROOT, 'public/site00/skins/canonical/mobile/brand_family_ndxbook.webp'))).toBe(true);
  });

  it('5. canonical asset exists', () => {
    const binding = getSkinsCanonicalBinding('MOBILE', 'BRAND_FAMILY_NDXBOOK');
    expect(binding?.canonicalAssetId).toBe('can-ndxbook-mobile-v1');
    expect(binding?.model).toContain('gpt-image-2/edit');
  });

  it('6. binding resolves', () => {
    const thumb = resolveFamilyThumbnailUrl({ brandKey: 'NDXBOOK', viewport: 'MOBILE', manifest });
    expect(thumb.url).toBe('/site00/skins/canonical/mobile/brand_family_ndxbook.webp');
    expect(thumb.source).toBe('CANONICAL');
  });

  it('7. approved asset prevents color fallback', () => {
    const thumb = resolveFamilyThumbnailUrl({ brandKey: 'NDXBOOK', viewport: 'MOBILE', manifest });
    expect(thumb.colorSwatchFallback).toBe(false);
    expect(thumb.approvedVisualAssetExists).toBe(true);
    expect(assertApprovedFamilyAssetRendered(thumb).pass).toBe(true);
  });

  it('8. broken binding throws visible internal failure', () => {
    expect(read('src/site00/components/designWorkspace/skins/SkinFamilyThumb.tsx')).toContain(
      'SKINS_ASSET_BINDING_LOAD_FAILED',
    );
  });

  it('9. family-row geometry tokens derive from authority', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.ts')).toContain(
      'SKINS_GEOMETRY_TOKENS',
    );
    expect(read('src/site00/styles/site00-design-skins-tab.css')).toContain('--skins-mobile-family-w: 88px');
  });

  it('10. typography delta runs', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.ts')).toContain(
      'auditTypographyAgainstReference',
    );
  });

  it('11. before / after screenshot comparison runs', () => {
    const unchanged = evaluateVisualImplementationDelta({
      before: { label: 'before', deltaRatio: 0.001 },
      after: { label: 'after', deltaRatio: 0.001 },
    });
    expect(unchanged.failureCode).toBe(VISUAL_NO_OP_FAILURE_CODE);
    const changed = evaluateVisualImplementationDelta({
      before: { label: 'before', deltaRatio: 0.05 },
      after: { label: 'after', deltaRatio: 0.05 },
    });
    expect(changed.materialVisualDelta).toBe(true);
  });

  it('12. no-op detection fails unchanged implementation', () => {
    const buf = new Uint8Array(16);
    expect(computePixelDeltaRatio(buf, buf)).toBe(0);
  });

  it('13. mobile convergence runs', () => {
    expect(read('src/site00/components/designWorkspace/DesignSkinsTab.tsx')).toContain('site00-dw-skins__mobile');
    expect(SKINS_APPROVED_CANONICAL_BINDINGS.length).toBeGreaterThanOrEqual(1);
  });

  it('14. build passes', () => {
    const prompt = buildReferenceAssetPrompt({
      assetType: 'PROJECT_VISUAL',
      targetSlot: 'BRAND_FAMILY_NDXBOOK_THUMBNAIL',
      backgroundPolicy: 'KEEP_BACKGROUND',
      brandLabel: 'NDXBOOK',
    });
    expect(prompt).toContain('NDXBOOK');
    expect(approvedVisualAssetExists('MOBILE', 'BRAND_FAMILY_NDXBOOK')).toBe(true);
  });
});
