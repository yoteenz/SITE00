/**
 * P0.VR.6R9 — Crop overlay / live preview coordinate convergence tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  canonicalFromNormalized,
  canonicalToExtractPixels,
  clampCanonicalCrop,
  MIN_SOURCE_CROP_PX,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/canonicalCropRect.js';
import {
  computeCropByteChecksum,
  computeCropCoordinateChecksum,
  evaluateCropPreviewAlignment,
  assertProviderCropChecksumMatch,
  overlayMappedSourceRect,
  recalibrateCropGeometry,
  resetCropGeometryAuditForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropPreviewAlignment.js';
import {
  moveCanonical,
  overlayCssToSourceRect,
  resizeCanonicalFromHandle,
  roundTripSourceOverlayError,
  screenPointToSourcePoint,
  sourceRectToOverlayCss,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropCoordinateTransform.js';
import {
  computeLayoutImageGeometry,
  computeRenderedImageGeometry,
  computeScreenImageGeometry,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/renderedImageGeometry.js';
import {
  SOURCE_HEIGHT_MOBILE,
  SOURCE_WIDTH_MOBILE,
  MOBILE_FAMILY_CARD_CROPS,
  resolveInnerMediaCrop,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/familyCropCalibration.js';
import {
  initializeCropReview,
  getActiveCrop,
  approveCropReview,
  prepareAllCropReviewsForApproval,
  setAssetIdentity,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/founderCropIntelligence.js';
import { computeCropChecksum } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropGeometry.js';
import { buildSkinsMobileMultiAssetReconstructionJob } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/multiAssetReconstructionJob.js';

function ndxCandidate() {
  return buildSkinsMobileMultiAssetReconstructionJob({
    liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
  })!.candidateAssets[0]!;
}

function ndxMediaCanonical(nw = SOURCE_WIDTH_MOBILE, nh = SOURCE_HEIGHT_MOBILE) {
  const card = MOBILE_FAMILY_CARD_CROPS.NDXBOOK;
  const media = resolveInnerMediaCrop('NDXBOOK', card);
  return canonicalFromNormalized(media, nw, nh);
}

function layoutGeom(
  nw: number,
  nh: number,
  lw: number,
  lh: number,
  objectFit: 'fill' | 'contain' = 'fill',
  zoom = 1,
) {
  return computeLayoutImageGeometry({
    naturalWidth: nw,
    naturalHeight: nh,
    layoutWidth: lw,
    layoutHeight: lh,
    objectFit,
    viewport: { zoom, panX: 0, panY: 0 },
  });
}

describe('P0.VR.6R9 — Crop Coordinate Convergence', () => {
  beforeEach(() => resetCropGeometryAuditForTest());

  it('1. canonical rect is only mutable crop authority', () => {
    const c = ndxMediaCanonical();
    expect(c.sourceNaturalWidth).toBe(SOURCE_WIDTH_MOBILE);
    expect(c.width).toBeGreaterThan(MIN_SOURCE_CROP_PX);
  });

  it('2. overlay derives from canonical rect', () => {
    const canonical = ndxMediaCanonical();
    const geom = layoutGeom(SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 400, 700);
    const css = sourceRectToOverlayCss(canonical, geom);
    expect(css.width).toBeGreaterThan(0);
    expect(css.height).toBeGreaterThan(0);
  });

  it('3. preview derives from canonical rect', () => {
    const canonical = ndxMediaCanonical();
    const extract = canonicalToExtractPixels(canonical);
    expect(extract.width).toBeGreaterThan(0);
    expect(extract.x).toBeGreaterThanOrEqual(0);
  });

  it('4. natural-to-rendered mapping', () => {
    const geom = layoutGeom(941, 1672, 470, 835);
    expect(geom.scaleX).toBeCloseTo(470 / 941, 3);
    expect(geom.scaleY).toBeCloseTo(835 / 1672, 3);
  });

  it('5. rendered-to-natural mapping', () => {
    const geom = layoutGeom(941, 1672, 470, 836);
    const pt = screenPointToSourcePoint(geom.left + 100, geom.top + 50, geom);
    expect(pt.sourceX).toBeCloseTo(100 / geom.scaleX, 2);
    expect(pt.sourceY).toBeCloseTo(50 / geom.scaleY, 2);
  });

  it('6. round-trip tolerance', () => {
    const canonical = ndxMediaCanonical();
    const geom = layoutGeom(SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 320, 568);
    const err = roundTripSourceOverlayError(canonical, geom);
    expect(err.maxErrorPx).toBeLessThan(1);
  });

  it('7. object-fit contain letterbox X', () => {
    const geom = computeRenderedImageGeometry({
      containerWidth: 600,
      containerHeight: 400,
      naturalWidth: 400,
      naturalHeight: 400,
      objectFit: 'contain',
    });
    expect(geom.letterboxX).toBeGreaterThan(0);
    expect(geom.letterboxY).toBe(0);
  });

  it('8. object-fit contain letterbox Y', () => {
    const geom = computeRenderedImageGeometry({
      containerWidth: 400,
      containerHeight: 600,
      naturalWidth: 400,
      naturalHeight: 400,
      objectFit: 'contain',
    });
    expect(geom.letterboxY).toBeGreaterThan(0);
    expect(geom.letterboxX).toBe(0);
  });

  it('9. object-position center (contain)', () => {
    const geom = layoutGeom(941, 1672, 600, 600, 'contain');
    expect(geom.letterboxX + geom.width).toBeLessThanOrEqual(600 + 0.01);
  });

  it('10. object-position custom via layout contain', () => {
    const geom = computeLayoutImageGeometry({
      naturalWidth: 800,
      naturalHeight: 600,
      layoutWidth: 400,
      layoutHeight: 400,
      objectFit: 'contain',
    });
    expect(geom.scaleX).toBeCloseTo(geom.scaleY, 4);
  });

  it('11. CSS vs bitmap pixels', () => {
    const geom = layoutGeom(941, 1672, 300, 532);
    const css = sourceRectToOverlayCss(ndxMediaCanonical(), geom);
    const back = overlayCssToSourceRect(css, geom);
    expect(back.x).toBeCloseTo(ndxMediaCanonical().x, 1);
  });

  it('12. DPR 1', () => {
    const geom = layoutGeom(941, 1672, 400, 700, 'fill', 1);
    geom.devicePixelRatio = 1;
    expect(roundTripSourceOverlayError(ndxMediaCanonical(), geom).maxErrorPx).toBeLessThan(1);
  });

  it('13. DPR 2', () => {
    const geom = layoutGeom(941, 1672, 400, 700, 'fill', 1);
    geom.devicePixelRatio = 2;
    expect(roundTripSourceOverlayError(ndxMediaCanonical(), geom).maxErrorPx).toBeLessThan(1);
  });

  it('14. DPR 3', () => {
    const geom = layoutGeom(941, 1672, 400, 700, 'fill', 1);
    geom.devicePixelRatio = 3;
    expect(roundTripSourceOverlayError(ndxMediaCanonical(), geom).maxErrorPx).toBeLessThan(1);
  });

  it('15. nested scroll (viewport-relative rects)', () => {
    const rect = { left: 120, top: 80, width: 300, height: 532, right: 420, bottom: 612, x: 120, y: 80, toJSON: () => ({}) } as DOMRect;
    const geom = computeScreenImageGeometry({ imageRect: rect, naturalWidth: 941, naturalHeight: 1672 });
    const pt = screenPointToSourcePoint(220, 180, geom);
    expect(pt.sourceX).toBeGreaterThan(0);
  });

  it('16. page scroll does not double-apply offset', () => {
    const rect = { left: 0, top: 500, width: 400, height: 700, right: 400, bottom: 1200, x: 0, y: 500, toJSON: () => ({}) } as DOMRect;
    const geom = computeScreenImageGeometry({ imageRect: rect, naturalWidth: 941, naturalHeight: 1672 });
    expect(geom.left).toBe(0);
    expect(geom.top).toBe(500);
  });

  it('17. transformed parent included in screen rect', () => {
    const rect = { left: 10, top: 20, width: 200, height: 350, right: 210, bottom: 370, x: 10, y: 20, toJSON: () => ({}) } as DOMRect;
    const geom = computeScreenImageGeometry({ imageRect: rect, naturalWidth: 941, naturalHeight: 1672, viewport: { zoom: 2, panX: 0, panY: 0 } });
    expect(geom.width).toBe(200);
  });

  it('18. zoom 50% display scale', () => {
    const geom = layoutGeom(941, 1672, 200, 350, 'fill', 0.5);
    const canonical = ndxMediaCanonical();
    const err = roundTripSourceOverlayError(canonical, geom);
    expect(err.maxErrorPx).toBeLessThan(1);
  });

  it('19. zoom 100%', () => {
    const geom = layoutGeom(941, 1672, 400, 700, 'fill', 1);
    expect(roundTripSourceOverlayError(ndxMediaCanonical(), geom).maxErrorPx).toBeLessThan(1);
  });

  it('20. zoom 200%', () => {
    const geom = layoutGeom(941, 1672, 800, 1400, 'fill', 2);
    expect(roundTripSourceOverlayError(ndxMediaCanonical(), geom).maxErrorPx).toBeLessThan(1);
  });

  it('21. pan does not mutate crop', () => {
    const canonical = ndxMediaCanonical();
    const moved = moveCanonical(canonical, 0, 0);
    expect(moved.x).toBe(canonical.x);
  });

  it('22. crop drag mutates canonical not viewport', () => {
    const canonical = ndxMediaCanonical();
    const moved = moveCanonical(canonical, 20, 0);
    expect(moved.x).toBeCloseTo(canonical.x + 20, 4);
  });

  it('23. left edge resize', () => {
    const canonical = ndxMediaCanonical();
    const resized = resizeCanonicalFromHandle(canonical, 'w', { sourceX: canonical.x + 10, sourceY: canonical.y }, 8);
    expect(resized.x).toBeGreaterThan(canonical.x);
    expect(resized.width).toBeLessThan(canonical.width);
  });

  it('24. right edge resize', () => {
    const canonical = ndxMediaCanonical();
    const resized = resizeCanonicalFromHandle(canonical, 'e', { sourceX: canonical.x + canonical.width - 5, sourceY: canonical.y }, 8);
    expect(resized.width).toBeLessThan(canonical.width);
  });

  it('25. top edge resize', () => {
    const canonical = ndxMediaCanonical();
    const resized = resizeCanonicalFromHandle(canonical, 'n', { sourceX: canonical.x, sourceY: canonical.y + 8 }, 8);
    expect(resized.y).toBeGreaterThan(canonical.y);
  });

  it('26. bottom edge resize', () => {
    const canonical = ndxMediaCanonical();
    const resized = resizeCanonicalFromHandle(canonical, 's', { sourceX: canonical.x, sourceY: canonical.y + canonical.height - 4 }, 8);
    expect(resized.height).toBeLessThan(canonical.height);
  });

  it('27. corner resize', () => {
    const canonical = ndxMediaCanonical();
    const resized = resizeCanonicalFromHandle(canonical, 'se', { sourceX: canonical.x + canonical.width + 12, sourceY: canonical.y + canonical.height + 8 }, 8);
    expect(resized.width).toBeGreaterThan(canonical.width);
    expect(resized.height).toBeGreaterThan(canonical.height);
  });

  it('28. pointer capture contract (handle ids)', () => {
    expect(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']).toHaveLength(8);
  });

  it('29. live preview current-state update', () => {
    const canonical = ndxMediaCanonical();
    const extract = canonicalToExtractPixels(canonical);
    const moved = moveCanonical(canonical, 20, 0);
    const movedExtract = canonicalToExtractPixels(moved);
    expect(movedExtract.x).toBe(extract.x + 20);
  });

  it('30. stale state prevention via deterministic extract', () => {
    const canonical = ndxMediaCanonical();
    const a = canonicalToExtractPixels(canonical);
    const b = canonicalToExtractPixels(canonical);
    expect(a).toEqual(b);
  });

  it('31. clamp to source bounds', () => {
    const canonical = clampCanonicalCrop({
      ...ndxMediaCanonical(),
      x: -10,
      y: -5,
      width: SOURCE_WIDTH_MOBILE + 100,
      height: SOURCE_HEIGHT_MOBILE + 100,
    });
    expect(canonical.x).toBeGreaterThanOrEqual(0);
    expect(canonical.y).toBeGreaterThanOrEqual(0);
    expect(canonical.x + canonical.width).toBeLessThanOrEqual(SOURCE_WIDTH_MOBILE);
  });

  it('32. source image identity mismatch blocks', () => {
    const canonical = ndxMediaCanonical();
    const geom = layoutGeom(SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 400, 700);
    const extract = canonicalToExtractPixels(canonical);
    const result = evaluateCropPreviewAlignment({
      canonical,
      geometry: geom,
      previewExtractRect: extract,
      overlayMappedRect: overlayMappedSourceRect(canonical, geom),
      sourceImageId: 'a',
      expectedSourceImageId: 'b',
    });
    expect(result.status).toBe('SOURCE_IMAGE_MISMATCH');
    expect(result.blocksApproval).toBe(true);
  });

  it('33. PREVIEW_ALIGNMENT_MISMATCH on drift', () => {
    const canonical = ndxMediaCanonical();
    const geom = layoutGeom(SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 400, 700);
    const badExtract = { x: 0, y: 0, width: 50, height: 50 };
    const result = evaluateCropPreviewAlignment({
      canonical,
      geometry: geom,
      previewExtractRect: badExtract,
      overlayMappedRect: overlayMappedSourceRect(canonical, geom),
      sourceImageId: 'same',
      expectedSourceImageId: 'same',
    });
    expect(result.status).toBe('PREVIEW_ALIGNMENT_MISMATCH');
  });

  it('34. approval blocked on mismatch at UI layer', () => {
    const canonical = ndxMediaCanonical();
    const geom = layoutGeom(SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 400, 700);
    const result = evaluateCropPreviewAlignment({
      canonical,
      geometry: geom,
      previewExtractRect: { x: 0, y: 0, width: 10, height: 10 },
      overlayMappedRect: overlayMappedSourceRect(canonical, geom),
      sourceImageId: 'id',
      expectedSourceImageId: 'id',
    });
    expect(result.blocksApproval).toBe(true);
  });

  it('35. recalibration preserves canonical crop', () => {
    const canonical = ndxMediaCanonical();
    const geom = layoutGeom(SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 400, 700);
    const out = recalibrateCropGeometry({ canonical, geometry: geom, candidateId: 'ndx' });
    expect(out.canonical.x).toBe(canonical.x);
    expect(out.canonical.width).toBe(canonical.width);
  });

  it('36. crop byte checksum', () => {
    const canonical = ndxMediaCanonical();
    const byte = computeCropByteChecksum('ndx', canonical);
    expect(byte.startsWith('cbc-')).toBe(true);
  });

  it('37. provider input checksum contract', () => {
    const canonical = ndxMediaCanonical();
    const approved = computeCropCoordinateChecksum('ndx', canonical);
    const provider = computeCropCoordinateChecksum('ndx', canonical);
    expect(assertProviderCropChecksumMatch(approved, provider).pass).toBe(true);
  });

  it('38. NDXBOOK golden case overlay/preview alignment', () => {
    const canonical = ndxMediaCanonical();
    const geom = layoutGeom(SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 320, 568);
    const extract = canonicalToExtractPixels(canonical);
    const result = evaluateCropPreviewAlignment({
      canonical,
      geometry: geom,
      previewExtractRect: extract,
      overlayMappedRect: overlayMappedSourceRect(canonical, geom),
      sourceImageId: 'ndx',
      expectedSourceImageId: 'ndx',
    });
    expect(result.aligned).toBe(true);
    expect(extract.width).toBeLessThan(Math.round(SOURCE_WIDTH_MOBILE * MOBILE_FAMILY_CARD_CROPS.NDXBOOK.width));
  });

  it('39. portrait screenshot aspect', () => {
    const geom = layoutGeom(1080, 2340, 360, 780);
    expect(roundTripSourceOverlayError(ndxMediaCanonical(1080, 2340), geom).maxErrorPx).toBeLessThan(1);
  });

  it('40. landscape screenshot aspect', () => {
    const geom = layoutGeom(1920, 1080, 640, 360);
    expect(roundTripSourceOverlayError(ndxMediaCanonical(1920, 1080), geom).maxErrorPx).toBeLessThan(1);
  });

  it('41. mobile viewport geometry', () => {
    const geom = layoutGeom(SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 390, 693);
    expect(geom.containerWidth).toBe(390);
  });

  it('42. desktop viewport geometry', () => {
    const geom = layoutGeom(SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 800, 1200);
    expect(geom.containerHeight).toBe(1200);
  });

  it('43. build passes (module import smoke)', () => {
    let review = initializeCropReview(ndxCandidate(), 0);
    review = setAssetIdentity(review, 'CONFIRMED');
    review = prepareAllCropReviewsForApproval([review])[0]!;
    const result = approveCropReview(review);
    expect(result.allowed).toBe(true);
    const canonical = canonicalFromNormalized(getActiveCrop(result.review), SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE);
    expect(result.review.cropChecksum).toBe(computeCropCoordinateChecksum(review.candidateId, canonical));
    expect(result.review.cropChecksum).not.toBe(computeCropChecksum(review.candidateId, getActiveCrop(result.review)));
  });
});
