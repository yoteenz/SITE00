/**
 * P0.VR.1D.3 — Single-screen reconstruction proof types.
 */

import type { ViewportClass } from '../p0vr1d/types.js';
import type { LiveScreenRunResult } from '../p0vr1d2/types.js';

export type NdxOverviewInteractionState = 'BASE_SCREEN' | 'THREE_DOT_PROJECT_MENU_OPEN';

export type ScreenReferenceState = {
  screenId: string;
  route: string;
  viewport: ViewportClass;
  interactionState: NdxOverviewInteractionState;
  menuOpen: boolean;
  referenceAssetId: string;
  referencePath: string;
  viewportWidth: number;
  viewportHeight: number;
  safeAreaTop: number;
  safeAreaBottom: number;
  deviceFrameAssumptions: string;
  confidence: number;
};

export type NdxOverviewMenuOpenLiveReport = {
  reportId: string;
  referenceState: ScreenReferenceState;
  skipRender: false;
  screen: LiveScreenRunResult;
  implementationSpecRegionCount: number;
  domRegionsTracked: string[];
  executedAt: string;
};
