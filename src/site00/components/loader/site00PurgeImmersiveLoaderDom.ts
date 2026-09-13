import { clearLoadingScreenDocumentLock } from '../../../platform-stabilization/loadingScreenLock';

export const SITE00_IMMERSIVE_SESSION_COMPLETE_EVENT = 'site00-immersive-session-complete';

/** Remove full-screen loader layers that outlive React (Suspense portals, bfcache, boot shell). */
export function purgeSite00ImmersiveLoaderDom(reason?: string): void {
  if (typeof document === 'undefined') return;

  document.querySelectorAll('.site00-immersive-loader').forEach((el) => {
    el.remove();
  });

  document.documentElement.classList.remove('site00-assts-boot');

  const shell = document.getElementById('site00-assts-boot-shell');
  if (shell) {
    shell.hidden = true;
    shell.remove();
  }

  clearLoadingScreenDocumentLock();

  if (typeof window !== 'undefined' && reason) {
    window.dispatchEvent(
      new CustomEvent(SITE00_IMMERSIVE_SESSION_COMPLETE_EVENT, { detail: { reason } }),
    );
  }
}
