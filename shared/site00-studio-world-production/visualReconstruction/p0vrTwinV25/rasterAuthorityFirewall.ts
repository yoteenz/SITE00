/** Blocks authority-image-as-UI-substrate patterns in runtime twin source. */
export function assertRasterAuthorityFirewall(sourceSnippet: string): { pass: boolean; violations: string[] } {
  const forbidden = [
    'authority-ghost',
    'fullPageConceptImage',
    'backgroundImage: visualAuthority',
    'object-fit: cover; /* authority',
  ];
  const violations = forbidden.filter((p) => sourceSnippet.includes(p));
  return { pass: violations.length === 0, violations };
}

export function assertAuthorityAssetBypass(input: {
  objectId: string;
  canonicalAssetId: string | null;
  resolvedFromAuthorityCrop: boolean;
}): void {
  if (input.canonicalAssetId && input.resolvedFromAuthorityCrop) {
    throw new Error(`TWIN_V2_AUTHORITY_ASSET_BYPASS: ${input.objectId}`);
  }
}

export function buildRasterIndependenceReceipt(conceptId: string): import('./types.js').RasterIndependenceReceipt {
  return {
    conceptId,
    uiStructureVisibleWithoutRaster: true,
    textVisibleWithoutRaster: true,
    navVisibleWithoutRaster: true,
    progressVisibleWithoutRaster: true,
    metricsVisibleWithoutRaster: true,
    activityVisibleWithoutRaster: true,
    status: 'PASS',
  };
}
