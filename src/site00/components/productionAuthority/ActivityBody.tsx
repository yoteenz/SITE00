/**
 * ACTIVITY — living project memory (what changed, who, what was approved / blocked / released).
 * P0.STUDIOOS.PRODUCTION.INBOX-ACTIVITY.THREE-VIEWPORT-RECONSTRUCTION.OPUS1
 *
 * One route (/production/activity). Children are lenses held in the query string
 * (?view=approvals|updates|comments|blockers) and the milestone grandchild is ?milestone=<nodeId>.
 * Rows come from `buildActivityRows` (recorded activity + live production-graph state); the existing
 * workspace and range filters are preserved in the filter popover. ACTIVITY → APPROVALS is history;
 * INBOX → APPROVALS is where decisions are acted on — they share data, never a route.
 */
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { HubActivityCategory, HubNode, HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import { productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import type { HubData } from '../productionHub/useProductionHubData';
import { AUTHORITY_ASSETS } from './authorityAssets';
import { NODE_SUB } from './HubBody';
import { IaChip, IaEmpty, IaHero, IaIcon, IaLensBar, IaPanel, IaStats, type IaLens } from './iaKit';
import { agoLabel, Tabs, Thumb } from './primitives';

export type ActivityWorkspace = 'DESIGN' | 'EXPERIENCE' | 'EXPRESSION' | 'LIBRARY' | 'PEOPLE' | 'SYSTEM';
type Cat = 'ALL' | ActivityWorkspace;
type Range = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';

const BADGE: Record<HubActivityCategory, string> = {
  APPROVAL: 'APPROVED',
  RENDER: 'RENDERED',
  ASSET: 'ASSET',
  REQUEST: 'REQUESTED',
  OTHER: 'LOGGED',
};

const RANGE_MS: Record<Range, number> = {
  TODAY: 24 * 3600_000,
  WEEK: 7 * 24 * 3600_000,
  MONTH: 30 * 24 * 3600_000,
  ALL: Number.POSITIVE_INFINITY,
};

export type ActivityRow = {
  id: string;
  category: HubActivityCategory;
  workspace: ActivityWorkspace;
  badge: string;
  title: string;
  detail: string;
  at: string | null;
  actor: string | null;
  /** live art for the row (recorded asset slot, or the node's primary slot for graph-state rows) */
  slot: string | null;
  /** production node behind a graph-state row (milestone link) */
  nodeId: HubNodeId | null;
};

const WORKSPACE_KEYWORDS: readonly [ActivityWorkspace, RegExp][] = [
  ['DESIGN', /design|brand|surface|compiler|viewport/i],
  ['EXPERIENCE', /experience|world|zone|environment|simulation/i],
  ['LIBRARY', /library|asset|canon|vault/i],
  ['PEOPLE', /cast|people|character|actor/i],
  ['EXPRESSION', /expression|storyboard|scene|frame|render|trailer|campaign/i],
];

function workspaceFor(category: HubActivityCategory, text: string): ActivityWorkspace {
  if (category === 'ASSET') return 'LIBRARY';
  for (const [ws, re] of WORKSPACE_KEYWORDS) if (re.test(text)) return ws;
  return category === 'APPROVAL' || category === 'RENDER' ? 'EXPRESSION' : 'SYSTEM';
}

const NODE_BADGE: Record<string, string> = {
  COMPLETE: 'COMPLETE',
  ACTIVE: 'ACTIVE',
  REVIEW_REQUIRED: 'REVIEW',
  BLOCKED: 'BLOCKED',
  LOCKED: 'LOCKED',
  NOT_STARTED: 'PENDING',
};

/**
 * Recorded activity (approvals, requests) first; the current production-graph state follows as SYSTEM rows so
 * the log always reflects what the production is doing right now. Nothing here is authored.
 */
export function buildActivityRows(data: HubData | null): ActivityRow[] {
  if (!data) return [];
  const recorded: ActivityRow[] = data.activity.map((a) => ({
    id: a.id,
    category: a.category,
    workspace: workspaceFor(a.category, `${a.title} ${a.detail}`),
    badge: BADGE[a.category],
    title: a.title,
    detail: a.detail,
    at: a.at,
    actor: a.actor,
    slot: a.assetSlotId,
    nodeId: null,
  }));
  const label = data.production?.label ?? 'PRODUCTION';
  const state: ActivityRow[] = data.graph.nodes.map((n) => ({
    id: `state.${n.id}`,
    category: 'OTHER',
    workspace: /cast/i.test(n.id) ? 'PEOPLE' : 'EXPRESSION',
    badge: NODE_BADGE[n.status] ?? n.status,
    title: `${label} · ${n.label}`,
    detail: n.statusDetail,
    at: null,
    actor: 'SYSTEM',
    slot: n.assetSlotId,
    nodeId: n.id,
  }));
  return [...recorded, ...state];
}

export type ActivityLens = 'all' | 'approvals' | 'updates' | 'comments' | 'blockers';
export const ACTIVITY_LENSES: readonly ActivityLens[] = ['all', 'approvals', 'updates', 'comments', 'blockers'];
const LENS_LABEL: Record<ActivityLens, string> = { all: 'ALL', approvals: 'APPROVALS', updates: 'UPDATES', comments: 'COMMENTS', blockers: 'BLOCKERS' };
const ACTIVITY = '/production/activity';
export const activityHref = (lens: ActivityLens, milestone?: string) => {
  const q = new URLSearchParams();
  if (lens !== 'all') q.set('view', lens);
  if (milestone) q.set('milestone', milestone);
  const s = q.toString();
  return s ? `${ACTIVITY}?${s}` : ACTIVITY;
};

const SIDE = ['IDEAS', 'PEOPLE', 'ASSETS', 'REVIEWS', 'PRODUCTION', 'PROGRESS'];
const STATUS_TONE: Record<string, 'green' | 'red' | 'amber' | 'ink'> = { COMPLETE: 'green', BLOCKED: 'red', REVIEW: 'amber', ACTIVE: 'amber' };
const nodeTone = (s: HubNode['status']) => (s === 'COMPLETE' ? 'green' : s === 'BLOCKED' ? 'red' : s === 'REVIEW_REQUIRED' || s === 'ACTIVE' ? 'amber' : 'ink');

/** Blocker severity — derived from the live graph, documented in the proof (never authored):
 *  founder-gated node → CRITICAL · awaiting review → HIGH · locked behind upstream nodes → MEDIUM. */
export function blockerSeverity(node: HubNode, gateNode: HubNodeId | null): 'CRITICAL' | 'HIGH' | 'MEDIUM' {
  if (node.id === gateNode) return 'CRITICAL';
  if (node.status === 'REVIEW_REQUIRED' || node.status === 'BLOCKED') return 'HIGH';
  return 'MEDIUM';
}

export function ActivityBody() {
  const data = useProductionAuthorityData();
  const [params] = useSearchParams();
  const [cat, setCat] = useState<Cat>('ALL');
  const [range, setRange] = useState<Range>('ALL');
  const [search, setSearch] = useState('');
  const viewParam = params.get('view') as ActivityLens | null;
  const lens: ActivityLens = viewParam && ACTIVITY_LENSES.includes(viewParam) ? viewParam : 'all';
  const milestone = params.get('milestone') as HubNodeId | null;

  const all = useMemo(() => buildActivityRows(data), [data]);
  const rows = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();
    return all.filter(
      (a) =>
        (cat === 'ALL' || a.workspace === cat) &&
        (a.at === null ? range === 'ALL' || range === 'TODAY' : now - new Date(a.at).getTime() <= RANGE_MS[range]) &&
        (!q || `${a.title} ${a.detail}`.toLowerCase().includes(q)),
    );
  }, [all, cat, range, search]);

  const graph = data?.graph;
  const nodes = graph?.nodes ?? [];
  const slug = data?.project.projectId ?? 'ndxbook';
  const attention = data?.attention ?? [];
  const blockerNodes = nodes.filter((n) => (graph?.blockers ?? []).some((b) => b.toUpperCase().startsWith(`${n.label.toUpperCase()}:`)));
  const gateNode = graph?.founderGate.open ? graph.founderGate.nodeId : null;
  const reviewNodes = nodes.filter((n) => n.status === 'REVIEW_REQUIRED');
  const completeNodes = nodes.filter((n) => n.status === 'COMPLETE');

  const lenses: IaLens[] = ACTIVITY_LENSES.map((id) => ({ id, label: LENS_LABEL[id], to: activityHref(id) }));
  const filter = (
    <div className="iax-filterbody">
      <small>WORKSPACE</small>
      <Tabs
        ariaLabel="Activity category"
        testId="activity-category"
        active={cat}
        onChange={setCat}
        tabs={[
          { id: 'ALL', label: 'ALL' },
          { id: 'DESIGN', label: 'DESIGN' },
          { id: 'EXPERIENCE', label: 'EXPERIENCE' },
          { id: 'EXPRESSION', label: 'EXPRESSION' },
          { id: 'LIBRARY', label: 'LIBRARY' },
          { id: 'PEOPLE', label: 'PEOPLE' },
          { id: 'SYSTEM', label: 'SYSTEM' },
        ]}
      />
      <small>RANGE</small>
      <Tabs
        ariaLabel="Activity range"
        testId="activity-range"
        active={range}
        onChange={setRange}
        tabs={[
          { id: 'TODAY', label: 'TODAY' },
          { id: 'WEEK', label: 'THIS WEEK' },
          { id: 'MONTH', label: 'THIS MONTH' },
          { id: 'ALL', label: 'FULL HISTORY' },
        ]}
      />
    </div>
  );
  const placeholder =
    lens === 'approvals' ? 'SEARCH APPROVALS, ASSETS, OR PEOPLE…'
    : lens === 'updates' ? 'SEARCH UPDATES, ASSETS, PEOPLE, OR TAGS…'
    : lens === 'comments' ? 'SEARCH COMMENTS, PEOPLE, OR ASSETS…'
    : lens === 'blockers' ? 'SEARCH BLOCKERS, PEOPLE, ASSETS…'
    : 'SEARCH ACTIVITY…';
  const bar = <IaLensBar testId="activity-lenses" lenses={lenses} active={lens} search={search} onSearch={setSearch} placeholder={placeholder} filter={filter} />;

  if (milestone) {
    return (
      <div className="iax iax--activity iax--detail" data-testid="authority-activity" data-lens="milestone">
        <MilestoneDetail nodeId={milestone} />
      </div>
    );
  }

  const second = lens === 'approvals' ? 'APPROVALS' : lens === 'comments' ? 'COMMENTS' : undefined;
  const lines =
    lens === 'approvals' ? ['TRACK REVIEW CYCLES. SEE DECISIONS.', 'KEEP PRODUCTION MOVING.']
    : lens === 'comments' ? ['DISCUSS. GIVE FEEDBACK. RESOLVE FASTER.', 'COMMENTS TIED TO ASSETS, SCENES AND RELEASES.']
    : ['TRACK. COLLABORATE. KEEP THINGS MOVING.', 'A REAL-TIME VIEW OF PRODUCTION ACTIVITY ACROSS PEOPLE, ASSETS, REVIEWS AND RELEASES.'];
  const hero = <IaHero testId="activity-hero" kicker="" title="ACTIVITY" second={second} lines={lines} side={SIDE} plate={AUTHORITY_ASSETS.hubCrystal} />;

  const feedRow = (a: ActivityRow) => (
    <li key={a.id} data-testid="activity-row">
      <time>{a.at ? agoLabel(a.at) : 'NOW'}</time>
      <Thumb slotId={a.slot} url={data?.assetUrl(a.slot) ?? null} label="" className="iax-av" slot="ROW_THUMB" />
      <span className="iax-feed__text">
        <b>{a.title}</b>
        <small>
          {a.detail}
          {a.actor ? ` · ${a.actor.toUpperCase()}` : ''}
        </small>
      </span>
      <IaChip tone={STATUS_TONE[a.badge] ?? 'ink'}>{a.badge}</IaChip>
      {a.nodeId ?
        <Link to={activityHref(lens, a.nodeId)} className="iax-more" aria-label={`Open ${a.title}`}>
          <IaIcon name="next" />
        </Link>
      : <span className="iax-more" aria-hidden />}
    </li>
  );
  const feed = (list: ActivityRow[], testId = 'activity-log') =>
    list.length ? <ol className="iax-feed" data-testid={testId}>{list.map(feedRow)}</ol> : <IaEmpty testId="activity-empty" title="NOTHING RECORDED IN THIS VIEW YET" />;

  const milestones = (
    <IaPanel title="RECENT MILESTONES" action={{ to: activityHref('all', nodes[0]?.id) }} testId="activity-milestones">
      <ol className="iax-milestones">
        {nodes.map((n) => (
          <li key={n.id} data-status={n.status}>
            <Link to={activityHref(lens, n.id)} data-testid="activity-milestone-link">
              <i className={`iax-ms__mark iax-ms__mark--${nodeTone(n.status)}`} aria-hidden>
                {n.status === 'COMPLETE' ? <IaIcon name="check" /> : null}
              </i>
              <span>
                <b>{n.label}</b>
                <small>{n.statusDetail}</small>
              </span>
              <em>{n.status.replace(/_/g, ' ')}</em>
            </Link>
          </li>
        ))}
      </ol>
    </IaPanel>
  );

  /* ── COMMENTS: no comment data exists in Production — authored, honest unmounted shell ── */
  if (lens === 'comments') {
    const FILTERS = ['ALL COMMENTS', 'MENTIONS', 'ASSIGNED TO ME', 'NEEDS RESPONSE', 'MY COMMENTS', 'RESOLVED', 'BOOKMARKS'];
    return (
      <div className="iax iax--activity" data-testid="authority-activity" data-lens="comments">
        {hero}
        {bar}
        <div className="iax-comments">
          <IaPanel title="CONVERSATIONS" className="iax-comments__filters" testId="activity-comment-filters">
            <ul className="iax-filterlist">
              {FILTERS.map((f, i) => (
                <li key={f} className={i === 0 ? 'is-active' : undefined}>
                  <IaIcon name={i === 1 ? 'at' : i === 2 ? 'user' : i === 3 ? 'alert' : i === 5 ? 'check' : 'chat'} />
                  <span>{f}</span>
                  <em>0</em>
                </li>
              ))}
            </ul>
          </IaPanel>
          <section className="iax-panel iax-comments__list" data-testid="activity-comments">
            <IaEmpty unmounted testId="activity-comments-unmounted" title="COMMENTS ARE NOT CONNECTED" body="Comment threads on assets, scenes and releases will collect here. Production records decisions and state changes today — see APPROVALS and UPDATES." />
          </section>
        </div>
      </div>
    );
  }

  /* ── BLOCKERS ── */
  if (lens === 'blockers') {
    const q = search.trim().toLowerCase();
    const list = blockerNodes.filter((n) => !q || `${n.label} ${n.statusDetail}`.toLowerCase().includes(q));
    const deps = list.reduce((s, n) => s + n.dependsOn.length, 0);
    return (
      <div className="iax iax--activity" data-testid="authority-activity" data-lens="blockers">
        {hero}
        {bar}
        <IaStats
          testId="activity-stats"
          stats={[
            { icon: 'alert', value: blockerNodes.length, label: 'BLOCKED ITEMS', sub: 'HOLDING PRODUCTION' },
            { icon: 'clock', value: blockerNodes.filter((n) => n.status === 'REVIEW_REQUIRED').length, label: 'AWAITING REVIEW', sub: 'CAN MOVE ON A DECISION', tone: 'amber' },
            { icon: 'link', value: deps, label: 'DEPENDENCIES', sub: 'UPSTREAM LINKS', tone: 'green' },
            { icon: 'up', value: gateNode ? 1 : 0, label: 'ESCALATED', sub: gateNode ? 'FOUNDER GATE OPEN' : 'NONE', tone: 'ink' },
          ]}
        />
        <IaPanel title="BLOCKED ITEMS & DEPENDENCIES" count={list.length} testId="activity-blockers">
          {list.length ?
            <div className="iax-btable" role="table" aria-label="Blocked items">
              <div className="iax-btable__head" role="row">
                <span>SEVERITY</span>
                <span>ITEM / DESCRIPTION</span>
                <span>DEPENDS ON</span>
                <span>UNLOCKS</span>
                <span>STATUS</span>
                <span />
              </div>
              {list.map((n) => {
                const sev = blockerSeverity(n, gateNode);
                return (
                  <Link key={n.id} to={activityHref('blockers', n.id)} className={`iax-btable__row iax-sev--${sev.toLowerCase()}`} role="row" data-testid="activity-blocker-row">
                    <span className="iax-sev">
                      <IaIcon name="alert" />
                      <b>{sev}</b>
                    </span>
                    <span className="iax-bitem">
                      <Thumb slotId={n.assetSlotId} url={data?.assetUrl(n.assetSlotId) ?? null} label={n.label} slot="ROW_THUMB" />
                      <span>
                        <b>{n.label}</b>
                        <small>{n.statusDetail}</small>
                      </span>
                    </span>
                    <span className="iax-bdeps">
                      <IaIcon name="graph" />
                      {n.dependsOn.length ? n.dependsOn.map((d) => graph!.byId[d]?.label ?? d).join(', ') : '—'}
                    </span>
                    <span className="iax-bdeps">{n.unlocks.length ? n.unlocks.map((d) => graph!.byId[d]?.label ?? d).join(', ') : '—'}</span>
                    <IaChip tone={n.status === 'REVIEW_REQUIRED' ? 'amber' : 'red'}>{n.status === 'REVIEW_REQUIRED' ? 'AT RISK' : 'BLOCKED'}</IaChip>
                    <IaIcon name="next" className="iax-chev" />
                  </Link>
                );
              })}
            </div>
          : <IaEmpty testId="activity-empty" title="NOTHING IS BLOCKED" />}
        </IaPanel>
        {gateNode && graph ?
          <IaPanel title="ESCALATIONS" testId="activity-escalations">
            <ul className="iax-lines">
              <li>
                <b>{graph.founderGate.headline}</b>
                <small>{graph.founderGate.detail}</small>
                <Link to="/production/queue?view=approvals" className="iax-btn iax-btn--line">
                  OPEN IN INBOX
                </Link>
              </li>
            </ul>
          </IaPanel>
        : null}
      </div>
    );
  }

  /* ── APPROVALS (history / operational) ── */
  if (lens === 'approvals') {
    const approvalRows = rows.filter((r) => r.category === 'APPROVAL' || r.badge === 'REVIEW' || r.badge === 'COMPLETE');
    return (
      <div className="iax iax--activity" data-testid="authority-activity" data-lens="approvals">
        {hero}
        {bar}
        <IaStats
          testId="activity-stats"
          stats={[
            { icon: 'check', value: reviewNodes.length, label: 'PENDING REVIEW', sub: 'AWAITING YOUR DECISION', tone: 'amber' },
            { icon: 'check', value: completeNodes.length, label: 'APPROVED', sub: 'NODES COMPLETE', tone: 'green' },
            { icon: 'chat', value: all.filter((r) => r.category === 'APPROVAL').length, label: 'DECISIONS RECORDED', sub: 'IN ACTIVITY' },
            { icon: 'lock', value: blockerNodes.length, label: 'BLOCKED', sub: 'WAITING ON DECISIONS' },
          ]}
        />
        <div className="iax-grid iax-grid--split">
          <IaPanel title="APPROVAL ACTIVITY" testId="activity-approval-feed">
            {feed(approvalRows)}
          </IaPanel>
          <div className="iax-col">
            <IaPanel title="PENDING YOUR REVIEW" action={{ to: '/production/queue?view=approvals', label: 'OPEN INBOX' }} testId="activity-pending-review">
              {attention.length ?
                <ul className="iax-acards">
                  {attention.map((a) => (
                    <li key={a.id} className="iax-acard">
                      <Thumb slotId={a.assetSlotId} url={data?.assetUrl(a.assetSlotId) ?? null} label={a.title} slot="STRIP_THUMB" />
                      <span className="iax-acard__meta">
                        <b>{a.title}</b>
                        <small>
                          {a.subtitle} · {a.stateLabel}
                        </small>
                      </span>
                      <IaChip tone={a.priority === 'HIGH' ? 'red' : 'amber'}>{a.priority === 'HIGH' ? 'HIGH' : 'MED'}</IaChip>
                      <span className="iax-acard__actions">
                        <Link to={`/production/queue?view=approvals&item=${encodeURIComponent(a.id)}`} className="iax-btn iax-btn--line">
                          REVIEW
                        </Link>
                        <Link to={a.nodeId ? activityHref('approvals', a.nodeId) : activityHref('approvals')} className="iax-btn iax-btn--ghost">
                          OPEN
                        </Link>
                      </span>
                    </li>
                  ))}
                </ul>
              : <IaEmpty title="NOTHING PENDING YOUR REVIEW" />}
            </IaPanel>
            {milestones}
          </div>
        </div>
      </div>
    );
  }

  /* ── UPDATES ── */
  if (lens === 'updates') {
    const kind = (r: ActivityRow) => (r.category === 'ASSET' ? 'ASSET UPDATE' : r.category === 'RENDER' ? 'RENDERED' : r.category === 'REQUEST' ? 'REQUEST' : r.category === 'APPROVAL' ? 'DECISION' : 'STATE CHANGE');
    return (
      <div className="iax iax--activity" data-testid="authority-activity" data-lens="updates">
        {hero}
        {bar}
        <IaStats
          testId="activity-stats"
          stats={[
            { icon: 'cube', value: rows.length, label: 'TOTAL UPDATES', sub: 'IN THIS VIEW' },
            { icon: 'layers', value: all.filter((r) => r.category === 'ASSET' || r.category === 'RENDER').length, label: 'ASSET UPDATES', sub: 'RENDERS & ASSETS' },
            { icon: 'graph', value: all.filter((r) => r.nodeId).length, label: 'PIPELINE STATES', sub: 'LIVE GRAPH NODES' },
            { icon: 'link', value: all.filter((r) => r.category === 'REQUEST').length, label: 'REQUESTS', sub: 'RECORDED' },
          ]}
        />
        <div className="iax-grid iax-grid--split">
          <IaPanel title="UPDATES FEED" testId="activity-updates">
            {rows.length ?
              <ol className="iax-updates" data-testid="activity-log">
                {rows.map((a) => (
                  <li key={a.id} data-testid="activity-row">
                    <span className="iax-updates__head">
                      <IaChip tone={a.category === 'ASSET' || a.category === 'RENDER' ? 'blue' : STATUS_TONE[a.badge] ?? 'ink'}>{kind(a)}</IaChip>
                      <time>{a.at ? agoLabel(a.at) : 'NOW'}</time>
                    </span>
                    <b>{a.title}</b>
                    <small>{a.detail}</small>
                    <Thumb slotId={a.slot} url={data?.assetUrl(a.slot) ?? null} label="" className="iax-updates__art" slot="STRIP_THUMB" />
                    {a.nodeId ?
                      <Link to={activityHref('updates', a.nodeId)} className="iax-viewall">
                        OPEN MILESTONE <span aria-hidden>→</span>
                      </Link>
                    : null}
                  </li>
                ))}
              </ol>
            : <IaEmpty testId="activity-empty" title="NO UPDATES IN THIS VIEW" />}
          </IaPanel>
          <div className="iax-col">
            {milestones}
            <IaPanel title="RELATED LINKS" testId="activity-related">
              <ul className="iax-links">
                {nodes.map((n) => (
                  <li key={n.id}>
                    <Link to={productionExpressionPath(slug, NODE_SUB[n.id])}>
                      <Thumb slotId={n.assetSlotId} url={data?.assetUrl(n.assetSlotId) ?? null} label={n.label} slot="ROW_THUMB" />
                      <span>
                        <b>{n.label}</b>
                        <small>EXPRESSION / {NODE_SUB[n.id].toUpperCase()}</small>
                      </span>
                      <IaIcon name="next" />
                    </Link>
                  </li>
                ))}
              </ul>
            </IaPanel>
          </div>
        </div>
      </div>
    );
  }

  /* ── ALL (root) ── */
  const dayAgo = Date.now() - 24 * 3600_000;
  return (
    <div className="iax iax--activity" data-testid="authority-activity" data-lens="all">
      {hero}
      {bar}
      <IaStats
        testId="activity-stats"
        stats={[
          { icon: 'calendar', value: all.filter((r) => r.at === null || new Date(r.at).getTime() >= dayAgo).length, label: 'TODAY', sub: 'ACTIVITY ITEMS' },
          { icon: 'alert', value: attention.filter((a) => a.priority === 'HIGH').length, label: 'HIGH PRIORITY', sub: 'NEED ATTENTION' },
          { icon: 'check', value: reviewNodes.length, label: 'APPROVALS', sub: 'PENDING REVIEW', tone: 'green' },
          { icon: 'lock', value: blockerNodes.length, label: 'BLOCKED', sub: 'REQUIRE UNBLOCKS' },
        ]}
      />
      <div className="iax-grid iax-grid--split">
        <IaPanel title="ACTIVITY FEED" testId="activity-feed">
          {feed(rows)}
        </IaPanel>
        <div className="iax-col">
          {milestones}
          <IaPanel title="ATTENTION NEEDED" testId="activity-attention">
            <ul className="iax-attn">
              <li>
                <Link to="/production/queue?view=approvals">
                  <IaIcon name="alert" />
                  <span>
                    <b>
                      <em>{String(attention.length).padStart(2, '0')}</em> ITEMS AWAITING YOUR DECISION
                    </b>
                    <small>INBOX · APPROVALS</small>
                  </span>
                  <IaIcon name="next" />
                </Link>
              </li>
              <li>
                <Link to={activityHref('blockers')}>
                  <IaIcon name="lock" />
                  <span>
                    <b>
                      <em>{String(blockerNodes.length).padStart(2, '0')}</em> ITEMS ARE BLOCKED
                    </b>
                    <small>ACTION REQUIRED</small>
                  </span>
                  <IaIcon name="next" />
                </Link>
              </li>
              {gateNode && graph ?
                <li>
                  <Link to={activityHref('all', gateNode)}>
                    <IaIcon name="up" />
                    <span>
                      <b>{graph.founderGate.headline}</b>
                      <small>{graph.founderGate.detail}</small>
                    </span>
                    <IaIcon name="next" />
                  </Link>
                </li>
              : null}
            </ul>
          </IaPanel>
        </div>
      </div>
    </div>
  );
}

/* ── MILESTONE DETAIL (grandchild): a production-graph stage as a historical / project-state record ── */
type MsTab = 'overview' | 'timeline' | 'assets' | 'approvals' | 'blockers' | 'related';
function MilestoneDetail({ nodeId }: { nodeId: HubNodeId }) {
  const data = useProductionAuthorityData();
  const [tab, setTab] = useState<MsTab>('overview');
  const graph = data?.graph;
  const node = graph?.byId[nodeId] ?? null;
  const crumbs = (
    <nav className="iax-crumbs" aria-label="Breadcrumb">
      <Link to={ACTIVITY} className="iax-back" data-testid="activity-milestone-back">
        <IaIcon name="back" />
      </Link>
      <Link to={ACTIVITY}>ACTIVITY</Link>
      <IaIcon name="next" />
      <span>MILESTONES</span>
      <IaIcon name="next" />
      <b>{node?.label ?? nodeId.toUpperCase()}</b>
    </nav>
  );
  if (!node || !graph || !data)
    return (
      <>
        {crumbs}
        <IaEmpty testId="activity-milestone-missing" title="MILESTONE NOT FOUND" body="This production stage is not part of the current project graph." />
      </>
    );
  const slug = data.project.projectId;
  const order = graph.nodes.map((n) => n.id);
  const pos = order.indexOf(node.id);
  const depends = node.dependsOn.map((id) => graph.byId[id]).filter(Boolean);
  const unlocks = node.unlocks.map((id) => graph.byId[id]).filter(Boolean);
  const attention = data.attention.filter((a) => a.nodeId === node.id);
  const blocker = graph.blockers.find((b) => b.toUpperCase().startsWith(`${node.label.toUpperCase()}:`)) ?? null;
  const related = buildActivityRows(data).filter((r) => r.nodeId === node.id || r.title.toUpperCase().includes(node.label.toUpperCase()));
  const statusWord = node.status.replace(/_/g, ' ');
  const TABS: [MsTab, string, number | null][] = [
    ['overview', 'OVERVIEW', null],
    ['timeline', 'TIMELINE', null],
    ['assets', 'ASSETS', null],
    ['approvals', 'APPROVALS', attention.length],
    ['blockers', 'BLOCKERS', blocker ? 1 : 0],
    ['related', 'RELATED', depends.length + unlocks.length],
  ];
  const pipeline = (
    <IaPanel title="MILESTONE TIMELINE" testId="activity-milestone-timeline">
      <ol className="iax-mstl">
        {graph.nodes.map((n, i) => (
          <li key={n.id} className={n.id === node.id ? 'is-current' : i < pos ? 'is-before' : 'is-after'}>
            <i className={`iax-ms__mark iax-ms__mark--${nodeTone(n.status)}`} aria-hidden>
              {n.status === 'COMPLETE' ? <IaIcon name="check" /> : null}
            </i>
            <span>
              <b>{n.label}</b>
              <small>{n.status.replace(/_/g, ' ')}</small>
            </span>
          </li>
        ))}
      </ol>
    </IaPanel>
  );
  return (
    <div className="iax-detail iax-milestone" data-testid="activity-milestone-detail" data-node={node.id}>
      {crumbs}
      <header className="iax-ms__head">
        <Thumb slotId={node.assetSlotId} url={data.assetUrl(node.assetSlotId)} label={node.label} className="iax-ms__art" slot="FEATURE_MEDIA" />
        <div className="iax-ms__title">
          <IaChip tone="red">MILESTONE</IaChip>
          <h1>{node.label}</h1>
          <strong>{statusWord}</strong>
          <p>{node.statusDetail}</p>
        </div>
        <div className="iax-ms__status">
          <IaChip tone={nodeTone(node.status)}>{statusWord}</IaChip>
          <small>STAGE</small>
          <b>
            {pos + 1} / {order.length}
          </b>
          <Link to={productionExpressionPath(slug, NODE_SUB[node.id])} className="iax-btn iax-btn--line" data-testid="activity-milestone-open">
            VIEW IN PROJECT <IaIcon name="next" />
          </Link>
        </div>
      </header>
      <dl className="iax-ms__facts">
        <div>
          <dt>PROJECT</dt>
          <dd>{data.project.name.toUpperCase()}</dd>
        </div>
        <div>
          <dt>ENTRY</dt>
          <dd>{data.production?.label ?? '—'}</dd>
        </div>
        <div>
          <dt>TYPE</dt>
          <dd>PRODUCTION STAGE</dd>
        </div>
        <div>
          <dt>WORKSPACE</dt>
          <dd>EXPRESSION / {NODE_SUB[node.id].toUpperCase()}</dd>
        </div>
      </dl>
      <nav className="iax-tabs" aria-label="Milestone sections">
        {TABS.map(([id, label, count]) => (
          <button key={id} type="button" className={tab === id ? 'is-active' : undefined} aria-pressed={tab === id} onClick={() => setTab(id)} data-testid={`activity-milestone-tab-${id}`}>
            {label}
            {count ? <em>{count}</em> : null}
          </button>
        ))}
      </nav>
      <div className="iax-ms__grid" data-tab={tab}>
        {pipeline}
        <IaPanel title="DESCRIPTION" className="iax-ms__desc" testId="activity-milestone-description">
          <p>{node.statusDetail}.</p>
          {graph.founderGate.open && graph.founderGate.nodeId === node.id ? <p>{graph.founderGate.detail}</p> : null}
          <ul className="iax-tags">
            <li>{data.production?.label ?? 'PROJECT'}</li>
            <li>{NODE_SUB[node.id].toUpperCase()}</li>
            <li>{statusWord}</li>
          </ul>
        </IaPanel>
        <IaPanel title="NEXT ACTIONS" count={attention.length} className="iax-ms__next" testId="activity-milestone-next">
          {attention.length ?
            <ul className="iax-lines">
              {attention.map((a) => (
                <li key={a.id}>
                  <b>{a.title}</b>
                  <small>{a.why}</small>
                  <Link to={`/production/queue?view=approvals&item=${encodeURIComponent(a.id)}`} className="iax-btn iax-btn--line">
                    REVIEW
                  </Link>
                </li>
              ))}
            </ul>
          : <IaEmpty title="NO OPEN ACTIONS" />}
        </IaPanel>
        <IaPanel title="RELATED ASSETS" className="iax-ms__assets" testId="activity-milestone-assets">
          <ul className="iax-links">
            {[node, ...unlocks].map((n) => (
              <li key={n.id}>
                <Link to={productionExpressionPath(slug, NODE_SUB[n.id])}>
                  <Thumb slotId={n.assetSlotId} url={data.assetUrl(n.assetSlotId)} label={n.label} slot="ROW_THUMB" />
                  <span>
                    <b>{n.label}</b>
                    <small>PRIMARY ART · {n.status.replace(/_/g, ' ')}</small>
                  </span>
                  <IaIcon name="next" />
                </Link>
              </li>
            ))}
          </ul>
        </IaPanel>
        <IaPanel title="DEPENDENCIES" count={depends.length} className="iax-ms__deps" testId="activity-milestone-dependencies">
          {depends.length ?
            <ul className="iax-deps">
              {depends.map((n) => (
                <li key={n.id}>
                  <IaIcon name="layers" />
                  <b>{n.label}</b>
                  <IaChip tone={nodeTone(n.status)}>{n.status.replace(/_/g, ' ')}</IaChip>
                </li>
              ))}
            </ul>
          : <IaEmpty title="NO UPSTREAM DEPENDENCIES" />}
        </IaPanel>
        <IaPanel title="CONNECTED STAGES" count={unlocks.length} className="iax-ms__unlocks" testId="activity-milestone-unlocks">
          {unlocks.length ?
            <ul className="iax-deps">
              {unlocks.map((n) => (
                <li key={n.id}>
                  <IaIcon name="next" />
                  <Link to={activityHref('all', n.id)}>
                    <b>{n.label}</b>
                  </Link>
                  <IaChip tone={nodeTone(n.status)}>{n.status.replace(/_/g, ' ')}</IaChip>
                </li>
              ))}
            </ul>
          : <IaEmpty title="FINAL STAGE" />}
        </IaPanel>
        <IaPanel title="BLOCKERS" count={blocker ? 1 : 0} className="iax-ms__blockers" testId="activity-milestone-blockers">
          {blocker ? <p className="iax-blocktext">{blocker}</p> : <IaEmpty title="NOT BLOCKED" />}
        </IaPanel>
        <IaPanel title="ACTIVITY" count={related.length} className="iax-ms__activity" testId="activity-milestone-activity">
          {related.length ?
            <ul className="iax-lines">
              {related.map((r) => (
                <li key={r.id}>
                  <b>{r.title}</b>
                  <small>{r.detail}</small>
                  <IaChip tone={STATUS_TONE[r.badge] ?? 'ink'}>{r.badge}</IaChip>
                </li>
              ))}
            </ul>
          : <IaEmpty title="NO ACTIVITY RECORDED" />}
          <p className="iax-hint">Owners, contributors, release dates and comments are not connected to Production yet.</p>
        </IaPanel>
      </div>
    </div>
  );
}
