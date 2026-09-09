/**
 * P0.VR.6 — Primary tab URL state for Design workspace.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { DesignWorkspacePrimaryTab, DesignWorkspacePrimaryUrlState } from './designWorkspaceUxTypes.js';
import { DESIGN_WORKSPACE_PRIMARY_TABS, normalizeDesignWorkspacePrimaryTab } from './designWorkspaceUxTypes.js';

export function parseDesignWorkspacePrimaryUrlState(search: string): Partial<DesignWorkspacePrimaryUrlState> {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const tabRaw = params.get('tab') ?? undefined;
  return {
    project: params.get('project') ?? undefined,
    screen: params.get('screen') ?? undefined,
    viewport: (params.get('viewport') as DesignViewportClass) ?? undefined,
    tab: tabRaw ? normalizeDesignWorkspacePrimaryTab(tabRaw) : undefined,
    assetStep: params.get('assetStep') ?? undefined,
  };
}

export function buildDesignWorkspacePrimaryUrlState(state: DesignWorkspacePrimaryUrlState): string {
  const params = new URLSearchParams();
  params.set('project', state.project);
  params.set('screen', state.screen);
  params.set('viewport', state.viewport);
  params.set('tab', state.tab.toLowerCase());
  if (state.assetStep) params.set('assetStep', state.assetStep);
  return `?${params.toString()}`;
}

export function isValidPrimaryTab(tab: string): tab is DesignWorkspacePrimaryTab {
  return DESIGN_WORKSPACE_PRIMARY_TABS.includes(tab as DesignWorkspacePrimaryTab);
}
