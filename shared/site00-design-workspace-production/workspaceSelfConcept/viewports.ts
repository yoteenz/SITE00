/**
 * WORKSPACE_SELF capture viewports — aligned with DESIGN bench QA (not inline in capture logic).
 */

import { getViewportSpec } from '../../site00-visual-reference/viewportConfig.js';

export type WorkspaceSelfCaptureViewport = 'MOBILE' | 'DESKTOP';

export type WorkspaceSelfViewportSpec = {
  viewport: WorkspaceSelfCaptureViewport;
  width: number;
  height: number;
  deviceScaleFactor: number;
};

/** DESIGN self-capture desktop uses bench QA height (1440×1024), not marketing DESKTOP 900px. */
export const WORKSPACE_SELF_DESKTOP_CAPTURE: WorkspaceSelfViewportSpec = {
  viewport: 'DESKTOP',
  width: 1440,
  height: 1024,
  deviceScaleFactor: 1,
};

export function workspaceSelfViewportSpec(viewport: WorkspaceSelfCaptureViewport): WorkspaceSelfViewportSpec {
  if (viewport === 'DESKTOP') return WORKSPACE_SELF_DESKTOP_CAPTURE;
  const mobile = getViewportSpec('MOBILE');
  return {
    viewport: 'MOBILE',
    width: mobile.width,
    height: mobile.height,
    deviceScaleFactor: mobile.deviceScaleFactor,
  };
}
