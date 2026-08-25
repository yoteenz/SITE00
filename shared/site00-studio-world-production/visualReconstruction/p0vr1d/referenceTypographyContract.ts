/**
 * ReferenceTypographyContract — preserve line breaks from reference.
 */

import { randomUUID } from 'node:crypto';
import type { PageVisualDecomposition, ReferenceTypographyContract } from './types.js';

export function buildReferenceTypographyContract(
  decomposition: PageVisualDecomposition,
): ReferenceTypographyContract {
  return {
    contractId: randomUUID(),
    referenceAssetId: decomposition.referenceAssetId,
    entries: decomposition.regions
      .filter((r) => r.typographyEstimate)
      .map((region) => {
        const layout = decomposition.layoutRegions.find((l) => l.regionId === region.regionId);
        const lines = region.contentRole.includes('title')
          ? [region.contentRole.toUpperCase().replace(/-/g, ' ')]
          : [region.contentRole.replace(/-/g, ' ')];
        return {
          regionId: region.regionId,
          fontFamily: null,
          fallbackClass: region.typographyEstimate ?? 'system-ui',
          weight: region.contentRole.includes('title') ? 600 : 400,
          sizePx: region.contentRole.includes('title') ? 14 : 11,
          lineHeight: 1.35,
          tracking: 0.04,
          textCase: 'upper' as const,
          alignment: 'left',
          maxWidth: layout?.width ?? null,
          lineBreaks: lines,
          position: region.bounds,
          preserveLineBreaks: true as const,
        };
      }),
  };
}

export function typographyLineBreaksPreserved(
  contract: ReferenceTypographyContract,
  regionId: string,
  renderedLines: string[],
): boolean {
  const entry = contract.entries.find((e) => e.regionId === regionId);
  if (!entry) return true;
  if (entry.lineBreaks.length !== renderedLines.length) return false;
  return entry.lineBreaks.every((line, i) => line === renderedLines[i]);
}
