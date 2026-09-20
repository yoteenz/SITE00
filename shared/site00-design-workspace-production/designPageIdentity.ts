/**
 * P0.VR.PAGE-CONCEPT-SOURCE-CAPTURE-RESOLUTION-FIX1 — one canonical page identity
 * for CAPTURE SCREEN writes and page-concept GENERATE reads.
 */

import { canonicalDesignPageCapturePageId } from './designPageCapture.js';
import { getDesignBoundPage } from './designProjectBinding/designPageRegistry.js';

export type DesignPageIdentity = {
  projectId: string;
  projectSlug: string;
  /** Active target from DESIGN shell / session (registry page id). */
  registryPageId: string;
  /** Bucket key used by page capture localStorage after canonicalization. */
  canonicalPageId: string;
  screenId: string;
  route: string;
  canonicalRoute: string;
};

export function resolveDesignPageIdentity(input: {
  projectSlug: string;
  pageId: string;
  screenId: string;
  route?: string | null;
}): DesignPageIdentity {
  const projectSlug = input.projectSlug.trim().toLowerCase();
  const projectId = projectSlug;
  const registryPageId = input.pageId.trim();
  const canonicalPageId = canonicalDesignPageCapturePageId(projectId, registryPageId);
  const page =
    getDesignBoundPage(projectId, registryPageId) ?? getDesignBoundPage(projectId, canonicalPageId);
  const route = (input.route?.trim() || page?.route || '').trim();
  const canonicalRoute = page?.route?.trim() || route;
  return {
    projectId,
    projectSlug,
    registryPageId,
    canonicalPageId,
    screenId: input.screenId.trim(),
    route,
    canonicalRoute,
  };
}

/** True when two page ids refer to the same capture bucket (overview aliases, legacy keys). */
export function designPageIdsEquivalent(projectId: string, pageIdA: string, pageIdB: string): boolean {
  return (
    canonicalDesignPageCapturePageId(projectId, pageIdA) ===
    canonicalDesignPageCapturePageId(projectId, pageIdB)
  );
}

export function designPageCaptureEventMatches(
  projectId: string,
  activeRegistryPageId: string,
  detail: { projectId?: string; pageId?: string } | null | undefined,
): boolean {
  if (!detail?.projectId || detail.projectId !== projectId) return false;
  if (!detail.pageId) return true;
  return designPageIdsEquivalent(projectId, activeRegistryPageId, detail.pageId);
}
