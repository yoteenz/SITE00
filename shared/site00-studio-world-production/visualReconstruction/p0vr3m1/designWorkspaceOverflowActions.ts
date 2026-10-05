/**
 * P0.VR.3M.1 — Real Design workspace overflow menu actions (no fake commands).
 */

import type { DesignWorkspaceTab } from '../p0vr2b/types.js';
import type { DesignWorkspaceOverflowAction } from './types.js';

export function buildDesignWorkspaceOverflowActions(input: {
  projectId: string;
  route: string;
  livePreviewUrl: string;
  tab: DesignWorkspaceTab;
  capturing: boolean;
}): DesignWorkspaceOverflowAction[] {
  return [
    {
      id: 'capture_implementation',
      label: 'CAPTURE IMPLEMENTATION',
      enabled: !input.capturing,
      disabledReason: input.capturing ? 'Capture in progress' : undefined,
    },
    {
      id: 'open_live_route',
      label: 'OPEN LIVE ROUTE',
      enabled: Boolean(input.livePreviewUrl),
      externalHref: input.livePreviewUrl,
    },
    {
      id: 'copy_design_link',
      label: 'COPY DESIGN LINK',
      enabled: true,
    },
    {
      id: 'open_review_tab',
      label: 'OPEN REVIEW TAB',
      enabled: input.tab !== 'REVIEW',
      disabledReason: input.tab === 'REVIEW' ? 'Already on Review' : undefined,
    },
    {
      id: 'open_pages_tab',
      label: 'OPEN PAGES INDEX',
      enabled: input.tab !== 'PAGES',
      disabledReason: input.tab === 'PAGES' ? 'Already on Pages' : undefined,
    },
    {
      id: 'open_inspect_tab',
      label: 'OPEN INSPECT',
      enabled: input.tab !== 'INSPECT',
      disabledReason: input.tab === 'INSPECT' ? 'Already on Inspect' : undefined,
    },
  ];
}
