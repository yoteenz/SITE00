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

const NDXBOOK_UUID = '7681ab75-bddc-43e5-b594-79fcf8168205';

function orchestrationRoute(slug: string): string {
  return `/admin/site00/orchestration/${slug}`;
}

function evolveRoute(slug: string, section?: string): string {
  const base = `/admin/site00/orchestration/${slug}/evolve`;
  return section ? `${base}/${section}` : base;
}

function detailRoute(slug: Site00FounderProjectSlug): string {
  return `/projects/${slug}`;
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
  const base = orchestrationRoute(slug);
  const surfaces: Site00ProjectIndexEntry['surfaces'] = [
    { id: 'overview', label: 'OVERVIEW', route: detailRoute(slug), available: true },
    { id: 'orchestration', label: 'ORCHESTRATION', route: base, available: true },
  ];

  if (isClient) {
    surfaces.push(
      { id: 'evolve', label: 'EVOLVE', route: evolveRoute(slug), available: true },
      { id: 'connections', label: 'CONNECTIONS', route: evolveRoute(slug, 'connections'), available: true },
    );
  }

  if (slug === 'ndxbook') {
    surfaces.push(
      { id: 'creative-direction', label: 'CREATIVE DIRECTION', route: evolveRoute('ndxbook', 'creative-direction'), available: true },
      { id: 'pilot', label: 'PILOT CONTROL', route: evolveRoute('ndxbook', 'pilot'), available: true },
    );
  }

  if (slug === 'studio-world') {
    surfaces.push({
      id: 'integration',
      label: 'INTEGRATION STATUS',
      route: base,
      available: true,
      description: 'PRODUCTION INFRASTRUCTURE — NOT CLIENT MARKETING',
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

  const isClient = isMarketingClientOrg(orgCtx.classification);
  const overview = await getEvolveOverview(slug, orgCtx);
  const intel = marketingRetrievalSummary(slug);
  const commandRaw = isClient ? await buildConnectionCommandItems(slug, orgCtx.name) : [];
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
        founderDecision: cd.engagement.founderDecision?.decision_type ?? 'PENDING',
        visualDnaStatus: cd.engagement.visualDna.status,
        territoriesGenerated: cd.engagement.territories.length > 0,
        route: evolveRoute(slug, 'creative-direction'),
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
            route: evolveRoute(slug, 'creative-direction'),
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
    const readiness = await getExpandedPilotReadiness('ndxbook');
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
      publishingEnabled: readiness.publishingFence === 'ENABLED' && readiness.globalPublishing.startsWith('ENABLED'),
      crossPostingEnabled: readiness.crossPosting === 'ENABLED',
    };
  } else if (slug === 'frontal-slayer') {
    production = {
      launchState: profile?.lifecycle_stage === 'POST_LAUNCH' ? 'LIVE' : 'PRE-LAUNCH',
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
  };

  const channelSummaries = channels.map((c) => ({
    key: c.channel_key,
    state: c.channel_state,
    locked: slug === 'ndxbook' && c.channel_key !== 'INSTAGRAM',
  }));

  return {
    ...indexEntry,
    overview: {
      description: def.description,
      lifecycleStage: profile?.lifecycle_stage ?? null,
      marketingHealth: overview.marketingHealth,
      importState,
      boundaryNote: def.boundaryNote ?? null,
    },
    intelligence: {
      available: intel.available,
      canonical: intel.canonical,
      reference: intel.reference,
      ideas: intel.ideas,
      insights: intel.insights,
      route: orchestrationRoute(slug),
    },
    evolve: {
      route: evolveRoute(slug),
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
    channelsRoute: evolveRoute(slug, 'connections'),
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

export async function listSite00FounderProjects(): Promise<Site00ProjectIndexEntry[]> {
  const projects: Site00ProjectIndexEntry[] = [];
  for (const def of FOUNDER_PROJECTS) {
    const detail = await resolveSite00Project(def.slug);
    if (detail) projects.push(detail);
  }
  return projects;
}

export async function getSite00ProjectsIndexPayload(
  clientProjects?: Array<{ id: string; slug: string; name: string; studioRoute: string }>,
): Promise<Site00ProjectsIndexPayload> {
  const projects = await listSite00FounderProjects();
  return {
    projects,
    source: 'site00_project_resolver',
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
