/**
 * VisualDifferenceMap — classify drift between reference and render.
 */

import { randomUUID } from 'node:crypto';
import { DIFFERENCE_KIND_TO_QA } from './constants.js';
import type { VisualDifferenceKind, VisualDifferenceMap, VisualDifferenceMapEntry } from './types.js';
import type { PixelMatchEvaluation } from './types.js';
import type { RegionMatchScore } from '../types.js';

type RegionScoreInput = RegionMatchScore | { regionId: string; score: number };

function regionSimilarity(region: RegionScoreInput): number {
  return 'structuralSimilarity' in region ? region.structuralSimilarity : region.score;
}

export function buildVisualDifferenceMap(input: {
  referenceAssetId: string;
  renderAssetId: string;
  pixelMatch: PixelMatchEvaluation;
  heatmapPath?: string | null;
  regionScores?: RegionScoreInput[];
}): VisualDifferenceMap {
  const entries: VisualDifferenceMapEntry[] = [];

  if (input.pixelMatch.globalAlignment < 0.85) {
    entries.push({
      regionId: 'global',
      kind: 'CAMERA_DRIFT',
      severity: 'high',
      deltaPx: null,
      note: 'Global alignment below threshold',
    });
  }
  if (input.pixelMatch.typographyPosition < 0.8) {
    entries.push({
      regionId: 'typography',
      kind: 'TYPOGRAPHY_DRIFT',
      severity: 'medium',
      deltaPx: null,
      note: 'Typography position mismatch',
    });
  }
  if (input.pixelMatch.artworkPlacement < 0.8) {
    entries.push({
      regionId: 'artwork',
      kind: 'ARTWORK_DRIFT',
      severity: 'medium',
      deltaPx: null,
      note: 'Artwork placement drift',
    });
  }

  for (const region of input.regionScores ?? []) {
    const score = regionSimilarity(region);
    if (score >= 0.9) continue;
    const kind: VisualDifferenceKind =
      'textBoundsDifference' in region &&
      'layoutDifference' in region &&
      region.textBoundsDifference > region.layoutDifference
        ? 'TYPOGRAPHY_DRIFT'
        : score < 0.5
          ? 'MISSING_ELEMENT'
          : 'POSITION_DRIFT';
    entries.push({
      regionId: region.regionId,
      kind,
      severity: score < 0.5 ? 'high' : 'medium',
      deltaPx: Math.round((1 - score) * 40),
      note: `Region similarity ${score.toFixed(2)}`,
    });
  }

  return {
    mapId: randomUUID(),
    referenceAssetId: input.referenceAssetId,
    renderAssetId: input.renderAssetId,
    heatmapPath: input.heatmapPath ?? null,
    entries,
  };
}

export function classifyDifferenceKind(
  kind: VisualDifferenceKind,
): string | undefined {
  return DIFFERENCE_KIND_TO_QA[kind];
}

export function largestDriftRegions(map: VisualDifferenceMap, limit = 3): VisualDifferenceMapEntry[] {
  return [...map.entries]
    .sort((a, b) => (b.deltaPx ?? 0) - (a.deltaPx ?? 0))
    .slice(0, limit);
}
