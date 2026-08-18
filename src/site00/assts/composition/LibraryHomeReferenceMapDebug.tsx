import { useEffect, useState } from 'react';
import {
  ASSTS_LIBRARY_HOME_GUTTERS,
  ASSTS_LIBRARY_HOME_REGIONS,
  ASSTS_LIBRARY_HOME_Y_LANDMARKS,
  type LibraryHomeRegionId,
  scaleLibraryHomeRect,
} from './library-home-composition-map';
import { useLibraryHomeComposition } from './LibraryHomeCompositionContext';

type RegionMeasurement = {
  id: LibraryHomeRegionId;
  expected: { x: number; y: number; w: number; h: number };
  actual: { x: number; y: number; w: number; h: number };
  delta: { x: number; y: number; w: number; h: number };
};

const PRIMARY_REGIONS: LibraryHomeRegionId[] = [
  'header.title',
  'stats.assets',
  'needsReview.card',
  'recentBatches.card01',
  'browseLibrary.environments',
  'navigation',
];

export function LibraryHomeReferenceMapDebug() {
  const { refMapMode, setRefMapMode, scale, regionElements } = useLibraryHomeComposition();
  const [measurements, setMeasurements] = useState<RegionMeasurement[]>([]);

  useEffect(() => {
    if (!refMapMode) return;
    const canvas = document.querySelector('.assts-library-composition');
    if (!canvas) return;

    const measure = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const next: RegionMeasurement[] = [];

      for (const id of Object.keys(ASSTS_LIBRARY_HOME_REGIONS) as LibraryHomeRegionId[]) {
        const el = regionElements.get(id);
        if (!el) continue;
        const ref = ASSTS_LIBRARY_HOME_REGIONS[id];
        const expected = scaleLibraryHomeRect(ref, scale);
        const r = el.getBoundingClientRect();
        const actual = {
          x: r.left - canvasRect.left,
          y: r.top - canvasRect.top,
          w: r.width,
          h: r.height,
        };
        next.push({
          id,
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
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [refMapMode, scale, regionElements]);

  if (!refMapMode) {
    return (
      <button
        type="button"
        className="assts-ref-map-toggle"
        onClick={() => setRefMapMode(true)}
        aria-label="Enable reference map debug mode"
      >
        REF MAP
      </button>
    );
  }

  return (
    <div className="assts-ref-map-debug" aria-hidden="true">
      <div className="assts-ref-map-debug__toolbar">
        <span>REFERENCE MAP MODE</span>
        <button type="button" onClick={() => setRefMapMode(false)}>
          Close
        </button>
      </div>

      <div
        className="assts-ref-map-debug__gutter assts-ref-map-debug__gutter--left"
        style={{ left: `calc(${ASSTS_LIBRARY_HOME_GUTTERS.left}px * var(--ref-scale))` }}
      />
      <div
        className="assts-ref-map-debug__gutter assts-ref-map-debug__gutter--right"
        style={{ left: `calc(${(711 - ASSTS_LIBRARY_HOME_GUTTERS.right)}px * var(--ref-scale))` }}
      />

      {ASSTS_LIBRARY_HOME_Y_LANDMARKS.map((lm) => (
        <div
          key={lm.label}
          className="assts-ref-map-debug__hline"
          style={{ top: `calc(${lm.y}px * var(--ref-scale))` }}
        >
          <span>{lm.label}</span>
        </div>
      ))}

      {(Object.keys(ASSTS_LIBRARY_HOME_REGIONS) as LibraryHomeRegionId[]).map((id) => {
        const r = ASSTS_LIBRARY_HOME_REGIONS[id];
        return (
          <div
            key={id}
            className="assts-ref-map-debug__box"
            style={{
              left: `calc(${r.x}px * var(--ref-scale))`,
              top: `calc(${r.y}px * var(--ref-scale))`,
              width: `calc(${r.w}px * var(--ref-scale))`,
              height: `calc(${r.h}px * var(--ref-scale))`,
            }}
          >
            <span className="assts-ref-map-debug__box-label">{id}</span>
          </div>
        );
      })}

      <div className="assts-ref-map-debug__report">
        <strong>Primary region deltas (px)</strong>
        {measurements
          .filter((m) => PRIMARY_REGIONS.includes(m.id))
          .map((m) => (
            <div key={m.id} className="assts-ref-map-debug__report-row">
              <div>{m.id}</div>
              <div>
                EXP {Math.round(m.expected.x)},{Math.round(m.expected.y)} · ACT {Math.round(m.actual.x)},
                {Math.round(m.actual.y)} · Δ {m.delta.x >= 0 ? '+' : ''}
                {m.delta.x},{m.delta.y >= 0 ? '+' : ''}
                {m.delta.y}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
