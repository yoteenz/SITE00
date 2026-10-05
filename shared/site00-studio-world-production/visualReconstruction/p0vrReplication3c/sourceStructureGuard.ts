import type { LiteralRegionSpec } from '../p0vrReplication3b/types.js';
import type { ReplicationAssetSlot } from './types.js';
import type { GeneratedLiteralSource } from '../p0vrReplication3b/literalRegionSourceGenerator.js';

export function assertSourceStructureNotCollapsed(input: {
  spec: LiteralRegionSpec;
  assetSlots: ReplicationAssetSlot[];
  source: GeneratedLiteralSource;
}): { ok: boolean; code: 'SOURCE_STRUCTURE_COLLAPSE' | null } {
  const expectedElements =
    input.spec.subregions.length + input.spec.textBlocks.length + input.spec.controls.length + input.assetSlots.length;
  const minElements = Math.max(input.spec.subregions.length, 3);
  if (input.source.subregionCount < minElements || input.source.domOutline.length < minElements) {
    return { ok: false, code: 'SOURCE_STRUCTURE_COLLAPSE' };
  }
  if (input.assetSlots.filter((s) => s.required).length >= 2 && input.source.assetSlotCount < 2) {
    return { ok: false, code: 'SOURCE_STRUCTURE_COLLAPSE' };
  }
  const elementCount = 'sourceElementCount' in input.source ? (input.source as { sourceElementCount: number }).sourceElementCount : input.source.domOutline.length;
  if (expectedElements >= 6 && elementCount < 4) {
    return { ok: false, code: 'SOURCE_STRUCTURE_COLLAPSE' };
  }
  return { ok: true, code: null };
}
