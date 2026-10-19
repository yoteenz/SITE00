import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DfCrownObject } from '../../../foundation-client/objects';
import { foundationAdminApi, type FoundationAdminListRow, type PipelineRow } from '../../services/foundationAdminApi';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { age, readLifecycle, type LifecycleReading } from '../data/lifecycle';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { WsActivity, WsArrow, WsBanner, WsButton, WsChevron, WsPanel, WsPlate, WsSegments, WsStatus } from '../shell/wsKit';

type Row = FoundationAdminListRow & { name: string; life: LifecycleReading; last: string };

const nameOf = (a: FoundationAdminListRow) => (a.business_name?.trim() ? a.business_name.trim().toUpperCase() : `FOUNDATION ${a.artifact_id.slice(0, 6).toUpperCase()}`);
const lastIso = (a: FoundationAdminListRow) => a.last_activity_at ?? a.created_at;

/**
 * 01 OVERVIEW — editorial command center (OPUS1 mobile composition, OPUS2 tablet/desktop/ultra-wide reflow).
 * Regions: focus (one founder decision) · signals · needs you · active work registry · recent movement.
 * Every value is computed from the admin API; nothing is illustrative.
 */
export function OverviewPage() {
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [artifacts, setArtifacts] = useState<FoundationAdminListRow[] | null>(null);
  const [pipeline, setPipeline] = useState<PipelineRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, pipe] = await Promise.all([foundationAdminApi.list(), foundationAdminApi.pipeline()]);
      setArtifacts(list.artifacts ?? []);
      setPipeline(pipe.rows ?? []);
      setLoadedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows: Row[] = useMemo(() => {
    const pipeById = new Map(pipeline.map((p) => [p.artifact_id, p]));
    return (artifacts ?? [])
      .map((a) => ({ ...a, name: nameOf(a), life: readLifecycle(a, pipeById.get(a.artifact_id)), last: age(lastIso(a)) }))
      .sort((x, y) => String(lastIso(y)).localeCompare(String(lastIso(x))));
  }, [artifacts, pipeline]);

  const live = rows.filter((r) => r.life.kind !== 'done' && r.life.kind !== 'idle');
  const decisions = rows.filter((r) => r.life.kind === 'founder' || (r.life.kind === 'blocked' && r.life.owner === 'FOUNDER'));
  const waitingClient = rows.filter((r) => r.life.kind === 'client');
  const complete = rows.filter((r) => r.life.kind === 'done');
  const loading = artifacts === null && !error;
  const total = Math.max(rows.length, 1);

  const subtitle = loading
    ? 'LOADING FOUNDATIONS…'
    : error
      ? 'OVERVIEW COULD NOT LOAD'
      : `${live.length} ACTIVE · ${decisions.length} NEED YOU${loadedAt ? ` · UPDATED ${Date.now() - loadedAt < 60000 ? 'JUST NOW' : `${age(new Date(loadedAt).toISOString())} AGO`}` : ''}`;

  const frame = (body: ReactNode) => (
    <FounderWorkspacePageFrame destination="overview" title="DIGITAL FOUNDATION" subtitle={subtitle} arch={<DfCrownObject variant="OVERVIEW" />} hideActionsOnPhone density="relaxed">
      {body}
    </FounderWorkspacePageFrame>
  );

  if (error && !artifacts) {
    return frame(
      <>
        <WsBanner tone="red" icon="warning">
          OVERVIEW COULD NOT LOAD · THE FOUNDATION REQUEST FAILED. NOTHING WAS CHANGED.
        </WsBanner>
        <div className="ws-btn-row" style={{ marginTop: 12 }}>
          <WsButton icon="retry" onClick={() => void load()}>
            RETRY
          </WsButton>
        </div>
        <details className="ws-panel" style={{ marginTop: 14, maxWidth: 760 }}>
          <summary className="ws-panel__h ws-label" style={{ cursor: 'pointer', listStyle: 'none' }}>
            TECHNICAL DETAIL
          </summary>
          <div className="ws-panel__b">
            <dl style={{ margin: 0 }}>
              <div className="ws-kv">
                <dt>ACTION</dt>
                <dd className="ws-data">list · pipeline</dd>
              </div>
              <div className="ws-kv">
                <dt>MESSAGE</dt>
                <dd className="ws-data">{error}</dd>
              </div>
            </dl>
            <p className="ws-meta" style={{ margin: '10px 0 0' }}>
              NO SECRET VALUES OR TOKENS ARE EVER SHOWN.
            </p>
          </div>
        </details>
      </>,
    );
  }

  if (!loading && rows.length === 0) {
    return frame(
      <div className="ws-empty">
        <span className="ws-label">NO FOUNDATIONS YET</span>
        <h2 className="ws-h2">
          CREATE THE FIRST FOUNDATION<i className="ws-period" />
        </h2>
        <p className="ws-meta" style={{ margin: 0, maxWidth: '52ch' }}>
          A FOUNDATION CREATES THE CLIENT ARTIFACT AND A PERSONAL LINK. NOTHING IS EMAILED UNTIL YOU SEND IT.
        </p>
        <WsButton tone="red" icon="add" onClick={() => openOverlay('OL-01')}>
          NEW FOUNDATION
        </WsButton>
      </div>,
    );
  }

  const focus = decisions[0];
  const signals: Array<[string, number, string]> = [
    ['ACTIVE', live.length, ''],
    ['NEEDS REVIEW', decisions.length, decisions.length ? 'attn' : ''],
    ['AWAITING CLIENT', waitingClient.length, ''],
    ['COMPLETE', complete.length, ''],
  ];

  return frame(
    <div className="ov">
      <div className="ov__focus">
        {loading ? (
          <div className="ws-focus">
            <span className="ws-skel" style={{ width: '40%' }} />
            <span className="ws-skel" style={{ width: '70%' }} />
            <span className="ws-skel" style={{ width: '55%' }} />
          </div>
        ) : focus ? (
          <section className="ws-focus" aria-label="CURRENT FOCUS">
            <div className="ws-focus__k">
              <WsStatus kind="founder">CURRENT FOCUS · FOUNDER DECISION</WsStatus>
              <span className="ws-meta">{focus.last === '—' ? '' : `${focus.last} AGO`}</span>
            </div>
            <span className="ws-ident">
              <WsPlate name={focus.name} attn />
              <span className="ws-who">
                <b title={focus.name}>{focus.name}</b>
                <span>{focus.life.label}</span>
              </span>
            </span>
            <p className="ws-statement">
              {focus.life.statement ?? `${focus.life.label} — ${focus.life.action}`}
              <i className="ws-period" />
            </p>
            <div className="ws-focus__act">
              <Link className="ws-btn" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(focus.artifact_id)}>
                <span>{focus.life.action}</span>
                <WsArrow />
              </Link>
              <span className="ws-meta">1 OF {decisions.length} DECISIONS</span>
            </div>
          </section>
        ) : (
          <section className="ws-focus ws-focus--plain" aria-label="CURRENT FOCUS" style={{ boxShadow: 'inset 3px 0 0 var(--ws-ink)' }}>
            <div className="ws-focus__k">
              <WsStatus kind="work">CURRENT FOCUS</WsStatus>
            </div>
            <p className="ws-statement">
              NO DECISIONS WAITING ON YOU
              <i className="ws-period" />
            </p>
            <div className="ws-focus__act">
              <Link className="ws-btn ws-btn--out" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations}>
                <span>OPEN FOUNDATIONS</span>
                <WsArrow />
              </Link>
              <span className="ws-meta">{waitingClient.length} WAITING ON CLIENTS</span>
            </div>
          </section>
        )}
      </div>

      <section className="ws-signals ov__signals" aria-label="PORTFOLIO SIGNALS">
        {signals.map(([label, value, tone]) => (
          <div key={label} className={`ws-sig ${tone ? `ws-sig--${tone}` : ''}`.trim()}>
            <span className="ws-num">{loading ? '—' : value}</span>
            <span className="ws-label">{label}</span>
            <span className="ws-sig__bar">
              <i style={{ width: `${loading ? 0 : Math.round((value / total) * 100)}%` }} />
            </span>
          </div>
        ))}
      </section>

      <WsPanel title="NEEDS YOU" className="ov__needs" right={<span className="ws-meta">MOST RECENT FIRST</span>}>
        {decisions.length ? (
          decisions.slice(0, 5).map((r) => (
            <Link key={r.artifact_id} to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(r.artifact_id)} className="q-item" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <WsPlate name={r.name} attn size="sm" />
              <span className="ws-who">
                <b>{r.name}</b>
                <span>
                  {r.life.label} · {r.life.action}
                </span>
              </span>
              <span className="ws-meta">{r.last}</span>
            </Link>
          ))
        ) : (
          <p className="ws-meta" style={{ margin: 0 }}>
            {loading ? 'LOADING…' : 'NOTHING IS WAITING ON A FOUNDER DECISION.'}
          </p>
        )}
      </WsPanel>

      <section className="ov__work">
        <div className="ws-sechead">
          <h2 className="ws-h3">ACTIVE WORK</h2>
          <Link className="ws-link-quiet" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations}>
            ALL FOUNDATIONS →
          </Link>
        </div>
        <div className="reg-box">
          <div className="reg" role="table" aria-label="ACTIVE FOUNDATIONS" aria-rowcount={Math.min(live.length, 6) + 1}>
            <div className="reg__h" role="row">
              <span className="c-client" role="columnheader">
                CLIENT
              </span>
              <span className="c-status" role="columnheader">
                STATUS
              </span>
              <span className="c-life" role="columnheader">
                LIFECYCLE
              </span>
              <span className="c-next" role="columnheader">
                NEXT ACTION
              </span>
              <span className="c-last" role="columnheader" style={{ justifyContent: 'flex-end' }}>
                LAST ACTIVITY
              </span>
              <span className="c-chev" aria-hidden="true" />
            </div>
            {live.slice(0, 6).map((r) => (
              <RegistryRow key={r.artifact_id} row={r} />
            ))}
          </div>
          {!loading && live.length === 0 ? (
            <p className="ws-meta" style={{ margin: '14px 0 0' }}>
              NO FOUNDATION IS IN PROGRESS.
            </p>
          ) : null}
        </div>
      </section>

      <WsPanel title="RECENT MOVEMENT" className="ov__move" right={<span className="ws-meta">LATEST STATE PER FOUNDATION</span>}>
        {rows.slice(0, 5).map((r) => (
          <WsActivity key={r.artifact_id} time={r.last} kind={r.life.kind} title={r.name} sub={r.life.label} />
        ))}
        {!rows.length ? <p className="ws-meta">{loading ? 'LOADING…' : 'NO MOVEMENT YET.'}</p> : null}
      </WsPanel>

      {error ? (
        <div style={{ gridColumn: '1 / -1' }}>
          <WsBanner tone="red" icon="warning">
            REFRESH FAILED · SHOWING THE LAST LOADED DATA. <span className="ws-data">{error}</span>
          </WsBanner>
        </div>
      ) : null}
    </div>,
  );
}

function RegistryRow({ row: r }: { row: Row }) {
  const ownerCls = r.life.owner === 'FOUNDER' ? 'reg__owner reg__owner--founder' : 'reg__owner';
  return (
    <Link to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(r.artifact_id)} className="reg__r" role="row">
      <span className="c-client" role="cell">
        <WsPlate name={r.name} attn={r.life.kind === 'founder'} />
        <span className="ws-who">
          <b title={r.name}>{r.name}</b>
          <span>{r.intake_state ? `INTAKE ${r.intake_state.replace(/_/g, ' ')}` : 'DIGITAL FOUNDATION'}</span>
        </span>
      </span>
      <span className="reg__msub">
        <WsStatus kind={r.life.kind}>{r.life.label}</WsStatus>
        <span className="ws-meta">{r.last}</span>
      </span>
      <span className="reg__mseg">
        <WsSegments phase={r.life.phase} kind={r.life.kind} />
      </span>
      <span className="c-status reg__cell" role="cell">
        <WsStatus kind={r.life.kind}>{r.life.label}</WsStatus>
        <WsSegments phase={r.life.phase} kind={r.life.kind} wide />
        <span className="reg__sub">
          {r.last} · STEP {r.life.phase + 1} OF 8
        </span>
      </span>
      <span className="c-life reg__cell" role="cell">
        <WsStatus kind={r.life.kind}>{r.life.label}</WsStatus>
        <WsSegments phase={r.life.phase} kind={r.life.kind} wide />
        <span className="reg__sub">STEP {r.life.phase + 1} OF 8</span>
      </span>
      <span className="c-next reg__cell reg__next" role="cell">
        <span className={ownerCls}>{r.life.owner === '—' ? 'NO ACTION' : r.life.owner}</span>
        <b className="ws-2l" title={r.life.action}>
          {r.life.action}
        </b>
      </span>
      <span className="c-last" role="cell">
        <span className="ws-meta ws-num-tab">{r.last}</span>
      </span>
      <span className="c-chev" role="cell">
        <WsChevron />
      </span>
    </Link>
  );
}

