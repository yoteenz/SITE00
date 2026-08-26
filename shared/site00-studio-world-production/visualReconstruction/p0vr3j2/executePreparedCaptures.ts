/**
 * P0.VR.3J.2-SITE00 — Execute prepared Account + Voice Lab captures (no new architecture).
 */

import { registerSite00DesignPilot } from '../p0vr3a/site00PilotRegistration.js';
import { registerNdxbookDesignPilot } from '../p0vr2/ndxPilotRegistration.js';
import { hydratePersistentImplementationSnapshots } from '../p0vr3e/hydratePersistentImplementationSnapshots.js';
import { captureAccountDraftSnapshotsOnly } from '../p0vr3j/accountAuthenticatedCapture.js';
import { buildComposerDraftReviewSession } from '../p0vr3j/composerDraftReviewSession.js';
import { deriveMissingTargetFromFamily } from '../p0vr3l/familyDerivation.js';
import { getFamilyDerivedRecord } from '../p0vr3l/derivationStore.js';
import type { AccountRecaptureResult } from '../p0vr3j/accountAuthenticatedCapture.js';
import type {
  CaptureExecutionMetrics,
  PreparedCaptureExecutionReport,
  P0_VR_3J2_LINEAGE,
} from './types.js';
import { VOICE_LAB_TARGET_ID } from './types.js';
import { buildVoiceLabSourceDerivedReview } from './voiceLabReviewSession.js';

export type ExecutePreparedCapturesInput = {
  baseUrl?: string;
  repoRoot?: string;
  forceAccount?: boolean;
  forceVoiceLab?: boolean;
  skipAccount?: boolean;
  skipVoiceLab?: boolean;
};

export async function executePreparedCaptures(
  input?: ExecutePreparedCapturesInput,
): Promise<PreparedCaptureExecutionReport> {
  const repoRoot = input?.repoRoot ?? process.cwd();
  const baseUrl = input?.baseUrl ?? process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';

  registerSite00DesignPilot();
  registerNdxbookDesignPilot();
  await hydratePersistentImplementationSnapshots({ repoRoot, force: true });

  let accountResult: AccountRecaptureResult & { action: 'capture_account_drafts' } = {
    action: 'capture_account_drafts',
    attempted: 0,
    successful: 0,
    skippedReuse: 3,
    results: [],
    failures: [],
  };

  if (!input?.skipAccount) {
    accountResult = {
      ...accountResult,
      ...(await captureAccountDraftSnapshotsOnly({
        baseUrl,
        force: input?.forceAccount,
      })),
      action: 'capture_account_drafts',
    };
  }

  let voiceLabDerivation: Awaited<ReturnType<typeof deriveMissingTargetFromFamily>> | null = null;

  if (!input?.skipVoiceLab) {
    const existing = getFamilyDerivedRecord(VOICE_LAB_TARGET_ID);
    if (!existing || input?.forceVoiceLab) {
      voiceLabDerivation = await deriveMissingTargetFromFamily(VOICE_LAB_TARGET_ID, { baseUrl });
    } else {
      voiceLabDerivation = {
        record: existing,
        receipt: {
          receiptId: `derivation:${VOICE_LAB_TARGET_ID}:reused`,
          targetId: VOICE_LAB_TARGET_ID,
          projectId: existing.projectId,
          sourceSiblingId: existing.sourceSiblingId,
          sharedShellId: existing.sharedShellId,
          sourceSnapshotLabel: 'FAMILY SOURCE · EXISTING IMPLEMENTATION',
          targetSnapshotLabel: 'CURRENT · COMPOSER DERIVED DRAFT',
          createdAt: existing.derivedAt,
          lineage: existing.createdBySprint,
        },
        queueStatus: 'DERIVED_DRAFT' as const,
        newRouteCreated: false,
        registrationOnly: true,
      };
    }
  }

  const site00ReviewSession = await buildComposerDraftReviewSession({ repoRoot });
  const voiceLabReview = buildVoiceLabSourceDerivedReview(VOICE_LAB_TARGET_ID);

  const metrics: CaptureExecutionMetrics = {
    existingReused: site00ReviewSession.coverage.persistentReused,
    accountNew: accountResult.successful,
    sourceSiblingNew: 0,
    voiceLabNew: 0,
    totalNew: accountResult.successful,
    failed: accountResult.failures.length,
  };

  if (!voiceLabReview.source.complete) metrics.sourceSiblingNew = 3;
  if (!voiceLabReview.derived.complete) metrics.voiceLabNew = 3;
  metrics.totalNew = metrics.accountNew + metrics.sourceSiblingNew + metrics.voiceLabNew;

  return {
    lineage: 'P0.VR.3J.2-SITE00' as typeof P0_VR_3J2_LINEAGE,
    executedAt: new Date().toISOString(),
    baseUrl,
    account: accountResult,
    site00ReviewSession,
    site00Health: site00ReviewSession.health,
    voiceLab: { ...voiceLabReview, derivationResult: voiceLabDerivation },
    metrics,
    propagationDefault: 'TARGET_ONLY',
    propagationApplied: false,
  };
}
