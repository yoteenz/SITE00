import type { ProjectNotification, ProjectMessage, StudioWorldProjectEvent } from './types.js';
import { dedupeProjectNotifications } from './deduplication.js';
import { projectEventToNotification } from './eventAdapter.js';
import { resolveNotificationActionHref } from './deepLinks.js';

const notificationsByProject = new Map<string, ProjectNotification[]>();
const messagesByProject = new Map<string, ProjectMessage[]>();

export function listProjectNotifications(projectId: string): ProjectNotification[] {
  return [...(notificationsByProject.get(projectId) ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function listProjectMessages(projectId: string): ProjectMessage[] {
  return [...(messagesByProject.get(projectId) ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function upsertProjectNotifications(projectId: string, incoming: ProjectNotification[]): ProjectNotification[] {
  const merged = dedupeProjectNotifications([...listProjectNotifications(projectId), ...incoming]);
  notificationsByProject.set(projectId, merged);
  return merged;
}

export function replaceProjectNotifications(projectId: string, notifications: ProjectNotification[]): ProjectNotification[] {
  const merged = dedupeProjectNotifications(notifications);
  notificationsByProject.set(projectId, merged);
  return merged;
}

export function markProjectNotificationRead(projectId: string, notificationId: string): ProjectNotification | null {
  const list = listProjectNotifications(projectId);
  const idx = list.findIndex((n) => n.id === notificationId);
  if (idx < 0) return null;
  const updated: ProjectNotification = {
    ...list[idx],
    status: 'READ',
    readAt: new Date().toISOString(),
  };
  list[idx] = updated;
  notificationsByProject.set(projectId, list);
  return updated;
}

export function markAllProjectNotificationsRead(projectId: string): number {
  const now = new Date().toISOString();
  let count = 0;
  const list = listProjectNotifications(projectId).map((n) => {
    if (n.status !== 'UNREAD') return n;
    count += 1;
    return { ...n, status: 'READ' as const, readAt: now };
  });
  notificationsByProject.set(projectId, list);
  return count;
}

export function ingestProjectEvent(event: StudioWorldProjectEvent): ProjectNotification | null {
  const notification = projectEventToNotification(event);
  if (!notification) return null;
  upsertProjectNotifications(event.projectId, [notification]);
  return notification;
}

export function ensureNotificationActionTargets(notifications: ProjectNotification[]): ProjectNotification[] {
  return notifications.map((n) => ({
    ...n,
    actionTarget: n.actionTarget ?? resolveNotificationActionHref(n.projectId, n),
  }));
}

export function resetProjectNotificationsMemory(): void {
  notificationsByProject.clear();
  messagesByProject.clear();
}
