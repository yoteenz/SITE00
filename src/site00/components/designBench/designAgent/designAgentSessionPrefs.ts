/**
 * Session preferences shared between the twin shell and embedded Opus agent.
 */

import type { OpusNativeViewport } from '../../../../../shared/site00-opus-native/types';

export const DESIGN_AGENT_VIEW_MODE_KEY = 'site00:twin-opus-direct:view-mode:v1';
export const DESIGN_AGENT_VIEWPORT_KEY = 'site00:twin-opus-direct:viewport:v1';

export function readDesignAgentViewMode(): string {
  try {
    return window.sessionStorage.getItem(DESIGN_AGENT_VIEW_MODE_KEY) ?? 'canonical';
  } catch {
    return 'canonical';
  }
}

export function readDesignAgentViewport(): OpusNativeViewport {
  try {
    const stored = window.sessionStorage.getItem(DESIGN_AGENT_VIEWPORT_KEY);
    if (stored === 'MOBILE' || stored === 'TABLET' || stored === 'DESKTOP') return stored;
  } catch {
    /* session */
  }
  if (typeof window === 'undefined') return 'MOBILE';
  const width = window.innerWidth;
  if (width >= 1200) return 'DESKTOP';
  if (width >= 820) return 'TABLET';
  return 'MOBILE';
}

export function writeDesignAgentViewport(viewport: OpusNativeViewport): void {
  try {
    window.sessionStorage.setItem(DESIGN_AGENT_VIEWPORT_KEY, viewport);
    window.dispatchEvent(new CustomEvent('site00:design-viewport', { detail: { viewport } }));
  } catch {
    /* session preference */
  }
}
