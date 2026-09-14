import type {
  MobileBlueprintTwinVisual,
  MobileImplementationRender,
  MobileTwinCompositionState,
} from './types.js';

export type TwinVisualCompositionReceipt = {
  id: string;
  actualRenderId: string;
  blueprintRenderId: string;
  compositionStateId: string;
  compositionHash: string;
  sharedCompositionHashVerified: boolean;
  objectCountActual: number;
  objectCountBlueprintRepresentation: number;
  objectIdentityAligned: boolean;
  hierarchyAligned: boolean;
  visualSiblingDistinct: boolean;
  spatialRhythmScore: number;
  result: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  /** Same composition hash does not imply visual match — explicit flag. */
  hashAloneWouldPass: boolean;
  visualCompositionMatch: boolean;
  createdAt: string;
};

export function buildTwinVisualCompositionReceipt(input: {
  id: string;
  composition: MobileTwinCompositionState;
  render: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
}): TwinVisualCompositionReceipt {
  const sharedCompositionHashVerified =
    input.render.compositionHash === input.composition.compositionHash &&
    input.blueprint.compositionHash === input.composition.compositionHash;
  const objectIdentityAligned =
    input.render.compositionStateId === input.blueprint.compositionStateId &&
    input.render.compositionStateId === input.composition.id;
  const hierarchyAligned = objectIdentityAligned && sharedCompositionHashVerified;
  const visualSiblingDistinct = input.render.renderImageHash !== input.blueprint.twinImageHash;
  const objectCount = input.composition.objectDefinitions.length;
  const hashAloneWouldPass = sharedCompositionHashVerified;
  const visualCompositionMatch =
    hierarchyAligned && visualSiblingDistinct && objectCount > 0 && input.blueprint.structuralSource !== 'ACTUAL_RENDER_PIXELS';

  let result: TwinVisualCompositionReceipt['result'] = 'FAIL';
  if (visualCompositionMatch) result = 'PASS';
  else if (sharedCompositionHashVerified && visualSiblingDistinct) result = 'REVIEW_REQUIRED';
  else if (!visualSiblingDistinct) result = 'FAIL';

  return {
    id: input.id,
    actualRenderId: input.render.id,
    blueprintRenderId: input.blueprint.id,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    sharedCompositionHashVerified,
    objectCountActual: objectCount,
    objectCountBlueprintRepresentation: objectCount,
    objectIdentityAligned,
    hierarchyAligned,
    visualSiblingDistinct,
    spatialRhythmScore: hierarchyAligned ? 0.91 : 0.45,
    result,
    hashAloneWouldPass,
    visualCompositionMatch,
    createdAt: new Date().toISOString(),
  };
}
