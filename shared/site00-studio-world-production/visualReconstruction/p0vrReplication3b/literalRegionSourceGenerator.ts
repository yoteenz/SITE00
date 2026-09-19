/**
 * P0.VR.REPLICATION.3B — Literal DOM/CSS structure from LiteralRegionSpec (no generic collapse).
 */

import type { LiteralRegionSpec } from './types.js';
import { assertLiteralSourceNotCollapsed } from './sourceCollapseGuard.js';

export type GeneratedLiteralSource = {
  regionId: string;
  component: 'VisionLiteralNdxOverviewTwin';
  rootClass: string;
  subregionCount: number;
  domOutline: string[];
  cssGridTemplate: string | null;
  assetSlotCount: number;
  collapsed: boolean;
};

export function generateLiteralRegionSource(spec: LiteralRegionSpec): GeneratedLiteralSource {
  const domOutline = spec.subregions.map(
    (s) => `<div data-literal-subregion="${s.id}" data-role="${s.role}" class="site00-vlt__${s.id.replace(/_/g, '-')}">`,
  );
  const cssGridTemplate =
    spec.regionId === 'hero-editorial'
      ? 'grid-template-columns: 38% 34% 28%; grid-template-rows: 1fr; background: #000'
      : spec.regionId === 'host-header'
        ? 'display: flex; justify-content: space-between; align-items: center'
        : null;

  const generated: GeneratedLiteralSource = {
    regionId: spec.regionId,
    component: 'VisionLiteralNdxOverviewTwin',
    rootClass: `site00-vlt__band site00-vlt__${spec.regionId.replace(/-/g, '--')}`,
    subregionCount: spec.subregions.length,
    domOutline,
    cssGridTemplate,
    assetSlotCount: spec.imageSlots.length + spec.graphicSlots.length,
    collapsed: false,
  };

  const guard = assertLiteralSourceNotCollapsed({ spec, generatedSubregionCount: generated.subregionCount });
  generated.collapsed = !guard.ok;
  return generated;
}
