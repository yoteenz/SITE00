import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { HUB_ATMOSPHERE_SLOT_ID } from '../../../../shared/site00-production-hub/index.js';
import {
  isProductionDesignMode,
  PRODUCTION_DESIGN_MODE_ORDER,
  type ProductionDesignMode,
} from '../../config/production-authority-registry';
import { HubImage } from '../productionHub/HubImage';
import { DESIGN_CHAMBER, type ChamberPanel, type DesignChamberConfig } from './designChamberConfig';
import { useProductionAuthorityData } from './ProductionAuthorityData';
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
          {(panel.plates ?? []).map((p) => (
            <i key={p} style={{ backgroundImage: `url(${p})` }} />
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
      </header>
      <PanelVis panel={panel} />
    </article>
  );
}

function ViewportChamber({ cfg }: { cfg: DesignChamberConfig }) {
  const [preset, setPreset] = useState('MOBILE XL');
  const [route, setRoute] = useState('HOME / FEED');
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [zoom, setZoom] = useState('100%');
  const field = (label: string, value: string, set: (v: string) => void, options: string[]) => (
    <label className="pxa-field">
      <small>{label}</small>
      <select value={value} onChange={(e) => set(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="pxa-chamber pxa-chamber--viewport" data-testid="design-chamber" data-mode="viewport">
      <ChamberBackdrop />
      <div className="pxa-device" aria-hidden data-orientation={orientation.toLowerCase()}>
        <span>
          <b>SITE 00</b>
          <small>{preset}</small>
        </span>
      </div>
      <div className="pxa-vpanel" data-testid="design-viewport-controls">
        <div className="pxa-vpanel__fields">
          {field('VIEWPORT PRESET', preset, setPreset, ['MOBILE XL', 'MOBILE', 'TABLET', 'DESKTOP'])}
          {field('ROUTE', route, setRoute, ['HOME / FEED', 'PROJECTS', 'PRODUCTION'])}
          {field('ORIENTATION', orientation, setOrientation, ['PORTRAIT', 'LANDSCAPE'])}
          {field('ZOOM', zoom, setZoom, ['75%', '100%', '125%'])}
        </div>
        <span className="pxa-pill pxa-pill--safe">SAFE AREA</span>
        <Link to="/production/ndxbook/design/workspace" className="pxa-btn pxa-btn--wide" data-testid="design-validation-sheet">
          VALIDATION SHEET / REVIEW STATUS
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

function ChamberBackdrop() {
  const data = useProductionAuthorityData();
  return (
    <>
      <span className="pxa-chamber__bg" aria-hidden>
        <HubImage slotId={HUB_ATMOSPHERE_SLOT_ID} url={data?.assetUrl(HUB_ATMOSPHERE_SLOT_ID) ?? null} label="CHAMBER ATMOSPHERE" />
      </span>
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
                <span className="pxa-overview-panel__mark" aria-hidden>
                  <i />
                </span>
                <p>{cfg.lede}</p>
                <ul>
                  {cfg.list.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
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
