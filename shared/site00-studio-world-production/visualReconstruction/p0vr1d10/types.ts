/**
 * P0.VR.1D.10 — Mobile shell rollout report types.
 */

import type { PixelMatchEvaluation, VisualDifferenceMap } from '../p0vr1d/types.js';
import type { RenderedDomMeasurementMap } from '../p0vr1d1/types.js';

export type MobileShellRolloutScreenReport = {
  screenId: string;
  referencePath: string;
  renderPath: string | null;
  visualScore: number;
  structuralScore: number;
  domMeasurement: RenderedDomMeasurementMap | null;
  pixelMatch: PixelMatchEvaluation | null;
  differenceMap: VisualDifferenceMap | null;
  overlayPath: string | null;
};

export type MobileShellRolloutReport = {
  reportId: string;
  executedAt: string;
  targets: MobileShellRolloutScreenReport[];
  regression: Array<{ screenId: string; selectorPresent: boolean }>;
  staleLocksMarked: number;
};
