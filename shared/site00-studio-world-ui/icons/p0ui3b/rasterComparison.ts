import type { PixelTracedIconSpec } from './types.js';
import { rasterizeSpecToMask } from './pipeline.js';
import type { IconPixelMask } from './types.js';

export function rasterizeSvgSpec(spec: PixelTracedIconSpec, width: number, height: number): IconPixelMask {
  return rasterizeSpecToMask(spec, width, height);
}

export function compareReferenceToRasterizedSvg(
  referenceMask: IconPixelMask,
  spec: PixelTracedIconSpec,
): { referenceMask: IconPixelMask; rasterizedMask: IconPixelMask; dimensionsMatch: boolean } {
  const rasterizedMask = rasterizeSvgSpec(spec, referenceMask.width, referenceMask.height);
  return {
    referenceMask,
    rasterizedMask,
    dimensionsMatch: referenceMask.width === rasterizedMask.width && referenceMask.height === rasterizedMask.height,
  };
}
