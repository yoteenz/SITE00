/**
 * Sprint B4.4 — Assemble complete Entry 002 REEL storyboard record.
 */

import type { ReelStoryboard } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import { REEL_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import {
  ENTRY_002_REEL_STORYBOARD_001,
  buildEntry002ReelStoryboardPanelId,
} from '../../../shared/site00-expression-engine/entry002ReelStoryboardIds.js';
import { buildEntry002ReelArgumentArc } from './entry002ReelShotPlan.js';
import { ENTRY_002_REEL_RUNTIME_TARGET } from './entry002ReelShotPlan.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import {
  buildEntry002ReelStoryboardAggregateFields,
  buildEntry002ReelStoryboardPanels,
} from './entry002ReelStoryboardPanels.js';
import { buildEntry002StoryboardContinuityAuthority } from './entry002ReelStoryboardContinuity.js';

export function buildEntry002ReelStoryboardRecord(
  panelsWithUrls?: Array<{ panelNumber: number; storagePath: string; previewUrl: string }>,
  strip?: { storagePath: string; previewUrl: string } | null,
): ReelStoryboard {
  const basePanels = buildEntry002ReelStoryboardPanels();
  const panels = basePanels.map((p) => {
    const visual = panelsWithUrls?.find((v) => v.panelNumber === p.panelNumber);
    if (!visual) return p;
    return {
      ...p,
      storagePath: visual.storagePath,
      previewUrl: visual.previewUrl,
    };
  });

  const aggregate = buildEntry002ReelStoryboardAggregateFields(panels);

  return {
    storyboardId: ENTRY_002_REEL_STORYBOARD_001,
    entryId: 'entry-002',
    chapterId: CHAPTER_01_ID,
    formatId: 'REEL',
    runtimeTarget: { ...ENTRY_002_REEL_RUNTIME_TARGET },
    argumentArc: buildEntry002ReelArgumentArc(),
    ...aggregate,
    panels,
    storyboardStripPath: strip?.storagePath ?? null,
    storyboardStripUrl: strip?.previewUrl ?? null,
    continuityAuthority: buildEntry002StoryboardContinuityAuthority(),
    keyframeExtractionMap: {
      START: {
        sourcePanelIds: [
          buildEntry002ReelStoryboardPanelId(1),
          buildEntry002ReelStoryboardPanelId(2),
        ],
        blockedUntilApproval: true,
      },
      MID: {
        sourcePanelIds: [
          buildEntry002ReelStoryboardPanelId(6),
          buildEntry002ReelStoryboardPanelId(7),
        ],
        blockedUntilApproval: true,
      },
      END: {
        sourcePanelIds: [
          buildEntry002ReelStoryboardPanelId(9),
          buildEntry002ReelStoryboardPanelId(10),
        ],
        blockedUntilApproval: true,
      },
    },
    founderJudgment: 'UNREVIEWED',
    canonState: 'NON_CANON',
    gateId: 'GATE_0_STORYBOARD',
  };
}

export { REEL_PRODUCTION_ORDER };
