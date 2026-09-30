/**
 * 03 LOOK — authorities 5418 (Wardrobe Library / garment layers / fitting) and 5419 (Wardrobe Candidates / Compare).
 * Garments and candidates are LIBRARY_SEED catalogue objects; every photograph is a named slot.
 */
import { useMemo, useRef } from 'react';
import { GARMENT_BY_ID, LOOK_CANDIDATES, WARDROBE_CATEGORIES, WARDROBE_LIBRARY, type LookCandidateId } from '../../../../shared/site00-character-fabrication/index.js';
import { IcArrowR, IcCheck, IcChevL, IcChevR, IcFilter, IcSearch, IcShirt, IcTrash } from '../productionHub/icons';
import { CfImage } from './CfImage';
import { useFabrication } from './FabricationContext';
import { StandardHero } from './chamber';

/* ── 5418 ───────────────────────────────────────────────────────────── */

function FRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="cf-frow2">
      <span>{label}</span>
      {children}
    </label>
  );
}

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
    <div className="cf-look2" data-testid="cf-look-station">
      <header className="cf-shead">
        <h2>03 - LOOK / WARDROBE LIBRARY</h2>
        <small>SELECT LIBRARY ITEMS TO ADD TO FITTING</small>
      </header>
      <aside className="cf-look2__filters" data-testid="cf-wardrobe-filters">
        <h4>WARDROBE LIBRARY</h4>
        <label className="cf-field-search cf-field-search--sm">
          <input type="search" placeholder="SEARCH ITEMS" value={state.wardrobeQuery} onChange={(e) => dispatch({ type: 'WARDROBE_QUERY', query: e.target.value })} data-testid="cf-wardrobe-search" />
          <IcSearch width={7} height={7} />
        </label>
        <p className="cf-look2__fh">FILTERS <IcFilter width={7} height={7} /></p>
        <FRow label="CATEGORY"><b>{state.wardrobeTab === 'TOPS' ? 'ALL' : state.wardrobeTab} ›</b></FRow>
        <FRow label="TYPE"><b>ALL ›</b></FRow>
        <FRow label="MATERIAL"><select value={f.material} onChange={(e) => dispatch({ type: 'WARDROBE_FILTER', patch: { material: e.target.value } })} data-testid="cf-filter-material">{materials.map((m) => <option key={m}>{m}</option>)}</select></FRow>
        <FRow label="COLOR"><select value={f.color} onChange={(e) => dispatch({ type: 'WARDROBE_FILTER', patch: { color: e.target.value } })} data-testid="cf-filter-color">{colors.map((m) => <option key={m}>{m}</option>)}</select></FRow>
        <FRow label="SIZE"><b>ALL ›</b></FRow>
        <FRow label="GENDER"><b>WOMEN ›</b></FRow>
        <FRow label="AVAILABILITY"><select value={f.availability} onChange={(e) => dispatch({ type: 'WARDROBE_FILTER', patch: { availability: e.target.value as 'ALL' | 'IN_STOCK' } })} data-testid="cf-filter-availability"><option value="ALL">ALL</option><option value="IN_STOCK">IN STOCK</option></select></FRow>
        <section className="cf-look2__sub">
          <h5>PROJECT PROVENANCE</h5>
          <dl className="cf-krows cf-krows--xs">
            <div><dt>SOURCE PROJECT</dt><dd>{sel?.sourceProject ?? 'NDXBOOK'}</dd></div>
            <div><dt>ASSET POOL</dt><dd>PRIMARY</dd></div>
            <div><dt>PROVENANCE</dt><dd>LIBRARY SEED</dd></div>
            <div><dt>APPROVED BY</dt><dd>—</dd></div>
          </dl>
        </section>
        <section className="cf-look2__sub" data-testid="cf-compat">
          <h5>CONTINUITY COMPATIBILITY</h5>
          <dl className="cf-krows cf-krows--xs">
            <div><dt>COMPATIBLE WITH</dt><dd>NDXBOOK {state.selectedBodyVersionId}</dd></div>
            <div><dt>BODY FIT</dt><dd>{sel ? (sel.compatibleBodyVersions.includes(state.selectedBodyVersionId) ? 'COMPATIBLE' : 'REVALIDATE') : '—'}</dd></div>
            <div><dt>CONFLICTS</dt><dd className="is-ok">NONE</dd></div>
            <div><dt>NOTES</dt><dd>CONTINUITY SAFE</dd></div>
          </dl>
        </section>
      </aside>
      <section className="cf-look2__lib">
        <div className="cf-look2__tabs" role="tablist" data-testid="cf-wardrobe-tabs">
          {WARDROBE_CATEGORIES.map((c) => (
            <button key={c} role="tab" aria-selected={state.wardrobeTab === c} className={state.wardrobeTab === c ? 'is-on' : ''} onClick={() => dispatch({ type: 'WARDROBE_TAB', tab: c })} data-testid={`cf-wtab-${c.toLowerCase()}`}>{c}</button>
          ))}
        </div>
        <div className="cf-look2__grid" data-testid="cf-garments">
          {items.map((g) => {
            const inSlot = Object.values(state.fitting).includes(g.garmentId);
            return (
              <button key={g.garmentId} type="button" className={`cf-gar${inSlot ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'FIT_GARMENT', garmentId: g.garmentId })} data-testid={`cf-garment-${g.code}`} aria-pressed={inSlot}>
                <CfImage slotId={g.slotId} url={url(g.slotId)} label={g.type} className="cf-gar__img" />
                {inSlot ? <i className="cf-gar__tick"><IcCheck width={5} height={5} /></i> : null}
                <b>{g.name}</b>
                <small>{g.material} / {g.color}</small>
                <small>SIZE: {g.size}</small>
                <em className={g.availability === 'IN_STOCK' ? 'is-ok' : 'is-warn'}>{g.availability.replace('_', ' ')}</em>
              </button>
            );
          })}
          {!items.length ? <p className="cf-empty">NO LIBRARY ITEMS MATCH</p> : null}
        </div>
      </section>
      <section className="cf-look2__layers" data-testid="cf-garment-layers">
        <h4>GARMENT LAYERS</h4>
        <ul>
          {layers.map(({ k, g }) => {
            const off = state.fittingHidden.includes(k);
            return (
              <li key={k} className={g ? 'is-set' : ''}>
                <em>{k}</em>
                {g ? <CfImage slotId={g.slotId} url={url(g.slotId)} label="" className="cf-look2__limg" /> : <span className="cf-look2__limg is-empty" aria-hidden />}
                <span><b>{g ? g.name : 'NOT SELECTED'}</b>{g ? <small>{g.material} / {g.color}</small> : null}</span>
                <button type="button" className={`cf-eye2${g && !off ? ' is-on' : ''}`} aria-label={`Toggle ${k}`} disabled={!g} onClick={() => dispatch({ type: 'TOGGLE_FITTING_LAYER', layer: k })} aria-pressed={!!g && !off}>
                  <svg viewBox="0 0 16 10" aria-hidden><path d="M1 5c2-3 4.5-4 7-4s5 1 7 4c-2 3-4.5 4-7 4s-5-1-7-4z" /><circle cx="8" cy="5" r="2" />{!g || off ? <line x1="2" y1="9" x2="14" y2="1" /> : null}</svg>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="cf-look2__slot" data-testid="cf-look-slot">
        <h4>SELECTED LOOK SLOT</h4>
        <small>LOOK SLOT</small>
        <b>01</b>
        <div className="cf-look2__drop">
          {(['L1', 'L2', 'L4'] as const).map((k, i) => {
            const g = state.fitting[k] ? GARMENT_BY_ID[state.fitting[k]!] : null;
            return (
              <span key={k} className="cf-look2__dropi">
                {i ? <i>+</i> : null}
                <span className={g ? 'is-set' : ''} style={{ ['--sw' as string]: g?.swatch ?? 'transparent' }}><IcShirt width={16} height={16} /></span>
              </span>
            );
          })}
          <small>{fitted.length ? fitted.map(({ g }) => g!.name).join(' + ') : 'DRAG & DROP OR ADD ITEMS TO BUILD LOOK'}</small>
        </div>
        <button type="button" className="cf-cbtn cf-cbtn--c" onClick={() => dispatch({ type: 'CLEAR_FITTING' })} data-testid="cf-clear-slot">CLEAR SLOT <IcTrash width={7} height={7} /></button>
      </section>
      <section className="cf-look2__add" data-testid="cf-add-fitting">
        <h4>ADD TO FITTING</h4>
        <dl><dt>DESTINATION</dt><dd>FITTING STATION</dd><dt>LOOK PREVIEW</dt><dd>SLOT 01</dd></dl>
        <button type="button" className="cf-kbtn" data-testid="cf-add-to-fitting" onClick={() => dispatch({ type: 'ADD_TO_FITTING', at: now() })}>{state.fittingSubmitted ? 'ADDED TO FITTING' : 'ADD TO FITTING'} <IcArrowR width={8} height={8} /></button>
        <p>SELECTED ITEMS WILL BE ADDED TO THE CURRENT FITTING STATION AS LIBRARY ASSETS. NO NEW VERSION WILL BE GENERATED.</p>
      </section>
      <div className="cf-look2__go">
        <button type="button" className="cf-rbtn" data-testid="cf-open-look-compare" onClick={() => dispatch({ type: 'OPEN_LOOK_COMPARE' })}>COMPARE LOOK CANDIDATES <IcArrowR width={9} height={9} /></button>
      </div>
    </div>
  );
}

export function LookView() {
  return (
    <>
      <StandardHero h={312} railTop={255} cardTop={40} cyl={{ top: 15, plat: 232 }} fig={{ x: 179, y: 24, w: 74, h: 216 }} cardH={202} />
      <WardrobeLibrary />
    </>
  );
}

/* ── 5419 ───────────────────────────────────────────────────────────── */

export function LookCompare() {
  const { state, dispatch, now, actor, character, url, status } = useFabrication();
  const rail = useRef<HTMLDivElement | null>(null);
  const selected = LOOK_CANDIDATES.find((c) => c.candidateId === state.selectedLookCandidateId)!;
  const approved = state.authority.look === 'APPROVED' && !state.stale.look;
  const step = (d: -1 | 1) => {
    const ids = LOOK_CANDIDATES.map((c) => c.candidateId);
    const i = ids.indexOf(state.selectedLookCandidateId);
    dispatch({ type: 'SELECT_LOOK_CANDIDATE', candidateId: ids[(i + d + ids.length) % ids.length] as LookCandidateId });
  };
  return (
    <div className="cf-lc" data-testid="cf-look-compare">
      <header className="cf-lc__head">
        <small>03 - LOOK</small>
        <h2>WARDROBE CANDIDATES / COMPARE</h2>
        <p>SELECT AND APPROVE FINAL LOOK FOR PRODUCTION</p>
        <button type="button" className="cf-obtn cf-lc__back" data-testid="cf-lookcompare-back" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })}>BACK TO STATIONS <IcArrowR width={8} height={8} /></button>
      </header>
      <section className="cf-lc__id">
        <CfImage slotId={actor.portraitSlotId} url={url(actor.portraitSlotId)} label="" className="cf-lc__idimg" />
        <dl>
          <div><dt>ACTOR</dt><dd>{actor.catalogueNumber}</dd></div>
          <div><dt>AGE</dt><dd>{actor.ageRange}</dd></div>
          <div><dt>ETHNICITY</dt><dd>{actor.castingTags[0] ?? '—'}</dd></div>
        </dl>
        <dl>
          <div><dt>PROJECT</dt><dd>{state.selectedProjectId.toUpperCase()}</dd></div>
          <div><dt>ENTRY</dt><dd>{state.selectedEntryId}</dd></div>
          <div><dt>VERSION</dt><dd>{character.version}</dd></div>
        </dl>
        <dl>
          <div><dt>STATUS</dt><dd><em className="cf-infab">{status('look') === 'APPROVED' ? 'LOOK APPROVED' : 'IN FABRICATION'}</em></dd></div>
          <div><dt>LAST UPDATED</dt><dd>{state.history[0]?.at.slice(0, 10) ?? '—'}</dd></div>
          <div><dt>APPROVED BY</dt><dd>{approved ? 'FOUNDER' : 'PENDING'}</dd></div>
        </dl>
      </section>
      <div className="cf-lc__cands" ref={rail} data-testid="cf-candidates">
        <button type="button" className="cf-lc__nav is-l" aria-label="Previous candidate" onClick={() => step(-1)}><IcChevL width={8} height={8} /></button>
        {LOOK_CANDIDATES.map((c) => {
          const on = c.candidateId === state.selectedLookCandidateId;
          return (
            <article key={c.candidateId} className={`cf-cand2${on ? ' is-on' : ''}`} data-testid={`cf-candidate-${c.candidateId}`} data-selected={on}>
              <header><b>{c.label}</b>{c.candidateId === 'A' ? <em>PRIMARY</em> : null}</header>
              <div className="cf-cand2__stage">
                <CfImage slotId={c.slotId} url={url(c.slotId)} label={`LOOK ${c.candidateId} · FULL LOOK`} className="cf-cand2__img" />
                <button type="button" className={on ? 'cf-cand2__sel is-on' : 'cf-cand2__sel'} onClick={() => dispatch({ type: 'SELECT_LOOK_CANDIDATE', candidateId: c.candidateId as LookCandidateId })} data-testid={`cf-select-${c.candidateId}`}>{on ? <><IcCheck width={7} height={7} /> SELECTED</> : 'SELECT'}</button>
              </div>
              <dl>
                <div><dt>PALETTE</dt><dd className="cf-pal">{c.palette.map((p) => <i key={p} style={{ background: p }} />)}</dd></div>
                <div><dt>MATERIALS</dt><dd>{c.materials}</dd></div>
                <div><dt>LAYERS</dt><dd>{c.layers.map((l) => l.layer).slice(0, 3).join(', ')}</dd></div>
                <div className="is-stack"><dt>SCENE COMPATIBILITY</dt><dd>{c.sceneCompatibility.map((n) => String(n).padStart(2, '0')).join(', ')}</dd></div>
                <div className="is-stack"><dt>NOTES</dt><dd>{c.notes}</dd></div>
              </dl>
            </article>
          );
        })}
        <button type="button" className="cf-lc__nav is-r" aria-label="Next candidate" onClick={() => step(1)}><IcChevR width={8} height={8} /></button>
      </div>
      <div className="cf-lc__tri">
        <section data-testid="cf-layer-breakdown">
          <header><small>LAYER BREAKDOWN</small><b>{selected.label}</b></header>
          <div className="cf-lc__lb">
            <CfImage slotId={`${selected.slotId}.layers`} url={url(`${selected.slotId}.layers`)} label="LAYER FLAT" className="cf-lc__lbimg" />
            <ul>{selected.layers.map((l) => <li key={l.layer}><b>{l.layer}</b><small>{l.item}</small></li>)}</ul>
          </div>
        </section>
        <section data-testid="cf-material-continuity">
          <header><small>COLOR / MATERIAL CONTINUITY</small><b>{selected.label}</b></header>
          <p className="cf-lc__pp"><small>PROJECT PALETTE</small><span><b>NDXBOOK</b>{selected.palette.map((p) => <i key={p} style={{ background: p }} />)}</span></p>
          <dl>{selected.materialContinuity.map((m) => <div key={m.k}><dt>{m.k}</dt><dd>{m.v}</dd></div>)}</dl>
        </section>
        <section data-testid="cf-styling-notes">
          <header><small>STYLING NOTES</small><b>{selected.label}</b></header>
          <p className="cf-lc__notes">{selected.stylingNotes}</p>
          <dl><div><dt>PROVENANCE</dt><dd>{selected.provenance.replace('_', ' ')}</dd></div><div><dt>DATE</dt><dd>{now().slice(0, 10)}</dd></div></dl>
        </section>
      </div>
      <p className="cf-lc__hint">COMPARE ALL CANDIDATES BEFORE MAKING A SELECTION</p>
      <div className="cf-lc__act">
        <button type="button" className="cf-obtn cf-obtn--redt" data-testid="cf-look-reject" onClick={() => dispatch({ type: 'LOOK_DECISION', decision: 'REJECTED', at: now() })}>REJECT</button>
        <button type="button" className="cf-obtn" data-testid="cf-look-revise" onClick={() => dispatch({ type: 'LOOK_DECISION', decision: 'REVISION_REQUESTED', at: now() })}>REQUEST REVISION</button>
        <button type="button" className="cf-rbtn" data-testid="cf-look-approve" onClick={() => dispatch({ type: 'LOOK_DECISION', decision: 'APPROVED', at: now() })}>APPROVE / CONTINUE <IcArrowR width={9} height={9} /></button>
      </div>
    </div>
  );
}
