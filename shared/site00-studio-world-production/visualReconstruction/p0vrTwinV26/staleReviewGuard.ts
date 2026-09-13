import type { DesignCompilerBundle } from './types.js';

export function assertNotStaleReview(input: {
  bundle: DesignCompilerBundle;
  uiBundleChecksum: string | null;
}): void {
  if (!input.uiBundleChecksum) return;
  if (input.uiBundleChecksum !== input.bundle.bundleChecksum.checksum) {
    throw new Error('STALE_REVIEW: UI bundle checksum does not match active concept bundle');
  }
  if (input.bundle.reviewVersionHeader?.stale) {
    throw new Error('STALE_REVIEW: review header marked stale');
  }
}

export function designCompilerCacheKey(input: {
  conceptVersionId: string;
  bundleChecksum: string;
  buildId: string | null;
}): string {
  return `${input.conceptVersionId}:${input.bundleChecksum}:${input.buildId ?? 'nobuild'}`;
}
