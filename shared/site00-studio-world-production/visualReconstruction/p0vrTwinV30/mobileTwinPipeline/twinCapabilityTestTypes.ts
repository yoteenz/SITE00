import type { MobileTwinVisualGenerationStrategy } from './mobileTwinVisualStrategy.js';

export type TwinCapabilityTestCompositionSnapshot = {
  id: string;
  referenceAuthorityId: string;
  referenceHash: string;
  compositionStateId: string;
  compositionHash: string;
  featureManifestVersion: string;
  projectContextVersion: string;
  hostProjectContractVersion: string;
  createdAt: string;
  status: 'FROZEN';
};

export type TwinFlowACapabilityReceipt = {
  id: string;
  flowMode: 'TWIN_FLOW_A_ATOMIC_SIBLINGS';
  actualRenderId: string;
  blueprintRenderId: string;
  actualJobId: string;
  blueprintJobId: string;
  actualHash: string;
  blueprintHash: string;
  compositionStateId: string;
  compositionHash: string;
  provider: 'FAL';
  model: string;
  estimatedCostUsd: number;
  status: 'COMPLETE' | 'PARTIAL' | 'FAILED';
  createdAt: string;
};

export type TwinFlowBCapabilityReceipt = {
  id: string;
  flowMode: 'TWIN_FLOW_B_ACTUAL_TO_BLUEPRINT_TRANSFORM';
  actualSourceRenderId: string;
  actualHash: string;
  actualJobId: string;
  blueprintRenderId: string;
  blueprintTransformJobId: string;
  blueprintHash: string;
  compositionStateId: string;
  compositionHash: string;
  provider: 'FAL';
  model: string;
  estimatedCostUsd: number;
  status: 'COMPLETE' | 'PARTIAL' | 'FAILED';
  createdAt: string;
};

export type MobileTwinCapabilityTestStatus =
  | 'NOT_STARTED'
  | 'RUNNING'
  | 'FOUNDER_REVIEW_READY'
  | 'PARTIAL'
  | 'FAILED';

export type FounderTwinCapabilityDecision =
  | 'FLOW_A_MORE_ACCURATE'
  | 'FLOW_B_MORE_ACCURATE'
  | 'BOTH_ACCEPTABLE'
  | 'NEITHER_ACCEPTABLE'
  | null;

export type MobileTwinCapabilityTestState = {
  testId: string;
  snapshot: TwinCapabilityTestCompositionSnapshot;
  actualControlMode: 'SHARED_CANONICAL_ACTUAL';
  canonicalActualRenderId: string | null;
  flowABlueprintId: string | null;
  flowBBlueprintId: string | null;
  flowAReceiptId: string;
  flowBReceiptId: string;
  flowAVisualMatchReceiptId: string;
  flowBVisualMatchReceiptId: string;
  status: MobileTwinCapabilityTestStatus;
  founderDecision: FounderTwinCapabilityDecision;
  founderSelectedStrategy: MobileTwinVisualGenerationStrategy;
  idempotencyKey: string;
  capabilityTestCostUsd: number;
  assetJobsDispatched: 0;
  fullPackageFanoutBlocked: true;
};
