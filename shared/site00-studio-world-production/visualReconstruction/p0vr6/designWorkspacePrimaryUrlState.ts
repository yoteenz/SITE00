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
    pagesStep: params.get('pagesStep') ?? undefined,
    skinsStep: params.get('skinsStep') ?? undefined,
    moreCategory: params.get('moreCategory') ?? undefined,
    pageId: params.get('pageId') ?? undefined,
  };
}

export function buildDesignWorkspacePrimaryUrlState(state: DesignWorkspacePrimaryUrlState): string {
  const params = new URLSearchParams();
  params.set('project', state.project);
  params.set('screen', state.screen);
  params.set('viewport', state.viewport);
  params.set('tab', state.tab.toLowerCase());
  if (state.assetStep) params.set('assetStep', state.assetStep);
  if (state.pagesStep) params.set('pagesStep', state.pagesStep);
  if (state.skinsStep) params.set('skinsStep', state.skinsStep);
  if (state.moreCategory) params.set('moreCategory', state.moreCategory);
  if (state.pageId) params.set('pageId', state.pageId);
  return `?${params.toString()}`;
}

export function isValidPrimaryTab(tab: string): tab is DesignWorkspacePrimaryTab {
  return DESIGN_WORKSPACE_PRIMARY_TABS.includes(tab as DesignWorkspacePrimaryTab);
}
