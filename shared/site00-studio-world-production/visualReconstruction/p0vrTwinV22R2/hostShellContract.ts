import { HOST_SHELL_COMPONENT_REFS, P0_VR_TWIN_V22R2_BUILD } from './constants.js';
import type { HostShellContract } from './types.js';

/** Canonical SITE 00 host shell — real components, not generated pixels. */
export function buildDefaultNdxbookMobileHostShellContract(): HostShellContract {
  return {
    hostHeaderComponent: HOST_SHELL_COMPONENT_REFS.hostHeader,
    hostBottomNavComponent: HOST_SHELL_COMPONENT_REFS.hostBottomNav,
    globalControls: ['account', 'notifications', 'global-menu', 'host-wordmark'],
    safeAreaRules: { topInsetNorm: 0.07, bottomInsetNorm: 0.12 },
    pageMountPoint: HOST_SHELL_COMPONENT_REFS.clientMountRoot,
    clientCanvasInsets: { top: 0.07, bottom: 0.12, left: 0, right: 0 },
    persistentBehavior: 'Host chrome persists; NDXBOOK client canvas scrolls between insets',
    version: P0_VR_TWIN_V22R2_BUILD,
    status: 'LOCKED',
  };
}
