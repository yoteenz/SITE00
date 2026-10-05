/**
 * P0.VR.3J — Composer draft screenshot backfill (P0.VR.3E integration).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { COMPOSER_DRAFT_SNAPSHOT_LABEL } from '../p0vr3h/constants.js';
import {
  buildComposerDraftCaptureTargets,
  composerDraftCaptureRoute,
  type ComposerDraftCaptureTarget,
} from '../p0vr3h/composerDraftSnapshots.js';
import { captureImplementationSnapshot } from '../p0vr3e/implementationSnapshotCaptureEngine.js';
import {
  getLatestImplementationSnapshot,
  registerImplementationSnapshotBatch,
  updateImplementationSnapshotBatch,
} from '../p0vr3e/implementationSnapshotRegistry.js';
import { hasValidComposerDraftSnapshot } from './snapshotRegistryHealth.js';
import type { ImplementationSnapshotRecord } from '../p0vr3e/types.js';
import {
  SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS,
  SITE00_COMPOSER_DRAFT_VIEWPORTS,
} from './constants.js';
import type { ComposerDraftBackfillCoverage, ComposerDraftCaptureResult, ComposerDraftScreenshotQa } from './types.js';

export function listComposerDraftCaptureTargets(): ComposerDraftCaptureTarget[] {
  return buildComposerDraftCaptureTargets();
}

export function countComposerDraftCaptureTargets(): number {
  return listComposerDraftCaptureTargets().length * SITE00_COMPOSER_DRAFT_VIEWPORTS.length;
}

export function expectedComposerDraftCaptureTargets(): number {
  return SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS;
}

function tallyViewport(
  viewport: DesignViewportClass,
  results: ImplementationSnapshotRecord[],
): { attempted: number; successful: number } {
  const filtered = results.filter((r) => r.viewportClass === viewport);
  return {
    attempted: filtered.length,
    successful: filtered.filter((r) => r.captureStatus === 'CURRENT' && r.qaPassed).length,
  };
}

export async function captureComposerDraftSnapshots(input?: {
  baseUrl?: string;
  concurrency?: number;
}): Promise<ComposerDraftCaptureResult> {
  const targets = listComposerDraftCaptureTargets();
  const viewports = [...SITE00_COMPOSER_DRAFT_VIEWPORTS];
  const batchId = `batch-composer-drafts-site00-${Date.now()}`;
  const planned = targets.length * viewports.length;

  registerImplementationSnapshotBatch({
    batchId,
    projectId: 'site00',
    status: 'CAPTURING',
    viewports,
    screenIds: targets.map((t) => t.screenId),
    planned,
    complete: 0,
    capturing: planned,
    queued: 0,
    failed: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
  });

  const results: ImplementationSnapshotRecord[] = [];
  const failures: ComposerDraftCaptureResult['failures'] = [];
  let skippedReuse = 0;

  for (const target of targets) {
    for (const viewportClass of viewports) {
      if (hasValidComposerDraftSnapshot(target.screenId, viewportClass)) {
        skippedReuse++;
        const existing = getLatestImplementationSnapshot('site00', target.screenId, viewportClass);
        if (existing) results.push(existing);
        continue;
      }

      const snap = await captureImplementationSnapshot({
        projectId: target.projectId,
        screenId: target.screenId,
        viewportClass,
        baseUrl: input?.baseUrl,
        route: composerDraftCaptureRoute(target.route),
        snapshotLabel: COMPOSER_DRAFT_SNAPSHOT_LABEL,
      });

      if (snap) {
        results.push(snap);
        if (snap.captureStatus !== 'CURRENT' || !snap.qaPassed) {
          failures.push({
            screenId: target.screenId,
            viewport: viewportClass,
            error: snap.error ?? snap.qaIssues.join(', ') ?? 'CAPTURE_FAILED',
          });
        }
      } else {
        failures.push({
          screenId: target.screenId,
          viewport: viewportClass,
          error: 'CAPTURE_TARGET_UNRESOLVED',
        });
      }
    }
  }

  const successful = results.filter((r) => r.captureStatus === 'CURRENT' && r.qaPassed).length;
  const failed = failures.length;

  updateImplementationSnapshotBatch(batchId, {
    status: failed > 0 && successful > 0 ? 'PARTIAL' : failed > 0 ? 'FAILED_PARTIAL' : 'COMPLETE',
    complete: successful,
    failed,
    capturing: 0,
    completedAt: new Date().toISOString(),
  });

  return {
    targetCount: planned,
    attempted: results.length,
    successful,
    failed,
    mobile: tallyViewport('mobile', results),
    tablet: tallyViewport('tablet', results),
    desktop: tallyViewport('desktop', results),
    snapshots: results.map((r) => ({
      screenId: r.designScreenId,
      viewport: r.viewportClass,
      status: r.captureStatus,
      publicUrl: r.publicUrl,
    })),
    failures,
    storage: COMPOSER_DRAFT_SNAPSHOT_LABEL,
    label: COMPOSER_DRAFT_SNAPSHOT_LABEL,
    skippedReuse,
  };
}

export function buildComposerDraftScreenshotQa(): ComposerDraftScreenshotQa {
  const qa: ComposerDraftScreenshotQa = {
    wrongRoute: 0,
    authRedirect: 0,
    blank: 0,
    brokenAssets: 0,
    fontFailures: 0,
    viewportFailures: 0,
    other: 0,
  };

  for (const target of listComposerDraftCaptureTargets()) {
    for (const viewport of SITE00_COMPOSER_DRAFT_VIEWPORTS) {
      const snap = getLatestImplementationSnapshot('site00', target.screenId, viewport);
      if (!snap) continue;
      for (const issue of snap.qaIssues) {
        if (issue === 'WRONG_ROUTE') qa.wrongRoute++;
        else if (issue === 'AUTH_REDIRECT') qa.authRedirect++;
        else if (issue === 'BLANK_PAGE' || issue === 'ZERO_CONTENT') qa.blank++;
        else if (issue === 'BROKEN_IMAGES') qa.brokenAssets++;
        else if (issue === 'FONT_NOT_READY') qa.fontFailures++;
        else if (issue === 'WRONG_VIEWPORT') qa.viewportFailures++;
        else qa.other++;
      }
    }
  }

  return qa;
}

export function buildComposerDraftBackfillCoverage(): ComposerDraftBackfillCoverage {
  const targets = listComposerDraftCaptureTargets();
  const byViewport = {
    mobile: { attempted: 0, successful: 0 },
    tablet: { attempted: 0, successful: 0 },
    desktop: { attempted: 0, successful: 0 },
  };

  let attempted = 0;
  let successful = 0;

  for (const target of targets) {
    for (const viewport of SITE00_COMPOSER_DRAFT_VIEWPORTS) {
      const snap = getLatestImplementationSnapshot('site00', target.screenId, viewport);
      attempted++;
      byViewport[viewport].attempted++;
      if (snap?.captureStatus === 'CURRENT' && snap.qaPassed) {
        successful++;
        byViewport[viewport].successful++;
      }
    }
  }

  return {
    expected: expectedComposerDraftCaptureTargets(),
    attempted,
    successful,
    failed: attempted - successful,
    byViewport,
  };
}

export function resolveComposerDraftSnapshotLabel(
  record: ImplementationSnapshotRecord | null,
): typeof COMPOSER_DRAFT_SNAPSHOT_LABEL | 'CURRENT LIVE' {
  if (!record) return 'CURRENT LIVE';
  if (record.snapshotLabel === COMPOSER_DRAFT_SNAPSHOT_LABEL) return COMPOSER_DRAFT_SNAPSHOT_LABEL;
  const target = listComposerDraftCaptureTargets().find((t) => t.screenId === record.designScreenId);
  if (target) return COMPOSER_DRAFT_SNAPSHOT_LABEL;
  return 'CURRENT LIVE';
}
