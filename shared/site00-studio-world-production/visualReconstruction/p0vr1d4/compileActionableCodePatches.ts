/**
 * P0.VR.1D.4 — Actionable code patches via component registry + canonical region IDs.
 */

import type { ScreenImplementationSpec } from '../p0vr1d1/types.js';
import { compileCodePatchInstructions } from '../p0vr1d1/codePatchInstruction.js';
import type { ActionableCodePatch, MappedDomDeltaEntry, MappedReferenceDomDelta } from './types.js';
import { registryEntryForCanonicalRegion } from './visualReconstructionComponentRegistry.js';

export function compileActionableCodePatches(input: {
  mappedDelta: MappedReferenceDomDelta;
  implementationSpec: ScreenImplementationSpec;
  lockedRegionIds?: string[];
}): ActionableCodePatch[] {
  const locked = new Set(input.lockedRegionIds ?? []);
  const baseDomDelta = {
    deltaId: input.mappedDelta.deltaId,
    screenId: input.mappedDelta.screenId,
    entries: (input.mappedDelta.entries as MappedDomDeltaEntry[]).map((e) => ({
      regionId: e.canonicalRegionId,
      property: e.property,
      referenceValue: e.referenceValue,
      renderedValue: e.renderedValue,
      delta: e.delta,
      driftKind: e.driftKind,
    })),
  };

  const baseInstructions = compileCodePatchInstructions({
    domDelta: baseDomDelta,
    implementationSpec: input.implementationSpec,
    lockedRegionIds: [...locked],
  });

  return baseInstructions.map((instruction) => {
    const registry = registryEntryForCanonicalRegion(instruction.regionId);
    return {
      ...instruction,
      canonicalRegionId: instruction.regionId,
      componentId: registry?.componentId ?? instruction.target,
      filePath: registry?.filePath ?? null,
      styleSource: registry?.styleSource ?? null,
      target: registry?.componentId ?? instruction.target,
    };
  });
}

export function actionablePatchCountWhenDriftExists(
  mappedDelta: MappedReferenceDomDelta,
  patches: ActionableCodePatch[],
): boolean {
  if (mappedDelta.entries.length === 0) return true;
  return patches.length > 0;
}

export function patchesResolveToComponentOrStyleTarget(patches: ActionableCodePatch[]): boolean {
  return patches.every(
    (p) => p.target.length > 0 && p.property.length > 0 && (p.filePath !== null || p.styleSource !== null),
  );
}
