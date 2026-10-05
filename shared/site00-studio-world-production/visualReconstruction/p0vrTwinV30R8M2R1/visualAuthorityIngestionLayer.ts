import type { MobileTwinCompositionState, MobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import type { ImplementationAuthorityBundle } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../p0vrTwinV30/constants.js';
import { ingestAuthorityImageContent } from './authorityContentIngestion.js';
import { resolveAuthorityIngestUri } from './resolveAuthorityIngestUri.js';
import { buildActualVisualAnalysis, buildBlueprintVisualAnalysis } from './buildVisualAnalyses.js';
import { buildImplementationExpressionIR } from './buildImplementationExpressionIR.js';
import { buildVisualAuthorityIngestionAuditReceipt } from './visualAuthorityIngestionAudit.js';
import type { ActualVisualAnalysis, BlueprintVisualAnalysis, ImplementationExpressionIR, VisualAuthorityIngestionAuditReceipt } from './implementationExpressionTypes.js';

export type VisualAuthorityIngestionResult = {
  audit: VisualAuthorityIngestionAuditReceipt;
  actualAnalysis: ActualVisualAnalysis;
  blueprintAnalysis: BlueprintVisualAnalysis;
  expressionIr: ImplementationExpressionIR;
};

export async function runVisualAuthorityIngestionLayer(input: {
  projectId: string;
  workspaceType: string;
  pkg: MobileTwinPackage;
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  authorities: ImplementationAuthorityBundle;
}): Promise<VisualAuthorityIngestionResult> {
  const audit = await buildVisualAuthorityIngestionAuditReceipt({
    authorities: input.authorities,
    composition: input.composition,
    bundle: input.bundle,
    pkg: input.pkg,
  });

  const actualIngested = await ingestAuthorityImageContent({
    uri: resolveAuthorityIngestUri(input.authorities.actualRenderUri, 'actual'),
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });
  const blueprintIngested = await ingestAuthorityImageContent({
    uri: resolveAuthorityIngestUri(input.authorities.blueprintRenderUri, 'blueprint'),
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });

  const runId = input.pkg.packageChecksum.slice(0, 12);
  const actualAnalysis = buildActualVisualAnalysis({
    runId,
    composition: input.composition,
    actual: actualIngested,
  });
  const blueprintAnalysis = buildBlueprintVisualAnalysis({
    runId,
    composition: input.composition,
    blueprint: blueprintIngested,
  });

  const expressionIr = buildImplementationExpressionIR({
    projectId: input.projectId,
    workspaceType: input.workspaceType,
    pkg: input.pkg,
    composition: input.composition,
    bundle: input.bundle,
    authorities: input.authorities,
    actualAnalysis,
    blueprintAnalysis,
    actualContentHash: actualIngested.contentHash ?? input.pkg.packageChecksum,
    blueprintContentHash: blueprintIngested.contentHash ?? input.pkg.packageChecksum,
  });

  return { audit, actualAnalysis, blueprintAnalysis, expressionIr };
}
