import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../constants.js';
import type { MobileBlueprintTwinVisual } from './types.js';
import {
  isFounderCanonicalLightBlueprintUri,
  NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT,
} from './ndxbookLightBlueprintMount.js';

/** URI shown in Design compare slots (mobile + desktop viewport). */
export function resolveMobileTwinBlueprintDisplayUri(
  projectId: string,
  blueprint: MobileBlueprintTwinVisual | null | undefined,
): string | null {
  if (!blueprint) {
    return projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID ?
        NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT
      : null;
  }
  if (projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID) {
    if (isFounderCanonicalLightBlueprintUri(blueprint.twinImageUri)) {
      return blueprint.twinImageUri;
    }
    return NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT;
  }
  return blueprint.twinImageUri ?? null;
}
