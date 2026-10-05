import type { HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';

export function visibleMismatchHint(objectId: HeroObjectId, delta: HeroGeometryDeltaFull): string {
  const parts: string[] = [];
  if (Math.abs(delta.deltaY) > 2) parts.push('vertical drift');
  if (Math.abs(delta.deltaX) > 2) parts.push('horizontal drift');
  if (Math.abs(delta.deltaWidth) > 2 || Math.abs(delta.deltaHeight) > 2) parts.push('size mismatch');
  const byObject: Partial<Record<HeroObjectId, string>> = {
    H01: 'entry label stack',
    H02: 'headline block',
    H03: 'lime accent line',
    H04: 'supporting copy',
    H05: 'CTA placement',
    H06: 'center media column',
    H08: 'NDX overlay scale/anchor',
    H09: 'right utility column width',
    H10: 'reticle center',
    H11: '00 label cell',
    H12: 'lower-right photo slot',
    H13: 'internal grid lines',
    H14: 'hero root height/width',
  };
  const role = byObject[objectId] ?? objectId;
  return parts.length ? `${role}: ${parts.join(', ')}` : `${role}: sub-pixel tolerance edge`;
}
