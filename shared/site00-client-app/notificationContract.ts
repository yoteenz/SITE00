import type { ClientNotificationCategory, ClientNotificationPreferences } from './types.js';

export const DEFAULT_NOTIFICATION_PREFERENCES: ClientNotificationPreferences = {
  reviewReady: true,
  revisionReady: true,
  messages: true,
  milestones: true,
  fileDelivery: true,
  clientTasks: true,
  launchUpdates: true,
  postLaunchCheckin: true,
  marketingOpportunities: false,
};

export type ClientNotificationContract = {
  category: ClientNotificationCategory;
  title: string;
  bodyTemplate: string;
  requiresMarketingConsent: boolean;
  pushPriority: 'HIGH' | 'NORMAL' | 'LOW';
};

export const CLIENT_NOTIFICATION_CONTRACTS: ClientNotificationContract[] = [
  { category: 'REVIEW_READY', title: 'Review Ready', bodyTemplate: '{reviewTitle} is ready for your review.', requiresMarketingConsent: false, pushPriority: 'HIGH' },
  { category: 'REVISION_READY', title: 'Revision Ready', bodyTemplate: 'Revisions are ready on {reviewTitle}.', requiresMarketingConsent: false, pushPriority: 'HIGH' },
  { category: 'MESSAGE_RECEIVED', title: 'New Message', bodyTemplate: 'You have a new message from SITE 00.', requiresMarketingConsent: false, pushPriority: 'HIGH' },
  { category: 'MILESTONE_COMPLETE', title: 'Milestone', bodyTemplate: '{milestoneTitle} is complete.', requiresMarketingConsent: false, pushPriority: 'NORMAL' },
  { category: 'FILE_DELIVERED', title: 'File Delivered', bodyTemplate: 'A new file is available in your library.', requiresMarketingConsent: false, pushPriority: 'NORMAL' },
  { category: 'CLIENT_TASK_DUE', title: 'Task Due', bodyTemplate: '{taskTitle} needs your attention.', requiresMarketingConsent: false, pushPriority: 'HIGH' },
  { category: 'LAUNCH_UPDATE', title: 'Launch Update', bodyTemplate: 'Launch status updated for {projectName}.', requiresMarketingConsent: false, pushPriority: 'NORMAL' },
  { category: 'POST_LAUNCH_CHECKIN', title: 'Check-in', bodyTemplate: 'How is {projectName} performing since launch?', requiresMarketingConsent: false, pushPriority: 'LOW' },
  { category: 'OPPORTUNITY_ELIGIBLE', title: 'Opportunity', bodyTemplate: '{offer} may be relevant for your project.', requiresMarketingConsent: true, pushPriority: 'LOW' },
];

export function isNotificationAllowed(
  category: ClientNotificationCategory,
  prefs: ClientNotificationPreferences,
): boolean {
  const map: Record<ClientNotificationCategory, keyof ClientNotificationPreferences> = {
    REVIEW_READY: 'reviewReady',
    REVISION_READY: 'revisionReady',
    MESSAGE_RECEIVED: 'messages',
    MILESTONE_COMPLETE: 'milestones',
    FILE_DELIVERED: 'fileDelivery',
    CLIENT_TASK_DUE: 'clientTasks',
    LAUNCH_UPDATE: 'launchUpdates',
    POST_LAUNCH_CHECKIN: 'postLaunchCheckin',
    OPPORTUNITY_ELIGIBLE: 'marketingOpportunities',
  };
  return prefs[map[category]] ?? false;
}
