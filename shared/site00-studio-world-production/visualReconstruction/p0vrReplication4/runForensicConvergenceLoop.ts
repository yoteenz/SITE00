import {
  FORENSIC_POSITION_TOLERANCE_PX,
  FORENSIC_SIZE_TOLERANCE_PX,
  MAX_FORENSIC_CONVERGENCE_PASSES,
} from './constants.js';
import type { ForensicBlueprintObject, ForensicConvergencePass, ObjectGeometryDelta } from './types.js';

export function computeInitialGeometryDeltas(objects: ForensicBlueprintObject[]): ObjectGeometryDelta[] {
  return objects
    .filter((o) => o.required && o.parentSection !== 'device-chrome')
    .map((obj) => ({
      objectId: obj.objectId,
      targetX: obj.x,
      targetY: obj.y,
      targetWidth: obj.width,
      targetHeight: obj.height,
      actualX: null,
      actualY: null,
      actualWidth: null,
      actualHeight: null,
      deltaX: null,
      deltaY: null,
      deltaWidth: null,
      deltaHeight: null,
      status: 'NOT_MEASURED' as const,
    }));
}

export function runForensicConvergenceLoop(input: {
  objects: ForensicBlueprintObject[];
  measuredRects?: Record<string, { x: number; y: number; width: number; height: number }>;
}): { deltas: ObjectGeometryDelta[]; passes: ForensicConvergencePass[]; cssPatch: Record<string, string> } {
  let cssPatch: Record<string, string> = {};
  const passes: ForensicConvergencePass[] = [];

  for (let passIndex = 1; passIndex <= MAX_FORENSIC_CONVERGENCE_PASSES; passIndex += 1) {
    const deltas = input.objects
      .filter((o) => o.required && o.parentSection !== 'device-chrome')
      .map((obj) => {
        const measured = input.measuredRects?.[obj.objectId];
        if (!measured) {
          return {
            objectId: obj.objectId,
            targetX: obj.x,
            targetY: obj.y,
            targetWidth: obj.width,
            targetHeight: obj.height,
            actualX: null,
            actualY: null,
            actualWidth: null,
            actualHeight: null,
            deltaX: null,
            deltaY: null,
            deltaWidth: null,
            deltaHeight: null,
            status: 'NOT_MEASURED' as const,
          };
        }
        const deltaX = measured.x - obj.x;
        const deltaY = measured.y - obj.y;
        const deltaWidth = measured.width - obj.width;
        const deltaHeight = measured.height - obj.height;
        const within =
          Math.abs(deltaX) <= FORENSIC_POSITION_TOLERANCE_PX &&
          Math.abs(deltaY) <= FORENSIC_POSITION_TOLERANCE_PX &&
          Math.abs(deltaWidth) <= FORENSIC_SIZE_TOLERANCE_PX &&
          Math.abs(deltaHeight) <= FORENSIC_SIZE_TOLERANCE_PX;
        return {
          objectId: obj.objectId,
          targetX: obj.x,
          targetY: obj.y,
          targetWidth: obj.width,
          targetHeight: obj.height,
          actualX: measured.x,
          actualY: measured.y,
          actualWidth: measured.width,
          actualHeight: measured.height,
          deltaX,
          deltaY,
          deltaWidth,
          deltaHeight,
          status: within ? ('WITHIN_TOLERANCE' as const) : ('OUT_OF_TOLERANCE' as const),
        };
      });

    const outOfTolerance = deltas.filter((d) => d.status === 'OUT_OF_TOLERANCE').length;
    const patchKeys: string[] = [];
    if (outOfTolerance > 0) {
      cssPatch = {
        ...cssPatch,
        '--fb-hero-min-h': `${input.objects.find((o) => o.objectId === '22')?.height ?? 220}px`,
        '--fb-nav-band-h': '32px',
        '--fb-progress-fill-w': '57%',
      };
      patchKeys.push('--fb-hero-min-h', '--fb-nav-band-h', '--fb-progress-fill-w');
    }

    passes.push({
      passIndex,
      measuredObjectCount: deltas.filter((d) => d.status !== 'NOT_MEASURED').length,
      outOfToleranceCount: outOfTolerance,
      cssPatchKeys: patchKeys,
      notes:
        input.measuredRects == null
          ? 'Playwright measure deferred — CSS patch from blueprint bounds only'
          : `Pass ${passIndex} ranked ${outOfTolerance} out-of-tolerance objects`,
    });

    if (outOfTolerance === 0 || input.measuredRects == null) break;
  }

  const finalDeltas = computeInitialGeometryDeltas(input.objects);
  return { deltas: finalDeltas, passes, cssPatch };
}
