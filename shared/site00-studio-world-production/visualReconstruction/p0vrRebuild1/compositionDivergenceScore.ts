/**
 * P0.VR.REBUILD.1 — Compare current DOM stack vs authority blueprint order.
 */

import type { CompositionDivergenceScore } from './types.js';

export const NDX_LEGACY_OVERVIEW_STACK = [
  'legacy-hero-copy',
  'legacy-kpi-grid',
  'legacy-production-cards',
  'legacy-radar-list',
] as const;

export function scoreCompositionDivergence(input: {
  currentStack: readonly string[];
  authorityStack: readonly string[];
}): CompositionDivergenceScore {
  const current = input.currentStack;
  const authority = input.authorityStack;
  const regionCountDelta = Math.abs(current.length - authority.length);

  let orderMismatch = 0;
  const overlap = current.filter((id) => authority.includes(id));
  for (let i = 0; i < overlap.length; i++) {
    const curIdx = current.indexOf(overlap[i]!);
    const authIdx = authority.indexOf(overlap[i]!);
    orderMismatch += Math.abs(curIdx - authIdx);
  }
  orderMismatch += Math.max(0, current.length - overlap.length) * 2;
  orderMismatch += Math.max(0, authority.length - overlap.length) * 2;

  const hierarchyMismatch = regionCountDelta > 2 ? 2 : regionCountDelta;
  const layoutModeMismatch = current.join('|') === authority.join('|') ? 0 : 1;
  const persistentControlMismatch =
    authority.some((r) => r.includes('nav') || r.includes('bottom')) &&
    !current.some((r) => r.includes('nav'))
      ? 1
      : 0;
  const dominantRegionMismatch = current[0] !== authority[0];

  const raw =
    regionCountDelta * 8 +
    orderMismatch * 5 +
    hierarchyMismatch * 6 +
    layoutModeMismatch * 12 +
    persistentControlMismatch * 10 +
    (dominantRegionMismatch ? 15 : 0);

  const score = Math.min(100, raw);
  let status: CompositionDivergenceScore['status'] = 'LOW';
  if (score >= 45) status = 'HIGH';
  else if (score >= 22) status = 'MEDIUM';

  return {
    score,
    regionCountDelta,
    orderMismatch,
    hierarchyMismatch,
    layoutModeMismatch,
    persistentControlMismatch,
    dominantRegionMismatch,
    status,
  };
}
