import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ASSTS_LIBRARY_HOME_REFERENCE_CANVAS } from './library-home-composition-map';

type LibraryHomeCompositionContextValue = {
  scale: number;
  compositionWidth: number;
  refMapMode: boolean;
  setRefMapMode: (on: boolean) => void;
  registerRegion: (id: string, el: HTMLElement | null) => void;
  regionElements: Map<string, HTMLElement>;
};

const LibraryHomeCompositionContext = createContext<LibraryHomeCompositionContextValue | null>(null);

export function useLibraryHomeComposition() {
  const ctx = useContext(LibraryHomeCompositionContext);
  if (!ctx) {
    throw new Error('useLibraryHomeComposition must be used within LibraryHomeCompositionProvider');
  }
  return ctx;
}

export function useLibraryHomeCompositionOptional() {
  return useContext(LibraryHomeCompositionContext);
}

type ProviderProps = {
  children: ReactNode;
};

export function LibraryHomeCompositionProvider({ children }: ProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [scale, setScale] = useState(1);
  const [compositionWidth, setCompositionWidth] = useState<number>(ASSTS_LIBRARY_HOME_REFERENCE_CANVAS.width);
  const [refMapMode, setRefMapModeState] = useState(searchParams.get('refMap') === '1');
  const rootRef = useRef<HTMLDivElement>(null);
  const regionElementsRef = useRef(new Map<string, HTMLElement>());
  const [, bump] = useState(0);

  const setRefMapMode = (on: boolean) => {
    setRefMapModeState(on);
    const next = new URLSearchParams(searchParams);
    if (on) next.set('refMap', '1');
    else next.delete('refMap');
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    setRefMapModeState(searchParams.get('refMap') === '1');
  }, [searchParams]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      const nextScale = w / ASSTS_LIBRARY_HOME_REFERENCE_CANVAS.width;
      setCompositionWidth(w);
      setScale(nextScale);
      el.style.setProperty('--ref-scale', String(nextScale));
      const shell = el.closest('.assts-library-shell');
      if (shell instanceof HTMLElement) {
        shell.style.setProperty('--ref-scale', String(nextScale));
      }
    });
    ro.observe(el);
    const w = el.clientWidth || ASSTS_LIBRARY_HOME_REFERENCE_CANVAS.width;
    const nextScale = w / ASSTS_LIBRARY_HOME_REFERENCE_CANVAS.width;
    setCompositionWidth(w);
    setScale(nextScale);
    el.style.setProperty('--ref-scale', String(nextScale));
    return () => ro.disconnect();
  }, []);

  const registerRegion = (id: string, node: HTMLElement | null) => {
    if (node) regionElementsRef.current.set(id, node);
    else regionElementsRef.current.delete(id);
    bump((n) => n + 1);
  };

  return (
    <LibraryHomeCompositionContext.Provider
      value={{
        scale,
        compositionWidth,
        refMapMode,
        setRefMapMode,
        registerRegion,
        regionElements: regionElementsRef.current,
      }}
    >
      <div
        ref={rootRef}
        className="assts-library-composition"
        data-composition-id="assts-library-home-mobile-v1"
        style={{
          ['--ref-scale' as string]: String(scale),
          ['--ref-w' as string]: String(ASSTS_LIBRARY_HOME_REFERENCE_CANVAS.width),
          ['--ref-h' as string]: String(ASSTS_LIBRARY_HOME_REFERENCE_CANVAS.height),
        }}
      >
        {children}
      </div>
    </LibraryHomeCompositionContext.Provider>
  );
}
