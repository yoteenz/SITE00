import { randomUUID } from 'node:crypto';
import type {
  ProjectNotification,
  ProjectNotificationCategory,
  ProjectNotificationPriority,
  StudioWorldProjectEvent,
} from './types.js';
import { notificationDedupeKey } from './deduplication.js';
import { isFounderRelevantProjectEvent } from './relevance.js';
import { resolveNotificationActionHref } from './deepLinks.js';

function mapEventCategory(eventType: string): ProjectNotificationCategory {
  if (eventType.includes('FAILED')) return 'GENERATION_FAILED';
  if (eventType.includes('BLOCKED')) return 'GENERATION_BLOCKED';
  if (eventType.includes('COMPLETE') || eventType.includes('READY')) return 'GENERATION_COMPLETE';
  if (eventType.includes('JUDGMENT')) return 'FOUNDER_JUDGMENT_REQUIRED';
  if (eventType.includes('APPROVAL')) return 'APPROVAL_REQUIRED';
  if (eventType.includes('REVIEW')) return 'REVIEW_REQUIRED';
  if (eventType.includes('CAMPAIGN')) return 'CAMPAIGN_UPDATE';
  if (eventType.includes('CULTURAL')) return 'CULTURAL_INTELLIGENCE_ALERT';
  if (eventType.includes('CHARACTER') || eventType.includes('CONTINUITY')) return 'CHARACTER_UPDATE';
  if (eventType.includes('EXPERIMENT')) return 'EXPERIMENT_UPDATE';
  if (eventType.includes('FILM') || eventType.includes('SHOT')) return 'CONTENT_OPS_UPDATE';
  if (eventType.includes('PERFORMANCE')) return 'PERFORMANCE_SIGNAL';
  if (eventType.includes('DEPLOY') || eventType.includes('PIPELINE')) return 'DEPLOYMENT_OR_PIPELINE_ALERT';
  return 'SYSTEM_MESSAGE';
}

function mapPriority(category: ProjectNotificationCategory): ProjectNotificationPriority {
  if (category === 'GENERATION_FAILED' || category === 'GENERATION_BLOCKED') return 'HIGH';
  if (category === 'FOUNDER_JUDGMENT_REQUIRED' || category === 'APPROVAL_REQUIRED') return 'URGENT';
  if (category === 'REVIEW_REQUIRED' || category === 'CHARACTER_CONTINUITY_ALERT') return 'HIGH';
  return 'NORMAL';
}

export function projectEventToNotification(event: StudioWorldProjectEvent): ProjectNotification | null {
  if (!isFounderRelevantProjectEvent(event)) return null;

  const category = mapEventCategory(event.eventType);
  const title = event.title ?? event.eventType.replace(/_/g, ' ');
  const message = event.message ?? title;
  const draft: ProjectNotification = {
    id: event.eventId || randomUUID(),
    projectId: event.projectId,
    type: event.eventType,
    category,
    title,
    message,
    createdAt: event.createdAt,
    readAt: null,
    status: 'UNREAD',
    priority: mapPriority(category),
    sourceSystem: event.sourceSystem,
    sourceEntityType: event.sourceEntityType ?? null,
    sourceEntityId: event.sourceEntityId ?? null,
    actionType: category === 'GENERATION_COMPLETE' || category === 'REVIEW_REQUIRED' ? 'REVIEW' : 'VIEW',
    actionTarget: null,
    metadata: event.metadata,
  };
  draft.actionTarget = resolveNotificationActionHref(event.projectId, draft);
  draft.dedupeKey = notificationDedupeKey(draft);
  return draft;
}

export function adaptProjectEventsToNotifications(events: StudioWorldProjectEvent[]): ProjectNotification[] {
  return events.map(projectEventToNotification).filter((n): n is ProjectNotification => n !== null);
}
