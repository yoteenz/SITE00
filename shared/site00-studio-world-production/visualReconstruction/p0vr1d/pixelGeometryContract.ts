/**
 * PixelGeometryContract — measurable region geometry with tolerances.
 */

import { randomUUID } from 'node:crypto';
import { DEFAULT_GEOMETRY_TOLERANCES } from './constants.js';
import type { PageVisualDecomposition, PixelGeometryContract, ViewportClass } from './types.js';

export function buildPixelGeometryContract(input: {
  decomposition: PageVisualDecomposition;
  viewportClass: ViewportClass;
  tolerances?: Partial<typeof DEFAULT_GEOMETRY_TOLERANCES>;
}): PixelGeometryContract {
  const t = { ...DEFAULT_GEOMETRY_TOLERANCES, ...input.tolerances };
  return {
    contractId: randomUUID(),
    referenceAssetId: input.decomposition.referenceAssetId,
    viewportClass: input.viewportClass,
    entries: input.decomposition.layoutRegions.map((layout) => ({
      regionId: layout.regionId,
      referenceX: layout.x,
      referenceY: layout.y,
      referenceWidth: layout.width,
      referenceHeight: layout.height,
      referenceAspectRatio: layout.width / Math.max(layout.height, 1),
      positionTolerancePx: t.positionTolerancePx,
      sizeTolerancePx: t.sizeTolerancePx,
      rotationToleranceDeg: t.rotationToleranceDeg,
    })),
  };
}

export function geometryWithinTolerance(
  contract: PixelGeometryContract,
  regionId: string,
  measured: { x: number; y: number; width: number; height: number },
): boolean {
  const entry = contract.entries.find((e) => e.regionId === regionId);
  if (!entry) return false;
  return (
    Math.abs(measured.x - entry.referenceX) <= entry.positionTolerancePx &&
    Math.abs(measured.y - entry.referenceY) <= entry.positionTolerancePx &&
    Math.abs(measured.width - entry.referenceWidth) <= entry.sizeTolerancePx &&
    Math.abs(measured.height - entry.referenceHeight) <= entry.sizeTolerancePx
  );
}
