import { useMemo } from 'react';
import { LOOK_CANDIDATES, WARDROBE_CATEGORIES, WARDROBE_LIBRARY, GARMENT_BY_ID, type LookCandidateId } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck, IcFilter, IcSearch, IcTrash } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { Panel } from './primitives';

export function WardrobeLibrary() {
  const { state, dispatch, now, url } = useFabrication();
  const f = state.wardrobeFilters;
  const materials = useMemo(() => ['ALL', ...Array.from(new Set(WARDROBE_LIBRARY.map((g) => g.material)))], []);
  const colors = useMemo(() => ['ALL', ...Array.from(new Set(WARDROBE_LIBRARY.map((g) => g.color)))], []);
  const items = WARDROBE_LIBRARY.filter(
    (g) =>
      g.category === state.wardrobeTab &&
      (!state.wardrobeQuery.trim() || `${g.name} ${g.material} ${g.color}`.toLowerCase().includes(state.wardrobeQuery.toLowerCase())) &&
      (f.availability === 'ALL' || g.availability === 'IN_STOCK') &&
      (f.material === 'ALL' || g.material === f.material) &&
      (f.color === 'ALL' || g.color === f.color),
  );
  const sel = state.selectedGarmentId ? GARMENT_BY_ID[state.selectedGarmentId] : null;
  const layers = (['L1', 'L2', 'L3', 'L4'] as const).map((k) => ({ k, g: state.fitting[k] ? GARMENT_BY_ID[state.fitting[k]!] : null }));
  const fitted = layers.filter((l) => l.g);
  return (
    <div className="cf-look" data-testid="cf-look-station">
      <div className="cf-section-head"><h2><span className="cf-bar" />03 - LOOK / WARDROBE LIBRARY</h2><small>SELECT LIBRARY ITEMS TO ADD TO FITTING</small></div>
      <div className="cf-look__grid">
        <aside className="cf-look__filters" data-testid="cf-wardrobe-filters">
          <h4 className="cf-subhead">WARDROBE LIBRARY</h4>
          <label className="cf-search cf-search--sm"><input type="search" placeholder="SEARCH ITEMS" value={state.wardrobeQuery} onChange={(e) => dispatch({ type: 'WARDROBE_QUERY', query: e.target.value })} data-testid="cf-wardrobe-search" /><IcSearch width={13} height={13} /></label>
          <div className="cf-filterhead">FILTERS <IcFilter width={13} height={13} /></div>
          <label className="cf-frow"><span>CATEGORY</span><b>{state.wardrobeTab}</b></label>
          <label className="cf-frow"><span>MATERIAL</span>
            <select value={f.material} onChange={(e) => dispatch({ type: 'WARDROBE_FILTER', patch: { material: e.target.value } })} data-testid="cf-filter-material">{materials.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label className="cf-frow"><span>COLOR</span>
            <select value={f.color} onChange={(e) => dispatch({ type: 'WARDROBE_FILTER', patch: { color: e.target.value } })} data-testid="cf-filter-color">{colors.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label className="cf-frow"><span>GENDER</span><b>WOMEN</b></label>
          <label className="cf-frow"><span>AVAILABILITY</span>
            <select value={f.availability} onChange={(e) => dispatch({ type: 'WARDROBE_FILTER', patch: { availability: e.target.value as 'ALL' | 'IN_STOCK' } })} data-testid="cf-filter-availability"><option value="ALL">ALL</option><option value="IN_STOCK">IN STOCK</option></select></label>
          <Panel title="PROJECT PROVENANCE" className="cf-mini cf-mini--plain">
            <dl className="cf-kv cf-kv--rows cf-kv--tiny">
              <div><dt>SOURCE PROJECT</dt><dd>{sel?.sourceProject ?? 'NDXBOOK'}</dd></div>
              <div><dt>ASSET POOL</dt><dd>PRIMARY</dd></div>
              <div><dt>PROVENANCE</dt><dd>LIBRARY SEED</dd></div>
            </dl>
          </Panel>
          <Panel title="CONTINUITY COMPATIBILITY" className="cf-mini cf-mini--plain" testId="cf-compat">
            <dl className="cf-kv cf-kv--rows cf-kv--tiny">
              <div><dt>COMPATIBLE WITH</dt><dd>NDXBOOK {state.selectedBodyVersionId}</dd></div>
              <div><dt>BODY FIT</dt><dd>{sel ? (sel.compatibleBodyVersions.includes(state.selectedBodyVersionId) ? 'COMPATIBLE' : 'REVALIDATE') : '—'}</dd></div>
              <div><dt>CONFLICTS</dt><dd className="cf-ok">NONE</dd></div>
            </dl>
          </Panel>
        </aside>
        <section className="cf-look__library">
          <div className="cf-tabs" role="tablist" data-testid="cf-wardrobe-tabs">
            {WARDROBE_CATEGORIES.map((c) => (
              <button key={c} role="tab" aria-selected={state.wardrobeTab === c} className={state.wardrobeTab === c ? 'is-on' : ''} onClick={() => dispatch({ type: 'WARDROBE_TAB', tab: c })} data-testid={`cf-wtab-${c.toLowerCase()}`}>{c}</button>
            ))}
          </div>
          <div className="cf-garments" data-testid="cf-garments">
            {items.map((g) => {
              const on = state.selectedGarmentId === g.garmentId;
              const inSlot = Object.values(state.fitting).includes(g.garmentId);
              return (
                <button key={g.garmentId} type="button" className={`cf-garment${on ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'FIT_GARMENT', garmentId: g.garmentId })} data-testid={`cf-garment-${g.code}`} aria-pressed={inSlot}>
                  <CfImage slotId={g.slotId} url={url(g.slotId)} label={g.type} className="cf-garment__img" />
                  <i className="cf-garment__sw" style={{ background: g.swatch }} aria-hidden />
                  {inSlot ? <i className="cf-actor__tick">✓</i> : null}
                  <b>{g.name}</b>
                  <small>{g.material} / {g.color}</small>
                  <small>SIZE: {g.size}</small>
                  <em className={g.availability === 'IN_STOCK' ? 'cf-ok' : 'cf-warnt'}>{g.availability.replace('_', ' ')}</em>
                </button>
              );
            })}
            {!items.length ? <p className="cf-empty">NO LIBRARY ITEMS MATCH</p> : null}
          </div>
        </section>
      </div>
      <div className="cf-look__bottom">
        <Panel title="GARMENT LAYERS" className="cf-mini" testId="cf-garment-layers">
          <ul className="cf-layers">
            {layers.map(({ k, g }) => (
              <li key={k} className={g ? 'is-set' : ''}>
                <em>{k}</em>
                <span><b>{g ? g.name : 'NOT SELECTED'}</b>{g ? <small>{g.material} / {g.color}</small> : null}</span>
                <button type="button" className="cf-eye" aria-label={`Toggle ${k}`} disabled={!g} onClick={() => dispatch({ type: 'TOGGLE_FITTING_LAYER', layer: k })} aria-pressed={!state.fittingHidden.includes(k)}>{state.fittingHidden.includes(k) || !g ? '⌀' : '◉'}</button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="SELECTED LOOK SLOT" sub="01" className="cf-mini" testId="cf-look-slot">
          <div className="cf-slotdrop">
            {fitted.length ? fitted.map(({ k, g }) => <span key={k} className="cf-slotchip" style={{ ['--sw' as string]: g!.swatch }}><i />{g!.name}</span>) : <small>SELECT LIBRARY ITEMS TO BUILD LOOK</small>}
          </div>
          <button type="button" className="cf-btn cf-btn--line cf-btn--sm" onClick={() => dispatch({ type: 'CLEAR_FITTING' })} data-testid="cf-clear-slot">CLEAR SLOT <IcTrash width={13} height={13} /></button>
        </Panel>
        <Panel title="ADD TO FITTING" className="cf-mini" testId="cf-add-fitting">
          <dl className="cf-kv cf-kv--rows cf-kv--tiny"><div><dt>DESTINATION</dt><dd>FITTING STATION</dd></div><div><dt>LOOK PREVIEW</dt><dd>SLOT 01</dd></div></dl>
          <button type="button" className="cf-btn cf-btn--black" data-testid="cf-add-to-fitting" onClick={() => dispatch({ type: 'ADD_TO_FITTING', at: now() })}>{state.fittingSubmitted ? 'ADDED TO FITTING' : 'ADD TO FITTING'} <IcArrowR width={13} height={13} /></button>
          <small className="cf-note">SELECTED ITEMS ARE ADDED TO THE CURRENT FITTING STATION AS LIBRARY ASSETS. NO NEW VERSION WILL BE GENERATED.</small>
        </Panel>
      </div>
      <div className="cf-actions">
        <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-open-look-compare" onClick={() => dispatch({ type: 'OPEN_LOOK_COMPARE' })}>COMPARE LOOK CANDIDATES <IcArrowR width={14} height={14} /></button>
      </div>
    </div>
  );
}

export function LookCompare() {
  const { state, dispatch, now, actor, character, url, status } = useFabrication();
  const selected = LOOK_CANDIDATES.find((c) => c.candidateId === state.selectedLookCandidateId)!;
  const approved = state.authority.look === 'APPROVED' && !state.stale.look;
  return (
    <div className="cf-lookcompare" data-testid="cf-look-compare">
      <header className="cf-pagehead">
        <div><span className="cf-eyebrow">03 - LOOK</span><h2 className="cf-h1">WARDROBE CANDIDATES / COMPARE</h2><p className="cf-sub">SELECT AND APPROVE FINAL LOOK FOR PRODUCTION</p></div>
        <button type="button" className="cf-btn cf-btn--line cf-btn--sm" data-testid="cf-lookcompare-back" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })}>BACK TO STATIONS <IcArrowR width={13} height={13} /></button>
      </header>
      <section className="cf-idstrip">
        <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="" className="cf-idstrip__img" />
        <dl>
          <div><dt>ACTOR</dt><dd>{actor.catalogueNumber}</dd></div><div><dt>AGE</dt><dd>{actor.ageRange}</dd></div><div><dt>BUILD</dt><dd>{actor.build}</dd></div>
          <div><dt>PROJECT</dt><dd>NDXBOOK</dd></div><div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div><div><dt>VERSION</dt><dd>{character.version}</dd></div>
          <div><dt>STATUS</dt><dd><em className="cf-tag cf-tag--red">{status('look') === 'APPROVED' ? 'LOOK APPROVED' : 'IN FABRICATION'}</em></dd></div>
          <div><dt>APPROVED BY</dt><dd>{approved ? 'FOUNDER' : 'PENDING'}</dd></div>
        </dl>
      </section>
      <div className="cf-candidates" data-testid="cf-candidates">
        {LOOK_CANDIDATES.map((c) => {
          const on = c.candidateId === state.selectedLookCandidateId;
          return (
            <article key={c.candidateId} className={`cf-cand${on ? ' is-on' : ''}`} data-testid={`cf-candidate-${c.candidateId}`} data-selected={on}>
              <header><b>{c.label}</b>{c.candidateId === 'A' ? <em>PRIMARY</em> : null}</header>
              <CfImage slotId={c.slotId} url={url(c.slotId)} label={`LOOK ${c.candidateId}`} className="cf-cand__img" />
              <button type="button" className={`cf-btn ${on ? 'cf-btn--red' : 'cf-btn--line'} cf-btn--sm cf-cand__sel`} onClick={() => dispatch({ type: 'SELECT_LOOK_CANDIDATE', candidateId: c.candidateId as LookCandidateId })} data-testid={`cf-select-${c.candidateId}`}>{on ? <><IcCheck width={12} height={12} /> SELECTED</> : 'SELECT'}</button>
              <dl className="cf-kv cf-kv--rows cf-kv--tiny">
                <div><dt>PALETTE</dt><dd className="cf-palette">{c.palette.map((p) => <i key={p} style={{ background: p }} />)}</dd></div>
                <div><dt>MATERIALS</dt><dd>{c.materials}</dd></div>
                <div><dt>LAYERS</dt><dd>{c.layers.map((l) => l.layer).slice(0, 3).join(', ')}</dd></div>
              </dl>
              <p className="cf-cand__lbl">SCENE COMPATIBILITY</p><p className="cf-cand__val">{c.sceneCompatibility.map((n) => String(n).padStart(2, '0')).join(', ')}</p>
              <p className="cf-cand__lbl">NOTES</p><p className="cf-cand__val">{c.notes}</p>
              <p className="cf-cand__lbl">BASIS</p><p className="cf-cand__val cf-dim">{c.basis}</p>
            </article>
          );
        })}
      </div>
      <div className="cf-triple cf-triple--look">
        <Panel title={`LAYER BREAKDOWN — ${selected.label}`} className="cf-mini" testId="cf-layer-breakdown">
          <ul className="cf-breakdown">{selected.layers.map((l) => <li key={l.layer}><b>{l.layer}</b><span>{l.item}</span></li>)}</ul>
        </Panel>
        <Panel title={`COLOR / MATERIAL CONTINUITY — ${selected.label}`} className="cf-mini" testId="cf-material-continuity">
          <p className="cf-palette cf-palette--lg">{selected.palette.map((p) => <i key={p} style={{ background: p }} />)}</p>
          <dl className="cf-kv cf-kv--rows cf-kv--tiny">{selected.materialContinuity.map((m) => <div key={m.k}><dt>{m.k}</dt><dd>{m.v}</dd></div>)}</dl>
        </Panel>
        <Panel title={`STYLING NOTES — ${selected.label}`} className="cf-mini" testId="cf-styling-notes">
          <p className="cf-prose">{selected.stylingNotes}</p>
          <dl className="cf-kv cf-kv--rows cf-kv--tiny"><div><dt>PROVENANCE</dt><dd>{selected.provenance.replace('_', ' ')}</dd></div><div><dt>DATE</dt><dd>{new Date(now()).toISOString().slice(0, 10)}</dd></div></dl>
        </Panel>
      </div>
      <p className="cf-hint">COMPARE ALL CANDIDATES BEFORE MAKING A SELECTION</p>
      <div className="cf-actions cf-actions--3">
        <button type="button" className="cf-btn cf-btn--redline cf-btn--lg" data-testid="cf-look-reject" onClick={() => dispatch({ type: 'LOOK_DECISION', decision: 'REJECTED', at: now() })}>REJECT</button>
        <button type="button" className="cf-btn cf-btn--line cf-btn--lg" data-testid="cf-look-revise" onClick={() => dispatch({ type: 'LOOK_DECISION', decision: 'REVISION_REQUESTED', at: now() })}>REQUEST REVISION</button>
        <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-look-approve" onClick={() => dispatch({ type: 'LOOK_DECISION', decision: 'APPROVED', at: now() })}>APPROVE / CONTINUE <IcArrowR width={14} height={14} /></button>
      </div>
    </div>
  );
}
