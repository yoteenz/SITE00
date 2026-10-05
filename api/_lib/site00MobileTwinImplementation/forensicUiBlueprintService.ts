import { randomUUID } from 'node:crypto';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { resolveImplementationAuthorities } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { resolveMobileTwinPublicAssetUrl } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/resolveMobileTwinPublicAssetUrl.js';
import { ingestAuthorityImageContentSync } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/authorityContentIngestion.js';
import { resolveAuthorityIngestUri } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/resolveAuthorityIngestUri.js';
import type { DesignPageAuthorityReviewSession } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import {
  FORENSIC_BLUEPRINT_FAL_ENDPOINT,
  FORENSIC_BLUEPRINT_GENERATION_FAILED,
  FORENSIC_BLUEPRINT_PROMPT_VERSION,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/constants.js';
import { generateForensicUiBlueprintAuthority } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/dispatchForensicUiBlueprintFal.js';
import { forensicBlueprintContentHash } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/forensicBlueprintHash.js';
import type {
  ForensicBlueprintGenerationReceipt,
  ForensicFalDispatchReceipt,
  ForensicUiBlueprintAuthority,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/forensicTypes.js';

export type GenerateForensicUiBlueprintResult = {
  authority: ForensicUiBlueprintAuthority;
  receipt: ForensicBlueprintGenerationReceipt;
  dispatchReceipt: ForensicFalDispatchReceipt;
};

export async function generateForensicUiBlueprintForSession(input: {
  session: DesignPageAuthorityReviewSession;
  packageId: string;
  endpoint?: string;
  promptVersion?: string;
}): Promise<GenerateForensicUiBlueprintResult> {
  const pipeline = input.session.mobileTwinPipeline;
  if (!pipeline) throw new Error('MOBILE_TWIN_PIPELINE_MISSING');
  const pkg = pipeline.packages.find((p) => p.id === input.packageId);
  if (!pkg) throw new Error('MOBILE_TWIN_PACKAGE_MISSING');

  const authorities = resolveImplementationAuthorities(pipeline, pkg);
  const actualIngested = ingestAuthorityImageContentSync({
    uri: resolveAuthorityIngestUri(authorities.actualRenderUri, 'actual'),
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });
  const actualHash = actualIngested.contentHash ?? pkg.packageChecksum;
  const secondaryUrl = resolveMobileTwinPublicAssetUrl(authorities.blueprintRenderUri ?? '');
  const secondaryHash = secondaryUrl ? forensicBlueprintContentHash(secondaryUrl) : null;

  const dispatchReceipt: ForensicFalDispatchReceipt = {
    dispatchId: randomUUID(),
    packageId: pkg.id,
    actualHash,
    blueprintHash: secondaryHash,
    endpoint: input.endpoint ?? FORENSIC_BLUEPRINT_FAL_ENDPOINT,
    promptVersion: input.promptVersion ?? FORENSIC_BLUEPRINT_PROMPT_VERSION,
    createdAt: new Date().toISOString(),
    status: 'DISPATCHING',
    falRequestId: null,
    errorClass: null,
  };

  try {
    const { authority, receipt } = await generateForensicUiBlueprintAuthority({
      projectId: pkg.projectId,
      sourceActualAuthorityId: authorities.actualRenderId,
      sourceActualHash: actualHash,
      primaryActualImageUrl: resolveMobileTwinPublicAssetUrl(authorities.actualRenderUri ?? ''),
      secondaryLightBlueprintUrl: secondaryUrl || null,
      canonicalViewport: {
        widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
        heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
      },
    });
    dispatchReceipt.status = 'DISPATCHED';
    dispatchReceipt.falRequestId = receipt.requestId;
    return { authority, receipt, dispatchReceipt };
  } catch (err) {
    dispatchReceipt.status = 'FAILED';
    dispatchReceipt.errorClass =
      err instanceof Error ? err.message : FORENSIC_BLUEPRINT_GENERATION_FAILED;
    throw err;
  }
}
