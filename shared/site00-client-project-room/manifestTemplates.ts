import type {
  ClientProjectManifest,
  ClientProjectPhase,
  ClientProjectServiceScope,
  ClientAttentionState,
} from './types.js';
import { SITE00_DEFAULT_ACCENT, capabilitiesForRole, stripAdminCapabilities } from './capabilities.js';

export type ServiceScopeTemplate = {
  scope: ClientProjectServiceScope;
  services: string[];
  phases: Omit<ClientProjectPhase, 'state'>[];
  deliverables: string[];
  librarySections: { id: string; label: string }[];
};

export const SERVICE_SCOPE_TEMPLATES: Record<ClientProjectServiceScope, ServiceScopeTemplate> = {
  WEBSITE_ONLY: {
    scope: 'WEBSITE_ONLY',
    services: ['WEBSITE'],
    phases: [
      { id: 'discovery', index: '01', label: 'DISCOVERY' },
      { id: 'blueprint', index: '02', label: 'BLUEPRINT' },
      { id: 'design', index: '03', label: 'DESIGN' },
      { id: 'build', index: '04', label: 'BUILD' },
      { id: 'review', index: '05', label: 'REVIEW' },
      { id: 'launch', index: '06', label: 'LAUNCH' },
    ],
    deliverables: ['Website Strategy', 'Page Designs', 'Development', 'Launch Support'],
    librarySections: [
      { id: 'blueprints', label: 'BLUEPRINTS' },
      { id: 'page-designs', label: 'PAGE DESIGNS' },
      { id: 'final-deliverables', label: 'FINAL DELIVERABLES' },
    ],
  },
  IDENTITY_PLUS_WEBSITE: {
    scope: 'IDENTITY_PLUS_WEBSITE',
    services: ['IDENTITY', 'WEBSITE'],
    phases: [
      { id: 'discovery', index: '01', label: 'DISCOVERY' },
      { id: 'identity', index: '02', label: 'IDENTITY' },
      { id: 'blueprint', index: '03', label: 'BLUEPRINT' },
      { id: 'website', index: '04', label: 'WEBSITE' },
      { id: 'build', index: '05', label: 'BUILD' },
      { id: 'launch', index: '06', label: 'LAUNCH' },
    ],
    deliverables: [
      'Brand Strategy',
      'Visual Identity',
      'Brand Guidelines',
      'Website Design',
    ],
    librarySections: [
      { id: 'approved-identity', label: 'APPROVED IDENTITY' },
      { id: 'blueprints', label: 'BLUEPRINTS' },
      { id: 'page-designs', label: 'PAGE DESIGNS' },
      { id: 'final-deliverables', label: 'FINAL DELIVERABLES' },
    ],
  },
  NDXBOOK_LIKE: {
    scope: 'NDXBOOK_LIKE',
    services: ['IDENTITY', 'WEBSITE', 'MARKETING'],
    phases: [
      { id: 'discovery', index: '01', label: 'DISCOVERY' },
      { id: 'identity', index: '02', label: 'IDENTITY' },
      { id: 'blueprint', index: '03', label: 'BLUEPRINT' },
      { id: 'website', index: '04', label: 'WEBSITE' },
      { id: 'build', index: '05', label: 'BUILD' },
      { id: 'launch', index: '06', label: 'LAUNCH' },
    ],
    deliverables: [
      'Brand Strategy',
      'Visual Identity',
      'Brand Guidelines',
      'Website Design',
      'Marketing Assets',
    ],
    librarySections: [
      { id: 'approved-identity', label: 'APPROVED IDENTITY' },
      { id: 'brand-assets', label: 'BRAND ASSETS' },
      { id: 'page-designs', label: 'PAGE DESIGNS' },
      { id: 'marketing-assets', label: 'MARKETING ASSETS' },
      { id: 'final-deliverables', label: 'FINAL DELIVERABLES' },
    ],
  },
  IDENTITY_ONLY: {
    scope: 'IDENTITY_ONLY',
    services: ['IDENTITY'],
    phases: [
      { id: 'discovery', index: '01', label: 'DISCOVERY' },
      { id: 'identity', index: '02', label: 'IDENTITY' },
      { id: 'brand-system', index: '03', label: 'BRAND SYSTEM' },
      { id: 'delivery', index: '04', label: 'DELIVERY' },
    ],
    deliverables: ['Brand Strategy', 'Visual Identity', 'Brand Guidelines'],
    librarySections: [
      { id: 'approved-identity', label: 'APPROVED IDENTITY' },
      { id: 'brand-assets', label: 'BRAND ASSETS' },
      { id: 'final-deliverables', label: 'FINAL DELIVERABLES' },
    ],
  },
};

export function resolveServiceScope(input: {
  buildType?: string | null;
  buildClass?: string | null;
  metadataScope?: string | null;
}): ClientProjectServiceScope {
  const meta = (input.metadataScope ?? '').toUpperCase();
  if (meta === 'WEBSITE_ONLY' || meta === 'IDENTITY_PLUS_WEBSITE' || meta === 'NDXBOOK_LIKE' || meta === 'IDENTITY_ONLY') {
    return meta;
  }
  const buildType = (input.buildType ?? '').toUpperCase();
  if (buildType.includes('IDENTITY') && buildType.includes('WEBSITE') && buildType.includes('MARKETING')) {
    return 'NDXBOOK_LIKE';
  }
  if (buildType.includes('IDENTITY') && buildType.includes('WEBSITE')) return 'IDENTITY_PLUS_WEBSITE';
  if (buildType.includes('IDENTITY')) return 'IDENTITY_ONLY';
  return 'WEBSITE_ONLY';
}

export function applyPhaseStates(
  templatePhases: Omit<ClientProjectPhase, 'state'>[],
  currentPhaseId: string,
  attentionState: ClientAttentionState,
): ClientProjectPhase[] {
  const currentIdx = templatePhases.findIndex((p) => p.id === currentPhaseId);
  const effectiveIdx = currentIdx >= 0 ? currentIdx : 1;

  return templatePhases.map((phase, idx) => {
    let state: ClientProjectPhase['state'] = 'UPCOMING';
    if (idx < effectiveIdx) state = 'COMPLETE';
    else if (idx === effectiveIdx) {
      if (attentionState === 'YOUR_TURN') state = 'READY_FOR_REVIEW';
      else state = 'IN_PROGRESS';
    } else if (phase.id === 'launch' && idx > effectiveIdx) state = 'LOCKED';
    return { ...phase, state };
  });
}

export function servicesSummary(services: string[]): string {
  return services.join(' • ');
}

export function buildManifestFromScope(
  input: {
    projectId: string;
    projectSlug: string;
    displayName: string;
    projectNumber: string;
    scope: ClientProjectServiceScope;
    currentPhaseId: string;
    attentionState: ClientAttentionState;
    startDate: string;
    accentColor?: string | null;
    colorProfileState?: 'UNESTABLISHED' | 'ESTABLISHED';
    role?: ClientProjectManifest['role'];
    permissions?: ClientProjectManifest['permissions'];
  },
): ClientProjectManifest {
  const template = SERVICE_SCOPE_TEMPLATES[input.scope];
  const phases = applyPhaseStates(template.phases, input.currentPhaseId, input.attentionState);
  const currentPhase = phases.find((p) => p.state === 'IN_PROGRESS' || p.state === 'READY_FOR_REVIEW') ?? phases[0];
  const colorEstablished = input.colorProfileState === 'ESTABLISHED' && Boolean(input.accentColor);
  const accentColor = colorEstablished ? (input.accentColor as string) : SITE00_DEFAULT_ACCENT;

  const baseRoute = `/client/projects/${input.projectSlug}`;
  const reviewsRoute = `${baseRoute}/reviews`;

  const nextAction =
    input.attentionState === 'YOUR_TURN'
      ? {
          id: 'next-review',
          label: 'NEXT FOR YOU',
          title: '3 IDENTITY DIRECTIONS ARE READY',
          description: 'Review the directions and tell us which one should move forward.',
          ctaLabel: 'BEGIN REVIEW',
          route: reviewsRoute,
        }
      : null;

  const currentMoment =
    input.attentionState === 'LOCKED'
      ? {
          phaseLabel: currentPhase.label,
          title: 'IDENTITY DIRECTION 02',
          summary: 'This direction now guides the next phase.',
          statusTag: 'APPROVED',
          previewImageUrl: null,
          previewAlt: `${input.displayName} approved direction preview`,
          enterReviewRoute: null,
          inlineCtaLabel: null,
          inlineCtaRoute: null,
        }
      : {
          phaseLabel: currentPhase.label,
          title: 'IDENTITY DIRECTIONS',
          summary:
            input.attentionState === 'YOUR_TURN'
              ? 'Three directions are ready for your review.'
              : "We're developing your identity directions. Nothing is needed from you right now.",
          statusTag: input.attentionState === 'YOUR_TURN' ? 'READY FOR REVIEW' : 'IN PRODUCTION',
          previewImageUrl: null,
          previewAlt: `${input.displayName} current direction preview`,
          enterReviewRoute: input.attentionState === 'YOUR_TURN' ? reviewsRoute : null,
          inlineCtaLabel:
            input.attentionState === 'YOUR_TURN' ? '3 DIRECTIONS READY FOR REVIEW →' : null,
          inlineCtaRoute: input.attentionState === 'YOUR_TURN' ? reviewsRoute : null,
        };

  return {
    projectId: input.projectId,
    projectSlug: input.projectSlug,
    displayName: input.displayName,
    projectNumber: input.projectNumber,
    projectType: input.scope.replace(/_/g, ' '),
    services: template.services,
    phases,
    currentPhase: currentPhase.id,
    attentionState: input.attentionState,
    clientVisibleModules: ['overview', 'reviews', 'library', 'activity', 'messages'],
    reviewableObjects: [],
    deliverables: template.deliverables,
    permissions: input.permissions ?? [],
    role: input.role ?? 'CLIENT_OWNER',
    accentColor,
    accentSource: colorEstablished ? 'CLIENT_COLOR_PROFILE' : 'DEFAULT_SITE00_RED',
    colorProfileState: colorEstablished ? 'ESTABLISHED' : 'UNESTABLISHED',
    startDate: input.startDate,
    status: input.attentionState === 'YOUR_TURN' ? 'READY_FOR_REVIEW' : 'IN_PRODUCTION',
    statusLabel: input.attentionState === 'YOUR_TURN' ? 'READY FOR REVIEW' : 'IN PRODUCTION',
    currentPhaseLabel: currentPhase.label,
    nextAction,
    activityFeed: buildDefaultActivityFeed(input.displayName),
    librarySections: template.librarySections.map((s) => ({ ...s, itemCount: 0 })),
    messageSummary: { unreadCount: 3, route: `${baseRoute}/messages` },
    currentMoment,
    notificationsUnread: input.attentionState === 'YOUR_TURN' ? 1 : 0,
  };
}

function buildDefaultActivityFeed(displayName: string) {
  return [
    {
      id: 'a1',
      dateLabel: 'AUG 26',
      summary: 'Your homepage moved into visual development.',
      icon: 'production' as const,
      isNew: true,
    },
    {
      id: 'a2',
      dateLabel: 'AUG 25',
      summary: 'Identity Direction 02 was approved.',
      icon: 'approval' as const,
      isNew: false,
    },
    {
      id: 'a3',
      dateLabel: 'AUG 24',
      summary: 'Three directions were prepared for review.',
      icon: 'direction' as const,
      isNew: false,
    },
    {
      id: 'a4',
      dateLabel: 'AUG 23',
      summary: `${displayName} visual system moved into implementation.`,
      icon: 'milestone' as const,
      isNew: false,
    },
  ];
}

export const CLIENT_PROJECT_ROOM_PREVIEW_SLUG = 'preview-client-room';

export function buildPreviewClientManifest(scopeKey?: string): ClientProjectManifest {
  const scope =
    scopeKey === 'WEBSITE_ONLY' ||
    scopeKey === 'IDENTITY_PLUS_WEBSITE' ||
    scopeKey === 'NDXBOOK_LIKE' ||
    scopeKey === 'IDENTITY_ONLY'
      ? scopeKey
      : 'IDENTITY_PLUS_WEBSITE';

  const role = 'CLIENT_OWNER' as const;
  return buildManifestFromScope({
    projectId: 'preview',
    projectSlug: CLIENT_PROJECT_ROOM_PREVIEW_SLUG,
    displayName: 'NDXBOOK',
    projectNumber: 'PROJECT 0042',
    scope,
    currentPhaseId: 'identity',
    attentionState: 'YOUR_TURN',
    startDate: '2025-08-12T00:00:00.000Z',
    accentColor: null,
    colorProfileState: 'UNESTABLISHED',
    role,
    permissions: stripAdminCapabilities(capabilitiesForRole(role)),
  });
}
