/**
 * WORKSPACE LEDGER — the mutations a founder takes in the workspace, replayed over the project graph.
 *
 * Every action belongs to ONE project and resolves to a real node (and usually a real INBOX item). Applying an
 * action is a pure, deterministic state transition whose effects reach every projection at once:
 *
 *   APPROVE           node approved / authority locked → in-review artifacts PROMOTED to CANONICAL (LIBRARY) →
 *                     the INBOX item RESOLVES → downstream nodes UNLOCK (HUB gate / blockers) → ACTIVITY events
 *   REQUEST_REVISION  node BLOCKED (revise) → artifacts marked REVISE (LIBRARY) → the item resolves with the verdict and
 *   / REJECT          a REVISION item is opened for the studio (INBOX · WATCHING) → downstream gets a blocker →
 *                     ACTIVITY records the verdict
 *   RESOLVE           an open question is decided → its gate recomputes (e.g. page-tree confirmation becomes
 *                     actionable once no question is open) → ACTIVITY records the decision
 *
 * Persistence is the host's job (project-keyed); this module only defines the actions and their effects.
 */
import type { ArtifactRecord, DecisionItem, ProductionEvent, ProductionNode } from './types.js';

export type WorkspaceActionKind = 'APPROVE' | 'REQUEST_REVISION' | 'REJECT' | 'RESOLVE';

export type WorkspaceAction = {
  action_id: string;
  project_id: string;
  kind: WorkspaceActionKind;
  node_id: string;
  item_id: string | null;
  note: string;
  at: string;
  actor: string;
};

type Mutable = {
  nodes: ProductionNode[];
  artifacts: ArtifactRecord[];
  decisions: DecisionItem[];
  events: ProductionEvent[];
};

const OPEN_KINDS = new Set(['DECISION', 'AMBIGUITY', 'AUTHORITY_VERDICT', 'CONFLICT_RESOLUTION']);

function event(a: WorkspaceAction, e: Omit<ProductionEvent, 'project_id' | 'actor' | 'timestamp' | 'origin' | 'source_action'>): ProductionEvent {
  return { ...e, project_id: a.project_id, actor: a.actor, timestamp: a.at, origin: 'WORKSPACE', source_action: `WORKSPACE_${a.kind}` };
}

/** Recompute decision-gated blockers on a node after an open question is decided. */
function recomputeDecisionGate(m: Mutable, nodeId: string, a: WorkspaceAction) {
  const node = m.nodes.find((n) => n.node_id === nodeId);
  if (!node) return;
  const gate = node.blockers.find((b) => b.blocker_id.endsWith('.open-decisions'));
  if (!gate) return;
  const open = m.decisions.filter((d) => d.node_id === nodeId && d.state === 'NEEDS_YOU' && OPEN_KINDS.has(d.kind));
  const i = m.nodes.indexOf(node);
  if (open.length === 0) {
    m.nodes[i] = { ...node, blockers: node.blockers.filter((b) => b !== gate), status: 'REVIEW_REQUIRED', status_detail: 'Every open decision is settled — page tree awaiting founder confirmation', next_required_action: 'Founder confirms the page tree' };
    for (const d of m.decisions)
      if (d.node_id === nodeId && d.kind === 'FOUNDER_APPROVAL' && d.state === 'WATCHING') {
        m.decisions[m.decisions.indexOf(d)] = { ...d, state: 'NEEDS_YOU', actions: ['APPROVE', 'REQUEST_REVISION', 'OPEN'], detail: 'Every decision is settled — the page tree can be confirmed' };
      }
    m.events.push(event(a, { event_id: `${a.action_id}.unlocked`, node_id: nodeId, event_type: 'UNLOCKED', prior_state: 'BLOCKED', new_state: 'REVIEW_REQUIRED', artifact_id: null, workspace_domain: node.domain, title: `${node.label} UNBLOCKED`, detail: 'No open decision remains' }));
  } else {
    m.nodes[i] = { ...node, blockers: node.blockers.map((b) => (b === gate ? { ...gate, reason: `${open.length} open founder decision${open.length === 1 ? '' : 's'}` } : b)), status_detail: `Page tree awaiting founder confirmation · ${open.length} open decisions` };
  }
}

function applyOne(m: Mutable, a: WorkspaceAction) {
  const nodeIdx = m.nodes.findIndex((n) => n.node_id === a.node_id && n.project_id === a.project_id);
  if (nodeIdx < 0) return; // an action for a node this project does not have is ignored — never applied elsewhere
  const node = m.nodes[nodeIdx]!;
  const item = a.item_id ? m.decisions.find((d) => d.item_id === a.item_id && d.project_id === a.project_id) ?? null : null;
  const resolveItem = (verdict: string) => {
    if (!item) return;
    m.decisions[m.decisions.indexOf(item)] = { ...item, state: 'RESOLVED', resolved_at: a.at, actions: ['OPEN'], detail: `${verdict}${a.note ? ` — ${a.note}` : ''}` };
    m.events.push(event(a, { event_id: `${a.action_id}.resolved`, node_id: node.node_id, event_type: 'RESOLVED', prior_state: item.state, new_state: 'RESOLVED', artifact_id: null, workspace_domain: node.domain, title: `${item.title} RESOLVED`, detail: verdict }));
  };

  if (a.kind === 'RESOLVE') {
    resolveItem('DECIDED');
    m.events.push(event(a, { event_id: `${a.action_id}.decided`, node_id: node.node_id, event_type: 'DECIDED', prior_state: 'OPEN', new_state: 'DECIDED', artifact_id: null, workspace_domain: node.domain, title: item ? item.title : `${node.label} DECISION`, detail: a.note || 'Decided in the workspace' }));
    recomputeDecisionGate(m, node.node_id, a);
    return;
  }

  if (a.kind === 'APPROVE') {
    const implemented = node.implementation_status === 'IMPLEMENTED' && node.qa_status === 'PASS';
    const nextNode: ProductionNode = {
      ...node,
      approval_status: 'APPROVED',
      authority_status: node.authority_status === 'NOT_REQUIRED' ? 'NOT_REQUIRED' : 'LOCKED',
      status: implemented ? 'COMPLETE' : node.implementation_status === 'NOT_APPLICABLE' ? 'COMPLETE' : 'ACTIVE',
      current_stage: implemented || node.implementation_status === 'NOT_APPLICABLE' ? 'APPROVED' : 'AUTHORITY_READY',
      pipeline_step: implemented ? 'LIVE' : node.implementation_status === 'NOT_APPLICABLE' ? node.pipeline_step : 'IMPLEMENTATION',
      status_detail: implemented ? 'Founder approved · implemented · QA passed' : node.implementation_status === 'NOT_APPLICABLE' ? 'Founder approved' : 'Authority locked by founder — implementation unblocked',
      blockers: node.blockers.filter((b) => b.owner !== 'FOUNDER'),
      next_required_action: implemented || node.implementation_status === 'NOT_APPLICABLE' ? null : 'Implement against the locked authority',
      last_event: `${a.action_id}.approved`,
    };
    m.nodes[nodeIdx] = nextNode;
    m.events.push(event(a, { event_id: `${a.action_id}.approved`, node_id: node.node_id, event_type: 'APPROVED', prior_state: node.status, new_state: nextNode.status, artifact_id: null, workspace_domain: node.domain, title: `${node.label} APPROVED`, detail: a.note || 'Founder approval recorded in the workspace' }));
    for (const art of m.artifacts)
      if (art.source_node_id === node.node_id && (art.status === 'IN_REVIEW' || art.status === 'REVISE')) {
        m.artifacts[m.artifacts.indexOf(art)] = { ...art, status: 'CANONICAL', authority_status: 'LOCKED' };
        m.events.push(event(a, { event_id: `${a.action_id}.promoted.${art.artifact_id}`, node_id: node.node_id, event_type: 'PROMOTED_TO_AUTHORITY', prior_state: art.status, new_state: 'CANONICAL', artifact_id: art.artifact_id, workspace_domain: node.domain, title: `${art.label} PROMOTED TO AUTHORITY`, detail: `${node.label} · LIBRARY canonical` }));
      }
    // downstream nodes held by this node unlock
    m.nodes = m.nodes.map((n) => {
      const held = n.blockers.filter((b) => b.upstream === node.node_id);
      if (!held.length) return n;
      const blockers = n.blockers.filter((b) => b.upstream !== node.node_id);
      m.events.push(event(a, { event_id: `${a.action_id}.unlocked.${n.node_id}`, node_id: n.node_id, event_type: 'UNLOCKED', prior_state: n.status, new_state: blockers.length ? n.status : 'ACTIVE', artifact_id: null, workspace_domain: n.domain, title: `${n.label} UNLOCKED`, detail: `${node.label} approved` }));
      return { ...n, blockers, status: blockers.length ? n.status : n.status === 'LOCKED' || n.status === 'BLOCKED' ? 'ACTIVE' : n.status };
    });
    resolveItem('APPROVED');
    for (const d of m.decisions)
      if (d.node_id === node.node_id && d.state !== 'RESOLVED' && d !== item && d.kind !== 'REVIEW_REQUEST') m.decisions[m.decisions.indexOf(d)] = { ...d, state: 'RESOLVED', resolved_at: a.at, actions: ['OPEN'] };
    return;
  }

  // REQUEST_REVISION / REJECT — the verdict sends the node back
  const rejected = a.kind === 'REJECT';
  const blocker = {
    blocker_id: `${a.action_id}.revise`,
    node_id: node.node_id,
    reason: `${rejected ? 'Rejected' : 'Revision requested'} by founder${a.note ? `: ${a.note}` : ''}`,
    upstream: null,
    severity: 'HIGH' as const,
    owner: 'STUDIO' as const,
    required_action: rejected ? 'Rework the authority from territories' : 'Revise the authority per the founder note',
    downstream_effect: 'Downstream work cannot become authority-ready',
  };
  m.nodes[nodeIdx] = {
    ...node,
    status: 'BLOCKED',
    approval_status: rejected ? 'REJECTED' : 'REVISION_REQUESTED',
    authority_status: node.authority_status === 'NOT_REQUIRED' ? 'NOT_REQUIRED' : 'IN_DEVELOPMENT',
    status_detail: blocker.reason,
    blockers: [...node.blockers, blocker],
    next_required_action: blocker.required_action,
    last_event: `${a.action_id}.verdict`,
  };
  m.events.push(event(a, { event_id: `${a.action_id}.verdict`, node_id: node.node_id, event_type: rejected ? 'REJECTED' : 'REVISED', prior_state: node.status, new_state: 'BLOCKED', artifact_id: null, workspace_domain: node.domain, title: `${node.label} ${rejected ? 'REJECTED' : 'SENT BACK FOR REVISION'}`, detail: a.note || blocker.reason }));
  for (const art of m.artifacts)
    if (art.source_node_id === node.node_id && (art.status === 'IN_REVIEW' || (art.status === 'CANONICAL' && art.artifact_type.includes('AUTHORITY')))) {
      m.artifacts[m.artifacts.indexOf(art)] = { ...art, status: 'REVISE', authority_status: 'IN_DEVELOPMENT' };
    }
  for (const downstream of node.downstream_nodes) {
    const di = m.nodes.findIndex((n) => n.node_id === downstream);
    if (di < 0) continue;
    const dn = m.nodes[di]!;
    m.nodes[di] = { ...dn, blockers: [...dn.blockers, { ...blocker, blocker_id: `${a.action_id}.held.${dn.node_id}`, node_id: dn.node_id, reason: `Waiting on ${node.label} revision`, upstream: node.node_id, severity: 'MEDIUM' }] };
  }
  resolveItem(rejected ? 'REJECTED' : 'REVISION REQUESTED');
  m.decisions.push({
    item_id: `${a.action_id}.revision`,
    project_id: a.project_id,
    node_id: node.node_id,
    kind: 'REVIEW_REQUEST',
    title: `REVISE ${node.label}`,
    detail: blocker.reason,
    state: 'WATCHING',
    domain: node.domain,
    owner: 'STUDIO',
    priority: 'HIGH',
    actions: ['OPEN'],
    route: node.route,
    created_at: a.at,
    resolved_at: null,
    source_truth_id: `${a.project_id}.ledger`,
  });
}

/** Replay the project's own actions over its graph (actions of other projects are ignored). */
export function applyWorkspaceLedger(
  projectId: string,
  base: { nodes: readonly ProductionNode[]; artifacts: readonly ArtifactRecord[]; decisions: readonly DecisionItem[]; events: readonly ProductionEvent[] },
  actions: readonly WorkspaceAction[],
): Mutable {
  const m: Mutable = { nodes: [...base.nodes], artifacts: [...base.artifacts], decisions: [...base.decisions], events: [...base.events] };
  for (const a of [...actions].sort((x, y) => x.at.localeCompare(y.at))) if (a.project_id === projectId) applyOne(m, a);
  return m;
}

let seq = 0;
export function workspaceAction(input: Omit<WorkspaceAction, 'action_id' | 'at' | 'actor'> & { at?: string; actor?: string }): WorkspaceAction {
  const at = input.at ?? new Date().toISOString();
  seq += 1;
  return { ...input, at, actor: input.actor ?? 'FOUNDER', action_id: `${input.project_id}.ws.${at.replace(/[^0-9]/g, '')}.${seq}` };
}
