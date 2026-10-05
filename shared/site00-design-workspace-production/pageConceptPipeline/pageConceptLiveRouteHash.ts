/**
 * P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1 — live route immutability fingerprint.
 */

import type { PageConceptGenerationState } from './types.js';

export function computePageConceptLiveImplementationHash(state: PageConceptGenerationState): string {
  const route = state.functionContract?.route ?? state.pageContext?.route ?? '';
  const pageVersion = state.pageContext?.contextVersion ?? '';
  const fnVersion = state.functionContract?.version ?? '';
  const projectVersion = state.projectContext?.contextVersion ?? '';
  const captureSummary = state.pageContext?.currentCaptureSummary ?? '';
  const payload = [route, pageVersion, fnVersion, projectVersion, captureSummary].join('|');
  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash * 31 + payload.charCodeAt(i)) >>> 0;
  }
  return `live-${hash.toString(16)}`;
}

export function assertLiveRouteUnchanged(before: string, after: string): void {
  if (before !== after) {
    throw new Error(`LIVE_ROUTE_HASH_CHANGED: ${before} -> ${after}`);
  }
}
