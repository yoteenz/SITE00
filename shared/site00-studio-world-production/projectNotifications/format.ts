import type { ProjectNotification } from './types.js';

export function formatNotificationRelativeTime(iso: string, now = Date.now()): string {
  const diffMs = now - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function groupNotificationsByRecency(
  notifications: ProjectNotification[],
  now = Date.now(),
): { today: ProjectNotification[]; earlier: ProjectNotification[] } {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();
  const today: ProjectNotification[] = [];
  const earlier: ProjectNotification[] = [];
  for (const item of notifications) {
    if (new Date(item.createdAt).getTime() >= todayMs) today.push(item);
    else earlier.push(item);
  }
  return { today, earlier };
}

export function countUnreadNotifications(notifications: ProjectNotification[]): number {
  return notifications.filter((n) => n.status === 'UNREAD').length;
}

export function notificationActionLabel(
  notification: Pick<ProjectNotification, 'actionType' | 'category'>,
): string {
  if (notification.actionType === 'REVIEW') return 'REVIEW →';
  if (notification.actionType === 'APPROVE') return 'APPROVE →';
  if (notification.actionType === 'VIEW') return 'VIEW →';
  if (notification.category === 'REVIEW_REQUIRED') return 'REVIEW →';
  return 'VIEW →';
}
