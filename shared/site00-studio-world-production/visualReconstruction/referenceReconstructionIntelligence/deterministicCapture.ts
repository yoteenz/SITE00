/**
 * Deterministic reference capture gates.
 */

import type { ReferenceDataState } from './types.js';

export type CaptureReadiness = {
  ready: boolean;
  blockers: string[];
};

export function evaluateCaptureReadiness(input: {
  fontsReady: boolean;
  layoutStable: boolean;
  animationsFrozen: boolean;
  scrollY: number;
  expectedScrollY: number;
  dataState: ReferenceDataState;
  expectedDataState: ReferenceDataState;
  imagesLoaded: boolean;
  hydrationComplete: boolean;
}): CaptureReadiness {
  const blockers: string[] = [];
  if (!input.fontsReady) blockers.push('REFERENCE_FONT_NOT_READY');
  if (!input.layoutStable) blockers.push('REFERENCE_LAYOUT_NOT_STABLE');
  if (!input.animationsFrozen) blockers.push('REFERENCE_CAPTURE_NONDETERMINISTIC');
  if (input.scrollY !== input.expectedScrollY) blockers.push('REFERENCE_DATA_STATE_MISMATCH');
  if (JSON.stringify(input.dataState) !== JSON.stringify(input.expectedDataState)) {
    blockers.push('REFERENCE_DATA_STATE_MISMATCH');
  }
  if (!input.imagesLoaded) blockers.push('REFERENCE_CAPTURE_NONDETERMINISTIC');
  if (!input.hydrationComplete) blockers.push('REFERENCE_LAYOUT_NOT_STABLE');
  return { ready: blockers.length === 0, blockers };
}

export function defaultSkinsMobileDataState(): ReferenceDataState {
  return {
    selectedTab: 'SKINS',
    selectedFamily: 'NDXBOOK',
    selectedScreen: 'PROJECT_OVERVIEW',
    openPanel: null,
    scrollY: 0,
    emptyState: false,
    loadingState: false,
  };
}
