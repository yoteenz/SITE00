import type { LiteralRegionSpec } from '../p0vrReplication3b/types.js';
import { generateLiteralRegionSource, type GeneratedLiteralSource } from '../p0vrReplication3b/literalRegionSourceGenerator.js';
import type { LiteralLayoutInstruction, ReplicationAssetSlot } from './types.js';
import { assertSourceStructureNotCollapsed } from './sourceStructureGuard.js';

export type ExecutedLiteralSource = GeneratedLiteralSource & {
  sourceElementCount: number;
  layoutInstructionCount: number;
  structureCollapse: boolean;
};

export function executeLiteralRegionSource(input: {
  spec: LiteralRegionSpec;
  layoutInstructions: LiteralLayoutInstruction[];
  assetSlots: ReplicationAssetSlot[];
}): ExecutedLiteralSource {
  const base = generateLiteralRegionSource(input.spec);
  const assetElements = input.assetSlots.map(
    (s) => `<div data-asset-slot="${s.slotId}" data-strategy="${s.selectedStrategy}" />`,
  );
  const layoutElements = input.layoutInstructions.map((i) => `<${i.type} id="${i.elementId}" />`);
  const domOutline = [...base.domOutline, ...layoutElements, ...assetElements];
  const sourceElementCount = domOutline.length;
  const executed: ExecutedLiteralSource = {
    ...base,
    domOutline,
    sourceElementCount,
    layoutInstructionCount: input.layoutInstructions.length,
    assetSlotCount: input.assetSlots.length,
    structureCollapse: false,
  };
  const guard = assertSourceStructureNotCollapsed({
    spec: input.spec,
    assetSlots: input.assetSlots,
    source: executed,
  });
  executed.structureCollapse = !guard.ok;
  executed.collapsed = executed.collapsed || !guard.ok;
  return executed;
}
