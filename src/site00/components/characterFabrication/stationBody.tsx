import { BODY_CHECK_DEFS, BODY_CHECK_IDS, CALIBRATION_FIXTURE, MOVEMENT_REFERENCES, stationNumber, STATION_LABEL, STATION_ORDER } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck, IcLock, IcUser } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { Panel, SlotNote, Toggle } from './primitives';

const IMPACT = [
  { k: 'LOOK DEVELOPMENT', v: 'UNLOCKS DETAIL SCULPT' },
  { k: 'HAIR + MAKEUP', v: 'ENABLES FIT MAPPING' },
  { k: 'CLOTHING + RIGGING', v: 'CONFIRMS BODY BASELINE' },
  { k: 'SIMULATION', v: 'IMPROVES PREDICTION ACCURACY' },
  { k: 'PERFORMANCE', v: 'ENABLES MOVEMENT LIBRARY' },
];

export function BodyStation() {
  const { state, dispatch, now, url, status, actor } = useFabrication();
  const locked = state.authority.body === 'LOCKED' && !state.stale.body;
  const st = status('body');
  return (
    <div className="cf-body" data-testid="cf-body-station">
      <Panel
        className="cf-gate"
        testId="cf-body-gate"
        title={<><span className="cf-eyebrow">BODY STATION</span><span className="cf-h2">LOCK BODY CONTINUITY</span></>}
        sub="FOUNDER GATE"
      >
        <div className="cf-gate__cols">
          <div>
            <h4 className="cf-subhead">VERIFIED CONTINUITY CHECKS</h4>
            <ul className="cf-checks" data-testid="cf-body-checks">
              {BODY_CHECK_IDS.map((c) => (
                <li key={c} className={state.bodyChecks[c] ? 'is-ok' : ''} data-check={c}>
                  <i>{state.bodyChecks[c] ? <IcCheck width={11} height={11} /> : null}</i>
                  <span>{BODY_CHECK_DEFS[c].label}</span>
                  <b>{state.bodyChecks[c] ? '100%' : 'PENDING'}</b>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="cf-subhead">DOWNSTREAM IMPACT</h4>
            <ul className="cf-impact" data-testid="cf-body-impact">
              {IMPACT.map((i) => (
                <li key={i.k}><span className="cf-impact__ic"><IcUser width={13} height={13} /></span><span><b>{i.k}</b><small>{i.v}</small></span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="cf-immutable">
          <IcLock width={18} height={18} />
          <div>
            <b>IMMUTABLE BASELINE</b>
            <p>LOCKING BODY CONTINUITY ESTABLISHES THE PHYSICAL BASELINE FOR ALL DOWNSTREAM SYSTEMS. THIS ACTION IS PERMANENT AND CANNOT BE UNDONE. ANY CHANGES WILL REQUIRE A NEW BODY BASE VERSION.</p>
          </div>
        </div>
        {!state.bodyCalibrated ? <SlotNote text="CHECKS ARE PENDING — RUN CONTINUITY CALIBRATION (TECHNICAL SCALE INSPECTOR). THE READOUT IS A PREVIEW FIXTURE; NO MEASUREMENT BACKEND EXISTS YET." /> : null}
        <div className="cf-actions">
          <button type="button" className="cf-btn cf-btn--line cf-btn--lg" data-testid="cf-body-inspect" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'BODY_INSPECTOR' })}>INSPECT CONTINUITY</button>
          {locked ?
            <button type="button" className="cf-btn cf-btn--line cf-btn--lg" data-testid="cf-body-newversion" onClick={() => dispatch({ type: 'NEW_BODY_VERSION', at: now() })}>NEW BODY BASE VERSION</button>
          : <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-lock-body" onClick={() => dispatch({ type: 'LOCK_BODY', at: now() })}>LOCK BODY CONTINUITY <IcArrowR width={14} height={14} /></button>}
        </div>
      </Panel>

      <section className="cf-authority-strip" data-testid="cf-body-authority">
        <header><h3>BODY AUTHORITY</h3><span>CALIBRATED BASE VERSION <b>{state.selectedBodyVersionId}</b></span></header>
        <dl className="cf-stats">
          <div><dt>HEIGHT</dt><dd>{actor.heightRange}</dd></div>
          <div><dt>BUILD</dt><dd>{actor.build}</dd></div>
          <div><dt>WEIGHT</dt><dd className="cf-dim">NOT MEASURED</dd></div>
          <div><dt>BODY FAT</dt><dd className="cf-dim">NOT MEASURED</dd></div>
          <div><dt>STATUS</dt><dd>{st.replace('_', ' ')}</dd></div>
        </dl>
      </section>
      <div className="cf-triple cf-triple--body">
        <Panel title="BODY CONTINUITY MAP" className="cf-mini" testId="cf-body-map">
          <div className="cf-bodymap">
            {(['front', 'side', 'back'] as const).map((v) => <CfImage key={v} slotId={`actor.sw017.body.neutral.${v}`} url={url(`actor.sw017.body.neutral.${v}`)} label={v.toUpperCase()} className="cf-bodymap__img" />)}
          </div>
        </Panel>
        <Panel title="BASELINE HISTORY" className="cf-mini" testId="cf-baseline-history">
          <ul className="cf-history">
            {[...state.bodyVersions].reverse().map((v) => (
              <li key={v.versionId} data-status={v.status}>
                <span className="cf-history__ic"><IcLock width={13} height={13} /></span>
                <span><b>{v.label}</b><small>{v.status === 'LOCKED' ? `LOCKED BY FOUNDER${v.lockedAt ? ' · ' + new Date(v.lockedAt).toISOString().slice(11, 16) + 'Z' : ''}` : v.status === 'SUPERSEDED' ? 'SUPERSEDED' : v.note}</small></span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/** 02 BODY → CONTINUITY CALIBRATION / TECHNICAL SCALE INSPECTOR (a surface of the Body station). */
export function ContinuityInspector() {
  const { state, dispatch, now, url, actor, actors, character } = useFabrication();
  const nextActor = actors.find((a) => a.actorId !== state.selectedActorId && a.projectsUsed.length === 0) ?? actors[1]!;
  const cal = state.bodyCalibrated;
  const F = CALIBRATION_FIXTURE;
  const views = ['FRONT', 'SIDE', 'BACK'] as const;
  return (
    <div className="cf-inspector" data-testid="cf-continuity-inspector">
      <header className="cf-inspector__head">
        <span className="cf-hexnum">02</span>
        <span className="cf-inspector__title"><small>CONTINUITY CALIBRATION</small><b>TECHNICAL SCALE INSPECTOR</b></span>
        <dl className="cf-inspector__meta">
          <div><dt>ACTOR</dt><dd>{actor.catalogueNumber}</dd></div>
          <div><dt>CHARACTER</dt><dd>{character.displayName}</dd></div>
          <div><dt>ENTRY</dt><dd className="cf-red">{state.selectedEntryId}</dd></div>
        </dl>
      </header>
      <div className="cf-inspector__grid">
        <Panel title="MODEL CONTINUITY OVERVIEW" className="cf-overview" testId="cf-model-overview">
          <div className="cf-overview__views">
            {views.map((v) => (
              <button key={v} type="button" className={`cf-overview__view${state.bodyView === v ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'BODY_VIEW', view: v })} data-testid={`cf-bodyview-${v.toLowerCase()}`} aria-pressed={state.bodyView === v}>
                <CfImage slotId={`actor.sw017.body.neutral.${v.toLowerCase()}`} url={url(`actor.sw017.body.neutral.${v.toLowerCase()}`)} label={v} className="cf-overview__img" />
                <svg className="cf-guides" viewBox="0 0 100 200" preserveAspectRatio="none" aria-hidden>
                  {[10, 60, 110, 170].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} />)}
                  <line x1="50" x2="50" y1="0" y2="200" />
                </svg>
                <em>{v}</em>
              </button>
            ))}
          </div>
        </Panel>
        <div className="cf-inspector__side">
          <Panel title="ALIGNMENT STATUS" testId="cf-alignment">
            <div className="cf-gauge">
              <svg viewBox="0 0 120 120" aria-hidden>
                <circle cx="60" cy="60" r="52" className="cf-gauge__track" />
                <circle cx="60" cy="60" r="52" className="cf-gauge__arc" strokeDasharray={`${cal ? (F.alignmentPct / 100) * 326.7 : 0} 326.7`} transform="rotate(-90 60 60)" />
              </svg>
              <b>{cal ? `${F.alignmentPct}%` : '—'}</b><small>ALIGNMENT</small>
            </div>
            <dl className="cf-kv cf-kv--rows">
              <div><dt>STATUS</dt><dd>{cal ? <em className="cf-ok cf-ok--chip">WITHIN TOLERANCE</em> : 'NOT CALIBRATED'}</dd></div>
              <div><dt>REFERENCE</dt><dd>APPROVED BASE</dd></div>
              <div><dt>TOLERANCE</dt><dd>± {F.tolerance.toFixed(1)}%</dd></div>
            </dl>
          </Panel>
          <Panel title="VARIANCE READOUT" testId="cf-variance">
            <dl className="cf-kv cf-kv--rows">
              {F.variance.map((v) => <div key={v.k}><dt>{v.k}</dt><dd>{cal ? `± ${v.v.toFixed(1)}%` : '—'}</dd></div>)}
              <div className="cf-kv__total"><dt>OVERALL VARIANCE</dt><dd>{cal ? `± ${F.overall.toFixed(1)}%` : '—'}</dd></div>
            </dl>
          </Panel>
        </div>
      </div>
      <SlotNote text="CALIBRATION READOUT = LIBRARY FIXTURE (NO MEASUREMENT BACKEND). IT ENABLES THE FOUNDER GATE; IT IS NOT A MEASUREMENT OF THE ACTOR." />

      <Panel title="CURRENT vs APPROVED OVERLAY" className="cf-overlay" testId="cf-overlay">
        <div className="cf-overlay__row">
          <div className="cf-overlay__face">
            <CfImage slotId="actor.sw017.portrait.primary" url={url('actor.sw017.portrait.primary')} label="CURRENT / APPROVED" className="cf-overlay__img" />
            <em className="l">CURRENT<small>ENTRY {state.selectedEntryId}</small></em>
            <em className="r">APPROVED<small>BASE MODEL</small></em>
            <i className="cf-overlay__split" />
          </div>
          <div className="cf-silhouettes" aria-label="Silhouette overlay">
            {views.map((v) => (
              <svg key={v} viewBox="0 0 60 150" className={state.bodyView === v ? 'is-on' : ''} onClick={() => dispatch({ type: 'BODY_VIEW', view: v })} role="img" aria-label={`${v} silhouette`}>
                <path d="M30 6c5 0 8 4 8 9s-3 9-8 9-8-4-8-9 3-9 8-9zM22 26c-8 4-12 30-12 52l6 2 4-30 2 40-4 56h9l3-50 3 50h9l-4-56 2-40 4 30 6-2c0-22-4-48-12-52z" className="approved" />
                <path d="M30 4c5 0 8 4 8 9s-3 9-8 9-8-4-8-9 3-9 8-9zM21 25c-8 4-13 30-13 53l6 2 4-30 2 40-4 57h9l3-50 3 50h9l-4-57 2-40 4 30 6-2c0-23-5-49-13-53z" className="current" />
              </svg>
            ))}
          </div>
        </div>
      </Panel>
      <Panel title="MOVEMENT REFERENCE CONTEXT" testId="cf-movement-ref">
        <div className="cf-moves">
          {MOVEMENT_REFERENCES.map((m) => (
            <figure key={m.refId}><CfImage slotId={`actor.sw017.movement.${m.refId}`} url={null} label={m.label} className="cf-moves__img" /><figcaption>{m.label}</figcaption></figure>
          ))}
        </div>
      </Panel>
      <div className="cf-triple cf-triple--inspect">
        <Panel className="cf-mini cf-checkpoint" testId="cf-checkpoint">
          <span className="cf-shield"><IcLock width={18} height={18} /></span>
          <div><b>CONTINUITY CHECKPOINT</b><small className={cal ? 'cf-ok' : ''}>{cal ? 'Model consistency verified — all systems nominal' : 'Calibration required'}</small></div>
        </Panel>
        <Panel title="CALIBRATION SETTINGS" className="cf-mini">
          <dl className="cf-kv cf-kv--rows">
            <div><dt>REFERENCE MODEL</dt><dd>{F.referenceModel}</dd></div>
            <div><dt>TOLERANCE THRESHOLD</dt><dd>± {F.tolerance.toFixed(1)}%</dd></div>
            <div><dt>SCALE LOCK</dt><dd><Toggle on={state.scaleLock} onChange={() => dispatch({ type: 'TOGGLE_SCALE_LOCK' })} label="Scale lock" testId="cf-scale-lock" /></dd></div>
          </dl>
        </Panel>
        <Panel className="cf-mini cf-inspectnext" testId="cf-inspect-next">
          <div className="cf-inspectnext__row"><CfImage slotId={nextActor.portraitSlotId} url={url(nextActor.portraitSlotId)} label="" className="cf-inspectnext__img" /><span><small>INSPECT NEXT</small><b>{nextActor.catalogueNumber}</b><small>{nextActor.entryLabel}</small></span></div>
          <button type="button" className="cf-btn cf-btn--red" data-testid="cf-inspect-next-btn" onClick={() => { dispatch({ type: 'SELECT_ACTOR', actorId: nextActor.actorId }); dispatch({ type: 'GOTO_STATION', station: 'identity' }); }}>INSPECT NEXT <IcArrowR width={13} height={13} /></button>
        </Panel>
      </div>
      <div className="cf-actions">
        <button type="button" className="cf-btn cf-btn--line cf-btn--lg" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })} data-testid="cf-inspector-back">BACK TO BODY STATION</button>
        <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-run-calibration" disabled={cal} onClick={() => dispatch({ type: 'RUN_CALIBRATION', at: now() })}>{cal ? 'CALIBRATION CURRENT' : 'RUN CALIBRATION'} <IcArrowR width={14} height={14} /></button>
      </div>
      <nav className="cf-mini-rail" aria-label="Stations">
        {STATION_ORDER.map((s) => <button key={s} type="button" className={s === 'body' ? 'is-on' : ''} onClick={() => dispatch({ type: 'GOTO_STATION', station: s })}><b>{stationNumber(s)}</b>{s === 'body' ? 'CONTINUITY' : STATION_LABEL[s]}</button>)}
      </nav>
    </div>
  );
}
