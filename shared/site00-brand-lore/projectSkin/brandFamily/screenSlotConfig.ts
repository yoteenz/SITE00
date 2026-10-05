/**
 * Screen slot prefill — brand family + screen type → module / screen / viewport context.
 */

import type { StandardScreenType, ScreenAuthorityViewport } from './types.js';
import type { BrandFamilyKey } from './types.js';

export type ScreenSlotPrefill = {
  brandFamilySkinId: BrandFamilyKey | string;
  moduleId: string;
  screenType: StandardScreenType | string;
  screenLabel: string;
  defaultViewport: ScreenAuthorityViewport;
};

export const SCREEN_SLOT_PREFILL: Record<StandardScreenType, Omit<ScreenSlotPrefill, 'brandFamilySkinId'>> = {
  PROJECT_OVERVIEW: {
    moduleId: 'PROJECTS',
    screenType: 'OVERVIEW',
    screenLabel: 'PROJECT OVERVIEW',
    defaultViewport: 'MOBILE',
  },
  IDENTITY: {
    moduleId: 'IDENTITY',
    screenType: 'IDENTITY',
    screenLabel: 'IDENTITY',
    defaultViewport: 'MOBILE',
  },
  BUILDER: {
    moduleId: 'BUILDER',
    screenType: 'BUILDER',
    screenLabel: 'BUILDER',
    defaultViewport: 'MOBILE',
  },
  EVOLVE: {
    moduleId: 'EVOLVE',
    screenType: 'EVOLVE',
    screenLabel: 'EVOLVE',
    defaultViewport: 'MOBILE',
  },
  PRODUCTION: {
    moduleId: 'PRODUCTION',
    screenType: 'PRODUCTION',
    screenLabel: 'PRODUCTION',
    defaultViewport: 'MOBILE',
  },
  REVIEWS: {
    moduleId: 'REVIEWS',
    screenType: 'REVIEWS',
    screenLabel: 'REVIEWS',
    defaultViewport: 'MOBILE',
  },
  LIBRARY: {
    moduleId: 'LIBRARY',
    screenType: 'LIBRARY',
    screenLabel: 'LIBRARY',
    defaultViewport: 'MOBILE',
  },
  CONTROL_ROOM: {
    moduleId: 'CONTROL_ROOM',
    screenType: 'CONTROL_ROOM',
    screenLabel: 'CONTROL ROOM',
    defaultViewport: 'MOBILE',
  },
};

export function buildScreenAuthorityPrefill(
  brandFamilySkinId: string,
  packScreenType: StandardScreenType,
): ScreenSlotPrefill {
  const slot = SCREEN_SLOT_PREFILL[packScreenType];
  return {
    brandFamilySkinId,
    ...slot,
  };
}
