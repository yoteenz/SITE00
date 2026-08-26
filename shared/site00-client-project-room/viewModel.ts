import type { ClientProjectManifest, ClientProjectRoomViewModel } from './types.js';
import { servicesSummary } from './manifestTemplates.js';

export function buildClientProjectRoomViewModel(manifest: ClientProjectManifest): ClientProjectRoomViewModel {
  const startDateLabel = manifest.startDate
    ? `STARTED ${new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
        .format(new Date(manifest.startDate))
        .toUpperCase()}`
    : '';

  return {
    manifest,
    overview: {
      header: {
        roomLabel: 'PROJECT ROOM',
        displayName: manifest.displayName,
        projectNumber: manifest.projectNumber,
        servicesSummary: servicesSummary(manifest.services),
        startDateLabel,
        statusLabel: manifest.statusLabel,
        currentPhaseLabel: manifest.currentPhaseLabel,
        accentColor: manifest.accentColor,
        accentSource: manifest.accentSource,
      },
      currentMoment: manifest.currentMoment,
      projectMap: manifest.phases,
      nextForYou: manifest.nextAction,
      latestActivity: manifest.activityFeed.slice(0, 4),
      rightRail: {
        projectStatus: {
          label: manifest.statusLabel,
          detail: manifest.attentionState === 'WATCHING' ? 'Work is actively in progress.' : 'Your review is needed.',
        },
        currentPhase: {
          label: manifest.currentPhaseLabel,
          detail: `Defining the core expression of ${manifest.displayName}.`,
        },
        deliverablesIncluded: manifest.deliverables,
        unreadMessages: manifest.messageSummary.unreadCount,
        messagesRoute: manifest.messageSummary.route,
      },
    },
  };
}
