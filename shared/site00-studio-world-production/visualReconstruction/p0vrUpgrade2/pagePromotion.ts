/**
 * P0.VR.UPGRADE.2 — Atomic promotion + recovery flows.
 */

import type {
  ArchivedPageVersion,
  LiveImplementationSnapshot,
  PageRecoveryReceipt,
  PromotionReceipt,
} from './types.js';
import {
  getImplementationVersion,
  getLiveRegistryEntry,
  promoteTwinToLive,
  registerImplementationVersion,
} from './pageImplementationRegistry.js';
import { canPromote } from './promotionReadiness.js';
import { getTwinSession, updateTwinSession } from './reconstructionTwinSession.js';

const snapshots = new Map<string, LiveImplementationSnapshot>();
const archives = new Map<string, ArchivedPageVersion>();
const promotions = new Map<string, PromotionReceipt>();
const recoveries = new Map<string, PageRecoveryReceipt>();

export function createLiveImplementationSnapshot(input: {
  projectId: string;
  pageId: string;
  route: string;
  implementationVersionId: string;
  captureId: string | null;
  reason: LiveImplementationSnapshot['reason'];
}): LiveImplementationSnapshot {
  const snapshot: LiveImplementationSnapshot = {
    snapshotId: `snap_${input.projectId}_${Date.now()}`,
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.route,
    implementationVersionId: input.implementationVersionId,
    captureId: input.captureId,
    createdAt: new Date().toISOString(),
    reason: input.reason,
    status: 'CREATED',
  };
  snapshots.set(snapshot.snapshotId, snapshot);
  return snapshot;
}

export function promoteTwinToLivePage(sessionId: string): PromotionReceipt | null {
  const session = getTwinSession(sessionId);
  if (!session || !session.twinVersionId) return null;
  if (!session.promotionReadiness || !canPromote(session.promotionReadiness)) {
    return null;
  }

  const promotionId = `promo_${sessionId}_${Date.now()}`;
  const receipt: PromotionReceipt = {
    promotionId,
    sessionId,
    pageId: session.pageId,
    fromVersionId: session.sourceLiveVersionId,
    toVersionId: session.twinVersionId,
    archivedVersionId: '',
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'PREPARING',
    errors: [],
  };
  promotions.set(promotionId, receipt);
  updateTwinSession(sessionId, { status: 'PROMOTING' });

  const snapshot = createLiveImplementationSnapshot({
    projectId: session.projectId,
    pageId: session.pageId,
    route: session.canonicalRoute,
    implementationVersionId: session.sourceLiveVersionId,
    captureId: session.beforeCaptureId,
    reason: 'PRE_PROMOTION',
  });

  const archive: ArchivedPageVersion = {
    archiveId: `arch_${snapshot.snapshotId}`,
    pageId: session.pageId,
    route: session.canonicalRoute,
    implementationVersionId: session.sourceLiveVersionId,
    captureId: session.beforeCaptureId,
    promotedOutAt: new Date().toISOString(),
    sourceSessionId: sessionId,
    status: 'ARCHIVED',
  };
  archives.set(archive.archiveId, archive);
  receipt.archivedVersionId = archive.archiveId;
  receipt.status = 'SWITCHING';

  const entry = promoteTwinToLive(session.projectId, session.pageId, session.twinVersionId);
  if (!entry) {
    receipt.status = 'FAILED';
    receipt.errors.push('Live registry update failed');
    promotions.set(promotionId, receipt);
    updateTwinSession(sessionId, { status: 'FAILED' });
    return receipt;
  }

  const twinVersion = getImplementationVersion(session.twinVersionId);
  if (twinVersion) {
    registerImplementationVersion({ ...twinVersion, status: 'LIVE' });
  }

  receipt.status = 'COMPLETE';
  receipt.completedAt = new Date().toISOString();
  promotions.set(promotionId, receipt);

  updateTwinSession(sessionId, {
    status: 'PROMOTED',
    promotedAt: receipt.completedAt,
  });

  return receipt;
}

export function restorePreviousLiveVersion(input: {
  projectId: string;
  pageId: string;
  archiveId: string;
  reason: string;
}): PageRecoveryReceipt | null {
  const archive = archives.get(input.archiveId);
  if (!archive || archive.status !== 'ARCHIVED') return null;

  const entry = getLiveRegistryEntry(input.projectId, input.pageId);
  if (!entry) return null;

  const currentLiveId = entry.liveVersionId;
  createLiveImplementationSnapshot({
    projectId: input.projectId,
    pageId: input.pageId,
    route: archive.route,
    implementationVersionId: currentLiveId,
    captureId: null,
    reason: 'PRE_RESTORE',
  });

  promoteTwinToLive(input.projectId, input.pageId, archive.implementationVersionId);

  const recovery: PageRecoveryReceipt = {
    recoveryId: `recv_${input.archiveId}_${Date.now()}`,
    fromVersionId: currentLiveId,
    toVersionId: archive.implementationVersionId,
    archiveId: input.archiveId,
    reason: input.reason,
    restoredAt: new Date().toISOString(),
    status: 'COMPLETE',
  };
  recoveries.set(recovery.recoveryId, recovery);
  archives.set(input.archiveId, { ...archive, status: 'RESTORED' });
  return recovery;
}

export function listArchivedVersionsForPage(pageId: string): ArchivedPageVersion[] {
  return [...archives.values()].filter((a) => a.pageId === pageId && a.status === 'ARCHIVED');
}

export function getPromotionReceipt(promotionId: string): PromotionReceipt | null {
  return promotions.get(promotionId) ?? null;
}

export function resetPagePromotionForTest(): void {
  snapshots.clear();
  archives.clear();
  promotions.clear();
  recoveries.clear();
}
