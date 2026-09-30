import { useMemo } from 'react';
import { BEHAVIOR_SKINS, SKIN_BY_ID, type BehaviorRole } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcClose, IcFilter, IcInfo, IcLock, IcPlay, IcPlus, IcSearch } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { Panel } from './primitives';

const ROLE_COLOR: Record<BehaviorRole, string> = { PRIMARY: '#e5231b', SECONDARY: '#3c8fd0', ACCENT: '#e8b02a', FOUNDATIONAL: '#8a8c94' };

/** Triangle balance chart drawn from live layer weights. */
function LayerBalance({ layers }: { layers: readonly { role: BehaviorRole; weight: number }[] }) {
  const pts = layers.slice(0, 3);
  const cx = 60, cy = 62, R = 46;
  const angle = (i: number) => (-90 + (360 / Math.max(3, pts.length)) * i) * (Math.PI / 180);
  const at = (i: number, k: number) => [cx + Math.cos(angle(i)) * R * k, cy + Math.sin(angle(i)) * R * k] as const;
  const poly = pts.map((p, i) => at(i, p.weight / 100).join(',')).join(' ');
  return (
    <svg viewBox="0 0 120 120" className="cf-balance" role="img" aria-label="Layer balance" data-testid="cf-layer-balance">
      {[1, 0.75, 0.5, 0.25].map((k) => <polygon key={k} points={pts.map((_, i) => at(i, k).join(',')).join(' ')} className="cf-balance__ring" />)}
      {pts.map((_, i) => <line key={i} x1={cx} y1={cy} x2={at(i, 1)[0]} y2={at(i, 1)[1]} className="cf-balance__ax" />)}
      <polygon points={poly} className="cf-balance__shape" />
      {pts.map((p, i) => <circle key={i} cx={at(i, p.weight / 100)[0]} cy={at(i, p.weight / 100)[1]} r="2.6" fill={ROLE_COLOR[p.role]} />)}
    </svg>
  );
}

export function BehaviorEditor() {
  const { state, dispatch, now, url, status } = useFabrication();
  const layers = state.behaviorLayers;
  const wsum = layers.reduce((a, l) => a + l.weight, 0) || 1;
  const eff = useMemo(() => {
    const pick = (k: 'posture' | 'decision' | 'gaze' | 'reaction') => {
      const top = [...layers].sort((a, b) => b.weight - a.weight)[0];
      return top ? SKIN_BY_ID[top.skinId]!.effects[k] : '—';
    };
    return [
      { k: 'POSTURE', v: pick('posture') },
      { k: 'DECISION-MAKING', v: pick('decision') },
      { k: 'GAZE', v: pick('gaze') },
      { k: 'REACTION', v: pick('reaction') },
    ];
  }, [layers]);
  const intensity = Math.min(8, Math.max(1, Math.round((layers.reduce((a, l) => a + l.weight, 0) / (layers.length * 100 || 1)) * 8 + 1)));
  const saved = state.selectedBehaviorCompositionId;
  const locked = state.authority.character === 'LOCKED' && !state.stale.character;
  return (
    <div className="cf-character" data-testid="cf-character-station">
      <Panel className="cf-editor" testId="cf-behavior-editor" title={<><span className="cf-eyebrow">CHARACTER STATION</span><span className="cf-h2">BEHAVIORAL SKIN EDITOR</span></>} sub="COMPOSE AND TUNE BEHAVIORAL LAYERS TO SHAPE PERFORMANCE.">
        <p className="cf-fixture cf-fixture--quiet">BEHAVIORAL LAYERS ARE MOUNTED ON THE CHAMBER ABOVE — TUNE THEM ON THE SUBJECT.</p>
        <button type="button" className="cf-btn cf-btn--line cf-btn--sm cf-addskin" data-testid="cf-add-behavioral-skin" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'BEHAVIOR_LIBRARY' })}><IcPlus width={13} height={13} /> ADD BEHAVIORAL SKIN</button>
        <h4 className="cf-subhead">LAYER BALANCE</h4>
        <LayerBalance layers={layers} />
      </Panel>
      <div className="cf-character__right">
        <Panel title="BEHAVIORAL EFFECTS PREVIEW" right={<span className="cf-live"><i />LIVE PREVIEW</span>} className="cf-effects" testId="cf-effects-preview">
          <div className="cf-effects__row">
            <ul>
              {eff.map((e) => (
                <li key={e.k}><span className="cf-effects__ic" aria-hidden>{e.k[0]}</span><span><b>{e.k}</b><small>{e.v}</small></span><em className="cf-bars" aria-label={`${intensity} of 8`}>{Array.from({ length: 8 }, (_, i) => <i key={i} className={i < intensity ? 'on' : ''} />)}</em></li>
              ))}
            </ul>
            <CfImage slotId="behavior.sw017.composite.preview" url={url('behavior.sw017.composite.preview')} label="COMPOSITE" className="cf-effects__img" />
          </div>
        </Panel>
        <Panel title="COMPOSITION SUMMARY" className="cf-summary" testId="cf-composition-summary">
          <div className="cf-summary__row">
            <svg viewBox="0 0 120 60" className="cf-wave" aria-hidden>
              {layers.map((l, i) => <path key={l.skinId} d={`M0 ${20 + i * 10} C 20 ${10 + i * 10 + l.weight / 8}, 40 ${34 + i * 6 - l.weight / 10}, 60 ${22 + i * 8} S 100 ${12 + i * 9 + l.weight / 12}, 120 ${24 + i * 8}`} stroke={ROLE_COLOR[l.role]} />)}
            </svg>
            <div className="cf-summary__btns">
              <button type="button" className="cf-btn cf-btn--red" data-testid="cf-save-composition" onClick={() => dispatch({ type: 'SAVE_COMPOSITION', at: now() })}>{saved ? `SAVED ${saved}` : 'SAVE COMPOSITION'}</button>
              <button type="button" className="cf-btn cf-btn--line" data-testid="cf-lock-character" onClick={() => dispatch({ type: 'LOCK_CHARACTER', at: now() })}><IcLock width={13} height={13} /> {locked ? 'CHARACTER LOCKED' : 'LOCK CHARACTER'}</button>
            </div>
          </div>
          <p className="cf-fixture">{status('character') === 'STALE' ? 'UPSTREAM CHANGED — REVALIDATE AFTER REVIEW. ' : ''}BEHAVIORAL SKINS ARE ACTING-DIRECTION METADATA, NOT PSYCHOLOGICAL ASSESSMENTS. TOTAL WEIGHT {Math.round(wsum)}.</p>
        </Panel>
      </div>
    </div>
  );
}

export function BehaviorLibrary() {
  const { state, dispatch, url, actor } = useFabrication();
  const q = state.behaviorQuery.trim().toLowerCase();
  const list = BEHAVIOR_SKINS.filter((s) => (state.behaviorCategory === 'ALL' || s.category === state.behaviorCategory) && (!q || `${s.name} ${s.summary} ${s.tags.join(' ')}`.toLowerCase().includes(q)));
  const pend = state.behaviorPendingSkinId ? SKIN_BY_ID[state.behaviorPendingSkinId] : null;
  const already = (id: string) => state.behaviorLayers.some((l) => l.skinId === id);
  return (
    <div className="cf-drawer-wrap" data-testid="cf-behavior-library">
      <aside className="cf-drawer" role="dialog" aria-label="Add behavioral skin">
        <header className="cf-drawer__head"><span><small className="cf-eyebrow">CHARACTER STATION</small><h2 className="cf-h2">ADD BEHAVIORAL SKIN</h2></span><button type="button" className="cf-iconbtn" aria-label="Close" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })} data-testid="cf-behavior-close"><IcClose /></button></header>
        {state.notice ? <p className={`cf-notice cf-notice--${state.notice.kind.toLowerCase()}`} role="status" data-testid="cf-drawer-notice">{state.notice.text}</p> : null}
        <h4 className="cf-subhead">SEARCH BEHAVIOR LIBRARY</h4>
        <div className="cf-toolbar">
          <label className="cf-search"><IcSearch width={14} height={14} /><input type="search" placeholder="Search behaviors..." value={state.behaviorQuery} onChange={(e) => dispatch({ type: 'BEHAVIOR_QUERY', query: e.target.value })} data-testid="cf-behavior-search" /></label>
          <button type="button" className="cf-btn cf-btn--line cf-btn--sm">FILTERS <IcFilter width={13} height={13} /></button>
        </div>
        <div className="cf-chips" role="tablist" data-testid="cf-behavior-cats">
          {(['ALL', 'FOCUS', 'INTENSITY', 'TEMPO', 'SOCIAL'] as const).map((c) => <button key={c} role="tab" aria-selected={state.behaviorCategory === c} className={state.behaviorCategory === c ? 'is-on' : ''} onClick={() => dispatch({ type: 'BEHAVIOR_CATEGORY', category: c })}>{c}</button>)}
        </div>
        <h4 className="cf-subhead">BEHAVIOR LIBRARY</h4>
        <ul className="cf-skins" data-testid="cf-skin-list">
          {list.map((s) => {
            const on = state.behaviorPendingSkinId === s.skinId;
            return (
              <li key={s.skinId} className={on ? 'is-on' : ''} data-testid={`cf-skin-${s.skinId}`}>
                <button type="button" className="cf-skin__play" aria-label={`Preview ${s.name}`} onClick={() => dispatch({ type: 'BEHAVIOR_PENDING', skinId: s.skinId })}><IcPlay width={12} height={12} /></button>
                <button type="button" className="cf-skin__body" onClick={() => dispatch({ type: 'BEHAVIOR_PENDING', skinId: s.skinId })} aria-pressed={on}>
                  <b>{s.name}</b>{on ? <em className="cf-tag cf-tag--red">SELECTED</em> : already(s.skinId) ? <em className="cf-tag">IN COMPOSITION</em> : <IcPlus width={16} height={16} />}
                  <small>{s.summary}</small>
                  <span className="cf-skin__tags">{s.tags.join(' · ')}</span>
                  <span className="cf-skin__compat">COMPATIBILITY<em className="cf-bars">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < s.compatibility ? 'on' : ''} />)}</em>{s.compatibility}/10</span>
                  <span className="cf-skin__prov">PROVENANCE <b>{s.provenance}</b></span>
                </button>
              </li>
            );
          })}
          {!list.length ? <li className="cf-empty">NO BEHAVIORS MATCH</li> : null}
        </ul>
        <h4 className="cf-subhead">CURRENT COMPOSITION</h4>
        <div className="cf-compo">
          <figure><CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label={actor.catalogueNumber} className="cf-compo__img" /><figcaption>BASE ACTOR<br />{actor.catalogueNumber}</figcaption></figure><span>+</span>
          <figure><CfImage slotId="behavior.sw017.layer.preview" url={url('behavior.sw017.layer.preview')} label="LAYER" className="cf-compo__img" /><figcaption>BEHAVIOR LAYER<br />{pend?.name ?? '—'}</figcaption></figure><span>=</span>
          <figure><CfImage slotId="behavior.sw017.composite.preview" url={url('behavior.sw017.composite.preview')} label="COMPOSITE" className="cf-compo__img" /><figcaption>COMPOSITE PREVIEW</figcaption></figure>
        </div>
        <p className="cf-fixture"><IcInfo width={13} height={13} /> BEHAVIORAL SKINS LAYER DIRECTIONAL INTENT AND PERFORMANCE MODIFIERS. THESE ARE ACTING-DIRECTION METADATA, NOT MENTAL-HEALTH DIAGNOSES.</p>
        <div className="cf-actions cf-actions--3">
          <button type="button" className="cf-btn cf-btn--line" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })} data-testid="cf-behavior-cancel">CANCEL</button>
          <button type="button" className="cf-btn cf-btn--line" onClick={() => dispatch({ type: 'ADD_BEHAVIOR_LAYER' })} data-testid="cf-add-layer">ADD LAYER</button>
          <button type="button" className="cf-btn cf-btn--red" onClick={() => dispatch({ type: 'ADD_BEHAVIOR_LAYER' })} data-testid="cf-preview-composition">PREVIEW COMPOSITION <IcArrowR width={13} height={13} /></button>
        </div>
      </aside>
    </div>
  );
}
