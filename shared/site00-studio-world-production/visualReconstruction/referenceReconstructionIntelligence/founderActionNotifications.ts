/**
 * Founder action → notification bridge (single source of truth).
 * P0.VR.6R8 — UX repackaging: ASSETS alerts + bell integration.
 */

import type { ProjectNotification } from '../../projectNotifications/types.js';
import type { DesignFounderAction, FounderActionType } from './founderAction.js';

const READ_STORAGE_KEY = 'site00-founder-action-read-v1';

const PRIORITY_ORDER = { BLOCKING: 0, HIGH: 1, NORMAL: 2 } as const;

export function isActiveFounderAction(action: DesignFounderAction): boolean {
  return action.status === 'PENDING' || action.status === 'IN_REVIEW';
}

export function sortFounderActionsByPriority(actions: DesignFounderAction[]): DesignFounderAction[] {
  return [...actions].sort((a, b) => {
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pd !== 0) return pd;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/** One notification per job gate — prefer ASSETS workspace mirror. */
export function dedupeFounderActionsForNotifications(actions: DesignFounderAction[]): DesignFounderAction[] {
  const map = new Map<string, DesignFounderAction>();
  for (const action of sortFounderActionsByPriority(actions.filter(isActiveFounderAction))) {
    const key = `${action.jobId}:${action.actionType}`;
    const existing = map.get(key);
    if (!existing || action.workspace === 'ASSETS') {
      map.set(key, action);
    }
  }
  return sortFounderActionsByPriority(Array.from(map.values()));
}

export function getAssetsAlertActions(actions: DesignFounderAction[], limit = 3): DesignFounderAction[] {
  return sortFounderActionsByPriority(
    actions.filter((a) => a.workspace === 'ASSETS' && isActiveFounderAction(a) && a.blocking),
  ).slice(0, limit);
}

export function countUnreadFounderActionNotifications(
  actions: DesignFounderAction[],
  readState: Record<string, string>,
): number {
  return dedupeFounderActionsForNotifications(actions).filter((a) => !readState[a.actionId]).length;
}

export function loadFounderActionReadState(): Record<string, string> {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveFounderActionReadState(state: Record<string, string>): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(READ_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function markFounderActionNotificationRead(actionId: string): Record<string, string> {
  const next = { ...loadFounderActionReadState(), [actionId]: new Date().toISOString() };
  saveFounderActionReadState(next);
  return next;
}

export function markAllFounderActionNotificationsRead(actionIds: string[]): Record<string, string> {
  const now = new Date().toISOString();
  const next = { ...loadFounderActionReadState() };
  for (const id of actionIds) next[id] = now;
  saveFounderActionReadState(next);
  return next;
}

export function founderActionNotificationTitle(actionType: FounderActionType): string {
  switch (actionType) {
    case 'REVIEW_CROPS':
      return 'CROP REVIEW REQUIRED';
    case 'APPROVE_GENERATION':
      return 'GENERATION APPROVAL REQUIRED';
    case 'REVIEW_OUTPUTS':
      return 'OUTPUT REVIEW REQUIRED';
    case 'APPROVE_REGENERATION':
      return 'REGENERATION APPROVAL REQUIRED';
    case 'REVIEW_BINDINGS':
      return 'BINDING REVIEW REQUIRED';
    case 'REVIEW_VISUAL_MATCH':
      return 'VISUAL MATCH REVIEW';
    case 'REVIEW_AUTHORITY_BOUNDARY':
      return 'AUTHORITY BOUNDARY REVIEW';
    default:
      return 'FOUNDER ACTION REQUIRED';
  }
}

export function founderActionAlertHeadline(action: DesignFounderAction): string {
  switch (action.actionType) {
    case 'REVIEW_CROPS': {
      const total = Number(action.context.total ?? action.context.detected ?? 0);
      const ready = Number(action.context.ready ?? 0);
      const editRequired = Number(action.context.editRequired ?? 0);
      const approved = Number(action.context.cropsApproved ?? 0);
      return `${total} ASSETS DETECTED · ${ready} READY · ${editRequired} NEED EDITS · ${approved} APPROVED`;
    }
    case 'APPROVE_GENERATION':
      return 'RECONSTRUCTION PLAN READY';
    case 'REVIEW_OUTPUTS':
      return `${Number(action.context.outputCount ?? 0)} OUTPUTS READY`;
    default:
      return action.title;
  }
}

export function founderActionAlertSubline(action: DesignFounderAction): string {
  switch (action.actionType) {
    case 'REVIEW_CROPS':
      return 'GENERATION BLOCKED UNTIL CROPS APPROVED';
    case 'APPROVE_GENERATION':
      return 'NO DISPATCH UNTIL APPROVED';
    case 'REVIEW_OUTPUTS':
      return 'REVIEW BEFORE BINDING';
    default:
      return action.summary.split('·')[0]?.trim() ?? action.summary;
  }
}

export function founderActionNotificationBody(action: DesignFounderAction): string {
  const screen = String(action.context.screenLabel ?? 'SKINS MOBILE');
  switch (action.actionType) {
    case 'REVIEW_CROPS': {
      const total = Number(action.context.total ?? action.context.detected ?? 0);
      const editRequired = Number(action.context.editRequired ?? 0);
      const ready = Number(action.context.ready ?? 0);
      return `${screen}: ${total} assets detected, ${ready} ready, ${editRequired} need edits. Generation blocked.`;
    }
    case 'APPROVE_GENERATION':
      return `${screen} reconstruction plan is ready. Review prompts before dispatch.`;
    case 'REVIEW_OUTPUTS':
      return `${Number(action.context.outputCount ?? 0)} outputs from ${screen} need your review.`;
    default:
      return action.summary.replace(/cropApprovalStatus=\w+/gi, '').trim() || action.title;
  }
}

export function founderActionCtaLabel(actionType: FounderActionType): string {
  switch (actionType) {
    case 'REVIEW_CROPS':
      return 'REVIEW CROPS';
    case 'APPROVE_GENERATION':
      return 'REVIEW PLAN';
    case 'REVIEW_OUTPUTS':
      return 'REVIEW OUTPUTS';
    case 'APPROVE_REGENERATION':
      return 'APPROVE REGENERATION';
    case 'REVIEW_BINDINGS':
      return 'REVIEW BINDINGS';
    default:
      return 'OPEN';
  }
}

export function buildFounderActionDeepLinkHref(projectId: string, deepLink: string): string {
  const q = deepLink.startsWith('?') ? deepLink.slice(1) : deepLink;
  const params = new URLSearchParams(q);
  if (!params.has('tab')) params.set('tab', 'ASSETS');
  params.set('project', projectId);
  return `/projects/${encodeURIComponent(projectId)}/design?${params.toString()}`;
}

export function founderActionToProjectNotification(
  action: DesignFounderAction,
  readAt: string | null,
): ProjectNotification {
  const projectLabel = String(action.context.projectLabel ?? action.projectId.toUpperCase());
  const screenLabel = String(action.context.screenLabel ?? 'SKINS MOBILE');
  return {
    id: `founder-action-${action.actionId}`,
    projectId: action.projectId,
    type: 'FOUNDER_RECONSTRUCTION_ACTION',
    category: 'APPROVAL_REQUIRED',
    title: founderActionNotificationTitle(action.actionType),
    message: `${projectLabel} · ${screenLabel}\n${founderActionNotificationBody(action)}`,
    createdAt: action.createdAt,
    readAt,
    status: readAt ? 'READ' : 'UNREAD',
    priority: action.priority === 'BLOCKING' ? 'URGENT' : action.priority === 'HIGH' ? 'HIGH' : 'NORMAL',
    sourceSystem: 'REFERENCE_RECONSTRUCTION',
    sourceEntityType: 'GENERATION_RUN',
    sourceEntityId: action.jobId,
    actionType: 'REVIEW',
    actionTarget: buildFounderActionDeepLinkHref(action.projectId, action.deepLink),
    dedupeKey: `${action.jobId}:${action.actionType}`,
    metadata: {
      founderActionId: action.actionId,
      founderActionType: action.actionType,
      blocking: action.blocking,
      screenLabel,
      projectLabel,
    },
  };
}

export function syncFounderActionNotifications(
  actions: DesignFounderAction[],
  readState: Record<string, string> = loadFounderActionReadState(),
): ProjectNotification[] {
  return dedupeFounderActionsForNotifications(actions).map((action) =>
    founderActionToProjectNotification(action, readState[action.actionId] ?? null),
  );
}

export function resetFounderActionReadStateForTest(): void {
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(READ_STORAGE_KEY);
}
