import { useMemo, useState } from 'react';
import type { HubActivityCategory } from '../../../../shared/site00-production-hub/index.js';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import type { HubData } from '../productionHub/useProductionHubData';
import { AuthorityHero, LiveStatusBar } from './HubBody';
import { agoLabel, Tabs } from './primitives';

type Cat = 'ALL' | HubActivityCategory;
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
  badge: string;
  title: string;
  detail: string;
  at: string | null;
  actor: string | null;
};

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
    badge: BADGE[a.category],
    title: a.title,
    detail: a.detail,
    at: a.at,
    actor: a.actor,
  }));
  const label = data.production?.label ?? 'PRODUCTION';
  const state: ActivityRow[] = data.graph.nodes.map((n) => ({
    id: `state.${n.id}`,
    category: 'OTHER',
    badge: NODE_BADGE[n.status] ?? n.status,
    title: `${label} · ${n.label}`,
    detail: n.statusDetail,
    at: null,
    actor: 'SYSTEM',
  }));
  return [...recorded, ...state];
}

export function ActivityBody() {
  const data = useProductionAuthorityData();
  const [cat, setCat] = useState<Cat>('ALL');
  const [range, setRange] = useState<Range>('ALL');
  const rows = useMemo(() => {
    const now = Date.now();
    return buildActivityRows(data).filter(
      (a) => (cat === 'ALL' || a.category === cat) && (a.at === null ? range === 'ALL' || range === 'TODAY' : now - new Date(a.at).getTime() <= RANGE_MS[range]),
    );
  }, [data, cat, range]);
  const project = data?.project;
  return (
    <div className="pxa-activity" data-testid="authority-activity">
      <AuthorityHero
        kicker="PROJECT"
        title={(project?.name ?? 'NDXBOOK').toUpperCase()}
        sub={`${data?.production?.label ?? ''} · A CLEAR ROUTE FOR EVERY PERSON`}
        side={['IDEAS', 'PEOPLE', 'WORLDS', 'IN MOTION']}
        testId="activity-hero"
      />
      <LiveStatusBar />
      <section className="pxa-card pxa-log" data-testid="activity-log">
        <header className="pxa-log__head">
          <h2>ACTIVITY LOG</h2>
        </header>
        <div className="pxa-log__filters">
          <Tabs
            ariaLabel="Activity category"
            testId="activity-category"
            active={cat}
            onChange={setCat}
            tabs={[
              { id: 'ALL', label: 'ALL' },
              { id: 'APPROVAL', label: 'APPROVALS' },
              { id: 'RENDER', label: 'RENDERS' },
              { id: 'ASSET', label: 'ASSETS' },
              { id: 'REQUEST', label: 'REQUESTS' },
              { id: 'OTHER', label: 'SYSTEM' },
            ]}
          />
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
        {rows.length ?
          <ol className="pxa-timeline">
            {rows.map((a) => (
              <li key={a.id} data-testid="activity-row">
                <i aria-hidden />
                <span className={`pxa-pill${a.badge === 'BLOCKED' ? '' : a.badge === 'COMPLETE' ? ' pxa-pill--ok' : a.badge === 'REVIEW' || a.badge === 'ACTIVE' ? ' pxa-pill--warn' : ' pxa-pill--idle'}`}>{a.badge}</span>
                <span className="pxa-timeline__text">
                  <b>{a.title}</b>
                  <small>{a.detail}{a.actor ? ` · ${a.actor.toUpperCase()}` : ''}</small>
                </span>
                <time>{a.at ? agoLabel(a.at) : 'NOW'}</time>
              </li>
            ))}
          </ol>
        : <p className="pxa-empty" data-testid="activity-empty">NOTHING RECORDED IN THIS VIEW YET.</p>}
      </section>
    </div>
  );
}
