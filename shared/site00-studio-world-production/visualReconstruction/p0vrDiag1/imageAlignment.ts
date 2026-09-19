/**
 * P0.VR.DIAG.1 — Align current + authority captures before measurement.
 */

import { evaluateBrowserChrome } from '../ingestion/BrowserChromeDetectionEvaluation.js';
import type { AlignmentStatus } from './types.js';

export type AlignedCapturePair = {
  alignmentStatus: AlignmentStatus;
  currentUsable: { x: number; y: number; width: number; height: number };
  authorityUsable: { x: number; y: number; width: number; height: number };
  chromeExcluded: boolean;
  deviceFrameMasked: boolean;
};

export function alignCapturePair(input: {
  currentWidth: number;
  currentHeight: number;
  authorityWidth: number;
  authorityHeight: number;
  viewport: 'mobile' | 'tablet' | 'desktop';
  authorityReferenceType?: 'VIEWPORT_SCREENSHOT' | 'FULL_PAGE_REFERENCE';
}): AlignedCapturePair {
  const currentChrome = evaluateBrowserChrome(input.currentWidth, input.currentHeight, {
    forceMobileChrome: input.viewport === 'mobile',
  });
  const authorityChrome = evaluateBrowserChrome(input.authorityWidth, input.authorityHeight, {
    forceMobileChrome: input.viewport === 'mobile',
  });

  const currentUsable = currentChrome.usablePageBounds;
  const authorityUsable = authorityChrome.usablePageBounds;
  const chromeExcluded = currentChrome.browserChromePresent || authorityChrome.browserChromePresent;

  const widthRatio = currentUsable.width / Math.max(1, authorityUsable.width);
  const heightRatio = currentUsable.height / Math.max(1, authorityUsable.height);
  const ratioClose = Math.abs(widthRatio - 1) < 0.08 && Math.abs(heightRatio - 1) < 0.12;

  let alignmentStatus: AlignmentStatus = 'ALIGNED';
  if (!ratioClose) alignmentStatus = 'PARTIAL';
  if (Math.abs(widthRatio - 1) > 0.2 || Math.abs(heightRatio - 1) > 0.25) alignmentStatus = 'MISALIGNED';
  if (input.currentWidth <= 0 || input.authorityWidth <= 0) alignmentStatus = 'INSUFFICIENT_INPUT';

  return {
    alignmentStatus,
    currentUsable,
    authorityUsable,
    chromeExcluded,
    deviceFrameMasked: chromeExcluded,
  };
}
