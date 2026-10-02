import { useMemo, useState } from 'react';
import { DwsIcon } from './DwsIcons';
import { DwsArt } from './DwsStage';
import { Btn, Chips, CommentBox, KV, Overlay, SearchField, StatusPill, Tabs, Toggle } from './DwsParts';
import {
  DWS_ASSET_GROUPS,
  DWS_BRAND_ASSETS,
  DWS_BRAND_TREE,
  DWS_COMPILER_FAMILIES,
  DWS_COMPILER_INPUTS,
  DWS_EDGES,
  DWS_EXPORT_FORMATS,
  DWS_EXP_FILTERS,
  DWS_EXPRESSION_RECORD,
  DWS_ICON_SET_ITEMS,
  DWS_JOURNEYS,
  DWS_NODES,
  DWS_PATH,
  DWS_SURFACES,
  DWS_SURFACE_FAMILIES,
  DWS_SURFACE_TABS,
  DWS_VARIANTS,
  DWS_VERSIONS,
  type DwsAsset,
} from './dwsModel';
import type { DwsAction, DwsState } from './dwsState';
import { brandAssetSlot, iconAssetSlot } from './dwsSlots';
import { useDwsViewport } from './dwsViewport';

type P = { state: DwsState; dispatch: (a: DwsAction) => void };
const status = (s: DwsState, id: string, fallback: string) => s.decisions[id]?.status ?? fallback;

/* ============================================================= BRAND */

export function selectedBrandAsset(s: DwsState): DwsAsset {
  const live = DWS_BRAND_ASSETS.filter((a) => !s.deleted.includes(a.id));
  return live.find((a) => a.id === s.selected.brand) ?? live[0] ?? DWS_BRAND_ASSETS[0]!;
}

export function BrandLibraryDrawer({ state, dispatch }: P) {
  const tab = state.filter.brand ?? 'ALL';
  const q = (state.search.brand ?? '').toLowerCase();
  const sel = selectedBrandAsset(state);
  const items = DWS_BRAND_ASSETS.filter((a) => !state.deleted.includes(a.id))
    .filter((a) => tab === 'ALL' || a.tab === tab)
    .filter((a) => !q || `${a.name} ${a.sub}`.toLowerCase().includes(q));
  const [open, setOpen] = useState('LOGOS');
  return (
    <Overlay kind="drawer" id="brand-library" title="LIBRARY" onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}>
      <Tabs tabs={['ALL', 'BRAND', 'VISUALS', 'TEMPLATES', 'MEDIA']} value={tab} onChange={(v) => dispatch({ type: 'FILTER', scope: 'brand', value: v })} label="LIBRARY FILTER" />
      <SearchField id="dws-brand-search" value={state.search.brand ?? ''} onChange={(v) => dispatch({ type: 'SEARCH', scope: 'brand', value: v })} placeholder="SEARCH BRAND ASSETS, EXPRESSIONS…" />
      <div className="dws-split">
        <nav className="dws-tree" aria-label="LIBRARY TREE">
          {DWS_BRAND_TREE.map((g) => (
            <div key={g.id}>
              <button type="button" className={`dws-tree__group${g.id === 'identity' ? ' is-open' : ''}`} onClick={() => g.children.length && setOpen(g.children[0]!)}>
                <DwsIcon name={g.children.length ? 'chevron' : 'chevronR'} size={10} />
                {g.label}
              </button>
              {g.children.map((c) => (
                <button key={c} type="button" className={`dws-tree__leaf${open === c ? ' is-on' : ''}`} onClick={() => setOpen(c)}>
                  {c}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="dws-grid-wrap">
          <p className="dws-grid-title">
            {open} <small>({items.length})</small>
          </p>
          <ul className="dws-assetgrid" data-testid="dws-brand-grid">
            {items.map((a) => (
              <li key={a.id}>
                <button type="button" className={`dws-asset${sel.id === a.id ? ' is-sel' : ''}`} onClick={() => dispatch({ type: 'SELECT_ARTIFACT', id: a.id })} aria-pressed={sel.id === a.id}>
                  <DwsArt slot={brandAssetSlot(a.id)} tone={a.id.includes('dark') ? 'dark' : 'light'} className="dws-asset__art" />
                  <span className="dws-asset__name">{a.name}</span>
                  <small>{a.sub}</small>
                  {sel.id === a.id ? (
                    <i className="dws-asset__check">
                      <DwsIcon name="check" size={10} />
                    </i>
                  ) : null}
                </button>
              </li>
            ))}
            {items.length === 0 ? <li className="dws-empty">NO ASSETS MATCH THIS FILTER</li> : null}
          </ul>
        </div>
      </div>
    </Overlay>
  );
}

export function AssetDetailsInspector({ state, dispatch }: P) {
  const a = selectedBrandAsset(state);
  const tab = state.inspectorTab.brand ?? 'PROPERTIES';
  const st = status(state, a.id, a.status);
  return (
    <Overlay kind="inspector" id="asset-details" title="ASSET DETAILS" onClose={() => dispatch({ type: 'CLOSE_INSPECTOR' })}>
      <div className="dws-asset-head">
        <DwsArt slot={brandAssetSlot(a.id)} tone="light" className="dws-asset-head__art" />
        <span>
          <strong>{a.name}</strong>
          <small>{a.sub}</small>
          <StatusPill status={st} />
        </span>
        <em className="dws-ver">{a.version}</em>
      </div>
      <Tabs tabs={['PROPERTIES', 'GUIDELINES', 'VERSIONS', 'USAGE']} value={tab} onChange={(v) => dispatch({ type: 'INSPECTOR_TAB', scope: 'brand', value: v })} label="DETAIL TABS" />
      {tab === 'PROPERTIES' ? (
        <>
          <KV rows={[['ASSET NAME', `${a.name} ${a.sub}`], ['DESCRIPTION', a.desc]]} />
          <Chips items={a.tags} />
          <KV rows={[['FORMAT', 'SVG (VECTOR)'], ['DIMENSIONS', 'SCALABLE'], ['FILE SIZE', '284 KB'], ['COLOR MODE', 'RGB'], ['CREATED', a.created], ['LAST MODIFIED', a.modified], ['STATUS', <StatusPill key="s" status={st} />], ['LOCATIONS', '/ BRAND / IDENTITY / LOGOS /']]} />
        </>
      ) : null}
      {tab === 'GUIDELINES' ? <KV rows={[['CLEAR SPACE', '1X MARK HEIGHT'], ['MINIMUM SIZE', '24 PX / 8 MM'], ['MISUSE', 'NO STRETCH · NO RECOLOR · NO EFFECTS']]} /> : null}
      {tab === 'VERSIONS' ? <VersionList /> : null}
      {tab === 'USAGE' ? <KV rows={[['USAGE', a.usage], ['SURFACES', 'DESKTOP · TABLET · MOBILE · APP'], ['COUNT', '+12 PLACEMENTS']]} /> : null}
      <div className="dws-actions">
        <Btn icon="open" onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'brand-review' })} testId="dws-open-review">
          OPEN IN EDITOR
        </Btn>
        <Btn icon="review" onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'brand-review' })}>
          REVIEW
        </Btn>
      </div>
    </Overlay>
  );
}

function VersionList() {
  return (
    <ul className="dws-versions">
      {DWS_VERSIONS.map((v) => (
        <li key={v.v}>
          <b>{v.v}</b>
          <span>{v.note}</span>
          <small>{v.date}</small>
        </li>
      ))}
    </ul>
  );
}

export function BrandReviewModal({ state, dispatch }: P) {
  const a = selectedBrandAsset(state);
  const d = state.decisions[a.id];
  const st = d?.status ?? a.status;
  return (
    <Overlay kind="modal" id="brand-review" title="REVIEW BRAND ASSET" onClose={() => dispatch({ type: 'CLOSE_MODAL' })} testId="dws-modal-brand-review"
      footer={
        <>
          <Btn icon="annotate" onClick={() => dispatch({ type: 'ANNOTATE', id: a.id })}>ANNOTATE</Btn>
          <Btn kind="ghost" onClick={() => dispatch({ type: 'REQUEST_CHANGES', id: a.id })} testId="dws-request-changes">REQUEST CHANGES</Btn>
          <Btn kind="primary" icon="check" onClick={() => dispatch({ type: 'APPROVE', id: a.id })} testId="dws-approve">APPROVE</Btn>
        </>
      }
    >
      <div className="dws-review">
        <DwsArt slot={brandAssetSlot(a.id)} tone="light" className="dws-review__art" />
        <span className="dws-review__meta">
          <strong>
            {a.name} {a.sub} <em className="dws-ver">{a.version}</em>
          </strong>
          <StatusPill status={st} />
          <KV rows={[['TYPE', a.type], ['FILE', a.file], ['CREATED', a.created], ['USAGE', a.usage]]} />
        </span>
      </div>
      {d && d.comments.length ? (
        <ul className="dws-thread" aria-label="COMMENTS">
          {d.comments.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      ) : null}
      {d && d.annotations ? <p className="dws-note">{d.annotations} ANNOTATION{d.annotations > 1 ? 'S' : ''}</p> : null}
      <CommentBox placeholder="ADD A COMMENT…" onSubmit={(text) => dispatch({ type: 'COMMENT', id: a.id, text })} />
    </Overlay>
  );
}

/* ============================================================= EXPERIENCE */

export function selectedNode(s: DwsState) {
  return DWS_NODES.find((n) => n.id === s.selected.experience) ?? DWS_NODES[3]!;
}

export function JourneysDrawer({ state, dispatch }: P) {
  const { viewport, orientation } = useDwsViewport();
  // Tablet landscape + desktop show the map in the centre panel; portrait tablet + phones carry it inside the drawer.
  const inline = viewport === 'mobile' || (viewport === 'tablet' && orientation === 'portrait');
  const tab = state.filter.experience ?? 'JOURNEYS';
  const q = (state.search.experience ?? '').toLowerCase();
  const active = state.selected.experience ? undefined : undefined;
  void active;
  const items = DWS_JOURNEYS.filter((j) => !q || j.name.toLowerCase().includes(q));
  return (
    <Overlay kind="drawer" id="journeys" code="02" title="ROUTE MAPS" sub="SYSTEM PATHWAYS" onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}>
      <Tabs tabs={['JOURNEYS', 'FLOWS', 'TOUCHPOINTS', 'STATES']} value={tab} onChange={(v) => dispatch({ type: 'FILTER', scope: 'experience', value: v })} label="ROUTE FILTER" />
      <SearchField id="dws-exp-search" value={state.search.experience ?? ''} onChange={(v) => dispatch({ type: 'SEARCH', scope: 'experience', value: v })} placeholder="SEARCH JOURNEYS, STATES, OR SCREENS…" />
      <ul className="dws-rows" data-testid="dws-journeys">
        {items.map((j) => {
          const on = (state.selected.experience ?? 'main') === j.id || (!state.selected.experience && j.active);
          return (
            <li key={j.id}>
              <button type="button" className={`dws-row${on ? ' is-sel' : ''}`} onClick={() => dispatch({ type: 'PATH_STEP', step: 0 })} aria-pressed={on}>
                <DwsArt slot={`PROJECT.ART.EXPERIENCE.JOURNEY.${j.code}`} tone="light" className="dws-row__art" />
                <b>{j.code}</b>
                <span>
                  <strong>{j.name}</strong>
                  <small>
                    {j.states} STATES · {j.flows} FLOWS
                  </small>
                </span>
                {j.active ? <em className="dws-pill dws-pill--wait">ACTIVE</em> : null}
              </button>
            </li>
          );
        })}
        {items.length === 0 ? <li className="dws-empty">NO JOURNEYS MATCH</li> : null}
      </ul>
      {inline ? (
        <section className="dws-inlinemap" data-testid="dws-inlinemap">
          <h3 className="dws-h">ROUTE MAP</h3>
          <ExperienceMap state={state} dispatch={dispatch} />
          <ul className="dws-nodelist" aria-label="ROUTE NODES">
            {DWS_NODES.map((n) => (
              <li key={n.id}>
                <button type="button" className={selectedNode(state).id === n.id ? 'is-sel' : ''} aria-pressed={selectedNode(state).id === n.id} onClick={() => dispatch({ type: 'SELECT_ARTIFACT', id: n.id })} data-node-item={n.id}>
                  <i aria-hidden="true" />
                  <span>
                    <b>{n.label}</b>
                    <small>{n.sub}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Overlay>
  );
}

export function ExperienceMap({ state, dispatch }: P) {
  const sel = selectedNode(state);
  const byId = useMemo(() => Object.fromEntries(DWS_NODES.map((n) => [n.id, n])), []);
  return (
    <div className="dws-map" data-testid="dws-map">
      <ul className="dws-map__filters" aria-label="MAP FILTERS">
        {DWS_EXP_FILTERS.map((f) => (
          <li key={f} className={f === 'JOURNEYS' ? 'is-on' : ''}>
            <i aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
      <svg className="dws-map__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {DWS_EDGES.map(([a, b]) => {
          const A = byId[a]!;
          const B = byId[b]!;
          const hot = DWS_PATH.some((p) => p === A.label || p === B.label);
          return <path key={a + b} d={`M${A.x} ${A.y} C ${A.x + 10} ${A.y}, ${B.x - 10} ${B.y}, ${B.x} ${B.y}`} className={hot ? 'is-hot' : ''} />;
        })}
      </svg>
      {DWS_NODES.map((n) => (
        <button key={n.id} type="button" className={`dws-node dws-node--${n.kind}${sel.id === n.id ? ' is-sel' : ''}`} style={{ left: `${n.x}%`, top: `${n.y}%` }} onClick={() => dispatch({ type: 'SELECT_ARTIFACT', id: n.id })} aria-pressed={sel.id === n.id} data-node={n.id}>
          <i aria-hidden="true" />
          <span>
            <b>{n.label}</b>
            <small>{n.sub}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

export function InteractionInspector({ state, dispatch }: P) {
  const n = selectedNode(state);
  const tab = state.inspectorTab.experience ?? 'PROPERTIES';
  return (
    <Overlay kind="inspector" id="interaction-select" title={`INTERACTION ${n.label}`} sub={`STATE 03 / PREVIEW`} onClose={() => dispatch({ type: 'CLOSE_INSPECTOR' })}>
      <Tabs tabs={['PROPERTIES', 'RULES', 'CONDITIONS', 'VARIANTS']} value={tab} onChange={(v) => dispatch({ type: 'INSPECTOR_TAB', scope: 'experience', value: v })} label="INTERACTION TABS" />
      {tab === 'PROPERTIES' ? (
        <>
          <h3 className="dws-h">GENERAL</h3>
          <KV rows={[['NAME', `${n.label} EXPERIENCE`], ['TYPE', n.type], ['ID', n.nodeId], ['DESCRIPTION', n.desc]]} />
          <Chips items={['PREVIEW', 'INTERACTION', 'MEDIA']} />
          <h3 className="dws-h">BEHAVIOR</h3>
          <KV rows={[['TRANSITION IN', n.transition], ['DURATION', n.duration], ['EASING', n.easing], ['TRIGGER', n.trigger], ['HAPTIC FEEDBACK', n.haptic ? 'ON' : 'OFF']]} />
          <h3 className="dws-h">
            INTERACTIONS ({n.interactions.length})
          </h3>
          <ul className="dws-rows dws-rows--compact">
            {n.interactions.map((x, i) => (
              <li key={x.name}>
                <div className="dws-row">
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <span>
                    <strong>{x.name}</strong>
                  </span>
                  <small>{x.trigger}</small>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="dws-note">{tab} FOR {n.label} · NO ADDITIONAL {tab} DEFINED.</p>
      )}
    </Overlay>
  );
}

export function PathReviewModal({ state, dispatch }: P) {
  const id = 'experience.path.main';
  const d = state.decisions[id];
  const step = Math.min(state.pathStep, DWS_PATH.length - 1);
  return (
    <Overlay kind="modal" id="path-review" title="INTERACTION PATH REVIEW" onClose={() => dispatch({ type: 'CLOSE_MODAL' })} testId="dws-modal-path-review"
      footer={
        <>
          <Btn icon="annotate" onClick={() => dispatch({ type: 'ANNOTATE', id })}>ADD ANNOTATION</Btn>
          <Btn onClick={() => dispatch({ type: 'REJECT', id })} testId="dws-reject">REJECT</Btn>
          <Btn kind="primary" icon="check" onClick={() => dispatch({ type: 'APPROVE', id })} testId="dws-approve">APPROVE</Btn>
        </>
      }
    >
      <ol className="dws-crumbs" aria-label="PATH">
        {DWS_PATH.map((p, i) => (
          <li key={p} className={i === step ? 'is-on' : i < step ? 'is-done' : ''}>
            <button type="button" onClick={() => dispatch({ type: 'PATH_STEP', step: i })}>{p}</button>
          </li>
        ))}
        <li className="dws-crumbs__count">{step + 1} / {DWS_PATH.length}</li>
      </ol>
      <div className="dws-pathview">
        <button type="button" className="dws-iconbtn" aria-label="PREVIOUS STEP" onClick={() => dispatch({ type: 'PATH_STEP', step: Math.max(0, step - 1) })}>
          <DwsIcon name="chevronL" size={14} />
        </button>
        <DwsArt slot="PROJECT.ART.EXPERIENCE.PATH.PREVIEW" tone="dark" className="dws-pathview__art">
        </DwsArt>
        <div className="dws-pathview__copy">
          <small>PRODUCT PREVIEW</small>
          <strong>{DWS_PATH[step]}</strong>
          <span>EXPLORE DYNAMIC CONTENT, PREVIEW IN REAL TIME.</span>
          <span className="dws-play"><DwsIcon name="play" size={10} /> 0:00 / 0:12</span>
        </div>
        <button type="button" className="dws-iconbtn" aria-label="NEXT STEP" onClick={() => dispatch({ type: 'PATH_STEP', step: Math.min(DWS_PATH.length - 1, step + 1) })}>
          <DwsIcon name="chevronR" size={14} />
        </button>
      </div>
      {d ? <p className="dws-note"><StatusPill status={d.status} /> {d.annotations ? `· ${d.annotations} ANNOTATIONS` : ''}</p> : null}
    </Overlay>
  );
}

/* ============================================================= SURFACES */

export function selectedSurface(s: DwsState) {
  return DWS_SURFACES.find((x) => x.id === s.selected.surfaces) ?? DWS_SURFACES[0]!;
}

export function SurfaceFamiliesDrawer({ state, dispatch }: P) {
  const fam = state.filter.surfaces ?? 'all';
  return (
    <Overlay kind="drawer" id="surface-families" code="01" title="SURFACE FAMILIES" sub="PLATFORMS & EXPRESSIONS" onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}>
      <ul className="dws-rows" data-testid="dws-families">
        {DWS_SURFACE_FAMILIES.map((f) => (
          <li key={f.id}>
            <button type="button" className={`dws-row${fam === f.id ? ' is-sel' : ''}`} aria-pressed={fam === f.id}
              onClick={() => {
                dispatch({ type: 'FILTER', scope: 'surfaces', value: f.id });
                if (['desktop', 'tablet', 'mobile', 'app'].includes(f.id)) dispatch({ type: 'SELECT_ARTIFACT', id: f.id, openInspector: true });
              }}>
              <DwsIcon name={f.icon} size={16} />
              <span>
                <strong>{f.label}</strong>
              </span>
              <DwsArt slot={`PROJECT.ART.SURFACES.FAMILY.${f.id.toUpperCase()}`} tone="dark" className="dws-row__thumb" />
              <small>{f.count}</small>
            </button>
          </li>
        ))}
      </ul>
    </Overlay>
  );
}

export function SurfaceCenter({ state, dispatch }: P) {
  const tab = state.filter.surfacesTab ?? 'DESKTOP';
  const cur = selectedSurface(state);
  return (
    <div className="dws-center" data-testid="dws-surface-center">
      <header className="dws-center__head">
        <span>
          <b>SURFACES</b> <i>/</i> <strong>INTERACTION EXPRESSIONS</strong>
        </span>
      </header>
      <Tabs tabs={DWS_SURFACE_TABS} value={tab} onChange={(v) => dispatch({ type: 'FILTER', scope: 'surfacesTab', value: v })} label="SURFACE TABS" />
      <div className="dws-center__cols">
        <DwsArt slot={`PROJECT.ART.SURFACES.PREVIEW.${tab}`} tone="dark" className="dws-center__art" />
        <div>
          <h3 className="dws-h">RESPONSIVE RELATIONSHIP</h3>
          <ul className="dws-devices">
            {DWS_SURFACES.map((s) => (
              <li key={s.id}>
                <button type="button" className={cur.id === s.id ? 'is-sel' : ''} onClick={() => dispatch({ type: 'SELECT_ARTIFACT', id: s.id })}>
                  <DwsIcon name={s.id === 'desktop' ? 'monitor' : s.id === 'tablet' ? 'tablet' : 'phone'} size={22} />
                  <span>{s.label}</span>
                  <small>{s.res}</small>
                </button>
              </li>
            ))}
          </ul>
          <h3 className="dws-h">EXPRESSION VARIANTS</h3>
          <ul className="dws-variants">
            {DWS_VARIANTS.map((v, i) => (
              <li key={v} className={i === 0 ? 'is-on' : ''}>
                <DwsArt slot={`PROJECT.ART.SURFACES.VARIANT.${i + 1}`} tone="dark" className="dws-variants__art" />
                <small>{v}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function SurfaceDetailsInspector({ state, dispatch }: P) {
  const s = selectedSurface(state);
  const st = status(state, `surfaces.${s.id}`, 'IN REVIEW');
  return (
    <Overlay kind="inspector" id="surface-details" title="SURFACE DETAILS" sub={`${s.label} EXPRESSION`} onClose={() => dispatch({ type: 'CLOSE_INSPECTOR' })}>
      <DwsArt slot={`PROJECT.ART.SURFACES.PREVIEW.${s.label}`} tone="dark" className="dws-inspector__art" />
      <h3 className="dws-h">{s.label} / MAIN INTERFACE <em className="dws-ver">{s.version}</em></h3>
      <KV rows={[['PLATFORM', s.platform], ['RESOLUTION', s.res], ['CATEGORY', s.category], ['STATUS', <StatusPill key="s" status={st} />], ['VERSION', s.version], ['UPDATED', s.updated], ['OWNER', s.owner]]} />
      <Chips items={s.tags} />
      <h3 className="dws-h">RELATED SURFACES</h3>
      <ul className="dws-related">
        {DWS_SURFACES.filter((x) => x.id !== s.id).map((x) => (
          <li key={x.id}>
            <button type="button" onClick={() => dispatch({ type: 'SELECT_ARTIFACT', id: x.id })}>
              <DwsArt slot={`PROJECT.ART.SURFACES.RELATED.${x.id.toUpperCase()}`} tone="dark" className="dws-related__art" />
              <small>{x.label} {x.version}</small>
            </button>
          </li>
        ))}
      </ul>
      <div className="dws-actions">
        <Btn icon="compare" onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'compare-surfaces' })}>COMPARE SURFACES</Btn>
      </div>
    </Overlay>
  );
}

export function CompareSurfacesModal({ state, dispatch }: P) {
  const sel = selectedSurface(state);
  const [preview, setPreview] = useState(false);
  const targets = DWS_SURFACES.filter((s) => s.id !== 'app');
  return (
    <Overlay kind="modal" id="compare-surfaces" title="COMPARE SURFACES" onClose={() => dispatch({ type: 'CLOSE_MODAL' })} testId="dws-modal-compare"
      footer={
        <>
          <Btn icon="eye" onClick={() => setPreview((p) => !p)}>PREVIEW</Btn>
          <Btn icon="plus" onClick={() => dispatch({ type: 'ADD_TO_LIBRARY', id: `surfaces.${sel.id}` })} testId="dws-add-library">ADD TO LIBRARY</Btn>
          <Btn kind="primary" icon="arrow" onClick={() => dispatch({ type: 'APPROVE', id: `surfaces.${sel.id}` })} testId="dws-approve">APPROVE EXPRESSION</Btn>
        </>
      }
    >
      <ul className="dws-compare">
        {targets.map((s) => {
          const on = state.compare.includes(s.id);
          return (
            <li key={s.id} className={on ? 'is-on' : ''}>
              <DwsArt slot={`PROJECT.ART.SURFACES.PREVIEW.${s.label}`} tone="dark" className="dws-compare__art" />
              <label>
                <input type="checkbox" checked={on} onChange={() => dispatch({ type: 'COMPARE', id: s.id })} />
                <span>{s.label}</span>
              </label>
              <small>{s.res}</small>
            </li>
          );
        })}
      </ul>
      <p className="dws-note" role="status">
        {state.compare.length} SELECTED{preview ? ' · PREVIEW ACTIVE' : ''}{state.library.includes(`surfaces.${sel.id}`) ? ' · IN LIBRARY' : ''}
      </p>
    </Overlay>
  );
}

/* ============================================================= COMPILER */

export function SynthesisDrawer({ state, dispatch }: P) {
  const { family, inputs, generated } = state.synth;
  return (
    <Overlay kind="drawer" id="synthesis" title="EXPRESSION SYNTHESIS" sub="BUILD · COMBINE · REFINE" onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}>
      <section className="dws-step">
        <h3><b>01</b> SELECT FAMILY <small>CHOOSE A SYSTEM OR DOMAIN</small></h3>
        <ul className="dws-rows dws-rows--compact" data-testid="dws-synth-families">
          {DWS_COMPILER_FAMILIES.map((f) => (
            <li key={f.id}>
              <button type="button" className={`dws-row${family === f.id ? ' is-red' : ''}`} aria-pressed={family === f.id} onClick={() => dispatch({ type: 'SYNTH_FAMILY', family: f.id })}>
                <DwsIcon name={f.icon} size={16} />
                <span><strong>{f.label}</strong></span>
                <small>{String(f.count).padStart(2, '0')}</small>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="dws-step">
        <h3><b>02</b> SELECT INPUTS <small>DATA · RULES · REFERENCES</small></h3>
        <ul className="dws-inputs">
          {DWS_COMPILER_INPUTS.map((i) => (
            <li key={i.id}>
              <button type="button" className={inputs.includes(i.id) ? 'is-sel' : ''} aria-pressed={inputs.includes(i.id)} onClick={() => dispatch({ type: 'SYNTH_INPUT', input: i.id })}>
                <DwsArt slot={`PROJECT.ART.COMPILER.INPUT.${i.label}`} tone="dark" className="dws-inputs__art" />
                <small>{i.label}</small>
                {inputs.includes(i.id) ? <i className="dws-asset__check"><DwsIcon name="check" size={10} /></i> : null}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="dws-step">
        <h3><b>03</b> GENERATE EXPRESSIONS <small>SYNTHESIZE VARIATIONS</small></h3>
        <Btn kind="dark" icon="play" onClick={() => dispatch({ type: 'GENERATE' })} testId="dws-generate">{generated ? 'GENERATED · REGENERATE' : 'GENERATE'}</Btn>
      </section>
    </Overlay>
  );
}

export function CompilerCenter({ state }: P) {
  return (
    <div className="dws-center" data-testid="dws-compiler-center">
      <header className="dws-center__head"><span><b>COMPILER</b> <i>/</i> <strong>INTERACTION EXPRESSIONS</strong></span></header>
      <div className="dws-center__cols">
        <DwsArt slot="PROJECT.ART.COMPILER.CENTER" tone="dark" className="dws-center__art" />
        <div>
          <h3 className="dws-h">INTERACTION EXPRESSIONS</h3>
          <p className="dws-note">BEHAVIORAL PATTERNS FROM STRATEGY TO EXECUTION</p>
          <ul className="dws-center__list">{['BRAND', 'EXPERIENCE', 'SURFACES', 'COMPONENTS', 'ENVIRONMENTS'].map((x) => <li key={x}>{x}</li>)}</ul>
          {state.synth.generated ? <p className="dws-note"><StatusPill status="READY FOR REVIEW" /> {DWS_EXPRESSION_RECORD.id} GENERATED</p> : null}
        </div>
      </div>
    </div>
  );
}

export function ProjectIntelligenceInspector({ state, dispatch }: P) {
  const r = DWS_EXPRESSION_RECORD;
  const tab = state.inspectorTab.compiler ?? 'INSIGHTS';
  const st = status(state, r.id, r.status);
  return (
    <Overlay kind="inspector" id="project-intelligence" title="PROJECT INTELLIGENCE" onClose={() => dispatch({ type: 'CLOSE_INSPECTOR' })}>
      <Tabs tabs={['INSIGHTS', 'REFERENCES', 'RECOMMENDATIONS']} value={tab} onChange={(v) => dispatch({ type: 'INSPECTOR_TAB', scope: 'compiler', value: v })} label="INTELLIGENCE TABS" />
      <div className="dws-asset-head">
        <DwsArt slot="PROJECT.ART.COMPILER.EXPRESSION" tone="dark" className="dws-asset-head__art" />
        <span><small>SELECTED EXPRESSION</small><strong>{r.id}</strong><small>{r.name}</small><StatusPill status={st} /></span>
      </div>
      <Tabs tabs={['OVERVIEW', 'RELATIONS', 'METADATA', 'USAGE']} value={state.inspectorTab.compilerSub ?? 'OVERVIEW'} onChange={(v) => dispatch({ type: 'INSPECTOR_TAB', scope: 'compilerSub', value: v })} label="DETAIL TABS" />
      <KV rows={[['TYPE', r.type], ['FAMILY', r.family], ['STATUS', <StatusPill key="s" status={st} />], ['VERSION', r.version], ['LAST MODIFIED', r.modified], ['AUTHOR', r.author]]} />
      <h3 className="dws-h">RELATED ARTIFACTS (5)</h3>
      <ul className="dws-related">{[1, 2, 3, 4].map((n) => <li key={n}><DwsArt slot={`PROJECT.ART.COMPILER.RELATED.${n}`} tone="dark" className="dws-related__art" /></li>)}</ul>
      <div className="dws-actions"><Btn kind="primary" icon="request" onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'authority-review' })} testId="dws-open-authority">SEND FOR REVIEW</Btn></div>
    </Overlay>
  );
}

export function AuthorityReviewModal({ state, dispatch }: P) {
  const r = DWS_EXPRESSION_RECORD;
  const [note, setNote] = useState('');
  return (
    <Overlay kind="modal" id="authority-review" title="AUTHORITY REVIEW" sub="SEND FOR APPROVAL" onClose={() => dispatch({ type: 'CLOSE_MODAL' })} testId="dws-modal-authority-review"
      footer={<><Btn onClick={() => dispatch({ type: 'CLOSE_MODAL' })} testId="dws-cancel">CANCEL</Btn><Btn kind="primary" icon="request" onClick={() => dispatch({ type: 'SEND_FOR_REVIEW', id: r.id, note })} testId="dws-send-review">SEND FOR REVIEW</Btn></>}
    >
      <p className="dws-note">SUBMIT THIS INTERACTION EXPRESSION FOR BRAND AND EXPERIENCE AUTHORITY REVIEW.</p>
      <div className="dws-review">
        <DwsArt slot="PROJECT.ART.COMPILER.EXPRESSION" tone="dark" className="dws-review__art" />
        <span className="dws-review__meta"><strong>{r.id}</strong><small>{r.name}</small><Chips items={['INTERACTION', r.version]} /></span>
      </div>
      <textarea className="dws-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ADD A NOTE FOR REVIEWERS (OPTIONAL)…" aria-label="NOTE FOR REVIEWERS" />
      {state.decisions[r.id] ? <p className="dws-note"><StatusPill status={state.decisions[r.id]!.status} /></p> : null}
    </Overlay>
  );
}

/* ============================================================= ASSETS */

export function selectedIcon(s: DwsState) {
  const live = DWS_ICON_SET_ITEMS.filter((i) => !s.deleted.includes(i.id));
  return live.find((i) => i.id === s.selected.assets) ?? live[0] ?? DWS_ICON_SET_ITEMS[0]!;
}

export function AssetLibraryDrawer({ state, dispatch }: P) {
  const group = state.filter.assets ?? 'icons';
  const q = (state.search.assets ?? '').toLowerCase();
  const sel = selectedIcon(state);
  const items = [...DWS_ICON_SET_ITEMS, ...state.duplicates.map((d) => ({ id: `${d}-copy`, name: `${d.toUpperCase().replace(/-/g, ' / ')} COPY`, starred: false }))]
    .filter((i) => !state.deleted.includes(i.id))
    .filter((i) => !q || i.name.toLowerCase().includes(q));
  return (
    <Overlay kind="drawer" id="asset-library" code="02" title="ASSET LIBRARY" sub="BROWSE & FILTER" onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}>
      <SearchField id="dws-assets-search" value={state.search.assets ?? ''} onChange={(v) => dispatch({ type: 'SEARCH', scope: 'assets', value: v })} placeholder="SEARCH ASSETS, TAGS, OR KEYWORDS…" />
      <div className="dws-split">
        <ul className="dws-rows dws-rows--compact dws-groups" data-testid="dws-asset-groups">
          {DWS_ASSET_GROUPS.map((g) => (
            <li key={g.id}>
              <button type="button" className={`dws-row${group === g.id ? ' is-red' : ''}`} aria-pressed={group === g.id} onClick={() => dispatch({ type: 'FILTER', scope: 'assets', value: g.id })}>
                <DwsIcon name={g.icon} size={14} />
                <span><strong>{g.label}</strong></span>
                <small>{g.count}</small>
              </button>
            </li>
          ))}
        </ul>
        <div className="dws-grid-wrap">
          <p className="dws-grid-title">ICON SETS <small>› CORE ICONS · {items.length} ITEMS</small></p>
          <ul className="dws-assetgrid dws-assetgrid--icons" data-testid="dws-asset-grid">
            {items.map((i) => (
              <li key={i.id}>
                <button type="button" className={`dws-asset${sel.id === i.id ? ' is-sel' : ''}`} onClick={() => dispatch({ type: 'SELECT_ARTIFACT', id: i.id })} aria-pressed={sel.id === i.id} aria-label={i.name}>
                  <DwsArt slot={iconAssetSlot(i.id.replace(/-copy$/, ''))} tone="dark" className="dws-asset__art" />
                  {i.starred ? <i className="dws-asset__star" aria-hidden="true">★</i> : null}
                  {sel.id === i.id ? <i className="dws-asset__check"><DwsIcon name="check" size={10} /></i> : null}
                </button>
              </li>
            ))}
            {items.length === 0 ? <li className="dws-empty">NO ASSETS MATCH</li> : null}
          </ul>
        </div>
      </div>
    </Overlay>
  );
}

export function AssetDetailsModal({ state, dispatch }: P) {
  const i = selectedIcon(state);
  const inLib = state.library.includes(i.id);
  return (
    <Overlay kind="modal" id="asset-details" title="ASSET DETAILS" sub="VISUAL AUTHORITY" onClose={() => dispatch({ type: 'CLOSE_MODAL' })} testId="dws-modal-asset-details"
      footer={<><Btn kind="primary" icon="open" onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'export' })} testId="dws-open-export">OPEN</Btn><Btn icon="eye" onClick={() => dispatch({ type: 'BRING_FORWARD', id: i.id })}>PREVIEW</Btn><Btn icon="plus" onClick={() => dispatch({ type: 'ADD_TO_LIBRARY', id: i.id })}>{inLib ? 'IN PACK' : 'ADD TO PACK'}</Btn></>}
    >
      <div className="dws-review">
        <DwsArt slot={iconAssetSlot(i.id.replace(/-copy$/, ''))} tone="dark" className="dws-review__art dws-review__art--big" />
        <span className="dws-review__meta">
          <strong>{i.name}</strong>
          <small>NDX_{i.id.toUpperCase().replace(/-/g, '_')}</small>
          <Chips items={['ICON', 'CORE', 'SYSTEM']} />
          <KV rows={[['FORMAT', 'PNG (TRANSPARENT)'], ['DIMENSIONS', '1024 × 1024'], ['FILE SIZE', '482 KB'], ['COLOR SPACE', 'SRGB'], ['CREATED', 'MAR 4, 2024'], ['MODIFIED', 'APR 11, 2024'], ['AUTHOR', 'STUDIO TEAM']]} />
        </span>
      </div>
    </Overlay>
  );
}

export function MetadataInspector({ state, dispatch }: P) {
  const i = selectedIcon(state);
  const tab = state.inspectorTab.assets ?? 'METADATA';
  return (
    <Overlay kind="inspector" id="metadata-versions" code="03" title="METADATA & VERSIONS" sub="ICON / CORE / 001" onClose={() => dispatch({ type: 'CLOSE_INSPECTOR' })}>
      <Tabs tabs={['METADATA', 'VERSIONS (6)', 'USAGE (27)']} value={tab} onChange={(v) => dispatch({ type: 'INSPECTOR_TAB', scope: 'assets', value: v })} label="ASSET TABS" />
      {tab === 'METADATA' ? (
        <>
          <KV rows={[['NAME', i.name], ['ID', `NDX_${i.id.toUpperCase().replace(/-/g, '_')}`], ['TYPE', 'ICON'], ['CATEGORY', 'CORE ICONS']]} />
          <Chips items={['CORE', 'SYSTEM', 'UI', 'NAVIGATION', 'RED']} />
          <p className="dws-note">PRIMARY SYSTEM ICON REPRESENTING CORE INTERACTION. USED ACROSS WORLD PRODUCTS AND ENVIRONMENTS.</p>
        </>
      ) : null}
      {tab.startsWith('VERSIONS') ? <VersionList /> : null}
      {tab.startsWith('USAGE') ? <KV rows={[['USED IN', '27 PLACEMENTS'], ['SURFACES', 'DESKTOP · TABLET · MOBILE · APP'], ['PACKS', state.library.includes(i.id) ? 'DELIVERY PACK · WEB' : 'NONE']]} /> : null}
      <div className="dws-actions">
        <Btn icon="library" onClick={() => dispatch({ type: 'ADD_TO_LIBRARY', id: i.id })}>VIEW IN LIBRARY</Btn>
        <Btn icon="duplicate" onClick={() => dispatch({ type: 'DUPLICATE', id: i.id })} testId="dws-duplicate">DUPLICATE</Btn>
        <Btn kind="danger" icon="trash" onClick={() => dispatch({ type: 'DELETE', id: i.id })} testId="dws-delete">DELETE ASSET</Btn>
        <Btn kind="primary" icon="export" onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'export' })} testId="dws-export-open">EXPORT</Btn>
      </div>
    </Overlay>
  );
}

export function ExportModal({ state, dispatch }: P) {
  const o = state.exportOpts;
  const files = 1 + (o.variants ? 2 : 0);
  return (
    <Overlay kind="modal" id="export" title="EXPORT ASSET" onClose={() => dispatch({ type: 'CLOSE_MODAL' })} testId="dws-modal-export"
      footer={<><Btn onClick={() => dispatch({ type: 'CLOSE_MODAL' })} testId="dws-cancel">CANCEL</Btn><Btn kind="primary" icon="download" onClick={() => dispatch({ type: 'EXPORT', id: selectedIcon(state).id })} testId="dws-export">EXPORT ({files} FILES)</Btn></>}
    >
      <h3 className="dws-h">EXPORT PRESET</h3>
      <ul className="dws-formats" role="radiogroup" aria-label="FILE FORMAT">
        {DWS_EXPORT_FORMATS.map((f) => (
          <li key={f.id}>
            <button type="button" role="radio" aria-checked={state.exportFormat === f.id} className={state.exportFormat === f.id ? 'is-on' : ''} onClick={() => dispatch({ type: 'SET_EXPORT_FORMAT', format: f.id })}>
              <DwsIcon name={f.id === 'usdz' ? 'cube' : 'plate'} size={20} />
              <b>{f.label}</b>
              {f.hint ? <small>{f.hint}</small> : null}
            </button>
          </li>
        ))}
      </ul>
      <label className="dws-field"><span>RESOLUTION</span>
        <select value={o.resolution} onChange={(e) => dispatch({ type: 'SET_EXPORT_OPT', key: 'resolution', value: e.target.value })}>
          {['1X (1024 × 1024)', '2X (2048 × 2048)', '4X (4096 × 4096)'].map((r) => <option key={r}>{r}</option>)}
        </select>
      </label>
      <Toggle label="INCLUDE TRANSPARENT BACKGROUND" on={o.transparent} onChange={(v) => dispatch({ type: 'SET_EXPORT_OPT', key: 'transparent', value: v })} />
      <Toggle label="EXPORT VARIANTS" on={o.variants} onChange={(v) => dispatch({ type: 'SET_EXPORT_OPT', key: 'variants', value: v })} />
      <Toggle label="OPTIMIZE FOR WEB" on={o.optimize} onChange={(v) => dispatch({ type: 'SET_EXPORT_OPT', key: 'optimize', value: v })} />
    </Overlay>
  );
}

export function AssetsCenter({ state }: P) {
  const i = selectedIcon(state);
  return (
    <div className="dws-center" data-testid="dws-assets-center">
      <header className="dws-center__head"><span><b>ASSETS</b> <i>/</i> <strong>{i.name}</strong></span></header>
      <div className="dws-center__cols">
        <DwsArt slot={iconAssetSlot(i.id.replace(/-copy$/, ''))} tone="dark" className="dws-center__art" />
        <ul className="dws-center__list">{['VISUAL AUTHORITIES', 'ICON FAMILIES', 'ENVIRONMENT PLATES', 'MATERIALS & COMPONENTS', 'TEMPLATES', 'DELIVERY PACKS'].map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
    </div>
  );
}

export function BrandCenter() {
  return (
    <div className="dws-center" data-testid="dws-brand-center">
      <header className="dws-center__head"><span><b>BRAND</b> <i>/</i> <strong>INTERACTION EXPRESSION</strong></span></header>
      <div className="dws-center__cols">
        <DwsArt slot="PROJECT.ART.BRAND.FEATURED" tone="dark" className="dws-center__art" />
        <ul className="dws-center__list">{['IDENTITY SYSTEM', 'VISUAL LANGUAGE', 'PHOTOGRAPHY', 'COLOR & TYPE', 'BRAND ASSETS', 'APPLICATIONS'].map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
    </div>
  );
}
