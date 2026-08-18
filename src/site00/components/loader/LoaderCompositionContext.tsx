import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { ASSTS_LOADER_COMPOSITION_ID, ASSTS_LOADER_REFERENCE_CANVAS, ASSTS_LOADER_TYPOGRAPHY } from './loader-composition-map';
import {
  resolveLoaderComposition,
  type LoaderCompositionBundle,
  type LoaderPresentation,
} from './loader-composition-resolver';
import { isLoaderDebugEnabled, isLoaderRefMapEnabled } from './site00LoaderHeroStage';

type LoaderCompositionContextValue = {
  scale: number;
  stageWidth: number;
  stageHeight: number;
  refMapMode: boolean;
  setRefMapMode: (on: boolean) => void;
  registerRegion: (id: string, el: HTMLElement | null) => void;
  regionElements: Map<string, HTMLElement>;
  artboardRef: RefObject<HTMLDivElement | null>;
  presentation: LoaderPresentation;
  composition: LoaderCompositionBundle;
};

const LoaderCompositionContext = createContext<LoaderCompositionContextValue | null>(null);

export function useLoaderComposition() {
  const ctx = useContext(LoaderCompositionContext);
  if (!ctx) {
    throw new Error('useLoaderComposition must be used within LoaderCompositionProvider');
  }
  return ctx;
}

export function useLoaderCompositionOptional() {
  return useContext(LoaderCompositionContext);
}

type ProviderProps = {
  children: ReactNode;
  /** Mobile (711×1536) or desktop (1672×941) artboard — Asset Vault only. */
  presentation?: LoaderPresentation;
};

function readRefMapFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('loaderRefMap') === '1' || params.get('loaderDebug') === '1';
}

/**
 * Hybrid composition plane — aspect-preserving artboard for overlays only.
 * Mobile: 711×1536. Desktop Asset Vault: 1672×941 landscape master.
 * Background renders full-bleed outside this provider (see Site00ImmersiveLoader).
 */
export function LoaderCompositionProvider({ children, presentation = 'mobile' }: ProviderProps) {
  const composition = useMemo(() => resolveLoaderComposition(presentation), [presentation]);
  const canvas = composition.canvas;

  const viewportRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [stageWidth, setStageWidth] = useState<number>(canvas.width);
  const [stageHeight, setStageHeight] = useState<number>(canvas.height);
  const [refMapMode, setRefMapModeState] = useState(readRefMapFromUrl);
  const regionElementsRef = useRef(new Map<string, HTMLElement>());
  const [, bump] = useState(0);

  const setRefMapMode = useCallback((on: boolean) => {
    setRefMapModeState(on);
    if (typeof window === 'undefined') return;
    const next = new URLSearchParams(window.location.search);
    if (on) next.set('loaderRefMap', '1');
    else {
      next.delete('loaderRefMap');
      if (!isLoaderDebugEnabled()) next.delete('loaderDebug');
    }
    const qs = next.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, []);

  useEffect(() => {
    setRefMapModeState(isLoaderRefMapEnabled() || isLoaderDebugEnabled());
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      const safeTop = parseFloat(styles.paddingTop) || 0;
      const safeBottom = parseFloat(styles.paddingBottom) || 0;
      const safeLeft = parseFloat(styles.paddingLeft) || 0;
      const safeRight = parseFloat(styles.paddingRight) || 0;
      const availW = Math.max(1, rect.width - safeLeft - safeRight);
      const availH = Math.max(1, rect.height - safeTop - safeBottom);
      const scaleW = availW / canvas.width;
      const scaleH = availH / canvas.height;
      const nextScale = Math.min(scaleW, scaleH);
      setScale(nextScale);
      setStageWidth(canvas.width * nextScale);
      setStageHeight(canvas.height * nextScale);
      el.style.setProperty('--loader-scale', String(nextScale));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [canvas.width, canvas.height]);

  const registerRegion = useCallback((id: string, node: HTMLElement | null) => {
    if (node) {
      if (regionElementsRef.current.get(id) === node) return;
      regionElementsRef.current.set(id, node);
    } else {
      if (!regionElementsRef.current.has(id)) return;
      regionElementsRef.current.delete(id);
    }
    bump((n) => n + 1);
  }, []);

  const contextValue = useMemo(
    () => ({
      scale,
      stageWidth,
      stageHeight,
      refMapMode,
      setRefMapMode,
      registerRegion,
      regionElements: regionElementsRef.current,
      artboardRef,
      presentation,
      composition,
    }),
    [scale, stageWidth, stageHeight, refMapMode, setRefMapMode, registerRegion, presentation, composition],
  );

  const t = composition.typography;

  const viewportClass =
    presentation === 'desktop'
      ? 'site00-loader-viewport site00-loader-stage-viewport site00-loader-stage-viewport--desktop'
      : 'site00-loader-viewport site00-loader-stage-viewport site00-loader-stage-viewport--mobile';

  const artboardClass =
    presentation === 'desktop'
      ? 'site00-loader-artboard site00-loader-stage site00-loader-stage--desktop'
      : 'site00-loader-artboard site00-loader-stage site00-loader-stage--mobile';

  return (
    <LoaderCompositionContext.Provider value={contextValue}>
      <div ref={viewportRef} className={viewportClass}>
        <div
          className="site00-loader-artboard-scaler"
          style={{
            width: stageWidth,
            height: stageHeight,
          }}
        >
          <div
            ref={artboardRef}
            className={artboardClass}
            data-composition-id={composition.compositionId}
            data-artboard-w={canvas.width}
            data-artboard-h={canvas.height}
            style={{
              width: canvas.width,
              height: canvas.height,
              transform: `scale(${scale})`,
              ['--loader-type-eyebrow-size' as string]: `${t.eyebrow.size}px`,
              ['--loader-type-title-size' as string]: `${t.title.size}px`,
              ['--loader-type-subtitle-size' as string]: `${t.subtitle.size}px`,
              ['--loader-type-status-size' as string]: `${t.status.size}px`,
              ['--loader-type-pct-size' as string]: `${t.progressPct.size}px`,
              ['--loader-type-tagline-size' as string]: `${t.tagline.size}px`,
              ['--loader-type-tagline-plus-size' as string]: `${t.taglinePlus.size}px`,
              ['--loader-type-mark-size' as string]: `${t.mark.size}px`,
              ['--loader-type-signature-size' as string]: `${t.signatureLabel.size}px`,
              ['--loader-progress-track-h' as string]: `${8}px`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </LoaderCompositionContext.Provider>
  );
}

/** @deprecated Use LoaderCompositionProvider with presentation="mobile" */
export { ASSTS_LOADER_REFERENCE_CANVAS, ASSTS_LOADER_COMPOSITION_ID, ASSTS_LOADER_TYPOGRAPHY };
