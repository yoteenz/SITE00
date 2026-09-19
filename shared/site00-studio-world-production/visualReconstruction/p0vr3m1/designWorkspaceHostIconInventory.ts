/**
 * P0.VR.3M.1 — Host-shell icon audit inventory (legacy → SITE 00 canon).
 */

import type { DesignWorkspaceHostIconRecord } from './types.js';

export const DESIGN_WORKSPACE_HOST_ICON_INVENTORY: DesignWorkspaceHostIconRecord[] = [
  { controlId: 'notifications', legacySource: 'emoji-bell', currentSource: 'Site00BellIcon', replacementStatus: 'REPLACED' },
  { controlId: 'overflow', legacySource: 'unicode-ellipsis', currentSource: 'Site00MoreIcon', replacementStatus: 'REPLACED' },
  { controlId: 'brand-mark', legacySource: 'unicode-brackets', currentSource: 'Site00CrosshairIcon', replacementStatus: 'REPLACED' },
  { controlId: 'nav-design', legacySource: 'css-box-placeholder', currentSource: 'Site00LayersIcon', replacementStatus: 'REPLACED' },
  { controlId: 'nav-projects', legacySource: 'css-box-placeholder', currentSource: 'Site00ProjectsIcon', replacementStatus: 'REPLACED' },
  { controlId: 'nav-system', legacySource: 'css-box-placeholder', currentSource: 'Site00MonitorIcon', replacementStatus: 'REPLACED' },
  { controlId: 'nav-default', legacySource: 'css-box-placeholder', currentSource: 'Site00GlobeIcon', replacementStatus: 'REPLACED' },
];

export function designWorkspaceLegacyHostIconsReplaced(): boolean {
  return DESIGN_WORKSPACE_HOST_ICON_INVENTORY.every((row) => row.replacementStatus === 'REPLACED');
}
