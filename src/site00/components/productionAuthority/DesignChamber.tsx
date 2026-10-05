import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  isProductionDesignMode,
  PRODUCTION_DESIGN_MODE_ORDER,
  type ProductionDesignMode,
} from '../../config/production-authority-registry';
import { AUTHORITY_ASSETS } from './authorityAssets';
import {
  VIEWPORT_PRESET_ORDER,
  VIEWPORT_ZOOMS,
  isViewportPreset,
  resolveViewportTarget,
  viewportScale,
  type ViewportOrientation,
  type ViewportPreset,
  type ViewportZoom,
} from './viewportTargets';
import { DESIGN_CHAMBER, type ChamberPanel, type DesignChamberConfig } from './designChamberConfig';
import { Sec } from './primitives';
import { DESIGN_DEVICES, DESIGN_SWATCHES, designIcon, designIconLabel, designStage } from './designPackAssets';

export function useDesignMode(): ProductionDesignMode {
  const [params] = useSearchParams();
  const raw = params.get('mode');
  return isProductionDesignMode(raw) ? raw : 'brand';
}

/** Six fixed design modes, always in this order. The global DESIGN tab stays active while these switch. */
export function DesignModeBar({ active }: { active: ProductionDesignMode }) {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  return (
    <nav className="pxa-modes" aria-label="Design modes" data-testid="design-modes">
      {PRODUCTION_DESIGN_MODE_ORDER.map((m) => (
        <Link
          key={m}
          to={`/production/${projectSlug}/design?mode=${m}`}
          className={m === active ? 'is-active' : undefined}
          aria-current={m === active ? 'page' : undefined}
          data-testid={`design-mode-${m}`}
          replace
        >
          {DESIGN_CHAMBER[m].label}
        </Link>
      ))}
    </nav>
  );
}

function PanelVis({ panel }: { panel: ChamberPanel }) {
  switch (panel.vis) {
    case 'plates':
      return (
        <span className="pxa-vis pxa-vis--plates">
          {(panel.plates ?? []).map((p, i) => (
            <i key={`${panel.n}-${i}`} style={{ backgroundImage: `url(${p})` }} />
          ))}
        </span>
      );
    case 'swatches':
      return (
        <span className="pxa-vis pxa-vis--swatches" data-pack="swatches">
          {DESIGN_SWATCHES.slice(0, 6).map((m) => (
            <img key={m.id} src={m.src} alt={m.label} title={m.label} loading="lazy" />
          ))}
        </span>
      );
    case 'icons':
      return (
        <span className="pxa-vis pxa-vis--icons" data-pack="icons">
          {(panel.icons ?? []).map((id) => (
            <img key={id} src={designIcon(id)} alt={designIconLabel(id)} title={designIconLabel(id)} loading="lazy" />
          ))}
        </span>
      );
    case 'devices':
      return (
        <span className="pxa-vis pxa-vis--devices" data-pack="devices" data-count={(panel.devices ?? []).length}>
          {(panel.devices ?? []).map((d, i) => (
            <img key={`${d}-${i}`} src={DESIGN_DEVICES[d]} alt={`${d.toUpperCase()} FRAME`} data-device={d} loading="lazy" />
          ))}
        </span>
      );
    case 'type':
      return (
        <span className="pxa-vis pxa-vis--type">
          <b>{panel.items?.[0]}</b>
          <small>{panel.items?.[1]}</small>
        </span>
      );
    case 'graph':
      return (
        <svg className="pxa-vis pxa-vis--graph" viewBox="0 0 120 60" aria-hidden>
          <path d="M10 44 L38 18 L64 36 L92 12 L112 30 M38 18 L52 52 L64 36" />
          {[ [10, 44], [38, 18], [64, 36], [92, 12], [112, 30], [52, 52] ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="3.4" />
          ))}
        </svg>
      );
    case 'globe':
      return (
        <span className="pxa-vis pxa-vis--globe">
          <i aria-hidden />
          <ul>{(panel.items ?? []).map((t) => <li key={t}>{t}</li>)}</ul>
        </span>
      );
    case 'list':
      return (
        <ul className="pxa-vis pxa-vis--list">
          {(panel.items ?? []).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

function Panel({ panel, side }: { panel: ChamberPanel; side: 'left' | 'right' }) {
  return (
    <article className={`pxa-panel pxa-panel--${side}`} data-panel={panel.n} data-testid={`design-panel-${panel.n}`}>
      <header>
        <em>{panel.n}</em>
        <b>{panel.title}</b>
        <small>{panel.sub}</small>
        <i className="pxa-panel__more" aria-hidden>
          ···
        </i>
      </header>
      <div className={`pxa-panel__body${panel.rows?.length ? ' has-rows' : ''}`}>
        <span
          className="pxa-panel__viswrap"
          style={panel.art && panel.vis !== 'plates' ? { backgroundImage: `url(${panel.art})` } : undefined}
        >
          <PanelVis panel={panel} />
        </span>
        {panel.rows?.length ?
          <ul className="pxa-panel__rows">
            {panel.rows.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        : null}
      </div>
    </article>
  );
}

/** Route options map onto the live client app's own sections. */
const VIEWPORT_ROUTES: Record<string, string> = { 'HOME / FEED': '', PROJECTS: 'projects', PRODUCTION: 'project/build' };
const IS_DEV = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);

function useBoxSize<T extends HTMLElement>(): [React.RefObject<T>, { w: number; h: number }] {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setBox({ w: r.width, h: r.height });
    };
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box];
}

function ViewportChamber({ cfg }: { cfg: DesignChamberConfig }) {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const [preset, setPreset] = useState<ViewportPreset>('MOBILE XL');
  const [route, setRoute] = useState('HOME / FEED');
  const [orientation, setOrientation] = useState<ViewportOrientation>('PORTRAIT');
  const [zoom, setZoom] = useState<ViewportZoom>('FIT');
  const [safe, setSafe] = useState(false);
  const [stageRef, box] = useBoxSize<HTMLDivElement>();
  const target = resolveViewportTarget(preset, orientation);
  // The desktop canvas carries a browser bar above the client surface; fit the whole device into the stage.
  const chromeH = target.kind === 'desktop' ? (box.w && box.w < 520 ? 18 : 30) : 0;
  const scale = viewportScale(target, { w: box.w, h: Math.max(0, box.h - chromeH) }, zoom);
  const section = VIEWPORT_ROUTES[route] ?? '';
  const base = IS_DEV ? '/app/preview/fixture-app-ndxbook' : `/app/projects/${projectSlug}`;
  const src = section ? `${base}/${section}` : base;
  const select = (label: string, value: string, set: (v: string) => void, options: readonly string[], cls: string, disabled = false) => (
    <label className={`pxa-field pxa-field--${cls}`}>
      <small>{label}:</small>
      <select value={value} onChange={(e) => set(e.target.value)} disabled={disabled} data-testid={`design-viewport-${cls}`}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="pxa-chamber pxa-chamber--viewport" data-testid="design-chamber" data-mode="viewport" data-target-kind={target.kind}>
      <ChamberBackdrop environment="corridor" />
      <div className={`pxa-vstage pxa-vstage--${target.kind}`} ref={stageRef} data-zoom={zoom} data-testid="design-viewport-stage">
        <div
          className={`pxa-device pxa-device--${target.kind}`}
          data-orientation={target.orientation.toLowerCase()}
          data-preset={preset}
          data-target-w={target.w}
          data-target-h={target.h}
          style={{ width: Math.round(target.w * scale), height: Math.round(target.h * scale) + chromeH }}
          data-testid="design-viewport-device"
        >
          {target.kind === 'desktop' ?
            <span className="pxa-device__bar" aria-hidden>
              <i />
              <i />
              <i />
              <b>{src.replace(/^\/app\/(preview\/[^/]+|projects\/[^/]+)/, 'site00.app')}</b>
              <em>
                {target.w} × {target.h}
              </em>
            </span>
          : null}
          <span className="pxa-device__screen" style={{ width: Math.round(target.w * scale), height: Math.round(target.h * scale) }}>
            <span className="pxa-device__scaler" style={{ width: target.w, height: target.h, transform: `scale(${scale})` }}>
              <iframe title="LIVE CLIENT APP" src={src} className="pxa-device__frame" data-testid="design-viewport-frame" />
            </span>
            {safe ? <i className="pxa-device__safe" aria-hidden data-testid="design-viewport-safe" /> : null}
          </span>
        </div>
      </div>
      <div className="pxa-vpanel" data-testid="design-viewport-controls">
        <div className="pxa-vpanel__fields">
          {select('VIEWPORT PRESET', preset, (v) => isViewportPreset(v) && setPreset(v), VIEWPORT_PRESET_ORDER, 'preset')}
          {select('ROUTE', route, setRoute, Object.keys(VIEWPORT_ROUTES), 'route')}
          <button type="button" className={`pxa-pill pxa-pill--safe${safe ? ' is-on' : ''}`} aria-pressed={safe} onClick={() => setSafe((v) => !v)} data-testid="design-viewport-safe-toggle">
            SAFE AREA
          </button>
          {select('ORIENTATION', target.orientation, (v) => setOrientation(v as ViewportOrientation), ['PORTRAIT', 'LANDSCAPE'], 'orientation', target.orientationLocked)}
          {select('ZOOM', zoom, (v) => setZoom(v as ViewportZoom), VIEWPORT_ZOOMS, 'zoom')}
        </div>
        <Link to="/production/ndxbook/design/workspace" className="pxa-btn pxa-btn--wide" data-testid="design-validation-sheet">
          <i className="pxa-vpanel__doc" aria-hidden />
          <span>VALIDATION SHEET / REVIEW STATUS</span>
          <small className="pxa-vpanel__target" data-testid="design-viewport-target">
            {target.preset} · {target.w} × {target.h} · {target.orientation} · {zoom === 'FIT' ? `FIT ${Math.round(scale * 100)}%` : zoom}
          </small>
          <span aria-hidden>›</span>
        </Link>
      </div>
      <footer className="pxa-chamber__edge">
        <span>{cfg.edgeLeft}</span>
        <span>SCROLL TO EXPLORE ⌄</span>
        <span>{cfg.edgeRight}</span>
      </footer>
    </div>
  );
}

function ChamberBackdrop({ environment = 'atrium' }: { environment?: 'atrium' | 'corridor' }) {
  return (
    <>
      <span className="pxa-chamber__atrium" aria-hidden>
        <img
          className="pxa-chamber__atrium-art"
          alt=""
          src={environment === 'corridor' ? AUTHORITY_ASSETS.viewportCorridor : AUTHORITY_ASSETS.designAtrium}
        />
        <i className="pxa-chamber__ring pxa-chamber__ring--1" />
        <i className="pxa-chamber__ring pxa-chamber__ring--2" />
        <i className="pxa-chamber__ring pxa-chamber__ring--3" />
        <i className="pxa-chamber__floor" />
      </span>
      {environment === 'atrium' ?
        <span className="pxa-chamber__bg" aria-hidden>
          <img className="pxa-core" alt="" src={AUTHORITY_ASSETS.designCore} />
        </span>
      : null}
      <span className="pxa-chamber__wash" aria-hidden />
    </>
  );
}

/** DESIGN workspace body: chamber (floating panels) + pipeline + on-your-table. One component, six modes. */
export function DesignChamber({ mode }: { mode: ProductionDesignMode }) {
  const cfg = DESIGN_CHAMBER[mode];
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const left = cfg.panels.slice(0, 2);
  const right = cfg.panels.slice(2);
  const workspace = `/production/${projectSlug}/design/workspace`;
  return (
    <div className="pxa-design" data-testid="design-chamber-screen" data-mode={mode}>
      {mode === 'viewport' ?
        <ViewportChamber cfg={cfg} />
      : (
        <div className="pxa-chamber" data-testid="design-chamber" data-mode={mode}>
          <ChamberBackdrop />
          <div className="pxa-chamber__stage">
            <div className="pxa-chamber__col pxa-chamber__col--left">
              {left.map((p) => (
                <Panel key={p.n} panel={p} side="left" />
              ))}
            </div>
            <section className="pxa-overview-panel" data-testid="design-overview">
              <header>
                <b>
                  <em>{cfg.label}</em> / {cfg.overviewTitle.split('/ ')[1] ?? 'WORKSPACE OVERVIEW'}
                </b>
                <span aria-hidden>···</span>
              </header>
              <div className="pxa-overview-panel__body">
                <span className="pxa-overview-panel__art">
                  <span className="pxa-overview-panel__mark" aria-hidden>
                    <img src={AUTHORITY_ASSETS.designCore} alt="" />
                  </span>
                  <p>{cfg.lede}</p>
                </span>
                <div className="pxa-overview-panel__side">
                  {cfg.intro?.length ?
                    <span className="pxa-overview-panel__intro">
                      {cfg.intro.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </span>
                  : null}
                  {cfg.list.length && cfg.mode !== 'brand' ?
                    <ul>
                      {cfg.list.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  : null}
                  {cfg.caption ?
                    <span className="pxa-overview-panel__strip" aria-hidden>
                      {cfg.panels
                        .flatMap((p) => p.plates ?? [])
                        .slice(0, 3)
                        .map((u, i) => (
                          <i key={`${u}-${i}`} style={{ backgroundImage: `url(${u})` }} />
                        ))}
                    </span>
                  : null}
                  {cfg.caption ? <small className="pxa-overview-panel__caption">{cfg.caption}</small> : null}
                </div>
                <i className="pxa-overview-panel__go" aria-hidden>
                  »
                </i>
              </div>
            </section>
            <div className="pxa-chamber__col pxa-chamber__col--right">
              {right.map((p) => (
                <Panel key={p.n} panel={p} side="right" />
              ))}
            </div>
          </div>
          <footer className="pxa-chamber__edge">
            <span>{cfg.edgeLeft}</span>
            <span>SCROLL TO EXPLORE ⌄</span>
            <span>{cfg.edgeRight}</span>
          </footer>
        </div>
      )}
      <Sec title="DESIGN PIPELINE" to={workspace} className="pxa-pipeline" testId="design-pipeline">
        <ol className="pxa-pipeline__steps" data-count={cfg.pipeline.length}>
          {cfg.pipeline.map((s, i) => (
            <li key={s.title} className={mode === 'viewport' && i === 5 ? 'is-active' : undefined}>
              <img className="pxa-stage" src={designStage(i).src} alt="" data-stage={designStage(i).id} loading="lazy" />
              <em>{String(i + 1).padStart(2, '0')}</em>
              <b>{s.title}</b>
              {s.sub ? <small>{s.sub}</small> : null}
            </li>
          ))}
        </ol>
      </Sec>
      <Sec title="ON YOUR TABLE" hint="ITEMS THAT NEED YOUR ATTENTION" to={workspace} className="pxa-table-sec" testId="design-table">
        <div className="pxa-tablecards" data-count={cfg.table.length}>
          {cfg.table.map((t) => (
            <Link key={t.title} to={workspace} className="pxa-tcard" data-testid="design-table-card">
              <span className="pxa-tcard__img" style={{ backgroundImage: `url(${t.plate})` }} aria-hidden />
              <span className="pxa-tcard__copy">
                <b>{t.title}</b>
                <small>{t.sub}</small>
              </span>
              <i className="pxa-tcard__flag" aria-hidden />
              <span className="pxa-tcard__cta">{t.cta} ›</span>
            </Link>
          ))}
        </div>
      </Sec>
    </div>
  );
}
