/**
 * B5.9R4 — Evolve internal subshell tab contract (NDXBOOK primary nav).
 */

import type { NDXIconName } from '../../site00-studio-world-ui/icons/index.js';

export type EvolveSubshellTabId = 'CAMPAIGNS' | 'CONTENT_OPS' | 'LAB' | 'MORE';

export type EvolveSubshellTab = {
  id: EvolveSubshellTabId;
  label: string;
  icon: NDXIconName;
  mobileScreenId: string;
  routeSegment: string;
};

export type EvolveMoreItem = {
  id: string;
  label: string;
  icon: NDXIconName;
  href: string;
  mobileScreenId?: string;
};

export const EVOLVE_SUBSHELL_TAB_SEGMENTS: Record<EvolveSubshellTabId, string> = {
  CAMPAIGNS: 'campaigns',
  CONTENT_OPS: 'content-ops',
  LAB: 'lab',
  MORE: 'more',
};

/** Approved bottom-nav icon asset paths (canonical SVG registry). */
export const EVOLVE_SUBSHELL_ICON_ASSETS = {
  CAMPAIGNS: 'shared/site00-studio-world-ui/icons/ndx/v3/campaigns.svg',
  CONTENT_OPS: 'shared/site00-studio-world-ui/icons/ndx/v3/content-ops.svg',
  LAB: 'shared/site00-studio-world-ui/icons/ndx/v3/lab.svg',
  MORE: 'shared/site00-studio-world-ui/icons/ndx/v3/more.svg',
} as const;

export const EVOLVE_SUBSHELL_ICON_NAMES: Record<EvolveSubshellTabId, NDXIconName> = {
  CAMPAIGNS: 'campaigns',
  CONTENT_OPS: 'content_ops',
  LAB: 'lab',
  MORE: 'more',
};
