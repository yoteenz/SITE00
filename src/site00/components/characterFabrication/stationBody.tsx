/**
 * 02 BODY — authorities 5417 (Body Authority / founder gate / baseline history) and 5416 (Continuity Calibration /
 * Technical Scale Inspector). Calibration readouts are LIBRARY FIXTURES, labelled as such — never measurements.
 */
import { useState } from 'react';
import { BODY_CHECK_DEFS, BODY_CHECK_IDS, CALIBRATION_FIXTURE, MOVEMENT_REFERENCES } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck, IcChevR, IcCube, IcLock, IcMove, IcPulse, IcShirt, IcUser } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { ChamberHero, ChamberPlate } from './chamber';
import { FabricationStageRail, Toggle } from './primitives';

const IMPACT = [
  { k: 'LOOK DEVELOPMENT', v: 'UNLOCKS DETAIL SCULPT', i: <IcShirt width={7} height={7} /> },
  { k: 'HAIR + MAKEUP', v: 'ENABLES FIT MAPPING', i: <IcUser width={7} height={7} /> },
  { k: 'CLOTHING & RIGGING', v: 'CONFIRMS BODY BASELINE', i: <IcCube width={7} height={7} /> },
  { k: 'SIMULATION', v: 'IMPROVES PREDICTION ACCURACY', i: <IcPulse width={7} height={7} /> },
  { k: 'PERFORMANCE', v: 'ENABLES MOVEMENT LIBRARY', i: <IcMove width={7} height={7} /> },
];

/* ── mini cards (5417) ─────────────────────────────────────────────── */

export function MiniActorCard({ style }: { style?: React.CSSProperties }) {
  const { actor, url, state } = useFabrication();
  return (
    <aside className="cf-mcard" style={style} data-testid="cf-actor-card">
      <i className="cf-acard__tick" aria-hidden />
      <header><small>ACTOR</small><b>{actor.catalogueNumber}</b></header>
      <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="ACTOR" className="cf-mcard__img" />
      <dl className="cf-rows cf-rows--mini">
        <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
        <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
      </dl>
    </aside>
  );
}

export function MiniCharacterCard({ style }: { style?: React.CSSProperties }) {
  const { character, status } = useFabrication();
  const inFab = status('authority') !== 'LOCKED';
  return (
    <aside className="cf-mcard cf-mcard--char" style={style} data-testid="cf-character-card">
      <i className="cf-acard__tick" aria-hidden />
      <header><small>CHARACTER</small><b>{character.displayName}</b></header>
      <em className={inFab ? 'cf-infab cf-infab--lg' : 'cf-verified'}>{inFab ? 'IN FABRICATION' : 'CANONICAL'}</em>
    </aside>
  );
}

/* ── 5417 ───────────────────────────────────────────────────────────── */

export function BodyStation() {
  const { state, dispatch, now, url, actor, status } = useFabrication();
  const [gateOpen, setGateOpen] = useState(true);
  const locked = state.authority.body === 'LOCKED' && !state.stale.body;
  const st = status('body');
  return (
    <div className="cf-body2" data-testid="cf-body-station">
      <ChamberHero h={502} cyl={{ top: 12, plat: 470 }} fig={{ x: 165, y: 20, w: 103, h: 300 }}>
        <MiniActorCard style={{ left: 17.5, top: 19 }} />
        <MiniCharacterCard style={{ left: 330, top: 20 }} />
        {gateOpen ? (
          <section className="cf-gate2" data-testid="cf-body-gate">
            <FabricationStageRail className="cf-rail--bare" />
            <div className="cf-gate2__card">
              <i className="cf-acard__tick" aria-hidden />
              <header className="cf-gate2__head">
                <small>BODY STATION</small>
                <h2>LOCK BODY CONTINUITY</h2>
                <p>FOUNDER GATE</p>
              </header>
              <div className="cf-gate2__cols">
                <div>
                  <h4>VERIFIED CONTINUITY CHECKS {!state.bodyCalibrated ? <button type="button" className="cf-inlink" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'BODY_INSPECTOR' })}>RUN CALIBRATION <IcArrowR width={6} height={6} /></button> : null}</h4>
                  <ul className="cf-checks2" data-testid="cf-body-checks">
                    {BODY_CHECK_IDS.map((c) => (
                      <li key={c} className={state.bodyChecks[c] ? 'is-ok' : ''} data-check={c}>
                        <i>{state.bodyChecks[c] ? <IcCheck width={5} height={5} /> : null}</i>
                        <span>{BODY_CHECK_DEFS[c].label.replace('+', '&')}</span>
                        <b>{state.bodyChecks[c] ? '100%' : 'PENDING'}</b>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>DOWNSTREAM IMPACT</h4>
                  <ul className="cf-impact2" data-testid="cf-body-impact">
                    {IMPACT.map((i) => (
                      <li key={i.k}><i>{i.i}</i><span><b>{i.k}</b><small>{i.v}</small></span></li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="cf-gate2__imm">
                <IcLock width={9} height={9} />
                <div>
                  <b>IMMUTABLE BASELINE</b>
                  <p>LOCKING BODY CONTINUITY ESTABLISHES THE PHYSICAL BASELINE FOR ALL DOWNSTREAM SYSTEMS. THIS ACTION IS PERMANENT AND CANNOT BE UNDONE. ANY CHANGES WILL REQUIRE A NEW BODY BASE VERSION.</p>
                </div>
              </div>
              <div className="cf-gate2__act">
                <button type="button" className="cf-obtn" data-testid="cf-body-cancel" onClick={() => setGateOpen(false)}>CANCEL</button>
                {locked ? (
                  <button type="button" className="cf-rbtn" data-testid="cf-body-newversion" onClick={() => dispatch({ type: 'NEW_BODY_VERSION', at: now() })}>NEW BODY BASE VERSION <IcArrowR width={9} height={9} /></button>
                ) : (
                  <button type="button" className="cf-rbtn" data-testid="cf-lock-body" onClick={() => dispatch({ type: 'LOCK_BODY', at: now() })}>LOCK BODY CONTINUITY <IcArrowR width={9} height={9} /></button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="cf-gate2 cf-gate2--closed" data-testid="cf-body-gate">
            <FabricationStageRail className="cf-rail--bare" />
            <div className="cf-gate2__closed">
              <span><small>FOUNDER GATE</small><b>{locked ? `BASELINE ${state.selectedBodyVersionId} LOCKED` : 'BODY CONTINUITY NOT LOCKED'}</b></span>
              <button type="button" className="cf-obtn" data-testid="cf-body-inspect-gate" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'BODY_INSPECTOR' })}>INSPECT CONTINUITY</button>
              <button type="button" className="cf-rbtn" data-testid="cf-body-reopen" onClick={() => setGateOpen(true)}>OPEN GATE</button>
            </div>
          </section>
        )}
      </ChamberHero>

      <section className="cf-bauth" data-testid="cf-body-authority">
        <header><h3>BODY AUTHORITY</h3><span>CALIBRATED BASE VERSION <b>{state.selectedBodyVersionId}</b></span></header>
        <dl>
          <div><dt>HEIGHT</dt><dd>{actor.heightRange}</dd></div>
          <div><dt>BUILD</dt><dd>{actor.build}</dd></div>
          <div><dt>WEIGHT</dt><dd className="is-na">NOT MEASURED</dd></div>
          <div><dt>BODY FAT</dt><dd className="is-na">NOT MEASURED</dd></div>
          <div><dt>BASELINE</dt><dd>{st.replace('_', ' ')}</dd></div>
        </dl>
      </section>
      <div className="cf-bmap2">
        <section className="cf-bmap2__map" data-testid="cf-body-map">
          <header>
            <h3>BODY CONTINUITY MAP</h3>
            <span className="cf-legend"><i className="cf-legend__box" />LOW <i className="cf-legend__ramp" /> HIGH</span>
          </header>
          <button type="button" className="cf-bmap2__figs" data-testid="cf-body-inspect-map" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'BODY_INSPECTOR' })} aria-label="Inspect continuity">
            {(['front', 'side', 'back'] as const).map((v) => <CfImage key={v} slotId={`actor.sw017.body.neutral.${v}`} url={url(`actor.sw017.body.neutral.${v}`)} label={v.toUpperCase()} className="cf-bmap2__fig" />)}
          </button>
        </section>
        <section className="cf-bmap2__hist" data-testid="cf-baseline-history">
          <header><h3>BASELINE HISTORY</h3><button type="button" className="cf-inlink" data-testid="cf-body-inspect" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'BODY_INSPECTOR' })}>INSPECT <IcArrowR width={6} height={6} /></button></header>
          <ul>
            {[...state.bodyVersions].reverse().map((v) => (
              <li key={v.versionId} data-status={v.status}>
                <i><IcLock width={6} height={6} /></i>
                <span><b>{v.label}</b><small>{v.status === 'LOCKED' ? 'LOCKED BY FOUNDER' : v.status === 'SUPERSEDED' ? 'SUPERSEDED' : v.note}</small><small>{v.lockedAt ? v.lockedAt.slice(0, 16).replace('T', ' ') + 'Z' : ' '}</small></span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export const BodyView = BodyStation;

/* ── 5416 ───────────────────────────────────────────────────────────── */

const GUIDE_Y = [10, 34, 67, 138];

export function ContinuityInspector() {
  const { state, dispatch, now, url, actor, actors, character } = useFabrication();
  const nextActor = actors.find((a) => a.actorId !== state.selectedActorId && a.projectsUsed.length === 0) ?? actors[1]!;
  const cal = state.bodyCalibrated;
  const F = CALIBRATION_FIXTURE;
  const views = ['FRONT', 'SIDE', 'BACK'] as const;
  return (
    <div className="cf-insp" data-testid="cf-continuity-inspector">
      <div className="cf-insp__plate"><ChamberPlate h={685} cyl={{ top: 10, plat: 660 }} /></div>
      <header className="cf-insp__head">
        <span className="cf-insp__hex">02</span>
        <span className="cf-insp__tag">CONTINUITY<br />CALIBRATION</span>
        <b className="cf-insp__title">TECHNICAL SCALE INSPECTOR</b>
        <dl className="cf-insp__meta">
          <div><dt>ACTOR</dt><dd className="is-lg">{actor.catalogueNumber}</dd></div>
          <div><dt>CHARACTER</dt><dd>{character.displayName}</dd></div>
          <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
          <div><dt>ENTRY</dt><dd className="is-red">{state.selectedEntryId}</dd></div>
        </dl>
      </header>
      <section className="cf-insp__ov" data-testid="cf-model-overview">
        <h4>MODEL CONTINUITY OVERVIEW</h4>
        <div className="cf-insp__stage">
          {views.map((v) => (
            <button key={v} type="button" className={`cf-insp__view${state.bodyView === v ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'BODY_VIEW', view: v })} data-testid={`cf-bodyview-${v.toLowerCase()}`} aria-pressed={state.bodyView === v}>
              <CfImage slotId={`actor.sw017.body.neutral.${v.toLowerCase()}`} url={url(`actor.sw017.body.neutral.${v.toLowerCase()}`)} label={`${v} · NEUTRAL BODY`} className="cf-insp__img" />
              <em>{v}</em>
            </button>
          ))}
          <svg className="cf-insp__guides" viewBox="0 0 300 240" preserveAspectRatio="none" aria-hidden>
            {GUIDE_Y.map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} />)}
            {[50, 150, 250].map((x) => <line key={x} x1={x} x2={x} y1="0" y2="240" />)}
          </svg>
        </div>
      </section>
      <section className="cf-insp__align" data-testid="cf-alignment">
        <h4>ALIGNMENT STATUS</h4>
        <div className="cf-gauge2">
          <svg viewBox="0 0 50 50" aria-hidden>
            <circle cx="25" cy="25" r="22" className="cf-gauge2__t" />
            <circle cx="25" cy="25" r="22" className="cf-gauge2__a" strokeDasharray={`${cal ? (F.alignmentPct / 100) * 138.2 : 0} 138.2`} transform="rotate(-90 25 25)" />
          </svg>
          <b>{cal ? `${F.alignmentPct}%` : '—'}</b>
          <small>ALIGNMENT</small>
        </div>
        <dl className="cf-krows">
          <div><dt>STATUS</dt><dd>{cal ? <em className="cf-verified">WITHIN TOLERANCE</em> : 'NOT CALIBRATED'}</dd></div>
          <div><dt>REFERENCE</dt><dd>APPROVED BASE</dd></div>
          <div><dt>LAST CALIBRATED</dt><dd>{cal ? 'FIXTURE' : '—'}</dd></div>
        </dl>
        <button type="button" className="cf-cbtn" data-testid="cf-run-calibration" disabled={cal} onClick={() => dispatch({ type: 'RUN_CALIBRATION', at: now() })}>{cal ? 'CALIBRATION CURRENT' : 'RUN CALIBRATION'} <IcArrowR width={7} height={7} /></button>
      </section>
      <section className="cf-insp__var" data-testid="cf-variance">
        <h4>VARIANCE READOUT</h4>
        <dl className="cf-krows cf-krows--tight">
          {F.variance.map((v) => <div key={v.k}><dt>{v.k}</dt><dd>{cal ? `± ${v.v.toFixed(1)}%` : '—'}</dd></div>)}
          <div className="is-total"><dt>OVERALL VARIANCE</dt><dd>{cal ? `± ${F.overall.toFixed(1)}%` : '—'}</dd></div>
        </dl>
        <button type="button" className="cf-cbtn" data-testid="cf-inspector-back" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })}>BACK TO BODY STATION <IcArrowR width={7} height={7} /></button>
      </section>
      <section className="cf-insp__ol" data-testid="cf-overlay">
        <h4>CURRENT <span>vs</span> APPROVED OVERLAY</h4>
        <div className="cf-insp__face">
          <CfImage slotId="actor.sw017.portrait.primary" url={url('actor.sw017.portrait.primary')} label="CURRENT / APPROVED" className="cf-insp__faceimg" />
          <em className="l">CURRENT<small>ENTRY {state.selectedEntryId}</small></em>
          <em className="r">APPROVED<small>BASE MODEL</small></em>
          <i className="cf-insp__split" />
          <span className="cf-insp__leg"><i className="c" />CURRENT <i className="a" />APPROVED</span>
        </div>
        <div className="cf-insp__sil">
          {views.map((v) => (
            <button key={v} type="button" className={state.bodyView === v ? 'is-on' : ''} onClick={() => dispatch({ type: 'BODY_VIEW', view: v })} aria-label={`${v} silhouette`}>
              <small>{v}</small>
              <svg viewBox="0 0 60 150" aria-hidden>
                <path d="M30 6c5 0 8 4 8 9s-3 9-8 9-8-4-8-9 3-9 8-9zM22 26c-8 4-12 30-12 52l6 2 4-30 2 40-4 56h9l3-50 3 50h9l-4-56 2-40 4 30 6-2c0-22-4-48-12-52z" className="ap" />
                <path d="M30 4c5 0 8 4 8 9s-3 9-8 9-8-4-8-9 3-9 8-9zM21 25c-8 4-13 30-13 53l6 2 4-30 2 40-4 57h9l3-50 3 50h9l-4-57 2-40 4 30 6-2c0-23-5-49-13-53z" className="cu" />
              </svg>
            </button>
          ))}
          <span className="cf-insp__leg2"><i className="c" />CURRENT<br /><i className="a" />APPROVED</span>
        </div>
      </section>
      <section className="cf-insp__mv" data-testid="cf-movement-ref">
        <h4>MOVEMENT REFERENCE CONTEXT</h4>
        <div>{MOVEMENT_REFERENCES.map((m) => <figure key={m.refId}><CfImage slotId={`actor.sw017.movement.${m.refId}`} url={url(`actor.sw017.movement.${m.refId}`)} label={m.label} className="cf-insp__mvimg" /><figcaption>{m.label}</figcaption></figure>)}</div>
        <span className="cf-insp__next" aria-hidden><IcChevR width={7} height={7} /></span>
      </section>
      <div className="cf-insp__tri">
        <section className="cf-insp__cp" data-testid="cf-checkpoint">
          <span className="cf-insp__shield"><IcLock width={10} height={10} /></span>
          <span><b>CONTINUITY CHECKPOINT</b><small className={cal ? 'is-ok' : ''}>{cal ? 'Model consistency verified' : 'Calibration required'}</small><small className={cal ? 'is-ok' : ''}>{cal ? 'All systems nominal · fixture' : 'Run calibration'}</small></span>
        </section>
        <section className="cf-insp__set">
          <h4>CALIBRATION SETTINGS</h4>
          <dl className="cf-krows cf-krows--tight">
            <div><dt>REFERENCE MODEL</dt><dd>{F.referenceModel}</dd></div>
            <div><dt>TOLERANCE THRESHOLD</dt><dd>± {F.tolerance.toFixed(1)}%</dd></div>
            <div><dt>SCALE LOCK</dt><dd><Toggle on={state.scaleLock} onChange={() => dispatch({ type: 'TOGGLE_SCALE_LOCK' })} label="Scale lock" testId="cf-scale-lock" /></dd></div>
          </dl>
        </section>
        <section className="cf-insp__nx" data-testid="cf-inspect-next">
          <CfImage slotId={nextActor.portraitSlotId} url={url(nextActor.portraitSlotId)} label="" className="cf-insp__nximg" />
          <span><small>INSPECT NEXT</small><b>{nextActor.catalogueNumber}</b><small>{nextActor.entryLabel}</small></span>
          <IcChevR width={7} height={7} />
          <button type="button" className="cf-rbtn cf-rbtn--sm" data-testid="cf-inspect-next-btn" onClick={() => { dispatch({ type: 'SELECT_ACTOR', actorId: nextActor.actorId }); dispatch({ type: 'GOTO_STATION', station: 'identity' }); }}>INSPECT NEXT <IcArrowR width={8} height={8} /></button>
        </section>
      </div>
      <div className="cf-insp__rail"><FabricationStageRail /></div>
    </div>
  );
}
