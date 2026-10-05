/**
 * P0.VR.PAGE-CONCEPT-CAPTURE-READINESS-UNIFICATION1 — stable package fingerprint for Mobile/Desktop parity tests.
 */

import { getPageConceptSourceCaptures } from '../designPageCapture.js';
import { resolveDesignPageIdentity } from '../designPageIdentity.js';
import { validatePageConceptSourceCaptures } from './pageConceptSourceCaptureValidation.js';

export type PageConceptGenerationPackageFingerprint = {
  projectId: string;
  pageId: string;
  canonicalPageId: string;
  mobileCaptureId: string | null;
  desktopCaptureId: string | null;
  mobileArtifactRef: string | null;
  desktopArtifactRef: string | null;
};

export function buildPageConceptGenerationPackageFingerprint(input: {
  projectSlug: string;
  pageId: string;
  screenId: string;
  route?: string | null;
}): PageConceptGenerationPackageFingerprint {
  const identity = resolveDesignPageIdentity({
    projectSlug: input.projectSlug,
    pageId: input.pageId,
    screenId: input.screenId,
    route: input.route,
  });
  const validation = validatePageConceptSourceCaptures(identity.projectId, identity.canonicalPageId);
  const resolved = getPageConceptSourceCaptures(identity.projectId, identity.registryPageId);
  return {
    projectId: identity.projectId,
    pageId: identity.registryPageId,
    canonicalPageId: identity.canonicalPageId,
    mobileCaptureId: resolved.mobile?.captureId ?? validation.mobile.captureId,
    desktopCaptureId: resolved.desktop?.captureId ?? validation.desktop.captureId,
    mobileArtifactRef: validation.mobile.artifactRef,
    desktopArtifactRef: validation.desktop.artifactRef,
  };
}

export function assertPageConceptGenerationPackageParity(
  a: PageConceptGenerationPackageFingerprint,
  b: PageConceptGenerationPackageFingerprint,
): void {
  const same =
    a.projectId === b.projectId &&
    a.pageId === b.pageId &&
    a.canonicalPageId === b.canonicalPageId &&
    a.mobileCaptureId === b.mobileCaptureId &&
    a.desktopCaptureId === b.desktopCaptureId &&
    a.mobileArtifactRef === b.mobileArtifactRef &&
    a.desktopArtifactRef === b.desktopArtifactRef;
  if (!same && import.meta.env?.DEV) {
    console.error('PAGE_CONCEPT_PACKAGE_PARITY_FAILURE', { a, b });
  }
}
