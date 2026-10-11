/**
 * The architectural stage. One instance lives for the whole studio so the Build Object carries across rooms:
 * changing room or choice re-composes the same scene instead of loading a new picture.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { BuildComposition } from './composition';
import { createBuildObjectEngine, renderBuildThumbnail, renderRealismThumbnail, webglAvailable, type AnchorListener, type BuildObjectEngine, type StageAnchor } from './engine';
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

export function BuildObjectStage({ composition, description, interactive = false, resetToken = 0, anchors = NO_ANCHORS, onAnchors, className, children }: StageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BuildObjectEngine | null>(null);
  const compositionRef = useRef(composition);
  compositionRef.current = composition;
  const reducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  // Bumped when the GPU drops the context: the engine is rebuilt (and the current composition drawn again).
  const [generation, setGeneration] = useState(0);
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
    try {
      const engine = createBuildObjectEngine(host, {
        reducedMotion,
        realism,
        onContextLost: () => {
          // Rebuild, unless the device keeps losing it (then show the honest fallback rather than flicker forever).
          const now = Date.now();
          losses.current = [...losses.current.filter((t) => now - t < 20000), now];
          if (losses.current.length > 3) setFailed(true);
          else setGeneration((n) => n + 1);
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
  }, [reducedMotion, generation, realism]);

  useEffect(() => {
    engineRef.current?.setComposition(composition);
  }, [composition]);

  useEffect(() => {
    engineRef.current?.setInteractive(interactive);
  }, [interactive]);

  useEffect(() => {
    if (resetToken) engineRef.current?.resetView();
  }, [resetToken]);

  // Re-subscribe when the engine is rebuilt (reduced-motion change) as well as when the anchors change.
  useEffect(() => {
    engineRef.current?.setAnchors(anchors, onAnchors ?? null);
  }, [anchors, onAnchors, reducedMotion, realism]);

  useEffect(() => {
    engineRef.current?.setInteractive(interactive);
  }, [realism]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const [src, setSrc] = useState<string | null>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!webglAvailable()) return;
    let cancelled = false;
    const frame = frameRef.current;
    const plate = frame && isRealismBenchmark(composition) && realismRequested() ? plateUrlOf(frame) : null;
    // Defer so the stage paints first; thumbnails share one offscreen context.
    const id = window.setTimeout(() => {
      if (plate && frame) {
        // Realism benchmark: the card still matches the benchmark stage (same bodies, plate in the image).
        void renderRealismThumbnail(composition, width, height, plate, plateYOf(frame, 0.7)).then((url) => {
          if (!cancelled) setSrc(url ?? renderBuildThumbnail(composition, width, height));
        });
        return;
      }
      const url = renderBuildThumbnail(composition, width, height);
      if (!cancelled) setSrc(url);
    }, 30);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [composition.key, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className="bs-thumb" ref={frameRef} style={{ aspectRatio: `${width} / ${height}` }}>
      {src ? <img src={src} alt={alt} width={width} height={height} draggable={false} /> : <span className="bs-thumb__pending" aria-hidden="true" />}
    </span>
  );
}
