import { PROJECT_NOTIFICATION_DROPDOWN_LIMIT } from '../../../shared/site00-studio-world-production/projectNotifications/constants.js';
import { buildDevProjectNotificationFixtures } from '../../../shared/site00-studio-world-production/projectNotifications/devFixtures.js';
import { countUnreadNotifications } from '../../../shared/site00-studio-world-production/projectNotifications/format.js';
import {
  ensureNotificationActionTargets,
  ingestProjectEvent,
  listProjectNotifications,
  markAllProjectNotificationsRead,
  markProjectNotificationRead,
  replaceProjectNotifications,
  upsertProjectNotifications,
} from '../../../shared/site00-studio-world-production/projectNotifications/memoryStore.js';
import type {
  ActiveProjectNotificationCenterState,
  ProjectNotification,
  StudioWorldProjectEvent,
} from '../../../shared/site00-studio-world-production/projectNotifications/types.js';

const MESSAGES_TRANSPORT_BLOCKED = true;
const MESSAGES_TRANSPORT_BLOCK_REASON =
  'Live project message transport is not wired yet. Notifications are active; messaging remains BLOCKED / FUTURE-WIRED.';

function includeDevFixtures(): boolean {
  if (process.env.SITE00_DEV_NOTIFICATION_FIXTURES === '0') return false;
  return process.env.NODE_ENV !== 'production' || process.env.SITE00_DEV_NOTIFICATION_FIXTURES === '1';
}

function seedDevFixturesIfEmpty(projectId: string): void {
  if (!includeDevFixtures()) return;
  if (listProjectNotifications(projectId).length > 0) return;
  replaceProjectNotifications(projectId, buildDevProjectNotificationFixtures(projectId));
}

export function getProjectNotificationCenterState(
  projectId: string,
  options?: { limit?: number | null },
): ActiveProjectNotificationCenterState {
  seedDevFixturesIfEmpty(projectId);
  const all = ensureNotificationActionTargets(listProjectNotifications(projectId));
  const limit = options?.limit ?? PROJECT_NOTIFICATION_DROPDOWN_LIMIT;
  const notifications = limit == null ? all : all.slice(0, limit);
  return {
    projectId,
    notifications,
    messages: [],
    unreadCount: countUnreadNotifications(all),
    messagesTransportBlocked: MESSAGES_TRANSPORT_BLOCKED,
    messagesTransportBlockReason: MESSAGES_TRANSPORT_BLOCK_REASON,
  };
}

export function getAllProjectNotifications(projectId: string): ProjectNotification[] {
  seedDevFixturesIfEmpty(projectId);
  return ensureNotificationActionTargets(listProjectNotifications(projectId));
}

export function markNotificationRead(projectId: string, notificationId: string): ProjectNotification | null {
  return markProjectNotificationRead(projectId, notificationId);
}

export function markAllNotificationsRead(projectId: string): { marked: number } {
  return { marked: markAllProjectNotificationsRead(projectId) };
}

export function recordProjectNotificationEvent(event: StudioWorldProjectEvent): ProjectNotification | null {
  return ingestProjectEvent(event);
}

export function seedProjectNotifications(projectId: string, notifications: ProjectNotification[]): void {
  upsertProjectNotifications(projectId, notifications);
}

export { resetProjectNotificationsMemory } from '../../../shared/site00-studio-world-production/projectNotifications/memoryStore.js';
