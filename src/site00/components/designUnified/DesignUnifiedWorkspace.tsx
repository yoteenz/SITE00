import { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productionNavHref } from '../productionHub/nav';
import { DwsIcon, DwsStageObject } from './DwsIcons';
import { DwsArt, DwsStage } from './DwsStage';
import {
  AssetDetailsInspector,
  AssetDetailsModal,
  AssetLibraryDrawer,
  AssetsCenter,
  AuthorityReviewModal,
  BrandCenter,
  BrandLibraryDrawer,
  BrandReviewModal,
  CompareSurfacesModal,
  CompilerCenter,
  ExperienceMap,
  ExportModal,
  InteractionInspector,
  JourneysDrawer,
  MetadataInspector,
  PathReviewModal,
  ProjectIntelligenceInspector,
  SurfaceCenter,
  SurfaceDetailsInspector,
  SurfaceFamiliesDrawer,
  SynthesisDrawer,
} from './DwsOverlays';
import {
  DWS_MODES,
  DWS_MODE_LABEL,
  DWS_NAV,
  DWS_PIPELINE,
  DWS_PROJECTS,
  DWS_TABLE,
  type DwsDrawerId,
  type DwsInspectorId,
  type DwsMode,
  type DwsModalId,
} from './dwsModel';
import { DWS_INITIAL, dwsReducer, loadDws, saveDws, type DwsAction, type DwsState } from './dwsState';
import '../../styles/site00-design-unified.css';

export type DwsViewport = 'desktop' | 'tablet' | 'mobile';

export function viewportFor(width: number): DwsViewport {
  if (width >= 1100) return 'desktop';
  if (width >= 700) return 'tablet';
  return 'mobile';
}

function useDwsViewport(): DwsViewport {
  const read = () => (typeof window === 'undefined' ? 'desktop' : viewportFor(window.innerWidth));
  const [vp, setVp] = useState<DwsViewport>(read);
  useEffect(() => {
    const on = () => setVp(read());
    on();
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
    };
  }, []);
  return vp;
}

type P = { state: DwsState; dispatch: (a: DwsAction) => void };

function Drawer({ id, ...p }: P & { id: DwsDrawerId }) {
  switch (id) {
    case 'brand-library':
      return <BrandLibraryDrawer {...p} />;
    case 'journeys':
      return <JourneysDrawer {...p} />;
    case 'surface-families':
      return <SurfaceFamiliesDrawer {...p} />;
    case 'synthesis':
      return <SynthesisDrawer {...p} />;
    case 'asset-library':
      return <AssetLibraryDrawer {...p} />;
  }
}

function Inspector({ id, ...p }: P & { id: DwsInspectorId }) {
  switch (id) {
    case 'asset-details':
      return <AssetDetailsInspector {...p} />;
    case 'interaction-select':
      return <InteractionInspector {...p} />;
    case 'surface-details':
      return <SurfaceDetailsInspector {...p} />;
    case 'project-intelligence':
      return <ProjectIntelligenceInspector {...p} />;
    case 'metadata-versions':
      return <MetadataInspector {...p} />;
  }
}

function Modal({ id, ...p }: P & { id: DwsModalId }) {
  switch (id) {
    case 'brand-review':
      return <BrandReviewModal {...p} />;
    case 'path-review':
      return <PathReviewModal {...p} />;
    case 'compare-surfaces':
      return <CompareSurfacesModal {...p} />;
    case 'authority-review':
      return <AuthorityReviewModal {...p} />;
    case 'asset-details':
      return <AssetDetailsModal {...p} />;
    case 'export':
      return <ExportModal {...p} />;
  }
}

function Center({ mode, ...p }: P & { mode: DwsMode }) {
  switch (mode) {
    case 'brand':
      return <BrandCenter />;
    case 'experience':
      return <ExperienceMap {...p} />;
    case 'surfaces':
      return <SurfaceCenter {...p} />;
    case 'compiler':
      return <CompilerCenter {...p} />;
    case 'assets':
      return <AssetsCenter {...p} />;
  }
}

function Pipeline({ state, dispatch }: P) {
  const stages = DWS_PIPELINE[state.mode];
  const active = state.pipelineStage[state.mode] ?? 0;
  return (
    <section className="dws-pipeline" aria-label="DESIGN PIPELINE" data-testid="dws-pipeline">
      <header className="dws-sechead">
        <h2>DESIGN PIPELINE</h2>
        <Link to="/production?panel=activity" className="dws-viewall">
          VIEW ALL <DwsIcon name="arrow" size={14} />
        </Link>
      </header>
      <ol className="dws-stages">
        {stages.map((s, i) => (
          <li key={s.code + s.label} className={i === active ? 'is-active' : i < active ? 'is-done' : ''}>
            <button type="button" onClick={() => dispatch({ type: 'PIPELINE_STAGE_SELECT', index: i })} aria-current={i === active ? 'step' : undefined} data-stage={s.label}>
              <DwsStageObject icon={s.icon} label={s.label} />
              <b>{s.code}</b>
              <span>{s.label}</span>
              <i className="dws-stages__bar" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function OnYourTable({ state, dispatch }: P) {
  const cards = DWS_TABLE[state.mode];
  return (
    <section className="dws-table" aria-label="ON YOUR TABLE" data-testid="dws-table">
      <header className="dws-sechead">
        <div>
          <h2>ON YOUR TABLE</h2>
          <small>ITEMS THAT NEED YOUR ATTENTION</small>
        </div>
        <Link to="/production?panel=activity" className="dws-viewall">
          VIEW ALL <DwsIcon name="arrow" size={14} />
        </Link>
      </header>
      <ul className="dws-cards">
        {cards.map((c) => (
          <li key={c.id} className={state.tableSelected === c.id ? 'is-sel' : ''}>
            <DwsArt slot={c.slot} tone="dark" className="dws-cards__art" />
            {c.badge ? <em className="dws-cards__badge">{c.badge}</em> : null}
            <i className="dws-cards__flag" aria-hidden="true" />
            <strong>{c.title}</strong>
            <small>{c.sub}</small>
            <button type="button" className={`dws-cards__act dws-cards__act--${c.action.toLowerCase()}`} onClick={() => dispatch({ type: 'ON_YOUR_TABLE_SELECT', id: c.id, modal: c.opens })} data-testid={`dws-table-${c.action.toLowerCase()}`}>
              <span>{c.action}</span>
              <DwsIcon name="chevronR" size={12} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DesignUnifiedWorkspace({ projectSlug }: { projectSlug: string }) {
  const navigate = useNavigate();
  const vp = useDwsViewport();
  // Persisted decisions/selection are read synchronously so the first save can never overwrite them with defaults.
  const [state, dispatch] = useReducer(dwsReducer, projectSlug, (slug): DwsState => ({ ...DWS_INITIAL, ...loadDws(slug), drawer: null, inspector: null, modal: null, toast: null }));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    saveDws(projectSlug, state);
  }, [projectSlug, state]);
  useEffect(() => {
    if (!state.toast) return;
    const t = window.setTimeout(() => dispatch({ type: 'DISMISS_TOAST' }), 2600);
    return () => window.clearTimeout(t);
  }, [state.toast]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (state.modal) dispatch({ type: 'CLOSE_MODAL' });
      else if (state.inspector) dispatch({ type: 'CLOSE_INSPECTOR' });
      else if (state.drawer) dispatch({ type: 'CLOSE_DRAWER' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.modal, state.inspector, state.drawer]);

  const project = DWS_PROJECTS.find((p) => p.slug === projectSlug) ?? { slug: projectSlug, name: projectSlug.toUpperCase().replace(/-/g, ' ') };
  const decided = Object.values(state.decisions).filter((d) => d.status !== 'PENDING REVIEW').length;
  const needs = Math.max(0, 3 - decided);

  const anyOverlay = Boolean(state.drawer || state.inspector || state.modal);
  const showModal = Boolean(state.modal);
  const showInspector = Boolean(state.inspector) && (vp === 'desktop' || (vp === 'tablet' && !state.modal) || (vp === 'mobile' && !state.modal));
  const showDrawer =
    Boolean(state.drawer) && (vp === 'desktop' || (vp === 'tablet' && !state.modal) || (vp === 'mobile' && !state.modal && !state.inspector));
  const showInspectorFinal = vp === 'mobile' ? showInspector && !state.modal : showInspector;
  const showCenter = vp === 'desktop' && anyOverlay;

  return (
    <div className="dws" data-viewport={vp} data-mode={state.mode} data-overlay={anyOverlay ? 'open' : 'none'} data-testid="design-unified-workspace">
      <header className="dws-top">
        <div className="dws-brandmark">
          <i aria-hidden="true" />
          <span>
            <strong>DESIGN</strong>
            <small>SITE 00 / STUDIO WORLD</small>
          </span>
        </div>
        <div className="dws-project">
          <DwsArt slot={`PROJECT.ART.${project.name.replace(/\s/g, '_')}.MARK`} tone="dark" className="dws-project__mark" />
          <span>
            <small>PROJECT</small>
            <button type="button" className="dws-project__btn" aria-haspopup="listbox" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)} data-testid="dws-project">
              <strong>{project.name}</strong>
              <DwsIcon name="chevron" size={14} />
            </button>
          </span>
          {menuOpen ? (
            <ul className="dws-project__menu" role="listbox" aria-label="PROJECT">
              {DWS_PROJECTS.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={p.slug === projectSlug}
                    onClick={() => {
                      setMenuOpen(false);
                      if (p.slug !== projectSlug) navigate(`/production/${p.slug}/design-workspace`);
                    }}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav className="dws-modes" aria-label="DESIGN MODES" data-testid="dws-modes">
          {DWS_MODES.map((m) => (
            <button key={m} type="button" className={state.mode === m ? 'is-on' : ''} aria-current={state.mode === m ? 'page' : undefined} onClick={() => dispatch({ type: 'MODE_SWITCH', mode: m })} data-mode-tab={m}>
              {DWS_MODE_LABEL[m]}
            </button>
          ))}
        </nav>

        <button type="button" className="dws-needs" onClick={() => document.querySelector('.dws-table')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })} aria-label={`${needs} ITEMS NEED YOU`} data-testid="dws-needs">
          <span className="dws-needs__dial" aria-hidden="true">
            <i />
          </span>
          <b>{String(needs).padStart(2, '0')}</b>
          <small>ITEMS NEED YOU</small>
        </button>
        <button type="button" className="dws-iconbtn dws-menu" aria-label="MENU" onClick={() => dispatch({ type: 'RETURN_TO_OVERVIEW' })}>
          <DwsIcon name="menu" size={20} />
        </button>
      </header>

      <main className="dws-main">
        <div className="dws-stagewrap">
          <DwsStage state={state} dispatch={dispatch} />
          {anyOverlay ? <div className="dws-scrim" onClick={() => dispatch({ type: 'RETURN_TO_OVERVIEW' })} aria-hidden="true" /> : null}
          <div className={`dws-layer${anyOverlay ? ' is-open' : ''}`}>
            {showCenter ? <div className="dws-layer__center"><Center mode={state.mode} state={state} dispatch={dispatch} /></div> : null}
            {showDrawer && state.drawer ? <div className="dws-layer__drawer"><Drawer id={state.drawer} state={state} dispatch={dispatch} /></div> : null}
            {showInspectorFinal && state.inspector ? <div className="dws-layer__inspector"><Inspector id={state.inspector} state={state} dispatch={dispatch} /></div> : null}
            {showModal && state.modal ? <div className="dws-layer__modal"><Modal id={state.modal} state={state} dispatch={dispatch} /></div> : null}
          </div>
          {anyOverlay ? (
            <button type="button" className="dws-return" onClick={() => dispatch({ type: 'RETURN_TO_OVERVIEW' })} data-testid="dws-return">
              <DwsIcon name="chevronL" size={14} />
              <span>RETURN TO OVERVIEW</span>
            </button>
          ) : null}
        </div>

        <div className="dws-lower">
          <Pipeline state={state} dispatch={dispatch} />
          <OnYourTable state={state} dispatch={dispatch} />
        </div>
      </main>

      <nav className="dws-footnav" aria-label="STUDIO OS NAVIGATION" data-testid="dws-footnav">
        {DWS_NAV.map((n) => {
          const href =
            n.id === 'hub' || n.id === 'exit'
              ? '/production'
              : n.id === 'library'
                ? productionNavHref('library', projectSlug)
                : n.id === 'activity'
                  ? '/production?panel=activity'
                  : null;
          const inner = (
            <>
              <DwsIcon name={n.icon} size={24} accent={n.id === 'activity'} />
              <span>{n.label}</span>
            </>
          );
          return href ? (
            <Link key={n.id} to={href} className="dws-footnav__item" data-nav={n.id}>
              {inner}
            </Link>
          ) : (
            <button key={n.id} type="button" className="dws-footnav__item is-on" aria-current="page" onClick={() => dispatch({ type: 'RETURN_TO_OVERVIEW' })} data-nav={n.id}>
              {inner}
            </button>
          );
        })}
      </nav>

      {state.toast ? (
        <div className="dws-toast" role="status" aria-live="polite" data-testid="dws-toast">
          <DwsIcon name="check" size={14} />
          <span>{state.toast}</span>
        </div>
      ) : null}
    </div>
  );
}
