/**
 * Adapter: EXPRESSION PRODUCTION (Production Hub graph + Expression Engine + acting catalogue) → project graph.
 *
 * Source of truth: the canonical Production Hub graph derived from the Expression Engine pipeline for ONE entry
 * (today NDXBOOK · ENTRY 002: narrative → cast → look → performance → set → storyboard → keyframes), the entry's
 * cast state, its scenes / storyboard frames and the asset receipt ledger. Only facts that the host already keys
 * to this project are accepted — every input row carries its project and foreign rows are dropped.
 *
 * Departments map onto canonical stages; a blocker is a node that cannot move (BLOCKED, or LOCKED behind an
 * incomplete upstream) — review is a founder decision, not a blocker. Founder requests are WATCHING (the studio
 * owes the work), never NEEDS YOU.
 */
import type { HubGraph, HubNode, HubNodeId } from '../../site00-production-hub/types.js';
import type {
  ArtifactRecord,
  DecisionItem,
  ExpressionNodeType,
  NodeStage,
  PipelineStep,
  ProductionBlocker,
  ProductionEvent,
  ProductionEventType,
  ProductionNode,
  SourceTruthRef,
} from '../types.js';

export type ExpressionRoleFact = {
  roleId: string;
  label: string;
  importance: string;
  characterName: string | null;
  /** Catalogue actor that plays the role (null = uncast). */
  actorName: string | null;
  /** An actor id is set but no catalogue record exists for it (partial / phantom assignment). */
  actorMissingFromCatalogue: boolean;
  route: string;
};

export type ExpressionAttentionFact = {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  priority: 'HIGH' | 'NORMAL';
  nodeId: string | null;
  why: string;
};

export type ExpressionActivityFact = {
  id: string;
  projectId: string;
  category: string;
  title: string;
  detail: string;
  at: string;
  actor: string | null;
  nodeId: string | null;
};

export type ExpressionRequestFact = { id: string; projectId: string; title: string; scope: string; createdAt: string; status: string };

export type ExpressionAssetFact = {
  slotId: string;
  projectId: string;
  nodeId: string | null;
  label: string;
  url: string;
  kind: 'NODE_ART' | 'STORYBOARD_FRAME' | 'CHARACTER_AUTHORITY' | 'PROJECT_COVER';
  source: string;
  receivedAt: string | null;
  sourceAuthority: string | null;
  usedBy: readonly string[];
};

export type ExpressionProductionInput = {
  projectId: string;
  productionId: string;
  productionLabel: string;
  productionTitle: string | null;
  graph: HubGraph;
  sceneCount: number;
  roles: readonly ExpressionRoleFact[];
  attention: readonly ExpressionAttentionFact[];
  activity: readonly ExpressionActivityFact[];
  requests: readonly ExpressionRequestFact[];
  assets: readonly ExpressionAssetFact[];
  /** Workspace route for a department (`casting`, `wardrobe` …) or the expression root (''). */
  route: (sub: string) => string;
  pipelineAvailable: boolean;
};

export type ExpressionGraphPart = {
  sources: SourceTruthRef[];
  nodes: ProductionNode[];
  artifacts: ArtifactRecord[];
  decisions: DecisionItem[];
  events: ProductionEvent[];
};

const DEPT: Record<HubNodeId, { type: ExpressionNodeType; step: PipelineStep; sub: string }> = {
  narrative: { type: 'NARRATIVE', step: 'NARRATIVE', sub: 'narrative' },
  cast: { type: 'CASTING_DECISION', step: 'CASTING', sub: 'casting' },
  look: { type: 'LOOK', step: 'LOOK', sub: 'wardrobe' },
  performance: { type: 'PERFORMANCE', step: 'PERFORMANCE', sub: 'performance' },
  set: { type: 'SET', step: 'SET', sub: 'sets' },
  storyboard: { type: 'STORYBOARD', step: 'STORYBOARD', sub: 'storyboard' },
  keyframes: { type: 'KEYFRAME', step: 'KEYFRAMES', sub: 'storyboard/keyframes' },
};

function stageOf(n: HubNode): NodeStage {
  switch (n.status) {
    case 'COMPLETE':
      return 'APPROVED';
    case 'REVIEW_REQUIRED':
      return 'EXPRESSION_READY';
    case 'ACTIVE':
    case 'BLOCKED':
      return 'STRUCTURED';
    default:
      return 'PLANNED';
  }
}

export const expressionNodeId = (projectId: string, productionId: string, hubNode: HubNodeId) => `${projectId}.expression.${productionId}.${hubNode}`;

const EVENT_TYPE = (category: string, title: string): ProductionEventType => {
  if (category === 'APPROVAL') return /REVIS|REJECT|REFINE/.test(title) ? 'REVISED' : 'APPROVED';
  if (category === 'RENDER') return 'GENERATED';
  if (category === 'ASSET') return 'UPDATED';
  if (category === 'REQUEST') return 'REQUESTED';
  return 'UPDATED';
};

export function buildExpressionGraphPart(i: ExpressionProductionInput): ExpressionGraphPart {
  const pid = i.projectId;
  const sourceId = `${pid}.expression.${i.productionId}`;
  const sources: SourceTruthRef[] = [
    { source_id: sourceId, kind: 'EXPRESSION_ENGINE', path: 'shared/site00-production-hub (graph) · /api/site00/expression-engine', label: `${i.productionLabel} expression pipeline` },
    { source_id: `${pid}.cast.${i.productionId}`, kind: 'ACTING_CATALOGUE', path: 'shared/site00-studio-world/acting-catalogue', label: `${i.productionLabel} cast state` },
    { source_id: `${pid}.assets`, kind: 'HUB_ASSET_REGISTRY', path: 'shared/site00-production-hub/assetReceipts.ts', label: 'Production asset receipts' },
  ];
  const entryNode = `${pid}.expression.${i.productionId}`;
  const nodes: ProductionNode[] = [];
  const artifacts: ArtifactRecord[] = [];
  const decisions: DecisionItem[] = [];
  const events: ProductionEvent[] = [];

  /* ── artifacts (receipts + runtime canonical files), keyed to this project only ── */
  for (const a of i.assets) {
    if (a.projectId !== pid) continue;
    artifacts.push({
      artifact_id: `${pid}.asset.${a.slotId}`,
      project_id: pid,
      source_node_id: a.nodeId ? expressionNodeId(pid, i.productionId, a.nodeId as HubNodeId) : entryNode,
      artifact_type: a.kind === 'PROJECT_COVER' ? 'ILLUSTRATION' : a.kind,
      label: a.label,
      status: 'CANONICAL',
      authority_status: a.kind === 'CHARACTER_AUTHORITY' ? 'APPROVED' : 'NOT_REQUIRED',
      created_by: a.source,
      derived_from: a.sourceAuthority ? [a.sourceAuthority] : [],
      supersedes: [],
      superseded_by: null,
      used_by: [...a.usedBy],
      viewport: null,
      actor_mode: null,
      url: a.url,
      source_truth_id: `${pid}.assets`,
    });
    if (a.receivedAt) {
      events.push({
        event_id: `${pid}.event.receipt.${a.slotId}`,
        project_id: pid,
        node_id: a.nodeId ? expressionNodeId(pid, i.productionId, a.nodeId as HubNodeId) : entryNode,
        event_type: 'GENERATED',
        actor: a.source,
        timestamp: a.receivedAt,
        prior_state: 'MISSING',
        new_state: 'CANONICAL',
        artifact_id: `${pid}.asset.${a.slotId}`,
        workspace_domain: 'EXPRESSION',
        source_action: 'ASSET_RECEIPT',
        title: `${a.label} RECEIVED`,
        detail: `${a.source} asset receipt · ${a.slotId}`,
        origin: 'SOURCE_TRUTH',
      });
    }
  }
  const artifactsFor = (nodeId: string) => artifacts.filter((a) => a.source_node_id === nodeId).map((a) => a.artifact_id);

  /* ── department nodes (the expression production graph) ── */
  for (const n of i.graph.nodes) {
    const d = DEPT[n.id];
    const nodeId = expressionNodeId(pid, i.productionId, n.id);
    const unmet = n.dependsOn.filter((dep) => i.graph.byId[dep].status !== 'COMPLETE');
    const blockers: ProductionBlocker[] = [];
    if (n.status === 'BLOCKED' || n.status === 'LOCKED') {
      blockers.push({
        blocker_id: `${nodeId}.blocked`,
        node_id: nodeId,
        reason: n.status === 'LOCKED' ? `Locked — waiting on ${unmet.map((u) => u.toUpperCase()).join(', ') || 'upstream'}` : n.statusDetail,
        upstream: unmet[0] ? expressionNodeId(pid, i.productionId, unmet[0]) : null,
        severity: n.status === 'BLOCKED' ? 'HIGH' : 'MEDIUM',
        owner: n.status === 'BLOCKED' ? 'STUDIO' : unmet.some((u) => i.graph.byId[u].status === 'REVIEW_REQUIRED') ? 'FOUNDER' : 'STUDIO',
        required_action: n.status === 'LOCKED' ? `Complete ${unmet.map((u) => u.toUpperCase()).join(', ')}` : n.statusDetail,
        downstream_effect: n.unlocks.length ? `${n.unlocks.map((u) => u.toUpperCase()).join(', ')} cannot start` : 'Entry cannot reach authority',
      });
    }
    const arts = artifactsFor(nodeId);
    nodes.push({
      project_id: pid,
      node_id: nodeId,
      node_type: d.type,
      label: n.label,
      parent_id: entryNode,
      family_id: i.productionId,
      domain: 'EXPRESSION',
      workspace_domains: ['HUB', 'INBOX', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'],
      current_stage: stageOf(n),
      pipeline_step: d.step,
      status: n.status,
      status_detail: n.statusDetail,
      authority_status: n.status === 'COMPLETE' ? 'APPROVED' : n.status === 'REVIEW_REQUIRED' ? 'IN_REVIEW' : 'REQUIRED',
      approval_status: n.status === 'COMPLETE' ? 'APPROVED' : n.status === 'REVIEW_REQUIRED' ? 'PENDING' : 'NOT_REQUESTED',
      implementation_status: 'NOT_APPLICABLE',
      qa_status: 'NOT_APPLICABLE',
      live_status: 'NOT_LIVE',
      dependencies: n.dependsOn.map((dep) => expressionNodeId(pid, i.productionId, dep)),
      blockers,
      upstream_nodes: n.dependsOn.map((dep) => expressionNodeId(pid, i.productionId, dep)),
      downstream_nodes: n.unlocks.map((u) => expressionNodeId(pid, i.productionId, u)),
      actor_scope: [],
      viewport_scope: [],
      artifact_ids: arts,
      source_truth_ids: [sourceId],
      last_event: null,
      next_required_action:
        n.status === 'REVIEW_REQUIRED' ? `Founder review · ${n.statusDetail}`
        : n.status === 'COMPLETE' ? null
        : n.status === 'LOCKED' ? `Waiting on ${unmet.map((u) => u.toUpperCase()).join(', ')}`
        : n.statusDetail,
      route: i.route(d.sub),
      preview_artifact_id: arts[0] ?? null,
    });
  }

  /* ── roles (casting) ── */
  for (const r of i.roles) {
    const nodeId = `${pid}.expression.${i.productionId}.role.${r.roleId}`;
    const cast = !!r.actorName && !r.actorMissingFromCatalogue;
    nodes.push({
      project_id: pid,
      node_id: nodeId,
      node_type: 'ROLE',
      label: r.label,
      parent_id: expressionNodeId(pid, i.productionId, 'cast'),
      family_id: i.productionId,
      domain: 'EXPRESSION',
      workspace_domains: ['EXPRESSION', 'LIBRARY'],
      current_stage: cast ? 'EXPRESSION_READY' : 'STRUCTURED',
      pipeline_step: 'CASTING',
      status: cast ? 'COMPLETE' : r.actorMissingFromCatalogue ? 'REVIEW_REQUIRED' : 'NOT_STARTED',
      status_detail:
        cast ? `Cast · ${r.actorName}${r.characterName ? ` as ${r.characterName}` : ''}`
        : r.actorMissingFromCatalogue ? 'Actor assignment has no catalogue record'
        : 'Uncast',
      authority_status: 'NOT_REQUIRED',
      approval_status: cast ? 'APPROVED' : 'NOT_REQUESTED',
      implementation_status: 'NOT_APPLICABLE',
      qa_status: 'NOT_APPLICABLE',
      live_status: 'NOT_LIVE',
      dependencies: [],
      blockers: [],
      upstream_nodes: [],
      downstream_nodes: [],
      actor_scope: [],
      viewport_scope: [],
      artifact_ids: [],
      source_truth_ids: [`${pid}.cast.${i.productionId}`],
      last_event: null,
      next_required_action: cast ? null : 'Cast a catalogued actor for the role',
      route: r.route,
      preview_artifact_id: null,
    });
  }

  /* ── the entry itself ── */
  const done = i.graph.completeCount;
  const active = i.graph.activeNodeId ? i.graph.byId[i.graph.activeNodeId] : null;
  nodes.unshift({
    project_id: pid,
    node_id: entryNode,
    node_type: 'ENTRY',
    label: `${i.productionLabel}${i.productionTitle ? ` — ${i.productionTitle}` : ''}`,
    parent_id: null,
    family_id: i.productionId,
    domain: 'EXPRESSION',
    workspace_domains: ['HUB', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'],
    current_stage: done === i.graph.nodes.length ? 'APPROVED' : 'STRUCTURED',
    pipeline_step: active ? DEPT[active.id].step : 'NARRATIVE',
    status: done === i.graph.nodes.length ? 'COMPLETE' : 'ACTIVE',
    status_detail: `${done} of ${i.graph.nodes.length} departments complete · ${i.sceneCount} scenes`,
    authority_status: 'IN_DEVELOPMENT',
    approval_status: 'NOT_REQUESTED',
    implementation_status: 'NOT_APPLICABLE',
    qa_status: 'NOT_APPLICABLE',
    live_status: 'NOT_LIVE',
    dependencies: [],
    blockers: [],
    upstream_nodes: [],
    downstream_nodes: i.graph.nodes.map((n) => expressionNodeId(pid, i.productionId, n.id)),
    actor_scope: [],
    viewport_scope: [],
    artifact_ids: [],
    source_truth_ids: sources.map((s) => s.source_id),
    last_event: null,
    next_required_action: i.graph.founderGate.open ? i.graph.founderGate.headline : (i.graph.operation.label ?? null),
    route: i.route(''),
    preview_artifact_id: artifactsFor(expressionNodeId(pid, i.productionId, 'storyboard'))[0] ?? null,
  });

  /* ── decisions: founder attention only; requests are WATCHING (the studio owes the work) ── */
  for (const a of i.attention) {
    if (a.kind === 'REQUEST') continue; // the request itself is listed below — never twice
    const nodeId = a.nodeId ? expressionNodeId(pid, i.productionId, a.nodeId as HubNodeId) : entryNode;
    const founder = a.kind === 'FOUNDER_APPROVAL' || a.kind === 'NARRATIVE' || a.kind === 'CASTING' || a.kind === 'WARDROBE';
    decisions.push({
      item_id: `${pid}.decision.${a.id}`,
      project_id: pid,
      node_id: nodeId,
      kind: a.kind === 'FOUNDER_APPROVAL' || a.kind === 'NARRATIVE' ? 'FOUNDER_APPROVAL' : a.kind === 'SET' ? 'BLOCKER_ACTION' : 'DECISION',
      title: a.title,
      detail: a.why || a.subtitle,
      state: founder ? 'NEEDS_YOU' : 'WATCHING',
      domain: 'EXPRESSION',
      owner: founder ? 'FOUNDER' : 'STUDIO',
      priority: a.priority === 'HIGH' ? 'HIGH' : 'MED',
      actions: a.kind === 'FOUNDER_APPROVAL' ? ['APPROVE', 'REQUEST_REVISION', 'OPEN'] : ['OPEN'],
      route: nodes.find((n) => n.node_id === nodeId)?.route ?? i.route(''),
      created_at: null,
      resolved_at: null,
      source_truth_id: sourceId,
    });
  }
  for (const r of i.requests) {
    if (r.projectId !== pid) continue;
    decisions.push({
      item_id: `${pid}.request.${r.id}`,
      project_id: pid,
      node_id: entryNode,
      kind: 'REVIEW_REQUEST',
      title: r.title.toUpperCase(),
      detail: `${r.scope} · requested ${r.createdAt.slice(0, 10)}`,
      state: r.status === 'QUEUED' ? 'WATCHING' : 'RESOLVED',
      domain: 'EXPRESSION',
      owner: 'STUDIO',
      priority: 'MED',
      actions: ['OPEN'],
      route: i.route(''),
      created_at: r.createdAt,
      resolved_at: null,
      source_truth_id: `${pid}.request.${r.id}`,
    });
    events.push({
      event_id: `${pid}.event.request.${r.id}`,
      project_id: pid,
      node_id: entryNode,
      event_type: 'REQUESTED',
      actor: 'FOUNDER',
      timestamp: r.createdAt,
      prior_state: null,
      new_state: r.status,
      artifact_id: null,
      workspace_domain: 'EXPRESSION',
      source_action: 'PRODUCTION_REQUEST',
      title: r.title.toUpperCase(),
      detail: r.scope,
      origin: 'REQUEST',
    });
  }

  /* ── recorded workspace activity (project-keyed only) ── */
  for (const a of i.activity) {
    if (a.projectId !== pid || a.category === 'REQUEST') continue;
    events.push({
      event_id: `${pid}.event.${a.id}`,
      project_id: pid,
      node_id: a.nodeId ? expressionNodeId(pid, i.productionId, a.nodeId as HubNodeId) : entryNode,
      event_type: EVENT_TYPE(a.category, a.title),
      actor: a.actor ?? 'FOUNDER',
      timestamp: a.at,
      prior_state: null,
      new_state: null,
      artifact_id: null,
      workspace_domain: 'EXPRESSION',
      source_action: a.category,
      title: a.title,
      detail: a.detail,
      origin: 'WORKSPACE',
    });
  }

  void i.pipelineAvailable;
  return { sources, nodes, artifacts, decisions, events };
}
