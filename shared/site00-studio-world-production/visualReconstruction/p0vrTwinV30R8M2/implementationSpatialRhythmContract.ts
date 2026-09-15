export type SpatialRhythmScale = {
  sectionGapPx: number;
  innerPaddingPx: number;
  cardGapPx: number;
  controlGapPx: number;
  denseRegionPaddingPx: number;
};

/** NDXBOOK design workspace — editorial dense rhythm (not generic SaaS spacing). */
export const NDXBOOK_IMPLEMENTATION_SPATIAL_RHYTHM: SpatialRhythmScale = {
  sectionGapPx: 6,
  innerPaddingPx: 10,
  cardGapPx: 6,
  controlGapPx: 4,
  denseRegionPaddingPx: 8,
};

export function spatialStylesForSection(sectionId: string): Record<string, string> {
  const r = NDXBOOK_IMPLEMENTATION_SPATIAL_RHYTHM;
  return {
    gap: `${sectionId === 'hero' ? r.controlGapPx + 2 : r.cardGapPx}px`,
    padding: `${r.innerPaddingPx}px ${r.innerPaddingPx + 2}px`,
    marginBottom: `${r.sectionGapPx}px`,
  };
}
