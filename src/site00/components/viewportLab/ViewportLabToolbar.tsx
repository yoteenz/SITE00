import type { ViewportLabPreset, ViewportLabPresetId } from '../../../../shared/site00-viewport-lab/presets.js';
import { VIEWPORT_LAB_PRESETS } from '../../../../shared/site00-viewport-lab/presets.js';
import type { ViewportLabRouteOption } from '../../../../shared/site00-viewport-lab/previewTargets.js';
import {
  VIEWPORT_LAB_COMMON_ROUTE_SUFFIXES,
  viewportLabRegisteredProjectSlugs,
} from '../../../../shared/site00-viewport-lab/previewTargets.js';
import type { ViewportLabOrientation, ViewportLabZoomMode } from '../../../../shared/site00-viewport-lab/viewportLabLogic.js';
import { effectiveViewportSize } from '../../../../shared/site00-viewport-lab/viewportLabLogic.js';

export type ViewportLabToolbarProps = {
  projectSlug: string;
  onProjectChange: (slug: string) => void;
  presetId: ViewportLabPresetId;
  onPresetChange: (id: ViewportLabPresetId) => void;
  orientation: ViewportLabOrientation;
  onOrientationChange: (o: ViewportLabOrientation) => void;
  zoom: ViewportLabZoomMode;
  onZoomChange: (z: ViewportLabZoomMode) => void;
  routeOptionId: string;
  onRouteOptionChange: (id: string) => void;
  manualPath: string;
  onManualPathChange: (path: string) => void;
  useManualPath: boolean;
  onUseManualPathChange: (v: boolean) => void;
  showSafeArea: boolean;
  onShowSafeAreaChange: (v: boolean) => void;
  compareMode: boolean;
  onCompareModeChange: (v: boolean) => void;
  comparePresetId: ViewportLabPresetId;
  onComparePresetChange: (id: ViewportLabPresetId) => void;
  onRefresh: () => void;
  previewSrc: string | null;
  preset: ViewportLabPreset;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
};

const ZOOM_OPTIONS: { value: ViewportLabZoomMode; label: string }[] = [
  { value: 'fit', label: 'FIT' },
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1, label: '100%' },
  { value: 1.25, label: '125%' },
];

export function ViewportLabToolbar(props: ViewportLabToolbarProps) {
  const { width, height } = effectiveViewportSize(props.preset, props.orientation);
  const projects = viewportLabRegisteredProjectSlugs();

  return (
    <header className="vl-toolbar" data-testid="viewport-lab-toolbar">
      <div className="vl-toolbar__row">
        <span className="vl-toolbar__brand">VIEWPORT LAB</span>
        {props.onToggleCollapsed ?
          <button type="button" className="vl-toolbar__ghost" onClick={props.onToggleCollapsed}>
            {props.collapsed ? 'SHOW CONTROLS' : 'HIDE CONTROLS'}
          </button>
        : null}
      </div>
      {!props.collapsed ?
        <>
          <div className="vl-toolbar__row vl-toolbar__grid">
            <label className="vl-field">
              <span>PROJECT</span>
              <select
                value={props.projectSlug}
                onChange={(e) => props.onProjectChange(e.target.value)}
                data-testid="viewport-lab-project"
              >
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="vl-field">
              <span>ROUTE</span>
              <select
                value={props.useManualPath ? '__manual__' : props.routeOptionId}
                onChange={(e) => {
                  if (e.target.value === '__manual__') {
                    props.onUseManualPathChange(true);
                  } else {
                    props.onUseManualPathChange(false);
                    props.onRouteOptionChange(e.target.value);
                  }
                }}
                disabled={props.useManualPath}
                data-testid="viewport-lab-route"
              >
                {VIEWPORT_LAB_COMMON_ROUTE_SUFFIXES.map((r: ViewportLabRouteOption) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
                <option value="__manual__">MANUAL PATH</option>
              </select>
            </label>
            <label className="vl-field vl-field--wide">
              <span>MANUAL INTERNAL PATH</span>
              <input
                type="text"
                value={props.manualPath}
                onChange={(e) => props.onManualPathChange(e.target.value)}
                placeholder="/app/preview/fixture-app-ndxbook"
                disabled={!props.useManualPath}
                data-testid="viewport-lab-manual-path"
              />
            </label>
            <label className="vl-field">
              <span>VIEWPORT</span>
              <select
                value={props.presetId}
                onChange={(e) => props.onPresetChange(e.target.value as ViewportLabPresetId)}
                data-testid="viewport-lab-preset"
              >
                {VIEWPORT_LAB_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="vl-field">
              <span>ORIENTATION</span>
              <select
                value={props.orientation}
                onChange={(e) => props.onOrientationChange(e.target.value as ViewportLabOrientation)}
                data-testid="viewport-lab-orientation"
              >
                <option value="portrait">PORTRAIT</option>
                <option value="landscape">LANDSCAPE</option>
              </select>
            </label>
            <label className="vl-field">
              <span>ZOOM</span>
              <select
                value={String(props.zoom)}
                onChange={(e) => {
                  const v = e.target.value;
                  props.onZoomChange(v === 'fit' ? 'fit' : (Number(v) as ViewportLabZoomMode));
                }}
                data-testid="viewport-lab-zoom"
              >
                {ZOOM_OPTIONS.map((z) => (
                  <option key={String(z.value)} value={String(z.value)}>
                    {z.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="vl-field vl-field--readonly">
              <span>SIZE</span>
              <output data-testid="viewport-lab-dimensions">
                {width} × {height}
              </output>
            </div>
            <label className="vl-field vl-field--check">
              <input
                type="checkbox"
                checked={props.showSafeArea}
                onChange={(e) => props.onShowSafeAreaChange(e.target.checked)}
                data-testid="viewport-lab-safe-area"
              />
              <span>SAFE AREA</span>
            </label>
            <label className="vl-field vl-field--check">
              <input
                type="checkbox"
                checked={props.compareMode}
                onChange={(e) => props.onCompareModeChange(e.target.checked)}
                data-testid="viewport-lab-compare"
              />
              <span>COMPARE</span>
            </label>
            {props.compareMode ?
              <label className="vl-field">
                <span>COMPARE VIEWPORT</span>
                <select
                  value={props.comparePresetId}
                  onChange={(e) => props.onComparePresetChange(e.target.value as ViewportLabPresetId)}
                  data-testid="viewport-lab-compare-preset"
                >
                  {VIEWPORT_LAB_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            : null}
          </div>
          <div className="vl-toolbar__row vl-toolbar__actions">
            <button type="button" className="vl-toolbar__btn" onClick={props.onRefresh} data-testid="viewport-lab-refresh">
              REFRESH FRAME
            </button>
            {props.previewSrc ?
              <a
                href={props.previewSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="vl-toolbar__btn vl-toolbar__link"
                data-testid="viewport-lab-open-tab"
              >
                OPEN IN NEW TAB
              </a>
            : null}
          </div>
        </>
      : null}
    </header>
  );
}
