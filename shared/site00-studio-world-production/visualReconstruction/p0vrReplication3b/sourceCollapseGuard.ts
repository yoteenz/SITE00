import type { LiteralRegionSpec } from './types.js';

export function assertLiteralSourceNotCollapsed(input: {
  spec: LiteralRegionSpec;
  generatedSubregionCount: number;
}): { ok: boolean; code: 'SOURCE_COLLAPSED_LITERAL_STRUCTURE' | null } {
  if (input.spec.subregions.length >= 2 && input.generatedSubregionCount < Math.max(2, input.spec.subregions.length - 1)) {
    return { ok: false, code: 'SOURCE_COLLAPSED_LITERAL_STRUCTURE' };
  }
  return { ok: true, code: null };
}
