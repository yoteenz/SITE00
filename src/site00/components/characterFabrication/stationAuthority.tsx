/**
 * 08 AUTHORITY — authority 5428 (Authority Review / Request Revision).
 * The reference composition is reproduced above the fold; the final sign-off path, open revisions, pending founder
 * decisions and history continue below it as vertical scroll (functional surfaces the authority frame does not show).
 */
import type { ReactNode } from 'react';
import { STATION_LABEL, downstreamImpact, stationNumber, type StationId } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck, IcCube, IcLock, IcMove, IcPulse, IcShirt, IcUser } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { StandardHero } from './chamber';
import { AuthorityBadge } from './primitives';

const LAYERS: StationId[] = ['identity', 'body', 'look', 'appearance', 'character', 'performance', 'simulation'];
const LAYER_ICON: Record<StationId, ReactNode> = {
  identity: <IcUser width={9} height={9} />,
  body: <IcCube width={9} height={9} />,
  look: <IcShirt width={9} height={9} />,
  appearance: <IcUser width={9} height={9} />,
  character: <IcPulse width={9} height={9} />,
  performance: <IcMove width={9} height={9} />,
  simulation: <IcPulse width={9} height={9} />,
  authority: <IcLock width={9} height={9} />,
};

export function AuthorityReview() {
  const { state, dispatch, now, url, character, status, blockers, pending } = useFabrication();
  const d = state.revisionDraft;
  const impact = downstreamImpact(state, d.station);
  const signBlockers = blockers('authority');
  const open = state.revisionRequests.filter((r) => r.status === 'OPEN');
  const st = status('authority');
  const statusText = st === 'LOCKED' ? 'SIGNED OFF' : open.length ? 'REVISION OPEN' : 'AWAITING SIGN-OFF';
  return (
    <div className="cf-au" data-testid="cf-authority-review">
      <section className="cf-au__main">
        <header className="cf-au__head"><h2>08 - AUTHORITY REVIEW</h2><small>REQUEST REVISION</small></header>
        <section className="cf-au__final" data-testid="cf-final-authority">
          <h4>FINAL CHARACTER AUTHORITY</h4>
          <CfImage slotId={character.portraitSlotId} url={url(character.portraitSlotId)} label="FINAL CHARACTER AUTHORITY" className="cf-au__img" />
          <p className={`cf-au__status${st === 'LOCKED' ? ' is-ok' : ''}`} data-testid="cf-final-status"><small>AUTHORITY STATUS</small><b>{statusText}</b></p>
        </section>
        <section className="cf-au__layers" data-testid="cf-revise-layers">
          <h4>SELECT AUTHORITY LAYER TO REVISE</h4>
          <ul role="radiogroup" aria-label="Authority layer">
            {LAYERS.map((s) => {
              const on = d.station === s;
              return (
                <li key={s}>
                  <button type="button" role="radio" aria-checked={on} className={on ? 'is-on' : ''} onClick={() => dispatch({ type: 'REVISION_LAYER', station: s })} data-testid={`cf-revlayer-${s}`} data-layer-status={status(s)}>
                    <i>{LAYER_ICON[s]}</i><span>{STATION_LABEL[s]}</span><em className="cf-au__radio" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="cf-au__note" data-testid="cf-revision-note">
          <h4>REVISION NOTE</h4>
          <textarea value={d.note} onChange={(e) => dispatch({ type: 'REVISION_NOTE', note: e.target.value })} placeholder={`Describe what must change at the ${STATION_LABEL[d.station].toLowerCase()} station…`} data-testid="cf-revision-textarea" aria-label="Revision note" />
          <small>{d.note.length} / 300</small>
        </section>
        <section className="cf-au__impact" data-testid="cf-impact">
          <h4>DOWNSTREAM IMPACT</h4>
          <ul>{impact.slice(0, 6).map((i) => <li key={i.station}><span>{STATION_LABEL[i.station]}</span><b className={`lv-${i.level.toLowerCase()}`}>{i.level}<i /></b></li>)}</ul>
        </section>
      </section>
      <div className="cf-au__act">
        <button type="button" className="cf-obtn" data-testid="cf-revision-cancel" onClick={() => dispatch({ type: 'CANCEL_REVISION' })}>CANCEL</button>
        <button type="button" className="cf-rbtn" data-testid="cf-send-revision" onClick={() => dispatch({ type: 'SEND_REVISION', at: now(), revisionId: `rev-${Date.now().toString(36)}` })}>SEND REVISION <IcArrowR width={11} height={11} /></button>
      </div>

      <section className="cf-au__sign" data-testid="cf-final-signoff-panel">
        <header><h4>FINAL SIGN-OFF</h4><small>{statusText}</small></header>
        <ul className="cf-au__stack" data-testid="cf-layer-state">
          {LAYERS.map((s) => <li key={s} data-station={s}><span>{stationNumber(s)} {STATION_LABEL[s]}</span><AuthorityBadge status={status(s)} /></li>)}
        </ul>
        {signBlockers.length && !state.finalSignedOff ? (
          <div className="cf-interlock" data-testid="cf-signoff-blockers">
            <span className="cf-interlock__h"><IcLock width={8} height={8} /> INTERLOCK · SIGN-OFF REQUIRES EVERY LAYER</span>
            <ul>{signBlockers.map((b) => <li key={b.blockerId}><i className="cf-socket" aria-hidden /><span>{b.message}</span></li>)}</ul>
          </div>
        ) : null}
        <button type="button" className="cf-kbtn cf-au__signbtn" data-testid="cf-final-signoff" onClick={() => dispatch({ type: 'FINAL_SIGNOFF', at: now() })}>{state.finalSignedOff ? 'SIGNED OFF · CANONICAL' : 'FINAL SIGN-OFF'} <IcCheck width={9} height={9} /></button>
      </section>
      {open.length ? (
        <section className="cf-au__list" data-testid="cf-open-revisions">
          <h4>OPEN REVISION REQUIREMENTS</h4>
          <ul>{open.map((r) => <li key={r.revisionId}><button type="button" onClick={() => dispatch({ type: 'GOTO_STATION', station: r.station })}><b>{STATION_LABEL[r.station]}</b><span>{r.source} · {r.note}</span><IcArrowR width={7} height={7} /></button></li>)}</ul>
        </section>
      ) : null}
      <section className="cf-au__list" data-testid="cf-pending-decisions">
        <h4>PENDING FOUNDER DECISIONS</h4>
        {pending.length ? <ul>{pending.map((p) => <li key={p.decisionId + p.detail}><button type="button" onClick={() => dispatch({ type: 'GOTO_STATION', station: p.station })}><b>{p.title}</b><span>{p.detail}</span><IcArrowR width={7} height={7} /></button></li>)}</ul> : <p className="is-ok"><IcCheck width={7} height={7} /> NO PENDING DECISIONS</p>}
      </section>
      <details className="cf-au__hist" data-testid="cf-history"><summary>FABRICATION HISTORY · {state.history.length}</summary>
        <ol>{state.history.slice(0, 20).map((h, i) => <li key={i}><time>{h.at.slice(11, 19)}Z</time> {h.station ? `${STATION_LABEL[h.station]} · ` : ''}{h.message}</li>)}</ol>
      </details>
    </div>
  );
}

export function AuthorityView() {
  return (
    <>
      <StandardHero h={350} railTop={290} cardTop={45} cyl={{ top: 12, plat: 262 }} fig={{ x: 180, y: 26, w: 74, h: 232 }} cardH={222} />
      <AuthorityReview />
    </>
  );
}
