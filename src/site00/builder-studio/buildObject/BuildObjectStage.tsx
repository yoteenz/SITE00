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
  scheduleBuildThumbnail,
  webglAvailable,
  type BuildObjectEngine,
} from './engine';

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
  className?: string;
  children?: ReactNode;
};

export function BuildObjectStage({ composition, description, interactive = false, resetToken = 0, className, children }: StageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BuildObjectEngine | null>(null);
  const compositionRef = useRef(composition);
  compositionRef.current = composition;
  const reducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [engineGeneration, setEngineGeneration] = useState(0);

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
        onContextLost: () => setEngineGeneration((n) => n + 1),
      });
      engine.setComposition(compositionRef.current);
      engineRef.current = engine;
    } catch {
      setFailed(true);
    }
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [reducedMotion, engineGeneration]);

  useEffect(() => {
    engineRef.current?.setComposition(composition);
  }, [composition.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    engineRef.current?.setInteractive(interactive);
  }, [interactive]);

  useEffect(() => {
    if (resetToken) engineRef.current?.resetView();
  }, [resetToken]);

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

  useEffect(() => {
    const cached = getCachedBuildThumbnail(composition, width, height);
    if (cached) {
      setSrc(cached);
      return;
    }
    if (!webglAvailable()) return;
    let cancelled = false;
    void scheduleBuildThumbnail(composition, width, height).then((url) => {
      if (!cancelled && url) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className="bs-thumb" style={{ aspectRatio: `${width} / ${height}` }}>
      {src ? <img src={src} alt={alt} width={width} height={height} draggable={false} /> : <span className="bs-thumb__pending" aria-hidden="true" />}
    </span>
  );
}
