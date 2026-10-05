import type { HeroRenderedGeometryFull } from '../p0vrReplication4R3/types.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';

function parsePx(value: string | undefined): number {
  if (!value) return 0;
  return Number.parseFloat(value) || 0;
}

/** Test-only: apply cumulative nudge vars to rendered rects (approximates live CSS nudge). */
export function applySimulatedHeroNudge(
  rendered: HeroRenderedGeometryFull[],
  cssPatch: Record<string, string>,
): HeroRenderedGeometryFull[] {
  return rendered.map((r) => {
    const id = r.objectId as HeroObjectId;
    const dx = parsePx(cssPatch[`--hero-nudge-${id}-x`]);
    const dy = parsePx(cssPatch[`--hero-nudge-${id}-y`]);
    const dw = parsePx(cssPatch[`--hero-nudge-${id}-w`]);
    const dh = parsePx(cssPatch[`--hero-nudge-${id}-h`]);
    if (!dx && !dy && !dw && !dh) return r;
    const x = r.actualX + dx;
    const y = r.actualY + dy;
    const w = Math.max(0, r.actualWidth + dw);
    const h = Math.max(0, r.actualHeight + dh);
    return {
      ...r,
      actualX: x,
      actualY: y,
      actualWidth: w,
      actualHeight: h,
      actualLeft: x,
      actualRight: x + w,
      actualTop: y,
      actualBottom: y + h,
      actualCenterX: x + w / 2,
      actualCenterY: y + h / 2,
    };
  });
}
