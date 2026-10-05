import type { ForensicUiBlueprintAuthority } from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import {
  forensicBlueprintCacheKey,
  readForensicBlueprintFromCache,
} from '../p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import { seedLocalForensicBlueprintStub } from '../p0vrTwinV30R8M2R5/resolveForensicUiBlueprintAuthoritySync.js';
import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../p0vrTwinV30/constants.js';
import { TWIN_V4_FORENSIC_CANONICAL_VIEWPORT, TWIN_V4_FORENSIC_NOT_AVAILABLE } from './constants.js';
import type {
  TwinV4ForensicAuthorityLock,
  TwinV4ForensicBlueprintIngestionReceipt,
} from './twinV4Types.js';
import { readTwinV4Bundle } from './twinV4Persistence.js';
import { TWIN_V4_FORENSIC_AUTHORITY_MISMATCH } from './constants.js';

export function buildTwinV4ForensicAuthorityLock(input: {
  authority: ForensicUiBlueprintAuthority;
  sourcePackageId: string;
}): TwinV4ForensicAuthorityLock {
  return {
    forensicBlueprintArtifactId: input.authority.id,
    forensicBlueprintHash: input.authority.blueprintHash,
    sourcePackageId: input.sourcePackageId,
    approvedAt: input.authority.generatedAt,
    approvalStatus: 'APPROVED',
    immutable: true,
  };
}

function resolveApprovedForensicAuthority(projectId: string, sourceActualHash: string): ForensicUiBlueprintAuthority {
  const cacheKey = forensicBlueprintCacheKey({ actualHash: sourceActualHash });
  const cached = readForensicBlueprintFromCache(cacheKey);
  if (cached) return cached;

  if (projectId !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) {
    throw new Error(TWIN_V4_FORENSIC_NOT_AVAILABLE);
  }

  return seedLocalForensicBlueprintStub({
    projectId,
    sourceActualAuthorityId: 'v4-forensic-lock',
    sourceActualHash,
    primaryActualImageUrl: 'local-autobuild://forensic-ui-blueprint-ndxbook',
    secondaryLightBlueprintUrl: null,
    canonicalViewport: TWIN_V4_FORENSIC_CANONICAL_VIEWPORT,
  });
}

export function assertTwinV4ForensicAuthorityLock(input: {
  lock: TwinV4ForensicAuthorityLock;
  authority: ForensicUiBlueprintAuthority;
}): void {
  if (
    input.authority.id !== input.lock.forensicBlueprintArtifactId ||
    input.authority.blueprintHash !== input.lock.forensicBlueprintHash
  ) {
    throw new Error(TWIN_V4_FORENSIC_AUTHORITY_MISMATCH);
  }
}

export function resolveTwinV4ForensicAuthority(input: {
  projectId: string;
  sourcePackageId: string;
  sourceActualHash: string;
}): {
  authority: ForensicUiBlueprintAuthority;
  lock: TwinV4ForensicAuthorityLock;
  ingestionReceipt: TwinV4ForensicBlueprintIngestionReceipt;
} {
  const authority = resolveApprovedForensicAuthority(input.projectId, input.sourceActualHash);
  const existing = readTwinV4Bundle();
  let lock = buildTwinV4ForensicAuthorityLock({
    authority,
    sourcePackageId: input.sourcePackageId,
  });
  if (existing?.authorityLock) {
    lock = existing.authorityLock;
    assertTwinV4ForensicAuthorityLock({ lock, authority });
  }

  const ingestionReceipt: TwinV4ForensicBlueprintIngestionReceipt = {
    id: `tv4fbir-${authority.id}`,
    forensicBlueprintArtifactId: authority.id,
    forensicBlueprintHash: authority.blueprintHash,
    contentUri: authority.blueprintImageUri,
    contentAvailable: Boolean(authority.blueprintImageUri),
    noRegeneration: true,
    ingestedAt: new Date().toISOString(),
  };

  return { authority, lock, ingestionReceipt };
}
