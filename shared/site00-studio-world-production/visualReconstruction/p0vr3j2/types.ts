/**
 * P0.VR.3J.2-SITE00 — Prepared capture execution report types.
 */

import type { AccountRecaptureResult } from '../p0vr3j/accountAuthenticatedCapture.js';
import type { DeriveMissingTargetResult } from '../p0vr3l/types.js';
import type { FamilyFidelityQaResult } from '../p0vr3l/types.js';
import type { ComposerDraftReviewSession } from '../p0vr3j/composerDraftReviewSession.js';
import type { SnapshotRegistryHealth } from '../p0vr3j/snapshotRegistryHealth.js';

export const P0_VR_3J2_LINEAGE = 'P0.VR.3J.2-SITE00' as const;

export const VOICE_LAB_TARGET_ID = 'ndxbook:character-lab:voice-lab-tab' as const;

export type CaptureExecutionMetrics = {
  existingReused: number;
  accountNew: number;
  sourceSiblingNew: number;
  voiceLabNew: number;
  totalNew: number;
  failed: number;
};

export type VoiceLabReviewSnapshotSet = {
  mobile: string | null;
  tablet: string | null;
  desktop: string | null;
  complete: boolean;
};

export type VoiceLabSourceDerivedReview = {
  targetId: string;
  sourceLabel: string;
  derivedLabel: string;
  source: VoiceLabReviewSnapshotSet;
  derived: VoiceLabReviewSnapshotSet;
  expectedDifferences: string[];
  unexpectedDifferences: string[];
  familyQa: FamilyFidelityQaResult;
  reviewStatus: 'READY_FOR_REVIEW' | 'NEEDS_REVISION' | 'UNREVIEWED';
  readyForFounderReview: boolean;
  derivation: DeriveMissingTargetResult | null;
  derivationResult?: DeriveMissingTargetResult | null;
};

export type PreparedCaptureExecutionReport = {
  lineage: typeof P0_VR_3J2_LINEAGE;
  executedAt: string;
  baseUrl: string;
  account: AccountRecaptureResult & { action: 'capture_account_drafts' };
  site00ReviewSession: ComposerDraftReviewSession;
  site00Health: SnapshotRegistryHealth;
  voiceLab: VoiceLabSourceDerivedReview;
  metrics: CaptureExecutionMetrics;
  propagationDefault: 'TARGET_ONLY';
  propagationApplied: false;
};
