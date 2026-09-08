/**
 * Sprint B4.8 — Final cinematic storyboard production record (placeholder until generation).
 */

import type { FinalStoryboardEligibilityState } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-001' as const;

export type Entry002FinalCinematicStoryboardRecord = {
  storyboardId: typeof ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID;
  entryId: 'entry-002';
  treatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001';
  status: FinalStoryboardEligibilityState;
  founderJudgment: 'UNREVIEWED';
  visualAuthority: false;
  rendered: false;
  approved: false;
  compiled: false;
  dispatched: false;
  panelCount: 0;
  blockedReason: string | null;
};

export function buildEntry002FinalCinematicStoryboardRecord(
  eligibility: FinalStoryboardEligibilityState,
): Entry002FinalCinematicStoryboardRecord {
  const ready = eligibility === 'READY_FOR_GENERATION';
  return {
    storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID,
    entryId: 'entry-002',
    treatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001',
    status: eligibility,
    founderJudgment: 'UNREVIEWED',
    visualAuthority: false,
    rendered: false,
    approved: false,
    compiled: false,
    dispatched: false,
    panelCount: 0,
    blockedReason: ready
      ? null
      : 'Final cinematic storyboard blocked pending pre-storyboard authority approval',
  };
}
