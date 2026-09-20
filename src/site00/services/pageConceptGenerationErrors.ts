import type { CaptureApiFetchResult } from './captureApiFetch.js';
import { formatCaptureTransportError } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/formatCaptureTransportError.js';

export function throwPageConceptApiFailure<T>(
  result: CaptureApiFetchResult<T>,
  fallback: string,
): never {
  const apiError =
    result.data && typeof result.data === 'object' && 'error' in result.data ?
      String((result.data as { error?: string }).error ?? '').trim()
    : '';
  const receiptMessage = result.receipt.errorMessage?.trim();
  throw new Error(
    apiError ||
      receiptMessage ||
      (result.errorCode ? formatCaptureTransportError(result.errorCode) : fallback),
  );
}
