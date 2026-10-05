export type {
  MobileTwinPackageApprovalRecord,
  MobileTwinImplementationBuildRecord,
  CompiledMobileTwinImplementationDocument,
  ImplementationVisualFidelityReceipt,
  ImplementationStructuralFidelityReceipt,
  MobileTwinPromotionReadinessReceipt,
  MobileTwinImplementationStateStatus,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';

export type MobileTwinImplementationStateRow = {
  projectId: string;
  status: string;
  latestPackageApprovalId: string | null;
  latestBuildId: string | null;
  implementationPayload: Record<string, unknown>;
  updatedAt: string;
};

export type PersistPackageApprovalInput = {
  projectId: string;
  record: import('../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js').MobileTwinPackageApprovalRecord;
  sessionSnapshot: Record<string, unknown>;
};
