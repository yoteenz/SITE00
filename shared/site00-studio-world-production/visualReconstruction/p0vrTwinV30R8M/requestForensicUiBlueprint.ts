import type { DesignPageAuthorityReviewSession } from '../p0vrTwinV30/types.js';
import { site00ClientApiUrl } from '../../site00ClientApiBase.js';
import {
  forensicBlueprintCacheKey,
  writeForensicBlueprintToCache,
} from '../p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import type {
  ForensicBlueprintGenerationReceipt,
  ForensicFalDispatchReceipt,
  ForensicUiBlueprintAuthority,
} from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import { FORENSIC_BLUEPRINT_GENERATION_FAILED } from '../p0vrTwinV30R8M2R5/constants.js';

export type ForensicUiBlueprintApiResponse = {
  ok?: boolean;
  error?: string;
  errorClass?: string;
  authority?: ForensicUiBlueprintAuthority;
  receipt?: ForensicBlueprintGenerationReceipt;
  dispatchReceipt?: ForensicFalDispatchReceipt;
  falRequestDispatched?: boolean;
  falRequestId?: string | null;
};

export class ForensicBlueprintGenerationClientError extends Error {
  readonly errorClass: string;
  readonly dispatchReceipt: ForensicFalDispatchReceipt | null;

  constructor(message: string, errorClass: string, dispatchReceipt: ForensicFalDispatchReceipt | null = null) {
    super(message);
    this.name = 'ForensicBlueprintGenerationClientError';
    this.errorClass = errorClass;
    this.dispatchReceipt = dispatchReceipt;
  }
}

export async function requestForensicUiBlueprintGeneration(input: {
  session: DesignPageAuthorityReviewSession;
  packageId: string;
  sourceActualHash: string;
  apiBase?: string;
  founderConfirmedSpend?: boolean;
}): Promise<{
  authority: ForensicUiBlueprintAuthority;
  receipt: ForensicBlueprintGenerationReceipt;
  dispatchReceipt: ForensicFalDispatchReceipt;
}> {
  const url =
    input.apiBase ?
      `${input.apiBase.replace(/\/$/, '')}/api/site00/twin-v3-forensic-ui-blueprint`
    : site00ClientApiUrl('/api/site00/twin-v3-forensic-ui-blueprint');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({
      action: 'GENERATE_FORENSIC_UI_BLUEPRINT',
      session: input.session,
      packageId: input.packageId,
      founderConfirmedSpend: input.founderConfirmedSpend ?? true,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as ForensicUiBlueprintApiResponse;
  if (!res.ok || !json.ok || !json.authority || !json.receipt) {
    throw new ForensicBlueprintGenerationClientError(
      json.error ?? FORENSIC_BLUEPRINT_GENERATION_FAILED,
      json.errorClass ?? json.error ?? FORENSIC_BLUEPRINT_GENERATION_FAILED,
      json.dispatchReceipt ?? null,
    );
  }

  const cacheKey = forensicBlueprintCacheKey({ actualHash: input.sourceActualHash });
  writeForensicBlueprintToCache(cacheKey, json.authority);

  return {
    authority: json.authority,
    receipt: json.receipt,
    dispatchReceipt: json.dispatchReceipt ?? {
      dispatchId: `client-missing-${Date.now()}`,
      packageId: input.packageId,
      actualHash: input.sourceActualHash,
      blueprintHash: null,
      endpoint: json.receipt.endpoint,
      promptVersion: json.receipt.promptVersion,
      createdAt: new Date().toISOString(),
      status: json.falRequestDispatched ? 'DISPATCHED' : 'FAILED',
      falRequestId: json.falRequestId ?? json.receipt.requestId,
    },
  };
}
