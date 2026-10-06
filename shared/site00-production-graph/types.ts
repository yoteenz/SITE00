/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-ISOLATION-LOGIC-RECONCILIATION-PANEL-INTELLIGENCE1
 *
 * CANONICAL PROJECT PRODUCTION GRAPH. The Production Workspace is not the source of truth — it is an operational
 * projection of it. Every root tab (HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY) reads ONE
 * project's graph:
 *
 *   ACTIVE_PROJECT → PROJECT_GRAPH → WORKSPACE_DOMAIN → NODE / STATE / QUERY → PANEL DATA
 *
 * Never WORKSPACE_DOMAIN → DEFAULT DATA → NDXBOOK. A project renders only its own truth; missing truth is a
 * project-scoped NOT_ESTABLISHED state, never another project's data.
 *
 * Pure types — no React, no IO. Adapters (./adapters/*) map existing canonical sources into this shape; nothing is
 * authored here.
 */

/** The seven root surfaces of the workspace shell (global). */
export type WorkspaceDomain = 'HUB' | 'INBOX' | 'DESIGN' | 'EXPERIENCE' | 'EXPRESSION' | 'LIBRARY' | 'ACTIVITY';

export const WORKSPACE_DOMAINS: readonly WorkspaceDomain[] = ['HUB', 'INBOX', 'EXPERIENCE', 'DESIGN', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'];

/**
 * The three WORK domains that own production nodes. HUB / INBOX / LIBRARY / ACTIVITY are projections over every
 * work domain (control plane · decision queue · artifact archive · event ledger).
 *
 * DESIGN     site / digital-location design authority (pages, page families, territories, responsive authorities)
 * EXPERIENCE world-building / spatial experience / environment / interaction systems
 * EXPRESSION expressive / narrative / editorial / cast / campaign production
 */
export type WorkDomain = 'DESIGN' | 'EXPERIENCE' | 'EXPRESSION';

export const WORK_DOMAINS: readonly WorkDomain[] = ['DESIGN', 'EXPERIENCE', 'EXPRESSION'];

/** Canonical node states (methodology). Granular source states map onto these — they are never deleted. */
export type NodeStage =
  | 'PLANNED'
  | 'STRUCTURED'
  | 'FUNCTIONAL'
  | 'EXPRESSION_READY'
  | 'AUTHORITY_READY'
  | 'VISUALLY_IMPLEMENTED'
  | 'QA_READY'
  | 'APPROVED'
  | 'LIVE';

export const NODE_STAGES: readonly NodeStage[] = [
  'PLANNED',
  'STRUCTURED',
  'FUNCTIONAL',
  'EXPRESSION_READY',
  'AUTHORITY_READY',
  'VISUALLY_IMPLEMENTED',
  'QA_READY',
  'APPROVED',
  'LIVE',
];

/**
 * Canonical production progression. A graph, not a rigid line: a node only passes the steps its type needs
 * (a backend node has no visual authority; a world environment has spatial authority, not page territories).
 */
export type PipelineStep =
  | 'INTAKE'
  | 'STRUCTURE'
  | 'TREE'
  | 'EXPERIENCE_CONTRACT'
  | 'FAMILY_LOCK'
  | 'VISUAL_AUTHORITY_DEVELOPMENT'
  | 'FOUNDER_VERDICT'
  | 'AUTHORITY_PACKAGE'
  | 'ACTOR_MODE_DERIVATION'
  | 'RESPONSIVE_DERIVATION'
  | 'PAGE_CONTRACT'
  | 'WORLD_CONTRACT'
  | 'ASSET_SHEET'
  | 'IMPLEMENTATION'
  | 'QA'
  | 'REFINEMENT'
  | 'FOUNDER_APPROVAL'
  | 'LIVE'
  | 'LIVE_AUTHORITY_PROMOTION'
  /* expression branch (campaign / entry production) */
  | 'NARRATIVE'
  | 'CASTING'
  | 'LOOK'
  | 'PERFORMANCE'
  | 'SET'
  | 'STORYBOARD'
  | 'KEYFRAMES';

/** Operational status (what the founder sees as health). */
export type NodeStatus = 'NOT_STARTED' | 'LOCKED' | 'ACTIVE' | 'REVIEW_REQUIRED' | 'BLOCKED' | 'COMPLETE';

export type DesignNodeType =
  | 'SITE'
  | 'PAGE_FAMILY'
  | 'PAGE'
  | 'STATE'
  | 'TAB'
  | 'COMPONENT'
  | 'VISUAL_TERRITORY'
  | 'REFERENCE_AUTHORITY'
  | 'PAGE_FAMILY_AUTHORITY'
  | 'RESPONSIVE_AUTHORITY'
  | 'ACTOR_MODE'
  | 'COMPONENT_AUTHORITY'
  | 'ICON_ASSET_SHEET'
  | 'SITE_NAVIGATION'
  | 'VISUAL_HIERARCHY'
  | 'IMPLEMENTATION_REFERENCE'
  /** The page / tab / state tree an authority package produces (8th durable condition: PAGE_TREE_CONFIRMED). */
  | 'PAGE_TREE';

export type ExperienceNodeType =
  | 'WORLD'
  | 'ZONE'
  | 'ENVIRONMENT'
  | 'ROOM'
  | 'SCENE'
  | 'PATH'
  | 'PORTAL'
  | 'INTERACTION'
  | 'INHABITANT'
  | 'WORLD_STATE'
  | 'ACCESS_STATE'
  | 'ENVIRONMENT_ASSET'
  | 'SPATIAL_AUTHORITY'
  | 'SCENE_AUTHORITY'
  | 'NAVIGATION_MODEL'
  | 'PRESENCE_MODEL'
  | 'INTERACTION_CONTRACT';

export type ExpressionNodeType =
  | 'CAMPAIGN'
  | 'ENTRY'
  | 'NARRATIVE'
  | 'ROLE'
  | 'ACTOR'
  | 'CHARACTER'
  | 'CONTINUITY'
  | 'CASTING_DECISION'
  | 'LOOK'
  | 'PERFORMANCE'
  | 'SET'
  | 'EDITORIAL_CONCEPT'
  | 'STORYBOARD'
  | 'KEYFRAME'
  | 'REEL'
  | 'CAROUSEL'
  | 'STORY'
  | 'SOCIAL_OUTPUT'
  | 'CHARACTER_AUTHORITY'
  | 'MEDIA_AUTHORITY'
  | 'CAMPAIGN_AUTHORITY';

export type ProductionNodeType = DesignNodeType | ExperienceNodeType | ExpressionNodeType;

export type AuthorityStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'IN_DEVELOPMENT' | 'IN_REVIEW' | 'APPROVED' | 'LOCKED' | 'SUPERSEDED';
export type ApprovalStatus = 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';
export type ImplementationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'NOT_APPLICABLE';
export type QaStatus = 'NOT_RUN' | 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
export type LiveStatus = 'NOT_LIVE' | 'LIVE' | 'LIVE_AUTHORITY';

export type BlockerSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionOwner = 'FOUNDER' | 'STUDIO' | 'SYSTEM';

/** A real blocker: which node, why, what is upstream, who acts, what it unblocks. */
export type ProductionBlocker = {
  blocker_id: string;
  node_id: string;
  reason: string;
  /** The upstream node / gate that holds it (null when the gate is the node's own missing truth). */
  upstream: string | null;
  severity: BlockerSeverity;
  owner: ActionOwner;
  required_action: string;
  downstream_effect: string;
};

/** Where a fact came from — every node, artifact, decision and event cites its source of truth. */
export type SourceTruthRef = {
  source_id: string;
  kind:
    | 'FAMILY_CONTRACT'
    | 'VISUAL_AUTHORITY_GATE'
    | 'EXPERIENCE_CONTRACT'
    | 'EXPRESSION_ENGINE'
    | 'ACTING_CATALOGUE'
    | 'HUB_ASSET_REGISTRY'
    | 'PRODUCTION_REQUEST'
    | 'WORKSPACE_LEDGER'
    | 'MANAGED_PROJECT_REGISTRY'
    | 'DESIGN_CHAMBER';
  path: string;
  label: string;
};

export type ProductionNode = {
  project_id: string;
  node_id: string;
  node_type: ProductionNodeType;
  label: string;
  parent_id: string | null;
  family_id: string | null;
  /** Primary work domain + every projection that shows the node. */
  domain: WorkDomain;
  workspace_domains: readonly WorkspaceDomain[];
  current_stage: NodeStage;
  pipeline_step: PipelineStep;
  status: NodeStatus;
  status_detail: string;
  authority_status: AuthorityStatus;
  approval_status: ApprovalStatus;
  implementation_status: ImplementationStatus;
  qa_status: QaStatus;
  live_status: LiveStatus;
  dependencies: readonly string[];
  blockers: readonly ProductionBlocker[];
  upstream_nodes: readonly string[];
  downstream_nodes: readonly string[];
  actor_scope: readonly string[];
  viewport_scope: readonly string[];
  artifact_ids: readonly string[];
  source_truth_ids: readonly string[];
  last_event: string | null;
  next_required_action: string | null;
  /** Deep link into the work domain that owns the node (always the node's own project). */
  route: string | null;
  /** Primary artifact used as the node's preview (null = no preview; never another project's art). */
  preview_artifact_id: string | null;
};

export type ArtifactStatus = 'CANONICAL' | 'IN_REVIEW' | 'REVISE' | 'SUPERSEDED' | 'ARCHIVE' | 'REFERENCE' | 'MISSING';

export type ArtifactType =
  | 'VISUAL_AUTHORITY'
  | 'REFERENCE_AUTHORITY'
  | 'PAGE_FAMILY_AUTHORITY'
  | 'RESPONSIVE_AUTHORITY'
  | 'UI_ASSET'
  | 'ICON'
  | 'BRAND_MARK'
  | 'PHOTOGRAPHY'
  | 'ILLUSTRATION'
  | 'NODE_ART'
  | 'STORYBOARD_FRAME'
  | 'CHARACTER_AUTHORITY'
  | 'WORLD_ASSET'
  | 'CONTRACT'
  | 'IMPLEMENTATION_CAPTURE'
  | 'OTHER';

/** LIBRARY is generated from these — never a curated gallery. */
export type ArtifactRecord = {
  artifact_id: string;
  project_id: string;
  source_node_id: string | null;
  artifact_type: ArtifactType;
  label: string;
  status: ArtifactStatus;
  authority_status: AuthorityStatus;
  created_by: string;
  derived_from: readonly string[];
  supersedes: readonly string[];
  superseded_by: string | null;
  used_by: readonly string[];
  viewport: string | null;
  actor_mode: string | null;
  /** Repo path / public URL of the file (null = recorded but not mounted). */
  url: string | null;
  source_truth_id: string;
};

export type DecisionKind =
  | 'FOUNDER_APPROVAL'
  | 'REVIEW_REQUEST'
  | 'DECISION'
  | 'BLOCKER_ACTION'
  | 'AMBIGUITY'
  | 'ASSET_APPROVAL'
  | 'AUTHORITY_VERDICT'
  | 'QA_REVIEW'
  | 'IMPLEMENTATION_ACCEPTANCE'
  | 'CONFLICT_RESOLUTION';

export type DecisionState = 'NEEDS_YOU' | 'WATCHING' | 'RESOLVED';

/** Actions an INBOX item offers (OPEN = navigate to the node's domain). */
export type DecisionAction = 'APPROVE' | 'REQUEST_REVISION' | 'REJECT' | 'RESOLVE' | 'OPEN';

/** INBOX item — every one resolves to a real node of the same project. */
export type DecisionItem = {
  item_id: string;
  project_id: string;
  node_id: string;
  kind: DecisionKind;
  title: string;
  detail: string;
  state: DecisionState;
  domain: WorkDomain;
  owner: ActionOwner;
  priority: 'HIGH' | 'MED';
  actions: readonly DecisionAction[];
  route: string | null;
  created_at: string | null;
  resolved_at: string | null;
  source_truth_id: string;
};

export type ProductionEventType =
  | 'CREATED'
  | 'UPDATED'
  | 'APPROVED'
  | 'REVISED'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'GENERATED'
  | 'CAST'
  | 'PUBLISHED'
  | 'UNLOCKED'
  | 'BLOCKED'
  | 'RESOLVED'
  | 'DEPLOYED'
  | 'DECIDED'
  | 'REQUESTED'
  | 'PROMOTED_TO_AUTHORITY';

/** ACTIVITY is downstream of these — never timeline filler. */
export type ProductionEvent = {
  event_id: string;
  project_id: string;
  node_id: string | null;
  event_type: ProductionEventType;
  actor: string;
  /** ISO timestamp, or a date (YYYY-MM-DD) when the source only records the day. */
  timestamp: string;
  prior_state: string | null;
  new_state: string | null;
  artifact_id: string | null;
  workspace_domain: WorkDomain | 'GENERAL';
  source_action: string;
  title: string;
  detail: string;
  /** SOURCE_TRUTH = recorded in a canonical contract / registry; WORKSPACE = a mutation taken in this workspace. */
  origin: 'SOURCE_TRUTH' | 'WORKSPACE' | 'REQUEST';
};

/** GLOBAL_TAB_AVAILABLE ≠ PROJECT_DOMAIN_ESTABLISHED. */
export type DomainState = {
  domain: WorkDomain;
  established: boolean;
  node_count: number;
  /** Why the domain is (not) established for this project — shown verbatim in the empty state. */
  reason: string;
  /** What would establish it. */
  establish_hint: string;
  /** The project's own production truth that this domain projects (empty when not established). */
  sources: readonly string[];
};

export type ProjectPhase = { step: PipelineStep; label: string; detail: string };

export type ProjectProductionGraph = {
  project_id: string;
  project_name: string;
  project_type: string;
  sources: readonly SourceTruthRef[];
  nodes: readonly ProductionNode[];
  artifacts: readonly ArtifactRecord[];
  decisions: readonly DecisionItem[];
  events: readonly ProductionEvent[];
  domains: Readonly<Record<WorkDomain, DomainState>>;
  phase: ProjectPhase | null;
  next_action: { node_id: string; label: string; owner: ActionOwner; route: string | null } | null;
};
