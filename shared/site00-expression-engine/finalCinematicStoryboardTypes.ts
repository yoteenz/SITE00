/**
 * Sprint B4.9 — Final cinematic storyboard types.
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
  | 'REVISION_REQUIRED';

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

export type FinalCinematicStoryboardRecord = {
  storyboardId: 'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-001';
  entryId: 'entry-002';
  version: string;
  status: FinalStoryboardStatus;
  founderJudgment: FinalStoryboardFounderJudgment;
  canon: boolean;
  visualAuthority: boolean;
  assetId: string;
  sourceTreatmentId: 'NDX-ENTRY-002-REEL-TREATMENT-001';
  authorityIds: string[];
  chapterId: string;
  worldId: string;
  continuityQaStatus: 'PASS' | 'WARN' | 'FAIL';
  panelCount: number;
  panels: FinalCinematicStoryboardPanel[];
  storyboardStripPath: string | null;
  storyboardStripUrl: string | null;
  compiled: boolean;
  dispatched: boolean;
  rendered: boolean;
  approved: boolean;
  provider: string | null;
  providerRequestId: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
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
