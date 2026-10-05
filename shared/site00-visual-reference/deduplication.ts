/**
 * Visual reference deduplication via fingerprint matching.
 */

import { createHash } from 'node:crypto';
import type { VisualReferenceRecord } from './types.js';

export function computeImageFingerprint(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 32);
}

export function computePageFingerprint(params: {
  route: string;
  viewportClass: string;
  sourceCommit: string | null;
  captureState: string;
}): string {
  const raw = [params.route, params.viewportClass, params.sourceCommit ?? 'unknown', params.captureState].join('|');
  return createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

export function findDuplicateReference(
  existing: VisualReferenceRecord[],
  candidate: {
    route: string;
    viewportClass: string;
    sourceCommit: string | null;
    imageFingerprint: string;
    captureState?: string;
  },
): VisualReferenceRecord | null {
  return (
    existing.find(
      (ref) =>
        ref.route === candidate.route &&
        ref.viewportClass === candidate.viewportClass &&
        ref.sourceCommit === candidate.sourceCommit &&
        ref.imageFingerprint === candidate.imageFingerprint &&
        ref.stalenessState !== 'SUPERSEDED',
    ) ?? null
  );
}

export function referenceCaptureKey(ref: Pick<VisualReferenceRecord, 'route' | 'viewportClass' | 'sourceCommit'>): string {
  return `${ref.route}:${ref.viewportClass}:${ref.sourceCommit ?? 'unknown'}`;
}
