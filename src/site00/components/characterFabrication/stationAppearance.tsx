/**
 * 04 HAIR + MAKEUP — authorities 5420 (Appearance Station / layer library) and 5421 (Appearance Compare / before lock).
 * Appearance layers are applied to the SAME subject: the close-up plate is the subject's head, held in a named slot.
 */
import { useState } from 'react';
import { APPEARANCE_LAYERS, APPEARANCE_SETS, CONTINUITY_TAGS, HAIR_REFS, MAKEUP_REFS, type AppearanceLayerId } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck, IcChevR, IcFilter, IcLock, IcRefresh, IcWarn } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { ChamberPlate } from './chamber';
import { FabricationStageRail } from './primitives';

const DEF_BY_ID = Object.fromEntries(APPEARANCE_LAYERS.map((l) => [l.layerId, l])) as Record<AppearanceLayerId, (typeof APPEARANCE_LAYERS)[number]>;
const HERO_SLOT = 'appearance.sw017.hero.closeup';

function Eye({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 10" aria-hidden className="cf-eye3">
      <path d="M1 5c2-3 4.5-4 7-4s5 1 7 4c-2 3-4.5 4-7 4s-5-1-7-4z" />
      <circle cx="8" cy="5" r="2" fill={on ? 'currentColor' : 'none'} />
      {on ? null : <line x1="2" y1="9" x2="14" y2="1" />}
    </svg>
  );
}

/* ── 5420 ───────────────────────────────────────────────────────────── */

function AppearanceHero() {
  const { actor, character, state, url, status, dispatch } = useFabrication();
  const inFab = status('authority') !== 'LOCKED';
  return (
    <section className="cf-ahero" data-testid="cf-appearance-hero">
      <ChamberPlate h={310} cyl={{ top: -20, plat: 330 }} />
      <div className="cf-ahero__slot" data-asset-slot={HERO_SLOT}>
        <CfImage slotId={HERO_SLOT} url={url(HERO_SLOT)} label="SUBJECT CLOSE-UP · HAIR + MAKEUP PLATE" className="cf-ahero__img" />
      </div>
      <aside className="cf-accard" data-testid="cf-actor-card">
        <i className="cf-acard__tick" aria-hidden />
        <header><small>ACTOR</small><b>{actor.catalogueNumber}</b><em>{actor.verified ? 'ACTIVE' : 'PENDING'}</em></header>
        <CfImage slotId={character.portraitSlotId} url={url(character.portraitSlotId)} label="CHARACTER PORTRAIT" className="cf-accard__img is-mono" />
        <div className="cf-accard__char" data-testid="cf-character-card"><small>CHARACTER</small><b>{character.displayName}</b></div>
        <dl className="cf-rows">
          <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
          <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
          <div><dt>VERSION</dt><dd>{character.version}</dd></div>
          <div><dt>STATUS</dt><dd><em className={inFab ? 'cf-infab' : 'cf-verified'}>{inFab ? 'IN FABRICATION' : 'CANONICAL'}</em></dd></div>
        </dl>
        <div className="cf-acard__btns">
          <button type="button" className="cf-cbtn" data-testid="cf-view-actor-profile" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'ACTOR_PROFILE' })}>VIEW ACTOR PROFILE <IcArrowR width={8} height={8} /></button>
          <button type="button" className="cf-cbtn" data-testid="cf-view-character-brief" onClick={() => dispatch({ type: 'GOTO_STATION', station: 'character' })}>VIEW CHARACTER BRIEF <IcArrowR width={8} height={8} /></button>
        </div>
      </aside>
      <div className="cf-ahero__rail"><FabricationStageRail className="cf-rail--tabs" chevrons /></div>
    </section>
  );
}

export function AppearanceStation() {
  const { state, dispatch, now, url } = useFabrication();
  const [menu, setMenu] = useState<AppearanceLayerId | null>(null);
  const layers = [...state.appearanceLayers].sort((a, b) => a.order - b.order);
  const sel = layers.find((l) => l.layerId === state.selectedAppearanceLayerId)!;
  const RefStrip = ({ refs, sel: s, kind }: { refs: typeof HAIR_REFS; sel: string; kind: 'HAIR' | 'MAKEUP' }) => (
    <div className="cf-app2__refs">
      {refs.map((r) => (
        <button key={r.refId} type="button" className={`cf-app2__ref${s === r.refId ? ' is-on' : ''}`} onClick={() => dispatch({ type: kind === 'HAIR' ? 'SELECT_HAIR_REF' : 'SELECT_MAKEUP_REF', refId: r.refId })} data-testid={`cf-ref-${r.refId}`} aria-pressed={s === r.refId}>
          <CfImage slotId={r.slotId} url={url(r.slotId)} label={r.refId} className="cf-app2__refimg" />
          {s === r.refId ? <i className="cf-app2__tick"><IcCheck width={5} height={5} /></i> : null}
          <small>{r.label}</small>
        </button>
      ))}
      <span className="cf-app2__more" aria-hidden><IcChevR width={7} height={7} /></span>
    </div>
  );
  return (
    <div className="cf-app2" data-testid="cf-appearance-station">
      <h2 className="cf-app2__h">04 - HAIR + MAKEUP</h2>
      <section className="cf-app2__left">
        <div className="cf-app2__blk" data-testid="cf-hair-refs"><h4>APPROVED HAIR REFERENCES <span>VIEW ALL</span></h4><RefStrip refs={HAIR_REFS} sel={state.selectedHairRefId} kind="HAIR" /></div>
        <div className="cf-app2__blk" data-testid="cf-makeup-refs"><h4>MAKEUP REFERENCES <span>VIEW ALL</span></h4><RefStrip refs={MAKEUP_REFS} sel={state.selectedMakeupRefId} kind="MAKEUP" /></div>
        <div className="cf-app2__blk" data-testid="cf-appearance-sets">
          <h4>SAVED APPEARANCE SETS <span>VIEW ALL</span></h4>
          <div className="cf-app2__sets">
            {APPEARANCE_SETS.map((s) => (
              <button key={s.setId} type="button" className={`cf-app2__set${state.selectedAppearanceSetId === s.setId ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'SELECT_APPEARANCE_SET', setId: s.setId })} data-testid={`cf-set-${s.setId}`} aria-pressed={state.selectedAppearanceSetId === s.setId}>
                <small>{s.label}</small>
                <b>{s.state === 'LOCKED' ? 'LOCKED IN' : s.state === 'ALT_LIGHT' ? 'ALT / LIGHT' : s.state}</b>
                <small>{s.date}</small>
              </button>
            ))}
            <span className="cf-app2__more" aria-hidden><IcChevR width={7} height={7} /></span>
          </div>
        </div>
        <div className="cf-app2__blk cf-app2__blk--tags">
          <h4>CONTINUITY TAGS <button type="button" className="cf-app2__edit">EDIT</button></h4>
          <div className="cf-app2__tags">{CONTINUITY_TAGS.map((t) => { const [a, b] = t.split(' · '); return <span key={t}>{a}<br />{b}</span>; })}</div>
        </div>
      </section>
      <section className="cf-app2__right" data-testid="cf-layer-library">
        <h4>APPEARANCE LAYER LIBRARY</h4>
        <button type="button" className="cf-fbtn cf-app2__filters" data-testid="cf-reset-layers" onClick={() => dispatch({ type: 'RESET_APPEARANCE' })}>FILTERS <IcFilter width={7} height={7} /></button>
        <ul className="cf-app2__layers">
          {layers.map((l, i) => {
            const d = DEF_BY_ID[l.layerId];
            const on = state.selectedAppearanceLayerId === l.layerId;
            return (
              <li key={l.layerId} className={`${on ? 'is-on' : ''}${l.visible ? '' : ' is-off'}`} data-testid={`cf-alayer-${l.layerId}`} data-visible={l.visible}>
                <button type="button" className="cf-app2__eye" aria-label={`Toggle ${d.label}`} aria-pressed={l.visible} onClick={() => dispatch({ type: 'TOGGLE_APPEARANCE_LAYER', layerId: l.layerId })} data-testid={`cf-alayer-eye-${l.layerId}`}><Eye on={l.visible} /></button>
                <span className="cf-app2__grip" aria-hidden>⋮⋮</span>
                <button type="button" className="cf-app2__main" onClick={() => dispatch({ type: 'SELECT_APPEARANCE_LAYER', layerId: l.layerId })} aria-pressed={on}>
                  <CfImage slotId={d.slotId} url={url(d.slotId)} label="" className="cf-app2__limg" />
                  <span><b>{d.label}</b><small>LAYER {String(i + 1).padStart(2, '0')}</small><small className="is-val">{d.value}</small><small>{d.code}</small></span>
                </button>
                <button type="button" className="cf-app2__dots" aria-label={`${d.label} options`} aria-expanded={menu === l.layerId} onClick={() => setMenu((m) => (m === l.layerId ? null : l.layerId))}>•••</button>
                {menu === l.layerId ? (
                  <span className="cf-app2__menu" role="menu">
                    <button type="button" role="menuitem" disabled={i === 0} onClick={() => { dispatch({ type: 'MOVE_APPEARANCE_LAYER', layerId: l.layerId, dir: -1 }); setMenu(null); }}>MOVE UP</button>
                    <button type="button" role="menuitem" disabled={i === layers.length - 1} onClick={() => { dispatch({ type: 'MOVE_APPEARANCE_LAYER', layerId: l.layerId, dir: 1 }); setMenu(null); }}>MOVE DOWN</button>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="cf-app2__op">
          <label htmlFor="cf-op">LAYER OPACITY</label>
          <input id="cf-op" type="range" min={0} max={100} value={sel.opacity} className="cf-slider2" style={{ ['--cf-fill' as string]: `${sel.opacity}%` }} onChange={(e) => dispatch({ type: 'LAYER_OPACITY', opacity: Number(e.target.value) })} data-testid="cf-layer-opacity" aria-label={`${DEF_BY_ID[sel.layerId].label} opacity`} />
          <output>{sel.opacity}%</output>
        </div>
      </section>
      <div className="cf-app2__apply">
        <button type="button" className="cf-app2__reset" aria-label="Reset appearance layers" onClick={() => dispatch({ type: 'RESET_APPEARANCE' })}><IcRefresh width={13} height={13} /></button>
        <button type="button" className="cf-app2__go" data-testid="cf-apply-appearance" onClick={() => dispatch({ type: 'APPLY_APPEARANCE_TO_FITTING', at: now() })}>{state.appearanceAppliedToFitting ? 'APPLIED TO FITTING' : 'APPLY TO FITTING'} <IcArrowR width={13} height={13} /></button>
      </div>
      <div className="cf-app2__cmp">
        <button type="button" className="cf-rbtn" data-testid="cf-open-appearance-compare" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'APPEARANCE_COMPARE' })}>COMPARE vs CURRENT AUTHORITY <IcArrowR width={9} height={9} /></button>
      </div>
    </div>
  );
}

export function AppearanceView() {
  return (
    <>
      <AppearanceHero />
      <AppearanceStation />
    </>
  );
}

/* ── 5421 ───────────────────────────────────────────────────────────── */

export function AppearanceCompare() {
  const { state, dispatch, now, url, actor } = useFabrication();
  const diff = APPEARANCE_LAYERS.filter((l) => l.value !== l.candidateValue);
  const warnings = [
    diff.some((l) => l.layerId === 'grit') && { id: 'grit' as AppearanceLayerId, text: 'DIRT / SWEAT LEVEL INCREASED' },
    diff.some((l) => ['skinFinish', 'lipTone', 'hairColor', 'eyeDetail'].includes(l.layerId)) && { id: 'skinFinish' as AppearanceLayerId, text: 'OVERALL TONE COOLER THAN AUTHORITY' },
  ].filter(Boolean) as { id: AppearanceLayerId; text: string }[];
  const locked = state.authority.appearance === 'LOCKED' && !state.stale.appearance;
  const side = (kind: 'current' | 'candidate') => (
    <section className={`cf-ac__col cf-ac__col--${kind}`} data-testid={`cf-cmp-${kind}`}>
      <header>
        <span><b>{kind === 'current' ? 'CURRENT AUTHORITY' : 'CANDIDATE TREATMENT'}</b><small>{kind === 'current' ? 'LOCKED REFERENCE' : 'PROPOSED VARIATION'}</small></span>
        {kind === 'current' ? <IcLock width={10} height={10} /> : <em>{state.appearanceCandidateId}</em>}
      </header>
      <CfImage slotId={`appearance.sw017.compare.${kind}.primary`} url={url(`appearance.sw017.compare.${kind}.primary`)} label={kind === 'current' ? 'CURRENT · PRIMARY VIEW' : 'CANDIDATE · PRIMARY VIEW'} className="cf-ac__hero" />
      <div className="cf-ac__tags"><span>{kind === 'current' ? actor.catalogueNumber : `${actor.catalogueNumber}-C01`}</span><em className={kind === 'candidate' ? 'is-red' : ''}>{kind === 'current' ? 'AUTHORITY' : 'CANDIDATE'}</em></div>
      <div className="cf-ac__angles">{(['left', 'back', 'right'] as const).map((v) => <CfImage key={v} slotId={`appearance.sw017.compare.${kind}.${v}`} url={url(`appearance.sw017.compare.${kind}.${v}`)} label={v.toUpperCase()} className="cf-ac__angle" />)}</div>
      <h4>LAYER BREAKDOWN</h4>
      <dl>
        {APPEARANCE_LAYERS.map((l) => {
          const v = kind === 'current' ? l.value : l.candidateValue;
          return <div key={l.layerId} className={kind === 'candidate' && l.value !== l.candidateValue ? 'is-diff' : ''}><dt>{l.label}</dt><dd>{v}</dd></div>;
        })}
      </dl>
    </section>
  );
  return (
    <div className="cf-ac" data-testid="cf-appearance-compare">
      <div className="cf-ac__rail"><FabricationStageRail className="cf-rail--outline" /></div>
      <section className="cf-ac__main">
        <header className="cf-ac__head">
          <h2>04 - HAIR + MAKEUP</h2>
          <span><b>APPEARANCE COMPARE <i>/ BEFORE LOCK</i></b><small>COMPARE CURRENT AUTHORITY VS. CANDIDATE TREATMENT</small></span>
        </header>
        {side('current')}
        {side('candidate')}
      </section>
      <section className="cf-ac__warn" data-testid="cf-continuity-warnings">
        <header><span><IcWarn width={8} height={8} /> CONTINUITY CHECK</span><em>{warnings.length} WARNINGS</em></header>
        {warnings.map((w) => (
          <div key={w.id} className="cf-ac__w"><i /><span>{w.text}</span><button type="button" className="cf-ac__rv" onClick={() => { dispatch({ type: 'SELECT_APPEARANCE_LAYER', layerId: w.id }); dispatch({ type: 'SET_SURFACE', surface: 'STATION' }); }}>REVIEW</button><span className="cf-ac__weye"><Eye on /></span></div>
        ))}
        {!warnings.length ? <p className="cf-empty">NO CONTINUITY WARNINGS</p> : null}
      </section>
      <section className="cf-ac__ovl" data-testid="cf-overlay-slider">
        <h4>SIDE BY SIDE OVERLAY</h4>
        <div className="cf-ac__ovlbox">
          <CfImage slotId="appearance.sw017.compare.overlay" url={url('appearance.sw017.compare.overlay')} label="OVERLAY" className="cf-ac__ovlimg" />
          <i className="cf-ac__line" style={{ left: `${state.appearanceOverlayPct}%` }}><b>‹›</b></i>
          <input type="range" min={0} max={100} value={state.appearanceOverlayPct} className="cf-ac__range" onChange={(e) => dispatch({ type: 'APPEARANCE_OVERLAY', pct: Number(e.target.value) })} aria-label="Overlay position" data-testid="cf-overlay-range" />
        </div>
      </section>
      <div className="cf-ac__act" data-testid="cf-appearance-decision" data-decision={state.appearanceDecision}>
        <button type="button" className={`cf-obtn${state.appearanceDecision === 'CANDIDATE_SELECTED' ? ' is-picked' : ''}`} data-testid="cf-select-candidate" onClick={() => dispatch({ type: 'APPEARANCE_DECISION', decision: 'SELECT_CANDIDATE', at: now() })}>SELECT CANDIDATE</button>
        <button type="button" className={`cf-obtn${state.appearanceDecision === 'KEEP_CURRENT' ? ' is-picked' : ''}`} data-testid="cf-keep-current" onClick={() => dispatch({ type: 'APPEARANCE_DECISION', decision: 'KEEP_CURRENT', at: now() })}>KEEP CURRENT</button>
        <button type="button" className="cf-obtn" data-testid="cf-appearance-revise" onClick={() => dispatch({ type: 'APPEARANCE_DECISION', decision: 'REQUEST_REVISION', at: now() })}>REQUEST REVISION</button>
        <button type="button" className="cf-rbtn" data-testid="cf-lock-appearance" onClick={() => dispatch({ type: 'APPEARANCE_DECISION', decision: 'LOCK', at: now() })}><IcLock width={8} height={8} /> {locked ? 'APPEARANCE LOCKED' : 'LOCK APPEARANCE'}</button>
      </div>
      <button type="button" className="cf-ac__back" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })} data-testid="cf-appcompare-back">← BACK TO HAIR + MAKEUP STATION</button>
    </div>
  );
}
