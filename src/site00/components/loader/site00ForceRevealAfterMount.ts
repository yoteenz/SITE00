import { isSite00PreviewTunnelHost } from './site00PreviewHost';
import { releaseSite00ImmersiveBootRoot, teardownSite00ImmersiveBootShell } from './site00LoaderBoot';
import { purgeSite00ImmersiveLoaderDom } from './site00PurgeImmersiveLoaderDom';

/** Drop HTML boot shell as soon as React is alive (independent of cinematic gate). */
export function teardownSite00BootShellAfterReactMount(): void {
  if (typeof document === 'undefined') return;
  releaseSite00ImmersiveBootRoot();
  teardownSite00ImmersiveBootShell();
  document.documentElement.classList.remove('site00-assts-boot');
}

/** Preview / tunnel hosts skip cinematic gate entirely — avoid hanging ASSEMBLING on mobile. */
export function shouldBypassImmersiveColdStartGate(): boolean {
  return isSite00PreviewTunnelHost();
}

export const SITE00_FORCE_REVEAL_LOADER_EVENT = 'site00-force-reveal-loader';

export function dispatchSite00ForceRevealLoader(reason: string): void {
  if (typeof window === 'undefined') return;
  purgeSite00ImmersiveLoaderDom(reason);
  window.dispatchEvent(new CustomEvent(SITE00_FORCE_REVEAL_LOADER_EVENT, { detail: { reason } }));
}
