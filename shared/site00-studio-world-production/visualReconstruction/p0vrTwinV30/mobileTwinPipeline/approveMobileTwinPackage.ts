import type { DesignPageAuthorityReviewSession } from '../types.js';
import type { MobileImplementationVisualAuthority } from './types.js';
import { assertRenderPassesReferenceCloneFirewall } from './referenceCloneFirewall.js';
import { classifyLegacyMobileRender, assertRenderCanBecomeImplementationAuthority } from './mobileRenderClassification.js';
import type { TwinVisualCompositionReceipt } from './twinVisualCompositionReceipt.js';
import { assertFullMobileTwinPackageAllowed } from './mobileTwinVisualStrategy.js';

export function canApproveMobileTwinPackage(session: DesignPageAuthorityReviewSession): boolean {
  const p = session.mobileTwinPipeline;
  if (!p?.latestPackageId) return false;
  if (p.mobileTwinVisualGenerationStrategy === 'UNRESOLVED') return false;
  const pkg = p.packages.find((x) => x.id === p.latestPackageId);
  if (!pkg) return false;
  if (pkg.status === 'APPROVED' || p.mobileTwinImplementation?.packageApprovalStatus === 'CONFIRMED') return false;
  if (pkg.status !== 'FOUNDER_REVIEW_READY') return false;
  const pair = p.activeVisualPairId ? p.visualPairs.find((v) => v.id === p.activeVisualPairId) : null;
  if (!pair || pair.status !== 'FOUNDER_REVIEW_READY') return false;
  const render = p.renders.find((r) => r.id === pair.actualRenderId);
  const blueprint = p.blueprintTwins.find((b) => b.id === pair.blueprintRenderId);
  return Boolean(render && blueprint);
}

export function approveMobileTwinPackage(
  session: DesignPageAuthorityReviewSession,
  notes = '',
): DesignPageAuthorityReviewSession {
  void notes;
  assertFullMobileTwinPackageAllowed(session.mobileTwinPipeline?.mobileTwinVisualGenerationStrategy);
  if (!canApproveMobileTwinPackage(session)) throw new Error('MOBILE_TWIN_PACKAGE_NOT_READY');
  const pipeline = session.mobileTwinPipeline!;
  const pkg = pipeline.packages.find((x) => x.id === pipeline.latestPackageId)!;
  const pair = pipeline.visualPairs.find((v) => v.id === pipeline.activeVisualPairId)!;
  const render = classifyLegacyMobileRender(pipeline.renders.find((r) => r.id === pair.actualRenderId)!);
  const composition = pipeline.compositionStates.find((c) => c.id === pair.compositionStateId)!;
  assertRenderCanBecomeImplementationAuthority(render, pipeline.founderStubOverride);
  assertRenderPassesReferenceCloneFirewall(render);

  const tvcrId =
    pipeline.activeAtomicRunId ? `tvcr-${pipeline.activeAtomicRunId}` : null;
  const tvcr = (tvcrId ? pipeline.artifactsById[tvcrId] : undefined) as TwinVisualCompositionReceipt | undefined;
  if (tvcr?.result === 'FAIL') throw new Error('TWIN_VISUAL_COMPOSITION_MISMATCH');

  const now = new Date().toISOString();
  const approvedRender = { ...render, status: 'APPROVED' as const };
  const approvedPkg = { ...pkg, status: 'APPROVED' as const };
  const approvedPair = { ...pair, status: 'APPROVED' as const, approvedAt: now };
  const visualAuthority: MobileImplementationVisualAuthority = {
    id: `miva-${render.id}`,
    renderId: render.id,
    sourceProviderJobId: render.providerJobRef,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    referenceAuthorityId: render.referenceAuthorityId,
    featureManifestVersion: composition.featureManifestVersion,
    projectCreativeContextVersion: composition.projectCreativeContextVersion,
    imageUri: render.renderImageUri,
    imageHash: render.renderImageHash,
    approvedAt: now,
    approvedBy: 'founder',
    status: 'FROZEN_IMPLEMENTATION_AUTHORITY',
  };

  const atomicRuns = pipeline.atomicRuns.map((r) =>
    r.id === pipeline.activeAtomicRunId ? { ...r, status: 'APPROVED' as const, completedAt: now } : r,
  );

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      renders: pipeline.renders.map((r) => (r.id === render.id ? approvedRender : classifyLegacyMobileRender(r))),
      renderGate: 'FROZEN',
      implementationVisualAuthority: visualAuthority,
      packages: pipeline.packages.map((p) => (p.id === pkg.id ? approvedPkg : p)),
      visualPairs: pipeline.visualPairs.map((p) => (p.id === pair.id ? approvedPair : p)),
      atomicRuns,
      artifactsById: {
        ...pipeline.artifactsById,
        [render.id]: approvedRender,
        [pkg.id]: approvedPkg,
        [pair.id]: approvedPair,
        [visualAuthority.id]: visualAuthority,
      },
    },
    updatedAt: now,
  };
}
