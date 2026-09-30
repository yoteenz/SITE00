/**
 * 05 CHARACTER — authorities 5422 (Behavioral Skin Editor, mounted on the chamber) and 5423 (Add Behavioral Skin drawer).
 * The editor is not a form below the machine: its panels are mounted on the chamber around the subject.
 * Behavioral skins are acting-direction metadata, not psychological assessments.
 */
import { useMemo } from 'react';
import { BEHAVIOR_SKINS, SKIN_BY_ID, type BehaviorRole } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcClose, IcEye, IcFilter, IcInfo, IcLock, IcPlay, IcPlus, IcSave, IcSearch, IcUser } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { ChamberPlate, ROLE_COLOR, SubjectFigure } from './chamber';

/* ── live layer balance (triangle) ─────────────────────────────────── */

function LayerBalance({ layers }: { layers: readonly { role: BehaviorRole; weight: number }[] }) {
  const cx = 60;
  const cy = 64;
  const R = 50;
  const pts = layers.slice(0, 3);
  const ang = (i: number) => (-90 + 120 * i) * (Math.PI / 180);
  const at = (i: number, k: number) => [cx + Math.cos(ang(i)) * R * k, cy + Math.sin(ang(i)) * R * k] as const;
  const ring = (k: number) => [0, 1, 2].map((i) => at(i, k).join(',')).join(' ');
  return (
    <svg viewBox="0 0 120 100" className="cf-bal" role="img" aria-label="Layer balance" data-testid="cf-layer-balance">
      {[1, 0.78, 0.56, 0.34].map((k) => <polygon key={k} points={ring(k)} className="cf-bal__ring" />)}
      <polygon points={pts.map((p, i) => at(i, p.weight / 100).join(',')).join(' ')} className="cf-bal__shape" />
      {pts.map((p, i) => <circle key={i} cx={at(i, 1)[0]} cy={at(i, 1)[1]} r="1.6" fill={ROLE_COLOR[p.role]} />)}
      {pts.map((p, i) => <circle key={`w${i}`} cx={at(i, p.weight / 100)[0]} cy={at(i, p.weight / 100)[1]} r="1.4" fill={ROLE_COLOR[p.role]} />)}
    </svg>
  );
}

const EFFECT_ICON = { POSTURE: <IcUser width={8} height={8} />, 'DECISION-MAKING': <IcSave width={8} height={8} />, GAZE: <IcEye width={8} height={8} />, REACTION: <IcInfo width={8} height={8} /> } as const;

/* ── 5422 ───────────────────────────────────────────────────────────── */

export function BehaviorEditor() {
  const { state, dispatch, now, url, actor, status } = useFabrication();
  const layers = state.behaviorLayers;
  const top = useMemo(() => [...layers].sort((a, b) => b.weight - a.weight)[0], [layers]);
  const eff = (['posture', 'decision', 'gaze', 'reaction'] as const).map((k, i) => ({
    k: (['POSTURE', 'DECISION-MAKING', 'GAZE', 'REACTION'] as const)[i],
    v: top ? SKIN_BY_ID[top.skinId]!.effects[k] : '—',
    n: layers.length ? Math.max(1, Math.round((layers.reduce((a, l) => a + l.weight * (1 + ((i + l.weight) % 3) * 0.08), 0) / (layers.length * 100)) * 11)) : 0,
  }));
  const saved = state.selectedBehaviorCompositionId;
  const locked = state.authority.character === 'LOCKED' && !state.stale.character;
  const inFab = status('authority') !== 'LOCKED';
  return (
    <>
      <aside className="cf-ch__actor" data-testid="cf-actor-card">
        <i className="cf-ch__corner is-tl" /><i className="cf-ch__corner is-tr" />
        <small>ACTOR</small>
        <b>{actor.catalogueNumber}</b>
        <dl>
          <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
          <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
          <div><dt>STATUS</dt><dd><em className="cf-infab">{inFab ? 'IN FABRICATION' : 'CANONICAL'}</em></dd></div>
        </dl>
        <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="ACTOR" className="cf-ch__aimg" />
      </aside>
      <section className="cf-ch__editor" data-testid="cf-behavior-editor">
        <i className="cf-ch__corner is-tr" /><i className="cf-ch__corner is-bl" /><i className="cf-ch__corner is-br" />
        <small className="cf-ch__eyebrow">CHARACTER STATION</small>
        <h2>BEHAVIORAL<br />SKIN EDITOR</h2>
        <p>COMPOSE AND TUNE BEHAVIORAL LAYERS TO SHAPE PERFORMANCE.</p>
        <i className="cf-ch__hatch" aria-hidden />
        <h4>BEHAVIORAL LAYERS</h4>
        <ul className="cf-ch__layers">
          {layers.map((l) => {
            const s = SKIN_BY_ID[l.skinId]!;
            return (
              <li key={l.skinId} className={l.role === 'PRIMARY' ? 'is-primary' : ''} style={{ ['--role' as string]: ROLE_COLOR[l.role] }} data-testid={`cf-blayer-${l.skinId}`}>
                <small>{l.role}</small>
                <b>{s.name}</b>
                <output>{l.weight}%</output>
                <input type="range" min={0} max={100} value={l.weight} aria-label={`${s.name} weight`} data-testid={`cf-bweight-${l.skinId}`} className="cf-ch__range" style={{ ['--cf-fill' as string]: `${l.weight}%` }} onChange={(e) => dispatch({ type: 'BEHAVIOR_WEIGHT', skinId: l.skinId, weight: Number(e.target.value) })} />
                {layers.length > 1 ? <button type="button" className="cf-bmod__x" aria-label={`Remove ${s.name}`} onClick={() => dispatch({ type: 'REMOVE_BEHAVIOR_LAYER', skinId: l.skinId })}><IcClose width={6} height={6} /></button> : null}
              </li>
            );
          })}
        </ul>
        <button type="button" className="cf-ch__add" data-testid="cf-add-behavioral-skin" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'BEHAVIOR_LIBRARY' })}><IcPlus width={7} height={7} /> ADD BEHAVIORAL SKIN</button>
        <h4 className="cf-ch__balh">LAYER BALANCE</h4>
        <LayerBalance layers={layers} />
      </section>
      <section className="cf-ch__fx" data-testid="cf-effects-preview">
        <header><h4>BEHAVIORAL EFFECTS PREVIEW</h4><span><i />LIVE PREVIEW</span></header>
        <ul>
          {eff.map((e) => (
            <li key={e.k}>
              <i>{EFFECT_ICON[e.k]}</i>
              <span><b>{e.k}</b><small>{e.v}</small></span>
              <em aria-label={`${e.n} of 11`}>{Array.from({ length: 11 }, (_, i) => <u key={i} className={i < e.n ? 'on' : ''} />)}</em>
            </li>
          ))}
        </ul>
        <CfImage slotId="behavior.sw017.composite.preview" url={url('behavior.sw017.composite.preview')} label="COMPOSITE PREVIEW" className="cf-ch__fximg" />
      </section>
      <section className="cf-ch__sum" data-testid="cf-composition-summary">
        <h4>COMPOSITION SUMMARY</h4>
        <svg viewBox="0 0 120 40" className="cf-ch__wave" aria-hidden>
          {layers.map((l, i) => <path key={l.skinId} d={`M0 ${14 + i * 5} C 20 ${8 + i * 5 + l.weight / 12}, 40 ${22 + i * 3 - l.weight / 14}, 60 ${14 + i * 5} S 100 ${8 + i * 5 + l.weight / 16}, 120 ${15 + i * 5}`} stroke={ROLE_COLOR[l.role]} />)}
        </svg>
        <button type="button" className="cf-ch__save" data-testid="cf-save-composition" onClick={() => dispatch({ type: 'SAVE_COMPOSITION', at: now() })}><IcSave width={9} height={9} /> {saved ? `SAVED ${saved}` : 'SAVE COMPOSITION'}</button>
        <button type="button" className="cf-ch__lock" data-testid="cf-lock-character" onClick={() => dispatch({ type: 'LOCK_CHARACTER', at: now() })}><IcLock width={9} height={9} /> {locked ? 'CHARACTER LOCKED' : 'LOCK CHARACTER'}</button>
      </section>
    </>
  );
}

/* ── 5423 ───────────────────────────────────────────────────────────── */

export function BehaviorLibrary() {
  const { state, dispatch, url, actor } = useFabrication();
  const q = state.behaviorQuery.trim().toLowerCase();
  const list = BEHAVIOR_SKINS.filter((s) => !state.behaviorLayers.some((l) => l.skinId === s.skinId) || s.skinId === state.behaviorPendingSkinId)
    .filter((s) => (state.behaviorCategory === 'ALL' || s.category === state.behaviorCategory) && (!q || `${s.name} ${s.summary} ${s.tags.join(' ')}`.toLowerCase().includes(q)));
  const pend = state.behaviorPendingSkinId ? SKIN_BY_ID[state.behaviorPendingSkinId] : null;
  const inComp = BEHAVIOR_SKINS.filter((s) => state.behaviorLayers.some((l) => l.skinId === s.skinId)).length;
  return (
    <>
      <aside className="cf-bl__strip" data-testid="cf-actor-card">
        <dl>
          <div><dt>ACTOR</dt><dd className="is-lg">{actor.catalogueNumber}</dd></div>
          <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
          <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
        </dl>
        <small>STATUS</small>
        <em>IN FABRICATION</em>
      </aside>
      <aside className="cf-bl" role="dialog" aria-label="Add behavioral skin" data-testid="cf-behavior-library">
        <header className="cf-bl__head">
          <small>CHARACTER STATION</small>
          <h2>ADD BEHAVIORAL SKIN</h2>
          <button type="button" className="cf-x" aria-label="Close" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })} data-testid="cf-behavior-close"><IcClose width={9} height={9} /></button>
        </header>
        {state.notice ? <p className={`cf-bl__notice is-${state.notice.kind.toLowerCase()}`} role="status" data-testid="cf-drawer-notice">{state.notice.text}</p> : null}
        <h4>SEARCH BEHAVIOR LIBRARY</h4>
        <div className="cf-bl__bar">
          <label className="cf-field-search"><IcSearch width={7} height={7} /><input type="search" placeholder="Search behaviors..." value={state.behaviorQuery} onChange={(e) => dispatch({ type: 'BEHAVIOR_QUERY', query: e.target.value })} data-testid="cf-behavior-search" /></label>
          <button type="button" className="cf-fbtn">FILTERS <IcFilter width={7} height={7} /></button>
        </div>
        <div className="cf-bl__cats" role="tablist" data-testid="cf-behavior-cats">
          {(['ALL', 'FOCUS', 'INTENSITY', 'TEMPO', 'SOCIAL'] as const).map((c) => <button key={c} role="tab" aria-selected={state.behaviorCategory === c} className={state.behaviorCategory === c ? 'is-on' : ''} onClick={() => dispatch({ type: 'BEHAVIOR_CATEGORY', category: c })}>{c}</button>)}
        </div>
        <h4>BEHAVIOR LIBRARY {inComp ? <span>{inComp} ALREADY IN COMPOSITION</span> : null}</h4>
        <ul className="cf-bl__list" data-testid="cf-skin-list">
          {list.map((s) => {
            const on = state.behaviorPendingSkinId === s.skinId;
            return (
              <li key={s.skinId} className={on ? 'is-on' : ''} data-testid={`cf-skin-${s.skinId}`}>
                <button type="button" className="cf-bl__play" aria-label={`Preview ${s.name}`} onClick={() => dispatch({ type: 'BEHAVIOR_PENDING', skinId: s.skinId })}><IcPlay width={6} height={6} /></button>
                <button type="button" className="cf-skin__body" onClick={() => dispatch({ type: 'BEHAVIOR_PENDING', skinId: s.skinId })} aria-pressed={on}>
                  <b>{s.name}</b>
                  <small>{s.summary}</small>
                  <span className="cf-bl__tags">{s.tags.join(' · ')}</span>
                  <span className="cf-bl__row"><em>COMPATIBILITY</em><span className="cf-bl__bars">{Array.from({ length: 8 }, (_, i) => <u key={i} className={i < Math.round((s.compatibility / 10) * 8) ? 'on' : ''} />)}</span><em>{s.compatibility} /10</em></span>
                  <span className="cf-bl__row"><em>PROVENANCE</em><span className="cf-bl__prov">{s.provenance.replace('NDX LIBRARY V', 'NDX LIBRARY v')}</span></span>
                </button>
                {on ? <em className="cf-bl__sel">SELECTED</em> : <span className="cf-bl__plus" aria-hidden><IcPlus width={7} height={7} /></span>}
              </li>
            );
          })}
          {!list.length ? <li className="cf-empty">NO BEHAVIORS MATCH</li> : null}
        </ul>
        <p className="cf-bl__all">VIEW ALL BEHAVIORS <IcArrowR width={7} height={7} /></p>
        <h4 className="cf-bl__ch">CURRENT COMPOSITION</h4>
        <div className="cf-bl__comp">
          <figure><small>BASE ACTOR</small><CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="" className="cf-bl__cimg" /><figcaption>{actor.catalogueNumber}</figcaption></figure>
          <span>+</span>
          <figure><small>BEHAVIOR LAYER</small><CfImage slotId="behavior.sw017.layer.preview" url={url('behavior.sw017.layer.preview')} label="" className="cf-bl__cimg" /><figcaption>{pend?.name ?? '—'}</figcaption></figure>
          <span>=</span>
          <figure><small>COMPOSITE PREVIEW</small><CfImage slotId="behavior.sw017.composite.preview" url={url('behavior.sw017.composite.preview')} label="" className="cf-bl__cimg" /></figure>
        </div>
        <p className="cf-bl__note">Behavioral skins layer directional intent and performance modifiers. These are acting-direction metadata, not mental-health diagnoses. <IcInfo width={9} height={9} /></p>
      </aside>
      <div className="cf-bl__act">
        <button type="button" className="cf-obtn" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })} data-testid="cf-behavior-cancel">CANCEL</button>
        <button type="button" className="cf-obtn" onClick={() => dispatch({ type: 'ADD_BEHAVIOR_LAYER' })} data-testid="cf-add-layer">ADD LAYER</button>
        <button type="button" className="cf-rbtn" onClick={() => dispatch({ type: 'ADD_BEHAVIOR_LAYER' })} data-testid="cf-preview-composition">PREVIEW COMPOSITION <IcArrowR width={9} height={9} /></button>
      </div>
    </>
  );
}

export function CharacterView() {
  const { state } = useFabrication();
  const lib = state.surface === 'BEHAVIOR_LIBRARY';
  return (
    <section className={`cf-ch${lib ? ' is-lib' : ''}`} data-testid="cf-character-station" aria-label="Character station">
      {lib ? <ChamberPlate h={683} cx={104} scale={1.35} cyl={{ top: 20, plat: 575 }} /> : <ChamberPlate h={667} cx={282} scale={1.5} cyl={{ top: 0, plat: 420 }} />}
      {lib ? <SubjectFigure x={48} y={128} w={112} h={440} /> : <SubjectFigure x={222} y={52} w={122} h={372} />}
      {lib ? <BehaviorLibrary /> : <BehaviorEditor />}
    </section>
  );
}
