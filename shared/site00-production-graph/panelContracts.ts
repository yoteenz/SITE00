/**
 * PANEL INTELLIGENCE CONTRACT.
 *
 * Every Production Workspace panel answers eleven questions: what it shows (display_purpose), whose node / scope
 * (node_scope), why here (display_purpose), which source of truth (source_of_truth + query_source), what the user
 * can do (primary_action / secondary_actions), the transition (state_transition), what else changes
 * (downstream_effects), and its empty / error / loading states and project-scope rule.
 *
 * GRAPH_PANEL_CONTRACTS — the panels that project the active project's graph (this sprint).
 * AUDITED_PANELS       — every pre-existing panel, classified, with what happened to it. A panel is not preserved
 *                        just because it exists: each non-canonical panel is rewritten, merged, gated to the one
 *                        project whose truth it shows, unmounted, or removed.
 */
import type { WorkspaceDomain } from './types.js';

export type PanelClassification =
  | 'REAL_CANONICAL'
  | 'REAL_BUT_POORLY_SCOPED'
  | 'REAL_BUT_POORLY_LABELLED'
  | 'LEGACY'
  | 'MOCK'
  | 'DECORATIVE'
  | 'DUPLICATE'
  | 'PROJECT_LEAK'
  | 'OBSOLETE_PIPELINE'
  | 'UNRESOLVED';

/**
 * KEPT                  canonical as-is
 * REWRITTEN             same panel, new contract (scope / label / count fixed)
 * REPLACED              superseded by a graph panel (replacement names it)
 * GATED_TO_OWN_PROJECT  shows one project's truth; now renders only under that project
 * UNMOUNTED             no longer routed (source kept for its own tests / history)
 * REMOVED               deleted from the surface
 * OPEN                  not resolved this sprint (listed in REMAINING)
 */
export type PanelDisposition = 'KEPT' | 'REWRITTEN' | 'REPLACED' | 'GATED_TO_OWN_PROJECT' | 'UNMOUNTED' | 'REMOVED' | 'OPEN';

export type PanelContract = {
  panel_id: string;
  /** Contracts are per panel; the project is always the ACTIVE project at render time. */
  project_id: 'ACTIVE_PROJECT';
  workspace_domain: WorkspaceDomain;
  surface: string;
  node_scope: string;
  query_source: string;
  data_dependencies: readonly string[];
  display_purpose: string;
  source_of_truth: string;
  primary_action: string | null;
  secondary_actions: readonly string[];
  state_transition: string | null;
  downstream_effects: readonly WorkspaceDomain[];
  empty_state: string;
  loading_state: string;
  error_state: string;
  visibility_rule: string;
  refresh_rule: string;
  artifact_dependencies: readonly string[];
  classification: 'REAL_CANONICAL';
};

const SCOPE = 'Reads only useProjectGraphData() — the ACTIVE project graph; getWorkspacePanelData throws PROJECT_SCOPE_VIOLATION on a foreign graph; no fallback project.';
const LOADING = 'Static source truth assembles synchronously; a live part (NDXBOOK Entry 002) adds its nodes when the hub read resolves — counts never show a placeholder value.';
const ERROR = 'An adapter with no truth contributes nothing: the panel shows its project-scoped empty state, never another project.';
const REFRESH = 'Re-derives on project change, workspace-ledger event (site00:production-workspace-ledger) and storage sync.';

function graphPanel(c: Omit<PanelContract, 'project_id' | 'loading_state' | 'error_state' | 'refresh_rule' | 'classification' | 'visibility_rule'> & Partial<Pick<PanelContract, 'loading_state' | 'error_state' | 'refresh_rule' | 'visibility_rule'>>): PanelContract {
  return { project_id: 'ACTIVE_PROJECT', loading_state: LOADING, error_state: ERROR, refresh_rule: REFRESH, visibility_rule: SCOPE, classification: 'REAL_CANONICAL', ...c };
}

const DECIDE = 'Approve / request revision / reject / mark decided → WorkspaceAction in the project ledger';
const DECIDE_TRANSITION =
  'APPROVE: node APPROVED + authority LOCKED, IN_REVIEW artifacts → CANONICAL, item RESOLVED, downstream blockers UNLOCKED · REVISE/REJECT: node BLOCKED, artifacts REVISE, review request WATCHING · RESOLVE: decision DECIDED, page-tree gate recomputed';
const ALL_TABS: readonly WorkspaceDomain[] = ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'];

export const GRAPH_PANEL_CONTRACTS: readonly PanelContract[] = [
  /* ── HUB ── */
  graphPanel({
    panel_id: 'project-hub-head',
    workspace_domain: 'HUB',
    surface: 'ProjectHubBody',
    node_scope: 'project',
    query_source: 'graph.phase · graph.next_action',
    data_dependencies: ['nodes.pipeline_step', 'decisions', 'blockers'],
    display_purpose: 'Where the project is (earliest open pipeline step) and the single next action — the control-plane headline.',
    source_of_truth: 'Project graph (adapters over the project source truth)',
    primary_action: 'Open the next action (deep link to its node)',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NO PRODUCTION NODE HAS BEEN RECORDED FOR THIS PROJECT YET.',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-hub-counts',
    workspace_domain: 'HUB',
    surface: 'ProjectHubBody',
    node_scope: 'project',
    query_source: 'hubSummary(graph)',
    data_dependencies: ['decisions NEEDS_YOU', 'projectBlockers', 'nodes REVIEW_REQUIRED', 'top-level COMPLETE'],
    display_purpose: 'NEED YOU / BLOCKERS / IN REVIEW / COMPLETE — each number is a list length and links to that list.',
    source_of_truth: 'Project graph',
    primary_action: 'Open the counted list (INBOX / ACTIVITY blockers)',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'Counts read 00 — never a placeholder number.',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-hub-progress',
    workspace_domain: 'HUB',
    surface: 'ProjectHubBody',
    node_scope: 'top-level nodes (families / entries / worlds)',
    query_source: "getWorkspacePanelData('top-level') + stageBreakdown",
    data_dependencies: ['nodes.current_stage', 'nodes.status'],
    display_purpose: 'Production progress on canonical node stages (PLANNED … LIVE) with real stage counts.',
    source_of_truth: 'Project graph',
    primary_action: 'Open a node (ACTIVITY node detail)',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NO PRODUCTION NODE RECORDED FOR <PROJECT>',
    artifact_dependencies: ['node preview artifact'],
  }),
  graphPanel({
    panel_id: 'project-hub-domains',
    workspace_domain: 'HUB',
    surface: 'ProjectHubBody',
    node_scope: 'project × work domain',
    query_source: 'graph.domains (deriveDomainState)',
    data_dependencies: ['domain node counts', 'PROJECT_DOMAIN_CAPABILITY_MAP'],
    display_purpose: 'Which work domains are ESTABLISHED for this project (GLOBAL_TAB_AVAILABLE ≠ PROJECT_DOMAIN_ESTABLISHED).',
    source_of_truth: 'Project graph + capability map',
    primary_action: 'Open the domain tab (its own graph or NOT_ESTABLISHED state)',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'Each domain row says NOT ESTABLISHED with the reason.',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-hub-needs-you',
    workspace_domain: 'HUB',
    surface: 'ProjectHubBody',
    node_scope: 'decision items NEEDS_YOU',
    query_source: "getWorkspacePanelData('needs-you')",
    data_dependencies: ['decisions'],
    display_purpose: 'The founder decisions blocking the project, highest priority first.',
    source_of_truth: 'Project graph decisions (+ workspace ledger)',
    primary_action: 'Open the item in INBOX',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NOTHING NEEDS YOU',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-hub-blockers',
    workspace_domain: 'HUB',
    surface: 'ProjectHubBody',
    node_scope: 'blocked nodes',
    query_source: "getWorkspacePanelData('blockers')",
    data_dependencies: ['nodes.blockers'],
    display_purpose: 'Each blocker: node, reason, upstream, severity, owner, required action, downstream effect.',
    source_of_truth: 'Project graph',
    primary_action: 'Open ACTIVITY → BLOCKERS',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NOTHING IS BLOCKED',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-hub-events',
    workspace_domain: 'HUB',
    surface: 'ProjectHubBody',
    node_scope: 'project events',
    query_source: "getWorkspacePanelData('events')",
    data_dependencies: ['events'],
    display_purpose: 'The latest dated production events of this project.',
    source_of_truth: 'Dated source records, requests, workspace ledger',
    primary_action: 'Open ACTIVITY',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NO EVENTS RECORDED FOR <PROJECT> YET',
    artifact_dependencies: [],
  }),
  /* ── INBOX ── */
  graphPanel({
    panel_id: 'project-inbox-lenses',
    workspace_domain: 'INBOX',
    surface: 'ProjectInboxBody',
    node_scope: 'decision items by state',
    query_source: "decisionsIn(graph, 'NEEDS_YOU' | 'WATCHING' | 'RESOLVED' | 'ALL')",
    data_dependencies: ['decisions'],
    display_purpose: 'NEEDS YOU / WATCHING / RESOLVED / ALL — the counts are the lists.',
    source_of_truth: 'Project graph decisions (+ ledger)',
    primary_action: 'Switch lens (?view=, kept across a project switch)',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'Lens with 0 renders NOTHING <STATE>',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-inbox-list',
    workspace_domain: 'INBOX',
    surface: 'ProjectInboxBody',
    node_scope: 'decision items (each resolves to one node)',
    query_source: "getWorkspacePanelData('needs-you' | 'watching' | 'resolved')",
    data_dependencies: ['decisions', 'nodes'],
    display_purpose: 'Real human decisions only — authority verdicts, implementation acceptance, page-tree confirmation, expression gates.',
    source_of_truth: 'Project graph decisions',
    primary_action: DECIDE,
    secondary_actions: ['Open item detail (?item=)', 'Open the node in its work domain'],
    state_transition: DECIDE_TRANSITION,
    downstream_effects: ALL_TABS,
    empty_state: 'NOTHING NEEDS YOU · No open founder decision for <PROJECT>.',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-inbox-item',
    workspace_domain: 'INBOX',
    surface: 'ProjectInboxBody',
    node_scope: 'one decision item + its node',
    query_source: '?item= → graph.decisions',
    data_dependencies: ['decision', 'node', 'node.blockers', 'node artifacts'],
    display_purpose: 'The decision with its node, blockers and the materials under decision.',
    source_of_truth: 'Project graph',
    primary_action: DECIDE,
    secondary_actions: ['OPEN IN <DOMAIN>', 'Open material in LIBRARY'],
    state_transition: DECIDE_TRANSITION,
    downstream_effects: ALL_TABS,
    empty_state: 'ITEM NOT FOUND · No decision with this id exists in <PROJECT> (a stale id from another project never resolves).',
    artifact_dependencies: ['node artifacts'],
  }),
  /* ── LIBRARY ── */
  graphPanel({
    panel_id: 'project-library-artifacts',
    workspace_domain: 'LIBRARY',
    surface: 'ProjectLibraryBody',
    node_scope: 'project artifacts by status',
    query_source: "artifactsIn(graph, status) / getWorkspacePanelData('artifacts')",
    data_dependencies: ['artifacts'],
    display_purpose: 'Canonical archive generated from artifact records: CANONICAL / IN REVIEW / REVISE / SUPERSEDED / REFERENCE / MISSING / ARCHIVE.',
    source_of_truth: 'Artifact records of the project graph (authority files, asset contracts, receipts)',
    primary_action: 'Open artifact lineage (?artifact=)',
    secondary_actions: ['Status lens (?status=)'],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NO ARTIFACTS RECORDED FOR <PROJECT>',
    artifact_dependencies: ['artifact.url (public/ files)'],
  }),
  graphPanel({
    panel_id: 'project-library-artifact',
    workspace_domain: 'LIBRARY',
    surface: 'ProjectLibraryBody',
    node_scope: 'one artifact',
    query_source: '?artifact= → graph.artifacts',
    data_dependencies: ['artifact', 'source node', 'source truth'],
    display_purpose: 'Lineage: project, source node, type, status, authority, created by, derived from, supersedes, superseded by, used by, viewport, actor mode, file, source of truth.',
    source_of_truth: 'Artifact record',
    primary_action: 'Open the source node (ACTIVITY)',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'ARTIFACT NOT FOUND',
    artifact_dependencies: ['artifact.url'],
  }),
  /* ── ACTIVITY ── */
  graphPanel({
    panel_id: 'project-activity-feed',
    workspace_domain: 'ACTIVITY',
    surface: 'ProjectActivityBody',
    node_scope: 'project events',
    query_source: "getWorkspacePanelData('events') filtered by lens",
    data_dependencies: ['events'],
    display_purpose: 'Event ledger: ALL / APPROVALS / UPDATES / DECISIONS (event type, actor, time, origin, node).',
    source_of_truth: 'Dated source records (SOURCE_TRUTH), requests (REQUEST), workspace actions (WORKSPACE)',
    primary_action: 'Lens (?view=)',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NO EVENTS RECORDED FOR <PROJECT> YET',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-activity-blockers',
    workspace_domain: 'ACTIVITY',
    surface: 'ProjectActivityBody',
    node_scope: 'blocked nodes',
    query_source: "getWorkspacePanelData('blockers')",
    data_dependencies: ['nodes.blockers'],
    display_purpose: 'Every real blocker with reason, upstream, severity, owner, required action, downstream effect.',
    source_of_truth: 'Project graph',
    primary_action: null,
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NOTHING IS BLOCKED',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-activity-node',
    workspace_domain: 'ACTIVITY',
    surface: 'ProjectActivityBody',
    node_scope: 'one node (?node=)',
    query_source: "getWorkspacePanelData('node' | 'events' | 'artifacts', nodeId)",
    data_dependencies: ['node', 'events', 'decisions', 'blockers', 'children', 'artifacts'],
    display_purpose: 'Node history: state fields, events, decisions, blockers, connected nodes, artifacts.',
    source_of_truth: 'Project graph',
    primary_action: 'OPEN IN <DOMAIN>',
    secondary_actions: ['Open decision in INBOX', 'Open artifact in LIBRARY'],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NODE NOT FOUND',
    artifact_dependencies: ['node artifacts'],
  }),
  /* ── DESIGN ── */
  graphPanel({
    panel_id: 'project-design-method',
    workspace_domain: 'DESIGN',
    surface: 'ProjectDesignSurface',
    node_scope: 'DESIGN top-level nodes',
    query_source: 'designMethodOf(node) over topLevelNodes(graph, DESIGN)',
    data_dependencies: ['nodes.pipeline_step', 'nodes.authority_status'],
    display_purpose: 'Method 01 LOAD BRAND DNA … 08 IMPLEMENT with the real number of families at each step (03 is a rule, not a stage).',
    source_of_truth: 'Family production contracts / visual-authority packages',
    primary_action: 'Filter families by step (?method=)',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'Project without DESIGN nodes → domain-empty-design',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'project-design-families',
    workspace_domain: 'DESIGN',
    surface: 'ProjectDesignSurface',
    node_scope: 'page families',
    query_source: "getWorkspacePanelData('domain-nodes', DESIGN) top-level",
    data_dependencies: ['nodes', 'preview artifacts'],
    display_purpose: 'Each page family with stage, status, next action and its own authority preview.',
    source_of_truth: 'Family production contracts / visual-authority packages',
    primary_action: 'Open family (?family=)',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NO FAMILY AT THIS STEP',
    artifact_dependencies: ['VISUAL_AUTHORITY artifacts'],
  }),
  graphPanel({
    panel_id: 'project-design-family',
    workspace_domain: 'DESIGN',
    surface: 'ProjectDesignSurface',
    node_scope: 'one page family + its children',
    query_source: '?family= → node + childrenOf + decisions + artifacts',
    data_dependencies: ['node', 'children', 'decisions', 'blockers', 'artifacts'],
    display_purpose: 'Family state, decisions (actionable), blockers, child nodes (actor modes / page tree), authorities and assets.',
    source_of_truth: 'Family production contract / visual-authority package',
    primary_action: DECIDE,
    secondary_actions: ['OPEN DESIGN CHAMBER (projects with a chamber)', 'OPEN IN VIEWPORT (implemented families of runtime projects)', 'NODE HISTORY'],
    state_transition: DECIDE_TRANSITION,
    downstream_effects: ALL_TABS,
    empty_state: 'PAGE FAMILY NOT FOUND',
    artifact_dependencies: ['VISUAL_AUTHORITY', 'UI_ASSET', 'REFERENCE_AUTHORITY'],
  }),
  graphPanel({
    panel_id: 'project-design-authorities',
    workspace_domain: 'DESIGN',
    surface: 'ProjectDesignSurface',
    node_scope: 'DESIGN authority artifacts',
    query_source: 'graph.artifacts (VISUAL_AUTHORITY | REFERENCE_AUTHORITY)',
    data_dependencies: ['artifacts'],
    display_purpose: "The project's own visual authorities — contained previews, never another project's art.",
    source_of_truth: 'Authority files',
    primary_action: 'Open lineage in LIBRARY',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'NO VISUAL AUTHORITY RECORDED YET',
    artifact_dependencies: ['artifact.url'],
  }),
  /* ── EXPERIENCE ── */
  graphPanel({
    panel_id: 'project-experience-nodes',
    workspace_domain: 'EXPERIENCE',
    surface: 'ProjectExperienceSurface',
    node_scope: 'world → scenes → spatial objects / interactions',
    query_source: "getWorkspacePanelData('domain-nodes', EXPERIENCE) + experienceKinds",
    data_dependencies: ['nodes (WORLD, SCENE, ZONE, PORTAL, INTERACTION, INHABITANT …)'],
    display_purpose: 'The world graph — scenes and spatial nodes by kind, with real counts.',
    source_of_truth: 'World scene contracts, object / hotspot registries, reference manifest',
    primary_action: 'Open scene (?scene=)',
    secondary_actions: ['Kind lens (?kind=)'],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'Project without EXPERIENCE nodes → domain-empty-experience',
    artifact_dependencies: ['SCENE / SPATIAL authority references'],
  }),
  graphPanel({
    panel_id: 'project-experience-scene',
    workspace_domain: 'EXPERIENCE',
    surface: 'ProjectExperienceSurface',
    node_scope: 'one world / scene + objects and interactions',
    query_source: '?scene= → node + childrenOf + artifacts',
    data_dependencies: ['node', 'children', 'artifacts'],
    display_purpose: 'Scene state, its objects / interactions and its authority references; OPEN LIVE SCENE when mounted.',
    source_of_truth: 'Scene contract + immersive route',
    primary_action: 'OPEN LIVE SCENE',
    secondary_actions: ['NODE HISTORY'],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'SPATIAL NODE NOT FOUND',
    artifact_dependencies: ['reference manifest publicPath'],
  }),
  /* ── states ── */
  graphPanel({
    panel_id: 'domain-empty',
    workspace_domain: 'DESIGN',
    surface: 'DomainEmptyState (DESIGN · EXPERIENCE · EXPRESSION)',
    node_scope: 'project × work domain',
    query_source: 'graph.domains[domain]',
    data_dependencies: ['domain node count', 'capability map'],
    display_purpose: 'NO <DOMAIN> WORKSPACE HAS BEEN ESTABLISHED FOR <PROJECT> — project, domain, why, what would establish it.',
    source_of_truth: 'Project graph + capability map',
    primary_action: '<PROJECT> HUB',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: 'This panel IS the empty state.',
    artifact_dependencies: [],
  }),
  graphPanel({
    panel_id: 'production-project-select',
    workspace_domain: 'HUB',
    surface: 'ProjectSelectState',
    node_scope: 'none (no active project)',
    query_source: 'listHostProductionProjects()',
    data_dependencies: ['managed project registry'],
    display_purpose: 'No project chosen yet → choose one; the workspace never defaults to a project.',
    source_of_truth: 'Managed project registry',
    primary_action: 'Open the project on the current tab',
    secondary_actions: [],
    state_transition: 'ACTIVE_PROJECT := chosen project (persisted)',
    downstream_effects: ALL_TABS,
    empty_state: 'n/a',
    artifact_dependencies: [],
    visibility_rule: 'Rendered only when neither the URL nor the stored choice names a project.',
  }),
  graphPanel({
    panel_id: 'production-attention-count',
    workspace_domain: 'HUB',
    surface: 'ProductionWorkspaceHeader (host chrome)',
    node_scope: 'decision items NEEDS_YOU',
    query_source: "decisionsIn(graph, 'NEEDS_YOU').length",
    data_dependencies: ['decisions'],
    display_purpose: 'ITEMS NEED YOU in the host header — the INBOX NEEDS YOU list length of the active project.',
    source_of_truth: 'Project graph decisions',
    primary_action: 'Open INBOX of the active project',
    secondary_actions: [],
    state_transition: null,
    downstream_effects: [],
    empty_state: '00',
    artifact_dependencies: [],
  }),
];

/** [panel_id, surface, classifications, disposition, replacement / note] */
type Audited = readonly [string, string, readonly PanelClassification[], PanelDisposition, string];

export const AUDITED_PANELS: readonly Audited[] = [
  /* HUB (HubBody — NDXBOOK Entry 002 only; graph HUB for every other project) */
  ['authority-hero', 'HubBody', ['DECORATIVE', 'PROJECT_LEAK'], 'GATED_TO_OWN_PROJECT', 'NDXBOOK only; other projects → project-hub-head'],
  ['hub-live-updated', 'HubBody', ['REAL_BUT_POORLY_SCOPED'], 'REWRITTEN', 'activity now project-filtered (activityProjectOf)'],
  ['hub-items-need-you', 'HubBody', ['PROJECT_LEAK'], 'REWRITTEN', 'attention excludes other projects’ requests; others → project-hub-counts'],
  ['hub-active-entry', 'HubBody', ['PROJECT_LEAK'], 'GATED_TO_OWN_PROJECT', 'Entry 002 shown only under NDXBOOK'],
  ['hub-current-phase', 'HubBody', ['REAL_BUT_POORLY_LABELLED'], 'GATED_TO_OWN_PROJECT', 'others → project-hub-head phase'],
  ['hub-blockers', 'HubBody', ['REAL_BUT_POORLY_LABELLED'], 'REWRITTEN', 'links to ACTIVITY → BLOCKERS, the list it counts'],
  ['hub-overview', 'HubBody', ['REAL_CANONICAL'], 'GATED_TO_OWN_PROJECT', 'others → project-hub-progress'],
  ['hub-components', 'HubBody', ['REAL_BUT_POORLY_SCOPED'], 'GATED_TO_OWN_PROJECT', '8 storyboard frames = 8 mounted receipts (real files)'],
  ['hub-entries', 'HubBody', ['LEGACY', 'MOCK'], 'GATED_TO_OWN_PROJECT', 'NEW ENTRY tile has no create path (REMAINING)'],
  ['hub-operations', 'HubBody', ['REAL_BUT_POORLY_SCOPED'], 'GATED_TO_OWN_PROJECT', 'others → project-hub-needs-you'],
  ['hub-activity', 'HubBody', ['PROJECT_LEAK', 'REAL_BUT_POORLY_LABELLED'], 'REWRITTEN', '7 undated synthetic NOW rows removed; dated recorded events only'],
  ['hub-open-machine', 'HubBody', ['LEGACY'], 'GATED_TO_OWN_PROJECT', 'machine view only for NDXBOOK'],
  ['production-chrome-project', 'chrome', ['PROJECT_LEAK'], 'REWRITTEN', 'shows the active project; switch keeps the tab'],
  ['production-attention-count', 'chrome', ['PROJECT_LEAK'], 'REWRITTEN', 'graph NEEDS_YOU count of the active project'],
  ['nav-activity-dot', 'nav', ['DECORATIVE'], 'REWRITTEN', 'dot only when the project has a non-source event in the last 24 h'],
  ['nav-hrefs', 'nav', ['PROJECT_LEAK'], 'REWRITTEN', 'every tab href carries the active project'],
  /* HUB machine (ProductionHub — NDXBOOK only) */
  ['hub-machine', 'ProductionHub', ['LEGACY', 'PROJECT_LEAK'], 'GATED_TO_OWN_PROJECT', '/production?project=ndxbook&view=machine only'],
  ['hub-modes', 'ProductionHub', ['DECORATIVE'], 'GATED_TO_OWN_PROJECT', ''],
  ['hub-filmstrip', 'ProductionHub', ['REAL_BUT_POORLY_SCOPED'], 'GATED_TO_OWN_PROJECT', '8 placeholder cells until the pipeline reports panels'],
  ['hub-compare', 'ProductionHub', ['MOCK'], 'GATED_TO_OWN_PROJECT', 'KEY FINDINGS / CONTINUITY hard UNAVAILABLE (REMAINING)'],
  ['hub-table', 'ProductionHub', ['DUPLICATE'], 'GATED_TO_OWN_PROJECT', ''],
  /* INBOX (InboxBody — NDXBOOK only; graph INBOX for every other project) */
  ['inbox-tabs', 'InboxBody', ['REAL_CANONICAL'], 'GATED_TO_OWN_PROJECT', 'others → project-inbox-lenses'],
  ['inbox-focus', 'InboxBody', ['REAL_BUT_POORLY_SCOPED'], 'GATED_TO_OWN_PROJECT', 'others → project-inbox-needs-you'],
  ['inbox-incoming', 'InboxBody', ['PROJECT_LEAK', 'DUPLICATE'], 'REWRITTEN', 'requests filtered to the project'],
  ['inbox-attention', 'InboxBody', ['REAL_BUT_POORLY_LABELLED'], 'GATED_TO_OWN_PROJECT', ''],
  ['inbox-resolved-rail', 'InboxBody', ['REAL_BUT_POORLY_SCOPED'], 'GATED_TO_OWN_PROJECT', 'activity now project-filtered'],
  ['inbox-watching', 'InboxBody', ['REAL_CANONICAL'], 'GATED_TO_OWN_PROJECT', ''],
  ['inbox-resolved', 'InboxBody', ['REAL_BUT_POORLY_SCOPED'], 'GATED_TO_OWN_PROJECT', 'ARCHIVED hard 0 (REMAINING)'],
  ['inbox-messages', 'InboxBody', ['MOCK'], 'GATED_TO_OWN_PROJECT', 'messages not connected — shown as unmounted'],
  ['inbox-system', 'InboxBody', ['REAL_BUT_POORLY_SCOPED'], 'GATED_TO_OWN_PROJECT', ''],
  ['inbox-item-detail', 'InboxBody', ['REAL_BUT_POORLY_SCOPED'], 'GATED_TO_OWN_PROJECT', 'others → project-inbox-item'],
  ['inbox-thread', 'InboxBody', ['MOCK'], 'GATED_TO_OWN_PROJECT', ''],
  ['inbox-general-request-href', 'InboxBody', ['UNRESOLVED'], 'REWRITTEN', '/production/<p> now resolves to the project HUB'],
  /* DESIGN */
  ['design-chamber (non-ingested)', 'DesignChamber', ['MOCK', 'DECORATIVE', 'PROJECT_LEAK'], 'REPLACED', 'project-design-* overview; chamber modes only where the project has them'],
  ['design-pipeline', 'DesignChamber', ['MOCK'], 'GATED_TO_OWN_PROJECT', 'NDXBOOK legacy chamber; hidden under a runtime project viewport'],
  ['design-table', 'DesignChamber', ['MOCK', 'PROJECT_LEAK'], 'GATED_TO_OWN_PROJECT', 'cards opened NDXBOOK reconstruction workspace from JURNL viewport — hidden there'],
  ['design-workspace (/design/<sub>)', 'TwinOpusDirectScreen', ['LEGACY', 'OBSOLETE_PIPELINE', 'PROJECT_LEAK'], 'GATED_TO_OWN_PROJECT', 'NDXBOOK only; other projects resolve to their DESIGN overview'],
  ['design-viewport (non-runtime)', 'ViewportChamber', ['PROJECT_LEAK'], 'GATED_TO_OWN_PROJECT', 'dev fixture was NDXBOOK; VIEWPORT offered to NDXBOOK + runtime projects only'],
  ['project-family-chamber', 'ProjectFamilyChamber', ['REAL_BUT_POORLY_SCOPED'], 'OPEN', 'uses F01 only + literal denominators (REMAINING); DESIGN overview now covers F01–F16'],
  ['design-viewport (runtime)', 'ViewportChamber', ['REAL_CANONICAL'], 'KEPT', ''],
  /* EXPERIENCE */
  ['experience-root', 'ExperienceBody', ['DECORATIVE', 'PROJECT_LEAK'], 'REPLACED', 'project-experience-* (world graph) / domain-empty-experience'],
  ['experience-capsules', 'ExperienceBody', ['REAL_BUT_POORLY_LABELLED'], 'REPLACED', 'kinds lens with real counts'],
  ['experience-unresolved-spatial-issues', 'ExperienceBody', ['PROJECT_LEAK'], 'REMOVED', 'showed Expression blockers as spatial issues'],
  ['experience-children', 'ExperienceProductionShellPage', ['DECORATIVE'], 'UNMOUNTED', 'every /experience/<sub> renders the project world graph'],
  /* EXPRESSION */
  ['expression (non-established project)', 'ExpressionBody + families', ['PROJECT_LEAK'], 'REPLACED', 'domain-empty-expression'],
  ['expression-hero', 'ExpressionBody', ['DECORATIVE'], 'GATED_TO_OWN_PROJECT', ''],
  ['expression-travel formats', 'ExpressionBody', ['MOCK'], 'REWRITTEN', 'formats = entry plan format adaptations'],
  ['expression-active NEW ENTRY', 'ExpressionBody', ['MOCK'], 'OPEN', 'no create path (REMAINING)'],
  ['casting-root-overview', 'CastingFamily', ['UNRESOLVED'], 'REWRITTEN', 'ROLES CAST / CAST ASSIGNED count catalogued actors only'],
  ['casting-available-talent', 'CastingFamily', ['REAL_BUT_POORLY_SCOPED'], 'KEPT', 'catalogue is global by design (studio talent); media fixed in #1400'],
  ['casting-lead-authority', 'CastingFamily', ['REAL_CANONICAL'], 'KEPT', 'media fixed in #1400'],
  ['expression-breadcrumb detail', 'ExpressionProductionShellPage', ['PROJECT_LEAK'], 'REWRITTEN', 'family routes render only for an established EXPRESSION project'],
  ['expression family state', 'ExpressionFamilyScreen', ['PROJECT_LEAK'], 'REWRITTEN', 'keyed by project — child state never survives a switch'],
  ['sets hierarchy', 'SetsFamily', ['MOCK'], 'OPEN', 'hard-coded literals (REMAINING)'],
  ['storyboard sequence frames', 'StoryboardFamily', ['REAL_BUT_POORLY_SCOPED'], 'OPEN', 'same 8 frames for every sequence (REMAINING)'],
  ['downstream deliverables', 'DeliverablesFamily', ['OBSOLETE_PIPELINE', 'MOCK'], 'OPEN', 'state hard PLANNED (REMAINING)'],
  /* LIBRARY (LibraryBody unmounted; graph LIBRARY for every project) */
  ['library-tabs', 'LibraryBody', ['MOCK'], 'REPLACED', 'project-library-artifacts status lenses'],
  ['library-categories', 'LibraryBody', ['MOCK'], 'REMOVED', 'arbitrary category mapping'],
  ['library-vault', 'LibraryBody', ['DECORATIVE', 'PROJECT_LEAK'], 'REMOVED', ''],
  ['library-facts', 'LibraryBody', ['MOCK', 'REAL_BUT_POORLY_LABELLED'], 'REPLACED', 'project-library-artifact lineage'],
  ['library-open-authority', 'LibraryBody', ['PROJECT_LEAK'], 'REMOVED', 'hard /production/ndxbook/design'],
  ['library-recent', 'LibraryBody', ['REAL_BUT_POORLY_LABELLED', 'PROJECT_LEAK'], 'REPLACED', 'project-library-artifacts'],
  ['library-most-used', 'LibraryBody', ['MOCK'], 'REMOVED', ''],
  ['library-lineage-flow', 'LibraryBody', ['MOCK'], 'REPLACED', 'project-library-artifact lineage'],
  ['library-collections', 'LibraryBody', ['DECORATIVE'], 'REMOVED', ''],
  ['library-actors', 'LibraryBody', ['REAL_BUT_POORLY_SCOPED', 'PROJECT_LEAK'], 'REMOVED', 'catalogue lives in EXPRESSION → CASTING'],
  ['library-empty-categories', 'LibraryBody', ['DECORATIVE'], 'REMOVED', ''],
  /* ACTIVITY (ActivityBody — NDXBOOK only; graph ACTIVITY for every other project) */
  ['activity-feed', 'ActivityBody', ['PROJECT_LEAK', 'REAL_BUT_POORLY_LABELLED'], 'REWRITTEN', 'no synthetic state rows; activity project-filtered'],
  ['activity-today', 'ActivityBody', ['REAL_BUT_POORLY_LABELLED'], 'REWRITTEN', 'TODAY counts dated events only'],
  ['activity-blockers', 'ActivityBody', ['REAL_BUT_POORLY_LABELLED'], 'GATED_TO_OWN_PROJECT', 'others → project-activity-blockers'],
  ['activity-milestones', 'ActivityBody', ['DUPLICATE'], 'GATED_TO_OWN_PROJECT', ''],
  ['activity-pending-review', 'ActivityBody', ['DUPLICATE'], 'GATED_TO_OWN_PROJECT', 'INBOX is where decisions are acted on'],
  ['activity-comment-filters', 'ActivityBody', ['DECORATIVE'], 'GATED_TO_OWN_PROJECT', 'comments unmounted, shown as such'],
  ['activity-related', 'ActivityBody', ['DUPLICATE'], 'GATED_TO_OWN_PROJECT', ''],
];

export const PANEL_CLASSIFICATIONS: readonly PanelClassification[] = [
  'REAL_CANONICAL',
  'REAL_BUT_POORLY_SCOPED',
  'REAL_BUT_POORLY_LABELLED',
  'LEGACY',
  'MOCK',
  'DECORATIVE',
  'DUPLICATE',
  'PROJECT_LEAK',
  'OBSOLETE_PIPELINE',
  'UNRESOLVED',
];
