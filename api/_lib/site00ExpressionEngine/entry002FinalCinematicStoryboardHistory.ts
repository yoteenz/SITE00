/**
 * Sprint B4.9R — Preserve B4.9 storyboard 001 as structurally invalid historical artifact.
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_VERSION,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_001_ID,
  buildEntry002FinalCinematicStoryboardPublicStripPath,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS } from './entry002PreStoryboardFounderApproval.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_WORLD_ID } from './entry002Blueprint.js';

export const B49_FALSE_POSITIVE_FAILURE_REASON = 'DID_NOT_RENDER_SEQUENTIAL_CINEMATIC_STORYBOARD' as const;

export function buildStoryboard001HistoricalFailureRecord(): FinalCinematicStoryboardRecord {
  const now = new Date().toISOString();
  return {
    storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_ID,
    entryId: 'entry-002',
    version: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_VERSION,
    status: 'FAILED_STORYBOARD_STRUCTURE',
    founderJudgment: 'UNREVIEWED',
    canon: false,
    visualAuthority: false,
    referenceOnly: true,
    failureReason: B49_FALSE_POSITIVE_FAILURE_REASON,
    assetId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_001_ID,
    sourceTreatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001',
    authorityIds: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS.map((a) => a.authorityId),
    chapterId: CHAPTER_01_ID,
    worldId: ENTRY_002_WORLD_ID,
    continuityQaStatus: 'FAIL',
    structuralQaStatus: 'FAIL',
    duplicationQaStatus: 'FAIL',
    panelCount: 0,
    panels: [],
    panelManifest: [],
    storyboardStripPath: buildEntry002FinalCinematicStoryboardPublicStripPath(
      ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_001_ID,
    ),
    storyboardStripUrl: buildEntry002FinalCinematicStoryboardPublicStripPath(
      ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_001_ID,
    ),
    compiled: true,
    dispatched: false,
    rendered: false,
    assembled: true,
    approved: false,
    provider: 'local-sharp-composite',
    providerRequestId: null,
    telemetry: {
      panelCompileCount: 15,
      panelDispatchCount: 0,
      panelRenderCount: 0,
      panelFailureCount: 0,
      panelRepairCount: 0,
      assembled: true,
      compiled: true,
      dispatched: false,
      rendered: false,
    },
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
  };
}
