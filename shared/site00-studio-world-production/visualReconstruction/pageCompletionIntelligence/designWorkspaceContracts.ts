/**
 * Design workspace page experience contracts — SKINS / PAGES / ASSETS / tabs.
 */

import type { PageAffordanceType } from './types.js';

export const DESIGN_WORKSPACE_PRIMARY_TABS = [
  'REFERENCES',
  'ASSETS',
  'PAGES',
  'SKINS',
  'HISTORY',
  'MORE',
] as const;

export type DesignWorkspaceTab = (typeof DESIGN_WORKSPACE_PRIMARY_TABS)[number];

export function buildDesignWorkspaceTabContracts(_pageId: string): Array<{
  label: string;
  affordanceType: PageAffordanceType;
  regionId: string;
  intent: string;
}> {
  return DESIGN_WORKSPACE_PRIMARY_TABS.map((tab) => ({
    label: tab,
    affordanceType: 'TAB' as const,
    regionId: `dw-tab-${tab.toLowerCase()}`,
    intent: 'TAB_SWITCH',
  }));
}

export function buildDesignSkinsPageContracts(pageId: string): Array<{
  label: string;
  affordanceType: PageAffordanceType;
  regionId: string;
  intent: string;
}> {
  return [
    ...buildDesignWorkspaceTabContracts(pageId),
    ...buildProjectSelectorContracts(pageId),
    { label: 'ADD AUTHORITY', affordanceType: 'BUTTON', regionId: 'skins-add-authority', intent: 'OPEN_ADD_AUTHORITY_WORKSPACE' },
    { label: 'OPEN SCREEN', affordanceType: 'BUTTON', regionId: 'skins-open-screen', intent: 'OPEN_SCREEN_DETAIL' },
    { label: 'MATCH REFERENCE', affordanceType: 'BUTTON', regionId: 'skins-match-ref', intent: 'TRIGGER_IMPLEMENTATION' },
    { label: 'REVIEW CROPS', affordanceType: 'BUTTON', regionId: 'skins-review-crops', intent: 'OPEN_CROP_REVIEW' },
    { label: 'REVIEW PLAN', affordanceType: 'BUTTON', regionId: 'skins-review-plan', intent: 'OPEN_GENERATION_PLAN' },
    { label: 'MOBILE', affordanceType: 'TOGGLE', regionId: 'skins-viewport-mobile', intent: 'TOGGLE_VIEWPORT' },
    { label: 'DESKTOP', affordanceType: 'TOGGLE', regionId: 'skins-viewport-desktop', intent: 'TOGGLE_VIEWPORT' },
    { label: 'VIEW ALL', affordanceType: 'LINK', regionId: 'skins-view-all', intent: 'OPEN_COLLECTION_VIEW' },
  ];
}

export function buildDesignAssetsPageContracts(pageId: string): Array<{
  label: string;
  affordanceType: PageAffordanceType;
  regionId: string;
  intent: string;
}> {
  return [
    ...buildDesignWorkspaceTabContracts(pageId),
    { label: 'REVIEW CROPS', affordanceType: 'BUTTON', regionId: 'assets-review-crops', intent: 'OPEN_CROP_REVIEW' },
    { label: 'UPLOAD REFERENCE', affordanceType: 'UPLOAD', regionId: 'assets-upload', intent: 'OPEN_UPLOAD_FLOW' },
    { label: 'VIEW JOB', affordanceType: 'BUTTON', regionId: 'assets-view-job', intent: 'OPEN_DETAIL_VIEW' },
  ];
}

export function buildDesignPagesTabContracts(pageId: string): Array<{
  label: string;
  affordanceType: PageAffordanceType;
  regionId: string;
  intent: string;
}> {
  return [
    ...buildDesignWorkspaceTabContracts(pageId),
    { label: 'SEARCH PAGES', affordanceType: 'SEARCH', regionId: 'pages-search', intent: 'OPEN_SEARCH' },
    { label: 'REFRESH PROJECT', affordanceType: 'BUTTON', regionId: 'pages-refresh', intent: 'TRIGGER_IMPLEMENTATION' },
    { label: 'OPEN PAGE', affordanceType: 'BUTTON', regionId: 'pages-open', intent: 'OPEN_SCREEN_DETAIL' },
  ];
}

export function buildProjectSelectorContracts(_pageId: string): Array<{
  label: string;
  affordanceType: PageAffordanceType;
  regionId: string;
  intent: string;
}> {
  return [
    {
      label: 'PROJECT SELECTOR',
      affordanceType: 'DROPDOWN',
      regionId: 'dw-project-selector',
      intent: 'PROJECT_SCOPE_SWITCH',
    },
  ];
}

export function resolveDesignPageContractSet(pageId: string, screenType?: string) {
  const id = (screenType ?? pageId).toUpperCase();
  if (id.includes('SKINS') || pageId.includes('skins')) return buildDesignSkinsPageContracts(pageId);
  if (id.includes('ASSETS') || pageId.includes('assets')) return buildDesignAssetsPageContracts(pageId);
  if (id.includes('PAGES') || pageId.includes('pages')) return buildDesignPagesTabContracts(pageId);
  return [...buildDesignWorkspaceTabContracts(pageId), ...buildProjectSelectorContracts(pageId)];
}

/** Known implemented design workspace routes (reuse, do not recreate). */
export function designWorkspaceExistingRoutes(projectId: string): string[] {
  const base = `/projects/${projectId}/design`;
  return [
    base,
    `${base}?tab=references`,
    `${base}?tab=assets`,
    `${base}?tab=pages`,
    `${base}?tab=skins`,
    `${base}?tab=history`,
    `${base}?tab=more`,
    `${base}?tab=assets&rriAction=review-crops`,
    `${base}?tab=assets&rriAction=generation-plan`,
    `${base}?tab=skins&rriAction=review-crops`,
  ];
}
