/**
 * P0.VR.DIAG.1R4 — Targeted authority-side remeasure for one region.
 */

import { extractAuthorityImageMeasurements } from '../p0vrDiag1/authorityImageMeasurementExtractor.js';
import type { PageRegionLayoutDefinition } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import { geometryMetrics } from '../p0vrDiag1/stackLayout.js';
import type { VisualRegionBounds } from '../p0vrDiag1/types.js';
import { extractRegionChildAnchors } from './regionChildAnchorExtractor.js';
import type { AuthorityRegionMeasurementPass } from './types.js';

export function runAuthorityRegionMeasurementPass(input: {
  def: PageRegionLayoutDefinition;
  authority: VisualRegionBounds;
  shell?: { headerPaddingX: number; contentPaddingX: number; sectionGap?: number } | null;
  viewportWidth: number;
  dom?: import('../p0vrDiag1/types.js').DomRegionMeasurement | null;
}): AuthorityRegionMeasurementPass {
  const auth = geometryMetrics(input.authority.geometry);
  const extraction = extractAuthorityImageMeasurements({
    def: input.def,
    authority: input.authority,
    shell: input.shell,
    viewportWidth: input.viewportWidth,
  });

  const childAnchors = extractRegionChildAnchors({ def: input.def, dom: input.dom ?? null });
  const dimensions = [...extraction.scalars.keys()];

  const status =
    dimensions.length >= 4 ? 'COMPLETE' : dimensions.length >= 2 ? 'PARTIAL' : extraction.scalars.size ? 'PARTIAL' : 'SKIPPED';

  return {
    regionId: input.def.regionId,
    authorityBounds: { x: auth.x, y: auth.y, width: auth.width, height: auth.height },
    childAnchors,
    dimensions,
    confidence: status === 'COMPLETE' ? 'HIGH' : 'MEDIUM',
    status,
  };
}
