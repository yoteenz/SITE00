import { APPEARANCE_LAYERS, APPEARANCE_SETS, CONTINUITY_TAGS, HAIR_REFS, MAKEUP_REFS, type AppearanceLayerId } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcChevR, IcLock, IcRefresh } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { Panel } from './primitives';

const DEF_BY_ID = Object.fromEntries(APPEARANCE_LAYERS.map((l) => [l.layerId, l])) as Record<AppearanceLayerId, (typeof APPEARANCE_LAYERS)[number]>;

export function AppearanceStation() {
  const { state, dispatch, now, url } = useFabrication();
  const layers = [...state.appearanceLayers].sort((a, b) => a.order - b.order);
  const sel = layers.find((l) => l.layerId === state.selectedAppearanceLayerId)!;
  return (
    <div className="cf-appearance" data-testid="cf-appearance-station">
      <div className="cf-section-head"><h2><span className="cf-bar" />04 - HAIR + MAKEUP</h2></div>
      <div className="cf-appearance__grid">
        <div className="cf-appearance__refs">
          <Panel title="APPROVED HAIR REFERENCES" right={<button type="button" className="cf-link">VIEW ALL</button>} className="cf-mini cf-mini--plain" testId="cf-hair-refs">
            <div className="cf-refstrip">
              {HAIR_REFS.map((r) => (
                <button key={r.refId} type="button" className={`cf-ref${state.selectedHairRefId === r.refId ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'SELECT_HAIR_REF', refId: r.refId })} data-testid={`cf-ref-${r.refId}`} aria-pressed={state.selectedHairRefId === r.refId}>
                  <CfImage slotId={r.slotId} url={url(r.slotId)} label={r.refId} className="cf-ref__img" />
                  {state.selectedHairRefId === r.refId ? <i className="cf-actor__tick">✓</i> : null}
                  <small>{r.label}</small>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="MAKEUP REFERENCES" right={<button type="button" className="cf-link">VIEW ALL</button>} className="cf-mini cf-mini--plain" testId="cf-makeup-refs">
            <div className="cf-refstrip">
              {MAKEUP_REFS.map((r) => (
                <button key={r.refId} type="button" className={`cf-ref${state.selectedMakeupRefId === r.refId ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'SELECT_MAKEUP_REF', refId: r.refId })} data-testid={`cf-ref-${r.refId}`} aria-pressed={state.selectedMakeupRefId === r.refId}>
                  <CfImage slotId={r.slotId} url={url(r.slotId)} label={r.refId} className="cf-ref__img" />
                  {state.selectedMakeupRefId === r.refId ? <i className="cf-actor__tick">✓</i> : null}
                  <small>{r.label}</small>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="SAVED APPEARANCE SETS" right={<button type="button" className="cf-link">VIEW ALL</button>} className="cf-mini cf-mini--plain" testId="cf-appearance-sets">
            <div className="cf-sets">
              {APPEARANCE_SETS.map((s) => (
                <button key={s.setId} type="button" className={`cf-set${state.selectedAppearanceSetId === s.setId ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'SELECT_APPEARANCE_SET', setId: s.setId })} data-testid={`cf-set-${s.setId}`} aria-pressed={state.selectedAppearanceSetId === s.setId}>
                  <small>{s.label}</small><b>{s.state.replace('_', ' / ').replace('LOCKED', 'LOCKED IN')}</b><small>{s.date}</small>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="CONTINUITY TAGS" right={<button type="button" className="cf-link">EDIT</button>} className="cf-mini cf-mini--plain">
            <div className="cf-tags">{CONTINUITY_TAGS.map((t) => <span key={t}>{t}</span>)}</div>
          </Panel>
        </div>
        <Panel title="APPEARANCE LAYER LIBRARY" right={<button type="button" className="cf-btn cf-btn--line cf-btn--sm" onClick={() => dispatch({ type: 'RESET_APPEARANCE' })} data-testid="cf-reset-layers">RESET</button>} className="cf-layerlib" testId="cf-layer-library">
          <ul className="cf-alayers">
            {layers.map((l, i) => {
              const d = DEF_BY_ID[l.layerId];
              const on = state.selectedAppearanceLayerId === l.layerId;
              return (
                <li key={l.layerId} className={`${on ? 'is-on' : ''}${l.visible ? '' : ' is-off'}`} data-testid={`cf-alayer-${l.layerId}`} data-visible={l.visible} style={{ opacity: l.visible ? 0.35 + l.opacity / 154 : 0.4 }}>
                  <button type="button" className="cf-eye" aria-label={`Toggle ${d.label}`} aria-pressed={l.visible} onClick={() => dispatch({ type: 'TOGGLE_APPEARANCE_LAYER', layerId: l.layerId })} data-testid={`cf-alayer-eye-${l.layerId}`}>{l.visible ? '◉' : '⌀'}</button>
                  <span className="cf-order">
                    <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => dispatch({ type: 'MOVE_APPEARANCE_LAYER', layerId: l.layerId, dir: -1 })}>▲</button>
                    <button type="button" aria-label="Move down" disabled={i === layers.length - 1} onClick={() => dispatch({ type: 'MOVE_APPEARANCE_LAYER', layerId: l.layerId, dir: 1 })}>▼</button>
                  </span>
                  <button type="button" className="cf-alayer__main" onClick={() => dispatch({ type: 'SELECT_APPEARANCE_LAYER', layerId: l.layerId })} aria-pressed={on}>
                    <CfImage slotId={d.slotId} url={url(d.slotId)} label="" className="cf-alayer__img" />
                    <span><b>{d.label}</b><small>LAYER {String(i + 1).padStart(2, '0')}</small><small>{d.value}</small><small className="cf-dim">{d.code}</small></span>
                  </button>
                  <em className="cf-op">{l.opacity}%</em>
                </li>
              );
            })}
          </ul>
          <div className="cf-opacity">
            <label>LAYER OPACITY · {DEF_BY_ID[sel.layerId].label}</label>
            <input type="range" min={0} max={100} value={sel.opacity} className="cf-slider" style={{ ['--cf-fill' as string]: `${sel.opacity}%`, ['--cf-accent' as string]: 'var(--ph-red)' }} onChange={(e) => dispatch({ type: 'LAYER_OPACITY', opacity: Number(e.target.value) })} data-testid="cf-layer-opacity" aria-label="Layer opacity" />
            <output>{sel.opacity}%</output>
          </div>
        </Panel>
      </div>
      <div className="cf-applybar">
        <button type="button" className="cf-btn cf-btn--line cf-btn--icon" aria-label="Reset" onClick={() => dispatch({ type: 'RESET_APPEARANCE' })}><IcRefresh width={20} height={20} /></button>
        <button type="button" className="cf-btn cf-btn--black cf-btn--xl" data-testid="cf-apply-appearance" onClick={() => dispatch({ type: 'APPLY_APPEARANCE_TO_FITTING', at: now() })}>{state.appearanceAppliedToFitting ? 'APPLIED TO FITTING' : 'APPLY TO FITTING'} <IcArrowR width={18} height={18} /></button>
      </div>
      <div className="cf-actions">
        <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-open-appearance-compare" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'APPEARANCE_COMPARE' })}>COMPARE vs CURRENT AUTHORITY <IcChevR width={14} height={14} /></button>
      </div>
    </div>
  );
}

export function AppearanceCompare() {
  const { state, dispatch, now, url, actor } = useFabrication();
  const layers = APPEARANCE_LAYERS;
  const diff = layers.filter((l) => l.value !== l.candidateValue);
  const warnings = [
    diff.some((l) => l.layerId === 'grit') && { id: 'grit', text: 'DIRT / SWEAT LEVEL INCREASED' },
    diff.some((l) => ['skinFinish', 'lipTone', 'hairColor', 'eyeDetail'].includes(l.layerId)) && { id: 'tone', text: 'OVERALL TONE COOLER THAN AUTHORITY' },
  ].filter(Boolean) as { id: string; text: string }[];
  const locked = state.authority.appearance === 'LOCKED' && !state.stale.appearance;
  const side = (kind: 'current' | 'candidate') => (
    <section className={`cf-cmp cf-cmp--${kind}`} data-testid={`cf-cmp-${kind}`}>
      <header>
        <span><h3>{kind === 'current' ? 'CURRENT AUTHORITY' : 'CANDIDATE TREATMENT'}</h3><small>{kind === 'current' ? 'LOCKED REFERENCE' : 'PROPOSED VARIATION'}</small></span>
        {kind === 'current' ? <IcLock width={16} height={16} /> : <em className="cf-red">{state.appearanceCandidateId}</em>}
      </header>
      <CfImage slotId={`appearance.sw017.compare.${kind}.primary`} url={url(`appearance.sw017.compare.${kind}.primary`)} label={kind === 'current' ? 'CURRENT PRIMARY' : 'CANDIDATE PRIMARY'} className="cf-cmp__hero" />
      <div className="cf-cmp__tag"><span>{kind === 'current' ? actor.catalogueNumber : `${actor.catalogueNumber}-C01`}</span><em className={kind === 'candidate' ? 'is-red' : ''}>{kind === 'current' ? 'AUTHORITY' : 'CANDIDATE'}</em></div>
      <div className="cf-cmp__angles">{(['left', 'back', 'right'] as const).map((v) => <CfImage key={v} slotId={`appearance.sw017.compare.${kind}.${v}`} url={url(`appearance.sw017.compare.${kind}.${v}`)} label={v.toUpperCase()} className="cf-cmp__angle" />)}</div>
      <h4 className="cf-subhead cf-subhead--bar">LAYER BREAKDOWN</h4>
      <dl className="cf-kv cf-kv--rows cf-kv--tiny">
        {layers.map((l) => {
          const v = kind === 'current' ? l.value : l.candidateValue;
          return <div key={l.layerId} className={kind === 'candidate' && l.value !== l.candidateValue ? 'is-diff' : ''}><dt>{l.label}</dt><dd>{v}</dd></div>;
        })}
      </dl>
    </section>
  );
  return (
    <div className="cf-appcompare" data-testid="cf-appearance-compare">
      <header className="cf-pagehead">
        <div><h2 className="cf-h1">04 - HAIR + MAKEUP</h2></div>
        <div className="cf-pagehead__r"><b>APPEARANCE COMPARE / BEFORE LOCK</b><small>COMPARE CURRENT AUTHORITY VS. CANDIDATE TREATMENT</small></div>
      </header>
      <div className="cf-cmp-grid">{side('current')}{side('candidate')}</div>
      <div className="cf-cmp-lower">
        <Panel title={<span className="cf-warnhead">CONTINUITY CHECK</span>} right={<em className="cf-red">{warnings.length} WARNINGS</em>} className="cf-mini" testId="cf-continuity-warnings">
          <ul className="cf-warns">
            {warnings.map((w) => <li key={w.id}><i />{w.text}<button type="button" className="cf-btn cf-btn--line cf-btn--xs" onClick={() => dispatch({ type: 'SELECT_APPEARANCE_LAYER', layerId: w.id === 'grit' ? 'grit' : 'skinFinish' })}>REVIEW</button></li>)}
            {!warnings.length ? <li className="cf-dim">NO CONTINUITY WARNINGS</li> : null}
          </ul>
        </Panel>
        <Panel title="SIDE BY SIDE OVERLAY" className="cf-mini" testId="cf-overlay-slider">
          <div className="cf-ovl">
            <CfImage slotId="appearance.sw017.compare.overlay" url={url('appearance.sw017.compare.overlay')} label="OVERLAY" className="cf-ovl__img" />
            <i className="cf-ovl__line" style={{ left: `${state.appearanceOverlayPct}%` }}><b>‹›</b></i>
          </div>
          <input type="range" min={0} max={100} value={state.appearanceOverlayPct} className="cf-slider" style={{ ['--cf-fill' as string]: `${state.appearanceOverlayPct}%`, ['--cf-accent' as string]: 'var(--ph-red)' }} onChange={(e) => dispatch({ type: 'APPEARANCE_OVERLAY', pct: Number(e.target.value) })} aria-label="Overlay position" data-testid="cf-overlay-range" />
        </Panel>
      </div>
      <p className="cf-hint" data-testid="cf-appearance-decision">DECISION: {state.appearanceDecision.replace(/_/g, ' ')}</p>
      <div className="cf-actions cf-actions--4">
        <button type="button" className="cf-btn cf-btn--line" data-testid="cf-select-candidate" onClick={() => dispatch({ type: 'APPEARANCE_DECISION', decision: 'SELECT_CANDIDATE', at: now() })}>SELECT CANDIDATE</button>
        <button type="button" className="cf-btn cf-btn--line" data-testid="cf-keep-current" onClick={() => dispatch({ type: 'APPEARANCE_DECISION', decision: 'KEEP_CURRENT', at: now() })}>KEEP CURRENT</button>
        <button type="button" className="cf-btn cf-btn--line" data-testid="cf-appearance-revise" onClick={() => dispatch({ type: 'APPEARANCE_DECISION', decision: 'REQUEST_REVISION', at: now() })}>REQUEST REVISION</button>
        <button type="button" className="cf-btn cf-btn--red" data-testid="cf-lock-appearance" onClick={() => dispatch({ type: 'APPEARANCE_DECISION', decision: 'LOCK', at: now() })}><IcLock width={13} height={13} /> {locked ? 'APPEARANCE LOCKED' : 'LOCK APPEARANCE'}</button>
      </div>
      <button type="button" className="cf-link cf-center" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })} data-testid="cf-appcompare-back">← BACK TO HAIR + MAKEUP STATION</button>
    </div>
  );
}
