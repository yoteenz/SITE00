import { readDesignPageAuthoritySession } from '../p0vrTwinV30/designPageAuthorityPersistence.js';
import { DESIGN_PAGE_V3_PILOT_PROJECT_ID, FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../p0vrTwinV30/constants.js';
import { resolveImplementationAuthorities } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { ingestAuthorityImageContentSync } from '../p0vrTwinV30R8M2R1/authorityContentIngestion.js';
import { resolveAuthorityIngestUri } from '../p0vrTwinV30R8M2R1/resolveAuthorityIngestUri.js';
import { requestForensicUiBlueprintGeneration } from '../p0vrTwinV30R8M/requestForensicUiBlueprint.js';
import { resolveLocalMobileTwinCompileInput } from '../p0vrTwinV30R8M/resolveLocalMobileTwinCompileInput.js';
import {
  findCachedForensicBlueprintForTwinV41Boot,
  forensicBlueprintCacheKey,
  isLoadableForensicBlueprintUri,
  readForensicBlueprintFromCache,
} from '../p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import { site00IsVitest } from '../../runtime/site00RuntimeEnv.js';

export type TwinV41PrimeForensicResult =
  | { ok: true; sourceActualHash: string }
  | { ok: false; code: 'NO_DESIGN_SESSION' | 'NO_APPROVED_PACKAGE' | 'API_FAILED' | 'SKIPPED_VITEST'; message: string };

/** Try to fetch https Fal forensic blueprint using the same inputs as Twin V3 autobuild (no stub fallback). */
export async function primeTwinV41ForensicFromDesignSession(projectId: string): Promise<TwinV41PrimeForensicResult> {
  if (site00IsVitest()) {
    return { ok: false, code: 'SKIPPED_VITEST', message: 'vitest' };
  }
  const key = projectId.toLowerCase();
  const existing = findCachedForensicBlueprintForTwinV41Boot(key);
  if (existing && isLoadableForensicBlueprintUri(existing.blueprintImageUri)) {
    return { ok: true, sourceActualHash: existing.sourceActualHash };
  }

  let session = readDesignPageAuthoritySession(key);
  if (!session?.mobileTwinPipeline) {
    return {
      ok: false,
      code: 'NO_DESIGN_SESSION',
      message: 'Open Design workspace and build/load mobile twin package on this device first.',
    };
  }

  const local = resolveLocalMobileTwinCompileInput(key);
  const packageId = local?.packageId ?? session.mobileTwinPipeline.latestPackageId;
  if (!packageId) {
    return {
      ok: false,
      code: 'NO_APPROVED_PACKAGE',
      message: 'No approved mobile twin package on this device — visit /design/twin or Design workspace.',
    };
  }

  const pkg = session.mobileTwinPipeline.packages.find((p) => p.id === packageId);
  if (!pkg) {
    return {
      ok: false,
      code: 'NO_APPROVED_PACKAGE',
      message: 'Approved package not found in design session.',
    };
  }

  const authorities = resolveImplementationAuthorities(session.mobileTwinPipeline, pkg);
  const actualIngested = ingestAuthorityImageContentSync({
    uri: resolveAuthorityIngestUri(authorities.actualRenderUri, 'actual'),
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });
  const sourceActualHash = actualIngested.contentHash ?? pkg.packageChecksum;
  const cacheKey = forensicBlueprintCacheKey({ actualHash: sourceActualHash });
  const cached = readForensicBlueprintFromCache(cacheKey);
  if (cached && isLoadableForensicBlueprintUri(cached.blueprintImageUri)) {
    return { ok: true, sourceActualHash };
  }

  if (key !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) {
    return { ok: false, code: 'NO_DESIGN_SESSION', message: 'V4.1 pilot is ndxbook only.' };
  }

  try {
    await requestForensicUiBlueprintGeneration({
      session,
      packageId,
      sourceActualHash,
      founderConfirmedSpend: true,
    });
    const after = readForensicBlueprintFromCache(cacheKey);
    if (after && isLoadableForensicBlueprintUri(after.blueprintImageUri)) {
      return { ok: true, sourceActualHash };
    }
    return {
      ok: false,
      code: 'API_FAILED',
      message: 'Forensic API returned but no loadable https blueprint was cached.',
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'FORENSIC_BLUEPRINT_GENERATION_FAILED';
    return { ok: false, code: 'API_FAILED', message };
  }
}
