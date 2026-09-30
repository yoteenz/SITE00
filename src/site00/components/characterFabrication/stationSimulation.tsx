import { SIM_TEST_DEFS, SIM_TEST_IDS, previewTelemetry, requiredMotionFor, STATION_LABEL, type SimTestId, type StationId } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck, IcPause, IcPlay, IcStop } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { Panel, SlotNote, Toggle } from './primitives';

const tc = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
};

const TEST_ICON: Record<SimTestId, string> = { WALK: '⟿', IDLE: '○', SIT: '⌂', TURN: '↻', ENTER: '⇥', EXIT: '⇤', SPEAK: '◖', REACT: 'ϟ', INTERACT: '✋' };

const FIDELITY = {
  LIVE_UI_PREVIEW: 'LEVEL 1 · LIVE UI PREVIEW',
  SIMULATION_PREVIEW_CACHED: 'LEVEL 2 · SIMULATION PREVIEW (CACHED)',
} as const;

/** Testing Ground — configuration state (06/07 in the references; canonical station is 07 SIMULATION). */
export function TestingGround() {
  const { state, dispatch, now, url, blockers } = useFabrication();
  const cfg = state.simConfig;
  const t = SIM_TEST_DEFS[state.selectedTestId];
  const need = requiredMotionFor(state);
  const b = blockers('simulation');
  const canRun = !b.length && (!need || need.available);
  const setCfg = (patch: Parameters<typeof dispatch>[0] extends infer A ? (A extends { type: 'SIM_CONFIG'; patch: infer P } ? P : never) : never) => dispatch({ type: 'SIM_CONFIG', patch });
  return (
    <div className="cf-testing" data-testid="cf-testing-ground">
      <div className="cf-section-head"><h2><span className="cf-bar" />07 - TESTING GROUND</h2><small>OBSERVE. MEASURE. VALIDATE PERFORMANCE.</small></div>
      <div className="cf-testing__grid">
        <Panel title="BEHAVIORAL TEST" className="cf-tests" testId="cf-test-list">
          <ul>
            {SIM_TEST_IDS.map((id) => (
              <li key={id}>
                <button type="button" className={state.selectedTestId === id ? 'is-on' : ''} onClick={() => dispatch({ type: 'SELECT_TEST', testId: id })} data-testid={`cf-test-${id}`} aria-pressed={state.selectedTestId === id}>
                  <i aria-hidden>{TEST_ICON[id]}</i><span>{id}</span>{state.selectedTestId === id ? <IcCheck width={14} height={14} /> : null}
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="cf-testing__mid">
          <em className="cf-selected-test"><small>SELECTED TEST</small>{state.selectedTestId}</em>
          <CfImage slotId={`simulation.sw017.test.${state.selectedTestId.toLowerCase()}.preview`} url={url(`simulation.sw017.test.${state.selectedTestId.toLowerCase()}.preview`)} label={`${state.selectedTestId} PREVIEW`} className="cf-testing__img" />
          <p className="cf-lbl">TEST DESCRIPTION</p><p className="cf-desc">{t.description}</p>
          {need ? <p className={need.available ? 'cf-ok' : 'cf-red'}>{need.available ? `✓ MOTION ${need.motionId} AVAILABLE` : `✗ MOTION ${need.motionId} MISSING`}</p> : <p className="cf-dim">NO CATALOGUE MOTION REQUIRED</p>}
          {state.motionSentToTestingGround ? <p className="cf-lbl">MOTION SENT: <b>{state.motionSentToTestingGround}</b></p> : null}
        </div>
        <div className="cf-testing__cfg">
          <Panel title="CONFIGURATION" className="cf-mini cf-mini--plain" testId="cf-sim-config">
            <label className="cf-frow"><span>DURATION</span><select value={cfg.durationSec} onChange={(e) => setCfg({ durationSec: Number(e.target.value) as 15 | 30 | 60 | 120 })} data-testid="cf-cfg-duration">{[15, 30, 60, 120].map((d) => <option key={d} value={d}>{d} SEC</option>)}</select></label>
            <label className="cf-frow"><span>INTENSITY</span><select value={cfg.intensity} onChange={(e) => setCfg({ intensity: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })} data-testid="cf-cfg-intensity">{['LOW', 'MEDIUM', 'HIGH'].map((d) => <option key={d}>{d}</option>)}</select></label>
            <label className="cf-frow"><span>ENVIRONMENT</span><select value={cfg.environment} onChange={(e) => setCfg({ environment: e.target.value as 'NEUTRAL' | 'STUDIO' | 'STREET' | 'INTERIOR' })} data-testid="cf-cfg-environment">{['NEUTRAL', 'STUDIO', 'STREET', 'INTERIOR'].map((d) => <option key={d}>{d}</option>)}</select></label>
            <label className="cf-frow"><span>DISTRACTIONS</span><select value={cfg.distractions} onChange={(e) => setCfg({ distractions: e.target.value as 'NONE' | 'MINIMAL' | 'MODERATE' })}>{['NONE', 'MINIMAL', 'MODERATE'].map((d) => <option key={d}>{d}</option>)}</select></label>
            <label className="cf-frow"><span>CAMERA ANGLES</span><select value={cfg.cameraAngles} onChange={(e) => setCfg({ cameraAngles: Number(e.target.value) as 1 | 2 | 3 | 4 })}>{[1, 2, 3, 4].map((d) => <option key={d}>{d}</option>)}</select></label>
          </Panel>
          <Panel title="CAPTURE" className="cf-mini cf-mini--plain" testId="cf-capture">
            {(['video', 'audio', 'telemetry', 'biometrics'] as const).map((k) => <div key={k} className="cf-frow"><span>{k.toUpperCase()}</span><Toggle on={cfg.capture[k]} onChange={() => dispatch({ type: 'SIM_CAPTURE', key: k })} label={k} testId={`cf-cap-${k}`} /></div>)}
          </Panel>
        </div>
      </div>
      <Panel title="CONTINUITY CRITERIA" className="cf-criteria" testId="cf-criteria">
        <div className="cf-criteria__row">
          {[['RESPONSE TIME', '< 1.2 SEC'], ['APPROPRIATENESS', '> 85%'], ['NATURALISM', '> 80%'], ['CONSISTENCY', '> 90%']].map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b><em>TARGET</em></div>)}
        </div>
      </Panel>
      {b.length ? <ul className="cf-runblock" data-testid="cf-run-blockers">{b.map((x) => <li key={x.blockerId}>BLOCKED · {x.message}</li>)}</ul> : null}
      {need && !need.available ? (
        <div className="cf-runblock cf-runblock--motion" data-testid="cf-run-missing-motion">
          <span>REQUIRED MOTION {need.motionId} DOES NOT EXIST.</span>
          <button type="button" className="cf-btn cf-btn--line cf-btn--sm" onClick={() => dispatch({ type: 'OPEN_MOTION_REQUEST', name: need.motionId })}>CREATE GENERATION REQUEST</button>
        </div>
      ) : null}
      <SlotNote text={`${FIDELITY.SIMULATION_PREVIEW_CACHED} — NO REAL-TIME SIMULATION BACKEND. RUN TEST DRIVES A DETERMINISTIC PREVIEW; FINAL GENERATION IS NOT TRIGGERED.`} />
      <div className="cf-actions">
        <button type="button" className="cf-btn cf-btn--red cf-btn--xl" data-testid="cf-run-test" aria-disabled={!canRun} onClick={() => dispatch({ type: 'RUN_TEST', at: now(), simulationId: `SIM-${String(state.results.length + 1).padStart(5, '0')}` })}>RUN TEST <IcPlay width={16} height={16} /></button>
      </div>
    </div>
  );
}

/** Running / paused / aborted state. */
export function RunningSimulation() {
  const { state, dispatch, now, url, actor, character } = useFabrication();
  const r = state.run!;
  const total = r.config.durationSec * 1000;
  const progress = r.elapsedMs / total;
  const tel = previewTelemetry(progress);
  const seqs = [SIM_TEST_DEFS[r.testId]];
  const marks = Array.from({ length: 7 }, (_, i) => Math.round((r.config.durationSec / 6) * i));
  return (
    <div className="cf-running" data-testid="cf-sim-running" data-run-status={r.status}>
      <section className="cf-feed" data-testid="cf-live-feed">
        <CfImage slotId="simulation.sw017.current.preview" url={url('simulation.sw017.current.preview')} label="LIVE FEED SLOT" className="cf-feed__img" />
        <svg className="cf-feed__reticle" viewBox="0 0 100 100" aria-hidden><circle cx="50" cy="50" r="12" /><path d="M50 30v10M50 60v10M30 50h10M60 50h10" /></svg>
        <div className="cf-feed__left">
          <div className="cf-hud">
            <b>ACTOR</b><h3>{actor.catalogueNumber}</h3>
            <dl className="cf-kv cf-kv--tight cf-kv--tiny"><div><dt>PROJECT</dt><dd>NDXBOOK</dd></div><div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div><div><dt>VERSION</dt><dd>{character.version}</dd></div><div><dt>STATUS</dt><dd><em className="cf-tag cf-tag--red">IN SIMULATION</em></dd></div></dl>
            <button type="button" className="cf-btn cf-btn--line cf-btn--sm" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'ACTOR_PROFILE' })}>VIEW ACTOR PROFILE <IcArrowR width={12} height={12} /></button>
          </div>
          <div className="cf-hud cf-hud--run" data-testid="cf-run-hud">
            <small>SIMULATION STATION 07 <i className="cf-livedot" /></small>
            <h3 className="cf-red">{r.status === 'RUNNING' ? 'TEST RUNNING' : r.status === 'PAUSED' ? 'TEST PAUSED' : 'TEST ABORTED'}</h3>
            <dl className="cf-kv cf-kv--tiny"><div><dt>ELAPSED</dt><dd data-testid="cf-elapsed">{tc(r.elapsedMs)}</dd></div><div><dt>PROGRESS</dt><dd className="cf-red" data-testid="cf-progress">{Math.round(progress * 100)}%</dd></div></dl>
            <i className="cf-hud__bar"><u style={{ width: `${progress * 100}%` }} /></i>
            <dl className="cf-kv cf-kv--tiny"><div><dt>EST. REMAINING</dt><dd>{tc(Math.max(0, total - r.elapsedMs))}</dd></div></dl>
          </div>
        </div>
        <div className="cf-feed__right">
          <div className="cf-hud"><b>TELEMETRY</b>{state.simConfig.capture.telemetry ? <dl className="cf-kv cf-kv--tiny"><div><dt>HR</dt><dd>{tel.hr} BPM</dd></div><div><dt>RESP</dt><dd>{tel.resp} RPM</dd></div><div><dt>TEMP</dt><dd>{tel.temp}°C</dd></div><div><dt>FOCUS</dt><dd>{tel.focus}%</dd></div><div><dt>EXPOSURE</dt><dd>NOMINAL</dd></div></dl> : <p className="cf-dim">TELEMETRY CAPTURE OFF</p>}</div>
          <div className="cf-hud"><b>CAMERAS / TRACKING</b><dl className="cf-kv cf-kv--tiny">{Array.from({ length: r.config.cameraAngles }, (_, i) => <div key={i}><dt>CAM {String(i + 1).padStart(2, '0')}</dt><dd className="cf-ok">● LOCKED</dd></div>)}<div><dt>VOLUME</dt><dd className="cf-ok">● ACTIVE</dd></div><div><dt>DEPTH MAP</dt><dd className="cf-ok">● ACTIVE</dd></div></dl></div>
          <div className="cf-hud"><b>ENVIRONMENT</b><dl className="cf-kv cf-kv--tiny"><div><dt>SET</dt><dd>{r.config.environment}</dd></div><div><dt>TEMP</dt><dd>22.1°C</dd></div><div><dt>HUMIDITY</dt><dd>41%</dd></div><div><dt>AIRFLOW</dt><dd>NOMINAL</dd></div></dl></div>
        </div>
        <span className="cf-feed__tag" data-testid="cf-fidelity"><i className="cf-livedot" /> {FIDELITY[r.fidelity]}</span>
      </section>
      <Panel title="SIMULATION TIMELINE" right={<small className="cf-dim">TOTAL DURATION {tc(total).slice(3)}</small>} className="cf-timeline" testId="cf-sim-timeline">
        <div className="cf-tl"><div className="cf-tl__scale">{marks.map((m) => <span key={m}>{tc(m * 1000).slice(3)}</span>)}</div><i className="cf-tl__bar"><u style={{ width: `${progress * 100}%` }} /></i><b className="cf-tl__head" style={{ left: `${progress * 100}%` }}>{tc(r.elapsedMs).slice(3)}</b></div>
      </Panel>
      <div className="cf-triple cf-triple--run">
        <Panel title="CURRENT TEST SEQUENCE" sub={`SEQ 01 / 01`} className="cf-mini" testId="cf-current-sequence">
          <h4 className="cf-h3">{seqs[0]!.label}</h4><p className="cf-lbl">TEST OBJECTIVE</p><p className="cf-desc">{seqs[0]!.description}</p>
          <dl className="cf-kv cf-kv--rows cf-kv--tiny"><div><dt>INTENSITY</dt><dd>{r.config.intensity}</dd></div><div><dt>DURATION</dt><dd>{tc(total).slice(3)}</dd></div><div><dt>REPETITIONS</dt><dd>01 / 01</dd></div></dl>
        </Panel>
        <Panel title="LIVE METRICS" className="cf-mini" testId="cf-live-metrics">
          <ul className="cf-metrics">{tel.metrics.map((m) => <li key={m.k}><span>{m.k}</span><b>{m.v}%</b><svg viewBox="0 0 40 10" aria-hidden><polyline points={Array.from({ length: 10 }, (_, i) => `${i * 4.4},${5 + Math.sin(i * 1.6 + m.v + progress * 12) * 3}`).join(' ')} /></svg></li>)}</ul>
        </Panel>
        <Panel title="CONTINUITY CHECKLIST" className="cf-mini" testId="cf-run-checklist">
          <ul className="cf-cl">{['HAIR / GROOMING', 'MAKEUP / SKIN', 'COSTUME / WARDROBE', 'MARKS / TATTOOS', 'PROPS', 'SCENE LIGHTING', 'CAMERA CALIBRATION', 'AUDIO SYNC'].map((k) => <li key={k}><span>{k}</span><b className={k === 'PROPS' ? 'cf-dim' : 'cf-ok'}>{k === 'PROPS' ? 'N/A' : k === 'AUDIO SYNC' && !state.simConfig.capture.audio ? 'OFF' : 'OK'}</b></li>)}</ul>
          <small className="cf-red">UPDATING LIVE ●</small>
        </Panel>
      </div>
      <div className="cf-actions cf-actions--run">
        {r.status === 'RUNNING' ? <button type="button" className="cf-btn cf-btn--redline cf-btn--lg" data-testid="cf-pause" onClick={() => dispatch({ type: 'SIM_PAUSE' })}>PAUSE TEST <IcPause width={16} height={16} /></button> : null}
        {r.status === 'PAUSED' ? <button type="button" className="cf-btn cf-btn--redline cf-btn--lg" data-testid="cf-resume" onClick={() => dispatch({ type: 'SIM_RESUME' })}>RESUME TEST <IcPlay width={16} height={16} /></button> : null}
        {r.status === 'RUNNING' || r.status === 'PAUSED' ? <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-abort" onClick={() => dispatch({ type: 'SIM_ABORT', at: now() })}>ABORT TEST <IcStop width={16} height={16} /></button> : null}
        {r.status === 'ABORTED' ? <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-sim-dismiss" onClick={() => dispatch({ type: 'SIM_NEW' })}>BACK TO TESTING GROUND</button> : null}
      </div>
    </div>
  );
}

export function SimulationResult() {
  const { state, dispatch, now, url, actor, character } = useFabrication();
  const res = state.results.find((r) => r.simulationId === state.selectedSimulationId) ?? state.results[0];
  if (!res) return null;
  const failedChecks = res.checks.filter((c) => c.result === 'FAIL');
  const owners = new Map<StationId, number>();
  failedChecks.forEach((c) => owners.set(c.owner, (owners.get(c.owner) ?? 0) + 1));
  const routes: { station: StationId; label: string; sub: string }[] = [
    { station: 'look', label: 'LOOK', sub: 'Address visual continuity at Look station.' },
    { station: 'performance', label: 'PERFORMANCE', sub: 'Address motion & timing at Performance station.' },
  ];
  return (
    <div className="cf-result" data-testid="cf-sim-result">
      <section className="cf-result__top">
        <aside className="cf-resultcard" data-testid="cf-result-summary">
          <small>SIMULATION</small><h3>TEST RESULT</h3>
          <p className="cf-red">{res.failed ? 'WITH CONTINUITY VARIANCE' : 'ALL CHECKS PASSED'}</p>
          <div className={`cf-verdict${res.failed ? '' : ' is-pass'}`}><small>OVERALL RESULT</small><b>{res.failed ? 'VARIANCE DETECTED' : 'NO VARIANCE'}</b><span>{res.failed} OF {res.checks.length} CHECKS FAILED</span></div>
          <dl className="cf-kv cf-kv--rows cf-kv--tiny"><div><dt>SIMULATION ID</dt><dd>{res.simulationId}</dd></div><div><dt>COMPLETED</dt><dd>{new Date(res.completedAt).toISOString().replace('T', ' · ').slice(0, 21)}Z</dd></div><div><dt>DURATION</dt><dd>{tc(res.durationSec * 1000)}</dd></div><div><dt>BASE ACTOR</dt><dd>{actor.catalogueNumber}</dd></div><div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div><div><dt>VERSION</dt><dd>{character.version}</dd></div><div><dt>TEST</dt><dd>{res.testId}</dd></div></dl>
          <button type="button" className="cf-btn cf-btn--line cf-btn--sm" onClick={() => dispatch({ type: 'SIM_NEW' })} data-testid="cf-sim-log">BACK TO TESTING GROUND</button>
        </aside>
        <div className="cf-resultview">
          <CfImage slotId="simulation.sw017.current.preview" url={url('simulation.sw017.current.preview')} label="SIMULATION PREVIEW SLOT" className="cf-resultview__img" />
          <span className="cf-resultview__tag">SIMULATION PREVIEW · CACHED</span>
        </div>
      </section>
      <Panel title="CONTINUITY CHECKS" right={<small>{res.checks.length} CHECKS · <b className="cf-red">{res.failed} FAILED</b></small>} className="cf-checks-table" testId="cf-check-table">
        <table>
          <thead><tr><th>CHECK ITEM</th><th>EXPECTED</th><th>ACTUAL</th><th>DELTA</th><th>RESULT</th><th>EVIDENCE</th></tr></thead>
          <tbody>
            {res.checks.map((c) => (
              <tr key={c.checkId} className={c.result === 'FAIL' ? 'is-fail' : ''} data-check={c.checkId} data-result={c.result}>
                <td><b>{c.label}</b><small>{c.sub}</small></td><td>{c.expected}</td><td>{c.actual}</td><td className={c.result === 'FAIL' ? 'cf-red' : 'cf-dim'}>{c.delta}</td>
                <td><em className={`cf-result-chip ${c.result === 'FAIL' ? 'is-fail' : ''}`}>{c.result}</em></td>
                <td><CfImage slotId={c.evidenceSlotId} url={url(c.evidenceSlotId)} label="" className="cf-evidence" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Panel title="ROUTE & RESOLVE" sub="CHOOSE NEXT ACTION FOR THIS SIMULATION RESULT" className="cf-route" testId="cf-route-resolve">
        <div className="cf-route__grid">
          {routes.map((r) => (
            <button key={r.station} type="button" className="cf-route__card" disabled={!owners.get(r.station)} data-testid={`cf-route-${r.station}`} onClick={() => dispatch({ type: 'ROUTE_VARIANCE', station: r.station, at: now() })}>
              <small>ROUTE TO</small><b>{r.label}</b><span>{r.sub}</span><IcArrowR width={16} height={16} />
            </button>
          ))}
          <button type="button" className="cf-route__card" data-testid="cf-accept-variance" disabled={!res.failed || res.accepted} onClick={() => dispatch({ type: 'ACCEPT_VARIANCE', at: now() })}><small>ACCEPT</small><b>VARIANCE</b><span>Accept variance and continue to next step.</span><IcArrowR width={16} height={16} /></button>
          <button type="button" className="cf-route__card" data-testid="cf-retest" onClick={() => dispatch({ type: 'RUN_TEST', at: now(), simulationId: `SIM-${String(state.results.length + 1).padStart(5, '0')}` })}><small>RETEST</small><b>SIMULATION</b><span>Make adjustments and run simulation again.</span><IcArrowR width={16} height={16} /></button>
        </div>
        {!res.failed ? <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-approve-sim" onClick={() => dispatch({ type: 'APPROVE_SIMULATION', at: now() })}>APPROVE SIMULATION <IcArrowR width={14} height={14} /></button> : null}
        <h4 className="cf-subhead">RESPONSIBLE STATIONS</h4>
        <div className="cf-resp" data-testid="cf-responsible">
          {(['look', 'performance', 'simulation'] as StationId[]).map((s) => {
            const n = owners.get(s) ?? 0;
            return <button key={s} type="button" className={`cf-resp__btn${n ? ' has' : ''}`} data-testid={`cf-resp-${s}`} onClick={() => dispatch({ type: 'GOTO_STATION', station: s })}><b>{STATION_LABEL[s]} STATION</b><small>{n ? `${n} ISSUE${n > 1 ? 'S' : ''}` : 'NO ISSUES'}</small></button>;
          })}
        </div>
        {res.routedTo.length ? <p className="cf-fixture">ROUTED TO: {res.routedTo.map((s) => STATION_LABEL[s]).join(', ')}</p> : null}
        {res.accepted ? <p className="cf-ok">✓ VARIANCE ACCEPTED</p> : null}
      </Panel>
    </div>
  );
}

export function SimulationStation() {
  const { state, dispatch } = useFabrication();
  const r = state.run;
  if (r && (r.status === 'RUNNING' || r.status === 'PAUSED' || r.status === 'ABORTED')) return <RunningSimulation />;
  if (r && r.status === 'COMPLETE') return <SimulationResult />;
  return (
    <>
      <TestingGround />
      {state.results.length ? (
        <div className="cf-prev" data-testid="cf-previous-results">
          <h4 className="cf-subhead">PREVIOUS RESULTS</h4>
          {state.results.map((x) => (
            <button key={x.simulationId} type="button" className="cf-prev__row" onClick={() => dispatch({ type: 'SIM_VIEW_RESULT', simulationId: x.simulationId })} data-testid={`cf-prev-${x.simulationId}`}>
              <b>{x.simulationId}</b><span>{x.testId}</span><em className={x.failed ? 'cf-red' : 'cf-ok'}>{x.failed ? `${x.failed} FAILED` : 'ALL PASS'}</em>
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
