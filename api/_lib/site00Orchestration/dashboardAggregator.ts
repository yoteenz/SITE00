/**
 * Server-side dashboard aggregation over canonical orchestration state.
 * No parallel dashboard-only state — all data from orchestration tables/services.
 */

import { calculateReadiness } from './readinessCalculator.js';
import { buildCommandQueue, buildNextActions } from './commandQueue.js';
import { deriveProjectHealth, infrastructureHealth } from './projectHealth.js';
import {
  getOrganizations,
  findActiveManifest,
  getRequirementsForManifest,
  getManifests,
  getWorkstreams,
  getOverrides,
  getEvidence,
  getReconciliations,
  getExternalConnections,
  getHistory,
  getEvolveRoadmap,
  resolveStoreMode,
} from './storeAdapter.js';
import type { CommandQueueItem, OrganizationRow } from './types.js';

export type PortfolioEntry = {
  id: string;
  slug: string;
  name: string;
  classification: string;
  clientFacing: boolean;
  launchTarget: string | null;
  targetType: string | null;
  manifestStatus: string;
  isProvisional: boolean;
  readinessScore: number | null;
  readinessExplanation: string[];
  requiredComplete: string | null;
  projectHealth: string;
  blockerCount: number;
  pendingDecisionCount: number;
  currentWorkstream: string | null;
  nextAction: string | null;
  externalSystemHealth: string;
  lastSignal: string | null;
  deferredCount: number;
  route: string;
};

export type InfrastructureEntry = {
  id: string;
  slug: string;
  name: string;
  classification: string;
  health: string;
  connectionState: string;
  limitation: string | null;
  route: string;
};

export type NeedsYouItem = {
  id: string;
  organizationSlug: string;
  organizationName: string;
  title: string;
  reason: string;
  category: 'NEEDS_YOU';
  route: string;
  priority: number;
};

export type FocusNowItem = {
  rank: number;
  organizationSlug: string;
  organizationName: string;
  action: string;
  why: string;
  route: string;
  priority: number;
};

export type CommandQueueDisplayItem = CommandQueueItem & {
  id: string;
  route: string;
  lastUpdate: string | null;
  evidenceState: string;
};

export type ConnectionHealthItem = {
  id: string;
  organizationSlug: string;
  organizationName: string;
  logicalName: string;
  state: string;
  externalIdentifier: string | null;
  lastSync: string | null;
  errorReason: string | null;
  affectedProjects: string[];
};

export type ActivityDisplayItem = {
  id: string;
  summary: string;
  eventType: string;
  organizationName: string | null;
  timestamp: string;
  clockTime: string;
};

export type DriftAlert = {
  id: string;
  organizationSlug: string;
  label: string;
  detail: string;
  route: string;
};

export type ReconciliationInboxItem = {
  id: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  workstreamKey: string | null;
  requirementKey: string | null;
  declaredState: string;
  suggestedState: string;
  confidence: string;
  outcome: string;
  evidenceSummary: string;
  observedAt: string | null;
  adminDecision: string | null;
  route: string;
};

export type ManifestRequirementDisplay = {
  id: string;
  requirementKey: string;
  title: string;
  classification: string;
  executionStatus: string;
  whyRequired: string | null;
  blockingImpact: string | null;
  workstreamTitle: string | null;
  hasOverride: boolean;
  displayState: string;
};

export type ProjectControlSnapshot = {
  organization: OrganizationRow;
  launchTarget: {
    name: string;
    type: string;
    isProvisional: boolean;
    approvalState: string;
    masterRoadmapCount: number | null;
  } | null;
  readiness: ReturnType<typeof calculateReadiness> | null;
  currentPhase: string | null;
  workstreams: Array<{ key: string; title: string; status: string; stage: string }>;
  blockers: Array<{ title: string; reason: string; requirementId: string }>;
  needsYou: NeedsYouItem[];
  nextActions: Array<{ action: string; blocker: string | null; attentionState: string }>;
  recentSignals: Array<{ title: string; source: string; observedAt: string | null }>;
  evidence: Array<{ title: string; sourcePath: string | null; confidence: string | null; repository: string | null }>;
  reconciliations: ReconciliationInboxItem[];
  evolveItems: Array<{ title: string; status: string; category: string }>;
  connections: ConnectionHealthItem[];
  activity: ActivityDisplayItem[];
  requirements: ManifestRequirementDisplay[];
  driftAlerts: DriftAlert[];
};

export type OrchestrationDashboardSnapshot = {
  persistenceMode: 'memory' | 'supabase';
  portfolio: PortfolioEntry[];
  infrastructure: InfrastructureEntry[];
  needsYou: NeedsYouItem[];
  focusNow: FocusNowItem[];
  commandQueue: CommandQueueDisplayItem[];
  connections: ConnectionHealthItem[];
  activity: ActivityDisplayItem[];
  driftAlerts: DriftAlert[];
  reconciliationInbox: ReconciliationInboxItem[];
  organizations: Array<{ id: string; slug: string; name: string; clientFacing: boolean }>;
};

function formatClock(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function orgRoute(slug: string): string {
  return `/admin/site00/orchestration/${slug}`;
}

function reconciliationRoute(slug: string): string {
  return `/admin/site00/reconciliation?org=${encodeURIComponent(slug)}`;
}

function mapConnectionState(state: string): string {
  const s = state.toUpperCase();
  if (s === 'CONNECTED') return 'CONNECTED';
  if (s.includes('PARTIAL') || s === 'CONFIGURED') return 'PARTIAL';
  if (s.includes('STALE')) return 'STALE';
  if (s.includes('ERROR')) return 'ERROR';
  if (s.includes('UNAVAILABLE') || s.includes('NOT_ACCESSIBLE')) return 'UNAVAILABLE';
  if (s.includes('AUTH')) return 'NOT_CONFIGURED';
  return s || 'UNKNOWN';
}

function requirementDisplayState(classification: string, executionStatus: string, hasOverride: boolean): string {
  if (hasOverride) return 'OVERRIDDEN';
  if (classification === 'DEFERRED_BY_OWNER') return 'DEFERRED';
  if (classification === 'OPTIONAL_POST_LAUNCH') return 'OPTIONAL';
  if (classification === 'BLOCKED' || executionStatus === 'BLOCKED') return 'BLOCKED';
  if (executionStatus === 'COMPLETE' || executionStatus === 'VERIFIED') return 'COMPLETE';
  if (executionStatus === 'READY_FOR_REVIEW') return 'REQUIRES_REVIEW';
  return executionStatus.replace(/_/g, ' ');
}

function connectionHealthSummary(states: string[]): string {
  if (states.some((s) => mapConnectionState(s) === 'UNAVAILABLE')) return 'DEGRADED';
  if (states.some((s) => mapConnectionState(s) === 'PARTIAL')) return 'PARTIAL';
  if (states.every((s) => mapConnectionState(s) === 'CONNECTED')) return 'HEALTHY';
  return 'UNKNOWN';
}

function translateEventSummary(eventType: string, metadata: Record<string, unknown> | null): string {
  const map: Record<string, string> = {
    REGISTRY_BOOTSTRAPPED: 'Registry bootstrap completed',
    RECONCILIATION_DECIDED: 'Reconciliation decision recorded',
    MANIFEST_APPROVED: 'Launch manifest approved',
    REQUIREMENT_DEFERRED: 'Requirement deferred to Evolve',
    LAUNCH_OVERRIDE_APPLIED: 'Launch override created',
    EVIDENCE_RECORDED: 'Reconciliation evidence received',
    PROJECT_HEALTH_CHANGED: 'Project health changed',
  };
  return map[eventType] ?? eventType.replace(/_/g, ' ').toLowerCase();
}

export async function buildReconciliationInbox(orgId?: string): Promise<ReconciliationInboxItem[]> {
  const orgs = await getOrganizations();
  const items: ReconciliationInboxItem[] = [];

  for (const org of orgs) {
    if (orgId && org.id !== orgId) continue;
    const recs = await getReconciliations(org.id);
    for (const r of recs) {
      const meta = (r.metadata ?? {}) as Record<string, unknown>;
      items.push({
        id: String(r.id),
        organizationId: org.id,
        organizationSlug: org.slug,
        organizationName: org.name,
        workstreamKey: meta.workstream_key ? String(meta.workstream_key) : null,
        requirementKey: meta.requirement_key ? String(meta.requirement_key) : null,
        declaredState: String(r.declared_state ?? ''),
        suggestedState: String(r.suggested_state ?? ''),
        confidence: String(r.confidence ?? 'UNKNOWN'),
        outcome: String(r.outcome ?? ''),
        evidenceSummary: String(r.observed_evidence_summary ?? ''),
        observedAt: r.created_at ? String(r.created_at) : null,
        adminDecision: r.admin_decision ? String(r.admin_decision) : null,
        route: reconciliationRoute(org.slug),
      });
    }
  }

  return items.sort((a, b) => {
    if (a.adminDecision && !b.adminDecision) return 1;
    if (!a.adminDecision && b.adminDecision) return -1;
    return 0;
  });
}

export async function getOrchestrationDashboardSnapshot(): Promise<OrchestrationDashboardSnapshot> {
  const mode = await resolveStoreMode();
  const orgs = await getOrganizations();
  const clientFacing = orgs.filter((o) => o.client_facing);
  const infrastructure = orgs.filter((o) => !o.client_facing);
  const manifests = await getManifests();
  const overrides = await getOverrides();
  const allConnections = await getExternalConnections();

  const portfolio: PortfolioEntry[] = [];
  const needsYou: NeedsYouItem[] = [];
  const commandQueue: CommandQueueDisplayItem[] = [];
  const focusCandidates: FocusNowItem[] = [];
  let focusRank = 1;

  for (const org of clientFacing) {
    const manifest = await findActiveManifest(org.id);
    const reqs = manifest ? await getRequirementsForManifest(manifest.id) : [];
    const ws = await getWorkstreams(org.id);
    const readiness = manifest ? calculateReadiness(reqs, overrides) : null;
    const pendingManifests = manifests.filter((m) => m.organization_id === org.id && m.approval_state === 'PENDING').length;
    const pendingRecon = (await getReconciliations(org.id, true)).length;
    const orgConnections = allConnections.filter((c) => c.organization_id === org.id);
    const connStates = orgConnections.map((c) => String(c.connection_state ?? ''));
    const evolve = await getEvolveRoadmap(org.id);
    const queue = manifest
      ? buildCommandQueue({
          organizationSlug: org.slug,
          organizationName: org.name,
          requirements: reqs,
          workstreams: ws,
          overrides,
          pendingApprovals: pendingManifests + pendingRecon,
        })
      : [];

    const nextActions = manifest
      ? buildNextActions({
          organizationSlug: org.slug,
          organizationName: org.name,
          requirements: reqs,
          workstreams: ws,
          overrides,
          pendingApprovals: pendingManifests + pendingRecon,
        })
      : [];

    const activeWs = ws.find((w) => w.status === 'IN_PROGRESS') ?? ws[0];
    const health = deriveProjectHealth({
      organization: org,
      manifest,
      requirements: reqs,
      overrides,
      pendingReconciliations: pendingRecon,
      pendingApprovals: pendingManifests,
    });

    portfolio.push({
      id: org.id,
      slug: org.slug,
      name: org.name,
      classification: org.classification,
      clientFacing: org.client_facing,
      launchTarget: manifest?.target_name ?? null,
      targetType: manifest?.target_type ?? null,
      manifestStatus: manifest?.approval_state ?? 'NONE',
      isProvisional: manifest?.is_provisional !== false,
      readinessScore: readiness?.readinessScore ?? null,
      readinessExplanation: readiness?.explanation ?? [],
      requiredComplete: readiness ? `${readiness.completeItems} / ${readiness.requiredItems}` : null,
      projectHealth: health,
      blockerCount: readiness?.blockingRequirementsRemaining ?? 0,
      pendingDecisionCount: pendingRecon + pendingManifests,
      currentWorkstream: activeWs?.title ?? null,
      nextAction: nextActions[0]?.nextAction ?? null,
      externalSystemHealth: connectionHealthSummary(connStates),
      lastSignal: null,
      deferredCount: evolve.length,
      route: orgRoute(org.slug),
    });

    if (pendingRecon > 0) {
      needsYou.push({
        id: `recon-${org.slug}`,
        organizationSlug: org.slug,
        organizationName: org.name,
        title: `${pendingRecon} reconciliation decision${pendingRecon > 1 ? 's' : ''} waiting`,
        reason: 'Human review required to establish canonical launch baseline',
        category: 'NEEDS_YOU',
        route: reconciliationRoute(org.slug),
        priority: 1,
      });
      focusCandidates.push({
        rank: focusRank++,
        organizationSlug: org.slug,
        organizationName: org.name,
        action: `Review ${pendingRecon} reconciliation decision${pendingRecon > 1 ? 's' : ''}`,
        why: 'These decisions establish the first approved launch baseline',
        route: reconciliationRoute(org.slug),
        priority: 1,
      });
    }

    if (pendingManifests > 0) {
      needsYou.push({
        id: `manifest-${org.slug}`,
        organizationSlug: org.slug,
        organizationName: org.name,
        title: 'Launch manifest awaiting approval',
        reason: 'Required before launch progress can become canonical',
        category: 'NEEDS_YOU',
        route: orgRoute(org.slug),
        priority: 2,
      });
      focusCandidates.push({
        rank: focusRank++,
        organizationSlug: org.slug,
        organizationName: org.name,
        action: 'Approve launch manifest',
        why: 'Required before launch progress can become canonical',
        route: orgRoute(org.slug),
        priority: 2,
      });
    }

    const unavailableRepo = orgConnections.find((c) =>
      String(c.logical_name ?? '').toLowerCase().includes('repository') &&
      mapConnectionState(String(c.connection_state)) === 'UNAVAILABLE',
    );
    if (unavailableRepo) {
      needsYou.push({
        id: `conn-${org.slug}`,
        organizationSlug: org.slug,
        organizationName: org.name,
        title: 'Repository connection unavailable',
        reason: 'Production evidence cannot currently be reconciled',
        category: 'NEEDS_YOU',
        route: orgRoute(org.slug),
        priority: 3,
      });
      focusCandidates.push({
        rank: focusRank++,
        organizationSlug: org.slug,
        organizationName: org.name,
        action: 'Reconnect repository',
        why: 'Production evidence cannot currently be reconciled',
        route: orgRoute(org.slug),
        priority: 3,
      });
    }

    for (const item of queue) {
      commandQueue.push({
        ...item,
        id: `${org.slug}-${item.requirementId ?? item.actionLabel}-${item.requirementTitle}`,
        route: item.category === 'NEEDS_YOU' && item.actionLabel === 'APPROVE'
          ? orgRoute(org.slug)
          : item.category === 'NEEDS_YOU' && item.requirementTitle.includes('reconciliation')
            ? reconciliationRoute(org.slug)
            : orgRoute(org.slug),
        lastUpdate: null,
        evidenceState: 'FROM_ORCHESTRATION',
      });
    }
  }

  const infraEntries: InfrastructureEntry[] = [];
  for (const org of infrastructure) {
    const orgConnections = allConnections.filter((c) => c.organization_id === org.id);
    const health = infrastructureHealth({
      connectionStates: orgConnections.map((c) => String(c.connection_state ?? '')),
    });
    const partial = orgConnections.some((c) => mapConnectionState(String(c.connection_state)) === 'PARTIAL');
    infraEntries.push({
      id: org.id,
      slug: org.slug,
      name: org.name,
      classification: org.classification,
      health,
      connectionState: partial ? 'PARTIAL' : orgConnections.some((c) => mapConnectionState(String(c.connection_state)) === 'CONNECTED') ? 'CONNECTED' : 'UNKNOWN',
      limitation: org.slug === 'studio-world'
        ? 'Live signal → SITE 00 orchestration normalization incomplete'
        : null,
      route: orgRoute(org.slug),
    });
  }

  const connections: ConnectionHealthItem[] = [];
  for (const conn of allConnections) {
    const org = orgs.find((o) => o.id === conn.organization_id);
    if (!org) continue;
    connections.push({
      id: String(conn.id),
      organizationSlug: org.slug,
      organizationName: org.name,
      logicalName: String(conn.logical_name ?? ''),
      state: mapConnectionState(String(conn.connection_state ?? '')),
      externalIdentifier: conn.external_identifier ? String(conn.external_identifier) : null,
      lastSync: conn.last_sync_at ? String(conn.last_sync_at) : null,
      errorReason: mapConnectionState(String(conn.connection_state ?? '')) === 'UNAVAILABLE'
        ? 'Repository not accessible from current integration'
        : null,
      affectedProjects: [org.name],
    });
  }

  const history = await getHistory();
  let eventIdx = 0;
  const activity: ActivityDisplayItem[] = history.slice(0, 15).map((ev) => ({
    id: String(ev.id ?? `ev-${eventIdx++}`),
    summary: translateEventSummary(String(ev.event_type ?? ''), (ev.metadata as Record<string, unknown>) ?? null),
    eventType: String(ev.event_type ?? ''),
    organizationName: orgs.find((o) => o.id === ev.organization_id)?.name ?? null,
    timestamp: String(ev.created_at ?? new Date().toISOString()),
    clockTime: formatClock(String(ev.created_at ?? new Date().toISOString())),
  }));

  const reconciliationInbox = await buildReconciliationInbox();
  const pendingInbox = reconciliationInbox.filter((r) => !r.adminDecision);

  const driftAlerts: DriftAlert[] = [];
  for (const org of clientFacing) {
    const evidence = await getEvidence(org.id);
    const stale = evidence.filter((e) => {
      const observed = e.observed_at ? new Date(String(e.observed_at)).getTime() : 0;
      return observed > 0 && Date.now() - observed > 7 * 24 * 60 * 60 * 1000;
    });
    if (stale.length > 0) {
      driftAlerts.push({
        id: `stale-${org.slug}`,
        organizationSlug: org.slug,
        label: 'CONNECTION STALE',
        detail: `${stale.length} evidence record(s) older than 7 days — revalidation may be required`,
        route: orgRoute(org.slug),
      });
    }
    if (org.reconciliation_state === 'MISSING_EVIDENCE') {
      driftAlerts.push({
        id: `missing-${org.slug}`,
        organizationSlug: org.slug,
        label: 'RECONCILIATION REQUIRED',
        detail: 'Insufficient repository evidence for reconciliation',
        route: orgRoute(org.slug),
      });
    }
  }

  const focusNow = focusCandidates
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
    .map((f, i) => ({ ...f, rank: i + 1 }));

  commandQueue.sort((a, b) => a.priority - b.priority);

  return {
    persistenceMode: mode,
    portfolio,
    infrastructure: infraEntries,
    needsYou: needsYou.sort((a, b) => a.priority - b.priority),
    focusNow,
    commandQueue,
    connections,
    activity,
    driftAlerts,
    reconciliationInbox: pendingInbox,
    organizations: orgs.map((o) => ({ id: o.id, slug: o.slug, name: o.name, clientFacing: o.client_facing })),
  };
}

export async function getOrchestrationProjectDetail(orgSlug: string): Promise<ProjectControlSnapshot | null> {
  const orgs = await getOrganizations();
  const org = orgs.find((o) => o.slug === orgSlug);
  if (!org) return null;

  const manifest = await findActiveManifest(org.id);
  const reqs = manifest ? await getRequirementsForManifest(manifest.id) : [];
  const ws = await getWorkstreams(org.id);
  const overrides = await getOverrides();
  const readiness = manifest ? calculateReadiness(reqs, overrides) : null;
  const wsById = new Map(ws.map((w) => [w.id, w]));

  const requirements: ManifestRequirementDisplay[] = reqs.map((r) => ({
    id: r.id,
    requirementKey: r.requirement_key,
    title: r.title,
    classification: r.classification,
    executionStatus: r.execution_status,
    whyRequired: r.why_required,
    blockingImpact: r.blocking_impact,
    workstreamTitle: r.workstream_id ? wsById.get(r.workstream_id)?.title ?? null : null,
    hasOverride: overrides.has(r.id),
    displayState: requirementDisplayState(r.classification, r.execution_status, overrides.has(r.id)),
  }));

  const blockers = requirements
    .filter((r) => r.displayState === 'BLOCKED' || (r.classification !== 'DEFERRED_BY_OWNER' && r.executionStatus === 'NOT_STARTED' && r.blockingImpact))
    .map((r) => ({ title: r.title, reason: r.blockingImpact ?? r.whyRequired ?? 'Blocked', requirementId: r.id }));

  const pendingManifests = (await getManifests()).filter((m) => m.organization_id === org.id && m.approval_state === 'PENDING').length;
  const pendingRecon = (await getReconciliations(org.id, true)).length;
  const queue = manifest
    ? buildCommandQueue({
        organizationSlug: org.slug,
        organizationName: org.name,
        requirements: reqs,
        workstreams: ws,
        overrides,
        pendingApprovals: pendingManifests + pendingRecon,
      })
    : [];

  const needsYouItems: NeedsYouItem[] = queue
    .filter((q) => q.category === 'NEEDS_YOU')
    .map((q, i) => ({
      id: `ny-${org.slug}-${i}`,
      organizationSlug: org.slug,
      organizationName: org.name,
      title: q.requirementTitle,
      reason: q.reason,
      category: 'NEEDS_YOU' as const,
      route: reconciliationRoute(org.slug),
      priority: q.priority,
    }));

  const nextActions = manifest
    ? buildNextActions({
        organizationSlug: org.slug,
        organizationName: org.name,
        requirements: reqs,
        workstreams: ws,
        overrides,
        pendingApprovals: pendingManifests + pendingRecon,
      })
    : [];

  const evidence = (await getEvidence(org.id)).slice(0, 20).map((e) => ({
    title: String(e.title ?? ''),
    sourcePath: e.source_path ? String(e.source_path) : null,
    confidence: e.confidence ? String(e.confidence) : null,
    repository: e.repository ? String(e.repository) : null,
  }));

  const reconciliations = (await buildReconciliationInbox(org.id)).filter((r) => !r.adminDecision);
  const evolveItems = (await getEvolveRoadmap(org.id)).map((e) => ({
    title: String(e.title ?? ''),
    status: String(e.status ?? ''),
    category: String(e.category ?? ''),
  }));

  const orgConnections = (await getExternalConnections(org.id));
  const connections: ConnectionHealthItem[] = orgConnections.map((conn) => ({
    id: String(conn.id),
    organizationSlug: org.slug,
    organizationName: org.name,
    logicalName: String(conn.logical_name ?? ''),
    state: mapConnectionState(String(conn.connection_state ?? '')),
    externalIdentifier: conn.external_identifier ? String(conn.external_identifier) : null,
    lastSync: conn.last_sync_at ? String(conn.last_sync_at) : null,
    errorReason: mapConnectionState(String(conn.connection_state ?? '')) === 'UNAVAILABLE'
      ? 'Repository not accessible from current integration'
      : null,
    affectedProjects: [org.name],
  }));

  const history = await getHistory(org.id);
  let actIdx = 0;
  const activity: ActivityDisplayItem[] = history.slice(0, 12).map((ev) => ({
    id: String(ev.id ?? `ev-${actIdx++}`),
    summary: translateEventSummary(String(ev.event_type ?? ''), (ev.metadata as Record<string, unknown>) ?? null),
    eventType: String(ev.event_type ?? ''),
    organizationName: org.name,
    timestamp: String(ev.created_at ?? new Date().toISOString()),
    clockTime: formatClock(String(ev.created_at ?? new Date().toISOString())),
  }));

  const driftAlerts: DriftAlert[] = [];
  if (org.reconciliation_state === 'MISSING_EVIDENCE') {
    driftAlerts.push({
      id: `missing-${org.slug}`,
      organizationSlug: org.slug,
      label: 'RECONCILIATION REQUIRED',
      detail: 'Insufficient repository evidence — connection issue or pending ingestion',
      route: reconciliationRoute(org.slug),
    });
  }

  const activePhase = ws.find((w) => w.status === 'IN_PROGRESS')?.stage ?? ws[0]?.stage ?? null;

  return {
    organization: org,
    launchTarget: manifest
      ? {
          name: manifest.target_name,
          type: manifest.target_type,
          isProvisional: manifest.is_provisional !== false,
          approvalState: manifest.approval_state,
          masterRoadmapCount: manifest.master_roadmap_count ?? null,
        }
      : null,
    readiness,
    currentPhase: activePhase,
    workstreams: ws.map((w) => ({ key: w.workstream_key, title: w.title, status: w.status, stage: w.stage })),
    blockers,
    needsYou: needsYouItems,
    nextActions: nextActions.map((a) => ({ action: a.nextAction, blocker: a.blocker, attentionState: a.attentionState })),
    recentSignals: evidence.slice(0, 5).map((e) => ({ title: e.title, source: 'evidence', observedAt: null })),
    evidence,
    reconciliations,
    evolveItems,
    connections,
    activity,
    requirements,
    driftAlerts,
  };
}
