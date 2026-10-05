/**
 * P0.VR.DIAG.1R5B — Explain measurements that exist without child anchors.
 */

import type { RegionDimensionEvidence } from '../p0vrDiag1/types.js';

export type MeasurementOriginType =
  | 'CHILD_ANCHOR'
  | 'CONTAINER_DOM_RECT'
  | 'LEGACY_REGION_MEASUREMENT'
  | 'IMAGE_ESTIMATE'
  | 'COMPUTED_STYLE';

export type MeasurementOriginTrace = {
  measurementId: string;
  originType: MeasurementOriginType;
  anchorIds: string[];
  legacySource?: string;
  containerOnly: boolean;
  confidence: string;
};

export function buildMeasurementOriginTraces(
  dimensions: RegionDimensionEvidence[],
  resolvedAnchorIds: string[],
): MeasurementOriginTrace[] {
  return dimensions.map((d) => {
    const src = d.currentSource ?? d.source ?? 'UNKNOWN';
    let originType: MeasurementOriginType = 'LEGACY_REGION_MEASUREMENT';
    let containerOnly = false;
    if (src === 'CHILD_ANCHOR') originType = 'CHILD_ANCHOR';
    else if (src === 'DOM_RECT') {
      originType = 'CONTAINER_DOM_RECT';
      containerOnly = resolvedAnchorIds.length === 0;
    } else if (src === 'COMPUTED_STYLE') originType = 'COMPUTED_STYLE';
    else if (src === 'AUTHORITY_IMAGE_ESTIMATE') originType = 'IMAGE_ESTIMATE';

    return {
      measurementId: d.evidenceId ?? d.dimension,
      originType,
      anchorIds: resolvedAnchorIds,
      legacySource: src,
      containerOnly,
      confidence: d.confidence,
    };
  });
}
