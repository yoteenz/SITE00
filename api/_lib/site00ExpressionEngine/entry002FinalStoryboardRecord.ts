/**
 * Sprint B4.8/B4.9 — Final cinematic storyboard production record.
 */

import type { FinalStoryboardEligibilityState } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import type {
  FinalCinematicStoryboardRecord,
  FinalStoryboardFounderJudgment,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_VERSION,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS } from './entry002PreStoryboardFounderApproval.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_WORLD_ID } from './entry002Blueprint.js';

export { ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID };

export type Entry002FinalCinematicStoryboardRecord = {
  storyboardId: typeof ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID;
  entryId: 'entry-002';
  treatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001';
  status: FinalStoryboardEligibilityState;
  founderJudgment: FinalStoryboardFounderJudgment;
  visualAuthority: boolean;
  canon: boolean;
  rendered: boolean;
  approved: boolean;
  compiled: boolean;
  dispatched: boolean;
  panelCount: number;
  blockedReason: string | null;
};

export function buildEntry002FinalCinematicStoryboardPlaceholderRecord(
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
    canon: false,
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

/** @deprecated use buildEntry002FinalCinematicStoryboardPlaceholderRecord */
export const buildEntry002FinalCinematicStoryboardRecord =
  buildEntry002FinalCinematicStoryboardPlaceholderRecord;

export function buildEntry002FinalCinematicStoryboardGeneratedRecord(params: {
  renderResult: {
    previewUrl: string;
    storagePath: string;
    provider: string | null;
    providerRequestId: string | null;
    compiled: boolean;
    dispatched: boolean;
    rendered: boolean;
  };
  panels: FinalCinematicStoryboardRecord['panels'];
  continuityQaStatus: FinalCinematicStoryboardRecord['continuityQaStatus'];
  assetId: string;
}): FinalCinematicStoryboardRecord {
  const now = new Date().toISOString();
  return {
    storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID,
    entryId: 'entry-002',
    version: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_VERSION,
    status: 'AWAITING_FOUNDER_APPROVAL',
    founderJudgment: 'UNREVIEWED',
    canon: false,
    visualAuthority: false,
    assetId: params.assetId,
    sourceTreatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001',
    authorityIds: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS.map((a) => a.authorityId),
    chapterId: CHAPTER_01_ID,
    worldId: ENTRY_002_WORLD_ID,
    continuityQaStatus: params.continuityQaStatus,
    panelCount: params.panels.length,
    panels: params.panels.map((p) => ({
      ...p,
      previewUrl: params.renderResult.previewUrl,
    })),
    storyboardStripPath: params.renderResult.storagePath,
    storyboardStripUrl: params.renderResult.previewUrl,
    compiled: params.renderResult.compiled,
    dispatched: params.renderResult.dispatched,
    rendered: params.renderResult.rendered,
    approved: false,
    provider: params.renderResult.provider,
    providerRequestId: params.renderResult.providerRequestId,
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
  };
}

export function toEntry002FinalCinematicStoryboardSummaryRecord(
  record: FinalCinematicStoryboardRecord,
): Entry002FinalCinematicStoryboardRecord {
  return {
    storyboardId: record.storyboardId,
    entryId: record.entryId,
    treatmentId: record.sourceTreatmentId,
    status: record.status,
    founderJudgment: record.founderJudgment,
    visualAuthority: record.visualAuthority,
    canon: record.canon,
    rendered: record.rendered,
    approved: record.approved,
    compiled: record.compiled,
    dispatched: record.dispatched,
    panelCount: record.panelCount,
    blockedReason: record.rendered ? null : 'Storyboard not yet rendered',
  };
}

export function applyFinalStoryboardFounderJudgmentToRecord(
  record: FinalCinematicStoryboardRecord,
  founderJudgment: FinalStoryboardFounderJudgment,
): FinalCinematicStoryboardRecord {
  const approved = founderJudgment === 'LOVE_IT';
  const now = new Date().toISOString();
  return {
    ...record,
    founderJudgment,
    approved,
    visualAuthority: approved,
    canon: approved,
    status: approved ? record.status : founderJudgment === 'PROMISING_REFINE' ? 'REVISION_REQUIRED' : record.status,
    updatedAt: now,
    approvedAt: approved ? now : record.approvedAt,
  };
}

export function isKeyframeEligibleFromFinalStoryboard(
  founderJudgment: FinalStoryboardFounderJudgment,
): boolean {
  return founderJudgment === 'LOVE_IT';
}
