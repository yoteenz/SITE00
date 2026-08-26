/** P0.APP.1 — Client mobile app shared types (browser + server safe). */

import type { ClientProjectManifest } from '../site00-client-project-room/types.js';

export type ClientAppState =
  | 'PRE_PRODUCTION'
  | 'IN_PRODUCTION'
  | 'YOUR_TURN'
  | 'REVISION_IN_PROGRESS'
  | 'READY_TO_LAUNCH'
  | 'LIVE'
  | 'PAUSED'
  | 'COMPLETE';

export type ClientProjectSignal =
  | 'ON_TRACK'
  | 'WAITING_ON_CLIENT'
  | 'REVIEW_WINDOW_OPEN'
  | 'IN_PRODUCTION'
  | 'READY_TO_LAUNCH'
  | 'LIVE'
  | 'PAUSED';

export type ClientAppOnboardingState =
  | 'NOT_INVITED'
  | 'INVITED'
  | 'OPENED_DOWNLOAD'
  | 'INSTALLED'
  | 'ONBOARDED'
  | 'DECLINED_FOR_NOW';

export type ClientTaskState = 'OPEN' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETE' | 'BLOCKED';

export type ClientOpportunityType =
  | 'PROJECT_OPPORTUNITY'
  | 'IDLE_OPPORTUNITY'
  | 'MILESTONE_OPPORTUNITY'
  | 'POST_LAUNCH_OPPORTUNITY'
  | 'SERVICE_OPPORTUNITY'
  | 'SUPPORT_OPPORTUNITY'
  | 'EXPANSION_OPPORTUNITY';

export type ClientOpportunityAction =
  | 'EXPLORE'
  | 'MAYBE_LATER'
  | 'REQUEST_INFO'
  | 'REQUEST_QUOTE';

export type ClientOpportunityInterestSignal =
  | 'VIEWED'
  | 'SAVED_FOR_LATER'
  | 'REQUESTED_INFO'
  | 'REQUESTED_QUOTE'
  | 'DISMISSED'
  | 'NOT_NOW';

export type ClientNotificationCategory =
  | 'REVIEW_READY'
  | 'REVISION_READY'
  | 'MESSAGE_RECEIVED'
  | 'MILESTONE_COMPLETE'
  | 'FILE_DELIVERED'
  | 'CLIENT_TASK_DUE'
  | 'LAUNCH_UPDATE'
  | 'POST_LAUNCH_CHECKIN'
  | 'OPPORTUNITY_ELIGIBLE';

export type ClientBuildItemState = 'COMPLETE' | 'IN_PROGRESS' | 'UPCOMING' | 'NOT_STARTED';

export type ClientAppNavSection = 'home' | 'project' | 'reviews' | 'inbox' | 'library';

export type ClientProjectPulse = {
  status: string;
  statusKey: ClientAppState;
  currentMoment: string;
  nextForYou: ClientPulseAction | null;
  todayUpdates: ClientPulseUpdate[];
  nextMilestone: ClientAppMilestone | null;
  projectSignal: ClientProjectSignal;
  activeOpportunity: ClientOpportunity | null;
  isPostLaunch: boolean;
  liveDays: number | null;
};

export type ClientPulseAction = {
  id: string;
  label: string;
  title: string;
  description: string;
  ctaLabel: string;
  route: string;
  priority: number;
};

export type ClientPulseUpdate = {
  id: string;
  timeLabel: string;
  summary: string;
};

export type ClientBuildStream = {
  id: string;
  label: string;
  state: ClientBuildItemState;
  items: ClientBuildItem[];
};

export type ClientBuildItem = {
  id: string;
  label: string;
  state: ClientBuildItemState;
};

export type ClientBuildProgress = {
  streams: ClientBuildStream[];
  activeStreamId: string | null;
};

export type ClientAppMilestone = {
  id: string;
  dateLabel: string;
  title: string;
  statusLabel: string;
  statusKey: 'COMPLETE' | 'UPCOMING' | 'IN_PROGRESS' | 'SCHEDULED';
  calendarExportUrl: string | null;
};

export type ClientAppTask = {
  id: string;
  title: string;
  description: string;
  state: ClientTaskState;
  dueLabel: string | null;
  route: string | null;
  clientCompletable: boolean;
};

export type ClientAppDecision = {
  id: string;
  title: string;
  type: string;
  dateLabel: string;
  decision: string;
  approver: string;
  relatedReviewId: string | null;
  affectedSummary: string;
};

export type ClientBehindProjectItem = {
  id: string;
  title: string;
  body: string;
  previewImageUrl: string | null;
  publishedAt: string;
  type: 'NOTE' | 'WIP_PREVIEW' | 'TESTING' | 'DECISION_CONTEXT' | 'EXPLORATION';
};

export type ClientOpportunity = {
  opportunityId: string;
  projectId: string;
  opportunityType: ClientOpportunityType;
  recommendedOffer: string;
  reason: string;
  timing: string;
  priority: number;
  surface: 'HOME' | 'POST_LAUNCH' | 'IDLE';
  message: string;
  cta: string;
  eligibility: boolean;
  suppressionState: 'NONE' | 'DISMISSED' | 'PURCHASED' | 'INCOMPATIBLE';
  createdAt: string;
};

export type ClientNotificationPreferences = {
  reviewReady: boolean;
  revisionReady: boolean;
  messages: boolean;
  milestones: boolean;
  fileDelivery: boolean;
  clientTasks: boolean;
  launchUpdates: boolean;
  postLaunchCheckin: boolean;
  marketingOpportunities: boolean;
};

export type ClientOfflineAvailability = {
  supported: boolean;
  approvedAssetCount: number;
  contractVersion: string;
};

export type ClientAppBadges = {
  inbox: number;
  reviews: number;
  tasks: number;
};

export type ClientInboxThread = {
  id: string;
  category: 'SITE00' | 'DESIGN_REVIEW' | 'FILES';
  title: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  route: string;
};

export type ClientLibraryCategory = {
  id: string;
  label: string;
  itemCount: number;
  route: string;
};

export type ClientLibraryFile = {
  id: string;
  title: string;
  versionLabel: string;
  statusLabel: string;
  previewUrl: string | null;
  downloadUrl: string | null;
  mimeType: string;
};

export type ClientAppExperience = {
  modules: ClientAppNavSection[];
  projectPulse: ClientProjectPulse;
  buildProgress: ClientBuildProgress;
  milestones: ClientAppMilestone[];
  clientTasks: ClientAppTask[];
  decisions: ClientAppDecision[];
  behindProject: ClientBehindProjectItem[];
  notificationPreferences: ClientNotificationPreferences;
  opportunities: ClientOpportunity[];
  offlineAvailability: ClientOfflineAvailability;
  onboarding: ClientAppOnboardingState;
  appState: ClientAppState;
  badges: ClientAppBadges;
  deepLink: string;
  invitationCopy: ClientAppInvitationCopy;
};

export type ClientAppInvitationCopy = {
  headline: string;
  subhead: string;
  bullets: string[];
  ctaLabel: string;
};

export type ClientAppManifest = ClientProjectManifest & {
  appExperience: ClientAppExperience;
};

export type ClientAppProjectSummary = {
  id: string;
  slug: string;
  displayName: string;
  projectNumber: string;
  statusLabel: string;
  statusKey: ClientAppState;
  accentColor: string;
  previewImageUrl: string | null;
  deepLink: string;
};

export type ClientAppProjectsPayload = {
  projects: ClientAppProjectSummary[];
  singleProjectSlug: string | null;
  onboarding: ClientAppOnboardingState;
};

export type ClientAppActivationResult = {
  projectId: string;
  projectSlug: string;
  deepLink: string;
  onboardingState: ClientAppOnboardingState;
  invitationSent: boolean;
};
