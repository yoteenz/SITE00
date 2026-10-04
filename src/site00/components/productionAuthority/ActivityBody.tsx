/**
 * ACTIVITY — production memory as an ACTIVITY LOG (P0.PRODUCTION.INBOX-ACTIVITY.AUTHORITY-CONVERGENCE2).
 * Authority: production parent three-view pack, ACTIVITY board (ACTIVITY LOG family).
 *
 * One route (/production/activity) inside ProductionAuthorityFrame. HUB project band (hero + live status)
 * → ACTIVITY LOG: domain tabs (ALL · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · PEOPLE · SYSTEM), range tabs
 * (TODAY · THIS WEEK · THIS MONTH · FULL HISTORY), and a lineage timeline of VERB · SUBJECT · version · actor ·
 * downstream · cause. Query state: ?domain= ?range= ?verb= ?event= (legacy ?view=blockers|approvals and
 * ?milestone=<node> still resolve). Events come from activityLog.ts — nothing is authored here.
 */
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { HubActivityCategory, HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import type { HubData } from '../productionHub/useProductionHubData';
import {
  ACTIVITY_DOMAINS,
  ACTIVITY_RANGES,
  ACTIVITY_VERBS,
  buildActivityLog,
  causeChain,
  effectsOf,
  inRange,
  type ActivityDomain,
  type ActivityRange,
  type ActivityVerb,
  type LogEvent,
} from './activityLog';
import { ProjectHeroBand } from './HubBody';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { agoLabel } from './primitives';
import '../../styles/site00-production-hub-reconstruction.css';
import '../../styles/site00-production-activity-log.css';

const BADGE: Record<HubActivityCategory, string> = {
  APPROVAL: 'APPROVED',
  RENDER: 'RENDERED',
  ASSET: 'ASSET',
  REQUEST: 'REQUESTED',
  OTHER: 'LOGGED',
};

export type ActivityWorkspace = 'DESIGN' | 'EXPERIENCE' | 'EXPRESSION' | 'LIBRARY' | 'PEOPLE' | 'SYSTEM';
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


/* ── ACTIVITY LOG ──────────────────────────────────────────────────────────────────────────────────── */
const ACTIVITY = '/production/activity';
type LogQuery = { domain?: ActivityDomain; range?: ActivityRange; verb?: ActivityVerb | null; event?: string | null; milestone?: string | null };

/** href for an Activity Log state; ALL / TODAY are the defaults and stay out of the URL. */
export function activityHref(q: LogQuery = {}): string {
  const p = new URLSearchParams();
  if (q.domain && q.domain !== 'ALL') p.set('domain', q.domain.toLowerCase());
  if (q.range && q.range !== 'today') p.set('range', q.range);
  if (q.verb) p.set('verb', q.verb.toLowerCase());
  if (q.milestone) p.set('milestone', q.milestone);
  if (q.event) p.set('event', q.event);
  const s = p.toString();
  return s ? `${ACTIVITY}?${s}` : ACTIVITY;
}

export function readLogQuery(params: URLSearchParams, nodeIds: readonly string[] = []) {
  const d = (params.get('domain') ?? '').toUpperCase();
  const domain: ActivityDomain = (ACTIVITY_DOMAINS as readonly string[]).includes(d) ? (d as ActivityDomain) : 'ALL';
  const r = params.get('range') ?? '';
  const range: ActivityRange = ACTIVITY_RANGES.some((x) => x.id === r) ? (r as ActivityRange) : 'today';
  const legacy = params.get('view');
  const v = (params.get('verb') ?? (legacy === 'blockers' ? 'blocked' : legacy === 'approvals' ? 'approved' : '')).toUpperCase();
  const verb = (ACTIVITY_VERBS as readonly string[]).includes(v) ? (v as ActivityVerb) : null;
  const m = params.get('milestone');
  const milestone = m && nodeIds.includes(m) ? m : null;
  return { domain, range, verb, milestone, event: params.get('event') };
}

const timeLabel = (e: LogEvent) => (e.live ? 'NOW' : e.at ? agoLabel(e.at) : 'UNDATED');

export function ActivityBody() {
  const data = useProductionAuthorityData();
  const [params] = useSearchParams();
  const q = readLogQuery(params, data?.graph.nodes.map((n) => n.id) ?? []);
  const events = useMemo(() => buildActivityLog(data), [data]);
  // milestone / verb narrow every range: a deep link to "what is blocked" must not hide behind TODAY
  const base = events.filter((e) => (q.domain === 'ALL' || e.domain === q.domain) && (!q.verb || e.verb === q.verb) && (!q.milestone || e.nodeId === q.milestone));
  const shown = base.filter((e) => inRange(e, q.range));
  const here = (patch: LogQuery) => activityHref({ domain: q.domain, range: q.range, verb: q.verb, milestone: q.milestone, ...patch });
  const wider = ACTIVITY_RANGES.filter((r) => r.id !== q.range).map((r) => ({ ...r, n: base.filter((e) => inRange(e, r.id)).length })).filter((r) => r.n > 0);

  return (
    <div className="actx hubx" data-testid="authority-activity" data-domain={q.domain} data-range={q.range} data-verb={q.verb ?? undefined}>
      {data ? <ProjectHeroBand data={data} /> : null}
      <section className="actx-log" data-testid="activity-log">
        <header className="actx-log__head">
          <h1>ACTIVITY LOG</h1>
          <nav className="actx-tabs actx-tabs--domain" aria-label="Activity domain" data-testid="activity-domains">
            {ACTIVITY_DOMAINS.map((d) => (
              <Link key={d} to={here({ domain: d, event: null })} replace className={d === q.domain ? 'is-active' : undefined} aria-current={d === q.domain ? 'page' : undefined} data-testid={`activity-domain-${d.toLowerCase()}`}>
                {d}
              </Link>
            ))}
          </nav>
          <nav className="actx-tabs actx-tabs--range" aria-label="Activity range" data-testid="activity-ranges">
            {ACTIVITY_RANGES.map((r) => (
              <Link key={r.id} to={here({ range: r.id, event: null })} replace className={r.id === q.range ? 'is-active' : undefined} aria-current={r.id === q.range ? 'page' : undefined} data-testid={`activity-range-${r.id}`}>
                {r.label}
              </Link>
            ))}
          </nav>
        </header>
        {q.verb || q.milestone ?
          <p className="actx-filter" data-testid="activity-filter">
            FILTER
            {q.verb ?
              <Link to={here({ verb: null, event: null })} replace data-testid="activity-filter-verb">
                {q.verb} <span aria-hidden>×</span>
              </Link>
            : null}
            {q.milestone ?
              <Link to={here({ milestone: null, event: null })} replace data-testid="activity-filter-milestone">
                {data?.graph.byId[q.milestone as HubNodeId]?.label ?? q.milestone} <span aria-hidden>×</span>
              </Link>
            : null}
          </p>
        : null}
        {shown.length ?
          <ol className="actx-timeline" data-scroll="internal" data-testid="activity-timeline">
            {shown.map((e) => (
              <EventRow key={e.id} e={e} events={events} open={q.event === e.id} href={here} />
            ))}
          </ol>
        : <div className="actx-empty" data-testid="activity-empty">
            <b>NO {q.verb ? `${q.verb} ` : ''}ACTIVITY {ACTIVITY_RANGES.find((r) => r.id === q.range)!.label}</b>
            {wider.length ?
              <span>
                {wider.map((r) => (
                  <Link key={r.id} to={here({ range: r.id, event: null })} replace data-testid={`activity-empty-${r.id}`}>
                    {r.label} · {r.n}
                  </Link>
                ))}
              </span>
            : <span>NOTHING RECORDED FOR THIS DOMAIN YET.</span>}
          </div>
        }
      </section>
    </div>
  );
}

function EventRow({ e, events, open, href }: { e: LogEvent; events: LogEvent[]; open: boolean; href: (p: LogQuery) => string }) {
  const causes = open ? causeChain(events, e) : [];
  const effects = open ? effectsOf(events, e.id) : [];
  return (
    <li className={`actx-event${open ? ' is-open' : ''}`} data-verb={e.verb} data-domain={e.domain} data-source={e.source} id={e.id} data-testid="activity-event">
      <i className="actx-node" aria-hidden />
      <span className={`actx-verb actx-verb--${e.verb.toLowerCase()}`} data-testid="activity-verb">
        {e.verb}
      </span>
      <Link to={href({ event: open ? null : e.id })} replace className="actx-event__body" aria-expanded={open} data-testid="activity-event-open">
        <b>{e.subject}</b>
        {e.version ? <small>{e.version}</small> : null}
        <small>By: {e.by}</small>
        {e.affects ? <small>{e.affects}</small> : null}
        {e.cause ? <small className="actx-cause">Cause: {e.cause}</small> : null}
      </Link>
      <time className="actx-time" dateTime={e.at ?? undefined}>
        {timeLabel(e)}
      </time>
      {open ?
        <div className="actx-lineage" data-testid="activity-lineage">
          <div>
            <small>CAUSED BY</small>
            {causes.length ?
              causes.map((c) => (
                <Link key={c.id} to={href({ event: c.id, range: 'all' })} replace>
                  {c.verb} · {c.subject}
                </Link>
              ))
            : <span>{e.cause ?? 'ORIGIN EVENT'}</span>}
          </div>
          <div>
            <small>LED TO</small>
            {effects.length ?
              effects.map((c) => (
                <Link key={c.id} to={href({ event: c.id, range: 'all' })} replace>
                  {c.verb} · {c.subject}
                </Link>
              ))
            : <span>{e.affects ?? 'NO RECORDED DOWNSTREAM EVENT'}</span>}
          </div>
        </div>
      : null}
    </li>
  );
}
