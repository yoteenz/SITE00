import type { WorkModuleId } from '../../builder-experience/spatialStudio/types';
import type { BuildInspection } from '../buildObject/composition';
import type { FeelDrillTarget, WorkDrillTarget } from './types';

/** Element id prefixes produced by `workModule()` in composition.ts. */
export const WORK_REGION_ELEMENTS: Record<WorkModuleId, readonly string[]> = {
  PAGES: ['m-pages-0', 'm-pages-1', 'm-pages-2', 'm-pages-3', 'm-pages-spine'],
  BLOG: ['m-blog-ledge', 'm-blog-0', 'm-blog-1', 'm-blog-2', 'm-blog-3', 'm-blog-4', 'm-blog-5'],
  SHOP: ['m-shop-base', 'm-shop-case', 'm-shop-item-0', 'm-shop-item-1', 'm-shop-item-2'],
  MEMBER_AREA: ['m-member-room', 'm-member-door-l', 'm-member-door-r', 'm-member-door-top'],
  BOOKING: ['m-booking-post-0', 'm-booking-post-0-b', 'm-booking-lintel', 'm-booking-floor'],
  PORTAL: ['m-portal-0', 'm-portal-1', 'm-portal-2'],
};

export const WORK_DRILL_MODULE: Record<WorkDrillTarget, WorkModuleId> = {
  SHOP: 'SHOP',
};

export const FEEL_BOLD_ELEMENTS: readonly string[] = ['plate-0', 'plate-1', 'plate-2', 'plate-3', 'plate-4', 'slab'];

export const FEEL_TYPE_ELEMENTS: readonly string[] = ['plate-0', 'plate-1'];
export const FEEL_COLOR_ELEMENTS: readonly string[] = ['slab', 'plate-3'];

export function workRegionInspect(module: WorkModuleId, closeness: number): BuildInspection {
  return {
    key: `work-region:${module}`,
    lit: [...WORK_REGION_ELEMENTS[module]],
    isolate: true,
    closeness,
    explode: {},
  };
}

export function workShopInspect(closeness: number): BuildInspection {
  return workRegionInspect('SHOP', closeness);
}

export function feelBoldInspect(closeness: number, highlight?: 'TYPE' | 'COLOR'): BuildInspection {
  const lit =
    highlight === 'TYPE' ? [...FEEL_TYPE_ELEMENTS] : highlight === 'COLOR' ? [...FEEL_COLOR_ELEMENTS] : [...FEEL_BOLD_ELEMENTS];
  return {
    key: `feel-bold${highlight ? `:${highlight}` : ''}`,
    lit,
    isolate: true,
    closeness,
    explode: {},
  };
}

export function feelTargetInspect(target: FeelDrillTarget, closeness: number, highlight?: 'TYPE' | 'COLOR'): BuildInspection {
  if (target === 'BOLD') return feelBoldInspect(closeness, highlight);
  return feelBoldInspect(closeness);
}
