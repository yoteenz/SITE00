import type { ReferenceCropKey } from '../../../../../shared/site00-astral-world/referenceCropRegistry.js';
import { DESTINATION_CROP_KEYS } from '../../../../../shared/site00-astral-world/referenceCropRegistry.js';

export function destinationCropKeys(slug: string): { desktop: ReferenceCropKey; mobile: ReferenceCropKey } {
  const hit = DESTINATION_CROP_KEYS[slug as keyof typeof DESTINATION_CROP_KEYS];
  if (hit) return hit;
  return { desktop: 'ASTREA_DISTRICT', mobile: 'ASTREA_DISTRICT_MOBILE' };
}

export function personDisplay(
  id: string,
  lookup: Map<string, { name: string; initials?: string }>,
): { name: string; initials?: string } {
  const found = lookup.get(id);
  if (found) return found;
  return { name: id.replace(/-/g, ' '), initials: id.slice(0, 2).toUpperCase() };
}
