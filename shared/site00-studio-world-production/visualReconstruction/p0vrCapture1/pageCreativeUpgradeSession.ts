/**
 * P0.VR.CAPTURE.1 — Page creative upgrade session (wizard state).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { buildPageCreativeDiagnosis } from './pageCreativeDiagnosis.js';
import { buildPageCreativeDirectionPlan } from './pageCreativeDirectionPlan.js';
import { buildPageVisualDiagnosis } from './pageVisualDiagnosis.js';
import { buildReconstructionPlan } from './reconstructionPlan.js';
import { createTwinSessionFromApprovedDirection } from '../p0vrUpgrade2/reconstructionTwinSession.js';
import type { PageCreativeUpgradeSession, PageCreativeUpgradeStatus } from './types.js';

const sessions = new Map<string, PageCreativeUpgradeSession>();

function sessionKey(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return `${projectId}::${pageId}::${viewport}`;
}

export function openPageCreativeUpgradeSession(options: {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  captureId: string;
  parentAuthorityId?: string | null;
  childArchetype?: string | null;
  pagePurpose: string;
  parentAuthorityLabel: string;
  route: string;
  isChildPage?: boolean;
  isRoot?: boolean;
  designAuthorityVersionId?: string | null;
  designAuthorityAssetRef?: string | null;
  captureAssetRef?: string | null;
}): PageCreativeUpgradeSession {
  const isRoot = options.isRoot ?? false;
  const hasCapture = Boolean(options.captureAssetRef);
  const hasAuthority = Boolean(options.designAuthorityAssetRef);
  const visualDiagnosis = buildPageVisualDiagnosis({
    isRootPage: isRoot,
    viewport: options.viewport,
    pagePurpose: options.pagePurpose,
  });
  const diagnosis = buildPageCreativeDiagnosis({
    isChildPage: !isRoot && (options.isChildPage ?? true),
    isRootPage: isRoot,
    viewport: options.viewport,
    missingParentGrammar: !isRoot,
    pagePurpose: options.pagePurpose,
  });
  const reconstructionPlan = buildReconstructionPlan({
    pageId: options.pageId,
    viewport: options.viewport,
    authorityVersionId: options.designAuthorityVersionId ?? null,
    captureId: options.captureId,
    route: options.route,
    pagePurpose: options.pagePurpose,
    isRootPage: isRoot,
    diagnosis: visualDiagnosis,
  });
  const plan = buildPageCreativeDirectionPlan({
    pagePurpose: options.pagePurpose,
    parentAuthorityLabel: isRoot ? options.pagePurpose : options.parentAuthorityLabel,
    childArchetype: options.childArchetype,
    route: options.route,
    isRootPage: isRoot,
  });
  let status: PageCreativeUpgradeStatus = 'AWAITING_CAPTURE';
  if (hasCapture && hasAuthority) {
    status = 'COMPARE_READY';
  } else if (!hasCapture) {
    status = 'AWAITING_CAPTURE';
  }
  const session: PageCreativeUpgradeSession = {
    sessionId: `upgrade_${options.projectId}_${Date.now()}`,
    projectId: options.projectId,
    pageId: options.pageId,
    viewport: options.viewport,
    captureId: options.captureId,
    parentAuthorityId: isRoot ? null : (options.parentAuthorityId ?? null),
    childArchetype: options.childArchetype ?? null,
    isRoot,
    route: options.route,
    pagePurpose: options.pagePurpose,
    founderNote: null,
    currentDiagnosis: diagnosis,
    visualDiagnosis,
    reconstructionPlan,
    creativeDirectionPlan: plan,
    status: hasCapture && hasAuthority ? 'DIRECTION_READY' : status,
    approvedAt: null,
    afterCaptureId: null,
    designAuthorityVersionId: options.designAuthorityVersionId ?? null,
    designAuthorityAssetRef: options.designAuthorityAssetRef ?? null,
    captureAssetRef: options.captureAssetRef ?? null,
    beforeImageRenderable: hasCapture,
    referenceImageRenderable: hasAuthority,
  };
  sessions.set(sessionKey(options.projectId, options.pageId, options.viewport), session);
  return session;
}

export function getPageCreativeUpgradeSession(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageCreativeUpgradeSession | null {
  return sessions.get(sessionKey(projectId, pageId, viewport)) ?? null;
}

export function approvePageCreativeDirection(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;
  const updated: PageCreativeUpgradeSession = {
    ...session,
    status: 'DIRECTION_APPROVED',
    reconstructionPlan: session.reconstructionPlan
      ? { ...session.reconstructionPlan, status: 'APPROVED' }
      : null,
    approvedAt: new Date().toISOString(),
  };
  sessions.set(sessionKey(projectId, pageId, viewport), updated);
  if (updated.reconstructionPlan && updated.designAuthorityVersionId) {
    createTwinSessionFromApprovedDirection({
      projectId,
      pageId,
      viewport,
      canonicalRoute: updated.route,
      authorityVersionId: updated.designAuthorityVersionId,
      beforeCaptureId: updated.captureId,
      captureAssetRef: updated.captureAssetRef ?? null,
      plan: updated.reconstructionPlan,
      isRootPage: updated.isRoot,
    });
  }
  return updated;
}

export function setPageCreativeUpgradeFounderNote(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  note: string,
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;
  const updated = { ...session, founderNote: note.trim() || null };
  sessions.set(sessionKey(projectId, pageId, viewport), updated);
  return updated;
}

export function markPageCreativeUpgradeStatus(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  status: PageCreativeUpgradeStatus,
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;
  const updated = { ...session, status };
  sessions.set(sessionKey(projectId, pageId, viewport), updated);
  return updated;
}

export function attachAfterCaptureToSession(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
  afterCaptureId: string,
): PageCreativeUpgradeSession | null {
  const session = getPageCreativeUpgradeSession(projectId, pageId, viewport);
  if (!session) return null;
  const updated: PageCreativeUpgradeSession = {
    ...session,
    afterCaptureId,
    status: 'COMPLETE',
  };
  sessions.set(sessionKey(projectId, pageId, viewport), updated);
  return updated;
}

export function resetPageCreativeUpgradeSessionsForTest(): void {
  sessions.clear();
}
