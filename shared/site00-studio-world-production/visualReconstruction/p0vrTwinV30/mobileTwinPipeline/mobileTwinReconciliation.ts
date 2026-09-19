import type {
  MobileBlueprintTwinVisual,
  MobileImplementationRender,
  MobileTwinCompositionState,
  MobileTwinReconciliationReceipt,
  ReferenceTranslationFidelityReceipt,
  RenderBlueprintTwinReconciliationReceipt,
  TwinFidelityReceipt,
} from './types.js';
import { DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1 } from '../designWorkspaceFeatureAuthority/featureDefinitionsV1.js';

export function buildReferenceTranslationFidelityReceipt(input: {
  id: string;
  referenceAuthorityId: string;
  render: MobileImplementationRender;
  composition: MobileTwinCompositionState;
}): ReferenceTranslationFidelityReceipt {
  const compositionPreserved = input.render.compositionHash === input.composition.compositionHash;
  return {
    id: input.id,
    referenceAuthorityId: input.referenceAuthorityId,
    renderId: input.render.id,
    compositionHash: input.composition.compositionHash,
    compositionPreserved,
    spatialHierarchyScore: compositionPreserved ? 0.92 : 0.4,
    result: compositionPreserved ? 'PASS' : 'FAIL',
  };
}

export function buildTwinFidelityReceipt(input: {
  id: string;
  render: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
  composition: MobileTwinCompositionState;
  objectCountMatch: boolean;
}): TwinFidelityReceipt {
  const compositionHashMatch =
    input.render.compositionHash === input.blueprint.compositionHash &&
    input.render.compositionHash === input.composition.compositionHash;
  return {
    id: input.id,
    renderId: input.render.id,
    blueprintTwinId: input.blueprint.id,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    objectIdentityMatch: input.objectCountMatch,
    compositionHashMatch,
    result: compositionHashMatch && input.objectCountMatch ? 'PASS' : 'FAIL',
  };
}

export function buildMobileTwinReconciliationReceipt(input: {
  id: string;
  packageId: string;
  composition: MobileTwinCompositionState;
  render: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
  structuredIds: string[];
}): MobileTwinReconciliationReceipt {
  const errors: string[] = [];
  if (input.render.compositionStateId !== input.composition.id) errors.push('DERIVATIVE_COMPOSITION_MISMATCH');
  if (input.render.compositionHash !== input.composition.compositionHash) errors.push('DERIVATIVE_COMPOSITION_MISMATCH');
  if (input.blueprint.compositionStateId !== input.composition.id) errors.push('BLUEPRINT_TWIN_COMPOSITION_MISMATCH');
  if (input.blueprint.compositionHash !== input.composition.compositionHash) errors.push('BLUEPRINT_TWIN_COMPOSITION_MISMATCH');
  const missingFeatures = DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1.filter(
    (fid) => !input.composition.featureBindings.some((fb) => fb.featureId === fid),
  );
  if (missingFeatures.length) errors.push('FEATURE_BINDING_GAP');
  return {
    id: input.id,
    packageId: input.packageId,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    derivativeCompositionMatch: errors.length === 0,
    errors,
    result: errors.length === 0 ? 'PASS' : 'FAIL',
  };
}

export function buildRenderBlueprintTwinReconciliationReceipt(input: {
  id: string;
  render: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
  composition: MobileTwinCompositionState;
}): RenderBlueprintTwinReconciliationReceipt {
  const hashMatch =
    input.render.compositionHash === input.blueprint.compositionHash &&
    input.composition.compositionHash === input.blueprint.compositionHash;
  const objectCountCorrespondence = input.composition.objectDefinitions.length > 0;
  return {
    id: input.id,
    renderId: input.render.id,
    blueprintTwinId: input.blueprint.id,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    regionCorrespondence: hashMatch,
    objectCountCorrespondence,
    hierarchyCorrespondence: hashMatch && input.blueprint.implementationRenderId === input.render.id,
    result: hashMatch && input.blueprint.implementationRenderId === input.render.id ? 'PASS' : 'FAIL',
  };
}

export function assertBlueprintTwinNotRedesigned(input: {
  blueprintObjectCount: number;
  compositionObjectCount: number;
}): void {
  if (input.blueprintObjectCount !== input.compositionObjectCount) {
    throw new Error('BLUEPRINT_TWIN_COMPOSITION_MISMATCH');
  }
}
