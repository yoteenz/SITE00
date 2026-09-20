import type { CaptureApiFetchResult } from './captureApiFetch.js';
import { formatCaptureTransportError } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/formatCaptureTransportError.js';

import { PAGE_CONCEPT_SIGN_IN_REQUIRED } from './pageConceptApiSession.js';

function humanizePageConceptApiError(status: number, apiError: string): string | null {
  const code = apiError.toUpperCase();
  if (status === 401 || code === 'UNAUTHORIZED') {
    return PAGE_CONCEPT_SIGN_IN_REQUIRED;
  }
  if (status === 403 || code === 'FOUNDER_ONLY') {
    return 'FOUNDER ONLY — this account cannot run page concept generation on the API host.';
  }
  return null;
}

export function throwPageConceptApiFailure<T>(
  result: CaptureApiFetchResult<T>,
  fallback: string,
): never {
  const apiError =
    result.data && typeof result.data === 'object' && 'error' in result.data ?
      String((result.data as { error?: string }).error ?? '').trim()
    : '';
  const receiptMessage = result.receipt.errorMessage?.trim();
  const friendly = humanizePageConceptApiError(result.status, apiError);
  throw new Error(
    friendly ||
      apiError ||
      receiptMessage ||
      (result.errorCode ? formatCaptureTransportError(result.errorCode) : fallback),
  );
}
