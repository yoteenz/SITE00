import type { LiteralRegionSpec, RegionLiteralityScore, VisionReplicationObservation } from './types.js';

export function scoreRegionLiterality(input: {
  spec: LiteralRegionSpec;
  observation: VisionReplicationObservation;
  afterPass: boolean;
}): RegionLiteralityScore {
  const base = input.afterPass ? 72 : 48;
  const structure = Math.min(100, base + input.spec.subregions.length * 6);
  const geometry = input.spec.relationships.length >= 2 ? Math.min(100, base + 12) : base;
  const assetPlacement =
    input.spec.imageSlots.every((s) => s.fallbackStatus === 'LITERAL_SLOT' || s.bindingStatus === 'BOUND')
      ? Math.min(100, base + 10)
      : base - 10;
  return {
    regionId: input.spec.regionId,
    structure,
    geometry,
    assetPlacement,
    surface: input.spec.dominantColors.length >= 2 ? base + 8 : base,
    typography: input.spec.textBlocks.length >= 2 ? base + 6 : base,
    controls: input.spec.controls.length > 0 ? base + 4 : base,
    overall: Math.round((structure + geometry + assetPlacement) / 3),
  };
}
