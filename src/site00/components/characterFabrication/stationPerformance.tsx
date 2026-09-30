import { useEffect, useState } from 'react';
import { MOTION_LIBRARY, MOTION_LIFECYCLE, motionById, type MotionAsset } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcPaperclip, IcPause, IcPlay, IcSearch, IcSkipL, IcSkipR, IcSliders, IcWarn } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { Panel } from './primitives';

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;

export function PerformanceStation() {
  const { state, dispatch, now, url, actor, blockers, status } = useFabrication();
  const [q, setQ] = useState('');
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
  const b = blockers('performance');
  return (
    <div className="cf-performance" data-testid="cf-performance-station">
      <dl className="cf-headcards">
        <div><CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="" className="cf-headcards__img" /><span><dt>ACTOR</dt><dd>{actor.catalogueNumber}</dd></span></div>
        <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
        <div><dt>PROJECT</dt><dd>NDXBOOK</dd></div>
        <div><dt>STATUS</dt><dd><em className="cf-tag cf-tag--red">IN FABRICATION</em></dd></div>
      </dl>
      <div className="cf-section-head"><h2><span className="cf-bar" />06 - PERFORMANCE</h2><small>PRODUCTION MOTION TESTING</small></div>
      <div className="cf-perf__grid">
        <Panel title="MOTION LIBRARY" right={<small className="cf-dim">{library.length} ITEMS</small>} className="cf-motionlib" testId="cf-motion-library">
          <label className="cf-search cf-search--sm"><IcSearch width={13} height={13} /><input type="search" placeholder="SEARCH MOTIONS" value={q} onChange={(e) => setQ(e.target.value)} data-testid="cf-motion-search" /></label>
          <ul>
            {list.map((m) => {
              const on = m.motionId === state.selectedMotionId;
              return (
                <li key={m.motionId}>
                  <button type="button" className={on ? 'is-on' : ''} onClick={() => dispatch({ type: 'SELECT_MOTION', motionId: m.motionId })} data-testid={`cf-motion-${m.motionId}`} aria-pressed={on}>
                    <CfImage slotId={m.slotId} url={url(m.slotId)} label="" className="cf-motion__img" />
                    <span><b>{m.motionId}</b><small>{m.label}</small><small>DURATION {m.durationSec.toFixed(2)}</small></span>
                    {on ? <em className="cf-motion__sel">SELECTED</em> : null}
                    {state.motionUsedIds.includes(m.motionId) ? <i className="cf-actor__tick">✓</i> : null}
                  </button>
                </li>
              );
            })}
            {!list.length ? (
              <li className="cf-motion__missing" data-testid="cf-motion-missing">
                <IcWarn width={16} height={16} />
                <b>NO MOTION MATCHES “{q.toUpperCase()}”</b>
                <button type="button" className="cf-btn cf-btn--red cf-btn--sm" data-testid="cf-request-from-search" onClick={() => dispatch({ type: 'OPEN_MOTION_REQUEST', name: q })}>REQUEST NEW MOTION</button>
              </li>
            ) : null}
          </ul>
          <button type="button" className="cf-btn cf-btn--line cf-btn--sm" data-testid="cf-open-motion-request" onClick={() => dispatch({ type: 'OPEN_MOTION_REQUEST' })}>MISSING A MOTION? CREATE REQUEST <IcArrowR width={13} height={13} /></button>
        </Panel>
        <section className="cf-inspect" data-testid="cf-motion-inspect">
          <small className="cf-eyebrow">MOTION INSPECT</small>
          <div className="cf-player">
            <CfImage slotId={sel.slotId} url={url(sel.slotId)} label={`${sel.motionId} PREVIEW`} className="cf-player__img" />
            <b className="cf-player__name">{sel.motionId}</b>
            <em className="cf-player__sel">{used ? 'MOTION IN USE' : 'MOTION SELECTED'}</em>
            <div className="cf-player__bar"><span>{fmt(t)}</span><i><u style={{ width: `${(t / sel.durationSec) * 100}%` }} /></i><span>{fmt(sel.durationSec)}</span></div>
            <div className="cf-player__ctl">
              <button type="button" aria-label="Restart" onClick={() => setT(0)}><IcSkipL width={16} height={16} /></button>
              <button type="button" className="cf-player__play" aria-label={state.motionPlaying ? 'Pause' : 'Play'} aria-pressed={state.motionPlaying} data-testid="cf-motion-play" onClick={() => dispatch({ type: 'MOTION_PLAY', playing: !state.motionPlaying })}>{state.motionPlaying ? <IcPause width={20} height={20} /> : <IcPlay width={20} height={20} />}</button>
              <button type="button" aria-label="End" onClick={() => setT(sel.durationSec)}><IcSkipR width={16} height={16} /></button>
              <select value={state.motionRate} onChange={(e) => dispatch({ type: 'MOTION_RATE', rate: Number(e.target.value) as 0.5 | 1 | 1.5 | 2 })} aria-label="Playback rate" data-testid="cf-motion-rate">{[0.5, 1, 1.5, 2].map((r) => <option key={r} value={r}>{r.toFixed(1)}x</option>)}</select>
            </div>
          </div>
          <div className="cf-perf__meta">
            <Panel title="MOTION PROVENANCE" className="cf-mini" testId="cf-motion-provenance">
              <dl className="cf-kv cf-kv--rows cf-kv--tiny">
                <div><dt>CAPTURE DATE</dt><dd>{sel.capture.date}</dd></div><div><dt>CAPTURE TIME</dt><dd>{sel.capture.time}</dd></div>
                <div><dt>STUDIO</dt><dd>{sel.capture.studio}</dd></div><div><dt>VOLUME</dt><dd>{sel.capture.volume}</dd></div>
                <div><dt>RIG</dt><dd>{sel.capture.rig}</dd></div><div><dt>SENSOR SET</dt><dd>{sel.capture.sensors}</dd></div>
                <div><dt>RESOLUTION</dt><dd>{sel.capture.resolution}</dd></div><div><dt>OPERATOR</dt><dd>{sel.capture.operator}</dd></div>
              </dl>
            </Panel>
            <Panel title="BIOMECHANICAL CONTINUITY" right={<small className="cf-live"><i />READOUT</small>} className="cf-mini" testId="cf-biomech">
              <div className="cf-biomech">
                <CfImage slotId="motion.sw017.rig.wireframe" url={url('motion.sw017.rig.wireframe')} label="RIG" className="cf-biomech__img" />
                <ul>{sel.biomechanics.map((r) => <li key={r.k}><span>{r.k}</span><b>{r.v}%</b><i><u style={{ width: `${r.v}%` }} /></i></li>)}</ul>
              </div>
              <p className="cf-ok cf-okbar">✓ CONTINUITY OPTIMAL <small className="cf-dim">(LIBRARY RECORD)</small></p>
            </Panel>
          </div>
        </section>
      </div>
      <div className="cf-rigstrip">
        <CfImage slotId="character.subject-woman.portrait.primary" url={url('character.subject-woman.portrait.primary')} label="" className="cf-rigstrip__img" />
        <span><small>SUBJECT WOMAN</small><b>{actor.catalogueNumber}</b><small>ENTRY {state.selectedEntryId}</small></span>
        <dl><div><dt>RIG PROFILE</dt><dd>ATHLETIC / V2.1</dd></div><div><dt>SKELETAL MAP</dt><dd>HUMAN / FEMALE</dd></div></dl>
      </div>
      {b.length && status('performance') !== 'LOCKED' ? <p className="cf-fixture">DECISION BLOCKED: {b.map((x) => x.message).join(' · ')}</p> : null}
      <div className="cf-actions cf-actions--3">
        <button type="button" className="cf-btn cf-btn--redline cf-btn--lg" data-testid="cf-use-motion" onClick={() => dispatch({ type: 'USE_MOTION', at: now() })}>{used ? 'MOTION IN USE' : 'USE MOTION'} <IcArrowR width={14} height={14} /></button>
        <button type="button" className="cf-btn cf-btn--line cf-btn--icon" aria-label="Motion settings" onClick={() => dispatch({ type: 'OPEN_MOTION_REQUEST' })}><IcSliders width={20} height={20} /></button>
        <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-send-testing" onClick={() => dispatch({ type: 'SEND_TO_TESTING_GROUND', at: now() })}>SEND TO TESTING GROUND <IcArrowR width={14} height={14} /></button>
      </div>
    </div>
  );
}

export function MotionRequestPage() {
  const { state, dispatch, now } = useFabrication();
  const d = state.motionRequestDraft;
  const rm = state.requiredMotion;
  const open = state.motionRequests.find((r) => r.stage !== 'PUBLISH_ASSET');
  const latest = open ?? state.motionRequests[0];
  const stage = latest?.stage ?? 'REQUEST_SUBMISSION';
  const published = !!latest && latest.stage === 'PUBLISH_ASSET';
  const req = (over: Partial<typeof d>) => dispatch({ type: 'MOTION_DRAFT', patch: over });
  return (
    <div className="cf-motionreq" data-testid="cf-motion-request">
      <div className="cf-section-head"><h2><span className="cf-bar" />06 - PERFORMANCE STATION</h2><small>MOTION ASSET</small></div>
      <div className="cf-motionreq__grid">
        <div className="cf-missing" data-testid="cf-required-asset">
          <span className="cf-missing__corners" aria-hidden />
          <IcWarn width={44} height={44} />
          <h3>REQUIRED MOTION ASSET</h3>
          <b className="cf-red">{open ? 'REQUESTED — IN PRODUCTION' : 'DOES NOT EXIST'}</b>
          <p>{open ? `${open.name} · ${stage.replace(/_/g, ' ')}` : 'Create a generation request to produce this asset.'}</p>
        </div>
        <div className="cf-motionreq__side">
          <Panel title="REQUIREMENT SUMMARY" className="cf-mini" testId="cf-requirement">
            <dl className="cf-kv cf-kv--rows cf-kv--tiny">
              <div><dt>MOTION TYPE</dt><dd>{rm.motionType}</dd></div><div><dt>ACTION</dt><dd>{rm.action}</dd></div><div><dt>INTENSITY</dt><dd>{rm.intensity}</dd></div>
              <div><dt>DURATION</dt><dd>{rm.durationSec.toFixed(2)} SEC</dd></div><div><dt>FRAME RATE</dt><dd>{rm.fps} FPS</dd></div><div><dt>QUALITY TARGET</dt><dd>{rm.qualityTarget}</dd></div><div><dt>USAGE</dt><dd>{rm.usage}</dd></div>
            </dl>
          </Panel>
          <Panel title="DEPENDENCIES" className="cf-mini" testId="cf-dependencies">
            <dl className="cf-kv cf-kv--rows cf-kv--tiny">
              <div><dt>CHARACTER</dt><dd>SW-017</dd></div><div><dt>LOOK VERSION</dt><dd>{state.authority.look === 'NONE' ? 'PENDING' : `CANDIDATE ${state.selectedLookCandidateId}`}</dd></div>
              <div><dt>BODY VERSION</dt><dd>{state.selectedBodyVersionId}</dd></div><div><dt>ENVIRONMENT</dt><dd>N/A</dd></div>
            </dl>
          </Panel>
          <div className="cf-blocks" data-testid="cf-blocks-sim"><IcWarn width={18} height={18} /><span><b>BLOCKS SIMULATION STEP</b><small>Motion asset is required to run performance simulation and downstream approvals.</small></span></div>
        </div>
      </div>
      <div className="cf-motionreq__grid">
        <Panel title="GENERATION REQUEST PACKET" className="cf-packet" testId="cf-request-packet">
          <label className="cf-field"><span>REQUEST NAME *</span><input value={d.name} onChange={(e) => req({ name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })} data-testid="cf-req-name" /></label>
          <label className="cf-field"><span>DESCRIPTION *</span><textarea rows={2} value={d.description} onChange={(e) => req({ description: e.target.value })} data-testid="cf-req-desc" /></label>
          <label className="cf-field"><span>REFERENCE NOTES</span><textarea rows={2} value={d.referenceNotes} onChange={(e) => req({ referenceNotes: e.target.value })} /></label>
          <label className="cf-field"><span>PRIORITY</span><select value={d.priority} onChange={(e) => req({ priority: e.target.value as 'LOW' | 'NORMAL' | 'HIGH' })} data-testid="cf-req-priority"><option>LOW</option><option>NORMAL</option><option>HIGH</option></select></label>
          <label className="cf-field"><span>DELIVERABLE FORMAT</span><input value={d.deliverableFormat} onChange={(e) => req({ deliverableFormat: e.target.value.toUpperCase() })} /></label>
          <label className="cf-field"><span>TARGET RESOLUTION</span><input value={d.targetResolution} onChange={(e) => req({ targetResolution: e.target.value.toUpperCase() })} /></label>
          <label className="cf-field"><span>NOTES TO ANIMATION TEAM</span><textarea rows={2} placeholder="Add direction, constraints, or references..." value={d.notes} onChange={(e) => req({ notes: e.target.value })} /></label>
          <div className="cf-field"><span>ATTACHMENTS</span>
            <div className="cf-attach">
              <button type="button" className="cf-btn cf-btn--line cf-btn--sm" data-testid="cf-add-reference" onClick={() => dispatch({ type: 'ADD_MOTION_ATTACHMENT', name: `REFERENCE_${String(d.attachments.length + 1).padStart(2, '0')}` })}><IcPaperclip width={13} height={13} /> + ADD REFERENCE</button>
              {d.attachments.map((a) => <em key={a} className="cf-tag">{a}</em>)}
            </div>
          </div>
        </Panel>
        <Panel title="ESTIMATED WORKFLOW" className="cf-workflow" testId="cf-workflow">
          <ol>
            {MOTION_LIFECYCLE.map((s, i) => {
              const cur = MOTION_LIFECYCLE.indexOf(stage);
              return (
                <li key={s} className={i === cur && open ? 'is-cur' : i < cur || (published && i === cur) ? 'is-done' : ''} data-stage={s}>
                  <i />
                  <span><b>{s.replace(/_/g, ' ').replace('QA APPROVAL', 'QA & APPROVAL')}</b></span>
                </li>
              );
            })}
          </ol>
          <p className="cf-turn">ESTIMATED TURNAROUND <b>NOT ESTIMATED — NO PRODUCTION BACKEND</b></p>
          {open ? (
            <button type="button" className="cf-btn cf-btn--line cf-btn--sm" data-testid="cf-advance-request" onClick={() => dispatch({ type: 'ADVANCE_MOTION_REQUEST', requestId: open.requestId, at: now() })} title="Operator control — stands in for the animation team until a production queue API exists">ADVANCE STAGE (OPERATOR) <IcArrowR width={13} height={13} /></button>
          ) : null}
        </Panel>
      </div>
      <div className="cf-actions">
        <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-create-request" onClick={() => dispatch({ type: 'CREATE_MOTION_REQUEST', at: now(), requestId: `mr-${Date.now().toString(36)}` })}>CREATE GENERATION REQUEST <IcArrowR width={14} height={14} /></button>
        <button type="button" className="cf-btn cf-btn--redline cf-btn--lg" data-testid="cf-cancel-request" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })}>{open ? 'BACK' : 'CANCEL'}</button>
      </div>
    </div>
  );
}
