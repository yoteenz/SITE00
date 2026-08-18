import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { EnvironmentCompositionMap, RegisteredOverlay, ViewportRect } from './types';
import {
  buildCompositionLayout,
  compositionCssVars,
  computeDisplayedImageBounds,
} from './engine';
import { detectProtectedCollisions, formatCompositionWarnings } from './collision';

export type CompositionStageContextValue = {
  map: EnvironmentCompositionMap;
  containerWidth: number;
  containerHeight: number;
  zoneRects: Map<string, ViewportRect>;
  registerOverlay: (overlay: RegisteredOverlay) => () => void;
};

const CompositionStageContext = createContext<CompositionStageContextValue | null>(null);

export function useCompositionStage(): CompositionStageContextValue {
  const ctx = useContext(CompositionStageContext);
  if (!ctx) throw new Error('useCompositionStage must be used within EnvironmentalStage');
  return ctx;
}

export function useCompositionZone(zoneId: string): ViewportRect | null {
  const { zoneRects } = useCompositionStage();
  return zoneRects.get(zoneId) ?? null;
}

type EnvironmentalStageProps = {
  composition: EnvironmentCompositionMap;
  backgroundUrl?: string | null;
  fallbackClass?: string;
  source?: 'locked' | 'fallback';
  showCompositionDebug?: boolean;
  className?: string;
  children: ReactNode;
};

export function EnvironmentalStage({
  composition,
  backgroundUrl,
  fallbackClass = '',
  source = 'fallback',
  showCompositionDebug = false,
  className = '',
  children,
}: EnvironmentalStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [overlays, setOverlays] = useState<RegisteredOverlay[]>([]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const zoneRects = useMemo(
    () => buildCompositionLayout(composition, size.w, size.h),
    [composition, size.w, size.h],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el || size.w <= 0) return;
    const vars = compositionCssVars(composition, size.w, size.h);
    for (const [key, value] of Object.entries(vars)) {
      el.style.setProperty(key, value);
    }
  }, [composition, size.w, size.h]);

  const registerOverlay = useCallback((overlay: RegisteredOverlay) => {
    setOverlays((prev) => [...prev.filter((o) => o.id !== overlay.id), overlay]);
    return () => setOverlays((prev) => prev.filter((o) => o.id !== overlay.id));
  }, []);

  useEffect(() => {
    if (import.meta.env.PROD) return;
    const collisions = detectProtectedCollisions(overlays, composition.protectedZones, zoneRects);
    for (const msg of formatCompositionWarnings(collisions)) {
      console.warn(msg);
    }
  }, [overlays, composition.protectedZones, zoneRects]);

  const ctx = useMemo<CompositionStageContextValue>(
    () => ({
      map: composition,
      containerWidth: size.w,
      containerHeight: size.h,
      zoneRects,
      registerOverlay,
    }),
    [composition, size.w, size.h, zoneRects, registerOverlay],
  );

  const debugEnabled =
    showCompositionDebug ||
    (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('composition') === '1');

  return (
    <CompositionStageContext.Provider value={ctx}>
      <div
        ref={rootRef}
        className={`environmental-stage ${className}`.trim()}
        data-env-source={source}
        data-composition-id={composition.environmentId}
        data-composition-version={composition.version}
      >
        <div
          className={`environmental-stage__env ${backgroundUrl ? '' : fallbackClass}`.trim()}
          aria-hidden="true"
          style={
            backgroundUrl
              ? {
                  backgroundImage: `url("${backgroundUrl.replace(/"/g, '\\"')}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: composition.objectPosition,
                }
              : undefined
          }
        />
        <div className="environmental-stage__veil" aria-hidden="true" />
        <div className="environmental-stage__ui">{children}</div>
        {debugEnabled ? (
          <CompositionDebugOverlay
            composition={composition}
            zoneRects={zoneRects}
            containerWidth={size.w}
            containerHeight={size.h}
          />
        ) : null}
      </div>
    </CompositionStageContext.Provider>
  );
}

type CompositionDebugOverlayProps = {
  composition: EnvironmentCompositionMap;
  zoneRects: Map<string, ViewportRect>;
  containerWidth: number;
  containerHeight: number;
};

function CompositionDebugOverlay({
  composition,
  zoneRects,
  containerWidth,
  containerHeight,
}: CompositionDebugOverlayProps) {
  const displayed = computeDisplayedImageBounds(
    containerWidth,
    containerHeight,
    composition.canvasWidth,
    composition.canvasHeight,
    composition.objectFit,
    composition.objectPosition,
  );

  const allZones = [
    ...composition.protectedZones,
    ...composition.preferredZones,
    ...composition.conditionalZones,
    ...composition.navigationZones,
  ];

  const zoneColor = (type: string) => {
    switch (type) {
      case 'protected':
        return 'rgba(232, 25, 44, 0.22)';
      case 'preferred':
        return 'rgba(0, 120, 255, 0.18)';
      case 'conditional':
        return 'rgba(255, 160, 0, 0.18)';
      case 'navigation':
        return 'rgba(120, 80, 255, 0.18)';
      default:
        return 'rgba(0, 0, 0, 0.12)';
    }
  };

  return (
    <div className="composition-debug" aria-hidden="true">
      {composition.focalPoints.map((fp) => {
        const left = displayed.offsetX + fp.x * displayed.width;
        const top = displayed.offsetY + fp.y * displayed.height;
        return (
          <span
            key={fp.label ?? `${fp.x}-${fp.y}`}
            className="composition-debug__focal"
            style={{ left, top }}
            title={fp.label}
          />
        );
      })}
      {allZones.map((zone) => {
        const rect = zoneRects.get(zone.id);
        if (!rect) return null;
        return (
          <div
            key={zone.id}
            className={`composition-debug__zone composition-debug__zone--${zone.type}`}
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              background: zoneColor(zone.type),
            }}
          >
            <span className="composition-debug__label">{zone.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export { CompositionStageContext };
