import { Link } from 'react-router-dom';
import { HUB_ATMOSPHERE_SLOT_ID, type HubNode, type HubNodeId } from '../../../../shared/site00-production-hub/index.js';
import { productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import { HubImage } from '../productionHub/HubImage';
import { useProductionAuthorityData } from './ProductionAuthorityData';
import { buildActivityRows } from './ActivityBody';
import { AUTHORITY_ASSETS } from './authorityAssets';
import { agoLabel, Dot, pad2, Priority, StatusCell, Thumb } from './primitives';
import '../../styles/site00-production-hub-reconstruction.css';

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
        <span className="pxa-hero__bg pxa-hero__bg--plate" style={{ backgroundImage: `url(${plate})` }} aria-hidden />
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

export function LiveStatusBar({ expressionMode = false, compact = false, context }: { expressionMode?: boolean; compact?: boolean; context?: { title: string; sub: string } }) {
  const data = useProductionAuthorityData();
  if (!data) return null;
  const { graph, attention, activity, production, scenes } = data;
  const last = activity[0]?.at ?? null;
  const active = graph.activeNodeId ? graph.byId[graph.activeNodeId] : null;
  const blockers = graph.blockers.length;
  return (
    <div className={`pxa-status${compact ? ' pxa-status--compact' : ''}`} data-testid="authority-status-bar" data-compact={compact ? 'true' : undefined}>
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
          <b>{context?.title ?? (expressionMode ? 'EXPRESSION' : (production?.label ?? 'NO ENTRY'))}</b>
          <small>{context?.sub ?? (expressionMode ? 'PRODUCTION FLOOR · 6 DEPARTMENTS' : `ACTIVE ENTRY · ${scenes.length} SCENES`)}</small>
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

/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 * HUB — reference-locked reconstruction (P0.STUDIOOS.PRODUCTION.HUB.RECONSTRUCTION.OPUS1).
 * Markup follows the approved HUB authority module grammar; every value shown is live hub data.
 * Geometry lives in site00-production-hub-reconstruction.css (one unit system per viewport family).
 * ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Line icons for the project-component tiles (authority: icon-first tiles). Stroke follows currentColor. */
function NodeIcon({ id }: { id: HubNodeId }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const body: Record<HubNodeId, React.ReactNode> = {
    narrative: (
      <>
        <path {...p} d="M7 4h11l4 4v20H7z" />
        <path {...p} d="M18 4v4h4M11 13h8M11 17h8M11 21h5" />
      </>
    ),
    cast: (
      <>
        <circle {...p} cx="16" cy="10" r="3.6" />
        <circle {...p} cx="8.5" cy="12.5" r="2.8" />
        <circle {...p} cx="23.5" cy="12.5" r="2.8" />
        <path {...p} d="M9.5 25c0-4 2.9-7 6.5-7s6.5 3 6.5 7M3.5 24c0-3 2.2-5.2 5-5.2M28.5 24c0-3-2.2-5.2-5-5.2" />
      </>
    ),
    look: (
      <>
        <path {...p} d="M16 4l10 5.5v11L16 26 6 20.5v-11z" />
        <path {...p} d="M6 9.5l10 5.5 10-5.5M16 15v11" />
      </>
    ),
    performance: (
      <>
        <circle {...p} cx="16" cy="16" r="11" />
        <path {...p} d="M13.5 11.5l7 4.5-7 4.5z" />
      </>
    ),
    set: (
      <>
        <path {...p} d="M16 5l11 5.5-11 5.5L5 10.5z" />
        <path {...p} d="M5 15.5L16 21l11-5.5M5 20.5L16 26l11-5.5" />
      </>
    ),
    storyboard: (
      <>
        <rect {...p} x="4" y="7" width="24" height="18" rx="1" />
        <path {...p} d="M9 7v18M23 7v18M4 12h5M4 20h5M23 12h5M23 20h5" />
      </>
    ),
    keyframes: (
      <>
        <circle {...p} cx="16" cy="7.5" r="3" />
        <circle {...p} cx="7.5" cy="24" r="3" />
        <circle {...p} cx="24.5" cy="24" r="3" />
        <path {...p} d="M14.6 10.2L9 21.3M17.4 10.2L23 21.3M10.5 24h11" />
      </>
    ),
  };
  return (
    <svg className="hubx-icon" viewBox="0 0 32 32" aria-hidden>
      {body[id]}
    </svg>
  );
}

function HubRing({ percent, label, sub }: { percent: number; label: string; sub: string }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="hubx-ring" role="img" aria-label={`${label} ${percent}%`} data-testid="authority-donut">
      <span className="hubx-ring__dial">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} className="hubx-ring__track" />
          <circle cx="50" cy="50" r={r} className="hubx-ring__bar" strokeDasharray={`${(c * percent) / 100} ${c}`} transform="rotate(-90 50 50)" />
        </svg>
        <b>{percent}%</b>
      </span>
      <strong>{label}</strong>
      <small>{sub}</small>
    </div>
  );
}

function HubHead({ title, to, testId }: { title: string; to?: string; testId?: string }) {
  return (
    <header className="hubx-head" data-testid={testId}>
      <h2>
        <i aria-hidden />
        {title}
      </h2>
      {to ?
        <Link to={to} className="hubx-viewall">
          VIEW ALL <span aria-hidden>→</span>
        </Link>
      : null}
    </header>
  );
}

export function HubBody() {
  const data = useProductionAuthorityData();
  if (!data) return null;
  const { graph, project, production, attention, cast, frames, scenes, activity } = data;
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
  const feed = buildActivityRows(data).slice(0, 5);
  const active = graph.activeNodeId ? graph.byId[graph.activeNodeId] : null;
  const entryArt = graph.byId.storyboard?.assetSlotId ?? graph.nodes[5]?.assetSlotId ?? null;
  const updated = agoLabel(activity[0]?.at ?? null);
  const expression = productionExpressionPath(slug);
  const slotFor = (nodeId: HubNodeId | null | undefined) => (nodeId ? (graph.byId[nodeId]?.assetSlotId ?? null) : null);
  return (
    <div className="pxa-hub hubx" data-testid="authority-hub" data-loading={data.loading ? 'true' : undefined}>
      {/* ── HERO / WORLD PANEL ── */}
      <div
        className="hubx-hero"
        data-testid="authority-hero"
        style={{
          ['--hero-mobile' as string]: `url(${AUTHORITY_ASSETS.atriumMaster})`,
          ['--hero-tablet' as string]: `url(${AUTHORITY_ASSETS.atriumMaster})`,
          ['--hero-desktop' as string]: `url(${AUTHORITY_ASSETS.atriumMaster})`,
        }}
      >
        <span className="hubx-hero__plate" aria-hidden />
        {slug === 'ndxbook' ? <img className="hubx-hero__core" alt="" src={AUTHORITY_ASSETS.ndxCore} data-testid="hub-project-core" /> : null}
        <div className="hubx-hero__copy">
          <i aria-hidden />
          <small>PROJECT</small>
          <h1>{project.name.toUpperCase()}</h1>
          {production ? <strong>{production.label}</strong> : null}
          <p>{production ? <>A CLEAR ROUTE<br />FOR EVERY PERSON</> : 'NO PRODUCTION IN THIS PROJECT YET.'}</p>
        </div>
        <ul className="hubx-hero__side" aria-hidden>
          {['IDEAS', 'PEOPLE', 'WORLDS', 'IN MOTION'].map((w) => (
            <li key={w}>{w}</li>
          ))}
          <li className="hubx-hero__tick" />
        </ul>
      </div>

      {/* ── STATUS STRIP ── */}
      <div className="hubx-status" data-testid="authority-status-bar">
        <div className="hubx-status__cell">
          <small>LIVE STATUS</small>
          <b>
            <Dot tone="green" />
            {data.hasProduction ? 'IN PRODUCTION' : 'NO PRODUCTION'}
          </b>
          <em data-testid="hub-live-updated">{data.loading ? 'SYNCING LIVE STATE' : `UPDATED ${updated}`}</em>
        </div>
        <div className="hubx-status__cell is-alert">
          <strong>{pad2(attention.length)}</strong>
          <span>ITEMS NEED YOU</span>
          <Link to="/production/queue">
            VIEW NOW <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="hubx-status__cell">
          <b>{production?.label ?? 'NO ENTRY'}</b>
          <span>ACTIVE ENTRY</span>
          <em>{scenes.length} SCENES</em>
        </div>
        <div className="hubx-status__cell">
          <b>PRODUCTION</b>
          <span>CURRENT PHASE</span>
          <em>{active?.label ?? graph.operation.label}</em>
        </div>
        <div className="hubx-status__cell is-alert">
          <strong>{pad2(graph.blockers.length)}</strong>
          <span>BLOCKERS</span>
          <Link to="/production/activity">
            VIEW <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className="hubx-grid">
        <div className="hubx-col hubx-col--left">
          {/* ── PRODUCTION OVERVIEW ── */}
          <section className="hubx-card hubx-overview" data-testid="hub-overview">
            <HubHead title="PRODUCTION OVERVIEW" to={expression} />
            <div className="hubx-overview__body">
              <HubRing percent={graph.progressPercent} label="PROJECT PROGRESS" sub={production?.label ?? 'NO ENTRY'} />
              <ul className="hubx-legend" aria-label="Department status">
                {nodes.map((n) => (
                  <li key={n.id} data-status={n.status}>
                    <Dot tone={n.status === 'LOCKED' || n.status === 'NOT_STARTED' ? 'gray' : 'red'} />
                    <span>{n.label}</span>
                    <em>{STATUS_WORD[n.status]}</em>
                  </li>
                ))}
              </ul>
              {production ?
                <Link to={expression} className="hubx-feature" data-testid="hub-entry-card">
                  <Thumb slotId={entryArt} url={data.assetUrl(entryArt)} label={production.label} />
                  <b>{production.label}</b>
                  <small>
                    {cast ? `${cast.characters.length} CHARACTERS` : '—'} <i aria-hidden>|</i> {scenes.length} SCENES
                  </small>
                  <em>UPDATED {updated}</em>
                </Link>
              : <div className="hubx-feature hubx-feature--empty" data-testid="hub-entry-card-empty">
                  <span className="hubx-slot" aria-hidden />
                  <b>NO ENTRY</b>
                  <small>NO PRODUCTION IN THIS PROJECT YET</small>
                </div>
              }
            </div>
          </section>

          {/* ── PROJECT COMPONENTS ── */}
          <section className="hubx-card hubx-components" data-testid="hub-components">
            <HubHead title="PROJECT COMPONENTS" to={expression} />
            {nodes.length ? null : <p className="pxa-empty" data-testid="hub-components-empty">NO PRODUCTION COMPONENTS YET.</p>}
            <ul className="hubx-tiles">
              {nodes.map((n) => (
                <li key={n.id}>
                  <Link to={productionExpressionPath(slug, NODE_SUB[n.id])} data-status={n.status}>
                    <NodeIcon id={n.id} />
                    <b>{n.label}</b>
                    <small>{counts[n.id] != null ? `${counts[n.id]} ITEMS` : STATUS_WORD[n.status]}</small>
                    <span className="hubx-meter" aria-hidden>
                      <i style={{ width: `${STATUS_FILL[n.status]}%` }} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="hubx-col hubx-col--right">
          {/* ── ACTIVE ENTRIES ── */}
          <section className="hubx-card hubx-entries" data-testid="hub-entries">
            <HubHead title="ACTIVE ENTRIES" to={expression} />
            <div className="hubx-entries__row">
              {production ?
                <Link to={expression} className="hubx-entry is-active" data-testid="hub-entry-active">
                  <b>{production.label}</b>
                  <Thumb slotId={entryArt} url={data.assetUrl(entryArt)} label="ENTRY" />
                  <small>{active?.label ?? 'PRODUCTION'}</small>
                  <span className="hubx-entry__bar">
                    <span className="hubx-meter" aria-hidden>
                      <i style={{ width: `${graph.progressPercent}%` }} />
                    </span>
                    <em>{graph.progressPercent}%</em>
                  </span>
                </Link>
              : null}
              <Link to={expression} className="hubx-entry hubx-entry--new" data-testid="hub-entry-new">
                <span aria-hidden>+</span>
                <b>NEW ENTRY</b>
              </Link>
            </div>
          </section>

          <div className="hubx-pair">
            {/* ── CURRENT OPERATIONS ── */}
            <section className="hubx-card hubx-ops" data-testid="hub-operations">
              <HubHead title="CURRENT OPERATIONS" to="/production/queue" />
              {ops.length ?
                <ol className="hubx-ops__list">
                  {ops.map((a, i) => {
                    const slot = a.assetSlotId ?? slotFor(a.nodeId);
                    return (
                      <li key={a.id}>
                        <Link to="/production/queue">
                          <em>{pad2(i + 1)}</em>
                          <Thumb slotId={slot} url={data.assetUrl(slot)} label={a.nodeId ?? ''} />
                          <span>
                            <b>{a.title}</b>
                            <small>{a.subtitle}</small>
                          </span>
                          <Priority level={a.priority === 'HIGH' ? 'HIGH' : 'MED'} />
                          <i className="hubx-chev" aria-hidden>
                            ›
                          </i>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              : <p className="pxa-empty" data-testid="hub-operations-empty">NOTHING NEEDS YOU RIGHT NOW.</p>}
            </section>

            {/* ── RECENT ACTIVITY ── */}
            <section className="hubx-card hubx-feed" data-testid="hub-activity">
              <HubHead title="RECENT ACTIVITY" to="/production/activity" />
              {feed.length ?
                <ol className="hubx-feed__list">
                  {feed.map((a) => {
                    const nodeId = a.id.startsWith('state.') ? (a.id.slice(6) as HubNodeId) : null;
                    const slot = slotFor(nodeId);
                    return (
                      <li key={a.id}>
                        <i className="hubx-feed__node" aria-hidden />
                        <Thumb slotId={slot} url={data.assetUrl(slot)} label="" />
                        <span>
                          <b>{a.title}</b>
                          <small>{a.detail}</small>
                        </span>
                        <time>{a.at ? agoLabel(a.at) : 'NOW'}</time>
                      </li>
                    );
                  })}
                </ol>
              : <p className="pxa-empty" data-testid="hub-activity-empty">NO ACTIVITY RECORDED YET.</p>}
            </section>
          </div>
        </div>
      </div>
      <p className="pxa-hub__machine">
        <Link to="/production?view=machine" data-testid="hub-open-machine">
          OPEN HUB MACHINE (CHAMBER) →
        </Link>
      </p>
    </div>
  );
}
