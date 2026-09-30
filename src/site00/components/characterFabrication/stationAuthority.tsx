import { STATION_LABEL, downstreamImpact, stationNumber, type StationId } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { AuthorityBadge, Panel } from './primitives';

const LAYERS: StationId[] = ['identity', 'body', 'look', 'appearance', 'character', 'performance', 'simulation'];

export function AuthorityReview() {
  const { state, dispatch, now, url, character, status, blockers, pending } = useFabrication();
  const d = state.revisionDraft;
  const impact = downstreamImpact(state, d.station);
  const overallBlockers = blockers('authority');
  const open = state.revisionRequests.filter((r) => r.status === 'OPEN');
  const st = status('authority');
  return (
    <div className="cf-authority" data-testid="cf-authority-review">
      <div className="cf-section-head"><h2><span className="cf-bar" />08 - AUTHORITY REVIEW</h2><small>REQUEST REVISION</small></div>
      <div className="cf-authority__grid">
        <Panel title="FINAL CHARACTER AUTHORITY" className="cf-final" testId="cf-final-authority">
          <CfImage slotId={character.portraitSlotId} url={url(character.portraitSlotId)} label="FINAL AUTHORITY" className="cf-final__img" />
          <div className={`cf-final__status${st === 'LOCKED' ? ' is-ok' : ''}`} data-testid="cf-final-status"><small>AUTHORITY STATUS</small><b>{st === 'LOCKED' ? 'SIGNED OFF' : open.length ? 'REVISION OPEN' : 'AWAITING SIGN-OFF'}</b></div>
          <ul className="cf-layerstate" data-testid="cf-layer-state">
            {LAYERS.map((s) => <li key={s} data-station={s}><span>{stationNumber(s)} {STATION_LABEL[s]}</span><AuthorityBadge status={status(s)} /></li>)}
          </ul>
        </Panel>
        <Panel title="SELECT AUTHORITY LAYER TO REVISE" className="cf-revlayers" testId="cf-revise-layers">
          <ul role="radiogroup" aria-label="Authority layer">
            {LAYERS.map((s) => {
              const on = d.station === s;
              return (
                <li key={s}>
                  <button type="button" role="radio" aria-checked={on} className={on ? 'is-on' : ''} onClick={() => dispatch({ type: 'REVISION_LAYER', station: s })} data-testid={`cf-revlayer-${s}`}>
                    <i aria-hidden>{stationNumber(s)}</i><span>{STATION_LABEL[s]}</span><em className={`cf-radio${on ? ' is-on' : ''}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
        <div className="cf-authority__note">
          <Panel title="REVISION NOTE" className="cf-mini" testId="cf-revision-note">
            <textarea rows={5} value={d.note} onChange={(e) => dispatch({ type: 'REVISION_NOTE', note: e.target.value })} placeholder={`Describe what must change at the ${STATION_LABEL[d.station]} station…`} data-testid="cf-revision-textarea" />
            <small className="cf-count">{d.note.length} / 300</small>
          </Panel>
          <Panel title="DOWNSTREAM IMPACT" className="cf-mini" testId="cf-impact">
            <ul className="cf-impactlist">
              {impact.map((i) => <li key={i.station}><span>{STATION_LABEL[i.station]}</span><b className={`lv-${i.level.toLowerCase()}`}>{i.level}<i /></b></li>)}
            </ul>
          </Panel>
        </div>
      </div>
      {open.length ? (
        <Panel title="OPEN REVISION REQUIREMENTS" className="cf-mini" testId="cf-open-revisions">
          <ul className="cf-openrev">
            {open.map((r) => <li key={r.revisionId}><button type="button" onClick={() => dispatch({ type: 'GOTO_STATION', station: r.station })}><b>{STATION_LABEL[r.station]}</b><span>{r.source} · {r.note}</span><IcArrowR width={13} height={13} /></button></li>)}
          </ul>
        </Panel>
      ) : null}
      <Panel title="PENDING FOUNDER DECISIONS" className="cf-mini" testId="cf-pending-decisions">
        {pending.length ?
          <ul className="cf-openrev">
            {pending.map((p) => <li key={p.decisionId + p.detail}><button type="button" onClick={() => dispatch({ type: 'GOTO_STATION', station: p.station })}><b>{p.title}</b><span>{p.detail}</span><IcArrowR width={13} height={13} /></button></li>)}
          </ul>
        : <p className="cf-ok"><IcCheck width={12} height={12} /> NO PENDING DECISIONS</p>}
      </Panel>
      {overallBlockers.length && !state.finalSignedOff ? <ul className="cf-runblock" data-testid="cf-signoff-blockers">{overallBlockers.map((b) => <li key={b.blockerId}>SIGN-OFF BLOCKED · {b.message}</li>)}</ul> : null}
      <div className="cf-actions cf-actions--3">
        <button type="button" className="cf-btn cf-btn--line cf-btn--lg" data-testid="cf-revision-cancel" onClick={() => dispatch({ type: 'CANCEL_REVISION' })}>CANCEL</button>
        <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-send-revision" onClick={() => dispatch({ type: 'SEND_REVISION', at: now(), revisionId: `rev-${Date.now().toString(36)}` })}>SEND REVISION <IcArrowR width={14} height={14} /></button>
        <button type="button" className="cf-btn cf-btn--black cf-btn--lg" data-testid="cf-final-signoff" onClick={() => dispatch({ type: 'FINAL_SIGNOFF', at: now() })}>{state.finalSignedOff ? 'SIGNED OFF' : 'FINAL SIGN-OFF'} <IcCheck width={14} height={14} /></button>
      </div>
      <details className="cf-history-log" data-testid="cf-history"><summary>FABRICATION HISTORY · {state.history.length}</summary>
        <ol>{state.history.slice(0, 20).map((h, i) => <li key={i}><time>{new Date(h.at).toISOString().slice(11, 19)}Z</time> {h.station ? `${STATION_LABEL[h.station]} · ` : ''}{h.message}</li>)}</ol>
      </details>
    </div>
  );
}
