/** P0.CLIENT.1 — Client Project Room shared types (browser + server safe). */

export type ClientProjectRole = 'CLIENT_OWNER' | 'CLIENT_COLLABORATOR' | 'CLIENT_VIEWER';

export type ClientProjectCapability =
  | 'CAN_VIEW_PROJECT'
  | 'CAN_VIEW_PROGRESS'
  | 'CAN_VIEW_CURRENT_MOMENT'
  | 'CAN_VIEW_REVIEWS'
  | 'CAN_VIEW_LIBRARY'
  | 'CAN_VIEW_ACTIVITY'
  | 'CAN_VIEW_MESSAGES'
  | 'CAN_COMMENT'
  | 'CAN_REVIEW'
  | 'CAN_APPROVE'
  | 'CAN_REQUEST_REVISION'
  | 'CAN_VIEW_VERSION_HISTORY'
  | 'CAN_DOWNLOAD_APPROVED'
  | 'CAN_GENERATE'
  | 'CAN_REGENERATE'
  | 'CAN_CAPTURE'
  | 'CAN_MUTATE_CANON'
  | 'CAN_PROPAGATE'
  | 'CAN_PREPARE_SOURCE_CHANGE'
  | 'CAN_APPLY_SOURCE_CHANGE'
  | 'CAN_VIEW_INTERNAL_QA'
  | 'CAN_VIEW_PROVIDER_DATA'
  | 'CAN_VIEW_REPO_DATA'
  | 'CAN_VIEW_INTERNAL_NOTES';

export type ClientAttentionState = 'WATCHING' | 'YOUR_TURN' | 'LOCKED';

export type ClientProjectPhaseState =
  | 'COMPLETE'
  | 'IN_PROGRESS'
  | 'UPCOMING'
  | 'LOCKED'
  | 'READY_FOR_REVIEW'
  | 'PAUSED';

export type ClientProjectColorProfileState = 'UNESTABLISHED' | 'ESTABLISHED';

export type ProjectAccentSource = 'DEFAULT_SITE00_RED' | 'CLIENT_COLOR_PROFILE';

export type ClientProjectServiceScope =
  | 'WEBSITE_ONLY'
  | 'IDENTITY_PLUS_WEBSITE'
  | 'NDXBOOK_LIKE'
  | 'IDENTITY_ONLY';

export type ClientProjectManifest = {
  projectId: string;
  projectSlug: string;
  displayName: string;
  projectNumber: string;
  projectType: string;
  services: string[];
  phases: ClientProjectPhase[];
  currentPhase: string;
  attentionState: ClientAttentionState;
  clientVisibleModules: ClientProjectNavSection[];
  reviewableObjects: ClientReviewObjectSummary[];
  deliverables: string[];
  permissions: ClientProjectCapability[];
  role: ClientProjectRole;
  accentColor: string;
  accentSource: ProjectAccentSource;
  colorProfileState: ClientProjectColorProfileState;
  startDate: string;
  status: string;
  statusLabel: string;
  currentPhaseLabel: string;
  nextAction: ClientNextAction | null;
  activityFeed: ClientActivityEvent[];
  librarySections: ClientLibrarySection[];
  messageSummary: ClientMessageSummary;
  currentMoment: ClientCurrentMoment;
  notificationsUnread: number;
};

export type ClientProjectPhase = {
  id: string;
  index: string;
  label: string;
  state: ClientProjectPhaseState;
};

export type ClientProjectNavSection = 'overview' | 'reviews' | 'library' | 'activity' | 'messages';

export type ClientNextAction = {
  id: string;
  label: string;
  title: string;
  description: string;
  ctaLabel: string;
  route: string;
};

export type ClientActivityEvent = {
  id: string;
  dateLabel: string;
  summary: string;
  icon: 'direction' | 'approval' | 'production' | 'milestone' | 'message';
  isNew: boolean;
  route?: string;
};

export type ClientLibrarySection = {
  id: string;
  label: string;
  itemCount: number;
};

export type ClientMessageSummary = {
  unreadCount: number;
  route: string;
};

export type ClientCurrentMoment = {
  phaseLabel: string;
  title: string;
  summary: string;
  statusTag: string;
  previewImageUrl: string | null;
  previewAlt: string;
  enterReviewRoute: string | null;
  inlineCtaLabel: string | null;
  inlineCtaRoute: string | null;
};

export type ClientReviewObjectSummary = {
  id: string;
  title: string;
  status: string;
  versionLabel: string;
};

/** Client-safe view model — no internal/admin fields. */
export type ClientProjectRoomViewModel = {
  manifest: ClientProjectManifest;
  overview: {
    header: ClientProjectRoomHeader;
    currentMoment: ClientCurrentMoment;
    projectMap: ClientProjectPhase[];
    nextForYou: ClientNextAction | null;
    latestActivity: ClientActivityEvent[];
    rightRail: ClientProjectRoomRightRail | null;
  };
};

export type ClientProjectRoomHeader = {
  roomLabel: string;
  displayName: string;
  projectNumber: string;
  servicesSummary: string;
  startDateLabel: string;
  statusLabel: string;
  currentPhaseLabel: string;
  accentColor: string;
  accentSource: ProjectAccentSource;
};

export type ClientProjectRoomRightRail = {
  projectStatus: { label: string; detail: string };
  currentPhase: { label: string; detail: string };
  deliverablesIncluded: string[];
  unreadMessages: number;
  messagesRoute: string;
};
