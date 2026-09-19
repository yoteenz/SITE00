import type { HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroOutlierRankEntry } from './types.js';

const COLUMN_IMPACT: Partial<Record<HeroObjectId, number>> = {
  H14: 4,
  H06: 3.5,
  H09: 3,
  H08: 2.5,
  H12: 2,
};

function visualSeverityFor(delta: HeroGeometryDeltaFull): number {
  const pos = Math.max(Math.abs(delta.deltaX), Math.abs(delta.deltaY));
  const size = Math.max(Math.abs(delta.deltaWidth), Math.abs(delta.deltaHeight));
  const raw = Math.max(pos, size);
  if (delta.severity === 'RED') return raw + 6;
  if (delta.severity === 'YELLOW') return raw + 2;
  return raw * 0.35;
}

function impactScore(objectId: HeroObjectId, delta: HeroGeometryDeltaFull): number {
  const base = COLUMN_IMPACT[objectId] ?? 1;
  const neighbor =
    objectId === 'H10' || objectId === 'H11' || objectId === 'H12' ? 1.4 : objectId.startsWith('H0') ? 1.1 : 1;
  return base * neighbor * (visualSeverityFor(delta) + 1);
}

export type HeroOutlierRanking = HeroOutlierRankEntry[];

export function rankHeroOutliers(deltas: HeroGeometryDeltaFull[]): HeroOutlierRanking {
  const entries: HeroOutlierRankEntry[] = deltas
    .filter((d) => d.objectId !== 'H07' && d.status === 'OUT_OF_TOLERANCE')
    .map((delta) => {
      const positionError = Math.max(Math.abs(delta.deltaX), Math.abs(delta.deltaY));
      const sizeError = Math.max(Math.abs(delta.deltaWidth), Math.abs(delta.deltaHeight));
      return {
        objectId: delta.objectId as HeroObjectId,
        visualSeverity: visualSeverityFor(delta),
        positionError,
        sizeError,
        impactScore: impactScore(delta.objectId as HeroObjectId, delta),
        delta,
      };
    });

  return entries.sort((a, b) => {
    if (b.visualSeverity !== a.visualSeverity) return b.visualSeverity - a.visualSeverity;
    if (b.positionError !== a.positionError) return b.positionError - a.positionError;
    if (b.sizeError !== a.sizeError) return b.sizeError - a.sizeError;
    return b.impactScore - a.impactScore;
  });
}
