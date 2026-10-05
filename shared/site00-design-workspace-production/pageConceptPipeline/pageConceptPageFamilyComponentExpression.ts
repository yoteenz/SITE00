/**
 * P0.VR.PAGE-FAMILY-SKIN-BEHAVIOR-CONTRACT1 — component expression map
 */

import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { PageExperienceExpressionContract } from './pageConceptViewportAuthorityFamily.js';

export const PAGE_FAMILY_COMPONENT_KEYS = [
  'BUTTON',
  'INPUT',
  'SELECT',
  'TAB',
  'CARD',
  'PANEL',
  'LIST',
  'TABLE',
  'GRID',
  'BADGE',
  'TOAST',
  'DRAWER',
  'MODAL',
  'SHEET',
  'POPOVER',
  'INSPECTOR',
  'EMPTY_STATE',
  'ERROR_STATE',
  'LOADING_STATE',
  'CONFIRMATION',
  'BREADCRUMB',
  'SUBNAV',
  'DETAIL_HEADER',
  'SECTION_HEADER',
  'ACTION_BAR',
] as const;

export type PageFamilyComponentKey = (typeof PAGE_FAMILY_COMPONENT_KEYS)[number];

export type PageFamilyComponentExpression = {
  key: PageFamilyComponentKey;
  visualTreatment: string;
  sizeBehavior: string;
  responsiveBehavior: string;
  interactionBehavior: string;
  forbiddenFallback: string;
};

export type PageFamilyComponentExpressionMap = {
  mapId: string;
  projectId: string;
  pageId: string;
  version: string;
  entries: readonly PageFamilyComponentExpression[];
  createdAt: string;
};

function briefMaterialFallback(skin: ProjectSkinContract): string {
  return skin.material[0] ?? skin.composition[0] ?? 'project material tokens';
}

function entry(
  key: PageFamilyComponentKey,
  skin: ProjectSkinContract,
  experience: PageExperienceExpressionContract,
): PageFamilyComponentExpression {
  const material = skin.material[0] ?? briefMaterialFallback(skin);
  return {
    key,
    visualTreatment: `${key} uses ${skin.typography.bodyFont} + ${material}; palette ${skin.palette[0] ?? 'project palette'}`,
    sizeBehavior: 'touch targets ≥ 44px mobile; compact mono labels on dense tables',
    responsiveBehavior: 'inherits MOBILE/TABLET/DESKTOP family responsive rules — no orphan breakpoints',
    interactionBehavior: `follows experience expression overlays: ${experience.overlayPatterns[0] ?? 'family overlay grammar'}`,
    forbiddenFallback: 'no generic SaaS/shadcn/browser-default treatment',
  };
}

export function compilePageFamilyComponentExpressionMap(input: {
  projectId: string;
  pageId: string;
  skinContract: ProjectSkinContract;
  experienceContract: PageExperienceExpressionContract;
}): PageFamilyComponentExpressionMap {
  return {
    mapId: `pfcem-${input.projectId}-${input.pageId}-${Date.now()}`,
    projectId: input.projectId,
    pageId: input.pageId,
    version: input.skinContract.version,
    entries: PAGE_FAMILY_COMPONENT_KEYS.map((key) => entry(key, input.skinContract, input.experienceContract)),
    createdAt: new Date().toISOString(),
  };
}

export function findComponentExpression(
  map: PageFamilyComponentExpressionMap,
  key: PageFamilyComponentKey,
): PageFamilyComponentExpression | null {
  return map.entries.find((e) => e.key === key) ?? null;
}
