/**
 * 06 PERFORMANCE — authorities 5424 (Performance / motion library + inspect) and 5425 (Motion Request).
 * Reference numbering errors (07 / 02) are corrected to the canonical 06.
 * Motions are reusable catalogue objects; a missing motion becomes a structured generation request — never invented.
 */
import { useEffect, useState } from 'react';
import { MOTION_LIBRARY, MOTION_LIFECYCLE, motionById, type MotionAsset } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck, IcClock, IcExpand, IcFilter, IcPaperclip, IcPause, IcPlay, IcSkipL, IcSkipR, IcSliders, IcWarn } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { FabricationStageRail } from './primitives';

const fmt = (s: number) => `${String(Math.floor(s)).padStart(2, '0')}:${String(Math.round((s % 1) * 100)).padStart(2, '0')}`;
const STAGE_SUB: Record<(typeof MOTION_LIFECYCLE)[number], string> = {
  REQUEST_SUBMISSION: 'Queued for animation team review',
  MOTION_PRODUCTION: 'Animation + cleanup',
  INTERNAL_REVIEW: 'Technical + performance check',
  SIMULATION_INTEGRATION: 'Apply to rig and environment',
  QA_APPROVAL: 'Final validation',
  PUBLISH_ASSET: 'Ready for downstream use',
};

/* ── 5424 ───────────────────────────────────────────────────────────── */

export function PerformanceStation() {
  const { state, dispatch, now, url, actor, character, status } = useFabrication();
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const library: MotionAsset[] = [...state.publishedMotions, ...MOTION_LIBRARY];
  const list = library.filter((m) => !q.trim() || `${m.motionId} ${m.label}`.toLowerCase().includes(q.trim().toLowerCase()));
  const sel = motionById(state, state.selectedMotionId) ?? MOTION_LIBRARY[0]!;
  const used = state.motionUsedIds.includes(sel.motionId);
  const [t, setT] = useState(0);
  useEffect(() => setT(0), [sel.motionId]);
  useEffect(() => {
    if (!state.motionPlaying) return;
    const id = window.setInterval(() => setT((x) => (x + 0.1 * state.motionRate >= sel.durationSec ? (dispatch({ type: 'MOTION_PLAY', playing: false }), sel.durationSec) : x + 0.1 * state.motionRate)), 100);
    return () => window.clearInterval(id);
  }, [state.motionPlaying, state.motionRate, sel.durationSec, dispatch]);
  const inFab = status('authority') !== 'LOCKED';
  return (
    <div className="cf-pf" data-testid="cf-performance-station">
      <section className="cf-pf__strip">
        <div className="is-actor"><CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="" className="cf-pf__simg" /><span><small>ACTOR</small><b>{actor.catalogueNumber}</b></span></div>
        <div><small>ENTRY</small><b>{state.selectedEntryId}</b></div>
        <div><small>PROJECT</small><b className="is-sm">{state.selectedProjectId.toUpperCase()}</b></div>
        <div><small>STATUS</small><em className="cf-infab">{inFab ? 'IN FABRICATION' : 'CANONICAL'}</em></div>
      </section>
      <header className="cf-pf__head">
        <h2>06 - PERFORMANCE</h2>
        <small>PRODUCTION MOTION TESTING</small>
        <button type="button" className="cf-obtn cf-pf__brief" data-testid="cf-performance-brief" onClick={() => dispatch({ type: 'GOTO_STATION', station: 'character' })}>PERFORMANCE BRIEF <IcExpand width={7} height={7} /></button>
      </header>
      <section className="cf-pf__body">
        <aside className="cf-pf__lib" data-testid="cf-motion-library">
          <h4>MOTION LIBRARY <span>{library.length} ITEMS</span><button type="button" className="cf-pf__filter" aria-label="Search motions" aria-pressed={searching} onClick={() => setSearching((v) => !v)}><IcFilter width={7} height={7} /></button></h4>
          {searching ? <input type="search" className="cf-pf__search" placeholder="SEARCH MOTIONS" value={q} onChange={(e) => setQ(e.target.value)} data-testid="cf-motion-search" autoFocus /> : null}
          <ul>
            {list.map((m) => {
              const on = m.motionId === state.selectedMotionId;
              return (
                <li key={m.motionId}>
                  <button type="button" className={on ? 'is-on' : ''} onClick={() => dispatch({ type: 'SELECT_MOTION', motionId: m.motionId })} data-testid={`cf-motion-${m.motionId}`} aria-pressed={on}>
                    <CfImage slotId={m.slotId} url={url(m.slotId)} label="" className="cf-pf__mimg" />
                    <span><b>{m.motionId}</b><small>{m.label}</small><small><i>DURATION</i> {fmt(m.durationSec)}</small></span>
                    {on ? <em className="cf-pf__selt">SELECTED</em> : null}
                    {on || state.motionUsedIds.includes(m.motionId) ? <i className="cf-pf__tick"><IcCheck width={5} height={5} /></i> : null}
                  </button>
                </li>
              );
            })}
            {!list.length ? (
              <li className="cf-pf__missing" data-testid="cf-motion-missing">
                <IcWarn width={10} height={10} />
                <b>NO MOTION MATCHES “{q.toUpperCase()}”</b>
                <button type="button" className="cf-rbtn cf-rbtn--sm" data-testid="cf-request-from-search" onClick={() => dispatch({ type: 'OPEN_MOTION_REQUEST', name: q })}>REQUEST NEW MOTION</button>
              </li>
            ) : null}
          </ul>
          <button type="button" className="cf-obtn cf-pf__browse" onClick={() => setSearching(true)}>BROWSE ALL MOTIONS <IcArrowR width={7} height={7} /></button>
        </aside>
        <section className="cf-pf__insp" data-testid="cf-motion-inspect">
          <h4>MOTION INSPECT</h4>
          <div className="cf-pf__player">
            <CfImage slotId={sel.slotId} url={url(sel.slotId)} label={`${sel.motionId} · MOTION PREVIEW`} className="cf-pf__pimg" />
            <i className="cf-pf__br is-tl" /><i className="cf-pf__br is-tr" /><i className="cf-pf__br is-bl" /><i className="cf-pf__br is-br" />
            <b className="cf-pf__name">{sel.motionId}</b>
            <em className="cf-pf__tag">{used ? 'MOTION IN USE' : 'MOTION SELECTED'}</em>
            <span className="cf-pf__time"><span>{fmt(t)}</span><span>{fmt(sel.durationSec)}</span></span>
            <span className="cf-pf__bar"><u style={{ width: `${(t / sel.durationSec) * 100}%` }} /><i style={{ left: `${(t / sel.durationSec) * 100}%` }} /></span>
            <span className="cf-pf__ctl">
              <button type="button" aria-label="Restart" onClick={() => setT(0)}><IcSkipL width={8} height={8} /></button>
              <button type="button" className="cf-pf__play" aria-label={state.motionPlaying ? 'Pause' : 'Play'} aria-pressed={state.motionPlaying} data-testid="cf-motion-play" onClick={() => dispatch({ type: 'MOTION_PLAY', playing: !state.motionPlaying })}>{state.motionPlaying ? <IcPause width={9} height={9} /> : <IcPlay width={9} height={9} />}</button>
              <button type="button" aria-label="End" onClick={() => setT(sel.durationSec)}><IcSkipR width={8} height={8} /></button>
            </span>
            <select className="cf-pf__rate" value={state.motionRate} onChange={(e) => dispatch({ type: 'MOTION_RATE', rate: Number(e.target.value) as 0.5 | 1 | 1.5 | 2 })} aria-label="Playback rate" data-testid="cf-motion-rate">{[0.5, 1, 1.5, 2].map((r) => <option key={r} value={r}>{r.toFixed(1)}x</option>)}</select>
          </div>
          <section className="cf-pf__prov" data-testid="cf-motion-provenance">
            <h5>MOTION PROVENANCE</h5>
            <dl className="cf-krows">
              <div><dt>CAPTURE DATE</dt><dd>{sel.capture.date}</dd></div>
              <div><dt>CAPTURE TIME</dt><dd>{sel.capture.time}</dd></div>
              <div><dt>STUDIO</dt><dd>{sel.capture.studio}</dd></div>
              <div><dt>VOLUME</dt><dd>{sel.capture.volume}</dd></div>
              <div><dt>RIG</dt><dd>{sel.capture.rig}</dd></div>
              <div><dt>SENSOR SET</dt><dd>{sel.capture.sensors}</dd></div>
              <div><dt>RESOLUTION</dt><dd>{sel.capture.resolution}</dd></div>
              <div><dt>OPERATOR</dt><dd>{sel.capture.operator}</dd></div>
              <div><dt>NOTES</dt><dd>{sel.capture.notes}</dd></div>
            </dl>
            <button type="button" className="cf-cbtn" disabled title="No capture-log service yet">VIEW CAPTURE LOG <IcArrowR width={7} height={7} /></button>
          </section>
          <section className="cf-pf__bio" data-testid="cf-biomech">
            <h5>BIOMECHANICAL CONTINUITY <span>READOUT <em>LIB</em></span></h5>
            <CfImage slotId="motion.sw017.rig.wireframe" url={url('motion.sw017.rig.wireframe')} label="RIG WIREFRAME" className="cf-pf__rig" />
            <ul>{sel.biomechanics.map((r) => <li key={r.k}><small>{r.k}</small><i><u style={{ width: `${r.v}%` }} /></i><b>{r.v}%</b></li>)}</ul>
            <p className="cf-pf__ok"><IcCheck width={6} height={6} /> CONTINUITY OPTIMAL · LIBRARY RECORD</p>
          </section>
        </section>
      </section>
      <section className="cf-pf__rigstrip">
        <CfImage slotId={character.portraitSlotId} url={url(character.portraitSlotId)} label="" className="cf-pf__rsimg" />
        <span className="cf-pf__rsn"><small>{character.displayName}</small><b>{actor.catalogueNumber}</b><small><i>ENTRY</i> {state.selectedEntryId}</small></span>
        <dl><div><dt>RIG PROFILE</dt><dd>ATHLETIC / {character.version}</dd></div><div><dt>SKELETAL MAP</dt><dd>HUMAN / FEMALE</dd></div></dl>
        <button type="button" className="cf-obtn" disabled title="No rig-map viewer yet">VIEW RIG MAP <IcArrowR width={7} height={7} /></button>
      </section>
      <div className="cf-pf__act">
        <button type="button" className="cf-obtn cf-obtn--red cf-pf__use" data-testid="cf-use-motion" onClick={() => dispatch({ type: 'USE_MOTION', at: now() })}>{used ? 'MOTION IN USE' : 'USE MOTION'} <IcArrowR width={11} height={11} /></button>
        <button type="button" className="cf-obtn cf-pf__cfg" aria-label="Missing a motion? Create a generation request" data-testid="cf-open-motion-request" onClick={() => dispatch({ type: 'OPEN_MOTION_REQUEST' })}><IcSliders width={12} height={12} /></button>
        <button type="button" className="cf-rbtn cf-pf__send" data-testid="cf-send-testing" onClick={() => dispatch({ type: 'SEND_TO_TESTING_GROUND', at: now() })}>SEND TO TESTING GROUND <IcArrowR width={11} height={11} /></button>
      </div>
    </div>
  );
}

export const PerformanceView = PerformanceStation;

/* ── 5425 ───────────────────────────────────────────────────────────── */

export function MotionRequestPage() {
  const { state, dispatch, now, url, actor, character, status } = useFabrication();
  const d = state.motionRequestDraft;
  const rm = state.requiredMotion;
  const open = state.motionRequests.find((r) => r.stage !== 'PUBLISH_ASSET');
  const latest = open ?? state.motionRequests[0];
  const stage = latest?.stage ?? 'REQUEST_SUBMISSION';
  const published = !!latest && latest.stage === 'PUBLISH_ASSET';
  const req = (over: Partial<typeof d>) => dispatch({ type: 'MOTION_DRAFT', patch: over });
  const cur = MOTION_LIFECYCLE.indexOf(stage);
  const inFab = status('authority') !== 'LOCKED';
  const deps = open?.dependencies ?? [
    { k: 'CHARACTER', v: actor.catalogueNumber },
    { k: 'LOOK VERSION', v: state.authority.look === 'NONE' ? 'PENDING' : `CANDIDATE ${state.selectedLookCandidateId}` },
    { k: 'BODY VERSION', v: state.selectedBodyVersionId },
    { k: 'ENVIRONMENT', v: 'N/A' },
  ];
  return (
    <div className="cf-mr" data-testid="cf-motion-request">
      <section className="cf-mr__top">
        <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="ACTOR PORTRAIT" className="cf-mr__timg" />
        <div className="cf-mr__ta" data-testid="cf-actor-card">
          <small>ACTOR</small><b>{actor.catalogueNumber}</b>
          <dl className="cf-krows">
            <div><dt>AGE</dt><dd>{actor.ageRange}</dd></div>
            <div><dt>HEIGHT</dt><dd>{actor.heightRange}</dd></div>
            <div><dt>ETHNICITY</dt><dd>{actor.castingTags[0] ?? '—'}</dd></div>
            <div><dt>STATUS</dt><dd><em className="cf-verified">✓ VERIFIED</em></dd></div>
          </dl>
        </div>
        <div className="cf-mr__tc" data-testid="cf-character-card">
          <small>CHARACTER</small><b>{character.displayName}</b>
          <dl className="cf-krows">
            <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
            <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
            <div><dt>VERSION</dt><dd>{character.version}</dd></div>
            <div className="is-red"><dt>FABRICATION</dt><dd>{inFab ? 'IN PROGRESS' : 'COMPLETE'}</dd></div>
          </dl>
          <button type="button" className="cf-cbtn" onClick={() => dispatch({ type: 'GOTO_STATION', station: 'character' })}>VIEW CHARACTER BRIEF <IcArrowR width={7} height={7} /></button>
        </div>
      </section>
      <div className="cf-mr__rail"><FabricationStageRail /></div>
      <section className="cf-mr__panel">
        <header className="cf-mr__head"><h2>06 - PERFORMANCE STATION</h2><small>MOTION ASSET</small></header>
        <div className="cf-mr__missing" data-testid="cf-required-asset">
          <IcWarn width={17} height={17} />
          <h3>REQUIRED MOTION ASSET</h3>
          <b>{published ? 'PUBLISHED' : open ? 'REQUESTED — IN PRODUCTION' : 'DOES NOT EXIST'}</b>
          <p>{published ? `${latest!.name} is ready for simulation.` : open ? `${open.name} · ${stage.replace(/_/g, ' ')}` : 'Create a generation request to produce this asset.'}</p>
        </div>
        <section className="cf-mr__req" data-testid="cf-requirement">
          <h4>REQUIREMENT SUMMARY</h4>
          <dl className="cf-krows">
            <div><dt>MOTION TYPE</dt><dd>{rm.motionType}</dd></div>
            <div><dt>ACTION</dt><dd>{rm.action}</dd></div>
            <div><dt>INTENSITY</dt><dd>{rm.intensity}</dd></div>
            <div><dt>DURATION</dt><dd>{fmt(rm.durationSec)} SEC</dd></div>
            <div><dt>FRAME RATE</dt><dd>{rm.fps} FPS</dd></div>
            <div><dt>QUALITY TARGET</dt><dd>{rm.qualityTarget}</dd></div>
            <div><dt>USAGE</dt><dd>{rm.usage}</dd></div>
          </dl>
        </section>
        <section className="cf-mr__deps" data-testid="cf-dependencies">
          <h4>DEPENDENCIES</h4>
          <dl className="cf-krows">{deps.map((x) => <div key={x.k}><dt>{x.k}</dt><dd>{x.v}</dd></div>)}</dl>
        </section>
        <div className="cf-mr__blocks" data-testid="cf-blocks-sim"><IcWarn width={10} height={10} /><span><b>BLOCKS SIMULATION STEP</b><small>Motion asset is required to run performance simulation and downstream approvals.</small></span></div>
        <section className="cf-mr__packet" data-testid="cf-request-packet">
          <h4>GENERATION REQUEST PACKET</h4>
          <label className="cf-mr__f"><span>REQUEST NAME <i>*</i></span><input value={d.name} onChange={(e) => req({ name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })} data-testid="cf-req-name" /></label>
          <label className="cf-mr__f is-2"><span>DESCRIPTION <i>*</i></span><textarea rows={2} value={d.description} onChange={(e) => req({ description: e.target.value })} data-testid="cf-req-desc" /></label>
          <label className="cf-mr__f is-3"><span>REFERENCE NOTES</span><textarea rows={3} value={d.referenceNotes} onChange={(e) => req({ referenceNotes: e.target.value })} /></label>
          <label className="cf-mr__f"><span>PRIORITY</span><select value={d.priority} onChange={(e) => req({ priority: e.target.value as 'LOW' | 'NORMAL' | 'HIGH' })} data-testid="cf-req-priority"><option>LOW</option><option>NORMAL</option><option>HIGH</option></select></label>
          <label className="cf-mr__f"><span>DELIVERABLE FORMAT</span><input value={d.deliverableFormat} onChange={(e) => req({ deliverableFormat: e.target.value.toUpperCase() })} /></label>
          <label className="cf-mr__f"><span>TARGET RESOLUTION</span><input value={d.targetResolution} onChange={(e) => req({ targetResolution: e.target.value.toUpperCase() })} /></label>
          <label className="cf-mr__f is-2 is-box"><span>NOTES TO ANIMATION TEAM</span><textarea rows={2} placeholder="Add direction, constraints, or references..." value={d.notes} onChange={(e) => req({ notes: e.target.value })} /></label>
          <div className="cf-mr__f is-att"><span>ATTACHMENTS</span>
            <span className="cf-mr__atts">
              <button type="button" className="cf-cbtn" data-testid="cf-add-reference" onClick={() => dispatch({ type: 'ADD_MOTION_ATTACHMENT', name: `REFERENCE_${String(d.attachments.length + 1).padStart(2, '0')}` })}><IcPaperclip width={7} height={7} /> + ADD REFERENCE</button>
              {d.attachments.map((a) => <em key={a}>{a}</em>)}
            </span>
          </div>
        </section>
        <section className="cf-mr__wf" data-testid="cf-workflow">
          <h4>ESTIMATED WORKFLOW</h4>
          <ol>
            {MOTION_LIFECYCLE.map((s, i) => (
              <li key={s} className={i === cur && open ? 'is-cur' : i < cur || (published && i === cur) ? 'is-done' : ''} data-stage={s}>
                <i />
                <span><b>{s === 'QA_APPROVAL' ? 'QA & APPROVAL' : s.replace(/_/g, ' ')}</b><small>{STAGE_SUB[s]}</small></span>
                <em>—</em>
              </li>
            ))}
          </ol>
          {open ? (
            <button type="button" className="cf-mr__adv" data-testid="cf-advance-request" onClick={() => dispatch({ type: 'ADVANCE_MOTION_REQUEST', requestId: open.requestId, at: now() })} title="Operator control — stands in for the animation team until a production queue API exists">ADVANCE STAGE · OPERATOR <IcArrowR width={6} height={6} /></button>
          ) : (
            <p className="cf-mr__turn"><span>ESTIMATED TURNAROUND</span><b><IcClock width={7} height={7} /> NOT ESTIMATED</b></p>
          )}
        </section>
        <div className="cf-mr__act">
          <button type="button" className="cf-rbtn" data-testid="cf-create-request" onClick={() => dispatch({ type: 'CREATE_MOTION_REQUEST', at: now(), requestId: `mr-${Date.now().toString(36)}` })}>CREATE GENERATION REQUEST <IcArrowR width={10} height={10} /></button>
          <button type="button" className="cf-obtn cf-obtn--redt2" data-testid="cf-cancel-request" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })}>{open || published ? 'BACK' : 'CANCEL'}</button>
        </div>
      </section>
    </div>
  );
}
