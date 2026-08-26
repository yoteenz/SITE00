/**
 * P0.VR.3J.1 — Account-only authenticated composer draft recapture.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { COMPOSER_DRAFT_SNAPSHOT_LABEL } from '../p0vr3h/constants.js';
import { composerDraftCaptureRoute } from '../p0vr3h/composerDraftSnapshots.js';
import { captureImplementationSnapshot } from '../p0vr3e/implementationSnapshotCaptureEngine.js';
import { hasValidComposerDraftSnapshot } from './snapshotRegistryHealth.js';
import { SITE00_COMPOSER_DRAFT_VIEWPORTS } from './constants.js';
import type { ImplementationSnapshotRecord } from '../p0vr3e/types.js';

export const ACCOUNT_DRAFT_SCREEN_ID = 'account-profile' as const;

export type AccountRecaptureResult = {
  attempted: number;
  successful: number;
  skippedReuse: number;
  results: ImplementationSnapshotRecord[];
  failures: Array<{ viewport: DesignViewportClass; error: string }>;
};

export async function captureAccountDraftSnapshotsOnly(input?: {
  baseUrl?: string;
  force?: boolean;
}): Promise<AccountRecaptureResult> {
  const results: ImplementationSnapshotRecord[] = [];
  const failures: AccountRecaptureResult['failures'] = [];
  let skippedReuse = 0;
  let successful = 0;

  let attempted = 0;

  for (const viewportClass of SITE00_COMPOSER_DRAFT_VIEWPORTS) {
    if (!input?.force && hasValidComposerDraftSnapshot(ACCOUNT_DRAFT_SCREEN_ID, viewportClass)) {
      skippedReuse++;
      continue;
    }

    attempted++;
    const snap = await captureImplementationSnapshot({
      projectId: 'site00',
      screenId: ACCOUNT_DRAFT_SCREEN_ID,
      viewportClass,
      baseUrl: input?.baseUrl,
      route: composerDraftCaptureRoute('/account'),
      snapshotLabel: COMPOSER_DRAFT_SNAPSHOT_LABEL,
      authContext: 'CUSTOMER',
    });

    if (snap) {
      results.push(snap);
      if (snap.captureStatus === 'CURRENT' && snap.qaPassed) successful++;
      else failures.push({ viewport: viewportClass, error: snap.error ?? snap.qaIssues.join(',') ?? 'CAPTURE_FAILED' });
    } else {
      failures.push({ viewport: viewportClass, error: 'CAPTURE_TARGET_UNRESOLVED' });
    }
  }

  return {
    attempted,
    successful,
    skippedReuse,
    results,
    failures,
  };
}
