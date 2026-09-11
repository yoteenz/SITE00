/**
 * P0.VR.CAPTURE.1 — Page creative upgrade session (wizard state).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { buildPageCreativeDiagnosis } from './pageCreativeDiagnosis.js';
import { buildPageCreativeDirectionPlan } from './pageCreativeDirectionPlan.js';
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
}): PageCreativeUpgradeSession {
  const isRoot = options.isRoot ?? false;
  const diagnosis = buildPageCreativeDiagnosis({
    isChildPage: !isRoot && (options.isChildPage ?? true),
    isRootPage: isRoot,
    viewport: options.viewport,
    missingParentGrammar: !isRoot,
  });
  const plan = buildPageCreativeDirectionPlan({
    pagePurpose: options.pagePurpose,
    parentAuthorityLabel: isRoot ? options.pagePurpose : options.parentAuthorityLabel,
    childArchetype: options.childArchetype,
    route: options.route,
    isRootPage: isRoot,
  });
  const session: PageCreativeUpgradeSession = {
    sessionId: `upgrade_${options.projectId}_${Date.now()}`,
    projectId: options.projectId,
    pageId: options.pageId,
    viewport: options.viewport,
    captureId: options.captureId,
    parentAuthorityId: isRoot ? null : (options.parentAuthorityId ?? null),
    childArchetype: options.childArchetype ?? null,
    isRoot,
    currentDiagnosis: diagnosis,
    creativeDirectionPlan: plan,
    status: 'DIRECTION_READY',
    approvedAt: null,
    afterCaptureId: null,
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
    status: 'APPROVED',
    approvedAt: new Date().toISOString(),
  };
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
