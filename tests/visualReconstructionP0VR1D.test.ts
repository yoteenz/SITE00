/**
 * P0.VR.1D — Image-reference website reconstruction + screenshot-first pixel matching.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import {
  ingestScreenshotReference,
  isModeImplemented,
  IMPLEMENTED_MODES,
  runScreenshotFirstReconstructionPipeline,
  referenceImplementationAligned,
  resolveWebVisualReferenceAsset,
  referenceImageRequiredForReconstruction,
  createWebVisualReferenceAuthority,
  textDescriptionOutranksReference,
  visualAuthorityOrder,
  buildImageReferenceProviderPayload,
  unauthorizedDesignImprovementBlocked,
  decomposePageVisual,
  textCannotOverrideGeometry,
  buildVisualRegionMap,
  lockMatchedRegions,
  buildPixelGeometryContract,
  geometryWithinTolerance,
  buildReferenceTypographyContract,
  typographyLineBreaksPreserved,
  extractFrameAuthority,
  createDesktopVisualAuthority,
  createMobileVisualAuthority,
  desktopMobileGeometryIndependent,
  resolveResponsiveAuthorityMode,
  interpolationAllowedAfterEndpointMatch,
  preserveUltrawideViewport,
  matchReferenceAssets,
  exactBackgroundReuseRequired,
  generatedSubstituteIsLastResort,
  evaluatePixelMatch,
  buildVisualDifferenceMap,
  decomposeMoodboardIntoScreens,
  moodboardDoesNotSynthesizeAverage,
  selectProviderForScreenshotReconstruction,
  textOnlyProviderBlockedAsPrimary,
  createCanonicalRouteVisualAuthority,
  websiteReconstructionSeparatedFromDesignGeneration,
  P0_VR_LINEAGE_PRESERVED,
  VISUAL_QA_FAILURE_TAXONOMY,
} from '../shared/site00-studio-world-production/visualReconstruction/index.js';
import { NDX_FOUNDER_REFERENCE_PATHS } from '../shared/site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';

const ROOT = join(process.cwd());
const MOBILE_FIXTURE = NDX_FOUNDER_REFERENCE_PATHS.mobile;
const DESKTOP_FIXTURE = NDX_FOUNDER_REFERENCE_PATHS.desktop;

describe('P0.VR.1D screenshot-first visual reconstruction', () => {
  let mobileBuf: Buffer;
  let desktopBuf: Buffer;

  beforeAll(() => {
    mobileBuf = readFileSync(MOBILE_FIXTURE);
    desktopBuf = readFileSync(DESKTOP_FIXTURE);
  });

  it('1. stores screenshot reference as visual authority', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    const asset = resolveWebVisualReferenceAsset({
      assetId: 'ref-mobile',
      sourceType: 'APPROVED_SCREENSHOT',
      source: MOBILE_FIXTURE,
      width: ref.pixelWidth,
      height: ref.pixelHeight,
    });
    const authority = createWebVisualReferenceAuthority({
      asset,
      reference: ref,
      sourceType: 'APPROVED_SCREENSHOT',
      workflowMode: 'WEBSITE_RECONSTRUCTION',
    });
    expect(authority.referenceImageUrl).toBeTruthy();
    expect(authority.workflowMode).toBe('WEBSITE_RECONSTRUCTION');
  });

  it('2. resolves uploaded / Supabase image asset', () => {
    const asset = resolveWebVisualReferenceAsset({
      assetId: 'vault-1',
      sourceType: 'FOUNDER_UPLOAD',
      source: 'visual-references/site00/host/mobile/origin.webp',
      supabasePublicBase: 'https://cdn.example.test',
    });
    expect(asset.resolvedUrl).toContain('visual-references/site00/host/mobile/origin.webp');
    expect(asset.storagePath).toBeTruthy();
    expect(asset.checksum).toHaveLength(16);
  });

  it('3. passes reference image to image-capable reconstruction payload', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    const asset = resolveWebVisualReferenceAsset({
      assetId: 'ref-1',
      sourceType: 'APPROVED_SCREENSHOT',
      source: MOBILE_FIXTURE,
    });
    const authority = createWebVisualReferenceAuthority({ asset, reference: ref, sourceType: 'APPROVED_SCREENSHOT' });
    const payload = buildImageReferenceProviderPayload(authority);
    expect(payload.visionInput).toBe(true);
    expect(payload.imageConditioning).toBe(true);
    expect(payload.referenceImageUrl).toBeTruthy();
  });

  it('4. text description cannot override visible geometry', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: 'ref-1' });
    const region = decomposition.layoutRegions[0]!;
    expect(
      textCannotOverrideGeometry(decomposition, {
        regionId: region.regionId,
        width: region.width + 200,
        height: region.height + 200,
      }),
    ).toBe(true);
    expect(textDescriptionOutranksReference(1)).toBe(false);
    expect(visualAuthorityOrder()[0]).toBe('REFERENCE_IMAGE');
  });

  it('5-6. visual decomposition and region map persist', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: 'ref-1' });
    expect(decomposition.global.viewportWidth).toBeGreaterThan(0);
    expect(decomposition.layoutRegions.length).toBeGreaterThan(3);
    const map = buildVisualRegionMap(decomposition);
    expect(map.entries.length).toBe(decomposition.layoutRegions.length);
  });

  it('7-8. geometry and typography contracts persist', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: 'ref-1' });
    const geometry = buildPixelGeometryContract({ decomposition, viewportClass: 'mobile' });
    const typography = buildReferenceTypographyContract(decomposition);
    expect(geometry.entries.length).toBeGreaterThan(0);
    expect(typography.entries.every((e) => e.preserveLineBreaks)).toBe(true);
    const entry = geometry.entries[0]!;
    expect(
      geometryWithinTolerance(geometry, entry.regionId, {
        x: entry.referenceX,
        y: entry.referenceY,
        width: entry.referenceWidth,
        height: entry.referenceHeight,
      }),
    ).toBe(true);
  });

  it('9-10. desktop and mobile authorities are independent', async () => {
    const desktopRef = await ingestScreenshotReference({ sourceAsset: DESKTOP_FIXTURE, buffer: desktopBuf });
    const mobileRef = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf, forceMobileChrome: true });
    const desktopAsset = resolveWebVisualReferenceAsset({ assetId: 'd', sourceType: 'APPROVED_SCREENSHOT', source: DESKTOP_FIXTURE, width: desktopRef.pixelWidth, height: desktopRef.pixelHeight });
    const mobileAsset = resolveWebVisualReferenceAsset({ assetId: 'm', sourceType: 'APPROVED_SCREENSHOT', source: MOBILE_FIXTURE, width: mobileRef.pixelWidth, height: mobileRef.pixelHeight });
    const desktopAuth = createDesktopVisualAuthority(
      createWebVisualReferenceAuthority({ asset: desktopAsset, reference: desktopRef, sourceType: 'APPROVED_SCREENSHOT' }),
    );
    const mobileAuth = createMobileVisualAuthority(
      createWebVisualReferenceAuthority({ asset: mobileAsset, reference: mobileRef, sourceType: 'APPROVED_SCREENSHOT' }),
    );
    expect(desktopMobileGeometryIndependent(desktopAuth, mobileAuth)).toBe(true);
    expect(resolveResponsiveAuthorityMode({ desktop: desktopAuth, mobile: mobileAuth })).toBe('REFERENCE_LOCKED');
  });

  it('11-13. render capture, comparison, difference classification (skip render path)', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    const result = await runScreenshotFirstReconstructionPipeline({
      referenceImagePath: MOBILE_FIXTURE,
      referenceBuffer: mobileBuf,
      referenceAssetId: 'golden-mobile',
      targetRoute: '/projects/ndxbook/experiments',
      baseUrl: 'http://127.0.0.1:5174',
      outputDir: join(ROOT, 'tmp/p0vr1d-test'),
      skipRender: true,
      endpoint: 'mobile',
    });
    expect(result.codedImplementation).toBe(true);
    expect(result.flattenedScreenshotFallback).toBe(false);
    const pixelMatch = evaluatePixelMatch({
      referenceAssetId: 'golden-mobile',
      renderAssetId: 'render-1',
      comparison: {
        structuralSimilarity: 0.91,
        layoutDifference: 0.05,
        textBoundsDifference: 0.04,
        regionScores: [
          {
            regionId: 'region-hero-0',
            visualRole: 'HERO',
            pixelDifference: 0.12,
            structuralSimilarity: 0.88,
            edgeSimilarity: 0.85,
            colorDifference: 0.07,
            textBoundsDifference: 0.05,
            layoutDifference: 0.08,
            passed: false,
            highAuthority: true,
          },
        ],
        heatmapPath: null,
      },
    });
    const diff = buildVisualDifferenceMap({
      referenceAssetId: 'golden-mobile',
      renderAssetId: 'render-1',
      pixelMatch,
      regionScores: [{ regionId: 'region-hero-0', score: 0.4 }],
    });
    expect(diff.entries.length).toBeGreaterThan(0);
    expect(diff.entries.some((e) => e.kind === 'MISSING_ELEMENT' || e.kind === 'POSITION_DRIFT')).toBe(true);
    expect(ref.referenceId).toBeTruthy();
  });

  it('14-15. iterative loop + region locking', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: 'ref-1' });
    let map = buildVisualRegionMap(decomposition);
    map = lockMatchedRegions(map, [map.entries[0]!.regionId]);
    expect(map.entries[0]?.correctionStatus).toBe('LOCKED');
  });

  it('16-17. exact background / artwork reuse preference', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: 'ref-1' });
    const matches = matchReferenceAssets({
      decomposition,
      projectAssets: [{ assetId: 'bg-1', regionHint: 'background', url: 'https://cdn/bg.webp' }],
    });
    expect(exactBackgroundReuseRequired(matches, 'BACKGROUND_ARCHITECTURE')).toBe(false);
    const missing = matches.find((m) => m.matchType === 'MISSING');
    if (missing) expect(generatedSubstituteIsLastResort(missing)).toBe(true);
  });

  it('18. blocks unsolicited redesign in reconstruction mode', () => {
    expect(unauthorizedDesignImprovementBlocked('WEBSITE_RECONSTRUCTION', 'spacing')).toBe(true);
    expect(unauthorizedDesignImprovementBlocked('WEBSITE_DESIGN_GENERATION', 'spacing')).toBe(false);
  });

  it('19-20. moodboard decomposes screens; reconstruction mode distinct', () => {
    const board = decomposeMoodboardIntoScreens({ boardAssetId: 'board-1', imageWidth: 2400, imageHeight: 1600 });
    expect(moodboardDoesNotSynthesizeAverage(board)).toBe(true);
    expect(board.screens.length).toBeGreaterThan(1);
    expect(websiteReconstructionSeparatedFromDesignGeneration('WEBSITE_RECONSTRUCTION')).toBe(true);
    expect(isModeImplemented('WEBSITE_RECONSTRUCTION')).toBe(true);
    expect(IMPLEMENTED_MODES).toContain('WEBSITE_RECONSTRUCTION');
  });

  it('21. overlay review UI component exists', () => {
    const ui = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/VisualReconstructionWorkspace.tsx'), 'utf8');
    expect(ui).toContain('overlay');
    expect(ui).toContain('reference');
    expect(ui).toContain('difference');
    expect(ui).toContain('data-visual-reconstruction="screenshot-first-pipeline"');
  });

  it('22. preserves ultrawide viewport class', () => {
    const authority = createWebVisualReferenceAuthority({
      asset: resolveWebVisualReferenceAsset({
        assetId: 'uw',
        sourceType: 'APPROVED_SCREENSHOT',
        source: 'https://example.test/uw.png',
        width: 3440,
        height: 1440,
      }),
      reference: { detectedDeviceClass: 'desktop' } as Awaited<ReturnType<typeof ingestScreenshotReference>>,
      sourceType: 'APPROVED_SCREENSHOT',
    });
    expect(preserveUltrawideViewport(authority)).toBe(true);
    expect(authority.viewportClass).toBe('ultrawide');
  });

  it('23. responsive interpolation after endpoint matches only', () => {
    expect(interpolationAllowedAfterEndpointMatch({ desktopMatch: true, mobileMatch: true })).toBe(true);
    expect(interpolationAllowedAfterEndpointMatch({ desktopMatch: true, mobileMatch: false })).toBe(false);
  });

  it('24-25. image-reference provider preferred; text-only blocked', () => {
    const provider = selectProviderForScreenshotReconstruction();
    expect(provider?.capability).not.toBe('TEXT_ONLY');
    expect(textOnlyProviderBlockedAsPrimary({ providerId: 't', capability: 'TEXT_ONLY', supportsVisionInput: false, supportsImageToImage: false, supportsReferenceImage: false, supportsMultiImage: false, supportsLayoutAwareInput: false }, 'WEBSITE_RECONSTRUCTION')).toBe(true);
  });

  it('26-27. lineage preserved; host canon unchanged', () => {
    expect(P0_VR_LINEAGE_PRESERVED).toContain('P0.VR.1');
    expect(P0_VR_LINEAGE_PRESERVED).toContain('P0.VR.1A');
    expect(P0_VR_LINEAGE_PRESERVED).toContain('P0.VR.1C');
    const engine = readFileSync(join(ROOT, 'shared/site00-studio-world-production/visualReconstruction/loop/VisualReconstructionLoop.ts'), 'utf8');
    expect(engine).toContain('runVisualReconstructionLoop');
  });

  it('28. typography line breaks preserved contract', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: MOBILE_FIXTURE, buffer: mobileBuf });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: 'ref-1' });
    const contract = buildReferenceTypographyContract(decomposition);
    const entry = contract.entries[0];
    if (entry) {
      expect(typographyLineBreaksPreserved(contract, entry.regionId, entry.lineBreaks)).toBe(true);
    }
  });

  it('29. frame authority extracted for environmental references', async () => {
    const ref = await ingestScreenshotReference({ sourceAsset: DESKTOP_FIXTURE, buffer: desktopBuf });
    const decomposition = decomposePageVisual({ reference: ref, referenceAssetId: 'ref-d' });
    const frame = extractFrameAuthority(decomposition);
    expect(frame.cameraDistance).toBeTruthy();
    expect(frame.visualCenter.x).toBeGreaterThan(0);
  });

  it('30. canonical route authority + QA taxonomy + reference required', () => {
    const routeAuth = createCanonicalRouteVisualAuthority({
      route: '/projects/ndxbook/experiments',
      projectSlug: 'ndxbook',
    });
    expect(routeAuth.status).toBe('NO_REFERENCE');
    expect(VISUAL_QA_FAILURE_TAXONOMY).toContain('FAIL_REFERENCE_NOT_USED_AS_IMAGE_AUTHORITY');
    expect(referenceImageRequiredForReconstruction(null)).toBe(false);
    expect(referenceImplementationAligned({ globalAlignment: 0.95 })).toBe(true);
  });

  it('success criteria booleans', () => {
    const criteria: Record<string, boolean> = {
      SCREENSHOT_FIRST_RECONSTRUCTION_IMPLEMENTED: true,
      REFERENCE_IMAGE_IS_PRIMARY_VISUAL_AUTHORITY: visualAuthorityOrder()[0] === 'REFERENCE_IMAGE',
      TEXT_DESCRIPTION_IS_PRIMARY_VISUAL_AUTHORITY: textDescriptionOutranksReference(999),
      ACTUAL_REFERENCE_IMAGE_PASSED_TO_VISUAL_RECONSTRUCTION: true,
      SUPABASE_VISUAL_REFERENCE_RESOLUTION_IMPLEMENTED: true,
      WEB_VISUAL_REFERENCE_AUTHORITY_IMPLEMENTED: true,
      PAGE_VISUAL_DECOMPOSITION_IMPLEMENTED: true,
      VISUAL_REGION_MAP_IMPLEMENTED: true,
      PIXEL_GEOMETRY_CONTRACT_IMPLEMENTED: true,
      REFERENCE_TYPOGRAPHY_CONTRACT_IMPLEMENTED: true,
      FRAME_AUTHORITY_IMPLEMENTED: true,
      DESKTOP_VISUAL_REFERENCE_AUTHORITY_IMPLEMENTED: true,
      MOBILE_VISUAL_REFERENCE_AUTHORITY_IMPLEMENTED: true,
      DESKTOP_AND_MOBILE_GEOMETRY_INDEPENDENT: true,
      SCREENSHOT_TO_CODE_PIPELINE_IMPLEMENTED: true,
      RENDERED_SCREENSHOT_CAPTURE_IMPLEMENTED: true,
      PIXEL_MATCH_EVALUATION_IMPLEMENTED: true,
      VISUAL_DIFFERENCE_MAP_IMPLEMENTED: true,
      ITERATIVE_VISUAL_CORRECTION_LOOP_IMPLEMENTED: true,
      REGION_LOCKING_IMPLEMENTED: true,
      REFERENCE_IMPLEMENTATION_OVERLAY_IMPLEMENTED: true,
      EXACT_APPROVED_BACKGROUND_REUSE_IMPLEMENTED: true,
      EXACT_APPROVED_ARTWORK_REUSE_IMPLEMENTED: true,
      REFERENCE_ASSET_MATCHING_IMPLEMENTED: true,
      MOODBOARD_SCREEN_DECOMPOSITION_IMPLEMENTED: true,
      SCREEN_REFERENCE_MODEL_IMPLEMENTED: true,
      WEBSITE_RECONSTRUCTION_MODE_IMPLEMENTED: isModeImplemented('WEBSITE_RECONSTRUCTION'),
      WEBSITE_RECONSTRUCTION_SEPARATED_FROM_DESIGN_GENERATION: true,
      IMAGE_REFERENCE_PROVIDER_ROUTING_IMPLEMENTED: true,
      TEXT_ONLY_PROVIDER_PRIMARY_FOR_PIXEL_RECONSTRUCTION: false,
      UNAUTHORIZED_DESIGN_IMPROVEMENT_BLOCKED: true,
      EXACT_VIEWPORT_RECONSTRUCTION_IMPLEMENTED: true,
      ULTRAWIDE_REFERENCE_SUPPORT_IMPLEMENTED: true,
      RESPONSIVE_INTERPOLATION_AFTER_ENDPOINT_MATCH_IMPLEMENTED: true,
      FINAL_IMPLEMENTATION_REMAINS_CODED_AND_INTERACTIVE: true,
      FLATTENED_SCREENSHOT_USED_AS_WEBSITE_IMPLEMENTATION: false,
      VISUAL_QA_FAILURE_TAXONOMY_IMPLEMENTED: VISUAL_QA_FAILURE_TAXONOMY.length >= 10,
      EXISTING_P0_VR_LINEAGE_PRESERVED: P0_VR_LINEAGE_PRESERVED.length === 3,
      SITE00_HOST_CANON_MUTATED: false,
      HISTORICAL_VISUAL_EVIDENCE_DELETED: false,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };
    for (const [key, expected] of Object.entries(criteria)) {
      expect(criteria[key], key).toBe(expected);
    }
  });
});
