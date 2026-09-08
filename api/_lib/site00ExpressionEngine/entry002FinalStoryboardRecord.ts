/**
 * Sprint B4.8/B4.9/B4.9R — Final cinematic storyboard production record.
 */

import type { FinalStoryboardEligibilityState } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import type {
  FinalCinematicStoryboardPanelManifestEntry,
  FinalCinematicStoryboardRecord,
  FinalStoryboardFounderJudgment,
  FinalCinematicStoryboardPanel,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_VERSION,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_002_ID,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS } from './entry002PreStoryboardFounderApproval.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import type { PanelGenerationTelemetry } from './entry002FinalCinematicStoryboardPanelPipeline.js';

export { ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID as ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID };

export type Entry002FinalCinematicStoryboardRecord = {
  storyboardId: string;
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
  assembled: boolean;
  panelCount: number;
  blockedReason: string | null;
};

function manifestToPanels(
  manifest: FinalCinematicStoryboardPanelManifestEntry[],
): FinalCinematicStoryboardPanel[] {
  return manifest.map((p) => ({
    panelId: p.panelId,
    panelNumber: p.panelNumber,
    panelTitle: p.beatId.replace(/_/g, ' '),
    argumentRole: 'LENS' as const,
    visualDescription: p.description,
    ndxPresence: p.ndxVisibility,
    subjectWomanPresence: p.subjectVisibility,
    phoneRole: p.phoneState,
    fashionEvidence: [],
    continuityNotes: p.continuityRequirements,
    mandatoryText: p.requiredText,
    storagePath: p.storagePath,
    previewUrl: p.previewUrl,
  }));
}

export function buildEntry002FinalCinematicStoryboardPlaceholderRecord(
  eligibility: FinalStoryboardEligibilityState,
): Entry002FinalCinematicStoryboardRecord {
  const ready = eligibility === 'READY_FOR_GENERATION';
  return {
    storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
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
    assembled: false,
    panelCount: 0,
    blockedReason: ready
      ? null
      : 'Final cinematic storyboard blocked pending pre-storyboard authority approval',
  };
}

/** @deprecated use buildEntry002FinalCinematicStoryboardPlaceholderRecord */
export const buildEntry002FinalCinematicStoryboardRecord =
  buildEntry002FinalCinematicStoryboardPlaceholderRecord;

export function buildEntry002FinalCinematicStoryboard002Record(params: {
  manifest: FinalCinematicStoryboardPanelManifestEntry[];
  telemetry: PanelGenerationTelemetry;
  structuralQaStatus: FinalCinematicStoryboardRecord['structuralQaStatus'];
  continuityQaStatus: FinalCinematicStoryboardRecord['continuityQaStatus'];
  duplicationQaStatus: FinalCinematicStoryboardRecord['duplicationQaStatus'];
  compositeUrl: string | null;
  compositePath: string | null;
  assembled: boolean;
  status: FinalCinematicStoryboardRecord['status'];
}): FinalCinematicStoryboardRecord {
  const now = new Date().toISOString();
  const renderedPanels = params.manifest.filter((p) => p.generationStatus === 'RENDERED');
  const dispatched = params.telemetry.panelDispatchCount > 0;
  const provider = renderedPanels.find((p) => p.provider)?.provider ?? null;
  const providerRequestId = renderedPanels.find((p) => p.providerRequestId)?.providerRequestId ?? null;

  return {
    storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
    entryId: 'entry-002',
    version: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_VERSION,
    status: params.status,
    founderJudgment: 'UNREVIEWED',
    canon: false,
    visualAuthority: false,
    referenceOnly: false,
    failureReason: params.status === 'REVISION_REQUIRED' ? 'PANEL_GENERATION_OR_QA_INCOMPLETE' : null,
    assetId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_002_ID,
    sourceTreatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001',
    authorityIds: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS.map((a) => a.authorityId),
    chapterId: CHAPTER_01_ID,
    worldId: ENTRY_002_WORLD_ID,
    continuityQaStatus: params.continuityQaStatus,
    structuralQaStatus: params.structuralQaStatus,
    duplicationQaStatus: params.duplicationQaStatus,
    panelCount: params.manifest.length,
    panels: manifestToPanels(params.manifest),
    panelManifest: params.manifest,
    storyboardStripPath: params.compositePath,
    storyboardStripUrl: params.compositeUrl,
    compiled: true,
    dispatched,
    rendered: renderedPanels.length === params.manifest.length,
    assembled: params.assembled,
    approved: false,
    provider,
    providerRequestId,
    telemetry: {
      ...params.telemetry,
      assembled: params.assembled,
      compiled: true,
      dispatched,
      rendered: renderedPanels.length === params.manifest.length,
    },
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
  };
}

/** @deprecated B4.9 composite-only path — use buildEntry002FinalCinematicStoryboard002Record */
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
    storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_ID,
    entryId: 'entry-002',
    version: '001',
    status: 'FAILED_STORYBOARD_STRUCTURE',
    founderJudgment: 'UNREVIEWED',
    canon: false,
    visualAuthority: false,
    referenceOnly: true,
    failureReason: 'DID_NOT_RENDER_SEQUENTIAL_CINEMATIC_STORYBOARD',
    assetId: params.assetId,
    sourceTreatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001',
    authorityIds: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS.map((a) => a.authorityId),
    chapterId: CHAPTER_01_ID,
    worldId: ENTRY_002_WORLD_ID,
    continuityQaStatus: 'FAIL',
    structuralQaStatus: 'FAIL',
    duplicationQaStatus: 'FAIL',
    panelCount: 0,
    panels: params.panels.map((p) => ({
      ...p,
      previewUrl: params.renderResult.previewUrl,
    })),
    panelManifest: [],
    storyboardStripPath: params.renderResult.storagePath,
    storyboardStripUrl: params.renderResult.previewUrl,
    compiled: params.renderResult.compiled,
    dispatched: params.renderResult.dispatched,
    rendered: false,
    assembled: true,
    approved: false,
    provider: params.renderResult.provider,
    providerRequestId: params.renderResult.providerRequestId,
    telemetry: {
      panelCompileCount: params.panels.length,
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

export function toEntry002FinalCinematicStoryboardSummaryRecord(
  record: FinalCinematicStoryboardRecord,
): Entry002FinalCinematicStoryboardRecord {
  return {
    storyboardId: record.storyboardId,
    entryId: record.entryId,
    treatmentId: record.sourceTreatmentId,
    status: record.status as FinalStoryboardEligibilityState,
    founderJudgment: record.founderJudgment,
    visualAuthority: record.visualAuthority,
    canon: record.canon,
    rendered: record.rendered,
    approved: record.approved,
    compiled: record.compiled,
    dispatched: record.dispatched,
    assembled: record.assembled,
    panelCount: record.panelCount,
    blockedReason: record.rendered ? null : 'Storyboard panels not yet fully rendered',
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
