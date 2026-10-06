/**
 * Graph-driven panel primitives. Every row renders ONE record of the active project's graph; every count is the
 * length of a list and links to it. Decision actions write a project-keyed WorkspaceAction (workspace ledger), and
 * every projection re-derives from it — that is the cross-tab propagation.
 */
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  workspaceAction,
  type ArtifactRecord,
  type DecisionItem,
  type NodeStage,
  type NodeStatus,
  type ProductionBlocker,
  type ProductionEvent,
  type ProductionNode,
  type ProjectProductionGraph,
  type WorkspaceActionKind,
} from '../../../../../shared/site00-production-graph/index.js';
import { resolveBlockerPanelMedia, resolveDecisionPanelMedia, resolveEventPanelMedia, resolveNodePanelMedia } from '../../../../../shared/site00-production-graph/panelMedia.js';
import { recordWorkspaceAction } from '../../../production/workspaceLedgerStore';
import { IaChip } from '../iaKit';
import { agoLabel } from '../primitives';
import { PanelMediaSlot } from './PanelMediaSlot';
import '../../../styles/site00-production-project-graph.css';

export const STATUS_WORD: Record<NodeStatus, string> = {
  COMPLETE: 'COMPLETE',
  ACTIVE: 'IN PROGRESS',
  REVIEW_REQUIRED: 'REVIEW REQUIRED',
  BLOCKED: 'BLOCKED',
  LOCKED: 'LOCKED',
  NOT_STARTED: 'NOT STARTED',
};

export const STAGE_WORD = (s: NodeStage) => s.replace(/_/g, ' ');

export function statusTone(s: NodeStatus): 'red' | 'amber' | 'green' | 'ink' | 'blue' {
  if (s === 'COMPLETE') return 'green';
  if (s === 'BLOCKED') return 'red';
  if (s === 'REVIEW_REQUIRED') return 'amber';
  if (s === 'ACTIVE') return 'blue';
  return 'ink';
}

export function StatusChip({ status }: { status: NodeStatus }) {
  return <IaChip tone={statusTone(status)}>{STATUS_WORD[status]}</IaChip>;
}

/** A number that is a list length, linking to that list. */
export function CountLink({ value, label, sub, to, tone, testId }: { value: number; label: string; sub?: string; to: string; tone?: 'red'; testId: string }) {
  return (
    <Link to={to} className="pgx-count" data-tone={tone} data-testid={testId} data-count={value}>
      <b>{String(value).padStart(2, '0')}</b>
      <strong>{label}</strong>
      {sub ? <small>{sub}</small> : null}
    </Link>
  );
}

/** Media role for an artifact (production-workspace-media.ts): functional media are contained, never cropped. */
export function artifactMediaRole(a: ArtifactRecord): string {
  switch (a.artifact_type) {
    case 'STORYBOARD_FRAME':
      return 'VIDEO_FRAME';
    case 'BRAND_MARK':
    case 'ICON':
      return 'LOGO_MARK';
    case 'WORLD_ASSET':
      return 'LANDSCAPE_EDITORIAL';
    case 'UI_ASSET':
    case 'PHOTOGRAPHY':
    case 'ILLUSTRATION':
    case 'OTHER':
      return 'OTHER_FUNCTIONAL';
    default:
      return 'REFERENCE_AUTHORITY';
  }
}

export function ArtifactMedia({ artifact, className = 'pgx-tile__media' }: { artifact: ArtifactRecord | null; className?: string }) {
  if (!artifact?.url)
    return (
      <span className={`${className} pgx-tile__media--none`} data-media-state="missing">
        {artifact ? (artifact.status === 'MISSING' ? 'MISSING' : 'RECORDED · NOT MOUNTED') : 'NO PREVIEW'}
      </span>
    );
  return (
    <span className={className} data-media-fit="THUMBNAIL_CONTAIN" data-media-role={artifactMediaRole(artifact)} data-media-scale="TILE">
      <img src={artifact.url} alt="" loading="lazy" data-media-role={artifactMediaRole(artifact)} />
    </span>
  );
}

export function NodeRow({ node, graph, to, testId }: { node: ProductionNode; graph: ProjectProductionGraph; to?: string | null; testId?: string }) {
  const media = resolveNodePanelMedia(graph, node);
  const href = to ?? node.route;
  const copy = (
    <span className="pgx-row__copy">
      <b>{node.label}</b>
      <small>
        {STAGE_WORD(node.current_stage)} · {node.status_detail}
      </small>
      {node.next_required_action ? <span>NEXT · {node.next_required_action}</span> : null}
    </span>
  );
  return (
    <li className="pgx-row pgx-row--media" data-testid={testId ?? 'graph-node-row'} data-node={node.node_id} data-project={node.project_id} data-status={node.status}>
      <PanelMediaSlot contract={media} node={node} className="pgx-row__thumb" testId={`${testId ?? 'graph-node-row'}-media`} />
      {href ? <Link to={href}>{copy}</Link> : copy}
      <span className="pgx-row__side">
        <StatusChip status={node.status} />
      </span>
    </li>
  );
}

export function BlockerRow({ blocker, graph }: { blocker: ProductionBlocker; graph: ProjectProductionGraph }) {
  const node = graph.nodes.find((n) => n.node_id === blocker.node_id);
  const upstream = blocker.upstream ? graph.nodes.find((n) => n.node_id === blocker.upstream) : null;
  const media = resolveBlockerPanelMedia(graph, blocker);
  return (
    <li className="pgx-row pgx-row--media" data-testid="graph-blocker-row" data-node={blocker.node_id} data-project={graph.project_id}>
      <PanelMediaSlot contract={media} node={node ?? null} className="pgx-row__thumb" testId="graph-blocker-media" />
      <span className="pgx-row__copy">
        <b>{node?.label ?? blocker.node_id}</b>
        <small>{blocker.reason}</small>
        <span>
          {blocker.owner} · {blocker.required_action}
          {upstream ? ` · upstream ${upstream.label}` : ''}
        </span>
        <span>EFFECT · {blocker.downstream_effect}</span>
      </span>
      <span className="pgx-row__side">
        <IaChip tone={blocker.severity === 'HIGH' ? 'red' : 'amber'}>{blocker.severity}</IaChip>
      </span>
    </li>
  );
}

export function EventRow({ event, graph }: { event: ProductionEvent; graph: ProjectProductionGraph }) {
  const node = event.node_id ? graph.nodes.find((n) => n.node_id === event.node_id) : null;
  const media = resolveEventPanelMedia(graph, event);
  const showMedia = !!(media.artifact?.url || media.artifact || node);
  return (
    <li className={`pgx-row${showMedia ? ' pgx-row--media' : ''}`} data-testid="graph-event-row" data-event={event.event_type} data-project={event.project_id}>
      {showMedia ?
        <PanelMediaSlot contract={media} node={node} className="pgx-row__thumb" testId="graph-event-media" />
      : null}
      <span className="pgx-row__copy">
        <b>{event.title}</b>
        <small>
          {event.actor} · {/^\d{4}-\d{2}-\d{2}$/.test(event.timestamp) ? event.timestamp : agoLabel(event.timestamp)} · {event.origin === 'SOURCE_TRUTH' ? 'RECORDED IN SOURCE' : event.origin === 'REQUEST' ? 'REQUEST' : 'WORKSPACE'}
        </small>
        {event.detail ? <span>{event.detail}</span> : null}
        {node ? <span>{node.label}</span> : null}
      </span>
      <span className="pgx-row__side">
        <IaChip tone={/APPROVED|PROMOTED|RESOLVED|UNLOCKED|DECIDED/.test(event.event_type) ? 'green' : /REJECTED|REVISED|BLOCKED/.test(event.event_type) ? 'red' : 'ink'}>{event.event_type.replace(/_/g, ' ')}</IaChip>
      </span>
    </li>
  );
}

const ACTION_LABEL: Record<WorkspaceActionKind, string> = { APPROVE: 'APPROVE', REQUEST_REVISION: 'REQUEST REVISION', REJECT: 'REJECT', RESOLVE: 'MARK DECIDED' };

/** Records a founder action in THIS project's ledger. */
export function useWorkspaceActionDispatch(projectId: string) {
  return useCallback(
    (kind: WorkspaceActionKind, item: DecisionItem, note: string) => {
      if (item.project_id !== projectId) return; // a decision is acted on only inside its own project
      recordWorkspaceAction(workspaceAction({ project_id: projectId, kind, node_id: item.node_id, item_id: item.item_id, note }));
    },
    [projectId],
  );
}

export function DecisionActions({ item, projectId }: { item: DecisionItem; projectId: string }) {
  const dispatch = useWorkspaceActionDispatch(projectId);
  const [pending, setPending] = useState<WorkspaceActionKind | null>(null);
  const [note, setNote] = useState('');
  const kinds = item.actions.filter((a): a is WorkspaceActionKind => a !== 'OPEN');
  if (item.state === 'RESOLVED' || !kinds.length) return null;
  return (
    <div className="pgx-actions" data-testid="graph-decision-actions">
      {pending ?
        <div className="pgx-note">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={pending === 'APPROVE' ? 'Note (optional)' : 'What should change?'} aria-label="Decision note" data-testid="graph-decision-note" />
          <div className="pgx-actions">
            <button
              type="button"
              className="iax-btn iax-btn--line"
              data-testid="graph-decision-confirm"
              onClick={() => {
                dispatch(pending, item, note.trim());
                setPending(null);
                setNote('');
              }}
            >
              CONFIRM {ACTION_LABEL[pending]}
            </button>
            <button type="button" className="iax-btn iax-btn--ghost" onClick={() => setPending(null)}>
              CANCEL
            </button>
          </div>
        </div>
      : kinds.map((k) => (
          <button key={k} type="button" className={`iax-btn ${k === 'APPROVE' || k === 'RESOLVE' ? 'iax-btn--line' : 'iax-btn--ghost'}`} onClick={() => setPending(k)} data-testid={`graph-decision-${k.toLowerCase()}`}>
            {ACTION_LABEL[k]}
          </button>
        ))
      }
    </div>
  );
}

export function DecisionRow({ item, graph, to, actions = false }: { item: DecisionItem; graph: ProjectProductionGraph; to: string; actions?: boolean }) {
  const node = graph.nodes.find((n) => n.node_id === item.node_id);
  const media = resolveDecisionPanelMedia(graph, item);
  const visual = item.kind === 'AUTHORITY_VERDICT' || item.kind === 'IMPLEMENTATION_ACCEPTANCE' || !!media.artifact;
  return (
    <li className={`pgx-row${visual ? ' pgx-row--media' : ''}`} data-testid="graph-decision-row" data-item={item.item_id} data-state={item.state} data-project={item.project_id}>
      {visual ?
        <PanelMediaSlot contract={{ ...media, click_target: to }} node={node ?? null} className="pgx-row__thumb" testId="graph-decision-media" />
      : null}
      <span className="pgx-row__copy">
        <Link to={to}>
          <b>{item.title}</b>
        </Link>
        <small>{item.detail}</small>
        <span>
          {item.kind.replace(/_/g, ' ')} · {item.owner}
          {node ? ` · ${node.label}` : ''}
          {item.resolved_at ? ` · resolved ${agoLabel(item.resolved_at)}` : ''}
        </span>
        {actions ? <DecisionActions item={item} projectId={graph.project_id} /> : null}
      </span>
      <span className="pgx-row__side">
        <IaChip tone={item.state === 'NEEDS_YOU' ? (item.priority === 'HIGH' ? 'red' : 'amber') : item.state === 'RESOLVED' ? 'green' : 'ink'}>{item.state.replace('_', ' ')}</IaChip>
      </span>
    </li>
  );
}

export function GraphPanel({ title, count, action, children, testId, className = '' }: { title: string; count?: number; action?: { to: string; label?: string }; children: React.ReactNode; testId: string; className?: string }) {
  return (
    <section className={`iax-panel ${className}`} data-testid={testId} data-count={count}>
      <header className="iax-panel__head">
        <h2>
          <i aria-hidden />
          {title}
          {count != null ? <em>{count}</em> : null}
        </h2>
        {action ?
          <Link to={action.to} className="iax-viewall">
            {action.label ?? 'VIEW ALL'} <span aria-hidden>→</span>
          </Link>
        : null}
      </header>
      {children}
    </section>
  );
}
