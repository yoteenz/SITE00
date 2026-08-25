#!/usr/bin/env npx tsx
/**
 * P0.UI.3B — run pixel-to-vector icon trace pipeline for all priority icons.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { NDX_ICON_PIXEL_REFERENCE_AUTHORITY } from '../../shared/site00-studio-world-ui/icons/p0ui3b/authority.js';
import { NDX_ICON_V2_PRIORITY } from '../../shared/site00-studio-world-ui/icons/p0ui3b/constants.js';
import { NDX_ICON_GEOMETRY_V2 } from '../../shared/site00-studio-world-ui/icons/p0ui3b/geometry/ndxIconGeometryV2PixelTraced.js';
import { runPixelTracePipeline } from '../../shared/site00-studio-world-ui/icons/p0ui3b/pipeline.js';
import { generateDifferenceMask } from '../../shared/site00-studio-world-ui/icons/p0ui3b/overlay.js';
import { rasterizeSpecToMask } from '../../shared/site00-studio-world-ui/icons/p0ui3b/pipeline.js';

const ROOT = join(import.meta.dirname, '../..');
const TRACE_DIR = join(ROOT, 'visual-references/founder/ndxbook/icon-traces');

async function main() {
  mkdirSync(TRACE_DIR, { recursive: true });
  mkdirSync(join(ROOT, 'public/visual-references/founder/ndxbook/icon-traces'), { recursive: true });

  const authority = NDX_ICON_PIXEL_REFERENCE_AUTHORITY;
  const sourcePath = join(ROOT, authority.sourceAssetPath);
  const results: Record<string, unknown> = {};

  for (const iconName of NDX_ICON_V2_PRIORITY) {
    const crop = authority.iconCrops[iconName];
    if (!crop) continue;

    const { data, info } = await sharp(sourcePath)
      .extract({ left: crop.cropX, top: crop.cropY, width: crop.cropWidth, height: crop.cropHeight })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const raw = NDX_ICON_GEOMETRY_V2[iconName];
    const result = runPixelTracePipeline({
      iconName,
      crop,
      rgba: data,
      width: info.width,
      height: info.height,
      channels: info.channels,
      referenceSampleId: `${authority.sourceReferenceId}:${iconName}`,
      refinedPaths: raw.paths,
      refinedCircles: raw.circles,
      strokeWidth: raw.strokeWidth,
      opticalScale: raw.opticalScale,
      notes: raw.notes,
    });

    const renderedMask = rasterizeSpecToMask(result.spec, info.width, info.height);
    const diff = generateDifferenceMask(result.mask, renderedMask);

    results[iconName] = {
      maskPixels: result.mask.foregroundPixelCount,
      contourCount: result.contour.outerContours.length,
      dotCount: result.contour.dots.length,
      drawMode: result.contour.drawMode,
      evaluation: result.evaluation,
      overlay: result.overlay,
    };

    console.log(
      iconName,
      'mask',
      result.mask.foregroundPixelCount,
      'IoU',
      result.evaluation.metrics.MASK_IOU.toFixed(3),
      result.evaluation.status,
    );
  }

  writeFileSync(join(TRACE_DIR, 'pipeline-results.json'), JSON.stringify(results, null, 2));
  console.log('wrote pipeline-results.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
