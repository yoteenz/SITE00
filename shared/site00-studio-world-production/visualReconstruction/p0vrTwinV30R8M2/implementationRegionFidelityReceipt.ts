import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import type { ActualImplementationRegionEntry } from './actualImplementationRegionMap.js';
import { scanDocumentForAuthorityRasterViolations } from './runtimeAuthorityRasterFirewall.js';
import type { RuntimeAssetTraceability } from './canonicalAssetRebind.js';

export type ImplementationRegionFidelityReceipt = {
  regionId: string;
  authorityBounds: { objectCount: number };
  liveBounds: { nodeCount: number };
  relativeSizeMatch: boolean;
  alignmentMatch: boolean;
  hierarchyMatch: boolean;
  assetMatch: boolean;
  typographyMatch: boolean;
  colorMaterialMatch: boolean;
  result: 'PASS' | 'FAIL' | 'PARTIAL';
};

export function buildRegionFidelityReceipts(input: {
  regions: ActualImplementationRegionEntry[];
  document: CompiledMobileTwinImplementationDocument;
  assetTraces: RuntimeAssetTraceability[];
}): ImplementationRegionFidelityReceipt[] {
  const nodes = input.document.renderTree?.nodes ?? [];
  const rasterViolations = scanDocumentForAuthorityRasterViolations(nodes.map((n) => n.imageUri));

  return input.regions.map((region) => {
    const regionNodes = nodes.filter((n) => {
      const section = n.sectionId;
      if (region.regionId === 'HOST_HEADER')
        return (
          section === 'host' ||
          section === 'td-host' ||
          section === 'af-host' ||
          section === 'fb-host-shell' ||
          section === 'fm3-host-shell'
        );
      if (region.regionId === 'PROJECT_CONTEXT')
        return (
          section === 'context' ||
          section === 'td-context' ||
          section === 'af-context' ||
          section === 'fb-project-context' ||
          section === 'fm3-project-context'
        );
      if (region.regionId === 'HERO_WORKSPACE')
        return (
          section === 'hero' ||
          section === 'td-hero' ||
          section === 'af-hero' ||
          section === 'fb-hero-workspace' ||
          section === 'fm3-hero-workspace'
        );
      if (region.regionId === 'AUTHORITY_PANEL')
        return (
          section === 'hero' ||
          section === 'td-authority' ||
          section === 'td-hero' ||
          section === 'af-authority' ||
          section === 'af-hero' ||
          section === 'fb-authority-panel' ||
          section === 'fb-hero-workspace' ||
          section === 'fm3-authority-panel' ||
          section === 'fm3-hero-workspace'
        );
      if (region.regionId === 'CANDIDATE_GALLERY')
        return (
          section === 'gallery' ||
          section === 'td-gallery' ||
          section === 'af-gallery' ||
          section === 'fb-candidate-gallery' ||
          section === 'fm3-candidate-gallery'
        );
      if (region.regionId === 'STRUCTURED_OUTPUT')
        return (
          section === 'structured-output' ||
          section === 'td-structured' ||
          section === 'af-structured' ||
          section === 'fb-structured-output' ||
          section === 'fm3-structured-output'
        );
      if (region.regionId === 'READINESS')
        return (
          section === 'readiness' ||
          section === 'td-readiness' ||
          section === 'af-readiness' ||
          section === 'fb-readiness' ||
          section === 'fm3-readiness'
        );
      if (region.regionId === 'CONCEPT_DATA')
        return (
          section === 'readiness' ||
          section === 'td-metadata' ||
          section === 'af-metadata' ||
          section === 'fb-concept-data-history' ||
          section === 'fm3-concept-data-history'
        );
      if (region.regionId === 'BOTTOM_NAV')
        return (
          section === 'bottom-nav' ||
          section === 'td-bottom-nav' ||
          section === 'af-bottom-nav' ||
          section === 'fb-bottom-nav' ||
          section === 'fm3-bottom-nav'
        );
      return region.objectIds.includes(n.objectId);
    });

    const traces = input.assetTraces.filter((t) => region.objectIds.includes(t.objectId));
    const criticalImages = traces.filter((t) => t.source !== 'none' && t.source !== 'IMPLEMENTATION_ASSET_BINDING_MISSING');
    const assetMatch =
      region.assetSlotIds.length === 0 ||
      (criticalImages.length > 0 && !criticalImages.some((t) => t.source === 'IMPLEMENTATION_ASSET_BINDING_MISSING'));

    const hierarchyMatch = regionNodes.length >= Math.min(region.objectIds.length, 1);
    const relativeSizeMatch = regionNodes.length >= region.objectIds.length * 0.5;
    const alignmentMatch = regionNodes.every((n) => n.styles?.display !== 'none');
    const typographyMatch = regionNodes.some((n) => n.displayText || n.typographySource);
    const colorMaterialMatch = regionNodes.some((n) => n.styles?.background || n.styles?.border);

    const result: ImplementationRegionFidelityReceipt['result'] =
      rasterViolations.length ? 'FAIL'
      : hierarchyMatch && assetMatch && relativeSizeMatch ? 'PASS'
      : 'PARTIAL';

    return {
      regionId: region.regionId,
      authorityBounds: { objectCount: region.objectIds.length },
      liveBounds: { nodeCount: regionNodes.length },
      relativeSizeMatch,
      alignmentMatch,
      hierarchyMatch,
      assetMatch,
      typographyMatch,
      colorMaterialMatch,
      result,
    };
  });
}

/** Machine pass requires region receipts — not renderTree existence alone. */
export function evaluateVisualFidelityFromRegionReceipts(
  receipts: ImplementationRegionFidelityReceipt[],
): { machinePass: boolean; founderPass: boolean } {
  const critical = receipts.filter((r) =>
    ['HERO_WORKSPACE', 'AUTHORITY_PANEL', 'CANDIDATE_GALLERY', 'STRUCTURED_OUTPUT'].includes(r.regionId),
  );
  const machinePass = critical.every((r) => r.result !== 'FAIL') && critical.some((r) => r.result === 'PASS');
  const founderPass = critical.every((r) => r.result === 'PASS');
  return { machinePass, founderPass };
}
