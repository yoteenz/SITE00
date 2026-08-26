/**
 * P0.VR.2B — Design workspace URL/deep-link state.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { DesignWorkspaceTab, DesignWorkspaceUrlState } from './types.js';

const VALID_TABS: DesignWorkspaceTab[] = ['REFERENCE', 'IMPLEMENTATION', 'COMPARE', 'HISTORY', 'INSPECT'];

export function parseDesignWorkspaceUrlState(search: string): Partial<DesignWorkspaceUrlState> {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const tab = params.get('tab')?.toUpperCase() as DesignWorkspaceTab | undefined;
  return {
    project: params.get('project') ?? undefined,
    screen: params.get('screen') ?? undefined,
    viewport: (params.get('viewport') as DesignViewportClass) ?? undefined,
    tab: tab && VALID_TABS.includes(tab) ? tab : undefined,
  };
}

export function buildDesignWorkspaceUrlState(state: DesignWorkspaceUrlState): string {
  const params = new URLSearchParams();
  params.set('project', state.project);
  params.set('screen', state.screen);
  params.set('viewport', state.viewport);
  params.set('tab', state.tab.toLowerCase());
  return `?${params.toString()}`;
}

export function designWorkspaceDeepLinkSupported(): boolean {
  return true;
}
