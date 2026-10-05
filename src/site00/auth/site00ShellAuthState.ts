import { isSite00CloudPreviewBuild, isSite00PreviewTunnelHost } from '../components/loader/site00PreviewHost';
import { isSignedIn } from '../../utils/adminAuth';

export type Site00ShellAuthMode = 'AUTHENTICATED' | 'PREVIEW_GUEST' | 'SIGNED_OUT' | 'AUTH_LOADING';

export type Site00ShellAccess = {
  authMode: Site00ShellAuthMode;
  canRenderStudioShell: boolean;
  canUseExperienceCompiler: boolean;
  canNavigateStudioPreview: boolean;
  canReadProtectedProjectData: boolean;
  canMutateProtectedProjectData: boolean;
  persistenceDegraded: boolean;
};

const PREVIEW_GUEST_COMPILER = /^\/studio\/[^/]+\/experience-compiler\/?$/;
const PREVIEW_GUEST_STUDIO_LANDING = /^\/studio\/[^/]+\/preview-guest\/?$/;

/** Non-production gate — must be `1` at build time (cloud preview builds only). */
export function isSite00EcPreviewGuestBuildEnabled(): boolean {
  return import.meta.env.VITE_SITE00_EC_PREVIEW_GUEST === '1';
}

/** Host / preview-dist gate — tunnel or cloud-preview meta; never production site00.com alone. */
export function isSite00EcPreviewGuestHostAllowed(): boolean {
  return isSite00CloudPreviewBuild() || isSite00PreviewTunnelHost();
}

export function isSite00EcPreviewGuestFeatureActive(): boolean {
  return isSite00EcPreviewGuestBuildEnabled() && isSite00EcPreviewGuestHostAllowed();
}

export function isSite00PreviewGuestAllowlistedPath(pathname: string): boolean {
  return PREVIEW_GUEST_COMPILER.test(pathname) || PREVIEW_GUEST_STUDIO_LANDING.test(pathname);
}

export function resolveSite00ShellAuthMode(
  pathname: string,
  options?: { authLoading?: boolean; previewGuestForce?: boolean },
): Site00ShellAuthMode {
  if (options?.authLoading) return 'AUTH_LOADING';
  if (isSignedIn()) return 'AUTHENTICATED';
  const previewEligible =
    options?.previewGuestForce ??
    (isSite00EcPreviewGuestFeatureActive() && isSite00PreviewGuestAllowlistedPath(pathname));
  if (previewEligible) return 'PREVIEW_GUEST';
  return 'SIGNED_OUT';
}

export function deriveSite00ShellAccess(authMode: Site00ShellAuthMode): Site00ShellAccess {
  const authenticated = authMode === 'AUTHENTICATED';
  const previewGuest = authMode === 'PREVIEW_GUEST';
  const persistenceDegraded = previewGuest;

  return {
    authMode,
    canRenderStudioShell: authenticated || previewGuest,
    canUseExperienceCompiler: authenticated || previewGuest,
    canNavigateStudioPreview: authenticated || previewGuest,
    canReadProtectedProjectData: authenticated,
    canMutateProtectedProjectData: authenticated,
    persistenceDegraded,
  };
}
