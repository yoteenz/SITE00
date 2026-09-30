/**
 * 07 SIMULATION — authorities 5429 (Testing Ground configuration), 5426 (Running), 5427 (Result / Route & Resolve).
 * One testing system, three states. Fidelity is LEVEL 2 (cached, deterministic preview). There is no simulation
 * backend and Final Generation is never triggered. Reference numbering ("06 - TESTING GROUND") is corrected to 07.
 */
import type { ReactNode } from 'react';
import { SIM_TEST_DEFS, SIM_TEST_IDS, STATION_LABEL, previewTelemetry, requiredMotionFor, type SimTestId, type StationId } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck, IcClock, IcEye, IcFilter, IcMove, IcPause, IcPlay, IcPulse, IcRefresh, IcStop, IcUser } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { ChamberPlate, StandardHero, SubjectFigure } from './chamber';
import { Toggle } from './primitives';

const FEED = 'simulation.sw017.current.preview';
const tc = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
};
const mmss = (ms: number) => tc(ms).slice(3);

const TEST_GLYPH: Record<SimTestId, ReactNode> = {
  WALK: <IcMove width={9} height={9} />,
  IDLE: <svg viewBox="0 0 24 24" width="9" height="9" aria-hidden><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>,
  SIT: <IcUser width={9} height={9} />,
  TURN: <IcRefresh width={9} height={9} />,
  ENTER: <IcArrowR width={9} height={9} />,
  EXIT: <IcArrowR width={9} height={9} style={{ transform: 'scaleX(-1)' }} />,
  SPEAK: <IcPulse width={9} height={9} />,
  REACT: <IcPulse width={9} height={9} />,
  INTERACT: <IcUser width={9} height={9} />,
};

/* ── 5429 configuration ──────────────────────────────────────────────── */

export function TestingGround() {
  const { state, dispatch, now, url, blockers } = useFabrication();
  const cfg = state.simConfig;
  const t = SIM_TEST_DEFS[state.selectedTestId];
  const need = requiredMotionFor(state);
  const b = blockers('simulation');
  const canRun = !b.length && (!need || need.available);
  const Sel = <K extends 'durationSec' | 'intensity' | 'environment' | 'distractions' | 'cameraAngles'>({ k, label, opts, fmt = (v) => String(v), testId }: { k: K; label: string; opts: readonly (string | number)[]; fmt?: (v: string | number) => string; testId?: string }) => (
    <label className="cf-tg__cfgrow">
      <span>{label}</span>
      <select value={cfg[k] as string | number} onChange={(e) => dispatch({ type: 'SIM_CONFIG', patch: { [k]: typeof opts[0] === 'number' ? Number(e.target.value) : e.target.value } as never })} data-testid={testId}>
        {opts.map((o) => <option key={o} value={o}>{fmt(o)}</option>)}
      </select>
    </label>
  );
  return (
    <>
      <StandardHero h={350} railTop={295} cardTop={65} cyl={{ top: 20, plat: 268 }} fig={{ x: 181, y: 38, w: 72, h: 222 }} cardH={218} />
      <section className="cf-tg" data-testid="cf-testing-ground">
        <header className="cf-tg__head"><h2>07 - TESTING GROUND</h2><small>OBSERVE. MEASURE. VALIDATE PERFORMANCE.</small></header>
        <aside className="cf-tg__tests" data-testid="cf-test-list">
          <h4>BEHAVIORAL TEST</h4>
          <ul>
            {SIM_TEST_IDS.map((id) => (
              <li key={id}>
                <button type="button" className={state.selectedTestId === id ? 'is-on' : ''} onClick={() => dispatch({ type: 'SELECT_TEST', testId: id })} data-testid={`cf-test-${id}`} aria-pressed={state.selectedTestId === id}>
                  <i>{TEST_GLYPH[id]}</i><span>{id}</span>{state.selectedTestId === id ? <em><IcCheck width={5} height={5} /></em> : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <section className="cf-tg__mid">
          <p className="cf-tg__seltag"><small>SELECTED TEST</small><b>{state.selectedTestId}</b></p>
          <CfImage slotId={`simulation.sw017.test.${state.selectedTestId.toLowerCase()}.preview`} url={url(`simulation.sw017.test.${state.selectedTestId.toLowerCase()}.preview`)} label={`${state.selectedTestId} · TEST PREVIEW`} className="cf-tg__img" />
          <p className="cf-tg__desc"><small>TEST DESCRIPTION</small>{t.description}</p>
          <p className={`cf-tg__motion ${need ? (need.available ? 'is-ok' : 'is-red') : ''}`}>{need ? (need.available ? `MOTION ${need.motionId} AVAILABLE` : `MOTION ${need.motionId} MISSING`) : 'NO CATALOGUE MOTION REQUIRED'}{state.motionSentToTestingGround ? ` · SENT: ${state.motionSentToTestingGround}` : ''}</p>
        </section>
        <section className="cf-tg__cfg" data-testid="cf-sim-config">
          <h4>CONFIGURATION</h4>
          <Sel k="durationSec" label="DURATION" opts={[15, 30, 60, 120]} fmt={(v) => `${v} SEC`} testId="cf-cfg-duration" />
          <Sel k="intensity" label="INTENSITY" opts={['LOW', 'MEDIUM', 'HIGH']} testId="cf-cfg-intensity" />
          <Sel k="environment" label="ENVIRONMENT" opts={['NEUTRAL', 'STUDIO', 'STREET', 'INTERIOR']} testId="cf-cfg-environment" />
          <Sel k="distractions" label="DISTRACTIONS" opts={['NONE', 'MINIMAL', 'MODERATE']} />
          <Sel k="cameraAngles" label="CAMERA ANGLES" opts={[1, 2, 3, 4]} />
        </section>
        <section className="cf-tg__cap" data-testid="cf-capture">
          <h4>CAPTURE</h4>
          {(['video', 'audio', 'telemetry', 'biometrics'] as const).map((k) => <div key={k} className="cf-tg__caprow"><span>{k.toUpperCase()}</span><Toggle on={cfg.capture[k]} onChange={() => dispatch({ type: 'SIM_CAPTURE', key: k })} label={k} testId={`cf-cap-${k}`} /></div>)}
        </section>
        <section className="cf-tg__crit" data-testid="cf-criteria">
          <h4>CONTINUITY CRITERIA</h4>
          <div>{[['RESPONSE TIME', '< 1.2 SEC'], ['APPROPRIATENESS', '> 85%'], ['NATURALISM', '> 80%'], ['CONSISTENCY', '> 90%']].map(([k, v]) => <span key={k}><small>{k}</small><b>{v}</b><em>TARGET</em></span>)}</div>
        </section>
        <button type="button" className="cf-tg__run" data-testid="cf-run-test" aria-disabled={!canRun} onClick={() => dispatch({ type: 'RUN_TEST', at: now(), simulationId: `SIM-${String(state.results.length + 1).padStart(5, '0')}` })}>RUN TEST <IcPlay width={11} height={11} /></button>
      </section>
      {b.length ? (
        <div className="cf-interlock cf-tg__lock" data-testid="cf-run-blockers" role="group" aria-label="Simulation interlocks">
          <span className="cf-interlock__h">INTERLOCK · SIMULATION CANNOT RUN</span>
          <ul>{b.map((x) => <li key={x.blockerId}><i className="cf-socket" aria-hidden /><span>{x.message}</span></li>)}</ul>
        </div>
      ) : null}
      {need && !need.available ? (
        <div className="cf-interlock cf-tg__lock" data-testid="cf-run-missing-motion">
          <span className="cf-interlock__h">REQUIRED MOTION {need.motionId} DOES NOT EXIST</span>
          <button type="button" className="cf-cbtn" onClick={() => dispatch({ type: 'OPEN_MOTION_REQUEST', name: need.motionId })}>CREATE GENERATION REQUEST <IcArrowR width={7} height={7} /></button>
        </div>
      ) : null}
      <p className="cf-tg__fid">LEVEL 2 · SIMULATION PREVIEW (CACHED) — NO REAL-TIME SIMULATION BACKEND · FINAL GENERATION NOT TRIGGERED</p>
      {state.results.length ? (
        <div className="cf-tg__prev" data-testid="cf-previous-results">
          <h4>PREVIOUS RESULTS</h4>
          {state.results.map((x) => (
            <button key={x.simulationId} type="button" onClick={() => dispatch({ type: 'SIM_VIEW_RESULT', simulationId: x.simulationId })} data-testid={`cf-prev-${x.simulationId}`}>
              <b>{x.simulationId}</b><span>{x.testId}</span><em className={x.failed ? 'is-red' : 'is-ok'}>{x.failed ? `${x.failed} FAILED` : 'ALL PASS'}</em>
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

/* ── 5426 running ───────────────────────────────────────────────────── */

export function RunningSimulation() {
  const { state, dispatch, now, url, actor, character } = useFabrication();
  const r = state.run!;
  const total = r.config.durationSec * 1000;
  const progress = Math.min(1, r.elapsedMs / total);
  const tel = previewTelemetry(progress);
  const def = SIM_TEST_DEFS[r.testId];
  const marks = Array.from({ length: 7 }, (_, i) => (total / 6) * i);
  const live = r.status === 'RUNNING';
  return (
    <div className="cf-run" data-testid="cf-sim-running" data-run-status={r.status}>
      <section className="cf-run__feed" data-testid="cf-live-feed">
        <ChamberPlate h={357} cx={216} scale={1.9} cyl={{ top: -40, plat: 330 }} />
        <CfImage slotId={FEED} url={url(FEED)} label="" className="cf-run__feedimg" />
        {url(FEED) ? null : <SubjectFigure x={170} y={36} w={92} h={300} />}
        <svg className="cf-run__ret" viewBox="0 0 60 60" aria-hidden><circle cx="30" cy="30" r="14" /><path d="M30 6v14M30 40v14M6 30h14M40 30h14" /></svg>
        <i className="cf-run__frm is-tl" /><i className="cf-run__frm is-tr" /><i className="cf-run__frm is-bl" /><i className="cf-run__frm is-br" />
        <aside className="cf-run__actor" data-testid="cf-actor-card">
          <small>ACTOR</small><b>{actor.catalogueNumber}</b>
          <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="" className="cf-run__aimg" />
          <dl className="cf-krows">
            <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
            <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
            <div><dt>VERSION</dt><dd>{character.version}</dd></div>
            <div><dt>STATUS</dt><dd><em className="cf-infab">IN SIMULATION</em></dd></div>
          </dl>
          <button type="button" className="cf-cbtn" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'ACTOR_PROFILE' })}>VIEW ACTOR PROFILE <IcArrowR width={7} height={7} /></button>
        </aside>
        <aside className="cf-run__stat" data-testid="cf-run-hud">
          <small>SIMULATION STATION <span>07 <i className={live ? 'is-live' : ''} /></span></small>
          <h3>{live ? 'TEST RUNNING' : r.status === 'PAUSED' ? 'TEST PAUSED' : 'TEST ABORTED'}</h3>
          <dl>
            <div><dt>ELAPSED</dt><dd data-testid="cf-elapsed">{tc(r.elapsedMs)}</dd></div>
            <div><dt>PROGRESS</dt><dd className="is-red" data-testid="cf-progress">{Math.round(progress * 100)}%</dd></div>
          </dl>
          <i className="cf-run__pbar"><u style={{ width: `${progress * 100}%` }} /></i>
          <dl><div><dt>EST. REMAINING</dt><dd>{tc(Math.max(0, total - r.elapsedMs))}</dd></div></dl>
        </aside>
        <aside className="cf-run__hud is-tel">
          <h4>TELEMETRY <IcPulse width={8} height={8} /></h4>
          {state.simConfig.capture.telemetry ? (
            <dl className="cf-krows"><div><dt>HR</dt><dd>{tel.hr} BPM</dd></div><div><dt>RESP</dt><dd>{tel.resp} RPM</dd></div><div><dt>TEMP</dt><dd>{tel.temp}°C</dd></div><div><dt>FOCUS</dt><dd>{tel.focus}%</dd></div><div><dt>EXPOSURE</dt><dd>NOMINAL</dd></div></dl>
          ) : <p className="cf-run__off">TELEMETRY CAPTURE OFF</p>}
        </aside>
        <aside className="cf-run__hud is-cam">
          <h4>CAMERAS / TRACKING</h4>
          <dl className="cf-krows">
            {Array.from({ length: r.config.cameraAngles }, (_, i) => <div key={i}><dt>CAM {String(i + 1).padStart(2, '0')}</dt><dd><i className="cf-dot" />LOCKED</dd></div>)}
            <div><dt>VOLUME</dt><dd><i className="cf-dot" />ACTIVE</dd></div>
            <div><dt>DEPTH MAP</dt><dd><i className="cf-dot" />ACTIVE</dd></div>
          </dl>
        </aside>
        <aside className="cf-run__hud is-env">
          <h4>ENVIRONMENT</h4>
          <dl className="cf-krows"><div><dt>SET</dt><dd>{r.config.environment}</dd></div><div><dt>DISTRACTIONS</dt><dd>{r.config.distractions}</dd></div><div><dt>INTENSITY</dt><dd>{r.config.intensity}</dd></div><div><dt>CAPTURE</dt><dd>{state.simConfig.capture.video ? 'VIDEO' : '—'}{state.simConfig.capture.audio ? ' + AUDIO' : ''}</dd></div></dl>
        </aside>
        <span className="cf-run__tag" data-testid="cf-fidelity"><i /> {r.fidelity === 'SIMULATION_PREVIEW_CACHED' ? 'CACHED PREVIEW' : 'LIVE UI'}</span>
      </section>
      <section className="cf-run__tl" data-testid="cf-sim-timeline">
        <h4>SIMULATION TIMELINE</h4>
        <small className="cf-run__tot">TOTAL DURATION <b>{mmss(total)}</b></small>
        <div className="cf-run__scale">{marks.map((m, i) => <span key={i} className={m <= r.elapsedMs ? 'is-past' : ''} style={{ left: `${(i / 6) * 100}%` }}>{mmss(m)}</span>)}</div>
        <i className="cf-run__ticks" aria-hidden />
        <i className="cf-run__track"><u style={{ width: `${progress * 100}%` }} /></i>
        <i className="cf-run__head" style={{ left: `${progress * 100}%` }} />
        <b className="cf-run__chip" style={{ left: `${progress * 100}%` }}>{tc(r.elapsedMs)}</b>
      </section>
      <section className="cf-run__seq" data-testid="cf-current-sequence">
        <h4>CURRENT TEST SEQUENCE</h4>
        <small className="is-red">SEQ 01 / 01</small>
        <h3>{def.label}</h3>
        <p><b>TEST OBJECTIVE</b>{def.description}</p>
        <dl className="cf-krows"><div><dt>INTENSITY</dt><dd>{r.config.intensity}</dd></div><div><dt>DURATION</dt><dd>{tc(total)}</dd></div><div><dt>REPETITIONS</dt><dd>01 / 01</dd></div></dl>
        <button type="button" className="cf-cbtn" disabled>VIEW SEQUENCE DETAILS <IcArrowR width={7} height={7} /></button>
      </section>
      <section className="cf-run__met" data-testid="cf-live-metrics">
        <h4>LIVE METRICS <button type="button" className="cf-fbtn" disabled>FILTERS <IcFilter width={6} height={6} /></button></h4>
        <ul>{tel.metrics.map((m) => <li key={m.k}><span>{m.k}</span><b>{m.v}%</b><svg viewBox="0 0 40 10" aria-hidden><polyline points={Array.from({ length: 12 }, (_, i) => `${i * 3.6},${5 + Math.sin(i * 1.7 + m.v + progress * 12) * 3}`).join(' ')} /></svg></li>)}</ul>
      </section>
      <section className="cf-run__chk" data-testid="cf-run-checklist">
        <h4>CONTINUITY CHECKLIST</h4>
        <ul>{['HAIR / GROOMING', 'MAKEUP / SKIN', 'COSTUME / WARDROBE', 'MARKS / TATTOOS', 'PROPS', 'SCENE LIGHTING', 'CAMERA CALIBRATION', 'AUDIO SYNC'].map((k) => { const v = k === 'PROPS' ? 'N/A' : k === 'AUDIO SYNC' && !state.simConfig.capture.audio ? 'OFF' : 'OK'; return <li key={k}><span>{k}</span><b className={v === 'OK' ? 'is-ok' : ''}>{v}</b></li>; })}</ul>
        <small>{live ? 'UPDATING LIVE' : 'PAUSED'} <i className={live ? 'is-live' : ''} /></small>
      </section>
      <div className="cf-run__act">
        {r.status === 'RUNNING' ? <button type="button" className="cf-obtn cf-obtn--redt2" data-testid="cf-pause" onClick={() => dispatch({ type: 'SIM_PAUSE' })}>PAUSE TEST <IcPause width={11} height={11} /></button> : null}
        {r.status === 'PAUSED' ? <button type="button" className="cf-obtn cf-obtn--redt2" data-testid="cf-resume" onClick={() => dispatch({ type: 'SIM_RESUME' })}>RESUME TEST <IcPlay width={11} height={11} /></button> : null}
        {r.status === 'RUNNING' || r.status === 'PAUSED' ? <button type="button" className="cf-rbtn" data-testid="cf-abort" onClick={() => dispatch({ type: 'SIM_ABORT', at: now() })}>ABORT TEST <IcStop width={10} height={10} /></button> : null}
        {r.status === 'ABORTED' ? <button type="button" className="cf-rbtn" data-testid="cf-sim-dismiss" onClick={() => dispatch({ type: 'SIM_NEW' })}>BACK TO TESTING GROUND</button> : null}
      </div>
    </div>
  );
}

/* ── 5427 result ───────────────────────────────────────────────────── */

const ROUTE_ICON: Record<string, ReactNode> = { look: <IcEye width={11} height={11} />, performance: <IcMove width={11} height={11} />, accept: <IcCheck width={11} height={11} />, retest: <IcRefresh width={11} height={11} /> };

export function SimulationResult() {
  const { state, dispatch, now, url, actor, character } = useFabrication();
  const res = state.results.find((r) => r.simulationId === state.selectedSimulationId) ?? state.results[0];
  if (!res) return null;
  const owners = new Map<StationId, number>();
  res.checks.filter((c) => c.result === 'FAIL').forEach((c) => owners.set(c.owner, (owners.get(c.owner) ?? 0) + 1));
  const cards = [
    { key: 'look', small: 'ROUTE TO', title: 'LOOK', sub: 'Address visual continuity at Look station.', testId: 'cf-route-look', disabled: !owners.get('look'), on: () => dispatch({ type: 'ROUTE_VARIANCE', station: 'look', at: now() }) },
    { key: 'performance', small: 'ROUTE TO', title: 'PERFORMANCE', sub: 'Address motion & timing at Performance station.', testId: 'cf-route-performance', disabled: !owners.get('performance'), on: () => dispatch({ type: 'ROUTE_VARIANCE', station: 'performance', at: now() }) },
    { key: 'accept', small: 'ACCEPT', title: 'VARIANCE', sub: 'Accept variance and continue to next step.', testId: 'cf-accept-variance', disabled: !res.failed || res.accepted, on: () => dispatch({ type: 'ACCEPT_VARIANCE', at: now() }) },
    { key: 'retest', small: 'RETEST', title: 'SIMULATION', sub: 'Make adjustments and run simulation again.', testId: 'cf-retest', disabled: false, on: () => dispatch({ type: 'RUN_TEST', at: now(), simulationId: `SIM-${String(state.results.length + 1).padStart(5, '0')}` }) },
  ];
  const resp: { s: StationId; sub: string; icon: ReactNode }[] = [
    { s: 'look', sub: 'WARDROBE & APPEARANCE', icon: <IcEye width={10} height={10} /> },
    { s: 'performance', sub: 'MOTION & TIMING', icon: <IcMove width={10} height={10} /> },
    { s: 'simulation', sub: 'TEST & VALIDATION', icon: <IcCheck width={10} height={10} /> },
  ];
  return (
    <div className="cf-res" data-testid="cf-sim-result">
      <section className="cf-res__hero">
        <ChamberPlate h={275} cx={280} scale={1.5} cyl={{ top: -20, plat: 290 }} />
        <aside className="cf-res__card" data-testid="cf-result-summary">
          <small>SIMULATION</small>
          <h3>TEST RESULT</h3>
          <p>{res.failed ? 'WITH CONTINUITY VARIANCE' : 'NO CONTINUITY VARIANCE'}</p>
          <div className={`cf-res__verdict${res.failed ? '' : ' is-pass'}`}><small>OVERALL RESULT</small><b>{res.failed ? 'VARIANCE DETECTED' : 'NO VARIANCE'}</b><span>{res.failed} OF {res.checks.length} CHECKS FAILED</span></div>
          <dl>
            <div><dt>SIMULATION ID</dt><dd>{res.simulationId}</dd></div>
            <div><dt>COMPLETED</dt><dd>{res.completedAt.slice(0, 10)} · {res.completedAt.slice(11, 16)}Z</dd></div>
            <div><dt>DURATION</dt><dd>{tc(res.durationSec * 1000)}</dd></div>
            <div><dt>BASE ACTOR</dt><dd>{actor.catalogueNumber}</dd></div>
            <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
            <div><dt>VERSION</dt><dd>{character.version}</dd></div>
          </dl>
          <button type="button" className="cf-cbtn" data-testid="cf-sim-log" onClick={() => dispatch({ type: 'SIM_NEW' })}><IcClock width={7} height={7} /> BACK TO TESTING GROUND</button>
        </aside>
        <section className="cf-res__view">
          <CfImage slotId={FEED} url={url(FEED)} label="" className="cf-res__img" />
          {url(FEED) ? null : <SubjectFigure x={110} y={26} w={66} h={196} />}
          <small className="cf-res__vl">SIMULATION PREVIEW · CACHED</small>
          <small className="cf-res__vr">TEST {res.testId}</small>
          <span className="cf-res__scrub"><IcPlay width={7} height={7} /><i><u /></i><b>{mmss(res.durationSec * 1000)}</b></span>
        </section>
      </section>
      <section className="cf-res__checks" data-testid="cf-check-table">
        <h4>CONTINUITY CHECKS <small>{res.checks.length} CHECKS · <b>{res.failed} FAILED</b></small></h4>
        <table>
          <thead><tr><th>CHECK ITEM</th><th>EXPECTED</th><th>ACTUAL</th><th>DELTA</th><th>RESULT</th><th>EVIDENCE</th></tr></thead>
          <tbody>
            {res.checks.map((c) => (
              <tr key={c.checkId} className={c.result === 'FAIL' ? 'is-fail' : ''} data-check={c.checkId} data-result={c.result}>
                <td><b>{c.label}</b><small>{c.sub}</small></td>
                <td>{c.expected}</td><td>{c.actual}</td>
                <td className={c.result === 'FAIL' ? 'is-red' : 'is-dim'}>{c.delta}</td>
                <td><em className={c.result === 'FAIL' ? 'is-fail' : ''}>{c.result}</em></td>
                <td><CfImage slotId={c.evidenceSlotId} url={url(c.evidenceSlotId)} label="" className="cf-res__ev" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="cf-res__route" data-testid="cf-route-resolve">
        <h4>ROUTE &amp; RESOLVE <small>CHOOSE NEXT ACTION FOR THIS SIMULATION RESULT</small></h4>
        <div>
          {cards.map((c) => (
            <button key={c.key} type="button" className="cf-res__rc" data-testid={c.testId} disabled={c.disabled} onClick={c.on}>
              <i>{ROUTE_ICON[c.key]}</i><small>{c.small}</small><b>{c.title}</b><span>{c.sub}</span><IcArrowR width={8} height={8} />
            </button>
          ))}
        </div>
        {!res.failed ? <button type="button" className="cf-rbtn cf-res__approve" data-testid="cf-approve-sim" onClick={() => dispatch({ type: 'APPROVE_SIMULATION', at: now() })}>APPROVE SIMULATION <IcArrowR width={9} height={9} /></button> : null}
      </section>
      <section className="cf-res__resp" data-testid="cf-responsible">
        <h4>RESPONSIBLE STATIONS {res.routedTo.length ? <small>ROUTED: {res.routedTo.map((s) => STATION_LABEL[s]).join(', ')}</small> : res.accepted ? <small className="is-ok">VARIANCE ACCEPTED</small> : null}</h4>
        <div>
          {resp.map(({ s, sub, icon }) => {
            const n = owners.get(s) ?? 0;
            return (
              <button key={s} type="button" className={`cf-res__rs${n ? ' has' : ''}`} data-testid={`cf-resp-${s}`} onClick={() => dispatch({ type: 'GOTO_STATION', station: s })}>
                <i>{icon}</i><span><b>{STATION_LABEL[s]} STATION</b><small>{sub}</small><em>{n ? `${n} ISSUE${n > 1 ? 'S' : ''}` : 'NO ISSUES'}</em></span>{n ? <IcArrowR width={8} height={8} /> : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function SimulationStation() {
  const { state } = useFabrication();
  const r = state.run;
  if (r && (r.status === 'RUNNING' || r.status === 'PAUSED' || r.status === 'ABORTED')) return <RunningSimulation />;
  if (r && r.status === 'COMPLETE') return <SimulationResult />;
  return <TestingGround />;
}
