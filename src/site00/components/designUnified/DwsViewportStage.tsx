import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DwsIcon, type DwsIconName } from './DwsIcons';
import { SLOT_ATRIUM } from './dwsSlots';
import type { DwsAction, DwsState } from './dwsState';
import {
  VP_CHECKS,
  VP_DEVICE_LABEL,
  VP_INTERACTIONS,
  VP_PRESETS,
  VP_ROUTES,
  VP_ZOOMS,
  VP_ZOOM_LABEL,
  clampDim,
  vpOrientation,
  vpPreviewUrl,
  vpRoutePath,
  vpSafeInsets,
  vpScale,
  vpSize,
  vpValidation,
  type VpDevice,
  type VpState,
  type VpZoom,
} from './dwsViewportMode';
import type { DwsFamily } from './dwsProfiles';

/**
 * VIEWPORT — the final DESIGN validation mode. The outer workspace (header, mode row, pipeline, table, nav) is fixed;
 * only this stage changes. Every expression below is a state of ONE chamber (`state.vp.expression`).
 * The client app renders inside an isolated iframe; host QA guides are drawn above it and never touch client CSS.
 */

type Props = { state: DwsState; dispatch: (a: DwsAction) => void; projectSlug: string; family: DwsFamily };
type Dispatch = Props['dispatch'];

const DEV = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);

function useBox<T extends HTMLElement>(): [React.RefObject<T>, { width: number; height: number }] {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      // a hidden chamber body reports 0 — keep the last real measurement so FIT stays stable
      if (r.width > 0 && r.height > 0) setBox((b) => (Math.abs(b.width - r.width) < 1 && Math.abs(b.height - r.height) < 1 ? b : { width: r.width, height: r.height }));
    };
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box];
}

/* ------------------------------------------------------------------ the client frame (+ host QA guides) */

function Frame({ vp, device, url, box, caption, testid }: { vp: VpState; device: VpDevice; url: string; box: { width: number; height: number }; caption?: boolean; testid: string }) {
  const size = vpSize(vp, device);
  const s = vpScale(vp.zoom, size, box);
  const ins = vpSafeInsets(size.width, size.height);
  const { overlays } = vp;
  return (
    <figure className="dws-vp__fig" data-device={device}>
      <div className="dws-vp__device" style={{ width: Math.round(size.width * s), height: Math.round(size.height * s) }} data-testid={`${testid}-device`}>
        <div className="dws-vp__scaler" style={{ width: size.width, height: size.height, transform: `scale(${s})` }}>
          <iframe key={`${testid}-${vp.reloadKey}`} title="CLIENT PREVIEW" className="dws-vp__iframe" src={url} data-testid={testid} loading="eager" />
        </div>
        {overlays.safe ? (
          <>
            <i className="dws-vp__unsafe dws-vp__unsafe--t" style={{ height: ins.top * s }} />
            <i className="dws-vp__unsafe dws-vp__unsafe--b" style={{ height: ins.bottom * s }} />
            <i className="dws-vp__unsafe dws-vp__unsafe--l" style={{ width: ins.left * s, top: ins.top * s, bottom: ins.bottom * s }} />
            <i className="dws-vp__unsafe dws-vp__unsafe--r" style={{ width: ins.right * s, top: ins.top * s, bottom: ins.bottom * s }} />
            <i className="dws-vp__safe" style={{ top: ins.top * s, right: ins.right * s, bottom: ins.bottom * s, left: ins.left * s }} data-testid="dws-vp-ov-safe" />
          </>
        ) : null}
        {overlays.grid ? <i className="dws-vp__gridov" style={{ backgroundSize: `${Math.max(4, 16 * s)}px ${Math.max(4, 16 * s)}px` }} data-testid="dws-vp-ov-grid" /> : null}
        {overlays.bounds ? (
          <i className="dws-vp__bounds" data-testid="dws-vp-ov-bounds">
            <b>
              {size.width} × {size.height}
            </b>
          </i>
        ) : null}
      </div>
      {caption ? (
        <figcaption>
          <b>{VP_DEVICE_LABEL[device]}</b> {size.width} × {size.height}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ side panels */

function Panel({ title, area, children, right, className = '' }: { title: string; area: string; children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <section className={`dws-vp__panel dws-vp__panel--${area} ${className}`.trim()} aria-label={title} data-testid={`dws-vp-panel-${area}`}>
      <header className="dws-vp__ph">
        <h2>{title}</h2>
        {right}
      </header>
      {children}
    </section>
  );
}

function PresetsPanel({ vp, dispatch }: { vp: VpState; dispatch: Dispatch }) {
  const items: { id: VpDevice; label: string; icon: DwsIconName }[] = [...VP_PRESETS.map((p) => ({ id: p.id as VpDevice, label: p.label, icon: p.icon as DwsIconName })), { id: 'custom', label: 'CUSTOM', icon: 'sliders' }];
  return (
    <Panel title="VIEWPORT PRESETS" area="presets">
      <div className="dws-vp__presets" role="radiogroup" aria-label="VIEWPORT PRESETS">
        {items.map((it) => (
          <button key={it.id} type="button" role="radio" aria-checked={vp.device === it.id} className={vp.device === it.id ? 'is-on' : ''} data-device={it.id} data-testid={`dws-vp-preset-${it.id}`} onClick={() => dispatch({ type: 'VP_DEVICE', device: it.id })}>
            <em className="dws-vp__no" aria-hidden="true" />
            <DwsIcon name={it.icon} size={26} />
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function RoutesPanel({ vp, dispatch }: { vp: VpState; dispatch: Dispatch }) {
  return (
    <Panel title="ROUTES" area="routes" right={<DwsIcon name="filter" size={16} />}>
      <ul className="dws-vp__routes" role="listbox" aria-label="ROUTES">
        {VP_ROUTES.map((r) => (
          <li key={r.id}>
            <button type="button" role="option" aria-selected={vp.route === r.id} className={vp.route === r.id ? 'is-on' : ''} data-testid={`dws-vp-route-${r.id}`} onClick={() => dispatch({ type: 'VP_ROUTE', route: r.id })}>
              <DwsIcon name="doc" size={16} />
              <b>/ {r.label}</b>
              <span>{r.section ? `/${r.section.toUpperCase()}` : '/'}</span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function InteractionsPanel({ vp, dispatch }: { vp: VpState; dispatch: Dispatch }) {
  return (
    <Panel title="INTERACTIONS" area="interactions">
      <ul className="dws-vp__inter">
        {VP_INTERACTIONS.map((it) => (
          <li key={it.id}>
            <button type="button" className={vp.expression === 'interaction' && vp.interaction === it.id ? 'is-on' : ''} aria-pressed={vp.expression === 'interaction' && vp.interaction === it.id} data-testid={`dws-vp-inter-${it.id}`} onClick={() => dispatch({ type: 'VP_INTERACTION', interaction: vp.expression === 'interaction' && vp.interaction === it.id ? null : it.id })}>
              <DwsIcon name={it.icon as DwsIconName} size={18} />
              <span>{it.label}</span>
              <DwsIcon name="chevronR" size={14} />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function OverlaysPanel({ vp, dispatch }: { vp: VpState; dispatch: Dispatch }) {
  const items: { key: 'safe' | 'grid' | 'bounds'; label: string; icon: DwsIconName }[] = [
    { key: 'safe', label: 'SAFE AREA', icon: 'lattice' },
    { key: 'grid', label: 'GRID', icon: 'grid' },
    { key: 'bounds', label: 'BOUNDS', icon: 'frame' },
  ];
  return (
    <Panel title="OVERLAYS / SAFE AREA" area="overlays">
      <div className="dws-vp__ovs">
        {items.map((it) => (
          <button key={it.key} type="button" aria-pressed={vp.overlays[it.key]} className={vp.overlays[it.key] ? 'is-on' : ''} data-testid={`dws-vp-overlay-${it.key}`} onClick={() => dispatch({ type: 'VP_OVERLAY', key: it.key })}>
            <DwsIcon name={it.icon} size={30} />
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ chamber states */

function NumField({ label, value, onCommit, id }: { label: string; value: number; onCommit: (n: number) => void; id: string }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => onCommit(clampDim(Number(draft)));
  return (
    <label className="dws-vp__num" htmlFor={id}>
      <span>{label}</span>
      <input id={id} inputMode="numeric" value={draft} data-testid={`dws-vp-${label.toLowerCase()}`} onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} />
    </label>
  );
}

function ZoomSelect({ vp, dispatch, id }: { vp: VpState; dispatch: Dispatch; id: string }) {
  return (
    <select id={id} value={vp.zoom} aria-label="ZOOM" data-testid="dws-vp-zoom" onChange={(e) => dispatch({ type: 'VP_ZOOM', zoom: e.target.value as VpZoom })}>
      {VP_ZOOMS.map((z) => (
        <option key={z} value={z}>
          {VP_ZOOM_LABEL[z]}
        </option>
      ))}
    </select>
  );
}

function ValidationPanel({ vp, dispatch }: { vp: VpState; dispatch: Dispatch }) {
  const v = vpValidation(vp.checks);
  const totalItems = VP_INTERACTIONS.reduce((n, i) => n + i.items.length, 0);
  const inspected = Object.keys(vp.inspect).length;
  const failedItems = Object.values(vp.inspect).filter((m) => m === 'FAIL').length;
  return (
    <div className="dws-vp__valid" data-testid="dws-vp-validation" data-status={v.status}>
      <div className="dws-vp__ring" aria-hidden="true">
        <svg viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="19" />
          <circle cx="22" cy="22" r="19" className="dws-vp__ring-on" strokeDasharray={`${(v.passed / v.total) * 119.4} 119.4`} />
        </svg>
        <b>
          {v.passed}/{v.total}
        </b>
      </div>
      <div className="dws-vp__checks">
        <h3>VIEWPORT VALIDATION</h3>
        <ul>
          {VP_CHECKS.map((c) => {
            const mark = vp.checks[c.id];
            return (
              <li key={c.id} data-mark={mark ?? 'NOT RUN'}>
                <i aria-hidden="true" />
                <span>
                  {c.label}
                  {c.id === 'interactions' ? <small>{inspected} OF {totalItems} ITEMS INSPECTED{failedItems ? ` · ${failedItems} FAILED` : ''}</small> : null}
                </span>
                <em>{mark ?? 'NOT RUN'}</em>
                <button type="button" aria-pressed={mark === 'PASS'} data-testid={`dws-vp-check-${c.id}-pass`} onClick={() => dispatch({ type: 'VP_CHECK', id: c.id, mark: mark === 'PASS' ? null : 'PASS' })}>
                  PASS
                </button>
                <button type="button" aria-pressed={mark === 'FAIL'} data-testid={`dws-vp-check-${c.id}-fail`} onClick={() => dispatch({ type: 'VP_CHECK', id: c.id, mark: mark === 'FAIL' ? null : 'FAIL' })}>
                  FAIL
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="dws-vp__verdict">
        <small>{v.status === 'REVIEW REQUIRED' ? 'REVIEW REQUIRED' : v.status}</small>
        <strong>{vpRoutePath(vp.route)} · {VP_DEVICE_LABEL[vp.device]}</strong>
        <span>{v.status === 'NOT RUN' ? 'NO CHECKS HAVE BEEN RUN YET' : `${v.passed} OF ${v.total} CHECKS PASSED`}</span>
        {v.issues ? <em className="dws-vp__issues">{v.issues} {v.issues === 1 ? 'ISSUE' : 'ISSUES'}</em> : null}
      </div>
    </div>
  );
}

function InspectionPanel({ vp, dispatch }: { vp: VpState; dispatch: Dispatch }) {
  const cat = VP_INTERACTIONS.find((i) => i.id === vp.interaction) ?? VP_INTERACTIONS[0]!;
  return (
    <aside className="dws-vp__inspect" data-testid="dws-vp-inspection" aria-label="INTERACTION INSPECTION">
      <header>
        <small>INTERACTION INSPECTION</small>
        <h3>{cat.label}</h3>
      </header>
      <ul>
        {cat.items.map((label, idx) => {
          const key = `${cat.id}.${idx}`;
          const mark = vp.inspect[key];
          return (
            <li key={key} data-mark={mark ?? 'NOT RUN'}>
              <span>{label}</span>
              <button type="button" aria-pressed={mark === 'PASS'} data-testid={`dws-vp-inspect-${key}-pass`} onClick={() => dispatch({ type: 'VP_INSPECT', key, mark: mark === 'PASS' ? null : 'PASS' })}>
                PASS
              </button>
              <button type="button" aria-pressed={mark === 'FAIL'} data-testid={`dws-vp-inspect-${key}-fail`} onClick={() => dispatch({ type: 'VP_INSPECT', key, mark: mark === 'FAIL' ? null : 'FAIL' })}>
                FAIL
              </button>
            </li>
          );
        })}
      </ul>
      <p>MARKS ARE REVIEWER INPUT. NOTHING IS MARKED AUTOMATICALLY.</p>
    </aside>
  );
}

function ComparePanel({ vp, dispatch, url, box }: { vp: VpState; dispatch: Dispatch; url: string; box: { width: number; height: number } }) {
  const half = { width: Math.max(0, (box.width - 14) / 2), height: Math.max(0, box.height - 54) };
  return (
    <div className="dws-vp__compare" data-testid="dws-vp-compare">
      {([0, 1] as const).map((slot) => {
        const dev = vp.pair[slot];
        return (
          <div key={slot} className="dws-vp__cmp">
            <div className="dws-vp__cmp-pick" role="radiogroup" aria-label={slot === 0 ? 'COMPARE LEFT' : 'COMPARE RIGHT'}>
              {VP_PRESETS.map((p) => (
                <button key={p.id} type="button" role="radio" aria-checked={dev === p.id} className={dev === p.id ? 'is-on' : ''} data-testid={`dws-vp-pair-${slot}-${p.id}`} onClick={() => dispatch({ type: 'VP_PAIR', slot, device: p.id })}>
                  {p.label}
                </button>
              ))}
            </div>
            <Frame vp={{ ...vp, device: dev, orientation: VP_PRESETS.find((p) => p.id === dev)!.natural }} device={dev} url={url} box={half} caption testid={`dws-vp-frame-cmp${slot}`} />
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ the stage */

export function DwsViewportStage({ state, dispatch, projectSlug, family }: Props) {
  const vp = state.vp;
  const [pvRef, box] = useBox<HTMLDivElement>();
  const [bodyRef, bodyBox] = useBox<HTMLDivElement>();
  const url = vpPreviewUrl(projectSlug, vp.route, DEV);
  const size = vpSize(vp);
  const ori = vpOrientation(vp);
  const v = vpValidation(vp.checks);
  const preset = VP_PRESETS.find((p) => p.id === vp.device);
  const deviceName = preset ? preset.device : 'CUSTOM VIEWPORT';
  const ex = vp.expression;
  const mobile = family === 'mobile';
  const route = VP_ROUTES.find((r) => r.id === vp.route) ?? VP_ROUTES[0]!;
  const routeIndex = Math.max(0, VP_ROUTES.findIndex((r) => r.id === route.id));
  const captions: Record<string, string> = {
    preview: 'LIVE CLIENT PREVIEW',
    presets: 'PRESET ACTIVE',
    custom: 'CUSTOM SIZE',
    interaction: 'INTERACTION INSPECTION',
    overlays: 'QA OVERLAYS',
    compare: 'COMPARE',
    validation: 'VALIDATION / REVIEW',
  };
  const showFrame = ex !== 'validation' && ex !== 'compare';
  const active = Object.entries(vp.overlays).filter(([, on]) => on).map(([k]) => (k === 'safe' ? 'SAFE AREA' : k.toUpperCase()));

  return (
    <section className="dws-stage dws-stage--viewport dws-vp" aria-label="VIEWPORT WORKSPACE" data-mode="viewport" data-vp-expression={ex} data-vp-device={vp.device} data-testid="dws-viewport-stage">
      <div className="dws-atrium" data-asset-slot={SLOT_ATRIUM} data-asset-status="placeholder" aria-hidden="true">
        <i className="dws-atrium__ring dws-atrium__ring--1" />
        <i className="dws-atrium__ring dws-atrium__ring--2" />
        <i className="dws-atrium__ring dws-atrium__ring--3" />
      </div>

      <div className="dws-vp__grid">
        <div className="dws-vp__col dws-vp__col--l">
          <PresetsPanel vp={vp} dispatch={dispatch} />
          <RoutesPanel vp={vp} dispatch={dispatch} />
        </div>

        <section className="dws-vp__chamber" aria-label="LIVE CLIENT PREVIEW" data-testid="dws-vp-chamber">
          <header className="dws-vp__chead">
            <div className="dws-vp__cap">
              <b data-testid="dws-vp-device-label">{deviceName}</b>
              <span data-testid="dws-vp-size">
                {size.width} × {size.height}
              </span>
              <em data-testid="dws-vp-caption">{captions[ex]}</em>
            </div>
            <div className="dws-vp__ctl">
              <button type="button" aria-label="ORIENTATION" title="ORIENTATION" data-testid="dws-vp-orientation" data-orientation={ori} onClick={() => dispatch({ type: 'VP_ORIENTATION' })}>
                <DwsIcon name="revision" size={16} />
                <span>{ori === 'portrait' ? 'PORTRAIT' : 'LANDSCAPE'}</span>
              </button>
              <ZoomSelect vp={vp} dispatch={dispatch} id="dws-vp-zoom-chamber" />
              <button type="button" aria-pressed={ex === 'compare'} className={ex === 'compare' ? 'is-on' : ''} data-testid="dws-vp-compare-btn" onClick={() => dispatch({ type: 'VP_EXPRESSION', expression: 'compare' })}>
                <DwsIcon name="compare" size={16} />
                <span>COMPARE</span>
              </button>
              <button type="button" aria-pressed={ex === 'validation'} className={ex === 'validation' ? 'is-on' : ''} data-testid="dws-vp-validate-btn" onClick={() => dispatch({ type: 'VP_EXPRESSION', expression: 'validation' })}>
                <DwsIcon name="check" size={16} />
                <span>VALIDATE</span>
              </button>
              <button type="button" aria-label="REFRESH PREVIEW" title="REFRESH PREVIEW" data-testid="dws-vp-refresh" onClick={() => dispatch({ type: 'VP_REFRESH' })}>
                <DwsIcon name="revision" size={16} />
                <span>REFRESH</span>
              </button>
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label="OPEN IN NEW TAB" title="OPEN IN NEW TAB" data-testid="dws-vp-newtab">
                <DwsIcon name="open" size={16} />
                <span>NEW TAB</span>
              </a>
            </div>
          </header>

          {showFrame ? (
            <>
              <button type="button" className="dws-vp__pager dws-vp__pager--prev" aria-label="PREVIOUS ROUTE" data-testid="dws-vp-prev" onClick={() => dispatch({ type: 'VP_ROUTE', route: VP_ROUTES[(routeIndex + VP_ROUTES.length - 1) % VP_ROUTES.length]!.id })}>
                <DwsIcon name="chevronL" size={18} />
              </button>
              <button type="button" className="dws-vp__pager dws-vp__pager--next" aria-label="NEXT ROUTE" data-testid="dws-vp-next" onClick={() => dispatch({ type: 'VP_ROUTE', route: VP_ROUTES[(routeIndex + 1) % VP_ROUTES.length]!.id })}>
                <DwsIcon name="chevronR" size={18} />
              </button>
            </>
          ) : null}
          <div ref={bodyRef} className="dws-vp__cbody">
            <div ref={pvRef} className="dws-vp__pv" data-hidden={showFrame ? undefined : '1'}>
              <Frame vp={vp} device={vp.device} url={url} box={box} testid="dws-vp-frame" />
            </div>
            {ex === 'compare' ? <ComparePanel vp={vp} dispatch={dispatch} url={url} box={bodyBox} /> : null}
            {ex === 'validation' ? <ValidationPanel vp={vp} dispatch={dispatch} /> : null}
            {ex === 'interaction' ? <InspectionPanel vp={vp} dispatch={dispatch} /> : null}
          </div>

          {vp.device === 'custom' || ex === 'custom' ? (
            <footer className="dws-vp__cfoot" data-testid="dws-vp-custom">
              <NumField label="WIDTH" id="dws-vp-w" value={vp.custom.width} onCommit={(n) => dispatch({ type: 'VP_CUSTOM', width: n })} />
              <NumField label="HEIGHT" id="dws-vp-h" value={vp.custom.height} onCommit={(n) => dispatch({ type: 'VP_CUSTOM', height: n })} />
              <small>{VP_ZOOM_LABEL[vp.zoom]} · {ori === 'portrait' ? 'PORTRAIT' : 'LANDSCAPE'}</small>
            </footer>
          ) : ex === 'overlays' ? (
            <footer className="dws-vp__cfoot">
              <small data-testid="dws-vp-active-overlays">{active.length ? `ACTIVE · ${active.join(' · ')}` : 'NO OVERLAYS ACTIVE'}</small>
            </footer>
          ) : null}
          <div className="dws-vp__dots" aria-hidden="true">
            {VP_ROUTES.map((r) => (
              <i key={r.id} className={r.id === route.id ? 'is-on' : ''} />
            ))}
          </div>
        </section>

        <div className="dws-vp__col dws-vp__col--r">
          <InteractionsPanel vp={vp} dispatch={dispatch} />
          <OverlaysPanel vp={vp} dispatch={dispatch} />
        </div>

        {mobile ? (
          <>
            <div className="dws-vp__strip" data-testid="dws-vp-strip">
              <label>
                <DwsIcon name={(vp.device === 'desktop' ? 'monitor' : vp.device === 'tablet' ? 'tablet' : vp.device === 'mobile' ? 'phone' : 'sliders') as DwsIconName} size={20} />
                <span>
                  <small>VIEWPORT</small>
                  <select value={vp.device} aria-label="VIEWPORT" data-testid="dws-vp-select-device" onChange={(e) => dispatch({ type: 'VP_DEVICE', device: e.target.value as VpDevice })}>
                    {(['mobile', 'tablet', 'desktop', 'custom'] as const).map((d) => (
                      <option key={d} value={d}>
                        {d === 'custom' ? 'CUSTOM' : VP_PRESETS.find((p) => p.id === d)!.device}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
              <label>
                <DwsIcon name="layers" size={20} />
                <span>
                  <small>ROUTE</small>
                  <select value={vp.route} aria-label="ROUTE" data-testid="dws-vp-select-route" onChange={(e) => dispatch({ type: 'VP_ROUTE', route: e.target.value })}>
                    {VP_ROUTES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
              <label>
                <DwsIcon name="revision" size={20} />
                <span>
                  <small>ORIENTATION</small>
                  <select value={ori} aria-label="ORIENTATION" data-testid="dws-vp-select-orientation" onChange={(e) => (e.target.value !== ori ? dispatch({ type: 'VP_ORIENTATION' }) : undefined)}>
                    <option value="portrait">PORTRAIT</option>
                    <option value="landscape">LANDSCAPE</option>
                  </select>
                </span>
              </label>
              <label>
                <DwsIcon name="search" size={20} />
                <span>
                  <small>ZOOM</small>
                  <ZoomSelect vp={vp} dispatch={dispatch} id="dws-vp-zoom-strip" />
                </span>
              </label>
            </div>

            <button type="button" className="dws-vp__vcard" aria-pressed={ex === 'validation'} data-testid="dws-vp-validcard" data-status={v.status} onClick={() => dispatch({ type: 'VP_EXPRESSION', expression: 'validation' })}>
              <span className="dws-vp__vring">
                <b>
                  {v.passed}/{v.total}
                </b>
              </span>
              <span className="dws-vp__vlist">
                <small>VIEWPORT VALIDATION</small>
                {VP_CHECKS.map((c) => (
                  <i key={c.id} data-mark={vp.checks[c.id] ?? 'NOT RUN'}>
                    {c.label}
                  </i>
                ))}
              </span>
              <span className="dws-vp__vstatus">
                <small>{v.status}</small>
                <strong>{vpRoutePath(vp.route)}</strong>
                {v.issues ? <em>{v.issues} {v.issues === 1 ? 'ISSUE' : 'ISSUES'}</em> : null}
              </span>
            </button>

            <nav className="dws-vp__tools" aria-label="VIEWPORT TOOLS">
              {(
                [
                  ['interaction', 'INTERACTIONS'],
                  ['overlays', 'OVERLAYS'],
                  ['compare', 'COMPARE'],
                ] as const
              ).map(([k, label]) => (
                <button key={k} type="button" aria-pressed={ex === k} className={ex === k ? 'is-on' : ''} data-testid={`dws-vp-tool-${k}`} onClick={() => dispatch({ type: 'VP_EXPRESSION', expression: k })}>
                  {label}
                </button>
              ))}
            </nav>
          </>
        ) : null}
      </div>
    </section>
  );
}
