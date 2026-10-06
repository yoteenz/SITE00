import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getIngestedProject } from '../../../projects/registry';
import { projectFamilies } from '../../../projects/families';
import { hasProjectRuntime, isProjectRuntimeMessage, projectRuntimeUrl } from '../../projectRuntime/projectRuntimeRegistry';
import { ProjectFamilyChamber } from './ProjectFamilyChamber';
import {
  isProductionDesignMode,
  PRODUCTION_DESIGN_MODE_ORDER,
  type ProductionDesignMode,
} from '../../config/production-authority-registry';
import { AUTHORITY_ASSETS } from './authorityAssets';
import {
  VIEWPORT_PRESET_ORDER,
  VIEWPORT_ZOOMS,
  applyProjectViewportSize,
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

type RuntimeRect = { x: number; y: number; w: number; h: number; label: string };
/** STAGE overlay geometry read from the runtime: composition mode, functional safe zone, nav footprint, `+` axis. */
type RuntimeStage = { mode: string; vw: number; vh: number; zone: RuntimeRect | null; nav: RuntimeRect | null; axis: number | null };

/**
 * Project-runtime viewport state (P0.JURNL.SITE00-INGEST-F01): which project screen / state / scenario the isolated
 * iframe shows, what the runtime reports back, and the measured BOUNDS of its content blocks.
 */
type RuntimeSelection = { screenId: string; variant: string; scenario: string; nonce: number };

/**
 * Project-runtime viewport state (P0.JURNL.SITE00-F01-LIVE-VIEWPORT-DELIVERY1).
 * `sel` drives the iframe (changes only on an explicit host control / deep link); `shown` is what the controls display
 * and FOLLOWS live navigation inside the runtime, so FAMILY / ROUTE / STATE always describe the screen on stage.
 */
function useProjectRuntimeViewport(projectSlug: string) {
  const [params] = useSearchParams();
  const project = getIngestedProject(projectSlug);
  const runtime = project && hasProjectRuntime(projectSlug) ? project : null;
  const entries = useMemo(() => (runtime ? projectFamilies(projectSlug) : []), [runtime, projectSlug]);
  const boundaries = (runtime?.families ?? []).filter((f) => f.status === 'NOT_STARTED' && f.entryRoute);
  const entryFor = (id: string) => entries.find((e) => e.contract.familyId === id || e.contract.screens.some((s) => s.id === id)) ?? null;
  const firstScreen = (familyId: string) => {
    const c = entries.find((e) => e.contract.familyId === familyId)?.contract;
    return c ? (c.screens.find((s) => s.id === c.parentScreen) ?? c.screens[0])?.id ?? '' : familyId;
  };
  const [sel, setSel] = useState<RuntimeSelection>(() => {
    const fam = params.get('family');
    const screenId = params.get('screen') ?? (fam ? firstScreen(fam) : (entries[0] ? firstScreen(entries[0].contract.familyId) : ''));
    const variant = params.get('state') ? `state:${params.get('state')}` : params.get('overlay') ? `overlay:${params.get('overlay')}` : 'DEFAULT';
    return { screenId, variant, scenario: 'NONE', nonce: 0 };
  });
  const [shown, setShown] = useState<{ screenId: string; variant: string }>(() => ({ screenId: sel.screenId, variant: sel.variant }));
  const [live, setLive] = useState<{ screen: string | null; path: string | null; handoff: string | null; boundary: string | null }>({ screen: null, path: null, handoff: null, boundary: null });

  const familyEntry = entryFor(shown.screenId);
  const family = familyEntry ?? entries[0] ?? null;
  const shownBoundary = boundaries.find((b) => b.familyId === shown.screenId) ?? null;
  const familyId = shownBoundary?.familyId ?? familyEntry?.contract.familyId ?? '';
  const screens = familyEntry?.contract.screens ?? [];
  const screen = familyEntry?.contract.screens.find((s) => s.id === shown.screenId) ?? null;
  const states = familyEntry?.contract.states.filter((s) => s.screenId === shown.screenId) ?? [];
  const overlays = familyEntry?.overlays[shown.screenId] ?? [];
  const families = (runtime?.families ?? []).map((f) => ({
    value: f.familyId,
    label: entries.some((e) => e.contract.familyId === f.familyId) ? `${f.familyId} ${f.familyName}` : `${f.familyId} ${f.familyName} · ${f.status.replace(/_/g, ' ')} (BOUNDARY)`,
  }));

  // iframe source — from the explicit selection only.
  const selEntry = entryFor(sel.screenId);
  const selBoundary = boundaries.find((b) => b.familyId === sel.screenId) ?? null;
  const sc = runtime?.runtime.scenarios.find((x) => x.id === sel.scenario) ?? null;
  const [kind, value] = sel.variant === 'DEFAULT' ? ['', ''] : (sel.variant.split(':') as [string, string]);
  const selRoute = sc?.route ?? selBoundary?.entryRoute ?? selEntry?.contract.screens.find((s) => s.id === sel.screenId)?.runtimeRoute ?? runtime?.runtime.defaultRoute ?? '';
  const src = runtime ? projectRuntimeUrl(projectSlug, selRoute, { ...(kind === 'state' ? { state: value } : {}), ...(kind === 'overlay' ? { overlay: value } : {}), ...(sc?.query ?? {}) }) : null;
  // Direct preview = the SAME runtime route outside the workspace; follows live navigation.
  const directHref = runtime ? (live.path && live.path !== selRoute ? projectRuntimeUrl(projectSlug, live.path) : src) : null;

  const navigate = (screenId: string, variant = 'DEFAULT', scenario = 'NONE') => {
    setSel((p) => ({ screenId, variant, scenario, nonce: p.nonce + 1 }));
    setShown({ screenId, variant });
  };
  const selectFamily = (id: string) => navigate(firstScreen(id));
  const setVariant = (variant: string) => navigate(shown.screenId, variant, sel.scenario);
  const setScenario = (scenario: string) => navigate(shown.screenId, 'DEFAULT', scenario);
  /** Runtime → host: the controls follow what the founder clicked to, without reloading the runtime. */
  const boundariesRef = useRef(boundaries);
  boundariesRef.current = boundaries;
  const followLive = useCallback((screenId: string | null, path: string) => {
    const target = screenId ?? boundariesRef.current.find((b) => b.entryRoute === path)?.familyId ?? null;
    if (target) setShown((cur) => (cur.screenId === target ? cur : { screenId: target, variant: 'DEFAULT' }));
  }, []);

  return {
    runtime,
    family,
    familyId,
    families,
    screens,
    boundaries,
    screenId: shown.screenId,
    variant: shown.variant,
    scenario: sel.scenario,
    nonce: sel.nonce,
    navigate,
    selectFamily,
    setVariant,
    setScenario,
    followLive,
    states,
    overlays,
    src,
    directHref,
    screen,
    live,
    setLive,
  };
}

function ViewportChamber({ cfg }: { cfg: DesignChamberConfig }) {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const [params] = useSearchParams();
  const pr = useProjectRuntimeViewport(projectSlug);
  const projectViewport = pr.runtime?.viewport ?? null;
  const presetParam = params.get('preset') ?? '';
  const [preset, setPreset] = useState<ViewportPreset>(() =>
    isViewportPreset(presetParam) ? presetParam : (projectViewport?.defaultPreset ?? 'MOBILE XL'),
  );
  const [route, setRoute] = useState('HOME / FEED');
  const [orientation, setOrientation] = useState<ViewportOrientation>('PORTRAIT');
  const [zoom, setZoom] = useState<ViewportZoom>('FIT');
  const [safe, setSafe] = useState(false);
  const [grid, setGrid] = useState(false);
  const [bounds, setBounds] = useState(false);
  const [stage, setStage] = useState(false);
  const [stageGeo, setStageGeo] = useState<RuntimeStage | null>(null);
  const [reference, setReference] = useState(false);
  const [rects, setRects] = useState<RuntimeRect[]>([]);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [stageRef, box] = useBoxSize<HTMLDivElement>();
  const target = applyProjectViewportSize(resolveViewportTarget(preset, orientation), projectViewport?.presets[preset]);
  // The desktop canvas carries a browser bar above the client surface; fit the whole device into the stage.
  const chromeH = target.kind === 'desktop' ? (box.w && box.w < 520 ? 18 : 30) : 0;
  const stateKey = pr.variant.startsWith('state:') ? pr.variant.slice('state:'.length) : '';
  const stateAuthority = stateKey ? pr.states.find((s) => s.id.slice(s.screenId.length + 1).toLowerCase() === stateKey)?.authorityFile : null;
  const authorityFile = stateAuthority || pr.screen?.authorityFile || null;
  const refShown = !!(pr.runtime && reference && authorityFile);
  const fitBox = { w: refShown ? box.w * 0.48 : box.w, h: Math.max(0, box.h - chromeH) };
  const scale = viewportScale(target, fitBox, zoom);
  const section = VIEWPORT_ROUTES[route] ?? '';
  const base = IS_DEV ? '/app/preview/fixture-app-ndxbook' : `/app/projects/${projectSlug}`;
  const clientSrc = section ? `${base}/${section}` : base;
  const src = pr.src ?? clientSrc;
  const insets = projectViewport?.safeInsets[target.kind] ?? null;
  const layout = projectViewport?.grid[target.kind] ?? null;

  // Runtime → host messages (same-origin iframe): live screen, handoff boundaries, family boundary.
  const { setLive, followLive } = pr;
  useEffect(() => {
    if (!pr.runtime) return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow || !isProjectRuntimeMessage(e.data)) return;
      const m = e.data;
      if (m.type === 'route') {
        setLive((l) => ({ ...l, screen: m.screenId ?? m.path, path: m.path, boundary: null }));
        followLive(m.screenId, m.path);
      }
      if (m.type === 'handoff') setLive((l) => ({ ...l, handoff: `${m.boundary.replace(/_/g, ' ')}: ${m.target.replace(/_/g, ' ')}` }));
      if (m.type === 'family-boundary') setLive((l) => ({ ...l, boundary: `${m.from} → ${m.to}` }));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [pr.runtime, setLive, followLive]);

  // BOUNDS: measure the runtime's marked content blocks inside the isolated document.
  useEffect(() => {
    if (!bounds || !pr.runtime) return;
    const read = () => {
      const doc = frameRef.current?.contentDocument;
      if (!doc) return;
      const els = [...doc.querySelectorAll<HTMLElement>('[data-runtime-bounds]')];
      setRects(els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height, label: (el.getAttribute('data-runtime-bounds') ?? '').toUpperCase() };
      }));
    };
    read();
    const id = window.setInterval(read, 600);
    return () => window.clearInterval(id);
  }, [bounds, pr.runtime, src]);

  // STAGE (design / QA only, never product UI): the runtime's composition mode, CENTER_STAGE safe zone, nav footprint,
  // `+` axis and the perimeter zones where background salience belongs. Runtime marks: [data-runtime-stage].
  useEffect(() => {
    if (!stage || !pr.runtime) return;
    const read = () => {
      const doc = frameRef.current?.contentDocument;
      const win = frameRef.current?.contentWindow;
      if (!doc || !win) return;
      const rect = (sel: string, label: string): RuntimeRect | null => {
        const el = doc.querySelector<HTMLElement>(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height, label };
      };
      const plus = doc.querySelector<HTMLElement>('[data-runtime-stage="NAV FOOTPRINT"] [data-jrn-trigger="nav-add"]')?.getBoundingClientRect();
      const zone = rect('[data-runtime-stage="SAFE ZONE"]', 'CENTER SAFE ZONE');
      // the safe zone ends above the nav reserve (the reserve is clearance, not functional field)
      const reserve = doc.querySelector<HTMLElement>('[data-runtime-stage="SAFE ZONE"] .jrn-frame__navspace')?.getBoundingClientRect().height ?? 0;
      if (zone) zone.h = Math.max(0, zone.h - reserve);
      setStageGeo({
        mode: doc.querySelector<HTMLElement>('[data-jrn-composition]')?.dataset.jrnComposition ?? 'UNDECLARED',
        vw: win.innerWidth,
        vh: win.innerHeight,
        zone,
        nav: rect('[data-runtime-stage="NAV FOOTPRINT"]', 'NAV FOOTPRINT'),
        axis: plus ? plus.left + plus.width / 2 : null,
      });
    };
    read();
    const id = window.setInterval(read, 600);
    return () => window.clearInterval(id);
  }, [stage, pr.runtime, src]);

  const select = (label: string, value: string, set: (v: string) => void, options: readonly (string | { value: string; label: string })[], cls: string, disabled = false) => (
    <label className={`pxa-field pxa-field--${cls}`}>
      <small>{label}:</small>
      <select value={value} onChange={(e) => set(e.target.value)} disabled={disabled} data-testid={`design-viewport-${cls}`}>
        {options.map((o) =>
          typeof o === 'string' ?
            <option key={o}>{o}</option>
          : <option key={o.value} value={o.value}>
              {o.label}
            </option>,
        )}
      </select>
    </label>
  );
  const toggle = (label: string, on: boolean, set: (v: boolean) => void, id: string) => (
    <button type="button" className={`pxa-pill pxa-pill--safe${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => set(!on)} data-testid={`design-viewport-${id}-toggle`}>
      {label}
    </button>
  );
  const screenW = Math.round(target.w * scale);
  const screenH = Math.round(target.h * scale);
  const device = (
    <div
      className={`pxa-device pxa-device--${target.kind}`}
      data-orientation={target.orientation.toLowerCase()}
      data-preset={preset}
      data-target-w={target.w}
      data-target-h={target.h}
      style={{ width: screenW, height: screenH + chromeH }}
      data-testid="design-viewport-device"
    >
      {target.kind === 'desktop' ?
        <span className="pxa-device__bar" aria-hidden>
          <i />
          <i />
          <i />
          <b>{src.replace(/^\/app\/(preview\/[^/]+|projects\/[^/]+)/, 'site00.app').replace(/^\/production\/[^/]+\/runtime/, `${projectSlug}.app`)}</b>
          <em>
            {target.w} × {target.h}
          </em>
        </span>
      : null}
      <span className="pxa-device__screen" style={{ width: screenW, height: screenH }}>
        <span className="pxa-device__scaler" style={{ width: target.w, height: target.h, transform: `scale(${scale})` }}>
          <iframe
            key={pr.runtime ? `${src}#${pr.nonce}` : undefined}
            ref={frameRef}
            title={pr.runtime ? `${pr.runtime.displayName} PROJECT RUNTIME` : 'LIVE CLIENT APP'}
            src={src}
            className="pxa-device__frame"
            data-testid="design-viewport-frame"
            data-project-runtime={pr.runtime ? pr.runtime.slug : undefined}
          />
        </span>
        {safe && insets ?
          <>
            <i className="pxa-device__safe-band" style={{ top: 0, height: insets.top * scale }} aria-hidden />
            <i className="pxa-device__safe-band" style={{ bottom: 0, height: insets.bottom * scale }} aria-hidden />
            <i
              className="pxa-device__safe pxa-device__safe--exact"
              style={{ top: insets.top * scale, bottom: insets.bottom * scale, left: insets.left * scale, right: insets.right * scale }}
              aria-hidden
              data-testid="design-viewport-safe"
            />
          </>
        : safe ?
          <i className="pxa-device__safe" aria-hidden data-testid="design-viewport-safe" />
        : null}
        {grid && layout ?
          <span
            className="pxa-device__grid"
            aria-hidden
            data-testid="design-viewport-grid"
            data-columns={layout.columns}
            style={{ paddingLeft: layout.margin * scale, paddingRight: layout.margin * scale, columnGap: layout.gutter * scale, gridTemplateColumns: `repeat(${layout.columns}, 1fr)` }}
          >
            {Array.from({ length: layout.columns }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        : null}
        {stage && pr.runtime && stageGeo ?
          <span className="pxa-device__stage" aria-hidden data-testid="design-viewport-stage-overlay" data-mode={stageGeo.mode}>
            <b className="pxa-device__stage-mode">{stageGeo.mode.replace('_', ' ')}</b>
            {stageGeo.zone && stageGeo.mode === 'CENTER_STAGE' ?
              <>
                {/* perimeter zones: where background salience belongs */}
                <i className="pxa-device__stage-perimeter" data-label="PERIMETER" style={{ left: 0, top: 0, width: stageGeo.vw * scale, height: stageGeo.zone.y * scale }} />
                <i className="pxa-device__stage-perimeter" style={{ left: 0, top: stageGeo.zone.y * scale, width: stageGeo.zone.x * scale, height: stageGeo.zone.h * scale }} />
                <i className="pxa-device__stage-perimeter" style={{ left: (stageGeo.zone.x + stageGeo.zone.w) * scale, top: stageGeo.zone.y * scale, width: (stageGeo.vw - stageGeo.zone.x - stageGeo.zone.w) * scale, height: stageGeo.zone.h * scale }} />
                <i className="pxa-device__stage-perimeter" style={{ left: 0, top: (stageGeo.zone.y + stageGeo.zone.h) * scale, width: stageGeo.vw * scale, height: (stageGeo.vh - stageGeo.zone.y - stageGeo.zone.h) * scale }} />
                <i className="pxa-device__stage-zone" data-label="CENTER SAFE ZONE" style={{ left: stageGeo.zone.x * scale, top: stageGeo.zone.y * scale, width: stageGeo.zone.w * scale, height: stageGeo.zone.h * scale }} />
              </>
            : null}
            {stageGeo.nav ? <i className="pxa-device__stage-nav" data-label="NAV FOOTPRINT" style={{ left: stageGeo.nav.x * scale, top: stageGeo.nav.y * scale, width: stageGeo.nav.w * scale, height: stageGeo.nav.h * scale }} /> : null}
            {stageGeo.axis != null ? <i className="pxa-device__stage-axis" style={{ left: stageGeo.axis * scale }} /> : null}
          </span>
        : null}
        {bounds && pr.runtime ?
          <span className="pxa-device__bounds" aria-hidden data-testid="design-viewport-bounds" data-count={rects.length}>
            {rects.map((r, i) => (
              <i key={`${r.label}-${i}`} data-label={r.label} style={{ left: r.x * scale, top: r.y * scale, width: r.w * scale, height: r.h * scale }} />
            ))}
          </span>
        : null}
      </span>
    </div>
  );
  const refHeight = screenH;
  return (
    <div className="pxa-chamber pxa-chamber--viewport" data-testid="design-chamber" data-mode="viewport" data-target-kind={target.kind} data-project-runtime={pr.runtime?.slug}>
      <ChamberBackdrop environment="corridor" />
      <div className={`pxa-vstage pxa-vstage--${target.kind}`} ref={stageRef} data-zoom={zoom} data-testid="design-viewport-stage">
        {refShown ?
          <span style={{ display: 'flex', gap: 18, alignItems: 'flex-end' }}>
            {device}
            <span className="pxa-vref" data-testid="design-viewport-reference">
              <img src={authorityFile!.replace(/^public/, '')} alt={`${pr.screen!.id} AUTHORITY`} style={{ height: refHeight, width: Math.round(refHeight * 0.5621) }} />
              <small>AUTHORITY · {pr.screen!.id}</small>
            </span>
          </span>
        : device}
      </div>
      <div className="pxa-vpanel" data-testid="design-viewport-controls">
        <div className="pxa-vpanel__fields">
          {select('VIEWPORT PRESET', preset, (v) => isViewportPreset(v) && setPreset(v), VIEWPORT_PRESET_ORDER, 'preset')}
          {pr.runtime ? select('FAMILY', pr.familyId, pr.selectFamily, pr.families, 'family') : null}
          {pr.runtime ?
            select(
              'ROUTE',
              pr.screenId,
              (v) => pr.navigate(v),
              [...pr.screens.map((s) => ({ value: s.id, label: `${s.id} ${s.name}` })), ...pr.boundaries.map((b) => ({ value: b.familyId, label: `${b.familyId} ${b.familyName} BOUNDARY` }))],
              'route',
            )
          : select('ROUTE', route, setRoute, Object.keys(VIEWPORT_ROUTES), 'route')}
          {pr.runtime ?
            select(
              'STATE',
              pr.variant,
              pr.setVariant,
              [{ value: 'DEFAULT', label: 'DEFAULT' }, ...pr.states.map((s) => ({ value: `state:${s.id.slice(s.screenId.length + 1).toLowerCase()}`, label: s.label })), ...pr.overlays.map((o) => ({ value: `overlay:${o}`, label: `OPEN: ${o.replace(/-/g, ' ').toUpperCase()}` }))],
              'state',
            )
          : null}
          {pr.runtime ?
            select('SCENARIO', pr.scenario, pr.setScenario, [{ value: 'NONE', label: 'NONE' }, ...pr.runtime.runtime.scenarios.map((x) => ({ value: x.id, label: x.label }))], 'scenario')
          : null}
          <button type="button" className={`pxa-pill pxa-pill--safe${safe ? ' is-on' : ''}`} aria-pressed={safe} onClick={() => setSafe((v) => !v)} data-testid="design-viewport-safe-toggle">
            SAFE AREA
          </button>
          {pr.runtime ?
            <>
              {toggle('GRID', grid, setGrid, 'grid')}
              {toggle('BOUNDS', bounds, setBounds, 'bounds')}
              {toggle('STAGE', stage, setStage, 'stage')}
              {toggle('REFERENCE', reference, setReference, 'reference')}
            </>
          : null}
          {select('ORIENTATION', target.orientation, (v) => setOrientation(v as ViewportOrientation), ['PORTRAIT', 'LANDSCAPE'], 'orientation', target.orientationLocked)}
          {select('ZOOM', zoom, (v) => setZoom(v as ViewportZoom), VIEWPORT_ZOOMS, 'zoom')}
        </div>
        {pr.runtime ?
          <p className="pxa-vruntime" data-testid="design-viewport-runtime">
            <span>
              PROJECT <b>{pr.runtime.displayName}</b> · {pr.runtime.projectType} / {pr.runtime.ownership}
            </span>
            <span data-live="screen">
              LIVE <b>{pr.live.boundary ?? pr.live.screen ?? '—'}</b>
            </span>
            <span data-live="handoff">
              LAST HANDOFF <b>{pr.live.handoff ?? 'NONE'}</b>
            </span>
            <span>AUTH {pr.runtime.runtime.authAdapter.replace(/_/g, ' ')}</span>
            {pr.runtime.runtime.previewNote ? <span>{pr.runtime.runtime.previewNote}</span> : null}
          </p>
        : null}
        {pr.runtime && pr.directHref ?
          <a className="pxa-btn pxa-btn--wide pxa-vpanel__direct" href={pr.directHref} target="_blank" rel="noopener noreferrer" data-testid="design-viewport-direct-preview">
            <span>OPEN DIRECT PREVIEW</span>
            <small className="pxa-vpanel__target">SAME {pr.runtime.displayName} RUNTIME · NO WORKSPACE CHROME</small>
            <span aria-hidden>↗</span>
          </a>
        : null}
        <Link
          to={pr.runtime ? `/production/${projectSlug}/design?mode=compiler&inspect=gate` : `/production/${projectSlug}/design/workspace`}
          className="pxa-btn pxa-btn--wide"
          data-testid="design-validation-sheet"
        >
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
  // Ingested projects (P0.JURNL.SITE00-INGEST-F01) get their OWN data in the host chamber — never NDXBOOK plates.
  const ingested = useMemo(() => getIngestedProject(projectSlug), [projectSlug]);
  const families = useMemo(() => (ingested ? projectFamilies(ingested.slug) : []), [ingested]);
  if (ingested && mode !== 'viewport') return <ProjectFamilyChamber key={ingested.slug} mode={mode} project={ingested} families={families} />;
  const left = cfg.panels.slice(0, 2);
  const right = cfg.panels.slice(2);
  const workspace = `/production/${projectSlug}/design/workspace`;
  return (
    <div className="pxa-design" data-testid="design-chamber-screen" data-mode={mode} data-runtime-viewport={mode === 'viewport' && hasProjectRuntime(projectSlug) ? 'true' : undefined}>
      {mode === 'viewport' ?
        <ViewportChamber key={projectSlug} cfg={cfg} />
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
