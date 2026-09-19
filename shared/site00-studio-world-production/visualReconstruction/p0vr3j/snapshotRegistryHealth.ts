/**
 * P0.VR.3J.1 — Snapshot registry health + composer draft review coverage metrics.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { ImplementationSnapshotRecord } from '../p0vr3e/types.js';
import { SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS } from '../p0vr3j/constants.js';
import { buildComposerDraftCaptureTargets } from '../p0vr3h/composerDraftSnapshots.js';
import {
  getLatestImplementationSnapshot,
  listImplementationSnapshotsForScreen,
} from '../p0vr3e/implementationSnapshotRegistry.js';
import {
  loadPersistentImplementationSnapshotRegistry,
  resolveLatestPersistentSnapshots,
} from '../p0vr3e/implementationSnapshotPersistentStore.js';
import { buildEnrichedComposerReviewQueue } from './reviewReadiness.js';

export type SnapshotRegistryHealth = {
  expected: number;
  persistentFound: number;
  hydrated: number;
  valid: number;
  stale: number;
  missing: number;
  failed: number;
  orphaned: number;
  storageMissing: number;
  sessionDependency: boolean;
  persistentReused: number;
  newCaptureCount: number;
  recapturedUnnecessarily: number;
};

export type ComposerDraftReviewCoverage = {
  draftPages: number;
  snapshotCompletePages: number;
  readyForReview: number;
  contentBlocked: number;
  creativeDirectionRequired: number;
  functionalReviewRequired: number;
  approved: number;
  live: number;
  expectedScreenshots: number;
  validScreenshots: number;
  persistentReused: number;
  newCaptures: number;
  failedCaptures: number;
};

export function buildSnapshotRegistryHealth(
  repoRoot: string,
  input?: { storageMissing?: number; orphaned?: number; newCaptureCount?: number; recapturedUnnecessarily?: number },
): SnapshotRegistryHealth {
  const registry = loadPersistentImplementationSnapshotRegistry(repoRoot);
  const latestPersistent = resolveLatestPersistentSnapshots(registry);
  const composerScreenIds = new Set(buildComposerDraftCaptureTargets().map((t) => t.screenId));

  let valid = countValidComposerDraftSnapshots();
  let failed = countFailedComposerDraftSnapshots();
  let stale = 0;
  let orphaned = input?.orphaned ?? 0;
  let persistentReused = 0;

  for (const record of latestPersistent.values()) {
    if (!composerScreenIds.has(record.designScreenId)) orphaned++;
    if (record.stale || record.captureStatus === 'STALE' || record.captureStatus === 'POSSIBLY_STALE') stale++;
    if (record.captureStatus === 'CURRENT' && record.qaPassed) persistentReused++;
  }

  const inMemoryValid = valid;
  if (inMemoryValid > persistentReused) {
    persistentReused = Math.min(persistentReused, inMemoryValid - (input?.newCaptureCount ?? 0));
  }

  return {
    expected: SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS,
    persistentFound: latestPersistent.size,
    hydrated: latestPersistent.size,
    valid: inMemoryValid,
    stale,
    missing: Math.max(0, SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS - inMemoryValid),
    failed,
    orphaned,
    storageMissing: input?.storageMissing ?? 0,
    sessionDependency: false,
    persistentReused: Math.max(0, inMemoryValid - (input?.newCaptureCount ?? 0)),
    newCaptureCount: input?.newCaptureCount ?? Math.max(0, inMemoryValid - persistentReused),
    recapturedUnnecessarily: input?.recapturedUnnecessarily ?? 0,
  };
}

export function buildComposerDraftReviewCoverage(): ComposerDraftReviewCoverage {
  const queue = buildEnrichedComposerReviewQueue();
  const validScreenshots = countValidComposerDraftSnapshots();
  const failedCaptures = countFailedComposerDraftSnapshots();
  const newCaptures = Math.max(0, validScreenshots - 24);
  return {
    draftPages: queue.length,
    snapshotCompletePages: queue.filter((q) => q.screenshotComplete).length,
    readyForReview: queue.filter((q) => q.readinessStatus === 'READY_FOR_REVIEW').length,
    contentBlocked: queue.filter((q) => q.readinessStatus === 'NEEDS_CONTENT_REVIEW').length,
    creativeDirectionRequired: queue.filter((q) => q.readinessStatus === 'NEEDS_CREATIVE_DIRECTION').length,
    functionalReviewRequired: queue.filter((q) => q.readinessStatus === 'NEEDS_FUNCTIONAL_REVIEW').length,
    approved: 0,
    live: 0,
    expectedScreenshots: SITE00_COMPOSER_DRAFT_EXPECTED_CAPTURE_TARGETS,
    validScreenshots,
    persistentReused: Math.max(0, validScreenshots - newCaptures),
    newCaptures,
    failedCaptures,
  };
}

function countValidComposerDraftSnapshots(): number {
  let n = 0;
  for (const target of buildComposerDraftCaptureTargets()) {
    for (const viewport of ['mobile', 'tablet', 'desktop'] as const) {
      const snap = getLatestImplementationSnapshot('site00', target.screenId, viewport);
      if (snap?.captureStatus === 'CURRENT' && snap.qaPassed) n++;
    }
  }
  return n;
}

function countFailedComposerDraftSnapshots(): number {
  let n = 0;
  for (const target of buildComposerDraftCaptureTargets()) {
    for (const viewport of ['mobile', 'tablet', 'desktop'] as const) {
      const snap = getLatestImplementationSnapshot('site00', target.screenId, viewport);
      if (snap && (snap.captureStatus === 'AUTH_BLOCKED' || snap.captureStatus === 'FAILED')) n++;
    }
  }
  return n;
}

export function listOrphanedPersistentSnapshots(repoRoot: string): ImplementationSnapshotRecord[] {
  const registry = loadPersistentImplementationSnapshotRegistry(repoRoot);
  const composerScreenIds = new Set(buildComposerDraftCaptureTargets().map((t) => t.screenId));
  const latest = resolveLatestPersistentSnapshots(registry);
  return [...latest.values()].filter((r) => !composerScreenIds.has(r.designScreenId));
}

export function hasValidComposerDraftSnapshot(screenId: string, viewport: DesignViewportClass): boolean {
  const snap = getLatestImplementationSnapshot('site00', screenId, viewport);
  return Boolean(snap?.captureStatus === 'CURRENT' && snap.qaPassed && snap.publicUrl);
}

export function countHistoricalSnapshots(screenId: string, viewport: DesignViewportClass, repoRoot?: string): number {
  const inMemory = listImplementationSnapshotsForScreen('site00', screenId, viewport).length;
  if (inMemory > 1) return inMemory;
  if (repoRoot) {
    const registry = loadPersistentImplementationSnapshotRegistry(repoRoot);
    return registry.records.filter(
      (r) => r.designScreenId === screenId && r.viewportClass === viewport,
    ).length;
  }
  return inMemory;
}
