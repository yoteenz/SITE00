/**
 * P0.VR.2B — Register attached Design workspace as full visual authority.
 */

import {
  SITE00_DESIGN_WORKSPACE_AUTHORITY_ID,
  SITE00_DESIGN_WORKSPACE_REFERENCE_PATH,
} from './constants.js';
import type { Site00DesignWorkspaceVisualAuthority } from './types.js';
import { P0_VR_2B_LINEAGE } from './types.js';

export function getSite00DesignWorkspaceVisualAuthority(): Site00DesignWorkspaceVisualAuthority {
  return {
    authorityId: SITE00_DESIGN_WORKSPACE_AUTHORITY_ID,
    scope: 'FULL_WORKSPACE_REFERENCE',
    storagePath: SITE00_DESIGN_WORKSPACE_REFERENCE_PATH,
    desktopViewport: { width: 1440, height: 900 },
    mobileViewport: { width: 390, height: 844 },
    lineage: P0_VR_2B_LINEAGE,
  };
}

export function designWorkspaceFullReferenceAuthorityRegistered(): boolean {
  return Boolean(getSite00DesignWorkspaceVisualAuthority().storagePath);
}

export function desktopMobileDesignAuthorityIndependent(): boolean {
  const auth = getSite00DesignWorkspaceVisualAuthority();
  return auth.desktopViewport.width !== auth.mobileViewport.width;
}
