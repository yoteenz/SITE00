import type { HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroConvergenceLimitClass } from './types.js';

export function classifyHeroLimit(objectId: HeroObjectId, delta: HeroGeometryDeltaFull): HeroConvergenceLimitClass {
  if (objectId === 'H02' || objectId === 'H04' || objectId === 'H11') {
    if (Math.abs(delta.baselineError) > 1) return 'FONT_METRIC_LIMIT';
  }
  if (objectId === 'H06' || objectId === 'H12') return 'ASSET_CROP_LIMIT';
  if (objectId === 'H08') return 'CSS_LAYOUT_DEPENDENCY';
  if (objectId === 'H13') return 'BLUEPRINT_MEASUREMENT_LIMIT';
  const max = Math.max(
    Math.abs(delta.deltaX),
    Math.abs(delta.deltaY),
    Math.abs(delta.deltaWidth),
    Math.abs(delta.deltaHeight),
  );
  if (max <= 4) return 'BROWSER_RENDERING_LIMIT';
  return 'UNKNOWN';
}
