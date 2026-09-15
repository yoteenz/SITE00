import {
  findFounderApprovedForensicBlueprintInStorage,
  forensicBlueprintCacheKey,
  readForensicBlueprintFromCache,
} from '../p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import { site00IsBrowser } from '../../runtime/site00RuntimeEnv.js';
import type { ForensicUiBlueprintAuthority } from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../p0vrTwinV30/constants.js';
import { TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE } from './constants.js';
import type { TwinV41ForensicPixelAuthorityLock } from './twinV41Types.js';
import { loadForensicRasterFromUri } from './loadForensicRaster.js';

const STUB_URI_PREFIXES = ['vitest-fal://', 'local-autobuild://'];

function isLoadableForensicUri(uri: string): boolean {
  if (!uri) return false;
  if (STUB_URI_PREFIXES.some((p) => uri.startsWith(p))) return false;
  return (
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('file://') ||
    (uri.startsWith('/') && !uri.startsWith('//'))
  );
}

function assertFounderApproved(authority: ForensicUiBlueprintAuthority): void {
  if (authority.founderReviewStatus !== 'APPROVED') {
    throw new Error(TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE);
  }
  if (!isLoadableForensicUri(authority.blueprintImageUri)) {
    throw new Error(TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE);
  }
}

export async function resolveTwinV41ForensicPixelAuthority(input: {
  projectId: string;
  sourceActualHash: string;
}): Promise<TwinV41ForensicPixelAuthorityLock> {
  if (input.projectId !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) {
    throw new Error(TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE);
  }
  const cacheKey = forensicBlueprintCacheKey({ actualHash: input.sourceActualHash });
  let authority = readForensicBlueprintFromCache(cacheKey);
  if (!authority && site00IsBrowser()) {
    const stored = findFounderApprovedForensicBlueprintInStorage();
    if (stored && stored.sourceActualHash === input.sourceActualHash) {
      authority = stored;
    }
  }
  if (!authority) {
    throw new Error(TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE);
  }
  assertFounderApproved(authority);
  const raster = await loadForensicRasterFromUri(authority.blueprintImageUri);
  return {
    artifactId: authority.id,
    artifactHash: authority.blueprintHash,
    imageUri: authority.blueprintImageUri,
    imageWidth: raster.width,
    imageHeight: raster.height,
    immutable: true,
    source: 'FOUNDER_APPROVED_FORENSIC_BLUEPRINT',
  };
}

export function resolveTwinV41ForensicPixelAuthoritySyncForTests(authority: ForensicUiBlueprintAuthority): void {
  assertFounderApproved(authority);
}
