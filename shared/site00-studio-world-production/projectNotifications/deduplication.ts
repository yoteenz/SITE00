import type { ProjectNotification } from './types.js';

export function notificationDedupeKey(
  notification: Pick<ProjectNotification, 'projectId' | 'category' | 'sourceEntityType' | 'sourceEntityId' | 'title'>,
): string {
  return [
    notification.projectId,
    notification.category,
    notification.sourceEntityType ?? 'none',
    notification.sourceEntityId ?? 'none',
    notification.title.trim().toUpperCase(),
  ].join('::');
}

export function dedupeProjectNotifications(notifications: ProjectNotification[]): ProjectNotification[] {
  const byKey = new Map<string, ProjectNotification>();
  for (const item of notifications) {
    const key = item.dedupeKey ?? notificationDedupeKey(item);
    const existing = byKey.get(key);
    if (!existing || new Date(item.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      byKey.set(key, { ...item, dedupeKey: key });
    }
  }
  return [...byKey.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
