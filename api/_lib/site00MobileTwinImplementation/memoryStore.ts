import {
  isWireframeImplementationDocument,
  wireframeRejectionReason,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/implementationDocumentValidity.js';
import type {
  CompiledMobileTwinImplementationDocument,
  ImplementationStructuralFidelityReceipt,
  ImplementationVisualFidelityReceipt,
  MobileTwinImplementationBuildRecord,
  MobileTwinPackageApprovalRecord,
  MobileTwinPromotionReadinessReceipt,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';
import type { MobileTwinImplementationStateRow, PersistPackageApprovalInput } from './types.js';

const approvals = new Map<string, MobileTwinPackageApprovalRecord>();
const builds = new Map<string, MobileTwinImplementationBuildRecord>();
const stateByProject = new Map<string, MobileTwinImplementationStateRow>();
const compiledByBuild = new Map<string, CompiledMobileTwinImplementationDocument>();
const visualByBuild = new Map<string, ImplementationVisualFidelityReceipt>();
const structuralByBuild = new Map<string, ImplementationStructuralFidelityReceipt>();
const promotionByProject = new Map<string, MobileTwinPromotionReadinessReceipt>();

export function resetMobileTwinImplementationMemoryStore(): void {
  approvals.clear();
  builds.clear();
  stateByProject.clear();
  compiledByBuild.clear();
  visualByBuild.clear();
  structuralByBuild.clear();
  promotionByProject.clear();
}

export async function persistPackageApprovalMemory(input: PersistPackageApprovalInput): Promise<MobileTwinPackageApprovalRecord> {
  approvals.set(input.record.id, input.record);
  stateByProject.set(input.projectId, {
    projectId: input.projectId,
    status: 'READY_TO_COMPILE',
    latestPackageApprovalId: input.record.id,
    latestBuildId: null,
    implementationPayload: { sessionSnapshot: input.sessionSnapshot },
    updatedAt: new Date().toISOString(),
  });
  return input.record;
}

export async function getImplementationStateMemory(projectId: string): Promise<MobileTwinImplementationStateRow | null> {
  return stateByProject.get(projectId.toLowerCase()) ?? null;
}

export async function getPackageApprovalMemory(projectId: string): Promise<MobileTwinPackageApprovalRecord | null> {
  const row = stateByProject.get(projectId.toLowerCase());
  if (!row?.latestPackageApprovalId) return null;
  return approvals.get(row.latestPackageApprovalId) ?? null;
}

function rejectWireframeBuildIfNeeded(projectId: string): void {
  const prev = stateByProject.get(projectId.toLowerCase());
  const prevBuildId = prev?.latestBuildId;
  if (!prevBuildId) return;
  const prevBuild = builds.get(prevBuildId);
  const prevDoc = compiledByBuild.get(prevBuildId);
  if (!prevBuild || !prevDoc || !isWireframeImplementationDocument(prevDoc)) return;
  if (prevBuild.buildStatus === 'REJECTED_IMPLEMENTATION') return;
  builds.set(prevBuildId, {
    ...prevBuild,
    buildStatus: 'REJECTED_IMPLEMENTATION',
    rejectionReason: wireframeRejectionReason(),
  });
}

export async function saveBuildMemory(input: {
  projectId: string;
  build: MobileTwinImplementationBuildRecord;
  document: CompiledMobileTwinImplementationDocument;
  visual: ImplementationVisualFidelityReceipt;
  structural: ImplementationStructuralFidelityReceipt;
  promotion: MobileTwinPromotionReadinessReceipt;
  status: string;
}): Promise<void> {
  rejectWireframeBuildIfNeeded(input.projectId);
  builds.set(input.build.id, input.build);
  compiledByBuild.set(input.build.id, input.document);
  visualByBuild.set(input.build.id, input.visual);
  structuralByBuild.set(input.build.id, input.structural);
  promotionByProject.set(input.projectId.toLowerCase(), input.promotion);
  const prev = stateByProject.get(input.projectId.toLowerCase());
  const buildCount =
    typeof prev?.implementationPayload?.buildCount === 'number' ? (prev!.implementationPayload.buildCount as number) + 1 : 1;
  stateByProject.set(input.projectId.toLowerCase(), {
    projectId: input.projectId.toLowerCase(),
    status: input.status,
    latestPackageApprovalId: prev?.latestPackageApprovalId ?? input.build.packageApprovalId,
    latestBuildId: input.build.id,
    implementationPayload: {
      ...(prev?.implementationPayload ?? {}),
      buildCount,
      latestBuild: input.build,
      visualFidelity: input.visual,
      structuralFidelity: input.structural,
      promotion: input.promotion,
    },
    updatedAt: new Date().toISOString(),
  });
}

export async function getBuildMemory(buildId: string): Promise<{
  build: MobileTwinImplementationBuildRecord;
  document: CompiledMobileTwinImplementationDocument;
  visual: ImplementationVisualFidelityReceipt | null;
  structural: ImplementationStructuralFidelityReceipt | null;
} | null> {
  const build = builds.get(buildId);
  if (!build) return null;
  return {
    build,
    document: compiledByBuild.get(buildId)!,
    visual: visualByBuild.get(buildId) ?? null,
    structural: structuralByBuild.get(buildId) ?? null,
  };
}

export async function updateBuildFounderStatusMemory(input: {
  projectId: string;
  buildId: string;
  founderStatus: MobileTwinImplementationBuildRecord['founderStatus'];
  promotion: MobileTwinPromotionReadinessReceipt;
  status: string;
}): Promise<MobileTwinImplementationBuildRecord | null> {
  const build = builds.get(input.buildId);
  if (!build) return null;
  const next = {
    ...build,
    founderStatus: input.founderStatus,
    promotionStatus: input.promotion.status,
  };
  builds.set(input.buildId, next);
  promotionByProject.set(input.projectId.toLowerCase(), input.promotion);
  const prev = stateByProject.get(input.projectId.toLowerCase());
  if (prev) {
    stateByProject.set(input.projectId.toLowerCase(), {
      ...prev,
      status: input.status,
      implementationPayload: { ...prev.implementationPayload, latestBuild: next, promotion: input.promotion },
      updatedAt: new Date().toISOString(),
    });
  }
  return next;
}
