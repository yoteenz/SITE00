import type { DesignPageAuthorityReviewSession } from '../p0vrTwinV30/types.js';
import {
  forensicBlueprintCacheKey,
  writeForensicBlueprintToCache,
} from '../p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import type {
  ForensicBlueprintGenerationReceipt,
  ForensicFalDispatchReceipt,
  ForensicUiBlueprintAuthority,
} from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import {
  FORENSIC_API_NOT_DEPLOYED,
  FORENSIC_BLUEPRINT_GENERATION_FAILED,
} from '../p0vrTwinV30R8M2R5/constants.js';
import { listForensicUiBlueprintApiPostUrls } from './resolveForensicUiBlueprintApiUrl.js';

export type ForensicUiBlueprintApiResponse = {
  ok?: boolean;
  error?: string;
  errorClass?: string;
  authority?: ForensicUiBlueprintAuthority;
  receipt?: ForensicBlueprintGenerationReceipt;
  dispatchReceipt?: ForensicFalDispatchReceipt;
  falRequestDispatched?: boolean;
  falRequestId?: string | null;
  falKeyConfigured?: boolean;
};

export class ForensicBlueprintGenerationClientError extends Error {
  readonly errorClass: string;
  readonly dispatchReceipt: ForensicFalDispatchReceipt | null;
  readonly httpStatus: number | null;
  readonly apiUrl: string | null;

  constructor(
    message: string,
    errorClass: string,
    dispatchReceipt: ForensicFalDispatchReceipt | null = null,
    httpStatus: number | null = null,
    apiUrl: string | null = null,
  ) {
    super(message);
    this.name = 'ForensicBlueprintGenerationClientError';
    this.errorClass = errorClass;
    this.dispatchReceipt = dispatchReceipt;
    this.httpStatus = httpStatus;
    this.apiUrl = apiUrl;
  }
}

async function parseForensicApiResponse(res: Response): Promise<ForensicUiBlueprintApiResponse> {
  const text = await res.text();
  try {
    return JSON.parse(text) as ForensicUiBlueprintApiResponse;
  } catch {
    if (res.status === 404) {
      return { error: FORENSIC_API_NOT_DEPLOYED, errorClass: FORENSIC_API_NOT_DEPLOYED };
    }
    return { error: text.slice(0, 200) || FORENSIC_BLUEPRINT_GENERATION_FAILED };
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
  const urls = listForensicUiBlueprintApiPostUrls(input.apiBase);
  let lastMessage: string = FORENSIC_BLUEPRINT_GENERATION_FAILED;
  let lastClass: string = FORENSIC_BLUEPRINT_GENERATION_FAILED;
  let lastStatus: number | null = null;
  let lastUrl: string | null = null;

  for (const url of urls) {
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

    const json = await parseForensicApiResponse(res);
    lastStatus = res.status;
    lastUrl = url;

    if (res.status === 404) {
      lastMessage = `${FORENSIC_API_NOT_DEPLOYED} (${url})`;
      lastClass = FORENSIC_API_NOT_DEPLOYED;
      continue;
    }

    if (!res.ok || !json.ok || !json.authority || !json.receipt) {
      const errText = json.error ?? json.errorClass ?? FORENSIC_BLUEPRINT_GENERATION_FAILED;
      if (errText.includes('FAL_KEY')) {
        lastMessage = `${errText} — configure FAL_KEY on api.site00.com (Railway) or Cloud preview secrets.`;
        lastClass = errText;
      } else {
        lastMessage = errText;
        lastClass = json.errorClass ?? errText;
      }
      if (res.status >= 500 && urls.indexOf(url) < urls.length - 1) continue;
      throw new ForensicBlueprintGenerationClientError(
        lastMessage,
        lastClass,
        json.dispatchReceipt ?? null,
        res.status,
        url,
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

  throw new ForensicBlueprintGenerationClientError(lastMessage, lastClass, null, lastStatus, lastUrl);
}
