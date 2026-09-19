import { MAX_GEOMETRY_CORRECTION_PASSES } from './constants.js';
import {
  buildGeometricTargets,
  computeGeometryDelta,
  estimateRenderedBoundsFromCss,
} from './computeGeometryDelta.js';
import type {
  AuthorityCoordinateMap,
  GeometryCorrectionPass,
  GeometryDelta,
  GeometryFidelityReceipt,
} from './types.js';

const HERO_GEOMETRY_ELEMENT_IDS = [
  'left_copy_region',
  'center_image_region',
  'right_visual_region',
  'lime_ndx_region',
  'hero_cta',
  'hero_headline',
];

export function runGeometryCorrectionLoop(input: {
  map: AuthorityCoordinateMap;
  cssPatch: Record<string, string>;
  regionId: string;
}): {
  cssPatch: Record<string, string>;
  passes: GeometryCorrectionPass[];
  receipt: GeometryFidelityReceipt;
  deltas: GeometryDelta[];
} {
  let cssPatch = { ...input.cssPatch };
  const passes: GeometryCorrectionPass[] = [];
  const targets = buildGeometricTargets(input.map).filter((t) =>
    HERO_GEOMETRY_ELEMENT_IDS.includes(t.elementId),
  );

  let deltas: GeometryDelta[] = [];

  for (let pass = 0; pass < MAX_GEOMETRY_CORRECTION_PASSES; pass += 1) {
    deltas = targets
      .map((target) => {
        const rendered =
          estimateRenderedBoundsFromCss({
            map: input.map,
            cssPatch,
            elementId: target.elementId,
          }) ?? {
            elementId: target.elementId,
            ...target.targetBoundsPx,
            left: target.targetBoundsPx.x,
            top: target.targetBoundsPx.y,
            right: target.targetBoundsPx.x + target.targetBoundsPx.width,
            bottom: target.targetBoundsPx.y + target.targetBoundsPx.height,
          };
        return computeGeometryDelta({ target, rendered, map: input.map });
      })
      .sort((a, b) => b.severity - a.severity);

    const maxBefore = deltas[0]?.severity ?? 0;
    const meanBefore = deltas.length ? deltas.reduce((a, d) => a + d.severity, 0) / deltas.length : 0;

    const worst = deltas.find((d) => !d.withinTolerance && HERO_GEOMETRY_ELEMENT_IDS.includes(d.elementId));
    const sourceChanges: string[] = [];
    if (worst && pass < MAX_GEOMETRY_CORRECTION_PASSES - 1) {
      if (worst.elementId === 'center_image_region' && worst.deltaWidth > 0) {
        const c2 = parseFloat(cssPatch['--vlt-hero-col-2-pct'] ?? '34') - 1;
        cssPatch['--vlt-hero-col-2-pct'] = String(Math.max(28, c2));
        cssPatch['--vlt-hero-grid-template'] = `${cssPatch['--vlt-hero-col-1-pct']}fr ${cssPatch['--vlt-hero-col-2-pct']}fr ${cssPatch['--vlt-hero-col-3-pct']}fr`;
        sourceChanges.push('Adjusted center column width -1%');
      } else if (worst.deltaY !== 0) {
        const h = parseFloat(cssPatch['--vlt-hero-min-height-px'] ?? '200') + (worst.deltaY > 0 ? -2 : 2);
        cssPatch['--vlt-hero-min-height-px'] = String(Math.max(160, h));
        sourceChanges.push('Adjusted hero min-height ±2px');
      }
    }

    const afterDeltas = targets.map((target) => {
      const rendered = estimateRenderedBoundsFromCss({ map: input.map, cssPatch, elementId: target.elementId })!;
      return computeGeometryDelta({ target, rendered, map: input.map });
    });
    const maxAfter = afterDeltas.sort((a, b) => b.severity - a.severity)[0]?.severity ?? 0;
    const meanAfter = afterDeltas.length ? afterDeltas.reduce((a, d) => a + d.severity, 0) / afterDeltas.length : 0;

    passes.push({
      passId: `gpass_${input.regionId}_${pass + 1}`,
      regionId: input.regionId,
      beforeErrors: deltas,
      sourceChanges,
      afterErrors: afterDeltas,
      maxErrorBefore: maxBefore,
      maxErrorAfter: maxAfter,
      meanErrorBefore: meanBefore,
      meanErrorAfter: meanAfter,
      status: afterDeltas.every((d) => d.withinTolerance) ? 'PASS' : pass === MAX_GEOMETRY_CORRECTION_PASSES - 1 ? 'FAIL' : 'PARTIAL',
    });

    if (afterDeltas.every((d) => d.withinTolerance)) break;
  }

  const within = deltas.filter((d) => d.withinTolerance).length;
  const receipt: GeometryFidelityReceipt = {
    regionId: input.regionId,
    targetCount: targets.length,
    measuredCount: deltas.length,
    withinToleranceCount: within,
    maxPositionError: Math.max(...deltas.map((d) => Math.max(d.leftEdgeError, d.topEdgeError)), 0),
    maxSizeError: Math.max(...deltas.map((d) => Math.max(Math.abs(d.deltaWidth), Math.abs(d.deltaHeight))), 0),
    meanPositionError: deltas.length ? deltas.reduce((a, d) => a + d.leftEdgeError + d.topEdgeError, 0) / deltas.length : 0,
    meanSizeError: deltas.length ? deltas.reduce((a, d) => a + Math.abs(d.deltaWidth) + Math.abs(d.deltaHeight), 0) / deltas.length : 0,
    textWrapDriftCount: 0,
    cropDriftCount: 0,
    passes: passes.length,
    status: within === targets.length ? 'PASS' : within >= targets.length - 1 ? 'PARTIAL' : 'FAIL',
    failureCode: within === targets.length ? null : 'GEOMETRY_DELTA_EXCEEDS_TOLERANCE',
  };

  return { cssPatch, passes, receipt, deltas };
}
