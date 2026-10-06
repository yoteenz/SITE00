/**
 * Graph-driven root projections of ONE project's production graph:
 *
 *   ProjectHubBody       HUB      control plane — phase, real counts, progress, domains, decisions, blockers, events
 *   ProjectInboxBody     INBOX    real decision queue — NEEDS YOU / WATCHING / RESOLVED, item detail + actions
 *   ProjectLibraryBody   LIBRARY  artifact archive generated from records — status lenses, lineage detail
 *   ProjectActivityBody  ACTIVITY event ledger — events from source records, requests and workspace actions
 *
 * Nothing is authored here: every row is a graph record of the active project, every count a list length.
 */
import { Link, useSearchParams } from 'react-router-dom';
import {
  WORK_DOMAINS,
  artifactsIn,
  decisionsIn,
  hubSummary,
  nodeById,
  projectBlockers,
  scopedTabHref,
  topLevelNodes,
  type ArtifactStatus,
  type DecisionState,
  type ProductionEventType,
  type ProjectProductionGraph,
} from '../../../../../shared/site00-production-graph/index.js';
import { useProjectGraphData } from '../ProductionAuthorityData';
import { IaEmpty } from '../iaKit';
import { agoLabel } from '../primitives';
import {
  ArtifactMedia,
  BlockerRow,
  CountLink,
  DecisionActions,
  DecisionRow,
  EventRow,
  GraphPanel,
  NodeRow,
  STAGE_WORD,
  StatusChip,
} from './GraphPrimitives';

const inboxItemHref = (g: ProjectProductionGraph, itemId: string) => `${scopedTabHref('INBOX', g.project_id)}&item=${encodeURIComponent(itemId)}`;
const activityNodeHref = (g: ProjectProductionGraph, nodeId: string) => `${scopedTabHref('ACTIVITY', g.project_id)}&node=${encodeURIComponent(nodeId)}`;
const libraryArtifactHref = (g: ProjectProductionGraph, artifactId: string) => `${scopedTabHref('LIBRARY', g.project_id)}&artifact=${encodeURIComponent(artifactId)}`;

function Lenses<T extends string>({ lenses, active, href, testId }: { lenses: { id: T; label: string; count: number }[]; active: T; href: (id: T) => string; testId: string }) {
  return (
    <nav className="pgx-lenses" aria-label="Views" data-testid={testId}>
      {lenses.map((l) => (
        <Link key={l.id} to={href(l.id)} replace className={l.id === active ? 'is-active' : undefined} aria-current={l.id === active ? 'page' : undefined} data-testid={`${testId}-${l.id}`} data-count={l.count}>
          {l.label} <em>{l.count}</em>
        </Link>
      ))}
    </nav>
  );
}

/* ─────────────────────────────────────────────── HUB ─────────────────────────────────────────────── */

export function ProjectHubBody() {
  const g = useProjectGraphData();
  if (!g) return null;
  const h = hubSummary(g);
  const pid = g.project_id;
  return (
    <div className="pgx" data-testid="project-hub" data-project={pid}>
      <header className="pgx-head" data-testid="project-hub-head">
        <small>PROJECT · {g.project_type.replace(/_/g, ' ')}</small>
        <h1>{g.project_name}</h1>
        <p data-testid="project-hub-phase">{g.phase ? `CURRENT PHASE · ${g.phase.label} — ${g.phase.detail}` : 'NO PRODUCTION NODE HAS BEEN RECORDED FOR THIS PROJECT YET.'}</p>
        {g.next_action ?
          <p data-testid="project-hub-next">
            NEXT · {g.next_action.route ? <Link to={g.next_action.route}>{g.next_action.label}</Link> : g.next_action.label} · {g.next_action.owner}
          </p>
        : null}
      </header>
      <div className="pgx-counts" data-testid="project-hub-counts">
        <CountLink value={h.needsYou.length} label="NEED YOU" sub="founder decisions" to={scopedTabHref('INBOX', pid)} tone="red" testId="project-hub-count-needs-you" />
        <CountLink value={h.blockers.length} label="BLOCKERS" sub="nodes that cannot move" to={scopedTabHref('ACTIVITY', pid, 'blockers')} testId="project-hub-count-blockers" />
        <CountLink value={h.reviewNodes.length} label="IN REVIEW" sub="awaiting a verdict" to={scopedTabHref('INBOX', pid)} testId="project-hub-count-review" />
        <CountLink value={h.complete.length} label={`OF ${h.topLevel.length} COMPLETE`} sub="top-level production nodes" to={scopedTabHref('ACTIVITY', pid)} testId="project-hub-count-complete" />
      </div>
      <div className="pgx-grid">
        <GraphPanel title="PRODUCTION PROGRESS" count={h.topLevel.length} testId="project-hub-progress" className="pgx-span">
          {h.topLevel.length ?
            <>
              <div className="pgx-stages" data-testid="project-hub-stages">
                {h.stages.map((s) => (
                  <span key={s.stage} className="pgx-stage" data-stage={s.stage}>
                    <b>{s.count}</b> {STAGE_WORD(s.stage)}
                  </span>
                ))}
              </div>
              <ul className="pgx-rows">
                {h.topLevel.slice(0, 16).map((n) => (
                  <NodeRow key={n.node_id} node={n} graph={g} to={activityNodeHref(g, n.node_id)} testId="project-hub-node" />
                ))}
              </ul>
            </>
          : <IaEmpty title={`NO PRODUCTION NODE RECORDED FOR ${g.project_name}`} body="HUB shows a project's real production nodes. None has been recorded for this project yet — no other project's work is shown in its place." testId="project-hub-progress-empty" />}
        </GraphPanel>
        <GraphPanel title="WORK DOMAINS" testId="project-hub-domains">
          <ul className="pgx-rows">
            {WORK_DOMAINS.map((d) => {
              const s = g.domains[d];
              return (
                <li key={d} className="pgx-row" data-testid={`project-hub-domain-${d.toLowerCase()}`} data-established={s.established ? 'true' : 'false'}>
                  <Link to={scopedTabHref(d, pid)} className="pgx-row__copy">
                    <b>{d}</b>
                    <small>{s.established ? s.reason : `NOT ESTABLISHED · ${s.reason}`}</small>
                  </Link>
                  <span className="pgx-row__side">{s.established ? <StatusChip status="ACTIVE" /> : null}</span>
                </li>
              );
            })}
          </ul>
        </GraphPanel>
        <GraphPanel title="NEEDS YOU" count={h.needsYou.length} action={{ to: scopedTabHref('INBOX', pid), label: 'OPEN INBOX' }} testId="project-hub-needs-you">
          {h.needsYou.length ?
            <ul className="pgx-rows">
              {h.needsYou.slice(0, 4).map((d) => (
                <DecisionRow key={d.item_id} item={d} graph={g} to={inboxItemHref(g, d.item_id)} />
              ))}
            </ul>
          : <IaEmpty title="NOTHING NEEDS YOU" body={`No open founder decision for ${g.project_name}.`} testId="project-hub-needs-you-empty" />}
        </GraphPanel>
        <GraphPanel title="BLOCKERS" count={h.blockers.length} action={{ to: scopedTabHref('ACTIVITY', pid, 'blockers'), label: 'ALL BLOCKERS' }} testId="project-hub-blockers">
          {h.blockers.length ?
            <ul className="pgx-rows">
              {h.blockers.slice(0, 4).map((b) => (
                <BlockerRow key={b.blocker_id} blocker={b} graph={g} />
              ))}
            </ul>
          : <IaEmpty title="NOTHING IS BLOCKED" testId="project-hub-blockers-empty" />}
        </GraphPanel>
        <GraphPanel title="RECENT EVENTS" count={g.events.length} action={{ to: scopedTabHref('ACTIVITY', pid), label: 'OPEN ACTIVITY' }} testId="project-hub-events">
          {g.events.length ?
            <ul className="pgx-rows">
              {g.events.slice(0, 5).map((e) => (
                <EventRow key={e.event_id} event={e} graph={g} />
              ))}
            </ul>
          : <IaEmpty title={`NO EVENTS RECORDED FOR ${g.project_name} YET`} body="Events come from dated source records, requests and actions taken in this workspace." testId="project-hub-events-empty" />}
        </GraphPanel>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── INBOX ────────────────────────────────────────────── */

type InboxView = 'needs-you' | 'watching' | 'resolved' | 'all';
const VIEW_STATE: Record<InboxView, DecisionState | 'ALL'> = { 'needs-you': 'NEEDS_YOU', watching: 'WATCHING', resolved: 'RESOLVED', all: 'ALL' };

export function ProjectInboxBody() {
  const g = useProjectGraphData();
  const [params] = useSearchParams();
  if (!g) return null;
  const pid = g.project_id;
  const raw = params.get('view');
  const view: InboxView = raw && raw in VIEW_STATE ? (raw as InboxView) : 'needs-you';
  const itemId = params.get('item');
  const item = itemId ? (g.decisions.find((d) => d.item_id === itemId) ?? null) : null;
  const lenses = (['needs-you', 'watching', 'resolved', 'all'] as InboxView[]).map((v) => ({ id: v, label: v === 'needs-you' ? 'NEEDS YOU' : v.toUpperCase(), count: decisionsIn(g, VIEW_STATE[v]).length }));
  const href = (v: InboxView) => `${scopedTabHref('INBOX', pid)}&view=${v}`;
  if (itemId) {
    if (!item)
      return (
        <div className="pgx" data-testid="project-inbox" data-project={pid}>
          <IaEmpty title="ITEM NOT FOUND" body={`No decision with this id exists in ${g.project_name}.`} testId="project-inbox-item-missing" />
        </div>
      );
    const node = nodeById(g, item.node_id);
    const arts = g.artifacts.filter((a) => a.source_node_id === item.node_id).slice(0, 8);
    return (
      <div className="pgx" data-testid="project-inbox" data-project={pid}>
        <Link to={href(view)} className="iax-viewall" data-testid="project-inbox-back">
          ← INBOX
        </Link>
        <GraphPanel title={item.title} testId="project-inbox-item" className="pgx-span">
          <dl className="pgx-facts">
            <dt>PROJECT</dt>
            <dd>{g.project_name}</dd>
            <dt>STATE</dt>
            <dd>{item.state.replace('_', ' ')}</dd>
            <dt>KIND</dt>
            <dd>{item.kind.replace(/_/g, ' ')}</dd>
            <dt>OWNER</dt>
            <dd>{item.owner}</dd>
            <dt>DETAIL</dt>
            <dd>{item.detail}</dd>
            <dt>NODE</dt>
            <dd>{node ? `${node.label} · ${STAGE_WORD(node.current_stage)} · ${node.status_detail}` : item.node_id}</dd>
            {item.resolved_at ?
              <>
                <dt>RESOLVED</dt>
                <dd>{agoLabel(item.resolved_at)}</dd>
              </>
            : null}
          </dl>
          <DecisionActions item={item} projectId={pid} />
          {item.route ?
            <div className="pgx-actions">
              <Link to={item.route} className="iax-btn iax-btn--ghost" data-testid="project-inbox-open">
                OPEN IN {item.domain}
              </Link>
            </div>
          : null}
        </GraphPanel>
        {node?.blockers.length ?
          <GraphPanel title="BLOCKERS ON THIS NODE" count={node.blockers.length} testId="project-inbox-item-blockers">
            <ul className="pgx-rows">
              {node.blockers.map((b) => (
                <BlockerRow key={b.blocker_id} blocker={b} graph={g} />
              ))}
            </ul>
          </GraphPanel>
        : null}
        {arts.length ?
          <GraphPanel title="MATERIALS UNDER DECISION" count={g.artifacts.filter((a) => a.source_node_id === item.node_id).length} action={{ to: scopedTabHref('LIBRARY', pid), label: 'LIBRARY' }} testId="project-inbox-item-materials">
            <ul className="pgx-tiles">
              {arts.map((a) => (
                <li key={a.artifact_id}>
                  <Link to={libraryArtifactHref(g, a.artifact_id)} className="pgx-tile">
                    <ArtifactMedia artifact={a} />
                    <b>{a.label}</b>
                    <small>{a.status.replace('_', ' ')}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </GraphPanel>
        : null}
      </div>
    );
  }
  const rows = decisionsIn(g, VIEW_STATE[view]);
  return (
    <div className="pgx" data-testid="project-inbox" data-project={pid} data-view={view}>
      <header className="pgx-head">
        <small>INBOX · {g.project_name}</small>
        <h1>DECISIONS</h1>
        <p>Every item resolves to a real production node of this project. Counts are the lists below.</p>
      </header>
      <Lenses lenses={lenses} active={view} href={href} testId="project-inbox-lenses" />
      <GraphPanel title={lenses.find((l) => l.id === view)!.label} count={rows.length} testId={`project-inbox-${view}`}>
        {rows.length ?
          <ul className="pgx-rows">
            {rows.map((d) => (
              <DecisionRow key={d.item_id} item={d} graph={g} to={inboxItemHref(g, d.item_id)} actions={d.state === 'NEEDS_YOU'} />
            ))}
          </ul>
        : <IaEmpty title={view === 'needs-you' ? 'NOTHING NEEDS YOU' : `NOTHING ${view.toUpperCase()}`} body={`No ${view === 'all' ? '' : `${view.replace('-', ' ')} `}decision is recorded for ${g.project_name}.`} testId="project-inbox-empty" />}
      </GraphPanel>
    </div>
  );
}

/* ───────────────────────────────────────────── LIBRARY ───────────────────────────────────────────── */

const LIBRARY_LENSES: { id: ArtifactStatus | 'ALL'; label: string }[] = [
  { id: 'CANONICAL', label: 'CANONICAL' },
  { id: 'IN_REVIEW', label: 'IN REVIEW' },
  { id: 'REVISE', label: 'REVISE' },
  { id: 'SUPERSEDED', label: 'SUPERSEDED' },
  { id: 'REFERENCE', label: 'REFERENCE' },
  { id: 'MISSING', label: 'MISSING' },
  { id: 'ARCHIVE', label: 'ARCHIVE' },
  { id: 'ALL', label: 'ALL' },
];

export function ProjectLibraryBody() {
  const g = useProjectGraphData();
  const [params] = useSearchParams();
  if (!g) return null;
  const pid = g.project_id;
  const lenses = LIBRARY_LENSES.map((l) => ({ ...l, count: artifactsIn(g, l.id).length })).filter((l) => l.count > 0 || l.id === 'ALL');
  const raw = params.get('status') as ArtifactStatus | 'ALL' | null;
  const active = raw && lenses.some((l) => l.id === raw) ? raw : (lenses.find((l) => l.id === 'CANONICAL')?.id ?? 'ALL');
  const artifactId = params.get('artifact');
  const art = artifactId ? (g.artifacts.find((a) => a.artifact_id === artifactId) ?? null) : null;
  const href = (s: ArtifactStatus | 'ALL') => `${scopedTabHref('LIBRARY', pid)}&status=${s}`;
  if (artifactId) {
    const node = art ? nodeById(g, art.source_node_id) : null;
    return (
      <div className="pgx" data-testid="project-library" data-project={pid}>
        <Link to={href(active)} className="iax-viewall" data-testid="project-library-back">
          ← LIBRARY
        </Link>
        {art ?
          <GraphPanel title={art.label} testId="project-library-artifact" className="pgx-span">
            <ArtifactMedia artifact={art} className="pgx-preview" />
            <dl className="pgx-facts" data-testid="project-library-lineage">
              <dt>PROJECT</dt>
              <dd>{g.project_name}</dd>
              <dt>SOURCE NODE</dt>
              <dd>{node ? <Link to={activityNodeHref(g, node.node_id)}>{node.label}</Link> : '—'}</dd>
              <dt>TYPE</dt>
              <dd>{art.artifact_type.replace(/_/g, ' ')}</dd>
              <dt>STATUS</dt>
              <dd>{art.status.replace('_', ' ')}</dd>
              <dt>AUTHORITY</dt>
              <dd>{art.authority_status.replace(/_/g, ' ')}</dd>
              <dt>CREATED BY</dt>
              <dd>{art.created_by}</dd>
              <dt>DERIVED FROM</dt>
              <dd>{art.derived_from.length ? art.derived_from.join(' · ') : '—'}</dd>
              <dt>SUPERSEDES</dt>
              <dd>{art.supersedes.length ? art.supersedes.join(' · ') : '—'}</dd>
              <dt>SUPERSEDED BY</dt>
              <dd>{art.superseded_by ?? '—'}</dd>
              <dt>USED BY</dt>
              <dd>{art.used_by.length ? art.used_by.join(' · ') : '—'}</dd>
              <dt>VIEWPORT</dt>
              <dd>{art.viewport ?? '—'}</dd>
              <dt>ACTOR MODE</dt>
              <dd>{art.actor_mode ?? '—'}</dd>
              <dt>FILE</dt>
              <dd>{art.url ?? 'Recorded in source; not mounted in the web build'}</dd>
              <dt>SOURCE OF TRUTH</dt>
              <dd>{g.sources.find((s) => s.source_id === art.source_truth_id)?.label ?? art.source_truth_id}</dd>
            </dl>
          </GraphPanel>
        : <IaEmpty title="ARTIFACT NOT FOUND" body={`No artifact with this id is recorded for ${g.project_name}.`} testId="project-library-artifact-missing" />}
      </div>
    );
  }
  const rows = artifactsIn(g, active);
  return (
    <div className="pgx" data-testid="project-library" data-project={pid} data-status={active}>
      <header className="pgx-head">
        <small>LIBRARY · {g.project_name}</small>
        <h1>ARTIFACTS</h1>
        <p>Generated from the project&rsquo;s artifact records — authorities, assets and outputs with their lineage. Nothing is curated by hand.</p>
      </header>
      {g.artifacts.length ?
        <>
          <Lenses lenses={lenses} active={active} href={href} testId="project-library-lenses" />
          <GraphPanel title={lenses.find((l) => l.id === active)!.label} count={rows.length} testId="project-library-artifacts">
            <ul className="pgx-tiles">
              {rows.map((a) => (
                <li key={a.artifact_id}>
                  <Link to={libraryArtifactHref(g, a.artifact_id)} className="pgx-tile" data-testid="project-library-tile" data-project={a.project_id} data-status={a.status}>
                    <ArtifactMedia artifact={a} />
                    <b>{a.label}</b>
                    <small>
                      {a.artifact_type.replace(/_/g, ' ')} · {a.status.replace('_', ' ')}
                    </small>
                  </Link>
                </li>
              ))}
            </ul>
          </GraphPanel>
        </>
      : <IaEmpty title={`NO ARTIFACTS RECORDED FOR ${g.project_name}`} body="The library lists a project's own authorities, assets and outputs. None is recorded for this project yet — no other project's files are shown in its place." testId="project-library-empty" />}
    </div>
  );
}

/* ───────────────────────────────────────────── ACTIVITY ──────────────────────────────────────────── */

type ActivityView = 'all' | 'approvals' | 'updates' | 'decisions' | 'blockers';
const APPROVAL_EVENTS: readonly ProductionEventType[] = ['APPROVED', 'REVISED', 'REJECTED', 'PROMOTED_TO_AUTHORITY', 'RESOLVED', 'UNLOCKED'];
const DECISION_EVENTS: readonly ProductionEventType[] = ['DECIDED', 'RESOLVED'];

export function ProjectActivityBody() {
  const g = useProjectGraphData();
  const [params] = useSearchParams();
  if (!g) return null;
  const pid = g.project_id;
  const raw = params.get('view');
  const view: ActivityView = raw === 'approvals' || raw === 'updates' || raw === 'decisions' || raw === 'blockers' ? raw : 'all';
  const nodeId = params.get('node');
  const href = (v: ActivityView) => `${scopedTabHref('ACTIVITY', pid)}&view=${v}`;
  const blockers = projectBlockers(g);
  const byView: Record<Exclude<ActivityView, 'blockers'>, typeof g.events> = {
    all: g.events,
    approvals: g.events.filter((e) => APPROVAL_EVENTS.includes(e.event_type)),
    updates: g.events.filter((e) => !APPROVAL_EVENTS.includes(e.event_type) && !DECISION_EVENTS.includes(e.event_type)),
    decisions: g.events.filter((e) => DECISION_EVENTS.includes(e.event_type)),
  };
  const lenses = [
    { id: 'all' as const, label: 'ALL', count: byView.all.length },
    { id: 'approvals' as const, label: 'APPROVALS', count: byView.approvals.length },
    { id: 'updates' as const, label: 'UPDATES', count: byView.updates.length },
    { id: 'decisions' as const, label: 'DECISIONS', count: byView.decisions.length },
    { id: 'blockers' as const, label: 'BLOCKERS', count: blockers.length },
  ];
  if (nodeId) {
    const node = nodeById(g, nodeId);
    if (!node)
      return (
        <div className="pgx" data-testid="project-activity" data-project={pid}>
          <IaEmpty title="NODE NOT FOUND" body={`No production node with this id exists in ${g.project_name}.`} testId="project-activity-node-missing" />
        </div>
      );
    const events = g.events.filter((e) => e.node_id === node.node_id);
    const decisions = g.decisions.filter((d) => d.node_id === node.node_id);
    const children = g.nodes.filter((n) => n.parent_id === node.node_id);
    const arts = g.artifacts.filter((a) => a.source_node_id === node.node_id);
    return (
      <div className="pgx" data-testid="project-activity" data-project={pid} data-node={node.node_id}>
        <Link to={href(view)} className="iax-viewall" data-testid="project-activity-back">
          ← ACTIVITY
        </Link>
        <GraphPanel title={node.label} testId="project-activity-node" className="pgx-span">
          <dl className="pgx-facts">
            <dt>PROJECT</dt>
            <dd>{g.project_name}</dd>
            <dt>TYPE</dt>
            <dd>{node.node_type.replace(/_/g, ' ')}</dd>
            <dt>DOMAIN</dt>
            <dd>{node.domain}</dd>
            <dt>STAGE</dt>
            <dd>{STAGE_WORD(node.current_stage)}</dd>
            <dt>STATUS</dt>
            <dd>{node.status_detail}</dd>
            <dt>AUTHORITY</dt>
            <dd>{node.authority_status.replace(/_/g, ' ')}</dd>
            <dt>APPROVAL</dt>
            <dd>{node.approval_status.replace(/_/g, ' ')}</dd>
            <dt>IMPLEMENTATION</dt>
            <dd>{node.implementation_status.replace(/_/g, ' ')}</dd>
            <dt>QA</dt>
            <dd>{node.qa_status.replace(/_/g, ' ')}</dd>
            <dt>NEXT</dt>
            <dd>{node.next_required_action ?? '—'}</dd>
            <dt>SOURCE</dt>
            <dd>{node.source_truth_ids.map((id) => g.sources.find((s) => s.source_id === id)?.label ?? id).join(' · ')}</dd>
          </dl>
          {node.route ?
            <div className="pgx-actions">
              <Link to={node.route} className="iax-btn iax-btn--ghost" data-testid="project-activity-node-open">
                OPEN IN {node.domain}
              </Link>
            </div>
          : null}
        </GraphPanel>
        <div className="pgx-grid">
          <GraphPanel title="EVENTS" count={events.length} testId="project-activity-node-events">
            {events.length ?
              <ul className="pgx-rows">
                {events.map((e) => (
                  <EventRow key={e.event_id} event={e} graph={g} />
                ))}
              </ul>
            : <IaEmpty title="NO EVENTS RECORDED FOR THIS NODE" testId="project-activity-node-events-empty" />}
          </GraphPanel>
          <GraphPanel title="DECISIONS" count={decisions.length} testId="project-activity-node-decisions">
            {decisions.length ?
              <ul className="pgx-rows">
                {decisions.map((d) => (
                  <DecisionRow key={d.item_id} item={d} graph={g} to={inboxItemHref(g, d.item_id)} />
                ))}
              </ul>
            : <IaEmpty title="NO DECISION ON THIS NODE" testId="project-activity-node-decisions-empty" />}
          </GraphPanel>
          <GraphPanel title="BLOCKERS" count={node.blockers.length} testId="project-activity-node-blockers">
            {node.blockers.length ?
              <ul className="pgx-rows">
                {node.blockers.map((b) => (
                  <BlockerRow key={b.blocker_id} blocker={b} graph={g} />
                ))}
              </ul>
            : <IaEmpty title="NOT BLOCKED" testId="project-activity-node-blockers-empty" />}
          </GraphPanel>
          <GraphPanel title="CONNECTED NODES" count={children.length + node.upstream_nodes.length + node.downstream_nodes.length} testId="project-activity-node-connected">
            <ul className="pgx-rows">
              {[...node.upstream_nodes, ...children.map((c) => c.node_id), ...node.downstream_nodes]
                .filter((id, i, all) => all.indexOf(id) === i)
                .map((id) => nodeById(g, id))
                .filter((n): n is NonNullable<typeof n> => !!n)
                .slice(0, 24)
                .map((n) => (
                  <NodeRow key={n.node_id} node={n} graph={g} to={activityNodeHref(g, n.node_id)} />
                ))}
            </ul>
          </GraphPanel>
          {arts.length ?
            <GraphPanel title="ARTIFACTS" count={arts.length} testId="project-activity-node-artifacts" className="pgx-span">
              <ul className="pgx-tiles">
                {arts.slice(0, 12).map((a) => (
                  <li key={a.artifact_id}>
                    <Link to={libraryArtifactHref(g, a.artifact_id)} className="pgx-tile">
                      <ArtifactMedia artifact={a} />
                      <b>{a.label}</b>
                      <small>{a.status.replace('_', ' ')}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </GraphPanel>
          : null}
        </div>
      </div>
    );
  }
  return (
    <div className="pgx" data-testid="project-activity" data-project={pid} data-view={view}>
      <header className="pgx-head">
        <small>ACTIVITY · {g.project_name}</small>
        <h1>PRODUCTION EVENTS</h1>
        <p>Generated from dated source records, production requests and actions taken in this workspace — never filler.</p>
      </header>
      <Lenses lenses={lenses} active={view} href={href} testId="project-activity-lenses" />
      {view === 'blockers' ?
        <GraphPanel title="BLOCKED NODES" count={blockers.length} testId="project-activity-blockers">
          {blockers.length ?
            <ul className="pgx-rows">
              {blockers.map((b) => (
                <BlockerRow key={b.blocker_id} blocker={b} graph={g} />
              ))}
            </ul>
          : <IaEmpty title="NOTHING IS BLOCKED" testId="project-activity-blockers-empty" />}
        </GraphPanel>
      : <GraphPanel title={lenses.find((l) => l.id === view)!.label} count={byView[view].length} testId="project-activity-feed">
          {byView[view].length ?
            <ul className="pgx-rows">
              {byView[view].map((e) => (
                <EventRow key={e.event_id} event={e} graph={g} />
              ))}
            </ul>
          : <IaEmpty title={`NO EVENTS RECORDED FOR ${g.project_name} YET`} body="Events appear when a dated source record exists, a request is made, or an action is taken in this workspace." testId="project-activity-empty" />}
        </GraphPanel>
      }
      {view === 'all' && topLevelNodes(g).length ?
        <GraphPanel title="PRODUCTION NODES" count={topLevelNodes(g).length} testId="project-activity-nodes">
          <ul className="pgx-rows">
            {topLevelNodes(g).map((n) => (
              <NodeRow key={n.node_id} node={n} graph={g} to={activityNodeHref(g, n.node_id)} />
            ))}
          </ul>
        </GraphPanel>
      : null}
    </div>
  );
}
