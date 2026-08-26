import type { ClientProjectManifest } from '../site00-client-project-room/types.js';
import type {
  ClientAppExperience,
  ClientAppManifest,
  ClientAppState,
  ClientBuildProgress,
  ClientProjectPulse,
  ClientProjectSignal,
} from './types.js';
import { buildEligibleOpportunities, selectPrimaryOpportunity } from './opportunityEngine.js';
import { CLIENT_APP_INVITATION_COPY, clientAppPath } from './routes.js';
import { resolveOnboardingState } from './onboarding.js';
import { DEFAULT_NOTIFICATION_PREFERENCES } from './notificationContract.js';
import { NATIVE_CAPABILITY_CONTRACT } from './nativeCapabilities.js';

export type BuildAppManifestInput = {
  manifest: ClientProjectManifest;
  onboardingMeta?: Record<string, unknown>;
  dismissedOffers?: string[];
  reviewCount?: number;
  taskCount?: number;
};

function mapAppState(manifest: ClientProjectManifest): ClientAppState {
  const status = (manifest.status ?? '').toUpperCase();
  if (status.includes('LIVE') || status.includes('COMPLETE')) return manifest.status.includes('LIVE') ? 'LIVE' : 'COMPLETE';
  if (manifest.attentionState === 'YOUR_TURN') return 'YOUR_TURN';
  if (manifest.attentionState === 'LOCKED') return 'READY_TO_LAUNCH';
  if (status.includes('PAUSED')) return 'PAUSED';
  if (status.includes('PRE')) return 'PRE_PRODUCTION';
  if (manifest.currentPhaseLabel.toUpperCase().includes('REVISION')) return 'REVISION_IN_PROGRESS';
  return 'IN_PRODUCTION';
}

function mapProjectSignal(manifest: ClientProjectManifest, appState: ClientAppState): ClientProjectSignal {
  if (appState === 'LIVE') return 'LIVE';
  if (appState === 'PAUSED') return 'PAUSED';
  if (appState === 'YOUR_TURN') return 'WAITING_ON_CLIENT';
  if (appState === 'READY_TO_LAUNCH') return 'READY_TO_LAUNCH';
  if (manifest.attentionState === 'YOUR_TURN') return 'REVIEW_WINDOW_OPEN';
  if (appState === 'IN_PRODUCTION') return 'IN_PRODUCTION';
  return 'ON_TRACK';
}

function deriveBuildProgress(manifest: ClientProjectManifest): ClientBuildProgress {
  const phase = manifest.currentPhase.toLowerCase();
  const streams = [
    {
      id: 'identity',
      label: 'IDENTITY',
      state: phase.includes('identity') ? 'IN_PROGRESS' as const : manifest.phases.find((p) => p.id === 'identity')?.state === 'COMPLETE' ? 'COMPLETE' as const : 'UPCOMING' as const,
      items: [] as ClientBuildProgress['streams'][0]['items'],
    },
    {
      id: 'website',
      label: 'WEBSITE',
      state: phase.includes('website') || phase.includes('blueprint') ? 'IN_PROGRESS' as const : 'UPCOMING' as const,
      items: [
        { id: 'homepage-structure', label: 'Homepage Structure', state: phase.includes('blueprint') ? 'COMPLETE' as const : 'UPCOMING' as const },
        { id: 'homepage-design', label: 'Homepage Design', state: phase.includes('website') ? 'IN_PROGRESS' as const : 'UPCOMING' as const },
        { id: 'mobile-adaptation', label: 'Mobile Adaptation', state: 'UPCOMING' as const },
        { id: 'development', label: 'Development', state: 'UPCOMING' as const },
      ],
    },
    {
      id: 'launch',
      label: 'LAUNCH',
      state: phase.includes('launch') ? 'IN_PROGRESS' as const : 'NOT_STARTED' as const,
      items: [],
    },
  ];

  if (manifest.phases.find((p) => p.id === 'identity')?.state === 'COMPLETE') {
    streams[0].state = 'COMPLETE';
  }

  return {
    streams,
    activeStreamId: streams.find((s) => s.state === 'IN_PROGRESS')?.id ?? null,
  };
}

function deriveMilestones(_manifest: ClientProjectManifest) {
  return [
    { id: 'm1', dateLabel: 'AUG 20', title: 'Identity Direction 02 Approved', statusLabel: 'COMPLETE', statusKey: 'COMPLETE' as const, calendarExportUrl: null },
    { id: 'm2', dateLabel: 'SEP 14', title: 'Homepage Review Window Opens', statusLabel: 'UPCOMING', statusKey: 'UPCOMING' as const, calendarExportUrl: '/api/site00/client-app?action=calendar-export&milestone=m2' },
    { id: 'm3', dateLabel: 'OCT 01', title: 'Development Kickoff', statusLabel: 'SCHEDULED', statusKey: 'SCHEDULED' as const, calendarExportUrl: '/api/site00/client-app?action=calendar-export&milestone=m3' },
  ];
}

function deriveTasks(manifest: ClientProjectManifest) {
  const open: import('./types.js').ClientAppTask[] = [];
  if (manifest.attentionState === 'YOUR_TURN') {
    open.push({
      id: 'task-review',
      title: 'Review Identity Directions',
      description: 'Three directions are ready for your review.',
      state: 'OPEN',
      dueLabel: 'DUE SOON',
      route: clientAppPath(manifest.projectSlug, 'reviews'),
      clientCompletable: false,
    });
  }
  open.push({
    id: 'task-bio',
    title: 'Upload Founder Bio',
    description: 'We need your bio for the About page.',
    state: 'OPEN',
    dueLabel: null,
    route: null,
    clientCompletable: true,
  });
  return {
    needed: open.filter((t) => t.state !== 'COMPLETE'),
    completed: [{ id: 'task-email', title: 'Confirm Contact Email', description: '', state: 'COMPLETE' as const, dueLabel: null, route: null, clientCompletable: true }],
  };
}

function deriveDecisions() {
  return [
    {
      id: 'd1',
      title: 'Mobile Navigation Approved',
      type: 'APPROVAL',
      dateLabel: 'SEP 14',
      decision: 'Approved Direction B for mobile navigation.',
      approver: 'Client',
      relatedReviewId: null,
      affectedSummary: 'Mobile navigation pattern locked for build.',
    },
    {
      id: 'd2',
      title: 'Identity Direction 02 Approved',
      type: 'APPROVAL',
      dateLabel: 'AUG 20',
      decision: 'Direction 02 selected as primary identity.',
      approver: 'Client',
      relatedReviewId: null,
      affectedSummary: 'Guides website and marketing expression.',
    },
  ];
}

function deriveBehindProject(manifest: ClientProjectManifest) {
  return [
    {
      id: 'bts1',
      title: 'What we are testing',
      body: 'We are exploring spacing rhythm on the homepage hero before locking the next review.',
      previewImageUrl: manifest.currentMoment.previewImageUrl,
      publishedAt: new Date().toISOString(),
      type: 'TESTING' as const,
    },
  ];
}

export function buildClientAppExperience(input: BuildAppManifestInput): ClientAppExperience {
  const { manifest } = input;
  const appState = mapAppState(manifest);
  const isPostLaunch = appState === 'LIVE' || appState === 'COMPLETE';
  const liveDays = isPostLaunch ? 47 : null;
  const tasks = deriveTasks(manifest);
  const opportunities = buildEligibleOpportunities({
    projectId: manifest.projectId,
    currentServices: manifest.services,
    currentPhase: manifest.currentPhase,
    projectType: manifest.projectType,
    appState,
    attentionState: manifest.attentionState,
    postLaunchState: isPostLaunch,
    liveDays,
    dismissedOffers: input.dismissedOffers ?? [],
    purchasedServices: manifest.services,
    hasCriticalIssue: false,
    hasOpenClientAction: manifest.attentionState === 'YOUR_TURN' || tasks.needed.length > 0,
    clientSuppression: [],
  });

  const nextForYou = manifest.nextAction
    ? {
        id: manifest.nextAction.id,
        label: manifest.nextAction.label,
        title: manifest.nextAction.title,
        description: manifest.nextAction.description,
        ctaLabel: manifest.nextAction.ctaLabel,
        route: manifest.nextAction.route.replace('/client/projects/', '/app/projects/').replace('/reviews', '/reviews'),
        priority: 1,
      }
    : null;

  const pulse: ClientProjectPulse = {
    status: isPostLaunch ? 'LIVE' : manifest.statusLabel,
    statusKey: appState,
    currentMoment: manifest.currentMoment.summary,
    nextForYou,
    todayUpdates: manifest.activityFeed.slice(0, 3).map((e) => ({
      id: e.id,
      timeLabel: e.dateLabel,
      summary: e.summary,
    })),
    nextMilestone: deriveMilestones(manifest)[1] ?? null,
    projectSignal: mapProjectSignal(manifest, appState),
    activeOpportunity: null,
    isPostLaunch,
    liveDays,
  };

  pulse.activeOpportunity = selectPrimaryOpportunity(opportunities, pulse);

  return {
    modules: ['home', 'project', 'reviews', 'inbox', 'library'],
    projectPulse: pulse,
    buildProgress: deriveBuildProgress(manifest),
    milestones: deriveMilestones(manifest),
    clientTasks: [...tasks.needed, ...tasks.completed],
    decisions: deriveDecisions(),
    behindProject: deriveBehindProject(manifest),
    notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    opportunities,
    offlineAvailability: {
      supported: NATIVE_CAPABILITY_CONTRACT.offlineFiles !== 'UNAVAILABLE',
      approvedAssetCount: manifest.librarySections.reduce((n, s) => n + s.itemCount, 0),
      contractVersion: '1',
    },
    onboarding: resolveOnboardingState(input.onboardingMeta),
    appState,
    badges: {
      inbox: manifest.messageSummary.unreadCount,
      reviews: input.reviewCount ?? manifest.reviewableObjects.length,
      tasks: input.taskCount ?? tasks.needed.length,
    },
    deepLink: clientAppPath(manifest.projectSlug),
    invitationCopy: CLIENT_APP_INVITATION_COPY,
  };
}

export function buildClientAppManifest(input: BuildAppManifestInput): ClientAppManifest {
  return {
    ...input.manifest,
    appExperience: buildClientAppExperience(input),
  };
}

// Re-export for tests without pulling server deps in browser bundle
export { mapAppState, mapProjectSignal, deriveBuildProgress };
