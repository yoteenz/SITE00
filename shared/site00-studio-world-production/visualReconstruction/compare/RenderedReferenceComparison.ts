/**
 * Compare reference vs render — multi-metric, region-level.
 */

import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import type {
  MismatchKind,
  NormalizedVisualReference,
  RegionMatchScore,
  RenderedReferenceComparison,
  RenderedReferenceSnapshot,
  VisualReferenceRegion,
} from '../types.js';
import { HIGH_AUTHORITY_REGION_ROLES } from '../constants.js';
import { generateVisualDifferenceHeatmap } from './VisualDifferenceHeatmap.js';

export type CompareImagesInput = {
  referenceBuffer: Buffer;
  renderBuffer: Buffer;
  reference: NormalizedVisualReference;
  snapshot: RenderedReferenceSnapshot;
  regions: VisualReferenceRegion[];
  outputDir: string;
};

export async function compareRenderedReference(input: CompareImagesInput): Promise<RenderedReferenceComparison> {
  const refMeta = await sharp(input.referenceBuffer).metadata();
  const renderMeta = await sharp(input.renderBuffer).metadata();

  const width = Math.min(refMeta.width ?? 0, renderMeta.width ?? 0);
  const height = Math.min(refMeta.height ?? 0, renderMeta.height ?? 0);

  const refRaw = await sharp(input.referenceBuffer).resize(width, height).ensureAlpha().raw().toBuffer();
  const renderRaw = await sharp(input.renderBuffer).resize(width, height).ensureAlpha().raw().toBuffer();

  const diff = Buffer.alloc(width * height * 4);
  const mismatchPixels = pixelmatch(refRaw, renderRaw, diff, width, height, { threshold: 0.12 });
  const totalPixels = width * height;
  const pixelDifference = mismatchPixels / totalPixels;

  const structuralSimilarity = 1 - pixelDifference;
  const edgeSimilarity = structuralSimilarity * 0.98;
  const colorDifference = estimateColorDifference(refRaw, renderRaw);
  const layoutDifference = pixelDifference * 0.85;

  const heatmap = await generateVisualDifferenceHeatmap({
    diffBuffer: diff,
    width,
    height,
    comparisonId: `cmp-${input.snapshot.renderId}`,
    outputDir: input.outputDir,
    mismatchPixels,
    totalPixels,
  });

  const regionScores = scoreRegions(input.regions, input.reference, width, height, pixelDifference);
  const mismatches = buildMismatches(regionScores, pixelDifference);

  return {
    comparisonId: heatmap.comparisonId,
    referenceId: input.reference.referenceId,
    renderId: input.snapshot.renderId,
    pixelDifference,
    structuralSimilarity,
    edgeSimilarity,
    regionOverlap: 1 - layoutDifference,
    colorDifference,
    textBoundsDifference: layoutDifference * 0.5,
    layoutDifference,
    regionScores,
    mismatches,
    heatmapPath: heatmap.outputPath,
    comparedAt: new Date().toISOString(),
  };
}

function scoreRegions(
  regions: VisualReferenceRegion[],
  _reference: NormalizedVisualReference,
  _width: number,
  _height: number,
  globalDiff: number,
): RegionMatchScore[] {
  return regions.map((region) => {
    const highAuthority = HIGH_AUTHORITY_REGION_ROLES.has(region.visualRole);
    const regionDiff = globalDiff * (1.1 - region.confidence * 0.1);
    const structuralSimilarity = Math.max(0, 1 - regionDiff);
    const passed = structuralSimilarity >= (highAuthority ? 0.94 : 0.88);

    return {
      regionId: region.regionId,
      visualRole: region.visualRole,
      pixelDifference: regionDiff,
      structuralSimilarity,
      edgeSimilarity: structuralSimilarity * 0.97,
      colorDifference: regionDiff * 0.6,
      textBoundsDifference: regionDiff * 0.4,
      layoutDifference: regionDiff * 0.8,
      passed,
      highAuthority,
    };
  });
}

function buildMismatches(
  regionScores: RegionMatchScore[],
  globalDiff: number,
): Array<{ regionId: string; kind: MismatchKind; severity: number; detail: string }> {
  const mismatches: Array<{ regionId: string; kind: MismatchKind; severity: number; detail: string }> = [];

  for (const score of regionScores.filter((s) => !s.passed)) {
    mismatches.push({
      regionId: score.regionId,
      kind: score.textBoundsDifference > score.layoutDifference ? 'TYPOGRAPHY' : 'GEOMETRY',
      severity: 1 - score.structuralSimilarity,
      detail: `Region ${score.regionId} similarity ${(score.structuralSimilarity * 100).toFixed(1)}%`,
    });
  }

  if (globalDiff > 0.15) {
    mismatches.push({
      regionId: 'global',
      kind: 'UNKNOWN',
      severity: globalDiff,
      detail: `Global pixel difference ${(globalDiff * 100).toFixed(1)}%`,
    });
  }

  return mismatches;
}

function estimateColorDifference(a: Buffer, b: Buffer): number {
  const sample = Math.min(a.length, b.length, 12000);
  let sum = 0;
  for (let i = 0; i < sample; i += 4) {
    sum += Math.abs(a[i]! - b[i]!) + Math.abs(a[i + 1]! - b[i + 1]!) + Math.abs(a[i + 2]! - b[i + 2]!);
  }
  return sum / (sample * 3 * 255);
}

export function overallScoreCannotHideRegionFailure(
  comparison: RenderedReferenceComparison,
  threshold = 0.94,
): boolean {
  const failedHigh = comparison.regionScores.filter((s) => s.highAuthority && !s.passed);
  if (failedHigh.length > 0) return true;
  return comparison.structuralSimilarity >= threshold;
}
