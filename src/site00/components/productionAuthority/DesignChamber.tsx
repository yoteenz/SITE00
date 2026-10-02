import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  isProductionDesignMode,
  PRODUCTION_DESIGN_MODE_ORDER,
  type ProductionDesignMode,
} from '../../config/production-authority-registry';
import { AUTHORITY_ASSETS } from './authorityAssets';
import { DESIGN_CHAMBER, type ChamberPanel, type DesignChamberConfig } from './designChamberConfig';
import { Orb, Sec } from './primitives';

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
        <span className="pxa-vis pxa-vis--swatches">
          {['#121214', '#e5231b', '#f5f5f7', '#9a9aa2', '#d8d8dc', '#3c3c42'].map((c) => (
            <i key={c} style={{ background: c }} />
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
    case 'phones':
      return (
        <span className="pxa-vis pxa-vis--phones">
          <i />
          <i />
          <i />
        </span>
      );
    case 'frames':
      return (
        <span className="pxa-vis pxa-vis--frames">
          <i />
          <i />
          <i />
        </span>
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
      return (
        <span className="pxa-vis pxa-vis--grid">
          {(panel.items ?? []).map((t) => (
            <i key={t}>{t}</i>
          ))}
        </span>
      );
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

/** Logical device sizes for the viewport presets (natural orientation). */
const VIEWPORT_PRESETS: Record<string, [number, number]> = {
  'MOBILE XL': [430, 932],
  MOBILE: [390, 844],
  TABLET: [834, 1194],
  DESKTOP: [1440, 900],
};
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
  const [preset, setPreset] = useState('MOBILE XL');
  const [route, setRoute] = useState('HOME / FEED');
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [zoom, setZoom] = useState('100%');
  const [safe, setSafe] = useState(false);
  const [stageRef, box] = useBoxSize<HTMLDivElement>();
  const [pw, ph] = VIEWPORT_PRESETS[preset] ?? [430, 932];
  const [w, h] = orientation === 'LANDSCAPE' ? [Math.max(pw, ph), Math.min(pw, ph)] : [Math.min(pw, ph), Math.max(pw, ph)];
  const fit = box.w && box.h ? Math.min(box.w / w, box.h / h) : 0.3;
  const scale = fit * (parseInt(zoom, 10) / 100 || 1);
  const section = VIEWPORT_ROUTES[route] ?? '';
  const base = IS_DEV ? '/app/preview/fixture-app-ndxbook' : `/app/projects/${projectSlug}`;
  const src = section ? `${base}/${section}` : base;
  const field = (label: string, value: string, set: (v: string) => void, options: string[], cls: string) => (
    <label className={`pxa-field pxa-field--${cls}`}>
      <small>{label}:</small>
      <select value={value} onChange={(e) => set(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="pxa-chamber pxa-chamber--viewport" data-testid="design-chamber" data-mode="viewport">
      <ChamberBackdrop environment="corridor" />
      <div className="pxa-vstage" ref={stageRef}>
        <div className="pxa-device" data-orientation={orientation.toLowerCase()} data-preset={preset} style={{ width: Math.round(w * scale), height: Math.round(h * scale) }} data-testid="design-viewport-device">
          <span className="pxa-device__scaler" style={{ width: w, height: h, transform: `scale(${scale})` }}>
            <iframe title="LIVE CLIENT APP" src={src} className="pxa-device__frame" data-testid="design-viewport-frame" />
          </span>
          {safe ? <i className="pxa-device__safe" aria-hidden data-testid="design-viewport-safe" /> : null}
        </div>
      </div>
      <div className="pxa-vpanel" data-testid="design-viewport-controls">
        <div className="pxa-vpanel__fields">
          {field('VIEWPORT PRESET', preset, setPreset, Object.keys(VIEWPORT_PRESETS), 'preset')}
          {field('ROUTE', route, setRoute, Object.keys(VIEWPORT_ROUTES), 'route')}
          <button type="button" className={`pxa-pill pxa-pill--safe${safe ? ' is-on' : ''}`} aria-pressed={safe} onClick={() => setSafe((v) => !v)} data-testid="design-viewport-safe-toggle">
            SAFE AREA
          </button>
          {field('ORIENTATION', orientation, setOrientation, ['PORTRAIT', 'LANDSCAPE'], 'orientation')}
          {field('ZOOM', zoom, setZoom, ['75%', '100%', '125%'], 'zoom')}
        </div>
        <Link to="/production/ndxbook/design/workspace" className="pxa-btn pxa-btn--wide" data-testid="design-validation-sheet">
          <i className="pxa-vpanel__doc" aria-hidden />
          <span>VALIDATION SHEET / REVIEW STATUS</span>
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
              <Orb variant={i} />
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
