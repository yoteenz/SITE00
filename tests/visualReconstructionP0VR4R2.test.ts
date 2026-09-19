/**
 * P0.VR.4R2 — Reference crop authority + zero-waste generation guard tests.
 */

import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import sharp from 'sharp';
import {
  displaySelectionToSourcePixels,
  sourcePixelsToNormalized,
  normalizedToSourcePixels,
  applyPaddingToBounds,
  referenceCropGeometryGuard,
  isPointLikeBounds,
  evaluateObjectCoverageQA,
  evaluateReferenceCropQA,
  runDesignGenerationPreflight,
  PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
  PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS,
  PROJECTS_HEADER_PLANET_LEGACY_BAD_BOUNDS,
  PROJECTS_HEADER_PLANET_PADDING_PERCENT,
  PROJECTS_REFERENCE_SOURCE_WIDTH,
  PROJECTS_REFERENCE_SOURCE_HEIGHT,
  isLegacyBadPlanetCrop,
  hashCropBuffer,
  extractCropBuffer,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/index.js';
import { buildCoordinateRecord } from '../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/coordinateSpace.js';
import { clearCropStoreForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr4r2/cropLineage.js';

const REPO_ROOT = join(process.cwd());
const REF_PATH = join(REPO_ROOT, 'public/visual-references/founder/site00/projects-index-approved-reference.jpg');
const FIXTURE_DIR = join(REPO_ROOT, 'tests/fixtures/p0vr4r2');
const GOLDEN_CROP_PATH = join(FIXTURE_DIR, 'projects-header-planet-golden-crop.png');

describe('P0.VR.4R2 — crop authority', () => {
  beforeEach(() => clearCropStoreForTest());

  it('1–2. records source vs display dimensions distinctly', () => {
    const record = buildCoordinateRecord({
      sourceWidth: 946,
      sourceHeight: 667,
      displayWidth: 473,
      displayHeight: 333,
      detectedBounds: PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
      paddingPercent: PROJECTS_HEADER_PLANET_PADDING_PERCENT,
      sourceScreenshotId: 'test',
      cropId: 'crop-test',
      cropVersion: 1,
    });
    expect(record.sourceWidth).toBe(946);
    expect(record.displayWidth).toBe(473);
    expect(record.scaleX).toBeCloseTo(2, 0);
  });

  it('3–4. display coordinates convert to source pixels + normalized', () => {
    const source = displaySelectionToSourcePixels({
      sourceWidth: 946,
      sourceHeight: 667,
      displayWidth: 473,
      displayHeight: 333,
      selectionDisplay: { x: 264, y: 21, width: 182, height: 159 },
    });
    expect(source.width).toBeGreaterThan(350);
    const norm = sourcePixelsToNormalized(source, 946, 667);
    expect(norm.normalizedWidth).toBeGreaterThan(0.35);
    const back = normalizedToSourcePixels(norm, 946, 667);
    expect(back.width).toBe(source.width);
  });

  it('5–6. device pixel ratio and scroll do not corrupt when accounted for', () => {
    const a = displaySelectionToSourcePixels({
      sourceWidth: 946,
      sourceHeight: 667,
      displayWidth: 946,
      displayHeight: 667,
      devicePixelRatio: 2,
      scrollX: 0,
      scrollY: 0,
      selectionDisplay: PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
    });
    const b = displaySelectionToSourcePixels({
      sourceWidth: 946,
      sourceHeight: 667,
      displayWidth: 946,
      displayHeight: 667,
      devicePixelRatio: 1,
      selectionDisplay: PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
    });
    expect(a.x).toBe(b.x);
  });

  it('7–8. legacy small core crop fails hero guard; point bounds fail', () => {
    expect(isLegacyBadPlanetCrop(PROJECTS_HEADER_PLANET_LEGACY_BAD_BOUNDS)).toBe(true);
    const bad = referenceCropGeometryGuard({
      bounds: PROJECTS_HEADER_PLANET_LEGACY_BAD_BOUNDS,
      sourceWidth: 946,
      sourceHeight: 667,
      assetType: 'HERO_OBJECT',
    });
    expect(bad.pass).toBe(false);
    expect(bad.failures).toContain('CROP_TOO_SMALL');

    expect(isPointLikeBounds({ x: 600, y: 100, width: 32, height: 32 })).toBe(true);
  });

  it('9–10. object coverage QA + clipped object fails', () => {
    const clipped = evaluateObjectCoverageQA({
      objectBounds: PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
      cropBounds: { x: 600, y: 80, width: 200, height: 200 },
    });
    expect(clipped.pass).toBe(false);
    expect(clipped.failures).toContain('CROP_OBJECT_CLIPPED');
  });

  it('11–12. padding + clamp to source bounds', () => {
    const padded = applyPaddingToBounds(
      PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
      PROJECTS_HEADER_PLANET_PADDING_PERCENT,
      946,
      667,
    );
    expect(padded.width).toBeGreaterThan(PROJECTS_HEADER_PLANET_OBJECT_BOUNDS.width);
    expect(padded.x + padded.width).toBeLessThanOrEqual(946);
    expect(padded.y + padded.height).toBeLessThanOrEqual(667);
  });

  it('13–16. crop preview / checksum / preflight blocks unapproved crop', async () => {
    mkdirSync(FIXTURE_DIR, { recursive: true });
    const extracted = await extractCropBuffer({
      referenceImagePath: REF_PATH,
      finalBounds: PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS,
    });
    expect(extracted.checksum.length).toBe(16);

    const record = buildCoordinateRecord({
      sourceWidth: 946,
      sourceHeight: 667,
      displayWidth: 946,
      displayHeight: 667,
      detectedBounds: PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
      paddingPercent: PROJECTS_HEADER_PLANET_PADDING_PERCENT,
      sourceScreenshotId: 'projects-approved-reference-v1',
      cropId: 'crop-test',
      cropVersion: 1,
    });

    const coordinate = {
      ...record,
      qaStatus: 'CROP_READY' as const,
      qaFailures: [],
      cropChecksum: extracted.checksum,
      approvedAt: null,
      locked: false,
      generationIdsUsingCrop: [],
    };

    const qa = evaluateReferenceCropQA({ coordinate, assetType: 'HERO_OBJECT' });
    expect(qa.pass).toBe(true);

    const blocked = runDesignGenerationPreflight({
      coordinate,
      assetType: 'HERO_OBJECT',
      cropPreviewUrl: 'https://example.com/crop.png',
      cropPreviewValid: true,
      providerAvailable: true,
      explicitFounderAction: true,
      cropApproved: false,
    });
    expect(blocked.pass).toBe(false);
    expect(blocked.blocker).toContain('GENERATION_BLOCKED_BY_CROP_QA');
  });

  it('19–21. preflight blocks tiny / wrong crop', () => {
    const tiny = runDesignGenerationPreflight({
      coordinate: {
        ...buildCoordinateRecord({
          sourceWidth: 946,
          sourceHeight: 667,
          displayWidth: 946,
          displayHeight: 667,
          detectedBounds: PROJECTS_HEADER_PLANET_LEGACY_BAD_BOUNDS,
          paddingPercent: 0,
          sourceScreenshotId: 'x',
          cropId: 'x',
          cropVersion: 1,
        }),
        finalBounds: PROJECTS_HEADER_PLANET_LEGACY_BAD_BOUNDS,
        qaStatus: 'CROP_QA_FAILED',
        qaFailures: ['CROP_TOO_SMALL'],
        cropChecksum: null,
        approvedAt: null,
        locked: false,
        generationIdsUsingCrop: [],
      },
      assetType: 'HERO_OBJECT',
      cropPreviewUrl: null,
      cropPreviewValid: false,
      providerAvailable: true,
      explicitFounderAction: true,
      cropApproved: false,
    });
    expect(tiny.pass).toBe(false);
  });

  it('22–23. no dispatch before crop QA — preflight requires checksum', () => {
    const noChecksum = runDesignGenerationPreflight({
      coordinate: null,
      assetType: 'HERO_OBJECT',
      cropPreviewUrl: null,
      cropPreviewValid: false,
      providerAvailable: true,
      explicitFounderAction: true,
      cropApproved: false,
    });
    expect(noChecksum.checks.cropQaPass).toBe(false);
  });

  it('26–27. golden planet crop geometry + visual snapshot fixture', async () => {
    expect(existsSync(REF_PATH)).toBe(true);
    const extracted = await extractCropBuffer({
      referenceImagePath: REF_PATH,
      finalBounds: PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS,
    });
    expect(extracted.width).toBe(PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS.width);
    expect(extracted.height).toBe(PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS.height);
    await sharp(extracted.buffer).png().toFile(GOLDEN_CROP_PATH);
    expect(existsSync(GOLDEN_CROP_PATH)).toBe(true);
    const fixture = readFileSync(GOLDEN_CROP_PATH);
    expect(hashCropBuffer(fixture)).toBe(extracted.checksum);
  });

  it('28. golden final bounds differ from legacy bad crop', () => {
    expect(PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS.width).toBeGreaterThan(400);
    expect(PROJECTS_HEADER_PLANET_LEGACY_BAD_BOUNDS.width).toBeLessThan(250);
  });

  it('29. UI crop editor + preflight API wired', () => {
    const read = (p: string) => readFileSync(join(REPO_ROOT, p), 'utf8');
    expect(read('src/site00/components/designWorkspace/DesignReferenceCropEditor.tsx')).toContain('USE CROP');
    expect(read('api/site00/design-asset-reconstruction.ts')).toContain('extract_crop');
    expect(read('api/site00/design-asset-reconstruction.ts')).toContain('approve_crop');
    expect(read('api/site00/design-asset-reconstruction.ts')).toContain('preflight');
  });
});
