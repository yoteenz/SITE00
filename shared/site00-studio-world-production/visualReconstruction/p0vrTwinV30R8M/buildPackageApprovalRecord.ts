import type { DesignPageAuthorityReviewSession } from '../p0vrTwinV30/types.js';
import { MOBILE_TWIN_IMPLEMENTATION_APPROVAL_VERSION } from './constants.js';
import type { MobileTwinPackageApprovalRecord } from './types.js';

export function buildMobileTwinPackageApprovalRecord(
  session: DesignPageAuthorityReviewSession,
  approvalId: string,
  approvedBy = 'founder',
): MobileTwinPackageApprovalRecord {
  const pipeline = session.mobileTwinPipeline!;
  const pkg = pipeline.packages.find((p) => p.id === pipeline.latestPackageId)!;
  const pair = pipeline.visualPairs.find((p) => p.id === pipeline.activeVisualPairId)!;
  const render = pipeline.renders.find((r) => r.id === pair.actualRenderId)!;
  const blueprint = pipeline.blueprintTwins.find((b) => b.id === pair.blueprintRenderId)!;
  const auth = pipeline.implementationVisualAuthority!;
  const now = new Date().toISOString();
  return {
    id: approvalId,
    projectId: session.projectId.toLowerCase(),
    workspaceType: 'DESIGN',
    viewport: 'MOBILE',
    packageId: pkg.id,
    packageChecksum: pkg.packageChecksum,
    compositionStateId: pkg.compositionStateId,
    compositionHash: pkg.compositionHash,
    actualRenderId: render.id,
    actualRenderHash: render.renderImageHash,
    blueprintRenderId: blueprint.id,
    blueprintRenderHash: blueprint.twinImageHash,
    implementationVisualAuthorityId: auth.id,
    providerStrategy: pipeline.mobileTwinRenderStrategy?.strategy ?? pipeline.mobileTwinVisualGenerationStrategy ?? 'UNRESOLVED',
    featureManifestVersion: pkg.featureManifestVersion,
    projectContextVersion: pkg.projectCreativeContextVersion,
    approvedAt: auth.approvedAt ?? now,
    approvedBy,
    approvalVersion: MOBILE_TWIN_IMPLEMENTATION_APPROVAL_VERSION,
    status: 'APPROVED',
    source: 'FOUNDER_APPROVAL',
    createdAt: now,
    updatedAt: now,
  };
}
