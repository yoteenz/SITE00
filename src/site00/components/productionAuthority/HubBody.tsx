import { Link } from 'react-router-dom';
import { HUB_ATMOSPHERE_SLOT_ID, type HubNode, type HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import { productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import { HubImage } from '../productionHub/HubImage';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { buildActivityRows } from './ActivityBody';
import { agoLabel, Dot, Donut, pad2, Priority, Sec, StatusCell, Thumb } from './primitives';

export const NODE_SUB: Record<HubNodeId, string> = {
  narrative: 'narrative',
  cast: 'casting',
  look: 'wardrobe',
  performance: 'performance',
  set: 'sets',
  storyboard: 'storyboard',
  keyframes: 'storyboard',
};

const STATUS_WORD: Record<HubNode['status'], string> = {
  COMPLETE: 'COMPLETE',
  ACTIVE: 'ACTIVE',
  REVIEW_REQUIRED: 'REVIEW',
  BLOCKED: 'BLOCKED',
  LOCKED: 'LOCKED',
  NOT_STARTED: 'NOT STARTED',
};

/** Bar fill is a visual reading of the real node status — it is never stored or authored. */
const STATUS_FILL: Record<HubNode['status'], number> = {
  COMPLETE: 100,
  REVIEW_REQUIRED: 85,
  ACTIVE: 55,
  BLOCKED: 30,
  LOCKED: 0,
  NOT_STARTED: 0,
};

/** Atmosphere hero with the project lockup. Used by HUB, ACTIVITY and EXPRESSION. */
export function AuthorityHero({
  kicker,
  title,
  sub,
  side,
  slotId = HUB_ATMOSPHERE_SLOT_ID,
  plate,
  testId = 'authority-hero',
  children,
}: {
  kicker: string;
  title: string;
  sub?: string;
  side?: string[];
  slotId?: string;
  plate?: string;
  testId?: string;
  children?: React.ReactNode;
}) {
  const data = useProductionAuthorityData();
  const url = data ? data.assetUrl(slotId) : null;
  return (
    <div className="pxa-hero" data-testid={testId}>
      {plate ?
        <span className="pxa-hero__bg" style={{ backgroundImage: `url(${plate})` }} aria-hidden />
      : (
        <span className="pxa-hero__bg" aria-hidden>
          <HubImage slotId={slotId} url={url} label="CHAMBER ATMOSPHERE" />
        </span>
      )}
      <span className="pxa-hero__wash" aria-hidden />
      <div className="pxa-hero__copy">
        <i aria-hidden />
        <small>{kicker}</small>
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
        {children}
      </div>
      {side ?
        <ul className="pxa-hero__side" aria-hidden>
          {side.map((s) => (
            <li key={s}>{s}</li>
          ))}
          <li className="pxa-hero__tick" />
        </ul>
      : null}
    </div>
  );
}

export function LiveStatusBar({ expressionMode = false }: { expressionMode?: boolean }) {
  const data = useProductionAuthorityData();
  if (!data) return null;
  const { graph, attention, activity, production, scenes } = data;
  const last = activity[0]?.at ?? null;
  const active = graph.activeNodeId ? graph.byId[graph.activeNodeId] : null;
  const blockers = graph.blockers.length;
  return (
    <div className="pxa-status" data-testid="authority-status-bar">
      <StatusCell tone="live">
        <Dot tone={expressionMode ? 'red' : 'green'} />
        <span>
          <b>{data.hasProduction ? 'IN PRODUCTION' : 'NO PRODUCTION'}</b>
          <small>UPDATED {agoLabel(last)}</small>
        </span>
      </StatusCell>
      <StatusCell tone="alert">
        <b className="pxa-red pxa-num">{pad2(attention.length)}</b>
        <span>
          <b>ITEMS NEED YOU</b>
          <Link to="/production/queue">VIEW NOW →</Link>
        </span>
      </StatusCell>
      <StatusCell>
        <span>
          <b>{expressionMode ? 'EXPRESSION' : (production?.label ?? 'NO ENTRY')}</b>
          <small>{expressionMode ? 'PRODUCTION FLOOR · 6 DEPARTMENTS' : `ACTIVE ENTRY · ${scenes.length} SCENES`}</small>
        </span>
      </StatusCell>
      <StatusCell>
        <span>
          <b>{expressionMode ? production?.label ?? 'ENTRY' : 'PRODUCTION'}</b>
          <small>CURRENT PHASE · {active?.label ?? graph.operation.label}</small>
        </span>
      </StatusCell>
      <StatusCell tone="alert">
        <b className="pxa-red pxa-num">{pad2(blockers)}</b>
        <span>
          <b>BLOCKERS</b>
          <Link to="/production/activity">VIEW →</Link>
        </span>
      </StatusCell>
    </div>
  );
}

export function HubBody() {
  const data = useProductionAuthorityData();
  if (!data) return null;
  const { graph, project, production, attention, cast, frames, scenes } = data;
  const slug = project.projectId;
  const nodes = graph.nodes;
  const counts: Record<HubNodeId, number | null> = {
    narrative: scenes.length,
    cast: cast?.characters.length ?? null,
    look: cast?.looks.length ?? null,
    performance: null,
    set: null,
    storyboard: frames.length,
    keyframes: null,
  };
  const ops = attention.slice(0, 4);
  const feed = buildActivityRows(data).slice(0, 4);
  return (
    <div className="pxa-hub" data-testid="authority-hub">
      <AuthorityHero
        kicker="PROJECT"
        title={project.name.toUpperCase()}
        sub={production ? `${production.label} · A CLEAR ROUTE FOR EVERY PERSON.` : 'NO PRODUCTION IN THIS PROJECT YET.'}
        side={['IDEAS', 'PEOPLE', 'WORLDS', 'IN MOTION']}
      />
      <LiveStatusBar />
      <div className="pxa-hub__grid">
        <Sec title="PRODUCTION OVERVIEW" to={productionExpressionPath(slug)} className="pxa-card pxa-hub__overview" testId="hub-overview">
          <div className="pxa-overview">
            <Donut percent={graph.progressPercent} label={`PROJECT PROGRESS ${production?.label ?? ''}`.trim()} />
            <ul className="pxa-legend" aria-label="Department status">
              {nodes.map((n) => (
                <li key={n.id} data-status={n.status}>
                  <Dot tone={n.status === 'COMPLETE' ? 'red' : n.status === 'BLOCKED' ? 'red' : 'gray'} />
                  <span>{n.label}</span>
                  <em>{STATUS_WORD[n.status]}</em>
                  <i aria-hidden>
                    <b style={{ width: `${STATUS_FILL[n.status]}%` }} />
                  </i>
                </li>
              ))}
            </ul>
            <Link to={productionExpressionPath(slug)} className="pxa-entrycard" data-testid="hub-entry-card">
              <Thumb slotId={graph.nodes[0]?.assetSlotId} url={data.assetUrl(graph.nodes[0]?.assetSlotId ?? null)} label={production?.label ?? 'ENTRY'} />
              <b>{production?.label ?? 'NO ENTRY'}</b>
              <small>{cast ? `${cast.characters.length} CHARACTERS` : '—'} | {scenes.length} SCENES</small>
            </Link>
          </div>
        </Sec>
        <Sec title="ACTIVE ENTRIES" to={productionExpressionPath(slug)} className="pxa-card pxa-hub__entries" testId="hub-entries">
          <div className="pxa-entries">
            {production ?
              <Link to={productionExpressionPath(slug)} className="pxa-entry is-active" data-testid="hub-entry-active">
                <Thumb slotId={graph.nodes[5]?.assetSlotId} url={data.assetUrl(graph.nodes[5]?.assetSlotId ?? null)} label="ENTRY" />
                <b>{production.label}</b>
                <small>{(graph.activeNodeId ? graph.byId[graph.activeNodeId]?.label : 'PRODUCTION') ?? 'PRODUCTION'}</small>
                <span className="pxa-bar">
                  <i style={{ width: `${graph.progressPercent}%` }} />
                </span>
                <em>{graph.progressPercent}%</em>
              </Link>
            : null}
            <Link to={productionExpressionPath(slug)} className="pxa-entry pxa-entry--new" data-testid="hub-entry-new">
              <span aria-hidden>+</span>
              <b>NEW ENTRY</b>
            </Link>
          </div>
        </Sec>
        <Sec title="PROJECT COMPONENTS" className="pxa-card pxa-hub__components" testId="hub-components">
          <ul className="pxa-components">
            {nodes.map((n) => (
              <li key={n.id}>
                <Link to={productionExpressionPath(slug, NODE_SUB[n.id])} data-status={n.status}>
                  <Thumb slotId={n.assetSlotId} url={data.assetUrl(n.assetSlotId)} label={n.label} />
                  <b>{n.label}</b>
                  <small>{counts[n.id] != null ? `${counts[n.id]} ITEMS` : STATUS_WORD[n.status]}</small>
                </Link>
              </li>
            ))}
          </ul>
        </Sec>
        <Sec title="CURRENT OPERATIONS" to="/production/queue" className="pxa-card pxa-hub__ops" testId="hub-operations">
          {ops.length ?
            <ol className="pxa-ops">
              {ops.map((a, i) => (
                <li key={a.id}>
                  <Link to="/production/queue">
                    <em>{pad2(i + 1)}</em>
                    <span>
                      <b>{a.title}</b>
                      <small>{a.subtitle}</small>
                    </span>
                    <Priority level={a.priority === 'HIGH' ? 'HIGH' : 'MED'} />
                    <span aria-hidden>›</span>
                  </Link>
                </li>
              ))}
            </ol>
          : <p className="pxa-empty" data-testid="hub-operations-empty">NOTHING NEEDS YOU RIGHT NOW.</p>}
        </Sec>
        <Sec title="RECENT ACTIVITY" to="/production/activity" className="pxa-card pxa-hub__feed" testId="hub-activity">
          {feed.length ?
            <ol className="pxa-feed">
              {feed.map((a) => (
                <li key={a.id}>
                  <i aria-hidden />
                  <span>
                    <b>{a.title}</b>
                    <small>{a.detail}</small>
                  </span>
                  <time>{a.at ? agoLabel(a.at) : 'NOW'}</time>
                </li>
              ))}
            </ol>
          : <p className="pxa-empty" data-testid="hub-activity-empty">NO ACTIVITY RECORDED YET.</p>}
        </Sec>
      </div>
      <p className="pxa-hub__machine">
        <Link to="/production?view=machine" data-testid="hub-open-machine">
          OPEN HUB MACHINE (CHAMBER) →
        </Link>
      </p>
    </div>
  );
}
