/**
 * The architectural stage. One instance lives for the whole studio so the Build Object carries across rooms:
 * changing room or choice re-composes the same scene instead of loading a new picture.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { BuildComposition } from './composition';
import {
  buildThumbnailCacheKey,
  createBuildObjectEngine,
  getCachedBuildThumbnail,
  renderRealismThumbnail,
  scheduleBuildThumbnail,
  webglAvailable,
  type AnchorListener,
  type BuildObjectEngine,
  type StageAnchor,
} from './engine';
import { isRealismBenchmark, plateUrlOf, plateYOf, realismRequested } from './realism';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

type StageProps = {
  composition: BuildComposition;
  /** Text alternative describing what the object currently shows. */
  description: string;
  interactive?: boolean;
  resetToken?: number;
  /** Points on the model the page annotates, and who hears where they are on the stage. */
  anchors?: readonly StageAnchor[];
  onAnchors?: AnchorListener;
  className?: string;
  children?: ReactNode;
};

const NO_ANCHORS: readonly StageAnchor[] = [];

export function BuildObjectStage({
  composition,
  description,
  interactive = false,
  resetToken = 0,
  anchors = NO_ANCHORS,
  onAnchors,
  className,
  children,
}: StageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BuildObjectEngine | null>(null);
  const compositionRef = useRef(composition);
  compositionRef.current = composition;
  const reducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [engineGeneration, setEngineGeneration] = useState(0);
  const losses = useRef<number[]>([]);
  // Realism benchmark (review only): `?realism=v2` on PLACE · ADVANCED. Crossing in or out rebuilds the engine.
  const realism = isRealismBenchmark(composition) ? realismRequested() : null;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!webglAvailable()) {
      setFailed(true);
      return;
    }
    setFailed(false);
    try {
      const engine = createBuildObjectEngine(host, {
        reducedMotion,
        realism,
        onContextLost: () => {
          const now = Date.now();
          losses.current = [...losses.current.filter((t) => now - t < 20000), now];
          if (losses.current.length > 3) setFailed(true);
          else setEngineGeneration((n) => n + 1);
        },
      });
      engine.setComposition(compositionRef.current);
      engineRef.current = engine;
    } catch {
      setFailed(true);
    }
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
      delete host.dataset.realism;
      delete host.dataset.quality;
    };
  }, [reducedMotion, engineGeneration, realism]);

  useEffect(() => {
    engineRef.current?.setComposition(composition);
  }, [composition.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    engineRef.current?.setInteractive(interactive);
  }, [interactive, realism]);

  useEffect(() => {
    if (resetToken) engineRef.current?.resetView();
  }, [resetToken]);

  useEffect(() => {
    engineRef.current?.setAnchors(anchors, onAnchors ?? null);
  }, [anchors, onAnchors, reducedMotion, realism]);

  return (
    <div className={['bs-object', className].filter(Boolean).join(' ')} data-object-key={composition.key}>
      <div className="bs-object__host" ref={hostRef} role="img" aria-label={description} />
      {failed ? (
        <p className="bs-object__fallback">
          <span>3D VIEW UNAVAILABLE ON THIS DEVICE</span>
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/** A still of a composition for option cards. Rendered once per composition key and cached. */
export function BuildThumbnail({ composition, width, height, alt }: { composition: BuildComposition; width: number; height: number; alt: string }) {
  const cacheKey = buildThumbnailCacheKey(composition, width, height);
  const [src, setSrc] = useState<string | null>(() => getCachedBuildThumbnail(composition, width, height));
  const frameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cached = getCachedBuildThumbnail(composition, width, height);
    if (cached) {
      setSrc(cached);
      return;
    }
    if (!webglAvailable()) return;
    let cancelled = false;
    const frame = frameRef.current;
    const plate = frame && isRealismBenchmark(composition) && realismRequested() ? plateUrlOf(frame) : null;
    const id = window.setTimeout(() => {
      if (plate && frame) {
        void renderRealismThumbnail(composition, width, height, plate, plateYOf(frame, 0.7)).then((url) => {
          if (cancelled) return;
          if (url) setSrc(url);
          else void scheduleBuildThumbnail(composition, width, height).then((fallback) => fallback && setSrc(fallback));
        });
        return;
      }
      void scheduleBuildThumbnail(composition, width, height).then((url) => {
        if (!cancelled && url) setSrc(url);
      });
    }, 30);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [cacheKey, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className="bs-thumb" ref={frameRef} style={{ aspectRatio: `${width} / ${height}` }}>
      {src ? <img src={src} alt={alt} width={width} height={height} draggable={false} /> : <span className="bs-thumb__pending" aria-hidden="true" />}
    </span>
  );
}
