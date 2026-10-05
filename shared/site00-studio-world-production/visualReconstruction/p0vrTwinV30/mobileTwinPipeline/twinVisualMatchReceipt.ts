import type { MobileBlueprintTwinVisual, MobileImplementationRender } from './types.js';

export type TwinVisualMatchReceipt = {
  id: string;
  flowId: 'TWIN_FLOW_A_ATOMIC_SIBLINGS' | 'TWIN_FLOW_B_ACTUAL_TO_BLUEPRINT_TRANSFORM';
  actualRenderId: string;
  blueprintRenderId: string;
  compositionStateId: string;
  compositionHash: string;
  majorRegionMatch: boolean;
  objectPositionMatch: boolean;
  objectIdentityMatch: boolean;
  hierarchyMatch: boolean;
  pageStateMatch: boolean;
  featurePresenceMatch: boolean;
  assetPlacementMatch: boolean;
  typographyPlacementMatch: boolean;
  compositionDriftRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  result: 'REVIEW_REQUIRED' | 'FAIL';
  founderDecision: null;
  machinePass: false;
  createdAt: string;
};

export function buildTwinVisualMatchReceipt(input: {
  id: string;
  flowId: TwinVisualMatchReceipt['flowId'];
  actual: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
}): TwinVisualMatchReceipt {
  const hashAligned =
    input.actual.compositionHash === input.blueprint.compositionHash &&
    input.actual.compositionStateId === input.blueprint.compositionStateId;
  const distinctImages = input.actual.renderImageHash !== input.blueprint.twinImageHash;
  const compositionDriftRisk: TwinVisualMatchReceipt['compositionDriftRisk'] =
    hashAligned && distinctImages ? 'LOW'
    : hashAligned ? 'MEDIUM'
    : 'HIGH';

  return {
    id: input.id,
    flowId: input.flowId,
    actualRenderId: input.actual.id,
    blueprintRenderId: input.blueprint.id,
    compositionStateId: input.actual.compositionStateId,
    compositionHash: input.actual.compositionHash,
    majorRegionMatch: hashAligned,
    objectPositionMatch: hashAligned,
    objectIdentityMatch: hashAligned,
    hierarchyMatch: hashAligned,
    pageStateMatch: hashAligned,
    featurePresenceMatch: hashAligned,
    assetPlacementMatch: hashAligned,
    typographyPlacementMatch: hashAligned,
    compositionDriftRisk,
    result: 'REVIEW_REQUIRED',
    founderDecision: null,
    machinePass: false,
    createdAt: new Date().toISOString(),
  };
}
