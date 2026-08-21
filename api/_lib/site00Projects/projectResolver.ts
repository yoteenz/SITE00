/** SITE 00 project resolver — aggregates canonical references, never fabricates state */

import { orgIdFromSlug } from '../site00Evolve/orgRegistry.js';
import { resolveOrgContext, getEvolveOverview, ensureEvolveSeeded } from '../site00Evolve/evolveService.js';
import { marketingRetrievalSummary } from '../site00Evolve/contentBrain.js';
import { getProfileByOrgId, getChannelsByOrgId } from '../site00Evolve/storeAdapter.js';
import { buildConnectionCommandItems } from '../site00Evolve/providers/commandConnections.js';
import { getNdxbookImportState } from '../site00Evolve/providers/ndxbookLegacyImportService.js';
import { getCreativeDirectionPayload } from '../site00Evolve/creativeDirection/engagementService.js';
import { getPage001Candidate } from '../site00Evolve/providers/page001CandidateService.js';
import { getExpandedPilotReadiness } from '../site00Evolve/providers/pilotReadinessSprint04.js';
import { isMarketingClientOrg } from '../site00Evolve/seedFixtures.js';
import type {
  Site00FounderProjectSlug,
  Site00ProjectCommandItem,
  Site00ProjectDetail,
  Site00ProjectIndexEntry,
  Site00ProjectsIndexPayload,
} from '../../../shared/site00-projects/types.js';
import { FOUNDER_PROJECTS, isFounderProjectSlug } from './projectRegistry.js';
import {
  site00ProjectCreativeDirectionRoute,
  site00ProjectConnectionsRoute,
  site00ProjectDetailRoute,
  site00ProjectEvolveRoute,
  site00AdminEvolveRoute,
  site00AdminOrchestrationRoute,
} from '../../../shared/site00-access/routes.js';

const NDXBOOK_UUID = '7681ab75-bddc-43e5-b594-79fcf8168205';
const AIO_UUID = '3781f0b7-cbc5-470d-8af7-69b97cfa5729';

async function resolveRepositoryConnection(slug: Site00FounderProjectSlug): Promise<string | null> {
  if (slug !== 'all-in-one-enterprises') return null;
  try {
    const { findOrgBySlug } = await import('../site00Orchestration/storeAdapter.js');
    const org = await findOrgBySlug(slug);
    if (!org) return 'UNAVAILABLE — NEEDS CONFIGURATION';
    const meta = (org.metadata ?? {}) as Record<string, unknown>;
    if (
      org.external_repository === 'UNVERIFIED' ||
      org.external_repository === 'TO_BE_CONNECTED_IN_SPRINT_02' ||
      meta.github_repo === 'NOT_ACCESSIBLE'
    ) {
      return 'UNAVAILABLE — NEEDS CONFIGURATION';
    }
    return org.external_repository ? String(org.external_repository) : 'UNAVAILABLE — NEEDS CONFIGURATION';
  } catch {
    return 'UNAVAILABLE — NEEDS CONFIGURATION';
  }
}

function detailRoute(slug: Site00FounderProjectSlug): string {
  return site00ProjectDetailRoute(slug);
}

function mapCommandItems(
  items: Awaited<ReturnType<typeof buildConnectionCommandItems>>,
): Site00ProjectCommandItem[] {
  return items.map((i) => ({
    id: i.id,
    category: i.category as Site00ProjectCommandItem['category'],
    title: i.title,
    reason: i.reason,
    route: i.route,
  }));
}

function pickFocusNow(items: Site00ProjectCommandItem[]): string | null {
  const focus = items.find((i) => i.category === 'FOCUS_NOW');
  if (focus) return focus.title.toUpperCase();
  const needs = items.find((i) => i.category === 'NEEDS_YOU');
  if (needs) return needs.title.toUpperCase();
  return null;
}

async function buildSurfaces(slug: Site00FounderProjectSlug, isClient: boolean): Promise<Site00ProjectIndexEntry['surfaces']> {
  const adminBase = site00AdminOrchestrationRoute(slug);
  const surfaces: Site00ProjectIndexEntry['surfaces'] = [
    { id: 'overview', label: 'OVERVIEW', route: detailRoute(slug), available: true },
  ];

  if (isClient) {
    surfaces.push(
      { id: 'evolve', label: 'EVOLVE', route: site00ProjectEvolveRoute(slug), adminRoute: site00AdminEvolveRoute(slug), available: true },
      { id: 'connections', label: 'CONNECTIONS', route: site00ProjectConnectionsRoute(slug), adminRoute: site00AdminEvolveRoute(slug, 'connections'), available: true },
    );
  }

  if (slug === 'ndxbook') {
    surfaces.push(
      {
        id: 'creative-direction',
        label: 'CREATIVE DIRECTION',
        route: site00ProjectCreativeDirectionRoute('ndxbook'),
        adminRoute: site00AdminEvolveRoute('ndxbook', 'creative-direction'),
        available: true,
      },
      {
        id: 'pilot',
        label: 'PILOT CONTROL',
        route: site00ProjectEvolveRoute('ndxbook'),
        adminRoute: site00AdminEvolveRoute('ndxbook', 'pilot'),
        available: true,
        description: 'PILOT OPERATIONS — ADMIN ORCHESTRATION WHEN REQUIRED',
      },
    );
  }

  if (slug === 'studio-world') {
    surfaces.push({
      id: 'integration',
      label: 'INTEGRATION STATUS',
      route: detailRoute(slug),
      adminRoute: adminBase,
      available: true,
      description: 'PRODUCTION INFRASTRUCTURE — NOT CLIENT MARKETING',
    });
  }

  if (slug === 'all-in-one-enterprises') {
    surfaces.push({
      id: 'operations',
      label: 'OPERATIONS',
      route: detailRoute(slug),
      adminRoute: adminBase,
      available: true,
      description: 'CORE SERVICE OPERATIONS — ADMIN ORCHESTRATION FOR LAUNCH MANIFEST',
    });
  }

  return surfaces;
}

async function resolveProjectPhase(slug: Site00FounderProjectSlug): Promise<string> {
  if (slug === 'ndxbook') {
    const importState = getNdxbookImportState();
    if (importState.state !== 'IMPORTED') return 'INTELLIGENCE IMPORT';
    try {
      const cd = await getCreativeDirectionPayload('ndxbook');
      if (cd.engagement.visualDna.status !== 'APPROVED') return 'CREATIVE DIRECTION REVIEW';
      return 'VISUAL DNA APPROVED';
    } catch {
      return 'CREATIVE DIRECTION REVIEW';
    }
  }

  if (slug === 'frontal-slayer') {
    const profile = await getProfileByOrgId(orgIdFromSlug('frontal-slayer')!);
    return profile?.lifecycle_stage?.replace(/_/g, ' ') ?? 'PRE LAUNCH';
  }

  if (slug === 'all-in-one-enterprises') {
    const profile = await getProfileByOrgId(orgIdFromSlug('all-in-one-enterprises')!);
    if (profile?.lifecycle_stage === 'POST_LAUNCH') return 'POST LAUNCH — CORE SERVICE OPERATIONS';
    return profile?.lifecycle_stage?.replace(/_/g, ' ') ?? 'CORE SERVICE OPERATIONS';
  }

  return 'ACTIVE INFRASTRUCTURE';
}

async function buildActivity(slug: Site00FounderProjectSlug): Promise<Site00ProjectDetail['activity']> {
  const events: Site00ProjectDetail['activity'] = [];

  if (slug === 'ndxbook') {
    const importState = getNdxbookImportState();
    if (importState.importedAt) {
      events.push({
        id: 'ndxbook-import',
        summary: 'LEGACY INTELLIGENCE IMPORT COMPLETE',
        timestamp: importState.importedAt,
      });
    }
    try {
      const cd = await getCreativeDirectionPayload('ndxbook');
      events.push({
        id: 'ndxbook-cd',
        summary: `CREATIVE DIRECTION TERRITORIES GENERATED — ${cd.engagement.founderDecision ? 'DECISION RECORDED' : 'AWAITING FOUNDER DECISION'}`,
        timestamp: cd.engagement.updated_at,
      });
    } catch {
      /* no engagement yet */
    }
    const page001 = getPage001Candidate('ndxbook');
    if (page001) {
      events.push({
        id: 'ndxbook-page001',
        summary: `PAGE 001 CANDIDATE — ${page001.topic || 'TOPIC SET'} — VISUAL ${page001.visualApproval}`,
        timestamp: null,
      });
    }
  }

  if (slug === 'frontal-slayer') {
    const brain = marketingRetrievalSummary('frontal-slayer');
    if (brain.available) {
      events.push({
        id: 'fs-intel',
        summary: `CONTENT BRAIN — ${brain.canonical} CANONICAL · ${brain.reference} REFERENCE ENTRIES`,
        timestamp: null,
      });
    }
  }

  if (slug === 'studio-world') {
    events.push({
      id: 'sw-boundary',
      summary: 'PRODUCTION INFRASTRUCTURE REGISTERED — RUNTIME BOUNDARY MAINTAINED',
      timestamp: null,
    });
  }

  if (slug === 'all-in-one-enterprises') {
    events.push({
      id: 'aio-lifecycle',
      summary: 'MANAGED BRAND REGISTERED — CORE SERVICE OPERATIONS ACTIVE',
      timestamp: null,
    });
  }

  return events;
}

export async function resolveSite00Project(slug: string): Promise<Site00ProjectDetail | null> {
  if (!isFounderProjectSlug(slug)) return null;

  await ensureEvolveSeeded();
  const def = FOUNDER_PROJECTS.find((p) => p.slug === slug)!;
  const orgCtx = resolveOrgContext(slug);
  const orgUuid = orgIdFromSlug(slug);
  if (!orgUuid) return null;

  if (slug === 'ndxbook' && process.env.EVOLVE_USE_MEMORY !== '1' && process.env.VITEST !== 'true') {
    if (orgUuid !== NDXBOOK_UUID) throw new Error('NDXbook UUID mismatch');
  }

  if (slug === 'all-in-one-enterprises' && process.env.EVOLVE_USE_MEMORY !== '1' && process.env.VITEST !== 'true') {
    if (orgUuid !== AIO_UUID) throw new Error('AIO UUID mismatch');
  }

  const isClient = isMarketingClientOrg(orgCtx.classification);
  const overview = await getEvolveOverview(slug, orgCtx);
  const intel = marketingRetrievalSummary(slug);
  let commandRaw: Awaited<ReturnType<typeof buildConnectionCommandItems>> = [];
  if (isClient) {
    try {
      commandRaw = await buildConnectionCommandItems(slug, orgCtx.name);
    } catch {
      /* provider/command enrichment unavailable — project identity still valid */
    }

    for (const deferred of overview.deferredItems) {
      commandRaw.push({
        id: `evolve-deferred-${slug}-${deferred.replace(/\s+/g, '-').toLowerCase()}`,
        organizationSlug: slug,
        organizationName: orgCtx.name,
        category: 'DEFERRED',
        title: `${deferred} — deferred by owner`,
        reason: 'Owner decision — not a launch or EVOLVE blocker',
        route: site00ProjectEvolveRoute(slug),
        priority: 95,
      });
    }

    const nba = overview.nextBestAction;
    if (nba && !commandRaw.some((i) => i.id === `evolve-nba-${slug}`)) {
      commandRaw.push({
        id: `evolve-nba-${slug}`,
        organizationSlug: slug,
        organizationName: orgCtx.name,
        category: nba.category,
        title: nba.title,
        reason: nba.reason,
        route: nba.route,
        priority: nba.priority,
      });
    }
  }
  const commandItems = mapCommandItems(commandRaw);
  const currentPhase = await resolveProjectPhase(slug);
  const profile = isClient ? await getProfileByOrgId(orgUuid) : null;
  const channels = isClient ? await getChannelsByOrgId(orgUuid) : [];

  let creativeDirection: Site00ProjectDetail['creativeDirection'] = null;
  if (isClient) {
    try {
      const cd = await getCreativeDirectionPayload(slug);
      creativeDirection = {
        available: true,
        lifecycleState: cd.engagement.lifecycle_state,
        founderDecision: cd.engagement.founderDecision?.type ?? 'PENDING',
        visualDnaStatus: cd.engagement.visualDna.status,
        territoriesGenerated: cd.engagement.territories.length > 0,
        route: site00ProjectCreativeDirectionRoute(slug),
        adminRoute: site00AdminEvolveRoute(slug, 'creative-direction'),
        page001Gate: cd.engagement.page001Gate,
      };
    } catch {
      creativeDirection = slug === 'ndxbook'
        ? {
            available: false,
            lifecycleState: 'NOT STARTED',
            founderDecision: 'PENDING',
            visualDnaStatus: 'INCOMPLETE',
            territoriesGenerated: false,
            route: site00ProjectCreativeDirectionRoute(slug),
        adminRoute: site00AdminEvolveRoute(slug, 'creative-direction'),
            page001Gate: {
              visualDnaApproved: false,
              productionEligible: false,
              blockedReason: 'Visual DNA requires founder-approved Creative Direction',
            },
          }
        : null;
    }
  }

  let importState: string | null = null;
  let production: Site00ProjectDetail['production'];
  if (slug === 'ndxbook') {
    importState = getNdxbookImportState().state;
    const page001 = getPage001Candidate('ndxbook');
    let publishingEnabled = false;
    let crossPostingEnabled = false;
    try {
      const readiness = await getExpandedPilotReadiness('ndxbook');
      publishingEnabled = readiness.publishingFence === 'ENABLED' && readiness.globalPublishing.startsWith('ENABLED');
      crossPostingEnabled = readiness.crossPosting === 'ENABLED';
    } catch {
      /* pilot readiness unavailable — publishing remains disabled */
    }
    production = {
      launchState: 'PRE-LAUNCH PILOT',
      page001: page001
        ? {
            topic: page001.topic || null,
            contentState: page001.contentState,
            visualApproval: page001.visualApproval,
            publicationApproval: page001.publicationApproval,
            distribution: page001.distribution,
          }
        : null,
      publishingEnabled,
      crossPostingEnabled,
    };
  } else if (slug === 'frontal-slayer') {
    production = {
      launchState: profile?.lifecycle_stage === 'POST_LAUNCH' ? 'LIVE' : 'PRE-LAUNCH',
      page001: null,
      publishingEnabled: false,
      crossPostingEnabled: false,
    };
  } else if (slug === 'all-in-one-enterprises') {
    production = {
      launchState: profile?.lifecycle_stage === 'POST_LAUNCH' ? 'POST-LAUNCH OPERATIONS' : 'PRE-LAUNCH',
      page001: null,
      publishingEnabled: false,
      crossPostingEnabled: false,
    };
  } else {
    production = {
      launchState: 'INFRASTRUCTURE',
      page001: null,
      publishingEnabled: false,
      crossPostingEnabled: false,
    };
  }

  const indexEntry: Site00ProjectIndexEntry = {
    slug,
    name: def.name,
    displayName: def.displayName,
    internalLabel: def.internalLabel,
    organizationSlug: slug,
    organizationUuid: orgUuid,
    classification: orgCtx.classification,
    currentSystem: def.currentSystem,
    currentPhase,
    focusNow: pickFocusNow(commandItems),
    lastActivity: (await buildActivity(slug))[0]?.timestamp ?? null,
    surfaces: await buildSurfaces(slug, isClient),
    detailRoute: detailRoute(slug),
    enrichmentStatus: 'COMPLETE',
  };

  const channelSummaries = channels.map((c) => ({
    key: c.channel_key,
    state: c.channel_state,
    locked: slug === 'ndxbook' && c.channel_key !== 'INSTAGRAM',
  }));

  const repositoryConnection = await resolveRepositoryConnection(slug);

  return {
    ...indexEntry,
    overview: {
      description: def.description,
      lifecycleStage: profile?.lifecycle_stage ?? null,
      marketingHealth: overview.marketingHealth,
      importState,
      boundaryNote: def.boundaryNote ?? null,
      repositoryConnection,
    },
    intelligence: {
      available: intel.available,
      canonical: intel.canonical,
      reference: intel.reference,
      ideas: intel.ideas,
      insights: intel.insights,
      route: detailRoute(slug),
      adminRoute: site00AdminOrchestrationRoute(slug),
    },
    evolve: {
      route: site00ProjectEvolveRoute(slug),
      adminRoute: site00AdminEvolveRoute(slug),
      isMarketingClient: isClient,
      activeCampaigns: overview.activeCampaigns ?? 0,
      needsApproval: overview.needsApproval ?? 0,
    },
    creativeDirection,
    assets: {
      available: false,
      route: `/admin/site00/projects/${slug}`,
      note: 'ASSET VAULT LINKAGE PARTIAL — REFERENCE ASSTS ROUTES WHEN AVAILABLE',
    },
    production,
    channels: channelSummaries,
    channelsRoute: site00ProjectConnectionsRoute(slug),
    command: {
      focusNow: commandItems.filter((i) => i.category === 'FOCUS_NOW'),
      needsYou: commandItems.filter((i) => i.category === 'NEEDS_YOU'),
      blocked: commandItems.filter((i) => i.category === 'BLOCKED'),
      upcoming: commandItems.filter((i) => i.category === 'UPCOMING'),
      deferred: commandItems.filter((i) => i.category === 'DEFERRED'),
    },
    activity: await buildActivity(slug),
    activityNote: slug === 'studio-world' ? 'UNIFIED ACTIVITY TIMELINE NOT YET IMPLEMENTED — SHOWING TRUTHFUL INDEX EVENTS ONLY' : null,
  };
}

async function buildMinimalIndexEntry(
  def: (typeof FOUNDER_PROJECTS)[number],
  error?: unknown,
): Promise<Site00ProjectIndexEntry | null> {
  const orgUuid = orgIdFromSlug(def.slug);
  if (!orgUuid) return null;
  let orgCtx;
  try {
    orgCtx = resolveOrgContext(def.slug);
  } catch {
    return null;
  }
  const isClient = isMarketingClientOrg(orgCtx.classification);
  return {
    slug: def.slug,
    name: def.name,
    displayName: def.displayName,
    internalLabel: def.internalLabel,
    organizationSlug: def.slug,
    organizationUuid: orgUuid,
    classification: orgCtx.classification,
    currentSystem: def.currentSystem,
    currentPhase: 'ENRICHMENT PARTIAL',
    focusNow: null,
    lastActivity: null,
    surfaces: await buildSurfaces(def.slug, isClient),
    detailRoute: detailRoute(def.slug),
    enrichmentStatus: 'PARTIAL',
    enrichmentNote: error instanceof Error ? error.message : 'Project enrichment unavailable',
  };
}

export async function listSite00FounderProjects(): Promise<Site00ProjectIndexEntry[]> {
  try {
    await ensureEvolveSeeded();
  } catch {
    /* seeding failure must not erase registry identities */
  }

  const projects: Site00ProjectIndexEntry[] = [];
  for (const def of FOUNDER_PROJECTS) {
    try {
      const detail = await resolveSite00Project(def.slug);
      if (detail) projects.push(detail);
    } catch (err) {
      const fallback = await buildMinimalIndexEntry(def, err);
      if (fallback) projects.push(fallback);
    }
  }
  return projects;
}

function buildIndexSummary(
  projects: Site00ProjectIndexEntry[],
  clientProjects?: Array<{ id: string; slug: string; name: string; studioRoute: string }>,
): Site00ProjectsIndexPayload['summary'] {
  const clientCount = clientProjects?.length ?? 0;
  return {
    total: projects.length + clientCount,
    founderIndex: projects.length,
    clientProjects: clientCount,
    partial: projects.filter((p) => p.enrichmentStatus === 'PARTIAL').length,
  };
}

export async function getSite00ProjectsIndexPayload(
  clientProjects?: Array<{ id: string; slug: string; name: string; studioRoute: string }>,
): Promise<Site00ProjectsIndexPayload> {
  const projects = await listSite00FounderProjects();
  return {
    ok: true,
    projects,
    source: 'site00_project_resolver',
    summary: buildIndexSummary(projects, clientProjects),
    clientProjects,
  };
}

/** Regression guard — demo project names must never appear in founder index */
export const DEMO_PROJECT_NAMES = [
  'Northquarter Brand + Digital Launch',
  'Future Archives Preservation Platform',
  'Jordan Cole Studio Website',
  'Product Research Hub',
  'Internal Tools Redesign',
];

export function assertNoDemoProjectsInIndex(projects: Site00ProjectIndexEntry[]): void {
  for (const p of projects) {
    if (DEMO_PROJECT_NAMES.some((d) => p.name.toLowerCase().includes(d.toLowerCase()))) {
      throw new Error(`Demo project leaked into founder index: ${p.name}`);
    }
  }
}
