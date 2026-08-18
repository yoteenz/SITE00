import { useEffect, useState } from 'react';
import {
  ASSTS_LOADER_CENTER_X,
  ASSTS_LOADER_PRIMARY_REGIONS,
  ASSTS_LOADER_REFERENCE_CANVAS,
  ASSTS_LOADER_REGIONS,
  ASSTS_LOADER_Y_LANDMARKS,
  loaderRegionAnchorPercent,
  scaleLoaderRect,
  type LoaderRegionId,
} from './loader-composition-map';
import { useLoaderComposition } from './LoaderCompositionContext';
import { isLoaderDebugEnabled, isLoaderRefMapEnabled, isLoaderRefOverlayEnabled } from './site00LoaderHeroStage';

type RegionMeasurement = {
  id: LoaderRegionId;
  anchorPct: { x: number; y: number };
  expected: { x: number; y: number; w: number; h: number };
  actual: { x: number; y: number; w: number; h: number };
  delta: { x: number; y: number; w: number; h: number };
};

const GRID_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const REGION_DEBUG_LABELS: Partial<Record<LoaderRegionId, string>> = {
  'copy.eyebrow': 'SITE_00',
  'copy.title': 'HEADLINE',
  'copy.subtitle': 'SUBTITLE',
  'copy.status': 'STATUS',
  'copy.progressTrack': 'PROGRESS_TRACK',
  'copy.progressPct': 'PROGRESS_PCT',
  'copy.tagline': 'BRAND_STATEMENT',
  'copy.signature': 'SITE_MARK',
  geometry: 'WIREFRAME',
  pedestal: 'PLATFORM',
  background: 'BACKGROUND',
};

/** Composition debug — only when ?loaderDebug=1 or ?loaderRefMap=1. Never visible in production. */
export function LoaderReferenceMapDebug() {
  const debugEnabled = isLoaderDebugEnabled() || isLoaderRefMapEnabled();
  const { refMapMode, setRefMapMode, scale, regionElements, artboardRef, composition } = useLoaderComposition();
  const [measurements, setMeasurements] = useState<RegionMeasurement[]>([]);
  const refOverlayOn = isLoaderRefOverlayEnabled();

  useEffect(() => {
    if (!refMapMode) return;
    const stage = artboardRef.current ?? document.querySelector('.site00-loader-stage');
    if (!stage) return;

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const next: RegionMeasurement[] = [];

      for (const id of ASSTS_LOADER_PRIMARY_REGIONS) {
        const el = regionElements.get(id);
        if (!el) continue;
        const ref = composition.regions[id];
        const expected = scaleLoaderRect(ref, scale);
        const r = el.getBoundingClientRect();
        const actual = {
          x: r.left - stageRect.left,
          y: r.top - stageRect.top,
          w: r.width,
          h: r.height,
        };
        next.push({
          id,
          anchorPct: loaderRegionAnchorPercent(id),
          expected,
          actual,
          delta: {
            x: Math.round(actual.x - expected.x),
            y: Math.round(actual.y - expected.y),
            w: Math.round(actual.w - expected.w),
            h: Math.round(actual.h - expected.h),
          },
        });
      }
      setMeasurements(next);
    };

    measure();
    const t = window.setInterval(measure, 500);
    window.addEventListener('resize', measure);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('resize', measure);
    };
  }, [refMapMode, scale, regionElements, artboardRef]);

  if (!debugEnabled) return null;

  if (!refMapMode) {
    return (
      <button
        type="button"
        className="site00-loader-refmap-toggle"
        onClick={() => setRefMapMode(true)}
        aria-label="Show loader coordinate debug"
      >
        LOADER COORDS
      </button>
    );
  }

  const centerXPct = (ASSTS_LOADER_CENTER_X / ASSTS_LOADER_REFERENCE_CANVAS.width) * 100;

  return (
    <>
      <button
        type="button"
        className="site00-loader-refmap-toggle site00-loader-refmap-toggle--on"
        onClick={() => setRefMapMode(false)}
      >
        HIDE COORDS
      </button>

      <div className="site00-loader-refmap" aria-hidden="true">
        <div className="site00-loader-refmap__artboard-edge" />

        {GRID_STEPS.map((pct) => (
          <div key={`v-${pct}`} className="site00-loader-refmap__grid-v" style={{ left: `${pct}%` }}>
            {pct % 20 === 0 ? <span className="site00-loader-refmap__grid-label">{pct}</span> : null}
          </div>
        ))}
        {GRID_STEPS.map((pct) => (
          <div key={`h-${pct}`} className="site00-loader-refmap__grid-h" style={{ top: `${pct}%` }}>
            {pct % 20 === 0 ? <span className="site00-loader-refmap__grid-label">{pct}</span> : null}
          </div>
        ))}

        <div className="site00-loader-refmap__axis-v site00-loader-refmap__axis-v--center" style={{ left: `${centerXPct}%` }}>
          <span className="site00-loader-refmap__axis-label">CENTER X · {ASSTS_LOADER_CENTER_X}</span>
        </div>

        {ASSTS_LOADER_Y_LANDMARKS.map(({ label, y }) => (
          <div key={label} className="site00-loader-refmap__guide-h" style={{ top: `${(y / ASSTS_LOADER_REFERENCE_CANVAS.height) * 100}%` }}>
            <span>{label}</span>
          </div>
        ))}

        {ASSTS_LOADER_PRIMARY_REGIONS.map((id) => {
          const r = ASSTS_LOADER_REGIONS[id];
          const anchor = loaderRegionAnchorPercent(id);
          const debugLabel = REGION_DEBUG_LABELS[id] ?? id.toUpperCase();
          return (
            <div key={id}>
              <div
                className="site00-loader-refmap__box"
                style={{
                  left: `${r.nx * 100}%`,
                  top: `${r.ny * 100}%`,
                  width: `${r.nw * 100}%`,
                  height: `${r.nh * 100}%`,
                }}
              >
                <span className="site00-loader-refmap__box-label">
                  {debugLabel}
                  <br />
                  X:{r.x} Y:{r.y}
                  <br />
                  W:{r.w} H:{r.h}
                </span>
              </div>
              <div
                className="site00-loader-refmap__anchor"
                style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
                title={`${debugLabel} anchor`}
              >
                <span className="site00-loader-refmap__anchor-label">
                  {debugLabel}
                  <br />
                  cx:{anchor.x.toFixed(1)} cy:{anchor.y.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}

        <div className="site00-loader-refmap__report">
          <div className="site00-loader-refmap__report-head">
            STAGE {ASSTS_LOADER_REFERENCE_CANVAS.width}×{ASSTS_LOADER_REFERENCE_CANVAS.height} ref · scale {scale.toFixed(4)}
            {refOverlayOn ? ' · REF OVERLAY ON' : ''}
          </div>
          <div className="site00-loader-refmap__report-note">
            Coordinates resolve against <strong>.site00-loader-stage</strong> (0–100% normalized).
          </div>
          {measurements.map((m) => {
            const label = REGION_DEBUG_LABELS[m.id] ?? m.id;
            return (
              <div key={m.id} className="site00-loader-refmap__report-row">
                <strong>{label}</strong>
                <div>
                  ANCHOR: X {m.anchorPct.x.toFixed(1)} · Y {m.anchorPct.y.toFixed(1)}
                </div>
                <div>
                  MAP: X {Math.round(m.expected.x / scale)} Y {Math.round(m.expected.y / scale)} W{' '}
                  {Math.round(m.expected.w / scale)} H {Math.round(m.expected.h / scale)}
                </div>
                <div>
                  ACTUAL: x {Math.round(m.actual.x)} y {Math.round(m.actual.y)}
                </div>
                <div className={Math.abs(m.delta.x) > 5 || Math.abs(m.delta.y) > 5 ? 'site00-loader-refmap__warn' : ''}>
                  DELTA: {m.delta.x >= 0 ? '+' : ''}
                  {m.delta.x} x · {m.delta.y >= 0 ? '+' : ''}
                  {m.delta.y} y
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
