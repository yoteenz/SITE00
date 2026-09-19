import { randomUUID } from 'node:crypto';
import type { DesignPageAuthorityReviewSession } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { slimMobileTwinPipelineForStorage } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import { compileApprovedMobileTwinPackage, assertCompilerDoesNotUseRasterAuthorities } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { buildMobileTwinPackageApprovalRecord } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/buildPackageApprovalRecord.js';
import {
  buildImplementationStructuralFidelityReceipt,
  buildImplementationVisualFidelityReceipt,
  validateFunctionalBindings,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/buildImplementationFidelityReceipts.js';
import { evaluateMobileTwinPromotionReadiness } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/evaluatePromotionReadiness.js';
import { mobileTwinTwinPreviewRoute } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/constants.js';
import type { MobileTwinImplementationCorrectionReason } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';
import { mobileTwinImplementationStore } from './storeAdapter.js';
import { generateForensicUiBlueprintForSession } from './forensicUiBlueprintService.js';

export async function persistMobileTwinPackageApprovalService(session: DesignPageAuthorityReviewSession) {
  const approvalId = randomUUID();
  const record = buildMobileTwinPackageApprovalRecord(session, approvalId);
  const pipeline = session.mobileTwinPipeline!;
  await mobileTwinImplementationStore.persistPackageApproval({
    projectId: session.projectId.toLowerCase(),
    record,
    sessionSnapshot: {
      mobileTwinPipeline: slimMobileTwinPipelineForStorage(pipeline),
      updatedAt: session.updatedAt,
    },
  });
  return record;
}

export async function getMobileTwinImplementationStateService(projectId: string) {
  return mobileTwinImplementationStore.getImplementationState(projectId.toLowerCase());
}

export async function compileMobileTwinImplementationService(session: DesignPageAuthorityReviewSession) {
  const projectId = session.projectId.toLowerCase();
  const state = await mobileTwinImplementationStore.getImplementationState(projectId);
  if (!state?.latestPackageApprovalId) throw new Error('NO_APPROVED_MOBILE_TWIN_PACKAGE');
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.latestPackageId) throw new Error('MOBILE_TWIN_PACKAGE_MISSING');
  const pkg = pipeline.packages.find((p) => p.id === pipeline.latestPackageId);
  if (!pkg || pkg.status !== 'APPROVED') throw new Error('MOBILE_TWIN_PACKAGE_NOT_APPROVED');

  const priorBuilds =
    typeof state.implementationPayload.buildCount === 'number' ? (state.implementationPayload.buildCount as number) : 0;
  const buildId = randomUUID();
  await generateForensicUiBlueprintForSession({ session, packageId: pkg.id });
  const document = compileApprovedMobileTwinPackage({ pipeline, packageId: pkg.id });
  const version = document.implementationVersion ?? `mobile-twin-impl-v${priorBuilds + 1}`;
  const render = pipeline.renders.find((r) => r.id === pipeline.activeRenderId);
  const blueprint = pipeline.blueprintTwins.find((b) => b.id === pipeline.activeVisualPairId ? pipeline.visualPairs.find((p) => p.id === pipeline.activeVisualPairId)?.blueprintRenderId : undefined);
  assertCompilerDoesNotUseRasterAuthorities({
    actualRenderUri: render?.renderImageUri,
    blueprintRenderUri: blueprint?.twinImageUri,
    document,
  });
  const visual = buildImplementationVisualFidelityReceipt({ buildId, pipeline, document });
  const structural = buildImplementationStructuralFidelityReceipt({ buildId, pipeline, document });
  const functional = validateFunctionalBindings(document);
  const build = {
    id: buildId,
    packageApprovalId: state.latestPackageApprovalId,
    packageId: pkg.id,
    packageChecksum: pkg.packageChecksum,
    compositionHash: pkg.compositionHash,
    implementationVersion: version,
    previewRoute: mobileTwinTwinPreviewRoute(projectId),
    compiledAt: new Date().toISOString(),
    buildStatus: 'PREVIEW_BUILD_READY' as const,
    compiledDocument: document,
    visualFidelityReceiptId: visual.id,
    structuralFidelityReceiptId: structural.id,
    founderStatus: 'PENDING' as const,
    promotionStatus: 'NOT_READY' as const,
  };
  const promotion = evaluateMobileTwinPromotionReadiness({
    packageApprovalDurable: true,
    build,
    visual,
    structural,
    functionalPass: functional.pass,
    previewRouteHealthy: true,
  });
  await mobileTwinImplementationStore.saveBuild({
    projectId,
    build,
    document,
    visual,
    structural,
    promotion,
    status: 'FOUNDER_IMPLEMENTATION_REVIEW',
  });
  return { build, document, visual, structural, promotion, functional };
}

export async function approveMobileTwinImplementationService(projectId: string, buildId: string) {
  const loaded = await mobileTwinImplementationStore.getBuild(buildId);
  if (!loaded) throw new Error('TWIN_IMPLEMENTATION_NOT_BUILT');
  const promotion = evaluateMobileTwinPromotionReadiness({
    packageApprovalDurable: true,
    build: { ...loaded.build, founderStatus: 'FOUNDER_APPROVED' },
    visual: loaded.visual,
    structural: loaded.structural,
    functionalPass: true,
    previewRouteHealthy: true,
  });
  const updated = await mobileTwinImplementationStore.updateBuildFounderStatus({
    projectId,
    buildId,
    founderStatus: 'FOUNDER_APPROVED',
    promotion,
    status: promotion.status === 'PROMOTION_READY' ? 'PROMOTION_READY' : 'FOUNDER_APPROVED',
  });
  return { build: updated, promotion };
}

export async function requestMobileTwinImplementationCorrectionService(input: {
  projectId: string;
  buildId: string;
  reason: MobileTwinImplementationCorrectionReason;
  note?: string;
}) {
  void input.note;
  await mobileTwinImplementationStore.updateBuildFounderStatus({
    projectId: input.projectId,
    buildId: input.buildId,
    founderStatus: 'CORRECTION_REQUESTED',
    promotion: evaluateMobileTwinPromotionReadiness({
      packageApprovalDurable: true,
      build: null,
      visual: null,
      structural: null,
      functionalPass: false,
      previewRouteHealthy: false,
    }),
    status: 'CORRECTION_REQUIRED',
  });
  return { ok: true, reason: input.reason, creativeReopen: false };
}
