import { site00IsVitest } from '../../runtime/site00RuntimeEnv.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import {
  FORENSIC_BLUEPRINT_FAL_ENDPOINT,
  FORENSIC_BLUEPRINT_OUTPUT_FORMAT,
  FORENSIC_BLUEPRINT_PROMPT_VERSION,
  FORENSIC_BLUEPRINT_RESOLUTION,
} from './constants.js';
import {
  forensicBlueprintCacheKey,
  readForensicBlueprintFromCache,
  writeForensicBlueprintToCache,
} from './forensicBlueprintCache.js';
import { forensicBlueprintContentHash } from './forensicBlueprintHash.js';
import type { ForensicBlueprintGenerationReceipt, ForensicUiBlueprintAuthority } from './forensicTypes.js';

export type ForensicBlueprintResolveInput = {
  projectId: string;
  sourceActualAuthorityId: string;
  sourceActualHash: string;
  primaryActualImageUrl: string;
  secondaryLightBlueprintUrl?: string | null;
  canonicalViewport: { widthPx: number; heightPx: number };
};

function buildReceipt(
  authority: ForensicUiBlueprintAuthority,
  input: ForensicBlueprintResolveInput,
  idPrefix: string,
): ForensicBlueprintGenerationReceipt {
  return {
    id: `${idPrefix}-${authority.id}`,
    endpoint: authority.falEndpoint,
    requestId: authority.falRequestId,
    sourceActualHash: input.sourceActualHash,
    secondaryBlueprintHash:
      input.secondaryLightBlueprintUrl ?
        forensicBlueprintContentHash(input.secondaryLightBlueprintUrl)
      : null,
    promptVersion: FORENSIC_BLUEPRINT_PROMPT_VERSION,
    resolution: FORENSIC_BLUEPRINT_RESOLUTION,
    outputFormat: FORENSIC_BLUEPRINT_OUTPUT_FORMAT,
    resultUrl: authority.falResultUrl,
    resultHash: authority.blueprintHash,
    costUsd: site00IsVitest() ? 0 : null,
    generatedAt: authority.generatedAt,
  };
}

function seedLocalForensicBlueprintStub(input: ForensicBlueprintResolveInput): ForensicUiBlueprintAuthority {
  const url =
    site00IsVitest() ?
      `vitest-fal://forensic-ui-blueprint-${input.projectId}`
    : `local-autobuild://forensic-ui-blueprint-${input.projectId}`;
  const blueprintHash = forensicBlueprintContentHash(`${url}:${input.sourceActualHash}`);
  const authority: ForensicUiBlueprintAuthority = {
    id: `fuba-${fnv1aHex(blueprintHash).slice(0, 12)}`,
    projectId: input.projectId,
    viewport: 'MOBILE',
    sourceActualAuthorityId: input.sourceActualAuthorityId,
    sourceActualHash: input.sourceActualHash,
    falEndpoint: FORENSIC_BLUEPRINT_FAL_ENDPOINT,
    falRequestId: `local-forensic-${Date.now()}`,
    falResultUrl: url,
    blueprintImageUri: url,
    blueprintHash,
    generatedAt: new Date().toISOString(),
    status: site00IsVitest() ? 'MACHINE_VALIDATED' : 'FOUNDER_BLUEPRINT_REVIEW',
    founderReviewStatus: 'PENDING',
  };
  const cacheKey = forensicBlueprintCacheKey({ actualHash: input.sourceActualHash });
  writeForensicBlueprintToCache(cacheKey, authority);
  return authority;
}

/** Sync resolve for compile — cache, vitest stub, or browser autobuild stub (server compile must prime FAL separately). */
export function resolveForensicUiBlueprintAuthoritySync(
  input: ForensicBlueprintResolveInput,
): { authority: ForensicUiBlueprintAuthority; receipt: ForensicBlueprintGenerationReceipt } {
  const cacheKey = forensicBlueprintCacheKey({ actualHash: input.sourceActualHash });
  const cached = readForensicBlueprintFromCache(cacheKey);
  if (cached) {
    return { authority: cached, receipt: buildReceipt(cached, input, 'fbgr-sync') };
  }

  if (!site00IsVitest()) {
    throw new Error('FORENSIC_BLUEPRINT_NOT_PRIMED — call server GENERATE_FORENSIC_UI_BLUEPRINT before compile');
  }

  const authority = seedLocalForensicBlueprintStub(input);
  return { authority, receipt: buildReceipt(authority, input, 'fbgr-local') };
}
