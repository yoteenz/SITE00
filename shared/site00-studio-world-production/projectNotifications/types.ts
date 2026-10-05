export type ProjectNotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export type ProjectNotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type ProjectNotificationCategory =
  | 'GENERATION_COMPLETE'
  | 'GENERATION_FAILED'
  | 'GENERATION_BLOCKED'
  | 'REVIEW_REQUIRED'
  | 'APPROVAL_REQUIRED'
  | 'FOUNDER_JUDGMENT_REQUIRED'
  | 'CAMPAIGN_UPDATE'
  | 'CONTENT_OPS_UPDATE'
  | 'EXPERIMENT_UPDATE'
  | 'CHARACTER_UPDATE'
  | 'CHARACTER_CONTINUITY_ALERT'
  | 'CULTURAL_INTELLIGENCE_ALERT'
  | 'PERFORMANCE_SIGNAL'
  | 'SYSTEM_MESSAGE'
  | 'PROJECT_MESSAGE'
  | 'DEPLOYMENT_OR_PIPELINE_ALERT';

export type ProjectNotificationEntityType =
  | 'SLIDE'
  | 'CAMPAIGN'
  | 'EXPERIMENT'
  | 'CHARACTER_ASSET'
  | 'FILM_SHOT'
  | 'CULTURAL_SIGNAL'
  | 'CONTENT_SEED'
  | 'GENERATION_RUN'
  | 'PROJECT';

export type ProjectNotificationActionType = 'NAVIGATE' | 'REVIEW' | 'APPROVE' | 'VIEW' | 'NONE';

export type ProjectNotification = {
  id: string;
  projectId: string;
  type: string;
  category: ProjectNotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  status: ProjectNotificationStatus;
  priority: ProjectNotificationPriority;
  sourceSystem: string;
  sourceEntityType: ProjectNotificationEntityType | null;
  sourceEntityId: string | null;
  actionType: ProjectNotificationActionType;
  actionTarget: string | null;
  metadata?: Record<string, unknown>;
  dedupeKey?: string;
  isDevFixture?: boolean;
};

export type ProjectMessageSenderType = 'SYSTEM' | 'STUDIO_WORLD' | 'COLLABORATOR' | 'FOUNDER';

export type ProjectMessage = {
  id: string;
  projectId: string;
  senderType: ProjectMessageSenderType;
  senderId: string | null;
  title: string | null;
  body: string;
  createdAt: string;
  readAt: string | null;
  threadId: string | null;
  sourceEntityType: ProjectNotificationEntityType | null;
  sourceEntityId: string | null;
};

export type StudioWorldProjectEvent = {
  eventId: string;
  projectId: string;
  eventType: string;
  sourceSystem: string;
  sourceEntityType?: ProjectNotificationEntityType | null;
  sourceEntityId?: string | null;
  title?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  founderRelevant?: boolean;
};

export type ActiveProjectNotificationCenterState = {
  projectId: string;
  notifications: ProjectNotification[];
  messages: ProjectMessage[];
  unreadCount: number;
  messagesTransportBlocked: boolean;
  messagesTransportBlockReason: string | null;
};
