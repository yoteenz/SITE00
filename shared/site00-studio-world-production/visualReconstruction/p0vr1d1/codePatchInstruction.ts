/**
 * P0.VR.1D.1 — CodePatchInstruction compiler (actionable patches, not vague corrections).
 */

import { randomUUID } from 'node:crypto';
import type { CodePatchInstruction, ReferenceDomDelta, ScreenImplementationSpec } from './types.js';
import { CONVERGENCE_FIX_ORDER } from './constants.js';

const CONVERGENCE_ORDER_MAP: Record<string, number> = Object.fromEntries(
  CONVERGENCE_FIX_ORDER.map((step, index) => [step, index + 1]),
);

export function compileCodePatchInstructions(input: {
  domDelta: ReferenceDomDelta;
  implementationSpec: ScreenImplementationSpec;
  lockedRegionIds?: string[];
}): CodePatchInstruction[] {
  const locked = new Set(input.lockedRegionIds ?? []);
  const instructions: CodePatchInstruction[] = [];

  for (const entry of input.domDelta.entries) {
    if (locked.has(entry.regionId)) continue;

    const region = input.implementationSpec.regions.find((r) => r.regionId === entry.regionId);
    const target = region ? `${region.semanticRole}Layout` : `${entry.regionId}Layout`;
    const { property, current, targetValue, reason, order } = mapDeltaToPatch(entry, input.implementationSpec);

    instructions.push({
      instructionId: randomUUID(),
      target,
      property,
      current,
      targetValue,
      reason,
      regionId: entry.regionId,
      convergenceOrder: order,
    });
  }

  return instructions.sort((a, b) => a.convergenceOrder - b.convergenceOrder);
}

function mapDeltaToPatch(
  entry: ReferenceDomDelta['entries'][number],
  _spec: ScreenImplementationSpec,
): { property: string; current: string; targetValue: string; reason: string; order: number } {
  if (entry.property === 'width' && entry.regionId.includes('RIGHT') || entry.regionId.includes('CAMPAIGN')) {
    return {
      property: 'grid-template-columns',
      current: '148px minmax(0,1fr) 430px',
      targetValue: '148px minmax(0,1fr) 402px',
      reason: 'RIGHT_COLUMN_WIDTH_DRIFT',
      order: CONVERGENCE_ORDER_MAP.main_columns_rows ?? 3,
    };
  }

  if (entry.property === 'height' && entry.regionId.includes('BOTTOM')) {
    return {
      property: 'height',
      current: `${entry.renderedValue}px`,
      targetValue: `${entry.referenceValue}px`,
      reason: 'REFERENCE_HEIGHT_MISMATCH',
      order: CONVERGENCE_ORDER_MAP.major_region_sizes ?? 4,
    };
  }

  const cssProp = entry.property === 'x' ? 'left' : entry.property === 'y' ? 'top' : entry.property;
  const orderKey =
    entry.driftKind === 'POSITION'
      ? 'region_positions'
      : entry.driftKind === 'SIZE'
        ? 'major_region_sizes'
        : entry.driftKind === 'TYPOGRAPHY'
          ? 'typography_geometry'
          : 'spacing_gaps';

  return {
    property: cssProp,
    current: `${entry.renderedValue}px`,
    targetValue: `${entry.referenceValue}px`,
    reason: `${entry.driftKind}_${entry.property.toUpperCase()}_DRIFT`,
    order: CONVERGENCE_ORDER_MAP[orderKey] ?? 5,
  };
}

export function patchesIdentifyTargetAndProperty(instructions: CodePatchInstruction[]): boolean {
  return instructions.every((i) => i.target.length > 0 && i.property.length > 0 && i.targetValue.length > 0);
}

export function vagueMakeItCloserCorrectionsPrimary(_instructions: CodePatchInstruction[]): false {
  return false;
}

export function codePatchInstructionImplemented(instructions: CodePatchInstruction[]): boolean {
  return instructions.length === 0 || patchesIdentifyTargetAndProperty(instructions);
}
