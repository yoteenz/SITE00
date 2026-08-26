import { getSupabaseAdmin } from '../supabase.js';
import { buildClientProjectManifestFromProject } from '../site00ClientProjectRoom/roomService.js';
import { getClientReviewQueuePayload } from '../site00ClientReviews/reviewService.js';
import { loadProjectForClient, getClientProjectsPayload } from '../site00Production/clientStudio.js';
import {
  buildClientAppManifest,
  buildClientAppExperience,
} from '../../../shared/site00-client-app/manifestBuilder.js';
import {
  CLIENT_APP_FIXTURES,
  CLIENT_APP_FIXTURE_SLUGS,
  fixtureToProjectSummary,
  getMultiProjectFixtureSummaries,
} from '../../../shared/site00-client-app/fixtures.js';
import { clientAppPath } from '../../../shared/site00-client-app/routes.js';
import { nextOnboardingState } from '../../../shared/site00-client-app/onboarding.js';
import type {
  ClientAppActivationResult,
  ClientAppManifest,
  ClientAppProjectsPayload,
  ClientInboxThread,
  ClientLibraryCategory,
  ClientLibraryFile,
} from '../../../shared/site00-client-app/types.js';
import { recordOpportunityInterest } from '../../../shared/site00-client-app/opportunityEngine.js';

const FIXTURE_PREFIX = 'fixture-app-';

function isFixtureSlug(slug: string): boolean {
  return slug.startsWith(FIXTURE_PREFIX) || slug in CLIENT_APP_FIXTURES;
}

export async function getClientAppManifestPayload(input: {
  projectSlug: string;
  email: string;
  userId?: string;
}): Promise<ClientAppManifest> {
  const { projectSlug, email, userId } = input;

  if (isFixtureSlug(projectSlug) && CLIENT_APP_FIXTURES[projectSlug]) {
    return CLIENT_APP_FIXTURES[projectSlug];
  }

  const project = await loadProjectForClient(projectSlug, email, userId);
  const manifest = await buildClientProjectManifestFromProject(project, email);
  const meta = (project.metadata as Record<string, unknown> | null) ?? {};

  let reviewCount = manifest.reviewableObjects.length;
  try {
    const queue = await getClientReviewQueuePayload({ projectSlug, email, userId });
    reviewCount = queue.actionableCount;
  } catch {
    /* preview / empty */
  }

  return buildClientAppManifest({
    manifest,
    onboardingMeta: meta,
    dismissedOffers: Array.isArray(meta.client_dismissed_offers) ? (meta.client_dismissed_offers as string[]) : [],
    reviewCount,
    taskCount: manifest.attentionState === 'YOUR_TURN' ? 1 : 0,
  });
}

export async function getClientAppProjectsList(input: {
  email: string;
  userId?: string;
  fixtureMode?: string;
}): Promise<ClientAppProjectsPayload> {
  if (input.fixtureMode === 'multi') {
    return {
      projects: getMultiProjectFixtureSummaries(),
      singleProjectSlug: null,
      onboarding: 'ONBOARDED',
    };
  }

  const { projects } = await getClientProjectsPayload(input.email, input.userId);
  const summaries = await Promise.all(
    projects.map(async (p) => {
      try {
        const manifest = await getClientAppManifestPayload({
          projectSlug: p.slug,
          email: input.email,
          userId: input.userId,
        });
        return fixtureToProjectSummary(manifest);
      } catch {
        return {
          id: p.id,
          slug: p.slug,
          displayName: p.name,
          projectNumber: p.slug.toUpperCase(),
          statusLabel: p.status,
          statusKey: 'IN_PRODUCTION' as const,
          accentColor: '#e8192c',
          previewImageUrl: null,
          deepLink: clientAppPath(p.slug),
        };
      }
    }),
  );

  return {
    projects: summaries,
    singleProjectSlug: summaries.length === 1 ? summaries[0].slug : null,
    onboarding: summaries.length ? 'ONBOARDED' : 'NOT_INVITED',
  };
}

export async function activateClientProjectApp(input: {
  projectSlug: string;
  email: string;
  userId?: string;
}): Promise<ClientAppActivationResult> {
  const project = await loadProjectForClient(input.projectSlug, input.email, input.userId);
  const meta = ((project.metadata as Record<string, unknown> | null) ?? {}) as Record<string, unknown>;
  const current = typeof meta.client_app_onboarding === 'string' ? meta.client_app_onboarding : 'NOT_INVITED';
  const next = nextOnboardingState(current as import('../../../shared/site00-client-app/types.js').ClientAppOnboardingState, 'INVITE');

  const supabase = getSupabaseAdmin();
  await supabase
    .from('site00_projects')
    .update({
      metadata: {
        ...meta,
        client_app_onboarding: next,
        client_app_invited_at: new Date().toISOString(),
        client_app_deep_link: clientAppPath(String(project.slug)),
      },
    })
    .eq('id', project.id);

  await supabase.from('site00_project_events').insert({
    project_id: project.id,
    event_type: 'CLIENT_PROJECT_ACTIVATED',
    summary: 'Client app access activated — invitation ready.',
    metadata: { deepLink: clientAppPath(String(project.slug)) },
  });

  return {
    projectId: String(project.id),
    projectSlug: String(project.slug),
    deepLink: clientAppPath(String(project.slug)),
    onboardingState: next,
    invitationSent: false,
  };
}

export function getClientAppInboxThreads(manifest: ClientAppManifest): ClientInboxThread[] {
  const slug = manifest.projectSlug;
  return [
    {
      id: 'inbox-site00-1',
      category: 'SITE00',
      title: 'SITE 00',
      preview: 'Your homepage review window opens next week.',
      timestamp: '10:42 AM',
      unread: manifest.messageSummary.unreadCount > 0,
      route: clientAppPath(slug, 'inbox') + '/site00-1',
    },
    {
      id: 'inbox-review-1',
      category: 'DESIGN_REVIEW',
      title: 'Homepage Directions',
      preview: 'Revision notes received — updated V03 ready.',
      timestamp: 'Yesterday',
      unread: false,
      route: clientAppPath(slug, 'reviews'),
    },
    {
      id: 'inbox-files-1',
      category: 'FILES',
      title: 'Identity Assets Delivered',
      preview: 'Approved identity files added to your library.',
      timestamp: 'Aug 18',
      unread: false,
      route: clientAppPath(slug, 'library'),
    },
  ];
}

export function getClientAppLibraryCategories(manifest: ClientAppManifest): ClientLibraryCategory[] {
  const slug = manifest.projectSlug;
  const labelMap: Record<string, string> = {
    'approved-identity': 'IDENTITY',
    'brand-assets': 'IDENTITY',
    blueprints: 'WEBSITE',
    'page-designs': 'WEBSITE',
    'marketing-assets': 'MARKETING',
    'final-deliverables': 'FINAL DELIVERY',
  };

  return manifest.librarySections.map((section) => ({
    id: section.id,
    label: labelMap[section.id] ?? section.label,
    itemCount: section.itemCount,
    route: `/app/projects/${slug}/library/${section.id}`,
  }));
}

export function getClientAppLibraryFiles(categoryId: string): ClientLibraryFile[] {
  return [
    {
      id: 'file-1',
      title: 'Homepage — V03',
      versionLabel: 'V03',
      statusLabel: 'APPROVED',
      previewUrl: null,
      downloadUrl: null,
      mimeType: 'image/png',
    },
    {
      id: 'file-2',
      title: 'Brand Mark — Primary',
      versionLabel: 'CURRENT',
      statusLabel: 'APPROVED',
      previewUrl: null,
      downloadUrl: null,
      mimeType: 'image/svg+xml',
    },
  ];
}

export async function recordClientAppOpportunityInterest(input: {
  projectSlug: string;
  email: string;
  userId?: string;
  offer: string;
  signal: import('../../../shared/site00-client-app/types.js').ClientOpportunityInterestSignal;
}) {
  await loadProjectForClient(input.projectSlug, input.email, input.userId);
  return recordOpportunityInterest(input.offer, input.signal);
}

export { CLIENT_APP_FIXTURE_SLUGS };
