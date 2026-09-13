import { isSite00PreviewTunnelHost } from './site00PreviewHost';
import { markSite00ImmersiveComplete } from './site00LoaderSession';
import { releaseSite00ImmersiveBootRoot, teardownSite00ImmersiveBootShell } from './site00LoaderBoot';

/** Drop HTML boot shell as soon as React is alive (independent of cinematic gate). */
export function teardownSite00BootShellAfterReactMount(): void {
  if (typeof document === 'undefined') return;
  releaseSite00ImmersiveBootRoot();
  teardownSite00ImmersiveBootShell();
  markSite00ImmersiveComplete();
}

/** Preview / tunnel hosts skip cinematic gate entirely — avoid hanging ASSEMBLING on mobile. */
export function shouldBypassImmersiveColdStartGate(): boolean {
  return isSite00PreviewTunnelHost();
}

export const SITE00_FORCE_REVEAL_LOADER_EVENT = 'site00-force-reveal-loader';

export function dispatchSite00ForceRevealLoader(reason: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SITE00_FORCE_REVEAL_LOADER_EVENT, { detail: { reason } }));
}
