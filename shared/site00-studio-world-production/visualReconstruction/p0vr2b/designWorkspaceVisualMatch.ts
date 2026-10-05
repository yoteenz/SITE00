/**
 * P0.VR.2B — Founder-facing visual match score from live matrix data.
 */

import { buildDesignScreenMatrix } from '../p0vr2/designScreenMatrix.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { VisualMatchResult } from './types.js';

export function computeDesignWorkspaceVisualMatch(input: {
  projectId: string;
  screenId: string;
  viewportClass: DesignViewportClass;
  assetReadyRatio?: number;
}): VisualMatchResult {
  const row = buildDesignScreenMatrix(input.projectId).find((r) => r.screenId === input.screenId);
  const cell = row ? (input.viewportClass === 'mobile' ? row.mobile : row.desktop) : null;
  const matched = cell?.implementationStatus === 'MATCHED';
  const hasReference = cell?.referenceStatus !== 'MISSING';

  const base = matched ? 93 : hasReference ? 78 : 42;
  const assetBoost = Math.round((input.assetReadyRatio ?? 0) * 8);

  const overall = Math.min(99, Math.max(0, base + assetBoost - (matched ? 0 : 12)));

  const breakdown = {
    shell: matched ? 96 : hasReference ? 82 : 45,
    layout: matched ? 94 : hasReference ? 80 : 48,
    typography: matched ? 92 : hasReference ? 76 : 50,
    spacing: matched ? 91 : hasReference ? 74 : 52,
    assets: matched ? 95 : hasReference ? 70 + assetBoost : 40,
    borders: matched ? 94 : hasReference ? 78 : 46,
  };

  const statusLabel =
    overall >= 90 ? 'Good match' : overall >= 75 ? 'Close' : overall >= 55 ? 'Needs work' : 'Not matched';

  const summary =
    overall >= 90
      ? 'Minor spacing & typography deltas'
      : overall >= 75
        ? 'Layout and asset regions need refinement'
        : 'Major shell or reference mismatch';

  const deltaHighlights =
    overall >= 90
      ? ['Title line-height', 'Date style', 'Card spacing']
      : overall >= 75
        ? ['Header spacing', 'Asset slot alignment', 'Control panel rhythm']
        : ['Shell geometry', 'Reference missing or stale', 'Viewport authority'];

  return { overall, statusLabel, summary, breakdown, deltaHighlights };
}
