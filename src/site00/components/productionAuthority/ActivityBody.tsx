/**
 * ACTIVITY — living project memory (P0.STUDIOOS.PRODUCTION.ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1).
 *
 * One route (/production/activity) inside ProductionAuthorityFrame. One contained workspace between the global
 * Production host and bottom nav — the page never scrolls; only the event timeline (and a long inspector) scroll
 * inside their own panes.
 *   filters  — DOMAIN: ALL · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · PEOPLE · SYSTEM
 *              TIME:   TODAY · THIS WEEK · THIS MONTH · FULL HISTORY
 *              CHANGE (secondary metadata): CREATED … DEPLOYED
 *   timeline — what changed · who · when · version · area · affects → downstream
 *   inspector — the selected event: state before → after, project / entry / area, impact, cause, lineage, source
 * Desktop: filter rail | timeline | inspector. Tablet: filter band over timeline | inspector. Mobile: filter band
 * over the timeline pane; the inspector is a slide-up drawer inside the workspace.
 * Query state: ?domain= ?range= ?verb= ?event= ?milestone= (legacy ?view=blockers|approvals still resolves).
 */
import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { HubActivityCategory, HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import { productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import type { HubData } from '../productionHub/useProductionHubData';
import {
  ACTIVITY_DOMAINS,
  ACTIVITY_RANGES,
  ACTIVITY_VERBS,
  buildActivityMemory,
  causeChain,
  effectsOf,
  inRange,
  type ActivityDomain,
  type ActivityRange,
  type ActivityVerb,
  type MemoryEvent,
} from './activityLog';
import { NODE_SUB } from './HubBody';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { agoLabel, pad2 } from './primitives';
import '../../styles/site00-production-activity-memory.css';

export type ActivityWorkspace = 'DESIGN' | 'EXPERIENCE' | 'EXPRESSION' | 'LIBRARY' | 'PEOPLE' | 'SYSTEM';
const BADGE: Record<HubActivityCategory, string> = {
  APPROVAL: 'APPROVED',
  RENDER: 'RENDERED',
  ASSET: 'ASSET',
  REQUEST: 'REQUESTED',
  OTHER: 'LOGGED',
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


/* ── route state ───────────────────────────────────────────────────────────────────────────────────── */
const ACTIVITY = '/production/activity';
export type ActivityQuery = { domain: ActivityDomain; range: ActivityRange; verb: ActivityVerb | null; milestone: string | null; event: string | null };

/** href for an Activity state; ALL / TODAY are the defaults and stay out of the URL. */
export function activityHref(q: Partial<ActivityQuery> = {}): string {
  const p = new URLSearchParams();
  if (q.domain && q.domain !== 'ALL') p.set('domain', q.domain.toLowerCase());
  if (q.range && q.range !== 'today') p.set('range', q.range);
  if (q.verb) p.set('verb', q.verb.toLowerCase());
  if (q.milestone) p.set('milestone', q.milestone);
  if (q.event) p.set('event', q.event);
  const s = p.toString();
  return s ? `${ACTIVITY}?${s}` : ACTIVITY;
}

/** Read the route state. Legacy OPUS1 links (?view=blockers|approvals) map to the CHANGE filter. */
export function readActivityQuery(params: URLSearchParams, nodeIds: readonly string[] = []): ActivityQuery {
  const d = (params.get('domain') ?? '').toUpperCase();
  const domain: ActivityDomain = (ACTIVITY_DOMAINS as readonly string[]).includes(d) ? (d as ActivityDomain) : 'ALL';
  const legacy = params.get('view');
  // legacy lenses had no time window — they open on FULL HISTORY unless a range is given
  const r = params.get('range') ?? (legacy ? 'all' : '');
  const range: ActivityRange = ACTIVITY_RANGES.some((x) => x.id === r) ? (r as ActivityRange) : 'today';
  const v = (params.get('verb') ?? (legacy === 'blockers' ? 'blocked' : legacy === 'approvals' ? 'approved' : '')).toUpperCase();
  const verb = (ACTIVITY_VERBS as readonly string[]).includes(v) ? (v as ActivityVerb) : null;
  const m = params.get('milestone');
  return { domain, range, verb, milestone: m && nodeIds.includes(m) ? m : null, event: params.get('event') };
}

const when = (e: MemoryEvent) => (e.live ? 'NOW' : e.at ? agoLabel(e.at) : 'UNDATED');
const stamp = (e: MemoryEvent) => (e.live ? 'LIVE STATE · NOW' : e.at ? `${e.at.slice(0, 10)} ${e.at.slice(11, 16)} UTC · ${agoLabel(e.at)}` : 'UNDATED CANONICAL RECORD');

/* ── page ──────────────────────────────────────────────────────────────────────────────────────────── */
export function ActivityBody() {
  const data = useProductionAuthorityData();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = readActivityQuery(params, data?.graph.nodes.map((n) => n.id) ?? []);
  const events = useMemo(() => buildActivityMemory(data), [data]);
  const here = (patch: Partial<ActivityQuery>) => activityHref({ ...q, ...patch });

  // CHANGE + milestone narrow every view; domain and time are the primary filters
  const narrowed = events.filter((e) => (!q.verb || e.verb === q.verb) && (!q.milestone || e.nodeId === q.milestone));
  const scoped = narrowed.filter((e) => q.domain === 'ALL' || e.domain === q.domain);
  const shown = scoped.filter((e) => inRange(e, q.range));
  const domainCount = (d: ActivityDomain) => narrowed.filter((e) => (d === 'ALL' || e.domain === d) && inRange(e, q.range)).length;
  const rangeCount = (r: ActivityRange) => scoped.filter((e) => inRange(e, r)).length;
  const verbsPresent = ACTIVITY_VERBS.filter((v) => events.some((e) => e.verb === v));
  const selected = q.event ? (events.find((e) => e.id === q.event) ?? null) : null;
  const inspected = selected ?? shown[0] ?? null;
  const project = (data?.project.name ?? 'PROJECT').toUpperCase();
  const entry = data?.production?.label ?? null;
  const liveBlocked = events.filter((e) => e.live && e.verb === 'BLOCKED').length;
  const wider = ACTIVITY_RANGES.filter((r) => r.id !== q.range && rangeCount(r.id) > 0);

  return (
    <div
      className="amx"
      data-testid="authority-activity"
      data-domain={q.domain}
      data-range={q.range}
      data-verb={q.verb ?? undefined}
      data-open={selected ? 'event' : undefined}
    >
      <div className="amx-rail" data-testid="activity-filters">
        <header className="amx-head" data-testid="activity-head">
          <h1>ACTIVITY</h1>
          <small>
            LIVING PROJECT MEMORY · {project}
            {entry ? ` · ${entry}` : ''}
          </small>
        </header>
        <dl className="amx-counters" data-testid="activity-counters">
          <div>
            <dt>IN VIEW</dt>
            <dd>{pad2(shown.length)}</dd>
          </div>
          <div className={liveBlocked ? 'is-alert' : undefined}>
            <dt>BLOCKED NOW</dt>
            <dd>{pad2(liveBlocked)}</dd>
          </div>
        </dl>
        <nav className="amx-domains" aria-label="Activity domain" data-testid="activity-domains">
          <small className="amx-label">DOMAIN</small>
          {ACTIVITY_DOMAINS.map((d) => (
            <Link key={d} to={here({ domain: d, event: null })} replace className={d === q.domain ? 'is-active' : undefined} aria-current={d === q.domain ? 'page' : undefined} data-testid={`activity-domain-${d.toLowerCase()}`}>
              <span>{d}</span>
              <em>{pad2(domainCount(d))}</em>
            </Link>
          ))}
        </nav>
        <nav className="amx-ranges" aria-label="Activity time" data-testid="activity-ranges">
          <small className="amx-label">TIME</small>
          {ACTIVITY_RANGES.map((r) => (
            <Link key={r.id} to={here({ range: r.id, event: null })} replace className={r.id === q.range ? 'is-active' : undefined} aria-current={r.id === q.range ? 'page' : undefined} data-testid={`activity-range-${r.id}`}>
              <span>{r.label}</span>
              <em>{pad2(rangeCount(r.id))}</em>
            </Link>
          ))}
        </nav>
        <label className="amx-change" data-testid="activity-change">
          <small className="amx-label">CHANGE</small>
          <select value={q.verb ?? ''} onChange={(ev) => navigate(here({ verb: (ev.target.value || null) as ActivityVerb | null, event: null }), { replace: true })} data-testid="activity-change-select">
            <option value="">ALL CHANGES</option>
            {verbsPresent.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        {q.milestone ?
          <Link to={here({ milestone: null, event: null })} replace className="amx-chip" data-testid="activity-filter-milestone">
            {data?.graph.byId[q.milestone as HubNodeId]?.label ?? q.milestone} <span aria-hidden>×</span>
          </Link>
        : null}
      </div>

      <section className="amx-timeline" aria-label="Project memory" data-testid="activity-timeline-pane">
        <header className="amx-timeline__head">
          <b>PROJECT MEMORY</b>
          <small>
            {pad2(shown.length)} EVENTS · {q.domain} · {ACTIVITY_RANGES.find((r) => r.id === q.range)!.label}
            {q.verb ? ` · ${q.verb}` : ''}
          </small>
        </header>
        {shown.length ?
          <ol className="amx-events" data-scroll="internal" data-testid="activity-timeline">
            {shown.map((e) => (
              <li key={e.id} data-testid="activity-event" data-verb={e.verb} data-domain={e.domain} data-source={e.source} data-selected={inspected?.id === e.id ? 'true' : undefined}>
                <Link to={here({ event: e.id })} replace className="amx-row" aria-current={selected?.id === e.id ? 'true' : undefined} data-testid="activity-event-open">
                  <i className="amx-node" aria-hidden />
                  <time dateTime={e.at ?? undefined}>{when(e)}</time>
                  <span className={`amx-verb amx-verb--${e.verb.toLowerCase()}`} data-testid="activity-verb">
                    {e.verb}
                  </span>
                  <span className="amx-row__body">
                    <b>{e.subject}</b>
                    <small>
                      {[e.entry, e.area, e.version].filter(Boolean).join(' · ')}
                      {e.entry || e.area || e.version ? ' · ' : ''}BY {e.by}
                    </small>
                    {e.affects.length || e.downstream.length ?
                      <small className="amx-impact">
                        {e.affects.length ? `AFFECTS → ${e.affects.join(' · ')}` : ''}
                        {e.affects.length && e.downstream.length ? '   ' : ''}
                        {e.downstream.length ? `DOWNSTREAM → ${e.downstream.join(' · ')}` : ''}
                      </small>
                    : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        : <div className="amx-empty" data-testid="activity-empty">
            <b>
              NO {q.verb ? `${q.verb} ` : ''}ACTIVITY · {ACTIVITY_RANGES.find((r) => r.id === q.range)!.label}
            </b>
            {wider.length ?
              <span>
                {wider.map((r) => (
                  <Link key={r.id} to={here({ range: r.id, event: null })} replace data-testid={`activity-empty-${r.id}`}>
                    {r.label} · {rangeCount(r.id)}
                  </Link>
                ))}
              </span>
            : <span>NOTHING RECORDED FOR THIS DOMAIN YET.</span>}
          </div>
        }
      </section>

      {selected ?
        <Link to={here({ event: null })} replace className="amx-scrim" aria-label="Close event" data-testid="activity-inspector-scrim" />
      : null}
      <aside className="amx-inspector" aria-label="Selected event" data-testid="activity-inspector" data-state={selected ? 'selected' : inspected ? 'default' : 'empty'}>
        {inspected ?
          <Inspector e={inspected} events={events} here={here} slug={data?.project.projectId ?? 'ndxbook'} closable={!!selected} />
        : <div className="amx-empty">
            <b>NO EVENT SELECTED</b>
            <span>CHOOSE AN EVENT IN THE TIMELINE.</span>
          </div>
        }
      </aside>
    </div>
  );
}

function Inspector({ e, events, here, slug, closable }: { e: MemoryEvent; events: MemoryEvent[]; here: (p: Partial<ActivityQuery>) => string; slug: string; closable: boolean }) {
  const causes = causeChain(events, e);
  const effects = effectsOf(events, e.id);
  const sourceHref = e.nodeId ? productionExpressionPath(slug, NODE_SUB[e.nodeId]) : null;
  const rows: [string, string | null][] = [
    ['WHEN', stamp(e)],
    ['BY', e.by],
    ['PROJECT', e.project],
    ['ENTRY', e.entry],
    ['AREA', e.area ? `${e.area} · ${e.domain}` : e.domain],
    ['VERSION', e.version],
    ['STATE', e.prior || e.result ? `${e.prior ?? '—'} → ${e.result ?? '—'}` : null],
    ['AFFECTS', e.affects.length ? e.affects.join(' · ') : null],
    ['DOWNSTREAM', e.downstream.length ? e.downstream.join(' · ') : null],
    ['CAUSE', e.cause],
    ['DETAIL', e.detail],
  ];
  return (
    <div className="amx-insp" data-testid="activity-inspector-body" data-event={e.id}>
      <header className="amx-insp__head">
        <span className={`amx-verb amx-verb--${e.verb.toLowerCase()}`}>{e.verb}</span>
        <h2>{e.subject}</h2>
        {closable ?
          <Link to={here({ event: null })} replace className="amx-close" aria-label="Close" data-testid="activity-inspector-close">
            ×
          </Link>
        : null}
      </header>
      <div className="amx-insp__scroll" data-scroll="internal">
        <dl className="amx-facts">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
        <div className="amx-lineage" data-testid="activity-lineage">
          <div>
            <small>BEFORE · CAUSED BY</small>
            {causes.length ?
              causes.map((c) => (
                <Link key={c.id} to={here({ event: c.id, range: 'all' })} replace>
                  {c.verb} · {c.subject}
                </Link>
              ))
            : <span>{e.cause ?? 'ORIGIN EVENT'}</span>}
          </div>
          <div>
            <small>AFTER · LED TO</small>
            {effects.length ?
              effects.map((c) => (
                <Link key={c.id} to={here({ event: c.id, range: 'all' })} replace>
                  {c.verb} · {c.subject}
                </Link>
              ))
            : <span>NO RECORDED DOWNSTREAM EVENT</span>}
          </div>
        </div>
      </div>
      {sourceHref ?
        <Link to={sourceHref} className="amx-source" data-testid="activity-open-source">
          OPEN {e.area ?? 'SOURCE'} <span aria-hidden>→</span>
        </Link>
      : null}
    </div>
  );
}
