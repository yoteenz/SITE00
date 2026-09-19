import type { ProjectNotification, ProjectNotificationEntityType } from './types.js';

export function resolveNotificationActionHref(
  projectId: string,
  notification: Pick<ProjectNotification, 'category' | 'actionTarget' | 'sourceEntityType' | 'sourceEntityId'>,
): string | null {
  if (notification.actionTarget) return notification.actionTarget;

  const slug = projectId;
  switch (notification.category) {
    case 'CHARACTER_CONTINUITY_ALERT':
      if (notification.sourceEntityType === 'CHARACTER_ASSET') {
        return `/projects/${slug}/character/casting`;
      }
      return `/projects/${slug}/character/continuity/review`;
    case 'REVIEW_REQUIRED':
      if (notification.sourceEntityType === 'SLIDE') {
        return `/projects/${slug}/content-operations/founder-creative-ingest`;
      }
      if (notification.sourceEntityType === 'CHARACTER_ASSET') {
        return `/projects/${slug}/character/casting`;
      }
      return `/projects/${slug}/character/continuity/review`;
    case 'CHARACTER_UPDATE':
    case 'GENERATION_COMPLETE':
    case 'GENERATION_FAILED':
    case 'GENERATION_BLOCKED':
      if (notification.sourceEntityType === 'SLIDE') {
        return `/projects/${slug}/content-operations/founder-creative-ingest`;
      }
      if (notification.sourceEntityType === 'FILM_SHOT') {
        return `/projects/${slug}/content-operations/film-production/dailies`;
      }
      return `/projects/${slug}/character/casting`;
    case 'CAMPAIGN_UPDATE':
      return `/projects/${slug}/content-operations/campaign-board`;
    case 'CONTENT_OPS_UPDATE':
      return `/projects/${slug}/content-operations`;
    case 'EXPERIMENT_UPDATE':
      return `/projects/${slug}/experiments`;
    case 'CULTURAL_INTELLIGENCE_ALERT':
      return `/projects/${slug}/cultural-intelligence`;
    case 'FOUNDER_JUDGMENT_REQUIRED':
    case 'APPROVAL_REQUIRED':
      return notification.sourceEntityType === 'SLIDE'
        ? `/projects/${slug}/content-operations/founder-creative-ingest`
        : `/projects/${slug}/character/casting`;
    default:
      return `/projects/${slug}/notifications`;
  }
}

export function entityTypeLabel(entityType: ProjectNotificationEntityType | null): string {
  if (!entityType) return 'Project';
  return entityType.replace(/_/g, ' ');
}
