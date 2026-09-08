/**
 * Sprint B4.9 / B4.9R — Final cinematic storyboard types.
 */

import type { Entry002ArgumentArcExtended } from './storyboardGateTypes.js';

export type FinalStoryboardFounderJudgment =
  | 'UNREVIEWED'
  | 'LOVE_IT'
  | 'PROMISING_REFINE'
  | 'NOT_FOR_ME';

export type FinalStoryboardStatus =
  | 'READY_FOR_GENERATION'
  | 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL'
  | 'AWAITING_FOUNDER_APPROVAL'
  | 'REVISION_REQUIRED'
  | 'FAILED_STORYBOARD_STRUCTURE'
  | 'FAILED_STORYBOARD_RENDER_MODE'
  | 'GENERATION_FAILED';

export type StoryboardGenerationMode =
  | 'SINGLE_MULTI_PANEL_ARTIFACT'
  | 'PANEL_FAN_OUT'
  | 'COMPOSITE_ONLY';

export type StoryboardPanelGenerationStatus =
  | 'PENDING'
  | 'DISPATCHED'
  | 'RENDERED'
  | 'FAILED'
  | 'REPAIR_REQUIRED';

export type StoryboardPanelQaStatus = 'PENDING' | 'PASS' | 'WARN' | 'FAIL';

export type FinalCinematicStoryboardPanelManifestEntry = {
  panelId: string;
  panelNumber: number;
  beatId: string;
  storyFunction: string;
  description: string;
  cameraFraming: string;
  cameraAngle: string;
  subjectVisibility: string;
  ndxVisibility: string;
  phoneState: string;
  era: '2026' | '2016' | 'TRANSITION' | 'EDIT_SUITE' | 'PRESENT';
  environmentState: string;
  requiredAuthorityIds: string[];
  continuityRequirements: string[];
  requiredText: string | null;
  transitionIn: string;
  transitionOut: string;
  generationStatus: StoryboardPanelGenerationStatus;
  assetId: string;
  qaStatus: StoryboardPanelQaStatus;
  panelVersion: string;
  storagePath: string | null;
  previewUrl: string | null;
  contentHash: string | null;
  provider: string | null;
  providerRequestId: string | null;
  previousPanelAssetId: string | null;
};

export type FinalCinematicStoryboardPanel = {
  panelId: string;
  panelNumber: number;
  panelTitle: string;
  argumentRole: Entry002ArgumentArcExtended[number] | 'HOOK' | 'HANDOFF';
  visualDescription: string;
  ndxPresence: string;
  subjectWomanPresence: string;
  phoneRole: string;
  fashionEvidence: string[];
  continuityNotes: string[];
  mandatoryText: string | null;
  storagePath: string | null;
  previewUrl: string | null;
};

export type FinalCinematicStoryboardTelemetry = {
  storyboardCompileCount: number;
  storyboardDispatchCount: number;
  storyboardRenderCount: number;
  panelManifestCount: number;
  panelDispatchCount: number;
  panelRenderCount: number;
  /** @deprecated B4.9R panel fan-out */
  panelCompileCount?: number;
  panelFailureCount?: number;
  panelRepairCount?: number;
  assembled: boolean;
  compiled: boolean;
  dispatched: boolean;
  rendered: boolean;
};

export type FinalCinematicStoryboardRecord = {
  storyboardId: string;
  entryId: 'entry-002';
  version: string;
  status: FinalStoryboardStatus;
  founderJudgment: FinalStoryboardFounderJudgment;
  canon: boolean;
  visualAuthority: boolean;
  referenceOnly: boolean;
  failureReason: string | null;
  assetId: string;
  sourceTreatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001';
  authorityIds: string[];
  chapterId: string;
  worldId: string;
  continuityQaStatus: 'PASS' | 'WARN' | 'FAIL';
  structuralQaStatus: 'PASS' | 'WARN' | 'FAIL';
  duplicationQaStatus: 'PASS' | 'WARN' | 'FAIL';
  renderModeQaStatus: 'PASS' | 'WARN' | 'FAIL';
  generationMode: StoryboardGenerationMode;
  panelCount: number;
  panels: FinalCinematicStoryboardPanel[];
  panelManifest: FinalCinematicStoryboardPanelManifestEntry[];
  storyboardStripPath: string | null;
  storyboardStripUrl: string | null;
  compiled: boolean;
  dispatched: boolean;
  rendered: boolean;
  assembled: boolean;
  approved: boolean;
  provider: string | null;
  providerRequestId: string | null;
  telemetry: FinalCinematicStoryboardTelemetry;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
};

export type StoryboardRenderModeQAResult = {
  passed: boolean;
  result: 'PASS' | 'WARN' | 'FAIL';
  storyboardGenerationMode: StoryboardGenerationMode;
  providerDispatchCount: number;
  storyboardAssetCount: number;
  independentStoryboardPanelAssetCount: number;
  checks: Array<{ check: string; passed: boolean }>;
  blockers: string[];
};

export type SingleStoryboardArtifactQAResult = {
  passed: boolean;
  result: 'PASS' | 'WARN' | 'FAIL';
  checks: Array<{ check: string; passed: boolean }>;
  blockers: string[];
  warnings: string[];
  narrativeCoverage: Record<string, boolean>;
};

export type StoryboardStructureQAResult = {
  passed: boolean;
  result: 'PASS' | 'WARN' | 'FAIL';
  expectedPanelCount: number;
  renderedDistinctPanelCount: number;
  checks: Array<{ check: string; passed: boolean }>;
  blockers: string[];
  warnings: string[];
  narrativeCoverage: Record<string, boolean>;
};

export type StoryboardContinuityDomainQAResult = {
  passed: boolean;
  result: 'PASS' | 'WARN' | 'FAIL';
  domains: Record<
    | 'NDX_PRESENCE'
    | 'SUBJECT_IDENTITY'
    | 'NDX_HANDS'
    | 'SUBJECT_FASHION'
    | 'PHONE_GLITCH'
    | 'ERA_CONTINUITY'
    | 'NARRATIVE_SEQUENCE',
    'PASS' | 'WARN' | 'FAIL'
  >;
  blockers: string[];
  warnings: string[];
};

export type StoryboardDuplicationQAResult = {
  passed: boolean;
  result: 'PASS' | 'WARN' | 'FAIL';
  duplicateAssetIds: string[];
  duplicateContentHashes: string[];
  blockers: string[];
};

export type FinalCinematicStoryboardQAResult = {
  passed: boolean;
  result: 'PASS' | 'WARN' | 'FAIL';
  checks: Array<{ check: string; passed: boolean }>;
  blockers: string[];
  warnings: string[];
};

export const FINAL_STORYBOARD_REVIEW_GATE_ID = 'GATE_0D_FOUNDER_FINAL_STORYBOARD_REVIEW' as const;

export const ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION =
  'FOUNDER REVIEW FINAL CINEMATIC STORYBOARD' as const;

export const ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION =
  'REPAIR FINAL CINEMATIC STORYBOARD' as const;

export const ENTRY_002_GENERATE_FINAL_STORYBOARD_ACTION =
  'GENERATE FINAL CINEMATIC STORYBOARD' as const;
