import {
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  MOBILE_TWIN_NDXBOOK_AUTOBUILD_NO_MANUAL_GATES_V1,
} from '../p0vrTwinV30/constants.js';
import { createDesignPageAuthorityReviewSession } from '../p0vrTwinV30/designPageAuthorityReviewState.js';
import {
  readDesignPageAuthoritySession,
  writeDesignPageAuthoritySession,
} from '../p0vrTwinV30/designPageAuthorityPersistence.js';
import { normalizeDesignPageAuthoritySession } from '../p0vrTwinV30/designPageAuthorityTerritoryGallery.js';
import { notifyDesignAuthoritySessionChanged } from '../p0vrTwinV30/designAuthoritySessionEvents.js';
import { normalizeFounderNbpPromotionOnLoad } from '../p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { ensureSessionReadyForFounderEscalation } from '../p0vrTwinV30/mobileTwinPipeline/founderEscalationSessionPrepare.js';
import { hydrateMobileTwinReviewState } from '../p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinReviewState.js';
import { writeMobileTwinAuthorityImageSnapshot } from '../p0vrTwinV30/mobileTwinPipeline/mobileTwinAuthorityImageSnapshot.js';
import { writeMobileTwinPipelineToBrowser } from '../p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import { syncFounderMobileTwinSession } from '../p0vrTwinV30/mobileTwinPipeline/syncFounderMobileTwinSession.js';
import { compileApprovedMobileTwinPackage } from './compileApprovedMobileTwinPackage.js';
import { documentRequiresR8M2Recompile } from '../p0vrTwinV30R8M2/invalidatePriorR8M1Build.js';
import { MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_INGESTION } from '../p0vrTwinV30R8M3/constants.js';
import { resolveImplementationAuthorities } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { ingestAuthorityImageContent, ingestAuthorityImageContentSync } from '../p0vrTwinV30R8M2R1/authorityContentIngestion.js';
import { site00IsVitest } from '../../runtime/site00RuntimeEnv.js';
import { requestForensicUiBlueprintGeneration } from './requestForensicUiBlueprint.js';
import { resolveAuthorityIngestUri } from '../p0vrTwinV30R8M2R1/resolveAuthorityIngestUri.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../p0vrTwinV30/constants.js';
import { mobileTwinTwinPreviewRoute } from './constants.js';
import { isProductionReadyImplementationDocument } from './implementationDocumentValidity.js';
import {
  resolveApprovedPackageIdForLocalCompile,
  resolveLocalMobileTwinCompileInput,
} from './resolveLocalMobileTwinCompileInput.js';
import { readTwinImplementationCache, writeTwinImplementationCache } from './twinImplementationBrowserCache.js';
import type { DesignPageAuthorityReviewSession } from '../p0vrTwinV30/types.js';

function persistEscalatedSession(session: DesignPageAuthorityReviewSession): DesignPageAuthorityReviewSession {
  let next = normalizeDesignPageAuthoritySession(session);
  if (next.mobileTwinPipeline) {
    next.mobileTwinPipeline = hydrateMobileTwinReviewState(next.mobileTwinPipeline);
    writeMobileTwinPipelineToBrowser(next.projectId, next.mobileTwinPipeline);
    writeMobileTwinAuthorityImageSnapshot(next.projectId, next.mobileTwinPipeline);
  }
  writeDesignPageAuthoritySession(next);
  notifyDesignAuthoritySessionChanged(next.projectId);
  return next;
}

async function primeForensicBlueprintForPackage(
  session: DesignPageAuthorityReviewSession,
  packageId: string,
): Promise<void> {
  if (site00IsVitest()) return;
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline) return;
  const pkg = pipeline.packages.find((p) => p.id === packageId);
  if (!pkg) return;
  const authorities = resolveImplementationAuthorities(pipeline, pkg);
  const actualIngested = ingestAuthorityImageContentSync({
    uri: resolveAuthorityIngestUri(authorities.actualRenderUri, 'actual'),
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });
  const actualHash = actualIngested.contentHash ?? pkg.packageChecksum;
  await requestForensicUiBlueprintGeneration({
    session,
    packageId,
    sourceActualHash: actualHash,
    founderConfirmedSpend: true,
  });
}

async function primeAuthorityIngestionForPackage(
  pipeline: NonNullable<DesignPageAuthorityReviewSession['mobileTwinPipeline']>,
  packageId: string,
): Promise<void> {
  const pkg = pipeline.packages.find((p) => p.id === packageId);
  if (!pkg) return;
  const authorities = resolveImplementationAuthorities(pipeline, pkg);
  await ingestAuthorityImageContent({
    uri: resolveAuthorityIngestUri(authorities.actualRenderUri, 'actual'),
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });
  await ingestAuthorityImageContent({
    uri: resolveAuthorityIngestUri(authorities.blueprintRenderUri, 'blueprint'),
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });
}

function compileSessionPipelineToTwinCache(session: DesignPageAuthorityReviewSession): boolean {
  const key = session.projectId.toLowerCase();
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline) return false;
  const packageId = resolveApprovedPackageIdForLocalCompile(pipeline);
  if (!packageId) return false;
  const document = compileApprovedMobileTwinPackage({ pipeline, packageId });
  if (!isProductionReadyImplementationDocument(document)) return false;
  writeTwinImplementationCache({
    projectId: key,
    buildId: `autobuild-${packageId}`,
    implementationVersion: MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_INGESTION,
    previewRoute: mobileTwinTwinPreviewRoute(key),
    founderStatus: 'PENDING',
    promotionStatus: 'NOT_READY',
    document,
    cachedAt: new Date().toISOString(),
  });
  return true;
}

/** Materialize founder JPG approved package in browser storage (no FAL, no UI). */
export function materializeNdxbookFounderApprovedPackage(
  projectId: string,
): DesignPageAuthorityReviewSession | null {
  const key = projectId.toLowerCase();
  if (key !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) return null;

  const existing = resolveLocalMobileTwinCompileInput(key);
  if (existing) {
    return readDesignPageAuthoritySession(key) ?? createDesignPageAuthorityReviewSession({ projectId: key });
  }

  let session =
    readDesignPageAuthoritySession(key) ?? createDesignPageAuthorityReviewSession({ projectId: key });
  session = normalizeFounderNbpPromotionOnLoad(syncFounderMobileTwinSession(session, key));
  session = escalateFounderMobileTwinPackageFromCanonicalAssets(ensureSessionReadyForFounderEscalation(session));
  return persistEscalatedSession(session);
}

/** R8M1 compile from approved package → twin route browser cache. */
export function writeLocalTwinCompileCacheFromApprovedPackage(
  projectId: string,
  sessionOverride?: DesignPageAuthorityReviewSession,
): boolean {
  const key = projectId.toLowerCase();
  if (sessionOverride) return compileSessionPipelineToTwinCache(sessionOverride);
  const local = resolveLocalMobileTwinCompileInput(key);
  if (!local) return false;
  return compileSessionPipelineToTwinCache({
    projectId: key,
    mobileTwinPipeline: local.pipeline,
  } as DesignPageAuthorityReviewSession);
}

/**
 * NDXBOOK: auto-build approved package + twin implementation cache (gates open — no founder button flow).
 * Idempotent when a production-ready cache already exists.
 */
export async function ensureNdxbookTwinImplementationReady(projectId: string): Promise<void> {
  if (!MOBILE_TWIN_NDXBOOK_AUTOBUILD_NO_MANUAL_GATES_V1) return;
  const key = projectId.toLowerCase();
  if (key !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) return;

  const cached = readTwinImplementationCache(key);
  if (cached && isProductionReadyImplementationDocument(cached.document) && !documentRequiresR8M2Recompile(cached.document)) {
    return;
  }

  const session = materializeNdxbookFounderApprovedPackage(key);
  if (session?.mobileTwinPipeline) {
    const packageId = resolveApprovedPackageIdForLocalCompile(session.mobileTwinPipeline);
    if (packageId) {
      await primeAuthorityIngestionForPackage(session.mobileTwinPipeline, packageId);
      await primeForensicBlueprintForPackage(session, packageId);
    }
    writeLocalTwinCompileCacheFromApprovedPackage(key, session);
  }
}
