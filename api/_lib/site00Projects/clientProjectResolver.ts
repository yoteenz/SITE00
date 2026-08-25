/**
 * Client project resolver — DB-registered projects outside founder index (e.g. astral-world).
 */

import {
  getActiveAndUnavailableCapabilities,
  hasProjectCapability,
} from '../../../shared/site00-projects/capabilities.js';
import type {
  Site00ProjectDetail,
  Site00ProjectIndexEntry,
} from '../../../shared/site00-projects/types.js';
import { site00ProjectDetailRoute, site00ProjectIdentityRoute, site00ProjectOriginRoute } from '../../../shared/site00-access/routes.js';
import { resolveCanonicalProject } from './canonicalProject.js';

const CLIENT_PROJECT_SLUGS = ['astral-world'] as const;

export function isClientRegisteredProjectSlug(slug: string): boolean {
  return (CLIENT_PROJECT_SLUGS as readonly string[]).includes(slug.trim().toLowerCase());
}

export async function resolveClientProjectIndexEntry(slug: string): Promise<Site00ProjectIndexEntry | null> {
  if (!isClientRegisteredProjectSlug(slug)) return null;
  const resolved = await resolveCanonicalProject({ slug });
  if (!resolved.ok) return null;
  const { project } = resolved;

  return {
    slug: project.slug,
    name: project.displayName.toUpperCase(),
    displayName: project.displayName,
    organizationSlug: project.slug,
    organizationUuid: project.organizationId ?? project.id,
    classification: 'MANAGED_BRAND',
    currentSystem: 'SITE 00 PROJECT CORE',
    currentPhase: project.status.replace(/_/g, ' '),
    focusNow:
      project.status === 'IDENTITY_IN_PROGRESS'
        ? 'IDENTITY EXPLORATION — AWAITING JUDGMENT'
        : project.status === 'IDENTITY_COMPLETE'
          ? 'IDENTITY CANON APPROVED — WORLD PHASE BLOCKED'
          : project.status === 'ORIGIN_INGESTED'
            ? 'ORIGIN COMPLETE — ENTER IDENTITY'
            : 'PRE-INGESTION — CLIENT TRUTH ONLY',
    lastActivity: null,
    surfaces: [
      {
        id: 'overview',
        label: 'OVERVIEW',
        route: site00ProjectDetailRoute(project.slug),
        available: true,
        description: 'Project registration — no creative production',
      },
      {
        id: 'origin',
        label: 'ORIGIN',
        route: site00ProjectOriginRoute(project.slug),
        available: hasProjectCapability(project.slug, 'ORIGIN_INGESTION'),
        description: 'Client truth ingestion — non-canonical source records',
      },
      {
        id: 'identity',
        label: 'IDENTITY',
        route: site00ProjectIdentityRoute(project.slug),
        available: hasProjectCapability(project.slug, 'BRAND_INTELLIGENCE'),
        description: 'Identity exploration — territories, judgment, canon promotion',
      },
    ],
    detailRoute: site00ProjectDetailRoute(project.slug),
    enrichmentStatus: 'COMPLETE',
    enrichmentNote: null,
  };
}

export async function resolveClientProjectDetail(slug: string): Promise<Site00ProjectDetail | null> {
  const index = await resolveClientProjectIndexEntry(slug);
  if (!index) return null;
  const resolved = await resolveCanonicalProject({ slug });
  if (!resolved.ok) return null;
  const caps = getActiveAndUnavailableCapabilities(slug);

  return {
    ...index,
    overview: {
      description:
        'Minimal PRE_INGESTION project record. Client truth may be stored; no brand/world/visual canon populated.',
      lifecycleStage: resolved.project.status,
      marketingHealth: null,
      importState: null,
      boundaryNote: 'Creative production not started — capability-gated methodology surfaces unavailable.',
      repositoryConnection: null,
    },
    intelligence: {
      available: hasProjectCapability(slug, 'PROJECT_INTELLIGENCE'),
      canonical: 0,
      reference: 0,
      ideas: 0,
      insights: 0,
      route: site00ProjectDetailRoute(slug),
    },
    evolve: {
      route: site00ProjectDetailRoute(slug),
      isMarketingClient: false,
      activeCampaigns: 0,
      needsApproval: 0,
    },
    creativeDirection: null,
    commercial: {
      applicability: 'NOT_APPLICABLE',
      applicabilityNote: 'Pre-ingestion client project — billing not activated',
      plan: null,
      planStatus: 'NOT_APPLICABLE',
      foundation: null,
      entitlements: null,
      paidMediaStatus: 'NOT_APPLICABLE',
      usageMetering: 'NOT_APPLICABLE',
      billingIntegrated: false,
      route: site00ProjectDetailRoute(slug),
    },
    assets: {
      available: false,
      route: site00ProjectDetailRoute(slug),
      note: 'Project-scoped asset vault not yet provisioned for this project',
    },
    production: {
      launchState: 'PRE_INGESTION',
      page001: null,
      publishingEnabled: false,
      crossPostingEnabled: false,
    },
    channels: [],
    channelsRoute: site00ProjectDetailRoute(slug),
    command: { focusNow: [], needsYou: [], blocked: [], upcoming: [], deferred: [] },
    activity: [
      {
        id: `${slug}-registered`,
        summary: `REGISTERED — ${resolved.project.projectType ?? 'WORLD'} / ${resolved.project.status}`,
        timestamp: null,
      },
      {
        id: `${slug}-capabilities`,
        summary: `ACTIVE CAPABILITIES: ${caps.active.join(', ')}`,
        timestamp: null,
      },
    ],
    activityNote: `Unavailable: ${caps.unavailable.slice(0, 8).join(', ')}${caps.unavailable.length > 8 ? '…' : ''}`,
  };
}

export async function listClientRegisteredProjectIndexEntries(): Promise<Site00ProjectIndexEntry[]> {
  const entries: Site00ProjectIndexEntry[] = [];
  for (const slug of CLIENT_PROJECT_SLUGS) {
    const entry = await resolveClientProjectIndexEntry(slug);
    if (entry) entries.push(entry);
  }
  return entries;
}
