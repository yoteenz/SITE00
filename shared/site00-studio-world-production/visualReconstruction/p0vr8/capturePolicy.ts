/**
 * P0.VR.8 — Default capture policy — viewport selection per page.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { getActiveCanonicalReference } from '../p0vr2/canonicalReferenceRegistry.js';
import type { ProjectPageRecord } from './types.js';

export function resolveCaptureViewportsForPage(page: ProjectPageRecord): DesignViewportClass[] {
  const required: DesignViewportClass[] = [];
  const mobileRef = getActiveCanonicalReference(page.projectId, page.screenId, 'mobile');
  if (mobileRef) required.push('mobile');
  else if (page.viewportAvailability.includes('mobile')) required.push('mobile');

  if (required.length) return required;

  return page.viewportAvailability.length ? page.viewportAvailability : ['mobile'];
}

export function shouldCaptureBeforeDeploy(awaitDeploy: boolean, deploymentReady: boolean): boolean {
  if (awaitDeploy && !deploymentReady) return false;
  return true;
}
